# Implementation Notes

What changed, why, and how to test it.

## New

| File | Purpose |
| --- | --- |
| `logic/drone.js` | PIP's brain: alerts, task groups, decisions, tutorial state |
| `logic/profile.js` | landing name + site, and the Sol/site text overlay |
| `data/drone/script.js` | tour beats, morning lines, warning + decision bubbles |
| `data/sols/sol01…sol05.js` | the five-Sol storyline with decisions |
| `components/DroneCompanion.jsx` | the drone in the world (PNG sprite, docked at the edge) |
| `components/GuideTour.jsx` | PIP's spotlight / character guide: fly-to subject, bright cut-out, step card |
| `components/WeatherLayer.jsx` | Framer Motion weather: storm streaks, dust motes, haze, frost crystals |
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
| `data/portraits.js` | PIP's portrait (the shared drone sprite) so the bubble names him |
| `game/player.js` | guided walks are collision-free and stall-proof |
| `logic/save.js`, `logic/initialState.js` | `drone`, `decisionsByDay`, version 3 |

## Untouched

`components/InteractionModal.jsx`, `components/Portrait.jsx`,
`components/PixelIcon.jsx`, `components/BriefingModal.jsx`,
`components/DayBreak.jsx` and the bubble rules in `App.css`. The chat bubble you
asked me to protect is byte-identical; the drone speaks through it as data.

## The drone asset

`assets/props/drone.png` is the single source of truth for PIP. It is imported
by `DroneCompanion` for the flying drone, by `DronePanel` for the panel header,
and by `portraits.js` for the dialogue bubble. Replace that one PNG to update
every place PIP appears.

## Generic bubbles vs. spotlight tours

- **Generic PIP beats** (greeting, mornings, decisions, warnings, day-complete,
  next-task guidance) keep the big `InteractionModal` with the dimmed background.
- **Next-task guidance** is automatic: whenever the set of open tasks changes
  (morning, or after any completion) PIP names the next one and offers "Walk me
  there" or the full list. The drone panel repeats the same task in a "Next up"
  card so the answer is always one click away.
- **Specific guidance** uses `GuideTour`. PIP flies to the HUD row, character or
  build area being explained. Only that subject stays bright; everything else
  is dimmed. The HUD meters expose `data-pip-target`; canvas characters are
  measured by `GameCanvas` and the camera eases to them.

The two Sol 1 tutorial beats are currently guided: `DRONE_MEET` tours Kai, Nova,
Rex and the crew as a group; `DRONE_BARS` tours Power, Air, Food and Parts.

## Landing profile

`index.html` sends the player to `game.html?name=…&map=jezero|meridiani` and also
stores both values in `localStorage` (`playerName`, `selectedMap`).
`logic/profile.js` reads the URL first, falls back to storage, and writes the URL
choice back so a reload keeps it.

- The name appears in the header (`Commander Ava`), PIP's greeting, the daybreak
  card, the bubble prompts and the canvas badge. Story strings are personalised
  once during `buildDay`, not edited in every Sol file.
- The site drives the header tag, briefing chip, coordinates, weather copy and
  the world backdrop. `getScene(map)` swaps the panorama in
  `data/world/backgrounds.js`; Jezero uses `space.png`, Meridiani uses the red
  desert illustration. The only Jezero-specific geology lines are replaced with
  Meridiani facts (ancient playas, Opportunity) instead of a blind find/replace.

## Framed stage

The game is a framed card with breathing room, not a full-bleed window. `.app`
defines `--stage-pad` (14–30 px) and `.game-shell` is inset by it, so the red
planet sits inside a visible frame. The header and footer stay `position:
absolute` over the frame instead of taking layout height, so the stage keeps
the full viewport minus the margins. The canvas uses `object-fit: cover` on
landscape windows (with `contain` on phones so the scene is not cropped), and
`GameCanvas`'s `contentBox()` maps pointer and overlay coordinates through that
painted box. If you change the fit mode or `--stage-pad`, keep those two in
sync.

## How to test

1. `npm run dev`, open `/`, enter a name, pick a landing site, then press
   **Play now**. The landing page redirects to `/game.html?name=…&map=…`.
   (Direct check: `/game.html?name=Ava&map=meridiani`.)
2. Landing plays. The briefing opens; press **Let's go!**.
3. **PIP greets you** — "Commander Ava! Down here!" with his own portrait.
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
- **Resources** (browser module checks): a decision or subtask whose cost cannot
  be paid is rejected instead of clamped; a funded decision pays exactly once;
  completing the same subtask through the "Why?" branch charges nothing the
  second time; `eventHistory` is always iterable; malformed saved values
  (`"72"`, `null`, `"abc"`) are coerced and clamped; the save version survives a
  night transition.
- **Guidance** (browser + module sweep): PIP announces exactly one "Next: …"
  beat per subtask on Sols 1–5, warnings and decisions keep priority, "Walk me
  there" closes the bubble without looping, and "Show the task list" opens the
  panel with the same task in its "Next up" card.
- **Alerts + weather** (browser): each Sol with an active alert shows the drone
  callout (worst alert + "+N more"), the panel banner leads with the forecast,
  and `WeatherLayer` renders the preset named by the Sol (`weather-storm` with
  44 streaks, 7 clouds, 4 gusts; `weather-frost` with 26 crystals). The layer
  disappears when the day transition starts and follows the next Sol's level.
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
