/**
 * Day 1 starting state.
 *
 * These are game values, not NASA measurements. Every number is deliberately
 * simple so the commander can understand a trade-off at a glance.
 */
export function createInitialState() {
  return {
    version: 3,
    day: 1,
    resources: {
      storedPower: 100,
      powerCondition: 62,
      water: 100,
      food: 100,
      lifeSupportCondition: 88,
      habitatSafety: 100,
      spareParts: 4,
    },
    crew: {
      kai: { fatigue: 10 },
      nova: { fatigue: 10 },
      rex: { fatigue: 10 },
    },
    mission: {
      scienceProgress: 0,
      samplesCollected: 0,
      objectivesCompleted: [],
    },
    flags: [],
    seen: [],
    decisions: {},
    completedEvents: [],
    // PIP keeps his own memory: the tour, alerts already delivered, and which
    // Sol he has already greeted or nudged.
    drone: { step: "greet", seenAlerts: [], morningSeen: 0, nudgedDay: 0, meetIntroSeen: false },
    // One answer per Sol, kept forever so later Sols can react to it.
    decisionsByDay: {},
    lastReport: null,
  };
}
