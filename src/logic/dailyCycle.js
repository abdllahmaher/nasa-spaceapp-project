import { applyDelta } from "./resources";
import { activeEvents, nightlyEventDelta } from "./events";

/** Overnight consequences, written as short kid-readable outcomes. */
const POWER_NOTES = {
  repair: "Kai's fix held all night. Nice work!",
  diagnose: "Kai found the loose wire. Tomorrow it's an easy fix.",
  postpone: "The power box buzzed all night… Brr.",
};

const DEFAULT_HEADLINE = "The outpost made it through the night.";

/** Headline for the recap, resolved from the Sol's power decision only. */
function powerHeadline(decisions) {
  const choice = decisions?.power_junction;
  return POWER_NOTES[choice] ?? DEFAULT_HEADLINE;
}

/** What the outpost burns every night once it is running. */
const NIGHT_COST = [
  ["storedPower", -4],
  ["water", -3],
  ["food", -2],
  ["lifeSupportCondition", -1],
];

/** The solar array refills the reserve every night it is standing. */
const ARRAY_OUTPUT = 5;

const NEXT_DAY_TITLES = {
  2: "Water and habitat checks",
  3: "Dust and power watch",
  4: "Morning sky and habitat",
  5: "Dust observation window",
};

const list = (value) => (Array.isArray(value) ? value : []);

/**
 * Resolves one Sol: consumption, solar production, persistent events, crew
 * rest, then the recap shown before the next Sol.
 *
 * Every field is read defensively — an older save may be missing `decisions`,
 * `seen`, `flags`, `crew`, `builds` or `doneSubtasks`, and a night transition
 * must never crash the game because of that.
 */
export function endDay(state) {
  const current = state ?? {};
  const before = { ...(current.resources ?? {}) };
  const next = structuredClone(current);

  next.resources = { ...(current.resources ?? {}) };
  next.crew = { ...(current.crew ?? {}) };
  next.flags = [...list(current.flags)];
  next.builds = [...list(current.builds)];
  next.eventHistory = [...list(current.eventHistory)];

  const running = (current.day ?? 1) > 1;

  if (running) {
    // 1. The outpost uses power, water, food and air.
    for (const [key, delta] of NIGHT_COST) {
      next.resources[key] = applyDelta(next.resources, key, delta);
    }
    // 2. A standing solar array puts power back.
    if (next.builds.includes("power-junction")) {
      next.resources.storedPower = applyDelta(next.resources, "storedPower", ARRAY_OUTPUT);
    }
    // 3. Unresolved problems cost extra until the crew fixes them.
    for (const [key, delta] of Object.entries(nightlyEventDelta(current))) {
      next.resources[key] = applyDelta(next.resources, key, delta);
    }
  }

  for (const member of Object.values(next.crew)) {
    if (!member) continue;
    member.fatigue = Math.min(100, (member.fatigue ?? 0) + 4);
  }

  const finished = list(current.doneSubtasks);
  next.day = (current.day ?? 1) + 1;
  next.version = 2;
  // Interaction progress and choices belong to one Sol only. Subtask ids are
  // unique per Sol, so the completion log can safely carry over as history.
  next.seen = [];
  next.decisions = {};
  next.doneSubtasks = finished;
  next.mission = {
    ...(current.mission ?? {}),
    objectivesCompleted: [...new Set([...list(current.mission?.objectivesCompleted), ...finished])],
  };
  next.completedEvents = [
    ...new Set([...list(current.completedEvents), `day${String(current.day ?? 1).padStart(2, "0")}`]),
  ];

  const rows = [
    { key: "storedPower", label: "Power", icon: "bolt", max: 100 },
    { key: "lifeSupportCondition", label: "Air", icon: "drop", max: 100 },
    { key: "food", label: "Food", icon: "leaf", max: 100 },
  ];

  // The problems that are still waiting for the crew tomorrow.
  const open = activeEvents(next);

  const report = {
    day: current.day ?? 1,
    title: `Sol ${current.day ?? 1} done!`,
    headline: powerHeadline(current.decisions),
    changes: rows.map((row) => ({
      ...row,
      before: before[row.key] ?? 0,
      after: next.resources[row.key] ?? 0,
      delta: (next.resources[row.key] ?? 0) - (before[row.key] ?? 0),
    })),
    note: open.length
      ? `Still open: ${open[0].title.toLowerCase()}.`
      : "Everyone is safe in the dome.",
    nextDay: {
      icon: "drop",
      kicker: `SOL ${next.day}`,
      title: NEXT_DAY_TITLES[next.day] ?? `Science watch · Sol ${next.day}`,
      line: "A new set of crew check-ins and objectives is ready for the next Sol.",
    },
    completedSubtasks: finished.filter((id) => String(id).startsWith(`sol${String(current.day ?? 1).padStart(2, "0")}_`)),
    events: open.map((event) => ({ id: event.id, title: event.title, severity: event.severity })),
    source: "NASA Mars weather archives are historical observations, not a forecast for Jezero.",
  };

  return {
    state: { ...next, lastReport: report },
    report,
  };
}
