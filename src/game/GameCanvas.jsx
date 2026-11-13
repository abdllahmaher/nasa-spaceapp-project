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
  drawEntityBar,
  drawPanorama,
  drawPrompt,
} from "./engine/render";

const CREW_IDS = ["kai", "nova", "rex"];

export default function GameCanvas({
  paused = false,
  inputEnabled = true,
  startLanded = false,
  status = {},
  cinematic = null,
  onInteract,
  onIntroComplete,
  onCinematicDone,
}) {
  const canvasRef = useRef(null);

  // The effect runs once, so live props are read through refs.
  const pausedRef = useRef(paused);
  const inputEnabledRef = useRef(inputEnabled);
  const statusRef = useRef(status);
  const cinematicRef = useRef(cinematic);
  const onInteractRef = useRef(onInteract);
  const onIntroCompleteRef = useRef(onIntroComplete);
  const onCinematicDoneRef = useRef(onCinematicDone);
  const startLandedRef = useRef(startLanded);

  useEffect(() => {
    pausedRef.current = paused;
    inputEnabledRef.current = inputEnabled;
    statusRef.current = status;
    cinematicRef.current = cinematic;
    onInteractRef.current = onInteract;
    onIntroCompleteRef.current = onIntroComplete;
    onCinematicDoneRef.current = onCinematicDone;
  }, [paused, inputEnabled, status, cinematic, onInteract, onIntroComplete, onCinematicDone]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = WORLD.width * dpr;
    canvas.height = WORLD.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const input = createInput(window);
    const player = createPlayer();
    const camera = createCamera(WORLD.introFocusX);
    const entities = prepareEntities(SCENE.entities);
    const rocket = entities.find((entity) => entity.id === "arrival-rocket");
    const crew = entities.filter((entity) => CREW_IDS.includes(entity.id));

    let images = new Map();
    let panoramas = [];
    let spritesheet = null;
    let period = 1;
    let debug = false;
    let disposed = false;
    let introDone = startLandedRef.current;
    let arrived = startLandedRef.current;
    let introWait = 0;
    let wasPaused = false;
    let task = null;
    let handledTask = 0;

    if (startLandedRef.current) {
      rocket?.behavior?.skip?.();
      for (const member of crew) member.x = member.homeX ?? member.x;
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

      for (const entry of panoramas) {
        if (entry.layer.sortY === null) drawPanorama(ctx, entry.panorama, cameraLeft);
      }

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

      drawables.push({
        sortY: player.y,
        draw: () => drawPlayer(ctx, player, cameraLeft, spritesheet),
      });
      drawables.sort((a, b) => a.sortY - b.sortY);

      for (const item of drawables) item.draw();

      // Chunky pixel bars above machines and crew.
      for (const copy of copies) {
        const targetId = copy.entity.interactive?.targetId;
        if (targetId && statusRef.current?.[targetId]) {
          drawEntityBar(ctx, copy, statusRef.current[targetId], images);
        }
      }

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

      if (debug) {
        drawDebugOverlay(ctx, copies, images, cameraLeft, period, player, entities.length);
      }
    };

    const startArrival = () => {
      for (const [index, member] of crew.entries()) {
        member.behavior?.walkTo?.(member.homeX ?? member.x, index * 0.2);
      }
    };

    const updateIntro = (dt) => {
      if (!arrived && rocket?.behavior?.getState?.() === "landed") {
        arrived = true;
        startArrival();
      }

      // Layla steps away from the lander while the crew heads to their posts.
      const dx = WORLD.introExitX - player.x;
      if (Math.abs(dx) > 1) {
        const step = Math.min(Math.abs(dx), 110 * dt);
        player.x += Math.sign(dx) * step;
        player.facing = Math.sign(dx);
        player.action = "walk";
        player.animTime += dt;
      } else if (player.action !== "idle") {
        player.action = "idle";
        player.animTime = 0;
      }

      if (arrived && crew.every((member) => !member.behavior?.isBusy?.())) {
        introWait += dt;
        if (introWait > 0.9) {
          introDone = true;
          onIntroCompleteRef.current?.();
        }
      }
    };

    const updateTask = (dt) => {
      if (!task && cinematicRef.current && cinematicRef.current.token !== handledTask) {
        const next = cinematicRef.current;
        const actor = entities.find((entity) => entity.id === next.crewId);
        const machine = entities.find(
          (entity) => entity.interactive?.targetId === next.targetId,
        );

        if (actor && machine) {
          const targetX = machine.x + 44 / period;
          actor.behavior?.walkTo?.(targetX);
          task = {
            token: next.token,
            actor,
            machine,
            work: next.work ?? 1.6,
            phase: "walk",
          };
        } else {
          handledTask = next.token;
          onCinematicDoneRef.current?.(next.token);
        }
      }

      if (!task) return;

      const { actor, machine } = task;
      if (task.phase === "walk" && !actor.behavior?.isBusy?.()) {
        actor.behavior?.work?.(task.work, true);
        task.phase = "work";
      } else if (task.phase === "work" && !actor.behavior?.isBusy?.()) {
        handledTask = task.token;
        actor.behavior?.walkTo?.(actor.homeX ?? actor.x);
        onCinematicDoneRef.current?.(task.token);
        task = null;
        return;
      }

      camera.update(
        dt,
        (actor.x + machine.x) * 0.5 * period,
      );
    };

    const update = (dt) => {
      const pausedNow = pausedRef.current;

      if (pausedNow) {
        if (!wasPaused) input.clear();
        wasPaused = true;
      } else {
        wasPaused = false;

        for (const entity of entities) entity.behavior?.update?.(dt, period);

        if (!introDone) {
          updateIntro(dt);
          // The camera pans with the crew as they head out to their posts, so
          // nobody walks off the edge of the screen during the arrival.
          const crewFocus = crew.length
            ? crew.reduce((sum, member) => sum + member.x * period, 0) / crew.length
            : WORLD.introFocusX;
          camera.update(dt, Math.max(crewFocus, (rocket?.x ?? 0) * period));
          draw();
          return;
        }

        updateTask(dt);
        const focused = Boolean(task);

        if (inputEnabledRef.current) {
          updatePlayer(player, dt, input, entities, period);

          if (player.pendingInteraction) {
            const request = player.pendingInteraction;
            player.pendingInteraction = null;
            onInteractRef.current?.(request);
          }
        }

        if (!focused) camera.update(dt, player.x);
      }

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
