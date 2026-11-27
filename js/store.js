/* Data store: merges map geometry with room info, handles local edits and search. */
(function () {
  'use strict';

  var KEY = 'vnhs-nav-room-info-v1';
  var DEFAULT_INFO = JSON.parse(JSON.stringify(window.ROOM_INFO || {}));

  var PROGRAMS = {
    'BEC': 'Basic Education Curriculum',
    'SPA': 'Special Program in the Arts',
    'SPS': 'Special Program in Sports',
    'SPJ': 'Special Program in Journalism',
    'SPFL': 'Special Program in Foreign Language',
    'SSP': 'Special Science Program',
    'SSP 1': 'Special Science Program',
    'SSP 2': 'Special Science Program',
    'SNED': 'Special Needs Education',
    'SPED': 'Special Education',
    'SHS': 'Senior High School',
    'SPS / SHS': 'Special Program in Sports / Senior High School'
  };

  var TYPE_NAMES = {
    classroom: 'Classroom', office: 'Office', lab: 'Laboratory / Workshop', facility: 'Facility',
    canteen: 'Canteen', cr: 'Comfort Room', park: 'Park / Open Area', court: 'Covered Court',
    plaza: 'Open Area', zone: 'Classroom Area', gate: 'Gate'
  };

  var NON_DEST = { blank: 1, structure: 1 };

  function readLocal() {
    try {
      var raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }
  function writeLocal(obj) {
    try { localStorage.setItem(KEY, JSON.stringify(obj)); return true; } catch (e) { return false; }
  }

  var info = readLocal() || JSON.parse(JSON.stringify(DEFAULT_INFO));
  var entries = [];
  var byId = {};

  function ordinal(n) {
    n = Number(n);
    if (!n) return '';
    var s = ['th', 'st', 'nd', 'rd'], v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }

  function norm(s) {
    return String(s || '')
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/\bg(?:rade)?\s*-?\s*(\d{1,2})\b/g, 'g$1')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  function gradeOf(section) {
    var m = /G-?\s*(\d{1,2})/i.exec(section || '');
    return m ? Number(m[1]) : null;
  }

  function build() {
    entries = [];
    byId = {};
    var md = window.MAP_DATA;

    md.places.forEach(function (g) {
      if (NON_DEST[g.type] && !g.label) return;
      if (g.type === 'structure') return;
      add(makeEntry(g.id, g, info[g.id] || {}));
    });
    md.gates.forEach(function (g) {
      add(makeEntry(g.id, { id: g.id, label: g.label, type: 'gate', x: g.x - 12, y: g.y - 12, w: 24, h: 24, door: [[g.x, g.y]], num: null }, info[g.id] || {}));
    });
    Object.keys(info).forEach(function (id) {
      if (byId[id]) return;
      var m = /^r(\d+)$/.exec(id);
      var i = info[id] || {};
      var g = { id: id, label: i.label || (m ? 'Room ' + m[1] : id), type: i.type || 'classroom', num: m ? Number(m[1]) : null, door: null };
      var e = makeEntry(id, g, info[id]);
      e.mapped = false;
      add(e);
    });
    entries.sort(compareEntries);
  }

  function add(e) {
    if (byId[e.id]) return;
    byId[e.id] = e;
    entries.push(e);
  }

  function makeEntry(id, g, i) {
    var title = g.num ? 'Room ' + g.num : g.label;
    var subtitle = g.num && g.label && g.label !== 'Room ' + g.num ? g.label : (i.notes && g.num ? i.notes : '');
    var floor = i.floor != null && i.floor !== '' ? Number(i.floor) : g.fl;
    var e = {
      id: id,
      geom: g.x != null ? g : null,
      mapped: g.x != null && !i.unmapped,
      num: g.num,
      label: g.label,
      title: title,
      subtitle: subtitle,
      type: g.type,
      typeName: TYPE_NAMES[g.type] || 'Place',
      program: i.program || '',
      programName: PROGRAMS[(i.program || '').toUpperCase()] || '',
      building: i.building || g.bld || '',
      floor: floor || null,
      floorText: floor ? ordinal(floor) + ' Floor' : '',
      sections: (i.sections || []).map(function (s) { return { section: s.section || '', adviser: s.adviser || '' }; }),
      head: i.head || '',
      notes: i.notes || '',
      aliases: i.aliases || []
    };
    e.grades = e.sections.map(function (s) { return gradeOf(s.section); }).filter(Boolean);
    e._sec = e.sections.map(function (s) { return norm(s.section); });
    e._adv = e.sections.map(function (s) { return norm(s.adviser); });
    e._name = norm([e.title, e.label, e.subtitle].join(' '));
    e._other = norm([e.program, e.programName, e.building, e.notes, e.head, e.typeName, e.aliases.join(' ')].join(' '));
    return e;
  }

  function compareEntries(a, b) {
    if (a.num && b.num) return a.num - b.num;
    if (a.num) return -1;
    if (b.num) return 1;
    return a.title.localeCompare(b.title);
  }

  /* ---------- Search ---------- */
  function search(query, filter) {
    var q = norm(query).replace(/^(room|rm|rm no|room no|no)\s+/, '');
    var list = entries.filter(function (e) { return matchesFilter(e, filter); });
    if (!q) return list.map(function (e) { return { entry: e, score: 0, hits: [] }; });

    var results = [];
    if (/^\d+$/.test(q)) {
      list.forEach(function (e) {
        if (!e.num) return;
        var s = String(e.num);
        if (s === q) results.push({ entry: e, score: 1000, hits: [] });
        else if (s.indexOf(q) === 0) results.push({ entry: e, score: 300 - s.length, hits: [] });
      });
    } else {
      var tokens = q.split(' ');
      list.forEach(function (e) {
        var score = 0, hits = [], ok = true;
        tokens.forEach(function (t) {
          if (!ok) return;
          var found = false;
          e._sec.forEach(function (s, idx) { if (s.indexOf(t) > -1) { found = true; score += wordStart(s, t) ? 45 : 30; addHit(hits, idx); } });
          e._adv.forEach(function (s, idx) { if (s.indexOf(t) > -1) { found = true; score += wordStart(s, t) ? 45 : 30; addHit(hits, idx); } });
          if (e._name.indexOf(t) > -1) { found = true; score += wordStart(e._name, t) ? 40 : 25; }
          if (e._other.indexOf(t) > -1) { found = true; score += wordStart(e._other, t) ? 15 : 8; }
          if (!found) ok = false;
        });
        if (!ok) return;
        if (tokens.length > 1) {
          e._sec.concat(e._adv, [e._name]).forEach(function (f) { if (f.indexOf(q) > -1) score += 60; });
        }
        if (e._name === q) score += 200;
        results.push({ entry: e, score: score, hits: hits });
      });
    }
    results.sort(function (a, b) { return b.score - a.score || compareEntries(a.entry, b.entry); });
    return results;
  }
  function addHit(hits, i) { if (hits.indexOf(i) < 0) hits.push(i); }
  function wordStart(s, t) { return s.indexOf(t) === 0 || s.indexOf(' ' + t) > -1; }

  function matchesFilter(e, f) {
    switch (f) {
      case 'jhs': return e.grades.some(function (g) { return g >= 7 && g <= 10; }) || (e.sections.length && /SPED|SNED/.test(e.program));
      case 'shs': return e.grades.some(function (g) { return g >= 11; });
      case 'offices': return ['office', 'facility', 'canteen', 'cr', 'park', 'court', 'plaza', 'gate', 'zone'].indexOf(e.type) > -1;
      case 'labs': return e.type === 'lab' || /lab/i.test(e.notes);
      default: return true;
    }
  }

  /* ---------- Editing ---------- */
  function getRaw(id) { return JSON.parse(JSON.stringify(info[id] || {})); }

  function save(id, data) {
    var clean = {};
    var prev = info[id] || {};
    if (prev.label) clean.label = prev.label; /* name and type of places not drawn on the map */
    if (prev.type) clean.type = prev.type;
    ['program', 'building', 'head', 'notes'].forEach(function (k) { if (data[k]) clean[k] = String(data[k]).trim(); });
    if (data.floor) clean.floor = Number(data.floor);
    if (data.aliases && data.aliases.length) clean.aliases = data.aliases;
    if (data.unmapped) clean.unmapped = true;
    clean.sections = (data.sections || []).filter(function (s) { return s.section || s.adviser; });
    if (!clean.sections.length) delete clean.sections;
    info[id] = clean;
    var ok = writeLocal(info);
    build();
    return ok;
  }

  function replaceAll(obj) {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) throw new Error('Invalid data file.');
    info = obj;
    writeLocal(info);
    build();
  }

  function resetLocal() {
    try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
    info = JSON.parse(JSON.stringify(DEFAULT_INFO));
    build();
  }

  function hasLocalChanges() {
    return JSON.stringify(info) !== JSON.stringify(DEFAULT_INFO);
  }

  function exportJS() {
    return '/*\n * Room assignments for VNHS NaviGo.\n * Generated from the Admin page on ' + new Date().toISOString().slice(0, 10) +
      '.\n * Replace js/room-info.js on the web server with this file to publish the changes.\n */\nwindow.ROOM_INFO = ' +
      JSON.stringify(info, null, 2) + ';\n';
  }
  function exportJSON() { return JSON.stringify(info, null, 2); }

  build();

  window.Store = {
    all: function () { return entries.slice(); },
    get: function (id) { return byId[id] || null; },
    search: search,
    norm: norm,
    ordinal: ordinal,
    programs: PROGRAMS,
    getRaw: getRaw,
    save: save,
    replaceAll: replaceAll,
    resetLocal: resetLocal,
    hasLocalChanges: hasLocalChanges,
    exportJS: exportJS,
    exportJSON: exportJSON
  };
})();
