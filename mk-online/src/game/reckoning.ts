// Reckoning Phase implementation.
//
// 1. The Sweep — districts over the cap (5) lose runners. Walker's favor exempts owner.
// 2. Redistribute Titles — Borough Deeds, Syndicate Cards, Ward Boss.
// 3. Fulfill Contracts — decrement markers; on deadline, player decides completed/botched
//    (free-text objectives until ObjectiveSpecs land).
// 4. Endgame check — Commission + 20 Respect ends the game.

import type { Move } from "boardgame.io";
import type { GameState, PlayerID, TitleId, LiquorType } from "./types";
import {
  BOROUGHS,
  DISTRICTS,
  DISTRICT_BY_ID,
  SWEEP_LIMIT,
} from "./data";
import { evaluateObjective } from "./objectives";

export function runSweep(G: GameState) {
  for (const dId of Object.keys(G.districts)) {
    const ds = G.districts[dId];
    if (!ds.controller) continue;
    const p = G.players[ds.controller];
    if (p.favors.includes("walker")) continue; // City Hall Pass
    const crew = ds.mobsters[ds.controller];
    if (!crew) continue;
    const total = crew.bosses + crew.runners;
    if (total <= SWEEP_LIMIT) continue;
    const excess = total - SWEEP_LIMIT;
    const removeRunners = Math.min(crew.runners, excess);
    crew.runners -= removeRunners;
    p.runnersInSupply += removeRunners;
    G.log.push(
      `Sweep: ${DISTRICT_BY_ID[dId].name} (P${ds.controller}) -${removeRunners}R`
    );
  }
}

interface TitleHolder { player: PlayerID; count: number; }

function topTitleHolder(counts: Record<PlayerID, number>, minimum: number): PlayerID | null {
  const arr: TitleHolder[] = Object.entries(counts).map(([player, count]) => ({ player, count }));
  arr.sort((a, b) => b.count - a.count);
  if (arr.length === 0 || arr[0].count < minimum) return null;
  if (arr.length > 1 && arr[0].count === arr[1].count) return null;
  return arr[0].player;
}

export function redistributeTitles(G: GameState) {
  // Borough Deeds: most controlled districts in each borough (min 2).
  for (const b of BOROUGHS) {
    const counts: Record<PlayerID, number> = {};
    for (const d of DISTRICTS) {
      if (d.borough !== b.id) continue;
      const ds = G.districts[d.id];
      if (ds.controller === null) continue;
      counts[ds.controller] = (counts[ds.controller] ?? 0) + 1;
    }
    const winner = topTitleHolder(counts, 2);
    const prev = G.titles[b.id as TitleId];
    G.titles[b.id as TitleId] = winner;
    if (prev !== winner) {
      G.log.push(`Title ${b.name}: ${prev ?? "—"} → ${winner ?? "—"}`);
    }
  }

  // Syndicates: most controlled speakeasies of each house pour (min 2).
  const liquors: LiquorType[] = ["gin", "whisky", "moonshine", "rum"];
  for (const liquor of liquors) {
    const counts: Record<PlayerID, number> = {};
    for (const d of DISTRICTS) {
      if (!d.tags.includes("speakeasy") || d.housePour !== liquor) continue;
      const ds = G.districts[d.id];
      if (ds.controller === null) continue;
      counts[ds.controller] = (counts[ds.controller] ?? 0) + 1;
    }
    const winner = topTitleHolder(counts, 2);
    const titleId = (liquor + "Syndicate") as TitleId;
    const prev = G.titles[titleId];
    G.titles[titleId] = winner;
    if (prev !== winner) {
      G.log.push(`Syndicate ${liquor}: ${prev ?? "—"} → ${winner ?? "—"}`);
    }
  }

  // Ward Boss: most Ghetto districts (min 2).
  {
    const counts: Record<PlayerID, number> = {};
    for (const d of DISTRICTS) {
      if (!d.tags.includes("ghetto")) continue;
      const ds = G.districts[d.id];
      if (ds.controller === null) continue;
      counts[ds.controller] = (counts[ds.controller] ?? 0) + 1;
    }
    const winner = topTitleHolder(counts, 2);
    const prev = G.titles.wardBoss;
    G.titles.wardBoss = winner;
    if (prev !== winner) {
      G.log.push(`Ward Boss: ${prev ?? "—"} → ${winner ?? "—"}`);
    }
  }
}

/** Decrement contract markers; flag any that hit deadline, and pre-decide
 *  using machine evaluators if one exists for that contract id. */
export function tickContracts(G: GameState) {
  for (const playerID of Object.keys(G.players)) {
    const p = G.players[playerID];
    p.staked.forEach((sc, idx) => {
      sc.markersRemaining -= 1;
      // Return one marker to Stash.
      p.stash += 1;
      if (sc.markersRemaining <= 0) {
        const auto = evaluateObjective(G, playerID, sc.card.id);
        G.reckoning.pendingDeadlines.push({
          playerID,
          contractIdx: idx,
          decided: auto !== null,
          completed: auto === true,
        });
        if (auto !== null) {
          G.log.push(
            `⚖ ${sc.card.name} (P${playerID}) auto-evaluated: ${auto ? "✓ Completed" : "✗ Botched"}`
          );
        }
      }
    });
  }
}

export function computeRespect(G: GameState, playerID: PlayerID): number {
  const p = G.players[playerID];
  let r = 0;
  for (const b of BOROUGHS) {
    if (G.titles[b.id as TitleId] === playerID) r += b.respect;
  }
  if (G.titles.wardBoss === playerID) r += 3;
  for (const c of p.completed) r += c.respect;
  for (const t of ["gin", "whisky", "moonshine", "rum"] as const) {
    if (G.titles[(t + "Syndicate") as TitleId] === playerID) r += 2;
  }
  r -= p.shylockMarks;
  // Squealer's Grave: -3 Respect while holding the Rat Card.
  if (G.ratCard === playerID) r -= 3;
  return r;
}

function pickNewTurnToken(G: GameState, _playerID: PlayerID): { moon: "new" | "full"; number: number } {
  // Assign lowest available number of opposite moon. Track taken numbers.
  const nextMoon = G.moonPhase === "new" ? "full" : "new";
  const taken = new Set<number>();
  for (const id of Object.keys(G.players)) {
    const tt = G.players[id].turnToken;
    if (tt.moon === nextMoon) taken.add(tt.number);
  }
  for (let n = 1; n <= 4; n++) {
    if (!taken.has(n)) return { moon: nextMoon, number: n };
  }
  return { moon: nextMoon, number: 1 };
}

function advanceDay(G: GameState) {
  // Each player who Laid Low (everyone, by end of operations) gets a fresh
  // turn token of the next moon. The order is who laid low first → token 1.
  // For now: assign in laidLowOrder.
  for (let i = 0; i < G.operations.laidLowOrder.length; i++) {
    const id = G.operations.laidLowOrder[i];
    G.players[id].turnToken = pickNewTurnToken(G, id);
  }
  G.day += 1;
  G.moonPhase = G.moonPhase === "new" ? "full" : "new";
}

// ---- Moves ----

/** Auto-run sweep + redistribute titles + tick contracts. */
export const startReckoning: Move<GameState> = ({ G, events }) => {
  if (G.reckoning.subPhase !== "sweep") return;
  runSweep(G);
  redistributeTitles(G);
  tickContracts(G);
  G.reckoning.subPhase = G.reckoning.pendingDeadlines.length > 0 ? "contracts" : "done";
  if (G.reckoning.subPhase === "done") {
    // No deadlines this Day — proceed straight to win check + advance.
    finalizeReckoning(G, events);
  }
};

export const setContractOutcome: Move<GameState> = (
  { G },
  pendingIdx: number,
  completed: boolean
) => {
  const pd = G.reckoning.pendingDeadlines[pendingIdx];
  if (!pd) return;
  pd.decided = true;
  pd.completed = completed;
};

export const confirmReckoning: Move<GameState> = ({ G, playerID, events }) => {
  if (G.reckoning.subPhase !== "contracts") {
    // If sweep wasn't started yet, ignore. If done, ignore.
    return;
  }
  // Each player needs their pending decisions decided before confirming.
  const myPending = G.reckoning.pendingDeadlines.filter((pd) => pd.playerID === playerID);
  if (myPending.some((pd) => !pd.decided)) return;
  if (playerID && !G.reckoning.confirmed.includes(playerID)) {
    G.reckoning.confirmed.push(playerID);
  }
  // Once everyone with pending has confirmed (or all pendings are decided),
  // apply outcomes and advance.
  const allDecided = G.reckoning.pendingDeadlines.every((pd) => pd.decided);
  if (!allDecided) return;
  applyContractOutcomes(G);
  G.reckoning.subPhase = "done";
  finalizeReckoning(G, events);
};

function applyContractOutcomes(G: GameState) {
  // Sort by playerID then idx descending so splice indexes stay stable.
  const byPlayer: Record<string, typeof G.reckoning.pendingDeadlines> = {};
  for (const pd of G.reckoning.pendingDeadlines) {
    (byPlayer[pd.playerID] ??= []).push(pd);
  }
  for (const pid of Object.keys(byPlayer)) {
    const p = G.players[pid];
    const items = byPlayer[pid].slice().sort((a, b) => b.contractIdx - a.contractIdx);
    for (const pd of items) {
      const sc = p.staked[pd.contractIdx];
      if (!sc) continue;
      if (pd.completed) {
        p.completed.push(sc.card);
        p.cash += sc.card.take;
        G.log.push(`P${pid} COMPLETED ${sc.card.name} (+${sc.card.respect}R, +$${sc.card.take})`);
        // Commission check.
        const tiers = new Set(p.completed.map((c) => c.tier));
        if (tiers.has("gig") && tiers.has("racket") && tiers.has("score") && !p.hasCommission) {
          p.hasCommission = true;
          G.log.push(`P${pid} earns a Commission Card!`);
        }
      } else {
        G.decks[(sc.card.tier + "Discard") as "gigDiscard" | "racketDiscard" | "scoreDiscard"].push(sc.card);
        G.log.push(`P${pid} BOTCHED ${sc.card.name}.`);
      }
      p.staked.splice(pd.contractIdx, 1);
    }
  }
}

function finalizeReckoning(G: GameState, events: { endPhase: () => void }) {
  // Win check.
  for (const id of Object.keys(G.players)) {
    const p = G.players[id];
    if (p.hasCommission && computeRespect(G, id) >= 20) {
      G.winner = id;
      G.log.push(`★★★ P${id} WINS the Kingdom! ★★★`);
      events.endPhase();
      return;
    }
  }
  advanceDay(G);
  G.log.push(`Day ${G.day - 1} complete. Onward to Day ${G.day}.`);
  events.endPhase();
}
