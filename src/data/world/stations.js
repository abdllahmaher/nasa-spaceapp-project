import solarArrayUrl from "../../assets/props/solar_panels.png";
import oxygenStationUrl from "../../assets/props/oxygen_station.png";
import habitatDomeUrl from "../../assets/props/habitat_dome.png";

/**
 * Unique outpost stations. `repeat` and `mirror` are off so each interactive
 * target exists exactly once and never gets a duplicate in the mirrored world.
 *
 * `x` is a fraction of the world repeat period. The three stations are spaced
 * out so none of them crowds the lander or each other. The power station is
 * the widest: a solar array plus inverter cabinet.
 */
export const OUTPOST_STATIONS = [
  {
    id: "power-junction",
    // A small solar power station: two rows of panels wired into a bus bar
    // and an inverter cabinet, instead of a single lonely panel.
    sprite: { src: solarArrayUrl },
    x: 0.2995,
    y: 484,
    scale: 1,
    repeat: false,
    mirror: false,
    blocking: true,
    footR: 90,
    shadow: true,
    // Kai stands clear of the wide array while he bolts it together.
    approach: 142,
    workOffset: 96,
    behavior: { type: "station", config: { seconds: 2.0 } },
    interactive: {
      kind: "inspect",
      targetId: "power_junction",
      label: "Inspect power",
    },
  },
  {
    id: "life-support",
    sprite: { src: oxygenStationUrl },
    x: 0.3544,
    y: 484,
    scale: 1.15,
    repeat: false,
    mirror: false,
    blocking: false,
    footR: 30,
    shadow: true,
    behavior: { type: "station", config: { seconds: 2.0 } },
    interactive: {
      kind: "inspect",
      targetId: "life_support",
      label: "Check life support",
    },
  },
  {
    id: "habitat-dome",
    sprite: { src: habitatDomeUrl },
    x: 0.4123,
    y: 487,
    scale: 1.25,
    repeat: false,
    mirror: false,
    blocking: false,
    footR: 58,
    shadow: true,
    behavior: { type: "station", config: { seconds: 2.0 } },
    interactive: {
      kind: "inspect",
      targetId: "habitat",
      label: "Inspect habitat",
    },
  },
];
