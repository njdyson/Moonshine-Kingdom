# Handoff: Rebuild the mk-online bot's lookahead around CONTRACT COMPLETION

**Repo (source):** `C:\Users\nickj\Desktop\MK Online\mk-online\` (branch `main`, pushed to github.com/njdyson/mk-online). Build: `npm run build`. Bot lives in `src/game/bot.ts`; lookahead primitive in `src/sim/lookahead.ts`; sim harness `scripts/sim.ts` + `src/sim/runner.ts`.
**Date:** 2026-07-08

---

## TL;DR of the problem

The bot has 3 decision layers: **Layer 1** heuristic-only (fast, hand-tuned candidate scores), **Layer 2** 1-ply lookahead (default gameplay path, what a human faces without MCTS), **Layer 3** MCTS rollouts.

**Layer 2 lookahead is currently making the bot WORSE, not better.** Measured (seat-controlled, 60-80 games, 1 lookahead bot vs 3 heuristic bots): the lookahead bot wins ~12-30% of decided games (fair share = 25%), ends with **LOWER respect** (~8.5 vs ~9.0) despite hoarding a fortune: **~$8,400 cash + ~$3,550 liquor vs the heuristic bots' far lower stockpiles**, and completes the **same ~1.9 contracts**. It hoards cash/barrels — which are worth ZERO at the win condition (win = Commission Card + 20 Respect; Respect comes only from completed contracts + titles − shylock − rat).

### Root cause
`operationsMove()` in bot.ts (~line 593-614): Layer 2 adds, per candidate, `c.score += (boardValue(simG, pid) - beforeBV) * 0.5`. And `boardValue()` (~line 650) weights **cash/500, liquor at market/500, districts, crew** heavily — i.e. it rewards HOARDING. So lookahead steers the bot toward accumulating cash/barrels/turf instead of converting to Respect. Completed-contract respect is only ×1.5 and Commission +5, dwarfed by a $8k cash pile (+16). **Lookahead amplifies the wrong objective.**

---

## The design to build (user-specified)

Replace Layer 2's boardValue-delta objective with a **contract-completion objective**. Priorities:

1. **EXECUTE (primary):** bias toward future board states that satisfy the bot's ACTIVE (staked) contracts. Weight strongly, and weight by the contract's respect (Score 5 > Racket 3 > Gig 1) and urgency (closer to deadline = more urgent).
2. **PREP (secondary):** bias toward states matching contracts IN HAND (not yet staked) so the bot is positioned to stake+complete them next.
3. **DENY (tertiary, build LATER):** if the bot has no active contracts, gently disrupt rivals' active-contract completion. High cost (attacking), so must not over-value. **User: build this as a SEPARATE bot STYLE, not baked into the default — start self-focused only.**

### Key constraints & clarifications (from the user)
- **REPLACE, don't supplement.** Lookahead should score by contract progress, NOT boardValue. Instead, **move the economy incentives DOWN into the Layer-1 heuristics**: tune the candidate generators so positive cash / Trade / title-flip / Payoff(Favor) moves are already well-valued at Layer 1. Then Layer 2 purely steers toward completing cards. (Title-flip bonus already exists — `titleFlipBonus` in bot.ts. Extort already recalibrated. Trade/Payoff generators exist.)
- **Lookahead is 1-DAY, SELF-ONLY.** CONFIRMED: `simulateMove` (lookahead.ts) applies ONLY the bot's own single move to a cloned board — **rivals are frozen, not simulated.** This is cheap (one reducer call per candidate). Do NOT add multi-day or rival simulation to Layer 2 — the search tree explodes and it's unnecessary. (Layer 3 MCTS is the one that rolls out rivals; leave it or revisit separately.)
- **No 3-day lookahead.** The user's reasoning: on a Score's final day there's only 1 day left anyway, and true 3-day search (with rivals) is intractable. **1-day self-only lookahead is the target.** A single simulateMove step already lands the bot one play closer; the OBJECTIVE (does this play move me toward satisfying a staked/hand contract) is what matters, not depth.
  - Note: a staked contract resolves at the NEXT Reckoning when its markers hit 0. A 1-ply "does this play satisfy the objective now-or-after-this-move" check is what Layer 2 can see. For multi-play contracts (e.g. "hold 10 Moonshine"), reward INCREMENTAL progress (more of the wanted resource), not just the final flip. There is already a `contractDemand()` mechanism in bot.ts (reads objective text → coarse resource wants: moonshine/rum/districts/speakeasies/docks/ghettos/cash/runners) and an `applyContractDemand()` that bonuses candidates supplying wanted resources — this is the RIGHT primitive to lean on; consider making it the core of the new Layer-2 objective, weighted by staked-contract respect+urgency, plus a smaller weight for hand (prep).
- **Build multiple bot STYLES** so self-focused vs denial can be A/B'd. There's a `BotPersonality` with a `smartPlay` flag already; add style flags there.

---

## Measurement methodology (CRITICAL — prior conclusions were noise)

- **Homogeneous 4-identical-bot "win rate" is near-noise** (someone always wins; finish-rate plateaus ~15/40 games by day 40, ~10% by day 25). DO NOT tune against it.
- **There is NO real seat-position bias** (verified 120 games: seat wins 13/15/10/6 — flat within noise; earlier "seat 3 wins more" was a 40-game fluke). Starting BOROUGH does skew though: Brooklyn/Queens starts win ~2x Manhattan/Bronx (a game-balance note, not a bot bug).
- **Correct strength metric = seat-controlled head-to-head A/B.** Harness flags (already added):
  - `--ab` / `--abflip`: new bot (smartPlay on) on seats 0,1 vs old on 2,3, and the mirror. Combine both to cancel seat bias.
  - `--smartPlay=0/1`: toggle the tunable feature bundle.
  - `--lookaheadSeats=0`: give Layer-2 lookahead to specific seats only (rest heuristic) — **this is how you measure lookahead's true value: put the lookahead bot in EACH seat across 4 runs, sum.**
  - `--noLookahead` (fast heuristic batches), `--noMcts` (keep Layer 2, ~24s/game), `--maxDays=40`.
  - Sim prints: finished/max-days, avg WIN day, contract complete-rate, commissions, wins-by-seat, move-usage.
- **Always seat-control** (run the tested bot in each of the 4 seats) — never trust a single-seat batch.
- Fast iteration: heuristic-only 40-60 game batches (~1-2 min). Lookahead batches are slower; use `--lookaheadSeats=N` (only 1 seat pays the lookahead cost).

### Target to beat
Current Layer-2 lookahead bot: ~12-30% win share vs heuristic (should be >>25% if lookahead is working), ~8.5 respect, hoards $8k+ cash. **Success = the lookahead bot clearly beats heuristic bots head-to-head (seat-controlled) AND completes more contracts, without hoarding cash.** Bonus: does a genuinely stronger bot then SHORTEN games vs weak bots? (The user's hypothesis — currently untested because the "strong" bot wasn't actually strong.)

---

## What's already done (context; committed to main)
- v6.0 rules migration + full consistency sweep (titles non-sticky, combat Safehouse +2, Sicilian Hit, Storm-the-Precinct removed, Secure/1-safehouse, terminology Reserves/Police Squad/Open Fire/today-tomorrow). See memory / prior commits `650cc1a`, `39949af`.
- Bot: `titleFlipBonus` (capture that flips a Deed/WardBoss/Harbormaster), `contractReachable()` probe (objectives.ts — runs real evaluator vs an optimistically-boosted board clone; general, no per-card code), `contractDemand()`/`applyContractDemand()` (incremental contract pursuit), Extort recalibrated. Commit `8765c56`, `cfc0deb`.
- Deployed to production as of source `8765c56` (publishing repo `7fedd5b`).

## Files you'll touch
- `src/game/bot.ts` — `operationsMove` (rip out the boardValue-delta Layer-2 term; replace with contract-progress objective built on `contractDemand`/`contractReachable`, weighted by staked-contract respect+urgency + smaller hand/prep weight). `boardValue` (keep for MCTS leaf eval, but Layer 2 shouldn't use it). Move economy value into the Layer-1 generators. Add bot-style flags to `BotPersonality`.
- `src/sim/lookahead.ts` — probably no change (1-ply self-only is correct).
- Verify with the A/B + `--lookaheadSeats` harness, seat-controlled.

## Gotchas
- Windows: git shows LF→CRLF warnings (harmless). PowerShell for the deploy script; bash tool for sims.
- `structuredClone` used in sim clones; `Date.now()`/`Math.random()` fine in bot (not a seeded-RNG context).
- Don't reintroduce a leading-slash asset path (sub-path hosting). Not relevant to bot work but don't touch UI asset strings.
- Commit bot-only changes separately from engine/UI so they stay revertable. Deploy only on the user's go-ahead.
