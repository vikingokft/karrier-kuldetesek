#!/usr/bin/env node
// notion-lookup.mjs — Fegyvertár Kurzusok DB-ből kitölti a hossz mezőket a JSON-ba
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { Client } from '@notionhq/client';
import dotenv from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// A token a ~/Claude/codeberry/.env-ben van (globális szabály szerint)
const CODEBERRY_ENV = resolve(process.env.HOME || '~', 'Claude/codeberry/.env');
if (existsSync(CODEBERRY_ENV)) {
  dotenv.config({ path: CODEBERRY_ENV });
}

const DB_ID = '74e9aea7530046da826bc501c07cdc9a';

function normalizeString(s) {
  if (!s) return '';
  return String(s).toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // ékezetek eltávolítása
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getPlainText(prop) {
  if (!prop) return '';
  if (prop.type === 'title') return (prop.title || []).map(t => t.plain_text).join('');
  if (prop.type === 'rich_text') return (prop.rich_text || []).map(t => t.plain_text).join('');
  return '';
}

function getNumber(prop) {
  if (!prop || prop.type !== 'number') return null;
  return prop.number;
}

async function fetchAllCourses(notion) {
  const results = [];
  let cursor = undefined;
  do {
    const res = await notion.databases.query({
      database_id: DB_ID,
      start_cursor: cursor,
      page_size: 100
    });
    results.push(...res.results);
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
  return results;
}

function buildIndex(pages) {
  // Key: normalized name → { id, name, hossz }
  const byName = new Map();
  const byId = new Map();
  for (const page of pages) {
    const props = page.properties || {};
    const name = getPlainText(props['Name']) || getPlainText(props['Cím']) || '';
    const hossz = getNumber(props['Hossz (óra)']);
    const entry = { id: page.id, name, hossz };
    byId.set(page.id.replace(/-/g, ''), entry);
    if (name) byName.set(normalizeString(name), entry);
  }
  return { byName, byId };
}

function findMatch(kurzus, index) {
  if (kurzus.notionId) {
    const id = kurzus.notionId.replace(/-/g, '');
    const hit = index.byId.get(id);
    if (hit) return hit;
  }
  const key = normalizeString(kurzus.cim);
  if (index.byName.has(key)) return index.byName.get(key);
  // fuzzy: contains
  for (const [k, v] of index.byName.entries()) {
    if (k.includes(key) || key.includes(k)) return v;
  }
  return null;
}

export async function lookup(slug) {
  if (!process.env.NOTION_TOKEN) {
    throw new Error('NOTION_TOKEN nincs beállítva. Ellenőrizd: ~/Claude/codeberry/.env');
  }
  const jsonPath = join(ROOT, 'kuldetesek', `${slug}.json`);
  const kuldetes = JSON.parse(await readFile(jsonPath, 'utf8'));

  const notion = new Client({ auth: process.env.NOTION_TOKEN });
  console.log(`Notion kurzusok lekérése (DB ${DB_ID})...`);
  const pages = await fetchAllCourses(notion);
  console.log(`  ${pages.length} kurzus betöltve`);
  const index = buildIndex(pages);

  let updated = 0;
  for (const kurzus of kuldetes.kurzusok) {
    if (kurzus.hossz != null) {
      console.log(`  ✓ "${kurzus.cim}" → ${kurzus.hossz} óra (cache)`);
      continue;
    }
    const match = findMatch(kurzus, index);
    if (match && match.hossz != null) {
      kurzus.hossz = match.hossz;
      if (!kurzus.notionId) kurzus.notionId = match.id;
      console.log(`  ✓ "${kurzus.cim}" → ${match.hossz} óra (Notion: ${match.name})`);
      updated++;
    } else {
      console.log(`  ✗ "${kurzus.cim}" — nem található a Notion DB-ben`);
    }
  }

  await writeFile(jsonPath, JSON.stringify(kuldetes, null, 2) + '\n', 'utf8');
  console.log(`Frissítve: ${updated} kurzus. Fájl: ${jsonPath}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const slug = process.argv[2];
  if (!slug) {
    console.error('Használat: node scripts/notion-lookup.mjs <slug>');
    process.exit(1);
  }
  try {
    await lookup(slug);
  } catch (err) {
    console.error('Hiba:', err.message);
    process.exit(1);
  }
}
