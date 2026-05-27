import { useState } from "react";
import { seatLabel } from "./display";
import type { GameState, LiquorType } from "../game/types";
import { DISTRICT_BY_ID, combatDice, killThreshold } from "../game/data";

interface Props {
  G: GameState;
  playerID: string | null;
  moves: {
    ambushChoice: (ambush: boolean) => void;
    fold: (destId: string) => void;
    assault: () => void;
    advance: (destId: string, barrels?: { type: LiquorType; count: number }[]) => void;
    fallBack: () => void;
    stormPrecinct: () => void;
    courage: (liquor: LiquorType) => void;
    plunder: () => void;
    firepower: () => void;
    torch: () => void;
    pickPlunder: (picks: { type: LiquorType; count: number }[]) => void;
  };
}

const LIQUOR_TYPES_ALL: LiquorType[] = ["moonshine", "gin", "whisky", "rum"];

export function CombatControls({ G, playerID, moves }: Props) {
  const c = G.operations.combat;
  const [advanceDest, setAdvanceDest] = useState<string>("");
  const [foldDest, setFoldDest] = useState<string>("");
  if (!c) return null;
  const d = DISTRICT_BY_ID[c.districtId];
  const origin = DISTRICT_BY_ID[c.originId];
  const dsState = G.districts[c.districtId];
  const defCrew = c.defender ? dsState.mobsters[c.defender] ?? { bosses: 0, runners: 0 } : { bosses: 0, runners: 0 };
  const defTotal = defCrew.bosses + defCrew.runners;
  const atkTotal = c.pinned.bosses + c.pinned.runners;
  const isDefender = c.defender !== null && playerID === c.defender;
  const isAttacker = playerID === c.attacker;

  // Compute live threat & dice projections for the attacker.
  const atkDice = combatDice(atkTotal);
  const defDice = combatDice(defTotal);
  const atkThreat = 1 + (c.pinned.bosses > 0 ? 1 : 0);
  const defThreatBase = c.defender ? 1 + (defCrew.bosses > 0 ? 1 : 0) + ((dsState.safehouses[c.defender] ?? 0) > 0 ? 2 : 0) : 0;

  // Connected safe districts the attacker could Advance into.
  const advanceOptions = (() => {
    const fd = d;
    const reachable = new Set(fd.connections);
    if (fd.tags.includes("dock")) {
      // Add all docks (waterway connections).
      for (const did of Object.keys(G.districts)) {
        if (DISTRICT_BY_ID[did]?.tags.includes("dock")) reachable.add(did);
      }
    }
    return [...reachable].filter((did) => {
      const dd = G.districts[did];
      if (dd.precinct) return false;
      const rivalCrew = dd.controller && dd.controller !== c.attacker ? dd.mobsters[dd.controller] : null;
      if (rivalCrew && rivalCrew.bosses + rivalCrew.runners > 0) return false;
      return true;
    });
  })();

  // Connected safe districts the defender could Fold into (safe = no rival
  // mobsters at the destination, not a Precinct). Mirrors fold() validation.
  const foldOptions = (() => {
    if (c.defender === null) return [] as string[];
    const fd = d;
    const reachable = new Set(fd.connections);
    if (fd.tags.includes("dock")) {
      for (const did of Object.keys(G.districts)) {
        if (DISTRICT_BY_ID[did]?.tags.includes("dock")) reachable.add(did);
      }
    }
    return [...reachable].filter((did) => {
      const dd = G.districts[did];
      if (dd.precinct) return false;
      const blocker = dd.controller && dd.controller !== c.defender ? dd.mobsters[dd.controller] : null;
      if (blocker && blocker.bosses + blocker.runners > 0) return false;
      return true;
    });
  })();

  return (
    <div className="combat-controls">
      <div className="sub-phase-label combat">{c.vsPolice ? "🚓" : "⚔"} {c.vsPolice ? "Police Pin" : "Combat"}: {d.name} ({c.stage})</div>
      <div className="combat-status">
        <div>
          <b>Attacker {seatLabel(c.attacker)}:</b> {c.pinned.bosses}B/{c.pinned.runners}R · {atkDice}d · Threat {atkThreat} (hit {killThreshold(atkThreat)}+)
        </div>
        {c.defender !== null ? (
          <div>
            <b>Defender {seatLabel(c.defender)}:</b> {defCrew.bosses}B/{defCrew.runners}R · {defDice}d · Threat {defThreatBase}–{Math.min(4, defThreatBase + 1)} (Ambush bonus +1)
          </div>
        ) : (
          <div><b>Defender:</b> Police (no defense roll — every failed Storm die kills a mobster).</div>
        )}
        <div className="origin-hint">From: {origin.name}</div>
      </div>

      {c.stage === "ambush" && isDefender && (
        <div className="action-form">
          <p className="hint">{seatLabel(c.attacker)} entered your turf at {d.name}. Ambush, Hold Fire, or Fold?</p>
          {c.defender !== null && G.players[c.defender].family === "irish" && (() => {
            const defBarrelsAt = dsState.barrels[c.defender] ?? { moonshine: 0, gin: 0, whisky: 0, rum: 0 };
            const types = (["moonshine", "gin", "whisky", "rum"] as const).filter((t) => (defBarrelsAt[t] ?? 0) > 0);
            const armed = (c.defenderThreatBonus ?? 0) > 0;
            return (
              <div className="row" style={{ marginBottom: 6 }}>
                <span style={{ marginRight: 6, opacity: 0.8 }}>Courage:</span>
                {types.length === 0 ? (
                  <button disabled title="No barrels at this District">Courage (0)</button>
                ) : (
                  types.map((t) => (
                    <button
                      key={t}
                      onClick={() => moves.courage(t)}
                      disabled={armed}
                      title="Discard 1 barrel here for +1 Threat on your Ambush roll (once per combat)"
                    >
                      −1 {t}
                    </button>
                  ))
                )}
                {armed && <span className="hint" style={{ marginLeft: 6 }}>+1 Threat armed</span>}
              </div>
            );
          })()}
          <div className="row">
            <button onClick={() => moves.ambushChoice(true)}>Ambush (free shot, +1 Threat)</button>
            <button onClick={() => moves.ambushChoice(false)}>Hold Fire</button>
          </div>
          <div className="row" style={{ marginTop: 6 }}>
            <select value={foldDest} onChange={(e) => setFoldDest(e.target.value)}>
              <option value="">Fold to…</option>
              {foldOptions.map((did) => (
                <option key={did} value={did}>
                  {DISTRICT_BY_ID[did].name}
                  {G.districts[did].controller === c.defender ? " (own)" : ""}
                </option>
              ))}
            </select>
            <button
              onClick={() => { if (foldDest) { moves.fold(foldDest); setFoldDest(""); } }}
              disabled={!foldDest}
              title="Surrender the room. Crew flees; you drop carried liquor; Safehouse is destroyed; attacker takes control (no Pin)."
            >
              Fold (0) — surrender turf
            </button>
          </div>
          {foldOptions.length === 0 && (
            <p className="hint" style={{ opacity: 0.7 }}>No safe district to Fold to.</p>
          )}
        </div>
      )}
      {c.stage === "ambush" && !isDefender && (
        <div className="dim">Waiting for {seatLabel(c.defender)} to choose Ambush / Hold Fire / Fold.</div>
      )}

      {c.stage === "pinned" && isAttacker && (
        <div className="action-form">
          <div className="row">
            {!c.vsPolice && (
              <button onClick={() => moves.assault()} disabled={G.players[c.attacker].operations < 1}>
                Assault (1) — both sides roll
              </button>
            )}
            {c.vsPolice && (
              <button onClick={() => moves.stormPrecinct()} disabled={G.players[c.attacker].operations < 1}>
                Storm the Precinct (1) — need 2+ hits
              </button>
            )}
            <button onClick={() => moves.fallBack()}>Fall Back (free)</button>
          </div>
          <div className="advance-form">
            <label>
              Advance to:{" "}
              <select value={advanceDest} onChange={(e) => setAdvanceDest(e.target.value)}>
                <option value="">— pick destination —</option>
                {advanceOptions.map((did) => (
                  <option key={did} value={did}>{DISTRICT_BY_ID[did].name}</option>
                ))}
              </select>
            </label>
            <button
              disabled={!advanceDest || G.players[c.attacker].operations < 1}
              onClick={() => { moves.advance(advanceDest); setAdvanceDest(""); }}
            >
              Advance (1)
            </button>
          </div>
          <p className="hint">
            {c.vsPolice
              ? "You're Pinned at a Precinct. Storm to break the line (all-or-nothing), Advance to a safe district, or Fall Back."
              : "You're Pinned. Spend Influence to push the attack, escape to a safe spot, or Fall Back for free (carried liquor stays for the defender)."}
          </p>
        </div>
      )}
      {c.stage === "pinned" && !isAttacker && (
        <div className="dim">Waiting for {seatLabel(c.attacker)} to choose Assault / Advance / Fall Back.</div>
      )}

      {c.stage === "pinned" && isAttacker && (
        <SignatureCombatPlays G={G} moves={moves} />
      )}

      {c.pendingPlunder && isAttacker && (
        <PlunderPicker G={G} combat={c} onPick={(picks) => moves.pickPlunder(picks)} />
      )}
      {c.pendingPlunder && !isAttacker && (
        <div className="dim">Waiting for {seatLabel(c.attacker)} to choose Plunder barrels.</div>
      )}
    </div>
  );
}

function PlunderPicker({
  G,
  combat,
  onPick,
}: {
  G: GameState;
  combat: NonNullable<GameState["operations"]["combat"]>;
  onPick: (picks: { type: LiquorType; count: number }[]) => void;
}) {
  const ds = G.districts[combat.districtId];
  const defBarrels = combat.defender !== null
    ? ds.barrels[combat.defender] ?? { moonshine: 0, gin: 0, whisky: 0, rum: 0 }
    : { moonshine: 0, gin: 0, whisky: 0, rum: 0 };
  const [picks, setPicks] = useState<Record<LiquorType, number>>({ moonshine: 0, gin: 0, whisky: 0, rum: 0 });
  const total = LIQUOR_TYPES_ALL.reduce((s, t) => s + picks[t], 0);
  const max = combat.pendingPlunder?.hits ?? 0;
  return (
    <div className="action-form">
      <div className="hint">Plunder pick: take up to {max} barrel{max === 1 ? "" : "s"} from defender's stock at this District.</div>
      <div className="barrel-row">
        {LIQUOR_TYPES_ALL.map((l) => (
          <label key={l} className={"barrel-input " + l}>
            {l[0].toUpperCase()}:
            <input
              type="number"
              min={0}
              max={defBarrels[l]}
              value={picks[l]}
              onChange={(e) => {
                const v = Math.max(0, Math.min(+e.target.value, defBarrels[l]));
                const others = LIQUOR_TYPES_ALL.reduce((s, k) => k === l ? s : s + picks[k], 0);
                if (others + v > max) return;
                setPicks({ ...picks, [l]: v });
              }}
            />
            <span className="avail">/{defBarrels[l]}</span>
          </label>
        ))}
      </div>
      <div className="hint">Total: {total} / {max}</div>
      <div className="row">
        <button onClick={() => onPick(LIQUOR_TYPES_ALL.map((t) => ({ type: t, count: picks[t] })).filter((p) => p.count > 0))}>
          Confirm Plunder
        </button>
      </div>
    </div>
  );
}

function SignatureCombatPlays({
  G,
  moves,
}: {
  G: GameState;
  moves: Props["moves"];
}) {
  const c = G.operations.combat;
  if (!c) return null;
  const p = G.players[c.attacker];
  if (p.family === "irish") {
    // Attacker possesses only what they carried in (+ Plundered barrels,
    // which Plunder transfers into combat.carried). District piles belong
    // to the defender, not the invader.
    const courageTypes = (["moonshine", "gin", "whisky", "rum"] as const)
      .filter((t) => (c.carried[t] ?? 0) > 0);
    return (
      <div className="action-group">
        <div className="ops-section-title">Irish Signature</div>
        <div className="action-buttons">
          {courageTypes.length === 0 ? (
            <button disabled title="No carried barrels to discard (attacker possesses only what they brought in or Plundered)">Courage (0)</button>
          ) : (
            courageTypes.map((t) => (
              <button
                key={t}
                onClick={() => moves.courage(t)}
                disabled={(c.attackerThreatBonus ?? 0) > 0}
                title="Discard 1 carried barrel for +1 Threat on next Assault (once per combat)"
              >
                Courage: −1 {t}
              </button>
            ))
          )}
          <button onClick={() => moves.plunder()} disabled={p.operations < 1 || c.vsPolice}>
            Plunder (1)
          </button>
        </div>
        {c.attackerThreatBonus ? <div className="hint">Courage active: +{c.attackerThreatBonus} Threat on next roll</div> : null}
        {c.plunderMode ? <div className="hint">Plunder armed: next Assault steals barrels instead of killing</div> : null}
      </div>
    );
  }
  if (p.family === "vipers") {
    return (
      <div className="action-group">
        <div className="ops-section-title">Vipers Signature</div>
        <div className="action-buttons">
          <button
            onClick={() => moves.firepower()}
            disabled={p.cash < 200 || (c.attackerExtraDice ?? 0) > 0}
          >
            Firepower +1d (−$200)
          </button>
        </div>
        {c.attackerExtraDice ? <div className="hint">+1 die on next Assault</div> : null}
      </div>
    );
  }
  if (p.family === "knights") {
    return (
      <div className="action-group">
        <div className="ops-section-title">Knights Signature</div>
        <div className="action-buttons">
          <button onClick={() => moves.torch()} disabled={p.operations < 2 || c.vsPolice || c.pinned.runners <= 0}>
            Torch (2 + 1 Runner sacrificed) 🔥
          </button>
        </div>
      </div>
    );
  }
  return null;
}
