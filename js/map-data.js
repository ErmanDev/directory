/*
 * Campus geometry for the 2D map.
 * Coordinates follow the original school layout drawing (2000 x 1403 units).
 *
 * P(id, label, type, x1, y1, x2, y2, door, opts)
 *   type  : classroom | office | lab | facility | canteen | cr | park | court | plaza | zone | blank | structure
 *   door  : side(s) where people enter ('n','s','e','w', e.g. 'we') or an array of [x, y] points.
 *           Used by the direction system. null = not a destination / walkable area.
 *   opts  : { fl: default floor, bld: default building }
 *
 * Room details (sections, advisers, notes) live in js/room-info.js so they can be
 * edited from the Admin page without touching this file.
 */
(function () {
  'use strict';
  var W = 2000, H = 1403;
  var places = [];

  function P(id, label, type, x1, y1, x2, y2, door, opts) {
    var o = opts || {};
    var m = /^r(\d+)$/.exec(id);
    places.push({
      id: id,
      label: label,
      type: type,
      x: x1, y: y1, w: x2 - x1, h: y2 - y1,
      door: door || null,
      num: m ? Number(m[1]) : null,
      fl: o.fl || null,
      bld: o.bld || ''
    });
  }

  /* Row helper: rooms side by side sharing the same top/bottom. */
  function row(list, y1, y2, door, opts) {
    list.forEach(function (r) {
      var id = typeof r[0] === 'number' ? 'r' + r[0] : r[0];
      var label = r[3] || (typeof r[0] === 'number' ? 'Room ' + r[0] : '');
      var type = r[4] || 'classroom';
      P(id, label, type, r[1], y1, r[2], y2, r[5] || door, opts);
    });
  }

  /* ---------- North-west block ---------- */
  row([[4, 18, 82], [5, 82, 142], [6, 142, 200, 'Bag Procurement Office', 'office'], [7, 200, 260, 'Supply Office', 'office'],
       ['vacant-top', 260, 320, 'Vacant Room', 'blank']], 8, 65, 's');
  P('memo', 'Memographing Room', 'facility', 15, 65, 70, 122, 's');
  P('jhs-registrar', "JHS Registrar's Office", 'office', 165, 80, 262, 172, 'w');
  P('museum', 'VNHS Mini Museum', 'facility', 322, 8, 380, 50, 'w');
  P('sdrrmc', 'SDRRMC', 'office', 322, 50, 378, 100, 'w');
  P('drrp', 'DRRP Office & Covered Court In-charge', 'office', 318, 100, 378, 150, 'w');
  P('principal', "Principal's Office", 'office', 25, 175, 78, 297, 'e');
  P('ap-park', 'AP Park', 'park', 117, 192, 235, 362);
  P('comlab', 'JHS Computer Lab 1 & 2', 'lab', 258, 175, 318, 350, 'w');
  P('r12', 'Room 12', 'classroom', 255, 350, 315, 415, 'w');
  P('court', 'Covered Court', 'court', 318, 58, 590, 418);
  P('billiard', 'Billiard Hall', 'facility', 390, 8, 450, 58, 's');
  P('cr-public', 'Public CR', 'cr', 455, 8, 505, 55, 's');
  P('sports-office', 'Office of the School Sports', 'office', 505, 8, 550, 58, 's');
  P('wins', 'WinS Office', 'office', 550, 8, 595, 58, 's');
  P('r102', 'VNHS Care Center', 'office', 595, 8, 655, 70, [[586, 66]]);
  P('r103', 'Clinic', 'office', 595, 70, 645, 100, 'e');
  P('esp-dept', 'ESP Dept. Office', 'office', 592, 100, 645, 160, 'e');
  P('storage-nw', '', 'blank', 592, 160, 645, 265, null);
  P('radio', 'Radio Station', 'facility', 592, 265, 645, 348, 'e');
  row([['slrmd', 393, 443, 'SLRMD Office', 'office'],
       ['media-arts', 443, 490, 'Media Arts', 'facility'],
       ['sslg', 490, 540, 'SSLG Office', 'office'],
       ['lounge', 540, 588, 'Student Lounge', 'facility']], 418, 480, 's');

  /* ---------- West side ---------- */
  P('wall-w', '', 'structure', 0, 375, 18, 645, null);
  P('struct-w1', '', 'structure', 15, 462, 143, 528, null);
  P('struct-w2', '', 'structure', 95, 528, 135, 822, null);
  P('math-park', 'Math Park', 'park', 222, 592, 372, 830);
  P('alumni-park', 'Alumni Park', 'park', 372, 592, 642, 832);
  P('pta', 'PTA Office', 'office', 22, 880, 90, 945, 'n');
  P('he-office', 'HE Office', 'office', 105, 852, 215, 950, 'n');
  P('r17', 'TLE Bakery & Room 17', 'lab', 220, 862, 325, 952, 'n');
  P('math-dept', 'Math Dept. Office', 'office', 325, 885, 357, 952, 'n');
  row([[19, 357, 413], [20, 413, 467], [21, 467, 520], [22, 520, 572], [23, 572, 625], [24, 625, 678]], 885, 952, 'n');
  P('spa-sps', 'SPA/SPS Skills & Training Classrooms', 'zone', 20, 1045, 572, 1290, 'n');
  P('wall-sw', '', 'structure', 580, 960, 590, 1400, null);
  P('abm-canteen', 'ABM Canteen', 'canteen', 592, 1022, 677, 1303, 'e');

  /* ---------- South row ---------- */
  row([[25, 662, 752], [26, 752, 843], [27, 843, 935], [28, 935, 1030],
       ['cr-south-1', 1035, 1080, 'CR', 'cr'],
       [29, 1085, 1167], [30, 1167, 1255],
       [31, 1255, 1342, 'G7 Faculty Room', 'office'],
       [32, 1342, 1432], [33, 1432, 1535],
       ['cr-south-2', 1540, 1585, 'CR', 'cr'],
       [34, 1588, 1665], [35, 1665, 1745], [36, 1745, 1815], [37, 1815, 1892], [38, 1892, 1970]],
      1323, 1395, 'n');

  /* ---------- North row ---------- */
  row([[101, 655, 720], [100, 720, 790],
       ['ap-dept', 790, 855, 'AP Dept. Office', 'office'],
       ['tle-dept', 855, 915, 'TLE Dept. Office', 'office'],
       [97, 915, 977], [96, 977, 1040],
       [95, 1040, 1103, 'G10 Faculty Room', 'office'],
       ['small-canteen', 1103, 1160, 'Small Canteen', 'canteen'],
       ['tle-storage', 1160, 1222, 'TLE Storage Room', 'facility'],
       [93, 1222, 1285], [92, 1285, 1345], [91, 1345, 1405], [90, 1405, 1465],
       [89, 1465, 1525], [88, 1525, 1585], [87, 1585, 1645], [86, 1645, 1705],
       [85, 1705, 1765, 'Filipino Dept. Office', 'office'],
       [84, 1765, 1823, 'English Dept. Office', 'office'],
       [83, 1823, 1882], [82, 1882, 1940]], 8, 75, 's');
  P('fil-park', 'Fil. Park', 'park', 1940, 8, 1992, 90);

  /* ---------- Central blocks ---------- */
  var SPFL = 'SPFL Building';
  P('r114', 'Room 114', 'classroom', 722, 132, 828, 243, 'w', { fl: 1, bld: SPFL });
  P('r115', 'Room 115', 'classroom', 718, 243, 825, 350, 'w', { fl: 1, bld: SPFL });
  P('r117', 'Room 117', 'classroom', 843, 135, 950, 245, 'e', { fl: 2, bld: SPFL });
  P('r116', 'Room 116', 'classroom', 838, 245, 945, 353, 'e', { fl: 2, bld: SPFL });

  var LIB = 'Library Building';
  P('r108', 'Library', 'facility', 708, 368, 822, 480, 'w', { fl: 1, bld: LIB });
  P('r109', 'Data Center', 'facility', 708, 480, 822, 620, 'w', { fl: 1, bld: LIB });
  P('r110', 'VNHS HD Project Hub', 'facility', 708, 620, 822, 790, 'w', { fl: 1, bld: LIB });
  P('r113', 'Room 113', 'classroom', 822, 372, 942, 580, 'e', { fl: 2, bld: LIB });
  P('r112', 'Room 112', 'classroom', 822, 580, 942, 795, 'e', { fl: 2, bld: LIB });

  P('registrar-new', 'Upcoming SHS & JHS Registrar', 'office', 968, 287, 1158, 498, 's');
  P('quadrangle', 'Quadrangle', 'plaza', 1225, 293, 1812, 515);

  var BB = 'Building B';
  row([[127, 1008, 1087], [126, 1087, 1160], [125, 1160, 1238], [124, 1238, 1310], [123, 1310, 1380]],
      133, 190, 'n', { fl: 2, bld: BB });
  row([[118, 1007, 1085], [119, 1085, 1160], [120, 1160, 1235],
       ['skills-he', 1235, 1375, 'Skills Classroom for HE & Baking', 'lab']],
      203, 262, 's', { fl: 1, bld: BB });

  var NE = 'SHS North Building';
  row([[139, 1450, 1522], [138, 1522, 1597], [137, 1597, 1673], [136, 1673, 1748], [135, 1748, 1822]],
      133, 188, 'n', { fl: 2, bld: NE });
  row([[130, 1447, 1520], [131, 1520, 1595], [132, 1595, 1670],
       ['shs-scilab', 1670, 1822, 'SHS Science Laboratory', 'lab']],
      202, 258, 's', { fl: 1, bld: NE });

  /* SHS Building: four floors drawn as stacked rows. Entrances at both ends. */
  var SHS = 'SHS Building';
  function shsDoors(mid) { return [[996, mid], [1436, mid]]; }
  row([['shs-registrar', 1010, 1098, 'SHS Registrar', 'office'],
       ['data-hub', 1098, 1172, 'Data Hub', 'facility'],
       [144, 1172, 1260], [145, 1260, 1345], [146, 1345, 1430]],
      530, 583, shsDoors(556), { fl: 1, bld: SHS });
  row([[149, 1007, 1097], [150, 1097, 1180], [151, 1180, 1262], [152, 1262, 1345], [153, 1345, 1428]],
      600, 655, shsDoors(627), { fl: 2, bld: SHS });
  row([[158, 1005, 1093], [157, 1093, 1178], [156, 1178, 1262], [155, 1262, 1343], [154, 1343, 1425]],
      668, 722, shsDoors(695), { fl: 3, bld: SHS });
  row([[159, 1005, 1093, 'Room 159', 'lab'],
       [160, 1093, 1178, 'Room 160', 'lab'],
       [161, 1178, 1258, 'Room 161', 'lab'],
       ['shs-4a', 1258, 1340, '', 'blank'], ['shs-4b', 1340, 1423, '', 'blank']],
      737, 792, shsDoors(764), { fl: 4, bld: SHS });

  var TVL = 'TVL Workshops';
  P('civil-tech', 'Civil Technology', 'lab', 1440, 532, 1517, 747, [[1478, 522]], { bld: TVL });
  P('eim', 'Electrical Installation & Maintenance (EIM)', 'lab', 1517, 532, 1595, 747, [[1556, 522]], { bld: TVL });
  P('smaw', 'SMAW', 'lab', 1640, 528, 1707, 745, [[1673, 520]], { bld: TVL });
  P('automotive', 'Automotive Servicing', 'lab', 1707, 528, 1772, 745, [[1740, 520]], { bld: TVL });
  P('casa', 'Casa de Eskwela', 'lab', 1772, 528, 1837, 745, [[1805, 520]], { bld: TVL });

  /* ---------- East side ---------- */
  row([[81, 1880, 1953]], 93, 183, 'w');
  row([[80, 1880, 1955]], 183, 272, 'w');
  row([[79, 1880, 1955]], 272, 358, 'w');
  P('r78', 'G9 Faculty Room', 'office', 1880, 358, 1935, 450, 'w');
  P('guidance', 'Guidance Office', 'office', 1935, 358, 1998, 450, 's');
  P('r76', 'Room 76', 'classroom', 1890, 615, 1948, 693, 'w');
  P('r77', 'Room 77', 'classroom', 1890, 693, 1948, 752, 'w');
  P('r75', 'Room 75', 'classroom', 1885, 752, 1948, 775, 'w');
  P('r74', 'Room 74', 'classroom', 1890, 775, 1948, 855, 'w');
  P('r73', 'Room 73', 'classroom', 1890, 855, 1948, 940, [[1880, 945]]);
  row([[70, 1688, 1757], [71, 1757, 1825], [72, 1825, 1890]], 872, 940, 'n');

  var SPA = 'SPA Building';
  row([[47, 1685, 1778], [46, 1778, 1895], [45, 1895, 1985]], 950, 1035, [[1674, 992]], { fl: 3, bld: SPA });
  row([[42, 1688, 1775], [43, 1775, 1893], [44, 1893, 1983]], 1048, 1140, [[1674, 1094]], { fl: 2, bld: SPA });
  row([[39, 1687, 1768], [40, 1768, 1888], [41, 1888, 1978]], 1155, 1243, [[1674, 1199]], { fl: 1, bld: SPA });

  P('school-canteen', 'School Canteen', 'canteen', 1410, 950, 1613, 1240, 'we');

  /* ---------- South-central ---------- */
  row([[58, 757, 825, 'G8 Curriculum Office', 'office'],
       [59, 825, 895], [60, 895, 965], [61, 965, 1035], [62, 1035, 1104],
       [63, 1104, 1173], [64, 1173, 1243], [65, 1243, 1312], [66, 1312, 1382],
       [67, 1382, 1452, 'Science Dept. Office', 'office']], 885, 945, 'n');
  P('r68', 'Room 68', 'classroom', 1452, 878, 1520, 945, 'n');
  P('r69', 'Room 69', 'classroom', 1527, 876, 1617, 942, 'n');

  var STE1 = 'STE Building 1', STE2 = 'STE Building 2';
  row([[56, 795, 895, 'Room 56', 'lab'], [57, 895, 1000, 'Room 57', 'lab']], 1008, 1110, 'n', { fl: 2, bld: STE1 });
  row([[55, 797, 895], [54, 895, 1002]], 1130, 1238, 's', { fl: 1, bld: STE1 });
  row([[53, 1087, 1185], [52, 1185, 1280], [51, 1280, 1383]], 1008, 1112, 'n', { fl: 2, bld: STE2 });
  row([[48, 1087, 1183], [49, 1183, 1283], [50, 1283, 1385]], 1132, 1238, 's', { fl: 1, bld: STE2 });

  /* ---------- Gates (starting points) ---------- */
  var gates = [
    { id: 'girls-gate', label: "Girls' Gate", x: 42, y: 430 },
    { id: 'boys-gate', label: "Boys' Gate", x: 1955, y: 520 }
  ];

  /* ---------- Text annotations (floor markers, building names) ---------- */
  var notes = [
    { x: 775, y: 112, t: '1st Floor', c: 'f1' }, { x: 896, y: 118, t: '2nd Floor', c: 'f2' },
    { x: 1414, y: 162, t: '2nd Floor', c: 'f2' }, { x: 1412, y: 232, t: '1st Floor', c: 'f1' },
    { x: 968, y: 560, t: '1st', c: 'f1' }, { x: 968, y: 630, t: '2nd', c: 'f2' },
    { x: 968, y: 698, t: '3rd', c: 'f3' }, { x: 968, y: 768, t: '4th', c: 'f4' },
    { x: 760, y: 812, t: '1st Floor', c: 'f1' }, { x: 880, y: 818, t: '2nd Floor', c: 'f2' },
    { x: 1044, y: 1064, t: '2nd Floor', c: 'f2' }, { x: 1044, y: 1186, t: '1st Floor', c: 'f1' },
    { x: 1648, y: 996, t: '3rd', c: 'f3' }, { x: 1648, y: 1098, t: '2nd', c: 'f2' }, { x: 1648, y: 1202, t: '1st', c: 'f1' },
    { x: 898, y: 992, t: 'STE Building 1', c: 'bld' }, { x: 1235, y: 992, t: 'STE Building 2', c: 'bld' },
    { x: 1214, y: 812, t: 'SHS Building', c: 'bld' }, { x: 1192, y: 124, t: 'Building B', c: 'bld' }
  ];

  window.MAP_DATA = { width: W, height: H, places: places, gates: gates, notes: notes };
})();
