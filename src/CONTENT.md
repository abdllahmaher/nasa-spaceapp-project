# Mars Outpost — Story, Missions and the Drone

The whole game is one story: **six Sols until the resupply window closes.** Every
Sol has one mission, three clickable subtasks and one decision that changes the
next Sol.

## The arc

| Sol | Mission | Tasks | Decision | Carries into |
| --- | --- | --- | --- | --- |
| 1 | **Establish the Outpost** | Meet Kai, Nova, Rex · build the array, life support, the dome | Survey the rim (parts) or drill the ice (water) | Sol 2 water and briefing |
| 2 | **Water Math** | Clean the filter · fix the buzzing junction · log the samples | Fit the spare cartridge (parts) or ration water | Rationing creates *thirsty crew* on Sol 3 |
| 3 | **The Dust Line** | Secure the array · seal the intake · measure the front | Tarp the array (power) or keep it running | Running it creates *array strain* on Sol 4 |
| 4 | **Signal** | Repair the comms mast · read the air log · sweep the panels | Call home (power) or stay dark | Staying dark creates *low morale* on Sol 5 |
| 5 | **The Window** | Light the beacon · stock the pad · clear the landing zone | Call the ship in, or wait one more Sol | The finale |

Sols 6 and beyond generate a scheduled science watch, so the game never
dead-ends after the authored five.

## Sol 1 is the tutorial

PIP runs it in three beats, and each beat is a bubble, not a wall of text:

1. **Greeting** — who PIP is, and that he will do the talking.
2. **Meet the crew** — three introduction tasks, one per crew member. The build
   tasks exist in the panel but are **locked** (`requires`), so the player cannot
   skip the introductions. Meeting Kai switches his node from "hello" to "help me
   build the array".
3. **The bars** — power, air, food, parts, each explained in one line of what it
   is and what it costs us. Only then does the day's mission unlock.

A first-time player is never told "explore"; they are told who to talk to next,
and the drone's panel always shows what is left.

## PIP's job

- **Tasks** — grouped, with open / done / locked states; a click walks Layla over.
- **Alerts** — an event starting, or a bar dropping below its line, opens a
  bubble and lights the badge on the drone. Alerts are delivered once, then live
  in the panel.
- **Decisions** — he asks the day's question at the end of the day.
- **Sleep** — the button appears in his panel and in his nudge bubble when every
  task is done and the decision is answered.

## Voices

- **PIP** — cheerful, literal, slightly over-involved. Explains systems, never
  talks down, occasionally admits he is a machine.
- **Kai** — short sentences, verbs first, always names the failing part.
- **Nova** — warm, careful, thinks about the crew's bodies before the equipment.
- **Rex** — excitable, turns hazards into questions, measures everything twice.
- **Layla** — the player: briefing and recap only.

Every crew conversation keeps the three-beat shape: what is wrong, "Why do we
need this?" with the science, then the confirm that plays the work and returns a
result line.

## Events

| Event | Starts | Nightly cost | Ends when |
| --- | --- | --- | --- |
| Power box buzzing | Sol 2 | power bus −1 | Kai fixes the connector |
| Filter clogging | Sol 2 | water −1, air −1 | Nova cleans the filter |
| Dust on the array | Sol 2 | reserve −1, bus −1 | Kai secures the array |
| Dust front | Sol 3 | reserve −2 | Kai repairs the mast |
| Thirsty crew | decision: ration | air −1 | intake sealed or air log read |
| Array strain | decision: run the array | bus −1 | Rex sweeps the panels |
| Low morale | decision: stay dark | food −1 | only the ship arriving |

## Science

- Solar output falls when dust films a panel — why cleaning is a task.
- Dust devils can sweep panels clean; Perseverance has imaged them at Jezero.
- Mars' air is ~1% of Earth's pressure and almost all CO₂, so the dome must hold
  its own air.
- Recycling water costs power, which is why a dust front threatens the reserve.
- No rain, no snow: Mars' weather is dust, haze, ice and cold. Every briefing
  carries its NASA source link and states that the weather is an observed
  phenomenon, not a forecast for Jezero.
