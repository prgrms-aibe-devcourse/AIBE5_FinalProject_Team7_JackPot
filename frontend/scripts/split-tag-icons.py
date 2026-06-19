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
LABEL_CUT_Y = 166
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
    # Label text/bleed is dark gray-black. Icons are brighter.
    if max(r, g, b) < 120:
        return False
    return True


def _icon_bbox(icon_area: Image.Image) -> tuple[int, int, int, int] | None:
    rgba = icon_area.convert("RGBA")
    px = rgba.load()
    w, h = rgba.size
    min_x, min_y, max_x, max_y = w, h, -1, -1
    for y in range(h):
        for x in range(w):
            if _is_icon_pixel(*px[x, y]):
                min_x = min(min_x, x)
                min_y = min(min_y, y)
                max_x = max(max_x, x)
                max_y = max(max_y, y)

    if max_x < 0:
        return None

    return (
        max(0, min_x - BBOX_PAD),
        max(0, min_y - BBOX_PAD),
        min(w, max_x + BBOX_PAD + 1),
        min(h, max_y + BBOX_PAD + 1),
    )


def export_icon(cell: Image.Image) -> Image.Image:
    icon_area = cell.crop((0, 0, cell.size[0], LABEL_CUT_Y))
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
