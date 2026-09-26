/* Stress-tests The Almanac's combat and endgame lessons. See almanac-review-handoff.md.
 *
 *   node tools/sim_almanac_combat.js          full run (200,000 fights a line)
 *   node tools/sim_almanac_combat.js --quick  fewer trials, seconds instead of a minute
 *
 * The Combat Simulator always Ambushes when it can and always fires until its
 * Influence runs out. The questions here need two more policies, so this script
 * rebuilds the fight loop from the simulator's own primitives (dice, Threat,
 * casualties) rather than copying them:
 *   - the Occupier's answer: Ambush, or Hold Fire (the "duck" line); a Fold is priced
 *     against Hold Fire in section 4
 *   - the Invader's volley budget, and the Sicilian Hit
 * Section 0 checks the rebuilt loop against simulateTrial before anything else runs.
 */

const { combat } = require("./sim_core.js");
const C = combat();

const QUICK = process.argv.includes("--quick");
const N = QUICK ? 20000 : 200000;

// One fight. inv: {r, b, irish, hit}; occ: {r, b, safe}; answer: "ambush" | "hold".
// The Invader fires up to `volleys` times (a Hit costs 2 of them) or until a side is gone.
function fight(inv0, occ0, answer, volleys) {
  const inv = { runners: inv0.r, bosses: inv0.b ? 1 : 0, kit: inv0.irish ? "irish" : "none" };
  const occ = { runners: occ0.r, bosses: occ0.b ? 1 : 0 };
  const safe = occ0.safe ? 1 : 0;
  const invStart = C.mobsterCount(inv);
  const occStart = C.mobsterCount(occ);
  let spent = 0;

  if (answer === "ambush" && C.alive(inv) && C.alive(occ)) {
    const threat = C.clamp(1 + occ.bosses + 1 + safe, 1, 4);
    C.applyCasualties(inv, C.rollHits(C.diceFromMobsters(C.mobsterCount(occ)), threat), false);
  }

  while (C.alive(inv) && C.alive(occ)) {
    const useHit = inv0.hit && occ.bosses > 0 && volleys - spent >= 2;
    const cost = useHit ? 2 : 1;
    if (volleys - spent < cost) break;
    spent += cost;
    const invHits = C.rollHits(C.invaderAttackDice(inv), C.clamp(1 + inv.bosses, 1, 4));
    const occHits = C.rollHits(C.diceFromMobsters(C.mobsterCount(occ)),
      C.clamp(1 + occ.bosses + safe, 1, 4));
    C.applyCasualties(occ, invHits, useHit);
    C.applyCasualties(inv, occHits, false);
  }

  return {
    take: !C.alive(occ) && C.alive(inv),
    hold: C.alive(occ),
    invLoss: invStart - C.mobsterCount(inv),
    occLoss: occStart - C.mobsterCount(occ),
    invBossDead: inv0.b && inv.bosses === 0,
    occBossDead: occ0.b && occ.bosses === 0,
    spent,
  };
}

function run(inv, occ, answer, volleys, n = N) {
  const t = { take: 0, hold: 0, invLoss: 0, occLoss: 0, invBossDead: 0, occBossDead: 0, spent: 0 };
  for (let i = 0; i < n; i += 1) {
    const f = fight(inv, occ, answer, volleys);
    for (const k of Object.keys(t)) t[k] += Number(f[k]);
  }
  for (const k of Object.keys(t)) t[k] /= n;
  return t;
}

const pct = (x) => `${(x * 100).toFixed(0).padStart(3)}%`;
const num = (x) => x.toFixed(1);
const crew = (s) => (s.b ? `Boss+${s.r}` : `${s.r}R`) + (s.irish ? " Irish" : "") + (s.hit ? " Hit" : "");
const post = (s) => (s.b ? `Boss+${s.r}` : `${s.r}R`) + (s.safe ? "+SH" : "");

// ---------------------------------------------------------------------------
function section0() {
  console.log("\n0. CHECK: rebuilt loop vs the Combat Simulator's simulateTrial (3 volleys)");
  const rows = [
    [{ r: 3, b: 1 }, { r: 2 }],
    [{ r: 4, b: 1 }, { r: 3 }],
    [{ r: 6, b: 1 }, { r: 3, b: 1, safe: true }],
  ];
  for (const [inv, occ] of rows) {
    let take = 0;
    const n = QUICK ? 20000 : 100000;
    for (let i = 0; i < n; i += 1) {
      const r = C.simulateTrial({
        invader: { runners: inv.r, bosses: inv.b ? 1 : 0, kit: "none" },
        occupier: { runners: occ.r, bosses: occ.b ? 1 : 0, safehouse: !!occ.safe, barrels: 0 },
        influence: 3,
      });
      if (r.outcome === "take") take += 1;
    }
    const mine = run(inv, occ, "ambush", 3, n);
    console.log(`   ${crew(inv).padEnd(8)} into ${post(occ).padEnd(10)} simulator ${pct(take / n)}   rebuilt ${pct(mine.take)}`);
  }
}

// ---------------------------------------------------------------------------
function section1() {
  console.log("\n1. PICKING OFF A PICKET: take % by volleys spent, Occupier Holds Fire (duck) or Ambushes (live)");
  console.log("   No Boss or Safehouse defending. Losses are the raider's, at 3 volleys.\n");
  console.log("   raid       picket | duck: 1v   2v   3v  loss | live: 1v   2v   3v  loss");
  const pickets = [1, 2, 3, 4];
  const raids = [
    { r: 2 }, { r: 3 }, { r: 4 }, { r: 5 }, { r: 6 },
    { r: 1, b: 1 }, { r: 2, b: 1 }, { r: 3, b: 1 }, { r: 4, b: 1 }, { r: 5, b: 1 },
    { r: 7 }, { r: 8 }, { r: 6, b: 1 },
  ];
  for (const p of pickets) {
    for (const inv of raids) {
      const occ = { r: p };
      const d = [1, 2, 3].map((v) => run(inv, occ, "hold", v));
      const l = [1, 2, 3].map((v) => run(inv, occ, "ambush", v));
      console.log(`   ${crew(inv).padEnd(8)} ${String(p).padStart(4)}R  |    ${d.map((x) => pct(x.take)).join(" ")} ${num(d[2].invLoss).padStart(4)} |     ${l.map((x) => pct(x.take)).join(" ")} ${num(l[2].invLoss).padStart(4)}`);
    }
    console.log("");
  }
}

// ---------------------------------------------------------------------------
function section2() {
  console.log("\n2. IS THE PICKET'S AMBUSH WORTH A MARKER AND THE HEAT? (3 volleys)");
  console.log("   Hold % for the picket; raider losses. Ambush vs Hold Fire.\n");
  console.log("   picket  raid     | hold%: Hold  Ambush  swing | raider loss: Hold  Ambush | picket loss: Hold  Ambush");
  for (const p of [1, 2, 3, 4]) {
    for (const inv of [{ r: 3 }, { r: 4 }, { r: 5 }, { r: 3, b: 1 }, { r: 4, b: 1 }]) {
      const h = run(inv, { r: p }, "hold", 3);
      const a = run(inv, { r: p }, "ambush", 3);
      console.log(`   ${String(p).padStart(4)}R   ${crew(inv).padEnd(8)} |       ${pct(h.hold)}   ${pct(a.hold)}  ${(((a.hold - h.hold) * 100).toFixed(0) + " pts").padStart(7)} |              ${num(h.invLoss).padStart(4)}  ${num(a.invLoss).padStart(6)} |              ${num(h.occLoss).padStart(4)}  ${num(a.occLoss).padStart(6)}`);
    }
  }
}

// ---------------------------------------------------------------------------
function section3() {
  console.log("\n3. THE EVEN MAN: does the 4th and 6th body pay? (3 volleys)");
  console.log("   Dice drop a tier when an odd crew loses one man (3 -> 2 men is 2 dice -> 1).\n");
  console.log("   raid      picket | duck take  loss | live take  loss");
  for (const occ of [{ r: 2 }, { r: 3 }, { r: 4 }]) {
    for (const r of [3, 4, 5, 6, 7]) {
      const d = run({ r }, occ, "hold", 3);
      const l = run({ r }, occ, "ambush", 3);
      console.log(`   ${crew({ r }).padEnd(8)} ${post(occ).padStart(6)} |     ${pct(d.take)}  ${num(d.invLoss).padStart(4)} |     ${pct(l.take)}  ${num(l.invLoss).padStart(4)}`);
    }
    console.log("");
  }
  console.log("   Pickets from the Occupier's side: hold % against common raids, Hold Fire");
  console.log("   picket | 3R    4R    5R    Boss+3  Boss+4");
  for (const p of [1, 2, 3, 4, 5, 6]) {
    const cells = [{ r: 3 }, { r: 4 }, { r: 5 }, { r: 3, b: 1 }, { r: 4, b: 1 }]
      .map((inv) => pct(run(inv, { r: p }, "hold", 3).hold));
    console.log(`   ${String(p).padStart(4)}R  | ${cells.join("  ")}`);
  }
}

// ---------------------------------------------------------------------------
// Fold vs Hold Fire. Folding costs the block and its barrels, and no men. Holding Fire
// keeps the barrels only when the block holds, and costs men either way. So the
// barrels only argue for fighting in proportion to the hold chance:
//   stand only if  P(hold) x (barrels + turf)  >  E[your dead] x (cost of a man)
function section4() {
  console.log("\n4. FOLD OR STAND? What the pile must be worth before standing beats folding");
  console.log("   A dead Runner priced at $300 (Recruit) and at $600 (Recruit plus the walk back).");
  console.log("   Turf value set to zero: add it to the pile if the block itself earns.\n");
  console.log("   picket  raid      answer | hold%  your dead  his dead | pile to beat: @$300  @$600");
  const rows = [];
  for (const p of [2, 3, 4]) {
    for (const inv of [{ r: 3 }, { r: 4 }, { r: 5 }, { r: 3, b: 1 }, { r: 4, b: 1 }, { r: 6, b: 1 }]) {
      for (const ans of ["hold", "ambush"]) {
        const x = run(inv, { r: p }, ans, 3);
        const be = (cost) => (x.hold > 0.005 ? `$${Math.round((x.occLoss * cost) / x.hold / 100) * 100}` : "never");
        rows.push(`   ${String(p).padStart(4)}R   ${crew(inv).padEnd(8)} ${ans.padEnd(6)} |  ${pct(x.hold)}  ${num(x.occLoss).padStart(9)}  ${num(x.invLoss).padStart(8)} |          ${be(300).padStart(6)}  ${be(600).padStart(6)}`);
      }
    }
  }
  console.log(rows.join("\n"));
}

// ---------------------------------------------------------------------------
function section5() {
  console.log("\n5. THE LAST TURN: killing a qualified leader's Boss in his High Society room");
  console.log("   One rival, one Play (a Move and as many volleys as his Ledger holds).");
  console.log("   A Boss dies only when his Runners are gone, except to a Sicilian Hit.\n");
  console.log("   room          answer | raid          2 volleys  3 volleys  4 volleys");
  const rooms = [
    { r: 0, b: 1 }, { r: 1, b: 1 }, { r: 1, b: 1, safe: true }, { r: 2, b: 1 }, { r: 2, b: 1, safe: true },
    { r: 4, b: 1 }, { r: 4, b: 1, safe: true }, { r: 6, b: 1, safe: true },
  ];
  const raids = [
    { r: 4, b: 1 }, { r: 6, b: 1 }, { r: 8, b: 1 }, { r: 5, irish: true, b: 1 },
    { r: 5, hit: true }, { r: 6, b: 1, hit: true },
  ];
  for (const room of rooms) {
    for (const ans of ["ambush", "hold"]) {
      for (const inv of raids) {
        const cells = [2, 3, 4].map((v) => pct(run(inv, room, ans, v).occBossDead));
        console.log(`   ${post(room).padEnd(12)} ${ans.padEnd(6)} | ${crew(inv).padEnd(13)} ${cells.map((c) => c.padStart(8)).join("   ")}`);
      }
    }
    console.log("");
  }
}

// ---------------------------------------------------------------------------
function section6() {
  console.log("\n6. BRINGING THE BOSS: how often the raider's own Boss dies (live defender)");
  console.log("   raid      defender  volleys | take  Boss dies");
  const row = (inv, occ, v) => {
    const x = run(inv, occ, "ambush", v);
    console.log(`   ${crew(inv).padEnd(8)} ${post(occ).padStart(10)}  ${String(v).padStart(4)}    | ${pct(x.take)}  ${pct(x.invBossDead)}`);
  };
  for (const occ of [{ r: 2 }, { r: 3 }, { r: 4 }]) {
    for (const r of [1, 2, 3, 4, 5]) row({ r, b: 1 }, occ, 3);
    console.log("");
  }
  const fortress = { r: 3, b: 1, safe: true };
  for (const r of [3, 4, 5, 6, 9]) row({ r, b: 1 }, fortress, 3);
  row({ r: 5, b: 1 }, fortress, 4);
}

// ---------------------------------------------------------------------------
// What a picket charges a raid that takes it: markers (the Move plus volleys) and Heat.
function section7() {
  console.log("\n7. THE TOLL: what a picket costs the raid that comes for it (3-volley budget)");
  console.log("   Markers = the Move plus the volleys actually fired. Duck = Hold Fire, so the raid owns the Heat.\n");
  console.log("   raid      picket | duck: markers  take | live: markers  take");
  for (const p of [0, 1, 2, 3]) {
    for (const inv of [{ r: 3 }, { r: 5 }, { r: 3, b: 1 }, { r: 4, b: 1 }]) {
      const d = p ? run(inv, { r: p }, "hold", 3) : { spent: 0, take: 1 };
      const l = p ? run(inv, { r: p }, "ambush", 3) : { spent: 0, take: 1 };
      console.log(`   ${crew(inv).padEnd(8)} ${String(p).padStart(4)}R |          ${num(1 + d.spent)}  ${pct(d.take)} |          ${num(1 + l.spent)}  ${pct(l.take)}`);
    }
  }
}

// A Boss walking through a rival block: Move in, eat the Standoff answer, Advance out.
// Only the Ambush can hurt him, and it hits Runners first.
function section8() {
  console.log("\n8. THE WALK: a Boss crossing a rival picket (Move, then Advance), picket Ambushes");
  console.log("   escort   picket | Boss dies  escorts lost");
  for (const p of [1, 2, 3, 4]) {
    for (const r of [0, 1, 2, 3]) {
      let dead = 0, lost = 0;
      for (let i = 0; i < N; i += 1) {
        const inv = { runners: r, bosses: 1, kit: "none" };
        const hits = C.rollHits(C.diceFromMobsters(p), 2);
        C.applyCasualties(inv, hits, false);
        if (inv.bosses === 0) dead += 1;
        lost += r - inv.runners;
      }
      console.log(`   Boss+${r}  ${String(p).padStart(4)}R  |     ${pct(dead / N)}        ${num(lost / N)}`);
    }
  }
  const pairs = (dice) => {
    let hit = 0;
    const T = QUICK ? 200000 : 2000000;
    for (let i = 0; i < T; i += 1) {
      let c = 0;
      for (let d = 0; d < dice; d += 1) if (C.d6() === 1) c += 1;
      if (c >= 2) hit += 1;
    }
    return hit / T;
  };
  console.log(`\n   A given face shows twice or more in the Red pool: 4 players (5 Red) ${pct(pairs(5))}, 3 players (4 Red) ${pct(pairs(4))}`);
  console.log("   The room's Blowback removes its Muscle Ratio, Runners first: Boss+4 keeps Boss+1, Boss+6 keeps Boss+2.");
}

section0();
section1();
section2();
section3();
section4();
section5();
section6();
section7();
section8();
