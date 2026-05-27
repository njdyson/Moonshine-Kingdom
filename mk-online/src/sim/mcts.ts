// Monte Carlo Tree Search (MCTS-lite) for Operations candidate selection.
//
// For each candidate, we simulate the move once, then play out random
// rollouts using the bot's own heuristic policy (Layer 1, no lookahead, no
// nested MCTS — gated by the `inRollout` flag in bot.ts) until the current
// day's Reckoning resolves. The end-state board-value plus our delta in
// Respect at Reckoning gives us a value signal that's a much better
// predictor of "did this move actually pay off?" than the single-step
// stake-flip check used in Layer 2.
//
// Because all four players take turns in our rollouts, the search captures
// the full picture — including opponents stealing districts or contracts
// out from under us.
//
// This isn't full UCT (no tree expansion past the root); flat Monte Carlo
// with multiple rollouts per candidate. Enough to get the bot from
// occasional-2-player-wins to consistent-multi-player-wins; full UCT is a
// natural next step if/when it's needed.

import type { State } from "boardgame.io";
import type { GameState, PlayerID } from "../game/types";
import {
  pickBotMove,
  isBotTurn,
  isLeader,
  boardValue,
  _setInRollout,
  _isInRollout,
  DEFAULT_PERSONALITY,
  type BotMove,
  type BotPersonality,
  type Cand,
} from "../game/bot";
import { computeRespect } from "../game/reckoning";
import { cloneState, simulateMoveFull } from "./lookahead";

export interface MctsOptions {
  /** Number of top static candidates to consider for refinement. */
  topK: number;
  /** Rollouts per candidate (averaged). */
  rolloutsPerCand: number;
  /** Hard cap on bot-actions inside one rollout. Prevents pathological loops. */
  maxStepsPerRollout: number;
  /** How many Days past the current one to play before evaluating. 0 = stop
   *  as soon as the current Day's Reckoning resolves. */
  daysToRollout: number;
  /** Skip MCTS entirely if the static top-1 leads top-2 by at least this
   *  much — saves time on obvious moves. */
  skipMargin?: number;
  /** Discount factor applied to opponent boardValue in the leaf eval (we
   *  want our score MINUS the strongest opponent's score). */
  opponentWeight?: number;
}

export const DEFAULT_MCTS_OPTIONS: MctsOptions = {
  topK: 4,
  rolloutsPerCand: 5,
  // 0 = stop the moment advanceDay fires (i.e., we played through this
  // day's Reckoning and that's all we need to see whether contracts
  // completed and titles shifted). Bumping this past 0 is dramatically
  // more expensive in 4-player games because four bots play each step.
  daysToRollout: 0,
  maxStepsPerRollout: 50,
  skipMargin: 4,
  opponentWeight: 0.7,
};

/** Refine candidate scores by Monte Carlo rollouts. Returns a new list with
 *  the same `m`/`tag` but updated `score`. Falls back to the input if any
 *  step throws so a runtime bug can't break live play. */
export function mctsRefine(
  state: State<GameState>,
  pid: PlayerID,
  candidates: Cand[],
  opts: MctsOptions = DEFAULT_MCTS_OPTIONS,
  personality: BotPersonality = DEFAULT_PERSONALITY,
): Cand[] {
  if (_isInRollout()) return candidates;
  try {
    // Take only the top-K by static score (others rarely pay off and rollouts
    // are expensive). Keep the rest untouched.
    const sorted = [...candidates].sort((a, b) => b.score - a.score);
    const considered = sorted.slice(0, opts.topK);
    const ignored = sorted.slice(opts.topK);

    _setInRollout(true);
    try {
      for (const c of considered) {
        let total = 0;
        let ok = 0;
        for (let r = 0; r < opts.rolloutsPerCand; r++) {
          const v = rolloutValue(state, c.m, pid, opts, personality);
          if (v === null) continue;
          total += v;
          ok += 1;
        }
        if (ok > 0) {
          // Write the rollout average to `mctsScore`. We deliberately do NOT
          // mutate `c.score` — the static score is on a heuristic scale
          // (~0-20) and the rollout value lives on a relative-boardValue
          // scale (~-5 to +5). Previously we mutated `score` to a blended
          // value that no longer cleared the heuristic-scale lay-low
          // threshold, regressing MCTS bots below the pure heuristic.
          // Add a tiny static-score tiebreaker so rollout-tied options
          // resolve in favour of the heuristically-preferred one.
          c.mctsScore = total / ok + c.score * 0.01;
        } else {
          // All rollouts failed (illegal move from this state?) — push to
          // the back of the sort but don't poison the static score.
          c.mctsScore = -100;
        }
      }
    } finally {
      _setInRollout(false);
    }
    return [...considered, ...ignored];
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("MCTS failed, falling back to static scoring:", (err as Error).message);
    return candidates;
  }
}

/** Single rollout. Returns value-for-pid or null if the initial candidate
 *  move was rejected. */
function rolloutValue(
  state: State<GameState>,
  candidate: BotMove,
  pid: PlayerID,
  opts: MctsOptions,
  personality: BotPersonality,
): number | null {
  // First step: apply the candidate move. Clone once at the boundary.
  const cloned = cloneState(state);
  const startDay = cloned.G.day;
  const startRespect = computeRespect(cloned.G, pid);
  let cur = simulateMoveFull(cloned, candidate, pid);
  if (!cur) return null;

  // Play out subsequent moves using the heuristic policy until we reach the
  // configured horizon or the game ends.
  for (let step = 0; step < opts.maxStepsPerRollout; step++) {
    if (cur.ctx.gameover) break;
    if (cur.G.day > startDay + opts.daysToRollout) break;

    // Find any bot that needs to act. isBotTurn ranks raid > combat > phase.
    let actor: PlayerID | null = null;
    for (const c of Object.keys(cur.G.players)) {
      if (isBotTurn(cur.G, cur.ctx, c)) { actor = c; break; }
    }
    if (!actor) break;

    // Heuristic policy (no fullState, no MCTS — inRollout flag suppresses it
    // anyway, but skipping fullState also skips the 1-ply simulator and
    // keeps the rollout fast). Pass the same personality so all bots in the
    // rollout act consistently with the search root.
    const move = pickBotMove(cur.G, cur.ctx, actor, undefined, undefined, personality);
    if (!move) break;
    const next = simulateMoveFull(cur, move, actor);
    if (!next) break; // illegal move — surface this as a stop condition
    cur = next;
  }

  // Leaf evaluation: our board value minus the strongest weighted rival's,
  // plus our Respect gain (captures contract completions + title shifts at
  // the Reckoning the rollout played through). Leaders count extra in the
  // opponent term, so MCTS will steer toward states that knock them down.
  const ourBV = boardValue(cur.G, pid);
  let worstThreat = -Infinity;
  const baseOppWeight = opts.opponentWeight ?? 1;
  for (const opp of Object.keys(cur.G.players)) {
    if (opp === pid) continue;
    const oppBV = boardValue(cur.G, opp);
    const leader = isLeader(cur.G, opp, personality.leaderThreatRespect);
    const threat = oppBV * (leader ? personality.leaderResponseStrength : 1);
    if (threat > worstThreat) worstThreat = threat;
  }
  const relativeBV = ourBV - (worstThreat === -Infinity ? 0 : worstThreat * baseOppWeight);
  const respectGain = computeRespect(cur.G, pid) - startRespect;
  // Winning the game during the rollout is the ultimate payoff. Losing
  // (someone else won) is a strong negative.
  const gameover = cur.ctx.gameover as { winner?: string } | undefined;
  const winBonus =
    gameover && gameover.winner === pid ? 50 :
    gameover && gameover.winner !== undefined ? -30 : 0;
  return relativeBV + respectGain * 3 + winBonus;
}
