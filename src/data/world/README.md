# World data

The whole surface is described here. Adding, editing or removing an object is
a one-entry change in one of these files:

| File | Contains |
|---|---|
| `backgrounds.js` | Full-width panorama layers (`space.png`) |
| `rocks.js` | Rock slices cut from `rock-middle.png` |
| `rocket.js` | Landing pad + arriving rocket |
| `scene.js` | Concatenates everything into `SCENE` |

## Entity schema

```js
{
  id: "unique-id",              // required
  sprite: {
    src,                        // image URL (imported in the data file)
    frame: { x, y, w, h },      // optional crop, e.g. one atlas frame
    bleed: 0,                   // optional source px drawn past the frame,
                                // closes seams between adjacent slices
    clips: {                    // alternative for animated entities
      launch: { src, frames: [{ x, y, w, h, name }], anchor: 0..1 },
      landed: { src, frames: [...], anchor: 1 },
    },
  },
  x: 0.245,                     // REQUIRED, fraction of the world period
  y: 500,                       // REQUIRED, ground contact line in canvas px
  scale: 1,
  perspective: true,            // false = skip the y-based depth shrink
  mirror: false,                // true = add a flipped copy at 1 - x
  repeat: true,                 // false = unique object (rocket, landmarks)
  blocking: false,              // true = feet-ellipse collision
  footR: 24,                    // ellipse radius, required when blocking
  shadow: false,                // draw a ground shadow
  interactive: false,           // E prompt + interact animation
  behavior: {                   // optional state machine
    type: "rocket",
    config: { fps: 12, descentSeconds: 4.5, startOffsetY: -560, startScale: 0.35 },
  },
}
```

`x` is anchored to the world, not the camera: one period is two panorama tiles
(normal + mirrored ≈ 5802 px), so everything stays fixed to the terrain.

## Common edits

**Add a prop from an atlas**

```js
import propsUrl from "../../assets/props/props_128_spritesheet.png";
import props from "../../assets/props/props_128_spritesheet.json";

export const PROPS = [
  {
    id: "solar-panel-a",
    sprite: { src: propsUrl, frame: props.frames.solar_panel_0.frame },
    x: 0.32,
    y: 478,
    scale: 0.8,
    blocking: true,
    footR: 28,
  },
];
```

Then append `...PROPS` in `scene.js`.

**Move an object:** change `x` / `y`. Turn on **F2** to see its anchor,
footprint, sort line and the world-period boundaries.

**Make it walk-through:** `blocking: false`.

**Add a background layer:** add `{ id, src, sortY }` to `backgrounds.js`.
`sortY: null` draws it behind everything; a number y-sorts it with entities.

**Add a behavior:** add a factory in `src/game/engine/behaviors/` and register
it in `behaviors/index.js`. Behaviors implement `update(dt)`, `isBlocking()`,
`isInteractable()` and `getView()`.

## Systems

```
src/game/engine/assets.js    image loading + automatic source collection
src/game/engine/entities.js  validation, mirror/repeat copies, culling
src/game/engine/render.js    panoramas, entity drawing, prompt, debug overlay
src/game/engine/behaviors/   entity state machines (rocket arrival, ...)
src/game/collision.js        feet-ellipse push-out vs nearest world copy
src/game/interaction.js      nearest interactable entity
src/game/player.js           player movement, jump, fix animation
src/game/camera.js           dead-zone camera
```
