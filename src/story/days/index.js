import { SOL01 } from "../../data/sols/sol01";
import { SOL02 } from "../../data/sols/sol02";
import { SOL03 } from "../../data/sols/sol03";
import { SOL04 } from "../../data/sols/sol04";
import { SOL05 } from "../../data/sols/sol05";
import { crewTask, mergeNodes } from "../../data/sols/helpers";
import { objectivesFromSubtasks } from "../../logic/missions";
import { ACTIVE_SITE, applySiteToDay } from "../../logic/profile";
import { JEZERO_SITE } from "../../data/nasa/sources";

/**
 * The day layer.
 *
 * A Sol is authored as data (mission + subtasks + dialogue + events) and this
 * module compiles it into the shape the rest of the game already speaks:
 * `objectives` for the HUD and `interactions` for the chat bubble. Nothing
 * downstream knows that missions exist — which is why the UI did not change.
 */
const SOLS = { 1: SOL01, 2: SOL02, 3: SOL03, 4: SOL04, 5: SOL05 };

const ROTATION = [
  {
    icon: "bolt",
    label: "Check the power reserve with Kai",
    target: "kai",
    why: "Reserves drift with the weather, so a reading every Sol keeps us honest.",
  },
  {
    icon: "drop",
    label: "Check the air and water with Nova",
    target: "nova",
    why: "Life support is the one system we can never let drift.",
  },
  {
    icon: "crew",
    label: "Collect Rex's surface report",
    target: "rex",
    why: "The surface changes every Sol. New streaks mean new wind directions.",
  },
];

/** Sols beyond the authored five continue with a scheduled science watch. */
function generatedSol(day) {
  const subtasks = ROTATION.map((item) => ({
    id: `sol${day}_${item.target}`,
    icon: item.icon,
    label: item.label,
    target: item.target,
    why: item.why,
    how: "Walk to the crew member and confirm the check.",
  }));

  const dialogue = mergeNodes(
    ...subtasks.map((subtask, index) =>
      crewTask({
        target: subtask.target,
        speaker: subtask.target,
        eyebrow: `CREW RADIO · SOL ${day}`,
        title: ROTATION[index].label,
        lines: [
          `Commander, this is ${subtask.target[0].toUpperCase() + subtask.target.slice(1)} on Sol ${day}.`,
          `${ROTATION[index].label}. I have the reading ready for you.`,
        ],
        why: [subtask.why, "Every check makes tomorrow's plan a little safer."],
        subtaskId: subtask.id,
        confirmLabel: "Log the reading",
        detail: "Record the reading in today's mission log.",
        result: "Logged, Commander. Nothing unusual today.",
        toast: "Reading logged",
      }),
    ),
  );

  return {
    day,
    location: "Jezero Crater",
    coordinates: JEZERO_SITE.coordinates,
    mission: {
      id: `science-watch-${day}`,
      title: `Science Watch · Sol ${day}`,
      brief: "A scheduled check of the outpost systems.",
      why: "Routine checks catch small problems before they grow.",
    },
    briefing: {
      kicker: `SOL ${day} · JEZERO`,
      title: `Sol ${day}: science watch`,
      speaker: "layla",
      lines: [
        `Welcome to Sol ${day}, crew. Today's checks are ready.`,
        "Same outpost, same crew, three new readings to log.",
      ],
      hint: "Three crew check-ins complete the Sol.",
      startLabel: `Start Sol ${day}`,
      site: JEZERO_SITE,
      weather: {
        headline: "Settling haze",
        level: "haze",
        line: "Fine dust can hang in the air for days after a gust. This is an observed Jezero condition, not a forecast.",
        issuedAt: "Jezero observations",
        source: "NASA/JPL Perseverance observations",
        sourceUrl: "https://science.nasa.gov/mars/the-mars-report/",
      },
    },
    subtasks,
    dialogue,
    events: [],
  };
}

/** Compiles one Sol of authored data into the runtime day object. */
export function buildDay(sol, site = ACTIVE_SITE) {
  return applySiteToDay(
    {
      day: sol.day,
      location: sol.location,
      coordinates: sol.coordinates,
      mission: sol.mission,
      subtasks: sol.subtasks,
      events: sol.events ?? [],
      decision: sol.decision ?? null,
      briefing: sol.briefing,
      objectives: objectivesFromSubtasks(sol.subtasks),
      interactions: sol.dialogue,
    },
    site,
  );
}

/**
 * Resolves story text against the save. A field may be a plain value or a
 * function of state, which is how a Sol's briefing can remember yesterday.
 */
export function resolveDay(day, state) {
  const value = (entry) => (typeof entry === "function" ? entry(state) : entry);
  // A crew member can say different things as the Sol moves on (meet, then
  // build), so an interaction entry may be a function of state.
  const interactions = Object.fromEntries(
    Object.entries(day.interactions ?? {}).map(([key, entry]) => [key, value(entry)]),
  );
  return {
    ...day,
    interactions,
    mission: day.mission
      ? {
          ...day.mission,
          brief: value(day.mission.brief),
          why: value(day.mission.why),
        }
      : day.mission,
    briefing: day.briefing
      ? {
          ...day.briefing,
          title: value(day.briefing.title),
          lines: value(day.briefing.lines) ?? [],
          hint: value(day.briefing.hint),
        }
      : day.briefing,
    decision: day.decision
      ? {
          ...day.decision,
          title: value(day.decision.title),
          question: value(day.decision.question),
          stakes: value(day.decision.stakes),
        }
      : day.decision,
  };
}

export function getDay(day, site = ACTIVE_SITE) {
  const sol = SOLS[day] ?? generatedSol(day);
  return buildDay(sol, site);
}

export { SOL01, SOL02, SOL03, SOL04, SOL05 };
