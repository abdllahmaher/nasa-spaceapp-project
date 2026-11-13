# MARS OUTPOST: 30 DAYS
## Game Design Proposal & Technical Development Plan

**Project type:** 2D exploration, narrative-driven survival, and resource-management game  
**Target audience:** Ages 7–12, with strategic depth for older players  
**Platform:** Browser-based game  
**Setting:** Mars research outpost  
**Initial playable slice:** 5 in-game days  
**Planned full experience:** 30 in-game days  
**Core design principle:** Teach real mission trade-offs through understandable decisions.

---

## Document Purpose

This document defines the game's concept, gameplay systems, scientific boundaries, and a practical implementation plan for a team that knows **JavaScript and React but has no prior game-development experience**.

The project will use:

- **JavaScript** for all game logic.
- **React** for the interface and mission screens.
- **HTML Canvas** for the explorable 2D game world.
- **CSS** for styling and interface animations.
- **Vite** for local development and production builds.
- **Browser local storage** for saving progress.

The initial implementation will **not require TypeScript, Phaser, Unity, Godot, a custom game engine, or a backend**. The team will build only the small set of game systems required by this project.

---

# 1. Executive Summary

The player is the **Commander-Astronaut** of a small Mars outpost. They live on Mars with three other astronauts, explore the habitat, inspect systems, speak with crew members, and decide how to use limited resources.

The mission lasts 30 in-game days. Its scientific objective is to investigate a selected region for geological evidence relevant to the history of water on Mars, collect samples, and transmit findings to Earth. Survival is necessary, but survival alone does not guarantee mission success.

The game combines:

- A compact, explorable top-down 2D outpost.
- Movement between connected rooms.
- Conversations and reports from three crew members.
- Interactive equipment and mission terminals.
- A simple resource-management simulation.
- Decisions with immediate and delayed consequences.
- An authored storyline that branches according to player choices.
- Carefully attributed NASA data or curated NASA-derived reference data.

The first milestone is **five complete playable days**, not a rushed 30-day game. The five-day slice must demonstrate the complete gameplay loop and at least one delayed consequence. Once that loop works, the team can extend the content to 30 days.

---

# 2. Key Design Decision: Where Is the Player?

## Decision: The player is on Mars

The player is both an astronaut and the outpost commander.

### How communication delay works

The player is physically on Mars, so local movement, conversations, and equipment interactions happen immediately.

Communication delay applies only to messages sent between Mars and Earth:

1. The player sends a message or data package.
2. The message enters a communications queue.
3. It arrives at Earth after a simplified delay.
4. Earth prepares a response.
5. The response takes time to reach Mars.

For the five-day prototype, use a simple countdown or a **message pending** state. Do not simulate orbital mechanics or calculate exact signal paths. Later, use a real or representative delay range and explain that it is an abstraction.

**Important:** The player does not remotely pilot the other astronauts in real time. They talk to the crew locally and assign tasks. Crew members execute tasks according to simple, predefined rules.

---

# 3. Mission Story

## Working title: The Red Frontier — Mission 30

### Mission premise

A four-person crew is operating a temporary research outpost on Mars. The mission has a clear scientific purpose:

> **Investigate a selected region for geological evidence of ancient water activity, collect samples, and transmit the findings to Earth.**

The game should avoid promising that the crew will discover proof of past life or present-day liquid water. The objective is to investigate evidence and report scientifically defensible findings.

### Mission objectives

The player must:

1. Keep the crew and habitat within safe operating limits.
2. Maintain essential life-support and power systems.
3. Deploy and operate scientific equipment.
4. Explore a nearby area when conditions allow.
5. Collect and analyze a small number of samples.
6. Transmit useful findings to Earth.
7. Complete the mission or make a justified decision to suspend it.

### Multiple outcomes

The ending should reflect both survival and scientific achievement.

- **Full mission success:** The crew remains safe and the main scientific objectives are completed.
- **Scientific success with compromises:** Important findings are collected, but some objectives or infrastructure goals are missed.
- **Survival success:** The crew remains safe, but the scientific objective is incomplete.
- **Mission suspended:** The commander prioritizes crew safety and stops field operations.
- **Mission failure:** Essential survival conditions cannot be maintained.

A responsible decision to suspend the mission should not be framed as personal failure. It can be a successful safety decision.

---

# 4. The Crew

There are four astronauts total: the player and three non-player crew members (NPCs).

The three NPCs should have clear specialties. Their reports provide different perspectives, not contradictory scientific facts.

## 4.1 Mission Engineer

**Primary systems:** Electrical power, batteries, habitat equipment, and maintenance.

Typical report:

- Current system status.
- Detected fault or maintenance need.
- Available repair options.
- Estimated resource and time cost.
- Consequences of postponing maintenance.

Example:

> "The secondary power unit is losing efficiency. We can inspect it now, but the repair will use spare parts and interrupt today's scheduled work."

## 4.2 Life-Support Specialist

**Primary systems:** Oxygen, water, food supplies, recycling equipment, and crew well-being.

Typical report:

- Remaining consumables.
- Life-support system condition.
- Projected consumption.
- Risks if maintenance is delayed.
- Recommended conservation actions.

Example:

> "Water recycling is operating below its target efficiency. We can run a maintenance cycle now, but it will consume power and take time."

## 4.3 Science Officer

**Primary systems:** Research goals, rover operations, samples, instruments, and scientific data.

Typical report:

- Current scientific objective.
- Available exploration opportunity.
- Instrument or sample status.
- Expected scientific value.
- Resource and safety cost.

Example:

> "The nearby ridge is a promising target. A rover survey could help us choose a sample site, but it will use energy and delay the scheduled analysis."

## 4.4 The Player: Commander-Astronaut

The player:

- Walks around the outpost.
- Inspects selected equipment and status panels.
- Talks to the three crew members.
- Reviews the mission briefing.
- Assigns tasks or approves proposals.
- Chooses between competing priorities.
- Decides when to contact Earth.
- Initiates selected interactions, but does not manually perform every routine task.

The player should feel like a commander responsible for the whole mission, not a fourth specialist who must do every job.

---

# 5. Core Gameplay Loop

Each in-game day follows a repeatable, understandable cycle:

1. **Wake-up / Daily briefing:** Show the day, mission objective, resource status, and any new event.
2. **Crew reports:** The three astronauts report their specialty status and recommendations.
3. **Explore and inspect:** The player walks around the compact outpost and inspects relevant systems.
4. **Choose actions:** Approve, reject, postpone, or select an alternative action.
5. **Task execution:** Selected tasks consume time and resources.
6. **Daily resolution:** Update resource values, apply event effects, and evaluate delayed consequences.
7. **End-of-day report:** Summarize what changed and what is scheduled for tomorrow.

Do not force the player to read three long reports every day. Use short summaries with optional details.

## 5.1 Exploration loop

The player should be able to:

1. Move around the habitat using **W, A, S, D** or the arrow keys.
2. Walk between connected rooms.
3. Approach an astronaut or interactive object.
4. See an interaction prompt, such as `E — Talk` or `E — Inspect`.
5. Press **E** to interact.
6. Read a short dialogue or equipment report in the React interface.
7. Make a decision when the interaction offers one.

The exploration layer supports the mission. It should not become a separate action or combat game.

---

# 6. Resource Model

NASA's challenge description recommends keeping the number of simultaneously tracked core resources small. Use three visible resource groups.

## 6.1 Life Support

A simplified display representing the state of essential survival systems:

- Oxygen availability.
- Water availability.
- Food stores.
- Life-support equipment condition.

Internally, the prototype may track a few separate values, such as water, food, and life-support condition. Avoid pretending that a single percentage is a literal oxygen measurement.

## 6.2 Power

Track:

- Stored energy.
- Energy generated per day.
- Energy consumed per day.
- Optional power-system condition.

The daily calculation should be understandable:

**Ending stored energy = starting stored energy + generated energy − consumed energy**

Do not allow stored energy to become negative. If demand exceeds supply, apply a clearly explained shortage rule, such as shutting down non-essential systems or reducing a system's performance.

## 6.3 Crew Safety / Radiation Protection

Use a simplified safety indicator for the player-facing interface, but do not treat it as a universal "shield health" value.

For the prototype, it can represent the availability of safe shelter and protective procedures. A later version can distinguish:

- Radiation event severity.
- Shelter protection level.
- Crew exposure estimate.

Do not claim that a generic shielding percentage directly equals a radiation dose or guarantees safety.

## 6.4 Secondary values

Keep these in the background or in a separate mission panel:

- Scientific progress.
- Habitat condition.
- Crew fatigue.
- Spare parts.
- Communications status.

Do not make every secondary value a full resource bar. The player should focus on three main systems.

---

# 7. Decisions and Consequences

Every meaningful action should have:

- A benefit.
- A cost.
- A risk or opportunity cost.
- An immediate effect or a delayed effect.

Use four decision verbs:

- **Approve:** Do the proposed action now.
- **Reject:** Do not do it.
- **Postpone:** Delay it; the issue may worsen or the opportunity may disappear.
- **Alternative:** Choose a different action if one is available.

Avoid making every interaction a binary Yes/No question.

## Example: Repair the secondary power unit

| Choice | Immediate result | Possible later result |
|:--|:--|:--|
| Repair now | Uses spare parts and time | Better power reliability |
| Postpone | Preserves today's time | A later power shortage may be more likely |
| Ignore | No immediate cost | The system may remain degraded |

## Delayed consequences

Use simple persistent flags rather than a complex simulation.

Examples:

- `powerUnitRepaired`
- `waterMaintenancePostponed`
- `scienceRidgeSurveyCompleted`
- `earthMessagePending`
- `stormShelterInspected`

A later event checks a flag and selects the appropriate authored outcome.

The game should not punish every postponed task automatically. Consequences should be plausible and tied to the earlier decision.

---

# 8. Dynamic Story Without a Complex Engine

The story should be **authored and conditionally varied**, not generated from scratch.

Use a hybrid structure:

- Main mission milestones are fixed.
- A small set of optional events can occur when conditions are met.
- Earlier decisions change selected dialogue, costs, and outcomes.
- A small number of events can be selected from a predefined pool.

## 8.1 Recommended event structure

Each event contains:

- Unique ID.
- Day or eligible day range.
- Trigger condition.
- Short description.
- Available choices.
- Costs and effects.
- Optional follow-up flag.

Example event data in ordinary JavaScript:

```js
export const waterFilterEvent = {
  id: "water_filter_warning",
  eligibleDays: [2, 3, 4],

  title: "Water Filter Warning",

  description:
    "The life-support specialist reports reduced filter performance.",

  trigger: (state) =>
    !state.flags.includes("waterFilterServiced"),

  choices: [
    {
      id: "service_now",
      label: "Service the filter",
      cost: { power: 4, time: 1 },
      effects: { lifeSupportCondition: 8 },
      setFlags: ["waterFilterServiced"],
    },
    {
      id: "postpone",
      label: "Postpone maintenance",
      cost: {},
      effects: {},
      setFlags: ["waterFilterPostponed"],
    },
  ],
};
```

This is illustrative game data, not a validated scientific model.

## 8.2 Keep the story system simple

Implement only:

1. A day counter.
2. A resource state object.
3. A set of decision flags.
4. A list of authored events.
5. A function to check event conditions.
6. A function to apply selected effects.
7. A daily summary generator using authored text.

Do not build:

- An AI-generated narrative system.
- A general-purpose visual scripting engine.
- A complex physics simulation.
- A realistic orbital mechanics simulator.
- A large branching tree where every choice creates a completely separate story.

A small number of well-written branches will be more reliable and finishable.

---

# 9. Five-Day Prototype Plan

The first playable build must contain five complete days.

## Day 1 — Arrival and Systems Check

- Introduce the player and crew.
- Explore the habitat.
- Inspect power and life-support panels.
- Establish starting resource levels.
- Make one basic maintenance decision.

**Learning goal:** A Mars outpost depends on interconnected systems.

## Day 2 — Water System Warning

- The life-support specialist reports a filter issue.
- The player chooses to service, postpone, or deprioritize it.
- Save a decision flag.

**Learning goal:** Maintenance has a cost, but postponing maintenance can create future risk.

## Day 3 — First Science Opportunity

- The science officer proposes a nearby survey.
- The player weighs scientific value against power, time, and supplies.
- A completed survey creates a mission-progress flag.

**Learning goal:** Science operations compete with survival and infrastructure needs.

## Day 4 — Power Constraint

- The engineer reports a power-generation or storage problem.
- The player chooses between reducing non-essential loads, repairing equipment, or continuing operations.
- Day 2 and Day 3 decisions can modify the available choices or dialogue.

**Learning goal:** Energy generation, storage, and consumption are different things.

## Day 5 — Solar-Weather Response / Mission Review

- Present a solar-weather-related alert using a real or clearly labeled archived NASA event, if one has been selected and verified.
- The player follows a predefined protective procedure or chooses another defensible action.
- Show the consequences of earlier choices.
- End with a five-day mission review and a preview of the next phase.

**Learning goal:** Mission decisions accumulate; space weather can affect mission planning.

The five-day prototype should demonstrate:

- At least one immediate consequence.
- At least one delayed consequence.
- At least one event whose availability depends on a previous decision.
- A meaningful mission outcome at the end of Day 5.

Do not claim the five-day review is the final 30-day ending.

---

# 10. Expansion to 30 Days

Once the five-day loop works, extend it using the same systems.

| Days | Phase | Main focus |
|:--|:--|:--|
| 1–5 | Establishment | Habitat, crew, systems, first decisions |
| 6–11 | Exploration | Rover survey, samples, science operations |
| 12–17 | Environmental challenges | Dust, power constraints, space-weather response |
| 18–24 | Critical operations | Maintenance, limited resources, competing priorities |
| 25–30 | Mission completion | Final science objectives, data transmission, evaluation |

These are content phases, not five separate game modes. Reuse the same daily loop and event system.

Avoid scheduling a major disaster just because the calendar reaches a particular day. Events should be tied to the mission plan, a selected scenario, or a reasonable condition.

---

# 11. NASA Data and Scientific Integrity

Use a small number of real sources well. Data integration should support gameplay and be visible to the player.

## 11.1 NASA DONKI

**Space Weather Database Of Notifications, Knowledge, Information**

Potential use:

- Retrieve a relevant solar event.
- Show the event date and event type.
- Explain why mission planners monitor space weather.
- Use the event to trigger an educational scenario.

**Important limitation:** DONKI event records are not direct measurements of the radiation dose received by a person on the Martian surface. Do not convert an event record into a crew dose without a defensible model and source.

Official resource: <https://kauai.ccmc.gsfc.nasa.gov/DONKI/>

## 11.2 NASA Mars 2020 / Perseverance

Potential use:

- Mars surface imagery.
- Geological context.
- Examples of rover exploration and sample collection.
- Context for the game's scientific objective.

Official mission: <https://mars.nasa.gov/mars2020/>

## 11.3 NASA Open Science Data Repository (OSDR)

Potential use:

- Explain that astronaut health and biological responses are studied through research.
- Use a carefully selected, understandable finding as an educational reference.

Do not turn a research dataset into a medical prediction for fictional crew members.

Official resource: <https://osdr.nasa.gov/>

## 11.4 NASA Artemis resources

Potential use:

- General context for human exploration, habitat design, and surface operations.
- Clearly distinguish lunar mission information from Mars-specific conditions.

## 11.5 Data rules

1. Attribute the source inside the game.
2. Display the dataset or event date.
3. Label archived data as archived.
4. Do not present static data as live.
5. Do not imply that an illustrative game value is an official NASA measurement.
6. Keep a short source/method note in the final presentation.

A curated, verified dataset embedded in the game is acceptable if live API integration is unreliable during the hackathon.

---

# 12. Technical Architecture

## 12.1 Recommended stack

The project uses technologies the team already knows or can learn incrementally.

| Technology | Role | Why it is used |
|:--|:--|:--|
| **JavaScript** | Game logic and world behavior | The team already knows it |
| **React** | HUD, dialogue, reports, menus, decisions | The team already knows it |
| **HTML Canvas** | 2D world rendering | Native browser drawing surface |
| **CSS** | Interface styling and transitions | Familiar and sufficient for the UI |
| **Vite** | Development server and build tool | Simple React project setup |
| **localStorage** | Local save and resume | No server or database required |

### Why HTML Canvas instead of Phaser?

The game needs a compact top-down world with basic movement, walls, rooms, and interactions. These can be implemented with Canvas and ordinary JavaScript.

Using Canvas directly means the team must write a few small systems itself:

- Drawing the map and sprites.
- Reading keyboard input.
- Updating player position.
- Checking collisions.
- Detecting nearby interactive objects.
- Running the game loop.

This is manageable because the project deliberately excludes advanced game-engine features such as physics simulation, complex NPC pathfinding, multiplayer, and large open-world streaming.

**Scope boundary:** If the world becomes much larger or the team needs advanced animation, physics, or scene tooling, reconsider a game framework. Do not add one pre-emptively.

## 12.2 Responsibilities of each layer

### React — Interface layer

React is responsible for:

- Mission HUD and resource indicators.
- Daily briefings.
- Crew reports and dialogue.
- Decision panels.
- Mission log.
- End-of-day summaries.
- Pause and settings screens.

React should not redraw the game world every frame.

### Canvas — World layer

Canvas is responsible for:

- Drawing rooms, floors, walls, doors, and objects.
- Drawing the player and NPC sprites.
- Player movement and animation.
- Basic collision detection.
- Detecting nearby interactable objects.
- Sending interaction events to the React application.

Canvas should not contain mission story text or resource-management rules.

### JavaScript game logic — Rules layer

Ordinary JavaScript modules are responsible for:

- Game state.
- Resource calculations.
- Decision effects.
- Story flags.
- Event conditions.
- Daily progression.
- Mission outcome evaluation.

Keep this logic independent from Canvas drawing and React presentation. It should be possible to test resource calculations and story conditions without opening the game.

## 12.3 How the layers communicate

The basic interaction flow is:

1. Canvas detects that the player pressed `E` near an object.
2. The world layer identifies the object, for example `water_filter`.
3. The application receives an interaction event.
4. React opens the relevant dialogue or inspection panel.
5. The player selects an option.
6. The JavaScript logic applies the choice to the game state.
7. React updates the HUD and dialogue.
8. The world can reflect the changed state when necessary.

Use a small, explicit interface between the Canvas code and React. Avoid allowing both layers to independently modify the same game data.

---

# 13. Suggested JavaScript Project Structure

Use a simple Vite React JavaScript project.

```text
mars-outpost/
│
├── public/
│   └── assets/
│       ├── characters/
│       ├── maps/
│       ├── objects/
│       ├── ui/
│       └── audio/
│
├── src/
│   ├── game/
│   │   ├── canvas.js
│   │   ├── gameLoop.js
│   │   ├── player.js
│   │   ├── world.js
│   │   ├── controls.js
│   │   ├── collision.js
│   │   └── interactions.js
│   │
│   ├── logic/
│   │   ├── initialState.js
│   │   ├── resources.js
│   │   ├── decisions.js
│   │   ├── events.js
│   │   ├── dailyCycle.js
│   │   └── mission.js
│   │
│   ├── story/
│   │   ├── days/
│   │   │   ├── day01.js
│   │   │   ├── day02.js
│   │   │   ├── day03.js
│   │   │   ├── day04.js
│   │   │   └── day05.js
│   │   ├── events/
│   │   └── dialogue/
│   │
│   ├── components/
│   │   ├── GameCanvas.jsx
│   │   ├── HUD.jsx
│   │   ├── Dialogue.jsx
│   │   ├── DecisionPanel.jsx
│   │   ├── CrewReports.jsx
│   │   ├── MissionReport.jsx
│   │   └── MissionLog.jsx
│   │
│   ├── data/
│   │   ├── rooms.js
│   │   ├── characters.js
│   │   └── nasaSources.js
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── styles.css
│
├── index.html
└── package.json
```

Start with fewer files if that is easier. Split a module only when it becomes difficult to manage. The structure above is the intended organization as the project grows.

Keep authored story content separate from the code that applies effects.

---

# 14. Core State Model

A minimal state model can be written as a normal JavaScript object. No TypeScript interfaces or type declarations are required.

```js
export const initialGameState = {
  day: 1,

  resources: {
    water: 100,
    food: 100,
    storedPower: 100,
    lifeSupportCondition: 100,
    habitatSafety: 100,
  },

  mission: {
    scienceProgress: 0,
    samplesCollected: 0,
    objectivesCompleted: [],
  },

  crew: {
    engineer: { fatigue: 10 },
    lifeSupport: { fatigue: 10 },
    scientist: { fatigue: 10 },
  },

  flags: [],
  pendingMessages: [],
  completedEvents: [],
};
```

These are proposed game variables, not real-world engineering units. Use explicit units and defensible ranges if you later model actual quantities.

## 14.1 Updating state

Use a predictable approach: functions receive the current state and return an updated state. Avoid changing unrelated values in many different components.

For example:

```js
export function applyResourceChange(state, changes) {
  return {
    ...state,
    resources: {
      ...state.resources,
      ...Object.fromEntries(
        Object.entries(changes).map(([key, amount]) => [
          key,
          Math.max(
            0,
            state.resources[key] + amount
          ),
        ])
      ),
    },
  };
}
```

This is a simple illustrative helper. A production version should also validate resource keys, maximum values, and units.

## 14.2 Daily update order

Use a predictable order so outcomes are testable:

1. Apply scheduled event effects.
2. Apply the player's chosen actions.
3. Deduct action costs.
4. Calculate daily resource production and consumption.
5. Check thresholds and safety rules.
6. Set or clear decision flags.
7. Select the next eligible event.
8. Generate the daily report.

Document the order and keep it consistent. Otherwise, the same decision may produce different results depending on implementation details.

---

# 15. Building the 2D World with Canvas

This section defines the minimum game-development concepts the team must implement.

## 15.1 The Canvas element

HTML Canvas is a drawing area inside a web page. JavaScript obtains its drawing context and uses it to draw images, shapes, and text.

Minimal example:

```js
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

ctx.fillStyle = "#777";
ctx.fillRect(0, 0, 800, 500);
```

This draws a rectangle. The actual game will draw a tile-based room and character sprites instead.

In React, the Canvas element should be created in a component and initialized after it is mounted. Do not use `document.querySelector` to search the entire page when a React ref can point directly to the Canvas element.

## 15.2 The game loop

The game loop repeatedly:

1. Reads the current input.
2. Updates player position.
3. Checks collisions and interactions.
4. Draws the current world.

Use `requestAnimationFrame` to schedule drawing and updates. Calculate elapsed time between frames (`deltaTime`) so movement speed does not depend on the computer's frame rate.

## 15.3 Player movement

The player can be represented by a small JavaScript object:

```js
const player = {
  x: 100,
  y: 100,
  width: 24,
  height: 32,
  speed: 150,
};
```

Movement should use elapsed time:

```js
if (keys.ArrowRight) {
  player.x += player.speed * deltaTime;
}
```

The actual implementation should normalize diagonal movement so moving diagonally is not faster than moving horizontally or vertically.

## 15.4 Collision detection

Do not implement complicated physics.

For this game:

- The player has a rectangular collision boundary.
- Walls and blocked objects have rectangular boundaries or blocked map tiles.
- Before applying a movement, check whether the new player position would overlap a blocked area.
- If it would overlap, reject that movement.

This is enough for a compact indoor habitat.

## 15.5 Rooms and doors

Represent rooms as data rather than hard-coding every room transition.

Example:

```js
export const rooms = {
  command: {
    name: "Command Room",
    exits: ["laboratory", "lifeSupport"],
  },

  laboratory: {
    name: "Laboratory",
    exits: ["command"],
  },

  lifeSupport: {
    name: "Life Support",
    exits: ["command"],
  },
};
```

When the player reaches a door and interacts with it, change the active room and load its map, objects, and NPC positions.

For the first version, use one compact map with connected areas if separate room loading becomes unnecessarily complicated.

## 15.6 Interactions

Each interactive object should have a unique ID and a type.

Examples:

- `engineer_npc`
- `water_filter`
- `mission_terminal`
- `sample_analyzer`
- `power_console`

The Canvas layer detects which object is close enough. React then uses the object's ID to show the appropriate dialogue or panel.

Keep the interaction range simple and consistent.

---

# 16. Movement, Interaction, and Dialogue Scope

Movement should support the mission, not become a separate large game.

## 16.1 MVP interaction scope

- One compact habitat map.
- Four accessible areas: command/workstation, life-support area, power systems area, and science/lab area.
- Basic four-direction walking.
- Interaction prompt when near a relevant object or crew member.
- Short dialogue panels.
- A mission console that opens the resource and objective view.
- Doors or transition points connecting the areas.

## 16.2 Do not build initially

- Large open-world Mars terrain.
- Complex platforming.
- Combat.
- Vehicle driving.
- Full voice acting.
- Complex NPC pathfinding.
- Manual repair minigames for every device.
- Realistic physics.

A small explorable outpost is enough to make the player feel physically present.

---

# 17. User Interface and Art Direction

Proposed visual direction:

- 2D pixel-art-inspired environments.
- Retro space-agency / mission-control interface.
- Hard borders and clear panels.
- Restrained colors; avoid neon-heavy styling.
- Strong contrast and readable text.
- Animated environmental details used sparingly.
- Large, clear choices suitable for ages 7–12.

The interface should prioritize:

1. Current day and objective.
2. Three core resource indicators.
3. Crew status and available reports.
4. Current event and decisions.
5. Mission log.

Do not put every statistic on the main screen. Put detailed information behind optional inspection panels.

## 17.1 Suggested screen layout

A practical layout:

- **Main area:** Canvas world.
- **Top bar:** Day number, mission phase, and primary objective.
- **Resource panel:** Life support, power, and crew safety.
- **Interaction area:** Dialogue and available choices when interacting.
- **Mission menu:** Reports, objectives, message queue, and mission log.

Keep the Canvas and React interface visually separate. The HUD should not cover important parts of the game world.

---

# 18. Accessibility and Learning Design

Target audience: ages 7–12.

Requirements:

- Use plain language.
- Explain necessary scientific terms in context.
- Avoid long text walls.
- Use icons with text labels; never rely on color alone.
- Explain why a choice costs a resource.
- Show consequences in understandable language.
- Allow the player to review previous decisions.
- Make failure educational rather than humiliating.
- Avoid graphic depictions of injury or death.

At the end of a day, include a short **"What you learned"** note that explains the real science behind the decision.

---

# 19. Scope Constraints — What We Will and Will Not Build

## Must have

- A working five-day mission.
- A top-down, explorable Mars outpost.
- Player movement and basic wall collision.
- Connected rooms or areas.
- Three astronaut NPCs with distinct specialties.
- Interactions with crew and equipment.
- Daily briefings and concise reports.
- Three main resource groups.
- Meaningful choices with visible costs.
- Immediate and delayed consequences.
- A simple event/flag system.
- At least one properly attributed NASA dataset or curated NASA-derived reference.
- A five-day summary and a clear path to 30 days.

## Should have

- A small mission log.
- A simple Earth message queue with delayed responses.
- A few optional events.
- Basic crew fatigue.
- A simple science progress tracker.
- Save and resume locally.
- Basic walking animations.

## Could have

- More explorable rooms.
- More character dialogue.
- Additional NASA data sources.
- A rover sequence.
- More endings.
- Replay modifiers.
- Additional environmental animations and sound.

## Won't have in the first prototype

- TypeScript.
- Phaser or another game engine.
- Realistic orbital mechanics.
- Full life-support engineering simulation.
- Accurate human radiation-dose prediction.
- AI-generated storylines.
- Multiplayer.
- Complex NPC autonomy.
- A large open world.
- A full 30-day content set before the five-day slice is validated.
- A backend, user accounts, or database unless the demo specifically requires them.

---

# 20. Risks and Mitigations

| Risk | Mitigation |
|:--|:--|
| Scope becomes too large | Finish five days before expanding |
| Story branches become unmanageable | Use flags and conditional event variants |
| Scientific values are misleading | Separate game abstractions from sourced measurements |
| NASA API is unavailable | Embed a verified archived dataset and label it |
| Canvas implementation consumes too much time | Keep one compact habitat map and basic movement |
| Reports become repetitive | Give each astronaut a distinct specialty and concise format |
| Resource system becomes confusing | Keep three visible resource groups |
| Player choices feel cosmetic | Test that choices change later events or outcomes |
| React and Canvas become tightly coupled | Keep world rendering separate from mission state and UI |

---

# 21. Definition of Done

The five-day prototype is ready for demonstration when:

- A new player can understand the mission without external explanation.
- The player can move around the outpost and interact with crew and equipment.
- The player can navigate between the planned habitat areas.
- All three astronauts provide useful, distinct reports.
- The player can make decisions with visible costs.
- At least one decision changes a later event.
- Resource changes are consistent and explainable.
- The player can complete Day 5 and see a mission review.
- NASA data attribution is visible and accurate.
- The experience can be played in a browser without requiring an account.

---

# 22. Suggested Development Order

Build and test one milestone at a time.

## Phase 1 — Project setup and Canvas

1. Create a React JavaScript project with Vite.
2. Add a Canvas component to the React application.
3. Draw a simple room with a floor and walls.
4. Load and display an astronaut sprite.
5. Implement keyboard movement.

**Exit condition:** The player can move around a visible room.

## Phase 2 — Exploration

1. Add room layout data.
2. Add basic collision detection.
3. Add doors or room transitions.
4. Add NPCs and interactive objects.
5. Implement the `E` interaction key.
6. Connect Canvas interactions to React dialogue panels.

**Exit condition:** The player can explore the outpost and interact with crew and equipment.

## Phase 3 — Mission logic

1. Create the initial game state.
2. Implement resource updates.
3. Implement decision effects.
4. Add story flags.
5. Implement the daily cycle.
6. Connect the mission state to the React HUD.

**Exit condition:** Decisions change mission resources and conditions.

## Phase 4 — Five-day storyline

1. Write the five-day mission outline.
2. Add event conditions and choices.
3. Add immediate and delayed consequences.
4. Add daily reports and the mission log.
5. Test different decision paths.

**Exit condition:** The five-day mission can be completed with meaningful variations.

## Phase 5 — NASA data and polish

1. Select and verify a suitable NASA source.
2. Integrate a small dataset or curated archived event.
3. Add attribution and explanatory notes.
4. Improve animations, audio, and interface details.
5. Test the complete prototype on the target browser.

**Exit condition:** A stable, polished, scientifically grounded demonstration.

Only after these phases should the team expand the content toward 30 days.

---

# 23. Initial Project Setup

Create the project using the following commands:

```bash
npm create vite@latest mars-outpost -- --template react
cd mars-outpost
npm install
npm run dev
```

Vite will print a local development URL, usually:

```text
http://localhost:5173
```

The initial project uses JavaScript and JSX. No additional game-development packages are required for the first milestone.

## First files to implement

| File | First responsibility |
|:--|:--|
| `src/components/GameCanvas.jsx` | Create and mount the Canvas element |
| `src/game/canvas.js` | Initialize drawing and the world |
| `src/game/player.js` | Player position and movement |
| `src/game/controls.js` | Keyboard input |
| `src/game/collision.js` | Basic wall collision |
| `src/App.jsx` | Display the game and its React interface |

Do not implement the full story system before the player can move around the first room.

---

# 24. Team Responsibilities

Divide work by system, and agree on shared data structures before parallel development.

| Team member | Responsibility |
|:--|:--|
| **Backend / logic developer** | Game state, resources, decisions, events, daily cycle, mission evaluation |
| **Frontend developer** | React components, Canvas integration, HUD, dialogue, and UI state |
| **UI/UX designer** | Visual design, room layout, asset selection, interaction design, and visual consistency |
| **Presentation / research member** | Mission narrative, scientific verification, NASA sources, documentation, and pitch |

Even though one member may be called the backend developer, the initial prototype does not need a server. The mission logic runs in the browser as JavaScript modules.

Before parallel work begins, agree on:

- Resource names and meanings.
- Event and choice object structure.
- How Canvas reports an interaction to React.
- How a selected choice updates the mission state.
- Which files each person owns.

---

# 25. Final Recommendation

Build a **small, polished, five-day Mars outpost game** in which the player is a Commander-Astronaut living on Mars.

The player should move, inspect, talk, decide, and experience consequences. The three crew members should make the outpost feel like a team, while the resource system makes the mission feel like a real engineering challenge.

Use **JavaScript + React + HTML Canvas**. Keep the Canvas world, React interface, and mission logic as separate responsibilities. Implement only basic movement, collision, room transitions, and interactions; do not spend the hackathon building a general-purpose game engine.

Keep the story dynamic through authored events and a few persistent decision flags. Do not build a complex simulation engine. The goal is not to simulate every aspect of Mars exploration; it is to teach a young player that every mission decision has constraints, costs, and consequences.

**Core gameplay loop:**

`Explore → Inspect → Talk → Decide → Execute → Observe Consequences → Next Day`

**Core design promise:**

> A successful commander is not the one who says yes to every opportunity. It is the one who understands what the crew can afford, what the mission needs, and when protecting the crew matters more than completing an objective.
