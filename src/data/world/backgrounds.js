import jezeroUrl from "../../assets/world/space.png";
import meridianiUrl from "../../assets/world/minimalist-flat-design-illustration-of-mars-surface-with-crater-vector.jpg";

/**
 * Full-width panorama layers. They tile together with the background, so
 * their art always stays aligned with the terrain.
 *
 * sortY:
 *   null  → always drawn behind the player (sky, ground)
 *   number → y-sorted against entities: a player with a lower y (further
 *            away) is drawn first, so the layer covers them.
 *
 * The landing page picks the site; each site gets its own painted horizon.
 */
export const BACKGROUNDS_BY_MAP = {
  jezero: [{ id: "surface", src: jezeroUrl, sortY: null }],
  meridiani: [{ id: "surface", src: meridianiUrl, sortY: null }],
};

export function backgroundsFor(mapId) {
  return BACKGROUNDS_BY_MAP[mapId] ?? BACKGROUNDS_BY_MAP.jezero;
}

export const BACKGROUNDS = BACKGROUNDS_BY_MAP.jezero;
