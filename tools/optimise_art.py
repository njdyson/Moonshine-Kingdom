"""Right-size the art for both screen and print, one set of files.

The art was authored far above print need. Card art prints at 57x38mm on a
63x88mm card, so a 1536x1024 source is ~684 DPI when 300 is the commercial
standard; the stake shields print at 12.5mm from 1024px, which is ~2081 DPI.
Everything here is sized to 400 DPI - still above spec - and photographic
art moves from lossless PNG to JPEG, which is what it should have been.

THE RULEBOOK COVERS ARE DELIBERATELY LEFT ALONE - DO NOT ADD THEM BACK.
Two reasons. They are the opposite case on resolution: 1672px across a
185mm text column is only 229 DPI, already under standard. And converting
them to JPEG - at byte-identical pixel dimensions, with the stylesheet
untouched - takes the printed rulebook from 23 pages to 24, appending a
blank. Verified by A/B in a clean worktree: same checkout, only the image
format swapped. Continuous layout is pixel-identical (document height
22866.67px both ways, every container height equal to 0.01px), so this is
something in Chrome's paged-media path, not a reflow.

The last page has ~10px of slack and is a known knife edge (see
[[rulebook-print-workflow]]). Zeroing the trailing padding does remove the
blank page, but it drags the gold frame to the sheet edge and reflows the
two-column body, so it is not a fix. If the rulebook art is ever converted,
reclaim space on that page first and re-render to confirm 23.

Anything with real transparency stays PNG (JPEG has no alpha): the title
logo and the shields.

Originals are recoverable from git history - they were committed before
this ran.

Usage:  python tools/optimise_art.py [--apply]
Without --apply it reports what it would do and writes nothing.
"""
import glob, json, os, sys
from PIL import Image

APPLY = "--apply" in sys.argv
DPI = 400

# Card art box: .card is 63mm wide with 3mm side padding -> 57mm; .art is 38mm.
# object-fit:cover, so both axes must still clear the target after cropping.
CARD_W_IN, CARD_H_IN = 57 / 25.4, 38 / 25.4
NEED_W, NEED_H = round(DPI * CARD_W_IN), round(DPI * CARD_H_IN)   # 898 x 598

SHIELD_PX = 256          # 12.5mm at 400 DPI is 197px; 256 leaves margin
KEEP_PNG = {"Art/Rulebook/Moonshine Kingdom.png"}   # real alpha, and a logo


def norm(p):
    return p.replace("\\", "/")


# Only the five shields the decks actually reference. A bare Art/shield*.png
# glob also catches shield-1 / shield-3 / shield2-unified, which nothing links
# to and which have no established display size to resize against.
SHIELDS = ["Art/shield1.png", "Art/shield2.png", "Art/shield3.png",
           "Art/shield5.png", "Art/shieldNoCrown.png"]


def collect():
    jobs = [norm(f) for f in glob.glob("Art/Jobs/*") if f.lower().endswith((".png", ".jpeg"))]
    cards = [norm(f) for f in glob.glob("Art/Cards/*.png")]
    book = []                      # see the module docstring - stays PNG
    shields = [f for f in SHIELDS if os.path.exists(f)]
    return jobs, cards, book, shields


def save_jpeg(im, dst, q):
    im.convert("RGB").save(dst, "JPEG", quality=q, optimize=True, progressive=True)


def process():
    jobs, cards, book, shields = collect()
    mapping, before, after = {}, 0, 0

    def note(src, dst):
        nonlocal before, after
        before += os.path.getsize(src)
        after += os.path.getsize(dst) if os.path.exists(dst) else 0
        if norm(src) != norm(dst):
            mapping[norm(src)] = norm(dst)

    # ---- card art: downsample to 400 DPI, then JPEG ----
    for src in jobs + cards:
        im = Image.open(src)
        w, h = im.size
        scale = min(1.0, max(NEED_W / w, NEED_H / h))
        dst = os.path.splitext(src)[0] + ".jpg"
        if APPLY:
            out = im.resize((max(1, round(w * scale)), max(1, round(h * scale))), Image.LANCZOS) if scale < 1 else im
            save_jpeg(out, dst, 88)
        note(src, dst)

    # ---- rulebook covers: format only, dimensions untouched ----
    for src in book:
        if norm(src) in KEEP_PNG:
            continue
        dst = os.path.splitext(src)[0] + ".jpg"
        if APPLY:
            save_jpeg(Image.open(src), dst, 90)
        note(src, dst)

    # ---- shields: keep alpha, shrink hard ----
    for src in shields:
        im = Image.open(src).convert("RGBA")
        if APPLY:
            im.resize((SHIELD_PX, SHIELD_PX), Image.LANCZOS).save(
                src, "PNG", optimize=True)
        note(src, src)

    return mapping, before, after


if __name__ == "__main__":
    mapping, before, after = process()
    print(f"{'APPLIED' if APPLY else 'DRY RUN'} - {len(mapping)} files change extension")
    if APPLY:
        print(f"before {before/1e6:8.1f} MB")
        print(f"after  {after/1e6:8.1f} MB   ({before/max(after,1):.1f}x smaller)")
        json.dump(mapping, open("tools/.art-rename-map.json", "w"), indent=0)
        print("map -> tools/.art-rename-map.json")
    else:
        print(f"card art target: {NEED_W}x{NEED_H} px minimum after cover-crop")
        print("run again with --apply to write")
