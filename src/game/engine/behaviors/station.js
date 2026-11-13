
/**
 * Outpost stations travel inside the lander, so they start invisible.
 *
 * A crew member assembles their own station: `build()` starts the timer and
 * the behavior reports a reveal value while the station rises out of the
 * regolith. Interactions and status bars only switch on once it is built.
 */
export function createStationBehavior(config = {}) {
  const seconds = config.seconds ?? 2.6;
  let progress = config.built ? 1 : 0;
  let building = false;
  let settle = 0;

  return {
    update(dt) {
      if (building && progress < 1) {
        progress = Math.min(1, progress + dt / seconds);
        if (progress >= 1) {
          building = false;
          settle = 1;
        }
      } else if (settle > 0) {
        settle = Math.max(0, settle - dt * 2.2);
      }
    },

    build() {
      if (progress >= 1) return;
      building = true;
    },

    finish() {
      progress = 1;
      building = false;
    },

    isBuilt() {
      return progress >= 1;
    },

    isInteractable() {
      return progress >= 1;
    },

    getProgress() {
      return progress;
    },

    getView() {
      if (progress <= 0) return { hidden: true };

      // A tiny overshoot when the last panel clicks into place.
      const pop = settle > 0 ? 1 + 0.05 * Math.sin(settle * Math.PI) : 1;

      return {
        // Linear so the build bar and the emerging station match exactly.
        reveal: progress,
        building: progress < 1,
        scaleMul: pop,
      };
    },
  };
}
