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
logic/profile.js       landing name + site, and the Sol/site text overlay
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
App.jsx -> DroneCompanion / DronePanel / HUD / InteractionModal /
           WeatherLayer / GuideTour / GameCanvas
```

## The drone

**In the world** (`components/DroneCompanion.jsx`): an overlay, not a canvas
entity, so it can bob, glow and dock at the screen edge without touching the
renderer. It renders `assets/props/drone.png`; the CSS-drawn body remains as a
fallback when no sprite is available.

**In the story** (`data/drone/script.js`): every beat is an ordinary bubble node
with `speaker: "drone"`. Generic beats (greeting, mornings, decisions, alerts)
use the normal full-screen `InteractionModal`. The bubble resolves
`PORTRAITS.drone`, which uses the same `assets/props/drone.png` sprite, so PIP
speaks with the same face he flies with.

**Spotlight tours** (`components/GuideTour.jsx`): a node with a `guide` block
opens a guided tour instead. PIP flies next to the subject, the rest of the
game is dimmed, and the subject stays inside a bright cut-out. UI subjects are
marked with `data-pip-target` (the HUD meters use this); world subjects are
measured by `GameCanvas` through `guideTargetId` / `onGuideRect`, which also
eases the camera to the character. Each step carries its own title and line,
and the last button applies the node's normal tutorial choice.

**In the UI** (`components/DronePanel.jsx`): mission, progress, grouped tasks
(open / done / locked), alerts, the waiting decision, and the sleep button. The
panel header shows the same sprite. The old HUD task card and End Day button
were removed — the drone owns them now.

## Alerts

`droneAlerts` merges three sources: active events, resource thresholds, and a
forecast read from tomorrow's Sol briefing (`storm`, `dust`, `frost`). Critical
alerts rank first, then forecasts, then ordinary warnings.

The panel shows one prominent banner for the worst alert plus a "+N more"
count; tapping it opens PIP's warning bubble. While any alert exists, the drone
itself gains a pulsing ring, a badge, and a floating callout anchored beside
it, so the player sees the warning without opening a list.

## Weather

`components/WeatherLayer.jsx` reads `story.briefing.weather.level` and renders
the matching Framer Motion preset (`storm`, `dust`, `haze`, `frost`) above the
canvas: a tinted wash, drifting cloud blobs, wind gusts, and particles (dust
streaks, haze motes, or ice crystals). The layer is pointer-transparent and
skipped entirely for players who prefer reduced motion — they still get the
tint and vignette. Each Sol declares its level in its data file; changing the
level changes the effect with no component changes.

## Landing profile

The landing page (`index.html`) owns the only player setup: a name and one of two
sites (`jezero`, `meridiani`). It passes them in the game URL and mirrors them in
`localStorage`. `logic/profile.js` resolves the URL first, then storage, and
exports `PLAYER_NAME`, `COMMANDER`, `ACTIVE_SITE` and `applySiteToDay`.

`buildDay` runs the authored Sol through `applySiteToDay`, which replaces the
site metadata, weather provenance and the few Jezero-specific geology lines, and
adds the commander's name to story text. Objectives keep their original check
functions; only display strings change, so the mission rules are untouched.
`getScene(map)` swaps the panorama (`data/world/backgrounds.js`) while sharing
the same outpost entities.

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
2. **Tasks** — the panel lists them in groups and keeps a "Next up" card at the
   top; a click walks Layla over and the conversation starts on arrival. PIP
   also announces the next open task himself after the morning line and after
   every completion. The announcement is keyed to the current open-task set, so
   each step is announced exactly once even when tasks are done out of order.
3. **Completion** — `completeSubtask` marks progress, commissions the station,
   applies the effect, clears any problem. `applyChoice` checks the task's
   `cost` together with the choice's `cost` *before* changing anything, pays it
   once and tells `completeSubtask` not to charge again. A finished subtask is
   idempotent: reopening it (including through the "Why?" branch) never repeats
   the cost or the effect.
4. **Decision** — when every task is done, PIP asks the day's question. Options
   declare `cost` separately from `effects`: the bubble disables an option the
   outpost cannot afford and `applyDecision` rejects it, so a price is never
   paid by clamping a resource at zero.
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
