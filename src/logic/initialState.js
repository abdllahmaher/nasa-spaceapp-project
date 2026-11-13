/**
 * Day 1 starting state.
 *
 * These are game values, not NASA measurements. Every number is deliberately
 * simple so the commander can understand a trade-off at a glance.
 */
export function createInitialState() {
  return {
    version: 2,
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
    lastReport: null,
  };
}
