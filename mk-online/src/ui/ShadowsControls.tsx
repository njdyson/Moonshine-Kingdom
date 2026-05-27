import { useState } from "react";
import type { GameState, ContractCard } from "../game/types";
import { seatLabel, formatLogLine } from "./display";

interface Props {
  G: GameState;
  playerID: string | null;
  aiPlayers: string[];
  moves: {
    rollDice: () => void;
    draftDice: (redIdx: number, whiteIdx: number, action: "produce" | "dump") => void;
    fundOps: (count: number) => void;
    stakeContract: (cardId: string) => void;
    confirmGrease: () => void;
  };
  onCardClick?: (card: ContractCard) => void;
}

export function ShadowsControls({ G, playerID, aiPlayers, moves, onCardClick }: Props) {
  const s = G.shadows;
  const roller = s.turnOrder[0];
  const drafter = s.turnOrder[s.currentDrafterIdx];
  const greaser = s.turnOrder[s.currentGreaserIdx];
  const isRoller = roller === playerID;
  const isDrafter = drafter === playerID;
  const isGreaser = greaser === playerID;
  const rollerIsAI = roller !== undefined && aiPlayers.includes(roller);

  return (
    <div className="shadows-controls">
      <div className="sub-phase-label">
        Shadows · {s.subPhase}
        {s.subPhase === "roll" && roller !== undefined && (
          <span> · {seatLabel(roller)}'s roll</span>
        )}
        {s.subPhase === "draft" && drafter !== undefined && (
          <span> · {seatLabel(drafter)}'s draft</span>
        )}
        {s.subPhase === "grease" && greaser !== undefined && (
          <span> · Greaser: {seatLabel(greaser)}</span>
        )}
      </div>

      {s.subPhase === "roll" && (
        rollerIsAI
          ? <p className="hint">🤖 {seatLabel(roller!)} (AI) is rolling…</p>
          : <button disabled={!isRoller} onClick={() => moves.rollDice()}>Roll Dice</button>
      )}

      {s.subPhase === "draft" && (
        <UnifiedDraftPool
          red={s.redDice}
          white={s.whiteDice}
          enabled={isDrafter}
          drafterIsAI={drafter !== undefined && aiPlayers.includes(drafter)}
          drafterLabel={drafter !== undefined ? seatLabel(drafter) : ""}
          onDraft={(r, w, a) => moves.draftDice(r, w, a)}
        />
      )}

      {s.subPhase === "grease" && (
        <GreaseControls
          G={G}
          playerID={playerID}
          enabled={isGreaser}
          stash={playerID ? G.players[playerID]?.stash ?? 0 : 0}
          operations={playerID ? G.players[playerID]?.operations ?? 0 : 0}
          onFund={(n) => moves.fundOps(n)}
          onStake={(cid) => moves.stakeContract(cid)}
          onDone={() => moves.confirmGrease()}
          onCardClick={onCardClick}
        />
      )}

      {s.events.length > 0 && (
        <ul className="shadows-events">
          {s.events.map((e, i) => <li key={i}>{formatLogLine(e)}</li>)}
        </ul>
      )}
    </div>
  );
}

function UnifiedDraftPool({
  red,
  white,
  enabled,
  drafterIsAI,
  drafterLabel,
  onDraft,
}: {
  red: number[];
  white: number[];
  enabled: boolean;
  drafterIsAI: boolean;
  drafterLabel: string;
  onDraft: (r: number, w: number, action: "produce" | "dump") => void;
}) {
  const [selectedRed, setSelectedRed] = useState<number | null>(null);
  const [selectedWhite, setSelectedWhite] = useState<number | null>(null);

  const hasRed = selectedRed !== null;
  const hasWhite = selectedWhite !== null;
  const ready = enabled && hasRed && hasWhite;

  function dispatch(action: "produce" | "dump") {
    const r = selectedRed;
    const w = selectedWhite;
    if (r === null || w === null) return;
    // Clear selection before dispatching so stale state can't re-fire.
    setSelectedRed(null);
    setSelectedWhite(null);
    // eslint-disable-next-line no-console
    console.log("[UI] dispatch", action, "red=", r, "white=", w);
    onDraft(r, w, action);
  }

  const hint = !enabled
    ? (drafterIsAI ? `🤖 ${drafterLabel} (AI) is drafting…` : `${drafterLabel}'s turn — switch to their seat tab.`)
    : !hasRed && !hasWhite
    ? "Pick one red and one white die."
    : hasRed && !hasWhite
    ? "Now pick a white die."
    : !hasRed && hasWhite
    ? "Now pick a red die."
    : "Ready — Produce or Dump.";

  return (
    <div className="draft-picker">
      <div className="draft-row">
        <span className="dice-label">🔴</span>
        {red.map((d, i) => (
          <button
            key={i}
            disabled={!enabled}
            className={"die-pick red" + (selectedRed === i ? " selected" : "")}
            onClick={() => setSelectedRed(selectedRed === i ? null : i)}
          >
            {d}
          </button>
        ))}
      </div>
      <div className="draft-row">
        <span className="dice-label">⚪</span>
        {white.map((d, i) => (
          <button
            key={i}
            disabled={!enabled}
            className={"die-pick white" + (selectedWhite === i ? " selected" : "")}
            onClick={() => setSelectedWhite(selectedWhite === i ? null : i)}
          >
            {d}
          </button>
        ))}
      </div>
      <div className="draft-row">
        <button disabled={!ready} onClick={() => dispatch("produce")}>Produce</button>
        <button disabled={!ready} onClick={() => dispatch("dump")}>Dump</button>
      </div>
      <p className="hint">{hint}</p>
    </div>
  );
}

function GreaseControls({
  G,
  playerID,
  enabled,
  stash,
  operations,
  onFund,
  onStake,
  onDone,
  onCardClick,
}: {
  G: GameState;
  playerID: string | null;
  enabled: boolean;
  stash: number;
  operations: number;
  onFund: (n: number) => void;
  onStake: (cardId: string) => void;
  onDone: () => void;
  onCardClick?: (card: import("../game/types").ContractCard) => void;
}) {
  if (!enabled) return <div className="dim">Waiting for current greaser...</div>;
  const room = 5 - operations;
  const moveAll = Math.min(stash, room);
  const hand = playerID ? G.players[playerID]?.hand ?? [] : [];
  return (
    <div className="grease-controls">
      <div>Stash: {stash} · Operations: {operations}/5 (room: {room})</div>
      <div className="row">
        <button disabled={moveAll <= 0} onClick={() => onFund(moveAll)}>
          Move all to Ops ({moveAll})
        </button>
        <button onClick={onDone}>Done</button>
      </div>
      {hand.length > 0 && (
        <div className="stake-list">
          <div className="ops-section-title">Stake Contracts</div>
          {hand.map((c) => (
            <div key={c.id} className="stake-row">
              <div>
                <b
                  className={onCardClick ? "card-name-link" : undefined}
                  onClick={() => onCardClick?.(c)}
                >
                  {c.name}
                </b>
                {" "}· {c.tier} · {c.respect}R · ${c.take}
                <div className="objective">{c.objective}</div>
              </div>
              <button
                disabled={stash < c.deadline}
                onClick={() => onStake(c.id)}
                title={`Lock ${c.deadline} marker${c.deadline === 1 ? "" : "s"} from Stash`}
              >
                Stake ({c.deadline})
              </button>
            </div>
          ))}
        </div>
      )}
      <p className="hint">Stake contracts and fund Ops, then click Done.</p>
    </div>
  );
}
