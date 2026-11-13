import { WORLD, depthScale } from "../world";
import { isEntityBlocking } from "./entities";

// Pre-scale a panorama to canvas height once, in both orientations.
function buildTile(image, width, height, mirrored = false) {
  const tile = document.createElement("canvas");
  tile.width = Math.ceil(width);
  tile.height = height;
  const g = tile.getContext("2d");
  if (mirrored) {
    g.translate(width, 0);
    g.scale(-1, 1);
  }
  g.drawImage(image, 0, 0, width, height);
  return tile;
}

export function buildPanorama(image) {
  const width = image.width * (WORLD.height / image.height);
  return {
    width,
    normal: buildTile(image, width, WORLD.height),
    mirrored: buildTile(image, width, WORLD.height, true),
  };
}

export function drawPanorama(ctx, panorama, cameraLeft) {
  const { width, normal, mirrored } = panorama;
  const first = Math.floor(cameraLeft / width);
  const last = Math.floor((cameraLeft + WORLD.width) / width);

  for (let i = first; i <= last; i += 1) {
    const x = i * width - cameraLeft;
    // Odd tiles are mirrored so the panorama loops without a hard seam.
    const tile = ((i % 2) + 2) % 2 === 1 ? mirrored : normal;
    // +1px overlap hides sub-pixel gaps between tiles.
    ctx.drawImage(tile, x, 0, width + 1, WORLD.height);
  }
}

/**
 * Resolves the sprite frame and scale for one entity copy.
 * `y` is always the ground contact line.
 */
export function entityMetrics(entity, view, image) {
  const sprite = entity.sprite ?? {};
  let frame = view?.frame ?? sprite.frame ?? {
    x: 0,
    y: 0,
    w: image.width,
    h: image.height,
  };

  // Sliced art can leave hairline seams between neighbours; drawing a couple
  // of source pixels of bleed on each side closes them.
  const bleed = view?.frame ? 0 : sprite.bleed ?? 0;
  if (bleed > 0) {
    const left = Math.max(0, frame.x - bleed);
    const right = Math.min(image.width, frame.x + frame.w + bleed);
    frame = { x: left, y: frame.y, w: right - left, h: frame.h };
  }

  const scale =
    (entity.perspective === false ? 1 : depthScale(entity.y)) *
    entity.scale *
    (view?.scaleMul ?? 1);
  return { frame, scale, w: frame.w * scale, h: frame.h * scale };
}

/** Screen-independent top edge of an entity, in screen space (add camera). */
export function entityTop(entity, images) {
  const view = entity.behavior?.getView?.();
  const src = view?.src ?? entity.sprite?.src;
  const image = images.get(src);
  if (!image) return null;

  const { h } = entityMetrics(entity, view, image);
  const anchor = view?.anchor ?? entity.anchor ?? 1;
  return entity.y + (view?.offsetY ?? 0) - h * anchor;
}

/** Draws one entity copy (screenX already world-anchored). */
export function drawEntity(ctx, copy, images) {
  const { entity, screenX, flip } = copy;
  const view = entity.behavior?.getView?.();
  const src = view?.src ?? entity.sprite?.src;
  const image = images.get(src);
  if (!image) return;

  const { frame, w, h } = entityMetrics(entity, view, image);
  const anchor = view?.anchor ?? entity.anchor ?? 1;
  const top = entity.y + (view?.offsetY ?? 0) - h * anchor;
  const shadowK = Math.max(0, view?.shadowK ?? 1);

  if (entity.shadow) {
    const radius = entity.footR ?? Math.max(10, w * 0.3);
    ctx.save();
    ctx.globalAlpha = 0.26 * shadowK;
    ctx.fillStyle = "#160b12";
    ctx.beginPath();
    ctx.ellipse(
      screenX,
      entity.y - 2,
      radius * 0.95 * shadowK + 3,
      Math.max(3, radius * 0.26 * shadowK + 1),
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.restore();
  }

  ctx.save();
  ctx.imageSmoothingEnabled = false;

  if (flip) {
    ctx.translate(screenX, top);
    ctx.scale(-1, 1);
    ctx.drawImage(image, frame.x, frame.y, frame.w, frame.h, -w / 2, 0, w, h);
  } else {
    ctx.drawImage(image, frame.x, frame.y, frame.w, frame.h, screenX - w / 2, top, w, h);
  }

  ctx.restore();
}

// Small "E" bubble over the entity Layla can fix or inspect.
export function drawPrompt(ctx, target, images, cameraLeft) {
  const top = entityTop(target.entity, images);
  if (top === null) return;

  const x = target.worldX - cameraLeft;
  const y = top - 16;
  const interaction = target.entity.interactive;
  const label = typeof interaction === "object" ? interaction.label : null;

  ctx.save();
  ctx.globalAlpha = 0.92;
  ctx.fillStyle = "rgba(20, 10, 16, 0.78)";
  ctx.strokeStyle = "rgba(255, 217, 224, 0.6)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x, y, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#ffd9e0";
  ctx.font = "600 11px ui-monospace, monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("E", x, y + 0.5);

  if (label) {
    ctx.font = "600 10px ui-monospace, monospace";
    const padding = 8;
    const textWidth = ctx.measureText(label).width;
    const boxWidth = textWidth + padding * 2;
    const boxHeight = 22;
    let boxX = x + 15;

    // Keep the label inside the canvas when the entity is near the edge.
    if (boxX + boxWidth > WORLD.width - 8) boxX = x - 15 - boxWidth;

    ctx.fillStyle = "rgba(20, 10, 16, 0.82)";
    ctx.strokeStyle = "rgba(255, 217, 224, 0.28)";
    ctx.beginPath();
    ctx.roundRect(boxX, y - boxHeight / 2, boxWidth, boxHeight, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#ffd9e0";
    ctx.textAlign = "left";
    ctx.fillText(label, boxX + padding, y + 0.5);
  }

  ctx.restore();
}

/**
 * F2 overlay: footprints, anchors, sort lines, world-period boundaries and
 * entity ids — everything needed to tune a newly added asset in seconds.
 */
export function drawDebugOverlay(ctx, copies, images, cameraLeft, period, player, entityCount) {
  ctx.save();
  ctx.font = "10px ui-monospace, monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";

  const firstIndex = Math.floor(cameraLeft / period) - 1;
  for (let i = firstIndex; i < firstIndex + 3; i += 1) {
    const x = i * period - cameraLeft;
    if (x < -40 || x > WORLD.width + 40) continue;

    ctx.strokeStyle = "rgba(120, 255, 220, 0.45)";
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, WORLD.height);
    ctx.stroke();

    ctx.fillStyle = "rgba(120, 255, 220, 0.8)";
    ctx.fillText(`period ${i}`, x, WORLD.height - 8);
  }
  ctx.setLineDash([]);

  for (const copy of copies) {
    const { entity, screenX } = copy;
    const blocking = isEntityBlocking(entity);

    if (entity.footR) {
      const ry = Math.max(8, entity.footR * 0.28);
      ctx.beginPath();
      ctx.ellipse(screenX, entity.y, entity.footR, ry, 0, 0, Math.PI * 2);
      ctx.fillStyle = blocking ? "rgba(255, 90, 120, 0.16)" : "rgba(90, 160, 255, 0.16)";
      ctx.fill();
      ctx.strokeStyle = blocking ? "rgba(255, 90, 120, 0.8)" : "rgba(90, 160, 255, 0.8)";
      ctx.stroke();
    }

    // Ground anchor.
    ctx.strokeStyle = "rgba(255, 220, 120, 0.9)";
    ctx.beginPath();
    ctx.moveTo(screenX - 5, entity.y);
    ctx.lineTo(screenX + 5, entity.y);
    ctx.moveTo(screenX, entity.y - 5);
    ctx.lineTo(screenX, entity.y + 5);
    ctx.stroke();

    // Sort line: everything above is drawn earlier (further away).
    ctx.strokeStyle = "rgba(255, 220, 120, 0.2)";
    ctx.beginPath();
    ctx.moveTo(0, entity.y);
    ctx.lineTo(WORLD.width, entity.y);
    ctx.stroke();

    const top = entityTop(entity, images) ?? entity.y - 20;
    ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
    ctx.fillText(`${entity.id} · y${Math.round(entity.y)}`, screenX, top - 4);
  }

  if (player) {
    const px = player.x - cameraLeft;
    ctx.strokeStyle = "rgba(140, 255, 160, 0.9)";
    ctx.beginPath();
    ctx.arc(px, player.y, 3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "rgba(140, 255, 160, 0.95)";
    ctx.fillText(`player ${player.action} · y${Math.round(player.y)}`, px, player.y - 10);
  }

  // HUD.
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "rgba(10, 6, 12, 0.68)";
  ctx.fillRect(12, 12, 268, 56);
  ctx.fillStyle = "#9df5d6";
  ctx.font = "11px ui-monospace, monospace";
  ctx.fillText("debug · F2 to hide", 20, 28);
  ctx.fillText(`camera ${Math.round(cameraLeft)} · period ${Math.round(period)} px`, 20, 44);
  ctx.fillText(`entities ${entityCount} · on screen ${copies.length}`, 20, 60);
  ctx.restore();
}
