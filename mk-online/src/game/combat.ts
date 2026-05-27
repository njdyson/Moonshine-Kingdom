// Combat resolution: Ambush → Pinned → Assault / Advance / Fall Back.
//
// Combat is initiated by Move into hostile turf (handled in operations.ts
// movePlay). The combat session lives on G.operations.combat. While set, all
// non-combat operations moves are blocked for the attacker. Only the active
// combat participant (defender during ambush, attacker during pinned) acts.

import type { Move } from "boardgame.io";
import type { GameState, PlayerID, LiquorType } from "./types";
import {
  DISTRICT_BY_ID,
  combatDice,
  killThreshold,
  STORM_PRECINCT_COST,
} from "./data";
import { endPlay } from "./operations";
import { maybeTriggerHeatRaid } from "./raid";

const LIQUOR_TYPES: LiquorType[] = ["moonshine", "gin", "whisky", "rum"];

function emptyBarrels(): Record<LiquorType, number> {
  return { moonshine: 0, gin: 0, whisky: 0, rum: 0 };
}

/** Attacker threat: base 1 + Boss in fight + Capo (Sicilian both bosses attacking) + any Courage bonus. */
function attackerThreat(G: GameState, combat: GameState["operations"]["combat"]): number {
  if (!combat) return 1;
  let t = 1;
  if (combat.pinned.bosses > 0) t += 1;
  // Sicilian Capo: when both Bosses attack one District, +2 total (so already
  // +1 from base Boss; add another +1).
  const attacker = G.players[combat.attacker];
  if (attacker.family === "sicilian" && combat.pinned.bosses >= 2) t += 1;
  if (combat.attackerThreatBonus) t += combat.attackerThreatBonus;
  return Math.min(4, t);
}

/** Defender threat: base 1 + Boss + Safehouse (defending) + Ambush bonus if first shot. */
function defenderThreat(
  G: GameState,
  combat: GameState["operations"]["combat"],
  ambushBonus: boolean
): number {
  if (!combat || combat.defender === null) return 1;
  const defender = combat.defender;
  const ds = G.districts[combat.districtId];
  const crew = ds.mobsters[defender];
  let t = 1;
  if (crew && crew.bosses > 0) t += 1;
  if ((ds.safehouses[defender] ?? 0) > 0) t += 1;
  if (ambushBonus) t += 1;
  if (combat.defenderThreatBonus) t += combat.defenderThreatBonus;
  return Math.min(4, t);
}

function rollHits(random: { D6: (n: number) => number[] }, dice: number, threshold: number): { rolls: number[]; hits: number } {
  if (dice <= 0) return { rolls: [], hits: 0 };
  const rolls = random.D6(dice);
  const hits = rolls.filter((r) => r >= threshold).length;
  return { rolls, hits };
}

/** Apply N hits to a side's crew (runners first, then bosses). Returns kills. */
function applyHits(
  G: GameState,
  districtId: string,
  side: "attacker" | "defender",
  hits: number
): { runners: number; bosses: number } {
  const combat = G.operations.combat!;
  if (side === "attacker") {
    const killRunners = Math.min(combat.pinned.runners, hits);
    combat.pinned.runners -= killRunners;
    let rem = hits - killRunners;
    const killBosses = Math.min(combat.pinned.bosses, rem);
    combat.pinned.bosses -= killBosses;
    rem -= killBosses;
    // Return killed pieces to supply.
    G.players[combat.attacker].runnersInSupply += killRunners;
    G.players[combat.attacker].bossesInSupply += killBosses;
    if (killBosses > 0) G.players[combat.attacker].bossDown = true;
    return { runners: killRunners, bosses: killBosses };
  } else {
    // Defender-side hits only apply in non-police combat. Police pinning has
    // no rival defender; stormPrecinct resolves the engagement inline.
    if (combat.defender === null) return { runners: 0, bosses: 0 };
    const defender = combat.defender;
    const ds = G.districts[districtId];
    const crew = ds.mobsters[defender];
    if (!crew) return { runners: 0, bosses: 0 };
    const killRunners = Math.min(crew.runners, hits);
    crew.runners -= killRunners;
    let rem = hits - killRunners;
    const killBosses = Math.min(crew.bosses, rem);
    crew.bosses -= killBosses;
    rem -= killBosses;
    G.players[defender].runnersInSupply += killRunners;
    G.players[defender].bossesInSupply += killBosses;
    if (killBosses > 0) G.players[defender].bossDown = true;
    return { runners: killRunners, bosses: killBosses };
  }
}

/** Spend cost from attacker's Operations; Heat handled at combat end. */
function spendFromAttacker(G: GameState, cost: number): boolean {
  const combat = G.operations.combat;
  if (!combat) return false;
  const p = G.players[combat.attacker];
  if (p.operations < cost) return false;
  p.operations -= cost;
  p.stash += cost;
  return true;
}

/** After casualties applied, see if combat ends. Returns true if combat ended. */
function checkEnd(G: GameState, events?: { endPhase: () => void }): boolean {
  const combat = G.operations.combat;
  if (!combat) return true;
  // checkEnd is only invoked from non-police combat paths (ambush, assault,
  // plunder). Police combat (vsPolice, defender === null) resolves inline
  // inside stormPrecinct without going through this checker.
  if (combat.defender === null) return false;
  const defender = combat.defender;
  const ds = G.districts[combat.districtId];
  const defCrew = ds.mobsters[defender] ?? { bosses: 0, runners: 0 };
  const defTotal = defCrew.bosses + defCrew.runners;
  const atkTotal = combat.pinned.bosses + combat.pinned.runners;

  if (atkTotal === 0) {
    // Attacker wiped. Defender keeps district + any carried barrels.
    if (defTotal > 0 || (ds.safehouses[defender] ?? 0) > 0) {
      // Defender still in control.
      for (const t of LIQUOR_TYPES) {
        ds.barrels[defender] = ds.barrels[defender] ?? emptyBarrels();
        ds.barrels[defender][t] += combat.carried[t];
      }
      G.log.push(`⚔ Defender holds ${DISTRICT_BY_ID[combat.districtId].name}.`);
    } else {
      // Both sides wiped — abandon.
      ds.controller = null;
      G.log.push(`⚔ Both sides wiped at ${DISTRICT_BY_ID[combat.districtId].name}; abandoned.`);
    }
    finalizeCombat(G, events);
    return true;
  }

  if (defTotal === 0) {
    // Attacker wins. Take district + barrels in district + carry-ins.
    const prevController = ds.controller;
    ds.controller = combat.attacker;
    ds.mobsters[combat.attacker] = ds.mobsters[combat.attacker] ?? { bosses: 0, runners: 0 };
    ds.mobsters[combat.attacker].bosses += combat.pinned.bosses;
    ds.mobsters[combat.attacker].runners += combat.pinned.runners;
    // Combine carried barrels with existing district barrels (defender's loot).
    const prevBarrels = prevController && ds.barrels[prevController]
      ? ds.barrels[prevController]
      : emptyBarrels();
    ds.barrels[combat.attacker] = ds.barrels[combat.attacker] ?? emptyBarrels();
    for (const t of LIQUOR_TYPES) {
      ds.barrels[combat.attacker][t] += prevBarrels[t] + combat.carried[t];
    }
    if (prevController) ds.barrels[prevController] = emptyBarrels();
    // Rival safehouse: per rules, destroyed OR may be Commandeered. MVP: auto-destroy
    // (return to defender's supply). Commandeer can be added later as a choice point.
    if (prevController && (ds.safehouses[prevController] ?? 0) > 0) {
      const sh = ds.safehouses[prevController];
      ds.safehouses[prevController] = 0;
      G.players[prevController].safehousesInSupply += sh;
      G.log.push(`Safehouse at ${DISTRICT_BY_ID[combat.districtId].name} destroyed.`);
    }
    G.log.push(`⚔ Attacker P${combat.attacker} takes ${DISTRICT_BY_ID[combat.districtId].name}.`);
    finalizeCombat(G, events);
    return true;
  }
  // Combat continues — attacker remains Pinned.
  combat.stage = "pinned";
  return false;
}

function finalizeCombat(G: GameState, events?: { endPhase: () => void }) {
  const combat = G.operations.combat;
  if (!combat) return;
  // Heat: attacker who killed defenders generates 1 Heat marker (once per play).
  if (combat.attackerKilled) {
    G.heat.push({ owner: combat.attacker });
    G.log.push(`P${combat.attacker} draws Heat from the firefight.`);
    maybeTriggerHeatRaid(G);
  }
  G.operations.combat = null;
  // The Move/Assault Play that initiated combat is now resolved — advance turn
  // (unless a raid kicked in, which will resume the turn when it finalizes).
  if (events) endPlay(G, events);
}

// ---- Moves ----

/**
 * Initiate combat (called from movePlay when entering hostile turf).
 * Exported so operations.ts can call directly (not a player move).
 */
export function initiateCombat(
  G: GameState,
  attacker: PlayerID,
  defender: PlayerID,
  fromId: string,
  toId: string,
  bosses: number,
  runners: number,
  barrels: { type: LiquorType; count: number }[]
) {
  const carried: Record<LiquorType, number> = emptyBarrels();
  for (const b of barrels) carried[b.type] += b.count;
  G.operations.combat = {
    districtId: toId,
    attacker,
    defender,
    vsPolice: false,
    originId: fromId,
    pinned: { bosses, runners },
    carried,
    stage: "ambush",
    attackerKilled: false,
  };
  G.log.push(
    `⚠ Combat at ${DISTRICT_BY_ID[toId].name}: P${attacker} (${bosses}B/${runners}R) vs P${defender}. Defender's choice: Ambush or Hold Fire.`
  );
}

export function initiatePoliceCombat(
  G: GameState,
  attacker: PlayerID,
  fromId: string,
  toId: string,
  bosses: number,
  runners: number
) {
  // Carried barrels are smashed entering a Precinct (handled by caller).
  G.operations.combat = {
    districtId: toId,
    attacker,
    defender: null,
    vsPolice: true,
    originId: fromId,
    pinned: { bosses, runners },
    carried: emptyBarrels(),
    stage: "pinned", // Police never Ambush; attacker is immediately Pinned
    attackerKilled: false,
  };
  G.log.push(
    `🚓 Pinned at ${DISTRICT_BY_ID[toId].name} (Precinct). Storm, Advance, or Fall Back.`
  );
}

/** Defender chooses to Ambush (fire first) or Hold Fire. */
export const ambushChoice: Move<GameState> = ({ G, playerID, random, events }, ambush: boolean) => {
  const combat = G.operations.combat;
  if (!combat || combat.stage !== "ambush" || combat.vsPolice) return;
  if (playerID !== combat.defender) return;
  if (!ambush) {
    G.log.push(`P${combat.defender} Holds Fire.`);
    // Any pre-armed defender Courage is wasted (no roll to consume it).
    combat.defenderThreatBonus = 0;
    combat.stage = "pinned";
    return;
  }
  // Defender fires alone with +1 Ambush bonus.
  const ds = G.districts[combat.districtId];
  const defCrew = ds.mobsters[combat.defender] ?? { bosses: 0, runners: 0 };
  const defTotal = defCrew.bosses + defCrew.runners;
  const dice = combatDice(defTotal);
  const threat = defenderThreat(G, combat, true);
  const threshold = killThreshold(threat);
  const { rolls, hits } = rollHits(random, dice, threshold);
  G.log.push(
    `Ambush: defender rolls ${dice}d (T${threat}, hit ${threshold}+): [${rolls.join(",")}] = ${hits} hits.`
  );
  // Consume one-shot Courage bonus regardless of outcome.
  combat.defenderThreatBonus = 0;
  const killed = applyHits(G, combat.districtId, "attacker", hits);
  if (killed.bosses + killed.runners > 0) {
    G.log.push(`Attacker loses ${killed.runners}R/${killed.bosses}B.`);
  }
  // No Heat for defensive Ambush.
  checkEnd(G, events);
};

/**
 * Fold (defender, cost 0): surrender the room. Defender's mobsters flee to
 * one connected safe district. Carried liquor is left behind. Safehouse
 * stays (does not pack up). Attacker immediately takes Control, captures
 * dropped liquor, and may Commandeer the Safehouse (MVP: auto-destroy as
 * with assault victories). Invaders are NOT pinned — Play ends.
 *
 * destId: a district adjacent to the combat district that is safe for the
 * defender (no rival mobsters, no precinct). UI is responsible for offering
 * valid choices.
 */
export const fold: Move<GameState> = ({ G, playerID, events }, destId: string) => {
  const combat = G.operations.combat;
  if (!combat || combat.stage !== "ambush" || combat.vsPolice) return;
  if (playerID !== combat.defender) return;
  if (combat.defender === null) return;
  const defender = combat.defender;
  const attacker = combat.attacker;
  const combatDs = G.districts[combat.districtId];
  const destDs = G.districts[destId];
  if (!destDs) return;
  const fromDistrict = DISTRICT_BY_ID[combat.districtId];
  const toDistrict = DISTRICT_BY_ID[destId];
  if (!toDistrict) return;
  // Connectivity: graph adjacency or dock-hop (matches Move / Advance).
  const isDockHop = fromDistrict.tags.includes("dock") && toDistrict.tags.includes("dock");
  if (!isDockHop && !fromDistrict.connections.includes(destId)) {
    G.log.push("Fold failed: destination not connected.");
    return;
  }
  // Destination must be safe for the defender (no other rival mobsters, no precinct).
  if (destDs.precinct) {
    G.log.push("Fold failed: cannot flee into a Precinct.");
    return;
  }
  const blockedBy = destDs.controller && destDs.controller !== defender ? destDs.mobsters[destDs.controller] : null;
  if (blockedBy && blockedBy.bosses + blockedBy.runners > 0) {
    G.log.push("Fold failed: destination is hostile.");
    return;
  }

  // 1. Relocate defender's mobsters from combat district to destination.
  const defCrew = combatDs.mobsters[defender] ?? { bosses: 0, runners: 0 };
  destDs.mobsters[defender] = destDs.mobsters[defender] ?? { bosses: 0, runners: 0 };
  destDs.mobsters[defender].bosses += defCrew.bosses;
  destDs.mobsters[defender].runners += defCrew.runners;
  combatDs.mobsters[defender] = { bosses: 0, runners: 0 };
  if (destDs.controller === null) destDs.controller = defender;

  // 2. Defender's barrels at the combat district are left behind for the
  //    attacker (panic — fleeing mobsters cannot carry liquor).
  const droppedBarrels = combatDs.barrels[defender] ?? emptyBarrels();
  combatDs.barrels[defender] = emptyBarrels();

  // 3. Attacker takes Control of the combat district. Pinned crew enter the
  //    district. Carried barrels stay with the attacker; dropped barrels are
  //    captured.
  combatDs.controller = attacker;
  combatDs.mobsters[attacker] = combatDs.mobsters[attacker] ?? { bosses: 0, runners: 0 };
  combatDs.mobsters[attacker].bosses += combat.pinned.bosses;
  combatDs.mobsters[attacker].runners += combat.pinned.runners;
  combatDs.barrels[attacker] = combatDs.barrels[attacker] ?? emptyBarrels();
  for (const t of LIQUOR_TYPES) {
    combatDs.barrels[attacker][t] += combat.carried[t] + droppedBarrels[t];
    combat.carried[t] = 0;
  }

  // 4. Defender's Safehouse: per rules attacker may Commandeer or destroy.
  //    MVP mirrors the assault-victory path: auto-destroy and return to supply.
  if ((combatDs.safehouses[defender] ?? 0) > 0) {
    const sh = combatDs.safehouses[defender];
    combatDs.safehouses[defender] = 0;
    G.players[defender].safehousesInSupply += sh;
    G.log.push(`Safehouse at ${fromDistrict.name} destroyed (defender Folded).`);
  }

  G.log.push(`P${defender} Folds — flees to ${toDistrict.name}. P${attacker} takes ${fromDistrict.name}.`);

  // 5. End cleanly. Invaders are NOT pinned. No Heat (no killing happened).
  combat.defenderThreatBonus = 0;
  G.operations.combat = null;
  if (events) endPlay(G, events);
};

/** Attacker Assaults (spend 1 Influence; both sides roll). */
export const assault: Move<GameState> = ({ G, playerID, random, events }) => {
  const combat = G.operations.combat;
  if (!combat || combat.stage !== "pinned" || combat.vsPolice) return;
  if (playerID !== combat.attacker || combat.defender === null) return;
  if (!spendFromAttacker(G, 1)) {
    G.log.push("Assault failed: out of Influence.");
    return;
  }
  const ds = G.districts[combat.districtId];
  const defCrew = ds.mobsters[combat.defender] ?? { bosses: 0, runners: 0 };
  // Vipers Firepower: extra dice added to attacker (capped at 5 total).
  const baseAtkDice = combatDice(combat.pinned.bosses + combat.pinned.runners);
  const atkDice = Math.min(5, baseAtkDice + (combat.attackerExtraDice ?? 0));
  const defDice = combatDice(defCrew.bosses + defCrew.runners);
  const atkThreat = attackerThreat(G, combat);
  const defThreat = defenderThreat(G, combat, false); // no Ambush on Assault
  const atk = rollHits(random, atkDice, killThreshold(atkThreat));
  const def = rollHits(random, defDice, killThreshold(defThreat));
  G.log.push(
    `Assault: ATK ${atkDice}d T${atkThreat} hit ${killThreshold(atkThreat)}+ [${atk.rolls.join(",")}]=${atk.hits} | DEF ${defDice}d T${defThreat} hit ${killThreshold(defThreat)}+ [${def.rolls.join(",")}]=${def.hits}`
  );
  // Apply defender's hits to attacker first (always).
  const atkKilled = applyHits(G, combat.districtId, "attacker", def.hits);
  if (atkKilled.bosses + atkKilled.runners > 0) {
    G.log.push(`Attacker loses ${atkKilled.runners}R/${atkKilled.bosses}B.`);
  }

  // Consume one-shot extra-dice/threat modifiers regardless.
  combat.attackerThreatBonus = 0;
  combat.attackerExtraDice = 0;

  // If attacker is now wiped, plunder is moot.
  if (combat.pinned.bosses + combat.pinned.runners === 0) {
    combat.plunderMode = false;
    checkEnd(G, events);
    return;
  }

  // Plunder: pause for the attacker to pick which barrels to steal (up to
  // atk.hits, from defender's inventory at this district). Defender hits do
  // NOT count as "kills" for Heat in Plunder mode either, so attackerKilled
  // stays false here.
  if (combat.plunderMode && atk.hits > 0) {
    combat.pendingPlunder = { hits: atk.hits };
    G.log.push(`Plunder primed: pick up to ${atk.hits} barrel${atk.hits === 1 ? "" : "s"} from defender.`);
    return;
  }
  // Plunder primed but no hits — just clear the flag.
  if (combat.plunderMode) {
    combat.plunderMode = false;
    checkEnd(G, events);
    return;
  }

  // Normal Assault: apply attacker hits as kills.
  const defKilled = applyHits(G, combat.districtId, "defender", atk.hits);
  if (defKilled.bosses + defKilled.runners > 0) {
    combat.attackerKilled = true;
    G.log.push(`Defender loses ${defKilled.runners}R/${defKilled.bosses}B.`);
  }
  checkEnd(G, events);
};

/** Resolve a Plunder by transferring chosen barrels from defender to attacker's carried pool. */
export const pickPlunder: Move<GameState> = (
  { G, playerID, events },
  picks: { type: import("./types").LiquorType; count: number }[]
) => {
  const combat = G.operations.combat;
  if (!combat || !combat.pendingPlunder || combat.defender === null) return;
  if (playerID !== combat.attacker) return;
  const ds = G.districts[combat.districtId];
  const defBarrels = ds.barrels[combat.defender] ?? { moonshine: 0, gin: 0, whisky: 0, rum: 0 };
  // Validate.
  let total = 0;
  for (const p of picks) {
    if (p.count <= 0) continue;
    if ((defBarrels[p.type] ?? 0) < p.count) {
      G.log.push(`Plunder failed: not enough ${p.type} to steal.`);
      return;
    }
    total += p.count;
  }
  if (total > combat.pendingPlunder.hits) {
    G.log.push(`Plunder failed: ${total} > ${combat.pendingPlunder.hits} hits.`);
    return;
  }
  // Transfer.
  for (const p of picks) {
    if (p.count <= 0) continue;
    defBarrels[p.type] -= p.count;
    combat.carried[p.type] += p.count;
  }
  ds.barrels[combat.defender] = defBarrels;
  G.log.push(`Plunder! ${picks.filter((p) => p.count > 0).map((p) => `${p.count} ${p.type}`).join(", ") || "skipped"}.`);
  combat.pendingPlunder = null;
  combat.plunderMode = false;
  checkEnd(G, events);
};

/** Attacker Advances (spend 1 Influence; relocate pinned crew to a safe connected district). */
export const advance: Move<GameState> = (
  { G, playerID, events },
  destId: string,
  barrelsToTake: { type: LiquorType; count: number }[] = []
) => {
  const combat = G.operations.combat;
  if (!combat || combat.stage !== "pinned") return;
  if (playerID !== combat.attacker) return;
  const fd = DISTRICT_BY_ID[combat.districtId];
  const td = DISTRICT_BY_ID[destId];
  if (!td) return;
  // Connectivity: same as movePlay (dock-hop or graph adjacency).
  const isDockHop = fd.tags.includes("dock") && td.tags.includes("dock");
  if (!isDockHop && !fd.connections.includes(destId)) {
    G.log.push("Advance failed: destination not connected.");
    return;
  }
  // Destination must be Safe (no rival mobsters/police, OR your turf).
  const dest = G.districts[destId];
  const rivalCrew = dest.controller && dest.controller !== combat.attacker ? dest.mobsters[dest.controller] : null;
  if ((rivalCrew && rivalCrew.bosses + rivalCrew.runners > 0) || dest.precinct) {
    G.log.push("Advance failed: destination is hostile.");
    return;
  }
  // Validate barrels (limit 1 per mobster).
  const total = combat.pinned.bosses + combat.pinned.runners;
  const carrying = barrelsToTake.reduce((s, b) => s + b.count, 0);
  if (carrying > total) {
    G.log.push("Advance failed: too many barrels (max 1 per mobster).");
    return;
  }
  for (const b of barrelsToTake) {
    if (combat.carried[b.type] < b.count) {
      G.log.push(`Advance failed: not enough ${b.type} carried.`);
      return;
    }
  }
  if (!spendFromAttacker(G, 1)) return;

  // Place pinned crew at dest.
  dest.mobsters[combat.attacker] = dest.mobsters[combat.attacker] ?? { bosses: 0, runners: 0 };
  dest.mobsters[combat.attacker].bosses += combat.pinned.bosses;
  dest.mobsters[combat.attacker].runners += combat.pinned.runners;
  dest.barrels[combat.attacker] = dest.barrels[combat.attacker] ?? emptyBarrels();
  for (const b of barrelsToTake) {
    dest.barrels[combat.attacker][b.type] += b.count;
    combat.carried[b.type] -= b.count;
  }
  if (dest.controller === null) dest.controller = combat.attacker;

  // Any carried barrels left behind become defender's loot at the combat
  // district. Police combat (defender === null) already smashed carried
  // liquor when entering the Precinct, so there's nothing to drop.
  if (combat.defender !== null) {
    const defender = combat.defender;
    const combatDs = G.districts[combat.districtId];
    combatDs.barrels[defender] = combatDs.barrels[defender] ?? emptyBarrels();
    for (const t of LIQUOR_TYPES) {
      combatDs.barrels[defender][t] += combat.carried[t];
      combat.carried[t] = 0;
    }
  }

  G.log.push(`P${combat.attacker} Advances to ${td.name}.`);
  finalizeCombat(G, events);
};

/** Attacker Falls Back (free; retreat to origin, drop carried liquor for defender). */
export const fallBack: Move<GameState> = ({ G, playerID, events }) => {
  const combat = G.operations.combat;
  if (!combat || combat.stage !== "pinned") return;
  if (playerID !== combat.attacker) return;
  const origin = G.districts[combat.originId];
  origin.mobsters[combat.attacker] = origin.mobsters[combat.attacker] ?? { bosses: 0, runners: 0 };
  origin.mobsters[combat.attacker].bosses += combat.pinned.bosses;
  origin.mobsters[combat.attacker].runners += combat.pinned.runners;
  if (origin.controller === null) origin.controller = combat.attacker;

  // Drop carried barrels at combat district for the defender (if any).
  // Police-pinned combat already smashed carried liquor, so nothing to drop.
  if (combat.defender !== null) {
    const ds = G.districts[combat.districtId];
    ds.barrels[combat.defender] = ds.barrels[combat.defender] ?? emptyBarrels();
    for (const t of LIQUOR_TYPES) {
      ds.barrels[combat.defender][t] += combat.carried[t];
      combat.carried[t] = 0;
    }
  }
  G.log.push(`P${combat.attacker} Falls Back to ${DISTRICT_BY_ID[combat.originId].name}.`);
  finalizeCombat(G, events);
};

/** Storm the Precinct: 1 Influence, single all-or-nothing roll. */
export const stormPrecinct: Move<GameState> = ({ G, playerID, random, events }) => {
  const combat = G.operations.combat;
  if (!combat || combat.stage !== "pinned" || !combat.vsPolice) return;
  if (playerID !== combat.attacker) return;
  const p = G.players[combat.attacker];
  if (p.operations < STORM_PRECINCT_COST) {
    G.log.push(`Storm failed: needs ${STORM_PRECINCT_COST} Influence.`);
    return;
  }
  // Spend Influence (returns to Stash; no Heat from this Play itself —
  // the bullet count alone is the cost).
  p.operations -= STORM_PRECINCT_COST;
  p.stash += STORM_PRECINCT_COST;

  const total = combat.pinned.bosses + combat.pinned.runners;
  const dice = combatDice(total);
  const threat = attackerThreat(G, combat);
  const threshold = killThreshold(threat);
  const { rolls, hits } = rollHits(random, dice, threshold);
  // Every FAILED die kills 1 of your mobsters (runners first; bosses last).
  const fails = rolls.length - hits;
  const killed = applyHits(G, combat.districtId, "attacker", fails);
  G.log.push(
    `Storm: ${dice}d T${threat} hit ${threshold}+ [${rolls.join(",")}] = ${hits} hit / ${fails} fail · −${killed.runners}R/${killed.bosses}B`
  );
  const ds = G.districts[combat.districtId];
  if (hits >= 2) {
    // Success: Precinct destroyed.
    ds.precinct = false;
    G.log.push(`💥 Precinct at ${DISTRICT_BY_ID[combat.districtId].name} destroyed.`);
    // Survivors take the district (auto-Commandeer a Safehouse if available).
    const survivors = combat.pinned;
    if (survivors.bosses + survivors.runners > 0) {
      ds.controller = combat.attacker;
      ds.mobsters[combat.attacker] = ds.mobsters[combat.attacker] ?? { bosses: 0, runners: 0 };
      ds.mobsters[combat.attacker].bosses += survivors.bosses;
      ds.mobsters[combat.attacker].runners += survivors.runners;
      if (p.safehousesInSupply > 0) {
        p.safehousesInSupply -= 1;
        ds.safehouses[combat.attacker] = (ds.safehouses[combat.attacker] ?? 0) + 1;
        G.log.push(`P${combat.attacker} Commandeers a Safehouse at ${DISTRICT_BY_ID[combat.districtId].name}.`);
      }
    } else {
      // Pyrrhic — no one left to claim. District becomes abandoned.
      G.log.push(`No survivors. ${DISTRICT_BY_ID[combat.districtId].name} abandoned.`);
    }
    G.operations.combat = null;
    if (events) endPlayWrap(G, events);
  } else {
    // Failure: surviving mobsters Fall Back to origin.
    const origin = G.districts[combat.originId];
    origin.mobsters[combat.attacker] = origin.mobsters[combat.attacker] ?? { bosses: 0, runners: 0 };
    origin.mobsters[combat.attacker].bosses += combat.pinned.bosses;
    origin.mobsters[combat.attacker].runners += combat.pinned.runners;
    if (combat.pinned.bosses + combat.pinned.runners > 0 && origin.controller === null) {
      origin.controller = combat.attacker;
    }
    G.log.push(`Storm broken. Survivors Fall Back to ${DISTRICT_BY_ID[combat.originId].name}.`);
    G.operations.combat = null;
    if (events) endPlayWrap(G, events);
  }
};

function endPlayWrap(G: GameState, events: { endPhase: () => void }) {
  endPlay(G, events);
}
