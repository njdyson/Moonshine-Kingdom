// Shadows Phase implementation.
//
// Flow:
//   1. roll        — Turn Token #1 rolls (numPlayers+1) red + (numPlayers+1) white dice.
//   2. draft       — In turn order, each player drafts 1 red + 1 white, chooses Produce/Dump.
//                    Produce fires every still matching (red+white) across the board;
//                    each district's controller gets barrels per their crew size.
//   3. blowback    — Auto: remaining red+white sum = blowback number; matching stills
//                    explode, casualties per Production Cap (runners die first).
//   4. grease      — In turn order, each player funds Operations slots from Stash (max 5).
//                    Contract staking happens here too (deferred until hand mechanics land).
//
// Sub-phase advances via the moves themselves; the player-turn machinery is handled
// at the React/UI layer by reading `G.shadows.turnOrder[currentXIdx]`.

import type { Move } from "boardgame.io";
import type { GameState, LiquorType, PlayerID } from "./types";
import {
  OPERATIONS_SLOTS,
  productionCap,
  DISTRICT_BY_ID,
} from "./data";

/** Compute current Shadows turn order from each player's turn token. */
export function shadowsTurnOrder(G: GameState): PlayerID[] {
  return Object.keys(G.players).sort((a, b) => {
    const ta = G.players[a].turnToken.number;
    const tb = G.players[b].turnToken.number;
    return ta - tb;
  });
}

function currentDrafter(G: GameState): PlayerID | null {
  if (G.shadows.subPhase !== "draft") return null;
  return G.shadows.turnOrder[G.shadows.currentDrafterIdx] ?? null;
}

function currentGreaser(G: GameState): PlayerID | null {
  if (G.shadows.subPhase !== "grease") return null;
  return G.shadows.turnOrder[G.shadows.currentGreaserIdx] ?? null;
}

// ---- Moves ----

export const rollDice: Move<GameState> = ({ G, ctx, random, playerID }) => {
  if (G.shadows.subPhase !== "roll") return;
  // Whoever holds Turn Token #1 rolls; if not specified, the first player in
  // turn order is the roller.
  if (playerID !== null && playerID !== undefined) {
    const expected = G.shadows.turnOrder[0];
    if (expected && playerID !== expected) return;
  }
  const n = ctx.numPlayers + 1;
  G.shadows.redDice = random.D6(n);
  G.shadows.whiteDice = random.D6(n);
  G.shadows.diceRolled = true;
  G.shadows.subPhase = "draft";
  G.shadows.currentDrafterIdx = 0;
  G.shadows.events.push(
    `Dice: 🔴${G.shadows.redDice.join(" ")}  ⚪${G.shadows.whiteDice.join(" ")}`
  );
  G.log.push(
    `${n} red + ${n} white rolled: 🔴[${G.shadows.redDice.join(",")}] ⚪[${G.shadows.whiteDice.join(",")}]`
  );
};

export const draftDice: Move<GameState> = {
  ignoreStaleStateID: true,
  move: (
    { G, playerID },
    redIdx: number,
    whiteIdx: number,
    action: "produce" | "dump"
  ) => {
  if (G.shadows.subPhase !== "draft") return;
  const drafter = currentDrafter(G);
  if (!drafter || (playerID !== null && playerID !== undefined && playerID !== drafter)) return;
  if (redIdx < 0 || redIdx >= G.shadows.redDice.length) return;
  if (whiteIdx < 0 || whiteIdx >= G.shadows.whiteDice.length) return;

  const red = G.shadows.redDice[redIdx];
  const white = G.shadows.whiteDice[whiteIdx];
  const brewNumber = red + white;
  // Remove the drafted dice from the pool.
  G.shadows.redDice.splice(redIdx, 1);
  G.shadows.whiteDice.splice(whiteIdx, 1);

  if (action === "produce") {
    const events = brewStills(G, brewNumber, drafter);
    G.shadows.events.push(`P${drafter}: 🔴${red}+⚪${white}=${brewNumber} Produce → ${events.join("; ") || "no matching stills"}`);
    G.log.push(`P${drafter} Produce on ${brewNumber}: ${events.join("; ") || "no matches"}`);
  } else {
    G.shadows.events.push(`P${drafter}: 🔴${red}+⚪${white}=${brewNumber} Dump`);
    G.log.push(`P${drafter} Dump on ${brewNumber}`);
  }

  // Advance drafter.
  G.shadows.currentDrafterIdx += 1;
  if (G.shadows.currentDrafterIdx >= G.shadows.turnOrder.length) {
    // All players have drafted — auto-resolve Blowback then move to Grease.
    resolveBlowback(G);
    G.shadows.subPhase = "grease";
    G.shadows.currentGreaserIdx = 0;
  }
  },
};

/** Fire every still matching `brewNumber`. Returns event strings for logging. */
function brewStills(G: GameState, brewNumber: number, _drafter: PlayerID): string[] {
  const events: string[] = [];
  for (const id of Object.keys(G.districts)) {
    const ds = G.districts[id];
    const still = ds.still;
    if (!still || still.number !== brewNumber) continue;
    if (ds.stillBrewedThisDay) continue;
    if (ds.controller === null) {
      ds.stillBrewedThisDay = true;
      continue;
    }
    const crew = ds.mobsters[ds.controller];
    if (!crew) continue;
    const total = crew.bosses + crew.runners;
    if (total === 0) continue;
    const { brewed } = productionCap(total);
    const type: LiquorType = still.type; // dictated by the still token itself
    const available = Math.min(brewed, G.supply[type]);
    const name = districtName(id);
    if (available <= 0) {
      events.push(`${name}: Dry Tap (${type})`);
      ds.stillBrewedThisDay = true;
      continue;
    }
    G.supply[type] -= available;
    ds.barrels[ds.controller] = ds.barrels[ds.controller] ?? {
      moonshine: 0, gin: 0, whisky: 0, rum: 0,
    };
    ds.barrels[ds.controller][type] += available;
    ds.stillBrewedThisDay = true;
    events.push(`${name} → P${ds.controller} +${available} ${type}`);
  }
  return events;
}

function districtName(id: string): string {
  return DISTRICT_BY_ID[id]?.name ?? id;
}

function resolveBlowback(G: GameState) {
  if (G.shadows.redDice.length !== 1 || G.shadows.whiteDice.length !== 1) {
    G.shadows.blowbackNumber = null;
    G.log.push("Blowback skipped (dice pool not size 1+1).");
    return;
  }
  const blow = G.shadows.redDice[0] + G.shadows.whiteDice[0];
  G.shadows.blowbackNumber = blow;
  G.shadows.events.push(`Blowback 🔴${G.shadows.redDice[0]}+⚪${G.shadows.whiteDice[0]}=${blow}`);
  G.log.push(`Blowback on ${blow}: ${G.shadows.redDice[0]}+${G.shadows.whiteDice[0]}`);

  for (const id of Object.keys(G.districts)) {
    const ds = G.districts[id];
    if (!ds.still || ds.still.number !== blow) continue;
    if (ds.stillExplodedThisDay) continue;
    if (ds.controller === null) {
      ds.stillExplodedThisDay = true;
      continue;
    }
    const crew = ds.mobsters[ds.controller];
    if (!crew) continue;
    const total = crew.bosses + crew.runners;
    if (total === 0) continue;
    const { dead } = productionCap(total);
    let toKill = dead;
    const killRunners = Math.min(crew.runners, toKill);
    crew.runners -= killRunners;
    toKill -= killRunners;
    G.players[ds.controller].runnersInSupply += killRunners;
    if (toKill > 0) {
      const killBosses = Math.min(crew.bosses, toKill);
      crew.bosses -= killBosses;
      G.players[ds.controller].bossesInSupply += killBosses;
      if (killBosses > 0) {
        G.players[ds.controller].bossDown = true;
      }
    }
    ds.stillExplodedThisDay = true;
    const name = districtName(id);
    G.log.push(`💥 ${name} (${ds.still.type}) blew: P${ds.controller} -${dead} (runners first)`);
    if (crew.bosses + crew.runners === 0 && (ds.safehouses[ds.controller] ?? 0) === 0) {
      ds.controller = null;
      G.log.push(`${name} abandoned.`);
    }
  }
}

export const fundOps: Move<GameState> = ({ G, playerID }, count: number) => {
  if (G.shadows.subPhase !== "grease") return;
  const greaser = currentGreaser(G);
  if (!greaser || (playerID !== null && playerID !== undefined && playerID !== greaser)) return;
  const p = G.players[greaser];
  const room = OPERATIONS_SLOTS - p.operations;
  const move = Math.max(0, Math.min(count, p.stash, room));
  p.operations += move;
  p.stash -= move;
  G.log.push(`P${greaser} funded Ops: +${move} (now ${p.operations}/${OPERATIONS_SLOTS})`);
};

export const stakeContract: Move<GameState> = ({ G, playerID }, cardId: string) => {
  if (G.shadows.subPhase !== "grease") return;
  const greaser = currentGreaser(G);
  if (!greaser || (playerID !== null && playerID !== undefined && playerID !== greaser)) return;
  const p = G.players[greaser];
  const idx = p.hand.findIndex((c) => c.id === cardId);
  if (idx === -1) return;
  const card = p.hand[idx];
  if (p.stash < card.deadline) {
    G.log.push(`P${greaser} stake failed: need ${card.deadline} Stash markers, have ${p.stash}.`);
    return;
  }
  p.stash -= card.deadline;
  p.hand.splice(idx, 1);
  p.staked.push({ card, markersRemaining: card.deadline });
  G.log.push(`P${greaser} stakes ${card.name} (${card.deadline} markers)`);
};

export const confirmGrease: Move<GameState> = ({ G, playerID, events }) => {
  if (G.shadows.subPhase !== "grease") return;
  const greaser = currentGreaser(G);
  if (!greaser || (playerID !== null && playerID !== undefined && playerID !== greaser)) return;
  G.shadows.currentGreaserIdx += 1;
  if (G.shadows.currentGreaserIdx >= G.shadows.turnOrder.length) {
    G.shadows.subPhase = "done";
    G.log.push("Shadows complete.");
    events.endPhase();
  }
};
