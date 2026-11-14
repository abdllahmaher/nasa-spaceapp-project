/**
 * PIP — Personal Interface Pal, the outpost drone.
 *
 * PIP is the game's voice. Every node here is an ordinary bubble node, so the
 * chat bubble renders it without knowing it is a drone. Only `action` fields are
 * new: they tell the app that a choice is a decision, a sleep request, or a
 * tutorial step.
 */

export const DRONE = {
  name: "PIP",
  role: "Outpost Drone",
};

/** First contact, right after the lander settles. */
export const DRONE_GREET = {
  speaker: "drone",
  eyebrow: "PIP · OUTPOST DRONE",
  title: "Commander! Down here!",
  body: [
    "I'm PIP — Personal Interface Pal. I fly, I watch the systems, and I talk a lot.",
    "I'll show you how the outpost works, then we get to work. Deal?",
  ],
  choices: [
    {
      id: "drone_greet_go",
      icon: "crew",
      label: "Deal. Show me around",
      detail: "PIP starts the tour.",
      tutorial: "meet",
      result: "Follow the gold markers. I'll keep the list for you.",
      toast: "PIP is your guide",
    },
  ],
};

/** Beat two: meet the crew. Unlocks the three introduction tasks. */
export const DRONE_MEET = {
  speaker: "drone",
  eyebrow: "PIP · CREW",
  title: "First: your crew",
  body: [
    "Three humans came with us. They are excellent and slightly dramatic.",
    "Open my list and pick a name. I'll walk you to them — you just have to say hello.",
  ],
  choices: [
    {
      id: "drone_meet_go",
      icon: "crew",
      label: "Open the crew list",
      detail: "PIP opens the task list.",
      tutorial: "meet",
      result: "Three names, three hellos. Then we build.",
      toast: "Meet Kai, Nova and Rex",
    },
  ],
};

/** Beat three: the bars. Only after the crew have all been met. */
export const DRONE_BARS = {
  speaker: "drone",
  eyebrow: "PIP · SYSTEMS",
  title: "These four bars keep us alive",
  body: [
    "POWER is what we store from the solar array. Everything runs on it, and it empties overnight.",
    "AIR is how well the recycler is cleaning carbon dioxide back into oxygen. Below the line, we start to worry.",
    "FOOD is our pantry. It only goes down until a resupply arrives.",
    "PARTS are what we build and repair with. They are the reason some choices cost us later.",
  ],
  choices: [
    {
      id: "drone_bars_go",
      icon: "bolt",
      label: "Got it. Let's build",
      detail: "The day's mission unlocks.",
      tutorial: "free",
      result: "Now the real work, Commander.",
      toast: "Tour complete",
    },
  ],
};

/** Nudge when every task is done but the player has not slept yet. */
export const DRONE_DAY_DONE = {
  speaker: "drone",
  eyebrow: "PIP · SHIFT COMPLETE",
  title: "Everything on the list is done",
  body: [
    "Every task for this Sol is checked off. The crew is tired and the batteries want the night.",
    "Say the word and I'll call it: lights out, new Sol in the morning.",
  ],
  choices: [
    {
      id: "drone_sleep_now",
      icon: "moon",
      label: "Sleep · next Sol",
      detail: "End the Sol and start the next one.",
      action: "sleep",
      result: "Lights out, Commander.",
      toast: "Ending the Sol",
    },
    {
      id: "drone_sleep_later",
      icon: "crew",
      label: "Not yet",
      detail: "Stay on the surface a little longer.",
      result: "I'll be here. Hovering. Quietly.",
      toast: "Still on the surface",
    },
  ],
};

/**
 * Morning line for Sols 2-5. Each one calls back the previous Sol's decision, so
 * the player can feel that yesterday's choice is still in the room.
 */
export const MORNING_LINES = {
  2: {
    rim: "Rex's rim samples are still on the bench, and the parts crate is heavier than we budgeted for. Good call.",
    ice: "Nova already tapped the ice survey. The water reserve is fuller than it has any right to be. Good call.",
    none: "First full working Sol. The outpost held the night, barely.",
  },
  3: {
    clean: "That filter change cost us parts, but the water is clean and nobody is dizzy this morning.",
    ration: "We saved the parts. The crew drank less than they should have. Watch their fatigue today.",
    none: "The dust found us overnight.",
  },
  4: {
    cover: "The array spent the night under a tarp. Less power, but nothing broken.",
    run: "We kept the array running through the dust. Brave. Also a little reckless.",
    none: "There is a wall of dust on the horizon.",
  },
  5: {
    call: "We sent the message home. The crew has been humming all morning.",
    quiet: "We stayed dark and saved the power. The silence is heavier than I expected.",
    none: "Last Sol before the window closes.",
  },
};

/** Builds a morning bubble node for a Sol, using the previous decision. */
export function morningNode(day, previousOptionId) {
  const set = MORNING_LINES[day.day];
  if (!set) return null;
  const line = set[previousOptionId] ?? set.none;
  return {
    speaker: "drone",
    eyebrow: `PIP · SOL ${day.day}`,
    title: day.briefing?.title ?? `Sol ${day.day}`,
    body: [line, day.briefing?.lines?.[0] ?? "Here is today's list, Commander."],
    choices: [
      {
        id: `drone_morning_${day.day}`,
        icon: "crew",
        label: "Open the task list",
        detail: "See what today needs.",
        result: "On it, PIP.",
        toast: `Sol ${day.day} tasks ready`,
      },
    ],
  };
}

/** The drone turns a warning into a bubble the player cannot miss. */
export function warningNode(alerts) {
  if (!alerts.length) return null;
  const worst = alerts[0];
  return {
    speaker: "drone",
    eyebrow: "PIP · ALERT",
    title: worst.title,
    body: [
      worst.detail,
      alerts.length > 1
        ? `I'm also tracking ${alerts.length - 1} more thing${alerts.length > 2 ? "s" : ""}. Open my panel for the full list.`
        : "That's everything for now. I'll keep watching.",
    ],
    choices: [
      {
        id: "drone_alert_ack",
        icon: "crew",
        label: "Understood",
        detail: "Close the alert.",
        result: "Watching the gauges, Commander.",
        toast: "Alert noted",
      },
    ],
  };
}

/** The day's decision, asked by the drone with one choice per option. */
export function decisionNode(day) {
  const decision = day?.decision;
  if (!decision) return null;
  return {
    speaker: "drone",
    eyebrow: `PIP · DECISION · SOL ${day.day}`,
    title: decision.title,
    body: [decision.question, decision.stakes],
    choices: decision.options.map((option) => ({
      id: `decision_${decision.id}_${option.id}`,
      icon: option.icon ?? "crew",
      label: option.label,
      detail: option.detail,
      action: "decision",
      optionId: option.id,
      result: option.reply,
      toast: option.toast ?? decision.shortTitle ?? "Decision made",
    })),
  };
}
