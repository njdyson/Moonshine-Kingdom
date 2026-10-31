// Powder Keg board-mark mockups (powder-keg-handoff.md). Not part of the board build:
// it takes the built screen board, pins a candidate mark on the factory Docks' signs, and
// renders a comparison sheet to Art/Board/Mockups/powder-keg-marks.jpg.
//   node tools/mock_powder_keg.js
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const ROOT = path.join(__dirname, '..');
const BOARD = fs.readFileSync(path.join(ROOT, 'Art/Board/Board v0.9 (screen).svg'), 'utf8');
const OUT = path.join(ROOT, 'Art/Board/Mockups/powder-keg-marks.jpg');

// The factory Docks (Nick, 2026-10-31): the two Docks nobody starts on, and Staten Island's pair.
const DOCKS = ['WEST SIDE', 'JAMAICA', 'STAPLETON', 'TOTTENVILLE'];

// Where a sign's medallion sits, from its name (build_board.js cluster(): the name starts
// pad + 2sr + G1 = 26.5 in from the sign's left, centred on the sign's middle).
function medallion(name) {
  const m = BOARD.match(new RegExp(`<text x="([\\d.]+)" y="([\\d.]+)"[^>]*>${name}</text>`));
  if (!m) throw new Error(`No sign for ${name}`);
  const x = +m[1], cy = +m[2] - 12.5 * 0.35;
  return [x - 26.5 + 4.5 + 9, cy];
}

// The marks, each drawn in a 20-unit box about (0, 0). All original paths.
const burst = (n, r1, r2, rot = 0) => Array.from({ length: n * 2 }, (_, i) => {
  const a = (i * Math.PI) / n + rot, r = i % 2 ? r2 : r1;
  return `${(Math.cos(a) * r).toFixed(2)},${(Math.sin(a) * r).toFixed(2)}`;
}).join(' ');
const MARKS = {
  'A  Starburst': `
    <polygon points="${burst(11, 10, 5.6, 0.2)}" fill="#c8361d" stroke="#2a0c06" stroke-width=".8" stroke-linejoin="round"/>
    <polygon points="${burst(9, 6.4, 3.4, 0.5)}" fill="#f2a12c"/>
    <circle r="2.3" fill="#fbe38a"/>`,
  'B  Bomb and fuse': `
    <circle cx="-1.2" cy="2" r="7" fill="#17110c" stroke="#d9b45a" stroke-width="1"/>
    <rect x="1.6" y="-6.6" width="4.2" height="3.4" rx=".6" transform="rotate(40 3.7 -4.9)" fill="#17110c" stroke="#d9b45a" stroke-width=".8"/>
    <path d="M5.4 -6.6 Q 7.6 -9.6 6.2 -11" fill="none" stroke="#d9b45a" stroke-width=".9" stroke-linecap="round"/>
    <polygon points="${burst(6, 3.2, 1.2)}" transform="translate(6.4 -11.4)" fill="#f2a12c" stroke="#c8361d" stroke-width=".5"/>
    <ellipse cx="-3.6" cy="-0.6" rx="1.7" ry="1.1" fill="#fff" fill-opacity=".35" transform="rotate(-35 -3.6 -0.6)"/>`,
  'C  Dynamite': `
    <g stroke="#2a0c06" stroke-width=".6">
      <rect x="-7.5" y="-3" width="4.6" height="12" rx="1.4" fill="#b8321c"/>
      <rect x="-2.3" y="-4" width="4.6" height="13" rx="1.4" fill="#c8361d"/>
      <rect x="2.9" y="-3" width="4.6" height="12" rx="1.4" fill="#b8321c"/>
    </g>
    <rect x="-8" y="3" width="16" height="2" fill="#d9b45a"/>
    <path d="M0 -4 Q 1 -8 4 -8.6" fill="none" stroke="#d9b45a" stroke-width=".9" stroke-linecap="round"/>
    <polygon points="${burst(6, 3.2, 1.2)}" transform="translate(4.8 -8.8)" fill="#f2a12c" stroke="#c8361d" stroke-width=".5"/>`,
  'D  Fuse spark': `
    <polygon points="${burst(4, 10, 2.2, -Math.PI / 4)}" fill="#f2a12c" stroke="#7a2410" stroke-width=".6" stroke-linejoin="round"/>
    <polygon points="${burst(4, 6.2, 1.6, 0)}" fill="#fbe38a"/>
    <circle r="1.6" fill="#fff8d8"/>`,
};

// The mark hangs off the sign's lower edge under the medallion, clear of the name, so it
// reads as a property of the District rather than a second District type.
function pin(markSvg, [mx, my], disc) {
  const x = mx + 4, y = my + 15, s = disc ? 0.62 : 0.78;
  const back = disc ? `<circle r="8.2" fill="#140e09" stroke="#d9b45a" stroke-width="1.1"/>` : '';
  return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><circle r="9" fill="#000" fill-opacity=".45" transform="translate(.8 1.4)"/>${back}<g transform="scale(${s})">${markSvg}</g></g>`;
}

function boardWith(markSvg, disc) {
  const pins = DOCKS.map(n => pin(markSvg, medallion(n), disc)).join('');
  return BOARD.replace(/<\/svg>\s*$/, `<g id="powder-keg-mock">${pins}</g></svg>`);
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1080 }, deviceScaleFactor: 2.5 });
  const shots = [];
  const crops = { 'West Side': [280, 280, 200, 110], 'Jamaica': [860, 770, 200, 110] };
  for (const disc of [true, false]) for (const [label, svg] of Object.entries(MARKS)) {
    await page.setContent(`<html><body style="margin:0;background:#000">${boardWith(svg, disc)}</body></html>`);
    await page.waitForTimeout(150);
    const row = [];
    for (const [where, [x, y, w, h]] of Object.entries(crops))
      row.push({ where, b64: (await page.screenshot({ clip: { x, y, width: w, height: h } })).toString('base64') });
    shots.push({ label: `${label}${disc ? ' (in a disc)' : ' (bare)'}`, row });
  }
  // a whole-board thumbnail with mark A, for the overall texture
  await page.setContent(`<html><body style="margin:0;background:#000">${boardWith(MARKS['A  Starburst'], true)}</body></html>`);
  await page.waitForTimeout(150);
  const whole = (await page.screenshot({ clip: { x: 0, y: 0, width: 1080, height: 1080 } })).toString('base64');

  const sheet = `<html><body style="margin:0;background:#1a140f;color:#efe3cd;font:16px 'Barlow Condensed',sans-serif;padding:24px;width:1500px">
    <h1 style="margin:0 0 4px;font-size:30px">Powder Keg: board marks (mockup)</h1>
    <p style="margin:0 0 18px;color:#c9b48a">Pinned on the four factory Docks. Crops at 2.5x, West Side and Jamaica. Bottom: mark A in a disc on the whole board.</p>
    ${shots.map(s => `<div style="display:flex;align-items:center;gap:16px;margin-bottom:12px">
      <div style="width:220px;font-size:20px">${s.label}</div>
      ${s.row.map(r => `<img src="data:image/png;base64,${r.b64}" style="width:600px;border:1px solid #5a4a30">`).join('')}
    </div>`).join('')}
    <img src="data:image/png;base64,${whole}" style="width:1000px;margin-top:12px;border:1px solid #5a4a30">
  </body></html>`;
  const sp = await browser.newPage({ viewport: { width: 1550, height: 800 } });
  await sp.setContent(sheet);
  await sp.waitForTimeout(300);
  await sp.screenshot({ path: OUT, fullPage: true, type: 'jpeg', quality: 85 });
  await browser.close();
  console.log('wrote', path.relative(ROOT, OUT));
})();
