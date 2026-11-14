import launchUrl from "../../assets/rocket/rocket_launch_spritesheet.png";
import launchSheet from "../../assets/rocket/rocket_launch_spritesheet.json";
import landedUrl from "../../assets/rocket/rocket_landed_spritesheet.png";
import landedSheet from "../../assets/rocket/rocket_landed_spritesheet.json";
import padUrl from "../../assets/props/landing_pad.png";

function buildFrames(sheet, prefix, count) {
  return Array.from({ length: count }, (_, i) => {
    const name = `${prefix}_${i}`;
    return { name, ...sheet.frames[name].frame };
  });
}

/**
 * The launch frames are 512px tall and include the exhaust below the body;
 * anchoring them at 0.75 keeps the hull on the same ground line as the
 * 384px landed frames, so touchdown doesn't pop.
 */
export const ROCKET_ENTITIES = [
  {
    id: "landing-pad",
    sprite: { src: padUrl },
    x: 0.245,
    y: 499,
    scale: 0.75,
    repeat: false,
    mirror: false,
    blocking: false,
  },
  {
    id: "arrival-rocket",
    sprite: {
      clips: {
        launch: {
          src: launchUrl,
          frames: buildFrames(launchSheet, "launch", 6),
          anchor: 384 / 512,
        },
        landed: {
          src: landedUrl,
          frames: buildFrames(landedSheet, "landed_idle", 6),
          anchor: 1,
        },
      },
    },
    x: 0.245,
    y: 500,
    scale: 0.5,
    repeat: false,
    mirror: false,
    blocking: false,
    footR: 46,
    interactive: {
      kind: "inspect",
      targetId: "rocket",
      label: "Inspect lander",
    },
    shadow: true,
    behavior: {
       type: "rocket",
      config: {
        fps: 12,
        descentSeconds: 4.5,
        startOffsetY: -560,
        startScale: 0.35,
      },
    },
  },
];
