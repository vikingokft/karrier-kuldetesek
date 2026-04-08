#!/usr/bin/env node
// screenshot.mjs — headless Chromium PNG export a renderelt HTML-ből
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { existsSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

export async function screenshot(slug, { width = 1400, deviceScaleFactor = 2 } = {}) {
  const htmlPath = join(ROOT, 'dist', `${slug}.html`);
  if (!existsSync(htmlPath)) {
    throw new Error(`Nincs renderelt HTML: ${htmlPath}. Futtasd előbb: node scripts/render.mjs ${slug}`);
  }
  const pngPath = join(ROOT, 'dist', `${slug}.png`);

  const browser = await chromium.launch();
  try {
    const ctx = await browser.newContext({
      viewport: { width, height: 900 },
      deviceScaleFactor
    });
    const page = await ctx.newPage();
    await page.goto('file://' + htmlPath);
    // Várunk, amíg a snake-sorrend és a nyilak kirajzolódnak
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(700);
    // A .kk-root elemről screenshot, hogy ne legyen felesleges margó
    const root = page.locator('.kk-root').first();
    await root.screenshot({ path: pngPath });
    return pngPath;
  } finally {
    await browser.close();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const slug = process.argv[2];
  if (!slug) {
    console.error('Használat: node scripts/screenshot.mjs <slug>');
    process.exit(1);
  }
  try {
    const path = await screenshot(slug);
    console.log(`✓ Screenshot: ${path}`);
  } catch (err) {
    console.error('Hiba:', err.message);
    process.exit(1);
  }
}
