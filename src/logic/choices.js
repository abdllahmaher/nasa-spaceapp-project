import { applyEffects, canAfford, formatCost, payCost } from "./resources";
import { completeSubtask } from "./missions";

function unique(list) {
  return [...new Set(list)];
}

/** Record that the commander has seen an interaction. */
export function markSeen(state, targetId) {
  const seen = Array.isArray(state.seen) ? state.seen : [];
  if (seen.includes(targetId)) return state;
  return { ...state, seen: [...seen, targetId] };
}

/**
 * Applies one authored choice to the mission state and returns the next state.
 *
 * The story layer supplies the choice; this function only knows costs, effects
 * and which subtask (if any) the choice completes. A choice never marks a
 * mission complete on its own — it asks the mission system to do it.
 */
export function applyChoice(state, interaction, choice, options = {}) {
  if (!canAfford(state.resources, choice.cost)) {
    return {
      ok: false,
      message: `Not enough resources. Required: ${formatCost(choice.cost)}.`,
    };
  }

  let next = structuredClone(state);

  next.resources = payCost(next.resources, choice.cost);
  next.resources = applyEffects(next.resources, choice.effects);

  if (choice.fatigue) {
    for (const [crewId, amount] of Object.entries(choice.fatigue)) {
      if (next.crew[crewId]) {
        next.crew[crewId].fatigue = Math.min(100, next.crew[crewId].fatigue + amount);
      }
    }
  }

  const removed = new Set(choice.removeFlags ?? []);
  next.flags = unique([...next.flags, ...(choice.setFlags ?? [])]).filter(
    (flag) => !removed.has(flag),
  );

  next.decisions = { ...next.decisions, [interaction.targetId]: choice.id };
  next.seen = unique([...next.seen, interaction.targetId]);

  // A choice may clear a persistent problem directly.
  if (choice.clears) {
    next.eventHistory = unique([...next.eventHistory, ...choice.clears]);
  }

  // The mission system owns completion, including the station it commissions.
  if (choice.complete) {
    next = completeSubtask(next, choice.complete, options.subtasks ?? []);
  }

  return {
    ok: true,
    state: next,
    result: choice.result ?? "Done!",
    toast: choice.toast ?? `${interaction.title}: ${choice.label}`,
    scene: choice.scene ?? null,
    // Branching stays in the data: the app simply opens the next node.
    next: choice.next ?? null,
  };
}
