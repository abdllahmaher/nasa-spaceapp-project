import { JEZERO_SITE } from "../../data/nasa/sources";

/**
 * Sol 1: touchdown, the crew exit, three quick checks, and the power call.
 *
 * Everything here is written for 7–12 year olds: one idea per line, short
 * labels, and a speaker attached to every bubble so the UI can show a face.
 */
export const DAY01 = {
  day: 1,
  location: "Jezero Crater",
  coordinates: JEZERO_SITE.coordinates,

  objectives: [
    { id: "meet_kai_build", icon: "crew", label: "Get the power station ready with Kai", targets: ["kai"], targetOpen: (target, state) => !state.seen.includes(target), check: (state) => state.seen.includes("kai") },
    { id: "meet_nova_build", icon: "crew", label: "Help Nova finish life support", targets: ["nova"], targetOpen: (target, state) => !state.seen.includes(target), check: (state) => state.seen.includes("nova") },
    { id: "meet_rex_build", icon: "crew", label: "Check the habitat build with Rex", targets: ["rex"], targetOpen: (target, state) => !state.seen.includes(target), check: (state) => state.seen.includes("rex") },
  ],

  briefing: {
    kicker: "SOL 1 · JEZERO",
    title: "We made it!",
    speaker: "layla",
    lines: [
      "Touchdown! Everyone okay?",
      "Today is build day. Check in with Kai, Nova and Rex as they finish the outpost stations.",
    ],
    hint: "No resource management today — just construction and crew check-ins.",
    startLabel: "Let's go!",
    site: JEZERO_SITE,
    weather: {
      headline: "Morning ice haze",
      level: "haze",
      line: "NASA observations at Jezero have documented morning ice hazes and occasional ice clouds. This is an illustrative observed phenomenon, not a live forecast.",
      issuedAt: "Jezero observations · Mars Year 36",
      source: "NASA Perseverance atmospheric observations",
      sourceUrl: "https://science.nasa.gov/blog/perseverance-pays-off-when-studying-the-martian-atmosphere/",
    },
  },

  interactions: {
    rocket: {
      speaker: "layla",
      eyebrow: "OUR RIDE HOME",
      title: "Ares Lander",
      body: ["Our ride home! It stays right here on the pad."],
    },

    power_junction: {
      speaker: "kai",
      eyebrow: "POWER BOX",
      title: "Power Box",
      body: ["The power box is buzzing and sparking.", "I can fix it, but I need two spare parts."],
      choices: [
        {
          id: "repair",
          icon: "wrench",
          label: "Fix it now",
          detail: "Kai fixes the box tonight.",
          cost: { spareParts: 2, storedPower: 4 },
          effects: { powerCondition: 15, habitatSafety: 2 },
          fatigue: { kai: 6 },
          setFlags: ["powerUnitRepaired"],
          scene: { crewId: "kai", targetId: "power_junction", work: 1.9 },
          result: "Kai fixed it! The lights shine bright.",
          toast: "Power fixed!",
        },
        {
          id: "diagnose",
          icon: "search",
          label: "Check it first",
          detail: "Kai looks for the loose wire.",
          cost: { storedPower: 1 },
          setFlags: ["powerDiagnosed"],
          scene: { crewId: "kai", targetId: "power_junction", work: 1.1 },
          result: "Kai found a loose wire. Easy fix tomorrow!",
          toast: "Found the loose wire!",
        },
        {
          id: "postpone",
          icon: "moon",
          label: "Leave it for now",
          detail: "Save the parts. Get some sleep.",
          setFlags: ["powerUnitPostponed"],
          result: "The power box still buzzes… Brr.",
          toast: "Sleepy time… but buzz.",
        },
      ],
    },

    life_support: {
      speaker: "nova",
      eyebrow: "AIR AND WATER",
      title: "Fresh air!",
      body: ["Air is clean. Good job, air machine!", "But the water filter is getting clogged."],
    },

    kai: {
      speaker: "kai",
      eyebrow: "ENGINEER",
      title: "Kai",
      body: ["That power box is sparking!", "I can fix it tonight. Or we can take a closer look first."],
      report: null,
    },

    nova: {
      speaker: "nova",
      eyebrow: "AIR & WATER",
      title: "Nova",
      body: ["I keep the air and water clean.", "The filter needs help soon. Not today, though!"],
      report: null,
    },

    rex: {
      speaker: "rex",
      eyebrow: "SCIENCE",
      title: "Rex",
      body: ["That crater is full of secrets!", "Can I explore it tomorrow? Please?"],
      report: null,
    },

    habitat: {
      speaker: "nova",
      eyebrow: "HOME",
      title: "Habitat Dome",
      body: ["Home sweet dome!", "Warm, cozy, and the only coffee on Mars."],
    },
  },
};

export const DAYS = {
  1: DAY01,
};
