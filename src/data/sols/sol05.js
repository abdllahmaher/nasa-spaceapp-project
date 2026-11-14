import { JEZERO_SITE } from "../nasa/sources";
import { crewTask, inspectNode, mergeNodes } from "./helpers";

const beacon = crewTask({
  target: "kai",
  speaker: "kai",
  eyebrow: "LANDING PAD · SOL 5",
  title: "Light the beacon",
  lines: [
    "Commander, the beacon is wired and the pad is marked.",
    "Give the word and the ship will have something to aim at.",
  ],
  why: [
    "A landing beacon pulses a light and a radio tone the ship can lock onto.",
    "Without it the ship aims at a coordinate, not at us.",
    "It costs power to run, but a missed landing costs everything.",
  ],
  subtaskId: "sol05_beacon",
  confirmLabel: "Power the beacon",
  detail: "Kai connects the beacon and runs a test pulse.",
  scene: { crewId: "kai", targetId: "power-junction", work: 1.7 },
  result: "Beacon is pulsing. Somebody out there can see us now.",
  toast: "Beacon lit",
});

const supplies = crewTask({
  target: "nova",
  speaker: "nova",
  eyebrow: "SUPPLIES · SOL 5",
  title: "Stock the pad",
  lines: [
    "The ship brings supplies down, but the crew has to unload them.",
    "I want water and a hot meal waiting at the pad before anyone opens that hatch.",
  ],
  why: [
    "After six Sols on rations, the first thing the crew needs is water.",
    "Unloading takes hours, so the supplies have to be staged, not fetched.",
    "A stocked pad turns a hard day into a good one.",
  ],
  subtaskId: "sol05_supplies",
  confirmLabel: "Stock the pad",
  detail: "Nova stages water, food and blankets at the pad.",
  scene: { crewId: "nova", targetId: "habitat", work: 1.5 },
  result: "Pad is stocked. It looks like a welcome, not a work site.",
  toast: "Pad stocked",
  effects: { food: 4, water: 3 },
});

const sweep = crewTask({
  target: "rex",
  speaker: "rex",
  eyebrow: "PAD · SOL 5",
  title: "Clear the landing zone",
  lines: [
    "Commander! The pad has a drift of dust across the near corner.",
    "A lander leg on loose dust is how landers fall over. I'll sweep it.",
  ],
  why: [
    "A landing leg needs firm ground to stay level.",
    "Loose dust shifts under the weight and tips the whole ship.",
    "Sweeping the pad is cheap. A tipped lander is not.",
  ],
  subtaskId: "sol05_sweep",
  confirmLabel: "Sweep the pad",
  detail: "Rex clears the drift and marks the corners.",
  scene: { crewId: "rex", targetId: "habitat", work: 1.5 },
  result: "Pad is flat and firm. Corner to corner.",
  toast: "Landing zone cleared",
  effects: { habitatSafety: 3 },
});

export const SOL05 = {
  day: 5,
  location: "Jezero Crater",
  coordinates: JEZERO_SITE.coordinates,
  mission: {
    id: "the-window",
    title: "The Window",
    brief: "Prepare the landing pad. The resupply ship arrives when we say we are ready.",
    why: "This is the last Sol before the window closes for a year.",
  },
  briefing: {
    kicker: "SOL 5 · JEZERO",
    title: (state) =>
      (state.flags ?? []).includes("calledHome") ? "They answered" : "A quiet sky",
    speaker: "layla",
    lines: (state) => [
      (state.flags ?? []).includes("calledHome")
        ? "The ship answered our transmission before dawn. They are coming, Commander. They just need a pad."
        : "We stayed dark, so we are guessing at the window. The pad has to be perfect without confirmation.",
      "One Sol. Beacon, supplies, and a flat piece of ground.",
    ],
    hint: "Three tasks, one last decision, then the ship.",
    startLabel: "Start Sol 5",
    site: JEZERO_SITE,
    weather: {
      headline: "Clear, cold morning",
      level: "clear",
      line: "A clear Sol at Jezero. Night temperatures here drop to around minus 80°C, so a clear sky is a cold sky.",
      issuedAt: "Jezero observations · Mars Year 36",
      source: "NASA · Mars facts",
      sourceUrl: "https://science.nasa.gov/mars/facts/",
    },
  },
  subtasks: [
    {
      id: "sol05_beacon",
      icon: "bolt",
      group: "Today's mission",
      label: "Power the landing beacon with Kai",
      target: "kai",
      effect: { storedPower: -4 },
      why: "The ship needs something to lock onto.",
      how: "Walk to Kai and confirm the beacon.",
    },
    {
      id: "sol05_supplies",
      icon: "drop",
      group: "Today's mission",
      label: "Stock the pad with Nova",
      target: "nova",
      effect: { food: 4, water: 3 },
      why: "Unloading takes hours; the crew needs supplies waiting.",
      how: "Walk to Nova and confirm the staging.",
    },
    {
      id: "sol05_sweep",
      icon: "search",
      group: "Today's mission",
      label: "Clear the landing zone with Rex",
      target: "rex",
      effect: { habitatSafety: 3 },
      why: "A lander leg on loose dust tips the ship.",
      how: "Walk to Rex and confirm the sweep.",
    },
  ],
  decision: {
    id: "sol05_final",
    shortTitle: "Light it now",
    title: "Do we call the ship in?",
    question:
      "The pad is ready. We can light the beacon now and bring the ship down in the morning, or wait one more Sol and check the weather again.",
    stakes: "One choice ends the week. The other stretches it, and the window does not stretch with it.",
    options: [
      {
        id: "now",
        icon: "bolt",
        label: "Call the ship in",
        detail: "Light the beacon tonight. The ship lands at dawn.",
        effects: { spareParts: -1, food: 6 },
        setFlags: ["windowOpen"],
        reply:
          "Beacon is bright, Commander. The ship is on its way down. We did it — five Sols, one outpost, one very loud drone.",
        toast: "The ship is coming",
      },
      {
        id: "wait",
        icon: "moon",
        label: "Wait one more Sol",
        detail: "Check the weather again. The window narrows.",
        effects: { storedPower: 4 },
        setFlags: ["windowWaited"],
        reply:
          "One more Sol, then. The sky is clear, the pad is ready, and I will keep the beacon warm. The ship will wait for us.",
        toast: "Waiting one more Sol",
      },
    ],
  },
  dialogue: mergeNodes(beacon, supplies, sweep, {
    power_junction: inspectNode({
      speaker: "kai",
      eyebrow: "POWER BOX",
      title: "Power junction",
      lines: ["Reserve is thin but enough.", "The beacon will eat into it. Worth it."],
    }),
    life_support: inspectNode({
      speaker: "nova",
      eyebrow: "AIR AND WATER",
      title: "Life support",
      lines: ["Air is clean. Water is staged at the pad."],
    }),
    habitat: inspectNode({
      speaker: "nova",
      eyebrow: "HOME",
      title: "Habitat dome",
      lines: ["The dome has been home for five Sols. It held."],
    }),
    rocket: inspectNode({
      speaker: "layla",
      eyebrow: "OUR RIDE HOME",
      title: "Ares Lander",
      lines: ["Five Sols on the surface. The lander still stands where we left it."],
    }),
  }),
  events: ["low-morale"],
};
