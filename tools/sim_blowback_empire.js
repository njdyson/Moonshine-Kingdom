// A realistic empire: two High Society 7-stacks plus the Dock, Ward and Speakeasy you need.
const ratio = m => Math.min(5, Math.ceil(m / 2));
const d6 = () => 1 + Math.floor(Math.random() * 6);
const N = 1e6, P = 4;
const EMPIRE = [
  { name: 'Sugar Hill 7 (HS)', num: 7, mob: 7 }, { name: 'Morris Park 7 (HS)', num: 7, mob: 7 },
  { name: 'West Side 11 (Dock)', num: 11, mob: 3 }, { name: 'Five Points 10 (Ward)', num: 10, mob: 3 },
  { name: 'East Harlem 12 (Speak)', num: 12, mob: 3 },
];
const yieldAt = n => EMPIRE.reduce((b, s) => b + (s.num === n ? ratio(s.mob) : 0), 0);
const deadAt = n => yieldAt(n); // casualties use the same Muscle Ratio
function day(shield) {
  const W = d6(), pool = Array.from({ length: P + 1 }, d6), seat = Math.floor(Math.random() * P);
  let pick;
  for (let s = 0; s < P; s++) {
    let i;
    if (s === seat) { // brew most; tie-break toward the die whose loss would hurt most if left
      let best = -1; i = 0;
      pool.forEach((r, k) => { const v = yieldAt(W + r) * 10 + deadAt(W + r); if (v > best) { best = v; i = k; } });
      pick = pool[i];
    } else i = Math.floor(Math.random() * pool.length);
    pool.splice(i, 1);
  }
  const left = pool[0];
  return { b: yieldAt(W + pick), d: (shield && left === pick) ? 0 : deadAt(W + left), blow: deadAt(W + left) > 0 && !(shield && left === pick) };
}
for (const shield of [false, true]) {
  let b = 0, d = 0, bl = 0;
  for (let t = 0; t < N; t++) { const r = day(shield); b += r.b; d += r.d; bl += r.blow; }
  console.log(`${shield ? 'shield ' : 'current'}  barrels/day ${(b/N).toFixed(2)}  something blows ${(100*bl/N).toFixed(1)}%  dead/day ${(d/N).toFixed(3)}`);
}
