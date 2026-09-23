/* Every combat figure The Almanac quotes, off the Combat Simulator's own maths.
 *
 *   node tools/sim_almanac_combat.js          200,000 fights a line, as printed
 *   node tools/sim_almanac_combat.js --quick  20,000, for a fast sanity check
 *
 * "Volleys" is the Influence the invader has left after the Move that walked
 * him in. "Spent out" is the Stealth kit, which is the simulator's only way to
 * skip the defender's Ambush. A Hit costs 2, so three markers buy a Hit and one
 * Open Fire.
 */

const { combat } = require("./sim_core.js");
const { simulateTrial } = combat();

const N = process.argv.includes("--quick") ? 20000 : 200000;

function fight(inv, occ, volleys, kit = "none") {
  const cfg = { invader: { runners: inv[0], bosses: inv[1], kit },
                occupier: { runners: occ[0], bosses: occ[1], safehouse: !!occ[2], barrels: 0 },
                trials: 1, influence: volleys, stealthTrimmed: false };
  let take = 0, lost = 0, boss = 0;
  for (let i = 0; i < N; i += 1) {
    const r = simulateTrial(cfg);
    if (r.outcome === "take") take += 1;
    lost += r.invaderLosses;
    if (r.bossKilled) boss += 1;
  }
  return { take: pct(take), lost: (lost / N).toFixed(1), boss: pct(boss) };
}
const pct = (n) => (100 * n / N).toFixed(1) + "%";
const who = (r, b) => (b ? "Boss + " + r : r + " Runners");

console.log("\nLesson 16. Storming a fortress: Boss + 3 behind a Safehouse, 3 volleys");
for (const r of [3, 4, 5, 6, 9]) {
  const f = fight([r, 1], [3, 1, 1], 3);
  console.log(`  ${who(r, 1).padEnd(10)} takes ${f.take.padStart(6)}  loses ${f.lost}`);
}

console.log("\nLessons 17 and 18. Raiding a picket: can Ambush / spent out");
for (const [ir, ib, or] of [[3, 0, 2], [5, 0, 2], [3, 1, 2], [4, 1, 3], [3, 0, 3]]) {
  const a = fight([ir, ib], [or, 0], 3), d = fight([ir, ib], [or, 0], 3, "stealth");
  console.log(`  ${who(ir, ib).padEnd(10)} vs ${or} Runners  ${a.take.padStart(6)} / ${d.take.padStart(6)}  loses ${a.lost} -> ${d.lost}`);
}

console.log("\nLesson 19. Holding with Runners alone against Boss + 4: can Ambush / spent out");
for (const n of [1, 2, 3, 4, 5, 6]) {
  const a = fight([4, 1], [n, 0], 3), d = fight([4, 1], [n, 0], 3, "stealth");
  console.log(`  ${String(n).padStart(2)} Runners  taken ${a.take.padStart(6)} / ${d.take.padStart(6)}`);
}
for (const r of [6, 8]) console.log(`  5 Runners vs Boss + ${r}  taken ${fight([r, 1], [5, 0], 3).take}`);

console.log("\nLesson 21. Killing a Boss with Boss + 4: can Ambush / spent out / Sicilian Hit");
for (const [k, s, label] of [[0, 0, "alone"], [1, 0, "+ 1"], [2, 0, "+ 2"], [3, 0, "+ 3"],
                             [2, 1, "+ 2 + Safehouse"], [4, 1, "+ 4 + Safehouse"]]) {
  const a = fight([4, 1], [k, 1, s], 3), d = fight([4, 1], [k, 1, s], 3, "stealth");
  const h = fight([4, 1], [k, 1, s], 3, "sicilian");
  console.log(`  Boss ${label.padEnd(16)} ${a.boss.padStart(6)} / ${d.boss.padStart(6)} / ${h.boss.padStart(6)}`);
}

console.log("\nLesson 24. The families");
console.log(`  Irish Boss + 4 into Boss + 3 + Safehouse: ${fight([4, 1], [3, 1, 1], 3, "irish").take}` +
            ` (plain ${fight([4, 1], [3, 1, 1], 3).take})`);
console.log(`  Vipers Stealth, Boss + 4 into Boss + 2 + Safehouse: ${fight([4, 1], [2, 1, 1], 3, "stealth").take}` +
            ` (front door ${fight([4, 1], [2, 1, 1], 3).take})`);
console.log("");
