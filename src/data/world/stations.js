import solarPanelUrl from "../../assets/props/solar_panel.png";
import oxygenStationUrl from "../../assets/props/oxygen_station.png";
import habitatDomeUrl from "../../assets/props/habitat_dome.png";

/**
 * Unique outpost stations. `repeat` and `mirror` are off so each interactive
 * target exists exactly once and never gets a duplicate in the mirrored world.
 *
 * `x` is a fraction of the world repeat period. The three stations are spaced
 * out so none of them crowds the lander or each other — there is a clear gap
 * of roughly 45px between the edge of one prop and the edge of the next.
 */
export const OUTPOST_STATIONS = [
  {
    id: "power-junction",
    sprite: { src: solarPanelUrl },
    x: 0.2975,
    y: 464,
    scale: 1.15,
    repeat: false,
    mirror: false,
    blocking: true,
    footR: 30,
    shadow: true,
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
