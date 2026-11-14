import { JEZERO_SITE } from "../nasa/sources";
import { crewTask, inspectNode } from "./helpers";

const met = (state, id) => (state.doneSubtasks ?? []).includes(id);

/* ---------------------------------------------------------------- meeting */

const MEET_KAI = {
  speaker: "kai",
  eyebrow: "FIRST CONTACT · KAI",
  title: "Kai, engineer",
  body: [
    "Commander. Kai. I keep the power and the machines alive.",
    "The lander brought three stations in pieces. Say the word and I'll bolt the power junction together.",
  ],
  choices: [
    {
      id: "meet_kai_go",
      icon: "crew",
      label: "Good to meet you, Kai",
      detail: "Shake hands and move on.",
      complete: "meet_kai",
      result: "Then let's get to work. I'll be at the junction.",
      toast: "Met Kai",
    },
  ],
};

const MEET_NOVA = {
  speaker: "nova",
  eyebrow: "FIRST CONTACT · NOVA",
  title: "Nova, life support",
  body: [
    "Hello, Commander. Nova. I look after the air you breathe and the water you drink.",
    "My recycler is still folded in its crate. It needs a home before nightfall.",
  ],
  choices: [
    {
      id: "meet_nova_go",
      icon: "crew",
      label: "Good to meet you, Nova",
      detail: "Shake hands and move on.",
      complete: "meet_nova",
      result: "Then I'll start unpacking. Breathe easy until then.",
      toast: "Met Nova",
    },
  ],
};

const MEET_REX = {
  speaker: "rex",
  eyebrow: "FIRST CONTACT · REX",
  title: "Rex, science",
  body: [
    "Commander! Rex! Look at this place — there was a lake here once. A real one!",
    "I need a dome to work in. Also I need to tell you about the dust. Mostly the dust.",
  ],
  choices: [
    {
      id: "meet_rex_go",
      icon: "crew",
      label: "Good to meet you, Rex",
      detail: "Let him finish. Eventually.",
      complete: "meet_rex",
      result: "You're going to love it here. I promise.",
      toast: "Met Rex",
    },
  ],
};

/* ----------------------------------------------------------------- building */

const BUILD_POWER = crewTask({
  target: "kai",
  speaker: "kai",
  eyebrow: "BUILD · POWER JUNCTION",
  title: "Solar array first",
  lines: [
    "Commander. The array is the heart of this outpost — panels, cable, junction box.",
    "Give me the go and I'll have it standing before the sun drops.",
  ],
  why: [
    "Solar panels turn sunlight into electricity.",
    "The junction stores it so we still have power at night, when the sun is down.",
    "No power means no heat, no recycling, no lights. Everything else depends on this.",
  ],
  subtaskId: "sol01_power",
  confirmLabel: "Let's build the array",
  detail: "Kai assembles the array and the power junction.",
  scene: { crewId: "kai", targetId: "power-junction", work: 2.2 },
  result: "The array is standing. The junction hums happily.",
  toast: "Power junction built",
  builds: "power-junction",
});

const BUILD_AIR = crewTask({
  target: "nova",
  speaker: "nova",
  eyebrow: "BUILD · LIFE SUPPORT",
  title: "Air before nightfall",
  lines: [
    "The recycler is still in its crate, Commander.",
    "Once it's running, it will pull carbon dioxide out of our air and give us oxygen back.",
  ],
  why: [
    "We breathe oxygen and breathe out carbon dioxide.",
    "The recycler separates the carbon from the oxygen and returns the oxygen to the dome.",
    "Without it, our air turns stale in about a day.",
  ],
  subtaskId: "sol01_air",
  confirmLabel: "Build life support",
  detail: "Nova sets up the recycler and checks the airflow.",
  scene: { crewId: "nova", targetId: "life-support", work: 2.2 },
  result: "Air is moving. It smells like a new machine.",
  toast: "Life support online",
  builds: "life-support",
});

const BUILD_HAB = crewTask({
  target: "rex",
  speaker: "rex",
  eyebrow: "BUILD · HABITAT DOME",
  title: "A dome to sleep in",
  lines: [
    "Commander, the dome! It's the big one. Literally.",
    "Inside it we get warmth, pressure and a place to put the samples I'm definitely going to collect.",
  ],
  why: [
    "Mars' air is almost all carbon dioxide and far too thin to breathe.",
    "The dome holds its own air and its own pressure, like a balloon that refuses to pop.",
    "It also keeps the night cold outside where it belongs.",
  ],
  subtaskId: "sol01_hab",
  confirmLabel: "Build the dome",
  detail: "Rex raises the habitat dome and seals the airlock.",
  scene: { crewId: "rex", targetId: "habitat", work: 2.2 },
  result: "The dome is up. It looks like a home already.",
  toast: "Habitat dome built",
  builds: "habitat-dome",
});

/* -------------------------------------------------------------- first Sol */

export const SOL01 = {
  day: 1,
  location: "Jezero Crater",
  coordinates: JEZERO_SITE.coordinates,
  mission: {
    id: "establish-the-outpost",
    title: "Establish the Outpost",
    brief: "Meet your crew, then build the three systems that keep us alive.",
    why: "The resupply ship can only reach us in six Sols. The outpost has to be alive before then.",
  },
  briefing: {
    kicker: "SOL 1 · JEZERO",
    title: "We made it!",
    speaker: "layla",
    lines: [
      "Touchdown, Commander. Jezero Crater — an old river delta, four billion years old.",
      "Three crew, three stations in crates, and six Sols until the resupply window closes.",
    ],
    hint: "PIP will walk you through it. Start by meeting the crew.",
    startLabel: "Let's go!",
    site: JEZERO_SITE,
    weather: {
      headline: "Clear sky, thin air",
      level: "clear",
      line: "A calm Sol at Jezero. Mars' atmosphere is about 1% as thick as Earth's, so the sky stays dusty-butterscotch even at noon.",
      issuedAt: "Jezero observations · Mars Year 36",
      source: "NASA · Mars facts",
      sourceUrl: "https://science.nasa.gov/mars/facts/",
    },
  },
  subtasks: [
    {
      id: "meet_kai",
      icon: "crew",
      group: "Meet the crew",
      label: "Meet Kai, the engineer",
      target: "kai",
      why: "Kai builds and repairs everything that carries power.",
      how: "Walk to Kai and say hello.",
    },
    {
      id: "meet_nova",
      icon: "drop",
      group: "Meet the crew",
      label: "Meet Nova, life support",
      target: "nova",
      why: "Nova keeps the air breathable and the water drinkable.",
      how: "Walk to Nova and say hello.",
    },
    {
      id: "meet_rex",
      icon: "search",
      group: "Meet the crew",
      label: "Meet Rex, the scientist",
      target: "rex",
      why: "Rex reads the ground and the weather, and he never stops talking.",
      how: "Walk to Rex and say hello.",
    },
    {
      id: "sol01_power",
      icon: "bolt",
      group: "Today's mission",
      label: "Build the solar array with Kai",
      target: "kai",
      requires: ["meet_kai"],
      builds: "power-junction",
      effect: { powerCondition: 12, storedPower: 8 },
      why: "Nothing on this outpost runs without electricity.",
      how: "Walk to Kai and confirm the build.",
    },
    {
      id: "sol01_air",
      icon: "drop",
      group: "Today's mission",
      label: "Build life support with Nova",
      target: "nova",
      requires: ["meet_nova"],
      builds: "life-support",
      effect: { lifeSupportCondition: 10 },
      why: "The recycler is the only thing between us and stale air.",
      how: "Walk to Nova and confirm the build.",
    },
    {
      id: "sol01_hab",
      icon: "home",
      group: "Today's mission",
      label: "Build the habitat dome with Rex",
      target: "rex",
      requires: ["meet_rex"],
      builds: "habitat-dome",
      effect: { habitatSafety: 6 },
      why: "A pressurised dome is the difference between a base and a camping trip.",
      how: "Walk to Rex and confirm the build.",
    },
  ],
  decision: {
    id: "sol01_survey",
    shortTitle: "First survey",
    title: "Where does the first survey go?",
    question:
      "The rover has one free day before the resupply window tightens. Rex can point the drill at the crater rim or at the buried ice.",
    stakes: "Whatever we find now is what we have to work with tomorrow.",
    options: [
      {
        id: "rim",
        icon: "search",
        label: "Survey the crater rim",
        detail: "Rocks and old lakebed layers. Might turn up spare parts.",
        effects: { spareParts: 1 },
        setFlags: ["surveyRim"],
        reply: "Rim it is. I'll bring back rocks and maybe something we can bolt on.",
        toast: "Rim survey chosen",
      },
      {
        id: "ice",
        icon: "drop",
        label: "Drill for buried ice",
        detail: "Water ice under the dust. More water for the reserve.",
        effects: { water: 14 },
        setFlags: ["surveyIce"],
        reply: "Ice! Commander, there is actual water down there. The reserve is filling already.",
        toast: "Ice survey chosen",
      },
    ],
  },
  // Kai, Nova and Rex change what they say once you have met them.
  dialogue: {
    kai: (state) => (met(state, "meet_kai") ? BUILD_POWER.kai : MEET_KAI),
    "kai.why": BUILD_POWER["kai.why"],
    nova: (state) => (met(state, "meet_nova") ? BUILD_AIR.nova : MEET_NOVA),
    "nova.why": BUILD_AIR["nova.why"],
    rex: (state) => (met(state, "meet_rex") ? BUILD_HAB.rex : MEET_REX),
    "rex.why": BUILD_HAB["rex.why"],
    rocket: inspectNode({
      speaker: "layla",
      eyebrow: "OUR RIDE HOME",
      title: "Ares Lander",
      lines: ["Our ride down. It stays on the pad as a backup shelter until the ship comes."],
    }),
  },
  events: [],
};

