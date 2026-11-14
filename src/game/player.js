import { clampToArea, resolveEntityCollisions } from "./collision";
import { findInteractable } from "./interaction";
import { WORLD, depthScale } from "./world";
import sheetUrl from "../assets/characters/lyra_spritesheet.png";
import sheet from "../assets/characters/lyra_spritesheet.json";

const CLIP_FPS = { idle: 6, walk: 12, run: 16, jump: 10, mine: 12 };
const MINE_FRAMES = 8;
const MINE_SECONDS = MINE_FRAMES / CLIP_FPS.mine;

// Height of the feet inside a 128px sprite frame.
const FEET_RATIO = 0.95;

function buildClip(action, count) {
  return Array.from({ length: count }, (_, i) => sheet.frames[`${action}_${i}`].frame);
}

export const PLAYER_SHEET = sheetUrl;

export const PLAYER_CLIPS = {
  idle: buildClip("idle", 8),
  walk: buildClip("walk", 8),
  run: buildClip("run", 8),
  jump: buildClip("jump", 6),
  mine: buildClip("mine", MINE_FRAMES),
};

export function createPlayer() {
  return {
    x: WORLD.startX,
    y: WORLD.startY,
    z: 0, // height above the ground
    vz: 0,
    facing: 1, // 1 = right, -1 = left
    action: "idle",
    animTime: 0,
    fixTimer: 0,
    fixTarget: null, // { entityId, worldX }
    fixHitTimer: 0,
    pendingInteraction: null,
    autoStall: 0,
    // Click-to-move target: { x, y, faceX, targetId?, entityId?, label? }
    auto: null, // { targetId, entityId, label }
  };
}

export function updatePlayer(player, dt, input, entities, period) {
  const grounded = player.z <= 0 && player.vz <= 0 && player.fixTimer <= 0;
  const fixing = player.fixTimer > 0;

  const { x: ax, y: ay } = fixing ? { x: 0, y: 0 } : input.axis();
  const userMoving = ax !== 0 || ay !== 0;
  const running = userMoving && input.isDown("run");

  // Click-to-move / "walk me there": slide toward the chosen spot, then fire
  // the interaction it was pointing at. Any manual input cancels it.
  let autoMoving = false;
  if (player.auto) {
    if (userMoving) {
      player.auto = null;
      player.autoStall = 0;
    } else {
      const dx = player.auto.x - player.x;
      const dy = (player.auto.y ?? player.y) - player.y;
      // Generous vertical tolerance: the ground is drawn in perspective, so an
      // exact pixel match is not something a child should have to aim for.
      if (Math.abs(dx) <= 6 && Math.abs(dy) <= 12) {
        player.x = player.auto.x;
        if (player.auto.y !== undefined) player.y = player.auto.y;
        const target = player.auto;
        player.auto = null;
        if (target.targetId) {
          player.pendingInteraction = {
            targetId: target.targetId,
            entityId: target.entityId,
            label: target.label,
          };
        }
        player.facing = target.faceX >= player.x ? 1 : -1;
      } else {
        const beforeX = player.x;
        const beforeY = player.y;
        const distance = Math.hypot(dx, dy);
        const step = Math.min(distance, WORLD.playerSpeed * dt);
        if (distance > 0) {
          player.x += (dx / distance) * step;
          player.y += (dy / distance) * step * 0.72;
        }
        if (Math.abs(dx) > 1) player.facing = dx > 0 ? 1 : -1;
        autoMoving = true;

        // Props are solid and the walk is a straight line, so a rock in the way
        // would otherwise leave the commander shoving at it forever. If we stop
        // making progress, take the interaction from where we stand instead.
        const progress = Math.hypot(player.x - beforeX, player.y - beforeY);
        player.autoStall = progress < 0.35 ? (player.autoStall ?? 0) + dt : 0;
        if (player.autoStall > 1.1) {
          const target = player.auto;
          player.auto = null;
          player.autoStall = 0;
          const reachable = target && Math.abs((target.faceX ?? target.x) - player.x) < 220;
          if (target?.targetId && reachable) {
            player.pendingInteraction = {
              targetId: target.targetId,
              entityId: target.entityId,
              label: target.label,
            };
          }
        }
      }
    }
  }

  const moving = userMoving || autoMoving;

  if (moving) {
    if (userMoving) {
      const length = Math.hypot(ax, ay) || 1;
      const speed = WORLD.playerSpeed * (running ? WORLD.runMultiplier : 1);
      player.x += (ax / length) * speed * dt;
      player.y += (ay / length) * speed * 0.65 * dt;
      if (ax !== 0) player.facing = ax > 0 ? 1 : -1;
    }

    clampToArea(player, WORLD.walkArea);
    // A guided walk (task row, bubble "show me") is collision-free on purpose:
    // the straight line to a crew member must always finish, otherwise a rock
    // in the way silently swallows the task the player just clicked.
    if (!autoMoving) resolveEntityCollisions(player, entities, period);
    clampToArea(player, WORLD.walkArea);
  }

  // Jump.
  if (input.consume("jump") && grounded) {
    player.vz = WORLD.jumpSpeed;
    player.z = 0.0001;
  }

  // Vertical physics.
  if (player.z > 0 || player.vz > 0) {
    player.z += player.vz * dt;
    player.vz -= WORLD.gravity * dt;
    if (player.z <= 0) {
      player.z = 0;
      player.vz = 0;
    }
  }

  // Fix / interact with the nearest entity in reach.
  if (input.consume("fix") && grounded) {
    const target = findInteractable(entities, period, player.x, player.y, WORLD.interactRange);
    if (target) {
      const interaction = target.entity.interactive;

      // Story interactions open a modal; plain props keep the repair animation.
      if (interaction && typeof interaction === "object" && interaction.targetId) {
        player.pendingInteraction = {
          targetId: interaction.targetId,
          entityId: target.entity.id,
          label: interaction.label,
        };
        player.facing = target.worldX >= player.x ? 1 : -1;
      } else {
        player.fixTimer = MINE_SECONDS;
        player.fixTarget = { entityId: target.entity.id, worldX: target.worldX };
        player.fixHitTimer = 0.4;
        player.facing = target.worldX >= player.x ? 1 : -1;
      }
    }
  }

  if (player.fixTimer > 0) player.fixTimer = Math.max(0, player.fixTimer - dt);
  if (player.fixHitTimer > 0) player.fixHitTimer = Math.max(0, player.fixHitTimer - dt);
  if (player.fixTimer <= 0) player.fixTarget = null;

  const airborne = player.z > 0 || player.vz > 0;
  let nextAction;
  if (player.fixTimer > 0) nextAction = "mine";
  else if (airborne) nextAction = "jump";
  else nextAction = moving ? (running ? "run" : "walk") : "idle";

  if (nextAction !== player.action) {
    player.action = nextAction;
    player.animTime = 0;
  } else {
    player.animTime += dt;
  }
}

export function drawPlayer(ctx, player, cameraLeft, spritesheet) {
  const screenX = player.x - cameraLeft;
  const scale = depthScale(player.y) * WORLD.playerScale;
  const frameHeight = 128 * scale;
  const frameWidth = 128 * scale;
  const feetY = player.y;
  const topY = feetY - frameHeight * FEET_RATIO - player.z;
  const shadowK = Math.max(0.4, 1 - player.z / 220);

  // Contact shadow shrinks as Layla leaves the ground.
  ctx.save();
  ctx.globalAlpha = 0.28 * shadowK;
  ctx.fillStyle = "#160b12";
  ctx.beginPath();
  ctx.ellipse(
    screenX,
    feetY - 2,
    frameWidth * 0.26 * shadowK,
    frameWidth * 0.08 * shadowK,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.restore();

  const frames = PLAYER_CLIPS[player.action];
  const index = Math.floor(player.animTime * CLIP_FPS[player.action]) % frames.length;
  const frame = frames[index];

  ctx.save();
  ctx.imageSmoothingEnabled = false;

  if (player.facing === -1) {
    ctx.translate(screenX + frameWidth / 2, topY);
    ctx.scale(-1, 1);
    ctx.drawImage(spritesheet, frame.x, frame.y, frame.w, frame.h, 0, 0, frameWidth, frameHeight);
  } else {
    ctx.drawImage(
      spritesheet,
      frame.x,
      frame.y,
      frame.w,
      frame.h,
      screenX - frameWidth / 2,
      topY,
      frameWidth,
      frameHeight,
    );
  }

  ctx.restore();
}
