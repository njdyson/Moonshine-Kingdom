// The Still: a riveted boiler carrying its number, a handle on top, two feet, and the
// Pressure gauge piped to its side. One drawing for the board's signs (tools/build_board.js
// draws each Still from stillBody) and for the prototype tokens (the build writes
// Art/Still Tokens/SVG and PNG from stillSvg), so the two can never disagree.
//
// Drawn in a 100 x 108 box. Until 2026-10-07 the art was eleven hand-made SVGs; this
// redraws them exactly (Nick: he likes the design) bar the numeral, which is larger and
// centred, and the rivets, which moved from a column down the left side, where they boxed
// the numeral in, to the boiler's four corners.
//
// THE GAUGE IS NOT DECORATION. It is the Pressure reading, 6 - |Still - 7| (the Town
// Planner's District Roster): that many segments lit from the bottom of a six-step
// gold-to-red ramp, the rest dark. 7 runs the full six, 2 and 12 run one.

const GOLD = '#d4af37', LACQUER = '#130207', TUBE = '#0d0005', RIVET = '#8a7329', NUMERAL = '#f5e9d9';
const RAMP = ['#e8c85a', '#dcb246', '#d49a37', '#cf7f33', '#c8632e', '#c0472a']; // bottom to top
// The numeral, in Bebas Neue (0.4 em a digit, caps 0.7 em tall): as large as fits the
// boiler's 51-unit width with "12" in it, and centred on the boiler (it was 37, set left of
// centre between the rivets; 50 for one day, 2026-10-07, before the rivets moved).
const NUM = { size: 54, x: 41, mid: 55 };
// The drawn bounds, for placing the art: [x, y, width, height] in the box.
const BOX = [12.5, 9.9, 78.2, 93.4];

const pressure = n => 6 - Math.abs(n - 7);

function stillBody(n) {
  const lit = pressure(n);
  let s = `<rect x="33" y="11" width="16" height="8" rx="2.5" fill="${LACQUER}" stroke="${GOLD}" stroke-width="2.2"/>`
    + `<path d="M24 92 l-3.5 10 M58 92 l3.5 10" stroke="${GOLD}" stroke-width="2.6" stroke-linecap="round"/>`
    + `<rect x="14" y="18" width="54" height="74" rx="10" fill="${LACQUER}" stroke="${GOLD}" stroke-width="3"/>`;
  for (const [x, y] of [[21, 25], [61, 25], [21, 85], [61, 85]]) s += `<circle cx="${x}" cy="${y}" r="1.5" fill="${RIVET}"/>`;
  s += `<text x="${NUM.x}" y="${NUM.mid + NUM.size * 0.35}" text-anchor="middle" font-family="'Bebas Neue', Impact, sans-serif" font-size="${NUM.size}" fill="${NUMERAL}">${n}</text>`
    + `<rect x="65" y="51" width="14" height="6" rx="2" fill="${LACQUER}" stroke="${GOLD}" stroke-width="1.6"/>`
    + `<rect x="76.5" y="18" width="13" height="76" rx="6.5" fill="${TUBE}" stroke="${GOLD}" stroke-width="2.4"/>`;
  RAMP.forEach((col, k) => {
    const on = k < lit;
    s += `<rect x="79.5" y="${(80.6 - k * 10.8).toFixed(1)}" width="7.2" height="9.4" rx="1.6" fill="${col}" fill-opacity="${on ? 1 : 0.11}" stroke="${col}" stroke-opacity="${on ? 1 : 0.26}" stroke-width="0.5"/>`;
  });
  return s;
}

// A standalone token: the numeral is live text, so a PNG of it needs Bebas Neue loaded
// (an SVG shown through <img> can't fetch a webfont; the Still Tokens page uses the PNGs).
const stillSvg = n => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 108" width="200" height="216">\n  ${stillBody(n)}\n</svg>\n`;

module.exports = { stillBody, stillSvg, pressure, BOX, NUM };
