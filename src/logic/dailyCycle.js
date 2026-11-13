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

  // Sol 1 is construction and commissioning only: no resource consumption.
  if (state.day > 1) {
    next.resources.storedPower = applyDelta(next.resources, "storedPower", -4);
    next.resources.water = applyDelta(next.resources, "water", -3);
    next.resources.food = applyDelta(next.resources, "food", -2);
    next.resources.lifeSupportCondition = applyDelta(next.resources, "lifeSupportCondition", -1);
  }

  // The construction-only first Sol has no resource decisions or penalties.
  // Later Sols resolve their own mission outcomes without replaying Sol 1 choices.

  for (const member of Object.values(next.crew)) {
    member.fatigue = Math.min(100, member.fatigue + 4);
  }

  next.day = state.day + 1;
  next.version = 2;
  // Interaction progress and choices belong to one Sol only. Keeping these
  // arrays caused the next Sol to inherit completed objectives from yesterday.
  next.seen = [];
  next.decisions = {};
  next.completedEvents = [...new Set([...next.completedEvents, `day${String(state.day).padStart(2, "0")}`])];

  const rows = [
    { key: "storedPower", label: "Power", icon: "bolt", max: 100 },
    { key: "lifeSupportCondition", label: "Air", icon: "drop", max: 100 },
    { key: "food", label: "Food", icon: "leaf", max: 100 },
  ];

  const report = {
    day: state.day,
    title: `Sol ${state.day} done!`,
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
      kicker: `SOL ${next.day}`,
      title: ({2:"Water and habitat checks",3:"Dust and power watch",4:"Morning sky and habitat",5:"Dust observation window"})[next.day] ?? `Science watch · Sol ${next.day}`,
      line: "A new set of crew check-ins and objectives is ready for the next Sol.",
    },
    source: "NASA Mars weather archives are historical observations, not a forecast for Jezero.",
  };

  return {
    state: { ...next, lastReport: report },
    report,
  };
}
