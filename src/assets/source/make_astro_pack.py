#!/usr/bin/env python3
"""Space Explorer pack: 4 characters (128px), props, rocket. Run: python make_astro_pack.py"""
import json, os, shutil, zipfile
from PIL import Image
import astro_chars as A
import astro_props as P
import astro_props2  # adds more props to P.SMALL / P.BASE
import astro_props3
from astro_engine import Cv

R = "/tmp/outputs"
OUT = f"{R}/pixel_space_explorers_v8"
shutil.rmtree(OUT, ignore_errors=True)
for d in ("characters", "props", "rocket", "preview", "frames"):
    os.makedirs(f"{OUT}/{d}")

BG = (36, 32, 52, 255)


def gif(frames, path, fps, scale=3, size=None):
    ims = []
    for f in frames:
        bg = Image.new("RGBA", f.size, BG); bg.alpha_composite(f)
        ims.append(bg.resize((f.width * scale, f.height * scale), Image.NEAREST).convert("RGB"))
    ims[0].save(path, save_all=True, append_images=ims[1:], duration=int(1000 / fps), loop=0)


def sheet(rows, fw, fh, name, folder):
    """rows: list of (anim_name, [frames], fps). Writes png + TexturePacker-style json."""
    wmax = max(len(r[1]) for r in rows)
    img = Image.new("RGBA", (wmax * fw, len(rows) * fh), (0, 0, 0, 0))
    frames, anims = {}, {}
    for ri, (an, fr, fps) in enumerate(rows):
        names = []
        for i, f in enumerate(fr):
            img.alpha_composite(f, (i * fw, ri * fh))
            n = f"{an}_{i}"
            frames[n] = {"frame": {"x": i * fw, "y": ri * fh, "w": fw, "h": fh}, "sourceSize": {"w": fw, "h": fh},
                         "spriteSourceSize": {"x": 0, "y": 0, "w": fw, "h": fh}, "rotated": False, "trimmed": False}
            names.append(n)
        anims[an] = {"frames": names, "fps": fps, "loop": an not in ("jump", "hurt", "victory")}
    img.save(f"{OUT}/{folder}/{name}.png")
    json.dump({"frames": frames, "animations": anims,
               "meta": {"image": f"{name}.png", "size": {"w": img.width, "h": img.height}, "scale": 1, "format": "RGBA8888"}},
              open(f"{OUT}/{folder}/{name}.json", "w"), indent=1)
    return img


# ------------------------------------------------------------------ characters
char_idle = {}
for ch in A.CHARS:
    n = ch["name"]
    rows = []
    os.makedirs(f"{OUT}/frames/{n}", exist_ok=True)
    for an, cnt, fn, fps in A.ANIMS:
        fr = [A.frame(ch, an, i) for i in range(cnt)]
        rows.append((an, fr, fps))
        for i, f in enumerate(fr):
            f.save(f"{OUT}/frames/{n}/{n}_{an}_{i}.png")
        gif(fr, f"{OUT}/preview/{n}_{an}.gif", fps)
    sheet(rows, 128, 128, f"{n}_spritesheet", "characters")
    char_idle[n] = rows[0][1][0]
    print("char", n)

# ------------------------------------------------------------------ props
small = []
for name, fn in P.SMALL:
    c = Cv(64, 64); fn(c, 0); im = c.render(); im.save(f"{OUT}/props/{name}.png"); small.append((name, [im], 1))
# small items: one sheet, one row, named frames
img = Image.new("RGBA", (64 * len(small), 64), (0, 0, 0, 0)); fr = {}
for i, (n, f, _) in enumerate(small):
    img.alpha_composite(f[0], (i * 64, 0))
    fr[n] = {"frame": {"x": i * 64, "y": 0, "w": 64, "h": 64}, "sourceSize": {"w": 64, "h": 64}, "rotated": False, "trimmed": False}
img.save(f"{OUT}/props/items_64_spritesheet.png")
json.dump({"frames": fr, "meta": {"image": "items_64_spritesheet.png", "size": {"w": img.width, "h": 64}}}, open(f"{OUT}/props/items_64_spritesheet.json", "w"), indent=1)

base_rows = []
for name, fn, nfr in P.BASE:
    fr_ = []
    for t in range(nfr):
        c = Cv(128, 128); fn(c, t); fr_.append(c.render())
    fr_[0].save(f"{OUT}/props/{name}.png")
    if nfr > 1:
        gif(fr_, f"{OUT}/preview/{name}.gif", 8, scale=2)
    base_rows.append((name, fr_, 8 if nfr > 1 else 1))
sheet(base_rows, 128, 128, "props_128_spritesheet", "props")

# ------------------------------------------------------------------ rocket
land = []
for t in range(6):
    c = Cv(192, 384); P.rocket_landed(c, t); land.append(c.render())
launch = []
for t in range(6):
    c = Cv(192, 512); P.rocket_launch(c, t); launch.append(c.render())
land[0].save(f"{OUT}/rocket/rocket_landed.png")
launch[0].save(f"{OUT}/rocket/rocket_launch_frame0.png")
gif(land, f"{OUT}/preview/rocket_landed.gif", 6, scale=1)
gif(launch, f"{OUT}/preview/rocket_launch.gif", 12, scale=1)
sheet([("landed_idle", land, 6)], 192, 384, "rocket_landed_spritesheet", "rocket")
sheet([("launch", launch, 12)], 192, 512, "rocket_launch_spritesheet", "rocket")

# props overview
ov = Image.new("RGBA", (128 * 7, 128 * 4 + 192), BG)
for i, (n, fr_, _) in enumerate(base_rows):
    ov.alpha_composite(fr_[0], ((i % 7) * 128, (i // 7) * 128))
for i, (n, f, _) in enumerate(small):
    ov.alpha_composite(f[0], ((i % 14) * 64, 128 * 4 + (i // 14) * 64))
ov.resize((ov.width * 2, ov.height * 2), Image.NEAREST).save(f"{OUT}/preview/props_overview.png")

# ------------------------------------------------------------------ previews
lineup = Image.new("RGBA", (128 * 4 + 40, 160), BG)
for i, ch in enumerate(A.CHARS):
    lineup.alpha_composite(char_idle[ch["name"]], (20 + i * 128, 16))
lineup.resize((lineup.width * 2, lineup.height * 2), Image.NEAREST).save(f"{OUT}/preview/characters_lineup.png")

scene = Image.new("RGBA", (1100, 520), (30, 26, 46, 255))
import random
rnd = random.Random(4)
for _ in range(90):
    x, y = rnd.randrange(1100), rnd.randrange(300)
    scene.putpixel((x, y), (200, 205, 240, 255) if rnd.random() < 0.6 else (255, 230, 160, 255))
ground = 470
from PIL import ImageDraw
d = ImageDraw.Draw(scene)
d.rectangle((0, ground, 1100, 520), fill=(112, 76, 84, 255)); d.rectangle((0, ground, 1100, ground + 6), fill=(150, 104, 100, 255))
scene.alpha_composite(land[0], (700, ground - 383 + 6))
def put(im, x, gy, s=1):
    scene.alpha_composite(im, (x, gy - im.height + 5))
for name, fn, nfr in P.BASE:
    pass
bp = {n: r[1][0] for n, r in zip([b[0] for b in P.BASE], base_rows)}
put(bp["habitat_dome"], 20, ground); put(bp["solar_panel"], 150, ground); put(bp["generator"], 280, ground); put(bp["rover"], 560, ground)
put(bp["antenna_tower"], 440, ground)
for i, ch in enumerate(A.CHARS):
    put(A.frame(ch, ["idle", "run", "mine", "victory"][i], 2), 360 + i * 70 - (i * 0), ground + 8)
scene = scene.convert("RGB")
scene.save(f"{OUT}/preview/scene_preview.png")

# sizes comparison
cmp_ = Image.new("RGBA", (420, 400), BG)
cmp_.alpha_composite(land[0].resize((192, 384)), (30, 8)) if False else None
cmp = Image.new("RGBA", (300, 392), BG)
cmp.alpha_composite(land[0], (100, 4)); cmp.alpha_composite(char_idle["rex"], (10, 392 - 128 - 5 + 0))
cmp.save(f"{OUT}/preview/size_comparison.png")

# palette
cols = set()
for f in os.listdir(f"{OUT}/frames/rex"):
    pass
allc = {}
for img_ in list(char_idle.values()) + land[:1] + [b[1][0] for b in base_rows]:
    for px in img_.getdata():
        if px[3]:
            allc[px[:3]] = allc.get(px[:3], 0) + 1
top = sorted(allc, key=lambda k: -allc[k])[:64]
with open(f"{OUT}/space_palette.gpl", "w") as f:
    f.write("GIMP Palette\nName: Space Explorers\nColumns: 8\n#\n")
    for i, (r, g, b) in enumerate(top):
        f.write(f"{r:3d} {g:3d} {b:3d}  c{i:02d}\n")

README = """SPACE EXPLORERS - pixel art pack (v8)
=====================================
4 astronaut characters (2 male, 2 female) at 128x128, side view facing right, with 7 animations each,
25 small items (64x64), 28 base props (128x128, 20 of them animated) and a rocket in two versions.
All original designs. Generated by Python code (Pillow) - no image-generation model was used.

CHARACTERS (characters/<name>_spritesheet.png + .json, 128x128 per frame)
  rex, nova, kai, lyra          one row per animation, frames left to right
  idle 8 fps6 | walk 8 fps10 | run 8 fps14 | jump 6 fps8 (crouch, launch, rise, apex, fall, land)
  hurt 4 fps8 | mine 8 fps12 (holds a terrain tool, with beam + sparks) | victory 6 fps8
  Feet touch row 123 of 128. Character is ~84 px tall. Flip horizontally for facing left.
  Single frames: frames/<name>/<name>_<anim>_<i>.png    GIF previews: preview/

PROPS
  props/items_64_spritesheet.png/.json   terrain_tool, oxygen_tank, scanner, lantern, battery, resource_canister,
                                         repair_kit, beacon_flag, ore_crystal, drill_tool, jetpack, flare, wrench,
                                         data_tablet, fuel_cell, binoculars, sample_case, ration_pack, radio, canteen,
                                         solar_cell, circuit_board, scrap_metal, ice_chunk, spare_helmet (64x64, inventory icons or world items)
  props/props_128_spritesheet.png/.json  habitat_dome, solar_panel, generator*, oxygen_station*, workstation*,
                                         storage_crate, rover*, antenna_tower*, landing_pad*, fabricator*, greenhouse,
                                         fuel_tank, sleeping_pod*, telescope, drill_rig*, boulders, alien_plant*,
                                         lamp_post*, supply_pod*, radar_dish*, airlock*, drone*, crystal_cluster*,
                                         mining_cart*, container_stack, comms_console*, signpost, heater*   (* = 6 animated frames)
  Single images: props/<name>.png (frame 0)

ROCKET (192 px wide)
  rocket/rocket_landed.png                192x384, on landing legs, foot pads on the bottom row
  rocket/rocket_landed_spritesheet        6 frames, blinking lights + steam vent (fps 6)
  rocket/rocket_launch_spritesheet        192x512, 6 frames of engine flame, no legs (fps 12)
  The ship body is 376 px tall and the flame canvas adds 128 px below the engines.

SCALE GUIDE
  Astronaut ~84 px = 1.8 m  ->  about 47 px per metre.
  Rocket 376 px  = about 8 m tall, 4 m wide (hull) - a small crew rocket, 4+ astronauts tall.
  If you want a bigger rocket, draw it at a larger zoom in-engine; if you want it smaller for a
  zoomed-out map, scale by integer factors only (x2, x0.5) with Nearest filtering.

IMPORT TIPS
  Unity: Sprite Mode Multiple, Pixels Per Unit 47 (1 unit ~ 1 m), Filter Point, Compression None.
  Godot: AnimatedSprite2D, import with Filter off. Phaser: this_load.atlas(key, png, json) - frames named <anim>_<i>.
  Use Nearest/Point filtering and no mipmaps. Palette: space_palette.gpl (GIMP/Aseprite).

LICENSE
  CC0 by default - change this before publishing if you want other terms.
"""
open(f"{OUT}/README.txt", "w").write(README)
for f in ("astro_engine.py", "astro_chars.py", "astro_props.py", "astro_props2.py", "astro_props3.py", "make_astro_pack.py"):
    shutil.copy(f"{R}/{f}", f"{OUT}/{f}")
with zipfile.ZipFile(f"{R}/pixel_space_explorers_v8.zip", "w", zipfile.ZIP_DEFLATED) as z:
    for dp, _, fs in os.walk(OUT):
        for f in fs:
            p = os.path.join(dp, f); z.write(p, os.path.relpath(p, R))
print("done")
