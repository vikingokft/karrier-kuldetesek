#!/usr/bin/env node
// notion-seed.mjs — egyszeri migráció: a seed-data.mjs alapján létrehozza a Karrierküldetések
// Notion DB sorait, properties-szel + page body-ban egy Notion táblával a kurzus listáról.
//
// Használat:
//   KARRIER_DB_ID=<db-id> node scripts/notion-seed.mjs
//   node scripts/notion-seed.mjs --dry-run     # csak logol, nem ír
//
// A script IDEMPOTENS: ha már létezik DB entry a megadott Slug-gal, nem hozza létre újra.

import { Client } from '@notionhq/client';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { existsSync } from 'node:fs';
import dotenv from 'dotenv';
import { SEED, kurzusKesz } from './seed-data.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const CB_ENV = resolve(process.env.HOME || '~', 'Claude/codeberry/.env');
if (existsSync(CB_ENV)) dotenv.config({ path: CB_ENV });
const LOCAL_ENV = resolve(ROOT, '.env.local');
if (existsSync(LOCAL_ENV)) dotenv.config({ path: LOCAL_ENV, override: true });

const { NOTION_TOKEN, KARRIER_DB_ID } = process.env;
const DRY = process.argv.includes('--dry-run');

if (!NOTION_TOKEN) {
  console.error('Hiba: NOTION_TOKEN hiányzik (~/Claude/codeberry/.env vagy .env.local).');
  process.exit(1);
}
if (!KARRIER_DB_ID) {
  console.error('Hiba: KARRIER_DB_ID hiányzik. Tedd a .env.local-ba vagy add át env-ben.');
  process.exit(1);
}

const notion = new Client({ auth: NOTION_TOKEN });

// ─── Segédfüggvények ────────────────────────────────────────────────────────

function rt(text) {
  if (!text) return [];
  return [{ type: 'text', text: { content: text } }];
}

function tableRowBlock(cells) {
  return {
    type: 'table_row',
    table_row: {
      cells: cells.map(c => [{ type: 'text', text: { content: c || '' } }])
    }
  };
}

function buildCourseTable(kurzusok) {
  const header = ['Sorrend', 'Ikon', 'Cím', 'URL', 'Kész', 'Hossz'];
  const rows = [
    tableRowBlock(header),
    ...kurzusok.map((k, i) => tableRowBlock([
      String(i + 1),
      k.ikon || '',
      k.cim || '',
      k.url || '',
      kurzusKesz(k) ? '✓' : '',
      ''
    ]))
  ];
  return {
    type: 'table',
    table: {
      table_width: header.length,
      has_column_header: true,
      has_row_header: false,
      children: rows
    }
  };
}

function buildPageContent(k) {
  return [
    {
      type: 'heading_3',
      heading_3: { rich_text: rt('A Karrier Küldetés kurzusai') }
    },
    buildCourseTable(k.kurzusok),
    {
      type: 'paragraph',
      paragraph: { rich_text: rt('A tábla a sorok sorrendje szerinti kurzus listát tartalmazza. A Notion sync script ez alapján generálja a WP-be beágyazott karrierküldetést.') }
    }
  ];
}

function buildProperties(k) {
  return {
    'Name': { title: rt(k.cim) },
    'Slug': { rich_text: rt(k.slug) },
    'Leírás': { rich_text: rt(k.leiras) },
    'Téma': { select: { name: k.tema } },
    'Végcél ikon': { rich_text: rt(k.vegcel.ikon) },
    'Végcél cím': { rich_text: rt(k.vegcel.cim) },
    'Publikált': { checkbox: true },
    'Sorrend': { number: k.sorrend }
  };
}

// ─── Létező entry check ─────────────────────────────────────────────────────

async function findBySlug(dbId, slug) {
  const r = await notion.databases.query({
    database_id: dbId,
    filter: { property: 'Slug', rich_text: { equals: slug } },
    page_size: 1
  });
  return r.results[0] || null;
}

// ─── Main ───────────────────────────────────────────────────────────────────

console.log(`Notion seed — DB: ${KARRIER_DB_ID}${DRY ? ' (DRY RUN)' : ''}`);
let created = 0, skipped = 0, errored = 0;

for (const k of SEED) {
  try {
    const existing = await findBySlug(KARRIER_DB_ID, k.slug);
    if (existing) {
      console.log(`  [skip] ${k.slug} — már létezik (${existing.id})`);
      skipped++;
      continue;
    }
    if (DRY) {
      console.log(`  [dry] ${k.slug} — ${k.kurzusok.length} kurzus, téma: ${k.tema}`);
      continue;
    }
    const page = await notion.pages.create({
      parent: { database_id: KARRIER_DB_ID },
      properties: buildProperties(k),
      children: buildPageContent(k)
    });
    console.log(`  ✓ ${k.slug} létrehozva: ${page.id}`);
    created++;
  } catch (err) {
    console.error(`  ✗ ${k.slug}: ${err.message}`);
    errored++;
  }
}

console.log(`\nKész. Létrehozva: ${created}, kihagyva: ${skipped}, hiba: ${errored}`);
if (!DRY && created > 0) {
  console.log('\nKövetkező lépés: futtasd a Notion sync-et, hogy ellenőrizd a round-tripet:');
  console.log('  node scripts/notion-sync.mjs');
}
