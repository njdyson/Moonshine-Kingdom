/* Brew or Blow: what the morning pays, and what a blow costs. See brew-or-blow-review.md.
 *
 *   node tools/sim_brew_or_blow.js
 *
 * Models Shadows step 2 as the Rulebook states it (since 2026-11-20): the Mash is on the
 * board, each boss in Turn Order rolls one Red die per Dock he Controls and picks one, then
 * brews Mash + die (every active Still on it pours, whoever owns it: 1 barrel, 2 beside its
 * owner's Safehouse, every time its number is brewed, since 2026-11-24), blows it (every active
 * Still on it loses half its crew, rounded down, and pours nothing more) or passes.
 *
 *   node tools/sim_brew_or_blow.js --once   the rule before 2026-11-24: a Still pours once a morning
 *
 * Nothing is sampled. Every Mash face, every Turn Order and every roll of every boss's dice
 * is enumerated, so the figures are exact for the position and the policy and don't wobble
 * between runs. The board (Still numbers, Docks, starting turf) is read out of
 * tools/build_board.js, so this follows the map or fails loudly.
 *
 * What it can't tell you: anything about the Hustle. A position here is frozen for one
 * morning; whether the men on a Still survive the afternoon is sim_almanac_combat.js's
 * business, and whether any of it wins is a table question.
 */

const fs = require("fs");
const path = require("path");

// ------------------------------------------------------------------ the board
const src = fs.readFileSync(path.join(__dirname, "build_board.js"), "utf8");
const at = src.indexOf("const DISTRICTS = [");
if (at === -1) throw new Error("could not find DISTRICTS in build_board.js");
const DISTRICTS = new Function(`return ${src.slice(src.indexOf("[", at), src.indexOf("\n];", at) + 2)};`)();
const D = Object.fromEntries(DISTRICTS.map((d) => [d.id, d]));
const BOROS = ["MN", "BX", "QN", "BK"];
const BORO_NAME = { MN: "Manhattan", BX: "The Bronx", QN: "Queens", BK: "Brooklyn" };

// A position: district id -> { owner, crew, house }. The standard start is the Town Planner's
// Setup column: Boss, 2 Runners and the Safehouse in the Ward, 3 Runners on the bar, 3 on the Dock.
function start(seats = BOROS) {
  const pos = {};
  for (const d of DISTRICTS) {
    if (!seats.includes(d.boro)) continue;
    if (d.setup === "home") pos[d.id] = { owner: d.boro, crew: 3, house: true };
    if (d.setup === "runners") pos[d.id] = { owner: d.boro, crew: 3, house: false };
  }
  return pos;
}
const hold = (pos, id, owner, crew = 1, house = false) => ({ ...pos, [id]: { owner, crew, house } });
const withHouse = (pos, id) => ({ ...pos, [id]: { ...pos[id], house: true } });

// ------------------------------------------------------------------ dice
// k dice as the set of faces showing: mask -> probability.
function faceSets(k) {
  let dist = new Map([[0, 1]]);
  for (let i = 0; i < k; i++) {
    const next = new Map();
    for (const [mask, p] of dist) for (let f = 0; f < 6; f++) next.set(mask | (1 << f), (next.get(mask | (1 << f)) || 0) + p / 6);
    dist = next;
  }
  return [...dist];
}
const FACE_SETS = Array.from({ length: 11 }, (_, k) => faceSets(k));
// The chance k dice show one wanted face, and the Mash faces that put a number in reach.
const anyDie = (k) => 1 - (5 / 6) ** k;
const mashFaces = (n) => 6 - Math.abs(7 - n);

// ------------------------------------------------------------------ one morning
const blowDead = (crew) => Math.floor(crew / 2);
// Since 2026-11-24 a Still pours each time its number is brewed; --once models the old rule.
const ONCE = process.argv.includes("--once");

/* A policy is a set of prices, in barrels:
 *   rival     what a barrel poured for a rival costs me (0: I don't care; 1/3: I'm racing three men)
 *   man       what one of my Mobsters is worth (1.5 barrels: $300 against $200)
 *   rivalMan  what a dead rival Mobster is worth to me, as a share of `man`
 *   blow      the price of a blow: the marker, the Play it would have made, the Heat. Infinity: never.
 *   generous  brew a number that pours only for rivals, where a stingy boss passes
 *   ahead     weigh each pick by how the rest of the morning then plays out (every later boss
 *             choosing by his own prices), not by what the pick pours on the spot
 */
const P = (o = {}) => ({ rival: 0, man: 1.5, rivalMan: 0, blow: Infinity, generous: false, ahead: false, ...o });
const STINGY = P(), GENEROUS = P({ generous: true });

function permutations(a) {
  if (a.length <= 1) return [a];
  return a.flatMap((x, i) => permutations([...a.slice(0, i), ...a.slice(i + 1)]).map((r) => [x, ...r]));
}

// Enumerate every Mash, every Turn Order in `orders` and every roll. `policies` maps a seat (or
// "default") to a policy. Returns per-seat daily figures. `cut` is not a rule: it prices an option
// from brew-or-blow-review.md, where a boss whose pick pours only rivals' Stills takes `cut` barrels himself.
function morning(pos, policies = {}, { orders, supply = 30, cut = 0 } = {}) {
  const seats = [...new Set(Object.values(pos).map((p) => p.owner))];
  const S = seats.length, ix = Object.fromEntries(seats.map((s, i) => [s, i]));
  orders = (orders || permutations(seats)).map((o) => o.map((s) => ix[s]));
  const ids = Object.keys(pos);
  const N = ids.map((id) => D[id].still), OWN = ids.map((id) => ix[pos[id].owner]);
  const POUR = ids.map((id) => (pos[id].house ? 2 : 1)), DEAD = ids.map((id) => blowDead(pos[id].crew));
  const docks = seats.map((s) => ids.filter((id) => pos[id].owner === s && D[id].zone === "dock").length);
  const pol = seats.map((s) => policies[s] || policies.default || STINGY);
  const held = {};
  for (const n of N) held[n] = (held[n] || 0) + 1;

  // A result: gain, own-pick gain, dead, blows, dry (no barrel at all) per seat, then pours by number.
  const W = 5 * S + 13;
  const zero = () => new Float64Array(W);
  const axpy = (acc, x, p) => { for (let i = 0; i < W; i++) acc[i] += p * x[i]; };
  const utility = (r, me, q) => {
    let u = 0;
    for (let s = 0; s < S; s++) {
      if (s === me) u += r[s] - q.man * r[2 * S + s] - (q.blow === Infinity ? 0 : q.blow * r[3 * S + s]);
      else u += -q.rival * r[s] + q.man * q.rivalMan * r[2 * S + s];
    }
    return u;
  };

  // st: { poured, blown (bitmasks over ids), supply, acc (Float64Array: gain, own, dead, blows) }
  function leaf(st) {
    const r = zero();
    for (let i = 0; i < 4 * S; i++) r[i] = st.acc[i];
    for (let s = 0; s < S; s++) if (st.acc[s] === 0) r[4 * S + s] = 1;
    for (let j = 0; j < ids.length; j++) if (st.poured & (1 << j)) r[5 * S + N[j]] += 1;
    return r;
  }
  function apply(st, seat, type, n) {
    const nx = { poured: st.poured, blown: st.blown, supply: st.supply, acc: Float64Array.from(st.acc) };
    if (type === "blow") nx.acc[3 * S + seat] += 1;
    for (let j = 0; j < ids.length; j++) {
      if (N[j] !== n || (st.blown & (1 << j))) continue;
      if (type === "blow") { nx.blown |= 1 << j; nx.acc[2 * S + OWN[j]] += DEAD[j]; }
      else if (!ONCE || !(st.poured & (1 << j))) {
        nx.poured |= 1 << j; nx.supply -= POUR[j];
        nx.acc[OWN[j]] += POUR[j];
        if (OWN[j] === seat) nx.acc[S + seat] += POUR[j];
      }
    }
    return nx;
  }
  // What brewing n would pour right now: [mine, rivals'], or null if nothing would or the Supply can't cover it.
  function pourOf(st, seat, n) {
    let own = 0, other = 0;
    for (let j = 0; j < ids.length; j++) {
      if (N[j] !== n || ((st.blown | (ONCE ? st.poured : 0)) & (1 << j))) continue;
      if (OWN[j] === seat) own += POUR[j]; else other += POUR[j];
    }
    if (own + other === 0 || own + other > st.supply) return null;
    return [own === 0 ? Math.min(cut, st.supply - other) : own, other, own === 0 && cut > 0];
  }
  function rec(order, i, mash, st) {
    if (i === order.length) return leaf(st);
    const seat = order[i], k = docks[seat], q = pol[seat];
    if (k === 0) return rec(order, i + 1, mash, st);
    // Every action this seat could take this morning, valued once; then each roll picks its best.
    const passR = () => rec(order, i + 1, mash, st);
    const cache = new Map();
    const value = (key, make) => { if (!cache.has(key)) cache.set(key, make()); return cache.get(key); };
    const options = []; // per face: the actions it allows, each { key, u, own, other, result() }
    for (let f = 1; f <= 6; f++) {
      const n = mash + f, list = [];
      const pour = pourOf(st, seat, n);
      if (pour && (pour[0] > 0 || q.generous)) {
        const nx = apply(st, seat, "brew", n);
        if (pour[2]) { nx.acc[seat] += pour[0]; nx.acc[S + seat] += pour[0]; nx.supply -= pour[0]; }
        const result = () => value(`b${n}`, () => rec(order, i + 1, mash, nx));
        list.push({ key: `b${n}`, own: pour[0], other: pour[1], result, u: q.ahead ? utility(result(), seat, q) : pour[0] - q.rival * pour[1] });
      }
      if (q.blow !== Infinity) {
        let mineDead = 0, theirDead = 0, hit = false;
        for (let j = 0; j < ids.length; j++) {
          if (N[j] !== n || (st.blown & (1 << j))) continue;
          hit = true;
          if (OWN[j] === seat) mineDead += DEAD[j]; else theirDead += DEAD[j];
        }
        if (hit) {
          const nx = apply(st, seat, "blow", n);
          const result = () => value(`x${n}`, () => rec(order, i + 1, mash, nx));
          const denied = pourOf(st, seat, n) || [0, 0];
          const now = q.man * (q.rivalMan * theirDead - mineDead) + q.rival * denied[1] - q.blow;
          list.push({ key: `x${n}`, own: 0, other: 0, result, u: q.ahead ? utility(result(), seat, q) : now });
        }
      }
      options.push(list);
    }
    const passU = q.ahead ? utility(passR(), seat, q) : 0;
    const out = zero();
    const chosen = new Map(); // action key -> [probability, result thunk]
    for (const [mask, pm] of FACE_SETS[k]) {
      let best = null;
      for (let f = 0; f < 6; f++) if (mask & (1 << f)) for (const a of options[f]) {
        if (!best || a.u > best.u + 1e-12 || (Math.abs(a.u - best.u) <= 1e-12 && (a.own > best.own || (a.own === best.own && a.other < best.other)))) best = a;
      }
      // A stingy boss passes sooner than brew or blow for nothing.
      if (!best || best.u < passU - 1e-12 || (Math.abs(best.u - passU) <= 1e-12 && best.own === 0 && !q.generous)) best = { key: "pass", result: passR };
      const c = chosen.get(best.key);
      if (c) c[0] += pm; else chosen.set(best.key, [pm, best.result]);
    }
    for (const [p, result] of chosen.values()) axpy(out, result(), p);
    return out;
  }

  const sum = zero();
  const byPos = seats.map(() => seats.map(() => 0));
  for (const order of orders) for (let mash = 1; mash <= 6; mash++) {
    const r = rec(order, 0, mash, { poured: 0, blown: 0, supply, acc: new Float64Array(4 * S) });
    axpy(sum, r, 1 / 6 / orders.length);
    order.forEach((s, j) => { byPos[s][j] += r[s] / 6 / (orders.length / S); });
  }
  const out = {};
  seats.forEach((s, i) => {
    out[s] = { barrels: sum[i], own: sum[S + i], gift: sum[i] - sum[S + i], dead: sum[2 * S + i], blows: sum[3 * S + i], dry: sum[4 * S + i], byPos: byPos[i] };
  });
  const byNumber = {};
  for (const n of Object.keys(held)) byNumber[n] = sum[5 * S + Number(n)] / held[n];
  return { seats: out, byNumber, table: seats.reduce((a, s) => a + out[s].barrels, 0), docks: Object.fromEntries(seats.map((s, i) => [s, docks[i]])) };
}

// ------------------------------------------------------------------ printing
const f2 = (x) => x.toFixed(2);
const pct = (x) => `${(100 * x).toFixed(0)}%`;
const row = (cells, w) => cells.map((c, i) => String(c).padEnd(w[i])).join("");
function table(title, head, rows, w) {
  console.log(`\n${title}`);
  console.log(row(head, w));
  for (const r of rows) console.log(row(r, w));
}
const ALL = (q) => ({ default: q });
const venue = { MN: "sugar_hill", BX: "morris_park", QN: "richmond_hill", BK: "williamsburg" };
const dock2 = { MN: "bowery", BX: "belmont", QN: "jamaica", BK: "red_hook" };
// The grown table: every boss holds his start, a second Dock in his Borough (one man) and his
// Venue's 7 (`crew7` men, a Safehouse beside them unless told otherwise).
function grown({ crew7 = 2, house7 = true, skip7 = [] } = {}) {
  let pos = start();
  for (const b of BOROS) {
    pos = hold(pos, dock2[b], b, 1, false);
    if (!skip7.includes(b)) pos = hold(pos, venue[b], b, crew7, house7);
  }
  return pos;
}
const rivalsOf = (b) => BOROS.filter((x) => x !== b);
const avg = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;

// Other scripts can borrow the model: require() stops here, before the report.
module.exports = { DISTRICTS, D, BOROS, start, hold, withHouse, grown, morning, P, STINGY, GENEROUS, permutations, anyDie, mashFaces, blowDead };
if (require.main !== module) return;

// ================================================================== 0. the arithmetic
console.log("BREW OR BLOW: the board as build_board.js draws it, every roll enumerated.");
table("0. One boss, one number: the chance his own dice make it (averaged over the Mash)",
  ["Number", "Mash faces", "1 Dock", "2 Docks", "3 Docks", "4 Docks"],
  [7, 6, 5, 4, 3, 2].map((n) => [n === 7 ? "7" : `${n} or ${14 - n}`, `${mashFaces(n)} of 6`, ...[1, 2, 3, 4].map((k) => pct((mashFaces(n) / 6) * anyDie(k)))]),
  [12, 13, 9, 9, 9, 9]);
console.log("   Once the Mash is on the board and the number is in reach: " + [1, 2, 3, 4, 5].map((k) => `${k} ${k === 1 ? "die" : "dice"} ${pct(anyDie(k))}`).join(", ") + ".");
table("   A blown crew (half, rounded down, Runners first)", ["Crew", "Dead", "Left"],
  [1, 2, 3, 4, 5, 6, 7].map((c) => [c, blowDead(c), c - blowDead(c)]), [8, 8, 8]);

// ================================================================== 1. the opening
{
  const r = morning(start(), ALL(STINGY));
  table("1. The opening, four players, every boss brewing only what pours for him (barrels a Day)",
    ["Borough", "Stills", "Barrels", "Own pick", "Rivals' picks", "Dry mornings", "Picks 1st", "2nd", "3rd", "4th"],
    BOROS.map((b) => [BORO_NAME[b], Object.keys(start()).filter((id) => D[id].boro === b).map((id) => D[id].still + (start()[id].house ? "*" : "")).join(" "),
      f2(r.seats[b].barrels), f2(r.seats[b].own), f2(r.seats[b].gift), pct(r.seats[b].dry), ...r.seats[b].byPos.map(f2)]),
    [14, 12, 10, 10, 15, 14, 11, 7, 7, 7]);
  console.log(`   Table total ${f2(r.table)} barrels a Day. * marks the Safehouse. Each Still on a number pours on this share of mornings:`);
  console.log("   " + Object.keys(r.byNumber).sort((a, b) => a - b).map((n) => `${n}: ${pct(r.byNumber[n])}`).join("   "));
  const r3 = morning(start(["MN", "BX", "QN"]), ALL(STINGY));
  console.log("   Three players (Brooklyn boxed): " + ["MN", "BX", "QN"].map((b) => `${BORO_NAME[b]} ${f2(r3.seats[b].barrels)}`).join(", ") + ". Queens brews alone on its side.");
  const lone = morning(Object.fromEntries(Object.entries(start()).filter(([id]) => D[id].boro === "MN")), ALL(STINGY));
  console.log(`   Manhattan's start with nobody else at the table: ${f2(lone.seats.MN.barrels)}. The rest of its ${f2(r.seats.MN.barrels)} is poured by the Bronx's picks.`);
}

// ================================================================== 2. the pass
{
  // A one-Dock boss rolls one number. How often does it pour for him, for rivals only, for nobody?
  const pos = start();
  let mineP = 0, rivalP = 0, none = 0, rivalBarrels = 0;
  for (let mash = 1; mash <= 6; mash++) for (let f = 1; f <= 6; f++) {
    const stills = Object.entries(pos).filter(([id]) => D[id].still === mash + f);
    if (stills.some(([, p]) => p.owner === "MN")) mineP += 1 / 36;
    else if (stills.length) { rivalP += 1 / 36; rivalBarrels += stills.reduce((a, [, p]) => a + (p.house ? 2 : 1), 0) / 36; }
    else none += 1 / 36;
  }
  console.log(`\n2. The pass. At the opening a boss's one die makes a number of his own ${pct(mineP)} of mornings, a number only`);
  console.log(`   rivals cook ${pct(rivalP)} (${f2(rivalBarrels / rivalP)} barrels to the two men across the river if he brews it), and nobody's ${pct(none)}.`);
  const rows = [];
  for (const [name, pol] of [
    ["Everybody passes on a rivals' number", ALL(STINGY)],
    ["Everybody brews whatever he rolls", ALL(GENEROUS)],
    ["Manhattan and Queens pour for each other; the rest pass", { default: STINGY, MN: GENEROUS, QN: GENEROUS }],
    ["Manhattan alone pours for rivals", { default: STINGY, MN: GENEROUS }],
  ]) {
    const r = morning(pos, pol);
    rows.push([name, ...BOROS.map((b) => f2(r.seats[b].barrels)), f2(r.table)]);
  }
  table("   Barrels a Day at the opening", ["", "Manhattan", "The Bronx", "Queens", "Brooklyn", "Table"], rows, [58, 11, 11, 9, 10, 7]);
  const gs = morning(grown(), ALL(STINGY)), gg = morning(grown(), ALL(GENEROUS));
  console.log(`   At the grown table of section 6 (two Docks and a housed 7 each) the same choice is worth less: ${f2(gs.table)} passing, ${f2(gg.table)} pouring.`);
}

// ================================================================== 3. what a Dock is worth
{
  const rows = [];
  const base = start();
  const cases = [
    ["The start: 1 Dock", base],
    ["No Dock (West Side lost, nobody holds it)", (() => { const p = { ...base }; delete p.west_side; return p; })()],
    ["+ the Bowery (11), one man", hold(base, "bowery", "MN")],
    ["+ the Bowery and Stapleton (12)", hold(hold(base, "bowery", "MN"), "stapleton", "MN")],
    ["+ the Bowery, Stapleton and Tottenville (2)", hold(hold(hold(base, "bowery", "MN"), "stapleton", "MN"), "tottenville", "MN")],
  ];
  for (const [name, pos] of cases) {
    const r = morning(pos, ALL(STINGY));
    rows.push([name, r.docks.MN, f2(r.seats.MN.barrels), f2(r.seats.MN.own), f2(r.seats.MN.gift), pct(r.seats.MN.dry), f2(r.seats.BX.barrels)]);
  }
  table("3. What a Dock is worth: Manhattan adds piers to its start (barrels a Day)",
    ["Manhattan holds", "Dice", "Barrels", "Own pick", "Rivals' picks", "Dry mornings", "The Bronx gets"], rows, [46, 6, 9, 10, 15, 14, 14]);
  // The same piers once the pick is worth more: houses on all three starting Stills.
  const housed = withHouse(withHouse(base, "tenderloin"), "west_side");
  const h1 = morning(housed, ALL(STINGY)).seats.MN.barrels;
  const h2 = morning(hold(housed, "bowery", "MN"), ALL(STINGY)).seats.MN.barrels;
  const h3 = morning(hold(hold(housed, "bowery", "MN"), "stapleton", "MN"), ALL(STINGY)).seats.MN.barrels;
  console.log(`   With a Safehouse on all three starting Stills: 1 Dock ${f2(h1)}, 2 Docks ${f2(h2)}, 3 Docks ${f2(h3)}.`);
  // And at the grown table, where his best pick is a housed 7 that three other men's dice also chase.
  const g = grown();
  const less = { ...g }; delete less.bowery;
  const g1 = morning(less, ALL(STINGY)).seats.MN.barrels, g2 = morning(g, ALL(STINGY)).seats.MN.barrels;
  const g3 = morning(hold(g, "stapleton", "MN"), ALL(STINGY)).seats.MN.barrels;
  console.log(`   At the grown table of section 6 (a housed 7, rivals on theirs with two Docks each): 1 Dock ${f2(g1)}, 2 Docks ${f2(g2)}, 3 Docks ${f2(g3)}.`);
}

// ================================================================== 4. where the house goes
{
  const base = start();
  const rows = [];
  const cases = [
    ["Nothing more (house on Five Points 10)", base],
    ["2nd house on the Tenderloin (8)", withHouse(base, "tenderloin")],
    ["2nd house on West Side (9), the Bronx's house number", withHouse(base, "west_side")],
    ["Houses on all three", withHouse(withHouse(base, "tenderloin"), "west_side")],
    ["All three, and the Bronx does the same", withHouse(withHouse(withHouse(withHouse(base, "tenderloin"), "west_side"), "fordham"), "throggs_neck")],
  ];
  for (const [name, pos] of cases) {
    const r = morning(pos, ALL(STINGY));
    rows.push([name, f2(r.seats.MN.barrels), f2(r.seats.MN.own), f2(r.seats.MN.gift), f2(r.seats.BX.barrels), f2(r.table)]);
  }
  table("4. Where the house goes: Manhattan's free Safehouses on its starting Stills (barrels a Day)",
    ["Manhattan", "Barrels", "Own pick", "Rivals' picks", "The Bronx", "Table"], rows, [56, 9, 10, 15, 11, 7]);
}

// ================================================================== 5. which boiler next
{
  // One man on a Still nobody holds, added to Manhattan's start, with and without a house (the
  // Venues' Squads assumed gone). At the opening table, then at one where each rival already
  // cooks his own Venue's 7 with a house on it.
  const base = start();
  const others = grown({ skip7: ["MN"] });
  const o = Object.fromEntries(Object.entries(others).filter(([id, p]) => p.owner !== "MN" || base[id]));
  const m0 = morning(base, ALL(STINGY)).seats.MN.barrels, g0 = morning(o, ALL(STINGY)).seats.MN.barrels;
  const rows = [];
  for (const id of ["sugar_hill", "bowery", "jamaica", "stapleton", "tottenville"]) {
    const d = D[id];
    const gain = (pos, m) => `+${f2(morning(pos, ALL(STINGY)).seats.MN.barrels - m)}`;
    rows.push([`${d.name} (${d.still})`, d.zone === "dock" ? "Dock" : "Venue", gain(hold(base, id, "MN"), m0), gain(hold(base, id, "MN", 1, true), m0),
      o[id] ? "held" : gain(hold(o, id, "MN"), g0), o[id] ? "held" : gain(hold(o, id, "MN", 1, true), g0)]);
  }
  table("5. Which boiler next: one man on a free Still, added to Manhattan's start (barrels a Day gained)",
    ["District", "Type", "Opening", "with a house", "Rivals on their 7s", "with a house"], rows, [20, 8, 10, 15, 21, 14]);
  console.log("   A Dock's figure includes its die. \"Rivals on their 7s\": each rival holds his start, a second Dock and his Venue with a house.");
  // Taking a twin off the neighbour.
  const twin = morning(hold(base, "fordham", "MN", 3, false), ALL(STINGY));
  console.log(`   Take Fordham's 8 off the Bronx (both 8s yours): Manhattan ${f2(twin.seats.MN.barrels)} (from ${f2(m0)}), the Bronx ${f2(twin.seats.BX.barrels)}.`);
}

// ================================================================== 6. the sevens
{
  const plain = morning(grown({ house7: false }), ALL(STINGY));
  const one = morning(withHouse(grown({ house7: false }), "sugar_hill"), ALL(STINGY));
  const all = morning(grown(), ALL(STINGY));
  table("6. The sevens: every boss holds his start, two Docks and his Venue's 7 (barrels a Day)",
    ["", "Manhattan", "The Bronx", "Queens", "Brooklyn", "Table", "A 7 pours"],
    [["No house on any 7", ...BOROS.map((b) => f2(plain.seats[b].barrels)), f2(plain.table), pct(plain.byNumber[7])],
      ["Manhattan alone houses its 7", ...BOROS.map((b) => f2(one.seats[b].barrels)), f2(one.table), pct(one.byNumber[7])],
      ["Everybody houses his 7", ...BOROS.map((b) => f2(all.seats[b].barrels)), f2(all.table), pct(all.byNumber[7])]],
    [32, 11, 11, 9, 10, 8, 10]);
  const no7 = morning(grown({ skip7: ["MN"] }), ALL(STINGY));
  console.log(`   Manhattan without its 7 at that last table: ${f2(no7.seats.MN.barrels)} a Day against ${f2(all.seats.MN.barrels)}.`);
  const two = morning(hold(grown(), "morris_park", "MN", 2, true), ALL(STINGY));
  console.log(`   Manhattan holding Morris Park's 7 as well: Manhattan ${f2(two.seats.MN.barrels)}, the Bronx ${f2(two.seats.BX.barrels)}.`);
  console.log("   Each Still on a number pours on this share of mornings (everybody housing his 7):");
  console.log("   " + Object.keys(all.byNumber).sort((a, b) => a - b).map((n) => `${n}: ${pct(all.byNumber[n])}`).join("   "));
  // Turn Order at that table: a boss who brews what pours most now, against one who counts the rest of the morning.
  const racer = morning(grown(), ALL(P({ ahead: true })));
  table("   Turn Order at that table (Manhattan's barrels by where he picks)", ["", "1st", "2nd", "3rd", "4th", "All"],
    [["Brews what pours most on the spot", ...all.seats.MN.byPos.map(f2), f2(all.seats.MN.barrels)],
      ["Counts the picks still to come", ...racer.seats.MN.byPos.map(f2), f2(racer.seats.MN.barrels)]], [36, 7, 7, 7, 7, 7]);
}

// ================================================================== 7. the blow
{
  console.log("\n7. The blow. One marker, and every active Still on the number loses half its crew, rounded down.");
  // What one blow is worth, by what it hits.
  table("   One blow on the 7s, by a boss who holds none (three rivals, each with a house on his)",
    ["Crew on each 7", "Rivals' dead", "Barrels denied if he picks before them"],
    [1, 2, 3, 4, 5].map((c) => [c, 3 * blowDead(c), "6 (2 a Still)"]), [16, 14, 30]);
  console.log("   At the opening every bar, Dock and Ward holds three men, so a blow on any starting number kills one man on each");
  console.log("   Still that cooks it: two rivals' men from across the river, or one of his and one of yours on a number you share.");

  // What the shot is worth to a boss racing three rivals: a loss to one rival is worth a third of
  // that loss to him, so a blow that costs each of three rivals X is worth X.
  table("   What that blow is worth to him, in barrels (a dead man 1.5: $300 against $200)",
    ["Crew on each 7", "Picking before them", "Picking after them"],
    [1, 2, 3, 4, 5].map((c) => [c, f2(2 + 1.5 * blowDead(c)), f2(1.5 * blowDead(c))]), [16, 21, 20]);
  console.log("   Against that: the marker (a Play today), the same marker locked on the Heat Track until the next Raid, and the freshest name on it.");

  // The gunman at the grown table: how often the shot is there, first seat against last.
  const gun = (cost) => P({ rival: 1 / 3, rivalMan: 1 / 3, blow: cost, ahead: true });
  const calmP = P({ rival: 1 / 3, rivalMan: 1 / 3, ahead: true });
  const rv = rivalsOf("MN");
  const firstO = permutations(rv).map((o) => ["MN", ...o]), lastO = permutations(rv).map((o) => [...o, "MN"]);
  const rows = [];
  for (const crew7 of [3, 5]) for (const cost of [2.5, 4]) {
    const pos = grown({ crew7, skip7: ["MN"] });
    const line = (orders) => {
      const r = morning(pos, { default: STINGY, MN: gun(cost) }, { orders }), calm = morning(pos, { default: STINGY, MN: calmP }, { orders });
      return [f2(r.seats.MN.blows), f2(rv.reduce((a, b) => a + r.seats[b].dead, 0)), f2(avg(rv.map((b) => calm.seats[b].barrels)) - avg(rv.map((b) => r.seats[b].barrels)))];
    };
    rows.push([crew7, cost, ...line(firstO), ...line(lastO)]);
  }
  table("   A boss with no 7 and two Docks at the table of section 6, blowing whenever it pays him (per Day; rivals only brew)",
    ["Men on each 7", "A blow costs", "1st seat: blows", "rivals' dead", "barrels each loses", "Last seat: blows", "rivals' dead", "barrels each loses"], rows, [15, 14, 17, 14, 20, 18, 14, 18]);

  // Everybody armed, everybody on a 7.
  const rows2 = [];
  for (const crew7 of [3, 5]) for (const cost of [2.5, 4]) {
    const r = morning(grown({ crew7 }), ALL(gun(cost))), calm = morning(grown({ crew7 }), ALL(calmP));
    rows2.push([crew7, cost, f2(BOROS.reduce((a, b) => a + r.seats[b].blows, 0)), f2(BOROS.reduce((a, b) => a + r.seats[b].dead, 0)), f2(calm.table), f2(r.table)]);
  }
  table("   Everybody holds a 7 and everybody blows when it pays him",
    ["Men on each 7", "A blow costs", "Blows a Day", "Dead a Day", "Table barrels, no blows", "with blows"], rows2, [15, 14, 13, 12, 25, 12]);
  console.log("   A man with a Still on the number shoots himself too, so the shared 7 polices itself; the gun belongs to the man who holds none.");
}

// ================================================================== 8. the Supply
{
  // "Brew only a number the Supply can cover." The grown table's 7 asks 8 barrels.
  const rows = [];
  for (const supply of [30, 8, 7, 5, 3]) {
    const r = morning(grown(), ALL(STINGY), { supply });
    rows.push([supply, f2(r.table), pct(r.byNumber[7]), ...r.seats.MN.byPos.map(f2)]);
  }
  table("8. The Supply at the grown table (four housed 7s ask 8 barrels in one pick)",
    ["Moonshine in the Supply", "Table barrels", "A 7 pours", "Manhattan picking 1st", "2nd", "3rd", "4th"], rows, [25, 15, 12, 23, 7, 7, 7]);
}

// ================================================================== 9. the drafted brew
{
  // For comparison, the brew this one replaced (the Even City's, 2026-11-18), at the same opening:
  // one shared pool of Red dice, players + 1, repeats set aside; in Turn Order each boss drafts one
  // and fires only his own Stills on Mash + die, each for its Muscle Ratio (three men: 2 barrels);
  // Split the Batch fires one Connected Still beside the Boss's when his fires; and a rival's Still
  // on a number you pour gets the bad batch (half its crew, rounded up: three men lose 2).
  const pos = start();
  const seats = BOROS;
  const mineOn = (b, n) => Object.entries(pos).filter(([id, p]) => p.owner === b && D[id].still === n);
  const yieldOf = (b, n) => { const st = mineOn(b, n); return st.length * 2 + (st.some(([, p]) => p.house) ? 2 : 0); };
  const out = Object.fromEntries(seats.map((b) => [b, { barrels: 0, dead: 0, dry: 0 }]));
  const orders = permutations(seats);
  const pools = new Map();
  (function roll(i, mask) { if (i === seats.length + 1) { pools.set(mask, (pools.get(mask) || 0) + 6 ** -(seats.length + 1)); return; } for (let f = 0; f < 6; f++) roll(i + 1, mask | (1 << f)); })(0, 0);
  // Ties between dice are broken low-face-first and high-face-first in turn, so neither side of the river is favoured.
  for (const low of [true, false]) for (const order of orders) for (let mash = 1; mash <= 6; mash++) for (const [mask, pp] of pools) {
    const p = pp / 6 / orders.length / 2;
    let pool = [1, 2, 3, 4, 5, 6].filter((f) => mask & (1 << (f - 1)));
    if (!low) pool.reverse();
    const got = {}, dead = {};
    for (const b of order) {
      if (!pool.length) break;
      // Brew most; with nothing to brew, take the die that would have paid a rival most.
      let pick = pool[0], best = -1;
      for (const f of pool) { const y = yieldOf(b, mash + f); if (y > best) { best = y; pick = f; } }
      if (best === 0) { let worst = -1; for (const f of pool) { const y = Math.max(...seats.filter((x) => x !== b).map((x) => yieldOf(x, mash + f))); if (y > worst) { worst = y; pick = f; } } }
      pool = pool.filter((f) => f !== pick);
      if (best > 0) {
        got[b] = best;
        for (const [, q] of Object.entries(pos).filter(([id, q]) => q.owner !== b && D[id].still === mash + pick)) dead[q.owner] = (dead[q.owner] || 0) + Math.ceil(q.crew / 2);
      }
    }
    for (const b of seats) { out[b].barrels += p * (got[b] || 0); out[b].dead += p * (dead[b] || 0); if (!got[b]) out[b].dry += p; }
  }
  const now = morning(pos, ALL(STINGY));
  table("9. For comparison: the drafted brew of 2026-11-18 at the same opening (rivals hate-draft when they can't brew)",
    ["Borough", "Barrels a Day", "Dry mornings", "Dead a Day", "Brew or Blow: barrels", "dry"],
    seats.map((b) => [BORO_NAME[b], f2(out[b].barrels), pct(out[b].dry), f2(out[b].dead), f2(now.seats[b].barrels), pct(now.seats[b].dry)]), [14, 16, 15, 13, 24, 6]);
  console.log("   The draft's opening Stills pour 2 barrels each on the Muscle Ratio (three men), and 4 when the Boss's fires and he Splits the Batch.");
}

// ================================================================== 10. not a rule
{
  // An option priced for brew-or-blow-review.md, NOT in the Rulebook: a boss whose pick pours only
  // rivals' Stills takes one barrel himself (the middleman's cut), so nobody has a reason to pass.
  const rows = [];
  for (const [name, pos] of [["The opening", start()], ["Three players (Brooklyn boxed)", start(["MN", "BX", "QN"])], ["The grown table of section 6", grown()]]) {
    const a = morning(pos, ALL(STINGY)), b = morning(pos, ALL(STINGY), { cut: 1 });
    const seats = Object.keys(a.seats);
    rows.push([name, seats.map((x) => f2(a.seats[x].barrels)).join(" "), pct(avg(seats.map((x) => a.seats[x].dry))), seats.map((x) => f2(b.seats[x].barrels)).join(" "), pct(avg(seats.map((x) => b.seats[x].dry)))]);
  }
  table("10. Not a rule: the middleman's cut (a pick that pours only rivals' Stills pays the picker 1 barrel)",
    ["", "Today: barrels by seat", "dry", "With the cut", "dry"], rows, [34, 26, 7, 26, 6]);
}
