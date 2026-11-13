import { BACKGROUNDS } from "./backgrounds";
import { ROCKS } from "./rocks";
import { ROCKET_ENTITIES } from "./rocket";
import { OUTPOST_STATIONS } from "./stations";
import { CREW_ENTITIES } from "./crew";

/**
 * The whole playable surface. Adding, editing or removing an object means
 * touching exactly one entry in one of these arrays.
 */
export const SCENE = {
  backgrounds: BACKGROUNDS,
  entities: [...ROCKS, ...ROCKET_ENTITIES, ...OUTPOST_STATIONS, ...CREW_ENTITIES],
};
