import { applyEffects, canAfford, formatCost, payCost } from "./resources";

function unique(list) {
  return [...new Set(list)];
}

/** Record that the commander has seen an interaction. */
export function markSeen(state, targetId) {
  if (state.seen.includes(targetId)) return state;
  return { ...state, seen: [...state.seen, targetId] };
}

/**
 * Applies one authored choice to the mission state and returns the next state.
 * The story layer supplies the choice; this function only knows costs/effects.
 */
export function applyChoice(state, interaction, choice) {
  if (!canAfford(state.resources, choice.cost)) {
    return {
      ok: false,
      message: `Not enough resources. Required: ${formatCost(choice.cost)}.`,
    };
  }

  const next = structuredClone(state);

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

  return {
    ok: true,
    state: next,
    result: choice.result ?? "Done!",
    toast: choice.toast ?? `${interaction.title}: ${choice.label}`,
    scene: choice.scene ?? null,
  };
}
