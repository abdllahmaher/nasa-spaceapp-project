const MAX_STEP = 0.05; // seconds, guards against tab-switch jumps

export function createLoop(step) {
  let frameId = 0;
  let last = 0;
  let running = false;

  const tick = (now) => {
    if (!running) return;
    const dt = last ? Math.min((now - last) / 1000, MAX_STEP) : 0;
    last = now;
    step(dt);
    frameId = requestAnimationFrame(tick);
  };

  return {
    start() {
      if (running) return;
      running = true;
      last = 0;
      frameId = requestAnimationFrame(tick);
    },
    stop() {
      running = false;
      cancelAnimationFrame(frameId);
    },
  };
}
