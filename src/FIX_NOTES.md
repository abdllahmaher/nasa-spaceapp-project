# Fix: "powerChoice is not defined" at the end of a Sol

## What was wrong
The night recap (`src/logic/dailyCycle.js`) built its headline from an
intermediate variable that only existed inside the resource-deduction branch.
When the Sol finished and the recap was built, that variable was not in scope,
so `endDay()` threw `ReferenceError: powerChoice is not defined` from
`handleCrewCommandDone` (App.jsx) and the game froze on the night overlay.

The same read was also unguarded: a save written by an older build can be
missing `decisions`, `seen`, `flags` or `crew`, and the transition would then
throw a different `TypeError` on the same line.

## What changed
- `src/logic/dailyCycle.js`
  - The headline is now produced by a small helper, `powerHeadline(decisions)`,
    that reads the choice directly and falls back to a neutral sentence. No
    shared intermediate variable is left for a later edit to lose.
  - `endDay()` reads every field defensively (`resources`, `crew`, `flags`,
    `seen`, `decisions`, `completedEvents`, `day`), so a partial or legacy save
    can no longer crash the night transition.
  - Overnight costs and next-day titles moved into lookup tables, so Sol 1
    stays build-only and later Sols keep their own drain and titles.
- `src/logic/save.js`
  - New `normalizeState()` fills in any field an older save is missing and is
    applied by `loadGame()`. `version` is preserved so the one-time migration in
    `App.jsx` still runs.
- `src/App.jsx`
  - Uses `normalizeState()` for the in-memory state and keeps the Sol 1
    migration in one clearly-labelled branch.

## Verified
- Real Chromium run of the app: Sol 1 → End Day → crew walk to the Airlock →
  "Sol 1 done!" recap → Daybreak → Sol 2 running, with **no console errors**
  and the save on disk showing `day: 2`, `seen: []`, `decisions: {}`.
- Automated checks: all four power-decision headlines, Sol 1 taking no
  overnight drain, Sols 2–5 draining correctly, report shape, objective
  completion for Sols 1–5, plus legacy saves with missing `decisions`,
  `resources`, `crew`, an empty object and `null`.
- Every `.js`/`.jsx` file passes a syntax check; no undefined identifiers
  remain anywhere in `src`.

## About the second console line
`Security Error: Content at http://localhost:5173/ may not load or link to
file:///` is Firefox's CheckLoadURI message. It is not produced by any file in
`src` (there is no `file://` string anywhere in the app). It comes from a
`file://` URL referenced outside `src`, almost always in `index.html`: a
favicon, `apple-touch-icon`, manifest or image written as an absolute local
path such as `C:\Users\...\logo.png`, or a `<meta http-equiv=
"Content-Security-Policy">` that blocks `http://localhost` assets. A browser
extension that injects a local script can also trigger it. The `index.html`
shipped next to this folder is a clean Vite entry point with neither problem.

## v3 — drone-led story rebuild

- **PIP the drone** now runs the game: a three-beat tour on Sol 1 (greeting,
  meeting the crew, explaining the four bars), a task panel with open / done /
  locked states, warning bubbles, the day's decision, and the sleep button.
- **The five Sols were rewritten as one story** ("six Sols until the window"),
  each with three subtasks and one decision that changes the next Sol.
- **The HUD lost its task card and End Day button** — the drone owns both.
- **Click-to-walk was fixed**: guided walks no longer stall on props, and the
  walk target is clamped into the walkable strip. A clicked task always finishes.
- **PIP got his own portrait** (two-frame SVG) so the bubble names him instead of
  falling back to Layla.
- The chat bubble itself is still byte-identical to the version you sent.
