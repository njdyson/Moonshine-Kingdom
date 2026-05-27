// Additional Operations Plays beyond movement & combat:
//   - Unload (Power Play, 2 Influence): sell barrels for cash, with Kickbacks
//     and Greed Tax for 4+ barrels.
//   - Push (1 Influence): shuffle barrels between a Controlled district and a
//     Connected one.
//   - Smuggle (1 Influence): import Rum at a Dock via dice.
//   - Extort (1 Influence): Borough Deed required; cash per district, Heat at 4+.
//   - Fix (1 Influence): Syndicate Card required; set that liquor's market value.

import type { Move } from "boardgame.io";
import type { GameState, LiquorType, BoroughId } from "./types";
import {
  DISTRICT_BY_ID,
  DISTRICTS,
  OPERATIONS_SLOTS,
  smugglingDice,
  smugglingTarget,
} from "./data";
import { endPlay } from "./operations";
import { startRaid, maybeTriggerHeatRaid } from "./raid";

function emptyBarrels(): Record<LiquorType, number> {
  return { moonshine: 0, gin: 0, whisky: 0, rum: 0 };
}

function isCurrent(G: GameState, playerID: string | null | undefined): boolean {
  if (G.operations.combat) return false;
  if (playerID === undefined || playerID === null) return true;
  return G.operations.currentPlayer === playerID;
}

function payCostOps(G: GameState, playerID: string, cost: number, heat: boolean): boolean {
  const p = G.players[playerID];
  if (p.operations < cost) return false;
  p.operations -= cost;
  if (heat && cost > 0) {
    G.heat.push({ owner: playerID });
    p.stash += cost - 1;
    maybeTriggerHeatRaid(G);
  } else {
    p.stash += cost;
  }
  return true;
}

// helper to keep tree-shake happy: nothing else.

// ---- Unload ----

export const unload: Move<GameState> = (
  { G, playerID, events },
  districtId: string,
  sales: { type: LiquorType; count: number }[]
) => {
  if (!isCurrent(G, playerID)) return;
  const me = G.operations.currentPlayer!;
  const p = G.players[me];
  const ds = G.districts[districtId];
  const d = DISTRICT_BY_ID[districtId];
  if (!ds || !d) return;
  if (ds.controller !== me || !d.tags.includes("speakeasy")) {
    G.log.push("Unload failed: must Control a Speakeasy.");
    return;
  }
  // Validate barrel inventory.
  const inv = ds.barrels[me] ?? emptyBarrels();
  let totalCount = 0;
  for (const sale of sales) {
    if (sale.count <= 0) continue;
    if (inv[sale.type] < sale.count) {
      G.log.push(`Unload failed: not enough ${sale.type}.`);
      return;
    }
    totalCount += sale.count;
  }
  if (totalCount === 0) {
    G.log.push("Unload failed: no barrels selected.");
    return;
  }
  // Greed Tax: 4+ barrels triggers Heat (unless Stephanie St. Clair's Favor).
  const heat = totalCount >= 4 && !p.favors.includes("stClair");
  if (p.operations < 2) {
    G.log.push("Unload failed: needs 2 Influence.");
    return;
  }
  if (!payCostOps(G, me, 2, heat)) return;

  // Apply sales.
  let cash = 0;
  let kickbacks = 0;
  for (const sale of sales) {
    if (sale.count <= 0) continue;
    inv[sale.type] -= sale.count;
    G.supply[sale.type] += sale.count; // return barrels to general supply
    cash += sale.count * G.market[sale.type];
    if (d.housePour === sale.type) {
      kickbacks += sale.count;
    }
  }
  ds.barrels[me] = inv;
  p.cash += cash;

  // Kickback: each matching barrel returns 1 Stash marker to Ops (cap 5).
  // Cap kickbacks at empty slots in Ops.
  let kbApplied = 0;
  while (kickbacks > 0 && p.operations < OPERATIONS_SLOTS && p.stash > 0) {
    p.stash -= 1;
    p.operations += 1;
    kickbacks -= 1;
    kbApplied += 1;
  }
  p.kickbacksReceived += kbApplied;
  G.log.push(
    `P${me} Unload at ${d.name}: ${totalCount} barrels → $${cash}` +
      (kbApplied > 0 ? ` (+${kbApplied} Kickback)` : "") +
      (heat ? " 🔥" : "")
  );
  endPlay(G, events);
};

// ---- Push ----

export const push: Move<GameState> = (
  { G, playerID, events },
  fromId: string,
  toId: string,
  barrels: { type: LiquorType; count: number }[]
) => {
  if (!isCurrent(G, playerID)) return;
  const me = G.operations.currentPlayer!;
  const from = G.districts[fromId];
  const to = G.districts[toId];
  const fd = DISTRICT_BY_ID[fromId];
  const td = DISTRICT_BY_ID[toId];
  if (!from || !to || !fd || !td) return;
  if (from.controller !== me) {
    G.log.push("Push failed: must Control the source district.");
    return;
  }
  // Connectivity: same as movePlay (graph or dock-hop).
  const isDockHop = fd.tags.includes("dock") && td.tags.includes("dock");
  if (!isDockHop && !fd.connections.includes(toId)) {
    G.log.push("Push failed: districts not connected.");
    return;
  }
  const inv = from.barrels[me] ?? emptyBarrels();
  for (const b of barrels) {
    if (inv[b.type] < b.count) {
      G.log.push(`Push failed: not enough ${b.type}.`);
      return;
    }
  }
  if (!payCostOps(G, me, 1, false)) return;
  // If destination is rival turf, the barrels become theirs.
  const destOwner = to.controller && to.controller !== me ? to.controller : me;
  to.barrels[destOwner] = to.barrels[destOwner] ?? emptyBarrels();
  for (const b of barrels) {
    inv[b.type] -= b.count;
    to.barrels[destOwner][b.type] += b.count;
  }
  from.barrels[me] = inv;
  const total = barrels.reduce((s, b) => s + b.count, 0);
  G.log.push(
    `P${me} Push ${fd.name} → ${td.name}: ${total} barrel${total === 1 ? "" : "s"}` +
      (destOwner !== me ? ` (now P${destOwner}'s)` : "")
  );
  endPlay(G, events);
};

// ---- Smuggle ----

export const smuggle: Move<GameState> = (
  { G, playerID, random, events },
  districtId: string,
  crewSize: number
) => {
  if (!isCurrent(G, playerID)) return;
  const me = G.operations.currentPlayer!;
  const p = G.players[me];
  const ds = G.districts[districtId];
  const d = DISTRICT_BY_ID[districtId];
  if (!ds || !d || !d.tags.includes("dock") || ds.controller !== me) {
    G.log.push("Smuggle failed: must Control a Dock.");
    return;
  }
  const crew = ds.mobsters[me] ?? { bosses: 0, runners: 0 };
  const total = crew.bosses + crew.runners;
  const send = Math.max(1, Math.min(5, crewSize, total));
  if (send <= 0) {
    G.log.push("Smuggle failed: no mobsters at Dock.");
    return;
  }
  if (!payCostOps(G, me, 1, false)) return;

  const myDocks = DISTRICTS.filter(
    (dd) => dd.tags.includes("dock") && G.districts[dd.id].controller === me
  ).length;
  const dice = smugglingDice(send);
  const target = smugglingTarget(myDocks);
  const rolls = random.D6(dice);
  let successes = 0;
  let failures = 0;
  for (const r of rolls) (r >= target ? successes++ : failures++);

  // Successes → Rum at the dock (limited by supply).
  const rumGained = Math.min(successes, G.supply.rum);
  if (rumGained > 0) {
    G.supply.rum -= rumGained;
    ds.barrels[me] = ds.barrels[me] ?? emptyBarrels();
    ds.barrels[me].rum += rumGained;
  }
  // Failures → arrests (runners first).
  let toArrest = failures;
  const killRunners = Math.min(crew.runners, toArrest);
  crew.runners -= killRunners;
  toArrest -= killRunners;
  p.runnersInSupply += killRunners;
  if (toArrest > 0) {
    const killBosses = Math.min(crew.bosses, toArrest);
    crew.bosses -= killBosses;
    p.bossesInSupply += killBosses;
    if (killBosses > 0) p.bossDown = true;
  }
  if (crew.bosses + crew.runners === 0 && (ds.safehouses[me] ?? 0) === 0) {
    ds.controller = null;
  }
  G.log.push(
    `P${me} Smuggle at ${d.name}: ${dice}d (hit ${target}+) [${rolls.join(",")}] → +${rumGained} Rum, -${failures} arrested`
  );
  endPlay(G, events);
};

// ---- Extort ----

export const extort: Move<GameState> = ({ G, playerID, events }, boroughId: BoroughId) => {
  if (!isCurrent(G, playerID)) return;
  const me = G.operations.currentPlayer!;
  const p = G.players[me];
  if (G.titles[boroughId] !== me) {
    G.log.push("Extort failed: you don't hold this Borough's Deed.");
    return;
  }
  if (p.extortedThisDay.includes(boroughId)) {
    G.log.push("Extort failed: once per Borough per Day.");
    return;
  }
  const ctrlCount = DISTRICTS.filter(
    (d) => d.borough === boroughId && G.districts[d.id].controller === me
  ).length;
  if (ctrlCount === 0) {
    G.log.push("Extort failed: no Districts Controlled in that Borough.");
    return;
  }
  const cash = ctrlCount * 200;
  const heat = cash >= 800;
  if (!payCostOps(G, me, 1, heat)) return;
  p.cash += cash;
  p.extortedThisDay.push(boroughId);
  G.log.push(
    `P${me} Extort ${boroughId}: ${ctrlCount} Districts × $200 = $${cash}` + (heat ? " 🔥" : "")
  );
  endPlay(G, events);
};

// ---- Fix ----

export const fix: Move<GameState> = (
  { G, playerID, events },
  liquor: LiquorType,
  newPrice: number
) => {
  if (!isCurrent(G, playerID)) return;
  const me = G.operations.currentPlayer!;
  const titleKey = (liquor + "Syndicate") as "ginSyndicate" | "whiskySyndicate" | "moonshineSyndicate" | "rumSyndicate";
  if (G.titles[titleKey] !== me) {
    G.log.push("Fix failed: you don't hold this Syndicate Card.");
    return;
  }
  // Joints of this liquor type controlled by me.
  const joints = DISTRICTS.filter(
    (d) => d.tags.includes("speakeasy") && d.housePour === liquor && G.districts[d.id].controller === me
  ).length;
  const maxPrice = Math.min(500, 200 + 100 * joints);
  if (newPrice < 200 || newPrice > maxPrice) {
    G.log.push(`Fix failed: price must be $200–$${maxPrice}.`);
    return;
  }
  if (!payCostOps(G, me, 1, false)) return;
  G.market[liquor] = newPrice;
  G.log.push(`P${me} Fix ${liquor}: $${newPrice}`);
  endPlay(G, events);
};

// ---- Bribe (Power Play, 2 Influence) ----

export const bribe: Move<GameState> = ({ G, playerID, events }, districtId: string) => {
  if (!isCurrent(G, playerID)) return;
  const me = G.operations.currentPlayer!;
  const p = G.players[me];
  const ds = G.districts[districtId];
  const d = DISTRICT_BY_ID[districtId];
  if (!ds || !d || !d.broker) {
    G.log.push("Bribe failed: no Power Broker here.");
    return;
  }
  if (ds.controller !== me) {
    G.log.push("Bribe failed: must Control the High Society District.");
    return;
  }
  if (p.favors.includes(d.broker)) {
    G.log.push("Bribe failed: you already hold this Favor.");
    return;
  }
  if (p.cash < 2500) {
    G.log.push("Bribe failed: needs $2,500.");
    return;
  }
  if (!payCostOps(G, me, 2, false)) return;
  p.cash -= 2500;
  p.favors.push(d.broker);
  p.totalInfluence += 1;
  p.stash += 1; // permanent marker goes to Stash
  G.log.push(`P${me} Bribe ${d.broker}: +1 permanent Influence, +Favor`);
  endPlay(G, events);
};

// ---- Rise (Power Play, 2 Influence — 0 cost cash) ----

export const rise: Move<GameState> = ({ G, playerID, events }, districtId: string) => {
  if (!isCurrent(G, playerID)) return;
  const me = G.operations.currentPlayer!;
  const p = G.players[me];
  if (!p.bossDown) {
    G.log.push("Rise failed: your Boss is not down.");
    return;
  }
  if (p.bossesInSupply === 0) {
    G.log.push("Rise failed: no spare Boss in supply.");
    return;
  }
  const ds = G.districts[districtId];
  if (!ds) return;
  const isUnoccupied = ds.controller === null;
  const isMine = ds.controller === me;
  if (!isUnoccupied && !isMine) {
    G.log.push("Rise failed: must be your District or Unoccupied.");
    return;
  }
  if (!payCostOps(G, me, 2, false)) return;
  p.bossesInSupply -= 1;
  ds.mobsters[me] = ds.mobsters[me] ?? { bosses: 0, runners: 0 };
  ds.mobsters[me].bosses += 1;
  // 2 free Runners.
  const runnersToAdd = Math.min(2, p.runnersInSupply);
  ds.mobsters[me].runners += runnersToAdd;
  p.runnersInSupply -= runnersToAdd;
  // Free Secure: place or relocate a safehouse here.
  if (p.safehousesInSupply > 0) {
    ds.safehouses[me] = (ds.safehouses[me] ?? 0) + 1;
    p.safehousesInSupply -= 1;
  }
  ds.barrels[me] = ds.barrels[me] ?? emptyBarrels();
  if (isUnoccupied) ds.controller = me;
  p.bossDown = false;
  G.log.push(`P${me} Rise at ${DISTRICT_BY_ID[districtId].name}: +Boss, +${runnersToAdd}R, +Safehouse`);
  endPlay(G, events);
};

// ---- Rat (Power Play, 2 Influence — triggers Police Raid) ----

export const rat: Move<GameState> = ({ G, playerID, events }) => {
  if (!isCurrent(G, playerID)) return;
  const me = G.operations.currentPlayer!;
  if (G.heat.length === 0) {
    G.log.push("Rat failed: no Heat markers on track.");
    return;
  }
  if (!payCostOps(G, me, 2, false)) return;
  G.log.push(`P${me} Rats out a rival.`);
  // Mark of the Snitch: take the Rat Card (from supply or snatch from current
  // holder). The Rat Card is NOT returned to supply on a Rat-triggered raid —
  // only natural Boiling-Point raids clear it (handled in raid.ts).
  const previousHolder = G.ratCard;
  G.ratCard = me;
  if (previousHolder === null) {
    G.log.push(`P${me} takes the Rat Card. Cannot Hustle until it is gone.`);
  } else if (previousHolder !== me) {
    G.log.push(`P${me} snatches the Rat Card from P${previousHolder}.`);
  }
  startRaid(G);
  // The raid pauses the turn flow until the target resolves all hits via
  // raidBribe / raidTakeTheFall. The Rat-er's Play is considered complete
  // either way -- advance turn only if no raid is pending.
  if (!G.operations.raid) endPlay(G, events);
};
