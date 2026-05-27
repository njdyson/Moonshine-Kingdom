import type { GameState, PlayerID } from "../game/types";
import { seatLabel } from "./display";
import { MOB_DEFINITIONS, OPERATIONS_SLOTS, FAVORS, SHYLOCK_REPAY_DEFAULT, SHYLOCK_REPAY_WITH_ROTHSTEIN } from "../game/data";

interface OperationsPanelProps {
  G: GameState;
  playerID: PlayerID;
  isCurrentTurn: boolean;
  playerColor?: string;
  /** Top-level moves (Shylock take/repay). Only passed for the viewer's own panel. */
  moves?: {
    takeShylockMark?: () => void;
    repayShylockMark?: () => void;
  };
  onCardClick?: (card: import("../game/types").ContractCard) => void;
}

export function OperationsPanel({ G, playerID, isCurrentTurn, playerColor = "#d4af37", moves, onCardClick }: OperationsPanelProps) {
  const p = G.players[playerID];
  if (!p) return null;
  const def = MOB_DEFINITIONS[p.family];
  const heatCount = G.heat.filter((h) => h.owner === playerID).length;
  const stakedCount = p.staked.reduce((s, c) => s + c.markersRemaining, 0);

  return (
    <div className={"ops-panel" + (isCurrentTurn ? " current-turn" : "")} style={{ borderLeft: `3px solid ${playerColor}` }}>
      <header className="ops-head" style={{ background: playerColor }}>
        <div className="ops-mob">{def.name}</div>
        <div className="ops-meta">
          <span>{seatLabel(playerID)}</span>
          <span>${p.cash.toLocaleString()}</span>
          <span title="Turn Token">#{p.turnToken.number} {p.turnToken.moon === "new" ? "🌑" : "🌕"}</span>
        </div>
      </header>

      {/* Operations board — socket-style visualization matching the physical player board */}
      <section className="ops-board-strip">
        <div className="ops-socket-cluster">
          <div className="ops-socket-label">Turn</div>
          <div className="ops-turn-socket">
            <span className="ops-turn-num">{p.turnToken.number}</span>
            <span className="ops-turn-moon">{p.turnToken.moon === "new" ? "🌑" : "🌕"}</span>
          </div>
        </div>
        <div className="ops-board-divider" />
        <div className="ops-socket-cluster">
          <div className="ops-socket-label">Stash</div>
          <div className="ops-stash-socket" style={{ borderColor: playerColor }}>
            <span className="ops-stash-count" style={{ color: playerColor }}>{p.stash}</span>
          </div>
        </div>
        <div className="ops-board-arrow">➤</div>
        <div className="ops-socket-cluster">
          <div className="ops-socket-label">Operations</div>
          <div className="ops-action-row">
            {Array.from({ length: OPERATIONS_SLOTS }, (_, i) => (
              <div key={i} className="ops-action-socket">
                {i < p.operations && (
                  <span className="ops-action-fill" style={{ background: playerColor }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
      <div className="ops-board-sublabel">
        Morning: Stash → Ops · Day: Ops → Stash / Heat
      </div>

      {/* Staked + heat compact row */}
      {(stakedCount > 0 || heatCount > 0) && (
        <section className="ops-influence-compact">
          {stakedCount > 0 && (
            <span className="infl-compact-group" title={`${p.staked.length} staked contract${p.staked.length !== 1 ? "s" : ""}`}>
              {Array.from({ length: stakedCount }, (_, i) => <Marker key={i} color={playerColor} dim />)}
              <span className="muted infl-compact-label">staked</span>
            </span>
          )}
          {heatCount > 0 && (
            <span className="infl-compact-group" title={`${heatCount} Heat marker${heatCount !== 1 ? "s" : ""}`}>
              {Array.from({ length: heatCount }, (_, i) => <Marker key={i} color={playerColor} heat />)}
              <span className="muted infl-compact-label">heat</span>
            </span>
          )}
        </section>
      )}

      <div className="influence-totals">
        Total: {p.totalInfluence} · In Play: {p.stash + p.operations + stakedCount + heatCount}
      </div>

      {/* Hand / completed */}
      <section className="ops-cards">
        <div>Hand: <b>{p.hand.length}</b> contracts</div>
        <div>Completed: <b>{p.completed.length}</b> (Gigs/Rackets/Scores)</div>
        {p.hasCommission && <div className="commission">★ Commission Card</div>}
      </section>

      {/* Ongoing (staked) contracts */}
      {p.staked.length > 0 && (
        <section className="ops-staked">
          <div className="ops-section-title">Ongoing Contracts</div>
          {p.staked.map((sc, i) => (
            <div key={i} className="staked-row" title={sc.card.objective}>
              <span
                className={"staked-name" + (onCardClick ? " card-name-link" : "")}
                onClick={() => onCardClick?.(sc.card)}
              >
                {sc.card.name}
              </span>
              <span className="staked-meta">
                {sc.card.tier} · {sc.card.respect}R · ${sc.card.take.toLocaleString()}
              </span>
              <span
                className="staked-deadline"
                title={`${sc.markersRemaining} marker${sc.markersRemaining === 1 ? "" : "s"} remaining — evaluates when last comes off`}
              >
                {sc.markersRemaining === 0
                  ? "due now"
                  : `${sc.markersRemaining}d`}
              </span>
            </div>
          ))}
        </section>
      )}

      {/* Favors */}
      {p.favors.length > 0 && (
        <section className="ops-favors">
          <div className="ops-section-title">Favors</div>
          {p.favors.map((f) => (
            <div key={f} className="favor-line" title={FAVORS[f].effect}>
              {FAVORS[f].name}
            </div>
          ))}
        </section>
      )}

      {/* Supply (pieces remaining off-board) */}
      <section className="ops-supply">
        <div className="ops-section-title">Supply</div>
        <div>
          {p.bossesInSupply}B · {p.runnersInSupply}R · {p.safehousesInSupply}🏠
        </div>
      </section>

      {p.shylockMarks > 0 && (
        <div className="shylock">
          ⚠ Owes Shylock: {p.shylockMarks} mark{p.shylockMarks === 1 ? "" : "s"} (−{p.shylockMarks} Respect at endgame)
        </div>
      )}
      {moves && (
        <div className="shylock-controls">
          <button
            onClick={() => moves.takeShylockMark?.()}
            disabled={G.shylockMarksInBank <= 0}
            title={`Take a loan: +$1,500. ${G.shylockMarksInBank} marks left in bank.`}
          >
            Take Shylock Loan (+$1,500)
          </button>
          {p.shylockMarks > 0 && (
            <button
              onClick={() => moves.repayShylockMark?.()}
              disabled={p.cash < (p.favors.includes("rothstein") ? SHYLOCK_REPAY_WITH_ROTHSTEIN : SHYLOCK_REPAY_DEFAULT)}
            >
              Repay 1 Mark (−${p.favors.includes("rothstein") ? SHYLOCK_REPAY_WITH_ROTHSTEIN : SHYLOCK_REPAY_DEFAULT})
            </button>
          )}
        </div>
      )}
      {p.bossDown && <div className="boss-down">⚠ Boss down — Rise to crown a successor</div>}
    </div>
  );
}

function Marker({ color, dim, heat }: { color: string; dim?: boolean; heat?: boolean }) {
  return (
    <span
      className={"infl-marker" + (dim ? " dim" : "") + (heat ? " heat" : "")}
      style={{ background: color }}
      aria-label="influence marker"
    />
  );
}
