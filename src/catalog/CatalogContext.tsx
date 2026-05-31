import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from 'react';
import type { CatalogState } from './types';
import type { CatalogAction } from './reducer';
import { catalogReducer, initialCatalogState } from './reducer';
import {
  loadCatalogFromStorage,
  saveCatalogToStorage,
  loadSplitRatioFromStorage,
  saveSplitRatioToStorage,
} from './persistence';
import { MOCK_ALBUMS, MOCK_TRACKS } from './mockData';

// ---------------------------------------------------------------------------
// Context shape
// ---------------------------------------------------------------------------

interface CatalogContextValue {
  state: CatalogState;
  dispatch: React.Dispatch<CatalogAction>;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

export const CatalogContext = createContext<CatalogContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(catalogReducer, initialCatalogState);

  // On mount: load from localStorage or fall back to mock data
  useEffect(() => {
    const persisted = loadCatalogFromStorage();

    if (persisted !== null) {
      dispatch({ type: 'LOAD_CATALOG', albums: persisted.albums, tracks: persisted.tracks });

      if (persisted.albums.length > 0) {
        dispatch({ type: 'SET_ACTIVE_ALBUM', albumId: persisted.albums[0].id });
      }

      const savedRatio = loadSplitRatioFromStorage();
      if (savedRatio !== null) {
        dispatch({ type: 'SET_SPLIT_RATIO', ratio: savedRatio });
      }
    } else {
      dispatch({ type: 'LOAD_CATALOG', albums: MOCK_ALBUMS, tracks: MOCK_TRACKS });

      if (MOCK_ALBUMS.length > 0) {
        dispatch({ type: 'SET_ACTIVE_ALBUM', albumId: MOCK_ALBUMS[0].id });
      }
    }
  }, []);

  // Persist albums/tracks whenever they change
  useEffect(() => {
    saveCatalogToStorage(state.albums, state.tracks);
  }, [state.albums, state.tracks]);

  // Persist split ratio whenever it changes
  useEffect(() => {
    saveSplitRatioToStorage(state.splitRatio);
  }, [state.splitRatio]);

  // Global Ctrl+Z / Cmd+Z → UNDO
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        dispatch({ type: 'UNDO' });
      }
    },
    [],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const value: CatalogContextValue = { state, dispatch };

  return (
    <CatalogContext.Provider value={value}>
      {children}
    </CatalogContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useCatalog(): CatalogContextValue {
  const ctx = useContext(CatalogContext);
  if (ctx === null) {
    throw new Error('useCatalog must be used within a CatalogProvider');
  }
  return ctx;
}
