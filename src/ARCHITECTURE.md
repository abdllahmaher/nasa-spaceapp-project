# Mars Outpost — Architecture

The game is a **guided story**, not a discovery sandbox. PIP, the outpost drone,
is the voice that runs it: he teaches the first Sol, hands out the task list,
warns about problems, asks the day's decision and offers sleep. Every Sol is one
mission with clickable subtasks, and every decision reaches into the next Sol.

## The three rules

1. **The mission system is the only thing that decides a task is complete.**
   A chat choice *requests* a completion; `logic/missions.js` decides what that
   means (progress, station, resource effect, problem cleared).
2. **PIP never owns a rule.** He reads missions, events and resources and turns
   them into something a nine-year-old can act on.
3. **The chat bubble is a dumb renderer.** It receives a node and calls
   `onChoose`. All drone behaviour is data plus `App.jsx` wiring, which is why
   `InteractionModal.jsx` and `App.css`'s bubble rules never had to change.

## Layers

```
data/drone/script.js   PIP's tutorial beats, morning lines, warnings, decisions
data/sols/*.js         one mission per Sol: subtasks, dialogue, decision
data/events/index.js   persistent problems, including decision-made ones
        |
        v
story/days/index.js    compiles a Sol -> { objectives, interactions, decision }
                       and resolves story text against the save
        |
        v
logic/missions.js      availability, completion, side effects, task groups
logic/events.js        which problems are active, what they cost each night
logic/drone.js         alerts, task list, decisions, tutorial state
logic/choices.js       costs, effects, flags, requests completion
logic/dailyCycle.js    consumption, solar output, event cost, recap
        |
        v
App.jsx -> DroneCompanion / DronePanel / HUD / InteractionModal / GameCanvas
```

## The drone

**In the world** (`components/DroneCompanion.jsx`): an overlay, not a canvas
entity, so it can bob, glow and dock at the screen edge without touching the
renderer. It is drawn in CSS; pass `sprite` to swap in `assets/props/drone` and
nothing else changes.

**In the story** (`data/drone/script.js`): every beat is an ordinary bubble node
with `speaker: "drone"`. The bubble resolves `PORTRAITS.drone`, which is a
two-frame SVG of PIP, so he speaks with his own face without any change to the
bubble component.

**In the UI** (`components/DronePanel.jsx`): mission, progress, grouped tasks
(open / done / locked), alerts, the waiting decision, and the sleep button. The
old HUD task card and End Day button were removed — the drone owns them now.

## Sol data

```js
{
  day, location, coordinates,
  mission: { id, title, brief, why },
  briefing: { kicker, title, lines, hint, startLabel, weather },  // text may be a function of state
  subtasks: [Subtask],
  dialogue: { [nodeId]: Node | (state) => Node },   // a crew member changes what they say
  decision: { id, title, question, stakes, options: [Option] },
  events: ["dust-on-array"],
}
```

A subtask carries `group` ("Meet the crew", "Today's mission"), `requires`,
`builds`, `cost`, `effect`, `clears`, `setsFlags`. A dialogue node is the shape
the bubble already renders, plus `next`, `resultNode`, `complete`, `tutorial`,
`action` ("decision" | "sleep") and `optionId`.

## The Sol loop

1. **Morning** — PIP opens with a line that calls back yesterday's decision
   (`MORNING_LINES` reads `decisionsByDay[day-1]`).
2. **Tasks** — the panel lists them in groups; a click walks Layla over and the
   conversation starts on arrival.
3. **Completion** — `completeSubtask` marks progress, commissions the station,
   applies the effect, clears any problem.
4. **Decision** — when every task is done, PIP asks the day's question. Two
   options, each with resource effects and a flag.
5. **Sleep** — the drone offers the button; the night simulates consumption,
   solar output and every active event.
6. **Recap** — resource bars, the problem still open, the next Sol.

`canEndDay` is deliberately `tasksDone && !pendingDecision`, so a decision can
never be skipped by sleeping.

## Cross-day consequences

| Sol | Decision | Reaches into |
| --- | --- | --- |
| 1 | Survey the rim (parts) or the ice (water) | Sol 2 morning line, Sol 2 reserve |
| 2 | Fit the spare cartridge or ration water | `filterRation` creates the thirsty-crew event on Sol 3 |
| 3 | Tarp the array or keep it running | `arrayStrained` creates the array-strain event on Sol 4 |
| 4 | Call home or stay dark | `stayedDark` creates low-morale on Sol 5, changes Sol 5's briefing |
| 5 | Call the ship in or wait one more Sol | The finale, and the state you finish on |

Events read flags, never day counters, so a consequence cannot fire twice and a
resolved problem cannot come back.

## Conflicts and how they were avoided

- **The chat bubble was working.** `InteractionModal.jsx` and `App.css`'s bubble
  section are untouched. Branching, decisions, sleep and the tour are all data
  plus `App.jsx` handlers.
- **The HUD already spoke "objectives".** `objectivesFromSubtasks` still produces
  that shape for world markers, so the world layer needed no change.
- **Click-to-walk could stall on props.** Guided walks are now collision-free and
  have a stall guard, because a task the player clicked must always finish.
- **Old saves.** `normalizeState` fills `drone`, `decisionsByDay`, `builds` and
  `doneSubtasks`; an existing player skips the tour and keeps their outpost.
- **The old `story/days/day01…05.js`** were replaced by `data/sols/*` + the
  compiler; two sources of truth for one mission was the bigger risk.
