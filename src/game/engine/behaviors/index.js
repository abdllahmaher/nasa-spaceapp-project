import { createCrewBehavior } from "./crew";
import { createRocketBehavior } from "./rocket";
import { createStationBehavior } from "./station";

/**
 * Behaviors give an entity a little state machine (arrival animations,
 * crew routines, ...). Returning null means "plain static entity".
 *
 * Behaviour interface:
 *   attach(entity)
 *   update(dt, period)
 *   isBlocking()      → whether collisions are active right now
 *   isInteractable()  → whether the player can interact right now
 *   getView()         → { src, frame, offsetY?, scaleMul?, shadowK?, flip? }
 */
export function createBehavior(def) {
  if (!def.behavior) return null;

  switch (def.behavior.type) {
    case "rocket":
      return createRocketBehavior(def.sprite.clips, def.behavior.config);
    case "crew":
      return createCrewBehavior(def.sprite.clips, def.behavior.config);
    case "station":
      return createStationBehavior(def.behavior.config);
    default:
      console.warn(`Unknown entity behavior: ${def.behavior.type}`);
      return null;
  }
}
