import { useState, useEffect } from "react";
import { MOB_DEFINITIONS } from "../game/data";
import type { MobFamily } from "../game/types";
import { MOB_COLORS } from "./colors";

export interface LobbyConfig {
  numPlayers: number;
  /** Player IDs ("0".."3") that should be AI-controlled. */
  aiPlayers: string[];
}

interface SaveMeta {
  phase: string;
  numPlayers: number;
  aiPlayers: string[];
  savedAt: string;
  day: number;
}

const ALL_FAMILIES: MobFamily[] = ["sicilian", "irish", "vipers", "knights"];
const ALL_BOROUGHS = ["manhattan", "brooklyn", "queens", "bronx"] as const;
type BoroughPick = typeof ALL_BOROUGHS[number];

const BOROUGH_LABEL: Record<BoroughPick, string> = {
  manhattan: "Manhattan",
  brooklyn: "Brooklyn",
  queens: "Queens",
  bronx: "Bronx",
};


function shuffleArr<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface Props {
  onStart: (cfg: LobbyConfig) => void;
  onOpenSimLab?: () => void;
}

export function Lobby({ onStart, onOpenSimLab }: Props) {
  const [numPlayers, setNumPlayers] = useState<number>(2);
  /** kind[i] = "human" | "ai" for seat i */
  const [kind, setKind] = useState<("human" | "ai")[]>(["human", "ai", "ai", "ai"]);
  const [savedMeta, setSavedMeta] = useState<SaveMeta | null>(null);

  // Full 4-slot assignment arrays; only [:numPlayers] slots are active.
  // Initialised with a random shuffle so every lobby open is different.
  const [families, setFamilies] = useState<MobFamily[]>(
    () => shuffleArr([...ALL_FAMILIES]) as MobFamily[]
  );
  const [boroughs, setBoroughs] = useState<BoroughPick[]>(
    () => shuffleArr([...ALL_BOROUGHS]) as BoroughPick[]
  );

  useEffect(() => {
    try {
      const raw = localStorage.getItem("mk-save");
      if (raw) setSavedMeta(JSON.parse(raw) as SaveMeta);
    } catch { /* ignore */ }
  }, []);

  function reshuffle() {
    setFamilies(shuffleArr([...ALL_FAMILIES]) as MobFamily[]);
    setBoroughs(shuffleArr([...ALL_BOROUGHS]) as BoroughPick[]);
  }

  /** Cycle seat i's family forward; swap with any active seat that already holds it. */
  function cycleFamily(seatIdx: number) {
    const cur = families[seatIdx];
    const next = ALL_FAMILIES[(ALL_FAMILIES.indexOf(cur) + 1) % ALL_FAMILIES.length];
    const takenBy = families.findIndex((f, i) => i !== seatIdx && i < numPlayers && f === next);
    const updated = [...families];
    updated[seatIdx] = next;
    if (takenBy !== -1) updated[takenBy] = cur; // swap
    setFamilies(updated);
  }

  /** Cycle seat i's starting borough forward; swap with any active seat that already holds it. */
  function cycleBorough(seatIdx: number) {
    const cur = boroughs[seatIdx];
    const next = ALL_BOROUGHS[(ALL_BOROUGHS.indexOf(cur) + 1) % ALL_BOROUGHS.length];
    const takenBy = boroughs.findIndex((b, i) => i !== seatIdx && i < numPlayers && b === next);
    const updated = [...boroughs];
    updated[seatIdx] = next;
    if (takenBy !== -1) updated[takenBy] = cur; // swap
    setBoroughs(updated);
  }

  function setSeatKind(i: number, k: "human" | "ai") {
    const copy = [...kind];
    copy[i] = k;
    setKind(copy);
  }

  function start(allAi = false) {
    const aiPlayers = Array.from({ length: numPlayers }, (_, i) =>
      allAi || kind[i] === "ai" ? String(i) : null
    ).filter((v): v is string => v !== null);
    // Write seat picks before clearing resume so setup() reads them for a new game.
    localStorage.setItem("mk-setup-picks", JSON.stringify({
      families: families.slice(0, numPlayers),
      boroughs: boroughs.slice(0, numPlayers),
    }));
    localStorage.removeItem("mk-resume-pending");
    onStart({ numPlayers, aiPlayers });
  }

  function resume() {
    try {
      const raw = localStorage.getItem("mk-save");
      if (!raw) return;
      const s = JSON.parse(raw) as { G: object; numPlayers: number; aiPlayers: string[] };
      localStorage.setItem("mk-resume-pending", JSON.stringify(s.G));
      onStart({ numPlayers: s.numPlayers, aiPlayers: s.aiPlayers });
    } catch { /* ignore corrupt save */ }
  }

  function clearSave() {
    localStorage.removeItem("mk-save");
    setSavedMeta(null);
  }

  const humanCount = kind.slice(0, numPlayers).filter((k) => k === "human").length;

  return (
    <div className="lobby">
      <div className="lobby-card">
        <h1>Moonshine Kingdom</h1>
        <p className="lobby-tagline">A game of bootlegging, backstabbing, and gang warfare.</p>

        <section>
          <h2>Players</h2>
          <div className="lobby-count">
            {[2, 3, 4].map((n) => (
              <button
                key={n}
                className={"lobby-pill" + (numPlayers === n ? " active" : "")}
                onClick={() => setNumPlayers(n)}
              >
                {n} players
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2>Seats</h2>
          <p className="lobby-hint">
            Click a mob or borough to cycle through options. Hit Reshuffle to randomise all at once.
          </p>
          <div className="lobby-seats">
            {Array.from({ length: numPlayers }, (_, i) => (
              <div key={i} className="lobby-seat" style={{ borderColor: MOB_COLORS[families[i]] }}>
                <div className="lobby-seat-head" style={{ color: MOB_COLORS[families[i]] }}>
                  Seat {i + 1}
                </div>
                <button
                  className="lobby-assign-btn"
                  onClick={() => cycleFamily(i)}
                  title="Click to cycle mob family"
                >
                  {MOB_DEFINITIONS[families[i]].name}
                </button>
                <button
                  className="lobby-assign-btn secondary"
                  onClick={() => cycleBorough(i)}
                  title="Click to cycle starting borough"
                >
                  {BOROUGH_LABEL[boroughs[i]]}
                </button>
                <div className="lobby-seat-kind">
                  <button
                    className={"lobby-pill small" + (kind[i] === "human" ? " active" : "")}
                    onClick={() => setSeatKind(i, "human")}
                  >
                    Human
                  </button>
                  <button
                    className={"lobby-pill small" + (kind[i] === "ai" ? " active" : "")}
                    onClick={() => setSeatKind(i, "ai")}
                  >
                    AI
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="lobby-reshuffle">
            <button className="lobby-secondary" onClick={reshuffle}>🎲 Reshuffle All</button>
          </div>
        </section>

        {savedMeta && (
          <section className="lobby-resume">
            <div className="lobby-resume-info">
              💾 Saved game — Day {savedMeta.day} · <span className="lobby-resume-phase">{savedMeta.phase}</span>
              {" · "}{savedMeta.numPlayers}P
              {" · "}<span className="lobby-resume-time">{new Date(savedMeta.savedAt).toLocaleString()}</span>
            </div>
            <div className="lobby-resume-btns">
              <button className="lobby-start" onClick={resume}>Resume Game</button>
              <button className="lobby-secondary danger" onClick={clearSave}>Clear Save</button>
            </div>
          </section>
        )}

        <section className="lobby-actions">
          <button className="lobby-start" onClick={() => start(false)}>
            New Game ({humanCount} Human · {numPlayers - humanCount} AI)
          </button>
          <button className="lobby-secondary" onClick={() => start(true)}>
            Watch AI Self-Play
          </button>
          {onOpenSimLab && (
            <button className="lobby-secondary" onClick={onOpenSimLab}>
              🧪 Sim Lab
            </button>
          )}
        </section>

        <p className="lobby-note">
          Staten Island has no starting forces (Police hold it).
        </p>
      </div>
    </div>
  );
}
