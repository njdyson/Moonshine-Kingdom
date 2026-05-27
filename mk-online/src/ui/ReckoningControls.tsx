import type { GameState } from "../game/types";
import { seatLabel } from "./display";
import { computeRespect } from "../game/reckoning";

interface Props {
  G: GameState;
  playerID: string | null;
  moves: {
    startReckoning: () => void;
    setContractOutcome: (pendingIdx: number, completed: boolean) => void;
    confirmReckoning: () => void;
  };
}

export function ReckoningControls({ G, playerID, moves }: Props) {
  const sub = G.reckoning.subPhase;
  const myPending = G.reckoning.pendingDeadlines
    .map((pd, i) => ({ ...pd, pendingIdx: i }))
    .filter((pd) => pd.playerID === playerID);

  return (
    <div className="reckoning-controls">
      <div className="sub-phase-label">Reckoning · {sub}</div>

      {sub === "sweep" && (
        <>
          <p className="hint">
            Click Run Sweep to auto-resolve sweep, titles, and tick contract markers.
            You'll then decide outcomes for any contracts that hit their deadline.
          </p>
          <button onClick={() => moves.startReckoning()}>Run Sweep + Titles + Tick</button>
        </>
      )}

      {sub === "contracts" && (
        <>
          <p className="hint">
            Contracts with a wired objective check are auto-decided (shown with ✓/✗).
            Others fall back to your manual choice.
          </p>
          {myPending.length === 0 && <div className="dim">No deadline contracts for you.</div>}
          {myPending.map((pd) => {
            const sc = G.players[pd.playerID].staked[pd.contractIdx];
            if (!sc) return null;
            const autoDecided = pd.decided && (G.reckoning.pendingDeadlines[pd.pendingIdx]?.decided ?? false);
            return (
              <div key={pd.pendingIdx} className="deadline-card">
                <div>
                  <b>{sc.card.name}</b> ({sc.card.tier}, {sc.card.respect}R, ${sc.card.take})
                  {autoDecided && (
                    <span style={{ marginLeft: 8 }}>{pd.completed ? "✓ auto-Completed" : "✗ auto-Botched"}</span>
                  )}
                </div>
                <div className="objective">{sc.card.objective}</div>
                <div className="row">
                  <button
                    className={pd.decided && pd.completed ? "chosen" : ""}
                    onClick={() => moves.setContractOutcome(pd.pendingIdx, true)}
                  >
                    Completed
                  </button>
                  <button
                    className={pd.decided && !pd.completed ? "chosen botched" : ""}
                    onClick={() => moves.setContractOutcome(pd.pendingIdx, false)}
                  >
                    Botched
                  </button>
                </div>
              </div>
            );
          })}
          <button
            onClick={() => moves.confirmReckoning()}
            disabled={myPending.some((pd) => !pd.decided) || G.reckoning.confirmed.includes(playerID ?? "")}
          >
            {G.reckoning.confirmed.includes(playerID ?? "") ? "Confirmed ✓" : "Confirm My Decisions"}
          </button>
        </>
      )}

      <div className="respect-tally">
        <div className="ops-section-title">Current Respect</div>
        {Object.keys(G.players).map((id) => (
          <div key={id}>
            {seatLabel(id)}: {computeRespect(G, id)}
            {G.players[id].hasCommission && " ★"}
            {G.winner === id && " 🏆"}
          </div>
        ))}
      </div>
    </div>
  );
}
