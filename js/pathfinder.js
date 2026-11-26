/*
 * Grid-based A* pathfinder for walking directions.
 * Buildings block movement; open ground, parks, the covered court and the quadrangle are walkable.
 * Paths prefer staying away from walls (clearance cost) and are smoothed afterwards.
 */
(function () {
  'use strict';

  var CELL = 8;
  var WALKABLE = { park: 1.25, court: 1.0, plaza: 1.0 };
  var cols, rows, blocked, clear, cost;

  function idx(c, r) { return r * cols + c; }
  function inside(c, r) { return c >= 0 && r >= 0 && c < cols && r < rows; }

  function build(data) {
    cols = Math.ceil(data.width / CELL);
    rows = Math.ceil(data.height / CELL);
    var n = cols * rows;
    blocked = new Uint8Array(n);
    cost = new Float32Array(n).fill(1);

    data.places.forEach(function (p) {
      var walk = WALKABLE[p.type];
      var c0 = Math.ceil(p.x / CELL - 0.5), c1 = Math.floor((p.x + p.w) / CELL - 0.5);
      var r0 = Math.ceil(p.y / CELL - 0.5), r1 = Math.floor((p.y + p.h) / CELL - 0.5);
      for (var r = Math.max(0, r0); r <= Math.min(rows - 1, r1); r++) {
        for (var c = Math.max(0, c0); c <= Math.min(cols - 1, c1); c++) {
          if (walk) cost[idx(c, r)] = Math.max(cost[idx(c, r)], walk);
          else blocked[idx(c, r)] = 1;
        }
      }
    });

    /* Clearance: distance (in cells) to the nearest blocked cell, capped at 4. */
    clear = new Uint8Array(n).fill(4);
    var queue = [];
    for (var i = 0; i < n; i++) if (blocked[i]) { clear[i] = 0; queue.push(i); }
    var head = 0;
    while (head < queue.length) {
      var cur = queue[head++];
      var cr = (cur / cols) | 0, cc = cur % cols, d = clear[cur];
      if (d >= 3) continue;
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (o) {
        var nc = cc + o[0], nr = cr + o[1];
        if (!inside(nc, nr)) return;
        var ni = idx(nc, nr);
        if (clear[ni] > d + 1) { clear[ni] = d + 1; queue.push(ni); }
      });
    }
    var PEN = [0, 1.6, 0.6, 0.15, 0];
    for (var j = 0; j < n; j++) if (!blocked[j]) cost[j] += PEN[clear[j]];
  }

  function cellOf(x, y) {
    return [Math.min(cols - 1, Math.max(0, Math.floor(x / CELL))), Math.min(rows - 1, Math.max(0, Math.floor(y / CELL)))];
  }

  /* Nearest free cell to a point (spiral BFS). */
  function nearestFree(x, y) {
    var s = cellOf(x, y);
    if (!blocked[idx(s[0], s[1])]) return idx(s[0], s[1]);
    var seen = new Uint8Array(cols * rows);
    var q = [idx(s[0], s[1])], h = 0;
    seen[q[0]] = 1;
    while (h < q.length) {
      var cur = q[h++];
      var cr = (cur / cols) | 0, cc = cur % cols;
      for (var k = 0; k < 4; k++) {
        var nc = cc + [1, -1, 0, 0][k], nr = cr + [0, 0, 1, -1][k];
        if (!inside(nc, nr)) continue;
        var ni = idx(nc, nr);
        if (seen[ni]) continue;
        seen[ni] = 1;
        if (!blocked[ni]) return ni;
        q.push(ni);
      }
    }
    return -1;
  }

  /* Binary heap keyed by f-score. */
  function Heap() { this.a = []; }
  Heap.prototype.push = function (node, f) {
    var a = this.a; a.push([node, f]);
    var i = a.length - 1;
    while (i > 0) {
      var p = (i - 1) >> 1;
      if (a[p][1] <= a[i][1]) break;
      var t = a[p]; a[p] = a[i]; a[i] = t; i = p;
    }
  };
  Heap.prototype.pop = function () {
    var a = this.a, top = a[0], last = a.pop();
    if (a.length) {
      a[0] = last;
      var i = 0;
      for (;;) {
        var l = 2 * i + 1, r = l + 1, m = i;
        if (l < a.length && a[l][1] < a[m][1]) m = l;
        if (r < a.length && a[r][1] < a[m][1]) m = r;
        if (m === i) break;
        var t = a[m]; a[m] = a[i]; a[i] = t; i = m;
      }
    }
    return top;
  };

  var SQ2 = Math.SQRT2;
  function octile(a, b) {
    var dx = Math.abs(a % cols - b % cols), dy = Math.abs(((a / cols) | 0) - ((b / cols) | 0));
    return (dx + dy) + (SQ2 - 2) * Math.min(dx, dy);
  }

  /* starts / goals: arrays of [x, y] points. Returns { points, start, goal } or null. */
  function find(starts, goals) {
    var sCells = starts.map(function (p) { return nearestFree(p[0], p[1]); }).filter(function (c) { return c >= 0; });
    var gCells = goals.map(function (p) { return nearestFree(p[0], p[1]); }).filter(function (c) { return c >= 0; });
    if (!sCells.length || !gCells.length) return null;

    var n = cols * rows;
    var g = new Float32Array(n).fill(Infinity);
    var from = new Int32Array(n).fill(-1);
    var closed = new Uint8Array(n);
    var isGoal = new Uint8Array(n);
    gCells.forEach(function (c) { isGoal[c] = 1; });
    function h(c) { var m = Infinity; for (var i = 0; i < gCells.length; i++) m = Math.min(m, octile(c, gCells[i])); return m; }

    var open = new Heap();
    sCells.forEach(function (c) { g[c] = 0; open.push(c, h(c)); });
    var DIRS = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, SQ2], [1, -1, SQ2], [-1, 1, SQ2], [-1, -1, SQ2]];
    var end = -1;

    while (open.a.length) {
      var cur = open.pop()[0];
      if (closed[cur]) continue;
      closed[cur] = 1;
      if (isGoal[cur]) { end = cur; break; }
      var cc = cur % cols, cr = (cur / cols) | 0;
      for (var k = 0; k < 8; k++) {
        var d = DIRS[k], nc = cc + d[0], nr = cr + d[1];
        if (!inside(nc, nr)) continue;
        var ni = idx(nc, nr);
        if (blocked[ni] || closed[ni]) continue;
        if (d[0] && d[1] && (blocked[idx(cc + d[0], cr)] || blocked[idx(cc, cr + d[1])])) continue;
        var ng = g[cur] + d[2] * (cost[ni] + cost[cur]) / 2;
        if (ng < g[ni]) { g[ni] = ng; from[ni] = cur; open.push(ni, ng + h(ni)); }
      }
    }
    if (end < 0) return null;

    var cells = [];
    for (var c = end; c >= 0; c = from[c]) cells.push(c);
    cells.reverse();
    var pts = cells.map(function (c) { return [(c % cols + 0.5) * CELL, (((c / cols) | 0) + 0.5) * CELL]; });

    /* Attach exact door points at both ends. */
    var sp = closestPoint(starts, pts[0]), gp = closestPoint(goals, pts[pts.length - 1]);
    pts.unshift(sp); pts.push(gp);
    return { points: smooth(pts), start: sp, goal: gp };
  }

  function closestPoint(list, ref) {
    var best = list[0], bd = Infinity;
    list.forEach(function (p) { var d = Math.hypot(p[0] - ref[0], p[1] - ref[1]); if (d < bd) { bd = d; best = p; } });
    return best;
  }

  function clearAt(x, y) {
    var c = cellOf(x, y);
    return clear[idx(c[0], c[1])];
  }

  function los(a, b) {
    var thr = Math.min(2, clearAt(a[0], a[1]), clearAt(b[0], b[1]));
    var dist = Math.hypot(b[0] - a[0], b[1] - a[1]);
    var steps = Math.ceil(dist / 3);
    for (var i = 1; i < steps; i++) {
      var t = i / steps;
      var x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t;
      var cl = clearAt(x, y);
      if (cl === 0 || cl < thr) return false;
    }
    return true;
  }

  function smooth(pts) {
    if (pts.length < 3) return pts;
    var out = [pts[0]], i = 0;
    while (i < pts.length - 1) {
      var j = pts.length - 1;
      while (j > i + 1 && !los(pts[i], pts[j])) j--;
      out.push(pts[j]);
      i = j;
    }
    return out;
  }

  window.Pathfinder = { build: build, find: find };
})();
