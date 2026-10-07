#!/usr/bin/env node
// The board's map, drawn as a draughtsman would draw it. Reads the traced map (the
// skeleton, Art/Board/Traced/board-geometry.json, traced from the Affinity art by
// tools/trace_board.js) and writes the board's geometry, which tools/build_board.js draws:
//
//   node tools/draft_board.js      then   node tools/build_board.js
//
// The skeleton gives the Districts, their borders and the bridges; this keeps every
// connection but those FLIPS changes, and redraws the shapes to a plan:
//
// - Straight lines at a few exact angles: level, upright, 45 degrees, and the East River's
//   harbour reach. Manhattan's west coast is one straight line, parallel to the East River,
//   so Manhattan is one width from north to south. The rivers are even channels: the
//   Hudson 44 wide, the East River, Hell Gate and the Sound 49.
// - Square corners where it can be done (Nick: tight corners are dead space). A border
//   meeting a slanted shore or border at a tight angle turns on a short foot (FOOT) to
//   meet it square. The drafting reports any corner under 80 degrees.
// - The Bronx and Queens run to the frame (no Westchester or Nassau), under it to the
//   board's edge as New Jersey does; the build clips them at the frame's hairline. The
//   water east of the Bronx stays, and Staten Island keeps its shore all round.
// - SETTINGS place the level and upright borders. They are tuned for room for pieces,
//   evenness, and short hangers on the signs; see board-handoff.md.
//
// Every chain keeps its two sides and its two end junctions, so no adjacency changes
// but the FLIPS (the chains against Westchester and Nassau go with them). The script checks for
// crossings, shrunken borders, closed-up water and bridges that no longer cross square
// before writing. Bridges keep their places (BRIDGE_SHIFT moves one) and cross square
// to the new banks.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'Art', 'Board', 'Traced', 'board-geometry.json');
const OUT = path.join(ROOT, 'Art', 'Board', 'board-geometry.json');
const geo = JSON.parse(fs.readFileSync(SRC, 'utf8'));
const traced = JSON.parse(JSON.stringify(geo.regions)); // before the flips, for the area check
const r1 = v => Math.round(v * 10) / 10;
const key = p => `${p[0]},${p[1]}`;
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

// ---------------------------------------------------------------- connections
// The traced map's connections, changed where Nick has chosen a cleaner layout. A flip
// takes the border between two Districts (A | B, from junction J1 to J2) and gives it to
// the two faces at its ends instead (X at J1, Y at J2), so A and B no longer meet and X
// and Y do. The points keep their keys: J1 becomes the junction of A, X and Y, and J2 of
// B, X and Y, and MOVE places them as usual.
//
// Astoria | Williamsburg was flipped on 2026-09-29 (Corona took a spur of East River shore
// between them) and put back the same day: Nick disliked the spur. Manhattan laid like
// bricks (2026-10-07, Nick: the layout may change, so long as the board stays interesting
// and the connections aren't a serial row): East Harlem / Tenderloin goes to West Side /
// Five Points, and Five Points' Hudson shore to Tenderloin / Bowery. A third entry names a
// junction the flipped chain ends at, where two chains have the same sides.
const FLIPS = [['tenderloin', 'east_harlem'], ['water', 'five_points', '220,452']];
// Districts whose size changed on purpose, which the area check leaves be: every District a
// flip touches, Manhattan's, grown when it widened to one width, Staten Island's, which rose
// with the Bowery's foot, Belmont, Fordham and Hunts Point, rebalanced round the four-way
// corner, and Canarsie (canarsie), which gave Coney Island the width for its name
// (coneyEast) and took Brownsville's corner on the bay.
const RESHAPED = new Set(['west_side', 'east_harlem', 'canarsie', 'brownsville', 'sugar_hill', 'tenderloin', 'five_points', 'bowery', 'westerleigh', 'stapleton', 'tottenville', 'hunts_point', 'belmont', 'fordham']);
function flip(g, [A, B, J]) {
  const i = g.chains.findIndex(c => c.sides.includes(A) && c.sides.includes(B) && (!J || [c.pts[0], c.pts[c.pts.length - 1]].some(q => key(q) === J))), c = g.chains[i];
  const [J1, J2] = [c.pts[0], c.pts[c.pts.length - 1]].map(key);
  const at = (j, not) => g.chains.find(d => d !== c && [d.pts[0], d.pts[d.pts.length - 1]].some(q => key(q) === j) && d.sides.includes(not));
  const faceAt = (j) => { const d = at(j, A), e = at(j, B); return [d.sides.find(x => x !== A), e.sides.find(x => x !== B)]; };
  const [X] = faceAt(J1), [Y] = faceAt(J2);
  const reend = (d, from, to) => { d.pts = d.pts.map(q => key(q) === from ? to.split(',').map(Number) : q); };
  reend(at(J1, B), J1, J2); // B | X now ends at J2
  reend(at(J2, A), J2, J1); // A | Y now starts at J1
  g.chains[i] = { sides: [X, Y], pts: c.pts.slice() };
  const ring = id => g.regions[id], inner = c.pts.slice(1, -1);
  // A and B lose the border (its far end and its interior points)
  const drop = (id, j) => { if (ring(id)) g.regions[id] = ring(id).filter(q => key(q) !== j && !inner.some(v => key(v) === key(q))); };
  // X and Y gain it beside the end they had, between that end and their neighbour on the
  // chain that now runs to the gained end
  const add = (id, have, run, via) => {
    const r = ring(id); if (!r) return; // the water has no ring
    const k = r.findIndex(q => key(q) === have), n = r.length, on = q => via.pts.some(v => key(v) === key(q));
    if (on(r[(k - 1 + n) % n])) r.splice(k, 0, ...run.slice().reverse()); else r.splice(k + 1, 0, ...run);
  };
  const bySides = (u, v) => g.chains.find(d => d.sides.includes(u) && d.sides.includes(v));
  const XB = bySides(X, B), AY = bySides(A, Y), P = c.pts[0], Q = c.pts[c.pts.length - 1];
  drop(A, J2); drop(B, J1);
  add(X, J1, [...inner, Q], XB); add(Y, J2, [...inner.slice().reverse(), P], AY);
  for (const id of [A, B, X, Y]) RESHAPED.add(id);
}
for (const f of FLIPS) flip(geo, f);

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

// The drafting's settings: where the level and upright borders sit. They are
// balanced for room (see board-handoff.md): the smaller Districts, the crown rooms
// first, get what the roomy ones can spare. Since the signs, they also keep the
// signs' hangers short where a border can move without costing room.
const SETTINGS = {
  bronxCols: [685, 871], // Belmont | Fordham | Morris Park (Fordham | Morris Park was 862 until 2026-09-30, moved with hpCol)
  bronxRow: 184, // Fordham and Morris Park / Throggs Neck, level to the east shore
  huntsTop: 150, // Belmont and Fordham / Hunts Point, level; above bronxRow, it drops to it at Throggs Neck at 45 degrees
  hellGate: 321.6, // the Hell Gate's Bronx bank: level, in one line with the Sound (it rose 3 degrees east to the Sound until 2026-09-30, a kink on Astoria's shore)
  corner: [608, 198], // the four-way corner (Sugar Hill, Belmont, East Harlem, Hunts Point)
  manhattan: [298, 415, 545], // level borders: Sugar Hill | West Side, the row across Manhattan, the Tenderloin | the Bowery (560 until 2026-10-07, across Five Points too)
  astoriaCorona: 530, // Astoria / Corona, level once its foot has left the Queens / Brooklyn line
  hpCol: 825, // Hunts Point / Throggs Neck, upright (816 until 2026-09-30: moved east so Hunts Point's name fits on one line)
  queensCol: 851, // Astoria and Corona | Whitestone and Flushing, upright from the Hell Gate or the Sound
  queensRows: [488, 670, 807], // level borders: Whitestone | Flushing | Richmond Hill | Jamaica
  wbTop: 593, // Williamsburg's top corner on the East River (x), where the Queens / Brooklyn line leaves it
  coronaBottom: 700, // Corona / Richmond Hill, level from the Queens / Brooklyn line
  williamsburgSouth: 749, // Williamsburg's southern point, on Red Hook / Brownsville
  redHookSouth: 796, // Red Hook's level south side
  rhStub: 10, // Red Hook's shore runs upright this far above its south side: shorter moves the Narrows west, widening Coney Island
  coneyEast: 458, // Coney Island / Canarsie, upright (440 until 2026-09-30: moved east so Coney Island's name fits on one line)
  boweryBottom: 652, stapletonTop: 684, // the Kill van Kull between them, as wide as the Narrows (668 and 700 until 2026-10-07: the widened Bowery gave height to Staten Island)
  staten: [803, 913], // level borders: Westerleigh | Stapleton | Tottenville
  bayEast: 90, // Jamaica Bay's east side, moved east (Jamaica gives it the ground)
  ehKnee: 715, // East Harlem / Hunts Point runs from the four-way corner at 45 degrees to here (x), then drops upright to the Hell Gate
};

const RIVER = 49; // the East River's width, Hell Gate and the Sound included
const EAST_EDGE = 1080; // Queens runs to the board's edge, under the frame
const BRONX_EAST = 1030; // the Bronx's east shore, upright
const FOOT = 24; // a border's foot: its last stretch turned to meet a slanted shore or border square
const NARROWS_GAP = 32; // the Narrows, Staten Island to Brooklyn
// Bridges moved along their rivers: the Hell Gate clear of East Harlem's stretch of it, the
// Queensboro up the East River to the middle of East Harlem's shore, which ends at Manhattan's
// row (since 2026-10-07), and the Brooklyn up the harbour reach, mid-way along the stretch of
// the Bowery's shore that faces Red Hook's (since 2026-10-07, when the Bowery's foot rose)
const BRIDGE_SHIFT = { 'Hell Gate Bridge': [30, 0], 'Queensboro Bridge': [70, -70], 'Brooklyn Bridge': [16, -23] };
const MIN_BORDER = 45; // a border that has shrunk still runs this far (25 mm), so it reads as a connection
const GONE = ['north', 'east']; // Westchester and Nassau: the Districts meet the frame instead
const FRAME_IN = 13; // the frame's hairline, as build_board.js draws it
const SOUTH_SHORE = 1020; // the Rockaways, level
const BK_COL = 600; // Red Hook / Brownsville and Canarsie / Brownsville, upright (595.5 until 2026-09-30: moved east so Canarsie's sign fits on one line)
const BOWERY_BANK = 602, RED_HOOK_BANK = BOWERY_BANK + RIVER; // the East River's level turn
const HUDSON = 44; // the Hudson's width
const HARBOUR = [-314, 440]; // the harbour reach's direction, Red Hook to the Narrows (the Hudson ran parallel to it until 2026-10-07)
const BOWERY_WEST = FRAME_IN + HUDSON; // the Bowery's west shore, upright, a Hudson's width in from the frame
const HEAT_CORNER = [413.9, 120.27]; // the Heat corner's outer corner, as build_board.js draws it (HEAT.edge)

function draft(S) {
  const ER_MN = line([694, 328], [-1, 1]); // East River, Manhattan bank, 45 degrees
  const ER_QN = shift(ER_MN, -RIVER);
  const NJ = line(HEAT_CORNER, [-1, 1]); // New Jersey's shore, at 45 degrees from the Heat corner's corner
  const MN_WEST = shift(NJ, -HUDSON); // Manhattan's west coast, one line across the Hudson, parallel to the East River
  const ER_RH = line([287, 788], HARBOUR); // the harbour reach
  const ER_BW = shift(ER_RH, RIVER);
  const HG_BX = line([694, S.hellGate], [1, 0]); // Hell Gate, level, and the Sound runs on from it
  const HG_QN = shift(HG_BX, RIVER);
  const BEND = atX(HG_BX, S.hpCol); // turns at Hunts Point / Throggs Neck
  const SOUND_BX = line(BEND, [1, 0]); // the Sound, level
  const SOUND_QN = shift(SOUND_BX, RIVER);
  const QN_NORTH = atX(SOUND_QN, EAST_EDGE);
  const RH_STUB = atY(ER_RH, S.redHookSouth - S.rhStub); // Red Hook's shore turns upright here, in line with Coney Island's
  const NARROWS = [RH_STUB[0] - NARROWS_GAP, RH_STUB[0]]; // Staten Island's east shore, Brooklyn's
  const [m1, m2, m3] = S.manhattan, [b1, b2] = S.bronxCols, W = 0, [s1, s2] = S.staten;
  const [q1, q2, q3] = S.queensRows, qc = S.queensCol, cb = S.coronaBottom;
  const QN_TURN = meet(HG_QN, SOUND_QN), AW = qc <= QN_TURN[0] ? atX(HG_QN, qc) : atX(SOUND_QN, qc); // Astoria / Whitestone on the shore
  // Manhattan's west coast turns upright to the Bowery's west shore at MN_TURN. New Jersey's
  // shore runs from the Heat corner (it runs up under the corner from there) to the board's
  // edge (NJ_END), so the Hudson opens to the frame beside the Bowery.
  const MN_TURN = atX(MN_WEST, BOWERY_WEST), NJ_TOP = HEAT_CORNER, NJ_END = atX(NJ, 0);
  if (MN_TURN[1] < m2 + FOOT) throw new Error('The Hudson turns upright above the Tenderloin: Manhattan is too wide');
  // A level border meeting a slanted line at a tight corner gets a foot: its last FOOT
  // units turned to meet the line square. From P, where it met the line, running along
  // the line's direction d away from the tight corner: [where the foot lands, where it leaves the level].
  const footOf = (P, d, east) => {
    const c = Math.abs(d[0]), sn = Math.abs(d[1]); // the tight corner's angle, as cos and sin
    return [[P[0] + d[0] * FOOT * c / sn, P[1] + d[1] * FOOT * c / sn], [P[0] + (east ? 1 : -1) * FOOT / sn, P[1]]];
  };
  const upCoast = [-MN_WEST.d[0], -MN_WEST.d[1]]; // up Manhattan's west coast
  const MF = [m1, m2, m3].map(m => footOf(atY(MN_WEST, m), upCoast, true)); // each Manhattan border's foot on the Hudson
  // Tenderloin / Bowery meets the coast on a foot, or the Bowery's upright shore square
  const onCoast = m3 < MN_TURN[1], TB_W = onCoast ? MF[2][0] : [BOWERY_WEST, m3];
  // Queens / Brooklyn: one line square off the East River from Williamsburg's top corner,
  // Williamsburg / Brownsville square to it (so Williamsburg is a square on its corner),
  // turning upright where Corona's bottom meets it, down to the bay. Astoria / Corona leaves
  // the line square on a foot, then runs level.
  const CR = atX(ER_QN, S.wbTop), QB = line(CR, [1, 1]);
  const WB_E = meet(QB, line([BK_COL, S.williamsburgSouth], [1, -1]));
  const QB_C = atY(QB, cb), bv = QB_C[0]; // Brownsville's east side, upright from there to the bay
  const AC_J = atY(QB, S.astoriaCorona + FOOT / Math.SQRT2); // Astoria / Corona / Williamsburg, on the line
  const AC_BEND = [AC_J[0] + FOOT / Math.SQRT2, S.astoriaCorona]; // where the foot turns level
  // Canarsie / Brownsville runs at 45 degrees from Red Hook's corner down to Jamaica Bay,
  // meeting the bay's 45-degree shore square (the bay's corner itself made a 35-degree slant)
  const sbRun = (680 + 853 - BK_COL - S.redHookSouth) / 2, SB_BAY = [BK_COL + sbRun, S.redHookSouth + sbRun];
  // a level border's foot on the East River, square to it: [where it leaves the level, where it lands]
  const riverFoot = y => { const q = [atY(ER_MN, y)[0] - FOOT * Math.SQRT2, y]; return [q, meet(line(q, [1, 1]), ER_MN)]; };
  const CROOK = atY(ER_BW, BOWERY_BANK); // where the Bowery's shore turns from the river's level turn down the harbour reach
  const WB_J = meet(line([BK_COL, S.williamsburgSouth], [1, 1]), ER_QN); // Williamsburg / Red Hook, square to the East River
  // Sugar Hill / Belmont runs from the four-way corner square to the west coast, at 45
  // degrees; Manhattan's tip is where it meets the coast
  const CORNER = S.corner, TIPB = meet(MN_WEST, line(CORNER, [-1, -1]));
  // The four-way corner (Sugar Hill, Belmont, East Harlem, Hunts Point): East Harlem /
  // Hunts Point runs out at 45 degrees to the knee, then upright to the Hell Gate; Belmont /
  // Hunts Point leaves the corner square to it, up to Hunts Point's top (huntsTop), which runs
  // level across Belmont and Fordham and drops to the Bronx's row at 45 degrees just short of
  // Throggs Neck.
  const KNEE = atX(line(CORNER, [1, 1]), S.ehKnee), EH_SHORE = atX(HG_BX, S.ehKnee);
  // Manhattan laid like bricks, in rows: Sugar Hill and East Harlem, West Side and East Harlem,
  // the Tenderloin and Five Points, the Bowery. One level line (m2, the row) crosses Manhattan
  // from shore to shore. Above it East Harlem's west side is upright (EHX), from where Sugar
  // Hill / East Harlem comes down at 45 degrees from the four-way corner; below it Five Points'
  // west side is upright too (FPX), further west, so West Side sits on both the Tenderloin and
  // Five Points. The coast and the river slant the same way, so a column that kept one upright
  // would widen on the west and taper on the east as it ran south; the step west at the row
  // keeps the bricks even. Five Points' upright drops straight onto the crook in the river
  // (CROOK), so Five Points runs down to it and the Bowery's top steps down there, from the
  // Tenderloin's foot (m3) to the crook.
  const EHX = CORNER[0] - (m1 - CORNER[1]), EHY = m2, FPX = CROOK[0];
  const [ebFoot, EB_J] = riverFoot(EHY);
  if (FPX > EHX - 3 || ebFoot[0] < EHX + 3) throw new Error('Five Points\' upright must sit west of East Harlem\'s, and East Harlem\'s clear of the East River');
  if (m3 > BOWERY_BANK - 3) throw new Error('The Tenderloin / Bowery border must sit above the crook in the river');
  const BH = atY(line(CORNER, [1, -1]), S.huntsTop);
  const HT = S.bronxRow - S.huntsTop, HT_DROP = [S.hpCol - HT, S.huntsTop];
  if (KNEE[1] > S.hellGate - 3) throw new Error('East Harlem / Hunts Point reaches the Hell Gate before its knee');
  if (BH[0] > b1 - 3 || HT < 0 || (HT > 0 && HT_DROP[0] < b1 + 3)) throw new Error('Hunts Point\'s top must sit at or above the Bronx row, clear of Belmont / Fordham');

  // Each skeleton point: where it goes (MOVE) or dropped (DROP, the tracer's jogs and
  // points a straight line no longer needs). Chains listed in REPLACE get new interior
  // points outright, where a shape gains corners it didn't have.
  const MOVE = {
    // New Jersey (see REPLACE)
    '382,0': [NJ_TOP[0], 0], '382,165': NJ_TOP, '0,707': NJ_END,
    '464,108': TIPB, '606,191': CORNER, // Manhattan's tip, and the four-way corner, on Sugar Hill / Belmont
    '544,0': [TIPB[0], 0], '533,51': [TIPB[0], W], '1056,0': [BRONX_EAST, 0], '1050,53': [BRONX_EAST, W],
    // Manhattan: level borders meeting one straight coast, each on a foot (Tenderloin / Bowery
    // meets the Bowery's upright shore square instead, once the coast has turned)
    '371,248': MF[0][0], '535,279': [EHX, m1],
    '290,360': MF[1][0], '523,357': [FPX, m2],
    '220,452': TB_W, '509,453': [EHX, EHY], '533,477': EB_J, '150,548': [FPX, m3],
    '466,549': CROOK, '694,328': EH_SHORE,
    '307,696': atY(ER_BW, S.boweryBottom), '171,686': [BOWERY_WEST, S.boweryBottom],
    // The Bronx: an upright east shore, level blocks
    '715,53': [b1, W], '715,160': [b1, S.huntsTop], '898,53': [b2, W], '881,199': [b2, S.bronxRow], '799,196': [S.hpCol, S.bronxRow],
    '1029,231': [BRONX_EAST, S.bronxRow], '829,299': BEND, '1022,330': atX(SOUND_BX, BRONX_EAST),
    // Queens: the river banks, level and upright borders
    '720,373': meet(HG_QN, ER_QN), '766,356': AW,
    '1033,386': QN_NORTH, '1080,392': [1080, QN_NORTH[1]],
    '597,494': CR, '637,548': AC_J,
    '838,496': [qc, q1], '831,548': [qc, S.astoriaCorona], '1031,479': [EAST_EDGE, q1],
    // Corona's bottom level from the Queens / Brooklyn line to the Queens column; Richmond Hill steps up to Flushing there
    '707,644': WB_E, '750,705': QB_C, '892,650': [qc, q2], '1031,651': [EAST_EDGE, q2],
    '794,782': [bv, q3], '895,783': [895, q3], '1031,832': [EAST_EDGE, q3],
    '1032,991': [EAST_EDGE, SOUTH_SHORE], '1080,988': [1080, SOUTH_SHORE],
    // Brooklyn: the East River's reaches, Red Hook's level south side, upright borders
    '447,651': WB_J, '425,681': atY(ER_RH, RED_HOOK_BANK), '283,797': [RH_STUB[0], S.redHookSouth],
    '602,704': [BK_COL, S.williamsburgSouth], '589,792': [BK_COL, S.redHookSouth],
    '639,894': SB_BAY,
    '451,787': [S.coneyEast, S.redHookSouth], '437,983': [S.coneyEast, 983], '299,989': [NARROWS[1], 989],
    // Jamaica Bay: a 45-degree octagon (its Canarsie and Jamaica sides are in REPLACE)
    '709,848': [680, 853], '793,857': [bv, 853],
    // Staten Island: an octagon (see REPLACE), level borders
    '37,816': [36, s1], '261,837': [NARROWS[0], s1], '30,910': [36, s2], '272,932': [NARROWS[0], s2],
  };
  const T = S.stapletonTop, B = S.bayEast;
  const TIP = atX(SOUND_BX, BRONX_EAST);
  const REPLACE = {
    // the Bronx: Belmont's shore upright from Manhattan's tip to the frame; Throggs Neck square
    'water|belmont': [[TIPB[0], W], TIPB],
    'throggs_neck|water': [[BRONX_EAST, S.bronxRow], TIP, BEND],
    'east_harlem|hunts_point': [CORNER, KNEE, EH_SHORE],
    'east_harlem|water': [EH_SHORE, meet(HG_BX, ER_MN), EB_J],
    'sugar_hill|east_harlem': [CORNER, [EHX, m1]],
    'west_side|east_harlem': [[EHX, m1], [EHX, EHY]],
    'west_side|five_points': [[FPX, m2], [EHX, m2]],
    'tenderloin|five_points': [[FPX, m2], [FPX, m3]],
    'east_harlem|five_points': [[EHX, EHY], ebFoot, EB_J],
    'tenderloin|bowery': onCoast ? [MF[2][0], MF[2][1], [FPX, m3]] : [TB_W, [FPX, m3]],
    ...(onCoast ? {} : { 'water|tenderloin': [MF[1][0], MN_TURN, TB_W] }),
    'belmont|hunts_point': [[b1, BH[1]], BH, CORNER],
    'fordham|hunts_point': [[b1, S.huntsTop], ...(HT > 0 ? [HT_DROP] : []), [S.hpCol, S.bronxRow]],
    'corona|richmond_hill': [[qc, q2], ...(q2 < cb ? [[qc, cb]] : []), QB_C],
    'canarsie|brownsville': [[BK_COL, S.redHookSouth], SB_BAY],
    'brownsville|water': [[bv, 853], [680, 853], SB_BAY],
    'canarsie|water': [SB_BAY, [BK_COL, 853 + 680 - BK_COL], [BK_COL, 975], [BK_COL + 26.5, 1001.5], [BK_COL + 26.5, 1011], [S.coneyEast, 983]],
    // Manhattan's borders on their feet; the Bowery's shore turns upright below its foot
    'sugar_hill|west_side': [MF[0][0], MF[0][1], [EHX, m1]],
    'west_side|tenderloin': [MF[1][0], MF[1][1], [FPX, m2]],
    'five_points|bowery': [[FPX, m3], CROOK],
    'five_points|water': [EB_J, atY(ER_MN, BOWERY_BANK), CROOK],
    'water|bowery': [TB_W, ...(onCoast ? [MN_TURN] : []), [BOWERY_WEST, S.boweryBottom], atY(ER_BW, S.boweryBottom), CROOK],
    // New Jersey: parallel to Manhattan's west coast, from under the Heat corner to the board's edge
    'nj|water': [[NJ_TOP[0], 0], NJ_TOP, NJ_END],
    // Astoria / Corona on a foot at the Queens / Brooklyn line; Red Hook's shore up the East River to Williamsburg, and upright at the Narrows
    'astoria|corona': [AC_J, AC_BEND, [qc, S.astoriaCorona]],
    // the Hell Gate's turn on the Queens side is Astoria's or Whitestone's, whichever it falls in
    'water|astoria': [AW, ...(qc > QN_TURN[0] ? [QN_TURN] : []), meet(HG_QN, ER_QN), CR],
    'water|whitestone': [AW, ...(qc < QN_TURN[0] ? [QN_TURN] : []), QN_NORTH],
    'water|red_hook': [WB_J, atY(ER_QN, RED_HOOK_BANK), atY(ER_RH, RED_HOOK_BANK), RH_STUB, [RH_STUB[0], S.redHookSouth]],
    // Jamaica: the bay's east side as an octagon, then a level spit and shore
    'water|jamaica': [[bv, 853], [820 + B, 853], [856 + B, 889], [856 + B, 945], [801 + B, 1000], [700, 1000], [700, 1012], [708, SOUTH_SHORE], [EAST_EDGE, SOUTH_SHORE]],
    // Staten Island: 45-degree corners, upright shores
    'water|westerleigh': [[36, s1], [36, T + 27], [63, T], [NARROWS[0] - 37, T], [NARROWS[0], T + 37], [NARROWS[0], s1]],
    'water|tottenville': [[36, s2], [36, 1005], [63, 1032], [NARROWS[0] - 49, 1032], [NARROWS[0], 983], [NARROWS[0], s2]],
  };
  // Where the labels in the water sit on this map: midway between shores, at their angle.
  const labels = {
    boro: {
      MN: [...atY(shift(MN_WEST, HUDSON / 2), 440).map(r1), -45], // beside the Tenderloin and Five Points, clear of West Side's piers
      BX: [(BRONX_EAST + 1080 - FRAME_IN) / 2, r1((FRAME_IN + TIP[1]) / 2), -90], // beside the Bronx's east shore
      QN: [890, (SOUTH_SHORE + 1067) / 2, 0], BK: [525, 1030, 8.6], SI: [172, 1050, 0],
    },
    water: [['EAST RIVER', 403, (BOWERY_BANK + RED_HOOK_BANK) / 2, 0], ['JAMAICA BAY', 728 + B / 2, 926, 0]],
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
    return { sides: c.sides, pts: c.pts.filter((q, i) => i === 0 || i === c.pts.length - 1 || !dropped.has(key(q)) || key(q) in MOVE).map(moved) };
  });
  return { chains, moved };
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
// Tight corners, under 80 degrees: pieces can't use them (Nick), so the drafting reports
// them and the tuner rejects them. Measured inside the frame.
function tightCorners(regions) {
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
  return tight;
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
    const ch = area(r) / area(traced[id]) - 1;
    const framed = r.some(q => q[0] <= 0 || q[0] >= 1080 || q[1] <= 0); // took in Westchester or Nassau
    if (Math.abs(ch) > 0.2 && !framed && !RESHAPED.has(id)) problems.push(`${id} area ${Math.round(ch * 100)}%`);
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
  const tight = tightCorners(regions);
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
// The whole map for a set of SETTINGS.
function build(S) {
  const { chains: cs, moved } = chainsFor(S);
  const regions = regionsFrom(cs, moved), bridges = bridgesFor(cs);
  for (const k of GONE) delete regions[k];
  return { chains: cs.filter(c => !c.sides.some(s => GONE.includes(s))), regions, bridges, labels: { ...draft(S).labels, bridges: bridgeLabels(bridges) } };
}
function write({ chains: cs, regions, bridges, labels }) {
  const { problems, notes } = check(cs, regions, bridges);
  console.log(notes.join('\n'));
  if (problems.length) { console.error('Not written:\n  ' + problems.join('\n  ')); process.exit(1); }
  const j = v => JSON.stringify(v);
  fs.writeFileSync(OUT, `{"note":${j(NOTE)},"size":${j(geo.size)},"regions":{\n`
    + Object.entries(regions).map(([id, r]) => `${j(id)}:${j(r)}`).join(',\n')
    + '},\n"chains":[\n' + cs.map(j).join(',\n') + '],\n"bridges":' + j(bridges) + ',\n"labels":' + j(labels) + '}\n');
  console.log('wrote', path.relative(ROOT, OUT));
}
const NOTE = 'Written by tools/draft_board.js from Art/Board/Traced/board-geometry.json (the traced map). The same Districts, borders and bridges, redrawn with straight lines, exact angles and square corners; the Bronx and Queens run to the frame. "labels" places the water and bridge names for this map.';
if (require.main === module) write(build(SETTINGS));
module.exports = { SETTINGS, build, check, tightCorners };
