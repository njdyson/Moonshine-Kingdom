// Tournament: each personality preset plays heads-up against Balanced.
// P0 = preset, P1 = Balanced. After N games, report win rates and key stats.
//
//   npm run tournament                       (default: 30 games per preset)
//   npm run tournament -- --games=50 --maxDays=25
//   npm run tournament -- --players=4 --mcts   (4P with the same hero vs 3 Balanced)

import { runGame, type SimOptions } from "../src/sim/runner.ts";
import { DEFAULT_MCTS_OPTIONS } from "../src/sim/mcts.ts";
import { DEFAULT_PERSONALITY, type BotPersonality } from "../src/game/bot.ts";

const PRESETS: Record<string, BotPersonality> = {
  Balanced: { ...DEFAULT_PERSONALITY },
  Warmonger: { ...DEFAULT_PERSONALITY, aggression: 2.0, expansion: 1.2, contractFocus: 0.6, leaderResponseStrength: 1.8 },
  Tycoon: { ...DEFAULT_PERSONALITY, greed: 2.0, expansion: 0.9, contractFocus: 0.6, aggression: 0.7 },
  Settler: { ...DEFAULT_PERSONALITY, expansion: 2.0, aggression: 0.5, greed: 0.9 },
  "Contract Hunter": { ...DEFAULT_PERSONALITY, contractFocus: 2.0, expansion: 0.8, greed: 0.8 },
  Watchdog: { ...DEFAULT_PERSONALITY, leaderThreatRespect: 10, leaderResponseStrength: 2.5, aggression: 1.3 },
  Pacifist: { ...DEFAULT_PERSONALITY, aggression: 0.2, leaderResponseStrength: 0.8 },
};

interface Args {
  games: number;
  players: number;
  maxDays: number;
  mcts: boolean;
}
function parseArgs(): Args {
  const a: Args = { games: 30, players: 2, maxDays: 25, mcts: false };
  for (const arg of process.argv.slice(2)) {
    const m = /^--(\w+)(?:=(.*))?$/.exec(arg);
    if (!m) continue;
    const [, k, v] = m;
    if (k === "games") a.games = Number(v);
    else if (k === "players") a.players = Number(v);
    else if (k === "maxDays") a.maxDays = Number(v);
    else if (k === "mcts") a.mcts = v !== "false";
  }
  return a;
}

interface Result {
  preset: string;
  heroWins: number;
  oppWins: number;
  noWinner: number;
  heroAvgRespect: number;
  oppAvgRespect: number;
  heroCommissionPct: number;
  oppCommissionPct: number;
  heroAvgFavors: number;
  oppAvgFavors: number;
  heroAvgKickbacks: number;
  oppAvgKickbacks: number;
  avgDays: number;
  totalWallSec: number;
}

function runMatchup(name: string, hero: BotPersonality, args: Args): Result {
  // P0 = hero preset, all others = Balanced
  const perSeat: Record<string, BotPersonality> = { "0": hero };
  for (let p = 1; p < args.players; p++) perSeat[String(p)] = PRESETS.Balanced;

  const opts: SimOptions = {
    games: args.games,
    players: args.players,
    maxDays: args.maxDays,
    maxSteps: 8000,
    staleLimit: 50,
    mcts: args.mcts ? DEFAULT_MCTS_OPTIONS : null,
    personality: PRESETS.Balanced,
    perSeatPersonality: perSeat,
  };

  let heroWins = 0, oppWins = 0, noWinner = 0;
  let heroR = 0, oppR = 0, heroC = 0, oppC = 0;
  let heroF = 0, oppF = 0, heroK = 0, oppK = 0;
  let days = 0, ms = 0;

  process.stdout.write(`  ${name.padEnd(18)} `);
  for (let i = 0; i < args.games; i++) {
    const o = runGame(i, opts);
    days += o.days;
    ms += o.wallMs;
    if (o.winner === "0") heroWins += 1;
    else if (o.winner !== null) oppWins += 1;
    else noWinner += 1;
    const p0 = o.perPlayer["0"];
    if (p0) {
      heroR += p0.respect;
      heroF += p0.favors;
      heroK += p0.kickbacks;
      if (p0.hasCommission) heroC += 1;
    }
    let oppRespectSum = 0, oppCommissionCount = 0, oppFavorSum = 0, oppKickbackSum = 0, oppCount = 0;
    for (let p = 1; p < args.players; p++) {
      const s = o.perPlayer[String(p)];
      if (!s) continue;
      oppRespectSum += s.respect;
      oppFavorSum += s.favors;
      oppKickbackSum += s.kickbacks;
      if (s.hasCommission) oppCommissionCount += 1;
      oppCount += 1;
    }
    if (oppCount > 0) {
      oppR += oppRespectSum / oppCount;
      oppC += oppCommissionCount / oppCount;
      oppF += oppFavorSum / oppCount;
      oppK += oppKickbackSum / oppCount;
    }
    process.stdout.write(o.winner === "0" ? "H" : o.winner !== null ? "o" : "·");
  }
  process.stdout.write("\n");

  return {
    preset: name,
    heroWins, oppWins, noWinner,
    heroAvgRespect: heroR / args.games,
    oppAvgRespect: oppR / args.games,
    heroCommissionPct: (heroC / args.games) * 100,
    oppCommissionPct: (oppC / args.games) * 100,
    heroAvgFavors: heroF / args.games,
    oppAvgFavors: oppF / args.games,
    heroAvgKickbacks: heroK / args.games,
    oppAvgKickbacks: oppK / args.games,
    avgDays: days / args.games,
    totalWallSec: ms / 1000,
  };
}

function main() {
  const args = parseArgs();
  const oppLabel = args.players === 2 ? "P1=Balanced" : `P1-${args.players - 1}=Balanced`;
  console.log(`Tournament: ${args.games} games each, ${args.players} players, maxDays=${args.maxDays}, ${args.mcts ? "MCTS" : "Lookahead"} bots`);
  console.log(`P0 = preset under test, ${oppLabel}`);
  console.log(`Legend: H = hero wins, o = opponent wins, · = max-days\n`);

  const results: Result[] = [];
  for (const [name, pers] of Object.entries(PRESETS)) {
    results.push(runMatchup(name, pers, args));
  }

  // Sort by hero win rate descending
  results.sort((a, b) => b.heroWins - a.heroWins);

  console.log("\n— Results (sorted by hero win rate) —");
  console.log("Preset            │ Hero W │ Opp W  │ Hero R │ Opp R  │ Hero C% │ Opp C% │ H Favors │ O Favors │ H Kicks │ O Kicks │ Wall");
  console.log("─".repeat(125));
  for (const r of results) {
    const winRate = (r.heroWins / args.games) * 100;
    console.log(
      `${r.preset.padEnd(17)} │ ${String(r.heroWins).padStart(2)} ${`(${winRate.toFixed(0)}%)`.padEnd(5)} │ ` +
      `${String(r.oppWins).padStart(2)}     │ ` +
      `${r.heroAvgRespect.toFixed(1).padStart(5)}  │ ` +
      `${r.oppAvgRespect.toFixed(1).padStart(5)}  │ ` +
      `${r.heroCommissionPct.toFixed(0).padStart(4)}%   │ ` +
      `${r.oppCommissionPct.toFixed(0).padStart(4)}%  │ ` +
      `${r.heroAvgFavors.toFixed(2).padStart(6)}   │ ` +
      `${r.oppAvgFavors.toFixed(2).padStart(6)}   │ ` +
      `${r.heroAvgKickbacks.toFixed(1).padStart(5)}   │ ` +
      `${r.oppAvgKickbacks.toFixed(1).padStart(5)}   │ ` +
      `${r.totalWallSec.toFixed(0).padStart(3)}s`
    );
  }
  const totalWall = results.reduce((s, r) => s + r.totalWallSec, 0);
  console.log(`\nTotal wall: ${(totalWall / 60).toFixed(1)} min`);
}

main();
