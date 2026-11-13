import { useEffect, useRef } from "react";
import { PORTRAITS } from "../data/portraits";

/**
 * Shows a character as a clean, border-less portrait.
 *
 * The character is animated straight out of its sprite sheet in
 * `src/assets/characters`: the sheet's `idle` loop — the character's "ideal
 * state" — is played frame by frame on a canvas. The empty padding around
 * the character is cropped away, so the result is a bare cut-out: no
 * background, no ground line and no border.
 *
 * It is a canvas rather than an <img> so the sheet is never scaled up as a
 * whole: only the 128px cell is rasterised, at the exact size needed.
 */

const sheetCache = new Map();

function loadSheet(src) {
  if (!sheetCache.has(src)) {
    const image = new Image();
    image.src = src;
    sheetCache.set(src, image);
  }
  return sheetCache.get(src);
}

export default function Portrait({ id, size = 190, className = "" }) {
  const person = PORTRAITS[id] ?? PORTRAITS.layla;
  const canvasRef = useRef(null);
  const { clip, box, fps } = person;

  // Scale so the character is exactly `size` pixels tall.
  const scale = size / box.h;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(box.w * scale * dpr);
    canvas.height = Math.round(box.h * scale * dpr);

    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;

    const image = loadSheet(person.src);
    const frameMs = 1000 / fps;

    // Every frame is painted through the same crop window, so the character
    // stays put in the portrait and just animates inside it.
    const paint = (frame) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(
        image,
        frame.x + box.x,
        frame.y + box.y,
        box.w,
        box.h,
        0,
        0,
        canvas.width,
        canvas.height,
      );
    };

    let raf = 0;
    let last = 0;
    let index = 0;

    const tick = (now) => {
      raf = requestAnimationFrame(tick);
      if (now - last < frameMs) return;
      // Stay on the exact frame rate instead of drifting with the timer.
      last = now - ((now - last) % frameMs);
      index = (index + 1) % clip.length;
      paint(clip[index]);
    };

    const start = () => {
      paint(clip[0]);
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };

    if (image.complete && image.naturalWidth > 0) {
      start();
    } else {
      image.addEventListener("load", start, { once: true });
    }

    return () => cancelAnimationFrame(raf);
  }, [person, size, box, clip, fps, scale]);

  return (
    <canvas
      ref={canvasRef}
      className={`portrait ${className}`}
      style={{
        width: box.w * scale,
        height: size,
      }}
      role="img"
      aria-label={`${person.name}, ${person.role}`}
    />
  );
}
