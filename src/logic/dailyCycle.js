import { RESOURCES, applyDelta, formatResource } from "./resources";

function addFlag(state, flag) {
  if (!state.flags.includes(flag)) state.flags.push(flag);
}

/**
 * Resolves Sol 1 and produces the report shown before Sol 2.
 * All values are game values; the source notes are added by the story layer.
 */
export function endDay(state) {
  const before = { ...state.resources };
  const beforeCrew = {
    kai: state.crew.kai.fatigue,
    nova: state.crew.nova.fatigue,
    rex: state.crew.rex.fatigue,
  };
  const next = structuredClone(state);
  const notes = [];
  const apply = (key, delta, note) => {
    next.resources[key] = applyDelta(next.resources, key, delta);
    if (note) notes.push(note);
  };

  // Baseline overnight life-support load.
  apply("storedPower", -4, "Overnight baseline load: −4 power.");
  apply("water", -3, "Crew consumption: −3 water.");
  apply("food", -2, "Crew meals: −2 food.");
  apply("lifeSupportCondition", -1, "Filter wear: −1 life support.");

  const powerChoice = next.decisions.power_junction;

  if (powerChoice === "repair") {
    apply("habitatSafety", 1, "Stable power bus: +1 habitat safety.");
    addFlag(next, "powerBusStable");
  } else if (powerChoice === "postpone") {
    apply("powerCondition", -8, "Postponed fault: −8 power bus.");
    apply("habitatSafety", -3, "Backup load: −3 habitat safety.");
    addFlag(next, "powerRisk");
  } else if (powerChoice === "diagnose") {
    apply("powerCondition", -3, "Fault remains isolated: −3 power bus.");
    addFlag(next, "repairPlanned");
  } else {
    apply("powerCondition", -6, "Unresolved fault: −6 power bus.");
    addFlag(next, "powerRisk");
  }

  for (const member of Object.values(next.crew)) {
    member.fatigue = Math.min(100, member.fatigue + 4);
  }

  const flagsBefore = new Set(state.flags);
  const flagsAdded = next.flags.filter((flag) => !flagsBefore.has(flag));

  next.day = state.day + 1;
  next.completedEvents = [...next.completedEvents, "day01"];

  const changes = RESOURCES.filter(
    (resource) => before[resource.key] !== next.resources[resource.key],
  ).map((resource) => ({
    key: resource.key,
    label: resource.label,
    before: formatResource(resource.key, before[resource.key]),
    after: formatResource(resource.key, next.resources[resource.key]),
    delta: next.resources[resource.key] - before[resource.key],
  }));

  const report = {
    day: state.day,
    title: "Sol 1 report",
    changes,
    notes,
    flagsAdded,
    crew: [
      `Kai fatigue: ${beforeCrew.kai} → ${next.crew.kai.fatigue}`,
      `Nova fatigue: ${beforeCrew.nova} → ${next.crew.nova.fatigue}`,
      `Rex fatigue: ${beforeCrew.rex} → ${next.crew.rex.fatigue}`,
    ],
    nextDay: {
      kicker: "SOL 2 · NEXT BUILD",
      title: "The water recycler",
      body:
        "Nova's filter is due. Sol 2 will ask you to split water between the recycler, " +
        "the greenhouse, and the reserve, using the CSA food-production toolkit as a reference.",
    },
    sources: [
      "NASA DONKI notifications — preliminary CCMC space-weather research, retrieved 2026-11-13.",
      "NASA Mars Trek — MRO CTX Jezero mosaic, site context only.",
      "Game resource values are illustrative and are not NASA measurements.",
    ],
  };

  return {
    state: {
      ...next,
      lastReport: report,
    },
    report,
  };
}
