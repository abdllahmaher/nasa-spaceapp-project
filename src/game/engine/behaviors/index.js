import { createIdleBehavior } from "./idle";
import { createRocketBehavior } from "./rocket";

/**
 * Behaviors give an entity a little state machine (arrival animations,
 * future NPC routines, ...). Returning null means "plain static entity".
 *
 * Behaviour interface:
 *   update(dt)
 *   isBlocking()      → whether collisions are active right now
 *   isInteractable()  → whether the player can interact right now
 *   getView()         → { src, frame, offsetY?, scaleMul?, shadowK? }
 */
export function createBehavior(def) {
  if (!def.behavior) return null;

  switch (def.behavior.type) {
    case "rocket":
      return createRocketBehavior(def.sprite.clips, def.behavior.config);
    case "idle":
      return createIdleBehavior(def.sprite.clips, def.behavior.config);
    default:
      console.warn(`Unknown entity behavior: ${def.behavior.type}`);
      return null;
  }
}
