/**
 * aiService.ts — client-side fetch wrapper for the Music Catalog AI service.
 *
 * All requests are proxied through the local AI server (localhost:3001).
 * No API keys are ever included in request bodies or headers from the client.
 */

const AI_BASE_URL = 'http://localhost:3001';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface CatalogContext {
  albums: unknown[];
  tracks: unknown[];
}

export interface ChatResponse {
  reply: string;
  triggerGif: boolean;
  gifQuery: string | null;
}

export interface GifResponse {
  url: string;
  title: string;
}

/**
 * Send a chat message to the AI service.
 *
 * @param messages - Conversation history (user + assistant turns)
 * @param catalogContext - Current snapshot of albums and tracks
 * @returns AI reply with optional GIF trigger metadata
 */
export async function sendChatMessage(
  messages: ChatMessage[],
  catalogContext: CatalogContext
): Promise<ChatResponse> {
  const response = await fetch(`${AI_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, catalogContext }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Chat request failed');
  }

  return data as ChatResponse;
}

/**
 * Fetch a curated music GIF matching the given query.
 *
 * @param query - Search term (e.g. "guitar", "jazz", "concert")
 * @returns GIF URL and title
 */
export async function fetchGif(query: string): Promise<GifResponse> {
  const response = await fetch(
    `${AI_BASE_URL}/api/gif?q=${encodeURIComponent(query)}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch GIF');
  }

  const data = await response.json();
  return data as GifResponse;
}
