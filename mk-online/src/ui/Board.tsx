import { useState, useEffect, useRef } from "react";
import type { BoardProps } from "boardgame.io/react";
import type { GameState, ContractCard } from "../game/types";
import { isBotTurn, pickBotMove } from "../game/bot";
import { useAIPlayers, useAIDelay } from "../App";
import { BoardMap, DistrictDetail } from "./BoardMap";
import { OperationsPanel } from "./OperationsPanel";
import { ShadowsControls } from "./ShadowsControls";
import { OperationsControls } from "./OperationsControls";
import { ReckoningControls } from "./ReckoningControls";
import { CombatControls } from "./CombatControls";
import { RaidControls } from "./RaidControls";
import { CardLightbox } from "./CardLightbox";
import { seatLabel, formatLogLine } from "./display";
import { buildPlayerColors, LIQUOR_COLOR } from "./colors";
import { DISTRICTS } from "../game/data";
import { publishLiveG, pushHistory, takeBackSmart, canTakeBack } from "./liveState";

export function Board(props: BoardProps<GameState>) {
  const { G, ctx, moves, playerID, plugins, _stateID, log } = props;
  const phase = ctx.phase ?? "—";
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [calibrate, setCalibrate] = useState(false);
  const [calibratingId, setCalibratingId] = useState<string | null>(null);
  const [calibLog, setCalibLog] = useState<string[]>([]);
  const [hoverCoord, setHoverCoord] = useState<{ x: number; y: number } | null>(null);
  const [activeCard, setActiveCard] = useState<ContractCard | null>(null);
  const playerColors = buildPlayerColors(G.players);
  const myColor = playerID ? playerColors[playerID] : undefined;
  const opponents = Object.keys(G.players).filter((id) => id !== playerID);
  const aiPlayers = useAIPlayers();
  const { delay: aiDelay, setDelay: setAIDelay } = useAIDelay();

  const calibratingName = calibratingId ? DISTRICTS.find((d) => d.id === calibratingId)?.name : null;

  // Auto-save game state to localStorage on every G change.
  // Only save from playerID "0" to avoid duplicate writes from multiple seat instances.
  const [saveStatus, setSaveStatus] = useState<{ at: string | null; error: string | null }>({ at: null, error: null });
  useEffect(() => {
    if (playerID !== "0") return;
    const now = new Date().toISOString();
    const save = {
      G: { ...G, _resumePhase: ctx.phase },
      phase: ctx.phase,
      numPlayers: Object.keys(G.players).length,
      aiPlayers,
      savedAt: now,
      day: G.day,
    };
    try {
      localStorage.setItem("mk-save", JSON.stringify(save));
      setSaveStatus({ at: now, error: null });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      // eslint-disable-next-line no-console
      console.error("mk-save failed:", e);
      setSaveStatus((prev) => ({ at: prev.at, error: msg }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [G]);

  // Publish live G to the App shell (for the seat-tabs respect tally) and
  // capture a Take Back history snapshot. Only seat "0" writes to avoid
  // duplicate pushes from each MKClient mirror.
  useEffect(() => {
    if (playerID !== "0") return;
    publishLiveG(G);
    // Find the player who's expected to act next from this state (if any).
    // isBotTurn() actually just checks "is it this pid's turn to act" — the
    // name is misleading; we reuse it as the active-actor predicate.
    let activeActor: string | null = null;
    for (const id of Object.keys(G.players)) {
      if (isBotTurn(G, ctx, id)) { activeActor = id; break; }
    }
    // Snapshot must be a structural clone — Immer drafts share refs.
    const snapshot = JSON.parse(JSON.stringify(G));
    pushHistory({ G: snapshot, activeActor, stateID: _stateID, phase: ctx.phase });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [G, _stateID]);

  function handleCalibrateArm(id: string | null) {
    setCalibratingId(id);
  }

  function handleCalibratePlace(id: string, x: number, y: number) {
    const line = `  { id: "${id}", mapCenter: { x: ${x.toFixed(1)}, y: ${y.toFixed(1)} } },`;
    // eslint-disable-next-line no-console
    console.log(line);
    setCalibLog((prev) => [...prev, line]);
    setCalibratingId(null);
  }

  // Bot driver: each AI player's own Board instance polls state and
  // dispatches its move when it's the bot's logical turn. Only ONE seat
  // (the bot's own) dispatches to avoid double-firing.
  const lastDispatchRef = useRef<string>("");
  useEffect(() => {
    if (!playerID || !aiPlayers.includes(playerID)) return;
    if (!isBotTurn(G, ctx, playerID)) return;
    // Reconstruct a full bgio State so the bot can do 1-ply lookahead.
    const fullState = { G, ctx, plugins, _stateID, log, _undo: [], _redo: [], deltalog: [] };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const decision = pickBotMove(G, ctx, playerID, fullState as any);
    if (!decision) return;
    // Dedupe key includes _stateID so a Take Back (which produces a new state
    // ID) doesn't get blocked by a previously-fired identical move+args.
    const key = `${_stateID}.${ctx.turn}.${decision.move}.${JSON.stringify(decision.args)}`;
    const fn = (moves as Record<string, (...a: unknown[]) => unknown>)[decision.move];
    if (typeof fn !== "function") {
      // eslint-disable-next-line no-console
      console.warn("Bot wants unknown move:", decision.move);
      return;
    }
    // Small delay so the user sees the state change before the bot moves.
    // Dedupe check is inside the callback so React strict-mode double-invocation
    // doesn't set the ref before the timer fires (which would prevent the retry).
    const t = setTimeout(() => {
      if (lastDispatchRef.current === key) return;
      lastDispatchRef.current = key;
      fn(...decision.args);
    }, aiDelay);
    return () => clearTimeout(t);
  }, [G, ctx, playerID, moves, aiPlayers, aiDelay]);

  return (
    <div className="board">
      {activeCard && <CardLightbox card={activeCard} onClose={() => setActiveCard(null)} />}
      <header className="board-header">
        <div className="bh-left">
          Day <b>{G.day}</b> · {G.moonPhase === "new" ? "🌑 new" : "🌕 full"} moon · <b>{phase}</b>
          {G.operations.currentPlayer !== null && phase === "operations" && (
            <span className="bh-turn"> · Turn: <span style={{ color: playerColors[G.operations.currentPlayer] }}>{seatLabel(G.operations.currentPlayer)}</span></span>
          )}
        </div>
        <div className="bh-center" />
        <div className="bh-right">
          {(() => {
            const enabled = canTakeBack(aiPlayers, ctx.phase);
            return (
              <button
                className="bh-takeback"
                disabled={!enabled}
                title={enabled
                  ? "Rewind to before your last action (skips any AI moves in between)"
                  : "Nothing to take back yet (or earlier states are in a previous phase)"}
                onClick={() => {
                  const snapshot = takeBackSmart(aiPlayers, ctx.phase);
                  if (!snapshot) return;
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const fn = (moves as any).takeBack as ((s: unknown) => void) | undefined;
                  if (!fn) return;
                  fn(snapshot);
                }}
              >
                ↶ Take Back
              </button>
            );
          })()}
          {playerID === "0" && (
            <div
              className={"bh-save " + (saveStatus.error ? "save-err" : saveStatus.at ? "save-ok" : "save-pending")}
              title={
                saveStatus.error
                  ? `Save FAILED: ${saveStatus.error}`
                  : saveStatus.at
                  ? `Last saved ${new Date(saveStatus.at).toLocaleTimeString()}`
                  : "No save yet"
              }
            >
              💾 {saveStatus.error ? "save error" : saveStatus.at ? new Date(saveStatus.at).toLocaleTimeString() : "—"}
            </div>
          )}
          <div className="bh-heat" title="Heat Track (5 slots; full triggers Police Raid)">
            HEAT
            {Array.from({ length: 5 }, (_, i) => {
              const h = G.heat[i];
              return (
                <span
                  key={i}
                  className="bh-heat-slot"
                  style={h ? { background: playerColors[h.owner], borderColor: playerColors[h.owner] } : undefined}
                  title={h ? seatLabel(h.owner) : `Empty slot ${i + 1}`}
                />
              );
            })}
          </div>
          {aiPlayers.length > 0 && (
            <div className="bh-ai-speed" title="AI move delay">
              🤖
              <input
                type="range"
                min={0}
                max={2000}
                step={50}
                value={aiDelay}
                onChange={(e) => setAIDelay(Number(e.target.value))}
              />
              <span className="bh-ai-label">
                {aiDelay === 0 ? "instant" : `${aiDelay}ms`}
              </span>
            </div>
          )}
          <div className="bh-market" title="Current Liquor Market Values">
            {(["moonshine", "gin", "whisky", "rum"] as const).map((t) => (
              <span key={t} className="bh-market-cell" style={{ borderColor: LIQUOR_COLOR[t] }}>
                <span className="bh-market-dot" style={{ background: LIQUOR_COLOR[t] }}>{t[0].toUpperCase()}</span>
                ${G.market[t]}
              </span>
            ))}
          </div>
        </div>
      </header>

      <div className="board-main">
        {/* LEFT PANE */}
        <aside className="left-pane">
          {/* Calibrate controls */}
          <div className="calib-controls">
            <label className="calib-toggle">
              <input
                type="checkbox"
                checked={calibrate}
                onChange={(e) => {
                  setCalibrate(e.target.checked);
                  if (!e.target.checked) { setCalibratingId(null); setHoverCoord(null); }
                }}
              />
              Calibrate
            </label>
            {calibrate && (
              <div className="calib-hint">
                {calibratingName
                  ? `→ click map: ${calibratingName}`
                  : hoverCoord
                  ? `x:${hoverCoord.x.toFixed(1)} y:${hoverCoord.y.toFixed(1)}`
                  : "click a district card"}
              </div>
            )}
            {calibLog.length > 0 && (
              <>
                <button className="calib-clear" onClick={() => setCalibLog([])}>Clear log</button>
                <textarea
                  className="calib-log"
                  readOnly
                  rows={Math.min(calibLog.length + 1, 8)}
                  value={calibLog.join("\n")}
                />
              </>
            )}
          </div>

          {/* District detail */}
          {selectedDistrict && !calibrate && (
            <DistrictDetail districtId={selectedDistrict} G={G} playerColors={playerColors} />
          )}

          {/* Activity log */}
          <div className="log">
            <div className="log-head">Activity Log</div>
            <div className="log-body">
              {G.log.slice(-40).map((l, i) => (
                <div key={i} className="log-line">{formatLogLine(l)}</div>
              ))}
            </div>
          </div>
        </aside>

        {/* MAP */}
        <div className="map-pane">
          <BoardMap
            G={G}
            selectedDistrict={selectedDistrict}
            onSelect={setSelectedDistrict}
            playerColors={playerColors}
            calibrate={calibrate}
            calibratingId={calibratingId}
            onArm={handleCalibrateArm}
            onPlace={handleCalibratePlace}
            onHoverCoord={setHoverCoord}
          />
        </div>

        {/* RIGHT PANE */}
        <aside className="player-pane">
          {playerID && (
            <OperationsPanel
              G={G}
              playerID={playerID}
              isCurrentTurn={ctx.currentPlayer === playerID}
              playerColor={myColor}
              moves={moves as never}
              onCardClick={setActiveCard}
            />
          )}

          <div className="phase-controls">
            {ctx.phase === "shadows" && (
              <ShadowsControls
                G={G}
                playerID={playerID ?? null}
                aiPlayers={aiPlayers}
                moves={moves as never}
                onCardClick={setActiveCard}
              />
            )}
            {ctx.phase === "operations" && (
              <>
                {G.operations.raid ? (
                  <RaidControls G={G} playerID={playerID ?? null} moves={moves as never} />
                ) : G.operations.combat ? (
                  <CombatControls G={G} playerID={playerID ?? null} moves={moves as never} />
                ) : (
                  <OperationsControls
                    G={G}
                    playerID={playerID ?? null}
                    selectedDistrict={selectedDistrict}
                    moves={moves as never}
                    onCardClick={setActiveCard}
                  />
                )}
              </>
            )}
            {ctx.phase === "reckoning" && (
              <ReckoningControls
                G={G}
                playerID={playerID ?? null}
                moves={moves as never}
              />
            )}
          </div>

          {opponents.length > 0 && (
            <details className="opponents-overview">
              <summary>Opponents ({opponents.length})</summary>
              {opponents.map((id) => (
                <OperationsPanel
                  key={id}
                  G={G}
                  playerID={id}
                  isCurrentTurn={ctx.currentPlayer === id}
                  playerColor={playerColors[id]}
                  onCardClick={setActiveCard}
                />
              ))}
            </details>
          )}
        </aside>
      </div>
    </div>
  );
}
