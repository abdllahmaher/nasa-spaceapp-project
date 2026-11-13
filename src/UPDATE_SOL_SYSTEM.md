# Mars Outpost – Sol progression update

## Included
- Sol 1 is now a construction/commissioning day: the crew build check-ins are the only objectives, resource meters are hidden, and no overnight resource deductions or Sol 1 power-choice penalties are applied.
- Sols 2–5 have distinct mission objective sets and crew radio dialogue. Sols 6+ generate a daily-labelled crew check-in set with changing tasks/dialogue rather than falling back to Sol 2.
- Per-Sol progress resets (`seen` and `decisions`) at the end-of-day transition. Save migration clears stale legacy progress once.
- Mouse click-to-move now resolves both X and Y; clicking an NPC walks Layla to that NPC. World buildings are not direct click-to-talk targets; crew are.
- NPC nameplates are drawn in a final canvas pass above world objects and markers, using a pixel font.
- Crew dialogue is delivered one transmission at a time with a Next control, rather than displaying the full conversation as one message.
- Sleeping/waking transitions and scripted movement are slower.
- Weather effects now read `day.briefing.weather` (the previous app was looking at the wrong property), and include dust, dust-lifting gusts, and water-ice haze/cloud conditions based on observed Jezero phenomena.

## Scientific note
Mars has no liquid-rain weather like Earth. The weather visuals therefore do not add rain or ordinary snowfall. NASA/Perseverance observations at Jezero document dust devils, wind-lifted dust, morning ice haze, and water-ice clouds. These are historical phenomena used as educational day themes, not a live forecast for a fictional Sol.

## Validation
All JavaScript and JSX files passed a TypeScript transpile syntax check. The uploaded source archive contains the `src` directory; use it to replace the project's existing `src` directory. The complete app could not be launched here because the source upload does not include the root package manifest/build setup.
