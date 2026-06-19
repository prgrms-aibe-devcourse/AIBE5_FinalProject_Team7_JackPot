#!/usr/bin/env python3
"""Split frontend/public/images/tags.png into individual tag icons."""
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
ICON_BOX = (22, 18, 229, 162)
TARGET = 256


def col_x(col: int) -> int:
    return sum(COL_WIDTHS[:col])


def export_icon(icon: Image.Image) -> Image.Image:
    rgba = icon.convert("RGBA")
    px = rgba.load()
    w, h = rgba.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if r > 235 and g > 235 and b > 235:
                px[x, y] = (255, 255, 255, 0)
    tw, th = rgba.size
    side = max(tw, th)
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
        export_icon(cell.crop(ICON_BOX)).save(OUT_DIR / f"{slug}.png", optimize=True)
    print(f"Exported {len(TAGS)} icons to {OUT_DIR}")


if __name__ == "__main__":
    main()
