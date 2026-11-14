/**
 * Persistent problems that follow the crew from Sol to Sol.
 *
 * Each event stays active while its `when` condition holds, drains resources
 * every night, and stops as soon as the crew resolves it (a subtask or choice
 * records it in `eventHistory`). Two events exist only because of an earlier
 * decision, which is how yesterday's choice reaches into today.
 */
const has = (state, flag) => (state.flags ?? []).includes(flag);

export const EVENTS = [
  {
    id: "power-buzz",
    title: "The power box is still buzzing",
    detail: "A loose connector heats up every night until Kai tightens it.",
    fix: "Ask Kai to fix the connector (Sol 2).",
    severity: "warning",
    night: { powerCondition: -1 },
    when: (state) => (state.day ?? 1) >= 2,
  },
  {
    id: "filter-clog",
    title: "Dust is clogging the water filter",
    detail: "The pump works harder for less water until the mesh is cleaned.",
    fix: "Ask Nova to clean the filter (Sol 2).",
    severity: "warning",
    night: { water: -1, lifeSupportCondition: -1 },
    when: (state) => (state.day ?? 1) >= 2,
  },
  {
    id: "dust-on-array",
    title: "Dust is settling on the solar array",
    detail: "A dusty panel makes a fraction of its power until it is cleaned.",
    fix: "Ask Kai to secure and clean the array (Sol 3).",
    severity: "warning",
    night: { storedPower: -1, powerCondition: -1 },
    when: (state) => (state.day ?? 1) >= 2,
  },
  {
    id: "storm-front",
    title: "The dust front is still with us",
    detail: "Grit in the air keeps the array below full output until the storm passes.",
    fix: "Repair the comms mast and let the front pass (Sol 4).",
    severity: "critical",
    night: { storedPower: -2 },
    when: (state) => (state.day ?? 1) >= 3,
  },
  {
    id: "thirsty-crew",
    title: "The crew is on half rations",
    detail: "Rationing saved the parts, but the recycler is straining and the crew is dry.",
    fix: "Seal the intake with Nova (Sol 3) or read the air log (Sol 4).",
    severity: "critical",
    night: { lifeSupportCondition: -1 },
    when: (state) => has(state, "filterRation"),
  },
  {
    id: "array-strain",
    title: "The array is strained",
    detail: "Running the panels through the storm left grit in the connectors.",
    fix: "Ask Rex to sweep the panels (Sol 4).",
    severity: "warning",
    night: { powerCondition: -1 },
    when: (state) => has(state, "arrayStrained"),
  },
  {
    id: "low-morale",
    title: "The crew is quiet",
    detail: "Nobody heard from home. It shows at meals.",
    fix: "Nothing fixes this except the ship arriving.",
    severity: "warning",
    night: { food: -1 },
    when: (state) => has(state, "stayedDark"),
  },
];

export function eventById(id) {
  return EVENTS.find((event) => event.id === id) ?? null;
}
