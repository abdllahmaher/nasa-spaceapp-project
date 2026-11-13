const SAVE_KEY = "mars-outpost-mission-v2";

export function saveGame(state) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {
    // Private browsing or storage disabled: the game still works in-memory.
  }
}

export function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      typeof parsed?.day !== "number" ||
      typeof parsed?.resources !== "object" ||
      typeof parsed?.crew !== "object"
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearGame() {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    // Ignore unavailable storage.
  }
}
