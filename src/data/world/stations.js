import solarPanelUrl from "../../assets/props/solar_panel.png";
import oxygenStationUrl from "../../assets/props/oxygen_station.png";
import habitatDomeUrl from "../../assets/props/habitat_dome.png";

/**
 * Unique outpost stations. `repeat` and `mirror` are off so each interactive
 * target exists exactly once and never gets a duplicate in the mirrored world.
 */
export const OUTPOST_STATIONS = [
  {
    id: "power-junction",
    sprite: { src: solarPanelUrl },
    x: 0.262,
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
      targetId: "power_junction",
      label: "Inspect power",
    },
  },
  {
    id: "life-support",
    sprite: { src: oxygenStationUrl },
    x: 0.298,
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
    x: 0.334,
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
