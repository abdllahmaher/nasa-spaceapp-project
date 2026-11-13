#!/usr/bin/env python3
"""Lit pixel engine v2 - any canvas size (W x H). Same look as the 96px packs.
Cells hold [ramp, idx, part_id, sep]. Light from top-left. Outline = dark tint of neighbour."""
import math
from PIL import Image

LX, LY, LZ = -0.45, -0.65, 0.62
BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]
BLK = (24, 18, 30)
WHT = (255, 255, 255)


def lerp(a, b, t):
    return tuple(a[i] + (b[i] - a[i]) * t for i in range(3))


def c8(c):
    return tuple(max(0, min(255, int(round(v)))) for v in c)


def ramp(base):
    """4-step hue-shifted ramp: deep, shade, base, light."""
    b = tuple(base)
    deep = lerp(tuple(v * 0.42 for v in b), (34, 22, 70), 0.35)
    shade = lerp(tuple(v * 0.72 for v in b), (70, 50, 120), 0.16)
    light = lerp(tuple(min(255, v * 1.1) for v in b), (255, 238, 175), 0.30)
    return [c8(deep), c8(shade), c8(b), c8(light)]


def flat(col):
    return [c8(col)] * 4


class Cv:
    def __init__(self, W, H):
        self.W, self.H = W, H
        self.cell = [[None] * W for _ in range(H)]
        self.pid = 0
        self.dets = []
        self.free = []

    def _idx(self, x, y, nx, ny, nz, dither):
        lum = (nx * LX + ny * LY + nz * LZ) * 0.9 + 0.1
        lum += (BAYER[y % 4][x % 4] / 16.0 - 0.5) * dither
        return 3 if lum > 0.68 else 2 if lum > 0.28 else 1 if lum > -0.22 else 0

    def _put(self, x, y, rp, idx, sep):
        if 0 <= x < self.W and 0 <= y < self.H:
            self.cell[y][x] = [rp, idx, self.pid, sep]

    def blob(self, cx, cy, rx, ry, rp, dither=0.07, sep=False, ymax=None, ymin=None, xmin=None, xmax=None):
        self.pid += 1
        for y in range(int(cy - ry) - 1, int(cy + ry) + 2):
            if (ymax is not None and y > ymax) or (ymin is not None and y < ymin):
                continue
            for x in range(int(cx - rx) - 1, int(cx + rx) + 2):
                if (xmin is not None and x < xmin) or (xmax is not None and x > xmax):
                    continue
                nx, ny = (x - cx) / rx, (y - cy) / ry
                d = nx * nx + ny * ny
                if d > 1.0:
                    continue
                self._put(x, y, rp, self._idx(x, y, nx, ny, math.sqrt(1 - d), dither), sep)

    def capsule(self, ax, ay, bx, by, r0, r1, rp, dither=0.07, sep=False, new=True):
        if new:
            self.pid += 1
        rm = max(r0, r1)
        vx, vy = bx - ax, by - ay
        L2 = vx * vx + vy * vy or 1e-9
        for y in range(int(min(ay, by) - rm) - 1, int(max(ay, by) + rm) + 2):
            for x in range(int(min(ax, bx) - rm) - 1, int(max(ax, bx) + rm) + 2):
                t = max(0.0, min(1.0, ((x - ax) * vx + (y - ay) * vy) / L2))
                px, py = ax + vx * t, ay + vy * t
                r = r0 + (r1 - r0) * t
                dx, dy = x - px, y - py
                d = (dx * dx + dy * dy) / (r * r)
                if d > 1.0:
                    continue
                self._put(x, y, rp, self._idx(x, y, dx / r, dy / r, math.sqrt(1 - d), dither), sep)

    def chain(self, pts, rs, rp, dither=0.07, sep=False):
        self.pid += 1
        for i in range(len(pts) - 1):
            self.capsule(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], rs[i], rs[i + 1], rp, dither, sep, new=False)

    def poly(self, pts, rp, idx=2, sep=False, fn=None):
        """Filled polygon (even-odd). idx fixed, or fn(x,y)->idx."""
        self.pid += 1
        xs = [p[0] for p in pts]; ys = [p[1] for p in pts]
        n = len(pts)
        for y in range(int(min(ys)), int(max(ys)) + 1):
            for x in range(int(min(xs)), int(max(xs)) + 1):
                inside = False
                j = n - 1
                px, py = x + 0.5, y + 0.5
                for i in range(n):
                    xi, yi = pts[i]; xj, yj = pts[j]
                    if (yi > py) != (yj > py) and px < (xj - xi) * (py - yi) / (yj - yi + 1e-12) + xi:
                        inside = not inside
                    j = i
                if inside:
                    self._put(x, y, rp, fn(x, y) if fn else idx, sep)

    def rect(self, x0, y0, x1, y1, rp, bevel=1, sep=False, round_=0):
        """Box with top-left light bevel. Inclusive coords."""
        self.pid += 1
        x0, y0, x1, y1 = int(round(x0)), int(round(y0)), int(round(x1)), int(round(y1))
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1):
                if round_ and ((x - x0 < round_ and y - y0 < round_ and (round_ - (x - x0)) + (round_ - (y - y0)) > round_ + 1) or
                               (x1 - x < round_ and y - y0 < round_ and (round_ - (x1 - x)) + (round_ - (y - y0)) > round_ + 1) or
                               (x - x0 < round_ and y1 - y < round_ and (round_ - (x - x0)) + (round_ - (y1 - y)) > round_ + 1) or
                               (x1 - x < round_ and y1 - y < round_ and (round_ - (x1 - x)) + (round_ - (y1 - y)) > round_ + 1)):
                    continue
                i = 2
                if x - x0 < bevel or y - y0 < bevel:
                    i = 3
                if x1 - x < bevel or y1 - y < bevel:
                    i = 1
                self._put(x, y, rp, i, sep)

    def revolve(self, cx, y0, y1, hw, rp, dither=0.05, sep=False, ofs=0.0):
        """Solid of revolution about vertical axis x=cx. hw(y)->half width."""
        self.pid += 1
        for y in range(int(y0), int(y1) + 1):
            w = hw(y)
            if w <= 0:
                continue
            for x in range(int(cx - w) - 1, int(cx + w) + 2):
                nx = (x + 0.5 - cx) / w
                if abs(nx) > 1:
                    continue
                self._put(x, y, rp, self._idx(x, y, nx, ofs, math.sqrt(1 - nx * nx), dither), sep)

    def det(self, x, y, c):
        self.dets.append((int(round(x)), int(round(y)), tuple(c8(c))))

    def fx(self, x, y, c):
        self.free.append((int(round(x)), int(round(y)), tuple(c8(c))))

    def render(self):
        W, H, g = self.W, self.H, self.cell

        def at(x, y):
            return g[y][x] if 0 <= x < W and 0 <= y < H else None
        for y in range(H):
            for x in range(W):
                c = g[y][x]
                if c and c[3]:
                    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                        n = at(x + dx, y + dy)
                        if n and n[2] < c[2]:
                            c.append("edge")
                            break
        out = [[None] * W for _ in range(H)]
        for y in range(H):
            for x in range(W):
                c = g[y][x]
                if c:
                    out[y][x] = c[0][0 if len(c) > 4 else c[1]]
        for y in range(H):
            for x in range(W):
                if g[y][x] is None:
                    for dx, dy in ((0, 1), (-1, 0), (1, 0), (0, -1)):
                        n = at(x + dx, y + dy)
                        if n:
                            out[y][x] = c8(lerp(tuple(v * 0.5 for v in n[0][0]), (18, 10, 28), 0.45))
                            break
        for x, y, col in self.dets:
            if 0 <= x < W and 0 <= y < H and out[y][x] is not None:
                out[y][x] = col
        img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        px = img.load()
        for y in range(H):
            for x in range(W):
                if out[y][x] is not None:
                    px[x, y] = out[y][x] + (255,)
        for x, y, col in self.free:
            if 0 <= x < W and 0 <= y < H:
                px[x, y] = col + (255,)
        return img
