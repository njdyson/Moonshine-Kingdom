#!/usr/bin/env node
// The Squared board: a second design for the map, drawn fresh beside the board (Nick,
// 2026-11-21: put a pin in the board, keep the map the same, and start again on the geometry,
// "more squared and abstract, yet recognisable NYC ... like the London tube map").
//
//   node tools/draft_board_squared.js      then   node tools/build_board.js --variant=squared
//
// It writes Art/Board/Squared/board-geometry.json in the shape tools/build_board.js reads
// (regions, chains, bridges, labels), so the look is the board's own: only the map differs.
// Nothing here reads the traced map. The plan:
//
// - Every District is a rectangle on shared grid lines (GRID). The only slants are small
//   45-degree cuts on a few sea corners: the Bowery's foot, Staten Island and Coney Island.
// - Manhattan stands upright and steps west as it goes south, like a setback tower: West Side
//   and Sugar Hill, then the Tenderloin and Five Points, then the Bowery. The Hudson and the
//   East River are even channels that turn in square steps beside it.
// - Every sign has a level top to hang from, so none hangs low.
// - New Jersey is the Heat corner and a column under it for the key, the Tomorrow panel and the
//   title, stacked ("panels": { "stacked": true }).
//
// The map is the board's: the script reads Art/Board/board-geometry.json for the connections
// (every land border and bridge) and stops if this drawing differs from them, or if a Dock has
// no water, a border runs under MIN_BORDER, or a channel closes up.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PINNED = path.join(ROOT, 'Art', 'Board', 'board-geometry.json');
const OUT = path.join(ROOT, 'Art', 'Board', 'Squared', 'board-geometry.json');
const r1 = v => Math.round(v * 10) / 10;
const key = p => `${p[0]},${p[1]}`;
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

const W = 1080; // the board; Districts on the frame run under it to the edge, as on the board
const HUDSON = 44, RIVER = 49; // the Hudson's width; the East River's, the Hell Gate's and the Sound's
const HEAT = [413.9, 120.3]; // the Heat corner's outer corner, as build_board.js draws it (HEAT.edge)
const MIN_BORDER = 45; // a border runs at least this far (25 mm), so it reads as a connection
const BRIDGE_CLEAR = 20; // a bridge lands at least this far from the end of either bank
const DOCKS = ['west_side', 'bowery', 'belmont', 'throggs_neck', 'whitestone', 'jamaica', 'red_hook', 'canarsie', 'stapleton', 'tottenville'];

// The grid: every line a border or a shore sits on. x runs east, y south.
const GRID = {
  // New Jersey: the column under the Heat corner, its east shore above and below the Hudson's second step, and its foot
  nj: [274, 168], njFoot: 560,
  // The Bronx: Belmont's east side and foot; the row between Fordham and Morris Park above and
  // Hunts Point and Throggs Neck below; Hunts Point's shore on the Hell Gate and Throggs Neck's on
  // the Sound, which is wider; and the two uprights, laid like bricks
  belmontE: 610, belmontS: 215, bronxRow: 138, bronxS: 279, throggsS: 255, fordhamE: 850, huntsE: 804,
  // Manhattan: the foot of West Side and Sugar Hill; the Tenderloin's west shore, its border with
  // Five Points, Five Points' east shore and the foot of both; the Bowery's shores and foot
  upperS: 420, midW: 212, midSplit: 387, midE: 540, midS: 608, bowery: [240, 480], boweryS: 734, boweryCut: 30,
  // Queens: Astoria | Whitestone; Williamsburg | Richmond Hill | Flushing
  astoriaE: 862, row2: [751, 915],
  // Brooklyn: Red Hook | Brownsville | Jamaica, and their foot; Coney Island's west shore, Coney
  // Island | Canarsie and Canarsie's bay shore; the south shore
  row3: [700, 868], row3S: 828, coney: [470, 645, 820], south: 1000, coneyCut: 37,
  // Jamaica Bay: its east shore, and the Rockaways' depth and west tip
  bayE: 1030, rockaways: [20, 880],
  // Staten Island: west and east shores, top, Stapleton | Tottenville, foot, and its corners' cut
  staten: { w: 44, e: 280, top: 782, mid: 911, foot: 1040, cut: 30 },
  // Sea corners: every square corner of a shore is cut (or, in a pocket, filled) this far at 45
  // degrees, so the rivers turn on mitres, as a line does on the Underground map. 0: square.
  seaCut: +(process.env.SEA_CUT || 16),
};

// A rectangle, clockwise from its north-west corner, with any of its corners cut at 45 degrees.
function rect(x0, y0, x1, y1, cut = {}) {
  const { nw = 0, ne = 0, se = 0, sw = 0 } = cut, p = [];
  if (nw) p.push([x0, y0 + nw], [x0 + nw, y0]); else p.push([x0, y0]);
  if (ne) p.push([x1 - ne, y0], [x1, y0 + ne]); else p.push([x1, y0]);
  if (se) p.push([x1, y1 - se], [x1 - se, y1]); else p.push([x1, y1]);
  if (sw) p.push([x0 + sw, y1], [x0, y1 - sw]); else p.push([x0, y1]);
  return p;
}

function draft(G) {
  const [hx, hy] = HEAT;
  const bw = hx + HUDSON; // Belmont's Hudson shore, a river's width off the Heat corner
  const ws = hy + HUDSON; // West Side's north shore: the Hudson turns west under the Heat corner
  const ww = G.nj[0] + HUDSON; // West Side's west shore
  const Q0 = G.bronxS + RIVER, Q1 = G.upperS + RIVER, Q2 = G.midS + RIVER; // Queens' and Brooklyn's rows, a river below Manhattan's
  const S = G.staten, [b0, b1] = G.bowery, [c0, cc, ce] = G.coney, [rk, rkTip] = G.rockaways;
  const regions = {
    // The Bronx
    belmont: rect(bw, 0, G.belmontE, G.belmontS),
    fordham: rect(G.belmontE, 0, G.fordhamE, G.bronxRow),
    morris_park: rect(G.fordhamE, 0, W, G.bronxRow),
    hunts_point: rect(G.belmontE, G.bronxRow, G.huntsE, G.bronxS),
    throggs_neck: rect(G.huntsE, G.bronxRow, W, G.throggsS),
    // Manhattan
    west_side: rect(ww, ws, bw, G.upperS),
    sugar_hill: rect(bw, G.belmontS, G.belmontE, G.upperS),
    tenderloin: rect(G.midW, G.upperS, G.midSplit, G.midS),
    five_points: rect(G.midSplit, G.upperS, G.midE, G.midS),
    bowery: rect(b0, G.midS, b1, G.boweryS, { sw: G.boweryCut, se: G.boweryCut }),
    // Queens
    astoria: rect(G.belmontE + RIVER, Q0, G.astoriaE, Q1),
    whitestone: rect(G.astoriaE, Q0, W, Q1),
    richmond_hill: rect(G.row2[0], Q1, G.row2[1], Q2),
    flushing: rect(G.row2[1], Q1, W, Q2),
    // Jamaica: its block, and the Rockaways round the bay (a feature, not ground for pieces)
    jamaica: [[G.row3[1], Q2], [W, Q2], [W, G.south], [rkTip, G.south], [rkTip, G.south - rk], [G.bayE, G.south - rk], [G.bayE, G.row3S], [G.row3[1], G.row3S]],
    // Brooklyn
    williamsburg: rect(G.midE + RIVER, Q1, G.row2[0], Q2),
    red_hook: rect(b1 + RIVER, Q2, G.row3[0], G.row3S),
    brownsville: rect(G.row3[0], Q2, G.row3[1], G.row3S),
    coney_island: rect(c0, G.row3S, cc, G.south, { sw: G.coneyCut }),
    canarsie: rect(cc, G.row3S, ce, G.south),
    // Staten Island
    stapleton: rect(S.w, S.top, S.e, S.mid, { nw: S.cut, ne: S.cut }),
    tottenville: rect(S.w, S.mid, S.e, S.foot, { sw: S.cut, se: S.cut }),
    // New Jersey: the Heat corner, and the column under it, which steps west with the Hudson
    nj: [[0, 0], [hx, 0], [hx, hy], [G.nj[0], hy], [G.nj[0], G.upperS - HUDSON], [G.nj[1], G.upperS - HUDSON], [G.nj[1], G.njFoot], [0, G.njFoot]],
  };
  if (Math.abs(G.midW - HUDSON - G.nj[1]) > 0.5) throw new Error('New Jersey\'s lower shore must stand a Hudson\'s width off the Tenderloin');
  // Bridges, each square across its river, midway along the stretch the two banks share.
  const mid = (a0, a1, b0_, b1_) => (Math.max(a0, b0_) + Math.min(a1, b1_)) / 2;
  const yQ = mid(G.bronxS, G.upperS, Q0, Q1), yW = mid(G.upperS, G.midS, Q1, Q2), yB = mid(G.midS, G.boweryS - G.boweryCut, Q2, G.row3S);
  const xH = mid(G.belmontE, G.huntsE, G.belmontE + RIVER, G.astoriaE) - 30; // west of the middle, so THE BRONX has the Sound east of it
  const bridges = {
    'Hell Gate Bridge': [[xH, G.bronxS], [xH, Q0]],
    'Queensboro Bridge': [[G.belmontE, yQ], [G.belmontE + RIVER, yQ]],
    'Williamsburg Bridge': [[G.midE, yW], [G.midE + RIVER, yW]],
    'Brooklyn Bridge': [[b1, yB], [b1 + RIVER, yB]],
  };
  // Where the names in the water sit: [x, y, rotation]. A Borough's name stands off its own shore;
  // a bridge's name runs along its river (the build sets its distance from the bridge).
  const labels = {
    boro: {
      MN: [(b0 + b1) / 2, G.boweryS + 20, 0], // under the Bowery's foot, in the Upper Bay
      BX: [(G.huntsE + W - 13) / 2 - 10, (G.throggsS + Q0) / 2, 0], // in the Sound, under Throggs Neck
      SI: [(13 + S.w) / 2, (S.top + S.foot) / 2, -90], // upright off the island's west shore
      BK: [(c0 + G.coneyCut + ce) / 2, G.south + 18, 0],
      QN: [(rkTip + W - 13) / 2, G.south + 18, 0],
    },
    water: [
      ['HUDSON', (G.nj[0] + hx) / 2, hy + HUDSON / 2, 0],
      ['UPPER BAY', (13 + b0) / 2, (G.njFoot + S.top) / 2, 0],
      ['EAST RIVER', (G.midE + G.belmontE + RIVER) / 2, G.upperS + RIVER / 2, 0],
      ['JAMAICA BAY', (ce + G.bayE) / 2, (G.row3S + G.south - rk) / 2, 0],
    ],
    bridges: {
      'Hell Gate Bridge': [xH + 50, G.bronxS + RIVER / 2, 0],
      'Queensboro Bridge': [G.belmontE + RIVER / 2, yQ + 44, -90],
      'Williamsburg Bridge': [G.midE + RIVER / 2, yW + 44, -90],
      'Brooklyn Bridge': [b1 + RIVER / 2, yB + 44, -90],
    },
    rumRow: [(S.e + c0) / 2, W - 13 - 18], // low in the Narrows
  };
  return { regions, bridges, labels };
}

// ---------------------------------------------------------------- borders from the rectangles
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
function seaCorners(base, k) {
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
      const square = Math.abs((a[0] - v[0]) * (b[0] - v[0]) + (a[1] - v[1]) * (b[1] - v[1])) < 1e-6;
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
    const hit = shore.find(c => c.pts.slice(1).some((q, i) => segDist(end, c.pts[i], q) < 0.01));
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
  const regions = knit(Object.fromEntries(Object.entries(seaCorners(d.regions, G.seaCut)).map(([k, p]) => [k, round(p)])));
  const chains = chainsOf(regions);
  const bridges = pinned.bridges.map(b => { const [a, bb] = d.bridges[b.name].map(q => q.map(r1)); return { join: b.join, a, b: bb, name: b.name, opened: b.opened }; });
  const map = { regions, chains, bridges, labels: d.labels, panels: { stacked: true } };
  return { map, ...check(map, pinned) };
}
const NOTE = 'Written by tools/draft_board_squared.js: the Squared board, a second design for the map (2026-11-21). The board\'s Districts, connections and bridges, drawn as rectangles on a grid. tools/build_board.js --variant=squared draws it.';
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
