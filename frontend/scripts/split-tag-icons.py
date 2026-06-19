#!/usr/bin/env python3
"""Split frontend/public/images/tags.png into individual tag icons."""
from __future__ import annotations

from pathlib import Path
from collections import deque
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SPRITE = ROOT / "frontend/public/images/tags.png"
OUT_DIR = ROOT / "frontend/public/images/tags"

# Visual order in the 5x6 sprite (row-major). Must match tags.png layout.
TAGS = [
    "citrus", "orchard-fruit", "stone-fruit", "red-berry", "dark-berry",
    "dried-fruit", "cooked-fruit", "banana", "floral", "green-leafy",
    "herbal", "baking-spice", "pepper", "honey", "vanilla",
    "caramel", "chocolate-cocoa", "nutty", "grain", "fresh-oak",
    "old-wood", "leather", "tobacco", "coffee", "peat-smoke",
    "bonfire", "medicinal", "coastal",
]
COL_WIDTHS = [251, 251, 251, 251, 250]
ROW_HEIGHT = 209
TOP_CUT_Y = 20
LABEL_CUT_Y = 166
EDGE_MARGIN_X = 6
BBOX_PAD = 10
EXTRA_MARGIN = 18
TARGET = 256


def col_x(col: int) -> int:
    return sum(COL_WIDTHS[:col])


def _is_icon_pixel(r: int, g: int, b: int, a: int) -> bool:
    if a < 12:
        return False
    if r > 238 and g > 238 and b > 238:
        return False
    # Label text/bleed is mostly near-black. Keep dark gray icons.
    if max(r, g, b) < 60:
        return False
    return True


def _icon_bbox(icon_area: Image.Image) -> tuple[int, int, int, int] | None:
    rgba = icon_area.convert("RGBA")
    px = rgba.load()
    w, h = rgba.size
    mask: list[list[bool]] = [[False] * w for _ in range(h)]
    points: list[tuple[int, int]] = []
    for y in range(h):
        for x in range(EDGE_MARGIN_X, w - EDGE_MARGIN_X):
            if _is_icon_pixel(*px[x, y]):
                mask[y][x] = True
                points.append((x, y))

    if not points:
        return None

    visited: set[tuple[int, int]] = set()
    components: list[dict[str, float]] = []
    for sx, sy in points:
        if (sx, sy) in visited:
            continue
        q: deque[tuple[int, int]] = deque([(sx, sy)])
        visited.add((sx, sy))
        min_x, min_y, max_x, max_y = sx, sy, sx, sy
        count = 0
        sum_x = 0.0
        sum_y = 0.0
        while q:
            x, y = q.popleft()
            count += 1
            sum_x += x
            sum_y += y
            min_x = min(min_x, x)
            min_y = min(min_y, y)
            max_x = max(max_x, x)
            max_y = max(max_y, y)
            for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                if 0 <= nx < w and 0 <= ny < h and mask[ny][nx] and (nx, ny) not in visited:
                    visited.add((nx, ny))
                    q.append((nx, ny))
        components.append(
            {
                "count": float(count),
                "min_x": float(min_x),
                "min_y": float(min_y),
                "max_x": float(max_x),
                "max_y": float(max_y),
                "cx": sum_x / count,
                "cy": sum_y / count,
            }
        )

    cx, cy = w / 2.0, h / 2.0
    center_radius2 = 110.0 * 110.0
    kept = [
        c
        for c in components
        if c["count"] >= 20.0
        and (c["cx"] - cx) ** 2 + (c["cy"] - cy) ** 2 <= center_radius2
    ]
    if not kept:
        kept = [max(components, key=lambda c: c["count"])]

    min_x = int(min(c["min_x"] for c in kept))
    min_y = int(min(c["min_y"] for c in kept))
    max_x = int(max(c["max_x"] for c in kept))
    max_y = int(max(c["max_y"] for c in kept))

    return (
        max(0, min_x - BBOX_PAD),
        max(0, min_y - BBOX_PAD),
        min(w, max_x + BBOX_PAD + 1),
        min(h, max_y + BBOX_PAD + 1),
    )


def export_icon(cell: Image.Image) -> Image.Image:
    icon_area = cell.crop((0, TOP_CUT_Y, cell.size[0], LABEL_CUT_Y))
    bbox = _icon_bbox(icon_area)
    rgba = icon_area.crop(bbox) if bbox else icon_area
    rgba = rgba.convert("RGBA")
    px = rgba.load()
    w, h = rgba.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if r > 235 and g > 235 and b > 235:
                px[x, y] = (255, 255, 255, 0)

    tw, th = rgba.size
    side = max(tw, th) + EXTRA_MARGIN * 2
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    canvas.paste(rgba, ((side - tw) // 2, (side - th) // 2))
    return canvas.resize((TARGET, TARGET), Image.Resampling.LANCZOS)


def main() -> None:
    sprite = Image.open(SPRITE)
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for index, slug in enumerate(TAGS):
        col, row = index % 5, index // 5
        cell = sprite.crop(
            (
                col_x(col),
                row * ROW_HEIGHT,
                col_x(col) + COL_WIDTHS[col],
                (row + 1) * ROW_HEIGHT,
            )
        )
        export_icon(cell).save(OUT_DIR / f"{slug}.png", optimize=True)
    print(f"Exported {len(TAGS)} icons to {OUT_DIR}")


if __name__ == "__main__":
    main()
