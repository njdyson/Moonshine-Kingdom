/* Models the open "Deeds ignore the Sweep" proposal. See deed-sweep-handoff.md.
 *
 *   node tools/sim_deed_sweep.js          full run
 *   node tools/sim_deed_sweep.js --quick  fewer trials, seconds instead of minutes
 *
 * The proposal: drop the Sicilians' Untouchable trait, and instead let the
 * Sweep skip any Borough whose Deed you hold. This script prices both halves,
 * the brewing economy and the garrison arithmetic, off the simulators' own maths.
 */

const { brew, combat } = require("./sim_core.js");
const { simulate } = brew();
const { simulateTrial } = combat();

const QUICK = process.argv.includes("--quick");
const SEARCH_N = QUICK ? 4000 : 20000;
const FINAL_N = QUICK ? 40000 : 400000;
const FIGHT_N = QUICK ? 8000 : 60000;

// The Brew Simulator's own defaults, and its own 16 man budget note.
const OPTS = { players: 4, mash: "roll", contested: true, split: true,
               exposed: true, barrel: 300, recruit: 300, bossCost: 800 };
const MEN = 16;

function allocations(boilers, cap) {
  const out = [];
  (function rec(i, left, cur) {
    if (i === boilers) { out.push(cur.slice()); return; }
    const hi = Math.min(cap, left - (boilers - i - 1));
    for (let m = 1; m <= hi; m += 1) { cur.push(m); rec(i + 1, left - m, cur); cur.pop(); }
  })(0, MEN, []);
  return out;
}

function bestCrewing(nums, cap, conn) {
  let best = null;
  for (const a of allocations(nums.length, cap)) {
    const rows = nums.map((n, i) => ({ num: n, mob: a[i], conn: conn ? conn[i] : false }));
    const r = simulate(rows, 0, OPTS, SEARCH_N);
    const men = a.reduce((x, y) => x + y, 0);
    if (!best || r.net > best.net + 1 || (Math.abs(r.net - best.net) <= 1 && men < best.men)) {
      best = { a, net: r.net, men };
    }
  }
  return best;
}

const BUILDS = [
  ["1x7 (one boiler)", [7], null],
  ["2x7 (two matching)", [7, 7], null],
  ["3x7 (three matching)", [7, 7, 7], null],
  ["6/7/8 mismatched", [7, 8, 6], [false, true, false]],
  ["Sugar Hill 7/12/11/8", [7, 12, 11, 8], [false, true, true, false]],
];

function economy() {
  console.log("\nA. THE ECONOMY: what uncapping a home boiler is worth");
  console.log(`   ${MEN} men available, spare men garrison elsewhere. Barrel $300, recruit $300,`);
  console.log("   Boss $800, 4 players, rolled Mash, contested draft, Split the Batch on.\n");
  console.log("   build                  | regime   | crewing   | men | net $/day | delta");
  console.log("   " + "-".repeat(78));
  for (const [name, nums, conn] of BUILDS) {
    const cap = bestCrewing(nums, 5, conn);
    const unc = bestCrewing(nums, MEN, conn);
    const mk = (a) => nums.map((n, i) => ({ num: n, mob: a[i], conn: conn ? conn[i] : false }));
    const rc = simulate(mk(cap.a), 0, OPTS, FINAL_N);
    const ru = simulate(mk(unc.a), 0, OPTS, FINAL_N);
    const d = ru.net - rc.net;
    const line = (lbl, b, net, delta) =>
      `   ${name.padEnd(22)} | ${lbl.padEnd(8)} | ${b.a.join("/").padEnd(9)} | ${String(b.men).padStart(3)} | ` +
      `${("$" + net.toFixed(0)).padStart(9)} | ${delta}`;
    console.log(line("capped 5", cap, rc.net, ""));
    console.log(line("uncapped", unc, ru.net, (d >= 0 ? "+$" : "-$") + Math.abs(d).toFixed(0)));
    console.log("   " + "-".repeat(78));
  }
  console.log("   Note the concave Muscle Ratio: nine men on one boiler (5 barrels) equals five");
  console.log("   plus four on two matching boilers (3+2), so wide builds gain nothing at all.");
}

function fight(invR, invB, occR, occB, safehouse, influence, kit = "none") {
  const cfg = { invader: { runners: invR, bosses: invB, kit },
                occupier: { runners: occR, bosses: occB, safehouse, barrels: 0 },
                trials: 1, influence, stealthTrimmed: false };
  let take = 0, hold = 0, invLoss = 0;
  for (let i = 0; i < FIGHT_N; i += 1) {
    const r = simulateTrial(cfg);
    if (r.outcome === "take") take += 1;
    else if (r.outcome === "hold") hold += 1;
    invLoss += r.invaderLosses;
  }
  return { take: take / FIGHT_N, hold: hold / FIGHT_N, invLoss: invLoss / FIGHT_N };
}

function garrison() {
  console.log("\n\nB. THE GARRISON: where the defensive knee sits");
  console.log("   Defender is Boss + N behind a Safehouse. Dice band at 1-2, 3-4, 5-6, 7-8, 9+,");
  console.log("   so the attacker's dice stop scaling at 9 men while the defender's keep climbing.\n");
  console.log("   defenders            | vs Boss+9, 4 Inf | vs Boss+9, 6 Inf | vs Boss+14, 6 Inf");
  console.log("   " + "-".repeat(78));
  for (let r = 2; r <= 8; r += 1) {
    const tag = r + 1 === 5 ? "  <-- today's Sweep cap" : "";
    const a = fight(9, 1, r, 1, true, 4).take;
    const b = fight(9, 1, r, 1, true, 6).take;
    const c = fight(14, 1, r, 1, true, 6).take;
    console.log(`   Boss+${r} = ${String(r + 1).padStart(2)} men       | ${(100 * a).toFixed(1).padStart(15)}% | ` +
                `${(100 * b).toFixed(1).padStart(15)}% | ${(100 * c).toFixed(1).padStart(16)}%${tag}`);
  }
}

function counterplay() {
  console.log("\n\nC. THE COUNTERPLAY: what a 9 man keep leaves undefended");
  console.log("   9 of 16 men on the fortress leaves thin blocks behind it, and Deeds are counted");
  console.log("   in districts, not bodies. Take two and the Deed changes hands at Stake Your Claim.\n");
  console.log("   thin district held by     | raider           | takes it | raider losses");
  console.log("   " + "-".repeat(78));
  const targets = [["2 Runners, no Safehouse", 2, 0, false], ["3 Runners, no Safehouse", 3, 0, false],
                   ["2 Runners + Safehouse", 2, 0, true], ["Boss + 2 + Safehouse", 2, 1, true]];
  for (const [lbl, oR, oB, safe] of targets) {
    const r = fight(3, 1, oR, oB, safe, 3);
    console.log(`   ${lbl.padEnd(25)} | Boss + 3, 3 Inf  | ${(100 * r.take).toFixed(1).padStart(7)}% | ${r.invLoss.toFixed(2)}`);
  }

  console.log("\n\nD. THE KEEP CANNOT LEAVE HOME");
  console.log("   A 9 man stack going on the offensive against a standard 5 man garrison.\n");
  console.log("   raid                  | takes it | loses (of 9)");
  console.log("   " + "-".repeat(78));
  for (const inf of [3, 4, 6]) {
    const r = fight(8, 1, 4, 1, true, inf);
    console.log(`   Boss+8, ${inf} Influence   | ${(100 * r.take).toFixed(1).padStart(7)}% | ${r.invLoss.toFixed(2)}`);
  }
}

console.log("Deed / Sweep proposal: modelling run" + (QUICK ? "  (--quick)" : ""));
economy();
garrison();
counterplay();
console.log("\nModelling, not playtesting. Brew figures assume everyone crews optimally.\n");
