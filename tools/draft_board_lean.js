#!/usr/bin/env node
// The Lean board: a third design for the map, drawn fresh beside the board and the Squared proof
// (Nick, 2026-11-21: "more squared and abstract, yet recognisable NYC ... a piece of art, like the
// London tube map"; then, of the all-rectangles proof, "a bit too Minecraft": something between,
// with some angles, more like a 1929 city or precinct map).
//
//   node tools/draft_board_lean.js      then   node tools/build_board.js --variant=lean
//
// It writes Art/Board/Lean/board-geometry.json in the shape tools/build_board.js reads (regions,
// chains, bridges, labels, panels). Nothing here reads the traced map. The plan:
//
// - Level courses, leaning avenues. Every border that runs across the board is level, so every
//   District has a level top for its sign; every border that runs up the board leans to the
//   north-east, as Manhattan's avenues do on a true map. The lean is steepest on the Hudson and
//   eases to upright at the board's east edge, so the blocks fan out like a surveyed grid, not a
//   sheared one. No District has a corner under 75 degrees.
// - The Hudson runs out under the Heat corner as it would under the frame. Belmont hangs from the
//   corner's lower edge, and its line with Fordham and Hunts Point starts at the corner's point.
// - New Jersey is a wedge that tapers away down the Hudson and holds the Tomorrow panel. The key
//   and the title float on Long Island Sound in the top right, as a legend ("panels": { "at" }).
// - Manhattan narrows uptown and ends in feet cut square to its own axis. Long Island is a top
//   row (Astoria, Whitestone) on three columns laid in running bond, with Jamaica Bay in the gap.
//
// The map is the board's: the script reads Art/Board/board-geometry.json for the connections
// (every land border and bridge) and stops if this drawing differs from them, or if a Dock has
// no water, a border runs under MIN_BORDER, a channel closes up or a corner is too sharp.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PINNED = path.join(ROOT, 'Art', 'Board', 'board-geometry.json');
const OUT = path.join(ROOT, 'Art', 'Board', 'Lean', 'board-geometry.json');
const r1 = v => Math.round(v * 10) / 10;
const key = p => `${p[0]},${p[1]}`;
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

const W = 1080; // the board; Districts on the frame run under it to the edge, as on the board
const HEAT = [413.9, 120.3]; // the Heat corner's outer corner, as build_board.js draws it (HEAT.edge)
const MIN_WATER = 44; // the narrowest a channel may be
const MIN_BORDER = 45; // a border runs at least this far (25 mm), so it reads as a connection
const MIN_CORNER = 74.5; // no District corner sharper than this, in degrees
const BRIDGE_CLEAR = 20; // a bridge lands at least this far from the end of either bank
const DOCKS = ['west_side', 'bowery', 'belmont', 'throggs_neck', 'whitestone', 'jamaica', 'red_hook', 'canarsie', 'stapleton', 'tottenville'];

// ---------------------------------------------------------------- the plan
// A leaning line: through (x, y), moving k west for each unit south. at(y) is its x there.
const lean = (x, y, k) => ({ k, at: yy => x - k * (yy - y), pt: yy => [x - k * (yy - y), yy] });
const off = (l, dx) => lean(l.at(0) + dx, 0, l.k); // the same line, dx east
const across = k => Math.sqrt(1 + k * k); // a channel's width along a level line, per unit of true width

const PLAN = {
  hudson: 46, river: 49, // the Hudson's width; the East River's, the Hell Gate's and the Sound's
  // leans (units west per unit south): the Hudson, Belmont's east line, Manhattan's middle line, the East River
  kHudson: 0.27, kBelmont: 0.2, kMiddle: 0.14, kRiver: 0.2,
  // the Bronx
  belmont: 190, // Belmont's top, from the Hudson to the Heat corner's point
  yFordham: 168, // Fordham's foot (Hunts Point's top)
  yMorris: 140, // Morris Park's foot (Throggs Neck's top)
  yBronx: 295, // the Bronx's foot: Manhattan's top and the Sound's north shore
  huntsTop: 184, // Hunts Point's level top, east from Belmont's line
  nose: [40, 45], // Throggs Neck's nose between Fordham and Hunts Point: how far its upper and lower cuts run
  kFordham: 0.1, kHunts: 0.12, kSound: 0.06, // Fordham's east line, Hunts Point's, and the Sound's shore
  soundShore: 868, // where the Sound's shore meets the top edge
  // Manhattan
  westSide: 152, sugarHill: 195, // their tops
  ySugar: 448, yWest: 495, yFive: 612, // the feet of Sugar Hill, West Side and Five Points
  yTenderloin: 650, yBowery: 775, foot: 0.17, // where the Tenderloin's and the Bowery's feet start on their west sides, and their slope
  // Long Island
  yRow: 510, // the foot of the top row (Astoria, Whitestone)
  col1: 174, col2: 213, astoriaOver: 48, // the columns' widths at yRow, and how far Astoria runs over Richmond Hill
  kCol1: 0.13, kCol2: 0.05,
  yWilliamsburg: 701, yRedHook: 860, yConey: 1010, // column 1's feet
  yRichmond: 655, yBrownsville: 795, yCanarsie: 962, // column 2's feet
  yFlushingTop: 410, yFlushing: 609, yJamaica: 795, // column 3
  canarsie: 196, kBay: 0.05, // Canarsie's top, and its bay shore's lean
  coneyFoot: -0.06, // Coney Island's and Canarsie's feet slope (negative: down to the west)
  // Staten Island
  si: { top: 872, east: 338, k: 0.15, join: 172, kJoin: 0.1 },
  // bridges: where each leaves its first shore (a level, or for the Hell Gate an x)
  hellGate: 594, queensboro: 388, williamsburg: 543, brooklyn: 733,
};

function draft(P) {
  const [hx, hy] = HEAT;
  const hud = lean(hx - P.belmont, hy, P.kHudson); // the Hudson's east shore
  const nj = off(hud, -P.hudson * across(P.kHudson)); // New Jersey's shore
  const bel = lean(hx, hy, P.kBelmont); // Belmont's east line, from the Heat corner's point
  const mid = lean(hud.at(P.yBronx) + P.westSide, P.yBronx, P.kMiddle); // Manhattan's middle line
  const east = lean(mid.at(P.yBronx) + P.sugarHill, P.yBronx, P.kRiver); // Manhattan's east shore
  const li = off(east, P.river * across(P.kRiver)); // Long Island's west shore
  const ySound = P.yBronx + P.river; // Long Island's north shore

  // The Bronx
  const pNose = [bel.at(P.yFordham) + P.huntsTop, P.yFordham]; // Throggs Neck's nose
  const pFord = [pNose[0] + P.nose[0], P.yMorris]; // Fordham's corner with Morris Park and Throggs Neck
  const ford = lean(pFord[0], pFord[1], P.kFordham);
  const pHunts = [pNose[0] + P.nose[1], P.yFordham + P.nose[1]]; // Hunts Point's corner under the nose
  const hunts = lean(pHunts[0], pHunts[1], P.kHunts);
  const sound = lean(P.soundShore, 0, P.kSound);
  const R = {};
  R.nj = [[0, hy], [nj.at(hy), hy], [0, hy + nj.at(hy) / P.kHudson]];
  R.belmont = [hud.pt(hy), [hx, hy], bel.pt(P.yFordham), bel.pt(P.yBronx), mid.pt(P.yBronx), hud.pt(P.yBronx)];
  R.fordham = [[hx, 0], ford.pt(0), pFord, pNose, bel.pt(P.yFordham), [hx, hy]];
  R.morris_park = [ford.pt(0), sound.pt(0), sound.pt(P.yMorris), pFord];
  R.hunts_point = [bel.pt(P.yFordham), pNose, pHunts, hunts.pt(P.yBronx), east.pt(P.yBronx), bel.pt(P.yBronx)];
  R.throggs_neck = [pFord, sound.pt(P.yMorris), sound.pt(P.yBronx), hunts.pt(P.yBronx), pHunts, pNose];

  // Manhattan: West Side and the Tenderloin on the Hudson, Sugar Hill, Five Points and the Bowery on
  // the East River, laid in bond; the feet are cut square to the island
  const tlFoot = [hud.pt(P.yTenderloin), mid.pt(P.yTenderloin + P.foot * (mid.at(P.yTenderloin) - hud.at(P.yTenderloin)))];
  const bwFoot = [mid.pt(P.yBowery), east.pt(P.yBowery + P.foot * (east.at(P.yBowery) - mid.at(P.yBowery)))];
  R.west_side = [hud.pt(P.yBronx), mid.pt(P.yBronx), mid.pt(P.ySugar), mid.pt(P.yWest), hud.pt(P.yWest)];
  R.sugar_hill = [mid.pt(P.yBronx), bel.pt(P.yBronx), east.pt(P.yBronx), east.pt(P.ySugar), mid.pt(P.ySugar)];
  R.five_points = [mid.pt(P.ySugar), east.pt(P.ySugar), east.pt(P.yFive), mid.pt(P.yFive), mid.pt(P.yWest)];
  R.tenderloin = [hud.pt(P.yWest), mid.pt(P.yWest), mid.pt(P.yFive), tlFoot[1], tlFoot[0]];
  R.bowery = [mid.pt(P.yFive), east.pt(P.yFive), bwFoot[1], bwFoot[0], tlFoot[1]];

  // Long Island: the top row, then three columns
  const c1 = lean(li.at(P.yRow) + P.col1, P.yRow, P.kCol1); // column 1 | column 2
  const ast = lean(c1.at(P.yRow) + P.astoriaOver, P.yRow, P.kCol1); // Astoria | Whitestone
  const c2 = lean(c1.at(P.yRow) + P.col2, P.yRow, P.kCol2); // column 2 | column 3, and Whitestone's shore
  const bay = lean(c1.at(P.yBrownsville) + P.canarsie, P.yBrownsville, P.kBay); // Canarsie's shore on Jamaica Bay
  const footAt = (l, y, x0) => { // a foot from (x0, y) sloping to the line l
    let yy = y; for (let i = 0; i < 20; i++) yy = y + P.coneyFoot * (l.at(yy) - x0); return [l.at(yy), yy];
  };
  R.astoria = [li.pt(ySound), ast.pt(ySound), ast.pt(P.yRow), c1.pt(P.yRow), li.pt(P.yRow)];
  R.whitestone = [ast.pt(ySound), c2.pt(ySound), c2.pt(P.yFlushingTop), c2.pt(P.yRow), ast.pt(P.yRow)];
  R.williamsburg = [li.pt(P.yRow), c1.pt(P.yRow), c1.pt(P.yRichmond), c1.pt(P.yWilliamsburg), li.pt(P.yWilliamsburg)];
  R.red_hook = [li.pt(P.yWilliamsburg), c1.pt(P.yWilliamsburg), c1.pt(P.yBrownsville), c1.pt(P.yRedHook), li.pt(P.yRedHook)];
  const coneyW = li.pt(P.yConey), coneyE = footAt(c1, P.yConey, coneyW[0]);
  R.coney_island = [li.pt(P.yRedHook), c1.pt(P.yRedHook), coneyE, coneyW];
  R.richmond_hill = [c1.pt(P.yRow), c2.pt(P.yRow), c2.pt(P.yFlushing), c2.pt(P.yRichmond), c1.pt(P.yRichmond)];
  R.brownsville = [c1.pt(P.yRichmond), c2.pt(P.yRichmond), c2.pt(P.yJamaica), bay.pt(P.yBrownsville), c1.pt(P.yBrownsville), c1.pt(P.yWilliamsburg)];
  const canW = [c1.at(P.yCanarsie), P.yCanarsie], canE = footAt(bay, P.yCanarsie, canW[0]);
  R.canarsie = [c1.pt(P.yBrownsville), bay.pt(P.yBrownsville), canE, canW, c1.pt(P.yRedHook)];
  R.flushing = [c2.pt(P.yFlushingTop), [W, P.yFlushingTop], [W, P.yFlushing], c2.pt(P.yFlushing), c2.pt(P.yRow)];
  R.jamaica = [c2.pt(P.yFlushing), [W, P.yFlushing], [W, P.yJamaica], c2.pt(P.yJamaica), c2.pt(P.yRichmond)];

  // Staten Island: Tottenville west, Stapleton east on the Narrows
  const S = P.si, siE = lean(S.east, S.top, S.k), siJ = lean(S.join, S.top, S.kJoin);
  R.tottenville = [[0, S.top], siJ.pt(S.top), siJ.pt(W), [0, W]];
  R.stapleton = [siJ.pt(S.top), siE.pt(S.top), siE.pt(W), siJ.pt(W)];

  // Bridges, square to their rivers
  const cross = (y) => { const a = east.pt(y), n = 1 / across(P.kRiver); return [a, [a[0] + P.river * n, a[1] + P.river * P.kRiver * n]]; };
  const bridges = {
    'Hell Gate Bridge': [[P.hellGate, P.yBronx], [P.hellGate, ySound]],
    'Queensboro Bridge': cross(P.queensboro),
    'Williamsburg Bridge': cross(P.williamsburg),
    'Brooklyn Bridge': cross(P.brooklyn),
  };
  // Labels: [x, y, rotation]. A river's names run up it, at its lean.
  const deg = k => -Math.atan2(1, k) * 180 / Math.PI, onRiver = (l, w, y) => [l.at(y) + w / 2, y];
  const hudsonAt = y => [...onRiver(hud, -P.hudson * across(P.kHudson), y), deg(P.kHudson)];
  const riverAt = y => [...onRiver(east, P.river * across(P.kRiver), y), deg(P.kRiver)];
  const up = (b, d) => { const m = [(b[0][0] + b[1][0]) / 2, (b[0][1] + b[1][1]) / 2], t = deg(P.kRiver) * Math.PI / 180; return [m[0] + Math.cos(t) * d, m[1] + Math.sin(t) * d, deg(P.kRiver)]; };
  const pool = (sound.at(200) + W - 13) / 2; // the middle of the Sound's pool
  const labels = {
    boro: {
      MN: hudsonAt(455), BX: [pool, 222, 0], QN: [pool, 372, 0],
      BK: [(coneyE[0] + canE[0]) / 2 + 20, 1043, 0], SI: [S.east / 2 + 6, S.top - 26, 0],
    },
    water: [
      ['HUDSON RIVER', ...hudsonAt(215)], ['EAST RIVER', ...riverAt(640)], ['UPPER BAY', 250, 742, 0],
      ['LONG ISLAND SOUND', pool, 296, 0], ['JAMAICA BAY', (bay.at(900) + W - 13) / 2, 905, 0],
    ],
    bridges: {
      'Hell Gate Bridge': [P.hellGate + 40, (P.yBronx + ySound) / 2, 0],
      'Queensboro Bridge': up(bridges['Queensboro Bridge'], 40),
      'Williamsburg Bridge': up(bridges['Williamsburg Bridge'], 40),
      'Brooklyn Bridge': up(bridges['Brooklyn Bridge'], 40),
    },
    rumRow: [(siE.at(1040) + li.at(1040)) / 2, W - 13 - 18],
  };
  // The panels: Tomorrow in New Jersey under the Heat corner, the key and the title on the Sound
  const keyX = W - 13 - 12 - 176;
  const panels = { at: { tomorrow: [20, hy + 12], key: [keyX, 30], title: [keyX + 88, 142] } };
  return { regions: R, bridges, labels, panels };
}

// ---------------------------------------------------------------- borders from the outlines
// Every ring gains the corners of its neighbours that fall on its sides, so two Districts that
// share a stretch of line share its points; then each stretch is a border (two Districts), a
// shore (one, off the board's edge) or the frame (one, on the edge or on the Heat corner), and
// runs of a kind join into chains from junction to junction, as the board's geometry has them.
// (The method is tools/draft_board_squared.js's, with slanted sides allowed for.)
const onSeg = (q, a, b) => {
  const L = dist(a, b), t = ((q[0] - a[0]) * (b[0] - a[0]) + (q[1] - a[1]) * (b[1] - a[1])) / (L * L);
  return Math.abs((b[0] - a[0]) * (q[1] - a[1]) - (b[1] - a[1]) * (q[0] - a[0])) / L < 1e-4 && t * L > 1e-4 && (1 - t) * L > 1e-4;
};
function knit(regions) {
  const all = Object.values(regions).flat();
  const out = {};
  for (const [id, ring] of Object.entries(regions)) {
    const r = [];
    ring.forEach((a, i) => {
      const b = ring[(i + 1) % ring.length];
      const mids = all.filter(q => onSeg(q, a, b)).sort((p, q) => dist(p, a) - dist(q, a)).filter((q, k, s) => !k || dist(q, s[k - 1]) > 1e-4);
      r.push(a, ...mids);
    });
    out[id] = r;
  }
  return out;
}
// the frame: the board's edge, and the two sides of the Heat corner, which the frame steps round
const onFrame = (a, b) => (a[0] === b[0] && (a[0] === 0 || a[0] === W)) || (a[1] === b[1] && (a[1] === 0 || a[1] === W))
  || (a[1] === HEAT[1] && b[1] === HEAT[1] && Math.max(a[0], b[0]) <= HEAT[0]) || (a[0] === HEAT[0] && b[0] === HEAT[0] && Math.max(a[1], b[1]) <= HEAT[1]);
function chainsOf(regions) {
  const segs = new Map(); // undirected stretch -> the regions on it
  for (const [id, ring] of Object.entries(regions)) ring.forEach((a, i) => {
    const b = ring[(i + 1) % ring.length], k = [key(a), key(b)].sort().join('>');
    if (!segs.has(k)) segs.set(k, { a, b, ids: [] });
    segs.get(k).ids.push(id);
  });
  const kinds = new Map(); // "a|b" -> its stretches
  for (const s of segs.values()) {
    if (s.ids.length > 2) throw new Error(`Three regions share a line at ${key(s.a)}: ${s.ids}`);
    if (s.ids.length === 1 && onFrame(s.a, s.b)) continue;
    const sides = s.ids.length === 2 ? s.ids : s.ids[0] === 'nj' ? ['nj', 'water'] : ['water', s.ids[0]];
    const k = sides.join('|');
    if (!kinds.has(k)) kinds.set(k, []);
    kinds.get(k).push(s);
  }
  // a point is a junction unless exactly two stretches meet there and they are of one kind
  const at = new Map();
  for (const [k, list] of kinds) for (const s of list) for (const p of [s.a, s.b]) {
    if (!at.has(key(p))) at.set(key(p), []);
    at.get(key(p)).push(k);
  }
  const junction = p => { const v = at.get(key(p)); return v.length !== 2 || v[0] !== v[1]; };
  const chains = [];
  for (const [k, list] of kinds) {
    const left = new Set(list);
    const next = (p, not) => [...left].find(s => s !== not && (key(s.a) === key(p) || key(s.b) === key(p)));
    while (left.size) {
      let s = [...left].find(q => junction(q.a) || junction(q.b)) || [...left][0];
      let p = junction(s.a) ? s.a : junction(s.b) ? s.b : s.a;
      const pts = [p];
      while (s) {
        left.delete(s);
        p = key(s.a) === key(p) ? s.b : s.a;
        pts.push(p);
        s = junction(p) ? null : next(p, s);
      }
      chains.push({ sides: k.split('|'), pts });
    }
  }
  return chains;
}

// ---------------------------------------------------------------- checks
const area = p => Math.abs(p.reduce((s, a, i) => { const b = p[(i + 1) % p.length]; return s + a[0] * b[1] - b[0] * a[1]; }, 0)) / 2;
const length = p => p.slice(1).reduce((s, q, i) => s + dist(p[i], q), 0);
const pair = (a, b) => [a, b].sort().join('|');
function segDist(q, a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = dx * dx + dy * dy;
  const t = L ? Math.max(0, Math.min(1, ((q[0] - a[0]) * dx + (q[1] - a[1]) * dy) / L)) : 0;
  return Math.hypot(q[0] - a[0] - t * dx, q[1] - a[1] - t * dy);
}
// the sharpest corner of an outline, in degrees (its plain outline, before neighbours' points are knitted in)
function sharpest(ring) {
  let least = 180;
  ring.forEach((v, i) => {
    const a = ring[(i - 1 + ring.length) % ring.length], b = ring[(i + 1) % ring.length];
    const u = [a[0] - v[0], a[1] - v[1]], w = [b[0] - v[0], b[1] - v[1]];
    const t = Math.acos(Math.max(-1, Math.min(1, (u[0] * w[0] + u[1] * w[1]) / Math.hypot(...u) / Math.hypot(...w)))) * 180 / Math.PI;
    if (t < least) least = t;
  });
  return least;
}
function check(map, pinned, plain) {
  const problems = [], notes = [];
  const land = c => !c.sides.includes('water') && !c.sides.includes('nj');
  const want = new Set(pinned.chains.filter(land).map(c => pair(...c.sides)));
  const got = new Map();
  for (const c of map.chains.filter(land)) got.set(pair(...c.sides), (got.get(pair(...c.sides)) || 0) + length(c.pts));
  for (const k of want) if (!got.has(k)) problems.push(`missing the connection ${k}`);
  for (const [k, L] of got) {
    if (!want.has(k)) problems.push(`a connection the board does not have: ${k}`);
    else if (L < MIN_BORDER) problems.push(`${k} is only ${L.toFixed(0)} long`);
  }
  const short = [...got].filter(([k]) => want.has(k)).sort((a, b) => a[1] - b[1]).slice(0, 4);
  notes.push(`${got.size} land borders; the shortest: ${short.map(([k, L]) => `${k} ${L.toFixed(0)}`).join(', ')}`);
  for (const b of pinned.bridges) {
    const mine = map.bridges.find(q => q.name === b.name);
    if (!mine || pair(...mine.join) !== pair(...b.join)) problems.push(`${b.name} does not join ${b.join}`);
  }
  // each bridge lands on its two Districts' shores, clear of their ends
  for (const b of map.bridges) [[b.a, b.join[0]], [b.b, b.join[1]]].forEach(([end, id]) => {
    const shore = map.chains.filter(c => c.sides.includes(id) && c.sides.includes('water'));
    const hit = shore.find(c => c.pts.slice(1).some((q, i) => segDist(end, c.pts[i], q) < 0.15));
    if (!hit) return problems.push(`${b.name} does not land on ${id}'s shore`);
    const clear = Math.min(dist(end, hit.pts[0]), dist(end, hit.pts[hit.pts.length - 1]));
    if (clear < BRIDGE_CLEAR) problems.push(`${b.name} lands ${clear.toFixed(0)} from the end of ${id}'s shore`);
  });
  const wet = new Set(map.chains.filter(c => c.sides.includes('water')).map(c => c.sides.find(s => s !== 'water')));
  for (const d of DOCKS) if (!wet.has(d)) problems.push(`${d} is a Dock with no water`);
  const ids = Object.keys(map.regions).filter(k => k !== 'nj');
  notes.push(`inland: ${ids.filter(k => !wet.has(k)).join(', ') || 'none'}`);
  // the narrowest water between shores that share no point
  const coast = map.chains.filter(c => c.sides.includes('water'));
  let narrow = Infinity, where = '';
  for (let x = 0; x < coast.length; x++) for (let y = x + 1; y < coast.length; y++) {
    const a = coast[x], b = coast[y], la = a.sides.find(s => s !== 'water'), lb = b.sides.find(s => s !== 'water');
    if (la === lb || a.pts.some(p => b.pts.some(q => key(p) === key(q)))) continue;
    for (const [u, v] of [[a, b], [b, a]]) for (const q of u.pts) for (let k = 0; k < v.pts.length - 1; k++) {
      const d = segDist(q, v.pts[k], v.pts[k + 1]);
      if (d < narrow) { narrow = d; where = `${la} / ${lb}`; }
    }
  }
  if (narrow < MIN_WATER - 0.5) problems.push(`water only ${narrow.toFixed(0)} wide between ${where}`);
  notes.push(`narrowest water ${narrow.toFixed(0)} (${where})`);
  // corners
  const corners = ids.map(k => [k, sharpest(plain[k])]).sort((a, b) => a[1] - b[1]);
  for (const [k, t] of corners) if (t < MIN_CORNER) problems.push(`${k} has a corner of ${t.toFixed(0)} degrees`);
  notes.push(`sharpest corners: ${corners.slice(0, 4).map(([k, t]) => `${k} ${t.toFixed(1)}`).join(', ')}`);
  // sizes, as the eye sees them: inside the frame, in cm² at 24in
  const cm = 609.6 / 1080, F = 13, clip = p => p.map(([x, y]) => [Math.min(Math.max(x, F), W - F), Math.min(Math.max(y, F), W - F)]);
  const size = Object.fromEntries(ids.map(k => [k, area(clip(map.regions[k])) * cm * cm / 100]));
  const v = Object.values(size), mean = v.reduce((s, a) => s + a, 0) / v.length;
  notes.push(`sizes (cm²): ${ids.map(k => `${k} ${size[k].toFixed(0)}`).join(', ')}`);
  notes.push(`mean ${mean.toFixed(0)}, smallest ${Math.min(...v).toFixed(0)}, largest ${Math.max(...v).toFixed(0)}, spread ${Math.sqrt(v.reduce((s, a) => s + (a - mean) ** 2, 0) / v.length).toFixed(1)}`);
  return { problems, notes, size };
}

// ---------------------------------------------------------------- write
function build(P) {
  const pinned = JSON.parse(fs.readFileSync(PINNED, 'utf8'));
  const d = draft(P), round = p => p.map(q => q.map(r1));
  // knitted before rounding, so a point on a slanted side is found on it; rounded after, so both
  // Districts on a border carry the same rounded points
  const regions = Object.fromEntries(Object.entries(knit(d.regions)).map(([k, p]) => [k, round(p)]));
  const chains = chainsOf(regions);
  const bridges = pinned.bridges.map(b => { const [a, bb] = d.bridges[b.name].map(q => q.map(r1)); return { join: b.join, a, b: bb, name: b.name, opened: b.opened }; });
  const tidy = v => (Array.isArray(v) ? v.map(tidy) : typeof v === 'number' ? r1(v) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, q]) => [k, tidy(q)])) : v);
  const map = { regions, chains, bridges, labels: tidy(d.labels), panels: tidy(d.panels) };
  return { map, ...check(map, pinned, d.regions) };
}
const NOTE = 'Written by tools/draft_board_lean.js: the Lean board, a third design for the map (2026-11-21). The board\'s Districts, connections and bridges, drawn as level courses with leaning avenues. tools/build_board.js --variant=lean draws it.';
if (require.main === module) {
  const { map, problems, notes } = build(PLAN);
  console.log(notes.join('\n'));
  if (problems.length) { console.error('Not written:\n  ' + problems.join('\n  ')); if (!process.argv.includes('--force')) process.exit(1); }
  const j = v => JSON.stringify(v);
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, `{"note":${j(NOTE)},"size":${j([W, W])},"regions":{\n`
    + Object.entries(map.regions).map(([id, r]) => `${j(id)}:${j(r)}`).join(',\n')
    + '},\n"chains":[\n' + map.chains.map(j).join(',\n') + '],\n"bridges":' + j(map.bridges) + ',\n"labels":' + j(map.labels) + ',\n"panels":' + j(map.panels) + '}\n');
  console.log('wrote', path.relative(ROOT, OUT));
}
module.exports = { PLAN, build };
