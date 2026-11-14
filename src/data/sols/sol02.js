import { JEZERO_SITE } from "../nasa/sources";
import { crewTask, inspectNode, mergeNodes } from "./helpers";

const filter = crewTask({
  target: "nova",
  speaker: "nova",
  eyebrow: "WATER · SOL 2",
  title: "The filter is drinking dust",
  lines: [
    "Commander, the water filter has a film of dust on the outer mesh.",
    "Every litre is costing us more pump power than it should. I can clean it now.",
  ],
  why: [
    "The filter catches dust before it reaches the pump.",
    "When the mesh clogs, the pump works harder for less water.",
    "Cleaning it keeps our water use low and the pump healthy.",
  ],
  subtaskId: "sol02_filter",
  confirmLabel: "Clean the filter",
  detail: "Nova rinses the mesh and logs the flow.",
  scene: { crewId: "nova", targetId: "life-support", work: 1.6 },
  result: "Filter clean. The water runs clear again.",
  toast: "Water filter cleaned",
  clears: ["filter-clog"],
});

const seal = crewTask({
  target: "kai",
  speaker: "kai",
  eyebrow: "POWER · SOL 2",
  title: "That buzz is not normal",
  lines: [
    "Commander, the junction has been buzzing since we powered it up.",
    "Loose connector. Ten minutes and it stops complaining.",
  ],
  why: [
    "A loose connector makes a small gap where electricity jumps across.",
    "Jumping electricity makes heat, and heat is how wires fail.",
    "Tightening it now costs nothing. Replacing it later costs parts.",
  ],
  subtaskId: "sol02_seal",
  confirmLabel: "Fix the connector",
  detail: "Kai tightens the connector and re-tests the bus.",
  scene: { crewId: "kai", targetId: "power-junction", work: 1.6 },
  result: "Buzz gone. The junction is quiet and boring again.",
  toast: "Power box repaired",
  clears: ["power-buzz"],
});

const survey = crewTask({
  target: "rex",
  speaker: "rex",
  eyebrow: "SCIENCE · SOL 2",
  title: "What yesterday found",
  lines: [
    "Commander! The samples from yesterday are still in the case.",
    "I want to log them properly before the dust gets into everything.",
  ],
  why: [
    "Jezero was a river delta, so its layers record ancient water.",
    "Every sample we log now is a page of that history we keep forever.",
    "Dust destroys samples quickly, so today is the day.",
  ],
  subtaskId: "sol02_survey",
  confirmLabel: "Log the samples",
  detail: "Rex catalogues the samples and seals the case.",
  scene: { crewId: "rex", targetId: "habitat", work: 1.3 },
  result: "Logged and sealed. This is a good little collection.",
  toast: "Samples logged",
  effects: { spareParts: 0, water: 3 },
});

export const SOL02 = {
  day: 2,
  location: "Jezero Crater",
  coordinates: JEZERO_SITE.coordinates,
  mission: {
    id: "water-math",
    title: "Water Math",
    brief: "Clean the systems the dust reached overnight, before the reserve pays for it.",
    why: "Every clogged filter and buzzing connector costs us water and power all night.",
  },
  briefing: {
    kicker: "SOL 2 · JEZERO",
    title: (state) =>
      (state.flags ?? []).includes("surveyIce") ? "The ice is real" : "A crate of rocks",
    speaker: "layla",
    lines: (state) => [
      (state.flags ?? []).includes("surveyIce")
        ? "Nova's drill hit water ice before dawn. The reserve is fuller than we budgeted for."
        : "Rex's rim samples are heavier than we thought. Some of that rock is worth keeping.",
      "The dust found every gap we left open. Three systems need attention today.",
    ],
    hint: "PIP has the list. Two systems, one scientist, one decision at the end.",
    startLabel: "Start Sol 2",
    site: JEZERO_SITE,
    weather: {
      headline: "Dust-devil window",
      level: "dust",
      line: "Perseverance has recorded frequent dust devils at Jezero. The drifting dust is an educational visualisation of that observed phenomenon.",
      issuedAt: "Jezero observations · Mars Year 36",
      source: "NASA/JPL · Perseverance wind observations",
      sourceUrl: "https://www.nasa.gov/missions/mars-2020-perseverance/perseverance-rover/nasas-perseverance-studies-the-wild-winds-of-jezero-crater/",
    },
  },
  subtasks: [
    {
      id: "sol02_filter",
      icon: "drop",
      group: "Today's mission",
      label: "Clean the water filter with Nova",
      target: "nova",
      effect: { water: 4, lifeSupportCondition: 2 },
      clears: ["filter-clog"],
      why: "A clean filter gives more water for less pump power.",
      how: "Walk to Nova and confirm the clean.",
    },
    {
      id: "sol02_seal",
      icon: "bolt",
      group: "Today's mission",
      label: "Fix the buzzing junction with Kai",
      target: "kai",
      effect: { powerCondition: 3 },
      clears: ["power-buzz"],
      why: "A buzzing connector is heat, and heat is how wires fail.",
      how: "Walk to Kai and confirm the repair.",
    },
    {
      id: "sol02_survey",
      icon: "search",
      group: "Today's mission",
      label: "Log yesterday's samples with Rex",
      target: "rex",
      effect: { water: 3 },
      why: "Dust destroys samples, so they have to be logged today.",
      how: "Walk to Rex and confirm the log.",
    },
  ],
  decision: {
    id: "sol02_filter_fix",
    shortTitle: "Filter or ration",
    title: "Spend parts, or spend water?",
    question:
      "The filter will clog again within two Sols. We can fit the spare cartridge now, or ration water and hope the dust eases.",
    stakes: "Parts are scarce. So is water. Pick which shortage you can live with.",
    options: [
      {
        id: "clean",
        icon: "wrench",
        label: "Fit the spare cartridge",
        detail: "Costs 2 parts. Water stays clean and the pump stops straining.",
        effects: { spareParts: -2, water: 6 },
        setFlags: ["filterClean"],
        reply: "Cartridge is in. That filter will outlast the week.",
        toast: "Spare cartridge fitted",
      },
      {
        id: "ration",
        icon: "drop",
        label: "Ration the water instead",
        detail: "Saves the parts. The crew drinks less and the recycler works harder.",
        effects: { water: -8, lifeSupportCondition: -4 },
        setFlags: ["filterRation"],
        reply: "Rations it is. Nobody is going to like me today.",
        toast: "Water rationed",
      },
    ],
  },
  dialogue: mergeNodes(filter, seal, survey, {
    power_junction: inspectNode({
      speaker: "kai",
      eyebrow: "POWER BOX",
      title: "Power junction",
      lines: ["Output is steady.", "Dust on the panels is the next thing to watch."],
    }),
    life_support: inspectNode({
      speaker: "nova",
      eyebrow: "AIR AND WATER",
      title: "Life support",
      lines: ["Air is clean, water is flowing.", "The intake screen is dusty. Tomorrow it gets worse."],
    }),
    habitat: inspectNode({
      speaker: "nova",
      eyebrow: "HOME",
      title: "Habitat dome",
      lines: ["Warm inside, cold outside. Just how we like it."],
    }),
    rocket: inspectNode({
      speaker: "layla",
      eyebrow: "OUR RIDE HOME",
      title: "Ares Lander",
      lines: ["Still on the pad, waiting for the resupply ship."],
    }),
  }),
  events: ["dust-on-array", "filter-clog", "power-buzz"],
};
