import laylaUrl from "../assets/characters/lyra_spritesheet.png";
import laylaSheet from "../assets/characters/lyra_spritesheet.json";
import kaiUrl from "../assets/characters/kai_spritesheet.png";
import kaiSheet from "../assets/characters/kai_spritesheet.json";
import novaUrl from "../assets/characters/nova_spritesheet.png";
import novaSheet from "../assets/characters/nova_spritesheet.json";
import rexUrl from "../assets/characters/rex_spritesheet.png";
import rexSheet from "../assets/characters/rex_spritesheet.json";

/**
 * Portrait art for the dialogue bubbles.
 *
 * Every portrait is cut straight out of a character sprite sheet. A sheet is
 * an 8x7 grid of 128px cells; the character's "ideal state" is its `idle`
 * loop, so the portrait plays those eight frames.
 *
 * The frame list comes from the sheet's own JSON metadata, the same source
 * the in-game characters use, so the portrait and the walking crew always
 * animate identically.
 *
 * `box` is the opaque bounding box of the character across the whole loop.
 * It is the crop window for every frame, so the empty padding is trimmed
 * away and the sheet background is never shown.
 */

const POSE = "idle";
const POSE_FRAMES = 8;
// Same idle speed the player and the crew use in game.
const POSE_FPS = 6;

function portrait(name, role, accent, src, sheet, box) {
  return {
    name,
    role,
    accent,
    src,
    // Size of the whole sprite sheet.
    sheet: sheet.meta.size,
    // The "ideal state" loop: the character's idle frames.
    clip: Array.from({ length: POSE_FRAMES }, (_, i) => sheet.frames[`${POSE}_${i}`].frame),
    fps: POSE_FPS,
    // Character bounding box inside a frame, used as the crop window.
    box,
  };
}

export const PORTRAITS = {
  layla: portrait("Layla", "Commander", "#ff9ecb", laylaUrl, laylaSheet, {
    x: 32,
    y: 28,
    w: 58,
    h: 97,
  }),
  kai: portrait("Kai", "Engineer", "#ffb066", kaiUrl, kaiSheet, {
    x: 38,
    y: 28,
    w: 52,
    h: 97,
  }),
  nova: portrait("Nova", "Air & Water", "#8ff0d0", novaUrl, novaSheet, {
    x: 34,
    y: 28,
    w: 56,
    h: 97,
  }),
  rex: portrait("Rex", "Science", "#c3a6ff", rexUrl, rexSheet, {
    x: 38,
    y: 28,
    w: 52,
    h: 97,
  }),
};
