#!/usr/bin/env node
// render.mjs — JSON küldetés → HTML (standalone + snippet)
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import Handlebars from 'handlebars';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

Handlebars.registerHelper('kkNum', function(index) {
  return String(index + 1).padStart(2, '0');
});

async function loadTemplate() {
  const src = await readFile(join(ROOT, 'template/index.hbs'), 'utf8');
  return Handlebars.compile(src, { noEscape: false });
}

async function loadCss(tema) {
  const path = join(ROOT, 'temak', tema, 'styles.css');
  return readFile(path, 'utf8');
}

async function loadKuldetes(slug) {
  const path = join(ROOT, 'kuldetesek', `${slug}.json`);
  const raw = await readFile(path, 'utf8');
  return JSON.parse(raw);
}

function validateTema(tema) {
  if (!['regi', 'uj'].includes(tema)) {
    throw new Error(`Ismeretlen téma: "${tema}". Engedélyezett: regi, uj`);
  }
}

export async function render(slug) {
  const kuldetes = await loadKuldetes(slug);
  const tema = kuldetes.tema || 'regi';
  validateTema(tema);

  const css = await loadCss(tema);
  const template = await loadTemplate();

  const context = { ...kuldetes, tema, css, standalone: true };
  const fullHtml = template(context);

  // Snippet: ugyanaz, de <html>/<head>/<body> nélkül, csak a .kk-root blokk + <style> + <script>
  const snippetContext = { ...kuldetes, tema, css, standalone: false };
  const snippetFull = template(snippetContext);
  // Kivágjuk a <body>...</body> közötti részt snippet-nek
  const bodyMatch = snippetFull.match(/<body>([\s\S]*?)<\/body>/);
  const bodyContent = bodyMatch ? bodyMatch[1].trim() : snippetFull;
  // A <style> blokkot a <head>-ből is beemeljük a snippet elejére
  const styleMatches = [...snippetFull.matchAll(/<style>([\s\S]*?)<\/style>/g)];
  const snippetStyle = styleMatches.map(m => `<style>${m[1]}</style>`).join('\n');
  const snippet = `${snippetStyle}\n${bodyContent}`;

  await mkdir(join(ROOT, 'dist'), { recursive: true });
  const htmlPath = join(ROOT, 'dist', `${slug}.html`);
  const snippetPath = join(ROOT, 'dist', `${slug}-snippet.html`);
  await writeFile(htmlPath, fullHtml, 'utf8');
  await writeFile(snippetPath, snippet, 'utf8');

  return { htmlPath, snippetPath, tema };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const slug = process.argv[2];
  if (!slug) {
    console.error('Használat: node scripts/render.mjs <slug>');
    process.exit(1);
  }
  try {
    const result = await render(slug);
    console.log(`✓ Renderelve (${result.tema}):`);
    console.log(`  - ${result.htmlPath}`);
    console.log(`  - ${result.snippetPath}`);
  } catch (err) {
    console.error('Hiba:', err.message);
    process.exit(1);
  }
}
