import { useState, useRef, useEffect } from "react";
import { seatLabel } from "./display";
import { DISTRICTS } from "../game/data";
import type { GameState, LiquorType } from "../game/types";
import { STILL_COLOR, LIQUOR_COLOR } from "./colors";

interface BoardMapProps {
  G: GameState;
  selectedDistrict: string | null;
  onSelect: (id: string | null) => void;
  /** Optional player color map (P0..P3 → hex). */
  playerColors?: Record<string, string>;
  calibrate: boolean;
  calibratingId: string | null;
  onArm: (id: string | null) => void;
  onPlace: (id: string, x: number, y: number) => void;
  onHoverCoord: (c: { x: number; y: number } | null) => void;
}

const LIQUOR_TYPES: LiquorType[] = ["moonshine", "gin", "whisky", "rum"];

const TAG_GLYPH: Record<string, string> = {
  ghetto: "✊",
  dock: "⚓",
  speakeasy: "🍸",
  highSociety: "♛",
};

function clamp(x: number, y: number, z: number, r: DOMRect) {
  return {
    x: Math.min(0, Math.max(r.width * (1 - z), x)),
    y: Math.min(0, Math.max(r.height * (1 - z), y)),
  };
}

export function BoardMap({
  G,
  selectedDistrict,
  onSelect,
  playerColors = {} as Record<string, string>,
  calibrate,
  calibratingId,
  onArm,
  onPlace,
  onHoverCoord,
}: BoardMapProps) {
  // Hover coord is only fed upward via onHoverCoord; keep the setter to avoid
  // recomputing on every mousemove but skip the value (we don't render it).
  const [, setHoverCoord] = useState<{ x: number; y: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const zoomRef = useRef(1);
  const panRef = useRef({ x: 0, y: 0 });
  const dragRef = useRef<{ mx: number; my: number; px: number; py: number } | null>(null);
  const hasDragged = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Keep refs in sync at render time
  zoomRef.current = zoom;
  panRef.current = pan;

  // Non-passive wheel listener for zoom
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      const r = el.getBoundingClientRect();
      const mx = e.clientX - r.left;
      const my = e.clientY - r.top;
      const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
      const z = zoomRef.current;
      const p = panRef.current;
      const newZ = Math.min(Math.max(z * factor, 1), 5);
      const rawX = mx - (mx - p.x) * (newZ / z);
      const rawY = my - (my - p.y) * (newZ / z);
      const newP = clamp(rawX, rawY, newZ, r);
      zoomRef.current = newZ;
      panRef.current = newP;
      setZoom(newZ);
      setPan(newP);
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []); // empty deps — uses refs for current values

  function handleDistrictClick(id: string | null) {
    if (hasDragged.current) { hasDragged.current = false; return; }
    if (calibrate) {
      if (id) onArm(calibratingId === id ? null : id);
      return;
    }
    onSelect(id);
  }

  return (
    <div className="board-map-wrap">
      <div
        className="board-map"
        ref={wrapRef}
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
        onClick={(e) => {
          if (hasDragged.current) { hasDragged.current = false; return; }
          if (!calibrate || !wrapRef.current) return;
          const r = wrapRef.current.getBoundingClientRect();
          const x = ((e.clientX - r.left - pan.x) / (r.width * zoom)) * 100;
          const y = ((e.clientY - r.top - pan.y) / (r.height * zoom)) * 100;
          if (calibratingId) {
            onPlace(calibratingId, x, y);
          } else {
            // eslint-disable-next-line no-console
            console.log(`mapCenter: { x: ${x.toFixed(1)}, y: ${y.toFixed(1)} }`);
          }
        }}
        onMouseDown={(e) => {
          if (e.button !== 0) return;
          dragRef.current = { mx: e.clientX, my: e.clientY, px: pan.x, py: pan.y };
          hasDragged.current = false;
          setIsDragging(true);
        }}
        onMouseMove={(e) => {
          if (dragRef.current) {
            const dx = e.clientX - dragRef.current.mx;
            const dy = e.clientY - dragRef.current.my;
            if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
              hasDragged.current = true;
              const r = wrapRef.current!.getBoundingClientRect();
              const newP = clamp(dragRef.current.px + dx, dragRef.current.py + dy, zoom, r);
              panRef.current = newP;
              setPan(newP);
            }
          }
          // hover coord for calibrate (account for zoom/pan)
          if (calibrate && wrapRef.current) {
            const r = wrapRef.current.getBoundingClientRect();
            const c = {
              x: ((e.clientX - r.left - pan.x) / (r.width * zoom)) * 100,
              y: ((e.clientY - r.top - pan.y) / (r.height * zoom)) * 100,
            };
            setHoverCoord(c);
            onHoverCoord(c);
          }
        }}
        onMouseUp={() => { dragRef.current = null; setIsDragging(false); }}
        onMouseLeave={() => { dragRef.current = null; setIsDragging(false); onHoverCoord(null); setHoverCoord(null); }}
      >
        <div
          className="board-inner"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "0 0",
          }}
        >
          <img src="/Board%20(Large).png" alt="Moonshine Kingdom board" className="board-map-img" />

          {DISTRICTS.map((d) => (
            <DistrictMarker
              key={d.id}
              district={d}
              state={G.districts[d.id]}
              selected={!calibrate && selectedDistrict === d.id}
              calibrating={calibrate && calibratingId === d.id}
              onSelect={handleDistrictClick}
              playerColors={playerColors}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function DistrictMarker({
  district: d,
  state: ds,
  selected,
  calibrating,
  onSelect,
  playerColors,
}: {
  district: (typeof DISTRICTS)[number];
  state: GameState["districts"][string];
  selected: boolean;
  calibrating: boolean;
  onSelect: (id: string | null) => void;
  playerColors: Record<string, string>;
}) {
  const ctrl = ds.controller;
  const bgColor = ctrl !== null
    ? (playerColors[ctrl] ?? "#2a2a2a")
    : ds.precinct ? "#1a1a2e" : "#2a2a2a";

  // Per-player mobsters.
  const playerLines = Object.entries(ds.mobsters)
    .filter(([, m]) => (m.bosses + m.runners) > 0)
    .map(([pid, m]) => ({ pid, ...m }));

  // Barrels aggregated across owners.
  const barrelTotals: Record<LiquorType, number> = { moonshine: 0, gin: 0, whisky: 0, rum: 0 };
  for (const owner of Object.keys(ds.barrels)) {
    for (const t of LIQUOR_TYPES) barrelTotals[t] += ds.barrels[owner][t] ?? 0;
  }
  const barrelNonZero = LIQUOR_TYPES.filter((t) => barrelTotals[t] > 0);

  // Safehouses.
  const safehouseOwners = Object.entries(ds.safehouses).filter(([, n]) => n > 0);

  const hasPlayerContent = playerLines.length > 0 || barrelNonZero.length > 0 || safehouseOwners.length > 0;
  const showBody = hasPlayerContent || ds.precinct;
  const isCompact = !hasPlayerContent;

  // Truly empty — no still, no forces, no police.
  if (!ds.still && !showBody) return null;

  return (
    <div
      className={"dmark" + (isCompact ? " dmark-compact" : "") + (selected ? " selected" : "") + (calibrating ? " calibrating" : "")}
      style={{
        left: `${d.mapCenter.x}%`,
        top: `${d.mapCenter.y}%`,
        backgroundColor: bgColor,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(selected ? null : d.id);
      }}
      title={d.name}
    >
      {ds.still && (
        <div
          className="dmark-still-side"
          style={{ background: STILL_COLOR[ds.still.type] }}
          title={`Still ${ds.still.type} #${ds.still.number}`}
        >
          {ds.still.number}
        </div>
      )}
      {showBody && (
        <div className="dmark-body">
          {ds.precinct && <span className="dmark-precinct" title="Precinct">POLICE</span>}
          {playerLines.map((p) => (
            <span key={p.pid} className="dmark-mob" title={`${seatLabel(p.pid)}: ${p.bosses}B/${p.runners}R`}>
              {Array.from({ length: Math.min(p.bosses, 3) }, (_, i) => <BossMeeple key={`b${i}`} />)}
              {p.runners > 0 && <RunnerMeeple count={p.runners} />}
            </span>
          ))}
          {barrelNonZero.map((t) => (
            <span key={t} className="dmark-barrel" style={{ background: LIQUOR_COLOR[t] }} title={`${barrelTotals[t]} ${t}`}>
              {barrelTotals[t]}
            </span>
          ))}
          {safehouseOwners.map(([pid, n]) => (
            <span key={pid} className="dmark-safe" title={`${seatLabel(pid)} safehouse${n > 1 ? ` x${n}` : ""}`}>
              {n > 1 && <span className="dmark-count">{n}</span>}
              <HouseIcon />
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function RunnerMeeple({ count }: { count: number }) {
  return (
    <span className="dmark-meeple-wrap">
      <svg width="7" height="10" viewBox="0 0 7 10" style={{ display: "block", flexShrink: 0 }}>
        <circle cx="3.5" cy="2.5" r="2" fill="#f5e9d9" />
        <path d="M0.5 5.5 Q3.5 8 6.5 5.5 L6 10 H1 Z" fill="#f5e9d9" />
      </svg>
      {count > 1 && <span className="dmark-meeple-count">x{count}</span>}
    </span>
  );
}

function BossMeeple() {
  return (
    <svg width="7" height="10" viewBox="0 0 7 10" style={{ flexShrink: 0 }}>
      <circle cx="3.5" cy="2.5" r="2" fill="#d4af37" />
      <path d="M0.5 5.5 Q3.5 8 6.5 5.5 L6 10 H1 Z" fill="#d4af37" />
    </svg>
  );
}

function HouseIcon() {
  return (
    <svg width="9" height="9" viewBox="0 0 9 9" style={{ flexShrink: 0 }}>
      <path d="M4.5 0.5 L8.5 4.5 L7 4.5 L7 8.5 L5.5 8.5 L5.5 6 L3.5 6 L3.5 8.5 L2 8.5 L2 4.5 L0.5 4.5 Z" fill="#f5e9d9" />
    </svg>
  );
}

export function DistrictDetail({
  districtId,
  G,
  playerColors,
}: {
  districtId: string;
  G: GameState;
  playerColors: Record<string, string>;
}) {
  const d = DISTRICTS.find((x) => x.id === districtId);
  const ds = G.districts[districtId];
  if (!d || !ds) return null;
  const myPlayers = Object.keys(ds.mobsters).filter((pid) => (ds.mobsters[pid].bosses + ds.mobsters[pid].runners) > 0);
  return (
    <div className="district-detail">
      <h4>
        {d.name}{" "}
        {ds.controller !== null && (
          <span style={{ color: playerColors[ds.controller], fontSize: 12 }}>· {seatLabel(ds.controller)}</span>
        )}
      </h4>
      <div className="tags">
        {d.tags.map((t) => (
          <span key={t} className="tag">{TAG_GLYPH[t]} {t}</span>
        ))}
        {d.housePour && <span className="tag">house: {d.housePour}</span>}
        {ds.precinct && <span className="tag police">Precinct</span>}
        {ds.still && (
          <span className={"tag still still-" + ds.still.type}>
            Still #{ds.still.number} ({ds.still.type})
          </span>
        )}
      </div>
      {myPlayers.length > 0 && (
        <div className="presence">
          {myPlayers.map((pid) => {
            const m = ds.mobsters[pid];
            const safeN = ds.safehouses[pid] ?? 0;
            const barrelParts = LIQUOR_TYPES
              .filter((t) => ds.barrels[pid]?.[t] > 0)
              .map((t) => `${ds.barrels[pid][t]} ${t}`);
            return (
              <div key={pid} className="presence-row" style={{ borderLeft: `3px solid ${playerColors[pid]}` }}>
                <b style={{ color: playerColors[pid] }}>{seatLabel(pid)}</b>
                {m.bosses > 0 && <span> · {m.bosses} boss{m.bosses > 1 ? "es" : ""}</span>}
                {m.runners > 0 && <span> · {m.runners} runner{m.runners > 1 ? "s" : ""}</span>}
                {safeN > 0 && <span> · {safeN} safe{safeN > 1 ? "s" : ""}</span>}
                {barrelParts.length > 0 && <span className="muted"> · {barrelParts.join(", ")}</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
