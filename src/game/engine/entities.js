import { createBehavior } from "./behaviors";
import { WORLD } from "../world";

const DEFAULTS = {
  scale: 1,
  mirror: false,
  repeat: true,
  blocking: false,
  shadow: false,
  interactive: null,
  // Slice art that already has its own scale (panorama cuts) can opt out of
  // the y-based perspective shrink.
  perspective: true,
};

/**
 * Turns plain data definitions into runtime entities:
 * validates them and attaches a fresh behavior instance.
 */
export function prepareEntities(defs) {
  const seen = new Set();

  return defs.map((def) => {
    if (!def.id) throw new Error("World entity is missing an id.");
    if (seen.has(def.id)) console.warn(`Duplicate entity id: ${def.id}`);
    seen.add(def.id);

    if (typeof def.x !== "number" || typeof def.y !== "number") {
      throw new Error(`Entity "${def.id}" needs numeric x and y.`);
    }
    if (!def.sprite?.src && !def.sprite?.clips) {
      throw new Error(`Entity "${def.id}" needs sprite.src or sprite.clips.`);
    }
    if (def.blocking && !(def.footR > 0)) {
      throw new Error(`Blocking entity "${def.id}" needs a positive footR.`);
    }
    if (def.x < 0 || def.x > 1) {
      throw new Error(`Entity "${def.id}" needs x as a fraction between 0 and 1.`);
    }

    return {
      ...DEFAULTS,
      ...def,
      behavior: createBehavior(def),
    };
  });
}

/** World positions of an entity: the original plus its mirrored copy. */
export function basePositions(entity, period) {
  const bases = [{ worldX: entity.x * period, flip: false }];
  if (entity.mirror) {
    bases.push({ worldX: (1 - entity.x) * period, flip: true });
  }
  return bases;
}

/** Whether the entity blocks movement right now (behaviors can opt out). */
export function isEntityBlocking(entity) {
  if (!entity.blocking) return false;
  if (typeof entity.behavior?.isBlocking === "function") return entity.behavior.isBlocking();
  return true;
}

/** Whether the player can interact with the entity right now. */
export function isEntityInteractive(entity) {
  if (!entity.interactive) return false;
  if (typeof entity.behavior?.isInteractable === "function") return entity.behavior.isInteractable();
  return true;
}

/** Closest world-space x of this entity to a given x. */
export function nearestWorldX(entity, period, x) {
  let best = null;

  for (const base of basePositions(entity, period)) {
    const k = entity.repeat ? Math.round((x - base.worldX) / period) : 0;
    const worldX = base.worldX + k * period;
    const distance = Math.abs(x - worldX);
    if (!best || distance < best.distance) best = { worldX, distance };
  }

  return best.worldX;
}

/** Every entity copy that can touch the viewport. */
export function visibleEntities(entities, period, cameraLeft, margin = 160) {
  const copies = [];
  const viewRight = cameraLeft + WORLD.width;

  for (const entity of entities) {
    for (const base of basePositions(entity, period)) {
      const from = entity.repeat
        ? Math.floor((cameraLeft - margin - base.worldX) / period)
        : 0;
      const to = entity.repeat
        ? Math.ceil((viewRight + margin - base.worldX) / period)
        : 0;

      for (let k = from; k <= to; k += 1) {
        const worldX = base.worldX + k * period;
        const screenX = worldX - cameraLeft;
        if (screenX < -margin || screenX > WORLD.width + margin) continue;
        copies.push({ entity, worldX, screenX, flip: base.flip });
      }
    }
  }

  return copies;
}
