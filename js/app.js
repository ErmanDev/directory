/* App controller: routing, search, room info, directions and admin. */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var mq = window.matchMedia('(max-width: 1000px)');                              /* narrow layouts */
  var sheetMode = window.matchMedia('(max-width: 860px) and (min-height: 521px)'); /* map panel is a bottom sheet */
  var MPU = 0.12;          /* metres per map unit, a rough estimate (2000 units ≈ 240 m) */
  var WALK_SPEED = 1.2;    /* metres per second */

  var state = { view: null, map: null, selected: null, from: null, fromPoint: null, to: null, tab: 'info' };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function toast(msg) {
    var t = $('#toast');
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { t.hidden = true; }, 2600);
  }

  function nameOf(e) {
    if (!e) return '';
    if (e.num && e.label && e.label !== 'Room ' + e.num) return e.title + ' (' + e.label + ')';
    return e.title;
  }

  /* =========================================================
     Router
     ========================================================= */
  var VIEWS = ['home', 'map', 'directory', 'about', 'admin'];
  var TITLES = { home: 'Home', map: 'School Map', directory: 'Directory', about: 'Help', admin: 'Admin' };

  function parseHash() {
    var h = location.hash.replace(/^#\/?/, '');
    var parts = h.split('?');
    var v = parts[0] || 'home';
    return { view: VIEWS.indexOf(v) > -1 ? v : 'home', params: new URLSearchParams(parts[1] || '') };
  }

  function go(view, params) {
    var qs = params ? new URLSearchParams(params).toString() : '';
    location.hash = '#/' + view + (qs ? '?' + qs : '');
  }

  function setHashQuiet(view, params) {
    var qs = params ? new URLSearchParams(params).toString() : '';
    history.replaceState(null, '', '#/' + view + (qs ? '?' + qs : ''));
  }

  function route() {
    var r = parseHash();
    var changed = state.view !== r.view;
    state.view = r.view;
    $$('.view').forEach(function (v) { v.hidden = v.getAttribute('data-view') !== r.view; });
    document.body.classList.toggle('on-map', r.view === 'map');
    var navKey = r.view === 'map' && r.params.get('mode') === 'directions' ? 'directions' : r.view;
    $$('[data-nav]').forEach(function (a) {
      if (a.getAttribute('data-nav') === navKey) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    document.title = TITLES[r.view] + ' · VNHS Campus Navigator';
    closeMenu();
    if (changed && r.view !== 'map') window.scrollTo(0, 0);
    if (r.view === 'map') enterMap(r.params);
    if (r.view === 'directory') enterDirectory(r.params);
    if (r.view === 'admin') enterAdmin();
  }

  /* Mobile menu */
  function closeMenu() {
    document.body.classList.remove('menu-open');
    $('#menu-btn').setAttribute('aria-expanded', 'false');
  }
  $('#menu-btn').addEventListener('click', function () {
    var open = !document.body.classList.contains('menu-open');
    document.body.classList.toggle('menu-open', open);
    this.setAttribute('aria-expanded', String(open));
  });

  /* =========================================================
     Suggest (autocomplete) component
     ========================================================= */
  function Suggest(input, box, onPick, opts) {
    opts = opts || {};
    var items = [], active = -1;

    function render() {
      var q = input.value.trim();
      if (!q) { close(); return; }
      items = Store.search(q).slice(0, opts.limit || 7).map(function (r) { return r; });
      if (!items.length) {
        box.innerHTML = '<div class="suggest-empty">No matches for “' + esc(q) + '”</div>';
        box.hidden = false;
        input.setAttribute('aria-expanded', 'true');
        return;
      }
      box.innerHTML = items.map(function (r, i) {
        var e = r.entry;
        var hit = r.hits.length ? e.sections[r.hits[0]] : null;
        var sub = hit ? hit.section + (hit.adviser ? ' · ' + hit.adviser : '') : (e.label !== e.title ? e.label : (e.subtitle || e.building || e.typeName));
        return '<div class="suggest-item' + (i === active ? ' active' : '') + '" role="option" id="' + box.id + '-o' + i + '" data-i="' + i + '" aria-selected="' + (i === active) + '">' +
          '<span class="sw sw-' + esc(e.type) + '"></span><span><b>' + esc(e.title) + '</b><small>' + esc(sub) + '</small></span>' +
          (e.mapped ? '' : '<em class="tag">not on map</em>') + '</div>';
      }).join('');
      box.hidden = false;
      input.setAttribute('aria-expanded', 'true');
    }
    function close() { box.hidden = true; active = -1; input.setAttribute('aria-expanded', 'false'); input.removeAttribute('aria-activedescendant'); }
    function pick(i) {
      var r = items[i];
      if (!r) return;
      close();
      onPick(r.entry);
    }

    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-expanded', 'false');
    input.addEventListener('input', function () { active = -1; render(); });
    input.addEventListener('focus', function () { if (input.value.trim() && opts.openOnFocus !== false) render(); });
    input.addEventListener('keydown', function (e) {
      if (box.hidden) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        active = (active + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
        render();
        input.setAttribute('aria-activedescendant', box.id + '-o' + active);
      } else if (e.key === 'Enter' && active > -1) {
        e.preventDefault();
        pick(active);
      } else if (e.key === 'Escape') { close(); }
    });
    box.addEventListener('mousedown', function (e) { e.preventDefault(); });
    box.addEventListener('click', function (e) {
      var it = e.target.closest('[data-i]');
      if (it) pick(Number(it.getAttribute('data-i')));
    });
    input.addEventListener('blur', function () { setTimeout(close, 120); });
    return { close: close, first: function () { return Store.search(input.value.trim())[0]; } };
  }

  /* =========================================================
     Room info card
     ========================================================= */
  function infoHTML(e, opts) {
    opts = opts || {};
    var meta = [];
    if (e.building) meta.push(['Building', e.building]);
    if (e.floorText) meta.push(['Floor', e.floorText]);
    if (!e.building && !e.floorText && e.typeName) meta.push(['Type', e.typeName]);
    if (e.head) meta.push(['Head / In charge', e.head]);

    var hits = opts.hits || [];
    var sec = e.sections.length
      ? '<ul class="sections">' + e.sections.map(function (s, i) {
          return '<li' + (hits.indexOf(i) > -1 ? ' class="hit"' : '') + '><span class="sec">' + esc(s.section || '—') + '</span>' +
            '<span class="adv">' + (s.adviser ? esc(s.adviser) : '<span class="muted">Adviser not yet assigned</span>') + '</span></li>';
        }).join('') + '</ul>'
      : (e.type === 'classroom' ? '<p class="muted small">No section information yet.</p>' : '');

    var actions = '';
    if (e.mapped) {
      actions = '<div class="card-actions">' +
        (opts.inMap ? '' : '<a class="btn btn-ghost sm" href="#/map?room=' + encodeURIComponent(e.id) + '">View on map</a>') +
        '<a class="btn btn-primary sm" href="#/map?to=' + encodeURIComponent(e.id) + '" data-directions="' + esc(e.id) + '">Directions</a></div>';
    } else {
      actions = '<p class="muted small">This room is not drawn on the current map yet.</p>';
    }

    return '<article class="info">' +
      '<header class="info-head"><span class="sw sw-' + esc(e.type) + '" aria-hidden="true"></span>' +
      '<div><h2>' + esc(e.title) + '</h2>' + (e.subtitle ? '<p class="info-sub">' + esc(e.subtitle) + '</p>' : '') + '</div>' +
      (e.program ? '<span class="badge" title="' + esc(e.programName) + '">' + esc(e.program) + '</span>' : '') + '</header>' +
      (e.programName ? '<p class="program">' + esc(e.programName) + '</p>' : '') +
      (meta.length ? '<dl class="meta">' + meta.map(function (m) { return '<div><dt>' + esc(m[0]) + '</dt><dd>' + esc(m[1]) + '</dd></div>'; }).join('') + '</dl>' : '') +
      (e.sections.length ? '<h3 class="mini-title">Sections &amp; advisers</h3>' : '') + sec +
      (e.notes && e.notes !== e.subtitle ? '<p class="notes">' + esc(e.notes) + '</p>' : '') +
      actions + '</article>';
  }

  /* =========================================================
     HOME
     ========================================================= */
  function initHome() {
    CampusMap.create($('#preview-map'), { interactive: false, prefix: 'p-' });

    var input = $('#home-q');
    var sug = Suggest(input, $('#home-suggest'), function (e) { go('map', { room: e.id }); });
    $('#home-search').addEventListener('submit', function (ev) {
      ev.preventDefault();
      sug.close();
      go('directory', { q: input.value.trim() });
    });
    $$('[data-try]').forEach(function (b) {
      b.addEventListener('click', function () { go('directory', { q: b.getAttribute('data-try') }); });
    });

    var quick = ['r103', 'guidance', 'library', 'school-canteen', 'shs-registrar', 'jhs-registrar', 'principal', 'court'];
    $('#quick-places').innerHTML = quick.map(function (id) {
      var e = Store.get(id);
      if (!e) return '';
      return '<a class="quick" href="#/map?room=' + id + '"><span class="sw sw-' + e.type + '"></span>' + esc(e.label || e.title) + '</a>';
    }).join('');

    $('#glossary').innerHTML = ['BEC', 'SPA', 'SPS', 'SPJ', 'SPFL', 'SSP', 'SNED', 'SPED', 'SHS'].map(function (k) {
      return '<div><dt>' + k + '</dt><dd>' + esc(Store.programs[k]) + '</dd></div>';
    }).join('');
  }

  /* =========================================================
     MAP VIEW
     ========================================================= */
  var mapSug, fromSug, toSug;

  /* ---------- Bottom sheet (portrait phones) ---------- */
  var SHEET_PEEK = 160;
  var SHEET_STATES = ['peek', 'open', 'full'];

  function sheetState() { return $('#panel').getAttribute('data-state'); }

  /* Height (px) the sheet will have in a given state, without waiting for the CSS transition. */
  function sheetHeight(name) {
    var wrapH = $('.view-map').clientHeight || window.innerHeight;
    if (name === 'peek') return SHEET_PEEK;
    if (name === 'full') return wrapH - 8;
    return wrapH * 0.58;
  }

  function sheet(stateName) {
    var p = $('#panel');
    p.setAttribute('data-state', stateName);
    p.style.height = '';
    $('#sheet-handle').setAttribute('aria-expanded', String(stateName !== 'peek'));
    $('#sheet-handle').setAttribute('aria-label', stateName === 'peek' ? 'Expand panel' : 'Collapse panel');
    if (state.map) state.map.resize(); /* re-apply edge limits for the new visible area */
  }


  function initSheetDrag() {
    var panel = $('#panel');
    var drag = null, suppressClick = false;

    function onDown(e) {
      if (!sheetMode.matches || (e.pointerType === 'mouse' && e.button !== 0)) return;
      if (e.target.closest('input, .tabs, .suggest')) return;
      drag = { y: e.clientY, h: panel.offsetHeight, t: performance.now(), lastY: e.clientY, lastT: performance.now(), v: 0, moved: false, id: e.pointerId, el: e.currentTarget };
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    function onMove(e) {
      if (!drag || e.pointerId !== drag.id) return;
      var dy = drag.y - e.clientY;
      if (!drag.moved && Math.abs(dy) < 6) return;
      if (!drag.moved) { drag.moved = true; panel.classList.add('sheet-dragging'); }
      var maxH = sheetHeight('full');
      var h = Math.min(maxH, Math.max(SHEET_PEEK * 0.8, drag.h + dy));
      panel.style.height = h + 'px';
      var now = performance.now();
      drag.v = (drag.lastY - e.clientY) / Math.max(1, now - drag.lastT); /* px per ms, + = upward */
      drag.lastY = e.clientY; drag.lastT = now;
      e.preventDefault();
    }
    function onUp(e) {
      if (!drag || e.pointerId !== drag.id) return;
      var d = drag;
      drag = null;
      if (!d.moved) return;
      suppressClick = true;
      setTimeout(function () { suppressClick = false; }, 0);
      panel.classList.remove('sheet-dragging');
      var projected = panel.offsetHeight + d.v * 180;
      var best = 'open', bd = Infinity;
      SHEET_STATES.forEach(function (s) {
        var dd = Math.abs(sheetHeight(s) - projected);
        if (dd < bd) { bd = dd; best = s; }
      });
      sheet(best);
      if (best === 'peek') document.activeElement && document.activeElement.blur && document.activeElement.blur();
    }

    [$('#sheet-handle'), $('.panel-top')].forEach(function (el) {
      el.addEventListener('pointerdown', onDown);
      el.addEventListener('pointermove', onMove);
      el.addEventListener('pointerup', onUp);
      el.addEventListener('pointercancel', onUp);
    });

    /* Tap / keyboard on the handle: peek -> open -> full -> open ... ; long sheets collapse */
    $('#sheet-handle').addEventListener('click', function () {
      if (suppressClick) return;
      var s = sheetState();
      sheet(s === 'peek' ? 'open' : s === 'open' ? 'full' : 'peek');
    });

    /* Leaving sheet mode (e.g. rotating to landscape) clears inline sizes. */
    var onChange = function () { sheet(sheetState() === 'full' ? 'open' : sheetState()); };
    if (sheetMode.addEventListener) sheetMode.addEventListener('change', onChange);
    else if (sheetMode.addListener) sheetMode.addListener(onChange);
  }

  function initMap() {
    state.map = CampusMap.create($('#map'), {
      prefix: 'm-',
      onClick: onMapClick,
      /* map area hidden behind the bottom sheet, so framing and edge limits use only the visible part */
      insets: function () {
        return { top: 0, bottom: sheetMode.matches ? sheetHeight(sheetState()) : 0 };
      }
    });
    Pathfinder.build(CampusMap.data);

    $('#zoom-in').addEventListener('click', function () { state.map.zoomBy(0.7); });
    $('#zoom-out').addEventListener('click', function () { state.map.zoomBy(1.4); });
    $('#zoom-fit').addEventListener('click', function () { state.map.fitAll(false); });

    initSheetDrag();

    $('#tab-info').addEventListener('click', function () { setTab('info'); });
    $('#tab-dir').addEventListener('click', function () { setTab('dir'); });

    mapSug = Suggest($('#map-q'), $('#map-suggest'), function (e) {
      $('#map-q').value = '';
      $('#map-q').blur();
      selectPlace(e.id, { focus: true, open: true });
    });
    $('#map-q').addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter' && $('#map-suggest').hidden === false) {
        var first = mapSug.first();
        if (first && !$('#map-suggest .active')) { ev.preventDefault(); mapSug.close(); $('#map-q').value = ''; selectPlace(first.entry.id, { focus: true, open: true }); }
      }
    });
    $('#map-q').addEventListener('focus', function () { if (sheetMode.matches && sheetState() === 'peek') sheet('open'); });

    fromSug = Suggest($('#dir-from'), $('#from-suggest'), function (e) { setFrom(e.id); });
    toSug = Suggest($('#dir-to'), $('#to-suggest'), function (e) { setTo(e.id); });

    $('#dir-form').addEventListener('submit', function (ev) {
      ev.preventDefault();
      resolveTyped();
      computeRoute(true);
    });
    $('#swap-btn').addEventListener('click', function () {
      if (state.fromPoint) { toast('A point picked on the map can only be a starting point.'); return; }
      var f = state.from, t = state.to;
      state.from = t; state.to = f;
      syncDirInputs();
      if (state.from && state.to) computeRoute(true);
    });
    $('#pick-start').addEventListener('click', function () { startPick(); });
    $('#cancel-pick').addEventListener('click', function () { stopPick(); });
    $$('[data-from]').forEach(function (b) {
      b.addEventListener('click', function () { setFrom(b.getAttribute('data-from')); });
    });

    $('#info-card').addEventListener('click', function (ev) {
      var a = ev.target.closest('[data-directions]');
      if (!a) return;
      ev.preventDefault();
      setTo(a.getAttribute('data-directions'));
      setTab('dir');
      if (!state.from && !state.fromPoint) {
        $('#dir-result').innerHTML = '<p class="hint-box">Where are you now? Choose a quick start, type a place, or tap <b>⌖</b> to pick a spot on the map.</p>';
        setTimeout(function () { if (!sheetMode.matches) $('#dir-from').focus(); }, 50);
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && state.map && state.map.isPicking()) stopPick();
    });
  }

  function enterMap(params) {
    if (!state.map) initMap();
    else state.map.resize();
    var room = params.get('room'), to = params.get('to'), from = params.get('from'), mode = params.get('mode');
    if (to && Store.get(to)) {
      sheet('open');
      setTab('dir');
      if (from && Store.get(from)) setFrom(from, true);
      setTo(to);
      if (!state.from && !state.fromPoint) {
        $('#dir-result').innerHTML = '<p class="hint-box">Where are you now? Choose a quick start, type a place, or tap <b>⌖</b> to pick a spot on the map.</p>';
      }
    } else if (room && Store.get(room)) {
      selectPlace(room, { focus: true, open: true, keepHash: true });
      setTab('info');
    } else if (mode === 'directions') {
      setTab('dir');
      sheet('open');
    }
  }

  function setTab(t) {
    state.tab = t;
    $('#tab-info').setAttribute('aria-selected', String(t === 'info'));
    $('#tab-dir').setAttribute('aria-selected', String(t === 'dir'));
    $('#pane-info').hidden = t !== 'info';
    $('#pane-dir').hidden = t !== 'dir';
  }

  function selectPlace(id, o) {
    o = o || {};
    var e = Store.get(id);
    if (!e) return;
    state.selected = id;
    state.map.select(e.mapped ? id : null);
    $('#info-empty').hidden = true;
    $('#info-card').innerHTML = infoHTML(e, { inMap: true });
    if (state.tab !== 'info' && !o.stayOnTab) setTab('info');
    if (o.open) sheet('open');
    if (o.focus && e.mapped) state.map.focus(id);
    if (!o.keepHash) setHashQuiet('map', { room: id });
  }

  function onMapClick(id, pt) {
    if (state.map.isPicking()) {
      if (id) setFrom(id);
      else { state.from = null; state.fromPoint = pt; syncDirInputs(); }
      stopPick();
      if (state.to) computeRoute(true);
      return;
    }
    if (id) selectPlace(id, { open: true, stayOnTab: false });
    else if (sheetMode.matches && sheetState() !== 'peek') sheet('peek'); /* tap empty ground: show more map */
  }

  function startPick() {
    state.map.setPickMode(true);
    $('#map-hint').hidden = false;
    if (sheetMode.matches) sheet('peek');
  }
  function stopPick() {
    state.map.setPickMode(false);
    $('#map-hint').hidden = true;
    if (sheetMode.matches) sheet('open');
  }

  function setFrom(id, silent) {
    state.from = id;
    state.fromPoint = null;
    syncDirInputs();
    if (!silent && state.to) computeRoute(true);
  }
  function setTo(id) {
    state.to = id;
    syncDirInputs();
    if (state.from || state.fromPoint) computeRoute(true);
    else if (state.map) { state.map.clearRoute(); state.map.select(id); state.map.focus(id); }
  }

  function syncDirInputs() {
    $('#dir-from').value = state.fromPoint ? 'Selected spot on the map' :(state.from ? nameOf(Store.get(state.from)) : '');
    $('#dir-to').value = state.to ? nameOf(Store.get(state.to)) : '';
  }

  function resolveTyped() {
    var fv = $('#dir-from').value.trim(), tv = $('#dir-to').value.trim();
    if (fv && !state.fromPoint && (!state.from || fv !== nameOf(Store.get(state.from)))) {
      var f = Store.search(fv)[0];
      state.from = f ? f.entry.id : null;
    }
    if (!fv) { state.from = null; state.fromPoint = null; }
    if (tv && (!state.to || tv !== nameOf(Store.get(state.to)))) {
      var t = Store.search(tv)[0];
      state.to = t ? t.entry.id : null;
    }
    if (!tv) state.to = null;
    syncDirInputs();
  }

  function center(g) { return [g.x + g.w / 2, g.y + g.h / 2]; }

  function computeRoute(fit) {
    var out = $('#dir-result');
    var toE = Store.get(state.to);
    var fromE = state.from ? Store.get(state.from) : null;
    if (!toE) { out.innerHTML = '<p class="error-box">Choose a destination. You can type a room number, section or adviser.</p>'; return; }
    if (!fromE && !state.fromPoint) { out.innerHTML = '<p class="hint-box">Choose a starting point first.</p>'; return; }
    if (!toE.mapped) { out.innerHTML = '<p class="error-box">' + esc(toE.title) + ' is not drawn on the map yet, so directions are not available.</p>'; return; }
    if (fromE && !fromE.mapped) { out.innerHTML = '<p class="error-box">' + esc(fromE.title) + ' is not drawn on the map yet. Choose another starting point.</p>'; return; }
    if (fromE && fromE.id === toE.id) { out.innerHTML = '<p class="hint-box">You are already there!</p>'; return; }

    var starts = state.fromPoint ? [state.fromPoint] : CampusMap.doorPoints(fromE.geom);
    var goals = CampusMap.doorPoints(toE.geom);
    var r = Pathfinder.find(starts, goals);
    if (!r) { out.innerHTML = '<p class="error-box">Sorry, no walking route could be found between these places.</p>'; return; }

    var fromCenter = fromE && fromE.type !== 'gate' && fromE.geom.door ? center(fromE.geom) : null;
    var toCenter = toE.geom.door ? center(toE.geom) : null;
    state.map.select(toE.id);
    state.map.showRoute({ points: r.points, fromCenter: fromCenter, toCenter: toCenter });
    if (fit) state.map.fitPoints(r.points.concat(toCenter ? [toCenter] : []));

    var steps = buildSteps(r.points, fromE, toE);
    out.innerHTML =
      '<div class="route-summary"><div><strong>' + steps.minutes + ' min</strong><span>walk · about ' + steps.meters + ' m</span></div>' +
      '<p>To <b>' + esc(nameOf(toE)) + '</b>' + (toE.floorText ? ' · ' + esc(toE.floorText) : '') + '</p></div>' +
      '<ol class="steps">' + steps.list.map(function (s) {
        return '<li class="step step-' + s.kind + '"><span class="step-ico" aria-hidden="true">' + s.icon + '</span><span>' + s.html + '</span></li>';
      }).join('') + '</ol>' +
      '<p class="muted small">Distances and times are estimates. Routes follow the open walkways shown on the map.</p>';
    setHashQuiet('map', state.from ? { from: state.from, to: state.to } : { to: state.to });
  }

  /* ---------- Turn-by-turn ---------- */
  var landmarkPool = null;
  function landmarks() {
    if (!landmarkPool) landmarkPool = Store.all().filter(function (e) { return e.mapped && e.geom && e.type !== 'blank' && e.type !== 'structure' && e.label; });
    return landmarkPool;
  }
  function distToRect(p, g) {
    var dx = Math.max(g.x - p[0], 0, p[0] - (g.x + g.w));
    var dy = Math.max(g.y - p[1], 0, p[1] - (g.y + g.h));
    return Math.hypot(dx, dy);
  }
  function landmarkNear(p, exclude) {
    var best = null, bd = Infinity;
    landmarks().forEach(function (e) {
      if (exclude.indexOf(e.id) > -1) return;
      var d = distToRect(p, e.geom) + (e.type === 'classroom' ? 18 : 0) - (['park', 'court', 'plaza', 'canteen'].indexOf(e.type) > -1 ? 12 : 0);
      if (d < bd) { bd = d; best = e; }
    });
    return best;
  }
  function lmName(e) {
    if (!e) return 'the walkway';
    if (e.num && e.label && e.label !== 'Room ' + e.num) return e.label;
    if (e.type === 'park' || e.type === 'court' || e.type === 'plaza' || e.type === 'canteen') return 'the ' + e.label;
    return e.label || e.title;
  }

  function roundM(units) { return Math.max(5, Math.round(units * MPU / 5) * 5); }

  /* Builds the step-by-step route instructions shown in the Directions panel. */
  function buildSteps(pts, fromE, toE) {
    var exclude = [fromE ? fromE.id : '', toE.id];
    /* 1. raw segments  2. fold short ones (< ~12 m) into the previous leg  3. fold near-straight turns */
    var MIN_LEG = 12 / MPU;
    var raw = [];
    for (var i = 1; i < pts.length; i++) {
      var len0 = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      if (len0 > 0.5) raw.push({ a: i - 1, b: i, len: len0 });
    }
    var folded = [];
    raw.forEach(function (s, k) {
      var prev = folded[folded.length - 1];
      if (prev && (s.len < MIN_LEG || (k === raw.length - 1 && s.len < MIN_LEG * 1.5))) { prev.b = s.b; prev.len += s.len; }
      else folded.push({ a: s.a, b: s.b, len: s.len });
    });
    var legs = [];
    folded.forEach(function (l) {
      var s = pts[l.a], e = pts[l.b];
      var dx = e[0] - s[0], dy = e[1] - s[1], d = Math.hypot(dx, dy) || 1;
      l.dir = [dx / d, dy / d];
      var prev = legs[legs.length - 1];
      if (!prev) { l.turn = 0; legs.push(l); return; }
      var cross = prev.dir[0] * l.dir[1] - prev.dir[1] * l.dir[0];
      var dot = prev.dir[0] * l.dir[0] + prev.dir[1] * l.dir[1];
      var ang = Math.atan2(Math.abs(cross), dot) * 180 / Math.PI;
      if (ang < 28) { prev.b = l.b; prev.len += l.len; return; }
      l.turn = ang; l.right = cross > 0;
      legs.push(l);
    });

    var total = legs.reduce(function (s, l) { return s + l.len; }, 0);
    var meters = roundM(total);
    var destName = nameOf(toE);
    var startName = fromE ? nameOf(fromE) : 'the spot you selected';
    var downstairs = fromE && fromE.floor > 1;
    var climb = toE.floor > 1 ? toE.floor - 1 : 0;

    var list = [];
    var startText = 'Start at <b>' + esc(startName) + '</b>.';
    if (downstairs) startText += ' Take the stairs down to the ground floor and exit the ' + esc(fromE.building || 'building') + '.';
    list.push({ kind: 'start', icon: 'A', html: startText });

    legs.forEach(function (l, i) {
      var m = roundM(l.len);
      var near = lmName(landmarkNear(pts[l.b], exclude));
      var at = i > 0 ? lmName(landmarkNear(pts[l.a], exclude)) : '';
      var last = i === legs.length - 1;
      if (last && i === 0) near = destName;              /* one straight walk: head to the destination */
      var skipToward = (last && i > 0) || near === at;    /* avoid "near X ... toward X" */
      var toward = skipToward ? '' : ' toward <b>' + esc(near) + '</b>';
      if (i === 0) {
        list.push({ kind: 'walk', icon: '↑', html: 'Walk about ' + m + ' m' + toward + '.' });
      } else {
        var word = l.turn > 140 ? 'Turn around' : l.turn < 60 ? (l.right ? 'Bear right' : 'Bear left') : (l.right ? 'Turn right' : 'Turn left');
        var icon = l.turn > 140 ? '↺' : l.right ? '↱' : '↰';
        list.push({ kind: 'turn', icon: icon, html: word + ' near <b>' + esc(at) + '</b> and walk about ' + m + ' m' + toward + '.' });
      }
    });

    var arrive = 'Arrive at <b>' + esc(destName) + '</b>.';
    if (climb) {
      arrive = 'Enter the <b>' + esc(toE.building || 'building') + '</b> and take the stairs up to the <b>' + esc(toE.floorText) + '</b>. ' + arrive;
    } else if (toE.floor === 1 && toE.building) {
      arrive += ' It is on the ground floor of the ' + esc(toE.building) + '.';
    }
    list.push({ kind: 'end', icon: 'B', html: arrive });

    var seconds = (meters / WALK_SPEED) + climb * 30 + (downstairs ? (fromE.floor - 1) * 25 : 0);
    return { list: list, meters: meters, minutes: Math.max(1, Math.round(seconds / 60)) };
  }

  /* =========================================================
     DIRECTORY
     ========================================================= */
  var dirState = { q: '', filter: 'all', shown: 40 };

  function initDirectory() {
    $('#dir-search').addEventListener('submit', function (e) {
      e.preventDefault();
      var q = $('#directory-q').value.trim();
      setHashQuiet('directory', q ? { q: q } : null);
      dirState.q = q; dirState.shown = 40;
      renderResults();
    });
    var t;
    $('#directory-q').addEventListener('input', function () {
      clearTimeout(t);
      t = setTimeout(function () {
        dirState.q = $('#directory-q').value.trim();
        dirState.shown = 40;
        setHashQuiet('directory', dirState.q ? { q: dirState.q } : null);
        renderResults();
      }, 160);
    });
    $$('[data-filter]').forEach(function (b) {
      b.addEventListener('click', function () {
        dirState.filter = b.getAttribute('data-filter');
        dirState.shown = 40;
        $$('[data-filter]').forEach(function (x) { x.setAttribute('aria-checked', String(x === b)); });
        renderResults();
      });
    });
    $('#show-more').addEventListener('click', function () { dirState.shown += 40; renderResults(); });
  }

  function enterDirectory(params) {
    var q = params.get('q') || '';
    $('#directory-q').value = q;
    dirState.q = q;
    dirState.shown = 40;
    renderResults();
  }

  function renderResults() {
    var res = Store.search(dirState.q, dirState.filter);
    var count = $('#result-count');
    var box = $('#results');
    if (!res.length) {
      count.textContent = '';
      box.innerHTML = '<div class="no-results"><h2>No results' + (dirState.q ? ' for “' + esc(dirState.q) + '”' : '') + '</h2>' +
        '<p>Check the spelling, or try something else:</p><ul><li>a room number, like <b>52</b></li><li>a section name, like <b>Einstein</b></li><li>an adviser\'s surname, like <b>Montejo</b></li><li>a place, like <b>Clinic</b> or <b>Library</b></li></ul>' +
        (dirState.filter !== 'all' ? '<p>You can also set the filter back to <b>All</b>.</p>' : '') + '</div>';
      $('#show-more').hidden = true;
      return;
    }
    count.textContent = dirState.q
      ? res.length + (res.length === 1 ? ' result' : ' results') + ' for “' + dirState.q + '”'
      : 'Showing all ' + res.length + ' places';
    box.innerHTML = res.slice(0, dirState.shown).map(function (r) {
      return '<div class="result card">' + infoHTML(r.entry, { hits: r.hits }) + '</div>';
    }).join('');
    $('#show-more').hidden = res.length <= dirState.shown;
  }

  /* =========================================================
     ADMIN
     ========================================================= */
  var PASS_KEY = 'vnhs-nav-pass';
  var DEFAULT_PASS = 'vnhs-admin';
  var adminReady = false, editing = null;

  function hash(s) {
    var h = 2166136261;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0).toString(36);
  }
  function passHash() {
    try { return localStorage.getItem(PASS_KEY) || hash(DEFAULT_PASS); } catch (e) { return hash(DEFAULT_PASS); }
  }
  function unlocked() { try { return sessionStorage.getItem('vnhs-nav-admin') === '1'; } catch (e) { return false; } }
  function setUnlocked(v) { try { if (v) sessionStorage.setItem('vnhs-nav-admin', '1'); else sessionStorage.removeItem('vnhs-nav-admin'); } catch (e) { /* ignore */ } }

  function enterAdmin() {
    if (!adminReady) initAdmin();
    var u = unlocked();
    $('#admin-lock').hidden = u;
    $('#admin-app').hidden = !u;
    if (u) { renderAdminList(); updateNotice(); }
    else setTimeout(function () { $('#admin-pass').focus(); }, 30);
  }

  function initAdmin() {
    adminReady = true;
    $('#admin-lock').addEventListener('submit', function (e) {
      e.preventDefault();
      if (hash($('#admin-pass').value) === passHash()) {
        setUnlocked(true);
        $('#admin-pass').value = '';
        $('#lock-error').hidden = true;
        enterAdmin();
      } else {
        $('#lock-error').hidden = false;
      }
    });
    $('#lock-btn').addEventListener('click', function () { setUnlocked(false); enterAdmin(); });
    $('#admin-filter').addEventListener('input', renderAdminList);
    $('#admin-rooms').addEventListener('click', function (e) {
      var li = e.target.closest('[data-id]');
      if (li) openEditor(li.getAttribute('data-id'));
    });
    $('#add-section').addEventListener('click', function () { addSectionRow('', ''); });
    $('#f-sections').addEventListener('click', function (e) {
      var b = e.target.closest('[data-remove]');
      if (b) b.closest('.sec-row').remove();
    });
    $('#revert-room').addEventListener('click', function () { if (editing) openEditor(editing); });
    $('#admin-form').addEventListener('submit', function (e) {
      e.preventDefault();
      if (!editing) return;
      var data = {
        program: $('#f-program').value,
        floor: $('#f-floor').value,
        building: $('#f-building').value,
        head: $('#f-head').value,
        notes: $('#f-notes').value,
        aliases: $('#f-aliases').value.split(',').map(function (s) { return s.trim(); }).filter(Boolean),
        unmapped: Store.getRaw(editing).unmapped,
        sections: $$('.sec-row', $('#f-sections')).map(function (row) {
          return { section: $('.s-sec', row).value.trim(), adviser: $('.s-adv', row).value.trim() };
        })
      };
      var ok = Store.save(editing, data);
      landmarkPool = null;
      $('#save-msg').textContent = ok ? 'Saved on this device.' : 'Saved for this session only (browser storage is unavailable).';
      setTimeout(function () { $('#save-msg').textContent = ''; }, 3000);
      renderAdminList();
      updateNotice();
      refreshAfterDataChange();
    });

    $('#dl-js').addEventListener('click', function () { download('room-info.js', Store.exportJS(), 'text/javascript'); });
    $('#dl-json').addEventListener('click', function () { download('room-info.json', Store.exportJSON(), 'application/json'); });
    $('#import-json').addEventListener('change', function () {
      var f = this.files[0];
      if (!f) return;
      var reader = new FileReader();
      reader.onload = function () {
        try {
          Store.replaceAll(JSON.parse(reader.result));
          landmarkPool = null;
          toast('Room data imported.');
          renderAdminList(); updateNotice(); refreshAfterDataChange();
          if (editing) openEditor(editing);
        } catch (err) { toast('Could not import: ' + err.message); }
      };
      reader.readAsText(f);
      this.value = '';
    });
    $('#reset-local').addEventListener('click', function () {
      if (!confirm('Discard all changes saved in this browser and go back to the published room data?')) return;
      Store.resetLocal();
      landmarkPool = null;
      toast('Local changes discarded.');
      renderAdminList(); updateNotice(); refreshAfterDataChange();
      if (editing) openEditor(editing);
    });
    $('#change-pass').addEventListener('click', function () {
      var p = prompt('New passcode (at least 6 characters):');
      if (p == null) return;
      if (p.length < 6) { toast('Passcode must be at least 6 characters.'); return; }
      try { localStorage.setItem(PASS_KEY, hash(p)); toast('Passcode changed on this device.'); } catch (e) { toast('Could not save passcode.'); }
    });
    $('#program-list').innerHTML = Object.keys(Store.programs).map(function (k) { return '<option value="' + esc(k) + '">'; }).join('');
  }

  function updateNotice() {
    var changed = Store.hasLocalChanges();
    $('#admin-notice').className = 'notice' + (changed ? ' warn' : '');
    $('#admin-notice').innerHTML = changed
      ? '<b>Your changes are saved in this browser only.</b> To publish them for all visitors, click <b>Download room-info.js</b> and replace <code>js/room-info.js</code> on the web server with it.'
      : 'You are editing the published room data. Changes are saved in this browser first. Download <b>room-info.js</b> to publish them.';
  }

  function renderAdminList() {
    var q = $('#admin-filter').value.trim();
    var list = Store.search(q).map(function (r) { return r.entry; }).filter(function (e) { return e.type !== 'gate'; });
    $('#admin-rooms').innerHTML = list.map(function (e) {
      return '<li role="option" tabindex="0" data-id="' + esc(e.id) + '" aria-selected="' + (e.id === editing) + '"><span class="sw sw-' + esc(e.type) + '"></span><span><b>' + esc(e.title) + '</b><small>' +
        esc(e.sections.length ? e.sections.map(function (s) { return s.section; }).join(', ') : (e.label !== e.title ? e.label : e.typeName)) + '</small></span></li>';
    }).join('');
  }
  $('#admin-rooms').addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && e.target.matches('[data-id]')) openEditor(e.target.getAttribute('data-id'));
  });

  function openEditor(id) {
    var e = Store.get(id);
    if (!e) return;
    editing = id;
    $('#admin-placeholder').hidden = true;
    $('#admin-fields').hidden = false;
    $('#admin-title').textContent = nameOf(e);
    $('#f-program').value = e.program;
    $('#f-floor').value = e.floor || '';
    $('#f-building').value = e.building;
    $('#f-head').value = e.head;
    $('#f-notes').value = e.notes;
    $('#f-aliases').value = e.aliases.join(', ');
    $('#f-sections').innerHTML = '';
    e.sections.forEach(function (s) { addSectionRow(s.section, s.adviser); });
    if (!e.sections.length && e.type === 'classroom') addSectionRow('', '');
    $$('#admin-rooms [data-id]').forEach(function (li) { li.setAttribute('aria-selected', String(li.getAttribute('data-id') === id)); });
    if (mq.matches) $('#admin-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function addSectionRow(sec, adv) {
    var n = $$('.sec-row').length + 1;
    var row = document.createElement('div');
    row.className = 'sec-row';
    row.innerHTML = '<input class="s-sec" placeholder="Grade & section (e.g. G-10 Sampaguita)" aria-label="Section ' + n + '" value="' + esc(sec) + '">' +
      '<input class="s-adv" placeholder="Adviser" aria-label="Adviser for section ' + n + '" value="' + esc(adv) + '">' +
      '<button type="button" class="icon-btn" data-remove aria-label="Remove section ' + n + '">✕</button>';
    $('#f-sections').appendChild(row);
  }

  function download(name, data, type) {
    var blob = data instanceof Blob ? data : new Blob([data], { type: type });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  function refreshAfterDataChange() {
    if (state.selected && state.map) {
      var e = Store.get(state.selected);
      if (e) $('#info-card').innerHTML = infoHTML(e, { inMap: true });
    }
  }

  /* =========================================================
     Boot
     ========================================================= */
  initHome();
  initDirectory();
  window.addEventListener('hashchange', route);
  route();

  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () { /* offline support is optional */ }); });
  }
})();
