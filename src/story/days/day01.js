import { DONKI_ADVISORY, JEZERO_SITE, NASA_SOURCES } from "../../data/nasa/sources";

/**
 * Sol 1: arrival, power, life support, and the three specialists.
 *
 * Interaction content is keyed by the entity's `interactive.targetId`, so the
 * canvas never imports story text.
 */
export const DAY01 = {
  day: 1,
  location: "Jezero Crater",
  coordinates: JEZERO_SITE.coordinates,

  objectives: [
    {
      id: "inspect_power",
      label: "Inspect the power junction",
      check: (state) => state.seen.includes("power_junction"),
    },
    {
      id: "inspect_life_support",
      label: "Check the life-support plant",
      check: (state) => state.seen.includes("life_support"),
    },
    {
      id: "meet_crew",
      label: "Talk to Kai, Nova and Rex",
      check: (state) => ["kai", "nova", "rex"].every((id) => state.seen.includes(id)),
      progress: (state) => `${["kai", "nova", "rex"].filter((id) => state.seen.includes(id)).length}/3`,
    },
    {
      id: "power_decision",
      label: "Decide how to handle the power fault",
      check: (state) => Boolean(state.decisions.power_junction),
    },
  ],

  briefing: {
    kicker: "SOL 1 · MARS SURFACE",
    title: "Touchdown at Jezero",
    body: [
      "Your crew is down. The outpost is on backup power, and the secondary bus is unstable.",
      "Before sunset: inspect the power junction, check life support, and meet your three specialists. Then decide whether to repair the fault tonight.",
    ],
    site: JEZERO_SITE,
    weather: DONKI_ADVISORY,
    source: NASA_SOURCES.donki,
    startLabel: "Begin EVA",
  },

  interactions: {
    rocket: {
      eyebrow: "MISSION LOG · ARRIVAL",
      title: "Ares Lander",
      body: [
        "Touchdown confirmed at the Jezero delta. Hull intact. Cargo secure.",
        "The lander stays on the pad as your return ticket. For now, the outpost is home.",
      ],
      source: JEZERO_SITE.note,
    },

    power_junction: {
      eyebrow: "SYSTEM · POWER BUS",
      title: "Power Junction",
      body: [
        "Secondary bus at 62%. Storage is nominal, but the connector is arcing under the dust cover.",
        "Kai can patch it before sunset. It will cost parts and time.",
      ],
      note: "System status is a game value, not a NASA measurement.",
      choices: [
        {
          id: "repair",
          label: "Repair now",
          detail: "Kai patches the bus before sunset.",
          cost: { spareParts: 2, storedPower: 4 },
          effects: { powerCondition: 15, habitatSafety: 2 },
          fatigue: { kai: 6 },
          setFlags: ["powerUnitRepaired"],
          result:
            "Kai seals the connector and reroutes the bus. Power condition rises to 77%. Two spare parts are gone, and Kai is tired but satisfied.",
          toast: "Power bus repaired",
        },
        {
          id: "diagnose",
          label: "Diagnose first",
          detail: "Spend a little power to isolate the fault. Repair tomorrow.",
          cost: { storedPower: 1 },
          setFlags: ["powerDiagnosed"],
          result:
            "Kai isolates the fault and logs a repair plan. The bus stays on backup power overnight, but tomorrow's repair will be cheaper.",
          toast: "Power fault diagnosed",
        },
        {
          id: "postpone",
          label: "Postpone",
          detail: "Save the parts. The bus may degrade overnight.",
          setFlags: ["powerUnitPostponed"],
          result:
            "You leave the bus on backup power. The crew gets an early night, but the fault is still there.",
          toast: "Power repair postponed",
        },
      ],
    },

    life_support: {
      eyebrow: "SYSTEM · LIFE SUPPORT",
      title: "Water Recycler",
      body: [
        "Water loop at 88%. Oxygen steady. The filter is due in two days.",
        "Nova wants to stay ahead of it. The greenhouse will make the water budget tighter.",
      ],
      note: "Next: CSA food-production guidance for Sol 2.",
      source: "Game status; Sol 2 reference: Canadian Space Agency food-production toolkit.",
    },

    kai: {
      eyebrow: "CREW · MISSION ENGINEER",
      title: "Kai",
      body: [
        "I can patch the bus before sunset. Two spares, one hour, and I'll be late for dinner.",
        "If you want to save the parts, I can diagnose it instead. Your call, Commander.",
      ],
      quote: "I don't mind tired. I mind leaving a fault in the dark.",
    },

    nova: {
      eyebrow: "CREW · LIFE SUPPORT",
      title: "Nova",
      body: [
        "Water's fine today. The filter won't be fine on Sol 3.",
        "If we push the greenhouse, we'll need both. I'd rather fix the filter before it fixes us.",
      ],
      quote: "Every system talks. You just have to listen before it shouts.",
    },

    rex: {
      eyebrow: "CREW · SCIENCE OFFICER",
      title: "Rex",
      body: [
        "Jezero's delta is right there. Give me a rover window and I'll bring back samples worth the trip.",
        "We came here to learn something. Let's not forget that while we chase spare parts.",
      ],
      quote: "The safest mission is the one that never leaves the pad. It's also the least useful.",
    },

    habitat: {
      eyebrow: "OUTPOST · HABITAT",
      title: "Habitat Dome",
      body: [
        "Pressurized. Warm. The only place on Mars with a coffee machine.",
        "Three crew racks, one galley, and a wall of checklists. Home, for the next five sols.",
      ],
    },
  },
};

export const DAYS = {
  1: DAY01,
};
