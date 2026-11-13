import { useEffect, useRef } from "react";
import { createInput } from "./input";
import { createLoop } from "./gameLoop";
import { createCamera } from "./camera";
import { createPlayer, drawPlayer, updatePlayer, PLAYER_SHEET } from "./player";
import { findInteractable } from "./interaction";
import { WORLD } from "./world";
import { SCENE } from "../data/world/scene";
import { collectSources, loadImage, loadImages } from "./engine/assets";
import { prepareEntities, visibleEntities } from "./engine/entities";
import {
  buildPanorama,
  drawDebugOverlay,
  drawEntity,
  drawPanorama,
  drawPrompt,
} from "./engine/render";

export default function GameCanvas({
  paused = false,
  inputEnabled = true,
  startLanded = false,
  onInteract,
  onIntroComplete,
}) {
  const canvasRef = useRef(null);

  // The effect runs once, so live props are read through refs.
  const pausedRef = useRef(paused);
  const inputEnabledRef = useRef(inputEnabled);
  const onInteractRef = useRef(onInteract);
  const onIntroCompleteRef = useRef(onIntroComplete);
  const startLandedRef = useRef(startLanded);

  useEffect(() => {
    pausedRef.current = paused;
    inputEnabledRef.current = inputEnabled;
    onInteractRef.current = onInteract;
    onIntroCompleteRef.current = onIntroComplete;
  }, [paused, inputEnabled, onInteract, onIntroComplete]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = WORLD.width * dpr;
    canvas.height = WORLD.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const input = createInput(window);
    const player = createPlayer();
    const camera = createCamera(player.x);
    const entities = prepareEntities(SCENE.entities);
    const rocket = entities.find((entity) => entity.id === "arrival-rocket");

    let images = new Map();
    let panoramas = [];
    let spritesheet = null;
    let period = 1;
    let debug = false;
    let disposed = false;
    let introDone = startLandedRef.current;
    let wasPaused = false;

    if (startLandedRef.current) {
      rocket?.behavior?.skip?.();
    }

    const ready = () => panoramas.length > 0 && spritesheet !== null;

    const draw = () => {
      ctx.clearRect(0, 0, WORLD.width, WORLD.height);

      if (!ready()) {
        ctx.fillStyle = "#1b1020";
        ctx.fillRect(0, 0, WORLD.width, WORLD.height);
        ctx.fillStyle = "#b06a7a";
        ctx.font = "600 14px ui-monospace, monospace";
        ctx.fillText("Loading outpost…", 24, 32);
        return;
      }

      const cameraLeft = camera.getLeft();

      // 1. Panorama layers that always sit behind everything.
      for (const entry of panoramas) {
        if (entry.layer.sortY === null) drawPanorama(ctx, entry.panorama, cameraLeft);
      }

      // 2. Depth-sorted pass: sorted panorama layers, entities and the player,
      //    ordered by their ground line (lower on screen = closer = on top).
      const copies = visibleEntities(entities, period, cameraLeft);
      const drawables = [];

      for (const entry of panoramas) {
        if (entry.layer.sortY === null) continue;
        drawables.push({
          sortY: entry.layer.sortY,
          draw: () => drawPanorama(ctx, entry.panorama, cameraLeft),
        });
      }

      for (const copy of copies) {
        // The entity being fixed wobbles a little.
        if (
          player.fixHitTimer > 0 &&
          player.fixTarget &&
          copy.entity.id === player.fixTarget.entityId &&
          Math.abs(copy.worldX - player.fixTarget.worldX) < 1
        ) {
          copy.screenX += Math.sin(player.fixHitTimer * 70) * 3 * (player.fixHitTimer / 0.4);
        }

        drawables.push({
          sortY: copy.entity.y,
          draw: () => drawEntity(ctx, copy, images),
        });
      }

      drawables.push({ sortY: player.y, draw: () => drawPlayer(ctx, player, cameraLeft, spritesheet) });
      drawables.sort((a, b) => a.sortY - b.sortY);

      for (const item of drawables) item.draw();

      // 3. Interaction prompt (only while the commander is in control).
      if (inputEnabledRef.current && !pausedRef.current && player.z <= 0) {
        const target = findInteractable(
          entities,
          period,
          player.x,
          player.y,
          WORLD.interactRange,
        );
        if (target) drawPrompt(ctx, target, images, cameraLeft);
      }

      // 4. Debug overlay.
      if (debug) {
        drawDebugOverlay(ctx, copies, images, cameraLeft, period, player, entities.length);
      }
    };

    const update = (dt) => {
      const pausedNow = pausedRef.current;

      if (pausedNow) {
        // Drop any keys held when a modal opened, so closing it doesn't make
        // the commander walk or interact unexpectedly.
        if (!wasPaused) input.clear();
        wasPaused = true;
      } else {
        wasPaused = false;

        for (const entity of entities) entity.behavior?.update?.(dt);

        if (inputEnabledRef.current) {
          updatePlayer(player, dt, input, entities, period);

          if (player.pendingInteraction) {
            const request = player.pendingInteraction;
            player.pendingInteraction = null;
            onInteractRef.current?.(request);
          }
        }

        if (!introDone && rocket?.behavior?.getState?.() === "landed") {
          introDone = true;
          onIntroCompleteRef.current?.();
        }
      }

      camera.update(dt, player.x);
      if (input.consume("debug")) debug = !debug;
      draw();
    };

    const loop = createLoop(update);

    Promise.all([
      loadImages(collectSources(SCENE.backgrounds, entities)),
      loadImage(PLAYER_SHEET),
    ]).then(([sceneImages, sprite]) => {
      if (disposed) return;

      images = sceneImages;
      spritesheet = sprite;
      panoramas = SCENE.backgrounds.map((layer) => ({
        layer,
        panorama: buildPanorama(images.get(layer.src)),
      }));
      period = (panoramas[0]?.panorama.width ?? WORLD.width) * 2;
      loop.start();
    });

    return () => {
      disposed = true;
      loop.stop();
      input.destroy();
    };
  }, []);

  return (
    <div className="game-frame">
      <canvas
        ref={canvasRef}
        className="game-canvas"
        aria-label="Mars surface. Move with WASD or arrows, Space to jump, E to inspect or talk, F2 for debug."
      />
      <span className="game-badge">Layla · Commander · Surface EVA</span>
    </div>
  );
}
