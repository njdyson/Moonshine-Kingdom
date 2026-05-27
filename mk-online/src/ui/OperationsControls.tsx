import { useState } from "react";
import { seatLabel } from "./display";
import type { GameState, LiquorType, BoroughId, ContractCard } from "../game/types";
import { DISTRICT_BY_ID, BOROUGHS } from "../game/data";

interface Props {
  G: GameState;
  playerID: string | null;
  selectedDistrict: string | null;
  moves: {
    layLow: () => void;
    hustle: (picks: Array<"gig" | "racket" | "score">) => void;
    movePlay: (fromId: string, toId: string, bosses: number, runners: number, barrels?: { type: LiquorType; count: number }[]) => void;
    recruit: (districtId: string, count: number) => void;
    secure: (districtId: string) => void;
    unload: (districtId: string, sales: { type: LiquorType; count: number }[]) => void;
    push: (fromId: string, toId: string, barrels: { type: LiquorType; count: number }[]) => void;
    smuggle: (districtId: string, crewSize: number) => void;
    extort: (boroughId: BoroughId) => void;
    fix: (liquor: LiquorType, newPrice: number) => void;
    bribe: (districtId: string) => void;
    rise: (districtId: string) => void;
    rat: () => void;
    // Signature plays (out-of-combat):
    capo: (districtId: string) => void;
    consigliere: (heatIdx: number) => void;
    stealth: (fromId: string, toId: string, bosses: number, runners: number) => void;
    skiff: (fromId: string, toId: string, bosses: number, runners: number, barrels?: { type: LiquorType; count: number }[]) => void;
  };
  onCardClick?: (card: ContractCard) => void;
}

type ActionMode = "none" | "move" | "recruit" | "hustle" | "unload" | "push" | "smuggle" | "extort" | "fix" | "stealth" | "skiff";

const LIQUOR_TYPES: LiquorType[] = ["moonshine", "gin", "whisky", "rum"];

export function OperationsControls({ G, playerID, selectedDistrict, moves, onCardClick }: Props) {
  const [mode, setMode] = useState<ActionMode>("none");
  const [moveFrom, setMoveFrom] = useState<string | null>(null);
  const [moveBosses, setMoveBosses] = useState(0);
  const [moveRunners, setMoveRunners] = useState(1);
  const [moveBarrels, setMoveBarrels] = useState<Record<LiquorType, number>>({ moonshine: 0, gin: 0, whisky: 0, rum: 0 });
  const [recruitCount, setRecruitCount] = useState(1);
  const [unloadSales, setUnloadSales] = useState<Record<LiquorType, number>>({ moonshine: 0, gin: 0, whisky: 0, rum: 0 });
  const [pushFrom, setPushFrom] = useState<string | null>(null);
  const [pushBarrels, setPushBarrels] = useState<Record<LiquorType, number>>({ moonshine: 0, gin: 0, whisky: 0, rum: 0 });
  const [smuggleCrew, setSmuggleCrew] = useState(1);
  const [fixLiquor, setFixLiquor] = useState<LiquorType>("moonshine");
  const [fixPrice, setFixPrice] = useState(200);

  const current = G.operations.currentPlayer;
  const isMyTurn = current === playerID;
  const me = playerID ? G.players[playerID] : null;
  const sel = selectedDistrict ? DISTRICT_BY_ID[selectedDistrict] : null;
  const selState = selectedDistrict ? G.districts[selectedDistrict] : null;
  const myCrew = me && selState ? selState.mobsters[playerID!] : null;
  const myBarrelsHere = me && selState ? selState.barrels[playerID!] : null;

  function resetForms() {
    setMode("none");
    setMoveFrom(null); setMoveBosses(0); setMoveRunners(1);
    setMoveBarrels({ moonshine: 0, gin: 0, whisky: 0, rum: 0 });
    setRecruitCount(1);
    setUnloadSales({ moonshine: 0, gin: 0, whisky: 0, rum: 0 });
    setPushFrom(null);
    setPushBarrels({ moonshine: 0, gin: 0, whisky: 0, rum: 0 });
    setSmuggleCrew(1);
  }

  function barrelsList(rec: Record<LiquorType, number>): { type: LiquorType; count: number }[] {
    return LIQUOR_TYPES.map((t) => ({ type: t, count: rec[t] })).filter((b) => b.count > 0);
  }

  const myDeeds = BOROUGHS.filter((b) => G.titles[b.id] === playerID).map((b) => b.id);
  const mySyndicates = LIQUOR_TYPES.filter((l) => G.titles[(l + "Syndicate") as "ginSyndicate" | "whiskySyndicate" | "moonshineSyndicate" | "rumSyndicate"] === playerID);

  return (
    <div className="ops-controls">
      <div className="sub-phase-label">
        Operations · Turn: {current !== null ? `${seatLabel(current)}` : "—"}
        {G.operations.laidLowOrder.length > 0 && (
          <span> · Laid low: {G.operations.laidLowOrder.map((id) => `${seatLabel(id)}`).join(", ")}</span>
        )}
      </div>

      {!isMyTurn && current !== null && (
        <div className="dim">Waiting for {seatLabel(current)}'s Play. Switch to their seat to act.</div>
      )}

      {isMyTurn && me && (
        <>
          <div className="ops-stat">
            Ops: <b>{me.operations}</b> · Stash: <b>{me.stash}</b> · Hand: <b>{me.hand.length}</b>
          </div>

          {mode === "none" && (
            <>
              <div className="action-group">
                <div className="ops-section-title">Standard Plays (1)</div>
                <div className="action-buttons">
                  <button onClick={() => setMode("move")} disabled={me.operations < 1}>Move</button>
                  <button onClick={() => setMode("push")} disabled={me.operations < 1}>Push</button>
                  <button onClick={() => setMode("recruit")} disabled={me.operations < 1}>Recruit</button>
                  <button onClick={() => setMode("hustle")} disabled={me.operations < 1 || me.hustledThisDay}>
                    Hustle{me.hustledThisDay ? " ✓" : ""}
                  </button>
                  <button onClick={() => setMode("smuggle")} disabled={me.operations < 1}>Smuggle</button>
                  <button onClick={() => selectedDistrict && moves.secure(selectedDistrict)} disabled={me.operations < 1 || !selectedDistrict || me.cash < 500 || selState?.controller !== playerID}>
                    Secure ($500)
                  </button>
                </div>
              </div>

              {(myDeeds.length > 0 || mySyndicates.length > 0) && (
                <div className="action-group">
                  <div className="ops-section-title">Title Plays (1)</div>
                  <div className="action-buttons">
                    {myDeeds.map((bid) => (
                      <button
                        key={bid}
                        onClick={() => moves.extort(bid)}
                        disabled={me.operations < 1 || me.extortedThisDay.includes(bid)}
                      >
                        Extort {bid}{me.extortedThisDay.includes(bid) ? " ✓" : ""}
                      </button>
                    ))}
                    {mySyndicates.length > 0 && (
                      <button onClick={() => setMode("fix")} disabled={me.operations < 1}>Fix Price</button>
                    )}
                  </div>
                </div>
              )}

              <div className="action-group">
                <div className="ops-section-title">Power Plays (2)</div>
                <div className="action-buttons">
                  <button onClick={() => setMode("unload")} disabled={me.operations < 2 || !selectedDistrict || selState?.controller !== playerID || !sel?.tags.includes("speakeasy")}>
                    Unload
                  </button>
                  <button onClick={() => selectedDistrict && moves.bribe(selectedDistrict)} disabled={me.operations < 2 || me.cash < 2500 || !sel?.broker || selState?.controller !== playerID || me.favors.includes(sel.broker)}>
                    Bribe
                  </button>
                  <button onClick={() => selectedDistrict && moves.rise(selectedDistrict)} disabled={me.operations < 2 || !me.bossDown || !selectedDistrict || (selState!.controller !== playerID && selState!.controller !== null)}>
                    Rise
                  </button>
                  <button onClick={() => moves.rat()} disabled={me.operations < 2 || G.heat.length === 0}>
                    Rat 🐀
                  </button>
                </div>
              </div>

              <SignaturePlays
                G={G}
                playerID={playerID}
                selectedDistrict={selectedDistrict}
                me={me}
                setMode={setMode}
                moves={moves}
              />

              <div className="action-buttons">
                <button className="lay-low" onClick={() => moves.layLow()}>Lay Low</button>
              </div>
            </>
          )}

          {mode === "move" && (
            <div className="action-form">
              <div className="hint">Pick origin on the map, then destination.</div>
              <div>
                From: <b>{moveFrom ? DISTRICT_BY_ID[moveFrom].name : "—"}</b>
                {!moveFrom && selectedDistrict && selState?.controller === playerID && (
                  <button onClick={() => setMoveFrom(selectedDistrict)}>Use {sel?.name}</button>
                )}
              </div>
              <div>To: <b>{moveFrom && selectedDistrict !== moveFrom ? sel?.name ?? "—" : "—"}</b></div>
              {moveFrom && (
                <>
                  <div className="move-crew">
                    <label>Bosses: <input type="number" min={0} max={G.districts[moveFrom].mobsters[playerID!]?.bosses ?? 0} value={moveBosses} onChange={(e) => setMoveBosses(+e.target.value)} /></label>
                    <label>Runners: <input type="number" min={0} max={G.districts[moveFrom].mobsters[playerID!]?.runners ?? 0} value={moveRunners} onChange={(e) => setMoveRunners(+e.target.value)} /></label>
                  </div>
                  <BarrelInputs available={G.districts[moveFrom].barrels[playerID!] ?? { moonshine: 0, gin: 0, whisky: 0, rum: 0 }} value={moveBarrels} onChange={setMoveBarrels} maxTotal={moveBosses + moveRunners} label="Carry barrels (max 1/mobster)" />
                </>
              )}
              <div className="row">
                <button disabled={!moveFrom || !selectedDistrict || moveFrom === selectedDistrict || (moveBosses + moveRunners < 1)} onClick={() => { moves.movePlay(moveFrom!, selectedDistrict!, moveBosses, moveRunners, barrelsList(moveBarrels)); resetForms(); }}>
                  Confirm Move
                </button>
                <button onClick={resetForms}>Cancel</button>
              </div>
            </div>
          )}

          {mode === "recruit" && (
            <div className="action-form">
              {!selectedDistrict || !selState?.safehouses[playerID!] ? (
                <div className="dim">Select a District with one of your Safehouses.</div>
              ) : (
                <>
                  <div>At: <b>{sel?.name}</b></div>
                  <label>Count: <input type="number" min={1} max={Math.min(me.runnersInSupply, 5)} value={recruitCount} onChange={(e) => setRecruitCount(+e.target.value)} /></label>
                  <div className="hint">Cost: ${(G.titles.wardBoss === playerID ? 200 : 300) * recruitCount} (+1 Influence)</div>
                </>
              )}
              <div className="row">
                <button disabled={!selectedDistrict || !selState?.safehouses[playerID!]} onClick={() => { moves.recruit(selectedDistrict!, recruitCount); resetForms(); }}>
                  Confirm Recruit
                </button>
                <button onClick={resetForms}>Cancel</button>
              </div>
            </div>
          )}

          {mode === "hustle" && me && (
            <HustleForm
              G={G}
              drawCount={me.favors.includes("guinan") ? 3 : 2}
              onConfirm={(picks) => { moves.hustle(picks); resetForms(); }}
              onCancel={resetForms}
            />
          )}

          {mode === "unload" && (
            <div className="action-form">
              {!selectedDistrict || selState?.controller !== playerID || !sel?.tags.includes("speakeasy") ? (
                <div className="dim">Select a Speakeasy you Control.</div>
              ) : (
                <>
                  <div>At: <b>{sel?.name}</b> · House pour: {sel.housePour ?? "—"}</div>
                  <div className="hint">
                    Prices: {LIQUOR_TYPES.map((l) => `${l[0].toUpperCase()}${l.slice(1)}: $${G.market[l]}`).join(" · ")}
                  </div>
                  <BarrelInputs available={myBarrelsHere ?? { moonshine: 0, gin: 0, whisky: 0, rum: 0 }} value={unloadSales} onChange={setUnloadSales} label="Sell" />
                  <div className="hint">
                    Total: ${LIQUOR_TYPES.reduce((s, l) => s + unloadSales[l] * G.market[l], 0)}
                    {Object.values(unloadSales).reduce((a, b) => a + b, 0) >= 4 && !me.favors.includes("stClair") && <span> · 🔥 Greed Tax (4+ barrels)</span>}
                    {sel.housePour && unloadSales[sel.housePour] > 0 && <span> · +{unloadSales[sel.housePour]} Kickback</span>}
                  </div>
                </>
              )}
              <div className="row">
                <button disabled={!selectedDistrict || selState?.controller !== playerID || !sel?.tags.includes("speakeasy")} onClick={() => { moves.unload(selectedDistrict!, barrelsList(unloadSales)); resetForms(); }}>
                  Confirm Unload (2)
                </button>
                <button onClick={resetForms}>Cancel</button>
              </div>
            </div>
          )}

          {mode === "push" && (
            <div className="action-form">
              <div className="hint">Pick origin, then destination on the map.</div>
              <div>
                From: <b>{pushFrom ? DISTRICT_BY_ID[pushFrom].name : "—"}</b>
                {!pushFrom && selectedDistrict && selState?.controller === playerID && (
                  <button onClick={() => setPushFrom(selectedDistrict)}>Use {sel?.name}</button>
                )}
              </div>
              <div>To: <b>{pushFrom && selectedDistrict !== pushFrom ? sel?.name ?? "—" : "—"}</b></div>
              {pushFrom && (
                <BarrelInputs available={G.districts[pushFrom].barrels[playerID!] ?? { moonshine: 0, gin: 0, whisky: 0, rum: 0 }} value={pushBarrels} onChange={setPushBarrels} label="Barrels to push" />
              )}
              <div className="row">
                <button disabled={!pushFrom || !selectedDistrict || pushFrom === selectedDistrict || Object.values(pushBarrels).every((v) => v === 0)} onClick={() => { moves.push(pushFrom!, selectedDistrict!, barrelsList(pushBarrels)); resetForms(); }}>
                  Confirm Push (1)
                </button>
                <button onClick={resetForms}>Cancel</button>
              </div>
            </div>
          )}

          {mode === "smuggle" && (
            <div className="action-form">
              {!selectedDistrict || !sel?.tags.includes("dock") || selState?.controller !== playerID ? (
                <div className="dim">Select a Dock you Control.</div>
              ) : (
                <>
                  <div>At: <b>{sel?.name}</b></div>
                  <label>Crew: <input type="number" min={1} max={Math.min(5, (myCrew?.bosses ?? 0) + (myCrew?.runners ?? 0))} value={smuggleCrew} onChange={(e) => setSmuggleCrew(+e.target.value)} /></label>
                  <div className="hint">
                    Failed dice = arrests (runners first). Network of {DISTRICT_BY_ID && Object.keys(G.districts).filter((id) => DISTRICT_BY_ID[id]?.tags.includes("dock") && G.districts[id].controller === playerID).length} Docks.
                  </div>
                </>
              )}
              <div className="row">
                <button disabled={!selectedDistrict || !sel?.tags.includes("dock") || selState?.controller !== playerID} onClick={() => { moves.smuggle(selectedDistrict!, smuggleCrew); resetForms(); }}>
                  Confirm Smuggle (1)
                </button>
                <button onClick={resetForms}>Cancel</button>
              </div>
            </div>
          )}

          {mode === "stealth" && (
            <div className="action-form">
              <div className="hint">Stealth: pick a District you control, then the rival district to slip into. No Ambush — but you must immediately Assault or Advance from the combat panel.</div>
              <StealthOrSkiff
                G={G}
                playerID={playerID!}
                selectedDistrict={selectedDistrict}
                allowBarrels={false}
                requireDocks={false}
                requireRival={true}
                onConfirm={(from, to, b, r) => { moves.stealth(from, to, b, r); resetForms(); }}
                onCancel={resetForms}
              />
            </div>
          )}

          {mode === "skiff" && (
            <div className="action-form">
              <div className="hint">Skiff: Dock → Dock, ignoring connections. Liquor allowed. Ambush applies if landing on rival turf.</div>
              <StealthOrSkiff
                G={G}
                playerID={playerID!}
                selectedDistrict={selectedDistrict}
                allowBarrels={true}
                requireDocks={true}
                requireRival={false}
                onConfirm={(from, to, b, r, barrels) => { moves.skiff(from, to, b, r, barrels); resetForms(); }}
                onCancel={resetForms}
              />
            </div>
          )}

          {mode === "fix" && (
            <div className="action-form">
              <label>Liquor:
                <select value={fixLiquor} onChange={(e) => setFixLiquor(e.target.value as LiquorType)}>
                  {mySyndicates.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </label>
              <label>New price: <input type="number" min={200} max={500} step={100} value={fixPrice} onChange={(e) => setFixPrice(+e.target.value)} /></label>
              <div className="row">
                <button onClick={() => { moves.fix(fixLiquor, fixPrice); resetForms(); }}>Confirm Fix (1)</button>
                <button onClick={resetForms}>Cancel</button>
              </div>
            </div>
          )}

          {sel && selState && (
            <div className="ops-sel-summary">
              Selected: <b>{sel.name}</b>
              {selState.controller !== null && <span> · {seatLabel(selState.controller)}</span>}
              {myCrew && <span> · You: {myCrew.bosses}B/{myCrew.runners}R</span>}
              {myBarrelsHere && (myBarrelsHere.moonshine + myBarrelsHere.gin + myBarrelsHere.whisky + myBarrelsHere.rum > 0) && (
                <span> · 🍺 {LIQUOR_TYPES.filter((l) => myBarrelsHere[l] > 0).map((l) => `${myBarrelsHere[l]}${l[0]}`).join(" ")}</span>
              )}
            </div>
          )}
        </>
      )}

      {me?.hand && me.hand.length > 0 && (
        <details className="hand-summary">
          <summary>Your Hand ({me.hand.length})</summary>
          <ul>
            {me.hand.map((c) => (
              <li
                key={c.id}
                className={"hand-card" + (onCardClick ? " hand-card-clickable" : "")}
                onClick={() => onCardClick?.(c)}
                title={onCardClick ? "Click to view card" : undefined}
              >
                <b>{c.name}</b> [{c.tier} · {c.respect}R · {c.deadline}d · ${c.take}]
                <div className="objective">{c.objective}</div>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

type DeckTier = "gig" | "racket" | "score";

const TIER_LABEL: Record<DeckTier, string> = { gig: "Gig", racket: "Racket", score: "Score" };
const TIER_HINT: Record<DeckTier, string> = { gig: "1R · $500 · 1 day", racket: "3R · $1,500 · 2 days", score: "5R · $3,000 · 3 days" };

function HustleForm({
  G,
  drawCount,
  onConfirm,
  onCancel,
}: {
  G: GameState;
  drawCount: number;
  onConfirm: (picks: DeckTier[]) => void;
  onCancel: () => void;
}) {
  const [picks, setPicks] = useState<DeckTier[]>([]);
  const tiers: DeckTier[] = ["gig", "racket", "score"];

  function deckSize(t: DeckTier) {
    return G.decks[t].length + G.decks[`${t}Discard` as const].length;
  }

  function addPick(t: DeckTier) {
    if (picks.length < drawCount) setPicks([...picks, t]);
  }

  function removePick(idx: number) {
    setPicks(picks.filter((_, i) => i !== idx));
  }

  const ready = picks.length === drawCount;

  return (
    <div className="action-form">
      <div className="hint">Pick {drawCount} deck{drawCount !== 1 ? "s" : ""} to draw from (can pick the same deck twice):</div>
      <div className="hustle-deck-row">
        {tiers.map((t) => (
          <button
            key={t}
            className="hustle-deck-btn"
            disabled={picks.length >= drawCount || deckSize(t) === 0}
            onClick={() => addPick(t)}
            title={TIER_HINT[t]}
          >
            {TIER_LABEL[t]}
            <span className="hustle-deck-count">{deckSize(t)} cards</span>
          </button>
        ))}
      </div>
      <div className="hustle-picks">
        {picks.map((p, i) => (
          <span key={i} className="hustle-pick-chip" onClick={() => removePick(i)} title="Click to remove">
            {TIER_LABEL[p]} ✕
          </span>
        ))}
        {Array.from({ length: drawCount - picks.length }, (_, i) => (
          <span key={i} className="hustle-pick-chip empty">draw {picks.length + i + 1}</span>
        ))}
      </div>
      <div className="row">
        <button disabled={!ready} onClick={() => onConfirm(picks)}>Confirm Hustle (1)</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

function StealthOrSkiff({
  G,
  playerID,
  selectedDistrict,
  allowBarrels,
  requireDocks,
  requireRival,
  onConfirm,
  onCancel,
}: {
  G: GameState;
  playerID: string;
  selectedDistrict: string | null;
  allowBarrels: boolean;
  requireDocks: boolean;
  requireRival: boolean;
  onConfirm: (from: string, to: string, bosses: number, runners: number, barrels?: { type: LiquorType; count: number }[]) => void;
  onCancel: () => void;
}) {
  const [from, setFrom] = useState<string | null>(null);
  const [bosses, setBosses] = useState(0);
  const [runners, setRunners] = useState(1);
  const [barrels, setBarrels] = useState<Record<LiquorType, number>>({ moonshine: 0, gin: 0, whisky: 0, rum: 0 });
  const sel = selectedDistrict ? DISTRICT_BY_ID[selectedDistrict] : null;
  return (
    <>
      <div>
        From: <b>{from ? DISTRICT_BY_ID[from].name : "—"}</b>
        {!from && selectedDistrict && G.districts[selectedDistrict]?.controller === playerID && (!requireDocks || sel?.tags.includes("dock")) && (
          <button onClick={() => setFrom(selectedDistrict)}>Use {sel?.name}</button>
        )}
      </div>
      <div>To: <b>{from && selectedDistrict !== from ? sel?.name ?? "—" : "—"}</b></div>
      {from && (
        <>
          <div className="move-crew">
            <label>Bosses: <input type="number" min={0} max={G.districts[from].mobsters[playerID]?.bosses ?? 0} value={bosses} onChange={(e) => setBosses(+e.target.value)} /></label>
            <label>Runners: <input type="number" min={0} max={G.districts[from].mobsters[playerID]?.runners ?? 0} value={runners} onChange={(e) => setRunners(+e.target.value)} /></label>
          </div>
          {allowBarrels && (
            <BarrelInputs available={G.districts[from].barrels[playerID] ?? { moonshine: 0, gin: 0, whisky: 0, rum: 0 }} value={barrels} onChange={setBarrels} maxTotal={bosses + runners} label="Carry barrels (max 1/mobster)" />
          )}
        </>
      )}
      {(() => {
        // Stealth signature requires landing on rival-controlled turf. Skiff
        // doesn't (it's a dock-to-dock travel play). We compute the rival-turf
        // gate here so the Confirm button reflects the same rule the engine
        // will enforce.
        const destState = selectedDistrict ? G.districts[selectedDistrict] : null;
        const destIsRival = !!destState && destState.controller !== null && destState.controller !== playerID;
        const destFailsRivalGate = requireRival && !destIsRival;
        return (
          <div className="row">
            <button
              disabled={
                !from ||
                !selectedDistrict ||
                from === selectedDistrict ||
                (bosses + runners) === 0 ||
                (bosses + runners) > 5 ||
                destFailsRivalGate
              }
              title={destFailsRivalGate ? "Stealth requires landing on rival turf." : undefined}
              onClick={() => {
                const barrelList = allowBarrels
                  ? (["moonshine", "gin", "whisky", "rum"] as LiquorType[]).map((t) => ({ type: t, count: barrels[t] })).filter((b) => b.count > 0)
                  : undefined;
                onConfirm(from!, selectedDistrict!, bosses, runners, barrelList);
              }}
            >
              Confirm
            </button>
            <button onClick={onCancel}>Cancel</button>
          </div>
        );
      })()}
    </>
  );
}

function SignaturePlays({
  G,
  playerID,
  selectedDistrict,
  me,
  setMode,
  moves,
}: {
  G: GameState;
  playerID: string | null;
  selectedDistrict: string | null;
  me: GameState["players"][string];
  setMode: (m: ActionMode) => void;
  moves: Props["moves"];
}) {
  const sel = selectedDistrict ? G.districts[selectedDistrict] : null;
  const myCrew = me && sel && playerID ? sel.mobsters[playerID] : null;
  const heat = G.heat.map((h, i) => ({ idx: i, owner: h.owner }));

  switch (me.family) {
    case "sicilian":
      return (
        <div className="action-group">
          <div className="ops-section-title">Sicilian Signature</div>
          <div className="action-buttons">
            <button
              onClick={() => selectedDistrict && moves.capo(selectedDistrict)}
              disabled={me.operations < 2 || !selectedDistrict || (myCrew?.runners ?? 0) <= 0 || me.bossesInSupply <= 0}
              title="Promote a Runner in selected district to Capo (Boss)."
            >
              Capo (2)
            </button>
            <div className="consigliere-bar">
              {heat.length === 0 ? (
                <button disabled>Consigliere (1)</button>
              ) : (
                heat.map((h) => (
                  <button
                    key={h.idx}
                    onClick={() => moves.consigliere(h.idx)}
                    disabled={me.operations < 1}
                    title={`Remove this Heat marker (${seatLabel(h.owner)})`}
                  >
                    Consigliere(1)→{seatLabel(h.owner)}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      );
    case "irish":
      return (
        <div className="action-group">
          <div className="ops-section-title">Irish Signature</div>
          <div className="hint">Courage and Plunder are used during combat.</div>
        </div>
      );
    case "vipers":
      return (
        <div className="action-group">
          <div className="ops-section-title">Vipers Signature</div>
          <div className="action-buttons">
            <button onClick={() => setMode("stealth")} disabled={me.operations < 1}>Stealth (1)</button>
            <span className="hint">Firepower is used during combat.</span>
          </div>
        </div>
      );
    case "knights":
      return (
        <div className="action-group">
          <div className="ops-section-title">Knights Signature</div>
          <div className="action-buttons">
            <button onClick={() => setMode("skiff")} disabled={me.operations < 1}>Skiff (1)</button>
            <span className="hint">Torch is used during combat.</span>
          </div>
        </div>
      );
    default:
      return null;
  }
}

function BarrelInputs({
  available,
  value,
  onChange,
  maxTotal,
  label,
}: {
  available: Record<LiquorType, number>;
  value: Record<LiquorType, number>;
  onChange: (v: Record<LiquorType, number>) => void;
  maxTotal?: number;
  label?: string;
}) {
  const total = LIQUOR_TYPES.reduce((s, l) => s + value[l], 0);
  return (
    <div className="barrel-inputs">
      {label && <div className="hint">{label}</div>}
      <div className="barrel-row">
        {LIQUOR_TYPES.map((l) => (
          <label key={l} className={"barrel-input " + l}>
            {l[0].toUpperCase()}: <input type="number" min={0} max={available[l]} value={value[l]} onChange={(e) => {
              const v = Math.max(0, Math.min(+e.target.value, available[l]));
              const others = LIQUOR_TYPES.reduce((s, k) => k === l ? s : s + value[k], 0);
              if (maxTotal !== undefined && others + v > maxTotal) return;
              onChange({ ...value, [l]: v });
            }} />
            <span className="avail">/{available[l]}</span>
          </label>
        ))}
      </div>
      <div className="hint">Total: {total}{maxTotal !== undefined ? ` / ${maxTotal}` : ""}</div>
    </div>
  );
}
