import { JEZERO_SITE } from "../nasa/sources";
import { crewTask, inspectNode, mergeNodes } from "./helpers";

const mount = crewTask({
  target: "kai",
  speaker: "kai",
  eyebrow: "POWER · SOL 3",
  title: "Strap everything down",
  lines: [
    "Commander, that front will throw grit at the array all night.",
    "I want to strap the mounts and clean the panels before it lands.",
  ],
  why: [
    "Wind-blown grit scratches glass and jams moving parts.",
    "A clean panel makes full power; a dusty one makes a fraction of it.",
    "Strapping the mounts keeps the array from shaking itself loose.",
  ],
  subtaskId: "sol03_mount",
  confirmLabel: "Strap the array",
  detail: "Kai cleans the panels and straps the mounts.",
  scene: { crewId: "kai", targetId: "power-junction", work: 1.8 },
  result: "Panels clean, mounts tight. Let the dust come.",
  toast: "Array secured",
  clears: ["dust-on-array"],
});

const intake = crewTask({
  target: "nova",
  speaker: "nova",
  eyebrow: "AIR · SOL 3",
  title: "The intake is drinking dust",
  lines: [
    "The intake screen is half blocked and the recycler is pulling hard.",
    "Give me ten minutes and I'll seal the outer mesh.",
  ],
  why: [
    "The intake pulls outside air through a fine screen.",
    "Dust on the screen means less air gets through for the same effort.",
    "Sealing the mesh keeps the dust out instead of cleaning it later.",
  ],
  subtaskId: "sol03_intake",
  confirmLabel: "Seal the intake",
  detail: "Nova seals the mesh and logs the airflow.",
  scene: { crewId: "nova", targetId: "life-support", work: 1.6 },
  result: "Intake sealed. Airflow is back where it should be.",
  toast: "Intake sealed",
  clears: ["thirsty-crew"],
});

const front = crewTask({
  target: "rex",
  speaker: "rex",
  eyebrow: "WEATHER · SOL 3",
  title: "How tall is that wall?",
  lines: [
    "Commander, the front is a wall of dust two kilometres high. I measured it. Twice.",
    "If I watch its edge I can tell you how long we lose the sun.",
  ],
  why: [
    "A dust front is wind-lifted dust, sometimes kilometres deep.",
    "Its height tells us how much sunlight the array will lose.",
    "That number decides how much power we can afford tonight.",
  ],
  subtaskId: "sol03_front",
  confirmLabel: "Measure the front",
  detail: "Rex tracks the edge of the front from the ridge.",
  scene: { crewId: "rex", targetId: "habitat", work: 1.4 },
  result: "Two sols of dim light, then clear. I'll take that.",
  toast: "Front measured",
});

export const SOL03 = {
  day: 3,
  location: "Jezero Crater",
  coordinates: JEZERO_SITE.coordinates,
  mission: {
    id: "the-dust-line",
    title: "The Dust Line",
    brief: "A dust front is one Sol away. Secure the array and the air before it lands.",
    why: "Storms on Mars are made of dust, not rain. The danger is losing power and air.",
  },
  briefing: {
    kicker: "SOL 3 · JEZERO",
    title: (state) =>
      (state.flags ?? []).includes("filterRation") ? "A dry crew and a dust wall" : "A dust wall on the horizon",
    speaker: "layla",
    lines: (state) => [
      (state.flags ?? []).includes("filterRation")
        ? "We saved the parts and rationed the water. The crew is quiet this morning, and the dust is coming anyway."
        : "The new cartridge is holding. The crew drank properly last night, which matters today.",
      "Rex says the front reaches us by nightfall. Everything that can shake loose, will.",
    ],
    hint: "Two systems to secure, one measurement to take, then a hard choice.",
    startLabel: "Start Sol 3",
    site: JEZERO_SITE,
    weather: {
      headline: "Dust front approaching",
      level: "storm",
      line: "Dust storms on Mars are wind-lifted dust, not rain. They can last for days and dim the sunlight the array depends on.",
      issuedAt: "Jezero observations · Mars Year 36",
      source: "NASA · The Mars Report",
      sourceUrl: "https://science.nasa.gov/mars/the-mars-report/",
    },
  },
  subtasks: [
    {
      id: "sol03_mount",
      icon: "bolt",
      group: "Today's mission",
      label: "Secure the array with Kai",
      target: "kai",
      effect: { powerCondition: 4, storedPower: 3 },
      clears: ["dust-on-array"],
      why: "Grit scratches panels and shakes mounts loose.",
      how: "Walk to Kai and confirm the work.",
    },
    {
      id: "sol03_intake",
      icon: "drop",
      group: "Today's mission",
      label: "Seal the air intake with Nova",
      target: "nova",
      effect: { lifeSupportCondition: 4 },
      clears: ["thirsty-crew"],
      why: "A blocked intake makes the recycler strain all night.",
      how: "Walk to Nova and confirm the seal.",
    },
    {
      id: "sol03_front",
      icon: "search",
      group: "Today's mission",
      label: "Measure the dust front with Rex",
      target: "rex",
      why: "The height of the front tells us how much sun we lose.",
      how: "Walk to Rex and confirm the measurement.",
    },
  ],
  decision: {
    id: "sol03_array_choice",
    shortTitle: "Tarp or run",
    title: "Do we tarp the array tonight?",
    question:
      "Covering the panels protects them from grit, but we lose a night of charging. Running them keeps the reserve full and risks the glass.",
    stakes: "Whatever we choose tonight, tomorrow's power is already decided.",
    options: [
      {
        id: "tarp",
        icon: "home",
        label: "Tarp the array",
        detail: "Lose tonight's charge. The panels come through untouched.",
        effects: { storedPower: -6, powerCondition: 4 },
        setFlags: ["arraySafe"],
        reply: "Tarps on. Cold night, but the glass is safe under there.",
        toast: "Array tarped",
      },
      {
        id: "run",
        icon: "bolt",
        label: "Keep it running",
        detail: "Charge through the dust. Risk scratches and a strained bus.",
        effects: { storedPower: 4, powerCondition: -8 },
        setFlags: ["arrayStrained"],
        reply: "Array stays live. If the grit gets into the connectors, that's on me.",
        toast: "Array left running",
      },
    ],
  },
  dialogue: mergeNodes(mount, intake, front, {
    power_junction: inspectNode({
      speaker: "kai",
      eyebrow: "POWER BOX",
      title: "Power junction",
      lines: ["Bus is warm but holding.", "A night like this will test it."],
    }),
    life_support: inspectNode({
      speaker: "nova",
      eyebrow: "AIR AND WATER",
      title: "Life support",
      lines: ["Air is clean. The intake is doing all the work."],
    }),
    habitat: inspectNode({
      speaker: "nova",
      eyebrow: "HOME",
      title: "Habitat dome",
      lines: ["The dome is holding pressure well. Dust is piling against the airlock."],
    }),
    rocket: inspectNode({
      speaker: "layla",
      eyebrow: "OUR RIDE HOME",
      title: "Ares Lander",
      lines: ["The lander is built for this. Mostly."],
    }),
  }),
  events: ["dust-on-array", "storm-front", "thirsty-crew"],
};
