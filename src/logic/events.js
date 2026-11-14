import { EVENTS } from "../data/events/index.js";

/**
 * Events are persistent problems, not cutscenes.
 *
 * An event starts when its `when(state)` condition turns true, keeps costing
 * resources every night until it is resolved, and is then recorded in
 * `eventHistory` so it can never start twice. That is what lets an unresolved
 * problem follow the crew into later Sols.
 */

const list = (value) => (Array.isArray(value) ? value : []);

export function allEvents() {
  return list(EVENTS);
}

export function isEventResolved(state, event) {
  return list(state.eventHistory).includes(event.id);
}

/** Active = condition met and never resolved. */
export function activeEvents(state) {
  return allEvents().filter(
    (event) => !isEventResolved(state, event) && (!event.when || event.when(state)),
  );
}

export function eventById(id) {
  return allEvents().find((event) => event.id === id) ?? null;
}

/**
 * Sums every active event's nightly effect into one resource delta.
 * Events never remove a resource below zero; `applyDelta` clamps that.
 */
export function nightlyEventDelta(state) {
  const delta = {};
  for (const event of activeEvents(state)) {
    for (const [key, amount] of Object.entries(event.night ?? {})) {
      delta[key] = (delta[key] ?? 0) + amount;
    }
  }
  return delta;
}

/** Resolves an event for good (called when a subtask or choice clears it). */
export function resolveEvent(state, eventId) {
  const next = structuredClone(state);
  next.eventHistory = [...new Set([...list(next.eventHistory), eventId])];
  return next;
}

/** Short lines for the recap card, written for children. */
export function eventLines(state) {
  return activeEvents(state).map((event) => ({
    id: event.id,
    title: event.title,
    detail: event.detail,
    severity: event.severity ?? "warning",
  }));
}
