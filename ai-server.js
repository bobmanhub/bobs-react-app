/**
 * ai-server.js — Express AI service for the Music Catalog Editor
 *
 * Runs on process.env.AI_SERVICE_PORT || 3001
 * Proxies chat requests to OpenAI and serves curated music GIFs.
 *
 * Security:
 *  - OPENAI_API_KEY is read exclusively from process.env (Req 10.1, 10.2)
 *  - Any request body containing an `openaiApiKey` field is rejected with HTTP 400 (Req 10.5)
 *  - The key is never echoed in any response
 */

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
const PORT = process.env.AI_SERVICE_PORT || 3001;

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

app.use(
  cors({
    origin: "http://localhost:5173", // Vite dev server
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());

// ---------------------------------------------------------------------------
// Curated public music GIF list (no external API key required)
// Each entry has a url, title, and tags array for query matching.
// ---------------------------------------------------------------------------

const MUSIC_GIFS = [
  {
    url: "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif",
    title: "Guitar Solo",
    tags: ["guitar", "rock", "solo", "electric"],
  },
  {
    url: "https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif",
    title: "Piano Playing",
    tags: ["piano", "jazz", "classical", "keys"],
  },
  {
    url: "https://media.giphy.com/media/l0HlBO7eyXzSZkJri/giphy.gif",
    title: "Drum Kit",
    tags: ["drums", "percussion", "rock", "beat"],
  },
  {
    url: "https://media.giphy.com/media/26BRuo6sLetdllPAQ/giphy.gif",
    title: "Vinyl Record Spinning",
    tags: ["vinyl", "record", "dj", "spin", "music"],
  },
  {
    url: "https://media.giphy.com/media/3oEjHWpiVIOGXT5l9u/giphy.gif",
    title: "Concert Crowd",
    tags: ["concert", "crowd", "live", "festival", "energy"],
  },
  {
    url: "https://media.giphy.com/media/l0HlNQ03J5JxX6lva/giphy.gif",
    title: "Microphone Performance",
    tags: ["microphone", "vocal", "singer", "performance", "pop"],
  },
  {
    url: "https://media.giphy.com/media/3o7TKF1fSIs1R19B8k/giphy.gif",
    title: "Bass Guitar",
    tags: ["bass", "guitar", "funk", "groove", "rock"],
  },
  {
    url: "https://media.giphy.com/media/26tn33aiTi1jkl6H6/giphy.gif",
    title: "Saxophone Jazz",
    tags: ["saxophone", "jazz", "sax", "blues", "smooth"],
  },
  {
    url: "https://media.giphy.com/media/l0HlHFRbmaZtBRhXG/giphy.gif",
    title: "Turntable DJ",
    tags: ["dj", "turntable", "hip-hop", "rap", "electronic", "mix"],
  },
  {
    url: "https://media.giphy.com/media/3oEjHAUOqG3lSS0f1C/giphy.gif",
    title: "Music Notes",
    tags: ["notes", "music", "melody", "compose", "sheet"],
  },
  {
    url: "https://media.giphy.com/media/l0HlCqCqFMkQGmgFO/giphy.gif",
    title: "Headphones Listening",
    tags: ["headphones", "listening", "chill", "relax", "ambient"],
  },
  {
    url: "https://media.giphy.com/media/3o7TKMt1VVNkHV2PaE/giphy.gif",
    title: "Stage Lights",
    tags: ["stage", "lights", "concert", "show", "performance", "pop", "rock"],
  },
];

// ---------------------------------------------------------------------------
// POST /api/chat — proxy to OpenAI Chat Completions
// ---------------------------------------------------------------------------

app.post("/api/chat", async (req, res) => {
  // Req 10.5 — reject any request that tries to supply the API key
  if (req.body && Object.prototype.hasOwnProperty.call(req.body, "openaiApiKey")) {
    return res.status(400).json({
      error: "Supplying or overriding the OpenAI API key via the request body is not permitted.",
    });
  }

  const { messages, catalogContext } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "messages array is required." });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "AI service is not configured. Missing API key." });
  }

  // Build system prompt
  const systemPrompt = buildSystemPrompt(catalogContext);

  try {
    const openai = new OpenAI({ apiKey });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      temperature: 0.7,
      max_tokens: 1024,
    });

    const replyContent = completion.choices[0]?.message?.content ?? "";

    // Determine whether to trigger a GIF embed
    const { triggerGif, gifQuery } = detectGifTrigger(replyContent, messages);

    // Req 10.1 — never include the API key in the response
    return res.json({ reply: replyContent, triggerGif, gifQuery });
  } catch (err) {
    console.error("OpenAI error:", err?.message ?? err);
    return res.status(502).json({ error: "The AI service encountered an error. Please try again." });
  }
});

// ---------------------------------------------------------------------------
// GET /api/gif?q={query} — return a curated music GIF
// ---------------------------------------------------------------------------

app.get("/api/gif", (req, res) => {
  const query = (req.query.q ?? "").toLowerCase().trim();

  let candidates = [];

  if (query) {
    // Filter entries whose tags contain any word from the query
    const queryWords = query.split(/\s+/);
    candidates = MUSIC_GIFS.filter((gif) =>
      queryWords.some((word) => gif.tags.some((tag) => tag.includes(word) || word.includes(tag)))
    );
  }

  // Fall back to the full list if no matches
  if (candidates.length === 0) {
    candidates = MUSIC_GIFS;
  }

  const chosen = candidates[Math.floor(Math.random() * candidates.length)];
  return res.json({ url: chosen.url, title: chosen.title });
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build the system prompt that defines the assistant's personality and schema.
 * @param {object|null} catalogContext - current albums + tracks snapshot
 */
function buildSystemPrompt(catalogContext) {
  const contextSection = catalogContext
    ? `\n\n## Current Catalog Context\n${JSON.stringify(catalogContext, null, 2)}`
    : "";

  return `You are a friendly, encouraging, and knowledgeable music catalog assistant. \
You have deep expertise in music history, genres, production techniques, and metadata standards \
(including ISRC codes, BPM, and catalog numbering conventions). \
Your goal is to help the user fill out their music catalog accurately and completely.

## Album Fields
- AlbumTitle (string, required): The full title of the album.
- AlbumArtist (string, required): The primary artist or band name.
- ReleaseDate (string, YYYY-MM-DD): Official release date.
- RecordLabel (string): The record label that released the album.
- CatalogNumber (string, required, unique): The label's catalog identifier (e.g., DGC-24425).
- EditionType (enum): One of Standard | Deluxe | Limited | Remastered | Box Set.
- DiscCount (positive integer): Number of discs in the release.
- TrackTotal (positive integer): Total number of tracks.
- AlbumGenre (enum): Music genre from the predefined list.
- AlbumMood (enum): Mood descriptor from the predefined list.

## Track Fields
- TrackTitle (string, required): The title of the track.
- PrimaryArtist (string): The primary performing artist.
- FeaturedArtists (string): Any featured artists (comma-separated).
- AlbumName (string, required): Must match an existing AlbumTitle.
- ReleaseYear (string, YYYY): Year the track was released.
- GenreCluster (enum): Music genre from the predefined list.
- MoodSignature (enum): Mood descriptor from the predefined list.
- TempoBPM (positive number): Beats per minute.
- EnergyLevel (string): Subjective energy descriptor.
- ExplicitContentFlag (enum): Clean | Explicit.
- ProducerCredits (string): Producer name(s).
- ComposerList (string): Composer name(s).
- MasteringEngineer (string): Mastering engineer name.
- RecordingLocation (string): Studio or location where recorded.
- ISRCCode (string, format CC-XXX-YY-NNNNN): International Standard Recording Code.
- CoverArtPalette (string): Dominant colors in the cover art.
- PlaybackGain (string): Replay gain value.
- ListenerAtmosphere (string): Suggested listening environment.
- GeoOrigin (string): Geographic origin of the track.
- StreamingPriority (string): Priority tier for streaming platforms.
- WaveformFingerprint (string): Audio fingerprint identifier.
- LyricLanguage (string): Language of the lyrics.
- VocalStyle (string): Vocal style descriptor.
- CopyrightHolder (string): Copyright owner.
- AIGenerationRatio (number, 0–100): Percentage of AI-generated content.

## Behavior Guidelines
- Be warm, concise, and encouraging.
- When the user completes an album or adds a notable track, celebrate the milestone.
- When referencing a famous artist or album, feel free to share an interesting fact.
- If you detect a contextually exciting moment (completing an album, adding a famous track, \
referencing a legendary artist), include the text [TRIGGER_GIF:<keyword>] at the end of your \
response, where <keyword> is a relevant music term (e.g., guitar, jazz, concert, vinyl).
- Never reveal or reference any API keys or server configuration.${contextSection}`;
}

/**
 * Detect whether the assistant response should trigger a GIF embed.
 * Looks for the [TRIGGER_GIF:<keyword>] marker in the reply.
 */
function detectGifTrigger(replyContent, _messages) {
  const match = replyContent.match(/\[TRIGGER_GIF:([^\]]+)\]/i);
  if (match) {
    return { triggerGif: true, gifQuery: match[1].trim() };
  }
  return { triggerGif: false, gifQuery: null };
}

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------

app.listen(PORT, () => {
  console.log(`🎵 Music Catalog AI service running on port ${PORT}`);
  console.log(`   POST http://localhost:${PORT}/api/chat`);
  console.log(`   GET  http://localhost:${PORT}/api/gif?q=<query>`);
});
