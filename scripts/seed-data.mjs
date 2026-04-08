// seed-data.mjs — a 7 karrierküldetés migrációs adata, a Notion aloldalakról kinyerve.
// Ezt használja a seed script (notion-seed.mjs) és a JSON-generátor is.
//
// Adat alapú: https://www.notion.so/wpviking/Karrier-K-ldet-sek-1b9a63fa48d080708c85eb597bd7e09b
// Minden kurzus "kész" flag-je arra épül, van-e publikált sales oldal URL-je a Notionben.

const BASE = 'https://fegyvertar.wpkurzus.hu/c/';

// Rövidítés: url(slug) → full URL, null ha üres (nem kész)
const u = (slug) => slug ? `${BASE}${slug}/` : null;

export const SEED = [
  {
    sorrend: 1,
    slug: 'digitalis-tartalomkeszito',
    cim: 'Digitális tartalomkészítő',
    leiras: 'A tartalom az online jelenlét egyik legfontosabb építőköve. A Digitális tartalomkészítő Karrier Küldetés során megtanulhatod, hogyan hozz létre figyelemfelkeltő szöveges, képi vagy videós anyagokat. Akár márkaként, akár tartalomgyártóként építenél közösséget, ez a küldetés segít elindulni.',
    tema: 'regi',
    vegcel: { cim: 'Digitális tartalomkészítő', ikon: '🎯' },
    kurzusok: [
      { cim: 'Milyen vállalkozást indíts', ikon: '🚀', url: u('milyen-vallalkozast-indits') },
      { cim: 'Marketing rendszerek', ikon: '📣', url: u('marketing-rendszerek') },
      { cim: 'Piaci intelligencia', ikon: '🧠', url: u('piaci-intelligencia') },
      { cim: 'Szövegírás', ikon: '✍️', url: null },
      { cim: 'Közösségi média', ikon: '📱', url: null },
      { cim: 'Vizuális design', ikon: '🎨', url: u('vizualis-design') },
      { cim: 'Videózás', ikon: '🎥', url: u('videozas') },
      { cim: 'Videóvágás', ikon: '✂️', url: null },
      { cim: 'Fotózás alapjai', ikon: '📷', url: u('fotozas-alapjai') },
      { cim: 'Mobilfotózás', ikon: '📲', url: u('mobilfotozas') },
      { cim: 'Canva', ikon: '🖌️', url: u('canva') },
      { cim: 'AI', ikon: '🤖', url: null }
    ]
  },
  {
    sorrend: 2,
    slug: 'e-mail-marketing-manager',
    cim: 'E-mail Marketing Manager',
    leiras: 'Az e-mail továbbra is az egyik leghatékonyabb online kommunikációs és értékesítési csatorna. Az E-mail Marketing Manager pozícióra célzott Karrier Küldetésünk abban segít, hogy elsajátítsd az e-mail kampányok tervezését, automatizálását és optimalizálását. Alkalmazottként vagy szabadúszóként is sikeresen elindulhatsz ezen az úton.',
    tema: 'regi',
    vegcel: { cim: 'E-mail Marketing Manager', ikon: '📧' },
    kurzusok: [
      { cim: 'Milyen vállalkozást indíts', ikon: '🚀', url: u('milyen-vallalkozast-indits') },
      { cim: 'Marketing rendszerek', ikon: '📣', url: u('marketing-rendszerek') },
      { cim: 'Piaci intelligencia', ikon: '🧠', url: u('piaci-intelligencia') },
      { cim: 'Szövegírás', ikon: '✍️', url: null },
      { cim: 'E-mail marketing', ikon: '📧', url: null },
      { cim: 'Vizuális design', ikon: '🎨', url: u('vizualis-design') },
      { cim: 'AI', ikon: '🤖', url: null }
    ]
  },
  {
    sorrend: 3,
    slug: 'online-vallalkozo',
    cim: 'Online vállalkozó',
    leiras: 'A digitális térben elérhető lehetőségek új szintre emelik a vállalkozásindítást. Az Online vállalkozó Karrier Küldetés során megtanulod, hogyan marketingezd a vállalkozásod. Lehet ez online vagy tradicionális vállalkozás, az ügyfelek szerzése az egyik legfontosabb pillére a sikernek. Generalista szemlélettel érdemes hozzáállni a marketinghez, amihez átfogó ismereteket szerezhetsz a kurzusainkban.',
    tema: 'regi',
    vegcel: { cim: 'Online vállalkozó', ikon: '💼' },
    kurzusok: [
      { cim: 'Milyen vállalkozást indíts', ikon: '🚀', url: u('milyen-vallalkozast-indits') },
      { cim: 'Marketing rendszerek', ikon: '📣', url: u('marketing-rendszerek') },
      { cim: 'Piaci intelligencia', ikon: '🧠', url: u('piaci-intelligencia') },
      { cim: 'Szövegírás', ikon: '✍️', url: null },
      { cim: 'Hirdetések készítése', ikon: '📢', url: null },
      { cim: 'Meta hirdetések', ikon: '🅵', url: null },
      { cim: 'TikTok hirdetések', ikon: '🎵', url: null },
      { cim: 'E-mail marketing', ikon: '📧', url: null },
      { cim: 'Közösségi média', ikon: '📱', url: null },
      { cim: 'Google Ads', ikon: '🟢', url: null },
      { cim: 'Vizuális design', ikon: '🎨', url: u('vizualis-design') },
      { cim: 'Fotózás alapjai', ikon: '📷', url: u('fotozas-alapjai') },
      { cim: 'Mobilfotózás', ikon: '📲', url: u('mobilfotozas') },
      { cim: 'Videózás', ikon: '🎥', url: u('videozas') },
      { cim: 'Videóvágás', ikon: '✂️', url: null },
      { cim: 'Figma', ikon: '🎯', url: u('figma') },
      { cim: 'Webdesign', ikon: '🖥️', url: u('webdesign') },
      { cim: 'Canva', ikon: '🖌️', url: u('canva') },
      { cim: 'WordPress', ikon: '🌐', url: u('wordpress') },
      { cim: 'WooCommerce', ikon: '🛒', url: u('woocommerce') },
      { cim: 'AI', ikon: '🤖', url: null }
    ]
  },
  {
    sorrend: 4,
    slug: 'virtualis-asszisztens',
    cim: 'Virtuális asszisztens',
    leiras: 'A vállalkozók egyre több feladatot szerveznek ki, és megbízható online segítségre van szükségük. A Virtuális asszisztens Karrier Küldetés abban támogat, hogy te lehess ez a megbízható háttérember. Megtanítjuk azokat a skilleket, amelyekre építve egy sikeres karriert építhetsz fel.',
    tema: 'regi',
    vegcel: { cim: 'Virtuális asszisztens', ikon: '💁' },
    kurzusok: [
      { cim: 'Milyen vállalkozást indíts', ikon: '🚀', url: u('milyen-vallalkozast-indits') },
      { cim: 'Marketing rendszerek', ikon: '📣', url: u('marketing-rendszerek') },
      { cim: 'Piaci intelligencia', ikon: '🧠', url: u('piaci-intelligencia') },
      { cim: 'Szövegírás', ikon: '✍️', url: null },
      { cim: 'E-mail marketing', ikon: '📧', url: null },
      { cim: 'Közösségi média', ikon: '📱', url: null },
      { cim: 'SEO', ikon: '🔍', url: null },
      { cim: 'Vizuális design', ikon: '🎨', url: u('vizualis-design') },
      { cim: 'Fotózás alapjai', ikon: '📷', url: u('fotozas-alapjai') },
      { cim: 'Mobilfotózás', ikon: '📲', url: u('mobilfotozas') },
      { cim: 'Videózás', ikon: '🎥', url: u('videozas') },
      { cim: 'Videóvágás', ikon: '✂️', url: null },
      { cim: 'Canva', ikon: '🖌️', url: u('canva') },
      { cim: 'WordPress', ikon: '🌐', url: u('wordpress') },
      { cim: 'AI', ikon: '🤖', url: null }
    ]
  },
  {
    sorrend: 5,
    slug: 'ppc-manager',
    cim: 'PPC manager',
    leiras: 'A fizetett hirdetések azonnali és mérhető eredményeket hoznak a digitális marketingben. A PPC Manager Karrier Küldetés célja, hogy megtanuld a Google és a közösségi platformok hirdetési rendszerét, kampányokat tudj tervezni és optimalizálni. Ezzel értékes szakemberré válhatsz az ügynökségi vagy szabadúszó piacon.',
    tema: 'regi',
    vegcel: { cim: 'PPC manager', ikon: '💰' },
    kurzusok: [
      { cim: 'Milyen vállalkozást indíts', ikon: '🚀', url: u('milyen-vallalkozast-indits') },
      { cim: 'Marketing rendszerek', ikon: '📣', url: u('marketing-rendszerek') },
      { cim: 'Piaci intelligencia', ikon: '🧠', url: u('piaci-intelligencia') },
      { cim: 'Szövegírás', ikon: '✍️', url: null },
      { cim: 'Hirdetések készítése', ikon: '📢', url: null },
      { cim: 'Meta hirdetések', ikon: '🅵', url: null },
      { cim: 'TikTok hirdetések', ikon: '🎵', url: null },
      { cim: 'Google Ads', ikon: '🟢', url: null },
      { cim: 'Vizuális design', ikon: '🎨', url: u('vizualis-design') },
      { cim: 'Fotózás alapjai', ikon: '📷', url: u('fotozas-alapjai') },
      { cim: 'Mobilfotózás', ikon: '📲', url: u('mobilfotozas') },
      { cim: 'Videózás', ikon: '🎥', url: u('videozas') },
      { cim: 'Canva', ikon: '🖌️', url: u('canva') },
      { cim: 'AI', ikon: '🤖', url: null }
    ]
  },
  {
    sorrend: 6,
    slug: 'social-media-manager',
    cim: 'Social Media Manager',
    leiras: 'A közösségi média gyakran meghatározó része a vállalkozások tartalomstratégiájának. A Social Media Manager pozícióra célzott Karrier Küldetésünk abban segít, hogy ezen a pályán el tudj indulni. Alkalmazottként vagy akár egyéni vállalkozóként saját ügyfeleket vállalva.',
    tema: 'regi',
    vegcel: { cim: 'Social Media Manager', ikon: '📱' },
    kurzusok: [
      { cim: 'Milyen vállalkozást indíts', ikon: '🚀', url: u('milyen-vallalkozast-indits') },
      { cim: 'Marketing rendszerek', ikon: '📣', url: u('marketing-rendszerek') },
      { cim: 'Piaci intelligencia', ikon: '🧠', url: u('piaci-intelligencia') },
      { cim: 'Szövegírás', ikon: '✍️', url: null },
      { cim: 'Közösségi média', ikon: '📱', url: null },
      { cim: 'Vizuális design', ikon: '🎨', url: u('vizualis-design') },
      { cim: 'Videózás', ikon: '🎥', url: u('videozas') },
      { cim: 'Videóvágás', ikon: '✂️', url: null },
      { cim: 'Fotózás alapjai', ikon: '📷', url: u('fotozas-alapjai') },
      { cim: 'Mobilfotózás', ikon: '📲', url: u('mobilfotozas') },
      { cim: 'Canva', ikon: '🖌️', url: u('canva') },
      { cim: 'AI', ikon: '🤖', url: null }
    ]
  },
  {
    sorrend: 7,
    slug: 'videovago',
    cim: 'Videóvágó',
    leiras: 'A videós tartalom ma az egyik legkeresettebb eszköz, amivel a márkák, vállalkozások és alkotók elérhetik a közönségüket. A Videóvágó Karrier Küldetés abban segít, hogy megtanuld, hogyan támogathatsz ügyfeleket a teljes videós folyamatban: az ötlettől és felvételtől egészen a vágásig és publikálásig. Ha szeretnél ügyfeleknek segíteni abban, hogy videóikkal kitűnjenek a digitális zajból, ez a küldetés elindít a videóvágói és videós karriered felé.',
    tema: 'regi',
    vegcel: { cim: 'Videóvágó', ikon: '🎬' },
    kurzusok: [
      { cim: 'Milyen vállalkozást indíts', ikon: '🚀', url: u('milyen-vallalkozast-indits') },
      { cim: 'Marketing rendszerek', ikon: '📣', url: u('marketing-rendszerek') },
      { cim: 'Piaci intelligencia', ikon: '🧠', url: u('piaci-intelligencia') },
      { cim: 'Szövegírás', ikon: '✍️', url: null },
      { cim: 'Közösségi média', ikon: '📱', url: null },
      { cim: 'Vizuális design', ikon: '🎨', url: u('vizualis-design') },
      { cim: 'Videózás', ikon: '🎥', url: u('videozas') },
      { cim: 'Videóvágás', ikon: '✂️', url: null },
      { cim: 'Fotózás alapjai', ikon: '📷', url: u('fotozas-alapjai') },
      { cim: 'Mobilfotózás', ikon: '📲', url: u('mobilfotozas') },
      { cim: 'Canva', ikon: '🖌️', url: u('canva') },
      { cim: 'AI', ikon: '🤖', url: null }
    ]
  }
];

// Egy Notion kurzus soron akkor "kész", ha van publikált URL-je.
export function kurzusKesz(k) {
  return !!k.url;
}
