import spaceUrl from "../../assets/world/space.png";

/**
 * Full-width panorama layers. They tile together with the background, so
 * their art always stays aligned with the terrain.
 *
 * sortY:
 *   null  → always drawn behind the player (sky, ground)
 *   number → y-sorted against entities: a player with a lower y (further
 *            away) is drawn first, so the layer covers them.
 */
export const BACKGROUNDS = [{ id: "surface", src: spaceUrl, sortY: null }];
