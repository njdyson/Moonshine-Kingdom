#!/usr/bin/env node
// Balance sims behind sweep-and-twist-proposals.md.
// Brew/Blowback engine lifted from "Brew Simulator v0.9.html" so the figures stay
// comparable to the Kingpin's Guide economy table.
//
//   node tools/balance_sim.js caps    -- Sweep cap vs build, by stills-per-number
//   node tools/balance_sim.js heat    -- where the Heat Track sits at Reckoning
//   node tools/balance_sim.js twist   -- Twist the Valves variants
//   node tools/balance_sim.js all

const d6 = () => 1 + Math.floor(Math.random() * 6);
const ratio = m => Math.min(5, Math.ceil(m / 2));

function reachableCount(boilers, W) {
  const nums = new Set(boilers);
  let c = 0;
  nums.forEach(n => { const r = n - W; if (r >= 1 && r <= 6) c++; });
  return c;
}

// A hostile Harbormaster names the Mash face reaching the fewest of our boilers.
function hostileMash(boilers) {
  let best = 1, bestReach = Infinity, bestThreat = -1;
  for (let W = 1; W <= 6; W++) {
    const reach = reachableCount(boilers, W);
    let threat = 0;
    for (let r = 1; r <= 6; r++) if (boilers.includes(W + r)) { threat = 1; break; }
    if (reach < bestReach || (reach === bestReach && threat > bestThreat)) {
      best = W; bestReach = reach; bestThreat = threat;
    }
  }
  return best;
}

// opts.twist: 'none' | 'plus1' (current rule) | 'plus2' | 'tol' (Boss's Still also
// fires on Brew Number +/-1) | 'tol1' (tol, and keeps the +1 barrel).
// Blowback always hits on an exact match only.
function simulate(rows, bossStill, opts, N) {
  const boilers = rows.map(s => s.num);
  const fixedMash = opts.mash === 'hostile' ? hostileMash(boilers) : null;
  let sumB = 0, sumNet = 0, bossLostDays = 0;

  for (let t = 0; t < N; t++) {
    const W = fixedMash !== null ? fixedMash : d6();
    const pool = Array.from({ length: opts.players + 1 }, d6);
    const focalSeat = Math.floor(Math.random() * opts.players);
    const firing = new Set();
    boilers.forEach(b => { const r = b - W; if (r >= 1 && r <= 6) firing.add(r); });
    const blowsUs = r => boilers.includes(W + r);

    let focalPick = null;
    for (let seat = 0; seat < opts.players; seat++) {
      const isLast = seat === opts.players - 1;
      if (seat === focalSeat) {
        let i = pool.findIndex(r => firing.has(r));      // grab a firing die
        if (i < 0) i = pool.findIndex(r => blowsUs(r));  // else pull the die that would burn us
        if (i < 0) i = 0;
        focalPick = pool[i]; pool.splice(i, 1);
      } else if (isLast) {
        // adversarial last drafter: leave a Still-bursting die behind
        let i = pool.findIndex(r => !blowsUs(r));
        if (i < 0) i = 0;
        pool.splice(i, 1);
      } else {
        pool.splice(Math.floor(Math.random() * pool.length), 1);
      }
    }
    const brewNum = W + focalPick, blowNum = W + pool[0];
    const tol = opts.twist === 'tol' || opts.twist === 'tol1';

    let barrels = 0;
    rows.forEach((s, i) => {
      const isBoss = i === bossStill;
      if (s.num === brewNum || (isBoss && tol && Math.abs(s.num - brewNum) === 1)) {
        let y = ratio(s.mob);
        if (isBoss && (opts.twist === 'plus1' || opts.twist === 'tol1')) y += 1;
        if (isBoss && opts.twist === 'plus2') y += 2;
        barrels += y;
      }
    });

    let net = barrels * opts.barrel, bossLost = false;
    rows.forEach((s, i) => {
      if (s.num === blowNum) {
        let cas = ratio(s.mob);
        if (i === bossStill) { bossLost = true; cas -= 1; }  // Boss falls first
        net -= Math.max(0, cas) * opts.recruit;
      }
    });
    if (bossLost) { bossLostDays++; net -= opts.bossCost; }

    sumB += barrels; sumNet += net;
  }
  return { barrels: sumB / N, net: sumNet / N, pBossLost: bossLostDays / N };
}

const BASE = { players: 4, mash: 'rolled', barrel: 300, recruit: 300, bossCost: 800, twist: 'plus1' };
const N = 400000;
const mk = pairs => pairs.map(([num, mob]) => ({ num, mob }));

// ---- caps: what the Sweep cap is actually worth, by stills-per-number ----
// Board distribution: 7x4 | 4,6 x3 | 2,3,5,8,9,10,11 x2 | 12 x1
function caps() {
  const BUILDS = {
    'four 7s  (4 stills)': { 5: [[7,5],[7,5],[7,5],[7,1]], 7: [[7,7],[7,5],[7,3],[7,1]], 9: [[7,9],[7,5],[7,1],[7,1]] },
    'three 6s (3 stills)': { 5: [[6,5],[6,5],[6,5]],       7: [[6,7],[6,7],[6,2]],       9: [[6,9],[6,7]] },
    'two 8s   (2 stills)': { 5: [[8,5],[8,5]],             7: [[8,7],[8,7]],             9: [[8,9],[8,7]] },
    'two 3s   (2 stills)': { 5: [[3,5],[3,5]],             7: [[3,7],[3,7]],             9: [[3,9],[3,7]] },
    'one 12   (1 still)':  { 5: [[12,5]],                  7: [[12,7]],                  9: [[12,9]] },
  };
  for (const mash of ['rolled', 'hostile']) {
    console.log(`\n=== Sweep cap, Mash: ${mash} ===   net $/Day (men used)`);
    console.log('build'.padEnd(21) + 'cap 5'.padStart(16) + 'cap 7'.padStart(16) + 'cap 9'.padStart(16));
    for (const [name, byCap] of Object.entries(BUILDS)) {
      const cells = [5, 7, 9].map(c => {
        const rows = mk(byCap[c]);
        const men = rows.reduce((a, r) => a + r.mob, 0);
        return `$${simulate(rows, 0, { ...BASE, mash }, N).net.toFixed(0)} (${men}m)`.padStart(16);
      });
      console.log(name.padEnd(21) + cells.join(''));
    }
  }
}

// ---- heat: where does the track sit when Reckoning arrives? ----
// Poisson heat events per Day, reset to 0 on the 5th (the Raid).
// caution = chance a player declines a heat-drawing Play while the track sits at 4.
function heat() {
  const run = (H, caution, N) => {
    let g2 = 0, g3 = 0, g4 = 0, sum = 0;
    for (let d = 0; d < N; d++) {
      let track = 0, k = 0, p = Math.exp(-H), s = p, u = Math.random();
      while (u > s && k < 40) { k++; p *= H / k; s += p; }
      for (let i = 0; i < k; i++) {
        if (track === 4 && Math.random() < caution) continue;
        track++;
        if (track >= 5) track = 0;   // Raid: the Aftermath clears the track
      }
      if (track >= 2) g2++;
      if (track >= 3) g3++;
      if (track >= 4) g4++;
      sum += track;
    }
    return { g2: g2 / N, g3: g3 / N, g4: g4 / N, avg: sum / N };
  };
  console.log('\n=== Heat Track at Reckoning === P(Sweep fires) by threshold');
  console.log('heat/day  caution   avg    thr 2     thr 3     thr 4');
  for (const H of [1.5, 2, 2.5, 3, 4]) for (const c of [0, 0.5]) {
    const r = run(H, c, 500000);
    console.log(String(H).padStart(6), String(c).padStart(9), r.avg.toFixed(2).padStart(7),
      (100 * r.g2).toFixed(0).padStart(8) + '%',
      (100 * r.g3).toFixed(0).padStart(9) + '%',
      (100 * r.g4).toFixed(0).padStart(9) + '%');
  }
}

// ---- twist: Twist the Valves variants ----
function twist() {
  const BUILDS = {
    'four 7s':        [[7,5],[7,5],[7,5],[7,1]],
    '6/7/8 mismatch': [[6,5],[7,5],[8,5]],
    'two 8s':         [[8,5],[8,5]],
    'spread 3+9':     [[3,5],[9,5]],
  };
  const VARIANTS = [['plus1', '+1 (current)'], ['plus2', '+2'], ['tol', '±1 fire'], ['tol1', '±1 fire, +1']];
  for (const mash of ['rolled', 'hostile']) {
    console.log(`\n=== Twist the Valves, Mash: ${mash} ===   net $/Day / Boss lost per Day`);
    console.log('build'.padEnd(17) + VARIANTS.map(v => v[1].padStart(16)).join(''));
    for (const [name, pairs] of Object.entries(BUILDS)) {
      const cells = VARIANTS.map(([v]) => {
        const r = simulate(mk(pairs), 0, { ...BASE, mash, twist: v }, N);
        return `$${r.net.toFixed(0)}/${(100 * r.pBossLost).toFixed(1)}%`.padStart(16);
      });
      console.log(name.padEnd(17) + cells.join(''));
    }
  }
}

const cmd = process.argv[2] || 'all';
if (cmd === 'caps' || cmd === 'all') caps();
if (cmd === 'heat' || cmd === 'all') heat();
if (cmd === 'twist' || cmd === 'all') twist();
