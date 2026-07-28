/* tools-link.js
   Shared "other tools" snippet for every icspin tool.

   Drop this file into a tool's repo and load it with:
     <script src="tools-link.js" defer></script>
   or paste the whole thing into a single-file tool inside a <script> tag.

   What it does:
   - fetches https://icspin.github.io/apps.json (the hub manifest)
   - drops the entry for the tool it is currently running inside
   - renders a quiet "other tools" button that opens a small overlay
   - mounts into an element marked data-tools-link if one exists,
     otherwise fixes itself to the bottom right corner

   Failure policy: if anything goes wrong (offline, 404, bad JSON),
   it renders nothing, throws nothing, and logs nothing. */

(function () {
  'use strict';
  try {
    var MANIFEST = 'https://icspin.github.io/apps.json';

    function isHere(url) {
      try {
        var u = String(url).replace(/\/+$/, '');
        var h = location.href.replace(/\/+$/, '');
        return h === u || h.indexOf(u + '/') === 0 || h.indexOf(u + '?') === 0 || h.indexOf(u + '#') === 0;
      } catch (e) { return true; }
    }

    fetch(MANIFEST + '?v=' + Date.now())
      .then(function (r) { if (!r.ok) throw new Error('http'); return r.json(); })
      .then(function (list) {
        if (!Array.isArray(list)) return;
        var others = list.filter(function (a) {
          return a && a.name && a.url && a.status === 'live' && !isHere(a.url);
        });
        if (others.length) render(others);
      })
      .catch(function () {});

    function render(others) {
      var css = document.createElement('style');
      css.textContent =
        '.ictl-btn{background:none;border:none;padding:2px 4px;margin:0;cursor:pointer;' +
          'font:inherit;color:inherit;opacity:.75;text-decoration:underline;' +
          'text-underline-offset:3px}' +
        '.ictl-btn:hover{opacity:1}' +
        '.ictl-btn:focus-visible{outline:2px solid #d9a441;outline-offset:2px;opacity:1}' +
        '.ictl-btn.ictl-fixed{position:fixed;right:10px;bottom:8px;z-index:9000;' +
          'font:13px/1.4 system-ui,sans-serif;color:#9aa4b0}' +
        '.ictl-veil{position:fixed;inset:0;z-index:9998;background:rgba(0,0,0,.45)}' +
        '.ictl-pop{position:fixed;z-index:9999;left:50%;top:50%;transform:translate(-50%,-50%);' +
          'min-width:260px;max-width:min(420px,92vw);max-height:80vh;overflow:auto;' +
          'background:#15181d;color:#edf1f4;border:1px solid #3a3f47;border-radius:12px;' +
          'padding:16px 18px;font:15px/1.5 system-ui,sans-serif;' +
          'box-shadow:0 14px 40px rgba(0,0,0,.5)}' +
        '.ictl-pop h2{margin:0 0 10px;font-size:12px;font-weight:600;letter-spacing:.14em;' +
          'text-transform:uppercase;color:#9aa4b0}' +
        '.ictl-pop a{display:block;padding:9px 10px;margin:0 -10px;border-radius:8px;' +
          'color:inherit;text-decoration:none}' +
        '.ictl-pop a:hover{background:rgba(255,255,255,.06)}' +
        '.ictl-pop a:focus-visible{outline:2px solid #d9a441;outline-offset:-2px}' +
        '.ictl-pop .ictl-nm{font-weight:600;letter-spacing:.06em}' +
        '.ictl-pop .ictl-bd{float:right;color:#d9a441;' +
          'font:12.5px ui-monospace,Consolas,monospace}' +
        '.ictl-pop .ictl-tg{color:#9aa4b0;font-size:13.5px;margin-top:2px}';
      document.head.appendChild(css);

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ictl-btn';
      btn.textContent = 'other tools';
      btn.setAttribute('aria-haspopup', 'dialog');

      var mount = document.querySelector('[data-tools-link]');
      if (mount) mount.appendChild(btn);
      else { btn.classList.add('ictl-fixed'); document.body.appendChild(btn); }

      var veil = null, pop = null;

      function close() {
        if (veil) veil.remove();
        if (pop) pop.remove();
        veil = pop = null;
        document.removeEventListener('keydown', onKey);
        btn.focus();
      }
      function onKey(e) { if (e.key === 'Escape') close(); }

      function open() {
        veil = document.createElement('div');
        veil.className = 'ictl-veil';
        veil.addEventListener('click', close);

        pop = document.createElement('div');
        pop.className = 'ictl-pop';
        pop.setAttribute('role', 'dialog');
        pop.setAttribute('aria-label', 'Other tools by icspin');
        var h = document.createElement('h2');
        h.textContent = 'Other tools';
        pop.appendChild(h);

        others.forEach(function (a) {
          var link = document.createElement('a');
          link.href = a.url;
          var nm = document.createElement('span');
          nm.className = 'ictl-nm';
          nm.textContent = a.name;
          var bd = document.createElement('span');
          bd.className = 'ictl-bd';
          if (a.build != null) bd.textContent = 'build ' + a.build;
          var tg = document.createElement('div');
          tg.className = 'ictl-tg';
          tg.textContent = a.tagline || '';
          link.appendChild(bd);
          link.appendChild(nm);
          link.appendChild(tg);
          pop.appendChild(link);
        });

        document.body.appendChild(veil);
        document.body.appendChild(pop);
        document.addEventListener('keydown', onKey);
        var first = pop.querySelector('a');
        if (first) first.focus();
      }

      btn.addEventListener('click', function () { pop ? close() : open(); });
    }
  } catch (e) { /* silent by design */ }
})();
