# Requirements Document

## Introduction

The Music Catalog Editor is a web application that enables users to build and maintain a structured music catalog composed of two related tables: Albums and Tracks. Each track belongs to exactly one album (many-to-one relationship). The app features a split-pane layout: a tabular editor on top for direct data entry, and an AI-powered chat assistant on the bottom that guides users through filling out catalog metadata. The assistant has a friendly, music-savvy personality and provides motivational reinforcement through contextually appropriate GIPHY embeds featuring famous musicians and albums. The backend chat service communicates with the OpenAI API using a securely managed API key. The catalog can be exported as a JSON file for sharing or attaching to external workflows.

---

## Glossary

- **Album**: A record in the Albums table representing a music release, identified by a unique CatalogNumber.
- **Track**: A record in the Tracks table representing a single piece of music, belonging to exactly one Album via a foreign key (AlbumName → Album.AlbumTitle).
- **Catalog**: The combined set of Album and Track records managed by the application.
- **Active Row**: The currently selected row in either the Albums or Tracks table, highlighted with cursor focus.
- **Chat Assistant**: The AI-powered conversational interface at the bottom of the UI, backed by the OpenAI API.
- **AI_Service**: The backend service that proxies requests to the OpenAI API.
- **Catalog_Editor**: The frontend web application as a whole.
- **Table_View**: The tabular portion of the UI displaying Albums and Tracks.
- **Chat_Panel**: The lower portion of the UI containing the chat history and input window.
- **OpenAI_API_Key**: The secret credential used to authenticate requests to the OpenAI API, stored securely and never exposed to the client.
- **Mock Data**: Pre-populated sample Albums and Tracks loaded at startup to demonstrate the application in a realistic mid-task state.
- **GIPHY_Embed**: A short animated GIF sourced from the GIPHY API, featuring a famous musician, band, or album moment, displayed inline in the Chat_Panel as motivational content.
- **ISRC Code**: International Standard Recording Code — a unique identifier for a track recording.
- **BPM**: Beats Per Minute — a measure of musical tempo.

---

## Requirements

### Requirement 1: Album Table Display and Editing

**User Story:** As a catalog editor, I want to view and edit album records in a tabular format, so that I can manage album metadata efficiently.

#### Acceptance Criteria

1. THE Catalog_Editor SHALL display an Albums table with exactly the following columns in order: AlbumTitle, AlbumArtist, ReleaseDate, RecordLabel, CatalogNumber, EditionType, DiscCount, TrackTotal, AlbumGenre, AlbumMood.
2. WHEN a user clicks on a cell in the Albums table, THE Table_View SHALL set that row as the Active Row and place keyboard focus on the selected cell.
3. WHEN a cell in the Albums table is in focus, THE Table_View SHALL allow the user to type directly into the cell to edit its value.
4. WHEN a user presses Tab or Enter while editing a cell, THE Table_View SHALL move focus to the next editable cell in the row.
5. THE Table_View SHALL highlight the Active Row in the Albums table with a visually distinct style (e.g., background color or border).
6. WHEN a user edits a cell value and moves focus away, THE Catalog_Editor SHALL persist the updated value in the in-memory catalog state.
7. THE Table_View SHALL provide a dropdown selector for the EditionType field with values: Standard, Deluxe, Limited, Remastered, Box Set.
8. THE Table_View SHALL provide a dropdown selector for the AlbumGenre field populated with a predefined list of music genres.
9. THE Table_View SHALL provide a dropdown selector for the AlbumMood field populated with a predefined list of mood descriptors.
10. THE Table_View SHALL validate that DiscCount and TrackTotal contain only positive integers, and IF a non-integer value is entered, THEN THE Table_View SHALL display an inline validation error and revert the cell to its previous value.

---

### Requirement 2: Track Table Display and Editing

**User Story:** As a catalog editor, I want to view and edit track records in a tabular format linked to their albums, so that I can manage detailed track metadata.

#### Acceptance Criteria

1. THE Catalog_Editor SHALL display a Tracks table with exactly the following columns in order: TrackTitle, PrimaryArtist, FeaturedArtists, AlbumName, ReleaseYear, GenreCluster, MoodSignature, TempoBPM, EnergyLevel, ExplicitContentFlag, ProducerCredits, ComposerList, MasteringEngineer, RecordingLocation, ISRCCode, CoverArtPalette, PlaybackGain, ListenerAtmosphere, GeoOrigin, StreamingPriority, WaveformFingerprint, LyricLanguage, VocalStyle, CopyrightHolder, AIGenerationRatio.
2. WHEN a user clicks on a cell in the Tracks table, THE Table_View SHALL set that row as the Active Row and place keyboard focus on the selected cell.
3. WHEN a cell in the Tracks table is in focus, THE Table_View SHALL allow the user to type directly into the cell to edit its value.
4. THE Table_View SHALL provide a dropdown selector for the AlbumName field populated with the AlbumTitle values of all existing Albums in the catalog.
5. WHEN a user selects an AlbumName from the dropdown, THE Catalog_Editor SHALL associate the track with the selected album.
6. THE Table_View SHALL provide a dropdown selector for the ExplicitContentFlag field with values: Clean, Explicit.
7. THE Table_View SHALL provide a dropdown selector for the GenreCluster field populated with a predefined list of music genres.
8. THE Table_View SHALL provide a dropdown selector for the MoodSignature field populated with a predefined list of mood descriptors.
9. THE Table_View SHALL validate that TempoBPM contains only a positive numeric value, and IF a non-numeric value is entered, THEN THE Table_View SHALL display an inline validation error and revert the cell to its previous value.
10. THE Table_View SHALL validate that AIGenerationRatio contains a numeric value between 0 and 100 inclusive, and IF an out-of-range value is entered, THEN THE Table_View SHALL display an inline validation error and revert the cell to its previous value.
11. THE Table_View SHALL validate that ISRCCode matches the format CC-XXX-YY-NNNNN (where CC is a 2-letter country code, XXX is a 3-character registrant, YY is a 2-digit year, and NNNNN is a 5-digit designation), and IF an invalid format is entered, THEN THE Table_View SHALL display an inline validation error.

---

### Requirement 3: Adding a New Track to an Existing Album

**User Story:** As a catalog editor, I want to quickly add a new track to an existing album, so that I can grow the catalog with minimal friction.

#### Acceptance Criteria

1. THE Table_View SHALL provide an "Add Track" button or affordance that creates a new empty row at the bottom of the Tracks table.
2. WHEN a new track row is created, THE Table_View SHALL set the Active Row to the new row and place focus on the TrackTitle cell.
3. WHEN a new track row is created, THE Table_View SHALL pre-populate the AlbumName field with the AlbumTitle of the currently active album, if one is selected.
4. WHEN a user saves a new track row, THE Catalog_Editor SHALL validate that AlbumName references an existing album, and IF no matching album exists, THEN THE Catalog_Editor SHALL display an error message and prevent saving.
5. WHEN a user saves a new track row, THE Catalog_Editor SHALL validate that TrackTitle is not empty, and IF it is empty, THEN THE Catalog_Editor SHALL display an error message and prevent saving.

---

### Requirement 4: Modifying Existing Track Information

**User Story:** As a catalog editor, I want to edit any field of an existing track record, so that I can correct or update catalog metadata.

#### Acceptance Criteria

1. WHEN a user selects an existing track row, THE Table_View SHALL make all cells in that row editable inline.
2. WHEN a user modifies a cell value in an existing track row and commits the change (Tab, Enter, or click away), THE Catalog_Editor SHALL update the in-memory catalog state immediately.
3. THE Catalog_Editor SHALL provide an undo action (Ctrl+Z / Cmd+Z) that reverts the most recent cell edit.
4. WHEN a user changes the AlbumName of an existing track to a different album, THE Catalog_Editor SHALL update the track's album association accordingly.

---

### Requirement 5: Adding a New Album

**User Story:** As a catalog editor, I want to add a new album with at least one track, so that I can introduce new releases into the catalog.

#### Acceptance Criteria

1. THE Table_View SHALL provide an "Add Album" button or affordance that creates a new empty row at the bottom of the Albums table.
2. WHEN a new album row is created, THE Table_View SHALL set the Active Row to the new album row and place focus on the AlbumTitle cell.
3. WHEN a user saves a new album, THE Catalog_Editor SHALL validate that AlbumTitle and CatalogNumber are not empty, and IF either is empty, THEN THE Catalog_Editor SHALL display an error message and prevent saving.
4. WHEN a user saves a new album, THE Catalog_Editor SHALL validate that CatalogNumber is unique across all existing albums, and IF a duplicate is detected, THEN THE Catalog_Editor SHALL display an error message and prevent saving.
5. WHEN a new album is saved successfully, THE Catalog_Editor SHALL prompt the user to add at least one track to the album before the album is considered complete.

---

### Requirement 6: Migrating Tracks Between Albums

**User Story:** As a catalog editor, I want to reassign one or more tracks from one album to another, so that I can correct album associations or reorganize the catalog.

#### Acceptance Criteria

1. WHEN a user changes the AlbumName field of a track to a different existing album, THE Catalog_Editor SHALL reassign the track to the new album.
2. THE Catalog_Editor SHALL allow the user to select multiple track rows and reassign all selected tracks to a chosen album in a single operation.
3. WHEN a bulk reassignment is performed, THE Catalog_Editor SHALL display a confirmation dialog listing the tracks to be moved and the destination album before applying the change.
4. WHEN a bulk reassignment is confirmed, THE Catalog_Editor SHALL update all selected tracks' AlbumName fields to the destination album.
5. WHEN a bulk reassignment is cancelled, THE Catalog_Editor SHALL leave all track records unchanged.

---

### Requirement 7: Split-Pane Layout

**User Story:** As a catalog editor, I want a split-pane interface with tables on top and chat on the bottom, so that I can reference and edit catalog data while conversing with the assistant.

#### Acceptance Criteria

1. THE Catalog_Editor SHALL render the Table_View in the upper portion of the viewport and the Chat_Panel in the lower portion.
2. THE Catalog_Editor SHALL provide a resizable divider between the Table_View and Chat_Panel, allowing the user to adjust the vertical split ratio.
3. WHILE the user is typing in the Chat_Panel input, THE Table_View SHALL remain fully interactive and scrollable.
4. WHILE the user is editing a cell in the Table_View, THE Chat_Panel SHALL remain fully interactive.
5. THE Catalog_Editor SHALL persist the user's preferred split ratio across page reloads using browser local storage.

---

### Requirement 8: Mock Data at Startup

**User Story:** As a new user, I want to see realistic pre-populated catalog data when I first open the app, so that I can understand the expected data format and experience a typical editing session.

#### Acceptance Criteria

1. WHEN the Catalog_Editor loads for the first time with no saved catalog data, THE Catalog_Editor SHALL populate the catalog with mock data containing at least 2 and at most 3 real album records.
2. WHEN the Catalog_Editor loads mock data, THE Catalog_Editor SHALL include at least 3 and at most 5 real track records distributed across the mock albums.
3. THE mock album records SHALL have all required fields (AlbumTitle, AlbumArtist, ReleaseDate, RecordLabel, CatalogNumber) populated with realistic values based on real albums.
4. THE mock track records SHALL have all required fields (TrackTitle, PrimaryArtist, AlbumName, ISRCCode) populated with realistic values based on real tracks.
5. WHEN mock data is loaded, THE Table_View SHALL display the Albums table with one album row selected as the Active Row to simulate a mid-task editing state.

---

### Requirement 9: AI Chat Assistant

**User Story:** As a catalog editor, I want an AI chat assistant that understands music metadata, so that I can get contextual help filling out catalog fields.

#### Acceptance Criteria

1. THE Chat_Panel SHALL display a scrollable chat history showing alternating user and assistant messages.
2. THE Chat_Panel SHALL provide a text input field and a send button for the user to submit messages.
3. WHEN a user submits a message, THE Chat_Panel SHALL display the message in the chat history and send it to the AI_Service.
4. WHEN the AI_Service returns a response, THE Chat_Panel SHALL append the response to the chat history and scroll to the latest message.
5. THE AI_Service SHALL include a system prompt that defines the assistant's personality as friendly, encouraging, and knowledgeable about music history, genres, production, and metadata standards.
6. THE AI_Service SHALL include schema rules in the system prompt describing all Album and Track fields, their data types, valid values, and formatting requirements.
7. WHEN a contextually appropriate moment occurs during the session (such as completing an album, adding a notable track, or referencing a famous artist), THE Chat_Panel SHALL display a GIPHY_Embed sourced from the GIPHY API featuring a relevant famous musician, band, or album.
8. WHEN the AI_Service is unavailable or returns an error, THE Chat_Panel SHALL display a user-friendly error message and allow the user to retry.
9. WHILE the AI_Service is processing a response, THE Chat_Panel SHALL display a loading indicator.

---

### Requirement 10: OpenAI API Key Security

**User Story:** As a developer deploying this app, I want the OpenAI API key to be handled securely, so that it is never exposed in client-side code or version control.

#### Acceptance Criteria

1. THE AI_Service SHALL read the OpenAI API key exclusively from a server-side environment variable and SHALL NOT expose the key to the client.
2. THE Catalog_Editor SHALL NOT include the OpenAI API key in any client-side JavaScript bundle, HTML, or network response.
3. THE AI_Service SHALL be configured so that the OpenAI API key environment variable name is documented in a `.env.example` file committed to version control, while the actual key value is stored in a `.env` file that is listed in `.gitignore`.
4. WHEN deploying to Google Cloud, THE AI_Service SHALL read the OpenAI API key from a Google Cloud Secret Manager secret or an environment variable injected at deploy time, and SHALL NOT store the key in the container image or source repository.
5. THE AI_Service SHALL reject any client request that attempts to supply or override the OpenAI API key.

---

### Requirement 11: Data Persistence

**User Story:** As a catalog editor, I want my catalog edits to be saved between sessions and exportable as a file, so that I don't lose work when I close or refresh the browser and can share or attach the catalog to external workflows.

#### Acceptance Criteria

1. THE Catalog_Editor SHALL persist the full catalog state (all Albums and Tracks) to browser local storage after every edit operation.
2. WHEN the Catalog_Editor loads and saved catalog data exists in local storage, THE Catalog_Editor SHALL restore the catalog from local storage instead of loading mock data.
3. THE Catalog_Editor SHALL provide an "Export" action that downloads the current catalog as a JSON file to the user's local disc.
4. THE Catalog_Editor SHALL provide an "Import" action that loads catalog data from a user-selected JSON file, replacing the current in-memory catalog state after user confirmation.
5. WHEN an imported JSON file does not conform to the expected catalog schema, THE Catalog_Editor SHALL display a descriptive error message and leave the existing catalog state unchanged.
