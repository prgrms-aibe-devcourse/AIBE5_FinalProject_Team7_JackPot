#!/usr/bin/env python3
"""Split frontend/public/images/tags.png into individual tag icons.

The sprite is a regular 5x6 grid. Every cell holds a circular emblem with a
text label underneath. Measuring all 28 cells shows the circle is consistently
placed: it spans roughly y[20..189] and is horizontally centred, while the
label always begins at y>=188. We therefore crop a fixed window around the
circle (centred horizontally, just above the label), which guarantees the full
circle is captured without clipping and without pulling in the label text or
bleed from neighbouring cells at the seams.
"""
from __future__ import annotations

from pathlib import Path

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

# Fixed circle window measured across all cells.
CIRCLE_TOP = 16          # a touch above the ring top (~20)
CIRCLE_BOTTOM = 186      # at the ring bottom (~186 median); stays above the label band (>=188)
CIRCLE_HALF_WIDTH = 92   # half width of the crop; covers ring + right flourish
TARGET = 256
CANVAS_MARGIN = 12       # transparent breathing room around the circle


def col_x(col: int) -> int:
    return sum(COL_WIDTHS[:col])


def export_icon(cell: Image.Image) -> Image.Image:
    w, h = cell.size
    cx = w / 2.0
    left = max(0, int(round(cx - CIRCLE_HALF_WIDTH)))
    right = min(w, int(round(cx + CIRCLE_HALF_WIDTH)))
    top = max(0, CIRCLE_TOP)
    bottom = min(h, CIRCLE_BOTTOM)

    icon = cell.crop((left, top, right, bottom)).convert("RGBA")
    px = icon.load()
    iw, ih = icon.size
    for y in range(ih):
        for x in range(iw):
            r, g, b, a = px[x, y]
            if r > 234 and g > 234 and b > 234:
                px[x, y] = (255, 255, 255, 0)

    side = max(iw, ih) + CANVAS_MARGIN * 2
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    canvas.paste(icon, ((side - iw) // 2, (side - ih) // 2))
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
