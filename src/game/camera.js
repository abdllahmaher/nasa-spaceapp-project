import { WORLD } from "./world";

/**
 * Dead-zone camera: it holds still while the player roams near the centre of
 * the view, then eases after them when they approach the edge.
 */
export function createCamera(x) {
  let centerX = x;

  return {
    update(dt, playerX) {
      const limit = (WORLD.width / 2) * WORLD.cameraDeadZone;
      const offset = playerX - centerX;
      let targetX = centerX;

      if (offset > limit) targetX = playerX - limit;
      else if (offset < -limit) targetX = playerX + limit;

      centerX += (targetX - centerX) * (1 - Math.exp(-WORLD.cameraEase * dt));
    },
    getLeft() {
      return centerX - WORLD.width / 2;
    },
    getCenter() {
      return centerX;
    },
  };
}
