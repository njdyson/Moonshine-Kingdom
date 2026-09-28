#!/usr/bin/env node
// Builds the game board as a vector SVG from Art/Board/board-geometry.json and
// the District Roster below, then renders it through Playwright's Chromium.
//
//   node tools/build_board.js           print and screen SVGs, 2160px previews of each
//   node tools/build_board.js --print   also a 7200px PNG (24in at 300dpi, not committed)
//
// Two builds share everything but the texture: the print board carries the full
// pebbled leather, which reads at 24in; the screen board keeps only soft wrinkles
// and dye, because at screen size the grain turns to noise.
//
// The board prints 24 inches square: 1080 units across, so 1 unit is 0.564 mm.
// Anything a physical piece must fit (the Heat Track's poker chips, the Mash
// die) is sized in millimetres through MM.
//
// The roster must match the Town Planner's District Roster: zone, Still number,
// venue and Setup mark for every District, Borough numbers in Raid order.
// Stills are the Still Token art itself (Art/Still Tokens/SVG), so the printed
// board and the prototype tokens can never disagree.
//
// Each District's label cluster is placed automatically (LABEL_PLACEMENT below):
// centred in the District, or pushed to an edge to leave open ground for pieces.
// Pin one by hand with `place: ['h' | 'v', x, y]` if the choice ever looks wrong.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIR = path.join(ROOT, 'Art', 'Board');
const OUT = {
  printSvg: path.join(DIR, 'Board v0.9.svg'), screenSvg: path.join(DIR, 'Board v0.9 (screen).svg'),
  screenJpg: path.join(DIR, 'Board v0.9 (screen).jpg'), printJpg: path.join(DIR, 'Board v0.9 (print preview).jpg'),
  printPng: path.join(DIR, 'Board v0.9 (print).png'),
};
const geo = JSON.parse(fs.readFileSync(path.join(DIR, 'board-geometry.json'), 'utf8'));
const BOARD_MM = 609.6, MM = 1080 / BOARD_MM; // 24in square

// ---------------------------------------------------------------- palette
// Muted land so every mob colour, and the blue Squads, stand out on it.
const C = {
  gold: '#c9a437', goldBright: '#e8cc72', goldLine: '#b9932f', goldDim: '#a98c4f', goldDeep: '#7a6224',
  ink: '#efe3cd', body: '#d8caae', muted: '#b8a577',
  sea: ['#15202b', '#0c131b'], offboard: '#26231f', shadow: '#0a0705',
  panelA: '#231b13', panelB: '#16110b',
};
const BOROUGHS = {
  MN: { n: 1, name: 'Manhattan', fill: ['#5a3336', '#3e2224'] },
  BX: { n: 2, name: 'The Bronx', fill: ['#34493b', '#223127'] },
  QN: { n: 3, name: 'Queens', fill: ['#3f3a57', '#2a263b'] },
  BK: { n: 4, name: 'Brooklyn', fill: ['#5a4630', '#3d2f1f'] },
  SI: { n: 5, name: 'Staten Island', fill: ['#3b3935', '#282623'] },
};

// ---------------------------------------------------------------- roster
// setup: the Town Planner's Setup column. lines: a hand break for long names.
const DISTRICTS = [
  { id: 'five_points', name: 'Five Points', boro: 'MN', zone: 'ward', still: 10, setup: 'home' },
  { id: 'sugar_hill', name: 'Sugar Hill', boro: 'MN', zone: 'hs', still: 7, venue: 'The Cotton Club', setup: 'squad' },
  { id: 'east_harlem', name: 'East Harlem', boro: 'MN', zone: 'speak', still: 12, venue: 'The Silver Dollar', setup: 'runners' },
  { id: 'tenderloin', name: 'The Tenderloin', boro: 'MN', zone: 'speak', still: 8, venue: 'The Haymarket' },
  { id: 'west_side', name: 'West Side', boro: 'MN', zone: 'dock', still: 11, setup: 'runners' },
  { id: 'bowery', name: 'The Bowery', boro: 'MN', zone: 'dock', still: 9 },
  { id: 'hunts_point', name: 'Hunts Point', boro: 'BX', zone: 'ward', still: 9, setup: 'home' },
  { id: 'morris_park', name: 'Morris Park', boro: 'BX', zone: 'hs', still: 7, venue: 'The Jockey Club', setup: 'squad' },
  { id: 'belmont', name: 'Belmont', boro: 'BX', zone: 'speak', still: 11, venue: 'DeLillo’s', setup: 'runners' },
  { id: 'fordham', name: 'Fordham', boro: 'BX', zone: 'speak', still: 8, venue: 'The Penny Whistle' },
  { id: 'throggs_neck', name: 'Throggs Neck', boro: 'BX', zone: 'dock', still: 10, setup: 'runners' },
  { id: 'corona', name: 'Corona', boro: 'QN', zone: 'ward', still: 4, setup: 'home' },
  { id: 'richmond_hill', name: 'Richmond Hill', boro: 'QN', zone: 'hs', still: 7, venue: 'The Triangle', setup: 'squad' },
  { id: 'astoria', name: 'Astoria', boro: 'QN', zone: 'speak', still: 2, venue: 'Bohemian Hall', setup: 'runners' },
  { id: 'flushing', name: 'Flushing', boro: 'QN', zone: 'speak', still: 6, venue: 'Paradise Alley' },
  { id: 'whitestone', name: 'Whitestone', boro: 'QN', zone: 'dock', still: 5 },
  { id: 'jamaica', name: 'Jamaica', boro: 'QN', zone: 'dock', still: 3, setup: 'runners' },
  { id: 'brownsville', name: 'Brownsville', boro: 'BK', zone: 'ward', still: 5, setup: 'home' },
  { id: 'williamsburg', name: 'Williamsburg', boro: 'BK', zone: 'hs', still: 7, venue: 'The Havemeyer', setup: 'squad' },
  { id: 'coney_island', name: 'Coney Island', boro: 'BK', zone: 'speak', still: 3, venue: 'Ruby’s Joint', setup: 'runners' },
  { id: 'red_hook', name: 'Red Hook', boro: 'BK', zone: 'speak', still: 6, venue: 'Sunny’s Bar' },
  { id: 'sheepshead_bay', name: 'Sheepshead Bay', boro: 'BK', zone: 'dock', still: 4, setup: 'runners', lines: ['Sheepshead', 'Bay'] },
  { id: 'stapleton', name: 'Stapleton', boro: 'SI', zone: 'ward', still: 6 },
  { id: 'westerleigh', name: 'Westerleigh', boro: 'SI', zone: 'dock', still: 2 },
  { id: 'tottenville', name: 'Tottenville', boro: 'SI', zone: 'dock', still: 4 },
];
// Setup marks: the starting pieces, ghosted in a dashed tray, from the Town
// Planner's Setup column. Pieces only; the words live in the Town Planner.
const SETUP = {
  home: ['safehouse', 'boss', 'runner', 'runner'], // Home Turf: Safehouse, Boss and 2 Runners
  runners: ['runner', 'runner', 'runner'],
  squad: ['squad'],
};
// Off since 2026-09-28: Nick wants to playtest other setups without the printed
// board committing to one. The roster keeps the Town Planner's marks; true draws
// them again, with the key's Setup row.
const SHOW_SETUP = false;
const OFFBOARD = ['nj', 'north', 'east'];

// Labels in the water or on off-board land, by visual centre: [x, y, rotation].
// Centres sit midway between the shores (or shore and frame), angles follow them.
const BORO_LABELS = {
  MN: [247, 378, -52.5], BX: [1049.5, 280, -90], QN: [890, 1037, -6.6], BK: [525, 1030, 8.6], SI: [150, 1050, 0],
};
const WATER_LABELS = [['EAST RIVER', 580, 472, -43.6], ['JAMAICA BAY', 732, 921, 0]];
const LAND_LABELS = [['WESTCHESTER', 800, 32, 0], ['NASSAU', 1049, 700, 90]];

// ---------------------------------------------------------------- type
const TYPE = {
  name: { family: 'Barlow Condensed', weight: 700, size: 14.5, spacing: 1.1 },
  venue: { family: 'Barlow', weight: 500, size: 9, spacing: 0.2, italic: true },
  boro: { family: 'Cinzel', weight: 700, size: 19, spacing: 3.6 },
  water: { family: 'Barlow Condensed', weight: 600, size: 10, spacing: 3.4, italic: true },
  land: { family: 'Barlow Condensed', weight: 600, size: 9.5, spacing: 5 },
  keyHead: { family: 'Barlow Condensed', weight: 700, size: 9.5, spacing: 0.8 },
  keyText: { family: 'Barlow', weight: 500, size: 7.6, spacing: 0.1 },
  panelHead: { family: 'Cinzel', weight: 700, size: 11.5, spacing: 3.2 },
  small: { family: 'Barlow Condensed', weight: 700, size: 8, spacing: 1.3 },
  titleCity: { family: 'Cinzel', weight: 700, size: 26, spacing: 4.5 },
  titleYear: { family: 'Cinzel', weight: 700, size: 15, spacing: 8 },
};
const FONTS = 'https://fonts.googleapis.com/css2?family=Barlow:ital,wght@0,500;0,600;0,700;1,500&family=Barlow+Condensed:ital,wght@0,600;0,700;1,600&family=Bebas+Neue&family=Cinzel:wght@700&display=block';

// ---------------------------------------------------------------- helpers
const f = (v, dp = 2) => +(+v).toFixed(dp);
const poly = p => `M${p.map(([x, y]) => `${f(x)} ${f(y)}`).join(' L')} Z`;
const pts = p => p.map(([x, y]) => `${f(x)},${f(y)}`).join(' ');
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const byId = Object.fromEntries(DISTRICTS.map(d => [d.id, d]));
const upper = s => s.toUpperCase();

let WIDTHS = new Map();
const wkey = (spec, t) => `${spec.family}|${spec.weight}|${spec.size}|${spec.spacing}|${spec.italic ? 1 : 0}|${t}`;
const width = (spec, t) => {
  const w = WIDTHS.get(wkey(spec, t));
  if (w === undefined) throw new Error('Unmeasured text: ' + t);
  return w;
};

// middle: (x, y) is the visual centre of the capitals, and any rotation turns about it.
function text(str, x, y, spec, { fill = C.ink, anchor = 'start', halo = 0, rotate = 0, opacity = 1, middle = false } = {}) {
  const by = middle ? y + spec.size * 0.35 : y;
  const attrs = `x="${f(x)}" y="${f(by)}" font-family="${spec.family}" font-weight="${spec.weight}" font-size="${spec.size}" letter-spacing="${spec.spacing}" text-anchor="${anchor}"${spec.italic ? ' font-style="italic"' : ''}${rotate ? ` transform="rotate(${rotate} ${f(x)} ${f(y)})"` : ''}${opacity < 1 ? ` opacity="${opacity}"` : ''}`;
  const t = esc(str);
  return (halo ? `<text ${attrs} fill="none" stroke="${C.shadow}" stroke-opacity=".8" stroke-width="${halo}" stroke-linejoin="round">${t}</text>` : '')
    + `<text ${attrs} fill="${fill}">${t}</text>`;
}

// ---------------------------------------------------------------- art
// Icons come from Art/Icons with their own colours stripped, so one fill tints them.
function loadIcon(file) {
  const src = fs.readFileSync(path.join(ROOT, 'Art', 'Icons', file), 'utf8');
  const vb = src.match(/viewBox="([^"]+)"/)[1].split(/[\s,]+/).map(Number);
  const inner = src.replace(/<\?xml[^>]*>/g, '').replace(/<!--[\s\S]*?-->/g, '')
    .replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>[\s\S]*$/, '')
    .replace(/\s(fill|stroke|style|id)="[^"]*"/g, '').replace(/\s+/g, ' ').trim();
  return { vb, inner };
}
const ICONS = {
  speak: loadIcon('Tumbler.svg'), ward: loadIcon('Fist.svg'), dock: loadIcon('anchor.svg'),
  crown: loadIcon('Crown.svg'), runner: loadIcon('Runner.svg'), safehouse: loadIcon('Safehouse.svg'),
  martini: loadIcon('Gin.svg'), boss: loadIcon('Boss.svg'),
};
function icon(kind, cx, cy, size, color, strokeWidth) {
  if (kind === 'squad') { // a police shield
    const s = size / 11;
    return `<path transform="translate(${f(cx - 5 * s)} ${f(cy - 5.5 * s)}) scale(${f(s, 4)})" d="M5 0 L10 1.6 V5.2 C10 8.2 7.6 10.2 5 11 C2.4 10.2 0 8.2 0 5.2 V1.6 Z" fill="${color}"/>`;
  }
  const { vb } = ICONS[kind];
  const inner = strokeWidth ? ICONS[kind].inner.replace(/stroke-width="[^"]*"/g, `stroke-width="${strokeWidth}"`) : ICONS[kind].inner;
  const s = size / Math.max(vb[2], vb[3]);
  const tx = cx - (vb[0] + vb[2] / 2) * s, ty = cy - (vb[1] + vb[3] / 2) * s;
  const paint = kind === 'crown'
    ? `fill="none" stroke="${color}" stroke-linecap="round" stroke-linejoin="round"`
    : `fill="${color}"`;
  return `<g transform="translate(${f(tx)} ${f(ty)}) scale(${f(s, 4)})" ${paint}>${inner}</g>`;
}

// The Still Token art, trimmed to its drawn bounds (x 12.5-90.7, y 9.9-103.3).
const TOKEN_BOX = [12.5, 9.9, 78.2, 93.4];
const TOKENS = {};
for (let n = 2; n <= 12; n++) {
  const src = fs.readFileSync(path.join(ROOT, 'Art', 'Still Tokens', 'SVG', `still-${String(n).padStart(2, '0')}.svg`), 'utf8');
  TOKENS[n] = src.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>[\s\S]*$/, '').replace('<defs></defs>', '').replace(/\n\s*/g, '');
}
function still(n, x, y, h) {
  const s = h / TOKEN_BOX[3];
  return `<g transform="translate(${f(x - TOKEN_BOX[0] * s)} ${f(y - TOKEN_BOX[1] * s)}) scale(${f(s, 4)})">${TOKENS[n]}</g>`;
}
const TOKEN_H = 42, TOKEN_W = TOKEN_H * TOKEN_BOX[2] / TOKEN_BOX[3];

// Zone roundel: the same mark on the map and in the key. A High Society Venue is
// a Speakeasy with a crown on it; its glass is the martini, not the tumbler.
function roundel(zone, cx, cy, r) {
  if (zone === 'hs') {
    const ky = cy - r - r * 0.3, ks = r * 1.3;
    return `<circle cx="${f(cx)}" cy="${f(cy)}" r="${r}" fill="${C.goldBright}" stroke="${C.shadow}" stroke-width="1"/>`
      + icon('martini', cx, cy + r * 0.06, r * 1.08, '#2a1d0c')
      + icon('crown', cx, ky, ks, C.shadow, 5.5) + icon('crown', cx, ky, ks, C.goldBright);
  }
  return `<circle cx="${f(cx)}" cy="${f(cy)}" r="${r}" fill="#140e09" fill-opacity=".85" stroke="${C.gold}" stroke-width="1.2"/>`
    + icon(zone, cx, cy + (zone === 'speak' ? r * 0.04 : 0), r * (zone === 'ward' ? 1.3 : 1.2), C.gold);
}

// ---------------------------------------------------------------- label clusters
// Two arrangements, h (Still left of the text) and v (Still over the text); the
// placer tries both. Returns the size and a draw(x, y) for the chosen spot.
const R = 14; // roundel radius: 28 units, about 16 mm at 24in
function cluster(d, layout) {
  const names = (d.lines || [d.name]).map(upper);
  const nameW = Math.max(...names.map(n => width(TYPE.name, n)));
  const venueW = d.venue ? width(TYPE.venue, d.venue) : 0;
  const setup = SHOW_SETUP && d.setup ? SETUP[d.setup] : null;
  const setupW = setup ? trayWidth(setup) : 0;
  const hs = d.zone === 'hs', nameFill = hs ? C.goldBright : C.ink;
  const lines = []; // [kind, text, baseline]
  if (layout === 'h') {
    // Still on the left; roundel inline with the name, the crown room above it
    const x0 = TOKEN_W + 7, rcy = R + (hs ? 1.2 * R : 0);
    let y = rcy + 5.1;
    names.forEach((n, i) => { lines.push(['name', n, y]); y += 14.5; });
    y -= 1.5;
    if (d.venue) { lines.push(['venue', d.venue, y]); y += 11.5; }
    if (setup) lines.push(['setup', '', y + 1.5]);
    const w = x0 + Math.max(2 * R + 5 + nameW, venueW, setupW);
    const h = Math.max(TOKEN_H, lines[lines.length - 1][2] + 3);
    return {
      w, h, layout,
      roundelAt: (x, yy) => [x + x0 + R, yy + rcy],
      draw(x, yy) {
        let s = still(d.still, x, yy, TOKEN_H) + roundel(d.zone, x + x0 + R, yy + rcy, R);
        for (const [kind, t, b] of lines) {
          if (kind === 'name') s += text(t, x + x0 + 2 * R + 5, yy + b, TYPE.name, { fill: nameFill, halo: 2.6 });
          if (kind === 'venue') s += text(t, x + x0, yy + b, TYPE.venue, { fill: C.body, halo: 2.2 });
          if (kind === 'setup') s += tray(setup, x + x0, yy + b - 3);
        }
        return s;
      },
    };
  }
  // v: roundel and Still side by side, text centred below; a crown needs headroom
  const rowW = 2 * R + 6 + TOKEN_W, top = hs ? 7 : 0;
  let y = top + TOKEN_H + 15.5;
  names.forEach(n => { lines.push(['name', n, y]); y += 14.5; });
  y -= 1.5;
  if (d.venue) { lines.push(['venue', d.venue, y]); y += 11.5; }
  if (setup) lines.push(['setup', '', y + 1.5]);
  const w = Math.max(rowW, nameW, venueW, setupW);
  const h = lines[lines.length - 1][2] + 3;
  return {
    w, h, layout,
    roundelAt: (x, yy) => [x + (w - rowW) / 2 + R, yy + top + TOKEN_H / 2],
    draw(x, yy) {
      const rx = x + (w - rowW) / 2;
      let s = roundel(d.zone, rx + R, yy + top + TOKEN_H / 2, R) + still(d.still, rx + 2 * R + 6, yy + top, TOKEN_H);
      for (const [kind, t, b] of lines) {
        if (kind === 'name') s += text(t, x + w / 2, yy + b, TYPE.name, { fill: nameFill, anchor: 'middle', halo: 2.6 });
        if (kind === 'venue') s += text(t, x + w / 2, yy + b, TYPE.venue, { fill: C.body, anchor: 'middle', halo: 2.2 });
        if (kind === 'setup') s += tray(setup, x + w / 2 - setupW / 2, yy + b - 3);
      }
      return s;
    },
  };
}
// A dashed tray of ghosted pieces; (x, cy) is its left edge and vertical centre.
const GHOST = 8.5, GHOST_GAP = 1.4, TRAY_PAD = 4, TRAY_H = 12;
const trayWidth = icons => 2 * TRAY_PAD + icons.length * GHOST + (icons.length - 1) * GHOST_GAP;
function tray(icons, x, cy) {
  let s = `<rect x="${f(x)}" y="${f(cy - TRAY_H / 2)}" width="${f(trayWidth(icons))}" height="${TRAY_H}" rx="${TRAY_H / 2}" fill="#000" fill-opacity=".2" stroke="${C.muted}" stroke-opacity=".6" stroke-width=".8" stroke-dasharray="2 1.5"/>`;
  icons.forEach((ic, i) => { s += icon(ic, x + TRAY_PAD + GHOST / 2 + i * (GHOST + GHOST_GAP), cy, GHOST, C.muted); });
  return `<g opacity=".7">${s}</g>`;
}

// ---------------------------------------------------------------- placement
const inside = ([x, y], p) => {
  let c = false;
  for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
    const [xi, yi] = p[i], [xj, yj] = p[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c;
  }
  return c;
};
const segDist = ([px, py], [ax, ay], [bx, by]) => {
  const dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy;
  const t = L ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / L)) : 0;
  return Math.hypot(px - ax - t * dx, py - ay - t * dy);
};
const edgeDist = (q, p) => Math.min(...p.map((a, i) => segDist(q, a, p[(i + 1) % p.length])));
const rectDist = ([x, y], [rx, ry, rw, rh]) => Math.hypot(Math.max(rx - x, 0, x - rx - rw), Math.max(ry - y, 0, y - ry - rh));
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

// Largest open circle left in the District once the cluster (plus margin) sits
// at a spot: the ground the pieces get. Clusters also keep clear of their
// neighbours' across a border, so no Still reads as belonging next door.
const rectGap = (a, b) => Math.hypot(Math.max(0, a[0] - b[0] - b[2], b[0] - a[0] - a[2]), Math.max(0, a[1] - b[1] - b[3], b[1] - a[1] - a[3]));
const MARGIN = 7;
function place(d, others) {
  if (d.place) {
    const [layout, x, y] = d.place;
    return { x, y, c: cluster(d, layout), open: null };
  }
  const p = geo.regions[d.id], M = MARGIN;
  const xs = p.map(q => q[0]), ys = p.map(q => q[1]);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const bridgeEnds = geo.bridges.flatMap(b => b.join.map((id, i) => [id, i ? b.b : b.a]))
    .filter(([id]) => id === d.id).map(([, q]) => q);
  const samples = [];
  for (let y = y0; y <= y1; y += 4) for (let x = x0; x <= x1; x += 4)
    if (inside([x, y], p)) samples.push([x, y, edgeDist([x, y], p)]);
  let best = null;
  for (const layout of ['h', 'v']) {
    const c = cluster(d, layout);
    for (let y = y0; y <= y1 - c.h; y += 3) for (let x = x0; x <= x1 - c.w; x += 3) {
      const r = [x - M, y - M, c.w + 2 * M, c.h + 2 * M];
      if (!rectInside(r, p)) continue;
      if (bridgeEnds.some(o => rectDist(o, r) < 16)) continue;
      let open = 0;
      for (const [sx, sy, de] of samples) open = Math.max(open, Math.min(de, rectDist([sx, sy], r)));
      let score = open - 0.04 * (y - y0) - (layout === 'h' ? 4 : 0);
      for (const o of others) score -= Math.max(0, 60 - rectGap(r, o)) * 0.45;
      if (!best || score > best.score) best = { score, x, y, c, open };
    }
  }
  if (!best) throw new Error('No room for the label in ' + d.id);
  return best;
}
// 'centre': each cluster sits in the middle of its District, as far from every
// border as it can get (Nick's choice, 2026-09-28: cleaner, though pieces will sit
// round it). 'edge': pushed aside to leave the widest open ground for pieces.
const LABEL_PLACEMENT = 'centre';
function centroid(p) {
  let a = 0, cx = 0, cy = 0;
  p.forEach(([x0, y0], i) => {
    const [x1, y1] = p[(i + 1) % p.length], k = x0 * y1 - x1 * y0;
    a += k; cx += (x0 + x1) * k; cy += (y0 + y1) * k;
  });
  return [cx / (3 * a), cy / (3 * a)];
}
function placeCentre(d) {
  if (d.place) {
    const [layout, x, y] = d.place;
    return { x, y, c: cluster(d, layout), open: null };
  }
  const p = geo.regions[d.id], [gx, gy] = centroid(p);
  const xs = p.map(q => q[0]), ys = p.map(q => q[1]);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  // Stacked everywhere, so centred labels all read alike; side by side only if
  // the stack cannot fit.
  let best = null;
  for (const layout of ['v', 'h']) {
    if (best) break;
    const c = cluster(d, layout);
    for (let y = y0; y <= y1 - c.h; y += 2) for (let x = x0; x <= x1 - c.w; x += 2) {
      const r = [x, y, c.w, c.h];
      if (!rectInside([x - 5, y - 5, c.w + 10, c.h + 10], p)) continue;
      const corners = [[x, y], [x + c.w, y], [x + c.w, y + c.h], [x, y + c.h]];
      const clear = Math.min(...p.map(v => rectDist(v, r)), ...corners.map(q => edgeDist(q, p)));
      // widest spot wins; along a strip, the one nearest the District's centre
      const score = clear - 0.05 * Math.hypot(x + c.w / 2 - gx, y + c.h / 2 - gy);
      if (!best || score > best.score) best = { score, x, y, c, open: clear };
    }
  }
  if (!best) throw new Error('No room for the label in ' + d.id);
  return best;
}
function placeAll() {
  if (LABEL_PLACEMENT === 'centre') return Object.fromEntries(DISTRICTS.map(d => [d.id, placeCentre(d)]));
  const box = ({ x, y, c }) => [x - MARGIN, y - MARGIN, c.w + 2 * MARGIN, c.h + 2 * MARGIN];
  let placed = Object.fromEntries(DISTRICTS.map(d => [d.id, place(d, [])]));
  for (let pass = 0; pass < 3; pass++) {
    for (const d of DISTRICTS) {
      const others = DISTRICTS.filter(o => o.id !== d.id).map(o => box(placed[o.id]));
      placed[d.id] = place(d, others);
    }
  }
  return placed;
}

// ---------------------------------------------------------------- map layers
function inset(p, dist) {
  // Offset a simple polygon inward by dist (miter joins); short edges dropped first.
  const q = p.filter((a, i) => Math.hypot(a[0] - p[(i + 1) % p.length][0], a[1] - p[(i + 1) % p.length][1]) > 6);
  const area = q.reduce((s, a, i) => s + a[0] * q[(i + 1) % q.length][1] - q[(i + 1) % q.length][0] * a[1], 0);
  const sgn = area > 0 ? 1 : -1;
  const lines = q.map((a, i) => {
    const b = q[(i + 1) % q.length], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy);
    const nx = -dy / L * sgn, ny = dx / L * sgn;
    return [[a[0] + nx * dist, a[1] + ny * dist], [b[0] + nx * dist, b[1] + ny * dist]];
  });
  return lines.map((l, i) => {
    const [[x1, y1], [x2, y2]] = lines[(i - 1 + lines.length) % lines.length], [[x3, y3], [x4, y4]] = l;
    const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (Math.abs(den) < 1e-9) return l[0];
    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
    return [x1 + t * (x2 - x1), y1 + t * (y2 - y1)];
  });
}

function waterLining() {
  // Engraved coast rings: alternate gold and sea strokes, widest first, under the land.
  const land = [...DISTRICTS.map(d => geo.regions[d.id]), ...OFFBOARD.map(k => geo.regions[k])];
  const bg = C.sea[1];
  const rings = [[22, C.goldLine, 0.06], [18.5, bg, 1], [13.5, C.goldLine, 0.09], [10.5, bg, 1], [6.5, C.goldLine, 0.15], [4, bg, 1]];
  return rings.map(([w, col, op]) =>
    `<g fill="none" stroke="${col}" stroke-opacity="${op}" stroke-width="${w}" stroke-linejoin="round">${land.map(q => `<path d="${poly(q)}"/>`).join('')}</g>`).join('');
}

function districtFills(placed) {
  let s = '';
  for (const d of DISTRICTS) {
    const p = geo.regions[d.id];
    s += `<clipPath id="clip-${d.id}"><path d="${poly(p)}"/></clipPath>`;
    s += `<path d="${poly(p)}" fill="url(#fill-${d.boro})"/>`;
    if (TOOLING[d.zone]) s += `<path d="${poly(p)}" fill="url(#tool-${d.zone})"/>`;
    if (d.zone === 'hs') {
      // High Society: a gold sunburst from the crown, and a keyline inside the border.
      const [cx, cy] = placed[d.id].c.roundelAt(placed[d.id].x, placed[d.id].y);
      let rays = '';
      for (let a = 0; a < 360; a += 7.5) {
        const t = a * Math.PI / 180;
        rays += `M${f(cx)} ${f(cy)} L${f(cx + Math.cos(t) * 320)} ${f(cy + Math.sin(t) * 320)} `;
      }
      s += `<g clip-path="url(#clip-${d.id})"><path d="${rays}" stroke="${C.goldBright}" stroke-opacity=".1" stroke-width="2.2"/>`
        + `<circle cx="${f(cx)}" cy="${f(cy)}" r="120" fill="url(#glow)"/></g>`;
      s += `<path d="${poly(inset(p, 5.5))}" fill="none" stroke="${C.gold}" stroke-opacity=".75" stroke-width="1.1"/>`;
    }
    s += `<g clip-path="url(#clip-${d.id})"><path d="${poly(p)}" fill="none" stroke="#000" stroke-opacity=".5" stroke-width="15" filter="url(#soft)"/></g>`;
  }
  return s;
}

function borders() {
  // Coasts heaviest, then Borough lines over land, then District lines.
  const coast = [], boro = [], inner = [], off = [];
  const boroOf = id => (byId[id] ? byId[id].boro : null);
  for (const c of geo.chains) {
    const [a, b] = c.sides, ba = boroOf(a), bb = boroOf(b);
    if (ba && bb) (ba === bb ? inner : boro).push(c.pts);
    else if (ba || bb) coast.push(c.pts);
    else if ([a, b].includes('water')) off.push(c.pts);
  }
  const line = (list, w, col, op = 1) => `<g fill="none" stroke="${col}" stroke-opacity="${op}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round">${list.map(q => `<polyline points="${pts(q)}"/>`).join('')}</g>`;
  return line(off, 1.4, C.goldDim, 0.5)
    + line(inner, 1.2, C.goldLine, 0.85)
    + line(boro, 2.6, C.gold)
    + line(coast, 3.2, C.gold)
    + line(coast, 0.7, '#f3dc95', 0.5);
}

// Plan view of a suspension bridge: railed deck, cables along both sides over two
// towers, splayed abutments on each shore, and a shadow on the water.
function bridgeGlyph(a, b, ext = 6, k = 1) { // k scales the width, for the key
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
  const len = L + 2 * ext, A = [a[0] - ux * ext, a[1] - uy * ext], HW = 3.4 * k;
  const P = (d, w) => `${f(A[0] + ux * d + nx * w)} ${f(A[1] + uy * d + ny * w)}`; // d along, w across
  const quad = (d0, d1, w0, w1) => `M${P(d0, -w0)} L${P(d1, -w1)} L${P(d1, w1)} L${P(d0, w0)} Z`;
  const line = (d0, d1, w) => `M${P(d0, w)} L${P(d1, w)}`;
  let s = k < 1 ? '' : `<path d="${quad(4, len - 4, HW + 3, HW + 3)}" transform="translate(1.4 2.4)" fill="#000" fill-opacity=".5" filter="url(#blur2)"/>`;
  s += `<path d="${quad(0, 8 * k, HW + 3.4 * k, HW)} ${quad(len - 8 * k, len, HW, HW + 3.4 * k)}" fill="${C.goldDeep}" stroke="${C.gold}" stroke-width=".8"/>`;
  s += `<path d="${quad(5, len - 5, HW, HW)}" fill="#1c140c"/>`;
  s += `<path d="${line(5, len - 5, 0)}" stroke="${C.goldDim}" stroke-opacity=".3" stroke-width="${2 * HW - 1.6}" stroke-dasharray=".8 1.7"/>`;
  s += `<path d="${line(1.5, len - 1.5, HW)} ${line(1.5, len - 1.5, -HW)}" stroke="${C.gold}" stroke-width="1.1"/>`;
  s += `<path d="${line(3, len - 3, HW + 2 * k)} ${line(3, len - 3, -(HW + 2 * k))}" stroke="${C.goldBright}" stroke-opacity=".85" stroke-width=".6"/>`;
  for (const d of [len * 0.3, len * 0.7]) s += `<path d="${quad(d - 1.7 * k, d + 1.7 * k, HW + 3.6 * k, HW + 3.6 * k)}" fill="${C.goldBright}" stroke="${C.shadow}" stroke-width=".7"/>`;
  return `<g>${s}</g>`;
}
function bridges() {
  return geo.bridges.map(({ a, b }) => bridgeGlyph(a, b)).join('');
}

function mapLabels() {
  let s = '';
  for (const [k, [x, y, r]] of Object.entries(BORO_LABELS)) {
    const b = BOROUGHS[k], t = upper(b.name);
    const total = 22 + 9 + width(TYPE.boro, t), left = -total / 2;
    s += `<g transform="translate(${f(x)} ${f(y)}) rotate(${r})">`
      + `<rect x="${f(left)}" y="-11" width="22" height="22" rx="3" fill="${C.gold}" stroke="${C.shadow}" stroke-width="1.2"/>`
      + text(String(b.n), left + 11, 0, { family: 'Cinzel', weight: 700, size: 16, spacing: 0 }, { fill: '#1b150e', anchor: 'middle', middle: true })
      + text(t, left + 31, 0, TYPE.boro, { fill: C.gold, halo: 3, middle: true }) + `</g>`;
  }
  for (const [t, x, y, r] of WATER_LABELS) s += text(t, x, y, TYPE.water, { fill: C.goldDim, anchor: 'middle', rotate: r, opacity: 0.85, middle: true });
  for (const [t, x, y, r] of LAND_LABELS) s += text(t, x, y, TYPE.land, { fill: '#8d826c', anchor: 'middle', rotate: r, opacity: 0.8, middle: true });
  return s;
}

// ---------------------------------------------------------------- side panels
// Saddle stitching: the leather's seams. About 2.8 mm stitches at 24in.
const stitch = d => `<path d="${d}" fill="none" stroke="#000" stroke-opacity=".45" stroke-width="1.3" stroke-dasharray="5 3" stroke-linecap="round" transform="translate(.5 .7)"/>`
  + `<path d="${d}" fill="none" stroke="#d9c69c" stroke-opacity=".6" stroke-width="1.1" stroke-dasharray="5 3" stroke-linecap="round"/>`;

// A panel's leather ground: gilt edge, stitched inside it. Its contents are drawn
// separately, above the texture, so the type stays crisp.
function panel(x, y, w, h) {
  const c = 7; // Deco chamfer
  const outline = i => `M${x + c + i} ${y + i} H${x + w - c - i} L${x + w - i} ${y + c + i} V${y + h - c - i} L${x + w - c - i} ${y + h - i} H${x + c + i} L${x + i} ${y + h - c - i} V${y + c + i} Z`;
  return `<path d="${outline(0)}" fill="url(#panel)" stroke="${C.goldLine}" stroke-width="1.8"/>` + stitch(outline(4.5));
}

// Heat Track: five poker-chip sockets, the Ledger's own size (39 mm sockets 2 mm
// apart in a tray padded 6 mm), numbered left to right so a Raid's "furthest
// right on the Heat Track" reads straight off it. The 5th Heat sets off a Raid.
// It sits in a corner cut out of the map: the frame steps in around it (see
// frame()), so no coastline runs under it. Sockets look like the Ledger's; only
// the numerals warm from gold towards rust as the Heat climbs.
const FRAME_OUT = 7, FRAME_IN = 13;
const HEAT = (() => {
  const d = 39 * MM, gap = 2 * MM, padX = 6 * MM, padY = 4 * MM, m = 7;
  const trayW = 5 * d + 4 * gap + 2 * padX, trayH = d + 2 * padY;
  const tx = FRAME_IN + m, ty = FRAME_IN + 24;
  const inner = [tx + trayW + m, ty + trayH + m]; // the corner's inner hairline
  return { d, gap, padX, trayW, trayH, tx, ty, edge: [inner[0] + 6, inner[1] + 6] };
})();
const HEAT_NUM = ['#9c8650', '#a37b4b', '#a86f46', '#aa6241', '#ad533b'];
const HEAT_TINT = [0, 0.03, 0.05, 0.07, 0.1];
function heatTrack() {
  const { d, gap, padX, trayW, trayH, tx, ty, edge: [ex, ey] } = HEAT;
  const a = (FRAME_OUT + FRAME_IN) / 2;
  const bg = `<path d="M0 0 H${f(ex)} V${f(ey)} H0 Z" fill="url(#panel)"/>` + stitch(`M${a} ${a} H${f(ex - 3.4)} V${f(ey - 3.4)} H${a} Z`);
  let s = text('HEAT', tx + trayW / 2, FRAME_IN + 12, TYPE.panelHead, { fill: C.goldBright, anchor: 'middle', middle: true });
  s += `<rect x="${f(tx)}" y="${f(ty)}" width="${f(trayW)}" height="${f(trayH)}" rx="${f(trayH / 2)}" fill="#000" fill-opacity=".35" stroke="#6b5a2e" stroke-opacity=".4" stroke-width="1"/>`;
  for (let i = 0; i < 5; i++) {
    const cx = tx + padX + d / 2 + i * (d + gap), cy = ty + trayH / 2, raid = i === 4;
    s += `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(d / 2)}" fill="url(#socket)"/>`
      + (HEAT_TINT[i] ? `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(d / 2)}" fill="#b0503a" fill-opacity="${HEAT_TINT[i]}"/>` : '')
      + `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(d / 2 - 1)}" fill="none" stroke="${raid ? '#8a4a36' : '#7a6a3a'}" stroke-width="2"/>`
      + text(String(i + 1), cx, cy - (raid ? 5 : 0), { family: 'Cinzel', weight: 700, size: 28, spacing: 0 }, { fill: HEAT_NUM[i], anchor: 'middle', middle: true });
    if (raid) s += text('RAID', cx + 1, cy + 19, TYPE.small, { fill: '#b8674d', anchor: 'middle', middle: true });
  }
  return { bg, fg: s };
}

// The Mash die's square, 24 mm so any usual die sits inside it.
function mash(x, y) {
  const side = 24 * MM, w = side + 28, h = side + 32;
  return {
    bg: panel(x, y, w, h),
    fg: text('MASH', x + w / 2, y + 14, TYPE.panelHead, { fill: C.goldBright, anchor: 'middle', middle: true })
      + `<rect x="${f(x + 14)}" y="${f(y + 24)}" width="${f(side)}" height="${f(side)}" rx="6" fill="#100b07" stroke="${C.gold}" stroke-width="1.6" stroke-dasharray="4 3"/>`,
  };
}

// The marks as they appear on the map; prices worded as the Town Planner's legend.
const KEY_ROWS = [
  ['speak', 'Speakeasy', 'Moonshine $300, Rum $500'],
  ['hs', 'High Society', 'Rum only, 1 Kickback each'],
  ['ward', 'Ward', ''],
  ['dock', 'Dock', 'Water Connected to every Dock'],
  ['bridge', 'Bridge', 'Land Connected'],
  ['still', 'Still', 'Pressure: the lit cells'],
  ['setup', 'Setup', 'Where the pieces start'],
];
function key(x, y) {
  const rows = KEY_ROWS.filter(([k]) => k !== 'setup' || SHOW_SETUP);
  const headW = Math.max(...rows.map(([, t]) => width(TYPE.keyHead, upper(t))));
  const subX = 28 + headW + 9, subW = Math.max(...rows.map(([, , t]) => (t ? width(TYPE.keyText, t) : 0)));
  const w = subX + subW + 11, h = 13 + (rows.length - 1) * 14 + 4 + 13;
  let s = '';
  rows.forEach(([k, t, sub], i) => {
    const cy = y + 13 + i * 14 + (i > 0 ? 4 : 0), ix = x + 15; // headroom for the crown
    if (k === 'bridge') s += bridgeGlyph([ix - 7, cy], [ix + 7, cy], 1.5, 0.45);
    else if (k === 'still') s += still(7, ix - 5.5, cy - 6.8, 13.6);
    else if (k === 'setup') s += tray(['runner'], ix - trayWidth(['runner']) / 2, cy);
    else s += roundel(k, ix, cy, 5.6);
    s += text(upper(t), x + 28, cy, TYPE.keyHead, { fill: k === 'hs' ? C.goldBright : C.ink, middle: true });
    if (sub) s += text(sub, x + subX, cy, TYPE.keyText, { fill: C.body, middle: true });
  });
  return { bg: panel(x, y, w, h), fg: s, w, h };
}

function sidePanels() {
  const y = HEAT.edge[1] + 12, k = key(HEAT.tx, y), heat = heatTrack(), m = mash(HEAT.tx + k.w + 10, y);
  return { bg: heat.bg + k.bg + m.bg, fg: heat.fg + k.fg + m.fg };
}

// The seam round the board, between the gilt edge and the hairline, stepping in
// round the Heat corner (whose own seam is stitched with its ground).
function seams() {
  const W = 1080, a = (FRAME_OUT + FRAME_IN) / 2, [ex, ey] = HEAT.edge.map(v => f(v));
  return stitch(`M${ex + 3.4} ${a} H${W - a} V${W - a} H${a} V${ey + 3.4} H${ex + 3.4} Z`);
}

function title() {
  // The map's title block: the city and the year, between Deco rules.
  const cx = 116, cy = 305;
  const cityW = width(TYPE.titleCity, 'NEW YORK'), yearW = width(TYPE.titleYear, '1929');
  const rule = (y, gap) => `<path d="M${f(cx - cityW / 2)} ${y} H${f(cx - gap)} M${f(cx + gap)} ${y} H${f(cx + cityW / 2)}" stroke="${C.gold}" stroke-width="1"/>`;
  const diamond = (x, y, r) => `<path d="M${f(x)} ${f(y - r)} L${f(x + r)} ${f(y)} L${f(x)} ${f(y + r)} L${f(x - r)} ${f(y)} Z" fill="${C.goldBright}"/>`;
  let s = rule(cy - 27, 9) + diamond(cx, cy - 27, 3.6);
  s += text('NEW YORK', cx + 2.2, cy - 5, TYPE.titleCity, { fill: C.goldBright, anchor: 'middle', halo: 3.4, middle: true });
  s += rule(cy + 20, yearW / 2 + 10);
  s += text('1929', cx + 4, cy + 20, TYPE.titleYear, { fill: C.gold, anchor: 'middle', halo: 3, middle: true });
  return s;
}

function northArrow() {
  // A drawn north line: hairline, arrowhead and N, nothing more.
  const x = 116, top = 362, foot = 414;
  return `<path d="M${x} ${foot} V${top + 9}" stroke="${C.goldDim}" stroke-width="1.1"/>`
    + `<path d="M${x} ${top} L${x + 4.2} ${top + 12} L${x} ${top + 9} L${x - 4.2} ${top + 12} Z" fill="${C.goldDim}"/>`
    + `<path d="M${x - 3.5} ${foot} H${x + 3.5}" stroke="${C.goldDim}" stroke-width="1.1"/>`
    + text('N', x, top - 9, { family: 'Cinzel', weight: 700, size: 11, spacing: 0 }, { fill: C.goldDim, anchor: 'middle', middle: true });
}

function frame() {
  // The gold edge, stepping in around the Heat corner; the hairline inside it
  // follows, with a Deco step at each corner.
  const o = FRAME_OUT, i = FRAME_IN, W = 1080, st = 10, [ex, ey] = HEAT.edge.map(v => f(v));
  const hair = d => `<path d="${d}" fill="none" stroke="${C.goldLine}" stroke-opacity=".8" stroke-width="1"/>`;
  const diamond = (x, y, r) => `<rect x="${f(x - r)}" y="${f(y - r)}" width="${2 * r}" height="${2 * r}" transform="rotate(45 ${f(x)} ${f(y)})" fill="${C.goldBright}"/>`;
  let s = `<path d="M0 0H${W}V${W}H0Z M${o} ${o}V${W - o}H${W - o}V${o}Z" fill="#0b0907" fill-rule="evenodd"/>`;
  s += `<rect x="${o}" y="${o}" width="${W - 2 * o}" height="${W - 2 * o}" fill="none" stroke="${C.gold}" stroke-width="3"/>`;
  s += `<path d="M${ex} ${o} V${ey} H${o}" fill="none" stroke="${C.gold}" stroke-width="3"/>`;
  s += hair(`M${ex + 6} ${i} H${W - i - st} V${i + st} H${W - i} V${W - i - st} H${W - i - st} V${W - i} H${i + st} V${W - i - st} H${i} V${ey + 6} H${ex + 6} Z`);
  s += hair(`M${i + st} ${i} H${ex - 6} V${ey - 6} H${i} V${i + st} H${i + st} Z`);
  for (const [x, y] of [[o, o], [W - o, o], [o, W - o], [W - o, W - o]]) s += diamond(x, y, 3.5);
  s += diamond(ex, ey, 3.5);
  return s;
}

// ---------------------------------------------------------------- defs
function defs(fontCss, mode) {
  let s = `<style>${fontCss}</style>`;
  for (const [k, b] of Object.entries(BOROUGHS))
    s += `<radialGradient id="fill-${k}" cx=".45" cy=".4" r=".8"><stop offset="0" stop-color="${b.fill[0]}"/><stop offset="1" stop-color="${b.fill[1]}"/></radialGradient>`;
  s += `<radialGradient id="glow"><stop offset="0" stop-color="${C.goldBright}" stop-opacity=".16"/><stop offset="1" stop-color="${C.goldBright}" stop-opacity="0"/></radialGradient>`;
  s += `<radialGradient id="moon" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#fbf4dc"/><stop offset=".7" stop-color="#ddd3b2"/><stop offset="1" stop-color="#a99c78"/></radialGradient>`;
  s += `<radialGradient id="socket"><stop offset="0" stop-color="${C.panelA}"/><stop offset="1" stop-color="#000"/></radialGradient>`;
  s += `<linearGradient id="panel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.panelA}"/><stop offset="1" stop-color="${C.panelB}"/></linearGradient>`;
  s += `<radialGradient id="sea" cx=".55" cy=".5" r=".75"><stop offset="0" stop-color="${C.sea[0]}"/><stop offset="1" stop-color="${C.sea[1]}"/></radialGradient>`;
  for (const [zone, t] of Object.entries(TOOLING)) s += tooling(zone, t, LEATHER[mode].tooling);
  s += `<pattern id="offboard" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="${C.offboard}"/><line x1="0" y1="0" x2="0" y2="6" stroke="#000" stroke-opacity=".22" stroke-width="1.6"/></pattern>`;
  s += `<filter id="soft" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="4.5"/></filter>`;
  s += `<filter id="blur2" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.6"/></filter>`;
  s += leatherFilter('leather', LEATHER[mode].board) + leatherFilter('leatherFine', LEATHER[mode].fine);
  return `<defs>${s}</defs>`;
}

// ---------------------------------------------------------------- tooling
// Each District type carries a faint pattern pressed into the leather, like blind
// tooling: a dark groove with a catch of light below it. The Borough colour stays
// untouched (Raids and Squads work by Borough); the pattern is a second, quieter
// cue for the type. High Society needs none: it has its sunburst.
// [tile width, tile height, groove path]; units, so about 10 mm tiles at 24in.
const TOOLING = {
  dock: [18, 9, 'M0 4.5 C3 2 6 2 9 4.5 S15 7 18 4.5'], // harbour waves
  ward: [24, 12, 'M0 .5 H24 M0 6.5 H24 M6 .5 V6.5 M18 6.5 V12.5'], // running-bond brick
  speak: [16, 8, 'M0 8 A8 8 0 0 1 16 8 M-8 0 A8 8 0 0 1 8 0 M8 0 A8 8 0 0 1 24 0'], // Deco fish scales
};
// depth: groove opacity, set per build in LEATHER (lighter in print, which is seen up close).
function tooling(zone, [w, h, d], depth) {
  return `<pattern id="tool-${zone}" width="${w}" height="${h}" patternUnits="userSpaceOnUse">`
    + `<path d="${d}" fill="none" stroke="#f3dc95" stroke-opacity="${f(depth * 0.3, 3)}" stroke-width=".7" transform="translate(.5 .7)"/>`
    + `<path d="${d}" fill="none" stroke="#000" stroke-opacity="${depth}" stroke-width=".9"/></pattern>`;
}

// ---------------------------------------------------------------- leather
// All procedural, so it prints crisp at any size. The pebble grain is single-octave
// crease patterns multiplied, so their crossings close off irregular cells (one
// pattern alone draws worm-like squiggles at print scale); blurred to round the
// pebbles, over soft wrinkles. It is lit for shading, soft-light blended onto the
// art, given a sheen on the raised grain, then mottled like uneven dye.
// board: the hide, pebbles 2 to 3 mm across at 24in. fine: the panels, a finer,
// flatter skin stitched on like a patch. The screen presets drop the pebbles.
const LEATHER = {
  print: {
    tooling: 0.17,
    board: { creases: [[0.1, 4], [0.13, 17], [0.17, 29]], blur: 0.45, pebble: 0.6, wrinkle: [0.016, 0.6], relief: 1.7, depth: 0.6, sheen: 0.15, dye: 0.3 },
    fine: { creases: [[0.3, 5], [0.38, 18], [0.48, 30]], blur: 0.22, pebble: 0.7, wrinkle: [0.03, 0.2], relief: 0.9, depth: 0.4, sheen: 0.08, dye: 0.12 },
  },
  screen: {
    tooling: 0.26,
    board: { creases: [], wrinkle: [0.012, 1], relief: 1.4, depth: 0.35, sheen: 0.05, dye: 0.25 },
    fine: { creases: [], wrinkle: [0.03, 1], relief: 0.8, depth: 0.2, sheen: 0, dye: 0.08 },
  },
};
function leatherFilter(id, o) {
  const grey = slope => ['R', 'G', 'B'].map(ch => `<feFunc${ch} type="linear" slope="${slope}" intercept="${f(0.5 - 0.743 * slope, 3)}"/>`).join('');
  const light = '<feDistantLight azimuth="225" elevation="48"/>';
  const crease = (freq, seed, name) => `<feTurbulence type="turbulence" baseFrequency="${freq}" numOctaves="1" seed="${seed}" result="${name}t"/>`
    + `<feColorMatrix in="${name}t" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -1.6 0 0 0 1.05" result="${name}"/>`;
  let s = `<filter id="${id}" x="0" y="0" width="1080" height="1080" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">`
    + `<feTurbulence type="fractalNoise" baseFrequency="${o.wrinkle[0]}" numOctaves="3" seed="9" result="wr"/>`
    + `<feColorMatrix in="wr" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  ${o.wrinkle[1]} 0 0 0 0" result="wrinkles"/>`;
  let height = 'wrinkles';
  if (o.creases.length) {
    o.creases.forEach(([freq, seed], i) => { s += crease(freq, seed, `c${i}`); });
    let cells = 'c0';
    for (let i = 1; i < o.creases.length; i++) { s += `<feComposite in="${cells}" in2="c${i}" operator="arithmetic" k1="1" result="m${i}"/>`; cells = `m${i}`; }
    s += `<feGaussianBlur in="${cells}" stdDeviation="${o.blur}" result="pebbles"/>`
      + `<feComposite in="pebbles" in2="wrinkles" operator="arithmetic" k2="${o.pebble}" k3="1" result="height"/>`;
    height = 'height';
  }
  s += `<feDiffuseLighting in="${height}" surfaceScale="${o.relief}" diffuseConstant="1" lighting-color="#fff" result="lit">${light}</feDiffuseLighting>`
    + `<feComponentTransfer in="lit" result="shade">${grey(o.depth)}</feComponentTransfer>`
    + `<feBlend in="shade" in2="SourceGraphic" mode="soft-light" result="sheen"/>`;
  if (o.sheen) {
    s += `<feSpecularLighting in="${height}" surfaceScale="${o.relief}" specularConstant=".55" specularExponent="16" lighting-color="#f1dfb8" result="spec">${light}</feSpecularLighting>`
      + `<feComposite in="sheen" in2="spec" operator="arithmetic" k2="1" k3="${o.sheen}" result="sheen2"/>`;
  }
  const top = 1 - o.dye * 0.73;
  return s + `<feTurbulence type="fractalNoise" baseFrequency=".006" numOctaves="2" seed="21" result="mot"/>`
    + `<feColorMatrix in="mot" type="matrix" values="${o.dye} 0 0 0 ${f(top, 3)}  ${o.dye} 0 0 0 ${f(top, 3)}  ${o.dye} 0 0 0 ${f(top, 3)}  0 0 0 0 1" result="dye"/>`
    + `<feBlend in="dye" in2="${o.sheen ? 'sheen2' : 'sheen'}" mode="multiply" result="hide"/>`
    // the lighting is opaque across the whole region, so keep only what lies on the art
    + `<feComposite in="hide" in2="SourceAlpha" operator="in"/></filter>`;
}

// ---------------------------------------------------------------- assemble
function allText() {
  const items = [];
  const add = (spec, t) => items.push({ ...spec, text: t });
  for (const d of DISTRICTS) {
    (d.lines || [d.name]).forEach(n => add(TYPE.name, upper(n)));
    if (d.venue) add(TYPE.venue, d.venue);
  }
  for (const b of Object.values(BOROUGHS)) add(TYPE.boro, upper(b.name));
  for (const [, t, sub] of KEY_ROWS) { add(TYPE.keyHead, upper(t)); if (sub) add(TYPE.keyText, sub); }
  add(TYPE.titleCity, 'NEW YORK');
  add(TYPE.titleYear, '1929');
  return items;
}

function buildSvg(fontCss, mode, placed) {
  const art = `<rect width="1080" height="1080" fill="url(#sea)"/>` + waterLining()
    + OFFBOARD.map(k => `<path d="${poly(geo.regions[k])}" fill="url(#offboard)"/>`).join('')
    + districtFills(placed) + borders() + bridges();
  const labels = DISTRICTS.map(d => placed[d.id].c.draw(placed[d.id].x, placed[d.id].y)).join('');
  const side = sidePanels();
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" width="1080" height="1080">`
    + `<title>Moonshine Kingdom: the City Map</title>`
    + defs(fontCss, mode)
    + `<g id="map" filter="url(#leather)">${art}${seams()}</g>`
    + `<g id="panel-grounds" filter="url(#leatherFine)">${side.bg}</g>`
    + `<g id="labels">${mapLabels()}${labels}</g>`
    + `<g id="panels">${side.fg}${title()}${northArrow()}</g>`
    + `<g id="frame">${frame()}</g>`
    + `</svg>\n`;
}

// Latin subset only, inlined as data URIs so the SVG renders the same in any
// browser, offline included. All four families are OFL.
async function embeddedFonts(browser) {
  const ctx = await browser.newContext();
  const get = async (url) => {
    const res = await ctx.request.get(url);
    if (!res.ok()) throw new Error(`Font fetch failed (${res.status()}): ${url}`);
    return res;
  };
  const out = [];
  const css = await (await get(FONTS)).text();
  for (const block of css.match(/\/\* latin \*\/\s*@font-face\s*\{[^}]*\}/g) || []) {
    const src = block.match(/url\(([^)]+)\)/)[1];
    const b64 = (await (await get(src)).body()).toString('base64');
    out.push(block.replace(/\/\* latin \*\/\s*/, '').replace(src, 'data:font/woff2;base64,' + b64));
  }
  await ctx.close();
  if (!out.length) throw new Error('No fonts came back from Google Fonts');
  return out.join('\n');
}

// Real advance widths from the browser, so clusters and labels are sized exactly.
async function measure(browser, fontCss, items) {
  const page = await browser.newPage();
  await page.setContent(`<!doctype html><html><head><style>${fontCss}</style></head><body><svg id="m" width="10" height="10"></svg></body></html>`);
  const widths = await page.evaluate(async (list) => {
    await Promise.all(list.map(i => document.fonts.load(`${i.italic ? 'italic ' : ''}${i.weight} ${i.size}px "${i.family}"`)));
    const svg = document.getElementById('m');
    return list.map(i => {
      const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      t.setAttribute('font-family', i.family); t.setAttribute('font-weight', i.weight);
      t.setAttribute('font-size', i.size); t.setAttribute('letter-spacing', i.spacing);
      if (i.italic) t.setAttribute('font-style', 'italic');
      t.textContent = i.text; svg.appendChild(t);
      const w = t.getComputedTextLength(); t.remove();
      return w;
    });
  }, items);
  await page.close();
  return new Map(items.map((i, k) => [wkey(i, i.text), widths[k]]));
}

async function render(browser, outputs) {
  for (const [file, scale, svg] of outputs) {
    const page = await browser.newPage({ viewport: { width: 1080, height: 1080 }, deviceScaleFactor: scale });
    await page.setContent(`<!doctype html><html><body style="margin:0;background:#000">${svg}</body></html>`);
    await page.evaluate(async () => { await document.fonts.ready; });
    await page.screenshot({ path: file, clip: { x: 0, y: 0, width: 1080, height: 1080 }, ...(file.endsWith('.jpg') ? { quality: 90 } : {}) });
    await page.close();
    console.log('wrote', path.relative(ROOT, file));
  }
}

(async () => {
  const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
  // Chromium ignores HTTPS_PROXY, so pass it on where one is set (cloud sandboxes).
  const browser = await chromium.launch(process.env.HTTPS_PROXY ? { proxy: { server: process.env.HTTPS_PROXY } } : {});
  const fontCss = await embeddedFonts(browser);
  WIDTHS = await measure(browser, fontCss, allText());
  const placed = placeAll();
  for (const d of DISTRICTS) {
    const { x, y, c, open } = placed[d.id];
    console.log(`  ${d.id.padEnd(15)} ${c.layout} at ${f(x, 0)},${f(y, 0)}  ${LABEL_PLACEMENT === 'centre' ? 'clearance' : 'open ground'} ${open === null ? 'pinned' : f(open, 0)}`);
  }
  const print = buildSvg(fontCss, 'print', placed), screen = buildSvg(fontCss, 'screen', placed);
  for (const [file, svg] of [[OUT.printSvg, print], [OUT.screenSvg, screen]]) {
    fs.writeFileSync(file, svg);
    console.log('wrote', path.relative(ROOT, file));
  }
  const outputs = [[OUT.screenJpg, 2, screen], [OUT.printJpg, 2, print]];
  if (process.argv.includes('--print')) outputs.push([OUT.printPng, 7200 / 1080, print]);
  await render(browser, outputs);
  await browser.close();
})();
