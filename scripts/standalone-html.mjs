// Rewrites the built index.html so it opens by double-click (file://).
// Chromium blocks module scripts and CORS-tagged assets from file:// URLs, so:
//  - <script type="module" crossorigin src=...> becomes a classic <script defer src=...>
//  - crossorigin attributes are removed from stylesheets and scripts
//  - modulepreload links are dropped
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = process.argv[2] ?? 'dist-standalone';
const file = join(dir, 'index.html');
let html = readFileSync(file, 'utf8');

html = html.replace(/<link rel="modulepreload"[^>]*>\s*/g, '');
html = html.replace(/<script type="module" crossorigin src="([^"]+)"><\/script>/g, '<script defer src="$1"></script>');
html = html.replace(/<script type="module" src="([^"]+)"><\/script>/g, '<script defer src="$1"></script>');
html = html.replace(/ crossorigin(?=[ >])/g, '');

if (/type="module"/.test(html)) {
  throw new Error('standalone-html: a module script is still present in ' + file);
}
writeFileSync(file, html);
console.log('standalone index.html ready:', file);
