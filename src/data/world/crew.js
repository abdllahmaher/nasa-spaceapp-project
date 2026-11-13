import kaiUrl from "../../assets/characters/kai_spritesheet.png";
import kaiSheet from "../../assets/characters/kai_spritesheet.json";
import novaUrl from "../../assets/characters/nova_spritesheet.png";
import novaSheet from "../../assets/characters/nova_spritesheet.json";
import rexUrl from "../../assets/characters/rex_spritesheet.png";
import rexSheet from "../../assets/characters/rex_spritesheet.json";

function buildFrames(sheet, prefix, count) {
  return Array.from({ length: count }, (_, i) => sheet.frames[`${prefix}_${i}`].frame);
}

function crewEntity({ id, name, x, src, sheet }) {
  return {
    id,
    sprite: {
      clips: {
        idle: {
          src,
          frames: buildFrames(sheet, "idle", 8),
          anchor: 1,
        },
      },
    },
    x,
    y: 492,
    scale: 0.68,
    repeat: false,
    mirror: false,
    blocking: false,
    footR: 18,
    shadow: true,
    interactive: {
      kind: "talk",
      targetId: id,
      label: `Talk to ${name}`,
    },
    behavior: {
      type: "idle",
      config: { fps: 6 },
    },
  };
}

/** The three specialists, spaced far enough apart for distinct E prompts. */
export const CREW_ENTITIES = [
  crewEntity({ id: "kai", name: "Kai", x: 0.28, src: kaiUrl, sheet: kaiSheet }),
  crewEntity({ id: "nova", name: "Nova", x: 0.316, src: novaUrl, sheet: novaSheet }),
  crewEntity({ id: "rex", name: "Rex", x: 0.352, src: rexUrl, sheet: rexSheet }),
];
