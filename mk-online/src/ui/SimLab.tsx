// Sim Lab: in-browser bot-vs-bot harness. Runs the same `runGame` used by
// the CLI script (scripts/sim.ts) but streams results into the UI so you can
// watch them land. Useful for tuning the bot and stress-testing engine logic
// without clicking through the game by hand.

import { useState, useRef, useEffect } from "react";
import { runGame, aggregateStats, DEFAULT_OPTIONS, type GameOutcome, type SimOptions, type BatchSummary } from "../sim/runner";
import { DEFAULT_MCTS_OPTIONS } from "../sim/mcts";
import { DEFAULT_PERSONALITY, type BotPersonality } from "../game/bot";

type Strength = "heuristic" | "lookahead" | "mcts";
const STRENGTH_LABELS: Record<Strength, string> = {
  heuristic: "Heuristic (fastest)",
  lookahead: "1-ply lookahead (medium)",
  mcts: "MCTS rollouts (strongest, slow)",
};

// Display names for each mob family. Short forms of the canonical names in
// game/data.ts MOB_DEFINITIONS ("Sicilian Syndicate" / "Hell's Kitchen Irish"
// / "East Side Vipers" / "Harlem Knights").
const FAMILY_LABEL: Record<string, string> = {
  sicilian: "Sicilian",
  irish: "Irish",
  vipers: "Vipers",
  knights: "Knights",
};

// Signature play move names (per-family special abilities). Tracked separately
// in the move-usage panel so we can tell at a glance whether the bot is
// actually firing them.
const SIGNATURE_MOVES = new Set([
  "capo", "consigliere",         // Sicilian
  "courage", "plunder",          // Irish (courage = +Threat; plunder = steal-instead-of-kill)
  "stealth", "firepower",        // Vipers (stealth = skip Ambush; firepower = +dice)
  "skiff", "torch",              // Iron Knights (skiff = dock-hop; torch = burn district)
]);
const SIGNATURE_FAMILY: Record<string, string> = {
  capo: "Sicilian", consigliere: "Sicilian",
  courage: "Irish", plunder: "Irish",
  stealth: "Vipers", firepower: "Vipers",
  skiff: "Knights", torch: "Knights",
};

// Preset personalities — useful starting points for finding exploits.
// Names map to a partial override of DEFAULT_PERSONALITY.
const PRESETS: Record<string, BotPersonality> = {
  Balanced: { ...DEFAULT_PERSONALITY },
  Warmonger: { ...DEFAULT_PERSONALITY, aggression: 2.0, expansion: 1.2, contractFocus: 0.6, leaderResponseStrength: 1.8 },
  Tycoon: { ...DEFAULT_PERSONALITY, greed: 2.0, expansion: 0.9, contractFocus: 0.6, aggression: 0.7 },
  Settler: { ...DEFAULT_PERSONALITY, expansion: 2.0, aggression: 0.5, greed: 0.9 },
  "Contract Hunter": { ...DEFAULT_PERSONALITY, contractFocus: 2.0, expansion: 0.8, greed: 0.8 },
  Watchdog: { ...DEFAULT_PERSONALITY, leaderThreatRespect: 10, leaderResponseStrength: 2.5, aggression: 1.3 },
  Pacifist: { ...DEFAULT_PERSONALITY, aggression: 0.2, leaderResponseStrength: 0.8 },
};

interface Props {
  onExit: () => void;
}

export function SimLab({ onExit }: Props) {
  const [games, setGames] = useState(20);
  const [players, setPlayers] = useState<2 | 3 | 4>(4);
  const [maxDays, setMaxDays] = useState(25);
  const [strength, setStrength] = useState<Strength>("lookahead");
  const [rollouts, setRollouts] = useState(DEFAULT_MCTS_OPTIONS.rolloutsPerCand);
  const [captureTrail, setCaptureTrail] = useState(false);
  const [personality, setPersonality] = useState<BotPersonality>({ ...DEFAULT_PERSONALITY });
  const [presetName, setPresetName] = useState("Balanced");
  const [outcomes, setOutcomes] = useState<GameOutcome[]>([]);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [summary, setSummary] = useState<BatchSummary | null>(null);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const cancelRef = useRef(false);

  useEffect(() => () => { cancelRef.current = true; }, []);

  async function run() {
    cancelRef.current = false;
    setRunning(true);
    setOutcomes([]);
    setSummary(null);
    setProgress(0);
    setExpandedRow(null);
    const opts: SimOptions = {
      games, players, maxDays,
      maxSteps: DEFAULT_OPTIONS.maxSteps,
      staleLimit: DEFAULT_OPTIONS.staleLimit,
      captureTrail,
      mcts: strength === "mcts"
        ? { ...DEFAULT_MCTS_OPTIONS, rolloutsPerCand: rollouts }
        : null,
      noLookahead: strength === "heuristic",
      personality,
    };
    const collected: GameOutcome[] = [];
    for (let i = 0; i < games; i++) {
      if (cancelRef.current) break;
      // Yield to React between games so the UI updates and stays responsive.
      // Without this the whole loop runs synchronously and the page freezes.
      await new Promise((r) => setTimeout(r, 0));
      try {
        const o = runGame(i, opts);
        collected.push(o);
        setOutcomes([...collected]);
        setProgress(i + 1);
      } catch (err) {
        collected.push({
          index: i, winner: null, reason: "error", days: 0, steps: 0, wallMs: 0,
          perPlayer: {}, moveCounts: {}, lastError: (err as Error).message,
        });
        setOutcomes([...collected]);
      }
    }
    setSummary(aggregateStats(collected, players));
    setRunning(false);
  }

  function stop() {
    cancelRef.current = true;
  }

  return (
    <div className="simlab">
      <div className="simlab-card">
        <header className="simlab-header">
          <h1>Sim Lab</h1>
          <button className="lobby-secondary" onClick={onExit}>⟵ Lobby</button>
        </header>
        <p className="lobby-tagline">Run bot-vs-bot games and inspect the outcomes.</p>

        <section className="simlab-controls">
          <div className="simlab-field">
            <label>Games</label>
            <input
              type="number" min={1} max={500} value={games}
              onChange={(e) => setGames(Math.max(1, Math.min(500, Number(e.target.value) || 1)))}
              disabled={running}
            />
          </div>
          <div className="simlab-field">
            <label>Players</label>
            <div className="lobby-count">
              {[2, 3, 4].map((n) => (
                <button
                  key={n}
                  className={"lobby-pill" + (players === n ? " active" : "")}
                  onClick={() => setPlayers(n as 2 | 3 | 4)}
                  disabled={running}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <div className="simlab-field">
            <label>Max days</label>
            <input
              type="number" min={5} max={60} value={maxDays}
              onChange={(e) => setMaxDays(Math.max(5, Math.min(60, Number(e.target.value) || 25)))}
              disabled={running}
            />
          </div>
          <div className="simlab-field simlab-field-strength">
            <label>Bot strength</label>
            <select
              value={strength}
              onChange={(e) => setStrength(e.target.value as Strength)}
              disabled={running}
            >
              {(Object.keys(STRENGTH_LABELS) as Strength[]).map((s) => (
                <option key={s} value={s}>{STRENGTH_LABELS[s]}</option>
              ))}
            </select>
          </div>
          {strength === "mcts" && (
            <div className="simlab-field">
              <label title="Rollouts per candidate. More = stronger but slower">Rollouts</label>
              <input
                type="number" min={1} max={50} value={rollouts}
                onChange={(e) => setRollouts(Math.max(1, Math.min(50, Number(e.target.value) || 6)))}
                disabled={running}
              />
            </div>
          )}
          <div className="simlab-field simlab-field-checkbox">
            <label title="Capture each move for replay; slower and uses more memory">
              <input
                type="checkbox" checked={captureTrail}
                onChange={(e) => setCaptureTrail(e.target.checked)}
                disabled={running}
              />
              {" "}Capture move trail
            </label>
          </div>
          <div className="simlab-actions">
            {!running ? (
              <button className="lobby-start" onClick={run}>Run</button>
            ) : (
              <button className="lobby-secondary danger" onClick={stop}>Stop</button>
            )}
          </div>
        </section>

        <PersonalityPanel
          personality={personality}
          setPersonality={setPersonality}
          presetName={presetName}
          setPresetName={setPresetName}
          disabled={running}
        />

        {(running || outcomes.length > 0) && (
          <section className="simlab-progress">
            <div className="simlab-progress-bar">
              <div
                className="simlab-progress-fill"
                style={{ width: `${(progress / games) * 100}%` }}
              />
            </div>
            <div className="simlab-progress-text">
              {progress}/{games} games · {running ? "running…" : "complete"}
            </div>
          </section>
        )}

        {summary && <SummaryPanel summary={summary} players={players} />}

        {outcomes.length > 0 && (
          <section className="simlab-results">
            <h2>Per-game results</h2>
            <table className="simlab-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Outcome</th>
                  <th>Days</th>
                  <th>Steps</th>
                  {Array.from({ length: players }, (_, p) => (
                    <th key={p}>P{p}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {outcomes.flatMap((o, i) => {
                  const isExpanded = expandedRow === i;
                  const canExpand = (o.trail && o.trail.length > 0) || !!o.lastError;
                  const winnerStats = o.winner !== null ? o.perPlayer[o.winner] : null;
                  const winnerFamily = winnerStats?.family
                    ? FAMILY_LABEL[winnerStats.family] ?? winnerStats.family
                    : null;
                  const rows = [
                    <tr
                      key={`row-${i}`}
                      className={`simlab-row outcome-${o.reason}` + (canExpand ? " clickable" : "")}
                      onClick={() => canExpand && setExpandedRow(isExpanded ? null : i)}
                    >
                      <td>{i + 1}</td>
                      <td>
                        {o.reason === "win" ? (
                          <>
                            🏆 P{o.winner}
                            {winnerFamily && (
                              <span className="simlab-fam-chip" title="Winning mob family">
                                {winnerFamily}
                              </span>
                            )}
                          </>
                        ) : o.reason === "max-days" ? "max-days" :
                          o.reason === "stalled" ? "STALLED" :
                          o.reason === "no-move" ? "no-move" : "error"}
                      </td>
                      <td>{o.days}</td>
                      <td>{o.steps}</td>
                      {Array.from({ length: players }, (_, p) => {
                        const s = o.perPlayer[String(p)];
                        if (!s) return <td key={p}>—</td>;
                        const fam = s.family ? FAMILY_LABEL[s.family] ?? s.family : "—";
                        return (
                          <td key={p} title={`${fam} (${s.startingBorough ?? "—"}) · ${s.respect} respect · ${s.completed} contracts · ${s.titles} titles · ${s.districts} districts · $${s.cash}`}>
                            <div className="simlab-cell-fam">{fam}</div>
                            <div>{s.respect}r/{s.completed}c{s.hasCommission ? "★" : ""}</div>
                          </td>
                        );
                      })}
                    </tr>,
                  ];
                  if (isExpanded) {
                    rows.push(
                      <tr key={`detail-${i}`} className="simlab-row-detail">
                        <td colSpan={4 + players}>
                          {o.lastError && <div className="simlab-error">{o.lastError}</div>}
                          {o.trail && o.trail.length > 0 && (
                            <details open>
                              <summary>{o.trail.length} moves</summary>
                              <pre className="simlab-trail">{o.trail.join("\n")}</pre>
                            </details>
                          )}
                        </td>
                      </tr>,
                    );
                  }
                  return rows;
                })}
              </tbody>
            </table>
          </section>
        )}
      </div>
    </div>
  );
}

function SummaryPanel({ summary, players }: { summary: BatchSummary; players: number }) {
  const fmt = (n: number, digits = 1) => n.toFixed(digits);
  return (
    <section className="simlab-summary">
      <h2>Summary</h2>
      <div className="simlab-summary-grid">
        <Stat label="Total" value={String(summary.total)} />
        <Stat label="Finished" value={String(summary.finished)} good={summary.finished > 0} />
        <Stat label="Max-days" value={String(summary.maxDays)} />
        <Stat label="Stalled" value={String(summary.stalled)} bad={summary.stalled > 0} />
        <Stat label="Errors" value={String(summary.errors)} bad={summary.errors > 0} />
        <Stat label="Avg days" value={fmt(summary.avgDays)} />
        <Stat label="Avg steps" value={fmt(summary.avgSteps, 0)} />
        <Stat label="Wall" value={`${fmt(summary.wallMs / 1000)}s`} />
      </div>
      <h3 style={{ marginTop: 18 }}>Wins by mob family</h3>
      <p className="lobby-hint" style={{ marginTop: 0 }}>
        Families are shuffled to seats per game, so this is the meaningful win
        breakdown. Win rate = wins / games this family appeared in.
      </p>
      <table className="simlab-table simlab-table-stats">
        <thead>
          <tr>
            <th>Family</th>
            <th>Wins</th>
            <th>Appearances</th>
            <th>Win rate</th>
            <th>Respect avg/max</th>
            <th>Contracts avg</th>
            <th>Titles avg</th>
            <th>Districts avg</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(summary.perFamily)
            .sort((a, b) => b[1].wins - a[1].wins || b[1].avgRespect - a[1].avgRespect)
            .map(([fam, s]) => (
              <tr key={fam}>
                <td>{FAMILY_LABEL[fam] ?? fam}</td>
                <td>{s.wins > 0 ? <span className="simlab-good">{s.wins}</span> : 0}</td>
                <td>{s.appearances}</td>
                <td>{fmt(s.winRate * 100, 0)}%</td>
                <td>{fmt(s.avgRespect)} / {s.maxRespect}</td>
                <td>{fmt(s.avgCompleted)}</td>
                <td>{fmt(s.avgTitles)}</td>
                <td>{fmt(s.avgDistricts)}</td>
              </tr>
            ))}
          {Object.keys(summary.perFamily).length === 0 && (
            <tr><td colSpan={8} className="simlab-muted">No family data captured.</td></tr>
          )}
        </tbody>
      </table>

      <h3 style={{ marginTop: 18 }}>Per-seat averages</h3>
      <p className="lobby-hint" style={{ marginTop: 0 }}>
        Wins per seat. If families/boroughs were stable this would be the main
        view, but with per-game shuffling this is mostly a "seat 0 acts first"
        bias check.
      </p>
      <table className="simlab-table simlab-table-stats">
        <thead>
          <tr>
            <th>Seat</th>
            <th>Wins</th>
            <th>Respect avg/max</th>
            <th>Contracts avg/max</th>
            <th>Commission %</th>
            <th>Titles avg</th>
            <th>Districts avg</th>
            <th>Cash avg</th>
            <th>Liquor $ avg</th>
            <th title="Power Broker Favors — permanent +1 Influence each">Favors avg/max</th>
            <th title="Lifetime Kickback Stash→Ops conversions">Kickbacks avg/max</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: players }, (_, p) => {
            const pid = String(p);
            const s = summary.perPlayer[pid];
            if (!s) return null;
            const wins = summary.winsByPlayer[pid] ?? 0;
            return (
              <tr key={pid}>
                <td>P{pid}</td>
                <td>{wins > 0 ? <span className="simlab-good">{wins}</span> : 0}</td>
                <td>{fmt(s.avgRespect)} / {s.maxRespect}</td>
                <td>{fmt(s.avgCompleted)} / {s.maxCompleted}</td>
                <td>{fmt(s.commissionPct * 100, 0)}%</td>
                <td>{fmt(s.avgTitles)}</td>
                <td>{fmt(s.avgDistricts)}</td>
                <td>${fmt(s.avgCash, 0)}</td>
                <td>${fmt(s.avgLiquorValue, 0)}</td>
                <td>{fmt(s.avgFavors)} / {s.maxFavors}</td>
                <td>{fmt(s.avgKickbacks)} / {s.maxKickbacks}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <MoveUsagePanel moveCounts={summary.moveCounts} />
    </section>
  );
}

function MoveUsagePanel({ moveCounts }: { moveCounts: Record<string, number> }) {
  const entries = Object.entries(moveCounts).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((s, [, n]) => s + n, 0);
  const signatures = entries.filter(([m]) => SIGNATURE_MOVES.has(m));
  const sigTotal = signatures.reduce((s, [, n]) => s + n, 0);
  const others = entries.filter(([m]) => !SIGNATURE_MOVES.has(m));
  return (
    <>
      <h3 style={{ marginTop: 18 }}>
        Signature plays{" "}
        <span className="simlab-muted">
          ({sigTotal} of {total} moves — {total === 0 ? "0" : ((sigTotal / total) * 100).toFixed(1)}%)
        </span>
      </h3>
      <p className="lobby-hint" style={{ marginTop: 0 }}>
        Per-family special plays. A 0 here means the bot never reached a state
        where this signature was the highest-scoring option this batch.
      </p>
      <table className="simlab-table simlab-table-stats simlab-table-compact">
        <thead>
          <tr>
            <th>Move</th>
            <th>Family</th>
            <th>Dispatches</th>
          </tr>
        </thead>
        <tbody>
          {[...SIGNATURE_MOVES].map((m) => {
            const n = moveCounts[m] ?? 0;
            return (
              <tr key={m} className={n === 0 ? "simlab-row-zero" : ""}>
                <td>{m}</td>
                <td>{SIGNATURE_FAMILY[m]}</td>
                <td>{n > 0 ? <span className="simlab-good">{n}</span> : 0}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <h3 style={{ marginTop: 18 }}>All moves</h3>
      <table className="simlab-table simlab-table-stats simlab-table-compact">
        <thead>
          <tr>
            <th>Move</th>
            <th>Dispatches</th>
            <th>% of total</th>
          </tr>
        </thead>
        <tbody>
          {others.map(([m, n]) => (
            <tr key={m}>
              <td>{m}</td>
              <td>{n}</td>
              <td>{total === 0 ? "0%" : `${((n / total) * 100).toFixed(1)}%`}</td>
            </tr>
          ))}
          {others.length === 0 && (
            <tr><td colSpan={3} className="simlab-muted">No moves dispatched.</td></tr>
          )}
        </tbody>
      </table>
    </>
  );
}

function PersonalityPanel({
  personality, setPersonality, presetName, setPresetName, disabled,
}: {
  personality: BotPersonality;
  setPersonality: (p: BotPersonality) => void;
  presetName: string;
  setPresetName: (s: string) => void;
  disabled: boolean;
}) {
  const update = (patch: Partial<BotPersonality>) => {
    setPersonality({ ...personality, ...patch });
    setPresetName("Custom");
  };
  const applyPreset = (name: string) => {
    setPresetName(name);
    if (PRESETS[name]) setPersonality({ ...PRESETS[name] });
  };
  return (
    <section className="simlab-personality">
      <header className="simlab-personality-head">
        <h2>Bot personality</h2>
        <div className="simlab-personality-presets">
          <label>Preset:</label>
          <select
            value={presetName}
            onChange={(e) => applyPreset(e.target.value)}
            disabled={disabled}
          >
            {Object.keys(PRESETS).map((n) => <option key={n} value={n}>{n}</option>)}
            <option value="Custom">Custom</option>
          </select>
        </div>
      </header>
      <p className="lobby-hint">
        Multipliers scale each candidate's static score. 1.0 = neutral. Sliders apply
        to every bot in the sim; preset Watchdog dogpiles leaders, Warmonger attacks
        often, Pacifist avoids combat, etc.
      </p>
      <div className="simlab-sliders">
        <Slider label="Aggression" value={personality.aggression} min={0} max={2} step={0.1}
          hint="Attack-initiating Moves" disabled={disabled}
          onChange={(v) => update({ aggression: v })} />
        <Slider label="Greed" value={personality.greed} min={0} max={2} step={0.1}
          hint="Unload, Extort, Smuggle" disabled={disabled}
          onChange={(v) => update({ greed: v })} />
        <Slider label="Expansion" value={personality.expansion} min={0} max={2} step={0.1}
          hint="Move into empty turf, Secure, Recruit" disabled={disabled}
          onChange={(v) => update({ expansion: v })} />
        <Slider label="Contracts" value={personality.contractFocus} min={0} max={2} step={0.1}
          hint="Hustle + speculative stakes" disabled={disabled}
          onChange={(v) => update({ contractFocus: v })} />
      </div>
      <h3>Leader response</h3>
      <p className="lobby-hint">
        How the bot reacts to rivals approaching the 20-Respect win threshold.
      </p>
      <div className="simlab-sliders">
        <Slider label="Threshold (Respect)" value={personality.leaderThreatRespect} min={5} max={18} step={1}
          hint="Rivals at this Respect become Leaders" disabled={disabled}
          onChange={(v) => update({ leaderThreatRespect: v })} />
        <Slider label="Response strength" value={personality.leaderResponseStrength} min={0.5} max={3} step={0.1}
          hint="1.0 = ignore, 3.0 = full dogpile" disabled={disabled}
          onChange={(v) => update({ leaderResponseStrength: v })} />
      </div>
    </section>
  );
}

function Slider({
  label, value, min, max, step, onChange, hint, disabled,
}: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; hint?: string; disabled?: boolean;
}) {
  return (
    <div className="simlab-slider" title={hint}>
      <div className="simlab-slider-row">
        <label>{label}</label>
        <span className="simlab-slider-value">{value.toFixed(step < 1 ? 1 : 0)}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
      />
    </div>
  );
}

function Stat({ label, value, good, bad }: { label: string; value: string; good?: boolean; bad?: boolean }) {
  return (
    <div className={"simlab-stat" + (good ? " good" : "") + (bad ? " bad" : "")}>
      <div className="simlab-stat-label">{label}</div>
      <div className="simlab-stat-value">{value}</div>
    </div>
  );
}
