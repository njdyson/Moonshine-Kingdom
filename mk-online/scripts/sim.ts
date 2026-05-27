// CLI wrapper around src/sim/runner.ts.
//
//   npm run sim                       (default: 10 games, 4 players)
//   npm run sim -- --games=100
//   npm run sim -- --players=2 --games=50 --verbose

import { runGame, aggregateStats, DEFAULT_OPTIONS, type SimOptions } from "../src/sim/runner.ts";
import { DEFAULT_MCTS_OPTIONS } from "../src/sim/mcts.ts";
import { DEFAULT_PERSONALITY } from "../src/game/bot.ts";

function parseArgs(): SimOptions & { verbose: boolean } {
  const opts: SimOptions & { verbose: boolean } = {
    ...DEFAULT_OPTIONS,
    personality: { ...DEFAULT_PERSONALITY },
    verbose: false,
  };
  const setPers = (k: keyof typeof DEFAULT_PERSONALITY, v: number) => {
    opts.personality = { ...(opts.personality ?? DEFAULT_PERSONALITY), [k]: v };
  };
  for (const arg of process.argv.slice(2)) {
    const m = /^--(\w+)(?:=(.*))?$/.exec(arg);
    if (!m) continue;
    const [, k, v] = m;
    if (k === "games") opts.games = Number(v);
    else if (k === "players") opts.players = Number(v);
    else if (k === "maxDays") opts.maxDays = Number(v);
    else if (k === "maxSteps") opts.maxSteps = Number(v);
    else if (k === "verbose") { opts.verbose = v !== "false"; opts.captureTrail = true; }
    else if (k === "noMcts") opts.mcts = null;
    else if (k === "rollouts") {
      opts.mcts = { ...DEFAULT_MCTS_OPTIONS, ...(opts.mcts ?? {}), rolloutsPerCand: Number(v) };
    } else if (k === "topK") {
      opts.mcts = { ...DEFAULT_MCTS_OPTIONS, ...(opts.mcts ?? {}), topK: Number(v) };
    }
    else if (k === "aggression") setPers("aggression", Number(v));
    else if (k === "greed") setPers("greed", Number(v));
    else if (k === "expansion") setPers("expansion", Number(v));
    else if (k === "contracts") setPers("contractFocus", Number(v));
    else if (k === "leaderRespect") setPers("leaderThreatRespect", Number(v));
    else if (k === "leaderResponse") setPers("leaderResponseStrength", Number(v));
  }
  return opts;
}

function main() {
  const opts = parseArgs();
  console.log(`Sim: ${opts.games} game(s), ${opts.players} players, maxDays=${opts.maxDays}\n`);

  const outcomes = [];
  for (let i = 0; i < opts.games; i++) {
    const o = runGame(i, opts);
    outcomes.push(o);
    const winLabel =
      o.reason === "win" ? `P${o.winner} won` :
      o.reason === "max-days" ? `max-days` :
      o.reason === "stalled" ? `STALLED` :
      o.reason === "no-move" ? `NO-MOVE` : `ERROR`;
    const playerSummary = Object.entries(o.perPlayer)
      .map(([p, s]) => `P${p}=${s.respect}r/${s.completed}c${s.hasCommission ? "★" : ""}`)
      .join(" ");
    console.log(
      `  [${String(i + 1).padStart(3)}/${opts.games}] ${winLabel.padEnd(10)} ` +
      `day=${String(o.days).padStart(2)} steps=${String(o.steps).padStart(4)} ${playerSummary}` +
      (o.lastError ? `\n        ↳ ${o.lastError}` : "")
    );
    if (opts.verbose) {
      const stuck = o.reason === "stalled" || o.reason === "no-move" || o.reason === "error";
      console.log(stuck ? "        Last 20 moves:" : "        Full move trail:");
      const lines = stuck ? (o.trail ?? []).slice(-20) : (o.trail ?? []);
      for (const t of lines) console.log("          " + t);
    }
  }

  const summary = aggregateStats(outcomes, opts.players);
  console.log("\n— Summary —");
  console.log(`  Total: ${summary.total}  finished: ${summary.finished}  max-days: ${summary.maxDays}  stalled: ${summary.stalled}  no-move: ${summary.noMove}  errors: ${summary.errors}`);
  console.log(`  Avg days: ${summary.avgDays.toFixed(1)}  avg steps: ${summary.avgSteps.toFixed(0)}  wall: ${(summary.wallMs / 1000).toFixed(1)}s`);
  console.log("  Wins by player:", summary.winsByPlayer);
  for (const [pid, s] of Object.entries(summary.perPlayer)) {
    console.log(
      `  P${pid}: respect=${s.avgRespect.toFixed(1)} (max ${s.maxRespect})  ` +
      `contracts=${s.avgCompleted.toFixed(1)} (max ${s.maxCompleted})  ` +
      `commission=${(s.commissionPct * 100).toFixed(0)}%  ` +
      `titles=${s.avgTitles.toFixed(1)}  districts=${s.avgDistricts.toFixed(1)}  ` +
      `cash=$${s.avgCash.toFixed(0)}  liquor=$${s.avgLiquorValue.toFixed(0)}  ` +
      `favors=${s.avgFavors.toFixed(1)} (max ${s.maxFavors})  ` +
      `kickbacks=${s.avgKickbacks.toFixed(1)} (max ${s.maxKickbacks})`
    );
  }

  // Move-usage breakdown — every engine move that exists, ordered by use.
  // Zeros are kept so we surface what the bot ISN'T touching.
  const ALL_MOVES = [
    "rollDice", "draftDice", "fundOps", "stakeContract", "confirmGrease",
    "layLow", "hustle", "movePlay", "recruit", "secure",
    "unload", "push", "smuggle", "extort", "fix", "bribe", "rise", "rat",
    "ambushChoice", "assault", "advance", "fallBack", "stormPrecinct", "pickPlunder",
    "capo", "consigliere", "courage", "plunder", "stealth", "firepower", "skiff", "torch",
    "raidBribe", "raidTakeTheFall",
    "takeShylockMark", "repayShylockMark",
    "startReckoning", "setContractOutcome", "confirmReckoning",
  ];
  console.log("\n— Move usage (total dispatches across all games) —");
  const total = Object.values(summary.moveCounts).reduce((s, n) => s + n, 0);
  const lines: string[] = [];
  for (const m of ALL_MOVES) {
    const n = summary.moveCounts[m] ?? 0;
    const pct = total > 0 ? (n / total) * 100 : 0;
    const tag = n === 0 ? "  ✗" : "   ";
    lines.push(`  ${tag}  ${m.padEnd(18)} ${String(n).padStart(5)}  ${pct.toFixed(1)}%`);
  }
  for (const l of lines) console.log(l);
  const unused = ALL_MOVES.filter((m) => (summary.moveCounts[m] ?? 0) === 0);
  if (unused.length > 0) {
    console.log(`\n  Never dispatched (${unused.length}): ${unused.join(", ")}`);
  }
}

main();
