# Design Document: Music Catalog Editor

## Overview

The Music Catalog Editor is a browser-based single-page application (SPA) that lets catalog editors build and maintain a structured music database composed of Albums and Tracks. The application is split vertically into two interactive panes: a **Table_View** (top) containing two inline-editable data grids, and a **Chat_Panel** (bottom) housing an AI-powered assistant with GIPHY motivational embeds.

The frontend is a React + TypeScript application built with Vite, styled with Tailwind CSS, and deployed as a static bundle. A lightweight Node.js/Express backend (**AI_Service**) proxies all OpenAI API calls so the API key is never exposed to the browser. The full catalog state is held in React state, mirrored to `localStorage` after every mutation, and can be exported/imported as JSON.

### Key Design Goals

- **Zero-friction inline editing** — clicking any cell activates it for direct keyboard input; dropdowns appear in-place.
- **Referential integrity** — Tracks always reference a valid Album; the UI enforces this at save time.
- **Security by default** — the OpenAI API key lives only on the server; the client never sees it.
- **Persistence without a database** — `localStorage` provides session continuity; JSON export/import enables sharing.
- **Testable data model** — validation logic is extracted into pure functions so it can be covered by property-based tests.

---

## Architecture

The system is composed of three runtime layers:

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser (Client)                      │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                   Catalog_Editor (React SPA)          │  │
│  │                                                      │  │
│  │  ┌─────────────────────┐  ┌────────────────────────┐ │  │
│  │  │     Table_View       │  │      Chat_Panel        │ │  │
│  │  │  ┌───────────────┐  │  │  ┌──────────────────┐  │ │  │
│  │  │  │  AlbumsTable  │  │  │  │  ChatHistory     │  │ │  │
│  │  │  └───────────────┘  │  │  └──────────────────┘  │ │  │
│  │  │  ┌───────────────┐  │  │  ┌──────────────────┐  │ │  │
│  │  │  │  TracksTable  │  │  │  │  ChatInput       │  │ │  │
│  │  │  └───────────────┘  │  │  └──────────────────┘  │ │  │
│  │  └─────────────────────┘  └────────────────────────┘ │  │
│  │                                                      │  │
│  │  ┌──────────────────────────────────────────────┐   │  │
│  │  │           CatalogContext (React Context)       │   │  │
│  │  │  albums[], tracks[], activeAlbumId,           │   │  │
│  │  │  activeTrackId, undoStack, splitRatio         │   │  │
│  │  └──────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  localStorage: { catalog, splitRatio }                      │
└─────────────────────────────────────────────────────────────┘
                          │ HTTP POST /api/chat
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   AI_Service (Node.js/Express)               │
│                                                             │
│  POST /api/chat  →  OpenAI Chat Completions API             │
│  GET  /api/giphy →  GIPHY Search API                        │
│                                                             │
│  Reads OPENAI_API_KEY from env / GCP Secret Manager         │
│  Reads GIPHY_API_KEY from env / GCP Secret Manager          │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │  OpenAI API           │
              │  GIPHY API            │
              └───────────────────────┘
```

### Technology Choices

| Layer | Technology | Rationale |
|---|---|---|
| Frontend framework | React 19 + TypeScript | Matches existing workspace stack |
| Build tool | Vite 7 | Already configured in workspace |
| Styling | Tailwind CSS 3 | Already configured in workspace |
| State management | React Context + useReducer | Sufficient for single-page catalog; avoids new dependencies |
| Backend | Node.js + Express | Matches existing `server.js` pattern in workspace |
| Property-based testing | `fast-check` | Mature JS/TS PBT library; works with Vitest |
| Unit testing | Vitest + React Testing Library | Already configured (`vitest.config.ts` present) |
| Deployment | Google Cloud Run | Matches existing `Dockerfile` + `deploy.sh` pattern |

---

## Components and Interfaces

### Component Tree

```
App
└── MusicCatalogEditor
    ├── CatalogProvider          (Context + Reducer)
    ├── SplitPane                (resizable vertical divider)
    │   ├── TableView            (top pane)
    │   │   ├── Toolbar          (Add Album, Add Track, Export, Import)
    │   │   ├── AlbumsTable      (10-column inline-editable grid)
    │   │   │   ├── AlbumRow     (per-row component)
    │   │   │   └── EditableCell (generic inline-edit cell)
    │   │   └── TracksTable      (25-column inline-editable grid)
    │   │       ├── TrackRow
    │   │       └── EditableCell
    │   └── ChatPanel            (bottom pane)
    │       ├── ChatHistory      (scrollable message list)
    │       │   ├── UserMessage
    │       │   ├── AssistantMessage
    │       │   └── GiphyEmbed
    │       └── ChatInput        (textarea + send button)
    └── BulkReassignDialog       (modal, shown during multi-select reassign)
```

### Key Component Interfaces

```typescript
// EditableCell — generic inline-edit cell used by both tables
interface EditableCellProps {
  value: string;
  fieldName: string;
  rowId: string;
  type: 'text' | 'dropdown' | 'number';
  options?: string[];           // for dropdown type
  validate?: (v: string) => string | null;  // returns error message or null
  onCommit: (rowId: string, field: string, value: string) => void;
  isActive: boolean;
}

// AlbumsTable
interface AlbumsTableProps {
  albums: Album[];
  activeAlbumId: string | null;
  onRowClick: (albumId: string) => void;
  onCellCommit: (albumId: string, field: keyof Album, value: string) => void;
}

// TracksTable
interface TracksTableProps {
  tracks: Track[];
  albums: Album[];              // for AlbumName dropdown population
  activeTrackId: string | null;
  selectedTrackIds: Set<string>;
  onRowClick: (trackId: string) => void;
  onRowSelect: (trackId: string, selected: boolean) => void;
  onCellCommit: (trackId: string, field: keyof Track, value: string) => void;
}

// SplitPane
interface SplitPaneProps {
  topContent: React.ReactNode;
  bottomContent: React.ReactNode;
  initialRatio: number;         // 0–1, fraction for top pane
  onRatioChange: (ratio: number) => void;
}

// ChatPanel
interface ChatPanelProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (text: string) => void;
}

// BulkReassignDialog
interface BulkReassignDialogProps {
  selectedTracks: Track[];
  albums: Album[];
  onConfirm: (destinationAlbumTitle: string) => void;
  onCancel: () => void;
}
```

### AI_Service API Contract

#### `POST /api/chat`

Request:
```json
{
  "messages": [
    { "role": "user" | "assistant", "content": "string" }
  ],
  "catalogContext": {
    "albums": [...],
    "tracks": [...]
  }
}
```

Response (success):
```json
{
  "reply": "string",
  "triggerGiphy": true | false,
  "giphyQuery": "string | null"
}
```

Response (error):
```json
{
  "error": "string"
}
```

The server sets `triggerGiphy: true` when the assistant's reply contains a contextual trigger phrase (e.g., completing an album, referencing a famous artist). The `giphyQuery` is a search term the client uses to call `GET /api/giphy`.

#### `GET /api/giphy?q={query}`

Response (success):
```json
{
  "url": "string",
  "title": "string"
}
```

The server fetches a random result from the GIPHY Search API using the server-side `GIPHY_API_KEY` and returns a single GIF URL. The client never calls GIPHY directly.

---

## Data Models

### Album

```typescript
interface Album {
  id: string;                   // UUID, client-generated
  AlbumTitle: string;           // required, non-empty
  AlbumArtist: string;
  ReleaseDate: string;          // ISO 8601 date string, e.g. "1991-09-24"
  RecordLabel: string;
  CatalogNumber: string;        // required, unique across all albums
  EditionType: EditionType | '';
  DiscCount: string;            // stored as string; validated as positive integer
  TrackTotal: string;           // stored as string; validated as positive integer
  AlbumGenre: string;
  AlbumMood: string;
}

type EditionType = 'Standard' | 'Deluxe' | 'Limited' | 'Remastered' | 'Box Set';
```

### Track

```typescript
interface Track {
  id: string;                   // UUID, client-generated
  TrackTitle: string;           // required, non-empty
  PrimaryArtist: string;
  FeaturedArtists: string;
  AlbumName: string;            // FK → Album.AlbumTitle; required, must reference existing album
  ReleaseYear: string;
  GenreCluster: string;
  MoodSignature: string;
  TempoBPM: string;             // validated as positive number
  EnergyLevel: string;
  ExplicitContentFlag: ExplicitFlag | '';
  ProducerCredits: string;
  ComposerList: string;
  MasteringEngineer: string;
  RecordingLocation: string;
  ISRCCode: string;             // validated: CC-XXX-YY-NNNNN
  CoverArtPalette: string;
  PlaybackGain: string;
  ListenerAtmosphere: string;
  GeoOrigin: string;
  StreamingPriority: string;
  WaveformFingerprint: string;
  LyricLanguage: string;
  VocalStyle: string;
  CopyrightHolder: string;
  AIGenerationRatio: string;    // validated: numeric 0–100
}

type ExplicitFlag = 'Clean' | 'Explicit';
```

### Catalog State

```typescript
interface CatalogState {
  albums: Album[];
  tracks: Track[];
  activeAlbumId: string | null;
  activeTrackId: string | null;
  selectedTrackIds: Set<string>;
  undoStack: UndoEntry[];
  splitRatio: number;           // 0–1
}

interface UndoEntry {
  type: 'cell_edit';
  entityType: 'album' | 'track';
  entityId: string;
  field: string;
  previousValue: string;
}
```

### Chat Message

```typescript
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  giphyEmbed?: GiphyEmbed;
}

interface GiphyEmbed {
  url: string;
  title: string;
}
```

### localStorage Schema

```typescript
// Key: "music-catalog-editor"
interface PersistedCatalog {
  version: 1;
  albums: Album[];
  tracks: Track[];
}

// Key: "music-catalog-editor-split"
type PersistedSplitRatio = number;  // 0–1
```

### Predefined Dropdown Values

```typescript
const MUSIC_GENRES = [
  'Alternative', 'Blues', 'Classical', 'Country', 'Electronic',
  'Folk', 'Hip-Hop', 'Jazz', 'Latin', 'Metal', 'Pop', 'Punk',
  'R&B / Soul', 'Reggae', 'Rock', 'World'
];

const MOOD_DESCRIPTORS = [
  'Aggressive', 'Calm', 'Dark', 'Dreamy', 'Energetic',
  'Happy', 'Melancholic', 'Nostalgic', 'Romantic', 'Tense',
  'Uplifting', 'Whimsical'
];
```

### Mock Data

Pre-loaded when no `localStorage` entry exists:

**Albums (3 records):**
- *Nevermind* — Nirvana, DGC Records, 1991-09-24, DGC-24425, Standard, Rock, Energetic
- *Kind of Blue* — Miles Davis, Columbia Records, 1959-08-17, CL-1355, Standard, Jazz, Calm
- *Thriller* — Michael Jackson, Epic Records, 1982-11-30, QE-38112, Standard, Pop, Energetic

**Tracks (5 records):**
- "Smells Like Teen Spirit" — Nirvana / Nevermind, ISRC: US-DGC-91-00001
- "Come as You Are" — Nirvana / Nevermind, ISRC: US-DGC-91-00002
- "So What" — Miles Davis / Kind of Blue, ISRC: US-COL-59-00001
- "Blue in Green" — Miles Davis / Kind of Blue, ISRC: US-COL-59-00002
- "Billie Jean" — Michael Jackson / Thriller, ISRC: US-EPC-82-00001

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

The validation and catalog mutation logic is extracted into pure functions in `src/catalog/validation.ts` and `src/catalog/reducer.ts`. These are the targets for property-based testing using `fast-check`.

### Property Reflection

Before listing properties, redundancy is eliminated:

- Requirements 1.6, 4.2 both describe "edit a cell → state updates" — unified into **Property 1**.
- Requirements 2.5, 4.4, 6.1 all describe track-album association updates — unified into **Property 5**.
- Requirements 6.2 and 6.4 both describe bulk reassignment outcome — unified into **Property 9**.
- Requirements 11.1 and 11.2 together form a localStorage round-trip — unified into **Property 10**.
- Requirements 11.4 and 11.5 together form a JSON import round-trip — unified into **Properties 11 and 12**.

---

### Property 1: Cell edit is reflected in catalog state

*For any* album or track record and any editable string field, committing a new value to that cell should result in the in-memory catalog state containing exactly that new value for that field on that record.

**Validates: Requirements 1.6, 4.2**

---

### Property 2: Positive-integer validation accepts valid inputs and rejects invalid ones

*For any* string value, the `validatePositiveInteger` function should return `null` (valid) if and only if the string represents a positive integer (≥ 1, no decimal point, no leading zeros except "0" itself is excluded).

**Validates: Requirements 1.10**

---

### Property 3: Positive-number validation accepts valid inputs and rejects invalid ones

*For any* string value, the `validatePositiveNumber` function should return `null` (valid) if and only if the string parses to a finite positive number greater than zero.

**Validates: Requirements 2.9**

---

### Property 4: AIGenerationRatio range validation accepts [0, 100] and rejects outside

*For any* numeric value `n`, the `validateAIGenerationRatio` function should return `null` (valid) if and only if `n` is a finite number in the closed interval [0, 100].

**Validates: Requirements 2.10**

---

### Property 5: ISRC validation accepts well-formed codes and rejects malformed ones

*For any* string, the `validateISRC` function should return `null` (valid) if and only if the string matches the pattern `^[A-Z]{2}-[A-Z0-9]{3}-\d{2}-\d{5}$`.

**Validates: Requirements 2.11**

---

### Property 6: AlbumName dropdown contains exactly the current album titles

*For any* collection of albums in the catalog, the set of options presented in the AlbumName dropdown for any track should be exactly equal to the set of `AlbumTitle` values of those albums — no more, no fewer.

**Validates: Requirements 2.4**

---

### Property 7: New track pre-populates AlbumName from active album

*For any* album set as the active album, creating a new track should produce a track whose `AlbumName` equals the active album's `AlbumTitle`.

**Validates: Requirements 3.3**

---

### Property 8: Track referential integrity — AlbumName must reference an existing album

*For any* catalog state and any track whose `AlbumName` does not match any existing album's `AlbumTitle`, attempting to save that track should be rejected with a validation error, and the catalog state should remain unchanged.

**Validates: Requirements 3.4**

---

### Property 9: Required-field validation rejects empty/whitespace values

*For any* string composed entirely of whitespace characters (including the empty string), the `validateRequired` function should return a non-null error message.

**Validates: Requirements 3.5, 5.3**

---

### Property 10: CatalogNumber uniqueness constraint

*For any* catalog containing at least one album, attempting to save a new album whose `CatalogNumber` matches any existing album's `CatalogNumber` should be rejected, and the catalog state should remain unchanged.

**Validates: Requirements 5.4**

---

### Property 11: Bulk track reassignment updates all selected tracks

*For any* non-empty subset of tracks and any existing album in the catalog, confirming a bulk reassignment should result in every track in the selected subset having its `AlbumName` updated to the destination album's `AlbumTitle`, while all unselected tracks remain unchanged.

**Validates: Requirements 6.2, 6.4**

---

### Property 12: Bulk reassignment cancellation is a no-op

*For any* catalog state, cancelling a bulk reassignment dialog should leave the catalog state byte-for-byte identical to its state before the dialog was opened.

**Validates: Requirements 6.5**

---

### Property 13: localStorage round-trip preserves catalog state

*For any* valid catalog state (any combination of albums and tracks satisfying the schema), serializing it to the `localStorage` key and then deserializing it should produce a catalog state that is deeply equal to the original.

**Validates: Requirements 11.1, 11.2**

---

### Property 14: JSON export/import round-trip preserves catalog

*For any* valid catalog state, calling the export serializer and then the import deserializer on the resulting JSON string should produce a catalog state deeply equal to the original.

**Validates: Requirements 11.4**

---

### Property 15: Invalid JSON import leaves catalog unchanged

*For any* JSON string that does not conform to the `PersistedCatalog` schema (wrong shape, missing required fields, wrong types), calling the import function should return a validation error and leave the existing catalog state unchanged.

**Validates: Requirements 11.5**

---

## Error Handling

### Validation Errors (Client-Side)

All field-level validation is performed by pure functions in `src/catalog/validation.ts`. When a validation function returns a non-null error string:

1. The `EditableCell` component displays the error message inline below the cell (red text, small font).
2. The cell value is reverted to its `previousValue` (stored in component state before editing began).
3. The catalog state is **not** updated.

Validation functions:

| Function | Rule |
|---|---|
| `validateRequired(v)` | Returns error if `v.trim() === ''` |
| `validatePositiveInteger(v)` | Returns error if `v` is not a string matching `/^\d+$/` with `parseInt(v) >= 1` |
| `validatePositiveNumber(v)` | Returns error if `parseFloat(v)` is NaN, ≤ 0, or not finite |
| `validateAIGenerationRatio(v)` | Returns error if `parseFloat(v)` is NaN or outside [0, 100] |
| `validateISRC(v)` | Returns error if `v` does not match `/^[A-Z]{2}-[A-Z0-9]{3}-\d{2}-\d{5}$/` |
| `validateAlbumNameRef(v, albums)` | Returns error if no album in `albums` has `AlbumTitle === v` |
| `validateCatalogNumberUnique(v, albums, excludeId?)` | Returns error if any album (excluding `excludeId`) has `CatalogNumber === v` |

### Network Errors (AI_Service)

- If `fetch('/api/chat')` throws or returns a non-2xx status, the `ChatPanel` displays: *"The assistant is unavailable right now. Please try again."* with a Retry button.
- The loading spinner is dismissed on error.
- The user's message remains in the input field so they can retry without retyping.

### Import Errors

- If the imported JSON fails `JSON.parse`, the error message is: *"Invalid file: not valid JSON."*
- If the parsed object fails schema validation (checked with a lightweight runtime validator), the error message describes the first failing field: *"Invalid catalog: missing required field 'albums'."*
- In both cases, the existing catalog state is preserved.

### Undo

The `undoStack` in `CatalogState` holds up to 50 `UndoEntry` records. Each cell commit pushes an entry. `Ctrl+Z` / `Cmd+Z` pops the top entry and applies the `previousValue` back to the relevant field. Undo does not re-trigger validation (the previous value was already valid when it was committed).

---

## Testing Strategy

### Dual Testing Approach

Both unit/example-based tests and property-based tests are used. Unit tests cover specific scenarios, integration points, and UI behavior. Property tests verify universal correctness of the pure validation and catalog mutation functions.

### Property-Based Testing

**Library:** `fast-check` (installed as a dev dependency)

**Configuration:** Each property test runs a minimum of **100 iterations** (fast-check default is 100; set explicitly via `{ numRuns: 100 }` in `fc.assert`).

**Tag format:** Each property test is annotated with a comment:
```
// Feature: music-catalog-editor, Property N: <property_text>
```

**Test file:** `src/catalog/validation.property.test.ts`

Property tests to implement (one `fc.assert` per property):

| Property | fast-check Arbitraries |
|---|---|
| P1: Cell edit reflected in state | `fc.record({ id: fc.uuid(), field: fc.constantFrom(...albumFields), value: fc.string() })` |
| P2: Positive-integer validation | `fc.oneof(fc.integer({ min: 1 }), fc.string())` |
| P3: Positive-number validation | `fc.oneof(fc.float({ min: 0.001 }), fc.string())` |
| P4: AIGenerationRatio range | `fc.float()` — check accept iff in [0,100] |
| P5: ISRC validation | `fc.string()` + a generator for valid ISRC strings |
| P6: AlbumName dropdown completeness | `fc.array(fc.record({ AlbumTitle: fc.string({ minLength: 1 }) }))` |
| P7: New track pre-populates AlbumName | `fc.record({ AlbumTitle: fc.string({ minLength: 1 }) })` |
| P8: Track referential integrity | `fc.array(albumArb)` + `fc.string()` for non-matching AlbumName |
| P9: Required-field validation | `fc.string().filter(s => s.trim() === '')` + `fc.constant('')` |
| P10: CatalogNumber uniqueness | `fc.array(albumArb, { minLength: 1 })` |
| P11: Bulk reassignment updates all selected | `fc.array(trackArb)` + `fc.subarray(...)` + `albumArb` |
| P12: Bulk reassignment cancel is no-op | `fc.record({ catalog: catalogArb })` |
| P13: localStorage round-trip | `catalogArb` |
| P14: JSON export/import round-trip | `catalogArb` |
| P15: Invalid JSON import leaves state unchanged | `fc.string()` filtered to fail schema validation |

### Unit / Example-Based Tests

**Test file:** `src/catalog/catalog.test.ts`, `src/components/*.test.tsx`

Key example tests:

- AlbumsTable renders all 10 column headers in the correct order (Req 1.1)
- TracksTable renders all 25 column headers in the correct order (Req 2.1)
- EditionType dropdown contains exactly the 5 specified values (Req 1.7)
- ExplicitContentFlag dropdown contains exactly "Clean" and "Explicit" (Req 2.6)
- Clicking a cell sets it as the Active Row (Req 1.2, 2.2)
- Tab key moves focus to the next cell (Req 1.4)
- Add Track button creates a new row and focuses TrackTitle (Req 3.1, 3.2)
- Add Album button creates a new row and focuses AlbumTitle (Req 5.1, 5.2)
- Undo (Ctrl+Z) reverts the most recent cell edit (Req 4.3)
- Bulk reassignment confirmation dialog lists tracks and destination (Req 6.3)
- Mock data loads when localStorage is empty (Req 8.1–8.5)
- Chat message appears in history after send (Req 9.1–9.4)
- Loading indicator shown while AI_Service is processing (Req 9.9)
- Error message shown when AI_Service returns error (Req 9.8)
- Export downloads a JSON file (Req 11.3)
- Import replaces catalog after user confirmation (Req 11.4)

### Integration Tests

- `POST /api/chat` returns a valid response shape (Req 9.3–9.4)
- `GET /api/giphy` returns a GIF URL (Req 9.7)
- AI_Service rejects requests that include an `openaiApiKey` field in the body (Req 10.5)
- AI_Service response does not include the API key value anywhere in the response body (Req 10.1–10.2)

### Test Commands

```bash
# Run all unit + property tests (single pass, no watch)
npm test

# Run only property tests
npx vitest --run src/catalog/validation.property.test.ts
```
