#!/usr/bin/env node
// Builds the game board as a vector SVG from Art/Board/board-geometry.json (the drafted
// map, written by tools/draft_board.js) and the District Roster below, then renders it
// through Playwright's Chromium.
//
//   node tools/build_board.js           print and screen SVGs, 2160px previews of each, and
//                                       the index page's tile (Art/Index/board.jpg)
//   node tools/build_board.js --print   also the files to open or send without an SVG
//                                       editor (not committed): a 24in PDF at 300dpi, the
//                                       7280px PNG it is made from (the bleed included), and a
//                                       4320px screen JPEG
//   --report=<file>                     also each District's sign, room and sign shapes as
//                                       JSON, for tuning the drafting's settings
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
// Each District carries a hanging sign (placeSign): its type's medallion, name and
// venue on a small plaque hung from the border above, with the Still on a plate
// bolted to it, placed automatically as high as it fits.

const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIR = path.join(ROOT, 'Art', 'Board');
const arg = k => (process.argv.find(a => a.startsWith(`--${k}=`)) || '').slice(k.length + 3);
const OUT = {
  printSvg: path.join(DIR, 'Board v0.9.svg'), screenSvg: path.join(DIR, 'Board v0.9 (screen).svg'),
  screenJpg: path.join(DIR, 'Board v0.9 (screen).jpg'), printJpg: path.join(DIR, 'Board v0.9 (print preview).jpg'),
  printPng: path.join(DIR, 'Board v0.9 (print).png'), printPdf: path.join(DIR, 'Board v0.9 (print).pdf'),
  screenLarge: path.join(DIR, 'Board v0.9 (screen, large).jpg'),
  indexTile: path.join(ROOT, 'Art', 'Index', 'board.jpg'),
};
// The index tile: 800 x 450 like its neighbours, cropped on the Queensboro and Williamsburg
// Bridges and two crown rooms. [x, y, width] in board units; the height follows at 16:9.
const TILE_CROP = [366, 372, 672]; // 672 x 378 scales to exactly 800 x 450
const geo = JSON.parse(fs.readFileSync(path.join(DIR, 'board-geometry.json'), 'utf8'));
const BOARD_IN = 24, BOARD_MM = BOARD_IN * 25.4, MM = 1080 / BOARD_MM; // 24in square
const BOARD_PX = BOARD_IN * 300; // print render: 300dpi
// Bleed: the print master, its PNG and its PDF carry the frame's black this far past the
// trim on every side, for the printer's cut (6 units, 3.4 mm; a printer's own template
// wins). 0 to 1080 stays the 24in trim; the screen build and the previews stop at it.
const BLEED = 6;
const FRAME_OUT = 7, FRAME_IN = 13; // the frame's gold edge and its hairline

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
  QN: { n: 3, name: 'Queens', fill: ['#4a3857', '#31253a'] },
  BK: { n: 4, name: 'Brooklyn', fill: ['#5a4630', '#3d2f1f'] },
  SI: { n: 5, name: 'Staten Island', fill: ['#3b3935', '#282623'] },
};
// One colour per Borough, so the Borough reads first (Raids and Squads work by
// Borough). The types are told apart by drawing: Speakeasies by an inset gold keyline
// with a diamond at each corner, High Society by a double keyline with a Deco fan in
// each corner (decoFrame), Docks by a dash-dot line inside the edge (dockMark) and their piers, Wards by an engraved band of gold
// hatching inside the edge, closed by a keyline (wardMark). The band is drawn, not
// shaded, so the Ward sits flat; a feathered dark band made it look sunk.
const WARD_HATCH = { band: 13, pitch: 5, line: 1.1, gold: 0.32, shade: 0.18 };

// Print lift: dark tones print darker than they look on a screen (ink spreads on the paper),
// so the print build lightens the land, the water and New Jersey, and eases the Ward hatching's shade.
// A starting point, not a measured profile: judge it from a printed proof strip.
const PRINT_LIFT = { light: 1.13, sat: 1.1, wardShade: 0.14 };
let MODE = 'screen'; // set by buildSvg
function lift(hex) {
  if (MODE !== 'print') return hex;
  let [r, g, b] = [1, 3, 5].map(i => parseInt(hex.substr(i, 2), 16) / 255);
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l0 = (mx + mn) / 2, d = mx - mn;
  let h = 0, s0 = d ? d / (1 - Math.abs(2 * l0 - 1)) : 0;
  if (d) h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  const l = Math.min(1, l0 * PRINT_LIFT.light), sa = Math.min(1, s0 * PRINT_LIFT.sat);
  const c = (1 - Math.abs(2 * l - 1)) * sa, x = c * (1 - Math.abs(((h % 6) + 6) % 6 % 2 - 1)), m = l - c / 2;
  const hh = ((h % 6) + 6) % 6;
  const [r1, g1, b1] = hh < 1 ? [c, x, 0] : hh < 2 ? [x, c, 0] : hh < 3 ? [0, c, x] : hh < 4 ? [0, x, c] : hh < 5 ? [x, 0, c] : [c, 0, x];
  return '#' + [r1, g1, b1].map(v => Math.round((v + m) * 255).toString(16).padStart(2, '0')).join('');
}
const fillId = d => `fill-${d.boro}`;

// ---------------------------------------------------------------- roster
// setup: the Town Planner's Setup column (kept for parity; the board doesn't draw it).
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
  { id: 'sheepshead_bay', name: 'Canarsie', boro: 'BK', zone: 'dock', still: 4, setup: 'runners' },
  { id: 'stapleton', name: 'Stapleton', boro: 'SI', zone: 'ward', still: 8 },
  { id: 'westerleigh', name: 'Westerleigh', boro: 'SI', zone: 'dock', still: 2 },
  { id: 'tottenville', name: 'Tottenville', boro: 'SI', zone: 'dock', still: 4 },
];
const OFFBOARD = ['nj']; // New Jersey: land, off the board

// Labels in the water, by visual centre: [x, y, rotation]. The drafting places them
// midway between the shores, at their angle ("labels" in board-geometry.json).
const BORO_LABELS = geo.labels.boro, WATER_LABELS = geo.labels.water;
// Bridge names sit in the water beside each bridge, along the river, so Jobs can name
// a crossing: [x, y, rotation] by name.
const BRIDGE_LABELS = geo.labels.bridges;

// ---------------------------------------------------------------- type
const TYPE = {
  boro: { family: 'Cinzel', weight: 700, size: 19, spacing: 3.6 },
  water: { family: 'Barlow Condensed', weight: 600, size: 10, spacing: 3.4, italic: true },
  bridge: { family: 'Barlow Condensed', weight: 600, size: 8, spacing: 0.8, italic: true },
  keyHead: { family: 'Barlow Condensed', weight: 700, size: 9.5, spacing: 0.8 },
  panelHead: { family: 'Cinzel', weight: 700, size: 11.5, spacing: 3.2 },
  small: { family: 'Barlow Condensed', weight: 700, size: 8, spacing: 1.3 },
  titleCity: { family: 'Cinzel', weight: 700, size: 26, spacing: 4.5 },
  titleYear: { family: 'Cinzel', weight: 700, size: 15, spacing: 8 },
  price: { family: 'Barlow Condensed', weight: 700, size: 9.5, spacing: 0.4 },
  sign: { family: 'Barlow Condensed', weight: 700, size: 12.5, spacing: 0.5 }, // spacing 1 until 2026-09-30: tightened so East Harlem's name fits on one line
  signVenue: { family: 'Barlow', weight: 500, size: 7.8, spacing: 0.2, italic: true },
  tomorrow: { family: 'Cinzel', weight: 700, size: 8.6, spacing: 1.1 },
};
// The faces TYPE uses, plus Bebas Neue for the numbers in the Still tokens' own SVGs.
const FONTS = 'https://fonts.googleapis.com/css2?family=Barlow:ital,wght@1,500&family=Barlow+Condensed:ital,wght@0,700;1,600&family=Bebas+Neue&family=Cinzel:wght@700&display=block';

// ---------------------------------------------------------------- helpers
const f = (v, dp = 2) => +(+v).toFixed(dp);
const poly = p => `M${p.map(([x, y]) => `${f(x)} ${f(y)}`).join(' L')} Z`;
const pts = p => p.map(([x, y]) => `${f(x)},${f(y)}`).join(' ');
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const byId = Object.fromEntries(DISTRICTS.map(d => [d.id, d]));
// A District may run under the frame to the board's edge, as New Jersey does (the Bronx
// and Queens). Its fill keeps the whole shape; the rest (keylines, sign, room) works from
// the part inside the frame's hairline.
const FULL = { ...geo.regions };
for (const d of DISTRICTS) geo.regions[d.id] = insideFrame(geo.regions[d.id]);
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
  crown: loadIcon('Crown.svg'), martini: loadIcon('Gin.svg'),
};
function icon(kind, cx, cy, size, color, strokeWidth) {
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

// ---------------------------------------------------------------- signs
// A hanging sign: a small plaque with the type's medallion and the name (and venue),
// hung from the border above it, and the Still on its own plate bolted to the sign's
// right end, taller than the sign so it reads as a separate part (Nick, 2026-09-29).
// stacked: the name on two lines. drop: the plate bolted under the sign's middle
// instead, for a District too narrow for the two side by side. Returns the size and a
// draw(x, y) for the chosen spot.
function cluster(d, opts = {}) {
  const hs = d.zone === 'hs', nameFill = hs ? C.goldBright : C.ink;
  const { stacked = false, drop = false } = opts;
  const sr = 9, pad = 4.5, sh = 18.5 * MM, sw = sh * TOKEN_BOX[2] / TOKEN_BOX[3], pp = 5, lap = 6;
  const pw = sw + 2 * pp, ph = sh + 2 * pp; // the Still's plate
  const names = stacked ? upper(d.name).split(' ') : [upper(d.name)];
  const tw = Math.max(...names.map(n => width(TYPE.sign, n)), d.venue ? width(TYPE.signVenue, d.venue) : 0);
  const G1 = 4, G2 = 6; // gaps: medallion to name, name to plate (6 and 8 until 2026-09-30)
  const bw = pad + 2 * sr + G1 + tw + (drop ? pad + 2 : G2 + lap), bh = (stacked ? 34 : 26) + 2 * pad, tx = pad + 2 * sr + G1;
  const w = drop ? Math.max(bw, pw) : bw - lap + pw, h = drop ? bh - lap + ph : Math.max(bh, ph);
  const sx = drop ? (w - bw) / 2 : 0, sy = drop ? 0 : (h - bh) / 2; // the sign, in the cluster
  const px = drop ? (w - pw) / 2 : bw - lap, py = drop ? bh - lap : (h - ph) / 2; // the plate
  const rows = names.length + (d.venue ? 0.75 : 0), step = 10.5;
  const nameYs = names.map((n, i) => bh / 2 - (rows - 1) * step / 2 + i * step), venueY = nameYs[nameYs.length - 1] + 9.5;
  const medal = (x, yy) => [x + sx + pad + sr, yy + sy + bh / 2 + (hs ? 3 : 0)];
  // each hanger: [x, the sign's top there, the border straight above it]
  const hangers = (x, yy) => {
    const poly0 = geo.regions[d.id], X = x + sx, Y = yy + sy, PX = x + px, PY = yy + py;
    return (drop ? [[X + 12, Y], [X + bw - 12, Y]] : [[X + 12, Y], [PX + pw / 2, PY]]).map(([hx, hy]) => {
      let top = -Infinity;
      poly0.forEach((a, i) => {
        const b = poly0[(i + 1) % poly0.length];
        if ((a[0] - hx) * (b[0] - hx) > 0 || a[0] === b[0]) return;
        const ey = a[1] + (b[1] - a[1]) * (hx - a[0]) / (b[0] - a[0]);
        if (ey < hy && ey > top) top = ey;
      });
      return [hx, hy, top];
    });
  };
  const chamfered = (x, yy, ww, hh, c) => `M${f(x + c)} ${f(yy)} H${f(x + ww - c)} L${f(x + ww)} ${f(yy + c)} V${f(yy + hh - c)} L${f(x + ww - c)} ${f(yy + hh)} H${f(x + c)} L${f(x)} ${f(yy + hh - c)} V${f(yy + c)} Z`;
  return {
    w, h, opts, hangers,
    draw(x, yy) {
      const poly0 = geo.regions[d.id], X = x + sx, Y = yy + sy, PX = x + px, PY = yy + py;
      // hangers: from the tops up to the border straight above, always
      let hang = '';
      for (const [hx, hy, top] of hangers(x, yy)) if (top > -Infinity) hang += `M${f(hx)} ${f(top + 1.2)} V${f(hy)} `;
      let s = hang ? `<path d="${hang}" stroke="${C.goldLine}" stroke-width=".9" stroke-opacity=".85"/>` : '';
      const sign = chamfered(X, Y, bw, bh, 3), plate = chamfered(PX, PY, pw, ph, 2);
      s += `<path d="${sign}" fill="#000" fill-opacity=".5" transform="translate(1 1.8)" filter="url(#blur2)"/>`
        + `<path d="${sign}" fill="url(#lacquer)" fill-opacity=".92" stroke="url(#bezelGilt)" stroke-width="1.2"/>`;
      s += `<g filter="url(#lift)">${roundel(d.zone, ...medal(x, yy), sr)}</g>`;
      names.forEach((n, i) => { s += text(n, X + tx, Y + nameYs[i], TYPE.sign, { fill: nameFill, middle: true }); });
      if (d.venue) s += text(d.venue, X + tx, Y + venueY, TYPE.signVenue, { fill: C.body, middle: true });
      // the Still's plate, bolted on over the sign: its own edge and a bolt in each corner
      s += `<path d="${plate}" fill="#000" fill-opacity=".55" transform="translate(1.2 2)" filter="url(#blur2)"/>`
        + `<path d="${plate}" fill="url(#stillPlate)" stroke="url(#bezelGilt)" stroke-width="1.6"/>`
        + `<path d="${chamfered(PX + 2.2, PY + 2.2, pw - 4.4, ph - 4.4, 1.2)}" fill="none" stroke="#000" stroke-opacity=".6" stroke-width=".5"/>`;
      for (const [bx, by] of [[PX + 3.4, PY + 3.4], [PX + pw - 3.4, PY + 3.4], [PX + pw - 3.4, PY + ph - 3.4], [PX + 3.4, PY + ph - 3.4]])
        s += `<circle cx="${f(bx)}" cy="${f(by)}" r="1.45" fill="url(#bezelGilt)" stroke="#000" stroke-opacity=".55" stroke-width=".35"/>`
          + `<path d="M${f(bx - 0.8)} ${f(by)} H${f(bx + 0.8)}" stroke="#000" stroke-opacity=".5" stroke-width=".35"/>`;
      s += `<g filter="url(#lift)">${still(d.still, PX + pp, PY + pp, sh)}</g>`;
      return s;
    },
  };
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

// The sign's shapes, each with what it costs in hanger units to use it: the usual one
// free, a stacked name (25; 15 until 2026-09-30, Nick dislikes the wrap) where the usual one hangs much higher, and the Still's plate
// hung under the sign only where nothing else fits.
const SIGN_SHAPES = d => {
  const two = d.name.includes(' ');
  return [[{}, 0], ...(two ? [[{ stacked: true }, 25]] : []), [{ drop: true }, 60], ...(two ? [[{ stacked: true, drop: true }, 75]] : [])];
};
// The sign hangs as high in the District as it fits, clear of the Speakeasy and High
// Society keylines, and as near the District's centre line as it can: the middle of its
// full width inside the frame, not just of the room where it hangs. A District that
// widens lower down (Canarsie) would otherwise hang its sign off to one side of its top.
// Each unit off the centre line costs SIGN_CENTRE units of hanger (at 1, Canarsie's sign
// stayed put: dropping it to the centre cost as much hanger as it saved).
const SIGN_CENTRE = 2;
function placeSign(d) {
  const p = geo.regions[d.id], framed = d.zone === 'speak' || d.zone === 'hs';
  const xs = p.map(q => q[0]), ys = p.map(q => q[1]);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  // the centre line: the District's centroid (its balance point, inside the frame), so a
  // thin spit or tail doesn't drag it sideways
  const clip = p.map(([x, y]) => [Math.min(Math.max(x, FRAME_IN), 1080 - FRAME_IN), y]);
  let A = 0, CX = 0;
  clip.forEach((a, i) => { const b = clip[(i + 1) % clip.length], k = a[0] * b[1] - b[0] * a[1]; A += k; CX += (a[0] + b[0]) * k; });
  const mid = CX / (3 * A);
  // Every shape is tried, clear of the keylines where it can be (a narrow District lets
  // it closer), at every height, and the one whose hangers and distance off the centre
  // line, with its cost, come out least wins.
  const variants = SIGN_SHAPES(d);
  let best = null;
  for (const [opts, cost] of variants) for (const M of framed ? [13, 9] : [7]) {
    const c = cluster(d, opts);
    for (let y = y0; y <= y1 - c.h; y += 1) {
      const fit = [];
      for (let x = x0; x <= x1 - c.w; x += 1) if (rectInside([x - M, y - M, c.w + 2 * M, c.h + 2 * M], p)) fit.push(x);
      if (!fit.length) continue;
      const x = Math.min(Math.max(mid - c.w / 2, fit[0]), fit[fit.length - 1]), off = Math.abs(x + c.w / 2 - mid);
      const hang = Math.max(...c.hangers(x, y).map(([, hy, top]) => hy - top));
      const score = hang + SIGN_CENTRE * off + cost + (M < 13 && framed ? 4 : 0);
      if (!best || score < best.score) best = { score, hang, off, x, y, c, open: M };
    }
  }
  if (!best) throw new Error(`No room for a sign in ${d.id}: the drafting has made it too small`);
  return best;
}
// Room for pieces: the District's ground at least ROOM_MARGIN from every border and
// clear of its sign (by the same margin), in cm² at 24in. Printed with each placement,
// so a geometry change can be judged by the space it leaves.
const ROOM_MARGIN = 6;
function room(d, { x, y, c }) {
  const p = geo.regions[d.id], M = ROOM_MARGIN, sign = [x - M, y - M, c.w + 2 * M, c.h + 2 * M];
  const xs = p.map(q => q[0]), ys = p.map(q => q[1]);
  let n = 0;
  for (let gy = Math.min(...ys); gy <= Math.max(...ys); gy += 2) for (let gx = Math.min(...xs); gx <= Math.max(...xs); gx += 2)
    if (inside([gx, gy], p) && rectDist([gx, gy], sign) > 0 && edgeDist([gx, gy], p) >= M) n++;
  return n * 4 * (BOARD_MM / 1080) ** 2 / 100;
}
function placeAll() {
  return Object.fromEntries(DISTRICTS.map(d => [d.id, placeSign(d)]));
}

// ---------------------------------------------------------------- map layers
function waterLining() {
  // Engraved coast rings: alternate gold and sea strokes, widest first, under the land.
  const land = [...DISTRICTS.map(d => FULL[d.id]), ...OFFBOARD.map(k => geo.regions[k])];
  const bg = lift(C.sea[1]);
  const rings = [[22, C.goldLine, 0.06], [18.5, bg, 1], [13.5, C.goldLine, 0.09], [10.5, bg, 1], [6.5, C.goldLine, 0.15], [4, bg, 1]];
  return rings.map(([w, col, op]) =>
    `<g fill="none" stroke="${col}" stroke-opacity="${op}" stroke-width="${w}" stroke-linejoin="round">${land.map(q => `<path d="${poly(q)}"/>`).join('')}</g>`).join('');
}

function wardMark(d, p) {
  const k = insetRing(straightRing(geo.regions[d.id]), WARD_HATCH.band);
  return `<path d="${poly(p)}" fill="none" stroke="url(#wardHatch)" stroke-width="${2 * WARD_HATCH.band}" stroke-linejoin="miter"/>`
    + `<path d="${ringPath(k)}" fill="none" stroke="${C.goldLine}" stroke-opacity=".55" stroke-width=".8" stroke-linejoin="miter"/>`;
}
// A Dock's edge is a dash-dot gold line just inside the border: rope strung between
// posts (plain dashes read as the leather's stitching). Each side is spaced on
// its own, stretched to fit, so every corner is a dash's end.
const DOCK_EDGE = { inset: 5, dash: 8, gap: 2.6, dot: 0.85, line: 1.2 };
function dockMark(p) {
  const q = insetRing(straightRing(p), DOCK_EDGE.inset), { dash, gap, dot } = DOCK_EDGE, P = dash + 2 * gap;
  let d = '', dots = '';
  q.forEach((a, i) => {
    const b = q[(i + 1) % q.length], L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const n = Math.max(1, Math.round((L - dash) / P)), k = L / (n * P + dash);
    const at = t => [a[0] + (b[0] - a[0]) * t / L, a[1] + (b[1] - a[1]) * t / L];
    for (let j = 0; j <= n; j++) {
      const [x0, y0] = at(j * P * k), [x1, y1] = at((j * P + dash) * k);
      d += `M${f(x0)} ${f(y0)} L${f(x1)} ${f(y1)} `;
      if (j < n) { const [cx, cy] = at((j * P + dash + gap) * k); dots += `<circle cx="${f(cx)}" cy="${f(cy)}" r="${dot}"/>`; }
    }
  });
  return `<path d="${d}" fill="none" stroke="${C.gold}" stroke-opacity=".75" stroke-width="${DOCK_EDGE.line}" stroke-linecap="butt"/>`
    + `<g fill="${C.gold}" fill-opacity=".75">${dots}</g>`;
}
function districtFills() {
  let s = '';
  for (const d of DISTRICTS) {
    const p = FULL[d.id];
    s += `<clipPath id="clip-${d.id}"><path d="${poly(p)}"/></clipPath>`;
    s += `<path d="${poly(p)}" fill="url(#${fillId(d)})"/>`;
    s += `<g clip-path="url(#clip-${d.id})"><path d="${poly(p)}" fill="none" stroke="#000" stroke-opacity=".5" stroke-width="15" filter="url(#soft)"/>`
      + (d.zone === 'ward' ? wardMark(d, p) : '') + '</g>';
    if (d.zone === 'dock') s += dockMark(geo.regions[d.id]);
    s += decoFrame(d, geo.regions[d.id]);
  }
  return s;
}

// ---------------------------------------------------------------- Deco frames
// The District's outline with its straight runs merged (junctions along a straight
// border are not corners), then moved in by k: each corner along the bisector of its
// two edges, as far as keeps both edges k away (capped where a corner is very sharp).
function straightRing(p) {
  let q = p.filter((v, i) => dist2(v, p[(i + 1) % p.length]) > 0.01);
  for (let again = true; again;) {
    again = false;
    for (let i = 0; i < q.length; i++) {
      const a = q[(i - 1 + q.length) % q.length], v = q[i], b = q[(i + 1) % q.length];
      const turn = Math.abs(Math.atan2(cross(a, v, b), (v[0] - a[0]) * (b[0] - v[0]) + (v[1] - a[1]) * (b[1] - v[1])));
      if (turn < 3 * Math.PI / 180) { q.splice(i, 1); again = true; break; }
    }
  }
  return q;
}
const dist2 = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;
const signedArea = p => p.reduce((s, a, i) => { const b = p[(i + 1) % p.length]; return s + a[0] * b[1] - b[0] * a[1]; }, 0) / 2;
function insetRing(q, k) {
  const sgn = Math.sign(signedArea(q));
  const inward = (a, b) => { const l = Math.hypot(b[0] - a[0], b[1] - a[1]); return [-sgn * (b[1] - a[1]) / l, sgn * (b[0] - a[0]) / l]; };
  return q.map((v, i) => {
    const a = q[(i - 1 + q.length) % q.length], b = q[(i + 1) % q.length];
    const n1 = inward(a, v), n2 = inward(v, b), bx = n1[0] + n2[0], by = n1[1] + n2[1], bl = Math.hypot(bx, by);
    const cosHalf = (bx * n1[0] + by * n1[1]) / bl, m = k / Math.max(cosHalf, 0.4);
    return [v[0] + bx / bl * m, v[1] + by / bl * m];
  });
}
// Convex corners of a ring: the point, the two edge directions leaving it, and the angle between.
function convexCorners(q) {
  const sgn = Math.sign(signedArea(q)), out = [];
  q.forEach((v, i) => {
    const a = q[(i - 1 + q.length) % q.length], b = q[(i + 1) % q.length];
    if (Math.sign(cross(a, v, b)) !== sgn) return; // reflex
    const u1 = [a[0] - v[0], a[1] - v[1]], u2 = [b[0] - v[0], b[1] - v[1]];
    const l1 = Math.hypot(...u1), l2 = Math.hypot(...u2);
    const angle = Math.acos(Math.max(-1, Math.min(1, (u1[0] * u2[0] + u1[1] * u2[1]) / l1 / l2)));
    out.push({ v, u1: [u1[0] / l1, u1[1] / l1], u2: [u2[0] / l2, u2[1] / l2], angle, room: Math.min(l1, l2) });
  });
  return out;
}
const ringPath = q => `M${q.map(([x, y]) => `${f(x)} ${f(y)}`).join(' L')} Z`;
const diamondAt = ([x, y], r, col) => `<path d="M${f(x)} ${f(y - r)} L${f(x + r)} ${f(y)} L${f(x)} ${f(y + r)} L${f(x - r)} ${f(y)} Z" fill="${col}"/>`;
// A Deco fan filling a corner: rays across the corner's angle, long and short by
// turns, between two arcs; the frame's own corner fans, opened or closed to fit.
function cornerFan({ v, u1, u2, angle }, r) {
  const a1 = Math.atan2(u1[1], u1[0]), turn = Math.sign(u1[0] * u2[1] - u1[1] * u2[0]) || 1;
  const pt = (t, rr) => { const a = a1 + turn * angle * t; return `${f(v[0] + Math.cos(a) * rr)} ${f(v[1] + Math.sin(a) * rr)}`; };
  let d = '';
  for (let k = 1; k <= 5; k++) d += `M${pt(k / 6, r * 0.3)} L${pt(k / 6, k % 2 ? r : r * 0.72)} `;
  const arc = rr => `M${pt(0, rr)} A${f(rr)} ${f(rr)} 0 0 ${turn > 0 ? 1 : 0} ${pt(1, rr)} `;
  return `<path d="${d}${arc(r * 0.3)}${arc(r * 1.08)}" fill="none" stroke="${C.goldLine}" stroke-opacity=".7" stroke-width=".9" stroke-linecap="round"/>`;
}
const DECO = { line: 7, outer: 6, inner: 10.5, fan: 17, sharpest: 20, bluntest: 150 }; // insets and sizes, in units
function decoFrame(d, p) {
  if (d.zone !== 'speak' && d.zone !== 'hs') return '';
  const q = straightRing(p), deg = a => a * 180 / Math.PI;
  const fits = c => deg(c.angle) >= DECO.sharpest && deg(c.angle) <= DECO.bluntest;
  if (d.zone === 'speak') {
    const k = insetRing(q, DECO.line);
    return `<path d="${ringPath(k)}" fill="none" stroke="${C.goldLine}" stroke-opacity=".6" stroke-width=".9" stroke-linejoin="miter"/>`
      + convexCorners(k).filter(fits).map(c => diamondAt(c.v, 2.4, C.gold)).join('');
  }
  const o = insetRing(q, DECO.outer), i = insetRing(q, DECO.inner);
  let s = `<path d="${ringPath(o)}" fill="none" stroke="${C.gold}" stroke-opacity=".8" stroke-width="1.3" stroke-linejoin="miter"/>`
    + `<path d="${ringPath(i)}" fill="none" stroke="${C.goldLine}" stroke-opacity=".55" stroke-width=".8" stroke-linejoin="miter"/>`;
  for (const c of convexCorners(i).filter(fits)) s += cornerFan(c, Math.min(DECO.fan, 0.3 * c.room));
  s += convexCorners(o).filter(fits).map(c => diamondAt(c.v, 2.8, C.goldBright)).join('');
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
// Piers: short wharves off each Dock's most open stretch of shore, in the Dock's
// own colour so they read as its land. Placed automatically: each must run into
// open water, clear of other land, bridges and the water labels.
const PIER = { len: 12, half: 2.3, gap: 15, count: 3 };
function orientedBox(cx, cy, deg, hl, hh) {
  const t = deg * Math.PI / 180, ux = Math.cos(t), uy = Math.sin(t);
  return [[-hl, -hh], [hl, -hh], [hl, hh], [-hl, hh]].map(([a, b]) => [cx + ux * a - uy * b, cy + uy * a + ux * b]);
}
function pierObstacles() {
  const obs = [];
  for (const [k, [x, y, r]] of Object.entries(BORO_LABELS))
    obs.push(orientedBox(x, y, r, (31 + width(TYPE.boro, upper(BOROUGHS[k].name))) / 2 + 4, 15));
  for (const [t, x, y, r] of WATER_LABELS) obs.push(orientedBox(x, y, r, width(TYPE.water, t) / 2 + 4, 9));
  for (const { name } of geo.bridges) { const [x, y, r] = BRIDGE_LABELS[name]; obs.push(orientedBox(x, y, r, width(TYPE.bridge, name) / 2 + 4, 8)); }
  for (const { a, b } of geo.bridges) {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    obs.push(orientedBox((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI, L / 2 + 14, 16));
  }
  return obs;
}
function placePiers() {
  const land = [...DISTRICTS.map(d => FULL[d.id]), ...OFFBOARD.map(k => geo.regions[k])];
  const obs = pierObstacles(), out = [];
  const free = q => !land.some(p => inside(q, p)) && !obs.some(o => inside(q, o))
    && q[0] > FRAME_IN + 4 && q[0] < 1080 - FRAME_IN - 4 && q[1] > FRAME_IN + 4 && q[1] < 1080 - FRAME_IN - 4;
  for (const d of DISTRICTS.filter(dd => dd.zone === 'dock')) {
    const poly0 = geo.regions[d.id];
    let best = null;
    for (const c of geo.chains.filter(ch => ch.sides.includes(d.id) && ch.sides.includes('water'))) {
      for (let i = 0; i < c.pts.length - 1; i++) {
        const [p0, p1] = [c.pts[i], c.pts[i + 1]], L = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]);
        if (L < 24) continue;
        const ux = (p1[0] - p0[0]) / L, uy = (p1[1] - p0[1]) / L;
        let nx = -uy, ny = ux;
        const mid = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2];
        if (inside([mid[0] + nx * 2, mid[1] + ny * 2], poly0)) { nx = -nx; ny = -ny; } // point out to sea
        let run = [];
        const flush = () => { if (!best || run.length > best.run.length) best = { run: run.slice(), u: [ux, uy], n: [nx, ny] }; run = []; };
        for (let t = 9; t <= L - 9; t += 3) {
          const q = [p0[0] + ux * t, p0[1] + uy * t];
          const probe = [];
          for (let s2 = 2; s2 <= PIER.len + 6; s2 += 2) for (const w of [-PIER.half - 1, 0, PIER.half + 1]) probe.push([q[0] + nx * s2 + ux * w, q[1] + ny * s2 + uy * w]);
          if (probe.every(free)) run.push(q); else flush();
        }
        flush();
      }
    }
    if (!best || !best.run.length) continue;
    const span = (best.run.length - 1) * 3, n = Math.min(PIER.count, Math.floor(span / PIER.gap) + 1);
    const midIdx = (best.run.length - 1) / 2, [ux, uy] = best.u;
    const c0 = best.run[Math.floor(midIdx)];
    for (let k = 0; k < n; k++) {
      const off = (k - (n - 1) / 2) * PIER.gap;
      out.push({ d, q: [c0[0] + ux * off, c0[1] + uy * off], u: best.u, n: best.n });
    }
  }
  return out;
}
function piers() {
  return placePiers().map(({ d, q, u, n }) => {
    const col = lift(BOROUGHS[d.boro].fill[0]);
    const P = (along, across) => `${f(q[0] + n[0] * along + u[0] * across)} ${f(q[1] + n[1] * along + u[1] * across)}`;
    const body = `M${P(-2.5, -PIER.half)} L${P(PIER.len, -PIER.half)} L${P(PIER.len, PIER.half)} L${P(-2.5, PIER.half)} Z`;
    return `<path d="${body}" fill="#000" fill-opacity=".45" transform="translate(1 1.6)" filter="url(#blur2)"/>`
      + `<path d="${body}" fill="${col}"/>`
      + `<path d="M${P(0.5, -PIER.half)} L${P(PIER.len, -PIER.half)} L${P(PIER.len, PIER.half)} L${P(0.5, PIER.half)}" fill="none" stroke="${C.gold}" stroke-width="1.1" stroke-linejoin="round"/>`;
  }).join('');
}

function bridges() {
  return geo.bridges.map(({ a, b }) => bridgeGlyph(a, b)).join('');
}

function mapLabels() {
  let s = '';
  for (const [k, [x, y, r]] of Object.entries(BORO_LABELS)) {
    // The number orders the Squads in a Raid, so it rides on a police shield, and only
    // where a Squad patrols: Staten Island has none, so it has no number.
    const b = BOROUGHS[k], t = upper(b.name), badge = k !== 'SI';
    const total = (badge ? 22 + 9 : 0) + width(TYPE.boro, t), left = -total / 2, L = left;
    s += `<g transform="translate(${f(x)} ${f(y)}) rotate(${r})">`
      + (badge ? `<path d="M${f(L)} -12.5 Q${f(L + 11)} -9.5 ${f(L + 22)} -12.5 L${f(L + 22)} 1.5 Q${f(L + 22)} 9 ${f(L + 11)} 13.5 Q${f(L)} 9 ${f(L)} 1.5 Z" fill="${C.gold}" stroke="${C.shadow}" stroke-width="1.2" stroke-linejoin="round"/>`
        + text(String(b.n), L + 11, -0.5, { family: 'Cinzel', weight: 700, size: 16, spacing: 0 }, { fill: '#1b150e', anchor: 'middle', middle: true }) : '')
      + text(t, left + (badge ? 31 : 0), 0, TYPE.boro, { fill: C.gold, halo: 3, middle: true }) + `</g>`;
  }
  for (const [t, x, y, r] of WATER_LABELS) s += text(t, x, y, TYPE.water, { fill: C.goldDim, anchor: 'middle', rotate: r, opacity: 0.85, middle: true });
  for (const { name } of geo.bridges) {
    const [x, y, r] = BRIDGE_LABELS[name];
    s += text(name, x, y, TYPE.bridge, { fill: C.muted, anchor: 'middle', rotate: r, halo: 2.2, middle: true });
  }
  return s;
}

// ---------------------------------------------------------------- side panels
// Saddle stitching: the leather's seams. About 2.8 mm stitches at 24in.
const stitch = d => `<path d="${d}" fill="none" stroke="#000" stroke-opacity=".45" stroke-width="1.3" stroke-dasharray="5 3" stroke-linecap="round" transform="translate(.5 .7)"/>`
  + `<path d="${d}" fill="none" stroke="#d9c69c" stroke-opacity=".6" stroke-width="1.1" stroke-dasharray="5 3" stroke-linecap="round"/>`;

// The key and Mash panels: lacquered plaques to match the Heat Track (no stitching or
// leather, as Nick preferred): a polished gilt edge with a dark seat inside it, a
// hairline, a jewel on each Deco chamfer, and a soft shadow lifting them off the hide.
function panel(x, y, w, h) {
  const c = 7; // Deco chamfer
  const outline = i => `M${f(x + c + i)} ${f(y + i)} H${f(x + w - c - i)} L${f(x + w - i)} ${f(y + c + i)} V${f(y + h - c - i)} L${f(x + w - c - i)} ${f(y + h - i)} H${f(x + c + i)} L${f(x + i)} ${f(y + h - c - i)} V${f(y + c + i)} Z`;
  const jewels = [[x + c / 2, y + c / 2], [x + w - c / 2, y + c / 2], [x + w - c / 2, y + h - c / 2], [x + c / 2, y + h - c / 2]];
  return `<path d="${outline(0)}" fill="#000" fill-opacity=".55" transform="translate(1.6 2.6)" filter="url(#blur2)"/>`
    + `<path d="${outline(0)}" fill="url(#lacquer)"/>`
    + `<path d="${outline(1.1)}" fill="none" stroke="url(#bezelGilt)" stroke-width="2.2"/>`
    + `<path d="${outline(2.5)}" fill="none" stroke="#000" stroke-opacity=".6" stroke-width=".6"/>`
    + `<path d="${outline(4.6)}" fill="none" stroke="${C.goldLine}" stroke-opacity=".4" stroke-width=".7"/>`
    + jewels.map(q => diamondAt(q, 1.7, C.goldBright)).join('');
}
// Engraved gilt lettering: the metal over a drop shadow.
const gilt = (t, x, y, spec) => text(t, x + 0.6, y + 0.9, spec, { fill: '#000', anchor: 'middle', opacity: 0.7, middle: true })
  + text(t, x, y, spec, { fill: 'url(#giltText)', anchor: 'middle', middle: true });

// Heat Track: five poker-chip sockets, the Ledger's own size (39 mm sockets 2 mm
// apart in a tray padded 6 mm), numbered left to right so a Raid's "furthest
// right on the Heat Track" reads straight off it. The 5th Heat sets off a Raid.
// It sits in a corner cut out of the map: the frame steps in around it (see
// frame()), so no coastline runs under it. Sockets look like the Ledger's; only
// the numerals warm from gold towards rust as the Heat climbs.
const HEAT = (() => {
  const d = 39 * MM, gap = 2 * MM, padX = 6 * MM, padY = 4 * MM, m = 7;
  const trayW = 5 * d + 4 * gap + 2 * padX, trayH = d + 2 * padY;
  const tx = FRAME_IN + m, ty = FRAME_IN + 11; // the title rides on the frame (heatPlate), not above the tray
  const inner = [tx + trayW + m, ty + trayH + m]; // the corner's inner hairline
  return { d, gap, padX, trayW, trayH, tx, ty, edge: [inner[0] + 6, inner[1] + 6] };
})();
// Escalation is kept subtle (Nick): the floors warm a touch towards rust, and only the
// 5th, the Raid, changes metal: rose-copper on an oxblood floor.
const HEAT_TINT = [0, 0.03, 0.05, 0.07, 0.1];
// Metals: [light, mid, shadow] for gilt bezels and engraved numerals.
const GILT = ['#f6e3a1', '#c9a437', '#6b5424'], COPPER = ['#f2c3a4', '#b8674d', '#5a2618'];
function heatTrack() {
  const { d, gap, padX, trayW, trayH, tx, ty, edge: [ex, ey] } = HEAT;
  const a = (FRAME_OUT + FRAME_IN) / 2, R = d / 2, cy = ty + trayH / 2, mid = tx + trayW / 2;
  const bg = `<path d="M0 0 H${f(ex)} V${f(ey)} H0 Z" fill="url(#panel)"/>` + stitch(`M${a} ${a} H${f(ex - 3.4)} V${f(ey - 3.4)} H${a} Z`);
  let s = '';
  // The tray: a routed channel, shadowed under its top lip, a gilt lip catching the light below.
  const pill = `x="${f(tx)}" y="${f(ty)}" width="${f(trayW)}" height="${f(trayH)}" rx="${f(trayH / 2)}"`;
  s += `<clipPath id="heat-tray"><rect ${pill}/></clipPath>`
    + `<rect ${pill} fill="url(#heatTray)"/>`
    + `<rect ${pill} fill="none" stroke="#000" stroke-opacity=".75" stroke-width="7" clip-path="url(#heat-tray)" filter="url(#blur2)" transform="translate(0 1.5)"/>`
    + `<rect ${pill} fill="none" stroke="url(#heatLip)" stroke-width="1.5"/>`;
  for (let i = 0; i < 5; i++) {
    const cx = tx + padX + R + i * (d + gap), raid = i === 4, metal = raid ? 'Copper' : 'Gilt';
    // the floor: lacquer (oxblood for the Raid), recessed under its bezel
    s += `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(R)}" fill="url(#heatFloor${raid ? 'Raid' : ''})"/>`
      + (HEAT_TINT[i] && !raid ? `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(R)}" fill="#b0503a" fill-opacity="${HEAT_TINT[i]}"/>` : '');
    // a guilloché sunburst and an inner track ring, like a watch dial
    let rays = '';
    for (let k = 0; k < 72; k++) {
      const t = k * 5 * Math.PI / 180, r0 = k % 2 ? 9 : 6;
      rays += `M${f(cx + Math.cos(t) * r0)} ${f(cy + Math.sin(t) * r0)} L${f(cx + Math.cos(t) * (R - 7))} ${f(cy + Math.sin(t) * (R - 7))} `;
    }
    s += `<path d="${rays}" stroke="${raid ? COPPER[1] : C.goldLine}" stroke-opacity=".13" stroke-width=".45"/>`
      + `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(R - 7)}" fill="none" stroke="${raid ? COPPER[1] : C.goldLine}" stroke-opacity=".45" stroke-width=".6"/>`
      + `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(R - 9)}" fill="none" stroke="${raid ? COPPER[1] : C.goldLine}" stroke-opacity=".2" stroke-width=".4"/>`;
    // recess: the floor darkens under the bezel's upper edge
    s += `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(R - 2)}" fill="url(#heatRecess)"/>`;
    // the bezel: polished metal, a dark seat inside it and a bright rim outside
    s += `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(R - 1.8)}" fill="none" stroke="url(#bezel${metal})" stroke-width="3.4"/>`
      + `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(R - 3.7)}" fill="none" stroke="#000" stroke-opacity=".7" stroke-width=".6"/>`
      + `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(R - 0.1)}" fill="none" stroke="${raid ? COPPER[0] : GILT[0]}" stroke-opacity=".35" stroke-width=".5"/>`;
    // the numeral, engraved: a shadow below it, the metal on top
    const num = { family: 'Cinzel', weight: 700, size: 30, spacing: 0 }, ny = cy - (raid ? 5 : 0);
    s += text(String(i + 1), cx + 0.9, ny + 1.3, num, { fill: '#000', anchor: 'middle', opacity: 0.75, middle: true })
      + text(String(i + 1), cx, ny, num, { fill: `url(#${raid ? 'copperText' : 'giltText'})`, anchor: 'middle', middle: true });
    if (raid) s += text('RAID', cx + 0.6, cy + 20.5, TYPE.small, { fill: '#000', anchor: 'middle', opacity: 0.7, middle: true })
      + text('RAID', cx, cy + 19.8, TYPE.small, { fill: 'url(#copperText)', anchor: 'middle', middle: true });
    // diamonds in the spandrels between sockets, above and below
    if (i < 4) {
      const mx = cx + R + gap / 2;
      s += diamondAt([mx, ty + 9.5], 2.3, C.goldLine) + diamondAt([mx, ty + trayH - 9.5], 2.3, C.goldLine);
    }
  }
  return { bg, fg: s, top: heatPlate(mid) };
}
// The Heat Track's name on a gilt plate set into the board's top edge, letters cut in:
// a Deco cartouche breaking the border. Drawn over the frame.
function heatPlate(mid) {
  // it hangs from the gold edge's centre line, so nothing but the black band lies nearer the cut
  const w = width(TYPE.panelHead, 'HEAT') + 30, h = 12.5, x = mid - w / 2, y = FRAME_OUT, c = 4;
  const outline = i => `M${f(x + c + i)} ${f(y + i)} H${f(x + w - c - i)} L${f(x + w - i)} ${f(y + c + i)} V${f(y + h - c - i)} L${f(x + w - c - i)} ${f(y + h - i)} H${f(x + c + i)} L${f(x + i)} ${f(y + h - c - i)} V${f(y + c + i)} Z`;
  const ty = y + h / 2, spec = { ...TYPE.panelHead, size: 10.5 };
  return `<path d="${outline(0)}" fill="#000" fill-opacity=".55" transform="translate(.8 1.4)" filter="url(#blur2)"/>`
    + `<path d="${outline(0)}" fill="url(#bezelGilt)" stroke="#2a1d0c" stroke-width=".8"/>`
    + `<path d="${outline(2)}" fill="none" stroke="#2a1d0c" stroke-opacity=".45" stroke-width=".5"/>`
    + diamondAt([x - 5, y + h / 2], 2.2, C.goldBright) + diamondAt([x + w + 5, y + h / 2], 2.2, C.goldBright)
    + text('HEAT', mid + 1.6, ty + 0.6, spec, { fill: GILT[0], anchor: 'middle', opacity: 0.55, middle: true })
    + text('HEAT', mid + 1.6, ty, spec, { fill: '#241807', anchor: 'middle', middle: true });
}

// Tomorrow: what today settles for tomorrow, in one panel under the title (Nick,
// 2026-09-29). The Mash die, 24 mm so any usual die fits, turned by the Harbormaster; and
// tomorrow's Turn Tokens as one stack, #1 on top, so each boss who Lays Low takes the top
// token (the lowest left, as the rule says). Turn Tokens are 36 mm square; the socket fits
// the stack.
const TOMORROW = (() => {
  const mash = 24 * MM, tok = 36 * MM, mashY = 42, tokY = mashY + mash + 17;
  return { mash, tok, mashY, tokY, w: tok + 28, h: tokY + tok + 11 };
})();
function tomorrow(x, y) {
  const { mash, tok, w, h } = TOMORROW, spec = TYPE.tomorrow;
  const sock = (sx, sy, side, r) => {
    const sq = i => `x="${f(sx + i)}" y="${f(sy + i)}" width="${f(side - 2 * i)}" height="${f(side - 2 * i)}" rx="${f(r - i / 2)}"`;
    return `<rect ${sq(0)} fill="url(#heatFloor)"/><rect ${sq(0)} fill="url(#heatRecess)"/>`
      + `<rect ${sq(1.7)} fill="none" stroke="url(#bezelGilt)" stroke-width="3.4"/>`
      + `<rect ${sq(3.6)} fill="none" stroke="#000" stroke-opacity=".7" stroke-width=".6"/>`
      + `<rect ${sq(0)} fill="none" stroke="${GILT[0]}" stroke-opacity=".35" stroke-width=".5"/>`;
  };
  // name, rule, then each socket under its own label
  const cx = x + w / 2, mashY = y + TOMORROW.mashY, tokY = y + TOMORROW.tokY;
  const rule = yy => `<path d="M${f(x + 12)} ${f(yy)} H${f(x + w - 12)}" stroke="${C.goldLine}" stroke-opacity=".5" stroke-width=".6"/>`
    + diamondAt([cx, yy], 1.6, C.goldLine);
  return {
    h, w,
    fg: panel(x, y, w, h) + gilt('TOMORROW', cx, y + 15, spec) + rule(y + 23.5)
      + text('MASH', cx, mashY - 7, spec, { fill: C.body, anchor: 'middle', middle: true }) + sock(cx - mash / 2, mashY, mash, 6)
      + text('TURN ORDER', cx, tokY - 7, spec, { fill: C.body, anchor: 'middle', middle: true }) + sock(cx - tok / 2, tokY, tok, 7),
  };
}

// The key is the price list (Nick, 2026-09-29: the Ward, Dock and Still rows went; the
// Rulebook teaches the types). Each row is a venue and what it buys, a barrel and a price:
// the High Society row has only Rum, which says "Rum only" without the words. A barrel is
// drawn as the cube that stands for it on the table (Nick: grey Moonshine, brown Rum).
const CUBE = { moonshine: '#9b9892', rum: '#7b4a26' };
function cube(liquor, cx, cy, size) {
  const h = size / 2, col = CUBE[liquor];
  return `<rect x="${f(cx - h)}" y="${f(cy - h)}" width="${f(size)}" height="${f(size)}" rx="1.2" fill="${col}" stroke="#000" stroke-opacity=".55" stroke-width=".6" filter="url(#lift)"/>`
    + `<path d="M${f(cx - h + 1.2)} ${f(cy + h - 1.6)} V${f(cy - h + 1.2)} H${f(cx + h - 1.6)}" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width=".7" stroke-linecap="round"/>`;
}
// A Rum barrel poured at High Society also pays a Kickback: a gilt "+1" chip after its price,
// a Ledger marker (the Ledger's markers are poker chips). Its limits are the Rulebook's.
function kickChip(cx, cy) {
  return `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(KICK_R)}" fill="${C.panelB}" stroke="${C.gold}" stroke-width="1.1" filter="url(#lift)"/>`
    + `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(KICK_R - 2)}" fill="none" stroke="${C.goldDim}" stroke-width=".4" stroke-dasharray="1.2 1.2"/>`
    + text('+1', cx, cy, { family: 'Barlow Condensed', weight: 700, size: 7.6, spacing: 0 }, { fill: C.goldBright, anchor: 'middle', middle: true });
}
const KICK_R = 6.5, KICK_GAP = 4;
const KEY_ROWS = [ // [roundel, name, chips: [barrel, price, Kickback?]]
  ['speak', 'Speakeasy', [['moonshine', '$300'], ['rum', '$500']]],
  ['hs', 'High Society', [['rum', '$500', true]]],
];
function key(x, y) {
  const headW = Math.max(...KEY_ROWS.map(([, t]) => width(TYPE.keyHead, upper(t))));
  const chipsX = 28 + headW + 10, CHIP_GAP = 9;
  const chipW = (p, kick) => 12 + width(TYPE.price, p) + (kick ? KICK_GAP + 2 * KICK_R : 0);
  const chipsW = Math.max(...KEY_ROWS.map(([, , ch]) => ch.reduce((a, [, p, k]) => a + chipW(p, k), 0) + Math.max(0, ch.length - 1) * CHIP_GAP));
  // Roomy enough that the High Society crown clears the Speakeasy medallion above it.
  const PITCH = 19, w = chipsX + chipsW + 12, h = 14 + (KEY_ROWS.length - 1) * PITCH + 17;
  let s = panel(x, y, w, h);
  KEY_ROWS.forEach(([k, t, chips], i) => {
    const cy = y + 14 + i * PITCH, ix = x + 15;
    s += roundel(k, ix, cy, 5.4);
    s += text(upper(t), x + 28, cy, TYPE.keyHead, { fill: k === 'hs' ? C.goldBright : C.ink, middle: true });
    let cx = x + chipsX;
    for (const [liquor, price, kick] of chips) {
      s += cube(liquor, cx + 4.5, cy, 8) + text(price, cx + 11, cy, TYPE.price, { fill: C.body, middle: true });
      if (kick) s += kickChip(cx + 11 + width(TYPE.price, price) + KICK_GAP + KICK_R, cy);
      cx += chipW(price, kick) + CHIP_GAP;
    }
  });
  return { fg: s, w, h };
}

// Under the Heat corner: the Tomorrow panel, the key beside it, the title under both.
const PANELS_Y = () => HEAT.edge[1] + 12;
function sidePanels() {
  const y = PANELS_Y(), heat = heatTrack(), t = tomorrow(HEAT.tx, y), k = key(HEAT.tx + t.w + 10, y);
  return { bg: heat.bg, fg: heat.fg + t.fg + k.fg, top: heat.top };
}

// The seam round the board, between the gilt edge and the hairline, stepping in
// round the Heat corner (whose own seam is stitched with its ground).
function seams() {
  const W = 1080, a = (FRAME_OUT + FRAME_IN) / 2, [ex, ey] = HEAT.edge.map(v => f(v));
  return stitch(`M${ex + 3.4} ${a} H${W - a} V${W - a} H${a} V${ey + 3.4} H${ex + 3.4} Z`);
}

// New Jersey's shore at height y: its furthest point east.
function njShore(y) {
  const p = geo.regions.nj;
  let x = -Infinity;
  p.forEach((a, i) => {
    const b = p[(i + 1) % p.length];
    if ((a[1] - y) * (b[1] - y) > 0 || a[1] === b[1]) return;
    x = Math.max(x, a[0] + (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]));
  });
  return x;
}
function title() {
  // The map's title block: the city and the year, between Deco rules, turned to read up
  // New Jersey's strip beside the Bowery (Nick, 2026-09-29: it had sat under the panels,
  // and the strip below was empty). Centred between the frame and the shore at its foot,
  // and in the ground left under the panels.
  const cityW = width(TYPE.titleCity, 'NEW YORK'), yearW = width(TYPE.titleYear, '1929');
  const diamond = (x, y, r) => `<path d="M${f(x)} ${f(y - r)} L${f(x + r)} ${f(y)} L${f(x)} ${f(y + r)} L${f(x - r)} ${f(y)} Z" fill="${C.goldBright}"/>`;
  const rule = (y, gap) => `<path d="M${f(-cityW / 2)} ${y} H${f(-gap)} M${f(gap)} ${y} H${f(cityW / 2)}" stroke="${C.gold}" stroke-width="1"/>`;
  let s = rule(-27, 9) + diamond(0, -27, 3.6);
  s += text('NEW YORK', 2.2, -5, TYPE.titleCity, { fill: C.goldBright, anchor: 'middle', halo: 3.4, middle: true });
  s += rule(20, yearW / 2 + 10);
  s += text('1929', 4, 20, TYPE.titleYear, { fill: C.gold, anchor: 'middle', halo: 3, middle: true });
  const top = PANELS_Y() + TOMORROW.h + 16, foot = Math.max(...geo.regions.nj.map(q => q[1])) - 16;
  const x = (FRAME_IN + njShore(foot)) / 2 + 1.5, y = Math.max(top + cityW / 2, (top + foot) / 2);
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(-90)">${s}</g>`;
}

// A quarter sunburst: rays and two arcs from (x, y), spanning a0 to a0 + 90 degrees.
function fan(x, y, a0, r) {
  const pt = (deg, rr) => { const t = deg * Math.PI / 180; return `${f(x + Math.cos(t) * rr)} ${f(y + Math.sin(t) * rr)}`; };
  let d = '';
  for (let k = 1; k <= 5; k++) d += `M${pt(a0 + k * 15, r * 0.3)} L${pt(a0 + k * 15, k % 2 ? r : r * 0.72)} `;
  const arc = rr => `M${pt(a0, rr)} A${rr} ${rr} 0 0 1 ${pt(a0 + 90, rr)} `;
  return `<path d="${d}${arc(r * 0.3)}${arc(r * 1.08)}" fill="none" stroke="${C.goldLine}" stroke-opacity=".75" stroke-width=".9" stroke-linecap="round"/>`;
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
  // Deco fans in the hairline's corner steps, opening onto the map
  s += fan(W - i - st, i + st, 90, 18) + fan(W - i - st, W - i - st, 180, 18) + fan(i + st, W - i - st, 270, 18);
  return s;
}

// ---------------------------------------------------------------- defs
function defs(fontCss, mode) {
  let s = `<style>${fontCss}</style>`;
  for (const [k, b] of Object.entries(BOROUGHS))
    s += `<radialGradient id="fill-${k}" cx=".45" cy=".4" r=".8"><stop offset="0" stop-color="${lift(b.fill[0])}"/><stop offset="1" stop-color="${lift(b.fill[1])}"/></radialGradient>`;
  // The Heat Track's metals and lacquer.
  const metal = (id, [lt, md, dk], x2 = 1, y2 = 1) => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}"><stop offset="0" stop-color="${lt}"/><stop offset=".28" stop-color="${md}"/><stop offset=".52" stop-color="${dk}"/><stop offset=".78" stop-color="${md}"/><stop offset="1" stop-color="${lt}"/></linearGradient>`;
  s += metal('bezelGilt', GILT) + metal('bezelCopper', COPPER);
  const engraved = (id, [lt, md, dk]) => `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${lt}"/><stop offset=".55" stop-color="${md}"/><stop offset="1" stop-color="${dk}"/></linearGradient>`;
  s += engraved('giltText', GILT) + engraved('copperText', COPPER);
  s += `<radialGradient id="heatFloor" cx=".5" cy=".58" r=".62"><stop offset="0" stop-color="#2b1e13"/><stop offset=".75" stop-color="#140d08"/><stop offset="1" stop-color="#050302"/></radialGradient>`;
  s += `<radialGradient id="heatFloorRaid" cx=".5" cy=".58" r=".62"><stop offset="0" stop-color="#4d1a14"/><stop offset=".75" stop-color="#2a0c09"/><stop offset="1" stop-color="#0d0403"/></radialGradient>`;
  s += `<linearGradient id="heatRecess" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".55"/><stop offset=".35" stop-color="#000" stop-opacity="0"/><stop offset=".85" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#f3dc95" stop-opacity=".06"/></linearGradient>`;
  s += `<linearGradient id="stillPlate" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#33241a"/><stop offset="1" stop-color="#150e09"/></linearGradient>`;
  s += `<linearGradient id="lacquer" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#261b11"/><stop offset="1" stop-color="#0e0906"/></linearGradient>`;
  s += `<linearGradient id="heatTray" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#050302"/><stop offset="1" stop-color="#1c140c"/></linearGradient>`;
  s += `<linearGradient id="heatLip" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${GILT[2]}"/><stop offset=".5" stop-color="${GILT[1]}"/><stop offset="1" stop-color="${GILT[0]}"/></linearGradient>`;
  s += `<linearGradient id="panel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.panelA}"/><stop offset="1" stop-color="${C.panelB}"/></linearGradient>`;
  s += `<radialGradient id="sea" cx=".55" cy=".5" r=".75"><stop offset="0" stop-color="${lift(C.sea[0])}"/><stop offset="1" stop-color="${lift(C.sea[1])}"/></radialGradient>`;
  s += `<pattern id="offboard" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="${lift(C.offboard)}"/><line x1="0" y1="0" x2="0" y2="6" stroke="#000" stroke-opacity=".22" stroke-width="1.6"/></pattern>`;
  s += `<filter id="soft" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="4.5"/></filter>`;
  const H = WARD_HATCH, shade = MODE === 'print' ? PRINT_LIFT.wardShade : H.shade;
  s += `<pattern id="wardHatch" patternUnits="userSpaceOnUse" width="${H.pitch}" height="${H.pitch}" patternTransform="rotate(45)"><rect width="${H.pitch}" height="${H.pitch}" fill="#000" fill-opacity="${shade}"/><path d="M0 0 V${H.pitch}" stroke="${C.goldLine}" stroke-opacity="${H.gold}" stroke-width="${H.line}"/></pattern>`;
  s += `<filter id="blur2" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.6"/></filter>`;
  // lift: the Stills and zone roundels cast a soft shadow, like pieces on the board
  s += `<filter id="lift" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx=".8" dy="1.5" stdDeviation="1.3" flood-color="#000" flood-opacity=".6"/></filter>`;
  s += leatherFilter('leather', LEATHER[mode].board) + leatherFilter('leatherFine', LEATHER[mode].fine);
  return `<defs>${s}</defs>`;
}

// ---------------------------------------------------------------- leather
// All procedural, so it prints crisp at any size. The pebble grain is single-octave
// crease patterns multiplied, so their crossings close off irregular cells (one
// pattern alone draws worm-like squiggles at print scale); blurred to round the
// pebbles, over soft wrinkles. It is lit for shading, soft-light blended onto the
// art, given a sheen on the raised grain, then mottled like uneven dye.
// board: the hide, pebbles 2 to 3 mm across at 24in. fine: the Heat corner, a
// finer, flatter skin stitched in. The screen presets drop the pebbles.
const LEATHER = {
  print: {
    board: { creases: [[0.1, 4], [0.13, 17], [0.17, 29]], blur: 0.45, pebble: 0.6, wrinkle: [0.016, 0.6], relief: 1.25, depth: 0.42, sheen: 0.12, dye: 0.3 },
    fine: { creases: [[0.3, 5], [0.38, 18], [0.48, 30]], blur: 0.22, pebble: 0.7, wrinkle: [0.03, 0.2], relief: 0.9, depth: 0.4, sheen: 0.08, dye: 0.12 },
  },
  screen: {
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
    add(TYPE.sign, upper(d.name));
    upper(d.name).split(' ').forEach(n => add(TYPE.sign, n));
    if (d.venue) add(TYPE.signVenue, d.venue);
  }
  for (const b of Object.values(BOROUGHS)) add(TYPE.boro, upper(b.name));
  for (const [t] of WATER_LABELS) add(TYPE.water, t);
  for (const { name } of geo.bridges) add(TYPE.bridge, name);
  for (const [, t, chips] of KEY_ROWS) { add(TYPE.keyHead, upper(t)); for (const [, p] of chips) add(TYPE.price, p); }
  add(TYPE.panelHead, 'HEAT');
  add(TYPE.titleCity, 'NEW YORK');
  add(TYPE.titleYear, '1929');
  return items;
}

function buildSvg(fontCss, mode, placed) {
  MODE = mode;
  const art = `<rect width="1080" height="1080" fill="url(#sea)"/>` + waterLining()
    + OFFBOARD.map(k => `<path d="${poly(geo.regions[k])}" fill="url(#offboard)"/>`).join('')
    + districtFills() + borders() + piers() + bridges();
  const labels = DISTRICTS.map(d => placed[d.id].c.draw(placed[d.id].x, placed[d.id].y)).join('');
  const side = sidePanels(), b = mode === 'print' ? BLEED : 0, S = 1080 + 2 * b;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-b} ${-b} ${S} ${S}" width="${S}" height="${S}">`
    + `<title>Moonshine Kingdom: the City Map</title>`
    + defs(fontCss, mode)
    + (b ? `<rect x="${-b}" y="${-b}" width="${S}" height="${S}" fill="#0b0907"/>` : '')
    + `<g id="map" filter="url(#leather)">${art}${seams()}</g>`
    + `<g id="panel-grounds" filter="url(#leatherFine)">${side.bg}</g>`
    + `<g id="labels">${mapLabels()}${labels}</g>`
    + `<g id="panels">${side.fg}${title()}</g>`
    + `<g id="frame">${frame()}${side.top}</g>`
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

// Each output: [file, scale, svg, quality, trim]. trim cuts a print SVG's bleed off,
// for the preview; otherwise the whole SVG is rendered, bleed and all.
async function render(browser, outputs) {
  for (const [file, scale, svg, quality = 90, trim = false] of outputs) {
    const size = +svg.match(/<svg[^>]* width="([\d.]+)"/)[1], b = trim ? (size - 1080) / 2 : 0;
    const page = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: scale });
    await page.setContent(`<!doctype html><html><body style="margin:0;background:#000">${svg}</body></html>`);
    await page.evaluate(async () => { await document.fonts.ready; });
    // the 300dpi render outlasts the default 30s screenshot timeout, so give it no limit
    await page.screenshot({ path: file, clip: { x: b, y: b, width: size - 2 * b, height: size - 2 * b }, timeout: 0, ...(file.endsWith('.jpg') ? { quality } : {}) });
    await page.close();
    if (!file.startsWith(os.tmpdir())) console.log('wrote', path.relative(ROOT, file));
  }
}

async function indexTile(browser, svg) {
  const [x, y, w] = TILE_CROP;
  const page = await browser.newPage({ viewport: { width: 1080, height: 1080 }, deviceScaleFactor: 800 / w });
  await page.setContent(`<!doctype html><html><body style="margin:0;background:#000">${svg}</body></html>`);
  await page.evaluate(async () => { await document.fonts.ready; });
  await page.screenshot({ path: OUT.indexTile, clip: { x, y, width: w, height: w * 9 / 16 }, quality: 85, timeout: 0 });
  await page.close();
  console.log('wrote', path.relative(ROOT, OUT.indexTile));
}

// The print PDF: one 24in page holding the 300dpi render as a JPEG. Printing the SVG
// straight to PDF would rasterise its filters at the browser's own, lower resolution.
async function printPdf(browser, svg) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'board-'));
  const jpg = path.join(tmp, 'board.jpg'), html = path.join(tmp, 'board.html');
  await render(browser, [[jpg, BOARD_PX / 1080, svg, 92]]);
  const inch = BOARD_IN * (1080 + 2 * BLEED) / 1080; // the page includes the bleed
  fs.writeFileSync(html, `<!doctype html><html><head><style>@page{size:${inch}in ${inch}in;margin:0}html,body{margin:0}img{display:block;width:${inch}in;height:${inch}in}</style></head><body><img src="board.jpg"></body></html>`);
  const page = await browser.newPage();
  await page.goto('file://' + html);
  await page.evaluate(() => document.images[0].decode());
  await page.pdf({ path: OUT.printPdf, width: `${inch}in`, height: `${inch}in`, printBackground: true, pageRanges: '1' });
  await page.close();
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log('wrote', path.relative(ROOT, OUT.printPdf));
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
    console.log(`  ${d.id.padEnd(15)} sign at ${f(x, 0)},${f(y, 0)}  margin ${f(open, 0)}  room ${f(room(d, placed[d.id]), 0)} cm²  hangers ${f(placed[d.id].hang, 0)}  off ${f(placed[d.id].off, 0)}${c.opts.stacked ? ' stacked' : ''}${c.opts.drop ? ' drop' : ''}`);
  }
  if (arg('report')) { // each District's placement and room, and its sign's shapes, as JSON
    const report = Object.fromEntries(DISTRICTS.map(d => {
      const { x, y, c, hang } = placed[d.id];
      const shapes = SIGN_SHAPES(d).map(([opts, cost]) => { const k = cluster(d, opts); return { opts, cost, w: k.w, h: k.h }; });
      return [d.id, { zone: d.zone, x, y, w: c.w, h: c.h, hang, room: room(d, placed[d.id]), shapes }];
    }));
    fs.writeFileSync(arg('report'), JSON.stringify(report, null, 1));
  }
  const print = buildSvg(fontCss, 'print', placed), screen = buildSvg(fontCss, 'screen', placed);
  fs.mkdirSync(DIR, { recursive: true });
  for (const [file, svg] of [[OUT.printSvg, print], [OUT.screenSvg, screen]]) {
    fs.writeFileSync(file, svg);
    console.log('wrote', path.relative(ROOT, file));
  }
  const outputs = [[OUT.screenJpg, 2, screen], [OUT.printJpg, 2, print, 90, true]];
  const full = process.argv.includes('--print');
  if (full) outputs.push([OUT.printPng, BOARD_PX / 1080, print], [OUT.screenLarge, 4, screen]);
  await render(browser, outputs);
  await indexTile(browser, screen);
  if (full) await printPdf(browser, print);
  await browser.close();
})();
