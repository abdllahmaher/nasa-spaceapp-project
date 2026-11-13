/**
 * A simple looping idle animation for crew members.
 */
export function createIdleBehavior(clips, config = {}) {
  const fps = config.fps ?? 6;
  const idle = clips?.idle;
  let time = 0;

  return {
    update(dt) {
      time += dt;
    },

    getView() {
      if (!idle) return null;
      const frame = idle.frames[Math.floor(time * fps) % idle.frames.length];
      return {
        src: idle.src,
        frame,
        anchor: idle.anchor ?? 1,
      };
    },
  };
}
