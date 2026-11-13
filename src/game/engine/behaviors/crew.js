const CLIP_FPS = { idle: 6, walk: 12, mine: 12 };

/**
 * Crew behavior: idle at their post, walk to a spot, or work on a machine.
 *
 * The behavior owns the entity's x fraction so the same code drives the
 * arrival walk and the "Kai runs over and fixes it" moment.
 */
export function createCrewBehavior(clips, config = {}) {
  const speed = config.speed ?? 180;
  let clip = "idle";
  let time = 0;
  let targetX = null;
  let wait = 0;
  let workLeft = 0;
  let flip = false;
  let entity = null;
  // Crew ride down inside the lander, so they start hidden.
  let hidden = config.hidden ?? false;

  return {
    attach(nextEntity) {
      entity = nextEntity;
    },

    /** Step out of the lander. */
    show() {
      hidden = false;
    },

    hide() {
      hidden = true;
      targetX = null;
      wait = 0;
      workLeft = 0;
      clip = "idle";
    },

    isVisible() {
      return !hidden;
    },

    update(dt, period = 1) {
      time += dt;

      if (wait > 0) {
        wait = Math.max(0, wait - dt);
        clip = "idle";
        return;
      }

      if (targetX !== null) {
        const dx = (targetX - entity.x) * period;
        const step = Math.sign(dx) * Math.min(Math.abs(dx), speed * dt);

        entity.x += step / period;
        if (Math.abs(dx) < 1) {
          entity.x = targetX;
          targetX = null;
        }

        flip = step < 0;
        clip = "walk";
        return;
      }

      if (workLeft > 0) {
        workLeft = Math.max(0, workLeft - dt);
        clip = "mine";
        if (workLeft === 0) clip = "idle";
        return;
      }

      clip = "idle";
    },

    /** Walk to a world-x fraction; useful for the landing exit. */
    walkTo(x, delaySeconds = 0) {
      targetX = x;
      wait = delaySeconds;
    },

    /** Face and hammer a machine for a moment. */
    work(seconds, faceLeft = false) {
      workLeft = seconds;
      flip = faceLeft;
    },

    isBusy() {
      return targetX !== null || wait > 0 || workLeft > 0;
    },

    getView() {
      if (hidden) return { hidden: true };
      const active = clips[clip] ?? clips.idle;
      if (!active) return null;
      const fps = CLIP_FPS[clip] ?? 6;
      const frame = active.frames[Math.floor(time * fps) % active.frames.length];
      return { src: active.src, frame, anchor: 1, flip };
    },
  };
}
