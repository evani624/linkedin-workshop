"""Serve a built deck folder on a local port and take screenshots of chosen slides.

usage: deckshot.py <dist dir> <jobs.json | inline json>
job: {"hash": "d1-title", "out": "/path.png", "steps": 0, "wait": 2500, "w": 1920, "h": 1080,
      "scale": 1, "stepWait": 1800, "mouse": [x, y] | null, "each": false, "eval": "js" }
"""
import sys, json, asyncio, threading, functools, http.server, socketserver, os
from playwright.async_api import async_playwright

dist = os.path.abspath(sys.argv[1])
arg = sys.argv[2]
jobs = json.load(open(arg, encoding='utf-8')) if os.path.exists(arg) else json.loads(arg)


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def serve():
    handler = functools.partial(Quiet, directory=dist)
    socketserver.TCPServer.allow_reuse_address = True
    httpd = socketserver.ThreadingTCPServer(('127.0.0.1', 0), handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd


async def main():
    httpd = serve()
    port = httpd.server_address[1]
    async with async_playwright() as p:
        browser = await p.chromium.launch(args=[
            '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'
        ])
        for job in jobs:
            w, h = job.get('w', 1920), job.get('h', 1080)
            page = await browser.new_page(viewport={'width': w, 'height': h}, device_scale_factor=job.get('scale', 1))
            msgs = []
            page.on('console', lambda m: msgs.append(f'{m.type}: {m.text}') if m.type in ('error', 'warning') else None)
            page.on('pageerror', lambda e: msgs.append('PAGEERROR: ' + str(e)))
            await page.goto(f"http://127.0.0.1:{port}/index.html#{job.get('hash', '')}")
            await page.evaluate('document.fonts.ready')
            if job.get('mouse'):
                await page.mouse.move(*job['mouse'])
            await page.wait_for_timeout(job.get('wait', 2500))
            out = job['out']
            steps = job.get('steps', 0)
            if job.get('each') and steps:
                await page.screenshot(path=out.replace('.png', '-s0.png'))
            for i in range(steps):
                await page.keyboard.press('ArrowRight')
                await page.wait_for_timeout(job.get('stepWait', 1800))
                if job.get('each'):
                    await page.screenshot(path=out.replace('.png', f'-s{i + 1}.png'))
            if job.get('eval'):
                result = await page.evaluate(job['eval'])
                print('eval:', json.dumps(result, ensure_ascii=False)[:3000])
            if not (job.get('each') and steps):
                await page.screenshot(path=out)
            for m in msgs[:12]:
                print(f"[{job.get('hash')}]", m[:400])
            await page.close()
        await browser.close()
    httpd.shutdown()


asyncio.run(main())
