import { isEntityBlocking, nearestWorldX } from "./engine/entities";

// The horizon is endless, so only the vertical position is constrained.
export function clampToArea(entity, area) {
  entity.y = Math.min(area.maxY, Math.max(area.minY, entity.y));
  return entity;
}

/**
 * Push the player out of blocking entities. Every entity repeats every
 * `period` (unless `repeat: false`), so the nearest world copy is tested —
 * collision is anchored to the world, not the screen.
 */
export function resolveEntityCollisions(player, entities, period) {
  for (const entity of entities) {
    if (!isEntityBlocking(entity)) continue;

    const worldX = nearestWorldX(entity, period, player.x);
    const rx = entity.footR ?? 24;
    const ry = Math.max(8, rx * 0.28);
    const dx = player.x - worldX;
    const dy = player.y - entity.y;
    const distance = Math.hypot(dx / rx, dy / ry);

    if (distance >= 1) continue;

    if (distance < 0.0001) {
      // Exactly on the anchor: step out downward.
      player.y = entity.y + ry;
      continue;
    }

    player.x = worldX + dx / distance;
    player.y = entity.y + dy / distance;
  }

  return player;
}
