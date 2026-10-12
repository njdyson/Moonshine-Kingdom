#!/usr/bin/env python3
"""Draw the Respect shields as SVG: one shape, one red, one numeral face.

Writes Art/Shields/plus1.svg .. plus5.svg and minus1.svg .. minus3.svg, the
badges the Jobs deck (1, 3, 5) and the Cards sheet (Bribes 1 to 4, Welsher -1,
Mark -2, Rat -3) pin to each card's top-right corner.

Until 2026-10-12 the badges were PNGs from two families: flat 256px plates for
the positives and the archived Debts deck's glossier 1024px plates for the
negatives, plus a patched-up 4. These replace all of them, so every value reads
the same and a new one costs a line here.

The numerals are Bebas Neue in the board's cream, the face and colour of the
Still numbers on the board (tools/still_art.js), so a Respect badge reads like
the board's own figures. They are converted to outlines: an SVG used as a CSS
background can't load a web font, so the glyphs travel as paths and the files
need nothing else to render or print. Like the Stills, they are laid out by
their ink, not their advance.
The shield's silhouette is traced from the old plates, so the badge sits in its
12.5mm box exactly as before.

    pip install fonttools
    python3 tools/build_shields.py                  # fetches Bebas Neue from Google Fonts
    python3 tools/build_shields.py --font BebasNeue-Regular.ttf
"""
import argparse
import os
import re
import tempfile
import urllib.request

from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

VALUES = [1, 2, 3, 4, 5, -1, -2, -3]
OUT_DIR = "Art/Shields"
FONT_CSS = "https://fonts.googleapis.com/css2?family=Bebas+Neue"

# viewBox 0 0 100 100. A heater shield peaked in the middle of its top edge,
# straight sides from y 16 to 50, curving to a point at y 91.
SHIELD = ("M50 6C44 11 36 15.5 27 16.6L17 16.3L17 50C17 66 33 82 50 91"
          "C67 82 83 66 83 50L83 16.3L73 16.6C64 15.5 56 11 50 6Z")

CAP = 46          # ink height of the digits (Bebas Neue is tall and narrow)
CAP_NEG = 40      # a minus widens the figure, and the shield narrows toward its point
CY = 48           # their vertical centre
GAP = 3           # between the minus and the digit, ink to ink

FILL_TOP, FILL_BOTTOM = "#ab2d1b", "#7f170d"
RIM = "#5a0c05"
KEYLINE = "#e9a27f"
NUMERAL = "#f5e9d9"     # the Still numerals' cream
NUMERAL_SHADOW = "#4a0a04"

# The drop shadow is drawn here, not by CSS: Chrome rasterises any element
# with a CSS filter when it prints, so a CSS drop-shadow turned every badge
# into a bitmap in the PDF. Stacked translucent strokes fake the blur with
# no filter at all. Offset and spread match the old CSS (0 .4mm .8mm at
# 12.5mm = 100 units, so 3.2 down and about 6 of blur).
SHADOW_DY = 3.2
SHADOW_LAYERS = [(11, .09), (8, .11), (5, .13), (2, .16)]   # stroke width, opacity


def fetch_font(dest_dir):
    """Download Bebas Neue as TTF (an old User-Agent gets TTF, not WOFF2)."""
    ua = {"User-Agent": "Mozilla/4.0"}
    css = urllib.request.urlopen(urllib.request.Request(FONT_CSS, headers=ua), timeout=30).read().decode()
    url = re.search(r"url\((https://[^)]+\.ttf)\)", css).group(1)
    path = os.path.join(dest_dir, "BebasNeue-Regular.ttf")
    with open(path, "wb") as fh:
        fh.write(urllib.request.urlopen(urllib.request.Request(url, headers=ua), timeout=30).read())
    return path


def numeral_path(font, value):
    """The value's glyphs, the font's own minus included, as one SVG path, centred."""
    glyphs = font.getGlyphSet()
    cmap = font.getBestCmap()
    minus = "\u2212" if 0x2212 in cmap else "-"
    chars = (minus if value < 0 else "") + str(abs(value))
    names = [cmap[ord(c)] for c in chars]
    bounds = []
    for name in names:
        bp = BoundsPen(glyphs)
        glyphs[name].draw(bp)
        bounds.append(bp.bounds)                     # xMin, yMin, xMax, yMax in font units
    digits = bounds[1:] if value < 0 else bounds     # the digits set the size; the minus rides along
    y_min = min(b[1] for b in digits)
    cap = CAP_NEG if value < 0 else CAP
    scale = cap / (max(b[3] for b in digits) - y_min)
    widths = [(b[2] - b[0]) * scale for b in bounds]
    x = 50 - (sum(widths) + GAP * (len(chars) - 1)) / 2
    baseline = CY + cap / 2

    parts = []
    for name, b, w in zip(names, bounds, widths):
        pen = SVGPathPen(glyphs, ntos=lambda v: f"{v:.2f}".rstrip("0").rstrip("."))
        glyphs[name].draw(TransformPen(pen, (scale, 0, 0, -scale, x - b[0] * scale, baseline + y_min * scale)))
        parts.append(pen.getCommands())
        x += w + GAP
    return "".join(parts)


def shield_svg(font, value):
    num = numeral_path(font, value)
    sign = "minus" if value < 0 else "plus"
    shadow = "\n".join(
        f'<path d="{SHIELD}" fill="#000" fill-opacity="{op}" stroke="#000" stroke-opacity="{op}" '
        f'stroke-width="{w}" stroke-linejoin="round" transform="translate(0 {SHADOW_DY})"/>'
        for w, op in SHADOW_LAYERS)
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
<!-- Respect {value:+d}. Generated by tools/build_shields.py; edit that, not this. -->
<defs><linearGradient id="{sign}{abs(value)}-fill" x1="0" y1="0" x2=".35" y2="1"><stop offset="0" stop-color="{FILL_TOP}"/><stop offset="1" stop-color="{FILL_BOTTOM}"/></linearGradient></defs>
{shadow}
<path d="{SHIELD}" fill="url(#{sign}{abs(value)}-fill)" stroke="{RIM}" stroke-width="3.2" stroke-linejoin="round"/>
<path d="{SHIELD}" fill="none" stroke="{KEYLINE}" stroke-opacity=".22" stroke-width=".9" transform="translate(50 48) scale(.88) translate(-50 -48)"/>
<path d="{num}" fill="{NUMERAL_SHADOW}" fill-opacity=".55" transform="translate(.7 .9)"/>
<path d="{num}" fill="{NUMERAL}"/>
</svg>
"""


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--font", help="a Bebas Neue TTF; fetched from Google Fonts if omitted")
    args = ap.parse_args()
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    with tempfile.TemporaryDirectory() as tmp:
        font = TTFont(args.font or fetch_font(tmp))
        os.makedirs(os.path.join(root, OUT_DIR), exist_ok=True)
        for v in VALUES:
            name = f"{'minus' if v < 0 else 'plus'}{abs(v)}.svg"
            with open(os.path.join(root, OUT_DIR, name), "w", encoding="utf-8") as fh:
                fh.write(shield_svg(font, v))
            print(f"{OUT_DIR}/{name}")


if __name__ == "__main__":
    main()
