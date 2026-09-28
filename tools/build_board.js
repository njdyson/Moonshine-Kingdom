#!/usr/bin/env node
// Builds the game board as a vector SVG from Art/Board/board-geometry.json and
// the District Roster below, then renders PNGs through Playwright's Chromium.
//
//   node tools/build_board.js           SVG + 2160px preview JPEG
//   node tools/build_board.js --print   also a 5400px PNG (18in at 300dpi, not committed)
//
// The roster must match the Town Planner (District Roster table): zone, Still
// number and venue name for every District, Borough numbers in Raid order.
// Pressure is not stored: it is 6 - |Still - 7|, as on the Still Tokens.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIR = path.join(ROOT, 'Art', 'Board');
const SVG_OUT = path.join(DIR, 'Board v0.9.svg');
const geo = JSON.parse(fs.readFileSync(path.join(DIR, 'board-geometry.json'), 'utf8'));

// ---------------------------------------------------------------- palette
const C = {
  gold: '#c9a437', goldBright: '#e8cc72', goldLine: '#b9932f', goldDim: '#a98c4f',
  ink: '#efe3cd', body: '#d8caae', muted: '#b8a577', cream: '#f5e9d9',
  water: '#111720', waterLine: '#b9932f', offboard: '#35312d', shadow: '#0a0604',
  panelA: '#241c14', panelB: '#19130c', boiler: '#130207', strip: '#0d0005', rivet: '#8a7329',
};
// Pressure ramp, bottom cell first: identical to the Still Tokens.
const RAMP = ['#e8c85a', '#dcb246', '#d49a37', '#cf7f33', '#c8632e', '#c0472a'];

// Borough fills keep the hues of the Affinity board: [centre, edge].
const BOROUGHS = {
  MN: { n: 1, name: 'Manhattan', fill: ['#62191c', '#3b0d10'] },
  BX: { n: 2, name: 'The Bronx', fill: ['#16391b', '#081f0b'] },
  QN: { n: 3, name: 'Queens', fill: ['#33283f', '#1c1623'] },
  BK: { n: 4, name: 'Brooklyn', fill: ['#55212f', '#34121b'] },
  SI: { n: 5, name: 'Staten Island', fill: ['#2d2522', '#191312'] },
};

// ---------------------------------------------------------------- roster
// at: centre of the District name, placed where the Affinity board had it.
const DISTRICTS = [
  { id: 'five_points', name: 'Five Points', boro: 'MN', zone: 'ward', still: 10, at: [340, 478] },
  { id: 'sugar_hill', name: 'Sugar Hill', boro: 'MN', zone: 'hs', still: 7, venue: 'The Cotton Club', at: [486, 186] },
  { id: 'east_harlem', name: 'East Harlem', boro: 'MN', zone: 'speak', still: 12, venue: 'The Silver Dollar', at: [602, 294] },
  { id: 'tenderloin', name: 'The Tenderloin', boro: 'MN', zone: 'speak', still: 8, venue: 'The Haymarket', at: [396, 376] },
  { id: 'west_side', name: 'West Side', boro: 'MN', zone: 'dock', still: 11, at: [440, 286] },
  { id: 'bowery', name: 'The Bowery', boro: 'MN', zone: 'dock', still: 9, at: [262, 590] },
  { id: 'hunts_point', name: 'Hunts Point', boro: 'BX', zone: 'ward', still: 9, at: [720, 215] },
  { id: 'morris_park', name: 'Morris Park', boro: 'BX', zone: 'hs', still: 7, venue: 'The Jockey Club', at: [964, 104] },
  { id: 'belmont', name: 'Belmont', boro: 'BX', zone: 'speak', still: 11, venue: 'DeLillo’s', at: [622, 86] },
  { id: 'fordham', name: 'Fordham', boro: 'BX', zone: 'speak', still: 8, venue: 'The Penny Whistle', at: [806, 90] },
  { id: 'throggs_neck', name: 'Throggs Neck', boro: 'BX', zone: 'dock', still: 10, at: [922, 240] },
  { id: 'corona', name: 'Corona', boro: 'QN', zone: 'ward', still: 4, at: [770, 590] },
  { id: 'richmond_hill', name: 'Richmond Hill', boro: 'QN', zone: 'hs', still: 7, venue: 'The Triangle', at: [912, 704] },
  { id: 'astoria', name: 'Astoria', boro: 'QN', zone: 'speak', still: 2, venue: 'Bohemian Hall', at: [730, 440] },
  { id: 'flushing', name: 'Flushing', boro: 'QN', zone: 'speak', still: 6, venue: 'Paradise Alley', at: [938, 546] },
  { id: 'whitestone', name: 'Whitestone', boro: 'QN', zone: 'dock', still: 5, at: [918, 400] },
  { id: 'jamaica', name: 'Jamaica', boro: 'QN', zone: 'dock', still: 3, at: [936, 874] },
  { id: 'brownsville', name: 'Brownsville', boro: 'BK', zone: 'ward', still: 5, at: [690, 756] },
  { id: 'williamsburg', name: 'Williamsburg', boro: 'BK', zone: 'hs', still: 7, venue: 'The Havemeyer', at: [578, 600] },
  { id: 'coney_island', name: 'Coney Island', boro: 'BK', zone: 'speak', still: 3, venue: 'Ruby’s Joint', at: [364, 866] },
  { id: 'red_hook', name: 'Red Hook', boro: 'BK', zone: 'speak', still: 6, venue: 'Sunny’s Bar', at: [470, 704] },
  { id: 'sheepshead_bay', name: 'Sheepshead Bay', boro: 'BK', zone: 'dock', still: 4, at: [530, 872] },
  { id: 'stapleton', name: 'Stapleton', boro: 'SI', zone: 'ward', still: 6, at: [152, 852] },
  { id: 'westerleigh', name: 'Westerleigh', boro: 'SI', zone: 'dock', still: 2, at: [152, 748] },
  { id: 'tottenville', name: 'Tottenville', boro: 'SI', zone: 'dock', still: 4, at: [150, 958] },
];
const OFFBOARD = ['nj', 'north', 'east'];

// Borough labels sit in the water, as on the Affinity board: [x, y, rotation].
const BORO_LABELS = {
  MN: [246, 380, -54.2], BX: [1049, 262, -90], QN: [890, 1041, -6.6],
  BK: [525, 1031, 8.6], SI: [150, 1057, 0],
};
const WATER_LABELS = [
  ['East River', 566, 476, -50.5, 11], ['Jamaica Bay', 732, 924, 0, 12.5],
];

// ---------------------------------------------------------------- icons
// Pulled from Art/Icons so the board stays in step with the other components.
function loadIcon(file) {
  const src = fs.readFileSync(path.join(ROOT, 'Art', 'Icons', file), 'utf8');
  const vb = src.match(/viewBox="([^"]+)"/)[1].split(/[\s,]+/).map(Number);
  const ds = [...src.matchAll(/\sd="([^"]+)"/g)].map(m => m[1].replace(/\s+/g, ' '));
  return { vb, ds };
}
const ICONS = {
  speak: loadIcon('Tumbler.svg'), ward: loadIcon('Fist.svg'),
  dock: loadIcon('anchor.svg'), crown: loadIcon('Crown.svg'),
};
// Crown.svg is a stroke icon; the rest are filled silhouettes.
function icon(kind, cx, cy, size, color) {
  const { vb, ds } = ICONS[kind];
  const s = size / Math.max(vb[2], vb[3]);
  const tx = cx - (vb[0] + vb[2] / 2) * s, ty = cy - (vb[1] + vb[3] / 2) * s;
  const paint = kind === 'crown'
    ? `fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"`
    : `fill="${color}"`;
  return `<g transform="translate(${f(tx)} ${f(ty)}) scale(${f(s, 4)})" ${paint}>${ds.map(d => `<path d="${d}"/>`).join('')}</g>`;
}

// ---------------------------------------------------------------- helpers
const f = (v, dp = 2) => +v.toFixed(dp);
const pts = p => p.map(([x, y]) => `${f(x)},${f(y)}`).join(' ');
const poly = p => `M${p.map(([x, y]) => `${f(x)} ${f(y)}`).join(' L')} Z`;
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const byId = Object.fromEntries(DISTRICTS.map(d => [d.id, d]));

// Legible type on a textured ground: a dark keyline under the fill.
function label(text, x, y, { size, family = 'Cinzel', weight = 700, fill = C.goldBright, spacing = 0.8, anchor = 'middle', italic = false, halo = 2.6, rotate = 0 }) {
  const common = `x="${f(x)}" y="${f(y)}" font-family="${family}" font-weight="${weight}" font-size="${size}" letter-spacing="${spacing}" text-anchor="${anchor}"${italic ? ' font-style="italic"' : ''}${rotate ? ` transform="rotate(${rotate} ${f(x)} ${f(y)})"` : ''}`;
  const t = esc(text);
  return (halo ? `<text ${common} fill="none" stroke="${C.shadow}" stroke-opacity=".85" stroke-width="${halo}" stroke-linejoin="round">${t}</text>` : '')
    + `<text ${common} fill="${fill}">${t}</text>`;
}

// A Still as printed on the board: boiler with its number, Pressure strip beside.
// Drawn from the Still Token art at board scale. Box is 33 x 35; (x, y) = top left.
function still(n, x, y) {
  const p = 6 - Math.abs(n - 7);
  let s = `<g transform="translate(${f(x)} ${f(y)})">`;
  s += `<rect x="7" y="0" width="8" height="4.5" rx="1.3" fill="${C.boiler}" stroke="${C.gold}" stroke-width="1"/>`;
  s += `<path d="M4.5 30.5 l-1.6 4 M17.5 30.5 l1.6 4" stroke="${C.gold}" stroke-width="1.3" stroke-linecap="round"/>`;
  s += `<rect x="0.5" y="3.5" width="21.5" height="27.5" rx="4.2" fill="${C.boiler}" stroke="${C.gold}" stroke-width="1.4"/>`;
  s += [8, 17.2, 26.4].map(cy => `<circle cx="3.4" cy="${cy}" r=".75" fill="${C.rivet}"/>`).join('');
  s += `<text x="12.4" y="${n > 9 ? 25.2 : 25.8}" font-family="Bebas Neue" font-size="${n > 9 ? 19 : 21}" text-anchor="middle" fill="${C.cream}">${n}</text>`;
  s += `<rect x="21" y="15.5" width="5" height="3.2" rx="1" fill="${C.boiler}" stroke="${C.gold}" stroke-width=".8"/>`;
  s += `<rect x="25.2" y="3.5" width="7.3" height="28" rx="3.6" fill="${C.strip}" stroke="${C.gold}" stroke-width="1.1"/>`;
  for (let i = 0; i < 6; i++) {
    const cy = 27.6 - i * 3.95, lit = i < p;
    s += `<rect x="26.85" y="${f(cy - 1.6)}" width="4" height="3.2" rx=".8" fill="${RAMP[i]}" fill-opacity="${lit ? 1 : 0.11}" stroke="${RAMP[i]}" stroke-opacity="${lit ? 1 : 0.26}" stroke-width=".4"/>`;
  }
  return s + '</g>';
}

// ---------------------------------------------------------------- layers
const regionBoro = id => (byId[id] ? byId[id].boro : null);

function waterLining() {
  // Engraved coast rings: alternate gold and water strokes, widest first, under the land.
  const land = [...DISTRICTS.map(d => geo.regions[d.id]), ...OFFBOARD.map(k => geo.regions[k])];
  const rings = [[23, C.waterLine, 0.07], [19.5, C.water, 1], [14, C.waterLine, 0.11], [11, C.water, 1], [6.5, C.waterLine, 0.18], [4, C.water, 1]];
  return rings.map(([w, col, op]) =>
    `<g fill="none" stroke="${col}" stroke-opacity="${op}" stroke-width="${w}" stroke-linejoin="round">${land.map(p => `<path d="${poly(p)}"/>`).join('')}</g>`).join('');
}

function offboard() {
  return OFFBOARD.map(k => `<path d="${poly(geo.regions[k])}" fill="url(#offboard)"/>`).join('');
}

function districts() {
  let s = '';
  for (const d of DISTRICTS) {
    const p = geo.regions[d.id];
    s += `<clipPath id="clip-${d.id}"><path d="${poly(p)}"/></clipPath>`;
    s += `<path d="${poly(p)}" fill="url(#fill-${d.boro})"/>`;
    // inner shade: a blurred dark stroke clipped to the District itself
    s += `<g clip-path="url(#clip-${d.id})"><path d="${poly(p)}" fill="none" stroke="#000" stroke-opacity=".55" stroke-width="16" filter="url(#soft)"/></g>`;
  }
  return s;
}

function borders() {
  // Coasts heaviest, then Borough lines over land, then District lines.
  const coast = [], boro = [], inner = [], off = [];
  for (const c of geo.chains) {
    const [a, b] = c.sides, ba = regionBoro(a), bb = regionBoro(b);
    if (ba && bb) (ba === bb ? inner : boro).push(c.pts);
    else if (ba || bb) coast.push(c.pts);
    else if ([a, b].includes('water')) off.push(c.pts);
  }
  const line = (list, w, col, op = 1) => `<g fill="none" stroke="${col}" stroke-opacity="${op}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round">${list.map(p => `<polyline points="${pts(p)}"/>`).join('')}</g>`;
  return line(off, 1.6, C.goldDim, 0.55)
    + line(inner, 1.4, C.goldLine, 0.9)
    + line(boro, 2.8, C.gold)
    + line(coast, 3.4, C.gold)
    + line(coast, 0.8, '#f3dc95', 0.55);
}

function bridges() {
  // Deck with planking and an abutment on each shore; runs 4 units onto the land.
  return geo.bridges.map(({ a, b }) => {
    const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
    const A = [a[0] - ux * 4, a[1] - uy * 4], B = [b[0] + ux * 4, b[1] + uy * 4];
    const nx = -uy, ny = ux, h = 8;
    const cap = ([x, y]) => `M${f(x + nx * h)} ${f(y + ny * h)} L${f(x - nx * h)} ${f(y - ny * h)}`;
    const seg = `M${f(A[0])} ${f(A[1])} L${f(B[0])} ${f(B[1])}`;
    return `<g stroke-linecap="butt">`
      + `<path d="${seg}" stroke="${C.shadow}" stroke-opacity=".7" stroke-width="14"/>`
      + `<path d="${seg}" stroke="${C.gold}" stroke-width="11"/>`
      + `<path d="${seg}" stroke="#2b1c0f" stroke-width="8"/>`
      + `<path d="${seg}" stroke="${C.goldDim}" stroke-width="8" stroke-dasharray="1.3 2.4" stroke-opacity=".75"/>`
      + `<path d="${cap([a[0] + ux * 1.5, a[1] + uy * 1.5])} ${cap([b[0] - ux * 1.5, b[1] - uy * 1.5])}" stroke="${C.goldBright}" stroke-width="2.2" stroke-linecap="round"/>`
      + `</g>`;
  }).join('');
}

function districtLabels() {
  let s = '';
  for (const d of DISTRICTS) {
    const [x, y] = d.at;
    const hs = d.zone === 'hs';
    if (hs) s += icon('crown', x, y - 17, 15, C.goldBright);
    s += label(d.name.toUpperCase(), x, y + 4.5, { size: 12.2, spacing: 0.7, fill: hs ? C.goldBright : '#e3cf98' });
    let rowTop = y + 11;
    if (d.venue) {
      s += label(d.venue, x, y + 16.5, { size: 8.8, family: 'Barlow', weight: 500, italic: true, spacing: 0.2, fill: C.body, halo: 2 });
      rowTop = y + 21;
    }
    // zone icon and Still side by side, centred under the name
    const iconSize = d.zone === 'ward' ? 23 : 22, gap = 7, w = iconSize + gap + 33;
    const x0 = x - w / 2, cy = rowTop + 17;
    const kind = hs ? 'speak' : d.zone;
    s += icon(kind, x0 + iconSize / 2, cy, iconSize + 2.4, C.shadow);
    s += icon(kind, x0 + iconSize / 2, cy, iconSize, hs ? C.goldBright : C.gold);
    s += still(d.still, x0 + iconSize + gap, rowTop);
  }
  return s;
}

function boroughLabels() {
  let s = '';
  for (const [k, [x, y, r]] of Object.entries(BORO_LABELS)) {
    const b = BOROUGHS[k], text = b.name.toUpperCase();
    const size = 19, spacing = 3.4;
    const width = text.length * (size * 0.74 + spacing); // Cinzel caps, near enough to centre
    const total = 22 + 8 + width, left = -total / 2;
    s += `<g transform="translate(${f(x)} ${f(y)}) rotate(${r})">`;
    s += `<rect x="${f(left)}" y="-17" width="22" height="22" rx="4" fill="${C.gold}" stroke="${C.shadow}" stroke-width="1.2"/>`;
    s += `<text x="${f(left + 11)}" y="0.5" font-family="Cinzel" font-weight="700" font-size="16" text-anchor="middle" fill="#1b150e">${b.n}</text>`;
    s += label(text, left + 30, 0, { size, spacing, anchor: 'start', fill: C.gold, halo: 3 });
    s += `</g>`;
  }
  for (const [t, x, y, r, size] of WATER_LABELS)
    s += label(t, x, y, { size, family: 'Barlow', weight: 500, italic: true, spacing: 1.2, fill: C.goldDim, halo: 0, rotate: r });
  return s;
}

// ---------------------------------------------------------------- side panels
function panel(x, y, w, h, title) {
  return `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="url(#panel)" stroke="${C.goldLine}" stroke-width="1.8"/>`
    + `<rect x="${x + 4}" y="${y + 4}" width="${w - 8}" height="${h - 8}" rx="3" fill="none" stroke="${C.goldLine}" stroke-opacity=".35" stroke-width=".8"/>`
    + (title ? label(title, x + w / 2, y + 19, { size: 12, spacing: 3, fill: C.goldBright, halo: 0 }) : '') + `</g>`;
}

function heatAndMash() {
  // Heat Track 1-5 (the 5th sets off a Raid) with a square for the Mash die.
  const x = 24, y = 24, w = 336, h = 86;
  let s = panel(x, y, w, h, '');
  s += label('HEAT', x + 128, y + 18, { size: 11.5, spacing: 3, fill: C.goldBright, halo: 0 });
  const cols = ['#8a6a17', '#8f4f1b', '#93391c', '#962b1d', '#9d1f1f'];
  for (let i = 0; i < 5; i++) {
    const cx = x + 32 + i * 48, cy = y + 50;
    s += `<circle cx="${cx}" cy="${cy}" r="20.5" fill="${cols[i]}" stroke="${C.gold}" stroke-width="1.8"/>`;
    s += `<circle cx="${cx}" cy="${cy}" r="16.5" fill="none" stroke="#000" stroke-opacity=".3" stroke-width="1"/>`;
    s += `<text x="${cx}" y="${cy + 7}" font-family="Cinzel" font-weight="700" font-size="20" text-anchor="middle" fill="#1c130b">${i + 1}</text>`;
  }
  s += label('RAID', x + 32 + 4 * 48, y + 80, { size: 7.5, family: 'Barlow', weight: 700, spacing: 1.6, fill: C.goldBright, halo: 0 });
  s += `<line x1="${x + 263}" y1="${y + 12}" x2="${x + 263}" y2="${y + h - 12}" stroke="${C.goldLine}" stroke-opacity=".45"/>`;
  s += label('MASH', x + 299, y + 18, { size: 11.5, spacing: 3, fill: C.goldBright, halo: 0 });
  s += `<rect x="${x + 278}" y="${y + 29}" width="42" height="42" rx="7" fill="#120d08" stroke="${C.gold}" stroke-width="1.8" stroke-dasharray="4 3"/>`;
  return s;
}

function key() {
  // Symbols and prices, worded as the Town Planner's legend.
  const x = 24, y = 120, w = 290, h = 124;
  let s = panel(x, y, w, h, '');
  const rows = [
    ['speak', 'Speakeasy', 'Moonshine $300, Rum $500'],
    ['hs', 'High Society', 'Rum only, 1 Kickback each'],
    ['ward', 'Ward', ''],
    ['dock', 'Dock', 'Water Connected to every Dock'],
    ['bridge', 'Bridge', 'Land Connected'],
    ['still', 'Still', 'Pressure: the lit cells'],
  ];
  rows.forEach(([k, t, sub], i) => {
    const cy = y + 16 + i * 18.4, ix = x + 20;
    if (k === 'hs') {
      s += icon('crown', ix - 6, cy - 1, 11, C.goldBright) + icon('speak', ix + 6, cy, 13, C.goldBright);
    } else if (k === 'bridge') {
      s += `<path d="M${ix - 11} ${cy} H${ix + 11}" stroke="${C.gold}" stroke-width="8"/><path d="M${ix - 11} ${cy} H${ix + 11}" stroke="#2b1c0f" stroke-width="5.5"/><path d="M${ix - 11} ${cy} H${ix + 11}" stroke="${C.goldDim}" stroke-width="5.5" stroke-dasharray="1.2 2.2"/>`;
    } else if (k === 'still') {
      s += `<g transform="translate(${ix - 8.5} ${cy - 9}) scale(.52)">${still(7, 0, 0)}</g>`;
    } else s += icon(k, ix, cy, 15, C.gold);
    s += label(t, x + 40, cy + 4, { size: 10.5, family: 'Barlow', weight: 700, spacing: 0.3, fill: C.ink, anchor: 'start', halo: 0 });
    if (sub) s += label(sub, x + 122, cy + 4, { size: 10, family: 'Barlow', weight: 500, spacing: 0.1, fill: C.body, anchor: 'start', halo: 0 });
  });
  return s;
}

function title() {
  // Typeset lockup; the painted logo can be dropped in over it later.
  const cx = 108, cy = 332;
  let s = `<g>`;
  for (let i = 0; i < 13; i++) {
    const a = (-160 + i * (140 / 12)) * Math.PI / 180, long = i % 2 === 0;
    const r0 = 25, r1 = long ? 45 : 36;
    s += `<line x1="${f(cx + Math.cos(a) * r0)}" y1="${f(cy - 16 + Math.sin(a) * r0)}" x2="${f(cx + Math.cos(a) * r1)}" y2="${f(cy - 16 + Math.sin(a) * r1)}" stroke="${C.gold}" stroke-width="${long ? 2.2 : 1.3}" stroke-linecap="round"/>`;
  }
  s += `<circle cx="${cx}" cy="${cy - 16}" r="19" fill="url(#moon)" stroke="${C.goldBright}" stroke-width="1.2"/>`;
  s += label('MOONSHINE', cx, cy + 26, { size: 25, spacing: 1.2, fill: C.goldBright, halo: 3.4 });
  s += label('KINGDOM', cx, cy + 52, { size: 22, spacing: 4.2, fill: C.goldBright, halo: 3.4 });
  s += `<path d="M${cx - 64} ${cy + 63} H${cx + 64}" stroke="${C.gold}" stroke-width="1"/>`;
  s += label('NEW YORK · 1929', cx, cy + 77, { size: 9, family: 'Barlow', weight: 600, spacing: 3.4, fill: C.muted, halo: 2 });
  return s + '</g>';
}

function compass() {
  const cx = 72, cy = 508, r = 27;
  let s = `<g opacity=".9"><circle cx="${cx}" cy="${cy}" r="${r - 7}" fill="none" stroke="${C.goldDim}" stroke-width="1"/>`;
  for (let i = 0; i < 8; i++) {
    const a = i * Math.PI / 4 - Math.PI / 2, main = i % 2 === 0, L = main ? r : r * 0.6, wv = main ? 5 : 3.5;
    const tip = [cx + Math.cos(a) * L, cy + Math.sin(a) * L];
    const l = [cx + Math.cos(a - Math.PI / 2) * wv, cy + Math.sin(a - Math.PI / 2) * wv];
    const rr = [cx + Math.cos(a + Math.PI / 2) * wv, cy + Math.sin(a + Math.PI / 2) * wv];
    s += `<path d="M${f(tip[0])} ${f(tip[1])} L${f(l[0])} ${f(l[1])} L${cx} ${cy} Z" fill="${main ? C.gold : C.goldDim}"/>`;
    s += `<path d="M${f(tip[0])} ${f(tip[1])} L${f(rr[0])} ${f(rr[1])} L${cx} ${cy} Z" fill="${main ? '#7a6224' : '#5e4c20'}"/>`;
  }
  s += label('N', cx, cy - r - 4, { size: 10, fill: C.gold, halo: 2 });
  return s + '</g>';
}

function frame() {
  const o = 7, i = 13, W = 1080;
  let s = `<path d="M0 0H${W}V${W}H0Z M${o} ${o}V${W - o}H${W - o}V${o}Z" fill="#0b0907" fill-rule="evenodd"/>`;
  s += `<rect x="${o}" y="${o}" width="${W - 2 * o}" height="${W - 2 * o}" fill="none" stroke="${C.gold}" stroke-width="3"/>`;
  s += `<rect x="${i}" y="${i}" width="${W - 2 * i}" height="${W - 2 * i}" fill="none" stroke="${C.goldLine}" stroke-opacity=".7" stroke-width="1"/>`;
  for (const [x, y] of [[i, i], [W - i, i], [i, W - i], [W - i, W - i]])
    s += `<path d="M${x} ${y - 5} L${x + 5} ${y} L${x} ${y + 5} L${x - 5} ${y} Z" fill="${C.goldBright}"/>`;
  return s;
}

// ---------------------------------------------------------------- defs
function defs(fontCss) {
  let s = `<style>${fontCss}</style>`;
  for (const [k, b] of Object.entries(BOROUGHS))
    s += `<radialGradient id="fill-${k}" cx=".45" cy=".4" r=".75"><stop offset="0" stop-color="${b.fill[0]}"/><stop offset="1" stop-color="${b.fill[1]}"/></radialGradient>`;
  s += `<radialGradient id="moon" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#fbf4dc"/><stop offset=".7" stop-color="#d9cfae"/><stop offset="1" stop-color="#a99c78"/></radialGradient>`;
  s += `<linearGradient id="panel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.panelA}"/><stop offset="1" stop-color="${C.panelB}"/></linearGradient>`;
  s += `<radialGradient id="sea" cx=".55" cy=".5" r=".75"><stop offset="0" stop-color="#16202c"/><stop offset="1" stop-color="${C.water}"/></radialGradient>`;
  s += `<pattern id="offboard" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="7" height="7" fill="${C.offboard}"/><line x1="0" y1="0" x2="0" y2="7" stroke="#000" stroke-opacity=".16" stroke-width="2"/></pattern>`;
  s += `<filter id="soft" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="4.5"/></filter>`;
  // Crumpled-paper grain, soft-light blended into whatever it is applied to.
  s += `<filter id="grain" x="0" y="0" width="1080" height="1080" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">`
    + `<feTurbulence type="fractalNoise" baseFrequency=".032" numOctaves="4" seed="11" result="noise"/>`
    + `<feDiffuseLighting in="noise" surfaceScale="2.2" lighting-color="#fff" result="lit"><feDistantLight azimuth="235" elevation="50"/></feDiffuseLighting>`
    + `<feComponentTransfer in="lit" result="grey"><feFuncR type="linear" slope=".75" intercept="-.075"/><feFuncG type="linear" slope=".9" intercept="-.19"/><feFuncB type="linear" slope=".9" intercept="-.19"/></feComponentTransfer>`
    + `<feBlend in="grey" in2="SourceGraphic" mode="soft-light"/></filter>`;
  return `<defs>${s}</defs>`;
}

// ---------------------------------------------------------------- assemble
function buildSvg(fontCss) {
  const art = `<rect width="1080" height="1080" fill="url(#sea)"/>` + waterLining() + offboard() + districts() + borders() + bridges();
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" width="1080" height="1080">`
    + `<title>Moonshine Kingdom: the City Map</title>`
    + defs(fontCss)
    + `<g id="map" filter="url(#grain)">${art}</g>`
    + `<g id="labels">${boroughLabels()}${districtLabels()}</g>`
    + `<g id="panels">${heatAndMash()}${key()}${title()}${compass()}</g>`
    + `<g id="frame">${frame()}</g>`
    + `</svg>\n`;
}

const FONTS = 'https://fonts.googleapis.com/css2?family=Barlow:ital,wght@0,500;0,600;0,700;1,500&family=Bebas+Neue&family=Cinzel:wght@700&display=block';

// Latin subset only, inlined as data URIs so the SVG renders the same in any
// browser, offline included. All three families are OFL.
async function embeddedFonts(browser) {
  const ctx = await browser.newContext();
  const get = async (url) => {
    const res = await ctx.request.get(url);
    if (!res.ok()) throw new Error(`Font fetch failed (${res.status()}): ${url}`);
    return res;
  };
  const out = [];
  const text = await (await get(FONTS)).text();
  for (const block of text.match(/\/\* latin \*\/\s*@font-face\s*\{[^}]*\}/g) || []) {
    const src = block.match(/url\(([^)]+)\)/)[1];
    const b64 = (await (await get(src)).body()).toString('base64');
    out.push(block.replace(/\/\* latin \*\/\s*/, '').replace(src, 'data:font/woff2;base64,' + b64));
  }
  await ctx.close();
  if (!out.length) throw new Error('No fonts came back from Google Fonts');
  return out.join('\n');
}

async function render(browser, svg, outputs) {
  for (const [file, scale] of outputs) {
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
  const svg = buildSvg(await embeddedFonts(browser));
  fs.writeFileSync(SVG_OUT, svg);
  console.log('wrote', path.relative(ROOT, SVG_OUT));
  const outputs = [[path.join(DIR, 'Board v0.9 (preview).jpg'), 2]];
  if (process.argv.includes('--print')) outputs.push([path.join(DIR, 'Board v0.9 (print).png'), 5]);
  await render(browser, svg, outputs);
  await browser.close();
})();
