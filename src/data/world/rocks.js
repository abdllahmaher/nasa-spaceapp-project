import rockMiddleUrl from "../../assets/world/rock-middle.png";

// The rock band in rock-middle.png is split into four non-overlapping slices.
// Source frames are in the original 5265x980 panorama space; `scale` is the
// factor that maps that art onto the 540px-tall canvas.
const SOURCE = rockMiddleUrl;
const SCALE = 540 / 980;

/**
 * Rocks are ordinary blocking entities. `x` is a fraction of the world repeat
 * period (two panorama tiles), `y` is the ground contact line, and `mirror`
 * adds the flipped copy at 1 - x so the endless mirrored world stays rocky.
 */
export const ROCKS = [
  {
    id: "rock-left-small",
    sprite: { src: SOURCE, bleed: 2, frame: { x: 987, y: 693, w: 190, h: 107 } },
    x: 0.1028,
    y: 441,
    scale: SCALE/2,
    perspective: false,
    mirror: true,
    blocking: true,
    footR: 42,
  },
  {
    id: "rock-left-mound",
    sprite: { src: SOURCE, bleed: 2, frame: { x: 1177, y: 620, w: 450, h: 235 } },
    x: 0.1332,
    y: 471,
    scale: SCALE,
    perspective: false,
    mirror: true,
    blocking: true,
    footR: 90,
  },
  {
    id: "rock-middle-shelf",
    sprite: { src: SOURCE, bleed: 2, frame: { x: 1627, y: 709, w: 290, h: 143 } },
    x: 0.1683,
    y: 470,
    scale: SCALE,
    perspective: false,
    mirror: true,
    blocking: true,
    footR: 58,
  },
  {
    id: "rock-right-mound",
    sprite: { src: SOURCE, bleed: 2, frame: { x: 1917, y: 620, w: 400, h: 235 } },
    x: 0.2011,
    y: 471,
    scale: SCALE,
    perspective: false,
    mirror: true,
    blocking: true,
    footR: 85,
  },
  {
    id: "rock-right-moundd",
    sprite: { src: SOURCE, bleed: 2, frame: { x: 1917, y: 620, w: 400, h: 235 } },
    x: 0.2011,
    y: 471,
    scale: SCALE,
    perspective: false,
    mirror: true,
    blocking: true,
    footR: 85,
  },
];
