import { isEntityInteractive, nearestWorldX } from "./engine/entities";

/**
 * Finds the closest interactable entity within reach of the player. Entities
 * repeat every `period`, so the nearest world copy is tested, keeping the
 * interaction anchored to the world rather than the screen.
 */
export function findInteractable(entities, period, x, y, range) {
  let best = null;

  for (const entity of entities) {
    // The player can initiate dialogue only with crew members. Buildings are
    // destinations/quest context, never clickable conversation targets.
    if (entity.interactive?.kind !== "talk") continue;
    if (!isEntityInteractive(entity)) continue;

    const worldX = nearestWorldX(entity, period, x);
    const dx = Math.abs(x - worldX);
    const dy = Math.abs(y - entity.y);

    if (dx > range.x || dy > range.y) continue;

    const distance = Math.hypot(dx / range.x, dy / range.y);
    if (!best || distance < best.distance) {
      best = { entity, worldX, distance };
    }
  }

  return best;
}
