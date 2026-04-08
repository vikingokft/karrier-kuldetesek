#!/usr/bin/env node
// generate-local-json.mjs — a seed-data.mjs alapján létrehozza/felülírja a kuldetesek/*.json fájlokat.
// Egyszeri migráció: a meglévő (képernyőkép-alapú) digitalis-tartalomkeszito.json lecserélődik a friss Notion adattal.
import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SEED, kurzusKesz } from './seed-data.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

await mkdir(join(ROOT, 'kuldetesek'), { recursive: true });

for (const s of SEED) {
  const out = {
    slug: s.slug,
    cim: s.cim,
    leiras: s.leiras,
    tema: s.tema,
    vegcel: s.vegcel,
    kurzusok: s.kurzusok.map(k => ({
      cim: k.cim,
      ikon: k.ikon,
      url: k.url,
      notionId: null,
      hossz: null,
      kesz: kurzusKesz(k)
    }))
  };
  const path = join(ROOT, 'kuldetesek', `${s.slug}.json`);
  await writeFile(path, JSON.stringify(out, null, 2) + '\n', 'utf8');
  console.log(`✓ ${s.slug} (${out.kurzusok.length} kurzus, ${out.kurzusok.filter(k => k.kesz).length} kész)`);
}
console.log(`\n${SEED.length} küldetés JSON generálva.`);
