# Implementation Plan: Music Catalog Editor

## Overview

Build a React 19 + TypeScript + Vite 7 + Tailwind CSS 3 single-page application that replaces the existing Pizza ordering UI. The app features a split-pane layout with two inline-editable data grids (Albums + Tracks) on top and an AI-powered chat assistant on the bottom. A separate Express-based `ai-server.js` proxies all OpenAI calls so the API key never reaches the browser. State is held in a React Context/Reducer, mirrored to `localStorage`, and exportable as JSON.

**Implementation language:** TypeScript (frontend) + Node.js/TypeScript-compatible JavaScript (backend)

> **Before starting:** Copy `.env.example` to `.env` and fill in `OPENAI_API_KEY`. Never commit `.env`.

---

## Tasks

- [x] 1. Project setup — dependencies, environment files, and server scaffold
  - Install new runtime dependencies: `express`, `openai`, `cors`, `dotenv`
    - Run: `npm install express openai cors dotenv`
  - Install new dev dependencies: `fast-check`, `@types/express`, `@types/cors`
    - Run: `npm install -D fast-check @types/express @types/cors`
  - Create `.env.example` at the repo root with the following content (no real values):
    ```
    # Copy this file to .env and fill in your key — never commit .env
    OPENAI_API_KEY=your_openai_api_key_here
    AI_SERVICE_PORT=3001
    ```
  - Verify `.env` is already listed in `.gitignore`; add it if missing
  - Create `ai-server.js` at the repo root as a new Express server (separate from the existing `server.js`):
    - `POST /api/chat` — proxies to OpenAI Chat Completions; reads `OPENAI_API_KEY` from `process.env`; rejects any request body that contains an `openaiApiKey` field (Req 10.5)
    - `GET /api/gif?q={query}` — returns a curated public GIF URL from a hardcoded list of music-related GIF URLs (no GIPHY API key required); selects a random entry whose tags match the query, or a random entry from the full list as fallback
    - Reads `OPENAI_API_KEY` exclusively from `process.env`; never echoes it in any response (Req 10.1, 10.2)
    - Includes CORS headers allowing `http://localhost:5173` (Vite dev server)
    - Listens on `process.env.AI_SERVICE_PORT || 3001`
  - Add `"ai-server": "node ai-server.js"` script to `package.json`
  - Add a `"dev:all"` note in `README.md` explaining that developers must run `npm run dev` (Vite, port 5173) and `npm run ai-server` (Express, port 3001) in two separate terminals
  - _Requirements: 10.1, 10.2, 10.3, 10.5_

- [x] 2. Core TypeScript types and pure validation functions
  - [x] 2.1 Create `src/catalog/types.ts` with all shared interfaces and enums
    - Export `Album`, `Track`, `CatalogState`, `UndoEntry`, `ChatMessage`, `GifEmbed`, `PersistedCatalog` interfaces exactly as specified in the design document
    - Export `EditionType` and `ExplicitFlag` union types
    - Export `MUSIC_GENRES` and `MOOD_DESCRIPTORS` constant arrays
    - Export `EDITION_TYPES` constant array: `['Standard', 'Deluxe', 'Limited', 'Remastered', 'Box Set']`
    - Export `EXPLICIT_FLAGS` constant array: `['Clean', 'Explicit']`
    - _Requirements: 1.7, 1.8, 1.9, 2.6, 2.7, 2.8_

  - [x] 2.2 Create `src/catalog/validation.ts` with all pure validation functions
    - Implement and export: `validateRequired`, `validatePositiveInteger`, `validatePositiveNumber`, `validateAIGenerationRatio`, `validateISRC`, `validateAlbumNameRef`, `validateCatalogNumberUnique`
    - Each function signature: `(value: string, ...context) => string | null` — returns `null` on valid, error message string on invalid
    - No side effects; no imports from React or browser APIs
    - _Requirements: 1.10, 2.9, 2.10, 2.11, 3.4, 3.5, 5.3, 5.4_

  - [ ]* 2.3 Write property-based tests for all validation functions
    - Create `src/catalog/validation.property.test.ts`
    - Use `fast-check` with `{ numRuns: 100 }` for each `fc.assert`
    - Annotate each test: `// Feature: music-catalog-editor, Property N: <property_text>`
    - **Property 2: Positive-integer validation accepts valid inputs and rejects invalid ones** — Validates: Requirements 1.10
    - **Property 3: Positive-number validation accepts valid inputs and rejects invalid ones** — Validates: Requirements 2.9
    - **Property 4: AIGenerationRatio range validation accepts [0, 100] and rejects outside** — Validates: Requirements 2.10
    - **Property 5: ISRC validation accepts well-formed codes and rejects malformed ones** — Validates: Requirements 2.11
    - **Property 9: Required-field validation rejects empty/whitespace values** — Validates: Requirements 3.5, 5.3

- [x] 3. Catalog reducer and context
  - [x] 3.1 Create `src/catalog/reducer.ts` with the `catalogReducer` pure function
    - Handle actions: `SET_CELL`, `ADD_ALBUM`, `ADD_TRACK`, `DELETE_ALBUM`, `DELETE_TRACK`, `BULK_REASSIGN`, `UNDO`, `LOAD_CATALOG`, `SET_ACTIVE_ALBUM`, `SET_ACTIVE_TRACK`, `SET_SELECTED_TRACKS`, `SET_SPLIT_RATIO`
    - `SET_CELL` pushes an `UndoEntry` onto `undoStack` (cap at 50 entries) before applying the new value
    - `UNDO` pops the top `UndoEntry` and restores `previousValue` without re-running validation
    - `ADD_TRACK` pre-populates `AlbumName` from `activeAlbumId` if set (Req 3.3)
    - `BULK_REASSIGN` updates `AlbumName` on all tracks in `selectedTrackIds` (Req 6.4)
    - All state mutations return new objects (immutable updates)
    - _Requirements: 1.6, 3.3, 4.2, 4.3, 4.4, 6.4_

  - [x] 3.2 Create `src/catalog/mockData.ts` with pre-loaded sample records
    - Export `MOCK_ALBUMS: Album[]` — 3 records: Nevermind (Nirvana, DGC Records, 1991-09-24, DGC-24425, Standard, Rock, Energetic), Kind of Blue (Miles Davis, Columbia Records, 1959-08-17, CL-1355, Standard, Jazz, Calm), Thriller (Michael Jackson, Epic Records, 1982-11-30, QE-38112, Standard, Pop, Energetic)
    - Export `MOCK_TRACKS: Track[]` — 5 records: "Smells Like Teen Spirit" (Nirvana/Nevermind, US-DGC-91-00001), "Come as You Are" (Nirvana/Nevermind, US-DGC-91-00002), "So What" (Miles Davis/Kind of Blue, US-COL-59-00001), "Blue in Green" (Miles Davis/Kind of Blue, US-COL-59-00002), "Billie Jean" (Michael Jackson/Thriller, US-EPC-82-00001)
    - All required fields populated with realistic values; optional fields may be empty strings
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [x] 3.3 Create `src/catalog/persistence.ts` with localStorage and JSON serialization helpers
    - Export `saveCatalogToStorage(albums, tracks): void` — serializes to `localStorage` key `"music-catalog-editor"` with `version: 1`
    - Export `loadCatalogFromStorage(): PersistedCatalog | null` — returns `null` if key absent or parse fails
    - Export `saveSplitRatioToStorage(ratio: number): void` and `loadSplitRatioFromStorage(): number | null`
    - Export `exportCatalogToJSON(albums, tracks): string` — returns a formatted JSON string
    - Export `importCatalogFromJSON(json: string): { data: PersistedCatalog } | { error: string }` — validates schema before returning; returns error string on failure without throwing
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

  - [x] 3.4 Create `src/catalog/CatalogContext.tsx` wiring reducer, persistence, and mock data
    - Create `CatalogContext` and `CatalogProvider` component
    - On mount: load from `localStorage`; if absent, load mock data and set first album as active row (Req 8.5)
    - After every `SET_CELL`, `ADD_ALBUM`, `ADD_TRACK`, `DELETE_ALBUM`, `DELETE_TRACK`, `BULK_REASSIGN` dispatch: call `saveCatalogToStorage`
    - Expose `state`, `dispatch`, and convenience action creators via context value
    - Register `keydown` listener for `Ctrl+Z` / `Cmd+Z` → dispatch `UNDO` (Req 4.3)
    - _Requirements: 8.1, 8.5, 11.1, 11.2, 4.3_

  - [ ]* 3.5 Write property-based tests for the catalog reducer
    - Add to `src/catalog/validation.property.test.ts` (or create `src/catalog/reducer.property.test.ts`)
    - **Property 1: Cell edit is reflected in catalog state** — Validates: Requirements 1.6, 4.2
    - **Property 6: AlbumName dropdown contains exactly the current album titles** — Validates: Requirements 2.4
    - **Property 7: New track pre-populates AlbumName from active album** — Validates: Requirements 3.3
    - **Property 8: Track referential integrity — AlbumName must reference an existing album** — Validates: Requirements 3.4
    - **Property 10: CatalogNumber uniqueness constraint** — Validates: Requirements 5.4
    - **Property 11: Bulk track reassignment updates all selected tracks** — Validates: Requirements 6.2, 6.4
    - **Property 12: Bulk reassignment cancellation is a no-op** — Validates: Requirements 6.5

  - [ ]* 3.6 Write property-based tests for persistence helpers
    - **Property 13: localStorage round-trip preserves catalog state** — Validates: Requirements 11.1, 11.2
    - **Property 14: JSON export/import round-trip preserves catalog** — Validates: Requirements 11.4
    - **Property 15: Invalid JSON import leaves catalog unchanged** — Validates: Requirements 11.5

- [ ] 4. Checkpoint — run tests before building UI
  - Run `npm test` and confirm all property and unit tests pass before proceeding to UI components.
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Core UI primitives — EditableCell and SplitPane
  - [ ] 5.1 Create `src/components/EditableCell.tsx`
    - Implement the `EditableCellProps` interface from the design document
    - `type="text"`: renders a plain `<input>` when `isActive`, otherwise a `<span>`
    - `type="number"`: same as text but `inputMode="numeric"`
    - `type="dropdown"`: renders a `<select>` when `isActive`, otherwise a `<span>`
    - On blur / Tab / Enter: call `validate` (if provided); if error returned, display error inline and revert to `previousValue`; if valid, call `onCommit`
    - Tab key moves focus to the next cell in the row (use `data-cell-index` attributes)
    - Accessible: `aria-label` includes field name; error message has `role="alert"`
    - _Requirements: 1.2, 1.3, 1.4, 1.6, 1.10, 2.3, 2.9, 2.10, 2.11_

  - [ ] 5.2 Create `src/components/SplitPane.tsx`
    - Implement the `SplitPaneProps` interface from the design document
    - Renders top and bottom panes separated by a draggable `<div>` divider
    - On mouse drag: update `ratio` in local state and call `onRatioChange`
    - Both panes remain independently scrollable and interactive during drag
    - Minimum pane height: 15% of viewport height (clamp ratio to [0.15, 0.85])
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 6. Toolbar component
  - Create `src/components/Toolbar.tsx`
  - Renders four action buttons: "Add Album", "Add Track", "Export", "Import"
  - "Add Album" → dispatches `ADD_ALBUM` action
  - "Add Track" → dispatches `ADD_TRACK` action (pre-populates AlbumName from active album)
  - "Export" → calls `exportCatalogToJSON` and triggers a browser file download (`catalog-export.json`)
  - "Import" → opens a hidden `<input type="file" accept=".json">`, reads the file, calls `importCatalogFromJSON`; on success shows a confirmation dialog before dispatching `LOAD_CATALOG`; on error displays the error message inline
  - All buttons have accessible `aria-label` attributes
  - _Requirements: 3.1, 5.1, 11.3, 11.4, 11.5_

- [ ] 7. AlbumsTable component
  - [ ] 7.1 Create `src/components/AlbumsTable.tsx` and `src/components/AlbumRow.tsx`
    - Render a scrollable `<table>` with exactly 10 column headers in order: AlbumTitle, AlbumArtist, ReleaseDate, RecordLabel, CatalogNumber, EditionType, DiscCount, TrackTotal, AlbumGenre, AlbumMood (Req 1.1)
    - Each `AlbumRow` renders one `EditableCell` per column
    - `EditionType` → `type="dropdown"`, options from `EDITION_TYPES` (Req 1.7)
    - `AlbumGenre` → `type="dropdown"`, options from `MUSIC_GENRES` (Req 1.8)
    - `AlbumMood` → `type="dropdown"`, options from `MOOD_DESCRIPTORS` (Req 1.9)
    - `DiscCount`, `TrackTotal` → `type="number"`, `validate={validatePositiveInteger}` (Req 1.10)
    - Active row highlighted with Tailwind `bg-blue-50 ring-1 ring-blue-400` (Req 1.5)
    - Row click → dispatch `SET_ACTIVE_ALBUM` (Req 1.2)
    - Cell commit → dispatch `SET_CELL` for album entity (Req 1.6)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10_

  - [ ]* 7.2 Write unit tests for AlbumsTable
    - Create `src/components/AlbumsTable.test.tsx`
    - Test: renders all 10 column headers in correct order
    - Test: EditionType dropdown contains exactly the 5 specified values
    - Test: clicking a row dispatches SET_ACTIVE_ALBUM
    - _Requirements: 1.1, 1.7_

- [ ] 8. TracksTable component
  - [ ] 8.1 Create `src/components/TracksTable.tsx` and `src/components/TrackRow.tsx`
    - Render a scrollable `<table>` with exactly 25 column headers in order as specified in Req 2.1
    - Each `TrackRow` renders one `EditableCell` per column plus a checkbox for multi-select
    - `AlbumName` → `type="dropdown"`, options derived from `albums.map(a => a.AlbumTitle)` (Req 2.4, 2.5)
    - `ExplicitContentFlag` → `type="dropdown"`, options from `EXPLICIT_FLAGS` (Req 2.6)
    - `GenreCluster` → `type="dropdown"`, options from `MUSIC_GENRES` (Req 2.7)
    - `MoodSignature` → `type="dropdown"`, options from `MOOD_DESCRIPTORS` (Req 2.8)
    - `TempoBPM` → `type="number"`, `validate={validatePositiveNumber}` (Req 2.9)
    - `AIGenerationRatio` → `type="number"`, `validate={validateAIGenerationRatio}` (Req 2.10)
    - `ISRCCode` → `type="text"`, `validate={validateISRC}` (Req 2.11)
    - `TrackTitle`, `AlbumName` → `validate={validateRequired}` on commit (Req 3.5)
    - Active row highlighted; row click → dispatch `SET_ACTIVE_TRACK` (Req 2.2)
    - Checkbox change → dispatch `SET_SELECTED_TRACKS` (Req 6.2)
    - Cell commit → dispatch `SET_CELL` for track entity (Req 4.2)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 2.11, 3.4, 3.5, 4.2_

  - [ ]* 8.2 Write unit tests for TracksTable
    - Create `src/components/TracksTable.test.tsx`
    - Test: renders all 25 column headers in correct order
    - Test: ExplicitContentFlag dropdown contains exactly "Clean" and "Explicit"
    - Test: clicking a row dispatches SET_ACTIVE_TRACK
    - _Requirements: 2.1, 2.6_

- [ ] 9. BulkReassignDialog component
  - Create `src/components/BulkReassignDialog.tsx`
  - Implement the `BulkReassignDialogProps` interface from the design document
  - Renders a modal overlay with: list of selected track titles, a dropdown of destination album titles, "Confirm" and "Cancel" buttons
  - "Confirm" → calls `onConfirm(destinationAlbumTitle)` (Req 6.3, 6.4)
  - "Cancel" → calls `onCancel()` without modifying state (Req 6.5)
  - Accessible: `role="dialog"`, `aria-modal="true"`, focus trapped inside modal
  - Show dialog when `selectedTrackIds.size > 1` and user clicks a "Reassign" button in the Toolbar or TracksTable header
  - _Requirements: 6.2, 6.3, 6.4, 6.5_

- [ ] 10. ChatPanel and AI_Service integration
  - [ ] 10.1 Create `src/services/aiService.ts` — client-side fetch wrapper
    - Export `sendChatMessage(messages, catalogContext): Promise<{ reply: string; triggerGif: boolean; gifQuery: string | null }>` — POSTs to `http://localhost:3001/api/chat`
    - Export `fetchGif(query: string): Promise<{ url: string; title: string }>` — GETs `http://localhost:3001/api/gif?q={query}`
    - On non-2xx response: throw an error with the server's `error` field as the message
    - Never includes any API key in the request body or headers (Req 10.2)
    - _Requirements: 9.3, 9.4, 9.8, 10.2_

  - [ ] 10.2 Implement `ai-server.js` `POST /api/chat` handler fully
    - Build the system prompt from a template that includes: assistant personality (friendly, music-savvy), full Album and Track field schema with types and valid values, and instructions to set `triggerGif: true` when a contextually appropriate moment occurs (completing an album, referencing a famous artist)
    - Forward `messages` array and `catalogContext` to OpenAI `gpt-4o-mini` (or `gpt-3.5-turbo` as fallback)
    - Parse the OpenAI response; determine `triggerGif` and `gifQuery` from response content
    - Return `{ reply, triggerGif, gifQuery }` — never include `OPENAI_API_KEY` in response (Req 10.1)
    - Reject requests containing `openaiApiKey` in body with HTTP 400 (Req 10.5)
    - _Requirements: 9.3, 9.4, 9.5, 9.6, 10.1, 10.5_

  - [ ] 10.3 Implement `ai-server.js` `GET /api/gif` handler
    - Define a hardcoded array of at least 12 curated public music-related GIF URLs (use publicly accessible, royalty-free animated GIFs — e.g., from Wikimedia Commons or similar public domain sources — each tagged with genre/mood keywords)
    - Filter by query keyword match against tags; return a random match, or a random entry from the full list if no match
    - Return `{ url, title }` — no external API key required
    - _Requirements: 9.7_

  - [ ] 10.4 Create `src/components/ChatPanel.tsx`, `ChatHistory.tsx`, and `ChatInput.tsx`
    - `ChatPanel` manages `messages: ChatMessage[]` and `isLoading` state; calls `sendChatMessage` on submit; on `triggerGif: true` calls `fetchGif` and appends a `GifEmbed` to the assistant message
    - `ChatHistory` renders alternating user/assistant message bubbles; auto-scrolls to latest message (Req 9.4); renders `<img>` for `giphyEmbed.url` when present (Req 9.7)
    - `ChatInput` renders a `<textarea>` (Enter to send, Shift+Enter for newline) and a "Send" button; shows loading spinner while `isLoading` (Req 9.9); on error displays *"The assistant is unavailable right now. Please try again."* with a Retry button (Req 9.8); preserves user message in input on error
    - Passes `catalogContext` (current albums + tracks snapshot) with every message (Req 9.5, 9.6)
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.7, 9.8, 9.9_

- [ ] 11. Checkpoint — verify AI integration end-to-end
  - Start `npm run ai-server` in one terminal and `npm run dev` in another
  - Confirm `POST /api/chat` returns a valid `{ reply, triggerGif, gifQuery }` shape
  - Confirm `GET /api/gif` returns `{ url, title }`
  - Confirm the API key is not visible in any browser network response
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. MusicCatalogEditor root component and App wiring
  - [ ] 12.1 Create `src/components/MusicCatalogEditor.tsx`
    - Compose `CatalogProvider` → `SplitPane` → `TableView` (top) + `ChatPanel` (bottom)
    - `TableView` renders `Toolbar`, `AlbumsTable`, and `TracksTable`
    - Pass `splitRatio` from context to `SplitPane`; on ratio change dispatch `SET_SPLIT_RATIO` and call `saveSplitRatioToStorage` (Req 7.5)
    - Render `BulkReassignDialog` as a portal when `selectedTrackIds.size > 1` and reassign is triggered
    - _Requirements: 7.1, 7.2, 7.5_

  - [ ] 12.2 Replace Pizza UI with MusicCatalogEditor in `src/App.tsx`
    - Remove all Pizza-related imports and JSX from `src/App.tsx`
    - Render `<MusicCatalogEditor />` as the sole child
    - Update `src/index.css` to remove any Pizza-specific global styles; keep Tailwind directives
    - _Requirements: 7.1_

- [ ] 13. Mock data display and startup behavior verification
  - Verify that on first load (no `localStorage` entry) the app displays the 3 mock albums and 5 mock tracks
  - Verify the first album row is set as the Active Row on startup (Req 8.5)
  - Verify that after editing a cell and refreshing the page, the edited value is restored from `localStorage` (Req 11.1, 11.2)
  - Write unit test in `src/catalog/catalog.test.ts`:
    - Test: mock data loads when localStorage is empty (Req 8.1–8.5)
    - Test: catalog restores from localStorage on reload (Req 11.2)
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 11.1, 11.2_

- [ ] 14. JSON export and import wiring
  - [ ] 14.1 Wire Export button in Toolbar to trigger a file download
    - Call `exportCatalogToJSON(albums, tracks)` and create a `Blob` with `type: "application/json"`
    - Programmatically click a temporary `<a download="catalog-export.json">` element
    - _Requirements: 11.3_

  - [ ] 14.2 Wire Import button in Toolbar to handle file selection and confirmation
    - On file selected: read as text, call `importCatalogFromJSON`
    - On success: show a browser `confirm()` dialog — "This will replace your current catalog. Continue?"
    - On confirm: dispatch `LOAD_CATALOG` with the parsed data
    - On error: display the error string in a toast or inline message; do not modify catalog state (Req 11.5)
    - _Requirements: 11.4, 11.5_

  - [ ]* 14.3 Write unit tests for export/import flow
    - Test: Export downloads a JSON file (mock `URL.createObjectURL`)
    - Test: Import replaces catalog after user confirmation
    - Test: Import with invalid JSON shows error and leaves catalog unchanged
    - _Requirements: 11.3, 11.4, 11.5_

- [ ] 15. Final checkpoint — full test suite and dev startup instructions
  - Run `npm test` — confirm all unit tests and property-based tests pass
  - Fix any remaining type errors: run `npx tsc --noEmit`
  - **To run the full application locally:**
    1. Copy `.env.example` to `.env` and set `OPENAI_API_KEY=<your key>`
    2. Terminal 1: `npm run ai-server` — starts Express AI service on port 3001
    3. Terminal 2: `npm run dev` — starts Vite dev server on port 5173
    4. Open `http://localhost:5173` in your browser
  - Ensure all tests pass, ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- The GIPHY API is **not used** — `GET /api/gif` returns URLs from a hardcoded curated list of public music GIFs
- The OpenAI API key must be in `.env` (never committed); document this in `.env.example`
- `ai-server.js` runs on port 3001; the Vite dev server runs on port 5173 — both must be running for full functionality
- Property tests use `fast-check` with `{ numRuns: 100 }` per `fc.assert`
- The existing `server.js` (Pizza API) is left untouched; `ai-server.js` is a new, separate file
