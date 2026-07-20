"""Downsample + JPEG every image stream in a PDF, keeping text vector.

Usage: python tools/compress_pdf.py IN.pdf OUT.pdf [max_width=1400] [quality=74]
Builds the "screen" companion to a Chrome --print-to-pdf "print" build.

Walks pdf.objects rather than page /Resources: most of the covers live nested
inside Form XObjects, and a page-level walk misses them (and their SMasks,
which are where most of the weight actually is).

Mutates each stream in place so every existing reference stays valid.
"""
import io, sys
import pikepdf
from PIL import Image

if len(sys.argv) < 3:
    sys.exit(__doc__.strip())

SRC, DST = sys.argv[1], sys.argv[2]
MAX_W = int(sys.argv[3]) if len(sys.argv) > 3 else 1400
Q = int(sys.argv[4]) if len(sys.argv) > 4 else 74

pdf = pikepdf.open(SRC)
done = skipped = failed = 0
before = after = 0

for obj in pdf.objects:
    if not isinstance(obj, pikepdf.Stream):
        continue
    if obj.get("/Subtype") != pikepdf.Name("/Image"):
        continue

    try:
        raw = len(obj.read_raw_bytes())
    except Exception:
        continue
    if raw < 60_000:                      # tiny icons: not worth the quality hit
        skipped += 1
        continue

    try:
        pil = pikepdf.PdfImage(obj).as_pil_image()
    except Exception as e:
        failed += 1
        print(f"  ! decode failed ({e}) - left as-is")
        continue

    w, h = pil.size
    gray = pil.mode in ("L", "1", "I;16", "I")
    if w > MAX_W:
        pil = pil.resize((MAX_W, max(1, round(h * MAX_W / w))), Image.LANCZOS)

    # Soft-edge alpha masks get a touch more quality; JPEG ringing on a hard
    # mask edge is visible, on a gradient it is not.
    pil = pil.convert("L" if gray else "RGB")
    buf = io.BytesIO()
    pil.save(buf, "JPEG", quality=Q + (6 if gray else 0),
             optimize=True, progressive=True)
    data = buf.getvalue()

    if len(data) >= raw:                  # already smaller than we can manage
        skipped += 1
        continue

    for k in ("/DecodeParms", "/Decode", "/Interpolate"):
        if k in obj:
            del obj[k]
    obj.write(data, filter=pikepdf.Name("/DCTDecode"))
    obj.Width, obj.Height = pil.size
    obj.ColorSpace = pikepdf.Name("/DeviceGray" if gray else "/DeviceRGB")
    obj.BitsPerComponent = 8

    before += raw
    after += len(data)
    done += 1

pdf.save(DST, compress_streams=True,
         object_stream_mode=pikepdf.ObjectStreamMode.generate)
print(f"recompressed {done} images: {before/1e6:.1f} MB -> {after/1e6:.1f} MB "
      f"| skipped {skipped}, undecodable {failed}")
