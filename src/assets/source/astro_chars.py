#!/usr/bin/env python3
"""Space explorer characters, 128x128, side view facing right. Rig + poses + 4 characters."""
import math
from dataclasses import dataclass, field
from PIL import Image
from astro_engine import Cv, ramp, flat, c8, lerp

W = H = 128
GY = 123            # last pixel row the boots may touch
BX0, BY0 = 62, 97   # rest hip position


def ik(hx, hy, fx, fy, l1, l2, bend):
    dx, dy = fx - hx, fy - hy
    d = math.hypot(dx, dy) or 1e-6
    d = max(min(d, l1 + l2 - 0.05), abs(l1 - l2) + 0.05)
    ux, uy = dx / math.hypot(dx, dy or 1e-6) if False else (fx - hx) / (math.hypot(fx - hx, fy - hy) or 1e-6), (fy - hy) / (math.hypot(fx - hx, fy - hy) or 1e-6)
    a = (l1 * l1 - l2 * l2 + d * d) / (2 * d)
    h = math.sqrt(max(l1 * l1 - a * a, 0))
    mx, my = hx + ux * a, hy + uy * a
    return mx - uy * h * bend, my + ux * h * bend, hx + ux * d, hy + uy * d


@dataclass
class Pose:
    dy: float = 0          # body vertical offset (+ = lower)
    lean: float = 0        # body x offset
    hdx: float = 0
    hdy: float = 0
    lb: float = 0          # back foot lift
    lf: float = 0          # front foot lift
    fbx: float = 0         # back foot x offset
    ffx: float = 0         # front foot x offset
    ab: tuple = (0.0, 15.5)   # back arm (angle from down, length)
    af: tuple = (0.0, 15.5)   # front arm
    tool: bool = False
    rec: float = 0         # tool recoil
    eyes: str = "open"
    mouth: str = "smile"
    flash: float = 0       # white flash 0..1
    pulse: int = 0         # backpack light phase
    fxs: list = field(default_factory=list)   # extra free pixels (x,y,col)
    aim: float = 40.0      # tool angle in degrees below horizontal


def gait(p, off, stride, lift):
    f = (p + off) % 1.0
    if f < 0.5:
        return stride * (1 - 4 * f), 0.0
    u = (f - 0.5) / 0.5
    return stride * (-1 + 2 * u), lift * math.sin(math.pi * u)


# ----------------------------------------------------------------------------- characters
HELM = ramp((222, 226, 238))
RING = ramp((58, 64, 84))
BOOT = ramp((66, 70, 90))
GLOVE = ramp((236, 238, 246))


def mk(name, suit, accent, skin, hair, style, glass, sex, pack=(88, 96, 122), beard=False):
    return dict(name=name, suit=ramp(suit), accent=ramp(accent), skin=ramp(skin), hair=ramp(hair),
                style=style, glass=ramp(glass), sex=sex, pack=ramp(pack), beard=beard,
                lamp=c8(accent), suitc=suit)


CHARS = [
    mk("rex", (228, 108, 40), (250, 232, 190), (240, 196, 158), (70, 44, 30), "short", (30, 56, 96), "m"),
    mk("nova", (36, 166, 170), (250, 214, 90), (218, 164, 120), (150, 58, 40), "ponytail", (28, 46, 92), "f", pack=(70, 100, 110)),
    mk("kai", (72, 104, 222), (120, 240, 200), (122, 80, 58), (28, 24, 34), "buzz", (24, 40, 84), "m", pack=(84, 90, 130), beard=True),
    mk("lyra", (214, 72, 150), (255, 226, 120), (186, 126, 90), (62, 34, 84), "puff", (36, 36, 96), "f", pack=(110, 80, 120)),
]


# ----------------------------------------------------------------------------- drawing
def arm(c, ch, sx, sy, hx, hy, glove=True, sep=True):
    ex, ey, hx2, hy2 = ik(sx, sy, hx, hy, 9.5, 9.5, +1)
    c.chain([(sx, sy), (ex, ey), (hx2, hy2)], [5.4, 4.8, 4.3], ch["suit"], sep=sep)
    c.blob(hx2, hy2 + 0.5, 5.2, 5.0, GLOVE, dither=0.04, sep=True)
    return hx2, hy2


def leg(c, ch, hipx, hipy, fx, lift):
    ax, ay = fx, GY - 7 - lift
    kx, ky, ax, ay = ik(hipx, hipy, ax, ay, 10.5, 10.5, -1)
    c.chain([(hipx, hipy), (kx, ky), (ax, ay)], [6.8, 6.3, 5.4], ch["suit"], sep=True)
    c.blob(ax + 0.5, ay + 0.5, 6.6, 2.8, ch["accent"], dither=0.02, sep=True)
    c.blob(ax + 3, GY - lift - 4.5, 9.2, 4.8, BOOT, dither=0.0, sep=True)


def eyes_draw(c, ch, hx, hy, kind):
    ex = (hx + 12, hx + 18)
    y = hy + 3
    ink = (22, 18, 40)
    for k, x in enumerate(ex):
        if kind == "open":
            for dy in range(3):
                c.det(x, y + dy, ink); c.det(x + 1, y + dy, ink)
            c.det(x, y, (255, 255, 255))
        elif kind == "blink":
            c.det(x, y + 2, ink); c.det(x + 1, y + 2, ink)
        elif kind == "happy":
            c.det(x - 0, y + 2, ink); c.det(x + 1, y + 1, ink); c.det(x + 2, y + 2, ink)
        elif kind == "hurt":
            if k == 0:   # > shape
                c.det(x, y, ink); c.det(x + 1, y + 1, ink); c.det(x, y + 2, ink)
            else:        # < shape
                c.det(x + 1, y, ink); c.det(x, y + 1, ink); c.det(x + 1, y + 2, ink)
        elif kind == "focus":
            c.det(x, y + 1, ink); c.det(x + 1, y + 1, ink); c.det(x, y + 2, ink); c.det(x + 1, y + 2, ink)
            c.det(x, y + 1, (255, 255, 255))
    if ch["sex"] == "f" and kind in ("open", "focus", "blink"):
        for x in ex:
            c.det(x - 1, y + (2 if kind == "blink" else 0), ink)
            c.det(x + 2, y - 1, ink)
    # brows
    for x in ex:
        c.det(x, y - 2, ch["hair"][0]); c.det(x + 1, y - 2, ch["hair"][0])


def mouth_draw(c, ch, hx, hy, kind):
    y = hy + 9
    col = (150, 56, 70)
    if ch["sex"] == "f":
        col = (214, 66, 92)
    if ch["beard"]:
        col = (214, 130, 130)
    x = hx + 13
    if kind == "smile":
        c.det(x, y - 1, col); c.det(x + 1, y, col); c.det(x + 2, y, col); c.det(x + 3, y, col); c.det(x + 4, y - 1, col)
    elif kind == "grin":
        for i in range(5):
            c.det(x + i, y - 1, (255, 255, 255)); c.det(x + i, y, (60, 20, 36))
        c.det(x + 1, y + 1, (60, 20, 36)); c.det(x + 2, y + 1, (60, 20, 36)); c.det(x + 3, y + 1, (60, 20, 36))
    elif kind == "o":
        for dx in (1, 2):
            for dy in (-1, 0, 1):
                c.det(x + dx + 1, y + dy, (60, 20, 36))
    elif kind == "flat":
        for i in range(4):
            c.det(x + 1 + i, y, col)
    elif kind == "set":
        for i in range(4):
            c.det(x + 1 + i, y, col)
        c.det(x + 5, y - 1, col)


def head(c, ch, hx, hy, pose, light):
    st = ch["style"]
    # hair behind the helmet
    if st == "ponytail":
        c.chain([(hx - 14, hy - 6), (hx - 25, hy - 2), (hx - 27, hy + 11)], [4.5, 5.5, 3.6], ch["hair"], sep=True)
        c.blob(hx - 15, hy - 5, 3.3, 3.3, ch["accent"], sep=True)
    elif st == "puff":
        c.blob(hx - 21, hy - 3, 11, 13, ch["hair"], dither=0.12, sep=True)
        c.blob(hx - 13, hy - 14, 7, 7, ch["hair"], dither=0.12, sep=True)
        c.blob(hx - 16, hy - 8, 3.6, 3.6, ch["accent"], sep=True)
    c.blob(hx, hy, 21, 19, HELM, dither=0.05, sep=True)                       # shell
    c.blob(hx - 9, hy + 4, 5.2, 5.2, ch["accent"], dither=0.03, sep=True)    # comm ear
    c.det(hx - 9, hy + 4, (255, 255, 255))
    c.capsule(hx - 8, hy - 17, hx - 12, hy - 26, 1.4, 1.2, RING, sep=True)   # antenna
    c.blob(hx - 12, hy - 27, 2.4, 2.4, flat(light), dither=0.0, sep=True)
    c.blob(hx + 8, hy + 1, 15.5, 13, RING, dither=0.03, sep=True)             # visor frame
    c.blob(hx + 8.5, hy + 1, 13.7, 11.6, ch["glass"], dither=0.02, sep=True)  # glass
    c.blob(hx + 9, hy + 2.5, 10.5, 8.6, ch["skin"], dither=0.03, sep=True)    # face
    if ch["beard"]:
        c.blob(hx + 13.5, hy + 9, 8, 4.6, ch["hair"], dither=0.1, ymin=hy + 6, sep=True)
    if st in ("short", "ponytail", "buzz", "puff"):
        top = {"short": 7.6, "ponytail": 7.6, "buzz": 5.4, "puff": 7.6}[st]
        c.blob(hx + 9, hy - 2, 11.2, top, ch["hair"], dither=0.12, ymax=hy + 1, sep=True)
        if st in ("short", "ponytail", "puff"):
            for k in range(3):
                c.det(hx + 14 + k * 2, hy + 1, ch["hair"][1])
    # glare
    for i, (dx, dy) in enumerate(((0, 0), (1, -1), (2, -2), (3, -3))):
        c.fx(hx + 1 + dx, hy - 5 + dy + 2, (186, 214, 250))
    c.fx(hx + 5, hy - 9, (186, 214, 250)); c.fx(hx + 6, hy - 9, (236, 246, 255))
    c.det(hx + 19, hy + 6, ch["skin"][1])
    eyes_draw(c, ch, hx, hy, pose.eyes)
    mouth_draw(c, ch, hx, hy, pose.mouth)


def tool_draw(c, ch, hb, hf, pose, t):
    """Handheld terrain tool between back hand hb and front hand hf."""
    dx, dy = hf[0] - hb[0], hf[1] - hb[1]
    L = math.hypot(dx, dy) or 1
    ux, uy = dx / L, dy / L
    rx, ry = hb[0] - ux * 7, hb[1] - uy * 7
    mx, my = hb[0] + ux * 16, hb[1] + uy * 16
    tx, ty = hb[0] + ux * 30, hb[1] + uy * 30
    TB = ramp((70, 82, 120)); TA = ch["accent"]; TD = ramp((50, 54, 72))
    c.capsule(rx, ry, mx, my, 3.8, 5.0, TB, sep=True)
    c.capsule(mx, my, tx, ty, 5.0, 3.0, TD, sep=True)
    c.blob(hb[0] + ux * 6, hb[1] + uy * 6 - 5, 2.4, 2.4, TA, sep=True)   # grip light
    c.blob(tx + ux * 3, ty + uy * 3, 3.6, 3.6, ramp(ch["suitc"]), sep=True)
    glow = (255, 255, 255) if t % 2 == 0 else (190, 250, 255)
    c.blob(tx + ux * 7, ty + uy * 7, 3.2, 3.2, flat((120, 235, 255)), dither=0, sep=True)
    c.det(tx + ux * 7, ty + uy * 7, glow)
    return tx + ux * 7, ty + uy * 7, ux, uy


def draw(ch, pose, t=0):
    c = Cv(W, H)
    bx, by = BX0 + pose.lean, BY0 + pose.dy
    hx, hy = bx + 3 + pose.hdx, by - 39 + pose.hdy
    sy = by - 21
    # backpack
    px = bx - 15
    c.capsule(px, by - 25, px, by - 5, 8.2, 8.2, ch["pack"], dither=0.05, sep=True)
    c.rect(px - 5, by - 22, px + 3, by - 11, ch["accent"], bevel=1, sep=True)
    for k in range(3):
        on = (pose.pulse + k) % 3 == 0
        c.fx(px - 3, by - 20 + k * 3, c8(lerp(ch["lamp"], (255, 255, 255), 0.7)) if on else c8(lerp(ch["lamp"], (30, 30, 50), 0.55)))
        c.fx(px - 2, by - 20 + k * 3, c8(lerp(ch["lamp"], (255, 255, 255), 0.7)) if on else c8(lerp(ch["lamp"], (30, 30, 50), 0.55)))
    # arms: derive hands
    def hand(shx, shy, ang, ln):
        return shx + ln * math.sin(ang), shy + ln * math.cos(ang)
    sbx, sfx = bx - 2, bx + 5
    if pose.tool:
        a = math.radians(pose.aim)
        hb = (sbx + 14 + pose.rec, sy + 8 + 0.4 * pose.rec)
        hf = (hb[0] + 8.5 * math.cos(a), hb[1] + 8.5 * math.sin(a))
        hbk, hfr = hb, hf
    else:
        hbk = hand(sbx, sy, pose.ab[0], pose.ab[1])
        hfr = hand(sfx, sy, pose.af[0], pose.af[1])
    if not pose.tool:
        arm(c, ch, sbx, sy, *hbk)
    # legs
    hipb, hipf = bx - 4, bx + 5
    leg(c, ch, hipb, by + 1, 55 + pose.fbx + pose.lean * 0.0, pose.lb)
    leg(c, ch, hipf, by + 1, 68 + pose.ffx + pose.lean * 0.0, pose.lf)
    # torso
    c.blob(bx + 1, by - 12, 15.5, 15.5, ch["suit"], dither=0.06, sep=True)
    c.capsule(bx - 11, by - 1.5, bx + 13, by - 1.5, 3.2, 3.2, ch["accent"], sep=True)
    c.rect(bx + 4, by - 19, bx + 14, by - 9, RING, bevel=1, sep=True, round_=1)
    for k in range(3):
        col = c8(lerp(ch["lamp"], (255, 255, 255), 0.3)) if k == (pose.pulse % 3) else c8(lerp(ch["lamp"], (30, 30, 50), 0.3))
        c.fx(bx + 6 + k * 3, by - 17, col); c.fx(bx + 6 + k * 3, by - 16, col)
    for k in range(4):
        c.fx(bx + 6 + k * 2, by - 12, (120, 130, 160))
    # head
    head(c, ch, hx, hy, pose, ch["lamp"])
    # tool & arms in front
    if pose.tool:
        arm(c, ch, sbx, sy, *hbk)
        tip = tool_draw(c, ch, hbk, hfr, pose, t)
        arm(c, ch, sfx, sy, *hfr)
    else:
        arm(c, ch, sfx, sy, *hfr)
        tip = None
    c.blob(sfx + 0.5, sy - 2.5, 4.6, 3.8, ch["accent"], dither=0.04, sep=True)   # shoulder pad
    for x, y, col in pose.fxs:
        c.fx(x, y, col)
    img = c.render()
    if pose.flash:
        px_ = img.load()
        for y in range(img.height):
            for x in range(img.width):
                r, g, b, a = px_[x, y]
                if a:
                    px_[x, y] = (int(r + (255 - r) * pose.flash), int(g + (255 - g) * pose.flash), int(b + (255 - b) * pose.flash), a)
    return img, tip


# ----------------------------------------------------------------------------- animations
def a_idle(i):
    br = [0, 0, 1, 1, 1, 1, 0, 0][i]
    hd = [0, 0, 0, 1, 1, 1, 1, 0][i]
    sw = [0.0, 0.02, 0.05, 0.07, 0.07, 0.05, 0.02, 0.0][i]
    return Pose(dy=br, hdy=hd - br * 0.0, ab=(-0.12 - sw, 15.5), af=(0.12 + sw, 15.5),
                eyes="blink" if i == 5 else "open", mouth="smile", pulse=i // 2)


def a_walk(i):
    p = i / 8
    sb, lb = gait(p, 0.5, 8, 5)
    sf, lf = gait(p, 0.0, 8, 5)
    bob = -2.2 * math.sin(2 * math.pi * p) ** 2
    th = 0.42 * math.sin(2 * math.pi * p)
    return Pose(dy=bob, fbx=sb, ffx=sf, lb=lb, lf=lf, ab=(th, 15.5), af=(-th, 15.5), lean=1, mouth="smile", pulse=i // 2)


def a_run(i):
    p = i / 8
    sb, lb = gait(p, 0.5, 13, 10)
    sf, lf = gait(p, 0.0, 13, 10)
    bob = -3.5 * math.sin(2 * math.pi * p) ** 2
    th = 1.0 * math.sin(2 * math.pi * p)
    return Pose(dy=bob + 1, lean=4, hdx=1, fbx=sb, ffx=sf, lb=lb, lf=lf,
                ab=(0.5 + th, 11.5), af=(0.5 - th, 11.5), eyes="focus", mouth="set", pulse=i // 2)


def a_jump(i):
    P = [
        Pose(dy=8, lean=-1, hdy=1, ab=(-0.9, 14), af=(-0.5, 14), eyes="focus", mouth="set"),                     # crouch
        Pose(dy=-5, lean=1, lb=3, lf=3, ab=(2.5, 16), af=(2.2, 16), eyes="focus", mouth="o", fbx=-2, ffx=2),        # launch
        Pose(dy=-17, lb=11, lf=8, ab=(2.1, 15), af=(1.8, 15), mouth="grin", eyes="open", fbx=-4, ffx=4),           # rise
        Pose(dy=-19, lb=13, lf=11, ab=(1.5, 16), af=(-1.3, 16), mouth="smile", eyes="open", fbx=-3, ffx=6),        # apex
        Pose(dy=-11, lb=7, lf=5, ab=(2.6, 16), af=(2.4, 16), mouth="o", eyes="open", ffx=2, fbx=-3),               # fall
        Pose(dy=9, hdy=2, lean=1, ab=(0.6, 14), af=(0.9, 14), eyes="blink", mouth="flat"),                          # land
    ]
    return P[i]


def a_hurt(i):
    P = [
        Pose(lean=-6, hdx=-3, hdy=0, dy=-1, ab=(-1.1, 15), af=(1.3, 15), eyes="hurt", mouth="o", flash=0.45, ffx=2, fbx=-4),
        Pose(lean=-9, hdx=-4, dy=-4, lb=2, lf=3, ab=(-1.5, 15), af=(1.6, 15), eyes="hurt", mouth="o", flash=0.2, ffx=3, fbx=-6),
        Pose(lean=-6, hdx=-2, dy=1, ab=(-0.8, 15), af=(0.9, 15), eyes="hurt", mouth="flat", ffx=2, fbx=-4),
        Pose(lean=-2, hdx=-1, dy=2, ab=(-0.3, 15), af=(0.4, 15), eyes="open", mouth="flat"),
    ]
    return P[i]


def a_mine(i):
    rec = [0, -2, -3, -1, 0, -2, -3, -1][i]
    return Pose(tool=True, lean=3, dy=2 + (1 if i % 4 == 2 else 0), rec=rec, fbx=-3, ffx=4, hdx=1,
                eyes="focus", mouth="set", pulse=i, aim=38 + (2 if i % 2 else 0))


def a_victory(i):
    h = [0, 3, 8, 10, 4, 0][i]
    return Pose(dy=-h, lb=h * 0.8, lf=h * 0.8, ab=(-2.35 + 0.3 * (i % 2), 17), af=(1.75 + 0.45 * (i % 2), 17),
                eyes="happy", mouth="grin", fbx=-2, ffx=3, pulse=i)


ANIMS = [("idle", 8, a_idle, 6), ("walk", 8, a_walk, 10), ("run", 8, a_run, 14), ("jump", 6, a_jump, 8),
         ("hurt", 4, a_hurt, 8), ("mine", 8, a_mine, 12), ("victory", 6, a_victory, 8)]


def mine_fx(img, tip, i):
    """beam + sparks drawn over the finished frame."""
    if not tip:
        return img
    tx, ty, ux, uy = tip
    px = img.load()
    for k in range(1, 9):
        x, y = int(tx + ux * k * 2.6), int(ty + uy * k * 2.6)
        if 0 <= x < W and 0 <= y < H and (k + i) % 2 == 0:
            col = (255, 255, 255) if k < 3 else (130, 235, 255) if k < 6 else (70, 150, 230)
            px[x, y] = col + (255,)
            if x + 1 < W:
                px[x + 1, y] = col + (255,)
    gx, gy = int(tx + ux * 22), min(GY - 1, int(ty + uy * 22))
    for k, (dx, dy) in enumerate(((0, 0), (3, -2), (-3, -1), (5, -5), (-2, -4), (7, -2))):
        if (k + i) % 3 != 0 and 0 <= gx + dx < W and 0 <= gy + dy < H:
            px[gx + dx, gy + dy] = ((255, 230, 150) if k % 2 else (255, 255, 255)) + (255,)
    return img


def sparkle(img, i):
    px = img.load()
    pts = [(30, 36), (100, 40), (22, 70), (108, 74), (64, 22)]
    for k, (x, y) in enumerate(pts):
        if (k + i) % 2 == 0:
            for dx, dy in ((0, 0), (1, 0), (-1, 0), (0, 1), (0, -1)):
                if 0 <= x + dx < W and 0 <= y + dy < H:
                    px[x + dx, y + dy] = (255, 240, 170, 255) if (dx or dy) else (255, 255, 255, 255)
    return img


def frame(ch, anim, i):
    name, n, fn, fps = next(a for a in ANIMS if a[0] == anim)
    pose = fn(i)
    img, tip = draw(ch, pose, i)
    if anim == "mine":
        img = mine_fx(img, tip, i)
    if anim == "victory":
        img = sparkle(img, i)
    return img


if __name__ == "__main__":
    import sys
    out = Image.new("RGBA", (128 * 8, 128 * 4), (40, 36, 56, 255))
    for r, ch in enumerate(CHARS):
        for k, a in enumerate(["idle", "walk", "run", "mine", "jump", "hurt", "victory"][:7]):
            pass
        for k, (a, ii) in enumerate([("idle", 0), ("walk", 2), ("run", 2), ("jump", 3), ("hurt", 0), ("mine", 2), ("victory", 3), ("jump", 0)]):
            out.alpha_composite(frame(ch, a, ii), (k * 128, r * 128))
    out.save("/tmp/outputs/_astro_test.png")
