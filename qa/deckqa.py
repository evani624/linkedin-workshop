"""QA pass over a built deck: every slide, every step, at several window sizes.
Reports text that leaves the slide, the smallest type on each slide, and console errors.

usage: deckqa.py <dist dir> <slides json: [{"hash": "...", "steps": N}]> [sizes json] [engines]

sizes:   a JSON list whose items are [width, height] or the name of a Playwright device,
         e.g. '[[1920,1080],"iPhone 13","iPhone 13 landscape","Galaxy S8"]'
engines: comma separated, e.g. chromium,webkit (default chromium)

On top of the text checks, every step is checked for: the slide being cut by the window, the
page being scrollable, and (on touch profiles) a control that overlaps the slide or leaves the window.
"""
import sys, json, asyncio, threading, functools, http.server, socketserver, os
from playwright.async_api import async_playwright

dist = os.path.abspath(sys.argv[1])
slides = json.load(open(sys.argv[2], encoding='utf-8')) if os.path.exists(sys.argv[2]) else json.loads(sys.argv[2])
sizes = json.loads(sys.argv[3]) if len(sys.argv) > 3 else [[1920, 1080], [1280, 720]]
engines = sys.argv[4].split(',') if len(sys.argv) > 4 else ['chromium']

PROBE = r"""
(() => {
  const stageEl = document.querySelector('.stage');
  const slide = document.querySelector('.slide');
  if (!stageEl || !slide) return { error: 'no slide' };
  const stage = stageEl.getBoundingClientRect();
  // On an upright phone the slide lies on its side: its long edge is still 1920 units.
  const unit = Math.max(stage.width, stage.height) / 1920;
  const out = { off: [], sizes: {}, count: 0 };
  const walker = document.createTreeWalker(slide, NodeFilter.SHOW_TEXT);
  const seen = new Set();
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const text = node.textContent.trim();
    if (!text) continue;
    const el = node.parentElement;
    if (seen.has(el)) continue;
    seen.add(el);
    if (el.closest('.counter__sr, .counter__measure, .counter__strip, .counter__sizer, [aria-hidden="true"] svg, svg')) continue;
    let hidden = false;
    for (let p = el; p && p !== slide.parentElement; p = p.parentElement) {
      const s = getComputedStyle(p);
      if (s.visibility === 'hidden' || s.display === 'none' || parseFloat(s.opacity) < 0.05) { hidden = true; break; }
    }
    if (hidden) continue;
    const range = document.createRange();
    range.selectNodeContents(el);
    const r = range.getBoundingClientRect();
    if (!r.width) continue;
    out.count += 1;
    const fs = Math.round(parseFloat(getComputedStyle(el).fontSize) / unit);
    out.sizes[fs] = (out.sizes[fs] || 0) + 1;
    const pad = 2;
    if (r.left < stage.left - pad || r.right > stage.right + pad || r.top < stage.top - pad || r.bottom > stage.bottom + pad) {
      out.off.push({ text: text.slice(0, 40), box: [Math.round((r.left - stage.left) / unit), Math.round((r.top - stage.top) / unit), Math.round((r.right - stage.left) / unit), Math.round((r.bottom - stage.top) / unit)], wheel: !!el.closest('.option-wheel') });
    }
  }
  // boxes whose own content is wider than they are
  out.clipped = [...slide.querySelectorAll('*')].filter(e => !e.closest('svg, .option-wheel, .counter, .magnet-lines') && e.scrollWidth > e.clientWidth + 2 && getComputedStyle(e).overflowX !== 'visible').map(e => e.className).slice(0, 8);
  // the shell: slide inside the window, nothing to scroll, touch controls beside the slide
  out.shell = [];
  const W = window.innerWidth, H = window.innerHeight;
  if (stage.left < -1 || stage.top < -1 || stage.right > W + 1 || stage.bottom > H + 1) out.shell.push('slide is cut by the window');
  const root = document.scrollingElement;
  if (root.scrollWidth > W + 1 || root.scrollHeight > H + 1) out.shell.push('page scrolls');
  if (matchMedia('(pointer: coarse)').matches) {
    const buttons = [...document.querySelectorAll('.hud button')].filter(b => b.getClientRects().length);
    if (buttons.length < 3) out.shell.push('touch controls missing');
    for (const b of buttons) {
      const r = b.getBoundingClientRect();
      if (r.left < stage.right - 1 && r.right > stage.left + 1 && r.top < stage.bottom - 1 && r.bottom > stage.top + 1) out.shell.push('control over the slide: ' + b.getAttribute('aria-label'));
      if (r.left < -1 || r.top < -1 || r.right > W + 1 || r.bottom > H + 1) out.shell.push('control outside the window: ' + b.getAttribute('aria-label'));
      if (Math.min(r.width, r.height) < 40) out.shell.push('control smaller than 40px: ' + b.getAttribute('aria-label'));
    }
  }
  return out;
})()
"""


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


async def main():
    socketserver.TCPServer.allow_reuse_address = True
    httpd = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=dist))
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    port = httpd.server_address[1]
    problems = 0
    async with async_playwright() as p:
        for engine in engines:
            args = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] if engine == 'chromium' else []
            browser = await getattr(p, engine).launch(args=args)
            for size in sizes:
                if isinstance(size, str):
                    profile = {k: v for k, v in p.devices[size].items() if k != 'default_browser_type'}
                    label = f'{engine} {size}'
                else:
                    profile = {'viewport': {'width': size[0], 'height': size[1]}}
                    label = f'{engine} {size[0]}x{size[1]}'
                for item in slides:
                    context = await browser.new_context(**profile)
                    page = await context.new_page()
                    errors = []
                    page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
                    page.on('pageerror', lambda e: errors.append('PAGEERROR ' + str(e)))
                    await page.goto(f"http://127.0.0.1:{port}/index.html#{item['hash']}")
                    await page.evaluate('document.fonts.ready')
                    await page.wait_for_timeout(item.get('wait', 2600))
                    for step in range(item.get('steps', 0) + 1):
                        if step:
                            await page.keyboard.press('ArrowRight')
                            await page.wait_for_timeout(item.get('stepWait', 2200))
                        res = await page.evaluate(PROBE)
                        real_off = [o for o in res.get('off', []) if not o.get('wheel')]
                        wheel_off = [o for o in res.get('off', []) if o.get('wheel')]
                        sizes_seen = sorted(int(k) for k in res.get('sizes', {}))
                        shell = res.get('shell', [res.get('error')])
                        bad = real_off or res.get('clipped') or shell or (errors and step == item.get('steps', 0))
                        if bad:
                            problems += 1
                        print(f"{'BAD' if bad else 'OK '} {label} {item['hash']} step {step}: texts {res.get('count')}, type sizes {sizes_seen}, off {len(real_off)}, wheel-off {len(wheel_off)}, clipped {res.get('clipped')}, shell {shell}", flush=True)
                        for o in real_off[:6]:
                            print('     off:', json.dumps(o, ensure_ascii=False))
                    for e in errors[:5]:
                        print('     console error:', e[:300])
                    await context.close()
            await browser.close()
    httpd.shutdown()
    print('problems:', problems)


asyncio.run(main())
