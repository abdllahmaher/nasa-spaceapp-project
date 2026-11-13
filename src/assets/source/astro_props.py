#!/usr/bin/env python3
"""Space props (64px small items, 128px base props) + rocket (192x384 / 192x512)."""
import math
from astro_engine import Cv, ramp, flat, c8, lerp

STEEL = ramp((168, 176, 196)); WHITE = ramp((226, 230, 242)); DARK = ramp((58, 64, 86))
MID = ramp((100, 108, 134)); ORG = ramp((228, 108, 40)); YEL = ramp((250, 214, 90))
TEAL = ramp((40, 176, 176)); BLUE = ramp((72, 104, 222)); RED = ramp((214, 62, 62))
GLASS = ramp((70, 130, 190)); GRN = ramp((80, 200, 120)); PINK = ramp((214, 72, 150))
SOIL = ramp((150, 104, 80)); CYAN = (130, 238, 255)


def glow(t, n, a=(255, 255, 255), b=(90, 120, 150)):
    return a if (t % n) < n // 2 else b


# ============================================================ small items (64x64)
def terrain_tool(c, t):
    c.capsule(10, 50, 34, 34, 4.0, 5.2, BLUE, sep=True)
    c.capsule(34, 34, 50, 24, 5.2, 3.2, DARK, sep=True)
    c.blob(40, 38, 2.6, 2.6, YEL, sep=True)
    c.blob(53, 22, 3.6, 3.6, ramp((72, 104, 222)), sep=True)
    c.blob(57, 20, 3.2, 3.2, flat(CYAN), dither=0, sep=True); c.det(57, 20, (255, 255, 255))
    c.capsule(18, 46, 16, 56, 3.4, 3.4, MID, sep=True)


def oxygen_tank(c, t):
    c.revolve(32, 14, 56, lambda y: 11 if 22 <= y <= 50 else 11 * math.sqrt(max(0, 1 - ((22 - y) / 9) ** 2)) if y < 22 else 11 * math.sqrt(max(0, 1 - ((y - 50) / 7) ** 2)), TEAL, sep=True)
    c.rect(21, 34, 43, 38, WHITE, bevel=1, sep=True)
    c.rect(29, 8, 35, 15, STEEL, bevel=1, sep=True)
    c.capsule(35, 10, 45, 10, 2.2, 2.2, DARK, sep=True)
    c.blob(32, 28, 4, 4, DARK, sep=True); c.det(32, 28, (130, 238, 255)); c.det(33, 27, (255, 255, 255))


def scanner(c, t):
    c.rect(16, 12, 47, 52, DARK, bevel=2, sep=True, round_=3)
    c.rect(20, 16, 43, 34, ramp((22, 60, 70)), bevel=1, sep=True)
    for i in range(5):
        c.fx(23 + i * 4, 30 - (i * 7 % 9), (120, 240, 200)); c.fx(24 + i * 4, 30 - (i * 7 % 9), (120, 240, 200))
    c.fx(30, 22, (255, 255, 255)); c.fx(31, 22, (120, 240, 200))
    for i in range(3):
        c.blob(24 + i * 8, 42, 2.6, 2.6, [RED, YEL, GRN][i], sep=True)
    c.capsule(32, 12, 32, 4, 1.3, 1.1, STEEL, sep=True); c.blob(32, 3, 2, 2, flat((255, 90, 90)), dither=0)


def lantern(c, t):
    c.revolve(32, 8, 12, lambda y: 7, STEEL, sep=True)
    c.rect(24, 12, 40, 14, DARK, bevel=1, sep=True)
    c.blob(32, 30, 12, 15, flat((255, 232, 150)), dither=0.0, sep=True)
    c.blob(32, 30, 8, 11, flat((255, 248, 210)), dither=0.0)
    c.rect(24, 44, 40, 50, DARK, bevel=1, sep=True)
    for x in (22, 42):
        c.capsule(x, 14, x, 46, 1.4, 1.4, STEEL, sep=True)
    c.capsule(32, 8, 32, 3, 1.6, 1.6, STEEL, sep=True)


def battery(c, t):
    c.revolve(32, 12, 54, lambda y: 12, ramp((90, 100, 130)), sep=True)
    c.revolve(32, 8, 11, lambda y: 6, STEEL, sep=True)
    c.rect(20, 22, 44, 44, YEL, bevel=1, sep=True)
    for p in [(34, 25), (30, 33), (36, 33), (28, 41)]:
        c.det(*p, (60, 40, 20))
    for y in range(26, 40):
        c.det(31 + (y - 26) // 4 * -1 + 3, y, (60, 40, 20)) if False else None
    c.rect(20, 48, 44, 52, DARK, bevel=1, sep=True)


def canister(c, t):
    c.revolve(32, 10, 54, lambda y: 13, GLASS, dither=0.02, sep=True)
    c.blob(32, 36, 8, 10, flat((120, 255, 200)), dither=0, sep=True)
    c.blob(32, 34, 4, 6, flat((220, 255, 240)), dither=0)
    c.rect(18, 6, 46, 11, DARK, bevel=1, sep=True)
    c.rect(18, 54, 46, 58, DARK, bevel=1, sep=True)
    c.fx(24, 22, (230, 245, 255)); c.fx(24, 23, (230, 245, 255)); c.fx(25, 21, (230, 245, 255))


def repair_kit(c, t):
    c.rect(10, 20, 53, 52, ORG, bevel=2, sep=True, round_=3)
    c.rect(24, 14, 39, 20, DARK, bevel=1, sep=True)
    c.rect(26, 28, 37, 44, WHITE, bevel=1, sep=True)
    c.rect(21, 33, 42, 39, WHITE, bevel=1, sep=True)
    c.rect(29, 31, 34, 41, RED, bevel=0, sep=True); c.rect(24, 34, 39, 38, RED, bevel=0, sep=True)
    c.rect(10, 44, 53, 46, DARK, bevel=1, sep=True)


def beacon(c, t):
    c.capsule(24, 58, 24, 8, 2.2, 1.8, STEEL, sep=True)
    c.poly([(26, 10), (54, 16), (26, 28)], RED, idx=2, sep=True)
    c.poly([(26, 10), (54, 16), (40, 14)], RED, idx=3)
    c.blob(24, 6, 3.2, 3.2, flat((255, 230, 120)), dither=0, sep=True)
    c.blob(24, 58, 9, 3.5, SOIL, sep=True)


def ore_crystal(c, t):
    for (x, y, w, h, rp) in [(22, 56, 8, 30, TEAL), (34, 56, 9, 42, ramp((60, 200, 190))), (45, 56, 7, 26, TEAL), (14, 56, 6, 18, ramp((50, 160, 170)))]:
        c.poly([(x - w, y), (x - w * 0.7, y - h * 0.8), (x, y - h), (x + w * 0.7, y - h * 0.8), (x + w, y)], rp, idx=2, sep=True,
               fn=lambda px, py, x=x, w=w: 3 if px < x - w * 0.2 else 2 if px < x + w * 0.4 else 1)
    c.blob(32, 58, 22, 3.5, ramp((90, 84, 110)), sep=True)
    c.fx(30, 24, (255, 255, 255)); c.fx(29, 24, (200, 255, 250)); c.fx(31, 24, (200, 255, 250)); c.fx(30, 23, (200, 255, 250)); c.fx(30, 25, (200, 255, 250))


SMALL = [("terrain_tool", terrain_tool), ("oxygen_tank", oxygen_tank), ("scanner", scanner), ("lantern", lantern),
         ("battery", battery), ("resource_canister", canister), ("repair_kit", repair_kit), ("beacon_flag", beacon),
         ("ore_crystal", ore_crystal)]


# ============================================================ base props (128x128), 6 anim frames for some
G = 123


def shadow(c, cx, w):
    c.blob(cx, G - 1, w, 3, ramp((50, 46, 70)), dither=0.0)


def habitat_dome(c, t):
    shadow(c, 64, 52)
    c.revolve(64, 38, 100, lambda y: 46 * math.sqrt(max(0, 1 - ((100 - y) / 62) ** 2)) if y < 100 else 46, WHITE, dither=0.05, sep=True)
    c.rect(18, 100, 110, 118, STEEL, bevel=2, sep=True)
    c.rect(54, 80, 74, 118, DARK, bevel=2, sep=True, round_=2)
    c.rect(58, 84, 70, 112, ramp((40, 90, 120)), bevel=1, sep=True)
    c.blob(82, 66, 11, 9, GLASS, dither=0.03, sep=True); c.blob(46, 66, 9, 8, GLASS, dither=0.03, sep=True)
    c.capsule(64, 40, 64, 24, 1.6, 1.4, STEEL, sep=True)
    c.blob(64, 22, 3, 3, flat((255, 90, 90) if t % 6 < 3 else (120, 40, 50)), dither=0)
    c.rect(26, 106, 34, 112, ORG, bevel=1, sep=True); c.rect(94, 106, 102, 112, ORG, bevel=1, sep=True)
    for x in (22, 106):
        c.capsule(x, 118, x, 122, 3, 3, DARK, sep=True)


def solar_panel(c, t):
    shadow(c, 64, 46)
    c.capsule(64, 122, 64, 74, 3.4, 3.0, STEEL, sep=True)
    c.rect(44, 116, 84, 122, DARK, bevel=1, sep=True)
    c.poly([(14, 70), (96, 38), (116, 54), (34, 90)], ramp((34, 70, 150)), idx=2, sep=True)
    c.poly([(14, 70), (96, 38), (100, 41), (18, 73)], WHITE, idx=3, sep=True)
    for i in range(1, 5):
        a = i / 5
        x1, y1 = 14 + (96 - 14) * a, 70 + (38 - 70) * a
        x2, y2 = 34 + (116 - 34) * a, 90 + (54 - 90) * a
        for k in range(24):
            tt = k / 23
            c.fx(x1 + (x2 - x1) * tt, y1 + (y2 - y1) * tt + 1, (110, 150, 240))
    for k in range(1, 4):
        for s in range(30):
            tt = s / 29
            x1, y1 = 14 + 20 * tt * 0 + (34 - 14) * k / 4, 70 + (90 - 70) * k / 4
            c.fx(x1 + (96 - 14) * tt + 0, y1 + (38 - 70) * tt + 1, (110, 150, 240))
    sh = (t % 6) / 6
    cx_ = 20 + sh * 90
    for dx in range(0, 6):
        c.fx(cx_ + dx, 70 - (cx_ - 14 + dx) * 0.39 + 4 + (dx % 2), (255, 255, 255))


def generator(c, t):
    shadow(c, 64, 50)
    c.rect(18, 56, 110, 118, ORG, bevel=2, sep=True, round_=3)
    c.rect(18, 104, 110, 118, DARK, bevel=1, sep=True)
    c.rect(26, 64, 62, 98, DARK, bevel=1, sep=True, round_=2)
    ang = t * 0.9
    for k in range(4):
        a = ang + k * math.pi / 2
        c.capsule(44, 81, 44 + 14 * math.cos(a), 81 + 14 * math.sin(a), 2.6, 1.8, STEEL, sep=True)
    c.blob(44, 81, 3.5, 3.5, YEL, sep=True)
    c.rect(70, 64, 102, 96, DARK, bevel=1, sep=True, round_=2)
    for k in range(3):
        on = (t + k) % 3
        c.blob(78 + k * 10, 74, 3.2, 3.2, [GRN, YEL, RED][k] if on == 0 else ramp((50, 56, 70)), sep=True)
    c.rect(72, 84, 100, 92, ramp((22, 60, 70)), bevel=1)
    for i in range(6):
        c.fx(74 + i * 4, 90 - ((i + t) * 5 % 7), (120, 240, 200))
    c.capsule(94, 56, 94, 30, 4.5, 4.0, STEEL, sep=True)
    c.blob(94, 28, 5.5, 3.5, DARK, sep=True)
    for k in range(3):
        c.blob(94 + math.sin(t + k) * 3 + k, 22 - ((t * 3 + k * 6) % 16), 3 + k * 0.6, 2.4 + k * 0.4, ramp((200, 204, 220)), sep=False)
    c.rect(20, 58, 108, 60, YEL, bevel=0)


def oxygen_station(c, t):
    shadow(c, 64, 48)
    c.rect(20, 110, 108, 120, DARK, bevel=1, sep=True)
    for cx in (42, 86):
        c.revolve(cx, 24, 112, lambda y: 18 if 36 <= y <= 100 else 18 * math.sqrt(max(0, 1 - ((36 - y) / 12) ** 2)) if y < 36 else 18 * math.sqrt(max(0, 1 - ((y - 100) / 12) ** 2)), TEAL, sep=True)
        c.rect(cx - 18, 60, cx + 18, 66, WHITE, bevel=1, sep=True)
        c.rect(cx - 18, 84, cx + 18, 88, WHITE, bevel=1, sep=True)
    c.rect(52, 40, 76, 60, DARK, bevel=1, sep=True, round_=2)
    c.blob(64, 50, 7, 7, ramp((22, 60, 70)), sep=True)
    c.det(64, 50, (120, 240, 200)); c.det(65, 50, (120, 240, 200)); c.det(64, 49, (120, 240, 200))
    c.capsule(42, 24, 42, 14, 4, 4, STEEL, sep=True); c.capsule(86, 24, 86, 14, 4, 4, STEEL, sep=True)
    c.capsule(42, 14, 86, 14, 2.6, 2.6, STEEL, sep=True)
    for k in range(4):
        y = 12 - ((t * 3 + k * 5) % 14)
        c.fx(50 + k * 9 + (t % 2), y + 2, (190, 240, 255)); c.fx(51 + k * 9 + (t % 2), y + 2, (230, 250, 255))
    c.capsule(64, 66, 64, 110, 3, 3, MID, sep=True)


def workstation(c, t):
    shadow(c, 64, 52)
    c.rect(12, 74, 116, 82, WHITE, bevel=2, sep=True)
    c.rect(16, 82, 24, 120, MID, bevel=1, sep=True); c.rect(104, 82, 112, 120, MID, bevel=1, sep=True)
    c.rect(30, 84, 98, 112, DARK, bevel=1, sep=True)
    for k in range(3):
        c.rect(34, 88 + k * 8, 94, 92 + k * 8, ramp((70, 78, 104)), bevel=1)
        c.blob(88, 90 + k * 8, 1.8, 1.8, [GRN, YEL, RED][(k + t) % 3], dither=0, sep=False)
    c.rect(30, 22, 98, 66, DARK, bevel=2, sep=True, round_=3)
    c.rect(35, 27, 93, 61, ramp((18, 50, 64)), bevel=1, sep=True)
    for i in range(14):
        h = 4 + ((i * 7 + t * 3) % 17)
        for y in range(h):
            c.fx(38 + i * 4, 59 - y, (80 + y * 8, 230, 190)); c.fx(39 + i * 4, 59 - y, (80 + y * 8, 230, 190))
    c.capsule(64, 66, 64, 74, 3, 3, STEEL, sep=True)
    c.rect(86, 64, 104, 73, ORG, bevel=1, sep=True)
    c.rect(18, 70, 38, 74, STEEL, bevel=1, sep=True)


def storage_crate(c, t):
    shadow(c, 64, 52)
    c.rect(12, 40, 116, 119, ramp((120, 130, 156)), bevel=3, sep=True, round_=3)
    for y0 in (46, 98):
        c.rect(14, y0, 114, y0 + 14, STEEL, bevel=1, sep=True)
    for x0 in (14, 100):
        c.rect(x0, 40, x0 + 14, 119, STEEL, bevel=1, sep=True)
    for k in range(10):
        x = 20 + k * 8
        c.poly([(x, 66), (x + 5, 66), (x + 9, 90), (x + 4, 90)], YEL if k % 2 == 0 else DARK, idx=2)
    c.rect(52, 70, 76, 92, ramp((86, 96, 124)), bevel=2, sep=True, round_=2)
    c.rect(56, 74, 72, 88, DARK, bevel=1, sep=True)
    c.det(64, 81, (255, 220, 120)); c.det(64, 82, (255, 220, 120))
    for p in [(18, 44), (110, 44), (18, 114), (110, 114)]:
        c.fx(*p, (40, 44, 60)); c.fx(p[0] + 1, p[1], (40, 44, 60))


def wheel(c, cx, cy, r, t=0):
    c.blob(cx, cy, r, r, ramp((40, 42, 56)), sep=True)
    c.blob(cx, cy, r * 0.6, r * 0.6, STEEL, sep=True)
    a = t * 0.8
    for k in range(3):
        aa = a + k * 2 * math.pi / 3
        c.fx(cx + math.cos(aa) * r * 0.45, cy + math.sin(aa) * r * 0.45, (60, 66, 90))
    c.blob(cx, cy, 2.4, 2.4, DARK, sep=True)


def rover(c, t):
    shadow(c, 64, 56)
    c.rect(14, 64, 114, 96, ORG, bevel=2, sep=True, round_=4)
    c.rect(14, 88, 114, 96, DARK, bevel=1, sep=True)
    c.poly([(22, 64), (30, 36), (80, 36), (92, 64)], ramp((222, 226, 238)), idx=2, sep=True)
    c.poly([(36, 62), (42, 42), (62, 42), (62, 62)], GLASS, idx=2, sep=True)
    c.poly([(66, 62), (66, 42), (78, 42), (86, 62)], GLASS, idx=2, sep=True)
    c.rect(94, 70, 108, 80, YEL, bevel=1, sep=True)
    c.capsule(24, 36, 14, 14, 1.4, 1.2, STEEL, sep=True)
    c.blob(13, 12, 3, 3, flat((255, 90, 90) if t % 6 < 3 else (120, 40, 50)), dither=0)
    c.rect(98, 56, 120, 60, STEEL, bevel=1, sep=True)
    for x in (34, 96):
        wheel(c, x, 108, 15, t)


def antenna_tower(c, t):
    shadow(c, 64, 36)
    c.rect(42, 114, 86, 122, DARK, bevel=1, sep=True)
    for s in (-1, 1):
        c.capsule(64 + s * 14, 114, 64 + s * 5, 34, 2.2, 1.8, STEEL, sep=True)
    for y in range(40, 114, 14):
        w1 = 5 + (y - 34) * 9 / 80
        c.capsule(64 - w1, y, 64 + w1, y + 14, 1.3, 1.3, MID, sep=True)
        c.capsule(64 + w1, y, 64 - w1, y + 14, 1.3, 1.3, MID, sep=True)
    c.rect(52, 66, 76, 80, WHITE, bevel=1, sep=True)
    c.blob(64, 26, 20, 12, ramp((210, 214, 228)), sep=True, ymax=30)
    c.blob(64, 24, 12, 7, ramp((140, 150, 176)), sep=False, ymax=28)
    c.capsule(64, 28, 64, 14, 1.6, 1.4, STEEL, sep=True)
    c.blob(64, 11, 3.4, 3.4, flat((255, 90, 90) if t % 6 < 3 else (110, 40, 50)), dither=0)
    for k in range(3):
        if (t + k) % 6 < 3:
            r = 8 + k * 6
            for a in range(-50, 51, 6):
                c.fx(64 + math.sin(math.radians(a)) * r + 22, 12 - math.cos(math.radians(a)) * r * 0.2 + 2 - k, (150, 235, 255))


def landing_pad(c, t):
    c.blob(64, 112, 62, 11, ramp((84, 90, 118)), dither=0.04, sep=True)
    c.blob(64, 108, 56, 8, ramp((120, 128, 156)), dither=0.04, sep=True)
    c.blob(64, 108, 36, 5, ramp((84, 90, 118)), dither=0.03, sep=True)
    c.blob(64, 108, 14, 2.6, ORG, dither=0.0, sep=True)
    for k in range(10):
        a = k / 10 * math.tau
        x, y = 64 + math.cos(a) * 50, 108 + math.sin(a) * 6.5
        on = (k + t) % 4 == 0
        c.blob(x, y - 1, 2.4, 1.8, flat((255, 236, 140) if on else (110, 100, 70)), dither=0, sep=True)


BASE = [("habitat_dome", habitat_dome, 1), ("solar_panel", solar_panel, 6), ("generator", generator, 6),
        ("oxygen_station", oxygen_station, 6), ("workstation", workstation, 6), ("storage_crate", storage_crate, 1),
        ("rover", rover, 6), ("antenna_tower", antenna_tower, 6), ("landing_pad", landing_pad, 6)]


# ============================================================ rocket
RW, RH, RHL = 192, 384, 512
CX = 96


def rocket_body(c, t, ground_y, legs=True, flame=0):
    """Draw the rocket so that foot pads touch ground_y. Nose tip is at y = ground_y-376."""
    o = ground_y - 383   # vertical offset from the 384px layout
    Y = lambda y: y + o
    SKIN = ramp((236, 238, 248)); RED_ = ramp((214, 62, 62)); ACC = ORG
    # landing legs (behind)
    if legs:
        for s in (-1, 1):
            c.capsule(CX + s * 30, Y(290), CX + s * 62, Y(372), 4.0, 3.4, MID, sep=True)
            c.capsule(CX + s * 44, Y(318), CX + s * 52, Y(346), 2.2, 2.2, STEEL, sep=True)
            c.blob(CX + s * 64, Y(378), 13, 4.6, DARK, sep=True)
    # boosters
    for s in (-1, 1):
        bx = CX + s * 44
        c.revolve(bx, Y(104), Y(286), lambda y: 13 * math.sqrt(max(0, 1 - ((Y(130) - y) / 26) ** 2)) if y < Y(130) else 13, ramp((226, 230, 242)), sep=True)
        c.rect(bx - 13, Y(150), bx + 13, Y(158), ACC, bevel=1, sep=True)
        c.rect(bx - 13, Y(250), bx + 13, Y(258), ACC, bevel=1, sep=True)
        c.revolve(bx, Y(286), Y(304), lambda y: 7 + (y - Y(286)) * 0.3, DARK, sep=True)
    # fins
    for s in (-1, 1):
        x0 = CX + s * 56
        c.poly([(x0, Y(226)), (CX + s * 88, Y(310)), (CX + s * 88, Y(330)), (x0, Y(300))], RED_, idx=2, sep=True,
               fn=lambda x, y, s=s: 3 if (y - Y(226)) < 30 and s < 0 else 2 if s < 0 else 1 if s > 0 and (y - Y(226)) > 50 else 2)
    # main body
    def hw_body(y):
        if y < Y(92):
            u = (Y(92) - y) / 84.0
            return 30 * math.sqrt(max(0, 1 - u * u))
        if y > Y(268):
            return 30 + (y - Y(268)) * 0.4
        return 30
    c.revolve(CX, Y(8), Y(290), hw_body, SKIN, dither=0.04, sep=True)
    c.revolve(CX, Y(10), Y(78), lambda y: hw_body(y) if y < Y(78) else 0, RED_, dither=0.05, sep=True)
    c.rect(CX - 30, Y(78), CX + 30, Y(84), ACC, bevel=1, sep=True)
    c.rect(CX - 30, Y(248), CX + 30, Y(262), ACC, bevel=1, sep=True)
    c.rect(CX - 30, Y(264), CX + 30, Y(266), DARK, bevel=0)
    for y in (Y(180), Y(212)):
        for x in range(CX - 30, CX + 31):
            c.det(x, y, (150, 156, 180))
    # portholes
    for cy_, r in ((Y(112), 11), (Y(150), 8)):
        c.blob(CX + 3, cy_, r + 3, r + 3, DARK, sep=True)
        c.blob(CX + 3, cy_, r, r, GLASS, dither=0.02, sep=True)
        c.fx(CX + 3 - r * 0.5, cy_ - r * 0.5, (210, 235, 255)); c.fx(CX + 3 - r * 0.5 + 1, cy_ - r * 0.5 - 1 + 1, (240, 250, 255))
        c.fx(CX + 3 - r * 0.5 - 1, cy_ - r * 0.5 + 1, (210, 235, 255))
    # hatch
    c.rect(CX - 13, Y(190), CX + 17, Y(236), STEEL, bevel=2, sep=True, round_=3)
    c.rect(CX - 8, Y(196), CX + 12, Y(230), DARK, bevel=1, sep=True, round_=2)
    c.rect(CX + 5, Y(210), CX + 9, Y(216), YEL, bevel=0)
    # status lights
    for k in range(3):
        on = (t + k) % 3 == 0
        c.blob(CX - 20 + k * 9, Y(176), 2.4, 2.4, flat(((255, 120, 90), (255, 230, 120), (120, 240, 160))[k]) if on else ramp((60, 52, 70)), dither=0, sep=True)
    # emblem
    c.blob(CX + 10, Y(60), 8, 8, WHITE, sep=True)
    c.poly([(CX + 10, Y(53)), (CX + 14, Y(65)), (CX + 6, Y(65))], RED_, idx=2)
    # engines
    for dx in (-20, 0, 20):
        c.revolve(CX + dx, Y(290), Y(322), lambda y: 7 + (y - Y(290)) * 0.28, ramp((70, 76, 100)), sep=True)
        c.revolve(CX + dx, Y(318), Y(326), lambda y: 15, DARK, sep=True)
    if flame:
        pass


def rocket_landed(c, t):
    rocket_body(c, t, 383)
    # steam venting from the side valve
    for k in range(3):
        y = 262 - ((t * 5 + k * 8) % 22)
        c.fx(CX - 36 - (k * 2 + t % 3), y, (214, 220, 236)); c.fx(CX - 37 - (k * 2 + t % 3), y, (236, 240, 250))


def rocket_launch(c, t):
    rocket_body(c, t, 383 + (RHL - RH) - 128, legs=False)
    # flames under the engines
    base = 383 + (RHL - RH) - 128 - 383   # offset applied to the 384 layout
    top = 326 + base
    for dx, sc in ((-20, 0.8), (0, 1.15), (20, 0.8)):
        L = (60 + 22 * math.sin(t * 1.9 + dx) + 10 * (t % 2)) * sc
        for rr, col in ((13, (255, 120, 40)), (9, (255, 190, 70)), (5, (255, 244, 190))):
            f = rr / 13
            c.blob(CX + dx, top + L * f * 0.5 * 1.0 + 4, rr * sc, L * f * 0.55, flat(col), dither=0.0, ymin=top - 2)
    for k in range(10):
        x = CX + (k * 37 % 61) - 30
        y = top + 40 + ((t * 9 + k * 13) % 70)
        c.fx(x, y, (255, 214, 120)); c.fx(x + 1, y, (255, 160, 80))
