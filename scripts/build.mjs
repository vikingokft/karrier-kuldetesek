#!/usr/bin/env node
// build.mjs — orchestrator: render + screenshot egy vagy minden küldetéshez
import { readdir, copyFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve, basename } from 'node:path';
import { render } from './render.mjs';
import { screenshot } from './screenshot.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

async function copyStaticAssets(slugs) {
  await mkdir(join(ROOT, 'dist'), { recursive: true });
  await copyFile(join(ROOT, 'template/embed.js'), join(ROOT, 'dist/embed.js'));
  // Egy kis index.html a Pages root-ra (debug + lista)
  const items = slugs.map(s =>
    `      <li><a href="${s}.html">${s}</a> &middot; <a href="${s}-snippet.html">snippet</a> &middot; <a href="${s}.png">PNG</a></li>`
  ).join('\n');
  const index = `<!DOCTYPE html>
<html lang="hu"><head><meta charset="UTF-8"><title>Karrierküldetések</title>
<style>body{font-family:system-ui,sans-serif;max-width:720px;margin:40px auto;padding:0 20px;color:#222}
h1{font-size:24px}code{background:#f4f4f4;padding:2px 6px;border-radius:4px;font-size:13px}
ul{line-height:1.8}a{color:#c34;text-decoration:none}a:hover{text-decoration:underline}</style></head><body>
<h1>Karrierküldetések</h1>
<p>WP beágyazás: <code>&lt;div data-kk-slug="<em>slug</em>"&gt;&lt;/div&gt;&lt;script src="./embed.js"&gt;&lt;/script&gt;</code></p>
<h2>Küldetések (${slugs.length})</h2>
<ul>
${items}
</ul></body></html>`;
  await writeFile(join(ROOT, 'dist', 'index.html'), index, 'utf8');
}

async function listSlugs() {
  const files = await readdir(join(ROOT, 'kuldetesek'));
  return files.filter(f => f.endsWith('.json')).map(f => basename(f, '.json'));
}

async function buildOne(slug) {
  console.log(`\n▶ ${slug}`);
  const r = await render(slug);
  console.log(`  ✓ HTML (${r.tema})`);
  const png = await screenshot(slug);
  console.log(`  ✓ PNG: ${png}`);
}

const args = process.argv.slice(2);
const all = args.includes('--all');
const slugs = all ? await listSlugs() : args.filter(a => !a.startsWith('--'));

if (slugs.length === 0) {
  console.error('Használat: node scripts/build.mjs <slug> [slug2 ...]');
  console.error('           node scripts/build.mjs --all');
  process.exit(1);
}

const built = [];
for (const slug of slugs) {
  try {
    await buildOne(slug);
    built.push(slug);
  } catch (err) {
    console.error(`  ✗ ${slug}: ${err.message}`);
  }
}
// Static assetek (embed.js + index.html) másolása a dist-be
const allSlugs = await listSlugs();
await copyStaticAssets(allSlugs);
console.log(`\n✓ Kész. ${built.length} k\u00fcldetés build-elve, ${allSlugs.length} listázva.`);
