#!/usr/bin/env python3
"""More space props. Importing this module appends them to astro_props.SMALL / BASE."""
import math
import astro_props as P
from astro_props import (STEEL, WHITE, DARK, MID, ORG, YEL, TEAL, BLUE, RED, GLASS, GRN, PINK, SOIL, CYAN, G, shadow, wheel)
from astro_engine import ramp, flat

PURP = ramp((140, 90, 200)); ROCK = ramp((120, 108, 130)); ROCKL = ramp((150, 136, 150))


# ============================================================ small (64x64)
def drill_tool(c, t):
    c.rect(8, 28, 34, 44, ORG, bevel=2, sep=True, round_=3)
    c.rect(12, 44, 20, 58, DARK, bevel=1, sep=True)
    c.rect(14, 20, 26, 28, STEEL, bevel=1, sep=True)
    c.capsule(34, 36, 40, 36, 5, 5, DARK, sep=True)
    c.poly([(40, 30), (60, 36), (40, 42)], STEEL, idx=2, sep=True, fn=lambda x, y: 3 if y < 35 else 1 if y > 38 else 2)
    for k in range(3):
        c.fx(44 + k * 5, 33 + (k % 2) * 4, (60, 66, 90))
    c.blob(21, 36, 3.6, 3.6, YEL, sep=True)


def jetpack(c, t):
    for x in (21, 43):
        c.revolve(x, 8, 50, lambda y: 9 if 14 <= y <= 44 else 9 * math.sqrt(max(0, 1 - ((14 - y) / 6) ** 2)) if y < 14 else 9 * math.sqrt(max(0, 1 - ((y - 44) / 6) ** 2)), ramp((226, 230, 242)), sep=True)
        c.revolve(x, 50, 58, lambda y: 5 + (y - 50) * 0.5, DARK, sep=True)
        c.rect(x - 9, 24, x + 9, 28, ORG, bevel=1, sep=True)
    c.rect(18, 20, 46, 44, MID, bevel=1, sep=True, round_=2)
    c.rect(26, 30, 38, 38, ramp((22, 60, 70)), bevel=1)
    c.fx(30, 34, (120, 240, 200)); c.fx(31, 34, (120, 240, 200)); c.fx(32, 33, (120, 240, 200))


def flare(c, t):
    c.capsule(24, 56, 38, 22, 5, 5, RED, sep=True)
    c.rect(24, 36, 34, 40, WHITE, bevel=0)
    c.capsule(38, 22, 40, 16, 4, 3.4, DARK, sep=True)
    for (x, y, col) in [(41, 10, (255, 250, 200)), (41, 6, (255, 200, 80)), (38, 8, (255, 140, 60)), (44, 7, (255, 140, 60)), (41, 3, (255, 90, 50))]:
        c.fx(x, y, col); c.fx(x + 1, y, col); c.fx(x, y + 1, col)


def wrench(c, t):
    c.capsule(14, 54, 42, 22, 4.2, 4.2, MID, sep=True)
    c.blob(46, 18, 10, 10, STEEL, sep=True)
    c.blob(50, 13, 5, 5, ramp((24, 20, 36)), dither=0, sep=False)
    c.poly([(50, 4), (60, 14), (52, 18), (44, 10)], ramp((24, 20, 36)), idx=2)
    c.capsule(14, 54, 20, 48, 4.6, 4.6, ORG, sep=True)


def tablet(c, t):
    c.rect(12, 8, 52, 56, DARK, bevel=2, sep=True, round_=4)
    c.rect(16, 12, 48, 46, ramp((18, 54, 70)), bevel=1, sep=True)
    for i in range(5):
        c.fx(20, 17 + i * 6, (120, 240, 200)); c.fx(21, 17 + i * 6, (120, 240, 200))
        for k in range(8 - i):
            c.fx(24 + k * 2, 17 + i * 6, (80, 190, 170))
    c.blob(32, 51, 2.4, 2.4, MID, sep=True)


def fuel_cell(c, t):
    c.rect(14, 12, 50, 52, ramp((56, 62, 82)), bevel=2, sep=True, round_=3)
    c.rect(20, 18, 44, 46, ramp((22, 60, 40)), bevel=1, sep=True)
    for i in range(4):
        c.rect(23, 21 + i * 6, 41, 24 + i * 6, GRN if i > 0 else ramp((60, 90, 70)), bevel=0)
    c.rect(24, 6, 40, 12, YEL, bevel=1, sep=True)
    c.rect(14, 48, 50, 52, YEL, bevel=1, sep=True)


def binoculars(c, t):
    for x in (21, 43):
        c.capsule(x, 16, x, 48, 9, 11, DARK, sep=True)
        c.blob(x, 50, 10, 4, STEEL, sep=True)
        c.blob(x, 52, 7, 3, GLASS, dither=0.02, sep=True)
        c.rect(x - 8, 24, x + 8, 28, ORG, bevel=1, sep=True)
    c.rect(24, 28, 40, 38, MID, bevel=1, sep=True)


def sample_case(c, t):
    c.rect(8, 18, 55, 52, ramp((70, 76, 100)), bevel=2, sep=True, round_=3)
    c.rect(24, 12, 39, 18, DARK, bevel=1, sep=True)
    for i in range(4):
        c.rect(13 + i * 10, 24, 20 + i * 10, 44, GLASS, bevel=1, sep=True)
        c.rect(14 + i * 10, 33, 19 + i * 10, 43, [GRN, YEL, PINK, TEAL][i], bevel=0)
    c.rect(8, 46, 55, 48, DARK, bevel=0)


# ============================================================ base (128x128)
def fabricator(c, t):
    shadow(c, 64, 50)
    c.rect(18, 104, 110, 120, DARK, bevel=1, sep=True)
    c.rect(22, 30, 36, 106, MID, bevel=1, sep=True); c.rect(92, 30, 106, 106, MID, bevel=1, sep=True)
    c.rect(18, 22, 110, 36, ORG, bevel=2, sep=True, round_=3)
    c.rect(36, 48, 92, 104, ramp((24, 40, 64)), bevel=1, sep=True)
    c.rect(34, 84, 94, 104, STEEL, bevel=1, sep=True)
    hx = 50 + (t * 9) % 30 if (t // 3) % 2 == 0 else 80 - (t * 9) % 30
    c.capsule(hx, 36, hx, 66, 2, 2, STEEL, sep=True)
    c.blob(hx, 68, 3, 3, flat(CYAN), dither=0, sep=True)
    h = 4 + t * 4
    c.rect(54, 100 - h, 74, 100, ramp((150, 200, 240)), bevel=1, sep=True)
    for k in range(3):
        c.blob(46 + k * 18, 29, 3, 3, [GRN, YEL, RED][(k + t) % 3], sep=True)


def greenhouse(c, t):
    shadow(c, 64, 54)
    c.rect(14, 100, 114, 118, STEEL, bevel=2, sep=True)
    c.revolve(64, 42, 100, lambda y: 50 * math.sqrt(max(0, 1 - ((100 - y) / 58) ** 2)), ramp((150, 210, 230)), dither=0.02, sep=True)
    for x in (30, 48, 64, 80, 98):
        c.capsule(x, 100, 64 + (x - 64) * 0.45, 44, 1.4, 1.2, STEEL, sep=True)
    c.capsule(18, 96, 110, 96, 1.4, 1.4, STEEL, sep=True)
    for (x, h, col) in [(34, 22, GRN), (54, 34, ramp((60, 190, 90))), (74, 28, GRN), (94, 20, ramp((110, 210, 90)))]:
        c.capsule(x, 100, x, 100 - h, 1.8, 1.4, ramp((60, 130, 70)), sep=True)
        c.blob(x - 6, 100 - h * 0.6, 6, 3.4, col, sep=True); c.blob(x + 6, 100 - h * 0.85, 6, 3.4, col, sep=True)
        c.blob(x, 100 - h - 2, 4, 4, ramp((250, 130, 160)), sep=True)
    c.fx(40, 56, (255, 255, 255)); c.fx(41, 55, (255, 255, 255)); c.fx(42, 54, (230, 245, 255))


def fuel_tank(c, t):
    shadow(c, 64, 48)
    c.rect(26, 108, 38, 122, DARK, bevel=1, sep=True); c.rect(90, 108, 102, 122, DARK, bevel=1, sep=True)
    c.rect(26, 104, 102, 110, DARK, bevel=1, sep=True)
    c.revolve(64, 32, 106, lambda y: 38 * math.sqrt(max(0, 1 - ((y - 69) / 37.5) ** 2)), ORG, sep=True)
    c.rect(26, 62, 102, 68, WHITE, bevel=1, sep=True)
    c.rect(48, 44, 80, 56, DARK, bevel=1, sep=True, round_=2)
    c.fx(52, 50, (255, 120, 80)); c.fx(53, 50, (255, 120, 80)); c.fx(60, 50, (255, 230, 120)); c.fx(61, 50, (255, 230, 120))
    c.capsule(64, 34, 64, 20, 3, 3, STEEL, sep=True); c.capsule(64, 20, 84, 20, 2.4, 2.4, STEEL, sep=True)
    c.poly([(60, 78), (68, 78), (70, 94), (58, 94)], YEL, idx=2, sep=True)


def sleeping_pod(c, t):
    shadow(c, 64, 52)
    c.rect(12, 104, 116, 120, DARK, bevel=1, sep=True)
    c.revolve(64, 52, 106, lambda y: 52 * math.sqrt(max(0, 1 - ((y - 106) / 56) ** 2)) if y < 106 else 0, ramp((226, 230, 242)), dither=0.04, sep=True)
    c.blob(64, 80, 36, 20, ramp((40, 90, 130)), dither=0.03, sep=True)
    c.rect(30, 82, 98, 98, PINK, bevel=2, sep=True, round_=4)
    c.blob(42, 84, 11, 6, WHITE, sep=True)
    c.fx(44, 66, (200, 235, 255)); c.fx(45, 65, (230, 246, 255)); c.fx(46, 64, (200, 235, 255))
    on = t % 6 < 3
    c.blob(98, 112, 2.6, 2.6, flat((120, 240, 160) if on else (50, 90, 70)), dither=0, sep=True)
    c.rect(20, 108, 32, 112, ORG, bevel=0)


def telescope(c, t):
    shadow(c, 64, 44)
    for s in (-1, 1):
        c.capsule(64, 82, 64 + s * 26, 120, 3.2, 3.4, STEEL, sep=True)
    c.capsule(64, 82, 64, 120, 3.2, 3.2, MID, sep=True)
    c.capsule(36, 90, 96, 44, 11, 14, ramp((226, 230, 242)), sep=True)
    c.capsule(70, 62, 98, 40, 14, 16, ramp((226, 230, 242)), sep=True)
    c.rect(52, 68, 64, 74, ORG, bevel=1) if False else None
    c.blob(103, 36, 10, 10, GLASS, dither=0.02, sep=True)
    c.blob(30, 94, 5, 5, DARK, sep=True)
    c.blob(64, 82, 6, 6, ORG, sep=True)
    c.fx(99, 32, (230, 246, 255)); c.fx(100, 31, (255, 255, 255))


def drill_rig(c, t):
    shadow(c, 64, 52)
    c.rect(24, 104, 104, 120, DARK, bevel=1, sep=True)
    c.rect(34, 20, 46, 104, ORG, bevel=1, sep=True); c.rect(82, 20, 94, 104, ORG, bevel=1, sep=True)
    c.rect(30, 12, 98, 26, STEEL, bevel=2, sep=True, round_=2)
    c.rect(48, 28, 80, 50, ramp((80, 90, 120)), bevel=1, sep=True, round_=2)
    y = 56 + (t % 6) * 3
    c.capsule(64, 50, 64, y + 28, 3, 3, STEEL, sep=True)
    c.poly([(58, y + 28), (70, y + 28), (64, y + 46)], YEL, idx=2, sep=True)
    for k in range(5):
        a = (t + k) * 1.3
        c.fx(64 + math.cos(a) * 12, 114 - (k * 3 + t * 2) % 10, (190, 170, 160))
    c.blob(40, 108, 4, 4, flat((255, 120, 80) if t % 2 else (140, 70, 60)), dither=0, sep=True)
    for i in range(3):
        c.rect(36, 34 + i * 18, 44, 38 + i * 18, YEL, bevel=0)


def boulders(c, t):
    shadow(c, 64, 50)
    for (x, y, rx, ry, rp) in [(40, 98, 28, 22, ROCK), (84, 102, 24, 18, ROCKL), (64, 82, 18, 14, ROCK), (102, 112, 11, 8, ROCK)]:
        c.blob(x, y, rx, ry, rp, dither=0.14, sep=True)
    for p in [(32, 90), (36, 94), (80, 98), (60, 78), (50, 104), (96, 108)]:
        c.det(*p, (70, 58, 82))
    c.det(30, 86, (214, 200, 214)); c.det(31, 86, (214, 200, 214)); c.det(60, 76, (214, 200, 214))


def alien_plant(c, t):
    shadow(c, 64, 30)
    sw = math.sin(t * 1.05)
    for k, (dx, h) in enumerate([(-18, 52), (0, 80), (18, 60), (-34, 30), (34, 34)]):
        x1, y1 = 64 + dx * 0.4, 118
        x2, y2 = 64 + dx + sw * (2 + k % 3), 118 - h
        c.capsule(x1, y1, (x1 + x2) / 2 + sw * 2, (y1 + y2) / 2, 2.6, 2.1, ramp((100, 70, 170)), sep=True)
        c.capsule((x1 + x2) / 2 + sw * 2, (y1 + y2) / 2, x2, y2, 2.1, 1.5, ramp((100, 70, 170)), sep=True, new=False)
        pulse = 0.5 + 0.5 * math.sin(t * 1.05 + k)
        c.blob(x2, y2 - 3, 5 + pulse, 5 + pulse, flat((120 + 80 * pulse, 240, 220)), dither=0, sep=True)
        c.det(x2, y2 - 3, (255, 255, 255))
    c.blob(64, 118, 22, 5, SOIL, sep=True)
    for k in range(4):
        c.fx(40 + k * 16 + (t % 3), 40 - ((t * 4 + k * 7) % 26) + 30, (190, 255, 240))


def lamp_post(c, t):
    shadow(c, 64, 26)
    c.rect(52, 112, 76, 120, DARK, bevel=1, sep=True)
    c.capsule(64, 112, 64, 34, 3.4, 2.6, STEEL, sep=True)
    c.capsule(64, 34, 88, 28, 2.6, 2.6, STEEL, sep=True)
    c.rect(80, 26, 100, 36, DARK, bevel=1, sep=True, round_=2)
    on = t % 6 != 5
    c.blob(90, 36, 8, 3, flat((255, 240, 170) if on else (110, 100, 80)), dither=0, sep=True)
    if on:
        for y in range(38, 70, 3):
            w = (y - 36) * 0.5
            for x in range(int(90 - w), int(90 + w) + 1, 2):
                if (x + y + t) % 5 == 0:
                    c.fx(x, y, (255, 240, 190))
    c.rect(56, 72, 72, 82, YEL, bevel=1, sep=True)


def supply_pod(c, t):
    shadow(c, 64, 46)
    c.revolve(64, 36, 118, lambda y: 38 * math.sqrt(max(0, 1 - ((y - 84) / 48) ** 2)), ramp((200, 206, 224)), dither=0.04, sep=True)
    c.rect(26, 78, 102, 86, ORG, bevel=1, sep=True)
    c.rect(48, 92, 80, 112, DARK, bevel=1, sep=True, round_=2)
    c.rect(52, 96, 76, 108, STEEL, bevel=1, sep=True)
    c.blob(64, 58, 10, 9, GLASS, dither=0.03, sep=True)
    c.capsule(64, 38, 64, 24, 1.6, 1.4, STEEL, sep=True)
    c.blob(64, 22, 3, 3, flat((255, 90, 90) if t % 6 < 3 else (120, 40, 50)), dither=0)
    c.blob(30, 119, 8, 3, DARK, sep=True); c.blob(98, 119, 8, 3, DARK, sep=True)


P.SMALL += [("drill_tool", drill_tool), ("jetpack", jetpack), ("flare", flare), ("wrench", wrench),
            ("data_tablet", tablet), ("fuel_cell", fuel_cell), ("binoculars", binoculars), ("sample_case", sample_case)]
P.BASE += [("fabricator", fabricator, 6), ("greenhouse", greenhouse, 1), ("fuel_tank", fuel_tank, 1), ("sleeping_pod", sleeping_pod, 6),
           ("telescope", telescope, 1), ("drill_rig", drill_rig, 6), ("boulders", boulders, 1), ("alien_plant", alien_plant, 6),
           ("lamp_post", lamp_post, 6), ("supply_pod", supply_pod, 6)]
