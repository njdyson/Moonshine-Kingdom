import { useState, useMemo, useEffect, createContext, useContext } from "react";
import { Client } from "boardgame.io/react";
import { Local } from "boardgame.io/multiplayer";
import { MoonshineKingdom } from "./game/game";
import { Board } from "./ui/Board";
import { Lobby } from "./ui/Lobby";
import type { LobbyConfig } from "./ui/Lobby";
import { SimLab } from "./ui/SimLab";
import { subscribeLiveG, getLiveG, resetLiveG } from "./ui/liveState";
import { buildPlayerColors } from "./ui/colors";
import { computeRespect } from "./game/reckoning";
import type { GameState } from "./game/types";
import "./App.css";

/**
 * Context lets Board read the per-game AI player list without re-creating the
 * bgio Client (which depends only on numPlayers).
 */
const AIPlayersContext = createContext<string[]>([]);
export function useAIPlayers(): string[] {
  return useContext(AIPlayersContext);
}

/** How long (ms) the bot waits before dispatching each move. Persisted in localStorage. */
const AIDelayContext = createContext<{ delay: number; setDelay: (n: number) => void }>({
  delay: 600,
  setDelay: () => {},
});
export function useAIDelay() {
  return useContext(AIDelayContext);
}

type View = { kind: "lobby" } | { kind: "game"; config: LobbyConfig } | { kind: "simlab" };

export default function App() {
  const [view, setView] = useState<View>({ kind: "lobby" });
  const [aiDelay, setAIDelayRaw] = useState<number>(() => {
    try { return Number(localStorage.getItem("mk-ai-delay") ?? 600) || 0; } catch { return 600; }
  });

  function setAIDelay(n: number) {
    setAIDelayRaw(n);
    try { localStorage.setItem("mk-ai-delay", String(n)); } catch { /* quota */ }
  }

  if (view.kind === "simlab") return <SimLab onExit={() => setView({ kind: "lobby" })} />;
  if (view.kind === "lobby") {
    return (
      <Lobby
        onStart={(config) => setView({ kind: "game", config })}
        onOpenSimLab={() => setView({ kind: "simlab" })}
      />
    );
  }
  return (
    <AIDelayContext.Provider value={{ delay: aiDelay, setDelay: setAIDelay }}>
      <GameShell
        config={view.config}
        onExit={() => {
          resetLiveG();
          setView({ kind: "lobby" });
        }}
      />
    </AIDelayContext.Provider>
  );
}

function GameShell({ config, onExit }: { config: LobbyConfig; onExit: () => void }) {
  // Recreate the bgio Client whenever numPlayers changes. We keep it stable
  // across re-renders for the same config so state isn't dropped mid-game.
  const MKClient = useMemo(() => {
    return Client({
      game: MoonshineKingdom,
      board: Board,
      numPlayers: config.numPlayers,
      multiplayer: Local(),
      debug: false,
    });
  }, [config.numPlayers]);

  const [activeSeat, setActiveSeat] = useState(0);
  const liveG = useLiveG();
  const playerColors = useMemo(
    () => (liveG ? buildPlayerColors(liveG.players) : {}),
    [liveG]
  );

  // Tab order = current turn order (turnToken.number asc). Falls back to seat
  // order before liveG is available. The underlying MKClient mounts stay in
  // seat order to avoid remount/state loss.
  const tabOrder = useMemo(() => {
    const seats = Array.from({ length: config.numPlayers }, (_, i) => i);
    if (!liveG) return seats;
    return seats.sort((a, b) => {
      const ta = liveG.players[String(a)]?.turnToken.number ?? a + 1;
      const tb = liveG.players[String(b)]?.turnToken.number ?? b + 1;
      return ta - tb;
    });
  }, [liveG, config.numPlayers]);

  return (
    <AIPlayersContext.Provider value={config.aiPlayers}>
      <div className="hotseat-shell">
        <nav className="seat-tabs">
          {tabOrder.map((i) => {
            const id = String(i);
            const respect = liveG ? computeRespect(liveG, id) : null;
            const color = playerColors[id];
            const turnNum = liveG?.players[id]?.turnToken.number ?? i + 1;
            return (
              <button
                key={i}
                className={"seat-tab" + (i === activeSeat ? " active" : "")}
                onClick={() => setActiveSeat(i)}
                style={color ? { borderLeft: `4px solid ${color}` } : undefined}
                title={`Seat ${i + 1} · Turn order #${turnNum}`}
              >
                <span className="seat-tab-turn">#{turnNum}</span>
                Seat {i + 1}
                {config.aiPlayers.includes(id) && <span className="seat-tab-ai"> 🤖</span>}
                {respect !== null && (
                  <span
                    className="seat-tab-respect"
                    title={`P${i + 1} Respect (deeds + syndicates + completed contracts − Shylock marks − Rat Card)`}
                  >
                    {respect}★
                  </span>
                )}
                {liveG && liveG.ratCard === id && (
                  <span
                    className="seat-tab-rat"
                    title="Holds the Rat Card: cannot Hustle, -3 Respect at game end"
                  > 🐀</span>
                )}
              </button>
            );
          })}
          <button className="seat-tab end-game" onClick={onExit} title="Back to Lobby (abandons game)">
            ⟵ Lobby
          </button>
        </nav>
        {Array.from({ length: config.numPlayers }, (_, i) => (
          <div
            key={i}
            className="seat"
            style={{ display: i === activeSeat ? "flex" : "none" }}
          >
            <MKClient playerID={String(i)} />
          </div>
        ))}
      </div>
    </AIPlayersContext.Provider>
  );
}

/**
 * Subscribe to the live G snapshot the Board pushes from inside the bgio
 * Client. We use this from App so the seat-tabs can show respect tallies
 * without re-creating the bgio Client on every G change.
 */
function useLiveG(): GameState | null {
  const [g, setG] = useState<GameState | null>(() => getLiveG());
  useEffect(() => {
    const unsub = subscribeLiveG(setG);
    // Seed with whatever's already there (Board may have pushed before
    // this effect ran).
    setG(getLiveG());
    return unsub;
  }, []);
  return g;
}
