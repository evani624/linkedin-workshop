"""Compare what each slide shows (over all its steps) with reference/slides_on_screen.md.
usage: fidelity.py <dist dir> <slides_on_screen.md> <steps json | file: {"1":0,"2":1,...}>
"missing" lists words of the reference that never appear on the slide; "extra" lists words on the slide
that are not in the reference (some are expected: see README.md)."""
import sys, json, re, asyncio, threading, functools, http.server, socketserver, os
from playwright.async_api import async_playwright

dist, doc = os.path.abspath(sys.argv[1]), sys.argv[2]
steps = json.load(open(sys.argv[3], encoding='utf-8')) if os.path.exists(sys.argv[3]) else json.loads(sys.argv[3])
text = open(doc, encoding='utf-8').read()

def tokens(s):
    s = re.sub(r'[ً-ْـ]', '', s)            # tashkeel, tatweel
    s = re.sub(r'[^\w؀-ۿ]+', ' ', s, flags=re.U)  # punctuation
    return [t for t in s.split() if t]

wanted = {}
for m in re.finditer(r'## شريحة (\d+): (.+?)\n(.*?)(?=\n## شريحة |\Z)', text, flags=re.S):
    n, title, body = int(m.group(1)), m.group(2), m.group(3)
    wanted[n] = (title, body)

class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass

async def main():
    socketserver.TCPServer.allow_reuse_address = True
    httpd = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=dist))
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    port = httpd.server_address[1]
    async with async_playwright() as p:
        b = await p.chromium.launch()
        errors = []
        for n in sorted(wanted):
            page = await b.new_page(viewport={'width': 1280, 'height': 720})
            page.on('console', lambda m: errors.append(f's{n}: {m.text}') if m.type == 'error' else None)
            page.on('pageerror', lambda e: errors.append(f's{n}: PAGEERROR {e}'))
            await page.goto(f'http://127.0.0.1:{port}/index.html#s{n}')
            await page.evaluate('document.fonts.ready')
            await page.wait_for_timeout(1200)
            seen = []
            for k in range(steps.get(str(n), 0) + 1):
                if k:
                    await page.keyboard.press('ArrowRight')
                    await page.wait_for_timeout(700)
                seen.append(await page.evaluate("""() => {
                  const s = document.querySelector('.slide');
                  const aria = [...s.querySelectorAll('[aria-label]')].filter(e => e.closest('h1,[role=group]')).map(e => e.getAttribute('aria-label')).join(' ');
                  return s.innerText + ' ' + aria;
                }"""))
            shown = set(tokens(' '.join(seen)))
            title, body = wanted[n]
            need = tokens(body)
            allowed = set(need) | set(tokens(title))
            missing = [t for t in need if t not in shown]
            extra = sorted(t for t in shown if t not in allowed and not t.isdigit())
            print(f"{n:>2} {'OK ' if not missing else 'MISS'} missing={missing} extra={extra}")
            await page.close()
        await b.close()
        print('console errors:', errors[:10])
    httpd.shutdown()

asyncio.run(main())
