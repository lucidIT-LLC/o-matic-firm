#!/usr/bin/env python3
"""Regenerate M365 Copilot color (192) + outline (32) icons for Smith, Jake, Jerry.

Brandy HOLD fixes:
  - Smith outline: dual-antenna robot head + ears (not coin-purse blob)
  - Jake color: full figure, teal hoodie, no cream/text band
  - Jerry color: strip TAX / digits; outline = head crop silhouette

Outputs:
  firm/assets/m365/{role}-color-192.png
  firm/assets/m365/{role}-outline-32.png
  /tmp/{role}-outline-256.png          (32 nearest-neighbor upscaled for QC)
  /tmp/{role}-color-192-preview.png
"""

from __future__ import annotations

import io
from pathlib import Path

import cairosvg
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path("/workspace/firm")
OUT_DIR = ROOT / "assets" / "m365"
TMP = Path("/tmp")

SMITH_SVG = ROOT / "skills" / "smith-critic" / "assets" / "smith.svg"
JAKE_SRC = ROOT / "skills" / "jake-coach" / "assets" / "jake-coach.png"
JERRY_SRC = ROOT / "skills" / "jerry-accountant" / "assets" / "jerry-accountant.png"

# Brand lock: primary teal #00B5AD (Brandy / o-MATIC).
TEAL_LIGHT = np.array([0, 181, 173], dtype=np.float32)
TEAL_DARK = np.array([0, 110, 105], dtype=np.float32)


def ensure_dirs() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    TMP.mkdir(parents=True, exist_ok=True)


def fit_square(im: Image.Image, size: int, bg=(0, 0, 0, 0), pad_frac: float = 0.06) -> Image.Image:
    im = im.convert("RGBA")
    a = np.array(im)
    opaque = a[:, :, 3] > 8
    if not opaque.any():
        return Image.new("RGBA", (size, size), bg)
    ys, xs = np.where(opaque)
    cropped = im.crop((int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1))
    cw, ch = cropped.size
    inner = int(size * (1.0 - 2 * pad_frac))
    scale = min(inner / cw, inner / ch)
    nw, nh = max(1, int(round(cw * scale))), max(1, int(round(ch * scale)))
    resized = cropped.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (size, size), bg)
    canvas.paste(resized, ((size - nw) // 2, (size - nh) // 2), resized)
    return canvas


def _fill_holes(binary: np.ndarray) -> np.ndarray:
    """Fill interior holes by flooding background from edges, then inverting."""
    h, w = binary.shape
    seen = np.zeros_like(binary, dtype=bool)
    stack: list[tuple[int, int]] = []
    for x in range(w):
        if not binary[0, x]:
            stack.append((0, x))
        if not binary[h - 1, x]:
            stack.append((h - 1, x))
    for y in range(h):
        if not binary[y, 0]:
            stack.append((y, 0))
        if not binary[y, w - 1]:
            stack.append((y, w - 1))
    while stack:
        y, x = stack.pop()
        if y < 0 or y >= h or x < 0 or x >= w or seen[y, x] or binary[y, x]:
            continue
        seen[y, x] = True
        stack.extend(((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)))
    return ~seen  # solid = not reachable exterior


def _keep_largest(binary: np.ndarray, min_keep: int = 3) -> np.ndarray:
    h, w = binary.shape
    visited = np.zeros_like(binary, dtype=bool)
    comps: list[list[tuple[int, int]]] = []
    for y in range(h):
        for x in range(w):
            if not binary[y, x] or visited[y, x]:
                continue
            stack = [(y, x)]
            visited[y, x] = True
            cells: list[tuple[int, int]] = []
            while stack:
                cy, cx = stack.pop()
                cells.append((cy, cx))
                for dy, dx in ((0, 1), (0, -1), (1, 0), (-1, 0)):
                    ny, nx = cy + dy, cx + dx
                    if 0 <= ny < h and 0 <= nx < w and binary[ny, nx] and not visited[ny, nx]:
                        visited[ny, nx] = True
                        stack.append((ny, nx))
            comps.append(cells)
    if not comps:
        return binary
    comps.sort(key=len, reverse=True)
    keep = np.zeros_like(binary)
    for y, x in comps[0]:
        keep[y, x] = True
    for cells in comps[1:]:
        if len(cells) >= max(min_keep, len(comps[0]) // 6):
            for y, x in cells:
                keep[y, x] = True
    return keep


def to_binary_outline(mask_u8: np.ndarray, size: int = 32) -> Image.Image:
    hi = Image.fromarray(mask_u8.astype(np.uint8), mode="L")
    hi = hi.filter(ImageFilter.MaxFilter(3))
    hi = hi.filter(ImageFilter.MinFilter(3))
    lo = hi.resize((size, size), Image.Resampling.BILINEAR)
    binary = _keep_largest(np.array(lo) >= 90, min_keep=3)
    binary = _fill_holes(binary)
    out = np.zeros((size, size, 4), dtype=np.uint8)
    out[binary] = (255, 255, 255, 255)
    return Image.fromarray(out, "RGBA")


def write_outputs(role: str, color192: Image.Image, outline32: Image.Image) -> None:
    color192 = color192.convert("RGBA").resize((192, 192), Image.Resampling.LANCZOS)
    a = np.array(outline32.convert("RGBA"))
    white = (a[:, :, 0] >= 250) & (a[:, :, 1] >= 250) & (a[:, :, 2] >= 250) & (a[:, :, 3] >= 128)
    clean = np.zeros_like(a)
    clean[white] = (255, 255, 255, 255)
    outline32 = Image.fromarray(clean, "RGBA")

    color_path = OUT_DIR / f"{role}-color-192.png"
    outline_path = OUT_DIR / f"{role}-outline-32.png"
    color192.save(color_path, "PNG")
    outline32.save(outline_path, "PNG")

    preview = outline32.resize((256, 256), Image.Resampling.NEAREST)
    qc = Image.new("RGBA", (256, 256), (0, 0, 0, 255))
    qc.paste(preview, (0, 0), preview)
    qc.save(TMP / f"{role}-outline-256.png", "PNG")
    color192.save(TMP / f"{role}-color-192-preview.png", "PNG")
    print(f"wrote {color_path} + {outline_path}")


def _is_cream(rgb: np.ndarray) -> np.ndarray:
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    return (r > 220) & (g > 210) & (b > 195) & (np.abs(r.astype(int) - g.astype(int)) < 25)


# ---------------------------------------------------------------------------
# Smith
# ---------------------------------------------------------------------------

def _extract_svg_groups(svg_text: str, group_ids: list[str]) -> str:
    chunks = []
    for gid in group_ids:
        start = svg_text.find(f'<g id="{gid}"')
        if start < 0:
            raise ValueError(f"group id={gid} not found")
        i = svg_text.find(">", start) + 1
        depth = 1
        while i < len(svg_text) and depth:
            next_open = svg_text.find("<g", i)
            next_close = svg_text.find("</g>", i)
            if next_close < 0:
                raise ValueError(f"unclosed group {gid}")
            if next_open >= 0 and next_open < next_close:
                depth += 1
                i = next_open + 2
            else:
                depth -= 1
                i = next_close + 4
        chunks.append(svg_text[start:i])
    return "\n".join(chunks)


def _svg_wrap(body: str, view_box: str) -> bytes:
    defs = """
  <defs>
    <radialGradient id="teal" cx="28%" cy="18%" r="88%">
      <stop offset="0" stop-color="#0aa1aa"/>
      <stop offset="0.55" stop-color="#087f88"/>
      <stop offset="1" stop-color="#045c64"/>
    </radialGradient>
    <radialGradient id="gold" cx="30%" cy="20%" r="82%">
      <stop offset="0" stop-color="#ffe477"/>
      <stop offset="0.52" stop-color="#ffc928"/>
      <stop offset="1" stop-color="#e4a900"/>
    </radialGradient>
    <radialGradient id="red" cx="32%" cy="22%" r="82%">
      <stop offset="0" stop-color="#4b5658"/>
      <stop offset=".58" stop-color="#2b2d2f"/>
      <stop offset="1" stop-color="#1a1a1a"/>
    </radialGradient>
    <radialGradient id="coat" cx="30%" cy="18%" r="86%">
      <stop offset="0" stop-color="#9e9276"/>
      <stop offset=".58" stop-color="#6f6653"/>
      <stop offset="1" stop-color="#3d392f"/>
    </radialGradient>
    <radialGradient id="cream" cx="30%" cy="20%" r="86%">
      <stop offset="0" stop-color="#fff2cb"/>
      <stop offset="1" stop-color="#fff2cb"/>
    </radialGradient>
  </defs>
"""
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="{view_box}">
{defs}
{body}
</svg>'''.encode("utf-8")


def render_svg(svg_bytes: bytes, width: int, height: int | None = None) -> Image.Image:
    png = cairosvg.svg2png(bytestring=svg_bytes, output_width=width, output_height=height or width)
    return Image.open(io.BytesIO(png)).convert("RGBA")


def _smith_outline_32_drawn() -> Image.Image:
    """Iconographic dual-antenna head+ears for 32px Teams outline legibility."""
    # Author directly at 32×32 so dual tips / ear notches cannot collapse.
    arr = np.zeros((32, 32), dtype=bool)

    def fill_rect(x0, y0, x1, y1):
        arr[y0 : y1 + 1, x0 : x1 + 1] = True

    def fill_disk(cx, cy, r):
        for y in range(cy - r, cy + r + 1):
            for x in range(cx - r, cx + r + 1):
                if 0 <= x < 32 and 0 <= y < 32 and (x - cx) ** 2 + (y - cy) ** 2 <= r * r + 0.2:
                    arr[y, x] = True

    # Head — wide rounded rect (flatter top than a purse oval)
    fill_rect(6, 11, 25, 28)
    # round the corners lightly
    for x, y in ((6, 11), (25, 11), (6, 28), (25, 28)):
        arr[y, x] = False
    fill_disk(8, 13, 2)
    fill_disk(23, 13, 2)
    fill_disk(8, 26, 2)
    fill_disk(23, 26, 2)

    # Ear pods with 1px notch so they read as side protrusions
    fill_rect(1, 15, 5, 23)
    fill_rect(26, 15, 30, 23)
    # notch (indent) between ear and head top/bottom for “ear” read
    arr[15, 5] = False
    arr[15, 26] = False
    arr[23, 5] = False
    arr[23, 26] = False

    # Antenna base mound
    fill_rect(12, 9, 19, 12)

    # Dual stalks — clearly separated columns
    for y in range(3, 11):
        arr[y, 9] = True
        arr[y, 10] = True
        arr[y, 21] = True
        arr[y, 22] = True
    # outward lean
    arr[2, 8] = True
    arr[2, 9] = True
    arr[3, 8] = True
    arr[2, 22] = True
    arr[2, 23] = True
    arr[3, 23] = True

    # Tip balls
    fill_disk(9, 2, 2)
    fill_disk(22, 2, 2)

    # Ensure gap between stalks at merge point so not a purse clasp
    arr[8, 14] = False
    arr[8, 15] = False
    arr[8, 16] = False
    arr[8, 17] = False
    arr[9, 13] = False
    arr[9, 18] = False

    out = np.zeros((32, 32, 4), dtype=np.uint8)
    out[arr] = (255, 255, 255, 255)
    return Image.fromarray(out, "RGBA")


def build_smith() -> tuple[Image.Image, Image.Image]:
    raw = SMITH_SVG.read_text(encoding="utf-8")
    body_groups = _extract_svg_groups(
        raw, ["antenna", "head", "ears", "neck-body", "smith-role-badge", "crossed-arms", "legs"]
    )
    body_svg = _svg_wrap(f'<g transform="translate(0 8)">{body_groups}</g>', "200 40 620 920")
    color_hi = render_svg(body_svg, 1024)
    color192 = fit_square(color_hi, 192, bg=(0, 0, 0, 255), pad_frac=0.05)
    return color192, _smith_outline_32_drawn()


# ---------------------------------------------------------------------------
# Jake
# ---------------------------------------------------------------------------

def _is_hoodie_blue(rgb: np.ndarray) -> np.ndarray:
    """Match source blue hoodie OR prior off-lock teal so we can pin #00B5AD."""
    r, g, b = rgb[..., 0].astype(np.int16), rgb[..., 1].astype(np.int16), rgb[..., 2].astype(np.int16)
    source_blue = (b > r + 15) & (b > g - 5) & (b > 90) & (b < 180) & (r < 120) & (g < 150) & (g > 60)
    # Petrol / prior interim teal hoodies (low red, mid green≈blue).
    off_teal = (r < 50) & (g > 70) & (g < 160) & (b > 70) & (b < 160) & (np.abs(g - b) < 35)
    return source_blue | off_teal


def _recolor_hoodie_to_teal(arr: np.ndarray) -> np.ndarray:
    out = arr.copy()
    rgb = out[:, :, :3]
    mask = _is_hoodie_blue(rgb)
    if not mask.any():
        return out
    # Pin mean toward brand #00B5AD; keep mild luminance shading only.
    lum = (0.3 * rgb[:, :, 0] + 0.5 * rgb[:, :, 1] + 0.2 * rgb[:, :, 2]).astype(np.float32) / 255.0
    shade = 0.92 + 0.16 * lum  # pin near #00B5AD
    teal = np.clip(TEAL_LIGHT[None, None, :] * shade[..., None], 0, 255)
    out[mask, :3] = teal[mask].astype(np.uint8)
    return out


def _find_cream_band_y(arr: np.ndarray) -> int:
    h = arr.shape[0]
    for y in range(h // 2, h):
        if _is_cream(arr[y, :, :3]).mean() > 0.75:
            return y
    return int(h * 0.75)


def _build_jake_full_figure(src: Image.Image) -> Image.Image:
    """Jake color tile: source circle above name pill, hoodie pinned to #00B5AD.

    No synthesized legs — Affinity/ART must supply a true full-figure master later.
    Interim keeps one source composition: character + board inside the beach circle.
    """
    src = src.convert("RGBA")
    arr = np.array(src)
    band_y = _find_cream_band_y(arr)

    W = H = 512
    cx, cy, R = 256, 256, 240
    cream_bg = (247, 242, 233, 255)

    # Take source above the cream name-pill band; keep beach circle intact.
    upper = src.crop((0, 0, 512, band_y)).convert("RGBA")
    # Soft-fill the flat cut with sand so the circle reads continuous at the hem.
    ua = np.array(upper)
    # Last ~18 rows: where the banner cut a flat edge — extend sand/ocean from neighbors.
    cut = max(0, ua.shape[0] - 18)
    for y in range(cut, ua.shape[0]):
        row = ua[y]
        # Prefer cloning from a few rows above when pixel is cream/near-white.
        creamish = _is_cream(row[:, :3]) | (
            (row[:, 0] > 220) & (row[:, 1] > 210) & (row[:, 2] > 190)
        )
        src_row = ua[max(0, cut - 8)]
        row[creamish] = src_row[creamish]
        ua[y] = row
    upper = Image.fromarray(ua, "RGBA")

    # Fit the upper crop into the destination circle.
    fa0 = np.array(upper)
    # Punch only outer-frame cream (outside the beach circle) so the circle stays.
    yy, xx = np.mgrid[0 : fa0.shape[0], 0 : fa0.shape[1]]
    # Source circle roughly centered; use alpha of non-cream to find content bbox.
    cream = _is_cream(fa0[:, :, :3])
    # Keep beach sky/sand inside — only punch cream that is also outside a loose circle.
    # Simpler: do not punch; paste onto cream canvas and recolor hoodie.
    fig = upper
    fw, fh = fig.size
    diam = int(2 * R * 0.98)
    scale = min(diam / fw, diam / fh)
    nw, nh = max(1, int(fw * scale)), max(1, int(fh * scale))
    fig_r = fig.resize((nw, nh), Image.Resampling.LANCZOS)

    canvas = Image.new("RGBA", (W, H), cream_bg)
    canvas.paste(fig_r, ((W - nw) // 2, (H - nh) // 2), fig_r)

    fa = np.array(canvas)
    # Clip anything outside the destination circle back to cream.
    yy, xx = np.mgrid[0:H, 0:W]
    outside = (xx - cx) ** 2 + (yy - cy) ** 2 > (R - 1) ** 2
    fa[outside] = cream_bg
    fa = _recolor_hoodie_to_teal(fa)
    return Image.fromarray(fa, "RGBA")


def _jake_outline_mask(color_img: Image.Image) -> Image.Image:
    a = np.array(color_img.convert("RGBA"))
    rgb = a[:, :, :3].astype(np.int16)

    cream = _is_cream(rgb)
    sky = (rgb[:, :, 0] > 200) & (rgb[:, :, 1] > 180) & (rgb[:, :, 2] > 130) & (rgb[:, :, 2] < 210)
    ocean = (rgb[:, :, 2] > 140) & (rgb[:, :, 1] > 120) & (rgb[:, :, 0] < 100) & (rgb[:, :, 1] < 190)
    sand = (rgb[:, :, 0] > 180) & (rgb[:, :, 1] > 150) & (rgb[:, :, 2] > 100) & (rgb[:, :, 2] < 170)

    orange_board_hair = (
        (rgb[:, :, 0] > 160)
        & (rgb[:, :, 1] > 60)
        & (rgb[:, :, 2] < 120)
        & (rgb[:, :, 0] > rgb[:, :, 2] + 50)
    )
    teal_cloth = (rgb[:, :, 1] > 70) & (rgb[:, :, 2] > 70) & (rgb[:, :, 0] < 90) & (rgb[:, :, 2] >= rgb[:, :, 0])
    metal = (
        (np.abs(rgb[:, :, 0] - rgb[:, :, 1]) < 25)
        & (np.abs(rgb[:, :, 1] - rgb[:, :, 2]) < 25)
        & (rgb[:, :, 0] > 70)
        & (rgb[:, :, 0] < 180)
    )
    dark_line = rgb.mean(axis=2) < 55

    fg = (orange_board_hair | teal_cloth | metal | dark_line) & ~cream & ~ocean
    fg &= ~(sky & ~orange_board_hair)
    fg &= ~(sand & ~orange_board_hair)

    img = Image.fromarray((fg.astype(np.uint8) * 255), "L")
    img = img.filter(ImageFilter.MaxFilter(5))
    img = img.filter(ImageFilter.MinFilter(3))
    m = _keep_largest(np.array(img) > 128, min_keep=30)

    ys, xs = np.where(m)
    if not len(xs):
        return to_binary_outline(m.astype(np.uint8) * 255, 32)
    pad = 6
    crop = m[max(0, ys.min() - pad) : ys.max() + pad + 1, max(0, xs.min() - pad) : xs.max() + pad + 1]
    side = max(crop.shape)
    sq = np.zeros((side, side), dtype=np.uint8)
    oy, ox = (side - crop.shape[0]) // 2, (side - crop.shape[1]) // 2
    sq[oy : oy + crop.shape[0], ox : ox + crop.shape[1]] = crop.astype(np.uint8) * 255
    return to_binary_outline(sq, 32)


def _jake_outline_32_drawn() -> Image.Image:
    """Full-figure silhouette with surfboard (left) + hair (top) signature at 32px."""
    arr = np.zeros((32, 32), dtype=bool)

    def fill_rect(x0, y0, x1, y1):
        arr[max(0, y0) : min(32, y1 + 1), max(0, x0) : min(32, x1 + 1)] = True

    # Surfboard — tall left signature
    fill_rect(3, 2, 9, 29)
    arr[1, 5] = True
    arr[1, 6] = True
    arr[2, 4] = True
    arr[2, 7] = True
    arr[30, 5] = True
    arr[30, 6] = True

    # Hair spikes
    for x, y in ((14, 1), (15, 0), (16, 1), (17, 0), (18, 1), (19, 2), (20, 1), (21, 2), (22, 3)):
        if 0 <= x < 32 and 0 <= y < 32:
            arr[y, x] = True
    fill_rect(14, 2, 22, 6)

    # Head
    fill_rect(13, 5, 23, 12)

    # Torso / hoodie (continuous — no waist gap)
    fill_rect(11, 11, 24, 20)

    # Shorts + legs + feet
    fill_rect(12, 19, 23, 23)
    fill_rect(13, 23, 16, 28)
    fill_rect(19, 23, 22, 28)
    fill_rect(11, 28, 17, 30)
    fill_rect(18, 28, 24, 30)

    # Arm to board
    fill_rect(8, 12, 12, 16)

    out = np.zeros((32, 32, 4), dtype=np.uint8)
    out[arr] = (255, 255, 255, 255)
    return Image.fromarray(out, "RGBA")


def build_jake() -> tuple[Image.Image, Image.Image]:
    full = _build_jake_full_figure(Image.open(JAKE_SRC))
    color192 = full.resize((192, 192), Image.Resampling.LANCZOS)
    # Prefer authored 32px silhouette for signature readability; keep mask path available
    outline32 = _jake_outline_32_drawn()
    return color192, outline32


# ---------------------------------------------------------------------------
# Jerry
# ---------------------------------------------------------------------------

def build_jerry_color(src: Image.Image) -> Image.Image:
    """Head crop only — drops TAX paper, calculator, books, letterforms.

    Full-prop store-final stays an Affinity/ART job; interim must have zero glyphs.
    """
    src = src.convert("RGBA")
    # Tight head window on 512 source: antenna + visor + ears + face (no props).
    return src.crop((145, 10, 385, 185))


def _jerry_outline_drawn(src: Image.Image) -> Image.Image:
    """Head-crop silhouette: single antenna+ball, visor mass, side ear pods.

    Authored at 32×32 (source-matched proportions) so eye holes cannot open and
    ears/antenna survive Teams downscale. `src` retained for API symmetry.
    """
    del src  # geometry is canonical; color scrub uses src elsewhere
    arr = np.zeros((32, 32), dtype=bool)

    def fill_rect(x0, y0, x1, y1):
        arr[y0 : y1 + 1, x0 : x1 + 1] = True

    def fill_disk(cx, cy, r):
        for y in range(cy - r, cy + r + 1):
            for x in range(cx - r, cx + r + 1):
                if 0 <= x < 32 and 0 <= y < 32 and (x - cx) ** 2 + (y - cy) ** 2 <= r * r + 0.25:
                    arr[y, x] = True

    # Wide rounded head
    fill_rect(5, 10, 26, 28)
    for x, y in ((5, 10), (26, 10), (5, 28), (26, 28)):
        arr[y, x] = False
    fill_disk(7, 12, 2)
    fill_disk(24, 12, 2)
    fill_disk(7, 26, 2)
    fill_disk(24, 26, 2)

    # Visor shelf (slight brow protrusion)
    fill_rect(7, 9, 24, 11)

    # Ear pods
    fill_rect(1, 14, 5, 22)
    fill_rect(26, 14, 30, 22)

    # Single antenna stalk + gold ball tip
    for y in range(3, 11):
        arr[y, 15] = True
        arr[y, 16] = True
    fill_disk(15, 2, 2)
    fill_disk(16, 2, 2)
    arr[1, 15] = True
    arr[1, 16] = True

    out = np.zeros((32, 32, 4), dtype=np.uint8)
    out[arr] = (255, 255, 255, 255)
    return Image.fromarray(out, "RGBA")


def build_jerry() -> tuple[Image.Image, Image.Image]:
    cleaned = build_jerry_color(Image.open(JERRY_SRC))
    color192 = fit_square(cleaned, 192, bg=(241, 236, 230, 255), pad_frac=0.04)
    outline32 = _jerry_outline_drawn(cleaned)
    return color192, outline32


def main() -> None:
    ensure_dirs()
    for role, fn in (("smith", build_smith), ("jake", build_jake), ("jerry", build_jerry)):
        print(f"=== building {role} ===")
        color192, outline32 = fn()
        write_outputs(role, color192, outline32)
    print("done")


if __name__ == "__main__":
    main()
