import { useEffect, useRef } from "react";
import { createInput } from "./input";
import { createLoop } from "./gameLoop";
import { createCamera } from "./camera";
import { createPlayer, drawPlayer, updatePlayer, PLAYER_SHEET } from "./player";
import { findInteractable } from "./interaction";
import { WORLD } from "./world";
import { SCENE } from "../data/world/scene";
import { collectSources, loadImage, loadImages } from "./engine/assets";
import {
  isEntityInteractive,
  nearestWorldX,
  prepareEntities,
  visibleEntities,
} from "./engine/entities";
import {
  buildPanorama,
  drawDebugOverlay,
  drawEntity,
  drawEntityBar,
  drawPanorama,
  drawPrompt,
  drawQuestMarker,
  entityTop,
} from "./engine/render";

const CREW_IDS = ["kai", "nova", "rex"];
// How long each specialist needs to bolt their station together.
const BUILD_SECONDS = 2.0;

export default function GameCanvas({
  paused = false,
  inputEnabled = true,
  startLanded = false,
  status = {},
  markers = {},
  cinematic = null,
  walkTo = null,
  onInteract,
  onIntroComplete,
  onCinematicDone,
}) {
  const canvasRef = useRef(null);

  // The effect runs once, so live props are read through refs.
  const pausedRef = useRef(paused);
  const inputEnabledRef = useRef(inputEnabled);
  const statusRef = useRef(status);
  const markersRef = useRef(markers);
  const cinematicRef = useRef(cinematic);
  const walkToRef = useRef(walkTo);
  const onInteractRef = useRef(onInteract);
  const onIntroCompleteRef = useRef(onIntroComplete);
  const onCinematicDoneRef = useRef(onCinematicDone);
  const startLandedRef = useRef(startLanded);

  useEffect(() => {
    pausedRef.current = paused;
    inputEnabledRef.current = inputEnabled;
    statusRef.current = status;
    markersRef.current = markers;
    cinematicRef.current = cinematic;
    walkToRef.current = walkTo;
    onInteractRef.current = onInteract;
    onIntroCompleteRef.current = onIntroComplete;
    onCinematicDoneRef.current = onCinematicDone;
  }, [
    paused,
    inputEnabled,
    status,
    markers,
    cinematic,
    walkTo,
    onInteract,
    onIntroComplete,
    onCinematicDone,
  ]);

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
    const stationOf = (member) =>
      entities.find((entity) => entity.id === member.stationId);

    let images = new Map();
    let panoramas = [];
    let spritesheet = null;
    let period = 1;
    let clock = 0;
    let debug = false;
    let disposed = false;
    let introDone = startLandedRef.current;
    let arrived = startLandedRef.current;
    let introWait = 0;
    let wasPaused = false;
    let task = null;
    let handledTask = 0;
    let handledWalk = 0;

    if (startLandedRef.current) {
      // Resuming: the outpost is already standing and the crew are at work.
      rocket?.behavior?.skip?.();
      for (const member of crew) {
        member.behavior?.show?.();
        member.x = member.homeX ?? member.x;
        member.introPhase = "done";
      }
      for (const entity of entities) entity.behavior?.finish?.();
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

      const copies = visibleEntities(entities, period, cameraLeft).filter(
        (copy) => copy.entity.behavior?.isVisible?.() !== false,
      );
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

      // Layla stays in the lander until touchdown.
      if (arrived) {
        drawables.push({
          sortY: player.y,
          draw: () => drawPlayer(ctx, player, cameraLeft, spritesheet),
        });
      }
      drawables.sort((a, b) => a.sortY - b.sortY);

      for (const item of drawables) item.draw();

      // Pixel bars + "go here" pins above machines and crew.
      for (const copy of copies) {
        const targetId = copy.entity.interactive?.targetId;
        if (!targetId) continue;

        const build = copy.entity.behavior?.getProgress?.();
        if (build !== undefined) {
          // Nothing to show until the crew has started assembling it.
          if (build <= 0) continue;
          if (build < 1) {
            drawEntityBar(
              ctx,
              copy,
              { value: build * 100, tint: "#ffb066", icon: "wrench" },
              images,
            );
            continue;
          }
        }

        const statusEntry = statusRef.current?.[targetId];
        if (statusEntry) drawEntityBar(ctx, copy, statusEntry, images);
        if (introDone && markersRef.current?.[targetId]) {
          drawQuestMarker(ctx, copy, images, clock);
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
        member.behavior?.show?.();
        const station = stationOf(member);
        // Stand right at the build site, then bolt it together. The offset
        // keeps the crew just clear of the machine's centre so both the
        // character and the station stay readable.
        const standX = station ? station.x - 20 / period : member.homeX ?? member.x;
        member.introPhase = "walk";
        member.behavior?.walkTo?.(standX, index * 0.45);
      }
    };

    const updateCrewBuilds = () => {
      for (const member of crew) {
        const station = stationOf(member);

        if (member.introPhase === "walk" && !member.behavior?.isBusy?.()) {
          member.introPhase = "build";
          member.behavior?.work?.(BUILD_SECONDS, false);
          station?.behavior?.build?.();
        } else if (member.introPhase === "build" && !member.behavior?.isBusy?.()) {
          member.introPhase = "home";
          member.behavior?.walkTo?.(member.homeX ?? member.x);
        } else if (member.introPhase === "home" && !member.behavior?.isBusy?.()) {
          member.introPhase = "done";
        }
      }
    };

    const updateIntro = (dt) => {
      if (!arrived && rocket?.behavior?.getState?.() === "landed") {
        arrived = true;
        startArrival();
      }

      if (!arrived) return;

      // Layla steps away from the lander while the crew builds.
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

      updateCrewBuilds();

      if (crew.every((member) => member.introPhase === "done")) {
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

      camera.update(dt, (actor.x + machine.x) * 0.5 * period);
    };

    // ---------------------------------------------------------------- mouse

    const toWorld = (event) => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return null;
      const sx = ((event.clientX - rect.left) / rect.width) * WORLD.width;
      const sy = ((event.clientY - rect.top) / rect.height) * WORLD.height;
      return { sx, sy, worldX: camera.getLeft() + sx };
    };

    const hitTest = (event) => {
      const point = toWorld(event);
      if (!point) return null;

      let best = null;
      for (const entity of entities) {
        if (!isEntityInteractive(entity)) continue;
        if (entity.behavior?.isVisible?.() === false) continue;

        const worldX = nearestWorldX(entity, period, point.worldX);
        const top = entityTop(entity, images) ?? entity.y - 40;
        // Generous target: sprite, status bar and quest pin all count.
        if (point.sy < top - 60 || point.sy > entity.y + 14) continue;

        const reach = Math.max(64, (entity.footR ?? 24) * 1.6);
        const dx = Math.abs(worldX - point.worldX);
        if (dx > reach) continue;
        if (!best || dx < best.dx) best = { entity, worldX, dx };
      }
      return best;
    };

    const queueWalkTo = (entity, worldX) => {
      if (!entity) {
        player.auto = { x: worldX, faceX: worldX };
        return;
      }

      const interaction = entity.interactive;
      const offset = Math.max(48, Math.min(96, (entity.footR ?? 24) + 46));
      const side = player.x <= worldX ? -1 : 1;

      player.auto = {
        x: worldX + side * offset,
        faceX: worldX,
        targetId: interaction?.targetId ?? null,
        entityId: entity.id,
        label: interaction?.label ?? null,
      };
    };

    const onClick = (event) => {
      if (!introDone || !inputEnabledRef.current || pausedRef.current) return;

      const hit = hitTest(event);
      if (hit) {
        queueWalkTo(hit.entity, hit.worldX);
        return;
      }

      const point = toWorld(event);
      if (point) queueWalkTo(null, point.worldX);
    };

    const onMove = (event) => {
      if (!introDone || !inputEnabledRef.current || pausedRef.current) {
        canvas.style.cursor = "default";
        return;
      }
      canvas.style.cursor = hitTest(event) ? "pointer" : "default";
    };

    canvas.addEventListener("click", onClick);
    canvas.addEventListener("mousemove", onMove);

    // ---------------------------------------------------------------- loop

    const update = (dt) => {
      const pausedNow = pausedRef.current;
      clock += dt;

      if (pausedNow) {
        if (!wasPaused) input.clear();
        wasPaused = true;
      } else {
        wasPaused = false;

        for (const entity of entities) entity.behavior?.update?.(dt, period);

        if (!introDone) {
          updateIntro(dt);
          // The camera pans with the crew as they head out to their posts, so
          // nobody walks off the edge of the screen during the arrival. It
          // tracks the furthest one along rather than the average, so the
          // station being built stays in frame instead of sitting off the
          // right-hand edge.
          const crewFocus = crew.length
            ? Math.max(...crew.map((member) => member.x * period))
            : WORLD.introFocusX;
          camera.update(dt, Math.max(crewFocus, (rocket?.x ?? 0) * period));
          draw();
          return;
        }

        updateTask(dt);
        const focused = Boolean(task);

        // HUD shortcuts (quest rows) ask Layla to walk somewhere.
        if (walkToRef.current && walkToRef.current.token !== handledWalk) {
          const next = walkToRef.current;
          handledWalk = next.token;
          const target = entities.find(
            (entity) =>
              entity.interactive?.targetId === next.targetId &&
              isEntityInteractive(entity),
          );
          if (target) queueWalkTo(target, nearestWorldX(target, period, player.x));
        }

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
      canvas.removeEventListener("click", onClick);
      canvas.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <div className="game-frame">
      <canvas
        ref={canvasRef}
        className="game-canvas"
        aria-label="Mars surface. Move with WASD or arrows, Space to jump, E to inspect, or click a marked spot to walk there. F2 for debug."
      />
      <span className="game-badge">Layla · Commander · Surface EVA</span>
    </div>
  );
}
