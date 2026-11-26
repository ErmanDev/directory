/* 2D campus map: SVG rendering with light textures, pan/zoom, selection and route drawing. */
(function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  var DATA = window.MAP_DATA;
  var W = DATA.width, H = DATA.height;

  var FILL = {
    classroom: ['#f5e6c4', '#8a6a35'],
    office: ['#cfe2f3', '#3a6a94'],
    lab: ['#e2d8f3', '#64519b'],
    facility: ['#f4d6c3', '#9c5a35'],
    canteen: ['#ffd59e', '#b0670f'],
    cr: ['#c9ece6', '#2b8577'],
    zone: ['#efe2c8', '#8a6a35'],
    blank: ['#e4e0d7', '#9a948a'],
    structure: ['#bdb6a9', '#8a8377']
  };

  /* ---------- helpers ---------- */
  function el(name, attrs, parent) {
    var e = document.createElementNS(NS, name);
    if (attrs) for (var k in attrs) if (attrs[k] != null) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  function rng(seed) {
    var s = seed >>> 0 || 1;
    return function () { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 10000) / 10000; };
  }

  var noiseURL = null;
  function noiseTexture() {
    if (noiseURL) return noiseURL;
    var c = document.createElement('canvas');
    c.width = c.height = 128;
    var ctx = c.getContext('2d');
    var img = ctx.createImageData(128, 128);
    var r = rng(7);
    for (var i = 0; i < img.data.length; i += 4) {
      var v = r() * 255;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 26 + r() * 30;
    }
    ctx.putImageData(img, 0, 0);
    noiseURL = c.toDataURL('image/png');
    return noiseURL;
  }

  function doorPoints(g) {
    if (!g) return [];
    if (Array.isArray(g.door)) return g.door.map(function (p) { return [p[0], p[1]]; });
    var cx = g.x + g.w / 2, cy = g.y + g.h / 2;
    if (!g.door) return [[cx, cy]];
    var out = [];
    g.door.split('').forEach(function (s) {
      if (s === 'n') out.push([cx, g.y - 10]);
      if (s === 's') out.push([cx, g.y + g.h + 10]);
      if (s === 'w') out.push([g.x - 10, cy]);
      if (s === 'e') out.push([g.x + g.w + 10, cy]);
    });
    return out;
  }

  function fitText(label, w, h, maxFs) {
    var words = label.split(/\s+/).filter(Boolean);
    function wrap(maxChars) {
      var lines = [], cur = '';
      words.forEach(function (wd) {
        var t = cur ? cur + ' ' + wd : wd;
        if (t.length <= maxChars || !cur) cur = t;
        else { lines.push(cur); cur = wd; }
      });
      if (cur) lines.push(cur);
      return lines;
    }
    for (var fs = maxFs; fs >= 5; fs -= 0.5) {
      var maxChars = Math.max(1, Math.floor((w * 0.88) / (fs * 0.55)));
      var lines = wrap(maxChars);
      var widest = Math.max.apply(null, lines.map(function (l) { return l.length; }));
      if (widest <= maxChars && lines.length * fs * 1.12 <= h * 0.9) return { fs: fs, lines: lines };
    }
    return { fs: 5, lines: wrap(Math.floor((w * 0.9) / (5 * 0.55))) };
  }

  /* ---------- defs: textures ---------- */
  function buildDefs(svg, P) {
    var defs = el('defs', null, svg);
    var noise = noiseTexture();

    var ground = el('pattern', { id: P + 'ground', width: 128, height: 128, patternUnits: 'userSpaceOnUse' }, defs);
    el('rect', { width: 128, height: 128, fill: '#ece7dc' }, ground);
    el('image', { href: noise, width: 128, height: 128, opacity: 0.55 }, ground);

    var grass = el('pattern', { id: P + 'grass', width: 96, height: 96, patternUnits: 'userSpaceOnUse' }, defs);
    el('rect', { width: 96, height: 96, fill: '#93c472' }, grass);
    el('image', { href: noise, width: 96, height: 96, opacity: 0.7 }, grass);
    var r = rng(11);
    for (var i = 0; i < 70; i++) {
      var x = r() * 96, y = r() * 96, a = (r() - 0.5) * 1.2, len = 3 + r() * 4;
      el('line', {
        x1: x, y1: y, x2: x + Math.sin(a) * len, y2: y - Math.cos(a) * len,
        stroke: r() > 0.5 ? '#6fa24f' : '#b4dc8f', 'stroke-width': 1.1, 'stroke-linecap': 'round', opacity: 0.8
      }, grass);
    }

    var conc = el('pattern', { id: P + 'concrete', width: 48, height: 48, patternUnits: 'userSpaceOnUse' }, defs);
    el('rect', { width: 48, height: 48, fill: '#d8d5ce' }, conc);
    el('image', { href: noise, width: 48, height: 48, opacity: 0.8 }, conc);
    el('path', { d: 'M48 0H0V48', fill: 'none', stroke: 'rgba(0,0,0,.09)', 'stroke-width': 1 }, conc);

    var brick = el('pattern', { id: P + 'brick', width: 44, height: 22, patternUnits: 'userSpaceOnUse' }, defs);
    el('rect', { width: 44, height: 22, fill: '#ddc7a6' }, brick);
    el('image', { href: noise, width: 44, height: 22, opacity: 0.8, preserveAspectRatio: 'none' }, brick);
    el('path', { d: 'M0 .5H44M0 11.5H44M.5 0V11M22.5 11V22', fill: 'none', stroke: 'rgba(120,85,45,.25)', 'stroke-width': 1 }, brick);

    var roof = el('pattern', { id: P + 'roof', width: 64, height: 64, patternUnits: 'userSpaceOnUse' }, defs);
    el('image', { href: noise, width: 64, height: 64, opacity: 0.9 }, roof);
    el('path', { d: 'M-8 8L8 -8M0 64L64 0M56 72L72 56M-8 40L40 -8M24 72L72 24', stroke: 'rgba(255,255,255,.28)', 'stroke-width': 1.2 }, roof);

    var hatch = el('pattern', { id: P + 'hatch', width: 10, height: 10, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, defs);
    el('rect', { width: 10, height: 10, fill: '#cfc8bb' }, hatch);
    el('line', { x1: 0, y1: 0, x2: 0, y2: 10, stroke: 'rgba(0,0,0,.12)', 'stroke-width': 3 }, hatch);
    return defs;
  }

  /* ---------- static drawing ---------- */
  function draw(svg, P, interactive) {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    buildDefs(svg, P);
    var world = el('g', { class: 'world' }, svg);
    el('rect', { x: -400, y: -400, width: W + 800, height: H + 800, fill: '#dcd5c6' }, world);
    el('rect', { x: 0, y: 0, width: W, height: H, fill: 'url(#' + P + 'ground)', class: 'ground' }, world);
    el('rect', { x: 0, y: 0, width: W, height: H, fill: 'none', stroke: '#7d7466', 'stroke-width': 6 }, world);

    var L = {
      areas: el('g', { class: 'layer-areas' }, world),
      shadows: el('g', { class: 'layer-shadows', 'pointer-events': 'none' }, world),
      bld: el('g', { class: 'layer-buildings' }, world),
      notes: el('g', { class: 'layer-notes', 'pointer-events': 'none' }, world),
      labels: el('g', { class: 'layer-labels', 'pointer-events': 'none' }, world),
      gates: el('g', { class: 'layer-gates' }, world),
      route: el('g', { class: 'layer-route', 'pointer-events': 'none' }, world),
      marker: el('g', { class: 'layer-marker', 'pointer-events': 'none' }, world)
    };
    var nodes = {};

    DATA.places.forEach(function (p) {
      var g, base;
      var dest = p.type !== 'structure' && !(p.type === 'blank' && !p.label);
      if (p.type === 'park' || p.type === 'court' || p.type === 'plaza') {
        g = el('g', { class: 'place area area-' + p.type, 'data-id': p.id }, L.areas);
        var fill = p.type === 'park' ? 'grass' : p.type === 'court' ? 'concrete' : 'brick';
        base = el('rect', { class: 'base', x: p.x, y: p.y, width: p.w, height: p.h, rx: 4, fill: 'url(#' + P + fill + ')', stroke: p.type === 'park' ? '#5e8f44' : '#9b8f7d', 'stroke-width': 2 }, g);
        if (p.type === 'park') drawTrees(g, p);
        if (p.type === 'court') drawCourt(g);
        if (p.type === 'plaza') drawQuad(g, p);
      } else {
        var c = FILL[p.type] || FILL.classroom;
        el('rect', { x: p.x + 4, y: p.y + 5, width: p.w, height: p.h, fill: 'rgba(60,45,25,.18)', rx: 2 }, L.shadows);
        g = el('g', { class: 'place bld bld-' + p.type + (dest ? '' : ' inert'), 'data-id': dest ? p.id : null }, L.bld);
        base = el('rect', { class: 'base', x: p.x, y: p.y, width: p.w, height: p.h, rx: 2, fill: p.type === 'structure' ? 'url(#' + P + 'hatch)' : c[0], stroke: c[1], 'stroke-width': 1.6, 'stroke-dasharray': p.type === 'zone' ? '8 5' : null }, g);
        if (p.type !== 'structure') el('rect', { x: p.x, y: p.y, width: p.w, height: p.h, rx: 2, fill: 'url(#' + P + 'roof)', 'pointer-events': 'none' }, g);
      }
      if (dest && p.label) {
        var t = el('title', null, g);
        t.textContent = p.label;
      }
      nodes[p.id] = g;
      drawLabel(L.labels, p);
    });

    DATA.notes.forEach(function (n) {
      var t = el('text', { x: n.x, y: n.y, class: 'note note-' + n.c, 'text-anchor': 'middle', 'dominant-baseline': 'central' }, L.notes);
      t.textContent = n.t;
    });

    DATA.gates.forEach(function (gt) {
      var g = el('g', { class: 'place gate', 'data-id': gt.id }, L.gates);
      el('circle', { cx: gt.x, cy: gt.y, r: 17, class: 'gate-ring' }, g);
      el('path', { d: 'M' + (gt.x - 7) + ' ' + (gt.y + 7) + 'v-9a7 7 0 0 1 14 0v9', class: 'gate-icon' }, g);
      var tl = el('title', null, g); tl.textContent = gt.label;
      var lx = gt.id === 'boys-gate' ? gt.x - 2 : gt.x + 46;
      var ly = gt.id === 'boys-gate' ? gt.y - 34 : gt.y - 28;
      var t = el('text', { x: lx, y: ly, class: 'gate-label', 'text-anchor': 'middle' }, L.labels);
      t.textContent = gt.label;
      nodes[gt.id] = g;
    });

    if (!interactive) svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    return { layers: L, nodes: nodes };
  }

  function drawTrees(g, p) {
    var r = rng(p.x * 7 + p.y * 13);
    var count = Math.max(3, Math.round((p.w * p.h) / 5200));
    var cx = p.x + p.w / 2, cy = p.y + p.h / 2;
    for (var i = 0; i < count; i++) {
      var x = p.x + 14 + r() * (p.w - 28), y = p.y + 14 + r() * (p.h - 28);
      if (Math.abs(x - cx) < p.w * 0.42 && Math.abs(y - cy) < p.h * 0.3) continue; /* keep label area clear */
      var rad = Math.min(16, 8 + r() * 9, p.w / 5);
      el('circle', { cx: x + 3, cy: y + 4, r: rad, fill: 'rgba(30,60,20,.22)', 'pointer-events': 'none' }, g);
      el('circle', { cx: x, cy: y, r: rad, fill: r() > 0.5 ? '#4f8a3a' : '#5c9944', 'pointer-events': 'none' }, g);
      el('circle', { cx: x - rad * 0.3, cy: y - rad * 0.3, r: rad * 0.45, fill: 'rgba(255,255,255,.16)', 'pointer-events': 'none' }, g);
    }
  }

  function drawCourt(g) {
    var x = 398, y = 168, w = 176, h = 236, s = { fill: 'none', stroke: 'rgba(255,255,255,.75)', 'stroke-width': 2, 'pointer-events': 'none' };
    el('rect', Object.assign({ x: x, y: y, width: w, height: h }, s), g);
    el('line', Object.assign({ x1: x, y1: y + h / 2, x2: x + w, y2: y + h / 2 }, s), g);
    el('circle', Object.assign({ cx: x + w / 2, cy: y + h / 2, r: 20 }, s), g);
    el('rect', Object.assign({ x: x + w / 2 - 24, y: y, width: 48, height: 52 }, s), g);
    el('rect', Object.assign({ x: x + w / 2 - 24, y: y + h - 52, width: 48, height: 52 }, s), g);
  }

  function drawQuad(g, p) {
    var cx = p.x + 70, cy = p.y + p.h / 2;
    el('circle', { cx: cx, cy: cy, r: 26, fill: '#c9b08a', stroke: '#9b8463', 'stroke-width': 2, 'pointer-events': 'none' }, g);
    el('line', { x1: cx, y1: cy, x2: cx, y2: cy - 46, stroke: '#5b5146', 'stroke-width': 3, 'pointer-events': 'none' }, g);
    el('path', { d: 'M' + cx + ' ' + (cy - 46) + 'h22l-5 7 5 7h-22z', fill: '#2f6fb3', 'pointer-events': 'none' }, g);
  }

  function drawLabel(layer, p) {
    if (!p.label || p.type === 'structure') return;
    var cx = p.x + p.w / 2, cy = p.y + p.h / 2;
    var big = ['park', 'court', 'plaza', 'zone'].indexOf(p.type) > -1;
    var cls = 'label' + (big ? ' label-big label-' + p.type : '');
    var m = /^Room (\d+)$/.exec(p.label);
    var t;
    if (m && !big) {
      var fs = Math.min(p.h * 0.42, p.w * 0.36, 22);
      var small = Math.max(6, fs * 0.5);
      if (p.h < 36) {
        t = el('text', { x: cx, y: cy, class: cls, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': Math.min(p.h * 0.7, 12) }, layer);
        t.textContent = p.label;
      } else {
        t = el('text', { x: cx, y: cy, class: cls, 'text-anchor': 'middle' }, layer);
        var a = el('tspan', { x: cx, dy: -fs * 0.18, 'font-size': small, class: 'label-kicker' }, t); a.textContent = 'ROOM';
        var b = el('tspan', { x: cx, dy: fs * 0.95, 'font-size': fs, class: 'label-num' }, t); b.textContent = m[1];
      }
    } else {
      var maxFs = big ? Math.min(46, p.h * 0.22) : (p.type === 'office' || p.type === 'facility' ? 12.5 : 14);
      var f = fitText(p.label, p.w, p.h, maxFs);
      t = el('text', { x: cx, y: cy, class: cls, 'text-anchor': 'middle', 'font-size': f.fs }, layer);
      var startDy = -((f.lines.length - 1) * f.fs * 1.1) / 2 + f.fs * 0.35;
      f.lines.forEach(function (line, i) {
        var ts = el('tspan', { x: cx, dy: i === 0 ? startDy : f.fs * 1.1 }, t);
        ts.textContent = line;
      });
    }
    if (p.fl) {
      var bx = p.x + p.w - 17, by = p.y + 3;
      el('rect', { x: bx, y: by, width: 14, height: 10, rx: 3, class: 'floor-badge f' + p.fl }, layer);
      var ft = el('text', { x: bx + 7, y: by + 5.4, class: 'floor-badge-text', 'text-anchor': 'middle', 'dominant-baseline': 'central' }, layer);
      ft.textContent = p.fl + 'F';
    }
  }

  /* ---------- interactive map ---------- */
  function create(svg, opts) {
    opts = opts || {};
    var P = opts.prefix || 'm-';
    var interactive = opts.interactive !== false;
    var res = draw(svg, P, interactive);
    var api = { svg: svg };
    if (!interactive) return api;

    var L = res.layers, nodes = res.nodes;
    var vb = { x: 0, y: 0, w: W, h: H };
    var anim = null;
    var selectedId = null, highlighted = [], pickMode = false;

    function size() {
      var r = svg.getBoundingClientRect();
      return { w: Math.max(1, r.width), h: Math.max(1, r.height), left: r.left, top: r.top };
    }
    function ar() { var s = size(); return s.h / s.w; }

    function apply() { svg.setAttribute('viewBox', vb.x + ' ' + vb.y + ' ' + vb.w + ' ' + vb.h); }

    /* Parts of the map covered by overlays (bottom sheet), as fractions of its height. */
    function insets() {
      var s = size();
      var i = opts.insets ? opts.insets() : null;
      var t = i ? Math.max(0, i.top || 0) / s.h : 0;
      var b = i ? Math.max(0, i.bottom || 0) / s.h : 0;
      if (t + b > 0.75) { var k = 0.75 / (t + b); t *= k; b *= k; }
      return { t: t, b: b, vis: 1 - t - b };
    }

    /* Keep the map's edges at the edges of the visible area: you can't drag past the campus border.
       When zoomed out further than the map on one axis, the map is centered on that axis. */
    var EDGE = 10; /* small margin so the outer wall stays visible */
    function clamp(v) {
      var a = ar(), ins = insets();
      var X0 = -EDGE, Y0 = -EDGE, MW = W + EDGE * 2, MH = H + EDGE * 2;
      var maxW = Math.max(MW, MH / (a * ins.vis)), minW = 140;
      var w = Math.min(maxW, Math.max(minW, v.w)), h = w * a;
      var hv = h * ins.vis; /* visible height in map units */
      var x = v.x + (v.w - w) / 2, y = v.y + (v.h - h) / 2;

      if (w >= MW) x = X0 + (MW - w) / 2;
      else x = Math.min(X0 + MW - w, Math.max(X0, x));

      /* visible band is [y + h*t, y + h*t + hv] */
      if (hv >= MH) y = Y0 + (MH - hv) / 2 - h * ins.t;
      else y = Math.min(Y0 + MH - hv - h * ins.t, Math.max(Y0 - h * ins.t, y));

      return { x: x, y: y, w: w, h: h };
    }

    function setVB(v) { vb = clamp(v); apply(); }

    function animateTo(target, ms) {
      target = clamp(target);
      if (anim) cancelAnimationFrame(anim);
      var from = Object.assign({}, vb), t0 = performance.now(), dur = ms == null ? 450 : ms;
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) dur = 0;
      if (!dur) { vb = target; apply(); anim = null; return; }
      function step(now) {
        var t = dur ? Math.min(1, (now - t0) / dur) : 1;
        var e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        vb = { x: from.x + (target.x - from.x) * e, y: from.y + (target.y - from.y) * e, w: from.w + (target.w - from.w) * e, h: from.h + (target.h - from.h) * e };
        apply();
        if (t < 1) anim = requestAnimationFrame(step); else anim = null;
      }
      anim = requestAnimationFrame(step);
    }

    /* View that shows the box inside the visible (not covered) band of the map. */
    function fitBox(x, y, w, h, pad) {
      pad = pad == null ? 40 : pad;
      var a = ar(), ins = insets();
      x -= pad; y -= pad; w += pad * 2; h += pad * 2;
      var vh = Math.max(h / ins.vis, w * a), vw = vh / a;
      /* the visible band's center sits at (t + vis/2) of the view height */
      var cx = x + w / 2, cy = y + h / 2 + vh * (0.5 - ins.t - ins.vis / 2);
      return { x: cx - vw / 2, y: cy - vh / 2, w: vw, h: vh };
    }

    api.fitAll = function (instant) {
      var t = fitBox(0, 0, W, H, 10);
      if (instant) setVB(t); else animateTo(t);
    };

    api.resize = function () {
      var a = ar();
      var cx = vb.x + vb.w / 2, cy = vb.y + vb.h / 2;
      vb = clamp({ x: cx - vb.w / 2, y: cy - (vb.w * a) / 2, w: vb.w, h: vb.w * a });
      apply();
    };

    api.zoomBy = function (f) {
      var cx = vb.x + vb.w / 2, cy = vb.y + vb.h / 2;
      var nw = vb.w * f, nh = vb.h * f;
      animateTo({ x: cx - nw / 2, y: cy - nh / 2, w: nw, h: nh }, 220);
    };

    function geomOf(id) {
      var p = DATA.places.find(function (q) { return q.id === id; });
      if (p) return p;
      var g = DATA.gates.find(function (q) { return q.id === id; });
      return g ? { x: g.x - 20, y: g.y - 20, w: 40, h: 40 } : null;
    }

    api.focus = function (id, size) {
      var g = geomOf(id);
      if (!g) return;
      var s = Math.max(g.w, g.h);
      var ctx = size || Math.min(1100, Math.max(300, s * 4));
      var cx = g.x + g.w / 2, cy = g.y + g.h / 2;
      animateTo(fitBox(cx - ctx / 2, cy - ctx / 2, ctx, ctx, 0));
    };

    /* minSize: smallest area (map units) to show, so short legs aren't zoomed in too far. */
    api.fitPoints = function (pts, minSize, pad) {
      var m = minSize || 160;
      var xs = pts.map(function (p) { return p[0]; }), ys = pts.map(function (p) { return p[1]; });
      var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs), y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
      var w = Math.max(m, x1 - x0), h = Math.max(m, y1 - y0);
      animateTo(fitBox(x0 - (w - (x1 - x0)) / 2, y0 - (h - (y1 - y0)) / 2, w, h, pad == null ? 60 : pad));
    };

    /* Selection & highlight */
    function clearMarker() { while (L.marker.firstChild) L.marker.removeChild(L.marker.firstChild); }

    api.select = function (id) {
      if (selectedId && nodes[selectedId]) nodes[selectedId].classList.remove('selected');
      selectedId = id;
      clearMarker();
      if (!id) return;
      if (nodes[id]) nodes[id].classList.add('selected');
      var g = geomOf(id);
      if (!g) return;
      var cx = g.x + g.w / 2, top = g.y + g.h / 2;
      el('circle', { cx: cx, cy: top, r: 18, class: 'pulse' }, L.marker);
      var pin = el('g', { class: 'pin', transform: 'translate(' + cx + ' ' + top + ')' }, L.marker);
      el('path', { d: 'M0 0C-4-10-16-16-16-28a16 16 0 1 1 32 0C16-16 4-10 0 0z', class: 'pin-body' }, pin);
      el('circle', { cx: 0, cy: -28, r: 6.5, class: 'pin-dot' }, pin);
    };

    api.highlight = function (ids) {
      highlighted.forEach(function (id) { if (nodes[id]) nodes[id].classList.remove('hl'); });
      highlighted = (ids || []).filter(function (id) { return nodes[id]; });
      highlighted.forEach(function (id) { nodes[id].classList.add('hl'); });
      svg.classList.toggle('has-hl', highlighted.length > 0);
    };

    /* Route */
    api.clearRoute = function () {
      while (L.route.firstChild) L.route.removeChild(L.route.firstChild);
    };

    api.showRoute = function (route) {
      api.clearRoute();
      var pts = route.points.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' ');
      [route.fromCenter && [route.fromCenter, route.points[0]], route.toCenter && [route.points[route.points.length - 1], route.toCenter]].forEach(function (seg) {
        if (!seg) return;
        el('line', { x1: seg[0][0], y1: seg[0][1], x2: seg[1][0], y2: seg[1][1], class: 'route-link' }, L.route);
      });
      el('polyline', { points: pts, class: 'route-casing' }, L.route);
      el('polyline', { points: pts, class: 'route-line' }, L.route);
      el('polyline', { points: pts, class: 'route-flow' }, L.route);
      var s = route.points[0], e = route.points[route.points.length - 1];
      var sg = el('g', { class: 'route-start', transform: 'translate(' + s[0] + ' ' + s[1] + ')' }, L.route);
      el('circle', { r: 11 }, sg);
      var st = el('text', { 'text-anchor': 'middle', 'dominant-baseline': 'central' }, sg); st.textContent = 'A';
      var eg = el('g', { class: 'route-end', transform: 'translate(' + e[0] + ' ' + e[1] + ')' }, L.route);
      el('circle', { r: 11 }, eg);
      var et = el('text', { 'text-anchor': 'middle', 'dominant-baseline': 'central' }, eg); et.textContent = 'B';
    };

    api.setPickMode = function (on) { pickMode = !!on; svg.classList.toggle('picking', pickMode); };
    api.isPicking = function () { return pickMode; };

    /* Pan / zoom / click */
    var pointers = new Map(), drag = null, pinch = null;

    function toSvg(cx, cy) {
      var s = size();
      return { x: vb.x + ((cx - s.left) / s.w) * vb.w, y: vb.y + ((cy - s.top) / s.h) * vb.h };
    }

    svg.addEventListener('pointerdown', function (e) {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      svg.setPointerCapture(e.pointerId);
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (anim) { cancelAnimationFrame(anim); anim = null; }
      if (pointers.size === 1) {
        drag = { x: e.clientX, y: e.clientY, vb: Object.assign({}, vb), moved: false };
      } else if (pointers.size === 2) {
        var pts = Array.from(pointers.values());
        var mid = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
        pinch = { d: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y), vb: Object.assign({}, vb), anchor: toSvg(mid.x, mid.y) };
        if (drag) drag.moved = true;
      }
    });

    svg.addEventListener('pointermove', function (e) {
      if (!pointers.has(e.pointerId)) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      var s = size();
      if (pointers.size === 1 && drag) {
        var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
        if (!drag.moved && Math.hypot(dx, dy) < 6) return;
        drag.moved = true;
        svg.classList.add('dragging');
        setVB({ x: drag.vb.x - dx * (drag.vb.w / s.w), y: drag.vb.y - dy * (drag.vb.h / s.h), w: drag.vb.w, h: drag.vb.h });
      } else if (pointers.size === 2 && pinch) {
        var pts = Array.from(pointers.values());
        var d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        var mid = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
        var nw = pinch.vb.w * (pinch.d / Math.max(10, d)), nh = nw * (s.h / s.w);
        var fx = (mid.x - s.left) / s.w, fy = (mid.y - s.top) / s.h;
        setVB({ x: pinch.anchor.x - fx * nw, y: pinch.anchor.y - fy * nh, w: nw, h: nh });
      }
    });

    function endPointer(e) {
      if (!pointers.has(e.pointerId)) return;
      var wasSingle = pointers.size === 1;
      pointers.delete(e.pointerId);
      if (pointers.size < 2) pinch = null;
      if (wasSingle && drag && !drag.moved && e.type === 'pointerup') handleClick(e.clientX, e.clientY);
      if (pointers.size === 0) { drag = null; svg.classList.remove('dragging'); }
      else if (pointers.size === 1) {
        var p = Array.from(pointers.values())[0];
        drag = { x: p.x, y: p.y, vb: Object.assign({}, vb), moved: true };
      }
    }
    svg.addEventListener('pointerup', endPointer);
    svg.addEventListener('pointercancel', endPointer);

    function handleClick(cx, cy) {
      var target = document.elementFromPoint(cx, cy);
      var node = target && target.closest ? target.closest('[data-id]') : null;
      var pt = toSvg(cx, cy);
      if (opts.onClick) opts.onClick(node ? node.getAttribute('data-id') : null, [pt.x, pt.y]);
    }

    svg.addEventListener('wheel', function (e) {
      e.preventDefault();
      if (anim) { cancelAnimationFrame(anim); anim = null; }
      var dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
      var f = Math.exp(Math.max(-60, Math.min(60, dy)) * 0.0022);
      var p = toSvg(e.clientX, e.clientY);
      var nw = vb.w * f, nh = vb.h * f;
      setVB({ x: p.x - (p.x - vb.x) * (nw / vb.w), y: p.y - (p.y - vb.y) * (nh / vb.h), w: nw, h: nh });
    }, { passive: false });

    svg.addEventListener('keydown', function (e) {
      var step = vb.w * 0.12;
      var k = e.key;
      if (k === '+' || k === '=') api.zoomBy(0.75);
      else if (k === '-' || k === '_') api.zoomBy(1.33);
      else if (k === 'ArrowLeft') setVB({ x: vb.x - step, y: vb.y, w: vb.w, h: vb.h });
      else if (k === 'ArrowRight') setVB({ x: vb.x + step, y: vb.y, w: vb.w, h: vb.h });
      else if (k === 'ArrowUp') setVB({ x: vb.x, y: vb.y - step, w: vb.w, h: vb.h });
      else if (k === 'ArrowDown') setVB({ x: vb.x, y: vb.y + step, w: vb.w, h: vb.h });
      else if (k === '0') api.fitAll();
      else return;
      e.preventDefault();
    });

    if (window.ResizeObserver) new ResizeObserver(function () { api.resize(); }).observe(svg);
    api.fitAll(true);
    return api;
  }

  window.CampusMap = { create: create, doorPoints: doorPoints, data: DATA };
})();
