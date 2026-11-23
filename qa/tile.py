"""Tile PNGs into one contact sheet. usage: tile.py <out.png> <cols> <cell width> <png>..."""
import sys
from PIL import Image
out, cols, cw = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
files = sys.argv[4:]
ims = [Image.open(f).convert('RGB') for f in files]
ch = round(cw * ims[0].height / ims[0].width)
rows = -(-len(ims) // cols)
gap = 8
sheet = Image.new('RGB', (cols * cw + (cols + 1) * gap, rows * ch + (rows + 1) * gap), (40, 44, 42))
for i, im in enumerate(ims):
    im = im.resize((cw, ch), Image.LANCZOS)
    sheet.paste(im, (gap + (i % cols) * (cw + gap), gap + (i // cols) * (ch + gap)))
sheet.save(out)
print(out, sheet.size)
