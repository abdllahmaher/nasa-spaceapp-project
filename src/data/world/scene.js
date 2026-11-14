import { backgroundsFor } from "./backgrounds";
import { ROCKS } from "./rocks";
import { ROCKET_ENTITIES } from "./rocket";
import { OUTPOST_STATIONS } from "./stations";
import { CREW_ENTITIES } from "./crew";

/**
 * The whole playable surface. Adding, editing or removing an object means
 * touching exactly one entry in one of these arrays.
 *
 * The backdrop follows the landing site (`jezero` or `meridiani`); the
 * entities are the same outpost on either horizon.
 */
const ENTITIES = [...ROCKS, ...ROCKET_ENTITIES, ...OUTPOST_STATIONS, ...CREW_ENTITIES];

export function getScene(mapId = "jezero") {
  return {
    backgrounds: backgroundsFor(mapId),
    entities: ENTITIES,
  };
}

export const SCENE = getScene();
