// Reusable bot-vs-bot sim runner. Used by:
//   - scripts/sim.ts (CLI batch runs)
//   - src/ui/SimLab.tsx (in-browser Sim Lab with live progress)
//
// Each game spins up a fresh bgio Client (no transport) and dispatches the
// bot's chosen move for whichever bot has the turn until the game ends, hits
// max days, or stalls.

import { Client } from "boardgame.io/client";
import type { Ctx, State } from "boardgame.io";
import { MoonshineKingdom } from "../game/game";
import { isBotTurn, pickBotMove, DEFAULT_PERSONALITY, type BotPersonality } from "../game/bot";
import { computeRespect } from "../game/reckoning";
import { evaluateObjective } from "../game/objectives";
import type { GameState } from "../game/types";
import { DEFAULT_MCTS_OPTIONS, type MctsOptions } from "./mcts";

export interface SimOptions {
  games: number;
  players: number;
  maxDays: number;
  maxSteps: number;
  staleLimit: number;
  /** Capture the per-move trail (used in verbose mode). Off by default
   *  because the trail can get large for long games. */
  captureTrail?: boolean;
  /** Layer 3 MCTS settings. When provided, the bot uses MCTS for Operations
   *  decisions. Set to null to force Layer 2 only. Default: light MCTS. */
  mcts?: MctsOptions | null;
  /** Disable Layer 2 (1-ply lookahead) too — bot uses heuristic-only.
   *  Mainly useful for A/B baselines in the Sim Lab. */
  noLookahead?: boolean;
  /** Personality dials applied to every bot in the sim. The Sim Lab exposes
   *  these as sliders for tuning + exploit-finding. */
  personality?: BotPersonality;
  /** Per-seat personality override. Indexed by player ID ("0", "1", ...).
   *  When set, this takes precedence over `personality` for that seat. */
  perSeatPersonality?: Record<string, BotPersonality>;
}

export interface PlayerEndStats {
  /** Mob family this seat played for this game (random per game in the Sim
   *  Lab — see runGame's localStorage stash). */
  family: string;
  /** Borough this seat started in for this game (null only for Staten, which
   *  is never a starting borough — kept for completeness). */
  startingBorough: string | null;
  respect: number;
  cash: number;
  completed: number;
  staked: number;
  hand: number;
  hasCommission: boolean;
  titles: number;
  districts: number;
  totalBarrels: number;
  liquorValue: number;
  shylockMarks: number;
  /** Power Broker Favors owned (Bribe count; permanent +1 Influence each). */
  favors: number;
  /** Lifetime Kickbacks received from housePour-matched Unloads. */
  kickbacks: number;
}

export type OutcomeReason = "win" | "max-days" | "stalled" | "no-move" | "error";

export interface GameOutcome {
  index: number;
  winner: string | null;
  reason: OutcomeReason;
  days: number;
  steps: number;
  wallMs: number;
  perPlayer: Record<string, PlayerEndStats>;
  /** How many times each move name was dispatched in this game. */
  moveCounts: Record<string, number>;
  lastError?: string;
  trail?: string[];
}

export const DEFAULT_OPTIONS: SimOptions = {
  games: 10,
  players: 4,
  maxDays: 25,
  maxSteps: 5000,
  staleLimit: 50,
  mcts: DEFAULT_MCTS_OPTIONS,
};

const LIQUOR_TYPES = ["moonshine", "gin", "whisky", "rum"] as const;

export function runGame(index: number, opts: SimOptions): GameOutcome {
  const t0 = Date.now();
  // setup() reads two localStorage keys that would otherwise leak the
  // lobby's state into every sim game:
  //
  //   - `mk-setup-picks`: the human's last family/borough selection. Without
  //     this fix, every sim game spawns the SAME matchup (e.g. P0=Vipers in
  //     Bronx, P1=Irish in Queens forever) and whichever seat that combo
  //     favours wins ~always — masquerading as "P1 is overpowered".
  //   - `mk-resume-pending`: set when the user clicks Resume from the lobby.
  //     If stale, every sim game would clone the saved state instead of
  //     starting fresh.
  //
  // Stash both before client.start() (which is when setup() runs), then
  // restore immediately after so the lobby's state survives the sim batch.
  const stash: { key: string; value: string | null }[] = [];
  if (typeof window !== "undefined") {
    for (const key of ["mk-setup-picks", "mk-resume-pending"]) {
      try {
        const v = window.localStorage.getItem(key);
        stash.push({ key, value: v });
        if (v !== null) window.localStorage.removeItem(key);
      } catch { /* private mode / quota — fall through */ }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = (Client as any)({
    game: MoonshineKingdom,
    numPlayers: opts.players,
  });
  client.start();

  // Restore stashed lobby state so the user's selection survives.
  if (typeof window !== "undefined") {
    for (const { key, value } of stash) {
      if (value !== null) {
        try { window.localStorage.setItem(key, value); } catch { /* ignore */ }
      }
    }
  }

  const trail: string[] = [];
  let lastKey = "";
  let staleCount = 0;
  let steps = 0;
  const moveCounts: Record<string, number> = {};
  let lastError: string | undefined;

  const cleanup = (): GameOutcome => {
    const finalState = client.getState();
    const G = (finalState?.G ?? {}) as GameState;
    const perPlayer: Record<string, PlayerEndStats> = {};
    for (const pid of Object.keys(G.players ?? {})) {
      const p = G.players[pid];
      let titles = 0;
      for (const [, holder] of Object.entries(G.titles ?? {})) {
        if (holder === pid) titles += 1;
      }
      let districts = 0;
      let totalBarrels = 0;
      let liquorValue = 0;
      for (const did of Object.keys(G.districts ?? {})) {
        if (G.districts[did].controller === pid) districts += 1;
        const b = G.districts[did].barrels[pid] ?? { moonshine: 0, gin: 0, whisky: 0, rum: 0 };
        for (const t of LIQUOR_TYPES) {
          totalBarrels += b[t];
          liquorValue += b[t] * G.market[t];
        }
      }
      let respect = 0;
      try { respect = computeRespect(G, pid); } catch { /* ignore */ }
      perPlayer[pid] = {
        family: p.family,
        startingBorough: p.startingBorough,
        respect, cash: p.cash, completed: p.completed.length,
        staked: p.staked.length, hand: p.hand.length, hasCommission: p.hasCommission,
        titles, districts, totalBarrels, liquorValue,
        shylockMarks: p.shylockMarks,
        favors: p.favors.length,
        kickbacks: p.kickbacksReceived ?? 0,
      };
    }
    client.stop();
    return {
      index,
      winner: finalState?.ctx?.gameover?.winner ?? null,
      reason: "win",
      days: G.day ?? 0,
      steps,
      wallMs: Date.now() - t0,
      perPlayer,
      moveCounts,
      lastError,
      trail: opts.captureTrail ? trail : undefined,
    };
  };

  while (steps < opts.maxSteps) {
    const state = client.getState();
    if (!state) { const o = cleanup(); o.reason = "no-move"; return o; }
    if (state.ctx.gameover) {
      const o = cleanup();
      o.reason = "win";
      o.winner = state.ctx.gameover.winner ?? null;
      return o;
    }
    const G = state.G as GameState;
    if (G.day > opts.maxDays) { const o = cleanup(); o.reason = "max-days"; return o; }

    const pids = Object.keys(G.players);
    let dispatched = false;
    for (const pid of pids) {
      if (!isBotTurn(G, state.ctx as Ctx, pid)) continue;
      const mctsOpts = opts.mcts === undefined ? DEFAULT_MCTS_OPTIONS : (opts.mcts ?? undefined);
      const fullState = opts.noLookahead ? undefined : (state as State<GameState>);
      const pers = opts.perSeatPersonality?.[pid] ?? opts.personality ?? DEFAULT_PERSONALITY;
      const move = pickBotMove(G, state.ctx as Ctx, pid, fullState, mctsOpts, pers);
      if (!move) continue;
      const key = `${state.ctx.phase}|${state._stateID}|${pid}|${move.move}|${JSON.stringify(move.args)}`;
      if (key === lastKey) {
        staleCount += 1;
        if (staleCount > opts.staleLimit) {
          const o = cleanup();
          o.reason = "stalled";
          const raidDump = G.operations.raid
            ? `raid: target=${G.operations.raid.target} idx=${G.operations.raid.currentIdx}/${G.operations.raid.hits.length}`
            : "no raid";
          o.lastError = `Bot stalled: P${pid} kept proposing ${move.move}(${JSON.stringify(move.args)}) in phase=${state.ctx.phase}; ${raidDump}`;
          return o;
        }
      } else {
        staleCount = 0;
        lastKey = key;
      }

      // Bot's reckoningMove already uses evaluateObjective, but mirror the
      // check here so future bot variants that skip it stay correct.
      let args = move.args;
      if (move.move === "setContractOutcome") {
        const idx = args[0] as number;
        const pd = G.reckoning.pendingDeadlines[idx];
        const sc = pd ? G.players[pid].staked[pd.contractIdx] : undefined;
        if (sc) {
          const ok = evaluateObjective(G, pid, sc.card.id);
          if (ok !== null) args = [idx, ok];
        }
      }

      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        client.store.dispatch({
          type: "MAKE_MOVE",
          payload: { type: move.move, args, playerID: pid, credentials: "" },
        } as never);
        steps += 1;
        moveCounts[move.move] = (moveCounts[move.move] ?? 0) + 1;
        if (opts.captureTrail) {
          trail.push(`d${G.day} ${state.ctx.phase} P${pid} ${move.move}(${JSON.stringify(args)})`);
        }
        dispatched = true;
        break;
      } catch (err) {
        lastError = `dispatch threw: ${(err as Error).message}`;
        const o = cleanup();
        o.reason = "error";
        return o;
      }
    }

    if (!dispatched) {
      const o = cleanup();
      o.reason = "no-move";
      o.lastError = `No bot wanted to act. phase=${state.ctx.phase} subPhase=${G.shadows.subPhase}/ops:${G.operations.currentPlayer ?? "-"}/${G.reckoning.subPhase}`;
      return o;
    }
  }

  const o = cleanup();
  o.reason = "max-days";
  o.lastError = `Hit max steps (${opts.maxSteps})`;
  return o;
}

// ============================================================================
// Aggregate stats across a batch of outcomes
// ============================================================================

export interface FamilyStats {
  /** Number of games this family appeared in. */
  appearances: number;
  wins: number;
  avgRespect: number;
  maxRespect: number;
  avgCompleted: number;
  avgTitles: number;
  avgDistricts: number;
  /** Win rate (wins / appearances). */
  winRate: number;
}

export interface BatchSummary {
  total: number;
  finished: number;
  maxDays: number;
  stalled: number;
  noMove: number;
  errors: number;
  wallMs: number;
  avgDays: number;
  avgSteps: number;
  winsByPlayer: Record<string, number>;
  /** Wins broken down by the winning seat's mob family. */
  winsByFamily: Record<string, number>;
  /** Per-family aggregates (across all games each family appeared in). */
  perFamily: Record<string, FamilyStats>;
  /** Total dispatches per move name across all games in the batch. */
  moveCounts: Record<string, number>;
  perPlayer: Record<string, {
    avgRespect: number;
    maxRespect: number;
    avgCompleted: number;
    maxCompleted: number;
    commissionPct: number;
    avgTitles: number;
    maxTitles: number;
    avgDistricts: number;
    maxDistricts: number;
    avgCash: number;
    avgLiquorValue: number;
    avgFavors: number;
    maxFavors: number;
    avgKickbacks: number;
    maxKickbacks: number;
  }>;
}

export function aggregateStats(outcomes: GameOutcome[], players: number): BatchSummary {
  const N = outcomes.length;
  const out: BatchSummary = {
    total: N,
    finished: outcomes.filter((o) => o.reason === "win").length,
    maxDays: outcomes.filter((o) => o.reason === "max-days").length,
    stalled: outcomes.filter((o) => o.reason === "stalled").length,
    noMove: outcomes.filter((o) => o.reason === "no-move").length,
    errors: outcomes.filter((o) => o.reason === "error").length,
    wallMs: outcomes.reduce((s, o) => s + o.wallMs, 0),
    avgDays: outcomes.reduce((s, o) => s + o.days, 0) / Math.max(1, N),
    avgSteps: outcomes.reduce((s, o) => s + o.steps, 0) / Math.max(1, N),
    winsByPlayer: {},
    winsByFamily: {},
    perFamily: {},
    moveCounts: {},
    perPlayer: {},
  };
  for (const o of outcomes) {
    for (const [m, n] of Object.entries(o.moveCounts ?? {})) {
      out.moveCounts[m] = (out.moveCounts[m] ?? 0) + n;
    }
  }
  for (const o of outcomes) if (o.winner !== null) {
    out.winsByPlayer[o.winner] = (out.winsByPlayer[o.winner] ?? 0) + 1;
    const winnerFamily = o.perPlayer[o.winner]?.family;
    if (winnerFamily) {
      out.winsByFamily[winnerFamily] = (out.winsByFamily[winnerFamily] ?? 0) + 1;
    }
  }

  // Per-family aggregates: collect every (family → end-stat) pair across the
  // batch, then average. With per-game shuffling of families to seats, a
  // family typically appears in many games at varying seats; the family-level
  // view is more meaningful than the seat-level one.
  const famBuckets: Record<string, PlayerEndStats[]> = {};
  for (const o of outcomes) {
    for (const s of Object.values(o.perPlayer)) {
      if (!s.family) continue;
      (famBuckets[s.family] ??= []).push(s);
    }
  }
  for (const [family, stats] of Object.entries(famBuckets)) {
    const wins = out.winsByFamily[family] ?? 0;
    const sum = (sel: (s: PlayerEndStats) => number) =>
      stats.reduce((acc, x) => acc + sel(x), 0);
    out.perFamily[family] = {
      appearances: stats.length,
      wins,
      winRate: stats.length === 0 ? 0 : wins / stats.length,
      avgRespect: sum((s) => s.respect) / stats.length,
      maxRespect: Math.max(...stats.map((s) => s.respect)),
      avgCompleted: sum((s) => s.completed) / stats.length,
      avgTitles: sum((s) => s.titles) / stats.length,
      avgDistricts: sum((s) => s.districts) / stats.length,
    };
  }
  for (let p = 0; p < players; p++) {
    const pid = String(p);
    const stats = outcomes.map((o) => o.perPlayer[pid]).filter(Boolean);
    if (stats.length === 0) continue;
    const sum = (sel: (s: PlayerEndStats) => number) => stats.reduce((s, x) => s + sel(x), 0);
    const max = (sel: (s: PlayerEndStats) => number) => Math.max(...stats.map(sel));
    out.perPlayer[pid] = {
      avgRespect: sum((s) => s.respect) / stats.length,
      maxRespect: max((s) => s.respect),
      avgCompleted: sum((s) => s.completed) / stats.length,
      maxCompleted: max((s) => s.completed),
      commissionPct: stats.filter((s) => s.hasCommission).length / stats.length,
      avgTitles: sum((s) => s.titles) / stats.length,
      maxTitles: max((s) => s.titles),
      avgDistricts: sum((s) => s.districts) / stats.length,
      maxDistricts: max((s) => s.districts),
      avgCash: sum((s) => s.cash) / stats.length,
      avgLiquorValue: sum((s) => s.liquorValue) / stats.length,
      avgFavors: sum((s) => s.favors) / stats.length,
      maxFavors: max((s) => s.favors),
      avgKickbacks: sum((s) => s.kickbacks) / stats.length,
      maxKickbacks: max((s) => s.kickbacks),
    };
  }
  return out;
}
