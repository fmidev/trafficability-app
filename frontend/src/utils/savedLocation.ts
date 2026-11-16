import { Position } from "../types";

// Remembers the observation location the user picked by moving the map, so that
// after a reload (e.g. the automatic reload after a submit) the map continues
// from the same spot instead of jumping back to the GPS position.
//
// Stored in localStorage rather than a cookie: cookies travel to the server with
// every request, and a location has no reason to leave the browser.

const STORAGE_KEY = "traff_adjusted_location";
const MAX_AGE_MS = 12 * 60 * 60 * 1000; // forget the picked spot after 12 hours

interface StoredLocation {
  lat: number;
  lon: number;
  savedAt: number;
}

export const saveAdjustedLocation = (position: Position) => {
  if (position.lat === null || position.lon === null) return;
  const value: StoredLocation = {
    lat: position.lat,
    lon: position.lon,
    savedAt: Date.now(),
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    /* storage unavailable (private mode etc.); nothing to do */
  }
};

export const clearAdjustedLocation = () => {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage unavailable */
  }
};

export const loadAdjustedLocation = (): Position | null => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const stored = JSON.parse(raw) as StoredLocation;
    if (
      typeof stored.lat !== "number" ||
      typeof stored.lon !== "number" ||
      typeof stored.savedAt !== "number" ||
      Date.now() - stored.savedAt > MAX_AGE_MS
    ) {
      clearAdjustedLocation();
      return null;
    }
    return { lat: stored.lat, lon: stored.lon };
  } catch {
    return null;
  }
};