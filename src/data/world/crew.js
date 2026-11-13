import kaiUrl from "../../assets/characters/kai_spritesheet.png";
import kaiSheet from "../../assets/characters/kai_spritesheet.json";
import novaUrl from "../../assets/characters/nova_spritesheet.png";
import novaSheet from "../../assets/characters/nova_spritesheet.json";
import rexUrl from "../../assets/characters/rex_spritesheet.png";
import rexSheet from "../../assets/characters/rex_spritesheet.json";

function buildFrames(sheet, prefix, count) {
  return Array.from({ length: count }, (_, i) => sheet.frames[`${prefix}_${i}`].frame);
}

function crewEntity({ id, name, x, homeX, stationId, src, sheet }) {
  return {
    id,
    sprite: {
      clips: {
        idle: { src, frames: buildFrames(sheet, "idle", 8), anchor: 1 },
        walk: { src, frames: buildFrames(sheet, "walk", 8), anchor: 1 },
        mine: { src, frames: buildFrames(sheet, "mine", 8), anchor: 1 },
      },
    },
    x,
    homeX,
    stationId,
    y: 492,
    scale: 0.72,
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
      type: "crew",
      // Crew ride down inside the lander, then step out to build.
      config: { speed: 200, hidden: true },
    },
  };
}

/**
 * The three specialists wait inside the lander with the outpost parts. After
 * touchdown they step out and each one assembles their own station.
 *
 * `homeX` is where a crew member waits between jobs: right beside their own
 * station, so nobody is left standing out in the open away from the machine
 * they are looking after.
 */
export const CREW_ENTITIES = [
  crewEntity({
    id: "kai",
    name: "Kai",
    x: 0.2445,
    homeX: 0.2854,
    stationId: "power-junction",
    src: kaiUrl,
    sheet: kaiSheet,
  }),
  crewEntity({
    id: "nova",
    name: "Nova",
    x: 0.2455,
    homeX: 0.3423,
    stationId: "life-support",
    src: novaUrl,
    sheet: novaSheet,
  }),
  crewEntity({
    id: "rex",
    name: "Rex",
    x: 0.2465,
    homeX: 0.4002,
    stationId: "habitat-dome",
    src: rexUrl,
    sheet: rexSheet,
  }),
];
