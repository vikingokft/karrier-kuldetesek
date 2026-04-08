// Karrierküldetések — WordPress embed loader
// Használat a WP Custom HTML blokkban:
//
//   <div data-kk-slug="digitalis-tartalomkeszito"></div>
//   <script src="https://vikingokft.github.io/karrier-kuldetesek/embed.js"></script>
//
// Egy oldalon több küldetés is beilleszthető, mindegyikhez saját <div> kell.
// A script a saját src URL-jéből származtatja a BASE útvonalat, így nincs config.

(function () {
  var scripts = document.getElementsByTagName('script');
  var self = scripts[scripts.length - 1];
  // A jelenleg futó scripttag src-je; defer/async esetén fallback a selectorra
  var selfSrc = (self && self.src) ||
    (document.currentScript && document.currentScript.src) ||
    (function () {
      var s = document.querySelector('script[src*="karrier-kuldetesek"][src$="embed.js"], script[src*="karrier-kuldetesek"][src*="embed.js?"]');
      return s ? s.src : '';
    })();
  var BASE = selfSrc.replace(/embed\.js(\?.*)?$/, '');
  if (!BASE) {
    console.error('[karrier-kuldetesek] Nem sikerült meghatározni a BASE URL-t.');
    return;
  }

  function injectSnippet(container, html) {
    // Temp wrapper a snippet parsolásához
    var tmp = document.createElement('div');
    tmp.innerHTML = html;
    // Gyerekeket átmozgatjuk, a <script> tageket külön újra kell hozni hogy futhassanak
    var nodes = Array.prototype.slice.call(tmp.childNodes);
    nodes.forEach(function (node) {
      if (node.nodeType === 1 && node.tagName === 'SCRIPT') {
        var s = document.createElement('script');
        if (node.src) {
          s.src = node.src;
        } else {
          s.textContent = node.textContent;
        }
        container.appendChild(s);
      } else {
        container.appendChild(node);
      }
    });
  }

  function showError(container, slug, err) {
    container.innerHTML =
      '<div style="padding:16px;border:1px dashed #c33;color:#c33;font-family:sans-serif;font-size:13px;border-radius:8px">' +
      'Nem sikerült betölteni a karrierküldetést: <strong>' + slug + '</strong>' +
      '</div>';
    if (err) console.error('[karrier-kuldetesek]', slug, err);
  }

  function loadContainer(container) {
    if (container.__kkLoaded) return;
    container.__kkLoaded = true;
    var slug = container.getAttribute('data-kk-slug');
    if (!slug) return;
    var url = BASE + encodeURIComponent(slug) + '-snippet.html';
    fetch(url, { cache: 'no-cache' })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.text();
      })
      .then(function (html) { injectSnippet(container, html); })
      .catch(function (err) { showError(container, slug, err); });
  }

  function loadAll() {
    var containers = document.querySelectorAll('[data-kk-slug]');
    Array.prototype.forEach.call(containers, loadContainer);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadAll);
  } else {
    loadAll();
  }
})();
