#!/usr/bin/env node
// notion-sync.mjs — Karrierküldetések Notion DB → kuldetesek/*.json
//
// Séma (lásd README):
//   Karrierküldetések DB properties:
//     Name (title)       — küldetés címe
//     Slug (rich_text)   — pl. "digitalis-tartalomkeszito"
//     Leírás (rich_text)
//     Téma (select)      — "regi" vagy "uj"
//     Végcél ikon (rich_text) — emoji
//     Végcél cím (rich_text, opcionális)
//     Publikált (checkbox)
//
//   Page body: egy Notion tábla blokk ezekkel az oszlopokkal:
//     Sorrend | Ikon | Cím | URL | Kész | Hossz
//
// Környezeti változók:
//   NOTION_TOKEN      — Notion integration token
//   KARRIER_DB_ID     — a Karrierküldetések DB ID-ja

import { Client } from '@notionhq/client';
import { writeFile, mkdir } from 'node:fs/promises';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import dotenv from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// Helyi futtatáskor a ~/Claude/codeberry/.env-et töltjük be
const CB_ENV = resolve(process.env.HOME || '~', 'Claude/codeberry/.env');
if (existsSync(CB_ENV)) dotenv.config({ path: CB_ENV });

// Helyi .env.local felülírhatja
const LOCAL_ENV = resolve(ROOT, '.env.local');
if (existsSync(LOCAL_ENV)) dotenv.config({ path: LOCAL_ENV, override: true });

const { NOTION_TOKEN, KARRIER_DB_ID } = process.env;

if (!NOTION_TOKEN) {
  console.error('Hiba: NOTION_TOKEN nincs beállítva.');
  process.exit(1);
}
if (!KARRIER_DB_ID) {
  console.error('Hiba: KARRIER_DB_ID nincs beállítva (a Karrierküldetések Notion DB ID-ja).');
  console.error('Lokálisan: tedd a karrier-kuldetesek/.env.local-ba: KARRIER_DB_ID=...');
  process.exit(1);
}

const notion = new Client({ auth: NOTION_TOKEN });

// ─── Helpers ─────────────────────────────────────────────────────────────────

function richText(prop) {
  if (!prop) return '';
  if (prop.type === 'title') return (prop.title || []).map(t => t.plain_text).join('');
  if (prop.type === 'rich_text') return (prop.rich_text || []).map(t => t.plain_text).join('');
  return '';
}
function selectName(prop) { return prop?.select?.name || null; }
function checkboxVal(prop) { return !!prop?.checkbox; }
function urlVal(prop) { return prop?.url || null; }

async function fetchAllPages(dbId) {
  const out = [];
  let cursor;
  do {
    const r = await notion.databases.query({ database_id: dbId, start_cursor: cursor, page_size: 100 });
    out.push(...r.results);
    cursor = r.has_more ? r.next_cursor : undefined;
  } while (cursor);
  return out;
}

async function fetchAllBlocks(blockId) {
  const out = [];
  let cursor;
  do {
    const r = await notion.blocks.children.list({ block_id: blockId, start_cursor: cursor, page_size: 100 });
    out.push(...r.results);
    cursor = r.has_more ? r.next_cursor : undefined;
  } while (cursor);
  return out;
}

async function findPageTable(pageId) {
  const children = await fetchAllBlocks(pageId);
  const table = children.find(b => b.type === 'table');
  if (!table) return null;
  const rowBlocks = await fetchAllBlocks(table.id);
  const rows = rowBlocks
    .filter(b => b.type === 'table_row')
    .map(b => b.table_row.cells.map(cell => cell.map(t => t.plain_text).join('').trim()));
  return { hasHeader: !!table.table.has_column_header, rows };
}

function normalizeHeader(s) {
  return String(s || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

function findColIdx(header, names) {
  const normalized = header.map(normalizeHeader);
  for (const n of names) {
    const i = normalized.indexOf(n);
    if (i !== -1) return i;
  }
  return -1;
}

function parseKesz(s) {
  if (!s) return false;
  const v = String(s).toLowerCase().trim();
  return ['igen', 'yes', 'kesz', 'kész', '✓', 'x', '✅', 'true', '1', 'y'].includes(v);
}

function parseHossz(s) {
  if (!s) return null;
  const n = Number(String(s).replace(',', '.').replace(/[^\d.]/g, ''));
  return Number.isFinite(n) && n > 0 ? n : null;
}

// ─── Sync logika ─────────────────────────────────────────────────────────────

async function syncKuldetes(page) {
  const props = page.properties;
  if (!checkboxVal(props['Publikált'])) return null;

  const cim = richText(props['Name']) || richText(props['Cím']);
  const slug = richText(props['Slug']).trim();
  if (!slug) {
    console.warn(`  [skip] Nincs Slug: "${cim}"`);
    return null;
  }
  const leiras = richText(props['Leírás']);
  const tema = (selectName(props['Téma']) || 'regi').toLowerCase();
  if (!['regi', 'uj'].includes(tema)) {
    console.warn(`  [skip] Érvénytelen téma "${tema}" a "${cim}" küldetésnél`);
    return null;
  }
  const vegcelIkon = richText(props['Végcél ikon']) || '🎯';
  const vegcelCim = richText(props['Végcél cím']) || cim;

  const table = await findPageTable(page.id);
  if (!table || !table.rows.length) {
    console.warn(`  [skip] Nincs tábla a page-ben: "${cim}"`);
    return null;
  }

  const header = table.hasHeader ? table.rows[0] : ['sorrend', 'ikon', 'cím', 'url', 'kész', 'hossz'];
  const dataRows = table.hasHeader ? table.rows.slice(1) : table.rows;

  const iIkon = findColIdx(header, ['ikon', 'icon']);
  const iCim = findColIdx(header, ['cim', 'name', 'title', 'kurzus']);
  const iUrl = findColIdx(header, ['url', 'link']);
  const iKesz = findColIdx(header, ['kesz', 'done', 'keszvan']);
  const iHossz = findColIdx(header, ['hossz', 'ora', 'hour', 'length']);

  const kurzusok = dataRows
    .filter(r => r.some(c => c && c.trim()))
    .map(r => ({
      cim: iCim >= 0 ? (r[iCim] || '').trim() : '',
      ikon: iIkon >= 0 ? (r[iIkon] || '').trim() : '',
      url: iUrl >= 0 && r[iUrl] ? r[iUrl].trim() : null,
      notionId: null,
      hossz: iHossz >= 0 ? parseHossz(r[iHossz]) : null,
      kesz: iKesz >= 0 ? parseKesz(r[iKesz]) : true
    }))
    .filter(k => k.cim);

  if (!kurzusok.length) {
    console.warn(`  [skip] Üres kurzus lista: "${cim}"`);
    return null;
  }

  const kuldetes = {
    slug,
    cim,
    leiras,
    tema,
    vegcel: { cim: vegcelCim, ikon: vegcelIkon },
    kurzusok
  };

  await mkdir(join(ROOT, 'kuldetesek'), { recursive: true });
  const outPath = join(ROOT, 'kuldetesek', `${slug}.json`);
  await writeFile(outPath, JSON.stringify(kuldetes, null, 2) + '\n', 'utf8');
  console.log(`  ✓ ${slug} (${kurzusok.length} kurzus, téma: ${tema})`);
  return slug;
}

// ─── Main ────────────────────────────────────────────────────────────────────

console.log(`Notion sync — DB: ${KARRIER_DB_ID}`);
const pages = await fetchAllPages(KARRIER_DB_ID);
console.log(`  ${pages.length} Notion oldal betöltve`);
let synced = 0;
for (const p of pages) {
  try {
    const r = await syncKuldetes(p);
    if (r) synced++;
  } catch (err) {
    console.error(`  ✗ Hiba egy oldalon: ${err.message}`);
  }
}
console.log(`Kész: ${synced} küldetés szinkronizálva.`);
