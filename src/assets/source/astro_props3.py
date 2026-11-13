#!/usr/bin/env python3
"""Third batch of props. Importing appends to astro_props.SMALL / BASE."""
import math
import astro_props as P
from astro_props import (STEEL, WHITE, DARK, MID, ORG, YEL, TEAL, BLUE, RED, GLASS, GRN, PINK, SOIL, CYAN, shadow, wheel)
from astro_engine import ramp, flat

PURP = ramp((140, 90, 200)); ROCK = ramp((120, 108, 130)); ICE = ramp((170, 220, 245)); COPPER = ramp((214, 130, 80)); IRON = ramp((130, 138, 160))


# ============================================================ small (64x64)
def ration_pack(c, t):
    c.rect(10, 16, 53, 52, ramp((200, 160, 70)), bevel=2, sep=True, round_=2)
    c.rect(10, 16, 53, 24, ORG, bevel=1, sep=True)
    c.rect(18, 30, 45, 44, WHITE, bevel=1, sep=True)
    c.blob(32, 37, 5, 5, RED, sep=True); c.blob(32, 37, 2, 2, YEL, dither=0)
    for x in (12, 18, 24, 30, 36, 42, 48):
        c.fx(x, 14, (180, 130, 60)); c.fx(x + 1, 13, (180, 130, 60))


def radio(c, t):
    c.rect(10, 22, 53, 54, DARK, bevel=2, sep=True, round_=3)
    c.capsule(44, 22, 52, 4, 1.3, 1.1, STEEL, sep=True)
    c.rect(15, 27, 33, 38, ramp((18, 54, 70)), bevel=1, sep=True)
    for i in range(6):
        c.fx(17 + i * 3, 36 - (i * 5) % 7, (120, 240, 200))
    c.blob(42, 33, 6, 6, MID, sep=True); c.det(42, 29, (255, 255, 255))
    for i in range(5):
        c.rect(15 + i * 7, 44, 19 + i * 7, 48, [RED, YEL, GRN, BLUE, MID][i], bevel=0, sep=True)


def canteen(c, t):
    c.revolve(32, 14, 56, lambda y: 15 if 20 <= y <= 50 else 15 * math.sqrt(max(0, 1 - ((20 - y) / 6) ** 2)) if y < 20 else 15 * math.sqrt(max(0, 1 - ((y - 50) / 6) ** 2)), BLUE, sep=True)
    c.rect(24, 6, 40, 14, DARK, bevel=1, sep=True)
    c.rect(17, 30, 47, 42, WHITE, bevel=1, sep=True)
    c.blob(32, 36, 4, 4, ICE, sep=True)
    c.capsule(40, 10, 50, 18, 1.6, 1.6, MID, sep=True)


def solar_cell(c, t):
    c.poly([(8, 44), (20, 14), (56, 14), (46, 44)], ramp((34, 70, 150)), idx=2, sep=True)
    for i in range(1, 4):
        x = 8 + (46 - 8) * i / 4; x2 = 20 + (56 - 20) * i / 4
        for k in range(14):
            c.fx(x2 + (x - x2) * k / 13, 14 + 30 * k / 13, (110, 150, 240))
    for k in range(1, 3):
        y = 14 + 30 * k / 3
        for s in range(40):
            c.fx(20 - 12 * k / 3 + (36 + 2 * k / 3 * 3) * s / 39 * 0.95 + 0, y, (110, 150, 240))
    c.rect(24, 46, 40, 54, DARK, bevel=1, sep=True)


def circuit(c, t):
    c.rect(8, 12, 55, 52, ramp((30, 110, 70)), bevel=2, sep=True, round_=2)
    for (x, y, w, h) in [(14, 18, 12, 10), (32, 20, 16, 14), (16, 36, 10, 10), (36, 40, 14, 8)]:
        c.rect(x, y, x + w, y + h, DARK, bevel=1, sep=True)
    for (x1, y1, x2, y2) in [(26, 22, 32, 22), (20, 28, 20, 36), (26, 41, 36, 44), (48, 28, 48, 40)]:
        for k in range(20):
            c.fx(x1 + (x2 - x1) * k / 19, y1 + (y2 - y1) * k / 19, (230, 200, 90))
    for p in [(12, 48), (50, 16), (52, 48)]:
        c.blob(*p, 2, 2, YEL, sep=True)


def scrap(c, t):
    c.poly([(8, 52), (14, 30), (36, 24), (46, 40), (40, 54)], IRON, idx=2, sep=True,
           fn=lambda x, y: 3 if y < 32 else 1 if y > 46 else 2)
    c.poly([(30, 48), (36, 22), (56, 30), (56, 52)], ramp((108, 116, 140)), idx=2, sep=True)
    c.blob(24, 40, 3, 3, ramp((30, 26, 40)), dither=0, sep=True)
    c.capsule(20, 22, 28, 12, 2, 2, MID, sep=True)
    c.fx(38, 28, (255, 255, 255))


def ice_chunk(c, t):
    c.poly([(10, 54), (14, 30), (28, 12), (44, 20), (54, 38), (50, 54)], ICE, idx=2, sep=True,
           fn=lambda x, y: 3 if (x + y) < 52 else 1 if (x + y) > 86 else 2)
    c.fx(24, 24, (255, 255, 255)); c.fx(25, 24, (255, 255, 255)); c.fx(24, 25, (255, 255, 255))
    c.fx(38, 36, (230, 248, 255))


def spare_helmet(c, t):
    c.blob(32, 32, 24, 22, ramp((222, 226, 238)), sep=True)
    c.blob(37, 33, 15, 12, DARK, sep=True)
    c.blob(37.5, 33, 13, 10, GLASS, dither=0.02, sep=True)
    c.blob(21, 36, 5, 5, ORG, sep=True)
    c.capsule(24, 14, 20, 6, 1.3, 1.2, STEEL, sep=True)
    c.fx(31, 28, (210, 235, 255)); c.fx(32, 27, (255, 255, 255)); c.fx(30, 29, (210, 235, 255))
    c.blob(32, 56, 22, 3, DARK, sep=True)


# ============================================================ base (128x128)
def radar_dish(c, t):
    shadow(c, 64, 44)
    c.rect(44, 108, 84, 120, DARK, bevel=1, sep=True)
    c.capsule(64, 110, 64, 70, 6, 5, STEEL, sep=True)
    c.rect(50, 86, 78, 102, ORG, bevel=1, sep=True, round_=2)
    a = math.sin(t / 6 * math.tau) * 10
    c.blob(64 + a * 0.6, 56, 38, 22, ramp((226, 230, 242)), dither=0.04, sep=True, ymax=66)
    c.blob(64 + a * 0.6, 52, 28, 14, ramp((130, 140, 168)), dither=0.04, sep=False, ymax=60)
    c.capsule(64 + a * 0.6, 56, 64 + a * 1.4, 28, 1.6, 1.4, STEEL, sep=True)
    c.blob(64 + a * 1.4, 26, 3.4, 3.4, flat((255, 90, 90) if t % 6 < 3 else (120, 40, 50)), dither=0, sep=True)


def airlock(c, t):
    shadow(c, 64, 50)
    c.rect(18, 20, 110, 120, ramp((150, 158, 182)), bevel=3, sep=True, round_=4)
    c.rect(34, 34, 94, 118, DARK, bevel=2, sep=True, round_=4)
    op = [0, 0, 6, 12, 12, 6][t % 6]
    c.rect(38, 38, 62 - op, 116, STEEL, bevel=1, sep=True)
    c.rect(66 + op, 38, 90, 116, STEEL, bevel=1, sep=True)
    c.rect(62 - op, 38, 66 + op, 116, ramp((24, 40, 70)), bevel=0)
    for x in range(20, 110, 10):
        c.fx(x, 24, YEL[2] if (x // 10) % 2 == 0 else DARK[2])
        c.fx(x + 1, 24, YEL[2] if (x // 10) % 2 == 0 else DARK[2])
    on = (t // 3) % 2 == 0
    c.blob(64, 28, 4, 4, flat((120, 240, 160) if on else (255, 120, 90)), dither=0, sep=True)


def drone(c, t):
    bob = math.sin(t / 6 * math.tau) * 3
    c.blob(64, 118, 24 - bob, 3, ramp((50, 46, 70)), dither=0)
    y = 60 + bob
    c.blob(64, y, 22, 16, ramp((226, 230, 242)), dither=0.05, sep=True)
    c.blob(70, y, 12, 9, DARK, sep=True)
    c.blob(70, y, 9, 6, flat(CYAN if t % 6 < 4 else (60, 100, 120)), dither=0, sep=True)
    for s in (-1, 1):
        c.capsule(64 + s * 20, y - 6, 64 + s * 34, y - 14, 2.4, 2, STEEL, sep=True)
        w = 16 if t % 2 == 0 else 12
        c.blob(64 + s * 34, y - 18, w, 2.4, ramp((120, 130, 158)), dither=0, sep=True)
    c.capsule(64, y + 14, 64, y + 24, 1.6, 1.6, STEEL, sep=True); c.blob(64, y + 26, 4, 3, ORG, sep=True)
    c.capsule(54, y - 12, 50, y - 24, 1.3, 1.1, STEEL, sep=True)
    c.blob(50, y - 26, 2.6, 2.6, flat((255, 90, 90) if t % 6 < 3 else (120, 40, 50)), dither=0)


def crystal_cluster(c, t):
    shadow(c, 64, 46)
    pulse = 0.5 + 0.5 * math.sin(t / 6 * math.tau)
    base = (60 + int(40 * pulse), 190, 200)
    for (x, h, w) in [(34, 54, 11), (50, 80, 14), (72, 96, 15), (92, 62, 12), (106, 38, 9), (62, 52, 9)]:
        rp = ramp(base)
        c.poly([(x - w, 118), (x - w * 0.8, 118 - h * 0.78), (x, 118 - h), (x + w * 0.8, 118 - h * 0.78), (x + w, 118)], rp, idx=2, sep=True,
               fn=lambda px, py, x=x, w=w: 3 if px < x - w * 0.15 else 2 if px < x + w * 0.45 else 1)
        c.fx(x - w * 0.3, 118 - h * 0.7, (255, 255, 255))
    c.blob(64, 119, 50, 4, ROCK, dither=0.1, sep=True)
    for k in range(3):
        c.fx(50 + k * 24, 30 + ((t * 5 + k * 9) % 30), (190, 255, 245))


def mining_cart(c, t):
    shadow(c, 64, 50)
    c.poly([(16, 56), (112, 56), (102, 100), (26, 100)], ramp((120, 100, 90)), idx=2, sep=True,
           fn=lambda x, y: 3 if y < 62 else 1 if y > 94 else 2)
    c.rect(14, 52, 114, 60, MID, bevel=1, sep=True)
    for x in (34, 64, 94):
        c.capsule(x, 62, x - 2, 98, 1.3, 1.3, DARK, sep=True)
    c.blob(56, 48, 20, 10, ramp((150, 140, 160)), dither=0.12, sep=True, ymax=56)
    c.blob(84, 50, 16, 8, COPPER, dither=0.12, sep=True, ymax=56)
    c.blob(40, 52, 12, 6, TEAL, dither=0.1, sep=True, ymax=56)
    c.rect(8, 114, 120, 118, DARK, bevel=1, sep=True)
    for x in (38, 90):
        wheel(c, x, 108, 9, t)


def container_stack(c, t):
    shadow(c, 64, 56)
    for (x0, y0, x1, y1, rp) in [(8, 74, 78, 120, ORG), (74, 74, 124, 120, BLUE), (24, 28, 98, 74, ramp((70, 160, 110)))]:
        c.rect(x0, y0, x1, y1, rp, bevel=2, sep=True)
        for x in range(x0 + 6, x1 - 4, 8):
            c.rect(x, y0 + 3, x + 2, y1 - 3, rp if False else ramp((60, 60, 80)), bevel=0)
        c.rect(x0, y0, x1, y0 + 3, WHITE, bevel=0)
    c.rect(36, 52, 52, 58, WHITE, bevel=0); c.rect(14, 96, 30, 102, WHITE, bevel=0)


def comms_console(c, t):
    shadow(c, 64, 52)
    c.poly([(14, 120), (22, 62), (106, 62), (114, 120)], ramp((86, 94, 122)), idx=2, sep=True)
    c.rect(20, 40, 108, 70, DARK, bevel=2, sep=True, round_=3)
    c.rect(26, 45, 102, 65, ramp((18, 54, 70)), bevel=1, sep=True)
    for i in range(18):
        a = 4 + int(5 * (1 + math.sin(i * 0.8 + t * 1.2)))
        for y in range(a):
            c.fx(30 + i * 4, 63 - y, (120, 240, 200))
    for r in range(2):
        for i in range(8):
            c.rect(28 + i * 10, 78 + r * 12, 34 + i * 10, 84 + r * 12, [RED, YEL, GRN, BLUE][(i + r + t // 2) % 4], bevel=1, sep=True)
    c.rect(14, 110, 114, 120, DARK, bevel=1, sep=True)


def signpost(c, t):
    shadow(c, 64, 34)
    c.capsule(64, 120, 64, 16, 3, 2.6, ramp((140, 100, 70)), sep=True)
    c.poly([(30, 30), (82, 30), (94, 40), (82, 50), (30, 50)], YEL, idx=2, sep=True)
    c.poly([(98, 60), (48, 60), (36, 70), (48, 80), (98, 80)], ORG, idx=2, sep=True)
    c.poly([(30, 90), (74, 90), (84, 98), (74, 106), (30, 106)], TEAL, idx=2, sep=True)
    for (y, n) in ((40, 6), (70, 7), (98, 5)):
        for k in range(n):
            c.fx(42 + k * 7, y, (40, 30, 50)); c.fx(43 + k * 7, y, (40, 30, 50))
    c.blob(64, 14, 4, 4, RED, sep=True)


def heater(c, t):
    shadow(c, 64, 40)
    c.rect(42, 104, 86, 120, DARK, bevel=1, sep=True)
    c.revolve(64, 50, 106, lambda y: 20, STEEL, sep=True)
    c.rect(42, 56, 86, 62, ORG, bevel=1, sep=True)
    c.revolve(64, 36, 52, lambda y: 20 - (52 - y) * 0.9, MID, sep=True)
    for k in range(5):
        c.rect(48, 70 + k * 6, 80, 72 + k * 6, flat((255, 120 + 20 * ((k + t) % 3), 60)), bevel=0, sep=False)
    for k in range(4):
        x = 52 + k * 8 + math.sin(t + k) * 2
        c.fx(x, 30 - ((t * 3 + k * 5) % 18), (255, 180 + k * 10, 110)); c.fx(x, 31 - ((t * 3 + k * 5) % 18), (255, 140, 90))


P.SMALL += [("ration_pack", ration_pack), ("radio", radio), ("canteen", canteen), ("solar_cell", solar_cell),
            ("circuit_board", circuit), ("scrap_metal", scrap), ("ice_chunk", ice_chunk), ("spare_helmet", spare_helmet)]
P.BASE += [("radar_dish", radar_dish, 6), ("airlock", airlock, 6), ("drone", drone, 6), ("crystal_cluster", crystal_cluster, 6),
           ("mining_cart", mining_cart, 6), ("container_stack", container_stack, 1), ("comms_console", comms_console, 6),
           ("signpost", signpost, 1), ("heater", heater, 6)]
