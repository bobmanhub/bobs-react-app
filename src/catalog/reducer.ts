import type { Album, CatalogState, Track, UndoEntry } from './types';

// ---------------------------------------------------------------------------
// Action types
// ---------------------------------------------------------------------------

export type CatalogAction =
  | {
      type: 'SET_CELL';
      entityType: 'album' | 'track';
      entityId: string;
      field: string;
      value: string;
    }
  | { type: 'ADD_ALBUM' }
  | { type: 'ADD_TRACK' }
  | { type: 'DELETE_ALBUM'; albumId: string }
  | { type: 'DELETE_TRACK'; trackId: string }
  | { type: 'BULK_REASSIGN'; destinationAlbumTitle: string }
  | { type: 'UNDO' }
  | { type: 'LOAD_CATALOG'; albums: Album[]; tracks: Track[] }
  | { type: 'SET_ACTIVE_ALBUM'; albumId: string | null }
  | { type: 'SET_ACTIVE_TRACK'; trackId: string | null }
  | { type: 'SET_SELECTED_TRACKS'; trackId: string; selected: boolean }
  | { type: 'SET_SPLIT_RATIO'; ratio: number };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const UNDO_STACK_LIMIT = 50;

export function generateId(): string {
  return crypto.randomUUID();
}

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

export const initialCatalogState: CatalogState = {
  albums: [],
  tracks: [],
  activeAlbumId: null,
  activeTrackId: null,
  selectedTrackIds: new Set<string>(),
  undoStack: [],
  splitRatio: 0.5,
};

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

export function catalogReducer(
  state: CatalogState,
  action: CatalogAction,
): CatalogState {
  switch (action.type) {
    case 'SET_CELL': {
      const { entityType, entityId, field, value } = action;

      if (entityType === 'album') {
        const albumIndex = state.albums.findIndex((a) => a.id === entityId);
        if (albumIndex === -1) return state;

        const previousValue = (state.albums[albumIndex] as Record<string, string>)[field] ?? '';

        const undoEntry: UndoEntry = {
          type: 'cell_edit',
          entityType: 'album',
          entityId,
          field,
          previousValue,
        };

        const updatedAlbum = {
          ...state.albums[albumIndex],
          [field]: value,
        };

        const updatedAlbums = [
          ...state.albums.slice(0, albumIndex),
          updatedAlbum,
          ...state.albums.slice(albumIndex + 1),
        ];

        const newUndoStack = [
          undoEntry,
          ...state.undoStack,
        ].slice(0, UNDO_STACK_LIMIT);

        return { ...state, albums: updatedAlbums, undoStack: newUndoStack };
      } else {
        // entityType === 'track'
        const trackIndex = state.tracks.findIndex((t) => t.id === entityId);
        if (trackIndex === -1) return state;

        const previousValue = (state.tracks[trackIndex] as Record<string, string>)[field] ?? '';

        const undoEntry: UndoEntry = {
          type: 'cell_edit',
          entityType: 'track',
          entityId,
          field,
          previousValue,
        };

        const updatedTrack = {
          ...state.tracks[trackIndex],
          [field]: value,
        };

        const updatedTracks = [
          ...state.tracks.slice(0, trackIndex),
          updatedTrack,
          ...state.tracks.slice(trackIndex + 1),
        ];

        const newUndoStack = [
          undoEntry,
          ...state.undoStack,
        ].slice(0, UNDO_STACK_LIMIT);

        return { ...state, tracks: updatedTracks, undoStack: newUndoStack };
      }
    }

    case 'ADD_ALBUM': {
      const newAlbum: Album = {
        id: generateId(),
        AlbumTitle: '',
        AlbumArtist: '',
        ReleaseDate: '',
        RecordLabel: '',
        CatalogNumber: '',
        EditionType: '',
        DiscCount: '',
        TrackTotal: '',
        AlbumGenre: '',
        AlbumMood: '',
      };

      return {
        ...state,
        albums: [...state.albums, newAlbum],
        activeAlbumId: newAlbum.id,
      };
    }

    case 'ADD_TRACK': {
      // Pre-populate AlbumName from the active album's AlbumTitle if available
      let albumName = '';
      if (state.activeAlbumId !== null) {
        const activeAlbum = state.albums.find((a) => a.id === state.activeAlbumId);
        if (activeAlbum) {
          albumName = activeAlbum.AlbumTitle;
        }
      }

      const newTrack: Track = {
        id: generateId(),
        TrackTitle: '',
        PrimaryArtist: '',
        FeaturedArtists: '',
        AlbumName: albumName,
        ReleaseYear: '',
        GenreCluster: '',
        MoodSignature: '',
        TempoBPM: '',
        EnergyLevel: '',
        ExplicitContentFlag: '',
        ProducerCredits: '',
        ComposerList: '',
        MasteringEngineer: '',
        RecordingLocation: '',
        ISRCCode: '',
        CoverArtPalette: '',
        PlaybackGain: '',
        ListenerAtmosphere: '',
        GeoOrigin: '',
        StreamingPriority: '',
        WaveformFingerprint: '',
        LyricLanguage: '',
        VocalStyle: '',
        CopyrightHolder: '',
        AIGenerationRatio: '',
      };

      return {
        ...state,
        tracks: [...state.tracks, newTrack],
        activeTrackId: newTrack.id,
      };
    }

    case 'DELETE_ALBUM': {
      return {
        ...state,
        albums: state.albums.filter((a) => a.id !== action.albumId),
      };
    }

    case 'DELETE_TRACK': {
      return {
        ...state,
        tracks: state.tracks.filter((t) => t.id !== action.trackId),
      };
    }

    case 'BULK_REASSIGN': {
      const { destinationAlbumTitle } = action;
      const updatedTracks = state.tracks.map((track) => {
        if (state.selectedTrackIds.has(track.id)) {
          return { ...track, AlbumName: destinationAlbumTitle };
        }
        return track;
      });

      return {
        ...state,
        tracks: updatedTracks,
        selectedTrackIds: new Set<string>(),
      };
    }

    case 'UNDO': {
      if (state.undoStack.length === 0) return state;

      const [topEntry, ...remainingStack] = state.undoStack;
      const { entityType, entityId, field, previousValue } = topEntry;

      if (entityType === 'album') {
        const albumIndex = state.albums.findIndex((a) => a.id === entityId);
        if (albumIndex === -1) return { ...state, undoStack: remainingStack };

        const restoredAlbum = {
          ...state.albums[albumIndex],
          [field]: previousValue,
        };

        const updatedAlbums = [
          ...state.albums.slice(0, albumIndex),
          restoredAlbum,
          ...state.albums.slice(albumIndex + 1),
        ];

        return { ...state, albums: updatedAlbums, undoStack: remainingStack };
      } else {
        // entityType === 'track'
        const trackIndex = state.tracks.findIndex((t) => t.id === entityId);
        if (trackIndex === -1) return { ...state, undoStack: remainingStack };

        const restoredTrack = {
          ...state.tracks[trackIndex],
          [field]: previousValue,
        };

        const updatedTracks = [
          ...state.tracks.slice(0, trackIndex),
          restoredTrack,
          ...state.tracks.slice(trackIndex + 1),
        ];

        return { ...state, tracks: updatedTracks, undoStack: remainingStack };
      }
    }

    case 'LOAD_CATALOG': {
      return {
        ...state,
        albums: action.albums,
        tracks: action.tracks,
        undoStack: [],
        selectedTrackIds: new Set<string>(),
        activeAlbumId: null,
        activeTrackId: null,
      };
    }

    case 'SET_ACTIVE_ALBUM': {
      return { ...state, activeAlbumId: action.albumId };
    }

    case 'SET_ACTIVE_TRACK': {
      return { ...state, activeTrackId: action.trackId };
    }

    case 'SET_SELECTED_TRACKS': {
      const newSelected = new Set(state.selectedTrackIds);
      if (action.selected) {
        newSelected.add(action.trackId);
      } else {
        newSelected.delete(action.trackId);
      }
      return { ...state, selectedTrackIds: newSelected };
    }

    case 'SET_SPLIT_RATIO': {
      return { ...state, splitRatio: action.ratio };
    }

    default: {
      // Exhaustive check — TypeScript will error if a case is missing
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}
