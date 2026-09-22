// Blowback shield maths. Focal owns two #7 High Society stacks, 7 Mobsters each (4 barrels / 4 dead each).
const ratio = m => Math.min(5, Math.ceil(m / 2));
const d6 = () => 1 + Math.floor(Math.random() * 6);
const N = 1e6, P = 4, MOB = 7, STACKS = 2;

function day(mode, shield) {
  const W = d6(), v = 7 - W;                 // v = the Red that makes a 7
  const pool = Array.from({ length: P + 1 }, d6);
  const seat = Math.floor(Math.random() * P);
  let pick = null;
  for (let s = 0; s < P; s++) {
    let i;
    if (s === seat) { i = pool.indexOf(v); if (i < 0) i = Math.floor(Math.random() * pool.length); pick = pool[i]; }
    else if (mode === 'hostile' && s < seat && pool.includes(v)) i = pool.indexOf(v);          // deny the 7
    else if (mode === 'hostile' && s === P - 1) { i = pool.findIndex(r => r !== v); if (i < 0) i = 0; } // leave the match
    else i = Math.floor(Math.random() * pool.length);
    pool.splice(i, 1);
  }
  const brew = pick === v, blow = pool[0] === v && !(shield && pick === v);
  return { barrels: brew ? STACKS * ratio(MOB) : 0, dead: blow ? STACKS * ratio(MOB) : 0, brew, blow };
}
for (const mode of ['random', 'hostile']) for (const shield of [false, true]) {
  let b = 0, d = 0, pb = 0, pl = 0;
  for (let t = 0; t < N; t++) { const r = day(mode, shield); b += r.barrels; d += r.dead; pb += r.brew; pl += r.blow; }
  console.log(`${mode.padEnd(8)} ${shield ? 'shield' : 'current'}  brews ${(100*pb/N).toFixed(1)}%  blows ${(100*pl/N).toFixed(1)}%  barrels/day ${(b/N).toFixed(2)}  dead/day ${(d/N).toFixed(2)}`);
}
// City-wide: how often is the leftover a face somebody drafted (random draft)?
let m = 0, pair = 0;
for (let t = 0; t < N; t++) {
  const pool = Array.from({ length: P + 1 }, d6);
  if (new Set(pool).size < pool.length) pair++;
  const left = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
  if (pool.includes(left)) m++;
}
console.log(`pool holds a pair ${(100*pair/N).toFixed(1)}%   leftover matches a drafted face ${(100*m/N).toFixed(1)}%`);
