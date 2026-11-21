#!/usr/bin/env node
// The Angled board: a third design for the map, between the board and the Squared one (Nick,
// 2026-11-21, on the Squared board: good that it has no dead corner space, but "a bit too
// Minecraft"; "something between, with some angles", more "authentically gangster map").
//
//   node tools/draft_board_angled.js      then   node tools/build_board.js --variant=angled
//
// It keeps the Squared board's plan (tools/draft_board_squared.js): level rows, upright borders
// inland, every sign hung from a level top. What changes is the water:
//
// - The East River is one straight channel on a slant (eastRiver, about 20 degrees off upright)
//   from the Hell Gate to the Upper Bay, with its three bridges square across it. Manhattan's
//   east shore and the shore of Queens and Brooklyn are its two banks, so Sugar Hill, Five Points,
//   Astoria, Williamsburg, Red Hook and Coney Island each have one slanted side.
// - Lower Manhattan tapers: the Hudson's shore below West Side leans the other way (taper), so the
//   island is narrow at the top, widest at the Tenderloin and comes to a blunt point at the Bowery.
// - The Sound opens to the east: Throggs Neck's shore rises towards the frame (sound).
// - Staten Island tapers to the south-west, and the harbour's corners take longer cuts.
//
// No slant leaves a corner under about 70 degrees, and none is on a District's top. It writes
// Art/Board/Angled/board-geometry.json in the shape tools/build_board.js reads, and checks itself
// against the board's connections exactly as the Squared drafting does.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PINNED = path.join(ROOT, 'Art', 'Board', 'board-geometry.json');
const OUT = path.join(ROOT, 'Art', 'Board', 'Angled', 'board-geometry.json');
const r1 = v => Math.round(v * 10) / 10;
const key = p => `${p[0]},${p[1]}`;
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

const W = 1080; // the board; Districts on the frame run under it to the edge, as on the board
const HUDSON = 44, RIVER = 49; // the Hudson's width; the East River's, the Hell Gate's and the Sound's
const HEAT = [413.9, 120.3]; // the Heat corner's outer corner, as build_board.js draws it (HEAT.edge)
const MIN_BORDER = 45; // a border runs at least this far (25 mm), so it reads as a connection
const BRIDGE_CLEAR = 20; // a bridge lands at least this far from the end of either bank
const DOCKS = ['west_side', 'bowery', 'belmont', 'throggs_neck', 'whitestone', 'jamaica', 'red_hook', 'canarsie', 'stapleton', 'tottenville'];

// The plan: every line a border or a shore sits on. x runs east, y south. A slant is given as
// its run west for each unit south.
const GRID = {
  // The slants: the East River; lower Manhattan's Hudson shore, which leans the other way; and the
  // rise of Throggs Neck's shore from Hunts Point's foot to the frame
  eastRiver: +(process.env.EAST_RIVER || 0.34), taper: 0.16, sound: 44,
  // New Jersey: the column under the Heat corner, its east shore beside West Side, and its foot
  nj: 274, njFoot: 560,
  // The Bronx: Belmont's foot; the row between Fordham and Morris Park above and Hunts Point and
  // Throggs Neck below; Hunts Point's shore on the Hell Gate; and the two uprights, laid like bricks
  belmontS: 215, bronxRow: 138, bronxS: 279, fordhamE: 856, huntsE: 810,
  // Queens' north-west corner, where the Hell Gate meets the East River: the river's east bank
  // runs from here, and Belmont's and Sugar Hill's east side stands where its west bank begins
  astoriaW: 651,
  // Manhattan: the foot of West Side and Sugar Hill; the Tenderloin's west shore at its top, its
  // border with Five Points and the foot of both; the Bowery's foot and the cut of its corners
  upperS: 420, midW: 212, midSplit: 395, midS: 612, boweryS: 746, boweryCut: 38,
  // Queens and Brooklyn: the rows' feet; Astoria | Whitestone; Williamsburg | Richmond Hill |
  // Flushing; Red Hook | Brownsville | Jamaica; Coney Island | Canarsie and Canarsie's bay shore
  rows: [469, 657, 828], south: 1000, astoriaE: 858, row2: [754, 918], row3: [698, 872], coney: [652, 826], coneyCut: 44,
  // Jamaica Bay: its east shore, the Rockaways' depth and west tip, and the cut of its corners
  bayE: 1030, rockaways: [20, 880], bayCut: 34,
  // Staten Island: west and east shores, top, Stapleton | Tottenville, foot; its corners' cut, and
  // the long cut of its south-east shore
  staten: { w: 44, e: 296, top: 794, mid: 915, foot: 1042, cut: 30, taper: 86 },
  // Sea corners: the square corners left on a shore are cut this far (see the Squared drafting)
  seaCut: +(process.env.SEA_CUT || 16),
};

// A corner of a ring cut back k along each of its sides (any angle).
function cut(ring, at, k) {
  const i = ring.findIndex(q => Math.abs(q[0] - at[0]) < 0.01 && Math.abs(q[1] - at[1]) < 0.01);
  if (i < 0) throw new Error('No corner to cut at ' + at);
  const n = ring.length, v = ring[i], a = ring[(i - 1 + n) % n], b = ring[(i + 1) % n];
  const step = p => { const L = dist(p, v); return [v[0] + (p[0] - v[0]) * k / L, v[1] + (p[1] - v[1]) * k / L]; };
  ring.splice(i, 1, step(a), step(b));
  return ring;
}

function draft(G) {
  const [hx, hy] = HEAT, s = G.eastRiver, cosE = 1 / Math.hypot(1, s), cosT = 1 / Math.hypot(1, G.taper);
  const bw = hx + HUDSON; // Belmont's Hudson shore, a river's width off the Heat corner
  const ws = hy + HUDSON; // West Side's north shore: the Hudson turns west under the Heat corner
  const ww = G.nj + HUDSON; // West Side's west shore, upright
  const Q0 = G.bronxS + RIVER, [Q1, Q2, Q3] = G.rows; // Queens' top, a river below the Bronx, and the rows' feet
  // The East River's banks: Queens' and Brooklyn's from Astoria's corner, Manhattan's a river's width west
  const qb = y => G.astoriaW - s * (y - Q0), mb = y => qb(y) - RIVER / cosE;
  const be = mb(G.bronxS); // Belmont's and Sugar Hill's east side, upright down to the Hell Gate
  // Lower Manhattan's Hudson shore, leaning east as it goes south, and New Jersey's beside it
  const tw = y => G.midW + G.taper * (y - G.upperS), njw = y => tw(y) - HUDSON / cosT;
  const tnFoot = G.bronxS - G.sound; // Throggs Neck's shore at the frame
  const S = G.staten, [cc, ce] = G.coney, [rk, rkTip] = G.rockaways;
  const P = (x, y) => [x, y];
  const quad = (x0, y0, x1, y1) => [P(x0, y0), P(x1, y0), P(x1, y1), P(x0, y1)];
  const regions = {
    // The Bronx
    belmont: quad(bw, 0, be, G.belmontS),
    fordham: quad(be, 0, G.fordhamE, G.bronxRow),
    morris_park: quad(G.fordhamE, 0, W, G.bronxRow),
    hunts_point: quad(be, G.bronxRow, G.huntsE, G.bronxS),
    throggs_neck: [P(G.huntsE, G.bronxRow), P(W, G.bronxRow), P(W, tnFoot), P(G.huntsE, G.bronxS)],
    // Manhattan
    west_side: quad(ww, ws, bw, G.upperS),
    sugar_hill: [P(bw, G.belmontS), P(be, G.belmontS), P(be, G.bronxS), P(mb(G.upperS), G.upperS), P(bw, G.upperS)],
    tenderloin: [P(tw(G.upperS), G.upperS), P(G.midSplit, G.upperS), P(G.midSplit, G.midS), P(tw(G.midS), G.midS)],
    five_points: [P(G.midSplit, G.upperS), P(mb(G.upperS), G.upperS), P(mb(G.midS), G.midS), P(G.midSplit, G.midS)],
    bowery: [P(tw(G.midS), G.midS), P(mb(G.midS), G.midS), P(mb(G.boweryS), G.boweryS), P(tw(G.boweryS), G.boweryS)],
    // Queens
    astoria: [P(qb(Q0), Q0), P(G.astoriaE, Q0), P(G.astoriaE, Q1), P(qb(Q1), Q1)],
    whitestone: quad(G.astoriaE, Q0, W, Q1),
    richmond_hill: quad(G.row2[0], Q1, G.row2[1], Q2),
    flushing: quad(G.row2[1], Q1, W, Q2),
    // Jamaica: its block, and the Rockaways round the bay (a feature, not ground for pieces)
    jamaica: [P(G.row3[1], Q2), P(W, Q2), P(W, G.south), P(rkTip, G.south), P(rkTip, G.south - rk), P(G.bayE, G.south - rk), P(G.bayE, Q3), P(G.row3[1], Q3)],
    // Brooklyn
    williamsburg: [P(qb(Q1), Q1), P(G.row2[0], Q1), P(G.row2[0], Q2), P(qb(Q2), Q2)],
    red_hook: [P(qb(Q2), Q2), P(G.row3[0], Q2), P(G.row3[0], Q3), P(qb(Q3), Q3)],
    brownsville: quad(G.row3[0], Q2, G.row3[1], Q3),
    coney_island: [P(qb(Q3), Q3), P(cc, Q3), P(cc, G.south), P(qb(G.south), G.south)],
    canarsie: quad(cc, Q3, ce, G.south),
    // Staten Island
    stapleton: quad(S.w, S.top, S.e, S.mid),
    tottenville: quad(S.w, S.mid, S.e, S.foot),
    // New Jersey: the Heat corner, and the column under it, which steps west with the Hudson and
    // then follows lower Manhattan's shore
    nj: [P(0, 0), P(hx, 0), P(hx, hy), P(G.nj, hy), P(G.nj, G.upperS - HUDSON), P(njw(G.upperS - HUDSON), G.upperS - HUDSON), P(njw(G.njFoot), G.njFoot), P(0, G.njFoot)],
  };
  // The harbour's long cuts: the Bowery's foot, Staten Island, Coney Island's corner on the Narrows
  // and Jamaica Bay's two inner corners. The sea-corner pass leaves these alone.
  cut(regions.bowery, P(mb(G.boweryS), G.boweryS), G.boweryCut); cut(regions.bowery, P(tw(G.boweryS), G.boweryS), G.boweryCut);
  cut(regions.stapleton, P(S.w, S.top), S.cut); cut(regions.stapleton, P(S.e, S.top), S.cut);
  cut(regions.tottenville, P(S.e, S.foot), S.taper); cut(regions.tottenville, P(S.w, S.foot), S.cut);
  cut(regions.coney_island, P(qb(G.south), G.south), G.coneyCut);
  cut(regions.jamaica, P(G.bayE, Q3), G.bayCut); cut(regions.jamaica, P(G.bayE, G.south - rk), G.bayCut);
  // Bridges, each square across its river, midway along the stretch the two banks share.
  const across = y => [[mb(y), y], [mb(y) + RIVER * cosE, y + RIVER * s * cosE]]; // from Manhattan's bank, square to the slant
  const mid = (a0, a1, b0, b1) => (Math.max(a0, b0) + Math.min(a1, b1)) / 2, drop = RIVER * s * cosE;
  const yQ = mid(G.bronxS, G.upperS, Q0 - drop, Q1 - drop), yW = mid(G.upperS, G.midS, Q1 - drop, Q2 - drop), yB = mid(G.midS, G.boweryS - G.boweryCut, Q2 - drop, Q3 - drop);
  const xH = mid(be, G.huntsE, qb(Q0), G.astoriaE) - 20;
  const bridges = {
    'Hell Gate Bridge': [[xH, G.bronxS], [xH, Q0]],
    'Queensboro Bridge': across(yQ), 'Williamsburg Bridge': across(yW), 'Brooklyn Bridge': across(yB),
  };
  // Where the names in the water sit: [x, y, rotation]. A bridge's name runs along its river.
  const lean = -90 + Math.atan(s) * 180 / Math.PI, along = (y, d) => { const [a, b] = across(y); return [(a[0] + b[0]) / 2 - s * d * cosE, (a[1] + b[1]) / 2 + d * cosE, r1(lean)]; };
  const labels = {
    boro: {
      MN: [(tw(G.boweryS) + mb(G.boweryS)) / 2, G.boweryS + 20, 0], // under the Bowery's foot, in the Upper Bay
      BX: [(G.huntsE + W - 13) / 2 + 20, (G.bronxS - G.sound / 2 + Q0) / 2 - 2, 0], // in the Sound, where it opens
      SI: [(13 + S.w) / 2, (S.top + S.foot) / 2, -90], // upright off the island's west shore
      BK: [(qb(G.south) + G.coneyCut + ce) / 2, G.south + 18, 0],
      QN: [(rkTip + W - 13) / 2, G.south + 18, 0],
    },
    water: [
      ['HUDSON', (G.nj + hx) / 2, hy + HUDSON / 2, 0],
      ['EAST RIVER', ...along(yQ, 122).slice(0, 2), r1(lean)], // between the Queensboro's name and the Williamsburg Bridge
      ['UPPER BAY', (13 + tw(G.boweryS)) / 2 + 10, (G.njFoot + S.top) / 2, 0],
      ['JAMAICA BAY', (ce + G.bayE) / 2, (Q3 + G.south - rk) / 2, 0],
    ],
    bridges: {
      'Hell Gate Bridge': [xH + 50, G.bronxS + RIVER / 2, 0],
      'Queensboro Bridge': along(yQ, 44), 'Williamsburg Bridge': along(yW, 44), 'Brooklyn Bridge': along(yB, 44),
    },
    rumRow: [(S.e + qb(G.south) + G.coneyCut) / 2, W - 13 - 18], // low in the Narrows
  };
  return { regions, bridges, labels };
}

// ---------------------------------------------------------------- borders from the outlines
// Every ring gains the corners of its neighbours that fall on its sides, so two Districts that
// share a stretch of line share its points; then each stretch is a border (two Districts), a
// shore (one, off the board's edge) or the frame (one, on the edge), and runs of a kind join
// into chains from junction to junction, as the board's geometry has them.
const onSeg = (q, a, b) => Math.abs((b[0] - a[0]) * (q[1] - a[1]) - (b[1] - a[1]) * (q[0] - a[0])) < 1e-6
  && Math.min(a[0], b[0]) - 1e-6 <= q[0] && q[0] <= Math.max(a[0], b[0]) + 1e-6
  && Math.min(a[1], b[1]) - 1e-6 <= q[1] && q[1] <= Math.max(a[1], b[1]) + 1e-6 && dist(q, a) > 1e-6 && dist(q, b) > 1e-6;
function knit(regions) {
  const all = Object.values(regions).flat();
  const out = {};
  for (const [id, ring] of Object.entries(regions)) {
    const r = [];
    ring.forEach((a, i) => {
      const b = ring[(i + 1) % ring.length];
      const mids = all.filter(q => onSeg(q, a, b)).sort((p, q) => dist(p, a) - dist(q, a)).filter((q, k, s) => !k || dist(q, s[k - 1]) > 1e-6);
      r.push(a, ...mids);
    });
    out[id] = r;
  }
  return out;
}
const onEdge = (a, b) => (a[0] === b[0] && (a[0] === 0 || a[0] === W)) || (a[1] === b[1] && (a[1] === 0 || a[1] === W));
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
    if (s.ids.length === 1 && onEdge(s.a, s.b)) continue; // the frame
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
      // start at a junction where there is one (a shore round an island of one District has none)
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

// Sea corners. A corner of one region with shore on both its sides is cut at 45 degrees: an
// outward corner loses its tip, a pocket gains a fillet. Corners where two regions meet, the
// Heat corner's own, and sides too short to take the cut are left square.
function seaCorners(base, k, done = new Set()) {
  if (!k) return base;
  const knitted = knit(base), chains = chainsOf(knitted);
  const shore = new Set();
  for (const c of chains) if (c.sides.includes('water')) c.pts.slice(1).forEach((q, i) => shore.add([key(c.pts[i]), key(q)].sort().join('>')));
  const uses = new Map();
  for (const r of Object.values(knitted)) for (const p of r) uses.set(key(p), (uses.get(key(p)) || 0) + 1);
  const out = {};
  for (const [id, ring] of Object.entries(base)) {
    const n = ring.length, r = [];
    ring.forEach((v, i) => {
      const a = ring[(i - 1 + n) % n], b = ring[(i + 1) % n];
      // the ring's sides at v, as far as the next point on them once neighbours' corners are in
      const kr = knitted[id], ki = kr.findIndex(q => key(q) === key(v)), ka = kr[(ki - 1 + kr.length) % kr.length], kb = kr[(ki + 1) % kr.length];
      const turn = Math.abs(Math.atan2((a[0] - v[0]) * (b[1] - v[1]) - (a[1] - v[1]) * (b[0] - v[0]), (a[0] - v[0]) * (b[0] - v[0]) + (a[1] - v[1]) * (b[1] - v[1]))) * 180 / Math.PI;
      const square = turn > 55 && turn < 125 && !done.has(key(v)); // a corner near square, not one already cut
      const wet = shore.has([key(ka), key(v)].sort().join('>')) && shore.has([key(v), key(kb)].sort().join('>'));
      const room = Math.min(dist(a, v), dist(b, v)) >= 2.5 * k;
      if (!square || !wet || !room || uses.get(key(v)) > 1 || (Math.abs(v[0] - HEAT[0]) < 0.5 && Math.abs(v[1] - HEAT[1]) < 0.5)) return r.push(v);
      const step = (p) => { const L = dist(p, v); return [v[0] + (p[0] - v[0]) * k / L, v[1] + (p[1] - v[1]) * k / L]; };
      r.push(step(a), step(b));
    });
    out[id] = r;
  }
  return out;
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
function check(map, pinned) {
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
  for (const b of pinned.bridges) {
    const mine = map.bridges.find(q => q.name === b.name);
    if (!mine || pair(...mine.join) !== pair(...b.join)) problems.push(`${b.name} does not join ${b.join}`);
  }
  // each bridge lands on its two Districts' shores, clear of their ends
  for (const b of map.bridges) [[b.a, b.join[0]], [b.b, b.join[1]]].forEach(([end, id]) => {
    const shore = map.chains.filter(c => c.sides.includes(id) && c.sides.includes('water'));
    const hit = shore.find(c => c.pts.slice(1).some((q, i) => segDist(end, c.pts[i], q) < 0.2));
    if (!hit) return problems.push(`${b.name} does not land on ${id}'s shore`);
    const clear = Math.min(dist(end, hit.pts[0]), dist(end, hit.pts[hit.pts.length - 1]));
    if (clear < BRIDGE_CLEAR) problems.push(`${b.name} lands ${clear.toFixed(0)} from the end of ${id}'s shore`);
  });
  const wet = new Set(map.chains.filter(c => c.sides.includes('water')).map(c => c.sides.find(s => s !== 'water')));
  for (const d of DOCKS) if (!wet.has(d)) problems.push(`${d} is a Dock with no water`);
  const wetPinned = new Set(pinned.chains.filter(c => c.sides.includes('water')).map(c => c.sides.find(s => s !== 'water')));
  const ids = Object.keys(map.regions).filter(k => k !== 'nj');
  const changed = ids.filter(k => wet.has(k) !== wetPinned.has(k));
  notes.push(`inland: ${ids.filter(k => !wet.has(k)).join(', ') || 'none'}` + (changed.length ? ` (the board differs on ${changed.join(', ')}; no rule turns on it)` : ''));
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
  if (narrow < HUDSON - 0.5) problems.push(`water only ${narrow.toFixed(0)} wide between ${where}`);
  notes.push(`narrowest water ${narrow.toFixed(0)} (${where})`);
  // sizes, as the eye sees them: inside the frame, in cm² at 24in
  const cm = 609.6 / 1080, F = 13, clip = p => p.map(([x, y]) => [Math.min(Math.max(x, F), W - F), Math.min(Math.max(y, F), W - F)]);
  const size = Object.fromEntries(ids.map(k => [k, area(clip(map.regions[k])) * cm * cm / 100]));
  const v = Object.values(size), mean = v.reduce((s, a) => s + a, 0) / v.length;
  notes.push(`sizes (cm²): ${ids.map(k => `${k} ${size[k].toFixed(0)}`).join(', ')}`);
  notes.push(`mean ${mean.toFixed(0)}, smallest ${Math.min(...v).toFixed(0)}, largest ${Math.max(...v).toFixed(0)}, spread ${Math.sqrt(v.reduce((s, a) => s + (a - mean) ** 2, 0) / v.length).toFixed(1)}`);
  return { problems, notes, size };
}

// ---------------------------------------------------------------- write
function build(G) {
  const pinned = JSON.parse(fs.readFileSync(PINNED, 'utf8'));
  const d = draft(G), round = p => p.map(q => q.map(r1));
  const base = Object.fromEntries(Object.entries(d.regions).map(([k, p]) => [k, round(p)]));
  // the harbour's long cuts stand; of the corners left, only those still square are cut
  const longCuts = new Set();
  for (const [k, p] of Object.entries(base)) p.forEach((v, i) => {
    const a = p[(i - 1 + p.length) % p.length], b = p[(i + 1) % p.length];
    const turn = Math.abs(Math.atan2((a[0] - v[0]) * (b[1] - v[1]) - (a[1] - v[1]) * (b[0] - v[0]), (a[0] - v[0]) * (b[0] - v[0]) + (a[1] - v[1]) * (b[1] - v[1]))) * 180 / Math.PI;
    if (turn > 125) longCuts.add(key(v));
  });
  const regions = knit(Object.fromEntries(Object.entries(seaCorners(base, G.seaCut, longCuts)).map(([k, p]) => [k, round(p)])));
  const chains = chainsOf(regions);
  const bridges = pinned.bridges.map(b => { const [a, bb] = d.bridges[b.name].map(q => q.map(r1)); return { join: b.join, a, b: bb, name: b.name, opened: b.opened }; });
  const fix = v => Array.isArray(v) ? v.map(fix) : typeof v === 'number' ? r1(v) : v;
  const map = { regions, chains, bridges, labels: fix(d.labels), panels: { stacked: true } };
  return { map, ...check(map, pinned) };
}
const NOTE = 'Written by tools/draft_board_angled.js: the Angled board, a third design for the map (2026-11-21). The Squared board\'s plan with a slanted East River, a tapering lower Manhattan and longer harbour cuts. tools/build_board.js --variant=angled draws it.';
if (require.main === module) {
  const { map, problems, notes } = build(GRID);
  console.log(notes.join('\n'));
  if (problems.length) { console.error('Not written:\n  ' + problems.join('\n  ')); process.exit(1); }
  const j = v => JSON.stringify(v);
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, `{"note":${j(NOTE)},"size":${j([W, W])},"regions":{\n`
    + Object.entries(map.regions).map(([id, r]) => `${j(id)}:${j(r)}`).join(',\n')
    + '},\n"chains":[\n' + map.chains.map(j).join(',\n') + '],\n"bridges":' + j(map.bridges) + ',\n"labels":' + j(map.labels) + ',\n"panels":' + j(map.panels) + '}\n');
  console.log('wrote', path.relative(ROOT, OUT));
}
module.exports = { GRID, build };
