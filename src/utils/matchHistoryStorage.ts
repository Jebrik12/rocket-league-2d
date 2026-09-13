// IndexedDB Storage Utility for Rocket League Match History & Replays

export interface MatchPlayerStats {
  id: string;
  name: string;
  team: "blue" | "orange";
  isBot: boolean;
  carModel: string;
  score: number;
  goals: number;
  saves: number;
  shots: number;
  demos: number;
}

export interface MatchHistoryMetadata {
  id: string;
  timestamp: number;
  dateStr: string;
  gameMode: string;
  arenaId: string;
  arenaName: string;
  blueScore: number;
  orangeScore: number;
  winnerTeam: "blue" | "orange" | "draw";
  isOvertime: boolean;
  durationSec: number;
  mvp: {
    name: string;
    team: "blue" | "orange";
    score: number;
  };
  players: MatchPlayerStats[];
  frameCount: number;
}

export interface MatchReplayData {
  id: string;
  metadata: MatchHistoryMetadata;
  frames: any[];
  matchEvents: any[];
}

const DB_NAME = "RocketLeagueReplaysDB";
const DB_VERSION = 1;
const STORE_MATCHES = "matches";
const STORE_REPLAYS = "replays";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is not supported in this browser"));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_MATCHES)) {
        db.createObjectStore(STORE_MATCHES, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORE_REPLAYS)) {
        db.createObjectStore(STORE_REPLAYS, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Subsamples frames if necessary to keep replay storage lightweight and high performance.
 * Replay interpolation maintains butter-smooth playback regardless of recording sample rate.
 */
function subsampleFrames(frames: any[], targetIntervalMs = 32): any[] {
  if (!frames || frames.length <= 60) return frames;
  const result: any[] = [];
  let lastTime = -Infinity;
  for (let i = 0; i < frames.length; i++) {
    const f = frames[i];
    if (i === 0 || i === frames.length - 1 || f.time - lastTime >= targetIntervalMs) {
      result.push(f);
      lastTime = f.time;
    }
  }
  return result;
}

/**
 * Saves a completed match to IndexedDB (both metadata list and full replay snapshots).
 */
export async function saveMatchToHistory(
  meta: MatchHistoryMetadata,
  replayFrames: any[],
  matchEvents: any[]
): Promise<void> {
  try {
    const db = await openDB();
    const cleanFrames = subsampleFrames(replayFrames, 32); // ~30 fps snapshots
    meta.frameCount = cleanFrames.length;

    const replayData: MatchReplayData = {
      id: meta.id,
      metadata: meta,
      frames: cleanFrames,
      matchEvents: matchEvents ? [...matchEvents] : []
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_MATCHES, STORE_REPLAYS], "readwrite");
      tx.objectStore(STORE_MATCHES).put(meta);
      tx.objectStore(STORE_REPLAYS).put(replayData);

      tx.oncomplete = () => {
        // Also keep a lightweight fallback list in localStorage for instant header badge
        try {
          const raw = localStorage.getItem("rl_matches_cache");
          const list: MatchHistoryMetadata[] = raw ? JSON.parse(raw) : [];
          const updated = [meta, ...list.filter(m => m.id !== meta.id)].slice(0, 30);
          localStorage.setItem("rl_matches_cache", JSON.stringify(updated));
        } catch (e) {}
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn("Could not save replay to IndexedDB:", err);
  }
}

/**
 * Returns the list of all saved matches (sorted newest first).
 */
export async function getMatchHistoryList(): Promise<MatchHistoryMetadata[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_MATCHES, "readonly");
      const req = tx.objectStore(STORE_MATCHES).getAll();
      req.onsuccess = () => {
        const matches: MatchHistoryMetadata[] = req.result || [];
        matches.sort((a, b) => b.timestamp - a.timestamp);
        resolve(matches);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    try {
      const raw = localStorage.getItem("rl_matches_cache");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
}

/**
 * Retrieves the full replay snapshot data for a specific match ID.
 */
export async function getMatchReplay(matchId: string): Promise<MatchReplayData | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_REPLAYS, "readonly");
      const req = tx.objectStore(STORE_REPLAYS).get(matchId);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.warn("Failed to load match replay from IndexedDB:", e);
    return null;
  }
}

/**
 * Deletes a match and its replay from storage.
 */
export async function deleteMatchFromHistory(matchId: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_MATCHES, STORE_REPLAYS], "readwrite");
      tx.objectStore(STORE_MATCHES).delete(matchId);
      tx.objectStore(STORE_REPLAYS).delete(matchId);
      tx.oncomplete = () => {
        try {
          const raw = localStorage.getItem("rl_matches_cache");
          if (raw) {
            const list: MatchHistoryMetadata[] = JSON.parse(raw);
            const updated = list.filter(m => m.id !== matchId);
            localStorage.setItem("rl_matches_cache", JSON.stringify(updated));
          }
        } catch (e) {}
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    console.warn("Failed to delete match from IndexedDB:", e);
  }
}

/**
 * Clears all match history and stored replays.
 */
export async function clearAllMatchHistory(): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_MATCHES, STORE_REPLAYS], "readwrite");
      tx.objectStore(STORE_MATCHES).clear();
      tx.objectStore(STORE_REPLAYS).clear();
      tx.oncomplete = () => {
        try { localStorage.removeItem("rl_matches_cache"); } catch (e) {}
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {}
}
