import { applyEffects, payCost } from "./resources";

/**
 * Mission and subtask runtime.
 *
 * Missions are plain data (`src/data/sols/*`). This module is the only place
 * that decides whether a subtask is available, finished, or has side effects,
 * so the mission system stays the single source of truth for progress.
 * The chat layer may *request* a completion; it never decides one.
 */

const list = (value) => (Array.isArray(value) ? value : []);

/** Subtasks finished on this Sol or any earlier one. */
export function isSubtaskDone(state, subtask) {
  if (!subtask) return false;
  return list(state.doneSubtasks).includes(subtask.id);
}

/** Prerequisites met? A subtask with no `requires` is always available. */
export function isSubtaskAvailable(state, subtask) {
  if (!subtask) return false;
  return list(subtask.requires).every((id) => list(state.doneSubtasks).includes(id));
}

/** A finished subtask is never "available" again. */
export function isSubtaskOpen(state, subtask) {
  return isSubtaskAvailable(state, subtask) && !isSubtaskDone(state, subtask);
}

/** "done" | "locked" (prerequisites missing) | "open" — what the drone shows. */
export function subtaskStatus(state, subtask) {
  if (isSubtaskDone(state, subtask)) return "done";
  if (!isSubtaskAvailable(state, subtask)) return "locked";
  return "open";
}

/** The task list the drone panel renders, grouped in authoring order. */
export function subtaskGroups(state, day) {
  const groups = [];
  for (const subtask of list(day?.subtasks)) {
    const name = subtask.group ?? "Today's mission";
    let group = groups.find((entry) => entry.name === name);
    if (!group) {
      group = { name, tasks: [] };
      groups.push(group);
    }
    group.tasks.push({ subtask, status: subtaskStatus(state, subtask) });
  }
  return groups;
}

/** Only the tasks the player may actually start right now. */
export function openSubtaskCount(state, day) {
  return list(day?.subtasks).filter((subtask) => isSubtaskOpen(state, subtask)).length;
}

export function missionOf(day) {
  return day?.mission ?? null;
}

/** Completed / total for the Sol's mission, used by the briefing and recap. */
export function missionProgress(state, day) {
  const subtasks = list(day?.subtasks);
  const done = subtasks.filter((subtask) => isSubtaskDone(state, subtask)).length;
  return { done, total: subtasks.length, complete: subtasks.length > 0 && done === subtasks.length };
}

/**
 * Applies one subtask completion: progress, the station it commissions, its
 * resource effect and any event it clears. Idempotent, so a repeated choice
 * can never double-count.
 */
export function completeSubtask(
  state,
  subtaskId,
  subtasks = [],
  { applyCost = true } = {},
) {
  const subtask = subtasks.find((entry) => entry.id === subtaskId);
  if (!subtask || isSubtaskDone(state, subtask)) return state;

  const next = structuredClone(state);
  next.doneSubtasks = [...new Set([...list(next.doneSubtasks), subtask.id])];

  if (subtask.builds) {
    next.builds = [...new Set([...list(next.builds), subtask.builds])];
  }
  // Some tasks cost parts up front (a spare cartridge, a new bolt). The chat
  // layer passes `applyCost: false` when it already paid the cost up front.
  if (applyCost && subtask.cost) {
    next.resources = payCost(next.resources, subtask.cost);
  }
  if (subtask.effect) {
    next.resources = applyEffects(next.resources, subtask.effect);
  }
  if (subtask.clears) {
    next.eventHistory = [...new Set([...list(next.eventHistory), ...list(subtask.clears)])];
  }
  if (subtask.setsFlags) {
    next.flags = [...new Set([...list(next.flags), ...list(subtask.setsFlags)])];
  }
  return next;
}

/**
 * Compiles a Sol's subtasks into the objective rows the HUD already renders.
 * Keeping this shape means the HUD, quest tracking and world markers did not
 * have to change when missions were introduced.
 */
export function objectivesFromSubtasks(subtasks = []) {
  return subtasks.map((subtask) => ({
    id: subtask.id,
    icon: subtask.icon ?? "crew",
    label: subtask.label,
    targets: [subtask.target],
    // Locked tasks must not drop a "go here" pin on the world.
    targetOpen: (target, state) => isSubtaskOpen(state, subtask),
    check: (state) => isSubtaskDone(state, subtask),
    // Shown as the row tooltip: what the player will actually do there.
    hint: subtask.how ?? subtask.why ?? null,
  }));
}

/** Everything the player can still do today, in mission order. */
export function openSubtasks(state, day) {
  return list(day?.subtasks).filter((subtask) => isSubtaskOpen(state, subtask));
}

/** Which place should the "walk here" button point at next? */
export function nextTarget(state, day) {
  const open = openSubtasks(state, day);
  return open[0]?.target ?? null;
}
