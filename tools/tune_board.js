#!/usr/bin/env node
// Tunes the drafting's SETTINGS (tools/draft_board.js) for the board's balance, by
// coordinate descent: each setting in KNOBS is nudged up and down, 8 units then 4, 2
// and 1, and a nudge is kept when the score improves.
//
//   node tools/build_board.js --report=/tmp/signs.json    the signs' shapes and sizes
//   node tools/tune_board.js /tmp/signs.json [--from=start.json] [--save=best.json]
//
// It prints the best settings it finds as JSON (and saves them as it goes, with
// --save); copy them into SETTINGS by hand, run the drafting and the build, and look.
// It only ever moves one setting at a time, so moves that need two settings together
// (and anything to do with looks) are still yours. A run takes ten to twenty minutes.
//
// The score, higher is better:
//   the smallest room + 0.6 x the smallest crown room + 0.4 x the mean of the eight smallest
//   - each crown room's shortfall under 55 cm²
//   - 0.4 x the spread of room sizes (their standard deviation; SPREAD=... in the
//     environment to weigh it differently)
//   - 0.25 x the signs' penalty: each hanger past 18 units, and half each sign's shape
//     cost (a stacked name 25, the Still's plate hung underneath 60)
// Room is close to the build's count, on a coarser grid: ground 6 units in from every
// border, less the sign's box and its margin.
// A setting is refused outright if the drafting's checks fail, a corner goes under 80
// degrees, a land border runs under 32 units, a sign no longer fits, the Kill van Kull
// narrows under 22, or Flushing's bottom drops below Corona's.
//
// The sign is measured here as build_board.js draws it (its plate, its hangers, the
// keyline margins); if the sign's design changes there, change it here too.

const fs = require('fs');
const { SETTINGS, build, check, tightCorners } = require('./draft_board.js');

const arg = k => (process.argv.find(a => a.startsWith(`--${k}=`)) || '').slice(k.length + 3);
const reportFile = process.argv[2];
if (!reportFile || reportFile.startsWith('--')) {
  console.error('Usage: node tools/tune_board.js <signs report from build_board.js --report=...> [--from=settings.json] [--save=best.json]');
  process.exit(1);
}
const SIGNS = JSON.parse(fs.readFileSync(reportFile, 'utf8'));
const HS = ['sugar_hill', 'morris_park', 'williamsburg', 'richmond_hill'];
const SPREAD = +(process.env.SPREAD || 0.4); // how much an uneven board costs
const CM = (609.6 / 1080) ** 2 / 100, STEP = 2, FRAME_IN = 13;

// Each setting the tuner may move: [path in SETTINGS, lowest, highest].
const KNOBS = [
  ['bronxCols.0', 640, 735], ['bronxCols.1', 845, 905], ['bronxRow', 140, 215], ['huntsTop', 120, 215],
  ['hpCol', 770, 830], ['ehKnee', 700, 735], ['corner.0', 580, 640], ['corner.1', 180, 230],
  ['manhattan.0', 250, 330], ['manhattan.1', 340, 420], ['manhattan.2', 430, 520],
  ['manhattan.3', 530, 620], ['eastHarlem', -12, 32],
  ['astoriaCorona', 515, 560], ['queensCol', 790, 920], ['queensRows.0', 430, 525], ['queensRows.1', 560, 720],
  ['queensRows.2', 720, 840], ['wbTop', 575, 610], ['coronaBottom', 660, 740],
  ['williamsburgSouth', 700, 780], ['redHookSouth', 770, 850], ['coneyEast', 400, 480], ['bayEast', 0, 90],
  ['boweryBottom', 640, 690], ['stapletonTop', 672, 715], ['staten.0', 800, 850], ['staten.1', 895, 950],
];

// ---------------------------------------------------------------- geometry
function insideFrame(p) {
  const lo = FRAME_IN, hi = 1080 - FRAME_IN;
  if (p.every(([x, y]) => x >= lo && x <= hi && y >= lo && y <= hi)) return p;
  const cut = (q, inside, at) => q.flatMap((v, i) => {
    const u = q[(i - 1 + q.length) % q.length];
    return inside(v) ? (inside(u) ? [v] : [at(u, v), v]) : inside(u) ? [at(u, v)] : [];
  });
  const atX = x => (u, v) => [x, u[1] + (v[1] - u[1]) * (x - u[0]) / (v[0] - u[0])];
  const atY = y => (u, v) => [u[0] + (v[0] - u[0]) * (y - u[1]) / (v[1] - u[1]), y];
  let q = cut(p, v => v[0] >= lo, atX(lo));
  q = cut(q, v => v[0] <= hi, atX(hi));
  q = cut(q, v => v[1] >= lo, atY(lo));
  return cut(q, v => v[1] <= hi, atY(hi));
}
const inside = ([x, y], p) => {
  let c = false;
  for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
    const [xi, yi] = p[i], [xj, yj] = p[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c;
  }
  return c;
};
const segDist = (q, a, b) => {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = dx * dx + dy * dy;
  const t = L ? Math.max(0, Math.min(1, ((q[0] - a[0]) * dx + (q[1] - a[1]) * dy) / L)) : 0;
  return Math.hypot(q[0] - a[0] - t * dx, q[1] - a[1] - t * dy);
};
const cross = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
const segsCross = (a, b, c, d) => cross(a, b, c) * cross(a, b, d) < 0 && cross(c, d, a) * cross(c, d, b) < 0;
function rectInside([x, y, w, h], p) {
  const cs = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
  if (!cs.every(c => inside(c, p))) return false;
  for (let i = 0; i < p.length; i++) {
    const a = p[i], b = p[(i + 1) % p.length];
    if (a[0] > x && a[0] < x + w && a[1] > y && a[1] < y + h) return false;
    for (let k = 0; k < 4; k++) if (segsCross(a, b, cs[k], cs[(k + 1) % 4])) return false;
  }
  return true;
}
// the border straight above (hx, hy)
const above = (p, hx, hy) => {
  let top = -Infinity;
  p.forEach((a, i) => {
    const b = p[(i + 1) % p.length];
    if ((a[0] - hx) * (b[0] - hx) > 0 || a[0] === b[0]) return;
    const ey = a[1] + (b[1] - a[1]) * (hx - a[0]) / (b[0] - a[0]);
    if (ey < hy && ey > top) top = ey;
  });
  return top;
};

// ---------------------------------------------------------------- signs and room
// The sign as placeSign() in build_board.js hangs it: every shape tried at every height,
// as near the District's centre line (its centroid inside the frame) as it fits, the one
// whose hangers, distance off that line (SIGN_CENTRE a unit) and shape's cost come out least kept.
const SIGN_CENTRE = 2;
function sign(id, p) {
  const framed = ['speak', 'hs'].includes(SIGNS[id].zone), xs = p.map(q => q[0]), ys = p.map(q => q[1]);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  let A = 0, CX = 0;
  p.forEach((a, i) => { const b = p[(i + 1) % p.length], k = a[0] * b[1] - b[0] * a[1]; A += k; CX += (a[0] + b[0]) * k; });
  const mid = CX / (3 * A);
  let best = null;
  for (const { w, h, opts, cost } of SIGNS[id].shapes) for (const M of framed ? [13, 9] : [7]) {
    const drop = !!opts.drop, bh = opts.stacked ? 43 : 35, ph = 40, pw = 35.1; // the sign's and the plate's heights, the plate's width
    for (let y = y0; y <= y1 - h; y += STEP) {
      const fit = [];
      for (let x = x0; x <= x1 - w; x += STEP) if (rectInside([x - M, y - M, w + 2 * M, h + 2 * M], p)) fit.push(x);
      if (!fit.length) continue;
      const x = Math.min(Math.max(mid - w / 2, fit[0]), fit[fit.length - 1]), off = Math.abs(x + w / 2 - mid);
      const hooks = drop ? [[x + 12, y], [x + w - 12, y]] : [[x + 12, y + (h - bh) / 2], [x + w - pw / 2, y + (h - ph) / 2]];
      const hang = Math.max(...hooks.map(([hx, hy]) => hy - above(p, hx, hy)));
      const score = hang + SIGN_CENTRE * off + cost + (framed && M < 13 ? 4 : 0);
      if (!best || score < best.score) best = { score, hang, cost, w, h };
    }
  }
  return best;
}
function ground(p) { // cm² at least 6 units in from every border
  const xs = p.map(q => q[0]), ys = p.map(q => q[1]);
  let n = 0;
  for (let y = Math.min(...ys); y <= Math.max(...ys); y += 2) for (let x = Math.min(...xs); x <= Math.max(...xs); x += 2)
    if (inside([x, y], p) && Math.min(...p.map((a, i) => segDist([x, y], a, p[(i + 1) % p.length]))) >= 6) n++;
  return n * 4 * CM;
}

// ---------------------------------------------------------------- scoring
const length = pts => pts.slice(1).reduce((s, q, i) => s + Math.hypot(q[0] - pts[i][0], q[1] - pts[i][1]), 0);
function evaluate(S) {
  if (S.stapletonTop - S.boweryBottom < 22) return null;
  if (S.queensRows[1] > S.coronaBottom) return null; // Flushing's bottom never below Corona's
  let m;
  try { m = build(S); } catch (e) { return null; }
  if (check(m.chains, m.regions, m.bridges).problems.length || tightCorners(m.regions).length) return null;
  if (m.chains.some(c => !c.sides.some(s => ['water', 'nj'].includes(s)) && length(c.pts) < 32)) return null;
  const out = {};
  for (const id of Object.keys(SIGNS)) {
    const p = insideFrame(m.regions[id]), sg = sign(id, p);
    if (!sg) return null;
    out[id] = { room: ground(p) - (sg.w + 12) * (sg.h + 12) * CM, hang: sg.hang, cost: sg.cost };
  }
  return out;
}
function score(S) {
  const out = evaluate(S);
  if (!out) return { s: -Infinity };
  const rooms = Object.values(out).map(o => o.room).sort((a, b) => a - b);
  const low8 = rooms.slice(0, 8).reduce((a, b) => a + b) / 8, hs = Math.min(...HS.map(h => out[h].room));
  const hsShort = HS.reduce((a, h) => a + Math.max(0, 55 - out[h].room), 0);
  const mean = rooms.reduce((a, b) => a + b) / rooms.length;
  const sd = Math.sqrt(rooms.reduce((a, r) => a + (r - mean) ** 2, 0) / rooms.length);
  const signPen = Object.values(out).reduce((a, o) => a + Math.max(0, o.hang - 18) + 0.5 * o.cost, 0);
  return { s: rooms[0] + 0.6 * hs + 0.4 * low8 - hsShort - SPREAD * sd - 0.25 * signPen, out, sd };
}

// ---------------------------------------------------------------- search
const get = (S, k) => k.split('.').reduce((o, q) => o[q], S);
const set = (S, k, v) => { const ps = k.split('.'); let o = S; for (const q of ps.slice(0, -1)) o = o[q]; o[ps[ps.length - 1]] = v; };
const clone = S => JSON.parse(JSON.stringify(S));
const show = (tag, r) => {
  if (!r.out) { console.log(tag, 'refused: these settings fail a check'); return; }
  const e = Object.entries(r.out).sort((a, b) => a[1].room - b[1].room);
  console.log(`${tag} score ${r.s.toFixed(1)}, spread ${r.sd.toFixed(1)}, hangers over 18: ${e.filter(([, o]) => o.hang > 18).map(([k, o]) => `${k} ${o.hang.toFixed(0)}`).join(', ')}`);
  console.log('  rooms:', e.map(([k, o]) => `${k} ${o.room.toFixed(0)}`).join(', '));
};
let S = arg('from') ? JSON.parse(fs.readFileSync(arg('from'), 'utf8')) : clone(SETTINGS);
let best = score(S);
show('start', best);
if (!best.out) process.exit(1);
for (const step of [8, 4, 2, 1]) for (let improved = true; improved;) {
  improved = false;
  for (const [k, lo, hi] of KNOBS) for (const d of [-step, step]) {
    const v = get(S, k) + d;
    if (v < lo || v > hi) continue;
    const T = clone(S); set(T, k, v);
    const r = score(T);
    if (r.s > best.s + 1e-6) {
      best = r; S = T; improved = true;
      if (arg('save')) fs.writeFileSync(arg('save'), JSON.stringify(S));
    }
  }
  console.log(`step ${step}: score ${best.s.toFixed(1)}`);
}
show('best', best);
console.log(JSON.stringify(S));
