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

/**
 * PIP has no sprite sheet — he is a machine, so his portrait is drawn as a
 * two-frame SVG (open eye, blink). Same contract as the crew: a source image,
 * a clip of frame rectangles and a crop box.
 */
function dronePortrait(blink) {
  const eye = blink
    ? '<rect x="48" y="54" width="32" height="6" rx="3" fill="#2a1730"/><rect x="52" y="55" width="24" height="4" rx="2" fill="#7ee0ff"/>'
    : '<rect x="46" y="46" width="36" height="22" rx="11" fill="#2a1730"/><rect x="52" y="51" width="24" height="12" rx="6" fill="#7ee0ff"/>';
  return `<g>
    <rect x="12" y="12" width="40" height="8" rx="4" fill="#ffd166" stroke="#2a1730" stroke-width="4"/>
    <rect x="76" y="12" width="40" height="8" rx="4" fill="#ffd166" stroke="#2a1730" stroke-width="4"/>
    <rect x="58" y="18" width="12" height="14" fill="#2a1730"/>
    <rect x="24" y="30" width="80" height="62" rx="20" fill="#f5f0ff" stroke="#2a1730" stroke-width="5"/>
    <rect x="30" y="82" width="68" height="8" rx="4" fill="#cbb8e6"/>
    ${eye}
    <rect x="54" y="76" width="20" height="6" rx="3" fill="#2a1730"/>
    <rect x="38" y="92" width="8" height="14" rx="3" fill="#2a1730"/>
    <rect x="82" y="92" width="8" height="14" rx="3" fill="#2a1730"/>
  </g>`;
}

const DRONE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="128" viewBox="0 0 256 128">${dronePortrait(false)}<g transform="translate(128,0)">${dronePortrait(true)}</g></svg>`;
const DRONE_SRC = `data:image/svg+xml;utf8,${encodeURIComponent(DRONE_SVG)}`;

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
  drone: {
    name: "PIP",
    role: "Outpost Drone",
    accent: "#7ee0ff",
    src: DRONE_SRC,
    sheet: { w: 256, h: 128 },
    clip: [
      { x: 0, y: 0, w: 128, h: 128 },
      { x: 128, y: 0, w: 128, h: 128 },
    ],
    box: { x: 6, y: 6, w: 116, h: 116 },
    fps: 2,
  },
};
