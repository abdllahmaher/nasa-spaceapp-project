import { activeEvents } from "./events";
import { applyEffects, canAfford, formatCost, payCost } from "./resources";
import { isSubtaskDone, openSubtasks, subtaskGroups } from "./missions";
import { getDay } from "../story/days";

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

/** Weather that deserves a warning the Sol before it lands. */
const INCOMING_WEATHER = {
  storm: {
    level: "critical",
    title: "Dust storm arriving tomorrow",
    detail: "A wall of dust is one Sol out. Secure the array and the air intake before it lands.",
  },
  dust: {
    level: "warning",
    title: "Dust on the way",
    detail: "Dust devils are expected tomorrow. Check the filters and panels today.",
  },
  frost: {
    level: "warning",
    title: "Hard frost tonight",
    detail: "Temperatures are dropping fast. Keep the crew and the seals warm before night.",
  },
};

/** "Something is coming" warnings read from tomorrow's weather. */
function forecastAlerts(state) {
  if ((state.day ?? 1) < 2) return [];
  const next = getDay((state.day ?? 1) + 1);
  const nextLevel = next?.briefing?.weather?.level ?? next?.weather?.level;
  const incoming = INCOMING_WEATHER[nextLevel];
  if (!incoming) return [];

  // Do not warn about a storm that is already overhead.
  const todayLevel = getDay(state.day)?.briefing?.weather?.level;
  if (todayLevel === nextLevel && nextLevel === "storm") return [];

  return [
    {
      id: `forecast:${next.day}:${nextLevel}`,
      kind: "forecast",
      ...incoming,
    },
  ];
}

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

  alerts.push(...forecastAlerts(state));

  // Critical first, then incoming forecasts, then the rest. A forecast leads
  // the warning block so the player has a Sol to prepare.
  const rank = (alert) =>
    alert.level === "critical" ? 0 : alert.kind === "forecast" ? 1 : 2;
  return alerts.sort((a, b) => rank(a) - rank(b));
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

/**
 * The task PIP should announce next, plus a key for the current open set.
 *
 * Keying on the whole open set means finishing any task re-triggers exactly
 * one guidance beat, even when the player does the list out of order. Closing
 * the bubble does not re-open it, because the key has already been recorded.
 */
export function nextGuidance(state, day) {
  const open = openSubtasks(state, day);
  const task = open[0] ?? null;
  if (!task) return null;
  return {
    task,
    open,
    key: `${state.day}:${open.map((subtask) => subtask.id).join("|")}`,
  };
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

  // Decision prices are real costs, not flavour: reject the option if the
  // outpost cannot pay for it instead of silently clamping to zero.
  if (!canAfford(state.resources, option.cost)) {
    return {
      ok: false,
      message: `Not enough resources. Required: ${formatCost(option.cost)}.`,
    };
  }

  const next = structuredClone(state);
  next.resources = payCost(next.resources, option.cost);
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
