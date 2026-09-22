// One Day's Ledger: 5 slots, Kickback refills only empty slots. Filler Plays are spent
// just before each Unload to open room for its Kickbacks, then the rest at the end.
// Returns the free Plays left for everything else (the baseline Day is 5).
function run(engine) {
  let L = 5, free = 0, cash = 0, heat = 0, lost = 0;
  for (const p of engine) {
    if (p.k) while (L - p.cost > 5 - p.k && L > p.cost) { L--; free++; }
    L -= p.cost;
    if (p.k) { const got = Math.min(p.k, 5 - L); L += got; lost += p.k - got; }
    cash += p.cash || 0; if (p.heat) heat++;
  }
  free += L;
  return { free, delta: free - 5, cash, heat, lost };
}
const unload = (n, liquor, hs) => ({ cost: 2, k: hs ? n : 0, cash: n * (liquor === 'rum' ? 500 : 300), heat: n >= 4 });
const move = { cost: 1 }, trade = { cost: 1 };
const S = {
  'CURRENT  2 stacks, Unload Moonshine in place':      [unload(4,'m',1), unload(4,'m',1)],
  'NEW      2 stacks, Unload Moonshine in place':      [unload(4,'m',0), unload(4,'m',0)],
  'NEW      2 stacks, daily Rum run (Dock 1 away)':    [move, trade, move, unload(4,'rum',1), move, trade, move, unload(4,'rum',1)],
  'CURRENT  1 venue, 10 barrels, two Unloads':         [unload(5,'m',1), unload(5,'m',1)],
  'NEW      1 venue, 10-barrel batch run':             [move, trade, move, unload(5,'rum',1), unload(5,'rum',1)],
  'NEW      1 venue, 10-barrel batch, 3+3+4 split  ':  [move, trade, move, unload(3,'rum',1), unload(3,'rum',1), unload(4,'rum',1)],
  'NEW      brewed at the Dock, 4 Rum carried in':     [trade, move, unload(4,'rum',1)],
};
for (const [name, e] of Object.entries(S)) {
  const r = run(e);
  console.log(`${name.padEnd(50)} Plays ${(r.delta>=0?'+':'')+r.delta}  cash $${r.cash}  GreedTax ${r.heat}  Kickbacks lost ${r.lost}`);
}
