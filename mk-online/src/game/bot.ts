// Heuristic Bot for Moonshine Kingdom.
//
// Exposes `pickBotMove(G, ctx, playerID, fullState?, mctsOptions?)`. Three
// layers are available depending on what callers pass:
//
//   Layer 1 (heuristic only): pickBotMove(G, ctx, pid)
//     Each move category generates candidates with hand-tuned scores. Fast
//     (sub-ms). The default policy used inside MCTS rollouts.
//
//   Layer 2 (1-ply lookahead): pickBotMove(G, ctx, pid, fullState)
//     Each candidate is simulated once through a sandbox reducer; the
//     resulting board-value delta and any stake flips refine the score.
//     ~10–50 ms per decision.
//
//   Layer 3 (MCTS rollouts): pickBotMove(G, ctx, pid, fullState, mctsOpts)
//     Top-K candidates are rolled out to end-of-day using the heuristic
//     policy for all players; the average end-state value picks the move.
//     ~500–1500 ms per decision; only fires in Operations phase.
//
// pickBotMove always uses Layer 1 inside its own rollouts to avoid infinite
// recursion (a thread-local flag, `inRollout`, suppresses MCTS there).

import type { Ctx, State } from "boardgame.io";
import type {
  GameState, LiquorType, PlayerID, BoroughId, StakedContract,
} from "./types";
import {
  DISTRICTS,
  DISTRICT_BY_ID,
  combatDice,
  killThreshold,
  RECRUIT_COST_DEFAULT,
  RECRUIT_COST_WARD_BOSS,
  RAID_BRIBE_COST,
  SECURE_COST,
  BRIBE_COST,
  SHYLOCK_LOAN_AMOUNT,
  SHYLOCK_REPAY_DEFAULT,
  SHYLOCK_REPAY_WITH_ROTHSTEIN,
  smugglingDice,
  smugglingTarget,
} from "./data";
import { evaluateObjective } from "./objectives";
import { simulateMove } from "../sim/lookahead";
import { mctsRefine, type MctsOptions } from "../sim/mcts";

const LIQUOR_TYPES: LiquorType[] = ["moonshine", "gin", "whisky", "rum"];

export interface BotMove {
  move: string;
  args: unknown[];
}

/**
 * Tunable personality dials applied as multipliers on candidate scores.
 * 1.0 = neutral default. Adjusting these is the main way to A/B-test
 * different bot styles in the Sim Lab and surface balance issues.
 */
export interface BotPersonality {
  /** Multiplier on attack-initiating Moves and Storm-the-Precinct. */
  aggression: number;
  /** Multiplier on Unload + Extort + Smuggle cash plays. */
  greed: number;
  /** Multiplier on expansion: Move-into-empty-turf, Secure, Recruit. */
  expansion: number;
  /** Multiplier on Hustle + speculative contract staking. */
  contractFocus: number;
  /** Respect level at which a rival is treated as a Leader (target). */
  leaderThreatRespect: number;
  /** Extra weighting applied when scoring against a Leader. 1.0 = ignore,
   *  3.0 = aggressive dogpile. Affects both heuristic attack scoring AND
   *  the MCTS leaf evaluation's opponent term. */
  leaderResponseStrength: number;
}

export const DEFAULT_PERSONALITY: BotPersonality = {
  aggression: 1.0,
  greed: 1.0,
  expansion: 1.0,
  contractFocus: 1.0,
  leaderThreatRespect: 12,
  leaderResponseStrength: 1.5,
};

/** Set by `mcts.ts` while doing rollouts so recursive `pickBotMove` calls
 *  stick to the cheap heuristic policy instead of triggering nested MCTS. */
let inRollout = false;
export function _setInRollout(v: boolean): void { inRollout = v; }
export function _isInRollout(): boolean { return inRollout; }

// ============================================================================
// Helpers
// ============================================================================

function emptyBarrels(): Record<LiquorType, number> {
  return { moonshine: 0, gin: 0, whisky: 0, rum: 0 };
}

function barrelsAt(G: GameState, pid: PlayerID, did: string): Record<LiquorType, number> {
  return G.districts[did].barrels[pid] ?? emptyBarrels();
}

function controlledIds(G: GameState, pid: PlayerID): string[] {
  return Object.keys(G.districts).filter((id) => G.districts[id].controller === pid);
}

function controlledByTag(G: GameState, pid: PlayerID, tag: string): string[] {
  return controlledIds(G, pid).filter((id) => DISTRICT_BY_ID[id].tags.includes(tag as never));
}

function runnersInPlay(G: GameState, pid: PlayerID): number {
  let s = 0;
  for (const id of Object.keys(G.districts)) s += G.districts[id].mobsters[pid]?.runners ?? 0;
  return s;
}

function bossInPlay(G: GameState, pid: PlayerID): boolean {
  for (const id of Object.keys(G.districts)) {
    if ((G.districts[id].mobsters[pid]?.bosses ?? 0) > 0) return true;
  }
  return false;
}

/** A rival is "the Leader" if they're close to the win threshold (20 Respect)
 *  OR they already hold the Commission. Either signal means the bot should
 *  treat them as a credible win threat and dial up anti-leader scoring. */
export function isLeader(G: GameState, pid: PlayerID, threshold: number): boolean {
  if (G.players[pid].hasCommission) return true;
  // Inline respect calc to avoid an objectives.ts roundtrip cost in hot paths.
  let r = 0;
  for (const [id, holder] of Object.entries(G.titles)) {
    if (holder !== pid) continue;
    if (id === "manhattan" || id === "bronx" || id === "queens" || id === "brooklyn") r += 3;
    else if (id === "staten") r += 2;
    else if (id === "wardBoss") r += 3;
    else r += 2; // syndicate
  }
  for (const c of G.players[pid].completed) r += c.respect;
  r -= G.players[pid].shylockMarks;
  return r >= threshold;
}

/** Static value of a district to its controller. Tuned in roughly "1 point ≈ $200". */
function districtBaseValue(did: string): number {
  const d = DISTRICT_BY_ID[did];
  let v = 1;
  if (d.tags.includes("ghetto")) v += 4;          // ghetto = Safehouse/Recruit hub
  if (d.tags.includes("speakeasy")) v += 3;        // speakeasy = sells liquor
  if (d.tags.includes("dock")) v += 3;             // dock = Smuggle + dock network
  if (d.tags.includes("highSociety")) v += 2;      // High Society = Power Broker
  return v;
}

/** Bonus for controlling a district with a still (recurring brew). */
function stillBonus(G: GameState, did: string): number {
  const still = G.districts[did].still;
  if (!still) return 0;
  // Common roll numbers (6,7,8) hit often; extremes rarely.
  const n = still.number;
  const freq = 6 - Math.abs(7 - n); // 7→6, 6/8→5, 5/9→4, 4/10→3, 3/11→2, 2/12→1
  return Math.max(1, freq);
}

/** Staked contracts that aren't yet satisfied. */
function pendingStakes(G: GameState, pid: PlayerID): StakedContract[] {
  return G.players[pid].staked.filter((sc) => evaluateObjective(G, pid, sc.card.id) !== true);
}

/** Helper: rough check if our crew can beat a defender at districtId. */
function combatEdge(
  G: GameState,
  attackerId: PlayerID,
  defenderId: PlayerID,
  districtId: string,
  attackerForce: { bosses: number; runners: number },
): number {
  const ds = G.districts[districtId];
  const defCrew = ds.mobsters[defenderId] ?? { bosses: 0, runners: 0 };
  const safehouse = (ds.safehouses[defenderId] ?? 0) > 0;

  const atkDice = combatDice(attackerForce.bosses + attackerForce.runners);
  const defDice = combatDice(defCrew.bosses + defCrew.runners);
  const atkThreat = 1 + (attackerForce.bosses > 0 ? 1 : 0)
    + (G.players[attackerId].family === "sicilian" && attackerForce.bosses >= 2 ? 1 : 0);
  const defThreat = 1 + (defCrew.bosses > 0 ? 1 : 0) + (safehouse ? 1 : 0);
  const atkExpected = atkDice * (7 - killThreshold(Math.min(4, atkThreat))) / 6;
  const defExpected = defDice * (7 - killThreshold(Math.min(4, defThreat))) / 6;
  return atkExpected - defExpected;
}

// ============================================================================
// Turn detection
// ============================================================================

export function isBotTurn(G: GameState, ctx: Ctx, pid: PlayerID): boolean {
  // Raid: only the target acts. Everyone else freezes until the raid resolves.
  if (G.operations.raid) return G.operations.raid.target === pid;
  if (G.operations.combat) {
    const c = G.operations.combat;
    if (c.stage === "ambush" && c.defender === pid) return true;
    if (c.stage === "pinned" && c.attacker === pid) return true;
    if (c.pendingPlunder && c.attacker === pid) return true;
    return false;
  }
  if (ctx.phase === "shadows") {
    const s = G.shadows;
    if (s.subPhase === "roll" && s.turnOrder[0] === pid) return true;
    if (s.subPhase === "draft" && s.turnOrder[s.currentDrafterIdx] === pid) return true;
    if (s.subPhase === "grease" && s.turnOrder[s.currentGreaserIdx] === pid) return true;
    return false;
  }
  if (ctx.phase === "operations") {
    return G.operations.currentPlayer === pid;
  }
  if (ctx.phase === "reckoning") {
    const r = G.reckoning;
    if (r.subPhase === "sweep") return true;
    if (r.subPhase === "contracts") {
      const mine = r.pendingDeadlines.filter((pd) => pd.playerID === pid);
      const undecided = mine.find((pd) => !pd.decided);
      if (undecided) return true;
      return !r.confirmed.includes(pid);
    }
    return false;
  }
  return false;
}

/**
 * Pick the bot's next move. See the file header for the three layers
 * available based on which args are passed.
 *
 * `mctsOptions` enables Layer 3 (MCTS rollouts) for the Operations decision.
 * Ignored when called inside a rollout (the heuristic-only path takes over
 * to keep rollouts fast).
 */
export function pickBotMove(
  G: GameState,
  ctx: Ctx,
  pid: PlayerID,
  fullState?: State<GameState>,
  mctsOptions?: MctsOptions,
  personality: BotPersonality = DEFAULT_PERSONALITY,
): BotMove | null {
  if (G.operations.raid && G.operations.raid.target === pid) return raidMove(G, pid);
  if (G.operations.combat) return combatMove(G, pid);
  if (ctx.phase === "shadows") return shadowsMove(G, pid, personality);
  if (ctx.phase === "operations") {
    return operationsMove(G, pid, fullState, inRollout ? undefined : mctsOptions, personality);
  }
  if (ctx.phase === "reckoning") return reckoningMove(G, pid);
  return null;
}

// ============================================================================
// Shadows
// ============================================================================

function shadowsMove(G: GameState, pid: PlayerID, personality: BotPersonality): BotMove | null {
  const s = G.shadows;
  if (s.subPhase === "roll") return { move: "rollDice", args: [] };
  if (s.subPhase === "draft") return draftDecision(G, pid);
  if (s.subPhase === "grease") return greaseDecision(G, pid, personality);
  return null;
}

function draftDecision(G: GameState, pid: PlayerID): BotMove {
  const s = G.shadows;
  type Choice = { red: number; white: number; action: "produce" | "dump"; score: number };
  let best: Choice | null = null;

  // Cache barrel-cap per still so we know how big a brew really is.
  for (let r = 0; r < s.redDice.length; r++) {
    for (let w = 0; w < s.whiteDice.length; w++) {
      const brew = s.redDice[r] + s.whiteDice[w];
      let produceScore = 0;
      let dumpScore = 0;
      for (const did of Object.keys(G.districts)) {
        const ds = G.districts[did];
        if (!ds.still || ds.still.number !== brew) continue;
        const c = ds.controller;
        const crew = c ? (ds.mobsters[c]?.bosses ?? 0) + (ds.mobsters[c]?.runners ?? 0) : 0;
        const brewSize = crew >= 5 ? 3 : crew >= 3 ? 2 : crew >= 1 ? 1 : 0;
        const barrelValue = G.market[ds.still.type] / 200; // ~1 pt per barrel-worth
        if (c === pid) produceScore += 4 + brewSize * barrelValue;
        else if (c !== null) {
          produceScore -= 2 + brewSize * barrelValue * 0.6; // we hate giving rivals brew
          dumpScore += 1 + brewSize * barrelValue * 0.7;   // dumping denies them on later rounds
        }
      }
      if (!best || produceScore > best.score) best = { red: r, white: w, action: "produce", score: produceScore };
      if (!best || dumpScore > best.score) best = { red: r, white: w, action: "dump", score: dumpScore };
    }
  }
  const pick = best ?? { red: 0, white: 0, action: "dump" as const };
  return { move: "draftDice", args: [pick.red, pick.white, pick.action] };
}

function greaseDecision(G: GameState, pid: PlayerID, personality: BotPersonality): BotMove {
  const p = G.players[pid];

  // Pass 1: SNAP COMPLETION. Stake any contract whose objective already
  // evaluates TRUE. We'd love to stake them all but Stash gates how many we
  // can carry — pick the highest respect-per-marker first.
  type Snap = { cardId: string; score: number; deadline: number };
  const snaps: Snap[] = [];
  for (const card of p.hand) {
    if (card.deadline > p.stash) continue;
    if (evaluateObjective(G, pid, card.id) !== true) continue;
    snaps.push({
      cardId: card.id,
      deadline: card.deadline,
      score: (card.respect * 2 + card.take / 500) / card.deadline,
    });
  }
  if (snaps.length > 0) {
    snaps.sort((a, b) => b.score - a.score);
    return { move: "stakeContract", args: [snaps[0].cardId] };
  }

  // Pass 2: SPECULATIVE. Stake longer-deadline cards (Rackets/Scores) when
  // we have Stash to spare — Operations lookahead will steer the bot toward
  // fulfilling them. Threshold scales inversely with contractFocus — a
  // contract-hungry bot stakes more aggressively.
  const stashThreshold = Math.max(2, Math.round(4 / Math.max(0.25, personality.contractFocus)));
  if (p.stash >= stashThreshold) {
    const haveTiers = new Set(p.completed.map((c) => c.tier));
    const spec = p.hand
      .filter((c) => c.deadline >= 2 && c.deadline <= p.stash - 2)
      .map((c) => {
        let score = c.respect / c.deadline;
        if (!haveTiers.has(c.tier) && !p.hasCommission) score += 1.5; // need this tier
        if (c.deadline === 3) score += 0.5; // Scores: more time to manoeuvre
        return { c, score };
      })
      .sort((a, b) => b.score - a.score);
    if (spec.length > 0) {
      return { move: "stakeContract", args: [spec[0].c.id] };
    }
  }

  // Fill ops to max if we can.
  const room = 5 - p.operations;
  const toMove = Math.min(p.stash, room);
  if (toMove > 0) return { move: "fundOps", args: [toMove] };
  return { move: "confirmGrease", args: [] };
}

// ============================================================================
// Operations
// ============================================================================

export type Cand = {
  /** Static heuristic score. Compared against the lay-low threshold (~1.5)
   *  when MCTS is not in play. Range: ~0 to ~20 for normal Operations plays. */
  score: number;
  m: BotMove;
  tag: string;
  /** Average rollout value from Layer 3 MCTS, when refinement ran. Lives on
   *  a different scale to `score` — rollouts return relative-board-value
   *  deltas typically in the range -5..+5, so this CANNOT be compared
   *  directly to the static threshold. Sort and pick by this field when
   *  present, but keep `score` around so the heuristic gate still works
   *  when MCTS chose to skip a candidate. */
  mctsScore?: number;
};

/** Generate and statically score all legal Operations candidates for `pid`.
 *  Used both by `operationsMove` itself and by MCTS to enumerate the search
 *  frontier from a rolled-out state. */
export function generateOpsCandidates(
  G: GameState,
  pid: PlayerID,
  personality: BotPersonality = DEFAULT_PERSONALITY,
): Cand[] {
  const pending = pendingStakes(G, pid);
  const pendingIds = new Set(pending.map((sc) => sc.card.id));
  const cands: Cand[] = [];
  pushUnload(G, pid, cands, personality);
  pushHustle(G, pid, cands, pending, personality);
  pushRecruit(G, pid, cands, personality);
  pushMove(G, pid, cands, pendingIds, personality);
  pushReinforce(G, pid, cands, personality);
  pushAttack(G, pid, cands, personality);
  pushStorm(G, pid, cands, personality);
  pushSecure(G, pid, cands, personality);
  pushSmuggle(G, pid, cands, personality);
  pushExtort(G, pid, cands, personality);
  pushFix(G, pid, cands);
  pushBribe(G, pid, cands);
  pushRise(G, pid, cands);
  pushPushBarrels(G, pid, cands, personality);
  pushRatRival(G, pid, cands, personality);
  pushShylockBorrow(G, pid, cands);
  pushShylockRepay(G, pid, cands);
  return cands;
}

function operationsMove(
  G: GameState,
  pid: PlayerID,
  fullState?: State<GameState>,
  mctsOptions?: MctsOptions,
  personality: BotPersonality = DEFAULT_PERSONALITY,
): BotMove {
  const p = G.players[pid];
  if (p.operations <= 0) return { move: "layLow", args: [] };

  const cands = generateOpsCandidates(G, pid, personality);
  if (cands.length === 0) return { move: "layLow", args: [] };

  // Layer 2: 1-ply lookahead. Simulate each candidate; if it would flip any
  // staked contract from unsatisfied to satisfied at the upcoming Reckoning,
  // give it a large bonus. Also use the board-value delta as a tiebreaker.
  if (fullState) {
    const beforeBV = boardValue(G, pid);
    const currentlyTrue = new Set<string>();
    for (const sc of p.staked) {
      if (evaluateObjective(G, pid, sc.card.id) === true) currentlyTrue.add(sc.card.id);
    }
    for (const c of cands) {
      const simG = simulateMove(fullState, c.m, pid);
      if (!simG) { c.score -= 5; continue; }
      let stakeBonus = 0;
      for (const sc of simG.players[pid].staked) {
        if (currentlyTrue.has(sc.card.id)) continue;
        if (evaluateObjective(simG, pid, sc.card.id) === true) {
          stakeBonus += sc.card.respect * 1.5 + 2;
          const have = new Set(simG.players[pid].completed.map((cc) => cc.tier));
          if (!have.has(sc.card.tier) && !simG.players[pid].hasCommission) stakeBonus += 3;
        }
      }
      c.score += stakeBonus;
      c.score += (boardValue(simG, pid) - beforeBV) * 0.5;
    }
  }

  cands.sort((a, b) => b.score - a.score);

  // Layer 3: MCTS refinement on the top-K static candidates. Skips when the
  // top pick is overwhelmingly better (no need to rollout an obvious move).
  if (mctsOptions && fullState && cands.length >= 2) {
    const top = cands[0];
    const second = cands[1];
    const margin = top.score - second.score;
    if (margin < (mctsOptions.skipMargin ?? 4)) {
      const refined = mctsRefine(fullState, pid, cands, mctsOptions, personality);
      // Sort by rollout value (mctsScore), falling back to static score for
      // candidates MCTS skipped (those outside top-K).
      refined.sort((a, b) => (b.mctsScore ?? b.score) - (a.mctsScore ?? a.score));
      const choice = refined[0];
      if (choice) {
        // Rollouts already played through to the day's Reckoning so the
        // cost-vs-benefit of "play this vs lay low and save the marker" is
        // baked into the value. Don't re-gate with the heuristic-scale
        // threshold (the previous behaviour double-gated MCTS-scale rollout
        // values against a heuristic-scale floor and almost always forced
        // a lay-low, regressing slower bots below pure heuristic).
        return choice.m;
      }
    }
  }

  const top = cands[0];
  if (top.score < 1.5) return { move: "layLow", args: [] };
  return top.m;
}

/** Heuristic board-value function for a single player. Used as a small
 *  tiebreaker in Operations lookahead AND as the leaf-evaluator inside
 *  MCTS rollouts. */
export function boardValue(G: GameState, pid: PlayerID): number {
  const p = G.players[pid];
  let v = p.cash / 500;
  // Liquor at market
  for (const did of Object.keys(G.districts)) {
    const b = G.districts[did].barrels[pid] ?? emptyBarrels();
    for (const t of LIQUOR_TYPES) v += (b[t] * G.market[t]) / 500;
  }
  // Controlled districts
  const owned = controlledIds(G, pid);
  for (const did of owned) v += districtBaseValue(did) * 0.4;
  // Safehouses
  for (const did of owned) v += (G.districts[did].safehouses[pid] ?? 0) * 0.5;
  // Crew (capped so the bot doesn't hoard runners)
  let crewTotal = 0;
  for (const did of owned) {
    const c = G.districts[did].mobsters[pid];
    if (c) crewTotal += c.bosses + c.runners;
  }
  v += Math.min(crewTotal, 12) * 0.2;
  // Titles
  for (const [, holder] of Object.entries(G.titles)) if (holder === pid) v += 2;
  // Completed contracts (respect proxy)
  for (const cc of p.completed) v += cc.respect * 1.5;
  if (p.hasCommission) v += 5;
  v -= p.shylockMarks * 1.5;
  return v;
}

// ---- Candidate generators ------------------------------------------------

function pushUnload(G: GameState, pid: PlayerID, out: Cand[], pers: BotPersonality) {
  const p = G.players[pid];
  if (p.operations < 2) return;
  // Lower threshold: only Unload if we have ≥2 barrels (1-barrel trips waste Ops).
  for (const did of controlledByTag(G, pid, "speakeasy")) {
    const d = DISTRICT_BY_ID[did];
    const inv = barrelsAt(G, pid, did);
    const total = LIQUOR_TYPES.reduce((s, t) => s + inv[t], 0);
    if (total < 2) continue;
    const greedTaxFree = p.favors.includes("stClair");
    const maxSafe = greedTaxFree ? total : Math.min(total, 3);
    // Sort by value, picking highest-market first; if housePour exists, top it
    // up to grab the kickback (1 free stash→ops conversion per matching barrel).
    const sales: { type: LiquorType; count: number }[] = [];
    let sold = 0;
    const types = LIQUOR_TYPES.slice().sort((a, b) => {
      const aIsPour = d.housePour === a ? 1 : 0;
      const bIsPour = d.housePour === b ? 1 : 0;
      if (aIsPour !== bIsPour) return bIsPour - aIsPour;
      return G.market[b] - G.market[a];
    });
    for (const t of types) {
      if (sold >= maxSafe) break;
      const take = Math.min(inv[t], maxSafe - sold);
      if (take > 0) { sales.push({ type: t, count: take }); sold += take; }
    }
    if (sales.length === 0) continue;
    const cash = sales.reduce((s, sa) => s + sa.count * G.market[sa.type], 0);
    // Unloading is the only way liquor becomes Respect-buying cash; weight
    // it well above passive options. $200 ≈ 1 point.
    let score = cash / 200 + 1.5;
    // Kickback: matching barrels return 1 Stash→Ops marker each, capped at empty slots.
    const matchingPour = d.housePour ? sales.find((sa) => sa.type === d.housePour)?.count ?? 0 : 0;
    score += Math.min(matchingPour, 5 - p.operations) * 1.5;
    if (!greedTaxFree && sold >= 4) score -= 2; // Greed Tax heat
    out.push({ score: score * pers.greed, tag: "unload", m: { move: "unload", args: [did, sales] } });
  }
}

function pushHustle(G: GameState, pid: PlayerID, out: Cand[], pending: StakedContract[], pers: BotPersonality) {
  const p = G.players[pid];
  if (p.hustledThisDay) return;
  if (G.ratCard === pid) return; // Mark of the Snitch: cannot Hustle
  if (!bossInPlay(G, pid)) return;
  const handLimit = p.favors.includes("guinan") ? 5 : 3;
  if (p.hand.length >= handLimit) return;
  // Want cards when we have stash to spend on stakes and few pending.
  const room = handLimit - p.hand.length;
  if (room === 0) return;
  // Score higher when we have stash and not many active stakes.
  const stakeRoom = Math.max(0, p.stash - 1);
  let score = 3 + stakeRoom * 0.6 - pending.length * 1.0;
  if (p.completed.length < 3) score += 1.5; // commission incentive
  // Pick tiers we don't already have completed (round-robin so we cover variety).
  const have = new Set(p.completed.map((c) => c.tier));
  const allTiers: Array<"gig" | "racket" | "score"> = ["gig", "racket", "score"];
  const need = allTiers.filter((t) => !have.has(t));
  const drawCount = p.favors.includes("guinan") ? 3 : 2;
  const picks: Array<"gig" | "racket" | "score"> = [];
  for (let i = 0; i < drawCount; i++) {
    const ordered = need.length > 0 ? need : allTiers;
    picks.push(ordered[i % ordered.length]);
  }
  out.push({ score: score * pers.contractFocus, tag: "hustle", m: { move: "hustle", args: [picks] } });
}

function pushRecruit(G: GameState, pid: PlayerID, out: Cand[], pers: BotPersonality) {
  const p = G.players[pid];
  const cost = G.titles.wardBoss === pid ? RECRUIT_COST_WARD_BOSS : RECRUIT_COST_DEFAULT;
  if (p.cash < cost || p.runnersInSupply === 0) return;
  const totalRunners = runnersInPlay(G, pid);
  if (totalRunners >= 10) return; // already have plenty; spend Ops elsewhere
  for (const did of controlledIds(G, pid)) {
    if ((G.districts[did].safehouses[pid] ?? 0) === 0) continue;
    const crew = G.districts[did].mobsters[pid] ?? { bosses: 0, runners: 0 };
    const crewTotal = crew.bosses + crew.runners;
    // Diminishing returns once a district has ≥5 mobsters — production caps
    // out and Sweep kills the surplus anyway.
    if (crewTotal >= 5) continue;
    let score = 1;
    if (crewTotal <= 1) score += 2.5;   // dangerously thin — needs reinforcement
    else if (crewTotal <= 3) score += 1.5;
    score += stillBonus(G, did) * 0.4;
    if (DISTRICT_BY_ID[did].tags.includes("dock")) score += 0.5;
    if (p.cash < cost * 2) score -= 1;
    // Recruiting is part of an expansion gameplan; tie it to the same dial.
    out.push({ score: score * pers.expansion, tag: `recruit@${did}`, m: { move: "recruit", args: [did, 1] } });
  }
}

function pushMove(G: GameState, pid: PlayerID, out: Cand[], pendingIds: Set<string>, pers: BotPersonality) {
  const p = G.players[pid];
  // Expansion to empty turf — cheap and grows our footprint.
  for (const fromId of controlledIds(G, pid)) {
    const crew = G.districts[fromId].mobsters[pid];
    if (!crew || crew.runners + crew.bosses < 2) continue; // need 2+ to leave one behind
    const fd = DISTRICT_BY_ID[fromId];
    const candidates = new Set<string>(fd.connections);
    if (fd.tags.includes("dock")) {
      for (const d2 of DISTRICTS) if (d2.tags.includes("dock") && d2.id !== fromId) candidates.add(d2.id);
    }
    for (const toId of candidates) {
      const to = G.districts[toId];
      if (to.precinct) continue;
      const occ = to.controller && to.controller !== pid ? to.mobsters[to.controller] : null;
      if (occ && occ.bosses + occ.runners > 0) continue; // attacks handled in pushAttack
      if (to.controller === pid) continue;
      const base = districtBaseValue(toId) + stillBonus(G, toId);
      // Expansion is the most consistent way to earn Borough titles; weight it
      // higher than passive plays (Unload at 1/250 of cash sets the bar low).
      let score = base * 1.1;
      // Bonus per controlled district already in this borough (snowballing
      // for borough title contention).
      const myBoroughCount = controlledIds(G, pid).filter(
        (id) => DISTRICT_BY_ID[id].borough === DISTRICT_BY_ID[toId].borough,
      ).length;
      score += myBoroughCount * 0.6;
      // Movement carries 1 runner + best barrel (if any). Account for the barrel hop.
      const fromBar = barrelsAt(G, pid, fromId);
      const hasBarrel = LIQUOR_TYPES.some((t) => fromBar[t] > 0);
      // If destination is a speakeasy and we'd carry a high-value barrel, big bonus.
      const td = DISTRICT_BY_ID[toId];
      if (td.tags.includes("speakeasy") && hasBarrel) score += 3;
      // Contract synergy: if any pending stake mentions this district by name.
      for (const sc of G.players[pid].staked) {
        if (!pendingIds.has(sc.card.id)) continue;
        if (sc.card.objective.toLowerCase().includes(td.name.toLowerCase())) score += 2;
      }
      // Pick the highest-value single barrel to carry if speakeasy bonus would help.
      const barrels: { type: LiquorType; count: number }[] = [];
      if (hasBarrel && td.tags.includes("speakeasy")) {
        let bestT: LiquorType = "moonshine";
        let bestV = -1;
        for (const t of LIQUOR_TYPES) {
          if (fromBar[t] > 0 && G.market[t] > bestV) { bestT = t; bestV = G.market[t]; }
        }
        barrels.push({ type: bestT, count: 1 });
      }
      out.push({
        score: score * pers.expansion,
        tag: `move:${fromId}→${toId}`,
        m: { move: "movePlay", args: [fromId, toId, 0, 1, barrels] },
      });
    }
  }
  // Repositioning into a Safehouse district to consolidate (if too thin to attack).
  // Not modelled here — Smuggle/Recruit cover the same niche.
  void p;
}

function pushAttack(G: GameState, pid: PlayerID, out: Cand[], pers: BotPersonality) {
  // Base edge bar: 0.5 expected hits in our favour, scaled down by Aggression
  // (a 2.0 bot will commit to coin flips, a 0.5 bot needs a comfortable lead).
  // The +2 Safehouse era required a high bar; with the +1 change attacks are
  // viable from much weaker positions.
  const baseEdge = Math.max(-1, 0.5 - (pers.aggression - 1) * 0.6);
  for (const fromId of controlledIds(G, pid)) {
    const crew = G.districts[fromId].mobsters[pid];
    if (!crew || crew.runners + crew.bosses < 2) continue; // must leave ≥1 behind
    const fd = DISTRICT_BY_ID[fromId];
    const candidates = new Set<string>(fd.connections);
    if (fd.tags.includes("dock")) {
      for (const d2 of DISTRICTS) if (d2.tags.includes("dock") && d2.id !== fromId) candidates.add(d2.id);
    }
    for (const toId of candidates) {
      const to = G.districts[toId];
      if (to.precinct) continue;
      const defenderId = to.controller;
      if (!defenderId || defenderId === pid) continue;
      const defCrew = to.mobsters[defenderId] ?? { bosses: 0, runners: 0 };
      if (defCrew.bosses + defCrew.runners === 0) continue; // empty turf, pushMove handles
      // Send as much as we can, keep 1 home. Bosses go too unless we'd be
      // sending JUST the boss (Bosses are scarce — keep them home in that case).
      const sendR = Math.max(0, crew.runners - 1);
      const sendB = sendR > 0 ? Math.min(crew.bosses, 1) : 0;
      if (sendR + sendB < 1) continue;
      const edge = combatEdge(G, pid, defenderId, toId, { bosses: sendB, runners: sendR });
      // Vs a Leader we drop the edge bar dramatically — knocking the leader
      // back is worth a coin flip or worse. leaderResponseStrength dials how
      // hard. Also: when defender is the Leader, even losing the attack
      // costs THEM crew (and potentially a Safehouse), so it's still useful.
      const isThreat = isLeader(G, defenderId, pers.leaderThreatRespect);
      const targetEdge = isThreat
        ? Math.max(-1.5, baseEdge - 0.5 * pers.leaderResponseStrength)
        : baseEdge;
      if (edge < targetEdge) continue;
      const base = districtBaseValue(toId) + stillBonus(G, toId);
      // Capturing rival barrels is loot.
      const enemyBarrels = LIQUOR_TYPES.reduce((s, t) => s + (to.barrels[defenderId]?.[t] ?? 0), 0);
      let score = base * 0.8 + edge * 1.5 + enemyBarrels * 0.5 + 1.5; // baseline bonus so attacks compete with passive plays
      // Leader scaling on the score too — favour attacks against threats.
      if (isThreat) score *= pers.leaderResponseStrength;
      out.push({
        score: score * pers.aggression,
        tag: `attack:${fromId}→${toId}`,
        m: { move: "movePlay", args: [fromId, toId, sendB, sendR, []] },
      });
    }
  }
}

/** Move crew between our own districts to build up a strike force or to
 *  thicken production hubs. Without this, attacks can never reach the
 *  4-mobster threshold needed to actually win combat. */
function pushReinforce(G: GameState, pid: PlayerID, out: Cand[], pers: BotPersonality) {
  const owned = controlledIds(G, pid);
  if (owned.length < 2) return;
  for (const fromId of owned) {
    const crew = G.districts[fromId].mobsters[pid];
    if (!crew || crew.runners + crew.bosses < 3) continue; // need surplus to share

    const fd = DISTRICT_BY_ID[fromId];
    const candidates = new Set<string>(fd.connections);
    if (fd.tags.includes("dock")) {
      for (const d2 of DISTRICTS) if (d2.tags.includes("dock") && d2.id !== fromId) candidates.add(d2.id);
    }
    for (const toId of candidates) {
      const to = G.districts[toId];
      if (to.controller !== pid) continue;       // own districts only
      if (to.precinct) continue;                  // precincts handled by pushStorm
      const toCrew = to.mobsters[pid] ?? { bosses: 0, runners: 0 };
      const toTotal = toCrew.bosses + toCrew.runners;

      // Identify whether the destination is a Storm launching pad. If it is,
      // we WANT to pack past the production cap; combat dice cap at 5+
      // mobsters and Storm needs 3+ crew sent in.
      const td = DISTRICT_BY_ID[toId];
      const adj = new Set<string>(td.connections);
      if (td.tags.includes("dock")) {
        for (const d2 of DISTRICTS) if (d2.tags.includes("dock") && d2.id !== toId) adj.add(d2.id);
      }
      let launchPadFor: "broker" | "rival" | null = null;
      let score = 0;
      for (const tc of adj) {
        const tcDs = G.districts[tc];
        const tcDef = DISTRICT_BY_ID[tc];
        if (tcDs.precinct && tcDef.broker && !G.players[pid].favors.includes(tcDef.broker)) {
          score += 4;
          launchPadFor = "broker";
        } else if (tcDs.controller && tcDs.controller !== pid) {
          score += 1.2;
          launchPadFor = launchPadFor ?? "rival";
        }
      }

      // Production cap matters only when this district is NOT a launching pad
      // — otherwise we want more crew for the combat dice math.
      const cap = launchPadFor !== null ? 8 : 5;
      if (toTotal >= cap) continue;

      // A thin destination benefits more from reinforcement.
      if (toTotal <= 1) score += 1;
      // Hot stills are worth packing crew on.
      score += stillBonus(G, toId) * 0.3;

      if (score < 1.5) continue;
      out.push({
        score: score * pers.expansion,
        tag: `reinforce:${fromId}→${toId}`,
        m: { move: "movePlay", args: [fromId, toId, 0, 1, []] },
      });
    }
  }
}

/** Storm a Precinct that hosts a Power Broker we don't yet have a Favor
 *  with. This is the missing snowball loop: take the Precinct → control
 *  the High Society district → Bribe the broker → permanent +1 Influence.
 *  The bot's prior `pushMove`/`pushAttack` both `continue` on Precincts,
 *  so until this fires it can never even reach a Bribe. */
function pushStorm(G: GameState, pid: PlayerID, out: Cand[], pers: BotPersonality) {
  const p = G.players[pid];
  // We need 1 Ops to Move into the Precinct and 1 more to Storm out.
  if (p.operations < 2) return;
  for (const fromId of controlledIds(G, pid)) {
    const crew = G.districts[fromId].mobsters[pid];
    if (!crew || crew.runners + crew.bosses < 3) continue; // need 3+ to send 2

    const fd = DISTRICT_BY_ID[fromId];
    const candidates = new Set<string>(fd.connections);
    if (fd.tags.includes("dock")) {
      for (const d2 of DISTRICTS) if (d2.tags.includes("dock") && d2.id !== fromId) candidates.add(d2.id);
    }
    for (const toId of candidates) {
      const to = G.districts[toId];
      if (!to.precinct) continue;
      const td = DISTRICT_BY_ID[toId];
      if (!td.broker) continue;                  // not all precincts have brokers (Stapleton)
      if (p.favors.includes(td.broker)) continue; // already have the Favor

      // Send most of the crew, keep 1 home so we don't abandon the source.
      const sendR = crew.runners - 1;
      const sendB = Math.min(crew.bosses, 1);
      const sendTotal = sendR + sendB;
      if (sendTotal < 2) continue;

      // Expected hits during the Storm itself. Lower bar (≥1.0) because the
      // reward is enormous (district + Commandeered Safehouse + Broker
      // access) and we'd rather try-and-fail than never try.
      const dice = combatDice(sendTotal);
      const threat = Math.min(4, 1 + (sendB > 0 ? 1 : 0));
      const expected = dice * (7 - killThreshold(threat)) / 6;
      if (expected < 1.0) continue;

      // Score: broker access is one of the strongest permanent advantages in
      // the game. Weight it heavily. Aggression dial scales the willingness
      // to attempt the storm itself.
      const score = 10 + expected * 2;
      out.push({
        score: score * pers.aggression,
        tag: `storm:${fromId}→${toId}(${td.broker})`,
        m: { move: "movePlay", args: [fromId, toId, sendB, sendR, []] },
      });
    }
  }
}

function pushSecure(G: GameState, pid: PlayerID, out: Cand[], pers: BotPersonality) {
  const p = G.players[pid];
  if (p.cash < SECURE_COST || p.safehousesInSupply === 0) return;
  for (const did of controlledIds(G, pid)) {
    if ((G.districts[did].safehouses[pid] ?? 0) > 0) continue;
    const d = DISTRICT_BY_ID[did];
    let score = 1;
    if (d.tags.includes("ghetto")) score += 2.5; // unlocks Recruit
    if (d.tags.includes("speakeasy")) score += 1;
    if (stillBonus(G, did) >= 4) score += 1; // hot still → protect production
    // Don't burn cash if we're poor.
    if (p.cash < SECURE_COST * 3) score -= 1;
    out.push({ score: score * pers.expansion, tag: `secure@${did}`, m: { move: "secure", args: [did] } });
  }
}

function pushSmuggle(G: GameState, pid: PlayerID, out: Cand[], pers: BotPersonality) {
  // Smuggle at controlled docks to import Rum.
  const docks = controlledIds(G, pid).filter((id) => DISTRICT_BY_ID[id].tags.includes("dock"));
  if (docks.length === 0) return;
  const myDocks = docks.length;
  const target = smugglingTarget(myDocks);
  for (const did of docks) {
    const crew = G.districts[did].mobsters[pid] ?? { bosses: 0, runners: 0 };
    const total = crew.bosses + crew.runners;
    if (total === 0) continue;
    const send = Math.min(5, total);
    const dice = smugglingDice(send);
    const successProb = (7 - target) / 6;
    const expectedRum = dice * successProb;
    const expectedFail = dice * (1 - successProb);
    // Each rum is worth market value, each fail kills a mobster (~$300 replacement).
    const score = (expectedRum * G.market.rum) / 250 - (expectedFail * 1.5);
    if (score < 0.5) continue;
    out.push({ score: score * pers.greed, tag: `smuggle@${did}`, m: { move: "smuggle", args: [did, send] } });
  }
}

function pushExtort(G: GameState, pid: PlayerID, out: Cand[], pers: BotPersonality) {
  const p = G.players[pid];
  const boroughs: BoroughId[] = ["manhattan", "bronx", "queens", "brooklyn", "staten"];
  for (const b of boroughs) {
    if (G.titles[b] !== pid) continue;
    if (p.extortedThisDay.includes(b)) continue;
    const ctrlCount = DISTRICTS.filter(
      (d) => d.borough === b && G.districts[d.id].controller === pid,
    ).length;
    if (ctrlCount === 0) continue;
    const cash = ctrlCount * 200;
    let score = cash / 250;
    if (cash >= 800) score -= 1.5; // heat penalty
    out.push({ score: score * pers.greed, tag: `extort:${b}`, m: { move: "extort", args: [b] } });
  }
}

function pushFix(G: GameState, pid: PlayerID, out: Cand[]) {
  // Set the market for a liquor we hold a lot of. Useful only if it raises price.
  const liquorTitles: Array<{ k: "ginSyndicate" | "whiskySyndicate" | "moonshineSyndicate" | "rumSyndicate"; l: LiquorType }> = [
    { k: "ginSyndicate", l: "gin" },
    { k: "whiskySyndicate", l: "whisky" },
    { k: "moonshineSyndicate", l: "moonshine" },
    { k: "rumSyndicate", l: "rum" },
  ];
  for (const { k, l } of liquorTitles) {
    if (G.titles[k] !== pid) continue;
    const joints = DISTRICTS.filter(
      (d) => d.tags.includes("speakeasy") && d.housePour === l && G.districts[d.id].controller === pid,
    ).length;
    const maxPrice = Math.min(500, 200 + 100 * joints);
    if (maxPrice <= G.market[l]) continue;
    // Score by holdings of this liquor that we could later unload at higher price.
    let stockpile = 0;
    for (const did of Object.keys(G.districts)) stockpile += barrelsAt(G, pid, did)[l];
    const gain = (maxPrice - G.market[l]) * stockpile;
    const score = gain / 250 + 0.5;
    out.push({ score, tag: `fix:${l}`, m: { move: "fix", args: [l, maxPrice] } });
  }
}

function pushBribe(G: GameState, pid: PlayerID, out: Cand[]) {
  const p = G.players[pid];
  if (p.operations < 2 || p.cash < BRIBE_COST) return;
  for (const did of controlledIds(G, pid)) {
    const d = DISTRICT_BY_ID[did];
    if (!d.broker) continue;
    if (p.favors.includes(d.broker)) continue;
    // Permanent +1 Stash + Favor effect is *very* strong; high score.
    out.push({ score: 8, tag: `bribe:${d.broker}`, m: { move: "bribe", args: [did] } });
  }
}

function pushRise(G: GameState, pid: PlayerID, out: Cand[]) {
  const p = G.players[pid];
  if (!p.bossDown || p.bossesInSupply === 0 || p.operations < 2) return;
  // Pick a controlled district (preferring ghetto for the free Safehouse), or
  // any unoccupied district that's tactically valuable.
  let bestDid: string | null = null;
  let bestScore = -Infinity;
  for (const did of Object.keys(G.districts)) {
    const ds = G.districts[did];
    if (ds.controller !== null && ds.controller !== pid) continue;
    if (ds.precinct) continue;
    const v = districtBaseValue(did) + stillBonus(G, did);
    if (v > bestScore) { bestScore = v; bestDid = did; }
  }
  if (bestDid === null) return;
  out.push({ score: 9, tag: `rise@${bestDid}`, m: { move: "rise", args: [bestDid] } });
}

/** Take a Shylock's Mark loan when we need cash for a Bribe we'd otherwise
 *  miss out on. Each Mark is -1 Respect at game end, but unlocking a Favor
 *  is a permanent +1 Influence — net positive in most plausible games. */
/** Push barrels (cost: 1 Ops) from a non-speakeasy district we control to
 *  an own speakeasy where they can be Unloaded. The engine allows pushing
 *  to rivals too (which gifts them the barrels!), so we explicitly restrict
 *  to our own controlled speakeasies — a footgun the bot must avoid. */
function pushPushBarrels(G: GameState, pid: PlayerID, out: Cand[], pers: BotPersonality) {
  const p = G.players[pid];
  if (p.operations < 1) return;
  for (const fromId of controlledIds(G, pid)) {
    const fd = DISTRICT_BY_ID[fromId];
    if (fd.tags.includes("speakeasy")) continue; // already where Unload happens
    const inv = barrelsAt(G, pid, fromId);
    const total = LIQUOR_TYPES.reduce((s, t) => s + inv[t], 0);
    if (total === 0) continue;

    const candidates = new Set<string>(fd.connections);
    if (fd.tags.includes("dock")) {
      for (const d2 of DISTRICTS) if (d2.tags.includes("dock") && d2.id !== fromId) candidates.add(d2.id);
    }
    for (const toId of candidates) {
      const to = G.districts[toId];
      const td = DISTRICT_BY_ID[toId];
      if (to.controller !== pid) continue;        // own districts only
      if (!td.tags.includes("speakeasy")) continue; // only push to a sell point

      // Push everything we can — there's no per-Push cap in the engine, and
      // leaving barrels stranded is the whole reason we're pushing.
      const barrels = LIQUOR_TYPES
        .map((t) => ({ type: t, count: inv[t] }))
        .filter((b) => b.count > 0);
      const totalValue = barrels.reduce((s, b) => s + b.count * G.market[b.type], 0);
      let score = totalValue / 300 + 0.8;
      // Bonus if destination has matching housePour — Unload will Kickback.
      if (td.housePour && inv[td.housePour] > 0) score += 1;
      out.push({
        score: score * pers.greed,
        tag: `push:${fromId}→${toId}`,
        m: { move: "push", args: [fromId, toId, barrels] },
      });
    }
  }
}

/** Rat out a rival (cost: 2 Ops). Triggers the Police Raid flow against
 *  whoever has the most Heat — that player loses barrels and crew. The Heat
 *  track clears for everyone afterwards (which is good for US too if we
 *  have Heat). Never fire if WE would be the target. */
function pushRatRival(G: GameState, pid: PlayerID, out: Cand[], pers: BotPersonality) {
  const p = G.players[pid];
  if (p.operations < 2) return;
  if (G.heat.length === 0) return; // engine requires at least 1 Heat
  // Mirror raid.ts targetOfRaid: most Heat, ties broken by rightmost index.
  let pick: PlayerID | null = null;
  let best = { count: -1, idx: -1 };
  const heatCounts: Record<string, number> = {};
  for (const h of G.heat) heatCounts[h.owner] = (heatCounts[h.owner] ?? 0) + 1;
  G.heat.forEach((h, i) => {
    const c = heatCounts[h.owner];
    if (c > best.count || (c === best.count && i > best.idx)) {
      best = { count: c, idx: i };
      pick = h.owner;
    }
  });
  if (pick === null || pick === pid) return; // would raid ourselves

  // Value the raid by what it strips from the target — barrels in districts
  // adjacent to precincts (proxy: just total barrels held by target × 0.3).
  // The Heat clear afterwards is its own win whenever we hold ≥1 Heat.
  const targetPid: string = pick;
  let targetBarrels = 0;
  for (const did of Object.keys(G.districts)) {
    if (G.districts[did].controller !== targetPid) continue;
    const b = G.districts[did].barrels[targetPid];
    if (!b) continue;
    for (const t of LIQUOR_TYPES) targetBarrels += b[t];
  }
  const ourHeat = heatCounts[pid] ?? 0;
  let score = 2 + targetBarrels * 0.3 + ourHeat * 1.0;
  // Big bonus if the target is the Leader.
  if (isLeader(G, targetPid, pers.leaderThreatRespect)) {
    score *= pers.leaderResponseStrength;
  }
  // Mark of the Snitch: taking the Rat Card costs us Hustle access and
  // -3 Respect at game end. If we already hold it, snitching is free
  // (we'd just keep it). If someone else holds it, we steal it onto
  // ourselves — that's a serious downside.
  if (G.ratCard !== pid) {
    score -= 4; // sting of losing Hustle + endgame respect hit
  }
  out.push({
    score: score * pers.aggression,
    tag: `rat:→${targetPid}`,
    m: { move: "rat", args: [] },
  });
}

function pushShylockBorrow(G: GameState, pid: PlayerID, out: Cand[]) {
  const p = G.players[pid];
  if (G.shylockMarksInBank <= 0) return;
  if (p.cash >= BRIBE_COST) return; // already affordable
  // Don't pile on Marks recklessly: stop at 2 outstanding.
  if (p.shylockMarks >= 2) return;
  // Only borrow if a SINGLE loan would bridge us to a Bribe (otherwise
  // we're burning Respect for nothing).
  if (p.cash + SHYLOCK_LOAN_AMOUNT < BRIBE_COST) return;
  // Must actually have a Bribe target — a controlled High Society district
  // whose broker we don't already hold the Favor for.
  let hasTarget = false;
  for (const did of controlledIds(G, pid)) {
    const d = DISTRICT_BY_ID[did];
    if (d.broker && !p.favors.includes(d.broker)) { hasTarget = true; break; }
  }
  if (!hasTarget) return;
  // High score — this is THE play that unlocks a permanent edge.
  out.push({ score: 8, tag: "shylock-borrow", m: { move: "takeShylockMark", args: [] } });
}

/** Pay off Shylock's Marks when we're flush. Each repay is +1 Respect at
 *  game end. Keep a buffer so we don't break our Operations budget. */
function pushShylockRepay(G: GameState, pid: PlayerID, out: Cand[]) {
  const p = G.players[pid];
  if (p.shylockMarks <= 0) return;
  const cost = p.favors.includes("rothstein") ? SHYLOCK_REPAY_WITH_ROTHSTEIN : SHYLOCK_REPAY_DEFAULT;
  if (p.cash < cost + 2000) return; // keep $2k buffer for Operations
  out.push({ score: 2.5, tag: "shylock-repay", m: { move: "repayShylockMark", args: [] } });
}

// ============================================================================
// Combat
// ============================================================================

/** Find a connected safe district the defender can Fold into. Prefers turf
 *  we already control. Returns null if no valid destination exists. */
function pickFoldDestination(G: GameState, pid: PlayerID, combatDistrictId: string): string | null {
  const fd = DISTRICT_BY_ID[combatDistrictId];
  if (!fd) return null;
  const candidates: string[] = [...fd.connections];
  // Dock-hop: any other dock is reachable from a dock.
  if (fd.tags.includes("dock")) {
    for (const id of Object.keys(G.districts)) {
      if (id === combatDistrictId) continue;
      if (DISTRICT_BY_ID[id]?.tags.includes("dock") && !candidates.includes(id)) {
        candidates.push(id);
      }
    }
  }
  let bestOwn: string | null = null;
  let bestEmpty: string | null = null;
  for (const id of candidates) {
    const ds = G.districts[id];
    if (!ds || ds.precinct) continue;
    const blocker = ds.controller && ds.controller !== pid ? ds.mobsters[ds.controller] : null;
    if (blocker && blocker.bosses + blocker.runners > 0) continue;
    if (ds.controller === pid && !bestOwn) bestOwn = id;
    else if (ds.controller === null && !bestEmpty) bestEmpty = id;
  }
  return bestOwn ?? bestEmpty;
}

function combatMove(G: GameState, pid: PlayerID): BotMove | null {
  const c = G.operations.combat!;

  if (c.stage === "ambush" && c.defender === pid) {
    const ds = G.districts[c.districtId];
    const p = G.players[pid];
    const dCrew = ds.mobsters[pid] ?? { bosses: 0, runners: 0 };
    const dTotal = dCrew.bosses + dCrew.runners;
    const aTotal = c.pinned.bosses + c.pinned.runners;
    const safehouse = (ds.safehouses[pid] ?? 0) > 0;

    // Fold consideration: if we're badly outnumbered (>=2x) and have somewhere
    // safe to flee to, save the crew rather than die. We lose the district +
    // barrels but keep the bodies. Skip if our barrels here are negligible
    // (nothing to save in the alternative — might as well Ambush).
    if (dTotal > 0 && aTotal >= dTotal * 2) {
      const foldDest = pickFoldDestination(G, pid, c.districtId);
      if (foldDest) {
        return { move: "fold", args: [foldDest] };
      }
    }

    // Ambush hits the attacker first with a +1 Threat bonus. Only worth it when
    // our defenders can do real damage.
    const dDice = combatDice(dTotal);
    const dThreat = Math.min(4, 1 + (dCrew.bosses > 0 ? 1 : 0) + (safehouse ? 1 : 0) + 1);
    const expected = dDice * (7 - killThreshold(dThreat)) / 6;
    const willAmbush = expected >= 0.7;
    // Defender Courage (Irish only): if we're going to Ambush, have a barrel
    // at this district, haven't armed yet, and +1 Threat would actually move
    // the kill threshold down (not already at threshold 4+), pre-arm it.
    if (
      willAmbush &&
      p.family === "irish" &&
      (c.defenderThreatBonus ?? 0) === 0 &&
      dThreat < 4
    ) {
      const myBarrels = ds.barrels[pid];
      if (myBarrels) {
        const order = LIQUOR_TYPES.slice().sort((a, b) => G.market[a] - G.market[b]); // burn cheapest first
        for (const t of order) {
          if ((myBarrels[t] ?? 0) > 0) {
            return { move: "courage", args: [t] };
          }
        }
      }
    }
    return { move: "ambushChoice", args: [willAmbush] };
  }

  if (c.pendingPlunder && c.attacker === pid) {
    const ds = G.districts[c.districtId];
    const defBarrels = c.defender !== null
      ? ds.barrels[c.defender] ?? emptyBarrels()
      : emptyBarrels();
    let need = c.pendingPlunder.hits;
    const picks: { type: LiquorType; count: number }[] = [];
    const order = LIQUOR_TYPES.slice().sort((a, b) => G.market[b] - G.market[a]);
    for (const t of order) {
      const take = Math.min(defBarrels[t], need);
      if (take > 0) { picks.push({ type: t, count: take }); need -= take; }
      if (need === 0) break;
    }
    return { move: "pickPlunder", args: [picks] };
  }

  if (c.stage === "pinned" && c.attacker === pid) {
    return pinnedDecision(G, pid);
  }
  return null;
}

function pinnedDecision(G: GameState, pid: PlayerID): BotMove {
  const c = G.operations.combat!;
  const p = G.players[pid];

  if (c.vsPolice) {
    // Storm the Precinct costs 1 Op. The reward is huge: the Precinct
    // becomes a controlled district, the bot gets a free Commandeered
    // Safehouse, and (if there's a Broker here) the next Operations turn
    // can Bribe for a permanent +1 Influence. Lower the bar to 1.0 hits
    // expected so we don't bail on attempts pushStorm pre-validated.
    const dice = combatDice(c.pinned.bosses + c.pinned.runners);
    const threat = Math.min(4, 1 + (c.pinned.bosses > 0 ? 1 : 0));
    const expected = dice * (7 - killThreshold(threat)) / 6;
    if (p.operations >= 1 && expected >= 1.0) return { move: "stormPrecinct", args: [] };
    return { move: "fallBack", args: [] };
  }

  const defender = c.defender!;
  const ds = G.districts[c.districtId];
  const defCrew = ds.mobsters[defender] ?? { bosses: 0, runners: 0 };
  // If defender is empty, just advance (free occupation).
  if (defCrew.bosses + defCrew.runners === 0) return { move: "advance", args: [] };
  const edge = combatEdge(G, pid, defender, c.districtId, c.pinned);
  // We're already committed — falling back saves a few crew but cedes the
  // initiative AND the carried barrels (defender keeps them). Assaulting at
  // a slight disadvantage is usually better than retreating; coin flips and
  // worse are still worth it against a Leader.
  const threshold = isLeader(G, defender, 12) ? -1.5 : -0.5;
  if (p.operations >= 1 && edge >= threshold) return { move: "assault", args: [] };
  return { move: "fallBack", args: [] };
}

// ============================================================================
// Reckoning
// ============================================================================

function reckoningMove(G: GameState, pid: PlayerID): BotMove {
  const r = G.reckoning;
  if (r.subPhase === "sweep") return { move: "startReckoning", args: [] };
  if (r.subPhase === "contracts") {
    const mine = r.pendingDeadlines.filter((pd) => pd.playerID === pid);
    const undecided = mine.find((pd) => !pd.decided);
    if (undecided) {
      const idx = r.pendingDeadlines.indexOf(undecided);
      const sc = G.players[pid].staked[undecided.contractIdx];
      let completed = false;
      if (sc) {
        const evald = evaluateObjective(G, pid, sc.card.id);
        completed = evald === true; // null/false → Botched (defensive default)
      }
      return { move: "setContractOutcome", args: [idx, completed] };
    }
    return { move: "confirmReckoning", args: [] };
  }
  return { move: "confirmReckoning", args: [] };
}

// ============================================================================
// Raid (target only)
// ============================================================================

function raidMove(G: GameState, pid: PlayerID): BotMove {
  const raid = G.operations.raid!;
  const hit = raid.hits[raid.currentIdx];
  if (!hit) return { move: "layLow", args: [] };
  const p = G.players[pid];
  const ds = G.districts[hit.targetDistrictId];
  const inv = ds.barrels[pid] ?? emptyBarrels();
  const totalCount = LIQUOR_TYPES.reduce((s, t) => s + inv[t], 0);
  const liquorValue = LIQUOR_TYPES.reduce((s, t) => s + inv[t] * G.market[t], 0);
  if (p.cash >= RAID_BRIBE_COST + 500 && (liquorValue >= RAID_BRIBE_COST || totalCount >= 3)) {
    return { move: "raidBribe", args: [] };
  }
  return { move: "raidTakeTheFall", args: [] };
}

