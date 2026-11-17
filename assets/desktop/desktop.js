/* Desktop-style portfolio.
   All content is read from classic.html (one source of truth); this file only arranges it into
   windows, folders, a dock and a terminal. Phones get a home screen with full-screen apps. */
(function () {
  'use strict';
  var root = document.documentElement;
  var phone = window.matchMedia('(max-width: 760px)');
  var CLASSIC = null;                       // parsed classic.html
  var winLayer = document.getElementById('windows');
  var wins = {};                            // key -> {el, app}
  var z = 20, cascade = 0;
  var CV = 'assets/Wayne-Williams-Opanja-CV.pdf';
  var EMAIL = 'waynewilliams2028@gmail.com';
  var WHATSAPP = 'https://wa.me/254798609919';

  /* ---------- icons (own artwork) ---------- */
  function squircle(id, c1, c2, glyph) {
    return '<svg class="ico" viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="g' + id + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="' + c1 + '"/><stop offset="1" stop-color="' + c2 + '"/></linearGradient></defs>' +
      '<rect x="2" y="2" width="60" height="60" rx="15" fill="url(#g' + id + ')"/>' +
      '<rect x="2.5" y="2.5" width="59" height="59" rx="14.5" fill="none" stroke="rgba(255,255,255,.25)"/>' + glyph + '</svg>';
  }
  var W = 'fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"';
  var ICONS = {
    folder: function (n) {
      return '<svg class="ico" viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="gf' + n + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7cc4f2"/><stop offset="1" stop-color="#3e94d6"/></linearGradient></defs>' +
        '<path d="M6 16a5 5 0 0 1 5-5h13l5 5h24a5 5 0 0 1 5 5v4H6z" fill="#4c9edb"/><rect x="6" y="20" width="52" height="34" rx="5" fill="url(#gf' + n + ')"/>' +
        '<rect x="6.5" y="20.5" width="51" height="33" rx="4.5" fill="none" stroke="rgba(255,255,255,.35)"/></svg>';
    },
    finder: function () { return squircle('fi', '#5ee0a8', '#178a5b', '<rect x="16" y="16" width="13" height="13" rx="3" fill="#fff"/><rect x="35" y="16" width="13" height="13" rx="3" fill="#fff" opacity=".8"/><rect x="16" y="35" width="13" height="13" rx="3" fill="#fff" opacity=".8"/><rect x="35" y="35" width="13" height="13" rx="3" fill="#fff" opacity=".6"/>'); },
    browser: function () { return squircle('br', '#7fb8ff', '#2d66d6', '<circle cx="32" cy="32" r="16" ' + W + '/><path d="M16 32h32M32 16c-6 6-6 26 0 32M32 16c6 6 6 26 0 32" ' + W + '/>'); },
    studio: function () { return squircle('st', '#ff9d6b', '#d6452d', '<rect x="14" y="19" width="36" height="26" rx="5" ' + W + '/><path d="M29 26v12l10-6z" fill="#fff"/>'); },
    notes: function () { return squircle('no', '#ffe27a', '#e8a51c', '<path d="M19 22h26M19 31h26M19 40h17" ' + W + '/>'); },
    cv: function () { return squircle('cv', '#f4f1ea', '#cfc8b8', '<path d="M22 14h15l9 9v27H22z" fill="#fff" stroke="#9a9384" stroke-width="2"/><rect x="17" y="34" width="22" height="11" rx="3" fill="#d6452d"/><text x="28" y="42.5" font-family="Inter,Arial" font-size="8" font-weight="700" fill="#fff" text-anchor="middle">PDF</text>'); },
    terminal: function () { return squircle('te', '#3a403d', '#121513', '<path d="M18 24l9 8-9 8" ' + W + ' stroke="#5fd4a0"/><path d="M31 41h14" ' + W + '/>'); },
    contacts: function () { return squircle('co', '#c7a2ff', '#7a4bd6', '<circle cx="32" cy="26" r="7" ' + W + '/><path d="M19 46c2-7 7-10 13-10s11 3 13 10" ' + W + '/>'); },
    mail: function () { return squircle('ma', '#6fd0ff', '#1f86d6', '<rect x="15" y="20" width="34" height="24" rx="4" ' + W + '/><path d="M16 22l16 12 16-12" ' + W + '/>'); },
    messages: function () { return squircle('me', '#7ee69b', '#1fa84a', '<path d="M32 17c-9 0-16 6-16 13 0 4 2 7 5 9l-2 7 8-4c2 .5 3 .5 5 .5 9 0 16-6 16-13s-7-12.5-16-12.5z" fill="#fff"/>'); },
    classic: function () { return squircle('cl', '#e9e4d8', '#b9b19e', '<rect x="15" y="17" width="34" height="30" rx="4" fill="none" stroke="#5c574b" stroke-width="3"/><path d="M15 25h34M21 33h14M21 39h22" stroke="#5c574b" stroke-width="3" stroke-linecap="round"/>'); },
    about: function () { return squircle('ab', '#5ee0a8', '#0f7a53', '<text x="32" y="44" font-family="Instrument Serif,Georgia,serif" font-size="34" fill="#fff" text-anchor="middle">W</text>'); },
    experience: function () { return squircle('ex', '#9fb4c7', '#4e6a82', '<rect x="16" y="22" width="32" height="22" rx="4" ' + W + '/><path d="M26 22v-4h12v4M16 31h32" ' + W + '/>'); },
    doc: function () { return squircle('do', '#ffffff', '#e4e0d6', '<path d="M22 18h20M22 26h20M22 34h20M22 42h12" stroke="#8b8577" stroke-width="3" stroke-linecap="round"/>'); }
  };

  /* ---------- apps ---------- */
  var APPS = {
    welcome:    { title: 'Welcome',            icon: 'about',      w: 640, h: 560, render: renderWelcome },
    finder:     { title: 'My Work',            icon: 'finder',     w: 820, h: 540, render: renderFinder },
    browser:    { title: 'Live work',          icon: 'browser',    w: 900, h: 620, render: renderBrowser },
    studio:     { title: 'What I build',       icon: 'studio',     w: 760, h: 620, render: function (b) { cloneSection(b, '#build'); } },
    notes:      { title: 'How I work',         icon: 'notes',      w: 820, h: 560, wide: true, render: function (b) { cloneSection(b, '#how'); } },
    experience: { title: 'Experience & skills', icon: 'experience', w: 820, h: 620, render: function (b) { cloneSection(b, '#experience'); cloneSection(b, '#skills'); } },
    about:      { title: 'About me',           icon: 'about',      w: 760, h: 600, render: renderAbout },
    cv:         { title: 'Wayne-Williams-Opanja-CV.pdf', icon: 'cv', w: 760, h: 680, render: renderCV },
    contacts:   { title: 'Contact & references', icon: 'contacts',  w: 720, h: 560, render: function (b) { cloneSection(b, '#contact'); cloneSection(b, '#refs'); } },
    terminal:   { title: 'Terminal',           icon: 'terminal',   w: 640, h: 420, render: renderTerminal },
    doc:        { title: '',                   icon: 'doc',        w: 760, h: 640, render: renderDoc }
  };
  var LINKS = {
    mail: { title: 'Email me', icon: 'mail', href: 'mailto:' + EMAIL },
    messages: { title: 'WhatsApp me', icon: 'messages', href: WHATSAPP, external: true },
    classic: { title: 'Classic view', icon: 'classic', href: 'classic.html' }
  };

  /* ---------- helpers ---------- */
  function el(tag, attrs, html) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { if (attrs[k] != null) e.setAttribute(k, attrs[k]); });
    if (html != null) e.innerHTML = html;
    return e;
  }
  function q(sel) { return CLASSIC ? CLASSIC.querySelector(sel) : null; }
  function qa(sel) { return CLASSIC ? Array.prototype.slice.call(CLASSIC.querySelectorAll(sel)) : []; }
  function text(node) { return node ? node.textContent.replace(/\s+/g, ' ').trim() : ''; }
  function adopt(node) { var c = document.importNode(node, true); c.querySelectorAll('.reveal').forEach(function (r) { r.classList.add('in'); }); return c; }
  function cloneSection(body, sel) {
    var s = q(sel + ' .wrap') || q(sel);
    if (s) body.appendChild(adopt(s)); else body.appendChild(el('p', null, 'This section is on the <a href="classic.html">classic page</a>.'));
  }
  function openLink(href, external) { if (external) window.open(href, '_blank', 'noopener'); else window.location.href = href; }

  /* ---------- content: cases and smaller work ---------- */
  function cases() {
    return qa('#work .case').map(function (a, i) {
      var meta = text(a.querySelector('.case-meta'));
      return { i: i, title: text(a.querySelector('h3')), name: meta.split('·')[0].trim(), meta: meta, node: a };
    });
  }
  function minis() {
    return qa('#work .mini').map(function (m, i) { return { i: i, title: text(m.querySelector('h4')), tag: text(m.querySelector('.tag')), node: m }; });
  }

  /* ---------- window manager ---------- */
  function focusWin(key) {
    Object.keys(wins).forEach(function (k) { wins[k].el.classList.toggle('inactive', k !== key); });
    var w = wins[key];
    if (!w) return;
    w.el.style.zIndex = ++z;
    document.getElementById('mb-app').textContent = w.el.getAttribute('data-title');
  }
  function updateDock() {
    document.querySelectorAll('.dock .d-app[data-app]').forEach(function (b) {
      var id = b.getAttribute('data-app');
      var running = Object.keys(wins).some(function (k) { return wins[k].app === id; });
      b.classList.toggle('running', running);
    });
    document.body.classList.toggle('has-win', Object.keys(wins).some(function (k) { return wins[k].el.style.display !== 'none'; }));
  }
  function closeWin(key) {
    var w = wins[key];
    if (!w) return;
    w.el.remove();
    delete wins[key];
    updateDock();
    var rest = Object.keys(wins).filter(function (k) { return !wins[k].el.classList.contains('min-hidden'); });
    if (rest.length) focusWin(rest[rest.length - 1]); else document.getElementById('mb-app').textContent = 'Wayne Opanja';
  }
  function minimise(key) {
    var w = wins[key];
    if (!w || phone.matches) return closeWin(key);
    w.el.classList.add('min');
    setTimeout(function () { w.el.classList.remove('min'); w.el.style.display = 'none'; w.el.classList.add('min-hidden'); }, 240);
  }
  function restore(key) {
    var w = wins[key];
    w.el.style.display = '';
    w.el.classList.remove('min-hidden');
    focusWin(key);
  }

  function openApp(id, arg, opts) {
    opts = opts || {};
    var key = id + (arg != null ? ':' + arg : '');
    if (wins[key]) { restore(key); return wins[key].el; }
    var app = APPS[id];
    if (!app) return null;
    var title = opts.title || app.title;
    var tid = 'wt-' + key.replace(/[^a-z0-9]/gi, '-');
    var win = el('section', { class: 'win' + (app.wide ? ' wide' : ''), role: 'dialog', 'aria-labelledby': tid, 'data-title': title, tabindex: '-1' });
    var vw = window.innerWidth, vh = window.innerHeight;
    var w = Math.min(opts.w || app.w, vw - 40), h = Math.min(opts.h || app.h, vh - 160);
    var left = Math.max(16, Math.round((vw - w) / 2 - 150 + (cascade % 6) * 34 + (opts.dx || 0)));
    var top = Math.max(8, Math.round((vh - 30 - 100 - h) / 2 - 20 + (cascade % 6) * 26 + (opts.dy || 0)));
    cascade++;
    win.style.cssText = 'left:' + left + 'px;top:' + top + 'px;width:' + w + 'px;height:' + h + 'px;';
    var X = '<svg viewBox="0 0 10 10"><path d="M2 2l6 6M8 2l-6 6"/></svg>', M = '<svg viewBox="0 0 10 10"><path d="M2 5h6"/></svg>', Z = '<svg viewBox="0 0 10 10"><path d="M2 8V3.5L6.5 8zM8 2v4.5L3.5 2z" fill="rgba(0,0,0,.55)" stroke="none"/></svg>';
    var bar = el('div', { class: 'titlebar' },
      '<div class="tl"><button class="close" type="button" aria-label="Close ' + title.replace(/"/g, '') + '">' + X + '</button>' +
      '<button class="minim" type="button" aria-label="Minimise">' + M + '</button><button class="zoom" type="button" aria-label="Zoom">' + Z + '</button></div>' +
      '<h2 id="' + tid + '"></h2>');
    bar.querySelector('h2').textContent = title;
    var body = el('div', { class: 'win-body' });
    win.appendChild(bar);
    win.appendChild(body);
    winLayer.appendChild(win);
    wins[key] = { el: win, app: id };
    try { app.render(body, arg); } catch (e) { body.innerHTML = '<p>Something went wrong opening this. <a href="classic.html">Open the classic page</a>.</p>'; }
    bar.querySelector('.close').addEventListener('click', function () { closeWin(key); });
    bar.querySelector('.minim').addEventListener('click', function () { minimise(key); });
    bar.querySelector('.zoom').addEventListener('click', function () { win.classList.toggle('max'); });
    bar.addEventListener('dblclick', function (e) { if (!e.target.closest('button')) win.classList.toggle('max'); });
    win.addEventListener('pointerdown', function () { focusWin(key); });
    drag(win, bar);
    focusWin(key);
    updateDock();
    win.focus({ preventScroll: true });
    return win;
  }

  function drag(win, handle) {
    var sx, sy, ox, oy, on = false;
    handle.addEventListener('pointerdown', function (e) {
      if (e.target.closest('button') || phone.matches || win.classList.contains('max')) return;
      on = true; sx = e.clientX; sy = e.clientY; ox = win.offsetLeft; oy = win.offsetTop;
      handle.setPointerCapture(e.pointerId);
    });
    handle.addEventListener('pointermove', function (e) {
      if (!on) return;
      var nx = ox + e.clientX - sx, ny = Math.max(0, oy + e.clientY - sy);
      nx = Math.min(Math.max(nx, 60 - win.offsetWidth), window.innerWidth - 60);
      win.style.left = nx + 'px'; win.style.top = Math.min(ny, window.innerHeight - 120) + 'px';
    });
    handle.addEventListener('pointerup', function () { on = false; });
  }

  /* ---------- app renderers ---------- */
  function renderWelcome(b) {
    var lede = q('#top .lede');
    var stats = qa('#impact .stat').slice(0, 4).map(function (s) { return '<div><b>' + text(s.querySelector('strong')) + '</b><span>' + text(s.querySelector('span')) + '</span></div>'; }).join('');
    b.innerHTML = '<div class="welcome"><img src="assets/img/wayne.webp" width="640" height="739" alt="Portrait of Wayne Williams Opanja">' +
      '<div><span class="kicker">Forward Deployed Engineer · Available for project-based consultancy</span>' +
      '<h2>Hi, I\'m Wayne.</h2><p class="lede"></p>' +
      '<div class="ctas"><button class="btn btn-primary btn-sm" data-open="finder" type="button">See my work</button>' +
      '<button class="btn btn-ghost btn-sm" data-open="studio" type="button">What I build</button>' +
      '<button class="btn btn-ghost btn-sm" data-open="cv" type="button">Open my CV</button>' +
      '<button class="btn btn-ghost btn-sm" data-open="contacts" type="button">Contact me</button></div>' +
      '<p class="hint">This portfolio works like a desktop: click any icon or folder to open it, drag windows by their title bar, and use the dock below. Prefer a normal page? <a href="classic.html">Open the classic view</a>.</p></div></div>' +
      '<div class="mini-stats">' + stats + '</div>';
    if (lede) b.querySelector('.lede').innerHTML = lede.innerHTML;
  }

  function renderAbout(b) {
    var about = q('#about .about');
    if (about) b.appendChild(adopt(about)); else cloneSection(b, '#about');
  }

  function renderFinder(b, section) {
    var cs = cases(), ms = minis();
    var wrap = el('div', { class: 'finder' });
    var side = el('aside', { 'aria-label': 'Places' });
    var grid = el('div', { class: 'grid', role: 'list' });
    var PLACES = [
      ['cases', 'Case studies', 'folder'], ['more', 'More work', 'folder'], ['live', 'Live sites', 'browser'], ['docs', 'Documents', 'doc']
    ];
    side.innerHTML = '<h4>Favourites</h4>';
    PLACES.forEach(function (p) {
      var btn = el('button', { type: 'button', 'data-place': p[0] }, (p[2] === 'folder' ? ICONS.folder('s' + p[0]) : ICONS[p[2]]()) + '<span>' + p[1] + '</span>');
      btn.addEventListener('click', function () { show(p[0]); });
      side.appendChild(btn);
    });
    function item(label, small, iconHtml, onOpen) {
      var it = el('button', { class: 'f-item', type: 'button', role: 'listitem' }, iconHtml + '<span></span>' + (small ? '<small></small>' : ''));
      it.querySelector('span').textContent = label;
      if (small) it.querySelector('small').textContent = small;
      it.addEventListener('click', onOpen);
      grid.appendChild(it);
    }
    function show(place) {
      side.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-current', x.getAttribute('data-place') === place ? 'true' : 'false'); });
      grid.innerHTML = '';
      if (place === 'cases') cs.forEach(function (c) {
        item(c.name, c.title, ICONS.folder('c' + c.i), function () { openApp('doc', 'case' + c.i, { title: c.name + ': ' + c.title }); });
      });
      if (place === 'more') ms.forEach(function (m) {
        item(m.title, m.tag, ICONS.folder('m' + m.i), function () { openApp('doc', 'mini' + m.i, { title: m.title, w: 600, h: 420 }); });
      });
      if (place === 'live') SITES.forEach(function (s, i) {
        item(s.name, s.url.replace(/^https?:\/\//, ''), ICONS.browser(), function () { openApp('browser', null); setTab(i); });
      });
      if (place === 'docs') {
        item('CV.pdf', 'Download or preview', ICONS.cv(), function () { openApp('cv'); });
        item('What I build', 'Three things I deliver', ICONS.studio(), function () { openApp('studio'); });
        item('How I work.txt', 'Five steps', ICONS.notes(), function () { openApp('notes'); });
        item('Experience', 'Roles and skills', ICONS.experience(), function () { openApp('experience'); });
        item('About me', 'Who I am', ICONS.about(), function () { openApp('about'); });
        item('References', 'People I\'ve delivered for', ICONS.contacts(), function () { openApp('contacts'); });
      }
    }
    wrap.appendChild(side); wrap.appendChild(grid); b.appendChild(wrap);
    show(section || 'cases');
  }

  function renderDoc(b, arg) {
    var m = /^(case|mini)(\d+)$/.exec(arg || '');
    var node = m ? (m[1] === 'case' ? cases()[+m[2]] : minis()[+m[2]]) : null;
    if (!node) { b.textContent = 'Not found.'; return; }
    if (m[1] === 'case') { var art = el('article', { class: 'case' }); art.innerHTML = node.node.innerHTML; b.appendChild(adopt(art)); }
    else b.appendChild(adopt(node.node));
  }

  var SITES = [
    { name: 'RICC · Nigeria', url: 'https://ricc.education.gov.ng/', img: 'assets/img/shots/ricc-desk.png', note: 'National innovation platform for Nigeria\'s Federal Ministry of Education. I led the frontend and UX; it works offline for field agents and syncs when they reconnect.' },
    { name: 'Kenya Climate & Nature Directory', url: 'https://kenyaclimatedirectory.org', img: 'assets/img/shots/kcnd-desk.png', note: 'Public knowledge directory. I built its nightly research pipeline and its studios on my own; every item is approved by an editor before it is published.' },
    { name: 'Africa Climate & Nature Data', url: 'https://acndpv1.vercel.app', img: 'assets/img/shots/acnd-desk.png', note: 'Prototype: sector dashboards and a county-level risk map for small businesses in Kenya, built for Climate Shapers Africa.' }
  ];
  var setTab = function () {};
  function renderBrowser(b) {
    var wrap = el('div', { class: 'browser' });
    var tabs = el('div', { class: 'b-tabs', role: 'tablist', 'aria-label': 'Live sites' });
    var barEl = el('div', { class: 'b-bar' });
    var view = el('div', { class: 'b-view', role: 'tabpanel' });
    var note = el('div', { class: 'b-note' });
    SITES.forEach(function (s, i) {
      var t = el('button', { type: 'button', role: 'tab', 'aria-selected': 'false' });
      t.textContent = s.name;
      t.addEventListener('click', function () { setTab(i); });
      tabs.appendChild(t);
    });
    setTab = function (i) {
      var s = SITES[i];
      tabs.querySelectorAll('button').forEach(function (t, j) { t.setAttribute('aria-selected', j === i ? 'true' : 'false'); });
      var host = s.url.replace(/^https?:\/\//, '').replace(/\/$/, '');
      barEl.innerHTML = '<div class="b-url">🔒 <b>' + host + '</b></div><a class="btn btn-primary btn-sm" target="_blank" rel="noopener" href="' + s.url + '">Visit live site ↗</a>';
      view.innerHTML = '<img src="' + s.img + '" alt="Screenshot of ' + s.name + '" width="1440" height="900">';
      note.textContent = s.note;
    };
    wrap.appendChild(tabs); wrap.appendChild(barEl); wrap.appendChild(view); wrap.appendChild(note);
    b.appendChild(wrap);
    setTab(0);
  }

  function renderCV(b) {
    if (phone.matches) {
      b.innerHTML = '<div class="cv-card">' + ICONS.cv() + '<h2>My CV</h2><p>Two pages: experience, selected projects, education and certifications.</p>' +
        '<div class="ctas"><a class="btn btn-primary" href="' + CV + '" target="_blank" rel="noopener">Open CV</a> <a class="btn btn-ghost" href="' + CV + '" download>Download</a></div></div>';
      return;
    }
    b.innerHTML = '<div class="preview"><div class="p-bar"><span>Wayne Williams Opanja · CV · 2 pages</span>' +
      '<a class="btn btn-primary btn-sm" href="' + CV + '" download>Download PDF</a></div>' +
      '<object data="' + CV + '#view=FitH" type="application/pdf" aria-label="CV preview">' +
      '<p style="padding:20px">Your browser can\'t show the PDF here. <a href="' + CV + '" download>Download the CV</a>.</p></object></div>';
  }

  function renderTerminal(b) {
    b.innerHTML = '<div class="term" role="log" aria-live="polite"><div class="out"></div><form><span class="p">wayne@nairobi ~ %</span><input aria-label="Terminal command" autocomplete="off" spellcheck="false"></form></div>';
    var out = b.querySelector('.out'), input = b.querySelector('input'), term = b.querySelector('.term');
    function say(t, cls) { var d = el('div', cls ? { class: cls } : null); d.textContent = t; out.appendChild(d); term.scrollTop = term.scrollHeight; }
    var cs = cases();
    var CMDS = {
      help: function () { say('Commands: whoami, about, projects, open <number>, build, how, skills, experience, cv, contact, references, live, clear, exit'); },
      whoami: function () { say('Wayne Williams Opanja: forward deployed engineer, Nairobi. Available for project-based consultancy.'); },
      about: function () { say(text(q('#top .lede'))); },
      projects: function () { cs.forEach(function (c, i) { say((i + 1) + '. ' + c.name + ': ' + c.title); }); say('Type "open 1" to open the first one.'); },
      build: function () { openApp('studio'); say('Opening What I build…'); },
      how: function () { openApp('notes'); say('Opening How I work…'); },
      skills: function () { qa('#skills .skills .skill').forEach(function (s) { say('• ' + text(s.querySelector('h3')) + ': ' + text(s.querySelector('p'))); }); },
      experience: function () { openApp('experience'); say('Opening Experience & skills…'); },
      cv: function () { openApp('cv'); say('Opening CV.pdf…'); },
      contact: function () { say('Email: ' + EMAIL + '   WhatsApp: +254 798 609 919'); },
      references: function () { openApp('contacts'); say('Opening references…'); },
      live: function () { openApp('browser'); say('Opening live sites…'); },
      clear: function () { out.innerHTML = ''; },
      exit: function () { var k = Object.keys(wins).filter(function (x) { return wins[x].app === 'terminal'; })[0]; if (k) closeWin(k); },
      ls: function () { say('Case studies/  More work/  Live sites/  CV.pdf  How I work.txt  Experience/  References/'); },
      sudo: function (a) { if (/hire/.test(a)) { say('Permission granted. Opening Mail…'); openLink('mailto:' + EMAIL + '?subject=Project%20enquiry'); } else say('Nice try. Try "sudo hire wayne".'); }
    };
    say('Welcome. Type "help" to see what you can do.');
    b.querySelector('form').addEventListener('submit', function (e) {
      e.preventDefault();
      var line = input.value.trim(); input.value = '';
      if (!line) return;
      say('wayne@nairobi ~ % ' + line, 'p');
      var parts = line.split(/\s+/), cmd = parts[0].toLowerCase(), rest = parts.slice(1).join(' ');
      if (cmd === 'open') { var n = parseInt(rest, 10); if (cs[n - 1]) { openApp('doc', 'case' + (n - 1), { title: cs[n - 1].name + ': ' + cs[n - 1].title }); say('Opening ' + cs[n - 1].name + '…'); } else say('Usage: open <number>. Type "projects" for the list.'); return; }
      (CMDS[cmd] || function () { say('command not found: ' + cmd + '. Type "help".'); })(rest);
    });
    setTimeout(function () { input.focus(); }, 50);
  }

  /* ---------- desktop icons and dock ---------- */
  var DESK = [
    ['welcome', 'Welcome.txt', 'doc'], ['finder', 'My Work', 'folder'], ['browser', 'Live work', 'browser'], ['studio', 'What I build', 'studio'],
    ['notes', 'How I work', 'notes'], ['cv', 'CV.pdf', 'cv'], ['experience', 'Experience', 'experience'], ['contacts', 'References', 'contacts'],
    ['terminal', 'Terminal', 'terminal'], ['classic', 'Classic view', 'classic']
  ];
  var DOCK = ['finder', 'browser', 'studio', 'notes', 'cv', 'terminal', '|', 'contacts', 'mail', 'messages', 'classic'];
  var PHONE_DOCK = ['finder', 'studio', 'cv', 'messages'];

  function buildDesktop() {
    var icons = document.getElementById('icons');
    icons.innerHTML = '';
    if (phone.matches) icons.appendChild(el('li', { class: 'phone-intro' }, '<b>Wayne Williams Opanja</b><span>Software developer · Nairobi · Tap an app to explore.</span>'));
    DESK.forEach(function (d, i) {
      var li = el('li');
      var btn = el('button', { class: 'd-icon', type: 'button', 'aria-label': 'Open ' + d[1] }, (d[2] === 'folder' ? ICONS.folder('d' + i) : ICONS[d[2]]()) + '<span></span>');
      btn.querySelector('span').textContent = d[1];
      btn.addEventListener('click', function () { if (LINKS[d[0]]) openLink(LINKS[d[0]].href, LINKS[d[0]].external); else openApp(d[0]); });
      li.appendChild(btn); icons.appendChild(li);
    });
    var dock = document.getElementById('dock');
    dock.innerHTML = '';
    DOCK.forEach(function (id) {
      if (id === '|') { dock.appendChild(el('span', { class: 'sep', 'aria-hidden': 'true' })); return; }
      var link = LINKS[id], app = APPS[id];
      var title = link ? link.title : app.title;
      var b = link ? el('a', { class: 'd-app', href: link.href, 'aria-label': title }) : el('button', { class: 'd-app', type: 'button', 'data-app': id, 'aria-label': title });
      if (link && link.external) { b.setAttribute('target', '_blank'); b.setAttribute('rel', 'noopener'); }
      if (PHONE_DOCK.indexOf(id) < 0) b.classList.add('phone-hide');
      b.innerHTML = ICONS[link ? link.icon : app.icon]() + '<span class="tip"></span>';
      b.querySelector('.tip').textContent = title;
      if (!link) b.addEventListener('click', function () {
        var open = Object.keys(wins).filter(function (k) { return wins[k].app === id; });
        if (open.length) restore(open[open.length - 1]); else { b.classList.add('bounce'); setTimeout(function () { b.classList.remove('bounce'); }, 1000); openApp(id); }
      });
      dock.appendChild(b);
    });
    magnify(dock);
  }

  function magnify(dock) {
    if (phone.matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var apps = Array.prototype.slice.call(dock.querySelectorAll('.d-app'));
    dock.addEventListener('pointermove', function (e) {
      apps.forEach(function (a) {
        var r = a.getBoundingClientRect(), c = r.left + r.width / 2, d = Math.abs(e.clientX - c);
        var s = Math.max(0, 1 - d / 140);
        var size = 54 + 26 * s;
        a.style.width = a.style.height = size + 'px';
      });
    });
    dock.addEventListener('pointerleave', function () { apps.forEach(function (a) { a.style.width = a.style.height = ''; }); });
  }

  /* ---------- menu bar ---------- */
  function clock() {
    var d = new Date();
    document.getElementById('mb-clock').textContent = d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) + '  ' +
      d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  }
  function wireMenus() {
    var logo = document.getElementById('mb-logo'), menu = document.getElementById('mb-menu');
    logo.addEventListener('click', function (e) { e.stopPropagation(); var open = menu.hidden; menu.hidden = !open; logo.setAttribute('aria-expanded', open ? 'true' : 'false'); });
    document.addEventListener('click', function () { menu.hidden = true; logo.setAttribute('aria-expanded', 'false'); });
    document.addEventListener('click', function (e) {
      var t = e.target.closest('[data-open]');
      if (t) { e.preventDefault(); openApp(t.getAttribute('data-open')); }
    });
    document.getElementById('theme-toggle').addEventListener('click', function () {
      var cur = root.getAttribute('data-theme') || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
      var next = cur === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (!menu.hidden) { menu.hidden = true; logo.focus(); return; }
      var top = Object.keys(wins).filter(function (k) { return wins[k].el.style.display !== 'none'; }).sort(function (a, b) { return (+wins[b].el.style.zIndex) - (+wins[a].el.style.zIndex); })[0];
      if (top && !(document.activeElement && document.activeElement.tagName === 'INPUT' && document.activeElement.value)) closeWin(top);
    });
  }

  /* ---------- start ---------- */
  function boot(done) {
    var b = document.getElementById('boot');
    var seen = false;
    try { seen = sessionStorage.getItem('booted') === '1'; sessionStorage.setItem('booted', '1'); } catch (e) {}
    var ms = seen || window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1050;
    setTimeout(function () { b.classList.add('done'); setTimeout(function () { b.remove(); }, 520); done(); }, ms);
  }

  function start() {
    wireMenus();
    clock(); setInterval(clock, 15000);
    fetch('classic.html').then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); }).then(function (t) {
      CLASSIC = new DOMParser().parseFromString(t, 'text/html');
    }).catch(function () { CLASSIC = null; }).then(function () {
      buildDesktop();
      boot(function () {
        if (!CLASSIC) {
          openApp('welcome');
          return;
        }
        if (!phone.matches) {
          openApp('finder', null, { dx: -170, dy: -10 });
          openApp('welcome', null, { dx: 120, dy: 20 });
        }
      });
    });
    phone.addEventListener('change', function () { buildDesktop(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
