// Police Raid resolution.
//
// Trigger paths:
//   - 5th marker added to Heat Track (any source).
//   - Rat Play (Power Play; requires >=1 Heat).
//
// Sequence per rules:
//   1. Identify Target: mob with most Heat markers (fresh-scent tiebreaker
//      = rightmost / most-recent marker on track).
//   2. For each Precinct on the board: pick one adjacent District in the
//      same Borough that the Target Controls. Tie among multiple valid
//      districts -> Target's choice (MVP: highest units, then ledger order).
//   3. Per hit: Target picks Bribe ($1,000) or Take the Fall (lose all
//      Liquor + arrests per Production Cap).
//   4. Federal Rebuilding: respawn destroyed Precincts in ledger order.
//   5. Heat Track clears; resume play; bump crackdown counter (4P variant).

import type { Move } from "boardgame.io";
import type { GameState, PlayerID, LiquorType } from "./types";
import {
  DISTRICT_BY_ID,
  INITIAL_PRECINCTS,
  RAID_BRIBE_COST,
  REBUILD_PRIORITY,
  productionCap,
} from "./data";
import { advanceTurn } from "./operations";

const LIQUOR_TYPES: LiquorType[] = ["moonshine", "gin", "whisky", "rum"];

function emptyBarrels(): Record<LiquorType, number> {
  return { moonshine: 0, gin: 0, whisky: 0, rum: 0 };
}

/** Return every marker on the Heat track to its owner's Stash, then clear. */
function clearHeatTrack(G: GameState): void {
  for (const h of G.heat) {
    const p = G.players[h.owner];
    if (p) p.stash += 1;
  }
  G.heat = [];
}

function targetOfRaid(G: GameState): PlayerID | null {
  const counts: Record<string, { count: number; lastIdx: number }> = {};
  G.heat.forEach((h, i) => {
    counts[h.owner] = counts[h.owner] ?? { count: 0, lastIdx: -1 };
    counts[h.owner].count += 1;
    counts[h.owner].lastIdx = i;
  });
  let pick: PlayerID | null = null;
  let best = { count: -1, lastIdx: -1 };
  for (const [pid, info] of Object.entries(counts)) {
    if (
      info.count > best.count ||
      (info.count === best.count && info.lastIdx > best.lastIdx)
    ) {
      best = info;
      pick = pid;
    }
  }
  return pick;
}

function unitsAt(G: GameState, districtId: string, playerID: PlayerID): number {
  const ds = G.districts[districtId];
  if (!ds) return 0;
  const crew = ds.mobsters[playerID] ?? { bosses: 0, runners: 0 };
  const barrels = ds.barrels[playerID] ?? emptyBarrels();
  const liquor = LIQUOR_TYPES.reduce((s, t) => s + barrels[t], 0);
  return crew.bosses + crew.runners + liquor;
}

/** Build the raid plan: for each Precinct, find best target district. */
export function planRaid(G: GameState, target: PlayerID): GameState["operations"]["raid"] {
  const hits: { precinctDistrictId: string; targetDistrictId: string; resolved: false }[] = [];
  for (const pId of Object.keys(G.districts)) {
    if (!G.districts[pId].precinct) continue;
    const pDef = DISTRICT_BY_ID[pId];
    if (!pDef) continue;
    // Adjacent in same borough, controlled by target.
    const candidates = pDef.connections.filter((adj) => {
      const adjDef = DISTRICT_BY_ID[adj];
      if (!adjDef || adjDef.borough !== pDef.borough) return false;
      return G.districts[adj].controller === target;
    });
    if (candidates.length === 0) continue;
    // Pick by highest units; ties → ledger order.
    const ledger = REBUILD_PRIORITY[pDef.borough];
    candidates.sort((a, b) => {
      const ua = unitsAt(G, a, target);
      const ub = unitsAt(G, b, target);
      if (ub !== ua) return ub - ua;
      return ledger.indexOf(a) - ledger.indexOf(b);
    });
    hits.push({ precinctDistrictId: pId, targetDistrictId: candidates[0], resolved: false });
  }
  return { target, hits, currentIdx: 0 };
}

/** Kick off a raid. Returns true if a raid started (target found & had hits). */
export function startRaid(G: GameState): boolean {
  const target = targetOfRaid(G);
  if (target === null) {
    clearHeatTrack(G);
    return false;
  }
  const plan = planRaid(G, target);
  if (!plan || plan.hits.length === 0) {
    // Target has nothing to hit — Heat still clears.
    G.log.push(`Raid on P${target}: no eligible Districts in same Borough as any Precinct.`);
    clearHeatTrack(G);
    G.crackdown += 1;
    return false;
  }
  G.operations.raid = plan;
  G.log.push(
    `🚨 Police Raid on P${target} — ${plan.hits.length} hit${plan.hits.length === 1 ? "" : "s"} queued.`
  );
  return true;
}

/** Called after any move that adds Heat. If track hit 5+ markers, trigger raid. */
export function maybeTriggerHeatRaid(G: GameState): void {
  if (G.operations.raid) return; // already in one
  if (G.heat.length >= 5) {
    G.log.push("🚨 Heat Track Boiling Point reached!");
    // Heat-track raid only: old grudges are forgotten — return the Rat Card
    // to supply. (A Rat-play raid leaves the card on the snitch.)
    if (G.ratCard !== null) {
      G.log.push(`Rat Card returned to supply (was held by P${G.ratCard}).`);
      G.ratCard = null;
    }
    startRaid(G);
  }
}

/** Apply Bribe to the current hit and advance. */
export const raidBribe: Move<GameState> = ({ G, playerID, events }) => {
  const raid = G.operations.raid;
  if (!raid) return;
  if (playerID !== null && playerID !== undefined && playerID !== raid.target) return;
  const hit = raid.hits[raid.currentIdx];
  if (!hit || hit.resolved !== false) return;
  const p = G.players[raid.target];
  if (p.cash < RAID_BRIBE_COST) {
    G.log.push(`P${raid.target} can't afford bribe — forced Take the Fall at ${DISTRICT_BY_ID[hit.targetDistrictId].name}.`);
    applyTakeTheFall(G, hit.targetDistrictId);
    hit.resolved = "fall";
    raid.currentIdx += 1;
    if (raid.currentIdx >= raid.hits.length) finalizeRaid(G, events);
    return;
  }
  p.cash -= RAID_BRIBE_COST;
  hit.resolved = "bribe";
  G.log.push(`P${raid.target} Bribes Police at ${DISTRICT_BY_ID[hit.targetDistrictId].name}: -$${RAID_BRIBE_COST}.`);
  raid.currentIdx += 1;
  if (raid.currentIdx >= raid.hits.length) finalizeRaid(G, events);
};

/** Take the Fall: lose all liquor + arrests per Production Cap. */
export const raidTakeTheFall: Move<GameState> = ({ G, playerID, events }) => {
  const raid = G.operations.raid;
  if (!raid) return;
  if (playerID !== null && playerID !== undefined && playerID !== raid.target) return;
  const hit = raid.hits[raid.currentIdx];
  if (!hit || hit.resolved !== false) return;
  applyTakeTheFall(G, hit.targetDistrictId);
  hit.resolved = "fall";
  raid.currentIdx += 1;
  if (raid.currentIdx >= raid.hits.length) finalizeRaid(G, events);
};

function applyTakeTheFall(G: GameState, districtId: string) {
  const raid = G.operations.raid!;
  const target = raid.target;
  const ds = G.districts[districtId];
  const d = DISTRICT_BY_ID[districtId];
  const p = G.players[target];

  // Return all the target's liquor in this district to the general supply.
  const barrels = ds.barrels[target] ?? emptyBarrels();
  let totalLiquor = 0;
  for (const t of LIQUOR_TYPES) {
    G.supply[t] += barrels[t];
    totalLiquor += barrels[t];
    barrels[t] = 0;
  }
  ds.barrels[target] = barrels;

  // Arrest per Production Cap based on mobsters present.
  const crew = ds.mobsters[target] ?? { bosses: 0, runners: 0 };
  const total = crew.bosses + crew.runners;
  const { dead: arrests } = productionCap(total);
  let toArrest = arrests;
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
  // Abandonment.
  if (crew.bosses + crew.runners === 0 && (ds.safehouses[target] ?? 0) === 0) {
    ds.controller = null;
  }
  G.log.push(
    `🚓 ${d.name} raided: -${totalLiquor} barrels, -${arrests} arrested.`
  );
}

function finalizeRaid(G: GameState, events?: { endPhase: () => void }) {
  if (!G.operations.raid) return;
  federalRebuilding(G);
  clearHeatTrack(G);
  G.crackdown += 1;
  G.log.push(`Raid resolved. Heat track cleared. (Crackdown: ${G.crackdown})`);
  G.operations.raid = null;
  // Resume the paused turn now that the raid is over.
  if (events) advanceTurn(G, events);
}

/** Respawn missing Precincts per Town Planning Ledger order. */
export function federalRebuilding(G: GameState) {
  const onBoard = new Set<string>();
  for (const id of Object.keys(G.districts)) if (G.districts[id].precinct) onBoard.add(id);
  // Each missing precinct, grouped by its home borough (use INITIAL_PRECINCTS
  // as the source of truth for which districts host Precincts at start).
  const missingByBorough: Record<string, number> = {};
  for (const homeId of INITIAL_PRECINCTS) {
    if (onBoard.has(homeId)) continue;
    const def = DISTRICT_BY_ID[homeId];
    missingByBorough[def.borough] = (missingByBorough[def.borough] ?? 0) + 1;
  }
  for (const [borough, count] of Object.entries(missingByBorough)) {
    let placed = 0;
    for (const id of REBUILD_PRIORITY[borough as keyof typeof REBUILD_PRIORITY]) {
      if (placed >= count) break;
      const ds = G.districts[id];
      if (ds.precinct) continue;
      // "Unoccupied" — no mobsters from any player, no safehouses from any player.
      const hasUnits =
        Object.values(ds.mobsters).some((m) => (m.bosses + m.runners) > 0) ||
        Object.values(ds.safehouses).some((s) => s > 0);
      if (hasUnits) continue;
      ds.precinct = true;
      placed += 1;
      G.log.push(`Federal Rebuilding: Precinct returns to ${DISTRICT_BY_ID[id].name}.`);
    }
  }
}
