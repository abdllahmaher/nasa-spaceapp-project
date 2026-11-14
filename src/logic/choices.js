import { applyEffects, canAfford, formatCost, payCost } from "./resources";
import { completeSubtask, isSubtaskDone } from "./missions";

function unique(values) {
  return [...new Set(values)];
}

const list = (value) => (Array.isArray(value) ? value : []);

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
  const subtasks = list(options.subtasks);
  const subtask = choice.complete
    ? subtasks.find((entry) => entry.id === choice.complete)
    : null;

  // Reopening a finished task (including through the "Why?" branch) must not
  // charge the player or apply the same effects twice.
  if (subtask && isSubtaskDone(state, subtask)) {
    return {
      ok: true,
      state,
      result: choice.result ?? "Already done.",
      toast: choice.toast ?? `${interaction.title}: already done`,
      scene: null,
      next: null,
    };
  }

  // A choice can pay its own price and a subtask price (Sol 4's mast). Both
  // are checked up front, so a task can never be completed for free.
  const cost = { ...(choice.cost ?? {}) };
  for (const [key, amount] of Object.entries(subtask?.cost ?? {})) {
    cost[key] = (cost[key] ?? 0) + amount;
  }

  if (!canAfford(state.resources, cost)) {
    return {
      ok: false,
      message: `Not enough resources. Required: ${formatCost(cost)}.`,
    };
  }

  let next = structuredClone(state);

  next.resources = payCost(next.resources, cost);
  next.resources = applyEffects(next.resources, choice.effects);

  if (choice.fatigue) {
    for (const [crewId, amount] of Object.entries(choice.fatigue)) {
      if (next.crew[crewId]) {
        next.crew[crewId].fatigue = Math.min(100, next.crew[crewId].fatigue + amount);
      }
    }
  }

  const removed = new Set(choice.removeFlags ?? []);
  next.flags = unique([...list(next.flags), ...list(choice.setFlags)]).filter(
    (flag) => !removed.has(flag),
  );

  next.decisions = { ...(next.decisions ?? {}), [interaction.targetId]: choice.id };
  // A branch node can answer for the crew member's own bubble, so record the
  // choice under both ids. Reopening the main node then shows the result.
  if (choice.resultNode) next.decisions[choice.resultNode] = choice.id;
  next.seen = unique([...list(next.seen), interaction.targetId]);

  // A choice may clear a persistent problem directly.
  if (choice.clears) {
    next.eventHistory = unique([...list(next.eventHistory), ...list(choice.clears)]);
  }

  // The mission system owns completion, including the station it commissions.
  // Costs were already paid above, so it must not charge them again.
  if (choice.complete) {
    next = completeSubtask(next, choice.complete, subtasks, { applyCost: false });
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
