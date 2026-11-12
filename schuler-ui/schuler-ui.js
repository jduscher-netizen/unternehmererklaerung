/* Gemeinsame Oberfläche aller Schuler-Apps – App-Wechsel, Konto-Menü, Darstellung.
   Quelle: ~/Documents/Claude/schuler-ui/. Nicht in den Apps ändern, sondern hier und dann mit verteilen.sh kopieren.

   Einbinden im <head>, ohne defer, damit die Darstellung vor dem ersten Bild steht:
     <link rel="stylesheet" href="/schuler-ui/schuler-ui.css">
     <script src="/schuler-ui/schuler-ui.js"></script>

   Danach in der App:
     SchulerUI.appKnopf('kundendienst')                  → Knopf mit App-Name, öffnet den App-Wechsel
     SchulerUI.kontoKnopf({ name, rolle, abmelden, version, eintraege, leiste })
     SchulerUI.logo()                                    → <img> mit dem Schuler-Logo
     SchulerUI.darstellung.wahl() / .setzen('geraet'|'hell'|'dunkel')
   Bei jedem Wechsel der Darstellung feuert document das Ereignis „schuler-darstellung“. */
(function () {
  'use strict';
  if (window.SchulerUI) return;

  var BASIS = (function () {
    var s = document.currentScript && document.currentScript.src;
    return s ? s.replace(/[^/]*$/, '') : '/schuler-ui/';
  })();

  /* Symbole im 24er-Raster, Linien wie überall in den Apps */
  var PFADE = {
    runter: '<path d="m6 9 6 6 6-6"/>',
    ok: '<path d="M20 6 9 17l-5-5"/>',
    person: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    apps: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>',
    sonne: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
    mond: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    geraet: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
    abmelden: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
    mass: '<path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z"/><path d="m14.5 12.5 2-2M11.5 9.5l2-2M8.5 6.5l2-2M17.5 15.5l2-2"/>',
    euro: '<path d="M4 10h12M4 14h9M19 6a7.7 7.7 0 0 0-5.2-2A7.9 7.9 0 0 0 6 12c0 4.4 3.5 8 7.8 8 2 0 3.8-.8 5.2-2"/>',
    werk: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
    tuer: '<path d="M18 20V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14M2 20h20M14 12v.01"/>',
    marke: '<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5"/>',
    bild: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
    haken: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="m9 15 2 2 4-4"/>'
  };
  function icon(name) {
    return '<svg class="sui-ic" viewBox="0 0 24 24" aria-hidden="true">' + (PFADE[name] || '') + '</svg>';
  }

  /* Reihenfolge, Farben und Symbole wie auf dem Home-Bildschirm */
  var APPS = [
    { id: 'aufmass', name: 'Aufmaß', farbe: '#A11C1C', symbol: 'mass', url: 'https://aufmass.fensterschuler.app/' },
    { id: 'angebot', name: 'Angebot', farbe: '#1D7146', symbol: 'euro', url: 'https://angebot.fensterschuler.app/' },
    { id: 'kundendienst', name: 'Kundendienst', farbe: '#1C5BA6', symbol: 'werk', url: 'https://kundendienst.fensterschuler.app/' },
    { id: 'haustuer', name: 'Haustür Programm', farbe: '#0E6B76', symbol: 'tuer', url: 'https://haustuer.fensterschuler.app/' },
    { id: 'aktion', name: 'Haustür-Aktion', farbe: '#C24E1A', symbol: 'marke', url: 'https://haustuer-aktion.fensterschuler.app/' },
    { id: 'visualisierung', name: 'Türen-Visualisierung', farbe: '#5B3D94', symbol: 'bild', url: 'https://visualisierung.fensterschuler.app/' },
    { id: 'unternehmererklaerung', name: 'Unternehmererklärung', farbe: '#3E4B5B', symbol: 'haken', url: 'https://unternehmererklaerung.pages.dev/' }
  ];

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }
  function el(html) {
    var t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  /* ── Darstellung: Gerät (folgt iPad/iPhone), Hell oder Dunkel. Gilt je Gerät und App. ── */
  var SCHLUESSEL = 'schuler-darstellung';
  var systemDunkel = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : { matches: false, addEventListener: function () {} };
  function lesen(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function schreiben(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { /* ohne Speicher gilt die Wahl bis zum Neuladen */ } }
  var aktuelleWahl = null;
  var darstellung = {
    /** 'geraet' | 'hell' | 'dunkel' */
    wahl: function () {
      if (aktuelleWahl) return aktuelleWahl;
      var v = lesen(SCHLUESSEL);
      return v === 'hell' || v === 'dunkel' ? v : 'geraet';
    },
    istDunkel: function () {
      var w = darstellung.wahl();
      return w === 'dunkel' || (w === 'geraet' && systemDunkel.matches);
    },
    anwenden: function () {
      var w = darstellung.wahl(), r = document.documentElement;
      if (w === 'hell') r.setAttribute('data-theme', 'light');
      else if (w === 'dunkel') r.setAttribute('data-theme', 'dark');
      else r.removeAttribute('data-theme');
      var dunkel = darstellung.istDunkel();
      r.style.colorScheme = dunkel ? 'dark' : 'light';
      var meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', dunkel ? '#0f1013' : '#ffffff');
      try { document.dispatchEvent(new CustomEvent('schuler-darstellung', { detail: { wahl: w, dunkel: dunkel } })); } catch (e) { /* alte Browser */ }
    },
    setzen: function (w) {
      aktuelleWahl = w === 'hell' || w === 'dunkel' ? w : 'geraet';
      schreiben(SCHLUESSEL, aktuelleWahl === 'geraet' ? null : aktuelleWahl);
      darstellung.anwenden();
    },
    /** Frühere Wahl einer App übernehmen (einmalig), z. B. übernehmen('kd_darstellung', { light: 'hell', dark: 'dunkel' }) */
    uebernehmen: function (alterSchluessel, abbildung) {
      if (lesen(SCHLUESSEL) != null) return;
      var alt = lesen(alterSchluessel);
      if (alt && abbildung && abbildung[alt]) { schreiben(SCHLUESSEL, abbildung[alt]); aktuelleWahl = null; darstellung.anwenden(); }
    }
  };
  darstellung.anwenden();
  if (systemDunkel.addEventListener) systemDunkel.addEventListener('change', function () { if (darstellung.wahl() === 'geraet') darstellung.anwenden(); });

  /* ── Aufklappfenster: eines zur Zeit, schließt bei Tipp daneben und mit Esc ── */
  var offen = null;
  function schliessen() {
    if (!offen) return;
    offen.pop.hidden = true;
    offen.knopf.setAttribute('aria-expanded', 'false');
    offen = null;
  }
  function umschalten(knopf, pop) {
    var war = offen && offen.pop === pop;
    schliessen();
    if (war) return;
    pop.hidden = false;
    knopf.setAttribute('aria-expanded', 'true');
    offen = { knopf: knopf, pop: pop };
  }
  document.addEventListener('click', function (e) {
    if (!offen) return;
    if (offen.pop.contains(e.target) || offen.knopf.contains(e.target)) return;
    schliessen();
  }, true);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') schliessen(); });

  function wechslerHtml(hier) {
    return APPS.map(function (a) {
      var ist = a.id === hier;
      var inhalt = '<span class="sui-marke" style="--sui-app:' + a.farbe + '">' + icon(a.symbol) + '</span>' + esc(a.name) + (ist ? icon('ok') : '');
      return ist
        ? '<div class="sui-wz sui-hier" aria-current="page">' + inhalt + '</div>'
        : '<a class="sui-wz" href="' + a.url + '" target="_blank" rel="noopener">' + inhalt + '</a>';
    }).join('');
  }

  /** App-Name mit Pfeil; der Tipp öffnet die Liste aller Apps. */
  function appKnopf(hier, optionen) {
    optionen = optionen || {};
    var app = APPS.filter(function (a) { return a.id === hier; })[0] || { name: optionen.name || hier };
    var anker = el('<div class="sui-anker"><button type="button" class="sui-app" aria-haspopup="true" aria-expanded="false">' + esc(optionen.name || app.name) + icon('runter') + '</button>' +
      '<div class="sui-pop sui-wechsler ' + (optionen.hoch ? 'sui-hoch sui-rechts' : 'sui-links') + '" role="menu" hidden>' + wechslerHtml(hier) + '</div></div>');
    var knopf = anker.querySelector('button'), pop = anker.querySelector('.sui-pop');
    knopf.addEventListener('click', function () { umschalten(knopf, pop); });
    pop.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('a')) schliessen(); });
    return anker;
  }

  /** Punkt „Apps“ für die Leiste unten (Verkaufs-Apps, iPhone). */
  function appsLeistenKnopf(hier) {
    var anker = el('<div class="sui-anker"><button type="button" class="sui-leiste-knopf" aria-haspopup="true" aria-expanded="false">' + icon('apps') + '<span>Apps</span></button>' +
      '<div class="sui-pop sui-wechsler sui-hoch sui-rechts" role="menu" hidden>' + wechslerHtml(hier) + '</div></div>');
    var knopf = anker.querySelector('button'), pop = anker.querySelector('.sui-pop');
    knopf.addEventListener('click', function () { umschalten(knopf, pop); });
    pop.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('a')) schliessen(); });
    return anker;
  }

  function segmentZeichnen(seg) {
    var w = darstellung.wahl();
    Array.prototype.forEach.call(seg.querySelectorAll('button'), function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-wahl') === w)); });
  }

  /**
   * Name des Benutzers mit Menü: Darstellung, Einträge der App, Abmelden, Version.
   * optionen: { name, rolle, abmelden(), version, eintraege: [{ text, symbol?, html?, aktion() }], leiste: true für die Leiste unten }
   */
  function kontoKnopf(optionen) {
    optionen = optionen || {};
    var name = optionen.name || '';
    var kurz = optionen.kurz || name.split(/\s+/)[0] || 'Konto';
    var knopfHtml = optionen.leiste
      ? '<button type="button" class="sui-leiste-knopf" aria-haspopup="true" aria-expanded="false">' + icon('person') + '<span class="sui-name">' + esc(kurz) + '</span></button>'
      : '<button type="button" class="sui-konto" aria-haspopup="true" aria-expanded="false">' + icon('person') + '<span class="sui-name">' + esc(kurz) + '</span>' + icon('runter') + '</button>';
    var eintraege = (optionen.eintraege || []).map(function (e, i) {
      return '<button type="button" class="sui-mp" data-sui-eintrag="' + i + '">' + (e.html || ((e.symbol ? icon(e.symbol) : '') + esc(e.text))) + '</button>';
    }).join('');
    var anker = el('<div class="sui-anker">' + knopfHtml +
      '<div class="sui-pop sui-menue sui-rechts' + (optionen.leiste ? ' sui-hoch' : '') + '" role="menu" hidden>' +
        (name ? '<div class="sui-wer"><b>' + esc(name) + '</b>' + (optionen.rolle ? '<span>' + esc(optionen.rolle) + '</span>' : '') + '</div><hr>' : '') +
        '<div class="sui-dar"><span class="sui-lbl">Darstellung</span><div class="sui-seg">' +
          '<button type="button" data-wahl="geraet">' + icon('geraet') + 'Gerät</button>' +
          '<button type="button" data-wahl="hell">' + icon('sonne') + 'Hell</button>' +
          '<button type="button" data-wahl="dunkel">' + icon('mond') + 'Dunkel</button>' +
        '</div></div>' +
        (eintraege ? '<hr>' + eintraege : '') +
        (optionen.abmelden ? '<hr><button type="button" class="sui-mp" data-sui-abmelden>' + icon('abmelden') + 'Abmelden</button>' : '') +
        (optionen.version ? '<hr><div class="sui-ver">' + esc(optionen.version) + '</div>' : '') +
      '</div></div>');
    var knopf = anker.querySelector('button'), pop = anker.querySelector('.sui-pop'), seg = anker.querySelector('.sui-seg');
    segmentZeichnen(seg);
    // Apps, die ihre Kopfzeile neu zeichnen, hinterlassen sonst je Bild einen Zuhörer
    document.addEventListener('schuler-darstellung', function nachziehen() {
      if (!document.documentElement.contains(seg)) { document.removeEventListener('schuler-darstellung', nachziehen); return; }
      segmentZeichnen(seg);
    });
    knopf.addEventListener('click', function () { segmentZeichnen(seg); umschalten(knopf, pop); });
    pop.addEventListener('click', function (e) {
      var t = e.target.closest ? e.target.closest('button') : null;
      if (!t) return;
      if (t.hasAttribute('data-wahl')) { darstellung.setzen(t.getAttribute('data-wahl')); return; }
      if (t.hasAttribute('data-sui-abmelden')) { schliessen(); optionen.abmelden(); return; }
      var i = t.getAttribute('data-sui-eintrag');
      if (i != null) { schliessen(); var e2 = optionen.eintraege[Number(i)]; if (e2 && e2.aktion) e2.aktion(); }
    });
    return anker;
  }

  function logo(klasse) {
    var img = document.createElement('img');
    img.className = 'sui-logo' + (klasse ? ' ' + klasse : '');
    img.alt = 'Haustüren & Fenster Schuler';
    img.src = BASIS + 'logo.jpg';
    img.decoding = 'async';
    return img;
  }

  /** Doppelt tippen löst nicht doppelt aus: Knopf bis zum Ende der Aufgabe sperren. */
  function einmal(knopf, aufgabe) {
    if (knopf.disabled || knopf.getAttribute('aria-busy') === 'true') return Promise.resolve();
    knopf.disabled = true; knopf.setAttribute('aria-busy', 'true');
    return Promise.resolve().then(aufgabe).finally(function () { knopf.disabled = false; knopf.removeAttribute('aria-busy'); });
  }

  window.SchulerUI = { APPS: APPS, icon: icon, darstellung: darstellung, appKnopf: appKnopf, appsLeistenKnopf: appsLeistenKnopf, kontoKnopf: kontoKnopf, logo: logo, schliessen: schliessen, einmal: einmal, basis: BASIS };
})();
