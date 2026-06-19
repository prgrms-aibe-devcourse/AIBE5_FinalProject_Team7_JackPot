#!/usr/bin/env python3
"""Split frontend/public/images/tags.png into individual tag icons.

The sprite is a regular 5x6 grid. Every cell holds a circular emblem with a
text label underneath, and cells bleed into each other a little at the seams.
A fixed crop window clips some circles, so we detect the emblem per cell:

  1) build an "ink" mask (anything that is not the near-white background),
  2) label it into connected components,
  3) keep only the emblem components, dropping
       - the label text below the circle,
       - thin fragments of the upper cell's label at the very top,
       - bleed from neighbouring cells touching the left/right seams,
  4) render ONLY the kept components (everything else is made transparent, so
     padding never re-introduces label pixels),
  5) crop to the kept bounding box and centre it on a square canvas.
"""
from __future__ import annotations

from collections import deque
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
# Some circles (notably the right-hand columns) sit left within their cell and
# their arc spills past the nominal cell edge into the neighbour's gutter. We
# crop a wider window so the full circle is captured, then trim real neighbour
# bleed via the gutter detection in _seam_clean.
EXPAND_X = 26

SEAM_MARGIN = 6        # ignore bleed within this many px of the left/right seam
LABEL_Y = 180          # components whose centre is below this are label text
TOP_BLEED_Y = 15       # thin fragments fully above this are the upper cell's label
MIN_COMPONENT = 12     # ignore tiny specks
BBOX_PAD = 12          # padding added around the detected emblem
CANVAS_MARGIN = 6      # extra transparent breathing room
TARGET = 256


def col_x(col: int) -> int:
    return sum(COL_WIDTHS[:col])


def _seam_clean(cell: Image.Image) -> Image.Image:
    """Erase neighbour-cell bleed that touches the left/right seams.

    Adjacent circles overlap slightly, so a neighbour's arc can spill into this
    cell with no white gap and merge with our circle. Per column we count ink
    rows; near each seam there is a 'valley' (minimum) between the neighbour's
    arc and our circle. We blank everything outside those valleys.
    """
    rgba = cell.convert("RGBA")
    px = rgba.load()
    w, h = rgba.size

    def ink_col(x: int) -> int:
        n = 0
        for y in range(h):
            r, g, b, a = px[x, y]
            if a >= 12 and not (r > 234 and g > 234 and b > 234):
                n += 1
        return n

    cols = [ink_col(x) for x in range(w)]

    # A neighbour's arc only counts as bleed when it is separated from our
    # circle by a near-empty "gutter" column (a real white gap). The gradual
    # ink decline at our own circle's left/right arc never reaches the gutter
    # level, so it is preserved. This is the key: do NOT mistake our own arc
    # for bleed.
    gutter = 4          # ink rows at/under this is a white gap
    bleed = 15          # a neighbour blob has at least this much ink
    band = 60

    left_cut = 0
    for x in range(3, min(band, w)):
        if cols[x] <= gutter and max(cols[0:x], default=0) > bleed:
            left_cut = x + 1  # keep scanning: take the gutter nearest the circle

    right_cut = w
    for x in range(w - 4, max(w - band, 0) - 1, -1):
        if cols[x] <= gutter and max(cols[x + 1:w], default=0) > bleed:
            right_cut = x      # nearest gutter to the circle on the right

    if left_cut == 0 and right_cut == w:
        return rgba
    for y in range(h):
        for x in range(w):
            if x < left_cut or x >= right_cut:
                px[x, y] = (0, 0, 0, 0)
    return rgba


def _label_components(cell: Image.Image):
    rgba = cell.convert("RGBA")
    px = rgba.load()
    w, h = rgba.size
    labels = [[-1] * w for _ in range(h)]
    comps: list[dict[str, float]] = []
    for y0 in range(h):
        for x0 in range(w):
            r, g, b, a = px[x0, y0]
            is_ink = a >= 12 and not (r > 234 and g > 234 and b > 234)
            if not is_ink or labels[y0][x0] != -1:
                continue
            cid = len(comps)
            q: deque[tuple[int, int]] = deque([(x0, y0)])
            labels[y0][x0] = cid
            min_x = max_x = x0
            min_y = max_y = y0
            count = 0
            sum_y = 0
            while q:
                x, y = q.popleft()
                count += 1
                sum_y += y
                min_x = min(min_x, x)
                max_x = max(max_x, x)
                min_y = min(min_y, y)
                max_y = max(max_y, y)
                for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                    if 0 <= nx < w and 0 <= ny < h and labels[ny][nx] == -1:
                        rr, gg, bb, aa = px[nx, ny]
                        if aa >= 12 and not (rr > 234 and gg > 234 and bb > 234):
                            labels[ny][nx] = cid
                            q.append((nx, ny))
            comps.append(
                {
                    "id": cid,
                    "count": count,
                    "min_x": min_x,
                    "min_y": min_y,
                    "max_x": max_x,
                    "max_y": max_y,
                    "cy": sum_y / count,
                }
            )
    return rgba, labels, comps


def export_icon(cell: Image.Image) -> Image.Image:
    rgba, labels, comps = _label_components(_seam_clean(cell))
    w, h = rgba.size

    kept_ids = set()
    for c in comps:
        if c["count"] < MIN_COMPONENT:
            continue
        if c["cy"] > LABEL_Y:               # label below the circle
            continue
        if c["max_y"] < TOP_BLEED_Y:        # upper cell's label at the top
            continue
        kept_ids.add(c["id"])

    if not kept_ids:
        kept_ids = {max(comps, key=lambda c: c["count"])["id"]}

    kept = [c for c in comps if c["id"] in kept_ids]
    min_x = min(c["min_x"] for c in kept)
    min_y = min(c["min_y"] for c in kept)
    max_x = max(c["max_x"] for c in kept)
    max_y = max(c["max_y"] for c in kept)

    # Keep only the emblem pixels; drop the rest so padding can't re-introduce
    # label or bleed pixels.
    px = rgba.load()
    for y in range(h):
        for x in range(w):
            lid = labels[y][x]
            if lid not in kept_ids:
                px[x, y] = (0, 0, 0, 0)
            else:
                r, g, b, a = px[x, y]
                if r > 234 and g > 234 and b > 234:
                    px[x, y] = (255, 255, 255, 0)

    left = max(0, min_x - BBOX_PAD)
    top = max(0, min_y - BBOX_PAD)
    right = min(w, max_x + BBOX_PAD + 1)
    bottom = min(h, max_y + BBOX_PAD + 1)
    icon = rgba.crop((left, top, right, bottom))

    # Centre the full circle (its bounding box) on a square canvas so the ring
    # is framed with equal margin on every side and is never clipped.
    iw, ih = icon.size
    side = max(iw, ih) + CANVAS_MARGIN * 2
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    canvas.paste(icon, ((side - iw) // 2, (side - ih) // 2))
    return canvas.resize((TARGET, TARGET), Image.Resampling.LANCZOS)


def main() -> None:
    sprite = Image.open(SPRITE)
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    sw = sprite.size[0]
    for index, slug in enumerate(TAGS):
        col, row = index % 5, index // 5
        cell = sprite.crop(
            (
                max(0, col_x(col) - EXPAND_X),
                row * ROW_HEIGHT,
                min(sw, col_x(col) + COL_WIDTHS[col] + EXPAND_X),
                (row + 1) * ROW_HEIGHT,
            )
        )
        export_icon(cell).save(OUT_DIR / f"{slug}.png", optimize=True)
    print(f"Exported {len(TAGS)} icons to {OUT_DIR}")


if __name__ == "__main__":
    main()
