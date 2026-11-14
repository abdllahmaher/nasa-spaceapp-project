import { JEZERO_SITE } from "../nasa/sources";
import { crewTask, inspectNode, mergeNodes } from "./helpers";

const mast = crewTask({
  target: "kai",
  speaker: "kai",
  eyebrow: "COMMS · SOL 4",
  title: "The mast came down",
  lines: [
    "Commander, the storm bent the comms mast.",
    "One brace and a new bolt and we can talk to the ship again.",
  ],
  why: [
    "The mast points a small dish at the ship's relay.",
    "If it is bent, the signal misses by metres over millions of kilometres.",
    "Straightening it is the difference between being heard and being alone.",
  ],
  subtaskId: "sol04_mast",
  confirmLabel: "Fix the mast",
  detail: "Kai replaces the brace and re-aims the dish.",
  scene: { crewId: "kai", targetId: "power-junction", work: 1.7 },
  result: "Mast is straight. Signal strength is back.",
  toast: "Comms mast repaired",
  clears: ["storm-front"],
});

const air = crewTask({
  target: "nova",
  speaker: "nova",
  eyebrow: "AIR · SOL 4",
  title: "What the dust left inside",
  lines: [
    "The intake seal held, but I want to read the particulate log.",
    "If dust got inside, it will show up in the numbers before it shows up in our lungs.",
  ],
  why: [
    "The recycler measures what is in our air every few minutes.",
    "Fine dust shows up as a rise in particulates.",
    "Clean numbers mean the seal did its job.",
  ],
  subtaskId: "sol04_air",
  confirmLabel: "Read the air log",
  detail: "Nova reads the log and swaps the pre-filter.",
  scene: { crewId: "nova", targetId: "life-support", work: 1.4 },
  result: "Numbers are clean. The seal held all night.",
  toast: "Air checked",
  clears: ["thirsty-crew"],
});

const dust = crewTask({
  target: "rex",
  speaker: "rex",
  eyebrow: "SCIENCE · SOL 4",
  title: "The array is wearing the storm",
  lines: [
    "Commander, the panels are caked. I can sweep them with the long brush.",
    "Also — the dust left streaks. Beautiful ones. Can I log them after?",
  ],
  why: [
    "Dust blocks sunlight before it reaches the panel.",
    "Sweeping restores the power we were already paying for.",
    "The streaks show which way the wind pushed the storm.",
  ],
  subtaskId: "sol04_dust",
  confirmLabel: "Sweep the panels",
  detail: "Rex sweeps the array and logs the streaks.",
  scene: { crewId: "rex", targetId: "power-junction", work: 1.6 },
  result: "Panels are bright again. Output is climbing.",
  toast: "Array swept",
  clears: ["array-strain"],
  effects: { powerCondition: 5, storedPower: 5 },
});

export const SOL04 = {
  day: 4,
  location: "Jezero Crater",
  coordinates: JEZERO_SITE.coordinates,
  mission: {
    id: "signal",
    title: "Signal",
    brief: "The storm bent the comms mast. Repair it and decide whether we call home.",
    why: "The resupply ship needs to hear from us before it commits to the window.",
  },
  briefing: {
    kicker: "SOL 4 · JEZERO",
    title: (state) =>
      (state.flags ?? []).includes("arraySafe") ? "Under the tarp, safe" : "The bill for the dust",
    speaker: "layla",
    lines: (state) => [
      (state.flags ?? []).includes("arraySafe")
        ? "The tarps worked. The array came through the storm without a scratch, and we are short on charge because of it."
        : "We ran the array through the storm. It survived, but the connectors took a beating.",
      "The mast is bent and the ship is waiting for our status. Today we get our voice back.",
    ],
    hint: "Repair, check, sweep. Then the decision that follows us to Sol 5.",
    startLabel: "Start Sol 4",
    site: JEZERO_SITE,
    weather: {
      headline: "Clearing, dust settling",
      level: "haze",
      line: "After a dust event, fine particles hang in the air for a while. NASA observes this settling haze at Jezero with the rover's cameras.",
      issuedAt: "Jezero observations · Mars Year 36",
      source: "NASA/JPL · Perseverance dust observations",
      sourceUrl: "https://www.nasa.gov/missions/mars-2020-perseverance/perseverance-rover/perseverance-rover-witnesses-one-martian-dust-devil-eating-another/",
    },
  },
  subtasks: [
    {
      id: "sol04_mast",
      icon: "bolt",
      group: "Today's mission",
      label: "Repair the comms mast with Kai",
      target: "kai",
      cost: { spareParts: 1 },
      effect: { powerCondition: 2 },
      clears: ["storm-front"],
      why: "A bent mast points the dish at empty space.",
      how: "Walk to Kai and confirm the repair.",
    },
    {
      id: "sol04_air",
      icon: "drop",
      group: "Today's mission",
      label: "Read the air log with Nova",
      target: "nova",
      effect: { lifeSupportCondition: 3 },
      clears: ["thirsty-crew"],
      why: "Dust inside the dome shows up in the numbers first.",
      how: "Walk to Nova and confirm the check.",
    },
    {
      id: "sol04_dust",
      icon: "search",
      group: "Today's mission",
      label: "Sweep the array with Rex",
      target: "rex",
      effect: { powerCondition: 5, storedPower: 5 },
      clears: ["array-strain"],
      why: "A dusty panel makes a fraction of its rated power.",
      how: "Walk to Rex and confirm the sweep.",
    },
  ],
  decision: {
    id: "sol04_call",
    shortTitle: "Call home",
    title: "Do we send the message tonight?",
    question:
      "The dish is aimed and the ship is listening. A full transmission costs a big slice of our reserve — but it is the only way to confirm the window.",
    stakes: "One loud night, or one quiet one. Tomorrow we live with it either way.",
    options: [
      {
        id: "call",
        icon: "bolt",
        label: "Send the message",
        detail: "Costs power. The ship confirms the window and the crew hears from home.",
        cost: { storedPower: 10 },
        effects: { food: 2 },
        setFlags: ["calledHome"],
        reply: "Message away. The ship heard us. The crew is grinning at the ceiling.",
        toast: "Message sent home",
      },
      {
        id: "quiet",
        icon: "moon",
        label: "Stay dark and save power",
        detail: "Keeps the reserve. Nobody hears from home tonight.",
        effects: { storedPower: 4, habitatSafety: -2 },
        setFlags: ["stayedDark"],
        reply: "Radio silent. The dome feels bigger when nobody is talking.",
        toast: "Stayed dark",
      },
    ],
  },
  dialogue: mergeNodes(mast, air, dust, {
    power_junction: inspectNode({
      speaker: "kai",
      eyebrow: "POWER BOX",
      title: "Power junction",
      lines: ["Bus is stable again.", "The reserve is the thing to watch tonight."],
    }),
    life_support: inspectNode({
      speaker: "nova",
      eyebrow: "AIR AND WATER",
      title: "Life support",
      lines: ["Air is clean. Water is steady."],
    }),
    habitat: inspectNode({
      speaker: "nova",
      eyebrow: "HOME",
      title: "Habitat dome",
      lines: ["The dome is warm. The crew is quiet."],
    }),
    rocket: inspectNode({
      speaker: "layla",
      eyebrow: "OUR RIDE HOME",
      title: "Ares Lander",
      lines: ["Two Sols until the window. The lander is ready to guide the ship in."],
    }),
  }),
  events: ["storm-front", "thirsty-crew", "array-strain"],
};
