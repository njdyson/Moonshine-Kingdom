#!/usr/bin/env node
// Traces Art/Board (Large).png into Art/Board/Traced/board-geometry.json: one polygon per
// District and off-board landmass, one shared chain per border, and the bridges.
//
//   node tools/trace_board.js
//
// How: flood-fill each region from a seed through everything that is not gold
// ink, grow the regions into the gold lines (nearest wins, so each border splits
// down its middle), then walk the pixel-corner lattice from junction to junction
// and straighten each run with Douglas-Peucker. Neighbours share one chain, so a
// border can never open a gap or an overlap. Bridges are the brown planks in the
// water whose two ends land on different Districts.
//
// Only needed if the Affinity board changes. tools/draft_board.js keys its edits by the
// traced points' coordinates, so after a re-trace its MOVE, DROP and REPLACE keys need
// matching to the new points before it will draft the board again.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'Art', 'Board (Large).png');
const OUT = path.join(ROOT, 'Art', 'Board', 'Traced', 'board-geometry.json');
const W = 1080, H = 1080;

// Seeds sit near each name on the Affinity board; the nearest non-gold pixel is used.
const SEEDS = [
  ['sugar_hill', 460, 215], ['west_side', 395, 310], ['east_harlem', 560, 330], ['tenderloin', 350, 410],
  ['five_points', 310, 505], ['bowery', 225, 615], ['belmont', 580, 115], ['fordham', 770, 120],
  ['morris_park', 925, 140], ['hunts_point', 690, 245], ['throggs_neck', 885, 270], ['astoria', 700, 475],
  ['whitestone', 870, 430], ['corona', 730, 620], ['flushing', 900, 580], ['richmond_hill', 870, 735],
  ['jamaica', 895, 905], ['williamsburg', 540, 630], ['red_hook', 430, 735], ['brownsville', 650, 790],
  ['coney_island', 330, 900], ['sheepshead_bay', 500, 905], ['westerleigh', 110, 775], ['stapleton', 110, 880],
  ['tottenville', 110, 985],
  ['water', 730, 960], ['water', 560, 470], ['water', 60, 690], ['water', 1045, 120], ['water', 700, 1050],
  ['nj', 100, 450], ['north', 800, 32], ['east', 1048, 600],
];
const OFFBOARD = ['nj', 'north', 'east'];

async function readPixels() {
  const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const b64 = await page.evaluate(async (src) => {
    const img = new Image(); img.src = src; await img.decode();
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
    const g = c.getContext('2d'); g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, c.width, c.height).data;
    let s = '';
    for (let i = 0; i < d.length; i += 0x8000) s += String.fromCharCode.apply(null, d.subarray(i, i + 0x8000));
    return btoa(s);
  }, 'data:image/png;base64,' + fs.readFileSync(SRC).toString('base64'));
  await browser.close();
  return Buffer.from(b64, 'base64');
}

const nbr4 = (i) => {
  const x = i % W, y = (i / W) | 0;
  return [x > 0 ? i - 1 : -1, x < W - 1 ? i + 1 : -1, y > 0 ? i - W : -1, y < H - 1 ? i + W : -1].filter(j => j >= 0);
};

function segment(px) {
  const names = [...new Set(SEEDS.map(s => s[0]))];
  const gold = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) {
    const r = px[i * 4], g = px[i * 4 + 1], b = px[i * 4 + 2];
    gold[i] = (r > 95 && r - b > 55 && g > 50) || (r > 200 && g > 200 && b > 200) ? 1 : 0; // gold ink or the white margin
  }
  const lab = new Int16Array(W * H).fill(-1);
  for (const [id, sx, sy] of SEEDS) {
    let seed = -1;
    for (let r = 0; r < 30 && seed < 0; r++)
      for (let dy = -r; dy <= r && seed < 0; dy++)
        for (let dx = -r; dx <= r; dx++) if (!gold[(sy + dy) * W + sx + dx]) { seed = (sy + dy) * W + sx + dx; break; }
    if (lab[seed] >= 0) continue;
    const L = names.indexOf(id), stack = [seed];
    lab[seed] = L;
    while (stack.length) for (const j of nbr4(stack.pop())) if (lab[j] < 0 && !gold[j]) { lab[j] = L; stack.push(j); }
  }
  let front = [];
  for (let i = 0; i < W * H; i++) if (lab[i] >= 0) front.push(i);
  while (front.length) {
    const next = [];
    for (const i of front) for (const j of nbr4(i)) if (lab[j] < 0) { lab[j] = lab[i]; next.push(j); }
    front = next;
  }
  return { names, lab };
}

function vectorise({ names, lab }) {
  const OUTSIDE = -2;
  const L = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? OUTSIDE : lab[y * W + x];
  const name = v => v === OUTSIDE ? 'OUT' : names[v];
  const edgesFrom = (x, y) => {
    const r = [];
    if (x < W && L(x, y - 1) !== L(x, y)) r.push([x + 1, y]);
    if (x > 0 && L(x - 1, y - 1) !== L(x - 1, y)) r.push([x - 1, y]);
    if (y < H && L(x - 1, y) !== L(x, y)) r.push([x, y + 1]);
    if (y > 0 && L(x - 1, y - 1) !== L(x, y - 1)) r.push([x, y - 1]);
    return r;
  };
  const sides = (x0, y0, x1, y1) => y0 === y1
    ? [L(Math.min(x0, x1), y0 - 1), L(Math.min(x0, x1), y0)]
    : [L(x0 - 1, Math.min(y0, y1)), L(x0, Math.min(y0, y1))];
  const isJunction = (x, y) => {
    const n = edgesFrom(x, y).length;
    return n > 0 && (n !== 2 || new Set([L(x - 1, y - 1), L(x, y - 1), L(x - 1, y), L(x, y)]).size > 2);
  };
  const ek = (a, b, c, d) => { const p = b * (W + 1) + a, q = d * (W + 1) + c; return p < q ? p + ':' + q : q + ':' + p; };
  const seen = new Set(), chains = [];
  const walk = (x0, y0, x1, y1) => {
    const pts = [[x0, y0]], lr = sides(x0, y0, x1, y1);
    let px = x0, py = y0, cx = x1, cy = y1;
    seen.add(ek(px, py, cx, cy));
    for (;;) {
      pts.push([cx, cy]);
      if (isJunction(cx, cy) || (cx === x0 && cy === y0)) break;
      const nx = edgesFrom(cx, cy).find(([a, b]) => !(a === px && b === py) && !seen.has(ek(cx, cy, a, b)));
      if (!nx) break;
      seen.add(ek(cx, cy, nx[0], nx[1])); px = cx; py = cy; [cx, cy] = nx;
    }
    chains.push({ sides: lr.map(name), pts });
  };
  for (let y = 0; y <= H; y++) for (let x = 0; x <= W; x++) if (isJunction(x, y))
    for (const [a, b] of edgesFrom(x, y)) if (!seen.has(ek(x, y, a, b))) walk(x, y, a, b);
  const dp = (p, eps) => {
    if (p.length < 3) return p;
    const [ax, ay] = p[0], [bx, by] = p[p.length - 1], dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy);
    let dmax = 0, k = 0;
    for (let i = 1; i < p.length - 1; i++) {
      const d = len ? Math.abs(dy * p[i][0] - dx * p[i][1] + bx * ay - by * ax) / len : Math.hypot(p[i][0] - ax, p[i][1] - ay);
      if (d > dmax) { dmax = d; k = i; }
    }
    return dmax <= eps ? [p[0], p[p.length - 1]] : dp(p.slice(0, k + 1), eps).slice(0, -1).concat(dp(p.slice(k), eps));
  };
  for (const c of chains) c.pts = dp(c.pts, 1.6);
  return chains;
}

function loops(chains, id) {
  const segs = chains.filter(c => c.sides.includes(id)).map(c => c.pts.slice());
  const same = (a, b) => a[0] === b[0] && a[1] === b[1];
  let loop = segs.shift();
  while (!same(loop[0], loop[loop.length - 1])) {
    const end = loop[loop.length - 1];
    const i = segs.findIndex(s => same(s[0], end) || same(s[s.length - 1], end));
    if (i < 0) throw new Error('Open outline for ' + id);
    let s = segs.splice(i, 1)[0];
    if (!same(s[0], end)) s = s.reverse();
    loop = loop.concat(s.slice(1));
  }
  if (segs.length) throw new Error(id + ' has more than one outline');
  return loop.slice(0, -1);
}

function findBridges(px, { names, lab }) {
  const plank = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) {
    const r = px[i * 4], g = px[i * 4 + 1], b = px[i * 4 + 2];
    plank[i] = r > 60 && r < 160 && g > 15 && g < 75 && b < 25 && names[lab[i]] === 'water' ? 1 : 0;
  }
  const seen = new Uint8Array(W * H), found = [];
  for (let i = 0; i < W * H; i++) {
    if (!plank[i] || seen[i]) continue;
    const stack = [i], pts = [];
    seen[i] = 1;
    while (stack.length) {
      const j = stack.pop(); pts.push([j % W, (j / W) | 0]);
      for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) {
        const k = j + dy * W + dx;
        if (k >= 0 && k < W * H && plank[k] && !seen[k]) { seen[k] = 1; stack.push(k); }
      }
    }
    if (pts.length < 200) continue; // lettering and specks
    const n = pts.length, mx = pts.reduce((s, p) => s + p[0], 0) / n, my = pts.reduce((s, p) => s + p[1], 0) / n;
    let sxx = 0, syy = 0, sxy = 0;
    for (const [x, y] of pts) { sxx += (x - mx) ** 2; syy += (y - my) ** 2; sxy += (x - mx) * (y - my); }
    const th = 0.5 * Math.atan2(2 * sxy, sxx - syy), ux = Math.cos(th), uy = Math.sin(th);
    const ends = [-1, 1].map(s => {
      for (let t = 0.5; t < 60; t += 0.5) {
        const x = mx + s * t * ux, y = my + s * t * uy, id = names[lab[Math.round(y) * W + Math.round(x)]];
        if (id !== 'water') return { id, at: [+x.toFixed(1), +y.toFixed(1)] };
      }
      return null;
    });
    if (ends.every(e => e && !OFFBOARD.includes(e.id)) && ends[0].id !== ends[1].id)
      found.push({ join: [ends[0].id, ends[1].id], a: ends[0].at, b: ends[1].at });
  }
  return found;
}

function keptBridges() {
  if (!fs.existsSync(OUT)) return null;
  const { bridges } = JSON.parse(fs.readFileSync(OUT, 'utf8'));
  return bridges && bridges.length && bridges.every(b => b.name) ? bridges : null;
}

(async () => {
  const px = await readPixels();
  const seg = segment(px);
  const all = vectorise(seg);
  const regions = {};
  for (const id of seg.names) if (id !== 'water') regions[id] = loops(all, id);
  // Keep the borders that get drawn: anything touching a District, and the off-board coasts.
  const chains = all.filter(c => c.sides.some(s => s !== 'water' && s !== 'OUT' && !OFFBOARD.includes(s))
    || (c.sides.includes('water') && c.sides.some(s => OFFBOARD.includes(s))));
  const out = {
    note: 'Board geometry traced from Art/Board (Large).png by tools/trace_board.js (1080 x 1080 units, same frame as the original). Every land border is one shared chain, so neighbouring Districts cannot drift apart. tools/draft_board.js redraws it as Art/Board/board-geometry.json and keys its edits by the points here, so edit it only with the drafting in mind. Bridges are named and kept by hand since 2026-09-28: the Queensboro was moved south from the Affinity position (a Triborough, opened 1936) to its 1929 line, East 59th Street to Long Island City, still joining East Harlem and Astoria.',
    // Once named, the bridges are kept by hand (the Queensboro was moved from the
    // Affinity position for period accuracy), so a re-trace keeps them.
    size: [W, H], regions, chains, bridges: keptBridges() || findBridges(px, seg),
  };
  // one region, chain or bridge per line keeps diffs readable
  const lines = [
    `{"note":${JSON.stringify(out.note)},"size":${JSON.stringify(out.size)},"regions":{`,
    Object.entries(regions).map(([k, v]) => `${JSON.stringify(k)}:${JSON.stringify(v)}`).join(',\n') + '},',
    '"chains":[', chains.map(c => JSON.stringify({ sides: c.sides, pts: c.pts })).join(',\n') + '],',
    '"bridges":[', out.bridges.map(b => JSON.stringify(b)).join(',\n') + ']}',
  ];
  fs.writeFileSync(OUT, lines.join('\n') + '\n');
  console.log(`wrote ${path.relative(ROOT, OUT)}: ${Object.keys(regions).length} regions, ${chains.length} chains, ${out.bridges.length} bridges`);
})();
