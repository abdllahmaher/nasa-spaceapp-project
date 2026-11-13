export const WORLD = {
  width: 960,
  height: 540,
  // The horizon sits near the middle of the background art.
  // Horizontal space is endless, so only Y is bounded.
  walkArea: {
    minY: 300,
    maxY: 500,
  },
  playerSpeed: 190,
  runMultiplier: 1.8,
  // Where Layla starts on the endless surface.
  startX: 1480,
  startY: 492,
  // Intro staging: the camera holds on the outpost while the crew exits.
  introFocusX: 1650,
  introExitX: 1340,
  // Sprite size on screen: kept small so the landscape feels vast.
  playerScale: 0.7,
  // How quickly the camera catches up to the player (higher = snappier).
  cameraEase: 7,
  // Fraction of the half-view the player can roam before the camera scrolls.
  // Keeps the camera parked until the player is near the screen edge.
  cameraDeadZone: 0.1,
  // Jump arc.
  jumpSpeed: 330,
  gravity: 1150,
  // How close Layla has to be to a prop to fix/interact with it.
  interactRange: { x: 100, y: 56 },
};

// Perspective: characters shrink slightly as they move toward the horizon.
export function depthScale(y) {
  const { minY, maxY } = WORLD.walkArea;
  const t = (y - minY) / (maxY - minY);
  return 0.72 + 0.28 * Math.min(1, Math.max(0, t));
}
