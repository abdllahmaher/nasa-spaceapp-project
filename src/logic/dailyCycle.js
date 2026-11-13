import { applyDelta } from "./resources";

function addFlag(state, flag) {
  if (!state.flags.includes(flag)) state.flags.push(flag);
}

/** Overnight consequences, written as short kid-readable outcomes. */
const POWER_NOTES = {
  repair: "Kai's fix held all night. Nice work!",
  diagnose: "Kai found the loose wire. Tomorrow it's an easy fix.",
  postpone: "The power box buzzed all night… Brr.",
};

/**
 * Resolves Sol 1 and produces the visual recap shown before Sol 2.
 * Values stay numeric so the UI can draw bars instead of percentages.
 */
export function endDay(state) {
  const before = { ...state.resources };
  const next = structuredClone(state);

  next.resources.storedPower = applyDelta(next.resources, "storedPower", -4);
  next.resources.water = applyDelta(next.resources, "water", -3);
  next.resources.food = applyDelta(next.resources, "food", -2);
  next.resources.lifeSupportCondition = applyDelta(
    next.resources,
    "lifeSupportCondition",
    -1,
  );

  const powerChoice = next.decisions.power_junction;

  if (powerChoice === "repair") {
    next.resources.habitatSafety = applyDelta(next.resources, "habitatSafety", 1);
    addFlag(next, "powerBusStable");
  } else if (powerChoice === "postpone") {
    next.resources.powerCondition = applyDelta(next.resources, "powerCondition", -8);
    next.resources.habitatSafety = applyDelta(next.resources, "habitatSafety", -3);
    addFlag(next, "powerRisk");
  } else if (powerChoice === "diagnose") {
    next.resources.powerCondition = applyDelta(next.resources, "powerCondition", -3);
    addFlag(next, "repairPlanned");
  } else {
    next.resources.powerCondition = applyDelta(next.resources, "powerCondition", -6);
    addFlag(next, "powerRisk");
  }

  for (const member of Object.values(next.crew)) {
    member.fatigue = Math.min(100, member.fatigue + 4);
  }

  next.day = state.day + 1;
  next.completedEvents = [...next.completedEvents, "day01"];

  const rows = [
    { key: "storedPower", label: "Power", icon: "bolt", max: 100 },
    { key: "lifeSupportCondition", label: "Air", icon: "drop", max: 100 },
    { key: "food", label: "Food", icon: "leaf", max: 100 },
  ];

  const report = {
    day: state.day,
    title: "Sol 1 done!",
    headline: POWER_NOTES[powerChoice] ?? "The outpost made it through the night.",
    changes: rows.map((row) => ({
      ...row,
      before: before[row.key],
      after: next.resources[row.key],
      delta: next.resources[row.key] - before[row.key],
    })),
    note: "Everyone is safe in the dome.",
    nextDay: {
      icon: "drop",
      kicker: "SOL 2",
      title: "Water day",
      line: "Nova will clean the water filter. The greenhouse needs a drink too.",
    },
    source: "Space weather: NASA DONKI (real data).",
  };

  return {
    state: { ...next, lastReport: report },
    report,
  };
}
