// Bundles the deck into dist/: index.html + app.js + app.css (+ fonts.css from tools/gen_fonts.mjs).
// CSS under src/ may use the stage unit `u`: 1u = 1/1920 of the slide's width, so a slide
// is laid out on a 1920x1080 grid and still renders at the screen's real pixel size.
import * as esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';

const root = path.dirname(new URL(import.meta.url).pathname);
const dist = path.join(root, 'dist');
fs.mkdirSync(dist, { recursive: true });

const stageUnits = {
  name: 'stage-units',
  setup(build) {
    build.onLoad({ filter: /\.css$/ }, async args => {
      let css = await fs.promises.readFile(args.path, 'utf8');
      const ours = args.path.includes(`${path.sep}src${path.sep}`) && !args.path.includes(`${path.sep}rb${path.sep}`);
      if (ours) css = css.replace(/(?<![\w#.-])(-?\d*\.?\d+)u(?![\w-])/g, 'calc($1 * var(--u))');
      return { contents: css, loader: 'css' };
    });
  }
};

const entry = process.argv.slice(2).find(arg => !arg.startsWith('--')) || 'src/main.jsx';
const result = await esbuild.build({
  entryPoints: [path.join(root, entry)],
  bundle: true,
  format: 'iife',
  target: ['chrome111', 'safari16.4', 'firefox113'],
  jsx: 'automatic',
  minify: !process.argv.includes('--dev'),
  sourcemap: false,
  legalComments: 'none',
  define: { 'process.env.NODE_ENV': '"production"' },
  outfile: path.join(dist, 'app.js'),
  plugins: [stageUnits],
  loader: { '.svg': 'text' },
  metafile: true,
  logLevel: 'warning'
});

fs.copyFileSync(path.join(root, 'src', 'index.html'), path.join(dist, 'index.html'));
for (const [file, info] of Object.entries(result.metafile.outputs)) {
  console.log(path.relative(root, file), (info.bytes / 1024).toFixed(0) + ' KB');
}
