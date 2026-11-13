export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    image.src = src;
  });
}

/**
 * Every image referenced by the scene is discovered automatically, so adding
 * an entity or a background to the data files is enough — no manual imports.
 */
export function collectSources(backgrounds, entities) {
  const sources = new Set();

  for (const background of backgrounds) sources.add(background.src);

  for (const entity of entities) {
    if (!entity.sprite) continue;
    if (entity.sprite.src) sources.add(entity.sprite.src);
    if (entity.sprite.clips) {
      for (const clip of Object.values(entity.sprite.clips)) sources.add(clip.src);
    }
  }

  return [...sources];
}

export async function loadImages(sources) {
  const entries = await Promise.all(
    sources.map(async (src) => [src, await loadImage(src)]),
  );
  return new Map(entries);
}
