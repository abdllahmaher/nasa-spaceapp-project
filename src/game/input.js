const KEY_MAP = {
  KeyW: "up",
  ArrowUp: "up",
  KeyS: "down",
  ArrowDown: "down",
  KeyA: "left",
  ArrowLeft: "left",
  KeyD: "right",
  ArrowRight: "right",
  ShiftLeft: "run",
  ShiftRight: "run",
  KeyE: "fix",
  Space: "jump",
  F2: "debug",
};

export function createInput(target = window) {
  const held = new Set();
  const pressed = new Set();

  const onKeyDown = (event) => {
    const action = KEY_MAP[event.code];
    if (!action) return;
    if (!held.has(action)) pressed.add(action);
    held.add(action);
    event.preventDefault();
  };

  const onKeyUp = (event) => {
    const action = KEY_MAP[event.code];
    if (!action) return;
    held.delete(action);
  };

  const onBlur = () => {
    held.clear();
    pressed.clear();
  };

  target.addEventListener("keydown", onKeyDown);
  target.addEventListener("keyup", onKeyUp);
  target.addEventListener("blur", onBlur);

  return {
    isDown: (action) => held.has(action),
    // Edge-triggered presses: true once per key press.
    consume: (action) => pressed.delete(action),
    axis() {
      const x = (held.has("right") ? 1 : 0) - (held.has("left") ? 1 : 0);
      const y = (held.has("down") ? 1 : 0) - (held.has("up") ? 1 : 0);
      return { x, y };
    },
    destroy() {
      target.removeEventListener("keydown", onKeyDown);
      target.removeEventListener("keyup", onKeyUp);
      target.removeEventListener("blur", onBlur);
      held.clear();
      pressed.clear();
    },
  };
}
