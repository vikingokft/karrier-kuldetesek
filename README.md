# Karrierküldetések

Notion-vezérelt, GitHub Pages-en hostolt, WordPress-be live beágyazható **karrierküldetés generátor** a Fegyvertárhoz.

```
Notion DB ──(naponta)──▶ GitHub Action ──▶ kuldetesek/*.json ──▶ build (HTML+PNG) ──▶ GitHub Pages ──▶ WP fetch+inject
```

A küldetéseket Notion-ben szerkeszted, naponta egyszer (vagy manuálisan triggerelve) lefut a sync, lebuildelődik az összes HTML/PNG, és deploy-olódik a GitHub Pages-re. A WordPress oldalon egy egyszer beillesztett `<div>+<script>` blokk fetch-eli a friss verziót, így minden módosítás automatikusan megjelenik.

## Mit tud

- **Két dizájn téma**: `regi` (jelenlegi Fegyvertár arculat) és `uj` (Vikingo Design System) — küldetésenként választható.
- **Kész / Hamarosan állapot**: minden kurzushoz `kesz` jelölés — a nem készek elhalványítva, "Hamarosan" badge-dzsel, nem kattinthatók.
- **Snake layout + SVG nyilak**: reszponzív (desktop 3, tablet 2, mobil 1 oszlop), a nyilak automatikusan újrarajzolódnak.
- **PNG export**: Playwright headless Chromium 2x DPR — Circle.so-ra feltölthető kép.
- **Notion sync**: Karrierküldetések DB-ből húzza a meta + page-ben lévő tábla blokkból a kurzus listát.
- **Live embed**: WP Custom HTML blokkba beillesztett `<div>+<script>` fetch+injectel a GitHub Pages-ről.

---

## 1. Notion setup (egyszer)

### a) Hozz létre egy Notion integrationt

1. Menj a https://www.notion.so/profile/integrations oldalra
2. **+ New integration** → név pl. "Karrierküldetések", workspace = wpviking, capabilities = Read content
3. Másold ki a **Internal Integration Secret** tokent → ez lesz a `NOTION_TOKEN`

### b) Hozz létre egy Karrierküldetések adatbázist

Új Notion adatbázis (pl. inline a Fegyvertár workspace-en), a következő property-kkel:

| Property | Típus | Megjegyzés |
|---|---|---|
| `Name` | Title | A küldetés címe (pl. "Digitális tartalomkészítő") |
| `Slug` | Text | URL-barát azonosító, pl. `digitalis-tartalomkeszito` |
| `Leírás` | Text | Opcionális leírás a fejléchez |
| `Téma` | Select | Két opció: `regi` és `uj` |
| `Végcél ikon` | Text | Egy emoji, pl. 🎯 |
| `Végcél cím` | Text | Opcionális, ha eltér a `Name`-től |
| `Publikált` | Checkbox | Csak a bepipáltak buildelődnek |

### c) A küldetés Notion oldal body-ban: kurzus tábla

Minden DB sor (= küldetés) page body-jában tegyél egy **Notion táblát** ezekkel az oszlopokkal:

| Sorrend | Ikon | Cím | URL | Kész | Hossz |
|---|---|---|---|---|---|
| 1 | 🚀 | Milyen vállalkozást indíts | https://fegyvertar.wpkurzus.hu/courses/milyen-vallalkozast-indits/ | ✓ | 3 |
| 2 | 📣 | Ügyfélszerző marketing rendszer | https://fegyvertar.wpkurzus.hu/courses/... | ✓ | 5 |
| 3 | 🎞️ | Videóvágás 2 | | | |

- A **sorrend** a táblán belüli sorok sorrendje (a Sorrend oszlop csak vizuális, drag&drop a sorokkal)
- A **Kész** oszlopba `✓`, `igen`, `kész` vagy `x` — bármi más / üres = `false` (Hamarosan)
- A **Hossz** oszlop opcionális; ha üres, nem jelenik meg a kártyán
- Az első sor lehet header — a script automatikusan felismeri

### d) Oszd meg a DB-t az integrationnel

Notion DB tetejének jobb felsejében: `•••` → `Connections` → válaszd ki a "Karrierküldetések" integrationt.

### e) Másold ki a DB ID-t

A DB URL-je: `https://www.notion.so/wpviking/<32 karakter>?v=...` — a 32 karakteres rész a `KARRIER_DB_ID`.

---

## 2. GitHub setup (egyszer)

### a) Push a repo-t GitHub-ra

```bash
git remote add origin git@github.com:vikingokft/karrier-kuldetesek.git
git push -u origin main
```

### b) Add hozzá a secrets-eket

Repo → Settings → Secrets and variables → Actions → New repository secret:

- `NOTION_TOKEN` — az 1.a-ban kapott Internal Integration Secret
- `KARRIER_DB_ID` — az 1.e-ben kimásolt DB ID

### c) Engedélyezd a GitHub Pages-t

Repo → Settings → Pages → **Source: GitHub Actions** (nem branch).

### d) Engedélyezd az Action commit jogát

Repo → Settings → Actions → General → **Workflow permissions: Read and write permissions**.

### e) Indítsd el manuálisan az első sync-et

Repo → Actions → "Notion sync, build & deploy" → **Run workflow**.

Pár perc múlva a Pages URL elérhető: `https://vikingokft.github.io/karrier-kuldetesek/`

---

## 3. WordPress beágyazás

A wpkurzus.hu adott oldalán szúrj be egy **Custom HTML** blokkot ezzel a tartalommal:

```html
<div data-kk-slug="digitalis-tartalomkeszito"></div>
<script src="https://vikingokft.github.io/karrier-kuldetesek/embed.js"></script>
```

A `data-kk-slug` értéke megegyezik a Notion DB `Slug` mezőjével. Egy oldalon akár több küldetés is lehet — csak több `<div>` kell, a `<script>` egyszer elég.

A script:

- a saját URL-jéből származtatja a BASE-t (nincs config)
- fetch-eli `embed.js` mellől a `<slug>-snippet.html`-t
- beinjektálja a `<div>`-be (style + DOM + futtatott JS)

Minden Notion-módosítás után a napi cron lefut, deploy-ol, és a következő oldalbetöltéskor a friss verzió jelenik meg. Cache-mentes fetch, így nincs stale tartalom.

---

## Lokális fejlesztés

```bash
pnpm install
pnpm exec playwright install chromium

# Notion sync (helyi: ~/Claude/codeberry/.env vagy .env.local-ból olvas)
echo "KARRIER_DB_ID=..." > .env.local   # csak ha nem akarod a default-ot
node scripts/notion-sync.mjs

# Build minden küldetést (HTML + snippet + PNG + index)
node scripts/build.mjs --all

# Csak egyet
node scripts/build.mjs digitalis-tartalomkeszito

# Külön rénder vagy screenshot
node scripts/render.mjs <slug>
node scripts/screenshot.mjs <slug>
```

A `dist/` mappát egy lokális statikus szerver kiszolgálhatja teszthez:

```bash
cd dist && python3 -m http.server 8765
# → http://localhost:8765/digitalis-tartalomkeszito.html
```

---

## Könyvtár struktúra

```
karrier-kuldetesek/
├── kuldetesek/<slug>.json        # generált (Notion sync), commit-olt
├── template/
│   ├── index.hbs                 # közös Handlebars sablon
│   └── embed.js                  # WP fetch+inject loader
├── temak/
│   ├── regi/styles.css           # régi Fegyvertár arculat
│   └── uj/styles.css             # Vikingo Design System
├── scripts/
│   ├── notion-sync.mjs           # Notion DB → kuldetesek/*.json
│   ├── render.mjs                # JSON → HTML + snippet
│   ├── notion-lookup.mjs         # opcionális hossz frissítés a Kurzusok DB-ből
│   ├── screenshot.mjs            # Playwright PNG export
│   └── build.mjs                 # render + screenshot + dist assetek
├── dist/                         # GitHub Pages root (generált, .gitignore-olt)
│   ├── index.html                # listázó oldal
│   ├── embed.js                  # WP loader
│   ├── <slug>.html               # standalone HTML
│   ├── <slug>-snippet.html       # WP-be inject-elendő (fetch target)
│   └── <slug>.png                # Circle.so kép export
└── .github/workflows/
    └── sync-and-deploy.yml       # napi cron + manual + push trigger
```

---

## Témák

| Téma | Mikor használd |
|---|---|
| `regi` | A jelenlegi wpkurzus.hu/fegyvertar arculathoz — arculatváltás előtt, élő termék. |
| `uj` | Vikingo Design System — arculatváltás után, vagy preview anyagokhoz. |

Notionben csak átállítod a `Téma` mezőt, a következő sync után a renderelt HTML és PNG az új téma szerint generálódik. A WP oldalon nincs teendő — a fetch ugyanúgy működik.
