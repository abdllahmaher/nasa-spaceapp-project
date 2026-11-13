# Sol 2 + Weather Fixes

- Sol completion now clears `seen` and `decisions` so objectives from a previous Sol cannot auto-complete the next Sol.
- Added a dedicated Sol 2 objective set and registered it in `story/days/index.js`.
- Added a one-time migration for existing Sol 2 saves that inherited Sol 1 interaction flags.
- Sol 1 power-box overnight consequences now run only on Sol 1.
- Toast messages are horizontally centered and positioned around 42% from the top.
- NPC head bars are suppressed; building/station bars remain.
- Weather visuals are limited to documented Jezero phenomena: morning ice haze and dust-devil/dust activity. They are illustrative historical phenomena, not day-specific forecasts. No rain or snow is invented.
- NASA source links are included in each day's briefing weather panel.
