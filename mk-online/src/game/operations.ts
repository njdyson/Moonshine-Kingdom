// Operations Phase implementation.
//
// Each Play costs Influence from the active player's Operations slots, returning
// to Stash (or Heat track if the Play generates Heat). Play passes to the next
// player in turn order. When all players have Laid Low, phase ends.
//
// MVP scope: Lay Low, Hustle, Move (no combat), Recruit, Secure. The rest
// (Combat, Unload, Push, Smuggle, Title Plays, Power Plays, signature plays)
// land in follow-up commits.

import type { Move } from "boardgame.io";
import type { GameState, PlayerID } from "./types";
import {
  DISTRICT_BY_ID,
  HAND_LIMIT_DEFAULT,
  HAND_LIMIT_WITH_GUINAN,
  OPERATIONS_SLOTS,
  RECRUIT_COST_DEFAULT,
  RECRUIT_COST_WARD_BOSS,
  RUNNER_CAP,
  SECURE_COST,
} from "./data";
import { shadowsTurnOrder } from "./shadows";
import { initiateCombat, initiatePoliceCombat } from "./combat";
import { maybeTriggerHeatRaid } from "./raid";

export function buildOpsQueue(G: GameState): PlayerID[] {
  return shadowsTurnOrder(G);
}

function isCurrent(G: GameState, playerID: PlayerID | undefined | null): boolean {
  // Combat in progress: only the active combat participant can move.
  if (G.operations.combat) return false;
  if (playerID === undefined || playerID === null) return true; // server-side
  return G.operations.currentPlayer === playerID;
}

function spendInfluence(G: GameState, playerID: PlayerID, cost: number, heat: boolean): boolean {
  const p = G.players[playerID];
  if (p.operations < cost) return false;
  p.operations -= cost;
  // For Heat-generating plays, one of the spent markers goes to the Heat Track;
  // remaining return to Stash.
  if (heat && cost > 0) {
    G.heat.push({ owner: playerID });
    p.stash += cost - 1;
    maybeTriggerHeatRaid(G);
  } else {
    p.stash += cost;
  }
  return true;
}

/** End the current Play: advance turn UNLESS a raid is pending (which pauses). */
export function endPlay(G: GameState, events: { endPhase: () => void }) {
  if (G.operations.raid) return; // raid will resume the turn when it finalizes
  advanceTurn(G, events);
}

/** After a Play resolves, advance to the next active player. Ends phase if empty. */
export function advanceTurn(G: GameState, events?: { endPhase: () => void }) {
  const cur = G.operations.currentPlayer;
  if (cur !== null) {
    G.operations.turnQueue = G.operations.turnQueue.filter((id) => id !== cur);
    if (G.players[cur].operations > 0) {
      G.operations.turnQueue.push(cur);
    } else {
      doLayLow(G, cur);
    }
  }
  G.operations.currentPlayer = G.operations.turnQueue[0] ?? null;
  if (G.operations.currentPlayer === null && events) {
    G.log.push("All players Laid Low. Operations complete.");
    events.endPhase();
  }
}

function doLayLow(G: GameState, playerID: PlayerID) {
  const p = G.players[playerID];
  // Clear remaining Operations to Stash.
  p.stash += p.operations;
  p.operations = 0;
  p.laidLow = true;
  G.operations.laidLowOrder.push(playerID);
  G.operations.turnQueue = G.operations.turnQueue.filter((id) => id !== playerID);
  // Assign new turn token: lowest available number of the OPPOSITE moon for next Day.
  // We track this lazily — recompute at Reckoning end. For now, just record they laid low.
  G.log.push(`P${playerID} Lays Low.`);
}

// ---- Moves ----

export const layLow: Move<GameState> = ({ G, playerID, events }) => {
  if (!isCurrent(G, playerID)) return;
  doLayLow(G, G.operations.currentPlayer!);
  // Advance.
  G.operations.currentPlayer = G.operations.turnQueue[0] ?? null;
  if (G.operations.currentPlayer === null) {
    G.log.push("All players Laid Low. Operations complete.");
    events.endPhase();
  }
};

export const hustle: Move<GameState> = (
  { G, playerID, random, events },
  picks: Array<"gig" | "racket" | "score">
) => {
  if (!isCurrent(G, playerID)) return;
  const me = G.operations.currentPlayer!;
  const p = G.players[me];
  if (p.hustledThisDay) return;
  // Mark of the Snitch: the Rat Card holder cannot Hustle.
  if (G.ratCard === me) {
    G.log.push(`P${me} Hustle failed: holding the Rat Card.`);
    return;
  }
  // Must have Boss in play.
  const totalBosses = p.family === "sicilian" ? 2 : 1;
  if (p.bossesInSupply >= totalBosses) {
    G.log.push(`P${me} Hustle failed: no Boss in play.`);
    return;
  }
  const drawCount = p.favors.includes("guinan") ? 3 : 2;
  if (!picks || picks.length !== drawCount) return; // UI must provide exactly drawCount picks
  if (!spendInfluence(G, me, 1, false)) return;
  p.hustledThisDay = true;

  const handLimit = p.favors.includes("guinan") ? HAND_LIMIT_WITH_GUINAN : HAND_LIMIT_DEFAULT;
  const drawn: string[] = [];

  for (const tier of picks) {
    // Reshuffle from discard if deck is empty.
    if (G.decks[tier].length === 0) {
      const discardKey = `${tier}Discard` as const;
      if (G.decks[discardKey].length > 0) {
        G.decks[tier] = random.Shuffle(G.decks[discardKey]);
        G.decks[discardKey] = [];
        G.log.push(`${tier[0].toUpperCase() + tier.slice(1)} deck reshuffled (${G.decks[tier].length} cards).`);
      } else {
        G.log.push(`P${me} Hustle: ${tier} deck is empty, skipping.`);
        continue;
      }
    }
    const card = G.decks[tier].pop()!;
    p.hand.push(card);
    drawn.push(`${card.name} [${tier}]`);
  }

  // Discard down to hand limit — oldest card dropped first (TODO: player choice).
  while (p.hand.length > handLimit) {
    const dropped = p.hand.shift()!;
    G.decks[`${dropped.tier}Discard` as const].push(dropped);
  }
  G.log.push(`P${me} Hustle: drew ${drawn.join(", ") || "nothing"}`);
  advanceTurn(G, events);
};

export const movePlay: Move<GameState> = (
  { G, playerID, events },
  fromId: string,
  toId: string,
  bosses: number,
  runners: number,
  barrels: { type: import("./types").LiquorType; count: number }[] = []
) => {
  if (!isCurrent(G, playerID)) return;
  const me = G.operations.currentPlayer!;
  const from = G.districts[fromId];
  const to = G.districts[toId];
  if (!from || !to) return;
  if (from.controller !== me) {
    G.log.push(`Move failed: P${me} does not control ${DISTRICT_BY_ID[fromId]?.name}.`);
    return;
  }
  // Connectivity: districts must be connected, or both Docks (water route).
  const fd = DISTRICT_BY_ID[fromId];
  const td = DISTRICT_BY_ID[toId];
  const isDockHop = fd.tags.includes("dock") && td.tags.includes("dock");
  if (!isDockHop && !fd.connections.includes(toId)) {
    G.log.push(`Move failed: ${fd.name} not connected to ${td.name}.`);
    return;
  }
  const crew = from.mobsters[me];
  if (!crew || bosses > crew.bosses || runners > crew.runners) {
    G.log.push(`Move failed: not enough units in ${fd.name}.`);
    return;
  }
  // Pre-move barrel checks.
  const fromBarrels = from.barrels[me] ?? { moonshine: 0, gin: 0, whisky: 0, rum: 0 };
  const carrying = barrels.reduce((s, b) => s + b.count, 0);
  if (carrying > bosses + runners) {
    G.log.push(`Move failed: too many barrels (max 1 per mobster).`);
    return;
  }
  for (const b of barrels) {
    if (fromBarrels[b.type] < b.count) {
      G.log.push(`Move failed: not enough ${b.type} in ${fd.name}.`);
      return;
    }
  }

  const toCrew = to.controller && to.controller !== me ? to.mobsters[to.controller] : null;
  const rivalHostile = !!(toCrew && toCrew.bosses + toCrew.runners > 0);
  const policeHostile = to.precinct; // Police districts trigger Pinned + smash liquor

  if (!spendInfluence(G, me, 1, false)) return;

  // Apply the deduction from origin regardless of outcome.
  crew.bosses -= bosses;
  crew.runners -= runners;
  for (const b of barrels) fromBarrels[b.type] -= b.count;
  from.barrels[me] = fromBarrels;
  if (
    crew.bosses + crew.runners === 0 &&
    (from.safehouses[me] ?? 0) === 0
  ) {
    from.controller = null;
  }

  if (rivalHostile) {
    // Combat session. The moved units are "pinned" at `toId` — they aren't
    // placed in to.mobsters until combat resolves (Advance lands them).
    initiateCombat(G, me, to.controller!, fromId, toId, bosses, runners, barrels);
    // Do NOT advanceTurn — combat continues this Play.
    return;
  }

  // Police district: smash carried liquor, pin attacker with police-combat state.
  if (policeHostile) {
    if (carrying > 0) {
      G.log.push(`Police smash ${carrying} barrel${carrying === 1 ? "" : "s"} entering ${td.name}.`);
    }
    initiatePoliceCombat(G, me, fromId, toId, bosses, runners);
    return;
  }

  // Peaceful move into safe/empty turf.
  to.mobsters[me] = to.mobsters[me] ?? { bosses: 0, runners: 0 };
  to.mobsters[me].bosses += bosses;
  to.mobsters[me].runners += runners;
  to.barrels[me] = to.barrels[me] ?? { moonshine: 0, gin: 0, whisky: 0, rum: 0 };
  for (const b of barrels) to.barrels[me][b.type] += b.count;
  if (to.controller === null || to.controller !== me) {
    to.controller = me;
  }
  G.log.push(
    `P${me} Move ${fd.name} → ${td.name}: ${bosses}B/${runners}R` +
      (carrying ? ` +${carrying} barrels` : "")
  );
  endPlay(G, events);
};

export const recruit: Move<GameState> = (
  { G, playerID, events },
  districtId: string,
  count: number
) => {
  if (!isCurrent(G, playerID)) return;
  const me = G.operations.currentPlayer!;
  const p = G.players[me];
  const ds = G.districts[districtId];
  if (!ds) return;
  if (ds.controller !== me || (ds.safehouses[me] ?? 0) === 0) {
    G.log.push(`Recruit failed: no Safehouse at ${DISTRICT_BY_ID[districtId]?.name}.`);
    return;
  }
  const isWardBoss = G.titles.wardBoss === me;
  const cost = (isWardBoss ? RECRUIT_COST_WARD_BOSS : RECRUIT_COST_DEFAULT) * count;
  if (p.cash < cost) {
    G.log.push(`Recruit failed: need $${cost}, have $${p.cash}.`);
    return;
  }
  // Cap check: total runners on board + count <= 15.
  const inSupplyOk = p.runnersInSupply >= count;
  if (!inSupplyOk) {
    G.log.push(`Recruit failed: only ${p.runnersInSupply} runners left in supply.`);
    return;
  }
  if (!spendInfluence(G, me, 1, false)) return;
  p.cash -= cost;
  p.runnersInSupply -= count;
  ds.mobsters[me] = ds.mobsters[me] ?? { bosses: 0, runners: 0 };
  ds.mobsters[me].runners += count;
  G.log.push(`P${me} Recruit +${count}R at ${DISTRICT_BY_ID[districtId].name} ($${cost})`);
  endPlay(G, events);
};

export const secure: Move<GameState> = ({ G, playerID, events }, districtId: string) => {
  if (!isCurrent(G, playerID)) return;
  const me = G.operations.currentPlayer!;
  const p = G.players[me];
  const ds = G.districts[districtId];
  if (!ds || ds.controller !== me) {
    G.log.push("Secure failed: must control the district.");
    return;
  }
  if (p.cash < SECURE_COST) return;
  if (p.safehousesInSupply === 0) {
    G.log.push("Secure failed: no spare safehouse (relocate instead — TODO).");
    return;
  }
  if (!spendInfluence(G, me, 1, false)) return;
  p.cash -= SECURE_COST;
  p.safehousesInSupply -= 1;
  ds.safehouses[me] = (ds.safehouses[me] ?? 0) + 1;
  G.log.push(`P${me} Secure at ${DISTRICT_BY_ID[districtId].name} ($${SECURE_COST})`);
  endPlay(G, events);
};

/** Silence unused-import warnings. */
export const _unused = { OPERATIONS_SLOTS, RUNNER_CAP };
