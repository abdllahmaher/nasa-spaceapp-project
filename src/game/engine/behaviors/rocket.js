const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

/**
 * Rocket arrival: descends from the sky with launch exhaust, then sits on
 * the ground playing its landed idle loop. Blocking starts on touchdown.
 */
export function createRocketBehavior(clips, config = {}) {
  const settings = {
    fps: 12,
    descentSeconds: 4.5,
    startOffsetY: -560,
    startScale: 0.35,
    ...config,
  };

  let state = "arriving";
  let elapsed = 0;
  let animTime = 0;

  const pickFrame = (clip) =>
    clip.frames[Math.floor(animTime * settings.fps) % clip.frames.length];

  return {
    update(dt) {
      elapsed += dt;
      animTime += dt;

      if (state === "arriving" && elapsed >= settings.descentSeconds) {
        state = "landed";
        animTime = 0;
      }
    },

    isBlocking() {
      return state === "landed";
    },

    isInteractable() {
      return state === "landed";
    },

    getView() {
      const arriving = state === "arriving";
      const progress = Math.min(1, elapsed / settings.descentSeconds);
      const ease = easeOutCubic(progress);

      if (!arriving) {
        return {
          src: clips.landed.src,
          frame: pickFrame(clips.landed),
          anchor: clips.landed.anchor,
          offsetY: 0,
          scaleMul: 1,
          shadowK: 1,
        };
      }

      return {
        src: clips.launch.src,
        frame: pickFrame(clips.launch),
        anchor: clips.launch.anchor,
        offsetY: settings.startOffsetY * (1 - ease),
        scaleMul: settings.startScale + (1 - settings.startScale) * ease,
        shadowK: 0.2 + 0.8 * ease * ease,
      };
    },
  };
}
