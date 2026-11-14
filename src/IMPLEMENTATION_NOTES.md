# Implementation Notes

What changed, why, and how to test it.

## New

| File | Purpose |
| --- | --- |
| `logic/drone.js` | PIP's brain: alerts, task groups, decisions, tutorial state |
| `data/drone/script.js` | tour beats, morning lines, warning + decision bubbles |
| `data/sols/sol01…sol05.js` | the five-Sol storyline with decisions |
| `components/DroneCompanion.jsx` | the drone in the world (CSS sprite, docked at the edge) |
| `components/DronePanel.jsx` | mission, tasks, alerts, decision, sleep |
| `tests/systems.test.mjs` | the automated checks below |

## Rewritten

| File | Change |
| --- | --- |
| `App.jsx` | PIP's beat machine, decisions, drone panel, sleep via the drone |
| `components/HUD.jsx` | now only the four bars — tasks and sleep moved to the drone |
| `logic/missions.js` | locked tasks, task groups, subtask costs |
| `logic/drone.js` | (new, see above) |
| `story/days/index.js` | `resolveDay` resolves story text and per-state crew nodes |
| `logic/events/index.js` | seven events, three of them created by decisions |
| `data/portraits.js` | PIP's portrait (two-frame SVG) so the bubble names him |
| `game/player.js` | guided walks are collision-free and stall-proof |
| `logic/save.js`, `logic/initialState.js` | `drone`, `decisionsByDay`, version 3 |

## Untouched

`components/InteractionModal.jsx`, `components/Portrait.jsx`,
`components/PixelIcon.jsx`, `components/BriefingModal.jsx`,
`components/DayBreak.jsx` and the bubble rules in `App.css`. The chat bubble you
asked me to protect is byte-identical; the drone speaks through it as data.

## The drone asset

The upload contained no `assets/` folder, so I could not wire `assets/props/drone`
directly. PIP is drawn in CSS (`DroneCompanion`) and as a two-frame SVG portrait
(`portraits.js`), so he always renders. To use your sprite:

```jsx
// App.jsx
<DroneCompanion ... sprite={droneUrl} />
```

with `import droneUrl from "./assets/props/drone.png"`. Nothing else changes.

## How to test

1. `npm run dev`, hard-reload with **Ctrl+Shift+R**, press **Reset**.
2. Landing plays. The briefing opens; press **Let's go!**.
3. **PIP greets you** — "Commander! Down here!" with his own portrait.
4. **"Deal. Show me around"** → the second beat explains the crew.
5. Click the drone (bottom-left). The panel shows **MEET THE CREW** (three open
   tasks) and **TODAY'S MISSION** (three locked ones, padlocked).
6. Click a name. Layla walks over and the crew member introduces themselves.
   Repeat for all three.
7. **PIP explains the four bars**, then the build tasks unlock.
8. Build all three stations from the panel. Each one is assembled on screen.
9. **PIP asks the first decision** — rim or ice. Pick one and read his answer.
10. **"Everything on the list is done"** → **Sleep · next Sol**.
11. Recap → **Sleep · Sol 2** → daybreak → **Begin New Sol**.
12. **PIP's Sol 2 line quotes your decision** ("The ice is real"), then the new
    task list appears. Watch for his alert bubble about the buzzing power box.

## What was verified

- **Logic** (`tests/systems.test.mjs`): every Sol compiles with one mission,
  three-plus subtasks and a confirm for each; the tour starts at `greet`; the
  build tasks are locked until the crew are met; meeting all three unlocks them
  and switches Kai's node to the build conversation; the decision applies, is
  recorded, cannot be answered twice and unlocks sleep; rationing creates the
  thirsty-crew event; array strain and low morale appear from their flags;
  alerts sort critical-first and are delivered once; the panel groups tasks with
  locked/done states; a full five-Sol playthrough reaches Sol 6 with decisions
  recorded and no resource below zero; legacy saves load and advance.
- **Browser** (Chromium, real clicks): tour → three introductions → bars →
  three builds → decision → PIP's answer → sleep nudge → recap → daybreak →
  Sol 2 morning line quoting the decision → Sol 2 task list. No console errors.
- Every `.js`/`.jsx` file passes a syntax check and no undefined identifiers
  remain.

## Known limits

- The harness art is stand-in; layout, collisions, build gating and every UI
  state were exercised, not the final sprites.
- Sols 6+ are generated (three rotating readings) so the game continues after
  the authored arc.
- The drone is a DOM overlay, not a canvas entity: it cannot be occluded by the
  world, which is the right trade for a UI companion but means he floats above
  props rather than behind them.

## Running the tests

```bash
npx esbuild tests/systems.test.mjs --bundle --platform=node --format=esm --outfile=/tmp/systems.mjs
node /tmp/systems.mjs
```
