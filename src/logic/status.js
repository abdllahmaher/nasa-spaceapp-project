/**
 * Live values for the pixel bars drawn above stations and crew.
 * Kept separate from the world data so the canvas never imports game state.
 */
export function buildStatus(state) {
  return {
    power_junction: {
      value: state.resources.powerCondition,
      tint: "#ffd166",
      icon: "bolt",
    },
    life_support: {
      value: state.resources.lifeSupportCondition,
      tint: "#7ee0ff",
      icon: "drop",
    },
    habitat: {
      value: state.resources.habitatSafety,
      tint: "#ff9ecb",
      icon: "home",
    },
    kai: {
      value: 100 - state.crew.kai.fatigue,
      tint: "#ffb066",
      icon: "wrench",
    },
    nova: {
      value: 100 - state.crew.nova.fatigue,
      tint: "#8ff0d0",
      icon: "heart",
    },
    rex: {
      value: 100 - state.crew.rex.fatigue,
      tint: "#c3a6ff",
      icon: "flask",
    },
  };
}
