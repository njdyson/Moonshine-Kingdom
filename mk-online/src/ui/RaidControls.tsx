import type { GameState, LiquorType } from "../game/types";
import { seatLabel } from "./display";
import { DISTRICT_BY_ID, RAID_BRIBE_COST, productionCap } from "../game/data";

interface Props {
  G: GameState;
  playerID: string | null;
  moves: {
    raidBribe: () => void;
    raidTakeTheFall: () => void;
  };
}

const LIQUOR_TYPES: LiquorType[] = ["moonshine", "gin", "whisky", "rum"];

export function RaidControls({ G, playerID, moves }: Props) {
  const raid = G.operations.raid;
  if (!raid) return null;
  const hit = raid.hits[raid.currentIdx];
  const isTarget = playerID === raid.target;
  const me = G.players[raid.target];

  // Preview impact for Take the Fall on this district.
  const previewLoss = (() => {
    if (!hit) return null;
    const ds = G.districts[hit.targetDistrictId];
    const barrels = ds.barrels[raid.target] ?? { moonshine: 0, gin: 0, whisky: 0, rum: 0 };
    const totalBarrels = LIQUOR_TYPES.reduce((s, t) => s + barrels[t], 0);
    const crew = ds.mobsters[raid.target] ?? { bosses: 0, runners: 0 };
    const { dead: arrests } = productionCap(crew.bosses + crew.runners);
    return { barrels: totalBarrels, arrests };
  })();

  return (
    <div className="raid-controls">
      <div className="sub-phase-label combat">🚨 Police Raid — {seatLabel(raid.target)} ({raid.currentIdx + 1}/{raid.hits.length})</div>
      {hit && (
        <div className="raid-status">
          <div>
            Precinct at <b>{DISTRICT_BY_ID[hit.precinctDistrictId].name}</b> raids{" "}
            <b>{DISTRICT_BY_ID[hit.targetDistrictId].name}</b>
          </div>
          {previewLoss && (
            <div className="hint">
              Take the Fall would: −{previewLoss.barrels} barrel{previewLoss.barrels === 1 ? "" : "s"}, −{previewLoss.arrests} arrested
            </div>
          )}
        </div>
      )}
      {isTarget && hit && (
        <div className="action-form">
          <div className="row">
            <button
              onClick={() => moves.raidBribe()}
              disabled={me.cash < RAID_BRIBE_COST}
              title={me.cash < RAID_BRIBE_COST ? "Insufficient cash" : ""}
            >
              Bribe (−${RAID_BRIBE_COST})
            </button>
            <button className="botched" onClick={() => moves.raidTakeTheFall()}>
              Take the Fall
            </button>
          </div>
        </div>
      )}
      {!isTarget && (
        <div className="dim">Waiting for {seatLabel(raid.target)} to choose.</div>
      )}
      {raid.hits.length > 1 && (
        <details className="raid-queue">
          <summary>All hits ({raid.hits.length})</summary>
          <ul>
            {raid.hits.map((h, i) => (
              <li key={i} className={i === raid.currentIdx ? "current" : ""}>
                {DISTRICT_BY_ID[h.targetDistrictId].name}
                {h.resolved && <span> · {h.resolved}</span>}
                {i === raid.currentIdx && <span> ◀</span>}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
