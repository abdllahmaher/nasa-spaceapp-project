import lyra from "../assets/characters/lyra_spritesheet.png";
import kai from "../assets/characters/kai_spritesheet.png";
import nova from "../assets/characters/nova_spritesheet.png";
import rex from "../assets/characters/rex_spritesheet.png";

/**
 * Portrait sheets for the dialogue bubbles. Each sheet is an 8×7 grid of
 * 128px frames; the UI shows frame 0 with pixelated scaling.
 */
export const PORTRAITS = {
  layla: { name: "Layla", role: "Commander", src: lyra, accent: "#ff9ecb" },
  kai: { name: "Kai", role: "Engineer", src: kai, accent: "#ffb066" },
  nova: { name: "Nova", role: "Air & Water", src: nova, accent: "#8ff0d0" },
  rex: { name: "Rex", role: "Science", src: rex, accent: "#c3a6ff" },
};
