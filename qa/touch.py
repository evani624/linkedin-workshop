"""Touch pass over a built deck on phone and tablet profiles.

usage: touch.py <dist dir | http url> [devices json] [engines]
       devices: Playwright device names, default iPhone 13 (upright and landscape), Galaxy S8 (both), iPad
       engines: comma separated, default webkit,chromium

Checks, per engine and device:
  - a tap on the slide is "next"; two fast taps are two steps and do not zoom the page
  - the rail's back / next / list buttons work, and the list opens a slide
  - the slide and its step survive a reload and the phone being turned
  - every control on every slide can be reached by a tap (nothing lies on top of it) and its tap area is at least 24px
  - a few controls really do their job: the counters (2), the checklist (29), the toggle (11), the drag (13)
Prints "problems: N".
"""
import sys, json, asyncio, threading, functools, http.server, socketserver, os
from playwright.async_api import async_playwright

target = sys.argv[1]
devices = json.loads(sys.argv[2]) if len(sys.argv) > 2 else ['iPhone 13', 'iPhone 13 landscape', 'Galaxy S8', 'Galaxy S8 landscape', 'iPad (gen 7)']
engines = sys.argv[3].split(',') if len(sys.argv) > 3 else ['webkit', 'chromium']
STEPS = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'steps.json'), encoding='utf-8'))

CONTROLS = r"""
(() => {
  const stage = document.querySelector('.stage').getBoundingClientRect();
  const all = [...document.querySelectorAll('.slide button, .slide [role="button"], .slide [role="checkbox"], .slide [role="slider"], .slide [role="option"]')];
  const out = [];
  for (const el of all) {
    if (el.closest('[inert]') || el.disabled) continue;
    const s = getComputedStyle(el);
    if (s.visibility === 'hidden' || s.pointerEvents === 'none') continue;
    let faded = false;
    for (let p = el; p && !p.classList.contains('slide'); p = p.parentElement) if (parseFloat(getComputedStyle(p).opacity) < 0.05) faded = true;
    if (faded) continue;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    const hit = document.elementFromPoint(x, y);
    // how far the tappable area really reaches (it may be wider than the drawing)
    const mine = (px, py) => { const h = document.elementFromPoint(px, py); return !!h && el.contains(h); };
    const reach = (dx, dy) => { let d = 0; while (d < 40 && mine(x + dx * (d + 1), y + dy * (d + 1))) d += 1; return d; };
    const span = Math.min(reach(1, 0) + reach(-1, 0), reach(0, 1) + reach(0, -1)) + 1; // + the centre pixel
    out.push({
      span,
      name: (el.getAttribute('aria-label') || el.textContent || el.className.baseVal || el.className).trim().slice(0, 30),
      size: Math.round(Math.min(r.width, r.height)),
      reach: !!hit && (el.contains(hit) || hit.contains(el)),
      inside: x >= stage.left && x <= stage.right && y >= stage.top && y <= stage.bottom
    });
  }
  return out;
})()
"""

STATE = "({ hash: location.hash, step: sessionStorage.getItem('deck:step'), scale: window.visualViewport ? window.visualViewport.scale : 1, turned: !!document.querySelector('.show--turned') })"


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


async def main():
    httpd = None
    if target.startswith('http'):
        base = target.rstrip('/') + '/'
    else:
        socketserver.TCPServer.allow_reuse_address = True
        httpd = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=os.path.abspath(target)))
        threading.Thread(target=httpd.serve_forever, daemon=True).start()
        base = f'http://127.0.0.1:{httpd.server_address[1]}/'
    problems = 0

    def check(label, ok, detail=''):
        nonlocal problems
        if not ok:
            problems += 1
        print(f"{'OK ' if ok else 'BAD'} {label}{' :: ' + str(detail) if detail and not ok else ''}", flush=True)

    async with async_playwright() as p:
        for engine in engines:
            browser = await getattr(p, engine).launch()
            for device in devices:
                tag = f'{engine} {device}'
                profile = {k: v for k, v in p.devices[device].items() if k != 'default_browser_type'}
                context = await browser.new_context(**profile)
                page = await context.new_page()
                errors = []
                page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
                page.on('pageerror', lambda e: errors.append('PAGEERROR ' + str(e)))

                async def open_slide(n, steps=0):
                    await page.goto('about:blank')
                    await page.goto(f'{base}index.html#s{n}')
                    await page.evaluate('document.fonts.ready')
                    await page.wait_for_timeout(900)
                    for _ in range(steps):
                        await page.keyboard.press('ArrowRight')
                        await page.wait_for_timeout(500)
                    await page.wait_for_timeout(700)

                async def centre(selector):
                    box = await page.locator(selector).first.bounding_box()
                    return box['x'] + box['width'] / 2, box['y'] + box['height'] / 2

                async def tap(selector):
                    x, y = await centre(selector)
                    await page.touchscreen.tap(x, y)
                    await page.wait_for_timeout(350)

                state = lambda: page.evaluate(STATE)

                # --- moving through the deck by touch ---
                await open_slide(5)
                # a spot on the slide that holds no control: its top-right corner area, by the title
                box = await page.locator('.stage').bounding_box()
                turned = (await state())['turned']
                spot = (box['x'] + box['width'] * 0.5, box['y'] + box['height'] * 0.12) if not turned else (box['x'] + box['width'] * 0.88, box['y'] + box['height'] * 0.5)
                await page.touchscreen.tap(*spot); await page.wait_for_timeout(350)
                s = await state(); check(f'{tag}: tap is next', s['step'] == '5:1', s)
                await page.touchscreen.tap(*spot); await page.touchscreen.tap(*spot); await page.wait_for_timeout(500)
                s = await state(); check(f'{tag}: two fast taps are two steps, no zoom', s['step'] == '5:3' and abs(s['scale'] - 1) < 0.01, s)
                await tap('.hud button[aria-label="الخطوة السابقة"]')
                s = await state(); check(f'{tag}: back button', s['step'] == '5:2', s)
                await tap('.hud button[aria-label="الخطوة التالية"]')
                s = await state(); check(f'{tag}: next button', s['step'] == '5:3', s)
                await page.reload(); await page.wait_for_timeout(900)
                s = await state(); check(f'{tag}: reload keeps slide and step', s['hash'] == '#s5' and s['step'] == '5:3', s)
                view = page.viewport_size
                await page.set_viewport_size({'width': view['height'], 'height': view['width']}); await page.wait_for_timeout(700)
                s = await state(); check(f'{tag}: turning the phone keeps slide and step', s['hash'] == '#s5' and s['step'] == '5:3', s)
                box = await page.locator('.stage').bounding_box()
                check(f'{tag}: slide still inside the window after turning', box['x'] >= -1 and box['y'] >= -1 and box['x'] + box['width'] <= view['height'] + 1 and box['y'] + box['height'] <= view['width'] + 1, box)
                await page.set_viewport_size(view); await page.wait_for_timeout(500)
                await tap('.hud button[aria-label="كل الشرائح"]')
                s = await state(); check(f'{tag}: list button opens the list', s['hash'] == '#index', s)
                scroll = await page.evaluate("(() => { const el = document.querySelector('.index'); return { can: el.scrollHeight > el.clientHeight, wide: el.scrollWidth > el.clientWidth + 1 }; })()")
                check(f'{tag}: list fits the width', not scroll['wide'], scroll)
                await page.locator('.index__part button').nth(6).scroll_into_view_if_needed()
                await tap('.index__part button >> nth=6')
                s = await state(); check(f'{tag}: list opens a slide', s['hash'] == '#s7', s)

                # --- every control on every slide, at its last step ---
                small = []
                for n in range(1, 32):
                    await open_slide(n, STEPS[str(n)])
                    for c in await page.evaluate(CONTROLS):
                        if not (c['reach'] and c['inside']):
                            check(f"{tag}: s{n} control «{c['name']}» can be tapped", False, c)
                        # the drag on slide 13 is taken by the whole box, not by the thin handle
                        if max(c['size'], c['span']) < 24 and 'اسحب' not in c['name']:
                            small.append(f"s{n} «{c['name']}» {max(c['size'], c['span'])}px")
                check(f'{tag}: no tap area smaller than 24px', not small, small)

                # --- controls that must do their job ---
                await open_slide(2, 1)
                await tap('.tally__count'); await tap('.tally__count')
                label = await page.locator('.tally__count').first.get_attribute('aria-label')
                await tap('.tally__tools button[aria-label="نقّص واحد"]')
                label2 = await page.locator('.tally__count').first.get_attribute('aria-label')
                s = await state(); check(f'{tag}: s2 counter counts and undoes, deck stays', label.endswith(' 2') and label2.endswith(' 1') and s['step'] == '2:1', [label, label2, s])

                await open_slide(29)
                await tap('.slide [role="checkbox"]')
                ticked = await page.locator('.slide [role="checkbox"]').first.get_attribute('aria-checked')
                check(f'{tag}: s29 box ticks', ticked == 'true', ticked)

                await open_slide(11)
                await tap('.s11__toggle button >> nth=1')
                pressed = await page.locator('.s11__toggle button').nth(1).get_attribute('aria-pressed')
                s = await state(); check(f'{tag}: s11 toggle', pressed == 'true' and s['step'] == '11:0', [pressed, s])

                await open_slide(13)
                box = await page.locator('.s13__box').bounding_box()
                turned = (await state())['turned']
                # 30% of the way from the slide's right edge (the screen's bottom edge when the slide lies on its side)
                x, y = (box['x'] + box['width'] / 2, box['y'] + box['height'] * 0.7) if turned else (box['x'] + box['width'] * 0.7, box['y'] + box['height'] / 2)
                await page.mouse.move(x, y); await page.mouse.down(); await page.mouse.move(x + 1, y + 1); await page.mouse.up(); await page.wait_for_timeout(300)
                now = int(await page.locator('.s13__grip').get_attribute('aria-valuenow'))
                s = await state(); check(f'{tag}: s13 drag follows the finger', 25 <= now <= 35 and s['step'] == '13:0', [now, s])

                check(f'{tag}: no console errors', not errors, errors[:3])
                await context.close()
            await browser.close()
    if httpd:
        httpd.shutdown()
    print('problems:', problems)


asyncio.run(main())
