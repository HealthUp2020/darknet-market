// ---- NIGHT MARKET — save/resume persistence (no DOM) ----
// The game state is plain JSON-serializable data, so a match can be saved to localStorage
// and resumed on reload. This module holds the key + the (pure, testable) validity check;
// game.js does the actual localStorage read/write.

export const SAVE_KEY = "nm-save-v1";

// A saved blob is resumable only if it's a well-formed, still-in-progress match:
// 4 players, a match object that isn't over, and the core round fields present.
export function isResumable(s) {
  return !!s
    && Array.isArray(s.players) && s.players.length === 4
    && !!s.match && s.match.matchOver === false
    && Array.isArray(s.market)
    && Array.isArray(s.deck)
    && !!s.tokens
    && typeof s.turnIndex === "number"
    && s.gameOver !== undefined;
}

// Parse a raw localStorage string into a resumable state, or null if absent/invalid/corrupt.
export function parseSave(raw) {
  if (!raw) return null;
  try {
    const s = JSON.parse(raw);
    return isResumable(s) ? s : null;
  } catch {
    return null;
  }
}
