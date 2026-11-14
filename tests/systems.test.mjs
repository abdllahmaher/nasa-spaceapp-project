import { createInitialState } from "../src/logic/initialState.js";
import { getDay, resolveDay } from "../src/story/days/index.js";
import { applyChoice } from "../src/logic/choices.js";
import { endDay } from "../src/logic/dailyCycle.js";
import { activeEvents } from "../src/logic/events.js";
import { normalizeState } from "../src/logic/save.js";
import {
  applyDecision,
  dayComplete,
  droneAlerts,
  droneTasks,
  groupComplete,
  markAlertsSeen,
  newAlerts,
  pendingDecision,
  setTutorialStep,
  tutorialStep,
} from "../src/logic/drone.js";
import { isSubtaskDone, isSubtaskOpen } from "../src/logic/missions.js";
import { DRONE_BARS, DRONE_DAY_DONE, DRONE_GREET, DRONE_MEET, decisionNode } from "../src/data/drone/script.js";

let failures = 0;
const ok = (n) => console.log(`  ok   ${n}`);
const fail = (n, d) => { failures += 1; console.log(`  FAIL ${n} -> ${d}`); };
const check = (n, c, d = "") => (c ? ok(n) : fail(n, d));

const fresh = () => normalizeState(createInitialState());
const story = (state) => resolveDay(getDay(state.day), state);

function doSubtask(state, subtask) {
  const day = story(state);
  const node = day.interactions[subtask.target];
  const choice = (node?.choices ?? []).find((entry) => entry.complete === subtask.id);
  if (!choice) return { state, error: `no confirm for ${subtask.id} in ${subtask.target}` };
  const result = applyChoice(state, { ...node, targetId: subtask.target }, choice, { subtasks: day.subtasks });
  if (!result.ok) return { state, error: result.message };
  return { state: result.state };
}

function finishDay(state) {
  const day = story(state);
  let next = state;
  for (const subtask of day.subtasks) {
    if (isSubtaskDone(next, subtask)) continue;
    const out = doSubtask(next, subtask);
    if (out.error) return { state: next, error: out.error };
    next = out.state;
  }
  return { state: next };
}

console.log("Day compilation");
for (const d of [1, 2, 3, 4, 5, 6]) {
  const state = { ...fresh(), day: d };
  const day = story(state);
  check(`Sol ${d}: has one mission`, Boolean(day.mission?.title));
  check(`Sol ${d}: has subtasks`, day.subtasks.length >= 3, String(day.subtasks.length));
  check(`Sol ${d}: has a briefing`, (day.briefing?.lines ?? []).length > 0);
  check(`Sol ${d}: objective rows match tasks`, day.objectives.length === day.subtasks.length);
  // Sol 1 asks you to meet the crew before it hands out build tasks, so a
  // gated subtask only needs its confirm once its prerequisites are met.
  for (const subtask of day.subtasks.filter((entry) => !entry.requires)) {
    check(`Sol ${d}: ${subtask.id} has a confirm`, Boolean((day.interactions[subtask.target]?.choices ?? []).some((c) => c.complete === subtask.id)), "missing");
  }
}

console.log("Sol 1 is a guided tour");
{
  let s = fresh();
  check("tutorial starts at greet", tutorialStep(s) === "greet", tutorialStep(s));
  check("PIP greets with a bubble", DRONE_GREET.choices[0].tutorial === "meet");
  s = setTutorialStep(s, "meet");
  check("meet beat is a bubble too", DRONE_MEET.choices[0].tutorial === "meet");

  const day = story(s);
  const meetTasks = day.subtasks.filter((t) => t.group === "Meet the crew");
  check("three crew to meet", meetTasks.length === 3);
  const buildTasks = day.subtasks.filter((t) => t.group === "Today's mission");
  check("build tasks locked until met", buildTasks.every((t) => !isSubtaskOpen(s, t)));
  check("meet group starts incomplete", !groupComplete(s, day, "Meet the crew"));

  for (const task of meetTasks) {
    const out = doSubtask(s, task);
    if (out.error) fail(`meet ${task.id}`, out.error);
    s = out.state;
  }
  check("meet group completes", groupComplete(s, story(s), "Meet the crew"));
  check("build tasks unlock", buildTasks.every((t) => isSubtaskOpen(s, t)));

  const kai = story(s).interactions.kai;
  check("Kai switches to the build node", (kai.choices ?? []).some((c) => c.complete === "sol01_power"), JSON.stringify((kai.choices ?? []).map((c) => c.label)));
}

console.log("Sol 1 decision and its effect on Sol 2");
{
  const s = finishDay(fresh()).state;
  s.resources.water = 60;
  const day = story(s);
  check("all six Sol 1 tasks done", dayComplete(s, day));
  const decision = pendingDecision(s, day);
  check("a decision is waiting", Boolean(decision), "none");
  check("PIP asks it with two options", decisionNode(day).choices.length === 2);

  const ice = applyDecision(s, day, "ice");
  check("ice decision applies", ice.ok, ice.message);
  check("ice fills the reserve", ice.state.resources.water > s.resources.water, `${s.resources.water} -> ${ice.state.resources.water}`);
  check("ice is recorded for later Sols", ice.state.decisionsByDay[1] === "ice");
  check("ice sets its flag", ice.state.flags.includes("surveyIce"));
  check("decision cannot be answered twice", !applyDecision(ice.state, day, "rim").ok);
  check("decision clears the sleep lock", pendingDecision(ice.state, day) === null);
}

console.log("Cross-day consequences");
{
  let s = { ...fresh(), day: 2 };
  s = finishDay(s).state;
  const day2 = story(s);
  check("Sol 2 asks its own decision", Boolean(pendingDecision(s, day2)));
  const ration = applyDecision(s, day2, "ration");
  check("rationing sets its flag", ration.state.flags.includes("filterRation"));
  check("rationing creates the thirsty-crew event", activeEvents(ration.state).some((e) => e.id === "thirsty-crew"), JSON.stringify(activeEvents(ration.state).map((e) => e.id)));

  const strained = { ...fresh(), day: 3, flags: ["arrayStrained"] };
  check("array strain event is active", activeEvents(strained).some((e) => e.id === "array-strain"));

  const dark = { ...fresh(), day: 5, flags: ["stayedDark"] };
  check("staying dark costs food", activeEvents(dark).some((e) => e.id === "low-morale"));
}

console.log("PIP's alerts");
{
  const s = fresh();
  s.resources.storedPower = 12;
  const alerts = droneAlerts(s);
  check("low battery is critical", alerts.some((a) => a.id === "resource:storedPower" && a.level === "critical"));
  check("critical alerts come first", alerts[0].level === "critical");
  const first = newAlerts(s);
  check("new alerts are reported once", first.length > 0);
  const seen = markAlertsSeen(s, first);
  check("seen alerts are not repeated", newAlerts(seen).every((a) => !first.some((f) => f.id === a.id)));
}

console.log("PIP's panel lists every task");
{
  const s = fresh();
  const groups = droneTasks(s, story(s));
  check("two groups on Sol 1", groups.length === 2, JSON.stringify(groups.map((g) => g.name)));
  check("locked build tasks are marked", groups[1].tasks.every((t) => t.status === "locked"));
  check("meet tasks are open", groups[0].tasks.every((t) => t.status === "open"));
}

console.log("A full five-Sol playthrough");
{
  let s = fresh();
  const log = [];
  for (let d = 1; d <= 5; d += 1) {
    const out = finishDay(s);
    if (out.error) { fail(`Sol ${d} tasks`, out.error); break; }
    s = out.state;
    const day = story(s);
    check(`Sol ${d}: all tasks complete`, dayComplete(s, day));
    const decision = pendingDecision(s, day);
    if (decision) {
      const option = decision.options[d % decision.options.length].id;
      const applied = applyDecision(s, day, option);
      if (!applied.ok) fail(`Sol ${d} decision`, applied.message);
      s = applied.state;
      log.push(`Sol ${d}:${option}`);
    }
    const { state: next, report } = endDay(s);
    check(`Sol ${d}: recap is written`, Boolean(report.headline) && report.day === d);
    s = next;
  }
  check("reached Sol 6", s.day === 6, String(s.day));
  check("every Sol recorded a decision", Object.keys(s.decisionsByDay).length >= 5, JSON.stringify(s.decisionsByDay));
  check("resources never negative", Object.values(s.resources).every((v) => v >= 0), JSON.stringify(s.resources));
  check("crew fatigue capped", Object.values(s.crew).every((m) => m.fatigue <= 100));
  console.log("   choices:", log.join(" | "));
}

console.log("The drone's nudge and sleep");
{
  const s = finishDay(fresh()).state;
  check("day done offers sleep", dayComplete(s, story(s)));
  check("nudge bubble has a sleep action", DRONE_DAY_DONE.choices.some((c) => c.action === "sleep"));
  check("bars beat closes the tour", DRONE_BARS.choices[0].tutorial === "free");
}

console.log("Old saves still load");
{
  const legacy = normalizeState({ day: 3, resources: { water: 40 }, crew: { kai: {} } });
  check("legacy save gets drone memory", legacy.drone?.step === "free");
  check("legacy save gets decisions map", typeof legacy.decisionsByDay === "object");
  try { const r = endDay(legacy); ok(`legacy Sol 3 -> Sol ${r.state.day}`); } catch (e) { fail("legacy endDay", e.message); }
}

console.log(failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
