import { DONKI_ADVISORY, JEZERO_SITE } from "../../data/nasa/sources";

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
    {
      id: "inspect_power",
      icon: "bolt",
      label: "Check the power",
      check: (state) => state.seen.includes("power_junction"),
    },
    {
      id: "inspect_life_support",
      icon: "drop",
      label: "Check the air",
      check: (state) => state.seen.includes("life_support"),
    },
    {
      id: "meet_crew",
      icon: "crew",
      label: "Meet the crew",
      check: (state) => ["kai", "nova", "rex"].every((id) => state.seen.includes(id)),
      progress: (state) =>
        ["kai", "nova", "rex"].filter((id) => state.seen.includes(id)).length,
      progressMax: 3,
    },
    {
      id: "power_decision",
      icon: "wrench",
      label: "Pick a power plan",
      check: (state) => Boolean(state.decisions.power_junction),
    },
  ],

  briefing: {
    kicker: "SOL 1 · JEZERO",
    title: "We made it!",
    speaker: "layla",
    lines: [
      "Touchdown! Everyone okay?",
      "Before dark: check the power, check the air, and say hi to Kai, Nova and Rex.",
    ],
    hint: "Then choose what to do about the buzzing power box.",
    startLabel: "Let's go!",
    site: JEZERO_SITE,
    weather: {
      headline: "A small solar breeze",
      level: "mild",
      line: "A puff of solar wind is passing Mars today. No big storm.",
      issuedAt: DONKI_ADVISORY.issuedAt,
      source: "NASA DONKI · real data",
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
    },

    nova: {
      speaker: "nova",
      eyebrow: "AIR & WATER",
      title: "Nova",
      body: ["I keep the air and water clean.", "The filter needs help soon. Not today, though!"],
    },

    rex: {
      speaker: "rex",
      eyebrow: "SCIENCE",
      title: "Rex",
      body: ["That crater is full of secrets!", "Can I explore it tomorrow? Please?"],
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
