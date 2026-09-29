#!/usr/bin/env node
// Experiment (2026-09-29): the traced board, redrawn as a draughtsman would draw it.
// Reads the skeleton, Art/Board/board-geometry.json, and writes
//
//   Art/Board/Drafted/board-geometry.json             straight lines, exact angles
//   Art/Board/Drafted/Chamfered/board-geometry.json   the same, sharp coast corners bevelled
//
//   node tools/draft_board.js      then   node tools/build_board.js --geometry=Drafted
//                                         node tools/build_board.js --geometry=Drafted/Chamfered
//
// The tracer followed the Affinity art pixel by pixel, so the map is nearly a
// designed one: borders a few degrees off level, rivers that wander in width, 3 to 5
// unit jogs. This keeps every shape and every connection and makes the near-misses
// exact:
//
// - Manhattan's west coast is one straight line and New Jersey's shore runs parallel
//   to it, so the Hudson is an even channel.
// - The East River is one channel of constant width in three straight reaches: 45
//   degrees past the bridges, a level turn at the Bowery, then parallel to the Hudson
//   down to the harbour. Hell Gate and the Sound are one even channel too, which also
//   opens the pinch between Throggs Neck and Whitestone (not connected; it read as if
//   they nearly touched).
// - Borders within a few degrees of level or upright are made exact; tracer jogs go.
// - Staten Island and Jamaica Bay become 45-degree Deco shapes.
// - Westchester and Nassau go: the Bronx runs up to the frame and Queens out to it,
//   under it to the board's edge as New Jersey does (the build clips them at the
//   frame's hairline). The water east of the Bronx stays, and Staten Island keeps its
//   shore all round (Nick: it should read as an island).
//
// Every chain keeps its two sides and its two end junctions, so no adjacency changes
// (the chains against Westchester and Nassau go with them).
// The script checks for crossings, shrunken borders and closed-up water before writing.
// Bridges keep their places and cross square to the new banks.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'Art', 'Board', 'board-geometry.json');
const OUT = path.join(ROOT, 'Art', 'Board', 'Drafted');
const geo = JSON.parse(fs.readFileSync(SRC, 'utf8'));
const r1 = v => Math.round(v * 10) / 10;
const key = p => `${p[0]},${p[1]}`;
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

// ---------------------------------------------------------------- lines
const unit = (x, y) => { const l = Math.hypot(x, y); return [x / l, y / l]; };
const line = (p, d) => ({ p, d: unit(...d) });
const through = (a, b) => line(a, [b[0] - a[0], b[1] - a[1]]);
const shift = (l, k) => ({ p: [l.p[0] - l.d[1] * k, l.p[1] + l.d[0] * k], d: l.d }); // k units to the line's right
const atY = (l, y) => [l.p[0] + (l.d[0] * (y - l.p[1])) / l.d[1], y];
const atX = (l, x) => [x, l.p[1] + (l.d[1] * (x - l.p[0])) / l.d[0]];
const foot = (l, q) => { const t = (q[0] - l.p[0]) * l.d[0] + (q[1] - l.p[1]) * l.d[1]; return [l.p[0] + l.d[0] * t, l.p[1] + l.d[1] * t]; };
function meet(a, b) {
  const den = a.d[0] * b.d[1] - a.d[1] * b.d[0];
  const t = ((b.p[0] - a.p[0]) * b.d[1] - (b.p[1] - a.p[1]) * b.d[0]) / den;
  return [a.p[0] + a.d[0] * t, a.p[1] + a.d[1] * t];
}
const deg = a => (a * Math.PI) / 180;

// The drafting's settings: where the level and upright borders sit. They are
// balanced for room (see board-handoff.md): the smaller Districts, the crown rooms
// first, get what the roomy ones can spare. Since the signs, they also keep the
// signs' hangers short where a border can move without costing room.
const SETTINGS = {
  bronxCols: [692, 864], // Belmont | Fordham | Morris Park
  bronxRow: 184, // Fordham / Throggs Neck, level
  morrisEast: 192, // where Morris Park / Throggs Neck meets the east shore
  hellGate: 3, // the Hell Gate and Sound reaches' angle, degrees: a chevron
  manhattanWest: 9, // Manhattan's west coast moved out (New Jersey follows, so the Hudson keeps its width)
  manhattan: [274, 376, 469, 555], // level borders: Sugar Hill | West Side | Tenderloin | Five Points | Bowery
  eastHarlem: 1, // East Harlem's west side, shifted east
  astoriaCorona: 530, // level
  hpCol: 816, // Hunts Point / Throggs Neck, upright (the Hell Gate turns there)
  queensCol: 838, // Astoria and Corona | Whitestone and Flushing, upright from the Hell Gate or the Sound
  queensRows: [488, 637.5, 751], // level borders: Whitestone | Flushing | Richmond Hill | Jamaica
  williamsburgSouth: 757, // Williamsburg's southern point, on Red Hook / Brownsville
  redHookSouth: 802, // Red Hook's level south side
  coneyEast: 436, // Coney Island / Sheepshead Bay, upright
  boweryBottom: 668, stapletonTop: 690, // the Kill van Kull between them
  staten: [806, 914], // level borders: Westerleigh | Stapleton | Tottenville
  bayEast: 90, // Jamaica Bay's east side, moved east (Jamaica gives it the ground)
  ehKnee: [715, 290], // East Harlem / Hunts Point turns upright here, dropping square to the Hell Gate
  hpFoot: 60, // Belmont / Hunts Point's foot, square to East Harlem / Hunts Point, before it runs level
};

const RIVER = 49; // the East River's width, Hell Gate and the Sound included
const EAST_EDGE = 1080; // Queens runs to the board's edge, under the frame
const BRONX_EAST = 1030; // the Bronx's east shore, upright
const TN_CUT = 24; // Throggs Neck's tip, cut back this far along both shores
const FOOT = 24; // a border's foot: its last stretch turned to meet a slanted shore or border square
const NARROWS_GAP = 32; // the Narrows, Staten Island to Brooklyn
const BRIDGE_SHIFT = { 'Hell Gate Bridge': [30, 0] }; // moved along its river, clear of East Harlem's stretch of the Hell Gate
const MIN_BORDER = 45; // a border that has shrunk still runs this far (25 mm), so it reads as a connection
const GONE = ['north', 'east']; // Westchester and Nassau: the Districts meet the frame instead
const FRAME_IN = 13; // the frame's hairline, as build_board.js draws it
const SOUTH_SHORE = 1020; // the Rockaways, level
const BK_COL = 595.5; // Red Hook / Brownsville, upright
const BOWERY_BANK = 602, RED_HOOK_BANK = BOWERY_BANK + RIVER; // the East River's level turn

function draft(S) {
  const MN_WEST = shift(through([464, 108], [150, 548]), S.manhattanWest); // Manhattan's west coast, one line
  const NJ = shift(MN_WEST, 44); // the Hudson: 44 wide, parallel
  const EH_WEST = through([535 + S.eastHarlem, 279], [509 + S.eastHarlem, 453]); // East Harlem's west side
  const ER_MN = line([694, 328], [-1, 1]); // East River, Manhattan bank, 45 degrees
  const ER_QN = shift(ER_MN, -RIVER);
  const ER_RH = line([287, 788], MN_WEST.d); // the harbour reach, parallel to the Hudson
  const ER_BW = shift(ER_RH, RIVER);
  const HG_BX = line([694, 328], [Math.cos(deg(S.hellGate)), -Math.sin(deg(S.hellGate))]); // Hell Gate, rising east
  const HG_QN = shift(HG_BX, RIVER);
  const BEND = atX(HG_BX, S.hpCol); // turns at Hunts Point / Throggs Neck
  const SOUND_BX = line(BEND, [Math.cos(deg(S.hellGate)), Math.sin(deg(S.hellGate))]); // the Sound, falling east
  const SOUND_QN = shift(SOUND_BX, RIVER);
  const QN_NORTH = atX(SOUND_QN, EAST_EDGE);
  const RH_STUB = atY(ER_RH, S.redHookSouth - FOOT); // Red Hook's shore turns upright here, in line with Coney Island's
  const NARROWS = [RH_STUB[0] - NARROWS_GAP, RH_STUB[0]]; // Staten Island's east shore, Brooklyn's
  const [m1, m2, m3, m4] = S.manhattan, [b1, b2] = S.bronxCols, W = 0, [s1, s2] = S.staten;
  const [q1, q2, q3] = S.queensRows, qc = S.queensCol;
  const QN_TURN = meet(HG_QN, SOUND_QN), AW = qc <= QN_TURN[0] ? atX(HG_QN, qc) : atX(SOUND_QN, qc); // Astoria / Whitestone on the shore
  const ehFoot = atY(EH_WEST, m3);
  const BOWERY_WEST = atY(MN_WEST, m4)[0], NJ_CORNER = atX(NJ, BOWERY_WEST - 44);
  const WB = [597, 494], AC = [637 - ((548 - S.astoriaCorona) * 40) / 54, S.astoriaCorona]; // along Williamsburg / Astoria
  // A level border meeting a slanted line at a tight corner gets a foot: its last FOOT
  // units turned to meet the line square. From P, where it met the line, running along
  // the line's direction d away from the tight corner: [where the foot lands, where it leaves the level].
  const footOf = (P, d, east) => {
    const c = Math.abs(d[0]), sn = Math.abs(d[1]); // the tight corner's angle, as cos and sin
    return [[P[0] + d[0] * FOOT * c / sn, P[1] + d[1] * FOOT * c / sn], [P[0] + (east ? 1 : -1) * FOOT / sn, P[1]]];
  };
  const upCoast = [-MN_WEST.d[0], -MN_WEST.d[1]]; // up Manhattan's west coast
  const MF = [m1, m2, m3, m4].map(m => footOf(atY(MN_WEST, m), upCoast, true)); // each Manhattan border's foot on the Hudson
  const wbSide = unit(707 - AC[0], 644 - AC[1]); // Williamsburg's side toward Corona
  const CF = footOf(AC, wbSide, true); // Astoria / Corona's foot on Williamsburg
  const bwFoot = [atY(ER_MN, m4)[0] - FOOT * Math.SQRT2, m4], BW_J = meet(line(bwFoot, [1, 1]), ER_MN); // Five Points / Bowery, square to the East River
  const WB_J = meet(line([BK_COL, S.williamsburgSouth], [1, 1]), ER_QN); // Williamsburg / Red Hook, square to the East River
  const TIPB = meet(MN_WEST, through([464, 108], [606, 191])); // Manhattan's tip
  // The four-way corner (Sugar Hill, Belmont, East Harlem, Hunts Point): East Harlem /
  // Hunts Point runs out to the knee, then upright to the Hell Gate; Belmont / Hunts Point
  // leaves the corner on a foot square to it, then runs level to Fordham.
  const [ekx, eky] = S.ehKnee, EH_SHORE = atX(HG_BX, ekx);
  const ehDir = unit(ekx - 606, eky - 191), BH = [606 + ehDir[1] * S.hpFoot, 191 - ehDir[0] * S.hpFoot];

  // Each skeleton point: where it goes (MOVE) or dropped (DROP, the tracer's jogs and
  // points a straight line no longer needs). Chains listed in REPLACE get new interior
  // points outright, where a shape gains corners it didn't have.
  const MOVE = {
    // New Jersey and Westchester
    // New Jersey: parallel to Manhattan's west coast, then to the Bowery's west side, and
    // squared off level with the Bowery's bottom, so the Hudson is one width all the way
    '382,165': atX(NJ, 382), '142,476': NJ_CORNER, '94,655': [NJ_CORNER[0], S.boweryBottom], '0,707': [0, S.boweryBottom],
    '464,108': TIPB, // Manhattan's tip, on Sugar Hill / Belmont
    '544,0': [TIPB[0], 0], '533,51': [TIPB[0], W], '1056,0': [BRONX_EAST, 0], '1050,53': [BRONX_EAST, W],
    // Manhattan: level borders meeting one straight coast, each on a foot
    '371,248': MF[0][0], '535,279': atY(EH_WEST, m1),
    '290,360': MF[1][0], '523,357': atY(EH_WEST, m2),
    '220,452': MF[2][0], '509,453': ehFoot, '150,548': MF[3][0],
    '533,477': meet(line(ehFoot, [1, 1]), ER_MN), '466,549': BW_J, '694,328': EH_SHORE,
    '447,589': atY(ER_MN, BOWERY_BANK), '342,615': atY(ER_BW, BOWERY_BANK),
    '307,696': atY(ER_BW, S.boweryBottom), '171,686': [atY(MN_WEST, m4)[0], S.boweryBottom],
    // The Bronx: an upright east shore, level blocks
    '715,53': [b1, W], '715,160': [b1, BH[1]], '898,53': [b2, W], '881,199': [b2, S.bronxRow], '799,196': [S.hpCol, S.bronxRow],
    '1029,231': [BRONX_EAST, S.morrisEast], '829,299': BEND, '1022,330': atX(SOUND_BX, BRONX_EAST),
    // Queens: the river banks, level and upright borders
    '720,373': meet(HG_QN, ER_QN), '766,356': AW,
    '1033,386': QN_NORTH, '1080,392': [1080, QN_NORTH[1]],
    '597,494': foot(ER_QN, WB), '637,548': CF[0],
    '838,496': [qc, q1], '831,548': [qc, S.astoriaCorona], '1031,479': [EAST_EDGE, q1],
    '892,650': [qc, q2], '1031,651': [EAST_EDGE, q2],
    '794,782': [793.5, q3], '895,783': [895, q3], '1031,832': [EAST_EDGE, q3],
    '1032,991': [EAST_EDGE, SOUTH_SHORE], '1080,988': [1080, SOUTH_SHORE],
    // Brooklyn: the East River's reaches, Red Hook's level south side, upright borders
    '447,651': WB_J, '425,681': atY(ER_RH, RED_HOOK_BANK), '283,797': [RH_STUB[0], S.redHookSouth],
    '602,704': [BK_COL, S.williamsburgSouth], '589,792': [BK_COL, S.redHookSouth],
    '639,894': [BK_COL, 853], // Sheepshead Bay / Brownsville on down to the bay, whose corner there is square
    '451,787': [S.coneyEast, S.redHookSouth], '437,983': [S.coneyEast, 983], '299,989': [NARROWS[1], 989],
    // Jamaica Bay: a 45-degree octagon (its Sheepshead Bay and Jamaica sides are in REPLACE)
    '709,848': [680, 853], '793,857': [793.5, 853],
    // Staten Island: an octagon (see REPLACE), level borders
    '37,816': [36, s1], '261,837': [NARROWS[0], s1], '30,910': [36, s2], '272,932': [NARROWS[0], s2],
  };
  const T = S.stapletonTop, B = S.bayEast;
  const TIP = atX(SOUND_BX, BRONX_EAST), sound = unit(-SOUND_BX.d[0], -SOUND_BX.d[1]);
  const TIP_CUT = [[BRONX_EAST, TIP[1] - TN_CUT], [TIP[0] + sound[0] * TN_CUT, TIP[1] + sound[1] * TN_CUT]];
  const REPLACE = {
    // the Bronx: Belmont's shore upright from Manhattan's tip to the frame; Throggs Neck's tip cut off
    'water|belmont': [[TIPB[0], W], TIPB],
    'throggs_neck|water': [[BRONX_EAST, S.morrisEast], ...TIP_CUT, BEND],
    'east_harlem|hunts_point': [[606, 191], S.ehKnee, EH_SHORE], // East Harlem wider low down, for its sign
    'east_harlem|water': [EH_SHORE, [694, 328], meet(line(ehFoot, [1, 1]), ER_MN)],
    'belmont|hunts_point': [[b1, BH[1]], BH, [606, 191]],
    'sheepshead_bay|water': [[BK_COL, 853], [BK_COL, 975], [622, 1001.5], [622, 1011], [S.coneyEast, 983]],
    'brownsville|water': [[793.5, 853], [BK_COL, 853]],
    // Manhattan's borders on their feet; the Bowery's shore turns upright below its foot
    'sugar_hill|west_side': [MF[0][0], MF[0][1], atY(EH_WEST, m1)],
    'west_side|tenderloin': [MF[1][0], MF[1][1], atY(EH_WEST, m2)],
    'five_points|tenderloin': [MF[2][0], MF[2][1], ehFoot],
    'five_points|bowery': [MF[3][0], MF[3][1], bwFoot, BW_J],
    'water|bowery': [MF[3][0], atY(MN_WEST, m4), [atY(MN_WEST, m4)[0], S.boweryBottom], atY(ER_BW, S.boweryBottom), atY(ER_BW, BOWERY_BANK), atY(ER_MN, BOWERY_BANK), BW_J],
    // Astoria / Corona on a foot at Williamsburg; Red Hook's shore up the East River to Williamsburg, and upright at the Narrows
    'astoria|corona': [CF[0], CF[1], [qc, S.astoriaCorona]],
    // the Hell Gate's turn on the Queens side is Astoria's or Whitestone's, whichever it falls in
    'water|astoria': [AW, ...(qc > QN_TURN[0] ? [QN_TURN] : []), meet(HG_QN, ER_QN), foot(ER_QN, WB)],
    'water|whitestone': [AW, ...(qc < QN_TURN[0] ? [QN_TURN] : []), QN_NORTH],
    'water|red_hook': [WB_J, atY(ER_QN, RED_HOOK_BANK), atY(ER_RH, RED_HOOK_BANK), RH_STUB, [RH_STUB[0], S.redHookSouth]],
    // Jamaica: the bay's east side as an octagon, then a level spit and shore
    'water|jamaica': [[793.5, 853], [820 + B, 853], [856 + B, 889], [856 + B, 945], [801 + B, 1000], [700, 1000], [700, 1012], [708, SOUTH_SHORE], [EAST_EDGE, SOUTH_SHORE]],
    // Staten Island: 45-degree corners, upright shores
    'water|westerleigh': [[36, s1], [36, T + 27], [63, T], [NARROWS[0] - 37, T], [NARROWS[0], T + 37], [NARROWS[0], s1]],
    'water|tottenville': [[36, s2], [36, 1005], [63, 1032], [NARROWS[0] - 49, 1032], [NARROWS[0], 983], [NARROWS[0], s2]],
  };
  // Where the labels in the water sit on this map: midway between shores, at their angle.
  const labels = {
    boro: {
      MN: [...atY(shift(MN_WEST, 22), 440).map(r1), -54.5], // beside the Tenderloin and Five Points, clear of West Side's piers
      BX: [(BRONX_EAST + 1080 - FRAME_IN) / 2, r1((FRAME_IN + TIP_CUT[0][1]) / 2), -90], // beside the Bronx's east shore
      QN: [890, (SOUTH_SHORE + 1067) / 2, 0], BK: [525, 1030, 8.6], SI: [172, 1050, 0],
    },
    water: [['EAST RIVER', 403, (BOWERY_BANK + RED_HOOK_BANK) / 2, 0], ['JAMAICA BAY', 728 + B / 2, 926, 0]],
    land: [],
  };
  return { MOVE, REPLACE, labels };
}
const DROP = [
  '544,18', '1056,20', '1051,60', '19,706', // off-board shores
  '536,284', '526,351', '523,371', '222,454', '158,534', '149,556', '303,699', // Manhattan
  '803,243', '969,205', '1025,313', '951,342', // the Bronx
  '764,355', '813,340', '834,336', '1028,383', '1036,385', '1061,392', '497,570', // Queens
  '375,665', '287,788', '447,786', '367,809', '469,786', '282,808', // Brooklyn
  '157,820', '263,839', // Staten Island
];

// ---------------------------------------------------------------- apply
const dropped = new Set(DROP);
function chainsFor(S) {
  const { MOVE, REPLACE } = draft(S);
  for (const k of [...Object.keys(MOVE), ...DROP]) {
    if (!geo.chains.some(c => c.pts.some(q => key(q) === k)) && !Object.values(geo.regions).some(r => r.some(q => key(q) === k)))
      throw new Error('No skeleton point at ' + k);
  }
  const moved = q => { const m = MOVE[key(q)]; return m ? m.map(r1) : q; };
  const chains = geo.chains.map(c => {
    const sides = c.sides.join('|'), a = moved(c.pts[0]), b = moved(c.pts[c.pts.length - 1]);
    const rep = REPLACE[sides] || REPLACE[c.sides.slice().reverse().join('|')];
    if (rep) {
      const pts = rep.map(q => q.map(r1));
      const fwd = key(pts[0]) === key(a) ? pts : pts.slice().reverse();
      if (key(fwd[0]) !== key(a) || key(fwd[fwd.length - 1]) !== key(b)) throw new Error(`REPLACE for ${sides} must run junction to junction`);
      return { sides: c.sides, pts: fwd };
    }
    return { sides: c.sides, pts: c.pts.filter((q, i) => i === 0 || i === c.pts.length - 1 || !dropped.has(key(q))).map(moved) };
  });
  return { chains, moved };
}

// Chamfers: a Deco bevel on each sharp coast corner (turning 70 degrees or more)
// that is not a junction, cut back CHAMFER units along both sides.
const CHAMFER = 10;
function chamfer(cs) {
  return cs.map(c => {
    if (!c.sides.includes('water')) return c;
    const p = c.pts, out = [p[0]];
    for (let i = 1; i < p.length - 1; i++) {
      const a = unit(p[i - 1][0] - p[i][0], p[i - 1][1] - p[i][1]), b = unit(p[i + 1][0] - p[i][0], p[i + 1][1] - p[i][1]);
      const inner = Math.acos(Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1])));
      const k = Math.min(CHAMFER, 0.4 * dist(p[i], p[i - 1]), 0.4 * dist(p[i], p[i + 1]));
      if (inner > deg(110) || k < 4) { out.push(p[i]); continue; }
      out.push([p[i][0] + a[0] * k, p[i][1] + a[1] * k].map(r1), [p[i][0] + b[0] * k, p[i][1] + b[1] * k].map(r1));
    }
    out.push(p[p.length - 1]);
    return { sides: c.sides, pts: out };
  });
}

// Regions: walk each skeleton ring, swapping each chain run for its new points;
// frame edges, which no chain covers, pass through (moved where MOVE says).
function regionsFrom(cs, moved) {
  const edge = new Map();
  geo.chains.forEach((c, i) => c.pts.forEach((q, k) => {
    if (k === c.pts.length - 1) return;
    const n = c.pts[k + 1];
    edge.set(`${key(q)}>${key(n)}`, { i, rev: false });
    edge.set(`${key(n)}>${key(q)}`, { i, rev: true });
  }));
  const out = {};
  for (const [id, ring] of Object.entries(geo.regions)) {
    const n = ring.length, e = k => edge.get(`${key(ring[k % n])}>${key(ring[(k + 1) % n])}`);
    let start = 0;
    while (start < n) { const a = e((start - 1 + n) % n), b = e(start); if (!a || !b || a.i !== b.i) break; start++; }
    const r = [];
    for (let k = 0; k < n;) {
      const h = e(start + k);
      if (!h) { r.push(moved(ring[(start + k) % n])); k++; continue; }
      const c = cs[h.i].pts;
      r.push(...(h.rev ? c.slice().reverse() : c).slice(0, -1));
      while (k < n && e(start + k) && e(start + k).i === h.i) k++;
    }
    out[id] = r;
  }
  return out;
}

// Bridges keep their place (the old midpoint) and cross square to the new bank.
function bridgesFor(cs) {
  const shoreOf = id => cs.filter(c => c.sides.includes(id) && c.sides.includes('water')).flatMap(c => c.pts.slice(1).map((q, k) => [c.pts[k], q]));
  const nearestSeg = (segs, q) => segs.reduce((best, s) => {
    const d = Math.min(...[0, 0.25, 0.5, 0.75, 1].map(t => dist(q, [s[0][0] + (s[1][0] - s[0][0]) * t, s[0][1] + (s[1][1] - s[0][1]) * t])));
    return !best || d < best.d ? { s, d } : best;
  }, null).s;
  const land = (m, u, segs) => {
    let best = null;
    for (const [p, q] of segs) {
      const hit = meet({ p: m, d: u }, through(p, q)), t = (hit[0] - m[0]) * u[0] + (hit[1] - m[1]) * u[1];
      const inSeg = dist(p, hit) + dist(hit, q) - dist(p, q) < 0.01;
      if (inSeg && t > 0 && (!best || t < best.t)) best = { hit, t };
    }
    return best && best.hit;
  };
  return geo.bridges.map(b => {
    const [sx, sy] = BRIDGE_SHIFT[b.name] || [0, 0];
    const m = [(b.a[0] + b.b[0]) / 2 + sx, (b.a[1] + b.b[1]) / 2 + sy], sa = shoreOf(b.join[0]), sb = shoreOf(b.join[1]);
    const [p, q] = nearestSeg(sa, m);
    let u = unit(-(q[1] - p[1]), q[0] - p[0]); // square to the bank
    if ((b.b[0] - b.a[0]) * u[0] + (b.b[1] - b.a[1]) * u[1] < 0) u = [-u[0], -u[1]];
    const a = land(m, [-u[0], -u[1]], sa), bb = land(m, u, sb);
    if (!a || !bb) throw new Error(`${b.name} found no bank`);
    return { ...b, a: a.map(r1), b: bb.map(r1) };
  });
}
// A bridge's name sits in the water beside it, along the river, where it was.
function bridgeLabels(bs) {
  const was = {
    'Hell Gate Bridge': 50, 'Queensboro Bridge': 44, 'Williamsburg Bridge': 44, 'Brooklyn Bridge': -44,
  }; // distance along the river from the bridge, as on the board (the side it was on)
  const out = {};
  for (const b of bs) {
    const m = [(b.a[0] + b.b[0]) / 2, (b.a[1] + b.b[1]) / 2], u = unit(b.b[0] - b.a[0], b.b[1] - b.a[1]);
    let along = [u[1], -u[0]]; // the river's direction, read left to right
    if (along[0] < 0) along = [-along[0], -along[1]];
    const k = was[b.name];
    out[b.name] = [r1(m[0] + along[0] * k), r1(m[1] + along[1] * k), r1((Math.atan2(along[1], along[0]) * 180) / Math.PI)];
  }
  return out;
}

// ---------------------------------------------------------------- checks
const BRIDGE_CLEAR = 20; // the skeleton's closest is 22 (Queensboro, in Astoria)
const area = p => Math.abs(p.reduce((s, a, i) => { const b = p[(i + 1) % p.length]; return s + a[0] * b[1] - b[0] * a[1]; }, 0)) / 2;
const length = p => p.slice(1).reduce((s, q, i) => s + dist(p[i], q), 0);
function segDist(q, a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = dx * dx + dy * dy;
  const t = L ? Math.max(0, Math.min(1, ((q[0] - a[0]) * dx + (q[1] - a[1]) * dy) / L)) : 0;
  return Math.hypot(q[0] - a[0] - t * dx, q[1] - a[1] - t * dy);
}
function check(cs, regions, bs) {
  const problems = [], notes = [];
  const cr = (p, q, r) => (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]);
  const segs = cs.flatMap((c, i) => c.pts.slice(1).map((q, k) => ({ i, k, a: c.pts[k], b: q })));
  for (let x = 0; x < segs.length; x++) for (let y = x + 1; y < segs.length; y++) {
    const s1 = segs[x], s2 = segs[y];
    if (s1.i === s2.i && Math.abs(s1.k - s2.k) < 2) continue;
    if (cr(s1.a, s1.b, s2.a) * cr(s1.a, s1.b, s2.b) < 0 && cr(s2.a, s2.b, s1.a) * cr(s2.a, s2.b, s1.b) < 0)
      problems.push(`${cs[s1.i].sides} crosses ${cs[s2.i].sides}`);
  }
  for (const c of cs) for (let k = 0; k < c.pts.length - 1; k++) if (dist(c.pts[k], c.pts[k + 1]) < 3) problems.push(`${c.sides} has a ${dist(c.pts[k], c.pts[k + 1]).toFixed(1)} unit run`);
  for (const [id, r] of Object.entries(regions)) {
    const ch = area(r) / area(geo.regions[id]) - 1;
    const framed = r.some(q => q[0] <= 0 || q[0] >= 1080 || q[1] <= 0); // took in Westchester or Nassau
    if (Math.abs(ch) > 0.2 && !framed) problems.push(`${id} area ${Math.round(ch * 100)}%`);
    else if (Math.abs(ch) > 0.05) notes.push(`${id} ${ch > 0 ? '+' : ''}${Math.round(ch * 100)}%`);
  }
  const sk = c => c.sides.slice().sort().join('|');
  cs.forEach(c => {
    if (c.sides.includes('water')) return;
    const was = length(geo.chains.find(g => sk(g) === sk(c)).pts), now = length(c.pts);
    if (now < 0.8 * was && now < MIN_BORDER) problems.push(`${c.sides} border ${Math.round(was)} -> ${Math.round(now)}`);
  });
  // the narrowest water between shores of Districts that don't share a junction
  const coast = cs.filter(c => c.sides.includes('water') && !c.sides.every(s => s === 'water'));
  const landOf = c => c.sides.find(s => s !== 'water');
  const ends = c => [c.pts[0], c.pts[c.pts.length - 1]].map(key);
  let narrow = Infinity, where = '';
  for (let x = 0; x < coast.length; x++) for (let y = x + 1; y < coast.length; y++) {
    const a = coast[x], b = coast[y];
    if (landOf(a) === landOf(b) || ends(a).some(k => ends(b).includes(k))) continue;
    for (const q of a.pts) for (let k = 0; k < b.pts.length - 1; k++) {
      const d = segDist(q, b.pts[k], b.pts[k + 1]);
      if (d < narrow) { narrow = d; where = `${landOf(a)} / ${landOf(b)}`; }
    }
  }
  if (narrow < 20) problems.push(`water only ${narrow.toFixed(0)} wide between ${where}`);
  // tight corners: pieces can't use them, so they are reported (as seen inside the frame)
  const tight = [];
  for (const [id, r] of Object.entries(regions)) {
    if (!(id in geo.regions) || ['nj', ...GONE].includes(id)) continue;
    const p = r.map(([x, y]) => [Math.min(Math.max(x, FRAME_IN), 1080 - FRAME_IN), Math.min(Math.max(y, FRAME_IN), 1080 - FRAME_IN)])
      .filter((v, i, a) => dist(v, a[(i + 1) % a.length]) > 0.5);
    const turn = Math.sign(p.reduce((t, a, i) => { const b = p[(i + 1) % p.length]; return t + a[0] * b[1] - b[0] * a[1]; }, 0)); // winding
    p.forEach((v, i) => {
      const a = p[(i - 1 + p.length) % p.length], b = p[(i + 1) % p.length];
      const ang = (((turn > 0 ? -1 : 1) * Math.atan2((a[0] - v[0]) * (b[1] - v[1]) - (a[1] - v[1]) * (b[0] - v[0]), (a[0] - v[0]) * (b[0] - v[0]) + (a[1] - v[1]) * (b[1] - v[1]))) * 180 / Math.PI + 360) % 360;
      if (ang < 80) tight.push(`${id} ${Math.round(ang)}°`);
    });
  }
  notes.push(`tight corners (under 80 degrees): ${tight.join(', ') || 'none'}`);
  notes.push(`narrowest water ${narrow.toFixed(0)} (${where})`);
  bs.forEach((b, i) => notes.push(`${b.name} ${Math.round(dist(geo.bridges[i].a, geo.bridges[i].b))} -> ${Math.round(dist(b.a, b.b))}`));
  // a bridge crosses its river square (every bridge is on a 49-wide reach), clear of the
  // corners where its District's shore meets a border
  bs.forEach(b => { if (dist(b.a, b.b) > RIVER + 4) problems.push(`${b.name} is ${dist(b.a, b.b).toFixed(0)} long: it no longer crosses square`); });
  bs.forEach(b => [[b.a, b.join[0]], [b.b, b.join[1]]].forEach(([end, id]) => {
    const js = cs.filter(c => c.sides.includes(id) && c.sides.includes('water')).flatMap(c => [c.pts[0], c.pts[c.pts.length - 1]]);
    const d = Math.min(...js.map(q => dist(q, end)));
    if (d < BRIDGE_CLEAR) problems.push(`${b.name} lands ${d.toFixed(0)} from a ${id} border`);
  }));
  return { problems, notes };
}

// ---------------------------------------------------------------- write
// The whole map for a set of SETTINGS; chamfered bevels the sharp coast corners.
function build(S, chamfered = false) {
  const { chains, moved } = chainsFor(S), cs = chamfered ? chamfer(chains) : chains;
  const regions = regionsFrom(cs, moved), bridges = bridgesFor(cs);
  for (const k of GONE) delete regions[k];
  return { chains: cs.filter(c => !c.sides.some(s => GONE.includes(s))), regions, bridges, labels: { ...draft(S).labels, bridges: bridgeLabels(bridges) } };
}
function write(dir, map, note) {
  const { chains: cs, regions, bridges, labels } = map;
  const { problems, notes } = check(cs, regions, bridges);
  console.log(path.relative(ROOT, dir) + ':\n  ' + notes.join('\n  '));
  if (problems.length) { console.error('Not written:\n  ' + problems.join('\n  ')); process.exit(1); }
  const j = v => JSON.stringify(v);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'board-geometry.json'), `{"note":${j(note)},"size":${j(geo.size)},"regions":{\n`
    + Object.entries(regions).map(([id, r]) => `${j(id)}:${j(r)}`).join(',\n')
    + '},\n"chains":[\n' + cs.map(j).join(',\n') + '],\n"bridges":' + j(bridges) + ',\n"labels":' + j(labels) + '}\n');
  console.log('wrote', path.relative(ROOT, path.join(dir, 'board-geometry.json')));
}
const NOTE = 'Drafted experiment (2026-09-29), written by tools/draft_board.js from Art/Board/board-geometry.json (the skeleton). Same Districts, borders and bridges, redrawn with straight lines and exact angles; Westchester and Nassau are gone, so the Bronx and Queens run to the frame. "labels" places the water and bridge names for this map.';
if (require.main === module) {
  write(OUT, build(SETTINGS), NOTE);
  write(path.join(OUT, 'Chamfered'), build(SETTINGS, true), NOTE.replace('exact angles.', 'exact angles, sharp coast corners bevelled.'));
}
module.exports = { SETTINGS, build, check };
