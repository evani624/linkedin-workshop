# QA scripts

Python 3 with Playwright (`pip install playwright pillow && playwright install chromium webkit`).
Each script serves a built folder on a local port, so run `npm run build` in `source/` first.
`deckqa.py` and `touch.py` run on Chromium and WebKit and on Playwright device profiles; `fidelity.py` and `deckshot.py` use Chromium.

```
# 1. Nothing leaves the slide, on every step (prints "problems: 0" when clean).
#    Sizes are [width, height] or a Playwright device name; the 4th argument is the engines.
#    Also checks the shell: slide inside the window, no page scroll, and on touch profiles
#    that no control sits on top of the slide.
python3 qa/deckqa.py source/dist qa/slides.json '[[1920,1080],[1440,900],[1280,720],"iPhone 13","iPhone 13 landscape","Galaxy S8","Galaxy S8 landscape","iPad (gen 7)"]' chromium,webkit

# 1b. Touch: tap is next, fast taps do not zoom, back / next / list buttons, the step survives a
#     reload and a turn of the phone, every control can be tapped and has a tap area of 24px or more.
#     Takes a folder or a URL (the live site).
python3 qa/touch.py source/dist '["iPhone 13","iPhone 13 landscape","Galaxy S8","Galaxy S8 landscape","iPad (gen 7)"]' webkit,chromium

# 2. On-screen wording against the source of truth
python3 qa/fidelity.py source/dist reference/slides_on_screen.md qa/steps.json

# 3. Screenshots. A job: {"hash":"s23","out":"s23.png","steps":3,"wait":1500,"stepWait":1500,"w":1920,"h":1080,"scale":1,"each":false}
python3 qa/deckshot.py source/dist '[{"hash":"s23","out":"/tmp/s23.png","steps":3}]'

# 4. Tile PNGs into one sheet: tile.py <out.png> <columns> <cell width> <png>...
python3 qa/tile.py /tmp/sheet.png 4 800 /tmp/s*.png
```

Expected output of `fidelity.py` on the reference build (not defects):

- slide 1 misses `اسمك` and `التاريخ`: placeholders. The name is shown; the date is not decided.
- slides 1 and 4 show the nine part names (the dial); slide 8 shows blanks instead of `___`.
- slides 3 and 18 report a word with an Arabic comma attached (a tokenising artefact).
- slide 5 does not show the column header `الطريقة`; slides 23–24 do not show the row label `التفاعل`.
- slide 31 misses `كود QR لحسابك في`: the QR code itself stands in for that line.
- extras by design: «أي منشور وصل أكثر؟» on 23–24, «أنا» on 25, «…المزيد» on 12, the six opener names on 28,
  the address and the owner's name on 31.
