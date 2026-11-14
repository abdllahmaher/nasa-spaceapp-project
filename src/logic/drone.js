import { activeEvents } from "./events";
import { applyEffects } from "./resources";
import { isSubtaskDone, subtaskGroups } from "./missions";

/**
 * PIP — the outpost drone.
 *
 * The drone is the game's voice: it teaches the first Sol, hands out the task
 * list, warns about problems, asks the day's decision and offers sleep. It owns
 * no game rules of its own — it reads missions, events and resources and turns
 * them into something a nine-year-old can act on.
 */

const list = (value) => (Array.isArray(value) ? value : []);

/** Resource thresholds the drone is allowed to shout about. */
const RESOURCE_ALERTS = [
  { key: "storedPower", below: 25, level: "critical", title: "Battery almost empty", detail: "The reserve is nearly gone. Check the power junction before night." },
  { key: "lifeSupportCondition", below: 40, level: "critical", title: "Air system struggling", detail: "The recycler is working too hard. Clean the intake or check the seal." },
  { key: "water", below: 25, level: "warning", title: "Water running low", detail: "The reserve is below a quarter. Refill it or clean the filter." },
  { key: "food", below: 25, level: "warning", title: "Food running low", detail: "Rations are below a quarter. Plan a resupply before the end of the week." },
  { key: "habitatSafety", below: 45, level: "critical", title: "Habitat seal weak", detail: "Pressure is dropping. Ask Kai to check the seal." },
];

/** Everything the drone should tell the player right now. */
export function droneAlerts(state) {
  const alerts = [];

  for (const event of activeEvents(state)) {
    alerts.push({
      id: `event:${event.id}`,
      level: event.severity === "critical" ? "critical" : "warning",
      title: event.title,
      detail: event.detail,
      kind: "event",
    });
  }

  for (const rule of RESOURCE_ALERTS) {
    const value = state.resources?.[rule.key] ?? 100;
    if (value >= rule.below) continue;
    alerts.push({
      id: `resource:${rule.key}`,
      level: rule.level,
      title: rule.title,
      detail: rule.detail,
      kind: "resource",
    });
  }

  // Critical first, so the drone always shouts about the worst thing.
  return alerts.sort((a, b) => (a.level === b.level ? 0 : a.level === "critical" ? -1 : 1));
}

/** Alerts the player has not been told about yet. */
export function newAlerts(state) {
  const seen = new Set(list(state.drone?.seenAlerts));
  return droneAlerts(state).filter((alert) => !seen.has(alert.id));
}

/** Records alerts as delivered so the drone never repeats itself. */
export function markAlertsSeen(state, alerts) {
  if (!alerts.length) return state;
  const next = structuredClone(state);
  next.drone = { ...(next.drone ?? {}) };
  next.drone.seenAlerts = [...new Set([...list(next.drone.seenAlerts), ...alerts.map((a) => a.id)])];
  return next;
}

/** The task list the drone panel shows. */
export function droneTasks(state, day) {
  return subtaskGroups(state, day);
}

/** True when every task in one named group is done (used by the tour). */
export function groupComplete(state, day, groupName) {
  const tasks = list(day?.subtasks).filter(
    (subtask) => (subtask.group ?? "Today's mission") === groupName,
  );
  return tasks.length > 0 && tasks.every((subtask) => isSubtaskDone(state, subtask));
}

/** Is today's work finished? Drives the sleep button. */
export function dayComplete(state, day) {
  const subtasks = list(day?.subtasks);
  return subtasks.length > 0 && subtasks.every((subtask) => isSubtaskDone(state, subtask));
}

/** The decision this Sol is waiting on, or null when already answered. */
export function pendingDecision(state, day) {
  const decision = day?.decision;
  if (!decision) return null;
  if (state.decisionsByDay?.[day.day]) return null;
  if (!dayComplete(state, day)) return null;
  return decision;
}

/**
 * Applies a day decision. Options carry resource effects and flags; the choice
 * is recorded per Sol so later Sols can read it through `state.flags` and the
 * drone can remind the player what they chose.
 */
export function applyDecision(state, day, optionId) {
  const decision = day?.decision;
  const option = decision?.options?.find((entry) => entry.id === optionId);
  if (!decision || !option) return { ok: false, message: "That option is not available." };
  if (state.decisionsByDay?.[day.day]) return { ok: false, message: "You already decided this today." };

  const next = structuredClone(state);
  next.resources = applyEffects(next.resources, option.effects);
  next.flags = [...new Set([...list(next.flags), ...list(option.setFlags)])];
  next.decisionsByDay = { ...(next.decisionsByDay ?? {}), [day.day]: optionId };
  return {
    ok: true,
    state: next,
    result: option.reply,
    toast: option.toast ?? decision.shortTitle ?? decision.title,
  };
}

/** What the player chose on an earlier Sol, for callbacks and reminders. */
export function decisionFor(state, dayNumber, day) {
  const optionId = state.decisionsByDay?.[dayNumber];
  if (!optionId || !day?.decision) return null;
  return day.decision.options?.find((option) => option.id === optionId) ?? null;
}

/* ------------------------------------------------------------------ tutorial */

export const TUTORIAL_STEPS = ["greet", "meet", "bars", "free"];

export function tutorialStep(state) {
  const step = state.drone?.step;
  return TUTORIAL_STEPS.includes(step) ? step : "free";
}

export function setTutorialStep(state, step) {
  const next = structuredClone(state);
  next.drone = { ...(next.drone ?? {}), step };
  return next;
}
