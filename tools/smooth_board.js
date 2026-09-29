#!/usr/bin/env node
// Experiment (2026-09-29): curves the traced board. Reads the skeleton,
// Art/Board/board-geometry.json (straight runs between a few hand-editable points),
// and writes Art/Board/Organic/board-geometry.json: the same Districts, chains and
// bridges in the same format, with rounded corners, bowed borders and a slow,
// meandering coast.
//
//   node tools/smooth_board.js           then   node tools/build_board.js --organic
//   node tools/smooth_board.js --force   write even if a check fails, to look at it
//
// The skeleton stays the thing to edit: move a junction there and re-run this.
//
// Topology can't change. Every chain keeps its two sides and its two end junctions,
// so every border, and so every adjacency, survives. Before writing anything the
// script checks that no chain crosses another, that no border, District or strait
// shrinks too far, and that each bridge still lands on both its Districts.
//
// How:
// - Coasts are curved as whole shorelines, straight through the junctions on them,
//   so a shore bends where the land bends and not at every District line. Corners
//   round over a limited radius (a quadratic B-spline through inserted points), then
//   a slow meander is added along the normal, damped in narrow water and near
//   bridge landings, where the shore stays straight so the bridge sits square.
// - Land borders keep their end junctions and take a gentle bow, curved to the side
//   that opens the tighter of the angles at their junctions, so a junction reads as
//   a clean meeting of three borders.
// - Bridges re-land where their axis meets the new shores.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'Art', 'Board', 'board-geometry.json');
const OUT = path.join(ROOT, 'Art', 'Board', 'Organic', 'board-geometry.json');
const W = 1080;
const FORCE = process.argv.includes('--force'); // write despite failed checks, to look at them

// Units are board units (1080 across, 0.564 mm each at 24in).
const P = {
  step: 2, // resample spacing before the meander
  tidy: 10, // skeleton runs shorter than this are tracing noise: merged away first
  coast: { radius: 44, waves: [[230, 3.6], [95, 1.5]] }, // [wavelength, amplitude]
  land: { radius: 22, bow: 0.055, maxBow: 6.5, waves: [[75, 1.1]] }, // bow: a share of the border's length
  county: { radius: 22, bow: 0.02, maxBow: 4, waves: [[110, 1.6]] }, // borders with the off-board counties
  taper: 22, // the meander fades in over this far from a pinned end or bridge landing
  landing: 14, // shore kept straight either side of a bridge landing
  strait: [16, 46], // water narrower than [0] takes no meander; wider than [1], all of it
  simplify: 0.2, // Douglas-Peucker tolerance on the output
};

const geo = JSON.parse(fs.readFileSync(SRC, 'utf8'));
const OFFBOARD = ['nj', 'north', 'east'];

// ---------------------------------------------------------------- helpers
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const mid = (a, b) => lerp(a, b, 0.5);
const key = p => `${p[0]},${p[1]}`;
const onFrame = ([x, y]) => x <= 0 || y <= 0 || x >= W || y >= W;
const smooth01 = t => { const u = Math.max(0, Math.min(1, t)); return u * u * (3 - 2 * u); };
const length = p => p.slice(1).reduce((s, q, i) => s + dist(p[i], q), 0);
function segDist(q, a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = dx * dx + dy * dy;
  const t = L ? Math.max(0, Math.min(1, ((q[0] - a[0]) * dx + (q[1] - a[1]) * dy) / L)) : 0;
  return { d: Math.hypot(q[0] - a[0] - t * dx, q[1] - a[1] - t * dy), t };
}
function area(p) {
  let s = 0;
  p.forEach((a, i) => { const b = p[(i + 1) % p.length]; s += a[0] * b[1] - b[0] * a[1]; });
  return Math.abs(s) / 2;
}
// Seeded per chain, so a run is repeatable and one chain's change moves nothing else.
function rng(seed) {
  let h = 1779033703 ^ seed.length;
  for (const ch of seed) { h = Math.imul(h ^ ch.charCodeAt(0), 3432918353); h = (h << 13) | (h >>> 19); }
  return () => {
    h = (h + 0x6d2b79f5) | 0;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function simplify(p, tol) {
  if (p.length < 3) return p;
  let worst = 0, at = 0;
  for (let i = 1; i < p.length - 1; i++) { const { d } = segDist(p[i], p[0], p[p.length - 1]); if (d > worst) { worst = d; at = i; } }
  if (worst <= tol) return [p[0], p[p.length - 1]];
  return [...simplify(p.slice(0, at + 1), tol).slice(0, -1), ...simplify(p.slice(at), tol)];
}

// ---------------------------------------------------------------- the skeleton's graph
const chains = geo.chains.map((c, i) => ({ ...c, i, pts: c.pts.map(q => q.slice()) }));
const isCoast = c => c.sides.includes('water');
const isCounty = c => c.sides.some(s => OFFBOARD.includes(s));
const nodeChains = new Map(); // junction key -> chain indices
for (const c of chains) for (const q of [c.pts[0], c.pts[c.pts.length - 1]]) {
  if (!nodeChains.has(key(q))) nodeChains.set(key(q), []);
  nodeChains.get(key(q)).push(c.i);
}
const isNode = q => nodeChains.has(key(q));
const landings = geo.bridges.flatMap(b => [b.a, b.b]);

// Merge the tracer's short runs: an interior point on a run under P.tidy goes, or
// two interior points meet at their midpoint. Junctions never move here.
function tidy(p) {
  p = p.map(q => q.slice());
  for (let again = true; again;) {
    again = false;
    for (let i = 0; i < p.length - 1; i++) {
      if (dist(p[i], p[i + 1]) >= P.tidy) continue;
      const fixA = i === 0 || isNode(p[i]), fixB = i + 1 === p.length - 1 || isNode(p[i + 1]);
      if (fixA && fixB) continue;
      if (fixA) p.splice(i + 1, 1);
      else if (fixB) p.splice(i, 1);
      else p.splice(i, 2, mid(p[i], p[i + 1]));
      again = true;
      break;
    }
  }
  return p;
}
for (const c of chains) c.pts = tidy(simplify(c.pts, 1.2));

// Coasts link into shorelines through every junction where exactly two coast chains
// meet; a shoreline ends at the frame, or closes on itself round an island.
function shorelines() {
  const coast = chains.filter(isCoast), used = new Set(), lines = [];
  const coastAt = q => (nodeChains.get(key(q)) || []).filter(i => isCoast(chains[i]));
  const walk = (start, rev) => {
    const run = [{ c: start, rev }];
    used.add(start.i);
    for (;;) {
      const last = run[run.length - 1], p = last.c.pts, end = last.rev ? p[0] : p[p.length - 1];
      const next = coastAt(end).filter(i => !used.has(i));
      if (coastAt(end).length !== 2 || !next.length) return { run, closed: coastAt(end).length === 2 };
      const c = chains[next[0]];
      used.add(c.i);
      run.push({ c, rev: key(c.pts[0]) !== key(end) });
    }
  };
  for (const c of coast) { // open lines first, from a frame end
    if (used.has(c.i)) continue;
    const a = c.pts[0], b = c.pts[c.pts.length - 1];
    if (coastAt(a).length === 1) lines.push(walk(c, false));
    else if (coastAt(b).length === 1) lines.push(walk(c, true));
  }
  for (const c of coast) if (!used.has(c.i)) lines.push(walk(c, false));
  return lines.map(({ run, closed }) => {
    const pts = [], marks = []; // marks: [index in pts, chain, rev] at each chain's start
    for (const { c, rev } of run) {
      const q = rev ? c.pts.slice().reverse() : c.pts;
      marks.push(pts.length);
      pts.push(...q.slice(0, -1));
    }
    const lastRun = run[run.length - 1], lp = lastRun.rev ? lastRun.c.pts[0] : lastRun.c.pts[lastRun.c.pts.length - 1];
    if (!closed) pts.push(lp);
    return { run, closed, pts, marks };
  });
}

// ---------------------------------------------------------------- curving
// Corners round over at most `radius`: points go in at that distance either side of
// each vertex, then a quadratic B-spline runs through the midpoints. A guarded point
// (a bridge landing) keeps a straight run of P.landing either side of it.
// Returns the dense curve and the index of each control vertex's image in it.
function curve(pts, radius, closed, guards) {
  const n = pts.length, ctl = [], vert = [];
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const a = pts[i], b = pts[(i + 1) % n], L = dist(a, b);
    let ra = Math.min(radius, 0.45 * L), rb = ra;
    for (const g of guards) {
      const { d, t } = segDist(g, a, b);
      if (d > 4 || t <= 0 || t >= 1) continue;
      ra = Math.max(1, Math.min(ra, t * L - P.landing));
      rb = Math.max(1, Math.min(rb, (1 - t) * L - P.landing));
    }
    vert.push(ctl.length);
    ctl.push(a, lerp(a, b, ra / L), lerp(a, b, 1 - rb / L));
  }
  if (!closed) { vert.push(ctl.length); ctl.push(pts[n - 1]); }
  const m = ctl.length, out = [], image = new Map();
  const bez = (a, c, b, t) => [
    (1 - t) * (1 - t) * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0],
    (1 - t) * (1 - t) * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1]];
  const first = closed ? 0 : 1, last = closed ? m - 1 : m - 2;
  if (!closed) { image.set(0, 0); out.push(ctl[0]); }
  for (let i = first; i <= last; i++) {
    const a = mid(ctl[(i - 1 + m) % m], ctl[i]), b = mid(ctl[i], ctl[(i + 1) % m]);
    for (let k = 0; k < 16; k++) {
      if (k === 8) image.set(i, out.length);
      out.push(bez(a, ctl[i], b, k / 16));
    }
  }
  if (!closed) { image.set(m - 1, out.length); out.push(ctl[m - 1]); }
  return { out, at: vert.map(v => image.get(v)) };
}

// Even spacing between marked points, keeping each mark as a sample.
function resample(p, marks, closed) {
  const ring = closed ? [...p, p[0]] : p, cuts = [...marks, closed ? p.length : p.length - 1];
  const out = [], at = [];
  for (let k = 0; k < cuts.length - 1; k++) {
    const piece = ring.slice(cuts[k], cuts[k + 1] + 1), L = length(piece), n = Math.max(1, Math.round(L / P.step));
    at.push(out.length);
    let j = 0, acc = 0;
    for (let s = 0; s < n; s++) {
      const want = (s / n) * L;
      while (j < piece.length - 2 && acc + dist(piece[j], piece[j + 1]) < want) { acc += dist(piece[j], piece[j + 1]); j++; }
      const seg = dist(piece[j], piece[j + 1]) || 1;
      out.push(lerp(piece[j], piece[j + 1], (want - acc) / seg));
    }
  }
  if (!closed) { at.push(out.length); out.push(ring[ring.length - 1]); }
  return { out, at };
}

function normals(p, closed) {
  return p.map((q, i) => {
    const a = p[closed ? (i - 2 + p.length) % p.length : Math.max(0, i - 2)];
    const b = p[closed ? (i + 2) % p.length : Math.min(p.length - 1, i + 2)];
    const L = dist(a, b) || 1;
    return [-(b[1] - a[1]) / L, (b[0] - a[0]) / L];
  });
}
function arc(p, closed) {
  const s = [0];
  for (let i = 1; i < p.length; i++) s.push(s[i - 1] + dist(p[i - 1], p[i]));
  return { s, total: s[s.length - 1] + (closed ? dist(p[p.length - 1], p[0]) : 0) };
}
function waves(spec, seed) {
  const r = rng(seed);
  const parts = spec.map(([len, amp]) => ({ k: (2 * Math.PI) / (len * (0.8 + 0.4 * r())), phase: r() * 2 * Math.PI, amp }));
  return s => parts.reduce((v, w) => v + w.amp * Math.sin(w.k * s + w.phase), 0);
}

// Water width at each skeleton shore point, looking out to sea: distance to the
// nearest shore ahead that is not this one close by (another shoreline, or this one
// far along it). Looking only seaward keeps a spit's far side, across land, out of it.
const shoreSamples = [];
function inside([x, y], p) {
  let c = false;
  for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
    const [xi, yi] = p[i], [xj, yj] = p[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}
function waterWidth({ q, n, line, s, total }) {
  let best = Infinity;
  for (const o of shoreSamples) {
    const dx = o.q[0] - q[0], dy = o.q[1] - q[1], d = Math.hypot(dx, dy);
    if (d >= best || dx * n[0] + dy * n[1] < 0.5 * d) continue;
    const along = Math.abs(o.s - s);
    if (o.line === line && Math.min(along, total - along) < Math.max(60, 3 * d)) continue;
    best = d;
  }
  return best;
}

// ---------------------------------------------------------------- 1. shorelines
const lines = shorelines();
const moved = new Map(); // junction key -> new position
const newPts = new Map(); // chain index -> new points
const skeletonLand = Object.values(geo.regions);
lines.forEach((ln, li) => {
  const r = resample(ln.pts, ln.marks, ln.closed), { s, total } = arc(r.out, ln.closed), nrm = normals(r.out, ln.closed);
  ln.skeleton = r.out.map((q, k) => {
    let n = nrm[k];
    if (skeletonLand.some(p => inside([q[0] + n[0] * 3, q[1] + n[1] * 3], p))) n = [-n[0], -n[1]]; // face the sea
    return { q, n, line: li, s: s[k], total };
  });
  ln.skeletonAt = ln.closed ? [...r.at, r.out.length] : r.at;
  shoreSamples.push(...ln.skeleton);
});
for (const o of shoreSamples) o.width = waterWidth(o);
lines.forEach(ln => {
  const cv = curve(ln.pts, P.coast.radius, ln.closed, landings);
  // a chain's start in the curve is the image of its first vertex; a closed
  // shoreline is turned to start at its first junction
  let dense = cv.out, starts = ln.marks.map(m => cv.at[m]);
  if (ln.closed) {
    const k0 = starts[0];
    dense = [...dense.slice(k0), ...dense.slice(0, k0)];
    starts = starts.map(k => (k - k0 + dense.length) % dense.length);
  }
  const r = resample(dense, starts, ln.closed);
  const p = r.out, nrm = normals(p, ln.closed), { s } = arc(p, ln.closed);
  const wave = waves(P.coast.waves, ln.run.map(x => x.c.sides.join('|')).join('/'));
  const pinned = [...(ln.closed ? [] : [p[0], p[p.length - 1]]), ...landings];
  // narrow water: judged on the skeleton at the same place along each chain, then
  // eased (the narrowest nearby, averaged) so the meander never steps
  const ends = ln.closed ? [...r.at, p.length] : r.at, sk = ln.skeleton, skAt = ln.skeletonAt;
  const raw = p.map((q, k) => {
    let j = 0;
    while (j < ends.length - 2 && ends[j + 1] <= k) j++;
    const t = (k - ends[j]) / (ends[j + 1] - ends[j]);
    const w = sk[Math.round(skAt[j] + t * (skAt[j + 1] - skAt[j])) % sk.length].width;
    return smooth01((w - P.strait[0]) / (P.strait[1] - P.strait[0]));
  });
  const around = (k, f) => {
    const v = [];
    for (let o = -10; o <= 10; o++) v.push(f(ln.closed ? (k + o + p.length) % p.length : Math.max(0, Math.min(p.length - 1, k + o))));
    return v;
  };
  const low = raw.map((_, k) => Math.min(...around(k, i => raw[i])));
  const strait = low.map((_, k) => around(k, i => low[i]).reduce((a, b) => a + b) / 21);
  const out = p.map((q, k) => {
    const near = Math.min(...pinned.map(g => dist(g, q)));
    const taper = smooth01((near - P.landing) / P.taper);
    const d = wave(s[k]) * taper * strait[k];
    return [q[0] + nrm[k][0] * d, q[1] + nrm[k][1] * d];
  });
  ln.run.forEach(({ c, rev }, k) => {
    const a = r.at[k], b = k + 1 < r.at.length ? r.at[k + 1] : out.length;
    let piece = out.slice(a, b + 1);
    if (ln.closed && k === ln.run.length - 1) piece = [...out.slice(a), out[0]];
    if (rev) piece.reverse();
    newPts.set(c.i, piece);
    for (const [orig, now] of [[c.pts[0], piece[0]], [c.pts[c.pts.length - 1], piece[piece.length - 1]]])
      if (!onFrame(orig)) moved.set(key(orig), now);
  });
});

// ---------------------------------------------------------------- 2. land borders
// Directions leaving a junction, from the skeleton, for choosing each bow's side.
function leaving(c, atStart) {
  const p = atStart ? c.pts : c.pts.slice().reverse();
  const q0 = p[0];
  let q1 = p[1];
  for (const q of p) if (dist(q, q0) > 20) { q1 = q; break; }
  return Math.atan2(q1[1] - q0[1], q1[0] - q0[0]);
}
const gap = (a, b) => { const d = Math.abs(a - b) % (2 * Math.PI); return Math.min(d, 2 * Math.PI - d); };
for (const c of chains.filter(ch => !isCoast(ch))) {
  const spec = isCounty(c) ? P.county : P.land, seed = c.sides.join('|'), r = rng(seed);
  // follow any junction the shoreline moved, blending the shift along the chain
  const p0 = c.pts, A = p0[0], B = p0[p0.length - 1];
  const dA = moved.has(key(A)) ? [moved.get(key(A))[0] - A[0], moved.get(key(A))[1] - A[1]] : [0, 0];
  const dB = moved.has(key(B)) ? [moved.get(key(B))[0] - B[0], moved.get(key(B))[1] - B[1]] : [0, 0];
  const L0 = length(p0);
  let acc = 0;
  const base = p0.map((q, i) => {
    if (i) acc += dist(p0[i - 1], q);
    const t = acc / L0;
    return [q[0] + dA[0] * (1 - t) + dB[0] * t, q[1] + dA[1] * (1 - t) + dB[1] * t];
  });
  const cv = curve(base, spec.radius, false, []);
  const rs = resample(cv.out, [0], false), p = rs.out, nrm = normals(p, false), { s } = arc(p, false), L = s[s.length - 1];
  // the bow turns the chain's ends by atan(pi * bow / L): pick the side that leaves
  // the tighter junction angle wider
  const bow = Math.min(spec.bow * L, spec.maxBow), turn = Math.atan((Math.PI * bow) / L);
  const others = (q, self) => (nodeChains.get(key(q)) || []).filter(i => i !== self).map(i => {
    const o = chains[i];
    return leaving(o, key(o.pts[0]) === key(q));
  });
  const score = sign => {
    const a0 = leaving(c, true) + sign * turn, b0 = leaving(c, false) - sign * turn;
    return Math.min(...others(A, c.i).map(o => gap(a0, o)), ...others(B, c.i).map(o => gap(b0, o)));
  };
  const up = score(1), down = score(-1);
  const sign = Math.min(up, down) > (55 * Math.PI) / 180 ? (r() < 0.5 ? 1 : -1) : up >= down ? 1 : -1;
  const wave = waves(spec.waves, seed);
  const out = p.map((q, k) => {
    const t = s[k] / L, taper = smooth01((Math.min(s[k], L - s[k]) - 4) / P.taper);
    const d = sign * bow * Math.sin(Math.PI * t) + wave(s[k]) * taper;
    return [q[0] + nrm[k][0] * d, q[1] + nrm[k][1] * d];
  });
  out[0] = base[0]; out[out.length - 1] = base[base.length - 1];
  newPts.set(c.i, out);
}

// ---------------------------------------------------------------- 3. assemble
const round = q => [Math.round(q[0] * 10) / 10, Math.round(q[1] * 10) / 10];
const outChains = chains.map(c => ({ sides: c.sides, pts: simplify(newPts.get(c.i), P.simplify).map(round) }));

// Regions: walk each skeleton ring, swapping each chain run for its new points;
// frame edges, which no chain covers, pass through.
const edge = new Map();
geo.chains.forEach((c, i) => c.pts.forEach((q, k) => {
  if (k === c.pts.length - 1) return;
  const n = c.pts[k + 1];
  edge.set(`${key(q)}>${key(n)}`, { i, rev: false });
  edge.set(`${key(n)}>${key(q)}`, { i, rev: true });
}));
const regions = {};
for (const [id, ring] of Object.entries(geo.regions)) {
  const n = ring.length, e = k => edge.get(`${key(ring[k % n])}>${key(ring[(k + 1) % n])}`);
  // start where a run begins, so no run is split across the wrap
  let start = 0;
  while (start < n) {
    const a = e((start - 1 + n) % n), b = e(start);
    if (!a || !b || a.i !== b.i) break;
    start++;
  }
  const out = [];
  for (let k = 0; k < n;) {
    const here = e(start + k);
    if (!here) { out.push(ring[(start + k) % n]); k++; continue; }
    const c = outChains[here.i].pts, q = here.rev ? c.slice().reverse() : c;
    out.push(...q.slice(0, -1));
    while (k < n && e(start + k) && e(start + k).i === here.i) k++;
  }
  regions[id] = out;
}

// Bridges: the same axis, re-landed on the new shores of the Districts they join.
function land(a, b, id) {
  const ux = b[0] - a[0], uy = b[1] - a[1];
  let best = null;
  for (const c of outChains.filter(ch => ch.sides.includes(id) && ch.sides.includes('water'))) {
    for (let k = 0; k < c.pts.length - 1; k++) {
      const [p, q] = [c.pts[k], c.pts[k + 1]], ex = q[0] - p[0], ey = q[1] - p[1];
      const den = ux * ey - uy * ex;
      if (!den) continue;
      const t = ((p[0] - a[0]) * ey - (p[1] - a[1]) * ex) / den, u = ((p[0] - a[0]) * uy - (p[1] - a[1]) * ux) / den;
      if (u < 0 || u > 1) continue;
      const hit = [a[0] + ux * t, a[1] + uy * t];
      if (!best || dist(hit, a) < dist(best, a)) best = hit;
    }
  }
  return best;
}
const bridges = geo.bridges.map(br => {
  const a = land(br.a, br.b, br.join[0]), b = land(br.b, br.a, br.join[1]);
  if (!a || !b) throw new Error(`${br.name} found no shore`);
  return { ...br, a: a.map(v => Math.round(v * 10) / 10), b: b.map(v => Math.round(v * 10) / 10) };
});

// ---------------------------------------------------------------- 4. checks
const problems = [];
const segsCross = (a, b, c, d) => {
  const cr = (p, q, r) => (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]);
  return cr(a, b, c) * cr(a, b, d) < 0 && cr(c, d, a) * cr(c, d, b) < 0;
};
const segs = outChains.flatMap((c, i) => c.pts.slice(1).map((q, k) => ({ i, k, a: c.pts[k], b: q })));
for (let x = 0; x < segs.length; x++) for (let y = x + 1; y < segs.length; y++) {
  const s1 = segs[x], s2 = segs[y];
  if (s1.i === s2.i && Math.abs(s1.k - s2.k) < 2) continue;
  if (Math.max(s1.a[0], s1.b[0]) < Math.min(s2.a[0], s2.b[0]) || Math.max(s2.a[0], s2.b[0]) < Math.min(s1.a[0], s1.b[0])) continue;
  if (Math.max(s1.a[1], s1.b[1]) < Math.min(s2.a[1], s2.b[1]) || Math.max(s2.a[1], s2.b[1]) < Math.min(s1.a[1], s1.b[1])) continue;
  if (segsCross(s1.a, s1.b, s2.a, s2.b)) problems.push(`${outChains[s1.i].sides} crosses ${outChains[s2.i].sides} near ${s1.a.map(Math.round)}`);
}
for (const [id, ring] of Object.entries(regions)) {
  const was = area(geo.regions[id]), now = area(ring), change = (now - was) / was;
  if (Math.abs(change) > 0.12) problems.push(`${id} area changed ${Math.round(change * 100)}%`);
}
outChains.forEach((c, i) => {
  if (isCoast(c)) return;
  const was = length(geo.chains[i].pts), now = length(c.pts);
  if (now < 0.92 * was) problems.push(`${c.sides} border shrank from ${Math.round(was)} to ${Math.round(now)}`);
});
// straits: the narrowest water between two shores must not close up
const shoreOf = cs => cs.filter(isCoast);
function narrowest(cs) {
  const out = new Map();
  const land = c => c.sides.find(s => s !== 'water');
  for (let x = 0; x < cs.length; x++) for (let y = x + 1; y < cs.length; y++) {
    const a = cs[x], b = cs[y];
    if (land(a) === land(b)) continue;
    // shores meeting at a junction are one coast, not two sides of a strait
    const ends = c => [c.pts[0], c.pts[c.pts.length - 1]].map(key);
    if (ends(a).some(k => ends(b).includes(k))) continue;
    let d = Infinity;
    for (const q of a.pts) for (let k = 0; k < b.pts.length - 1; k++) d = Math.min(d, segDist(q, b.pts[k], b.pts[k + 1]).d);
    const k = [land(a), land(b)].sort().join(' / ');
    out.set(k, Math.min(d, out.get(k) ?? Infinity));
  }
  return out;
}
const before = narrowest(shoreOf(geo.chains)), after = narrowest(shoreOf(outChains));
for (const [pair, was] of before) {
  const now = after.get(pair);
  if (was < 60 && now < Math.min(was, P.strait[0] + 6) - 2) problems.push(`water between ${pair} narrowed from ${Math.round(was)} to ${Math.round(now)}`);
}
bridges.forEach((b, i) => {
  const was = dist(geo.bridges[i].a, geo.bridges[i].b), now = dist(b.a, b.b);
  if (Math.abs(now - was) > 10) problems.push(`${b.name} length ${Math.round(was)} -> ${Math.round(now)}`);
});

// ---------------------------------------------------------------- 5. write
const note = 'Organic experiment (2026-09-29), written by tools/smooth_board.js from Art/Board/board-geometry.json (the skeleton: edit that, then re-run). Same Districts, chains and bridges as the skeleton, curved: coasts rounded and meandering, land borders bowed, bridges re-landed on the new shores. Every border is still one shared chain.';
const pointCount = outChains.reduce((s, c) => s + c.pts.length, 0);
console.log(`${lines.length} shorelines, ${outChains.length} chains, ${pointCount} points`);
for (const [pair, was] of before) if (was < 60) console.log(`  strait ${pair.padEnd(28)} ${Math.round(was)} -> ${Math.round(after.get(pair))}`);
bridges.forEach((b, i) => console.log(`  ${b.name.padEnd(20)} ${Math.round(dist(geo.bridges[i].a, geo.bridges[i].b))} -> ${Math.round(dist(b.a, b.b))}`));
if (problems.length) {
  console.error((FORCE ? 'Written anyway (--force):' : 'Not written:') + '\n  ' + problems.join('\n  '));
  if (!FORCE) process.exit(1);
}
fs.mkdirSync(path.dirname(OUT), { recursive: true });
const line = v => JSON.stringify(v);
fs.writeFileSync(OUT, `{"note":${line(note)},"size":${line(geo.size)},"regions":{\n`
  + Object.entries(regions).map(([id, r]) => `${line(id)}:${line(r)}`).join(',\n')
  + '},\n"chains":[\n' + outChains.map(line).join(',\n') + '],\n"bridges":' + line(bridges) + '}\n');
console.log('wrote', path.relative(ROOT, OUT));
