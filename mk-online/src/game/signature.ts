// Mob signature plays — one file per family:
//   Sicilian Syndicate: Capo, Consigliere
//   Hell's Kitchen Irish: Courage, Plunder
//   East Side Vipers: Stealth, Firepower
//   Harlem Knights: Skiff, Torch
//
// Combat-modifying plays (Courage, Plunder, Firepower) set a temporary flag
// on G.operations.combat that is consumed (and cleared) by the next combat
// roll in combat.ts. Stealth creates a vsRival pin in 'pinned' stage directly
// (skipping the Ambush). Skiff is a Move variant. Torch is a self-contained
// move during a vsRival pin where the attacker holds at least 1 Runner.

import type { Move } from "boardgame.io";
import type { GameState, PlayerID } from "./types";
import {
  DISTRICT_BY_ID,
  isCoastal,
} from "./data";
import { endPlay } from "./operations";
import { initiateCombat } from "./combat";
import { maybeTriggerHeatRaid } from "./raid";

function isCurrent(G: GameState, playerID: string | null | undefined): boolean {
  if (G.operations.combat) return false; // combat plays handled by their own gating
  if (playerID === undefined || playerID === null) return true;
  return G.operations.currentPlayer === playerID;
}

function spend(G: GameState, playerID: PlayerID, cost: number, heat: boolean): boolean {
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

// ============================================================================
// Sicilian Syndicate
// ============================================================================

/**
 * Capo (Cost: 2): Promote a Runner in a District to a second Boss (Capo).
 * Only Sicilians. Limited to 1 Capo total (i.e., 2 Bosses on board max).
 */
export const capo: Move<GameState> = ({ G, playerID, events }, districtId: string) => {
  if (!isCurrent(G, playerID)) return;
  const me = G.operations.currentPlayer!;
  const p = G.players[me];
  if (p.family !== "sicilian") {
    G.log.push("Capo failed: Sicilian Syndicate only.");
    return;
  }
  const ds = G.districts[districtId];
  if (!ds) return;
  const crew = ds.mobsters[me];
  if (!crew || crew.runners <= 0) {
    G.log.push("Capo failed: need a Runner in that District.");
    return;
  }
  if (p.bossesInSupply <= 0) {
    G.log.push("Capo failed: no spare Boss piece (you already have 2 Bosses out).");
    return;
  }
  if (!spend(G, me, 2, false)) return;
  crew.runners -= 1;
  crew.bosses += 1;
  p.bossesInSupply -= 1;
  p.runnersInSupply += 1;
  G.log.push(`P${me} promotes a Runner to Capo at ${DISTRICT_BY_ID[districtId].name}.`);
  endPlay(G, events);
};

/**
 * Consigliere (Cost: 1): remove 1 Influence marker from the Heat Track and
 * return it to its owner's Stash. Sicilian player picks which marker (index).
 */
export const consigliere: Move<GameState> = ({ G, playerID, events }, heatIdx: number) => {
  if (!isCurrent(G, playerID)) return;
  const me = G.operations.currentPlayer!;
  const p = G.players[me];
  if (p.family !== "sicilian") {
    G.log.push("Consigliere failed: Sicilian Syndicate only.");
    return;
  }
  if (heatIdx < 0 || heatIdx >= G.heat.length) {
    G.log.push("Consigliere failed: invalid Heat marker.");
    return;
  }
  if (!spend(G, me, 1, false)) return;
  const marker = G.heat.splice(heatIdx, 1)[0];
  G.players[marker.owner].stash += 1;
  G.log.push(`P${me} (Consigliere) removes a Heat marker belonging to P${marker.owner}.`);
  endPlay(G, events);
};

// ============================================================================
// Hell's Kitchen Irish
// ============================================================================

/**
 * Courage (Cost: 0, v5.1): Before you roll dice for an Ambush you declared
 * or for an Assault you initiated, discard 1 of your liquor barrels at the
 * target District for +1 Threat on that roll (max Threat 4). Cannot be
 * stacked — at most one use per combat. Cannot be used defensively (when
 * a rival initiated the Assault against you).
 *
 * Inventory by role (physical-possession rule):
 *   - Defender (Ambush): owns the district main inventory →
 *     G.districts[combatDistrict].barrels[defender].
 *   - Attacker (Assault): owns only what they physically carried in →
 *     combat.carried. Plunder pushes stolen barrels into combat.carried
 *     too, so the Plunder→Courage loop works naturally.
 * No explicit Police block — at a Precinct the Feds confiscate carried
 * liquor on entry, so combat.carried is empty and the check fails organically.
 */
export const courage: Move<GameState> = ({ G, playerID }, liquor: import("./types").LiquorType) => {
  const combat = G.operations.combat;
  if (!combat) return;
  let role: "attacker" | "defender";
  if (combat.stage === "pinned" && playerID === combat.attacker) {
    role = "attacker";
  } else if (combat.stage === "ambush" && combat.defender !== null && playerID === combat.defender) {
    role = "defender";
  } else {
    return;
  }
  const me = role === "attacker" ? combat.attacker : combat.defender!;
  const p = G.players[me];
  if (p.family !== "irish") return;
  if (role === "attacker") {
    if ((combat.attackerThreatBonus ?? 0) > 0) return;
    // Attacker possesses only what they carried in (and any Plundered barrels,
    // which Plunder transfers into combat.carried). District piles belong to
    // the defender.
    if ((combat.carried[liquor] ?? 0) <= 0) {
      G.log.push(`Courage failed: no ${liquor} carried into combat.`);
      return;
    }
    combat.carried[liquor] -= 1;
    G.supply[liquor] += 1;
    combat.attackerThreatBonus = 1;
    G.log.push(`P${me} (Courage): discards 1 ${liquor} for +1 Threat on next Assault.`);
  } else {
    if ((combat.defenderThreatBonus ?? 0) > 0) return;
    // Defender owns the district main inventory.
    const districtBarrels = G.districts[combat.districtId].barrels[me];
    if (!districtBarrels || (districtBarrels[liquor] ?? 0) <= 0) {
      G.log.push(`Courage failed: no ${liquor} in ${DISTRICT_BY_ID[combat.districtId].name}.`);
      return;
    }
    districtBarrels[liquor] -= 1;
    G.supply[liquor] += 1;
    combat.defenderThreatBonus = 1;
    G.log.push(`P${me} (Courage): discards 1 ${liquor} for +1 Threat on Ambush.`);
  }
};

/**
 * Plunder (Cost: 1 during pinned; 0 during Ambush): Special attack — hits
 * steal a barrel of attacker's choice instead of killing. Defender hits still
 * kill. Doesn't generate Heat. Setting this flag transforms the NEXT combat
 * roll resolution in combat.ts.
 */
export const plunder: Move<GameState> = ({ G, playerID }) => {
  const combat = G.operations.combat;
  if (!combat || combat.stage !== "pinned") return;
  if (playerID !== combat.attacker) return;
  const p = G.players[combat.attacker];
  if (p.family !== "irish") return;
  if (p.operations < 1) {
    G.log.push("Plunder failed: needs 1 Influence.");
    return;
  }
  p.operations -= 1; p.stash += 1;
  combat.plunderMode = true;
  G.log.push(`P${combat.attacker} (Plunder) primes a barrel-stealing attack.`);
};

// ============================================================================
// East Side Vipers
// ============================================================================

/**
 * Stealth (Cost: 1): Move up to 5 mobsters (no liquor) into a Connected rival
 * district without triggering an Ambush. Combat opens directly in 'pinned'
 * stage; must Assault or Advance.
 */
export const stealth: Move<GameState> = (
  { G, playerID },
  fromId: string,
  toId: string,
  bosses: number,
  runners: number
) => {
  if (!isCurrent(G, playerID)) return;
  const me = G.operations.currentPlayer!;
  const p = G.players[me];
  if (p.family !== "vipers") {
    G.log.push("Stealth failed: East Side Vipers only.");
    return;
  }
  const from = G.districts[fromId];
  const to = G.districts[toId];
  const fd = DISTRICT_BY_ID[fromId];
  const td = DISTRICT_BY_ID[toId];
  if (!from || !to || !fd || !td) return;
  if (from.controller !== me) return;
  const isDockHop = fd.tags.includes("dock") && td.tags.includes("dock");
  if (!isDockHop && !fd.connections.includes(toId)) return;
  const total = bosses + runners;
  if (total <= 0 || total > 5) return;
  const crew = from.mobsters[me];
  if (!crew || bosses > crew.bosses || runners > crew.runners) return;
  // Must be a rival district (Stealth's whole point).
  const rivalCrew = to.controller && to.controller !== me ? to.mobsters[to.controller] : null;
  if (!rivalCrew || (rivalCrew.bosses + rivalCrew.runners) === 0) {
    G.log.push("Stealth failed: target must be a Rival district.");
    return;
  }
  if (p.operations < 1) return;
  p.operations -= 1; p.stash += 1;
  // Deduct units from origin.
  crew.bosses -= bosses;
  crew.runners -= runners;
  if (crew.bosses + crew.runners === 0 && (from.safehouses[me] ?? 0) === 0) {
    from.controller = null;
  }
  // Open combat directly in pinned stage with no carried barrels.
  initiateCombat(G, me, to.controller!, fromId, toId, bosses, runners, []);
  G.operations.combat!.stage = "pinned";
  G.operations.combat!.stealthEntry = true;
  G.log.push(`P${me} (Stealth) slips into ${td.name} — no Ambush.`);
};

/**
 * Firepower (Cost: $200 flat): Add exactly ONE Attack Die to the next
 * Assault/Ambush roll (cap of 5 total dice enforced in combat.ts). Cannot
 * be stacked — at most one use per combat. Cannot be used when defending.
 */
export const firepower: Move<GameState> = ({ G, playerID }) => {
  const combat = G.operations.combat;
  if (!combat || combat.stage !== "pinned") return;
  if (playerID !== combat.attacker) return;
  const p = G.players[combat.attacker];
  if (p.family !== "vipers") return;
  if ((combat.attackerExtraDice ?? 0) > 0) return;
  const cost = 200;
  if (p.cash < cost) {
    G.log.push(`Firepower failed: needs $${cost}.`);
    return;
  }
  p.cash -= cost;
  combat.attackerExtraDice = 1;
  G.log.push(`P${combat.attacker} (Firepower): +1 die on next roll (−$${cost}).`);
};

// ============================================================================
// Harlem Knights
// ============================================================================

/**
 * Skiff (Cost: 1): Move up to 5 mobsters (with or without liquor) from a
 * Coastal District you control to any other Coastal District. Skips the
 * normal connection graph. Standard Ambush rules apply if rival district.
 *
 * Coastal Districts: all 25 except Fordham, Corona, Richmond Hill, Flushing.
 * See `isCoastal()` in data.ts.
 */
export const skiff: Move<GameState> = (
  { G, playerID, events },
  fromId: string,
  toId: string,
  bosses: number,
  runners: number,
  barrels: { type: import("./types").LiquorType; count: number }[] = []
) => {
  if (!isCurrent(G, playerID)) return;
  const me = G.operations.currentPlayer!;
  const p = G.players[me];
  if (p.family !== "knights") {
    G.log.push("Skiff failed: Harlem Knights only.");
    return;
  }
  const from = G.districts[fromId];
  const to = G.districts[toId];
  const fd = DISTRICT_BY_ID[fromId];
  const td = DISTRICT_BY_ID[toId];
  if (!from || !to || !fd || !td) return;
  if (from.controller !== me) return;
  if (!isCoastal(fromId) || !isCoastal(toId)) {
    G.log.push("Skiff failed: both districts must be Coastal.");
    return;
  }
  const crew = from.mobsters[me];
  if (!crew || bosses > crew.bosses || runners > crew.runners) return;
  const total = bosses + runners;
  if (total <= 0 || total > 5) return;
  const fromBarrels = from.barrels[me] ?? { moonshine: 0, gin: 0, whisky: 0, rum: 0 };
  for (const b of barrels) {
    if (fromBarrels[b.type] < b.count) {
      G.log.push(`Skiff failed: not enough ${b.type}.`);
      return;
    }
  }
  if (p.operations < 1) return;
  p.operations -= 1; p.stash += 1;
  // Deduct from origin.
  crew.bosses -= bosses;
  crew.runners -= runners;
  for (const b of barrels) fromBarrels[b.type] -= b.count;
  from.barrels[me] = fromBarrels;
  if (crew.bosses + crew.runners === 0 && (from.safehouses[me] ?? 0) === 0) {
    from.controller = null;
  }
  // Destination handling: if rival, initiate combat with Ambush stage.
  const toCrew = to.controller && to.controller !== me ? to.mobsters[to.controller] : null;
  if (toCrew && toCrew.bosses + toCrew.runners > 0) {
    initiateCombat(G, me, to.controller!, fromId, toId, bosses, runners, barrels);
    return;
  }
  if (to.precinct) {
    // Smash carried barrels and pin.
    G.log.push(`Police smash ${barrels.reduce((s, b) => s + b.count, 0)} barrel(s) entering ${td.name}.`);
    import("./combat").then(({ initiatePoliceCombat }) => initiatePoliceCombat(G, me, fromId, toId, bosses, runners));
    return;
  }
  // Safe landing.
  to.mobsters[me] = to.mobsters[me] ?? { bosses: 0, runners: 0 };
  to.mobsters[me].bosses += bosses;
  to.mobsters[me].runners += runners;
  to.barrels[me] = to.barrels[me] ?? { moonshine: 0, gin: 0, whisky: 0, rum: 0 };
  for (const b of barrels) to.barrels[me][b.type] += b.count;
  if (to.controller === null || to.controller !== me) to.controller = me;
  G.log.push(`P${me} (Skiff) ${fd.name} → ${td.name}: ${bosses}B/${runners}R.`);
  endPlay(G, events);
};

/**
 * Torch (Cost: 2 — generates Heat): Burn a rival Safehouse. Requires at
 * least 1 Runner Pinned in the target district. Sacrifices one Pinned
 * Runner (removed from game per rules). The rival's Safehouse is destroyed.
 * Rival mobsters and liquor remain intact (and retain Control).
 */
export const torch: Move<GameState> = ({ G, playerID, events }) => {
  const combat = G.operations.combat;
  if (!combat || combat.stage !== "pinned" || combat.vsPolice) return;
  if (playerID !== combat.attacker) return;
  const p = G.players[combat.attacker];
  if (p.family !== "knights") return;
  if (combat.pinned.runners <= 0) {
    G.log.push("Torch failed: need at least 1 Pinned Runner to sacrifice.");
    return;
  }
  if (combat.defender === null) return;
  const ds = G.districts[combat.districtId];
  if ((ds.safehouses[combat.defender] ?? 0) <= 0) {
    G.log.push("Torch failed: no rival Safehouse to burn.");
    return;
  }
  if (p.operations < 2) {
    G.log.push("Torch failed: needs 2 Influence.");
    return;
  }
  // Spend with Heat (Torch generates Heat).
  p.operations -= 2;
  G.heat.push({ owner: combat.attacker });
  p.stash += 1; // 1 marker returns; the other is on Heat track
  combat.pinned.runners -= 1;
  // Per rules: "He is removed from the game." We approximate by returning to
  // supply (no separate "out of game" pool in current model).
  p.runnersInSupply += 1;
  // Destroy 1 rival safehouse.
  ds.safehouses[combat.defender] -= 1;
  G.players[combat.defender].safehousesInSupply += 1;
  G.log.push(
    `🔥 P${combat.attacker} (Torch) burns Safehouse at ${DISTRICT_BY_ID[combat.districtId].name}, sacrificing 1 Runner.`
  );
  maybeTriggerHeatRaid(G);
  // The Torch ends combat: per rules the rival mobsters retain control and
  // the play ends. Attacker remains in the district as un-pinned? Actually
  // rules say Torch is used while Pinned — the rival keeps control because
  // the rival's mobsters are still there. Attacker's surviving Pinned crew
  // becomes... unclear. We'll Fall Back automatically.
  const origin = G.districts[combat.originId];
  origin.mobsters[combat.attacker] = origin.mobsters[combat.attacker] ?? { bosses: 0, runners: 0 };
  origin.mobsters[combat.attacker].bosses += combat.pinned.bosses;
  origin.mobsters[combat.attacker].runners += combat.pinned.runners;
  if (origin.controller === null) origin.controller = combat.attacker;
  G.operations.combat = null;
  if (events) endPlay(G, events);
};
