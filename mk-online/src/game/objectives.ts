// Machine-readable objective checks for each Contract Card.
//
// Reckoning calls `evaluateObjective(G, playerID, contractId)` when a contract
// hits its deadline. Returns true (Completed) / false (Botched). If the
// contract id has no evaluator, returns `null` and Reckoning falls back to
// the player's manual Completed/Botched choice.
//
// The map below mirrors the 56 contract ids in cards.generated.ts; each
// evaluator is a small pure function reading from G and the player.

import type { GameState, PlayerID, LiquorType, BoroughId } from "./types";
import { DISTRICTS, DISTRICT_BY_ID, BOROUGHS } from "./data";

const LIQUOR_TYPES: LiquorType[] = ["moonshine", "gin", "whisky", "rum"];
function emptyBarrels(): Record<LiquorType, number> {
  return { moonshine: 0, gin: 0, whisky: 0, rum: 0 };
}

// ============================================================================
// Helpers
// ============================================================================

function ctrl(G: GameState, pid: PlayerID, did: string): boolean {
  return G.districts[did]?.controller === pid;
}

function controlledIds(G: GameState, pid: PlayerID): string[] {
  return Object.keys(G.districts).filter((id) => ctrl(G, pid, id));
}

function controlledByTag(G: GameState, pid: PlayerID, tag: string): string[] {
  return controlledIds(G, pid).filter((id) => DISTRICT_BY_ID[id].tags.includes(tag as never));
}

function controlledByBorough(G: GameState, pid: PlayerID, borough: BoroughId): string[] {
  return controlledIds(G, pid).filter((id) => DISTRICT_BY_ID[id].borough === borough);
}

function barrelsAt(G: GameState, pid: PlayerID, did: string): Record<LiquorType, number> {
  return G.districts[did]?.barrels[pid] ?? emptyBarrels();
}

function totalBarrelsAcross(G: GameState, pid: PlayerID, type?: LiquorType): number {
  let sum = 0;
  for (const id of Object.keys(G.districts)) {
    const b = barrelsAt(G, pid, id);
    sum += type ? b[type] : LIQUOR_TYPES.reduce((s, t) => s + b[t], 0);
  }
  return sum;
}

function hasBossAt(G: GameState, pid: PlayerID, did: string): boolean {
  return (G.districts[did]?.mobsters[pid]?.bosses ?? 0) > 0;
}

function safehouseAt(G: GameState, pid: PlayerID, did: string): boolean {
  return (G.districts[did]?.safehouses[pid] ?? 0) > 0;
}

function bossInPlay(G: GameState, pid: PlayerID): boolean {
  for (const id of Object.keys(G.districts)) {
    if ((G.districts[id].mobsters[pid]?.bosses ?? 0) > 0) return true;
  }
  return false;
}

function speakeasiesByPour(G: GameState, pid: PlayerID, pour: LiquorType): string[] {
  return controlledIds(G, pid).filter((id) => {
    const d = DISTRICT_BY_ID[id];
    return d.tags.includes("speakeasy") && d.housePour === pour;
  });
}

function stillsControlled(G: GameState, pid: PlayerID, type?: LiquorType, number?: number): string[] {
  return controlledIds(G, pid).filter((id) => {
    const s = G.districts[id].still;
    if (!s) return false;
    if (type && s.type !== type) return false;
    if (number !== undefined && s.number !== number) return false;
    return true;
  });
}

/** Highest-valued liquor type by current market (ties handled by caller). */
function topMarketTypes(G: GameState): { type: LiquorType; value: number }[] {
  const arr = LIQUOR_TYPES.map((t) => ({ type: t, value: G.market[t] }));
  arr.sort((a, b) => b.value - a.value);
  return arr;
}

function lowestMarketTypes(G: GameState): { type: LiquorType; value: number }[] {
  const arr = LIQUOR_TYPES.map((t) => ({ type: t, value: G.market[t] }));
  arr.sort((a, b) => a.value - b.value);
  return arr;
}

/** Does pid hold strictly the most by `getter` among all players? */
function strictlyMost(G: GameState, pid: PlayerID, getter: (id: PlayerID) => number): boolean {
  const mine = getter(pid);
  for (const id of Object.keys(G.players)) {
    if (id === pid) continue;
    if (getter(id) >= mine) return false;
  }
  return true;
}

/** Does pid hold strictly the most barrels of `type` among rivals? */
function strictlyMostBarrels(G: GameState, pid: PlayerID, type: LiquorType): boolean {
  return strictlyMost(G, pid, (id) => totalBarrelsAcross(G, id, type));
}

function rivalSafehouseDistricts(G: GameState, pid: PlayerID): string[] {
  const out: string[] = [];
  for (const id of Object.keys(G.districts)) {
    for (const opp of Object.keys(G.players)) {
      if (opp === pid) continue;
      if (safehouseAt(G, opp, id)) {
        out.push(id);
        break;
      }
    }
  }
  return out;
}

/** Boroughs that contain at least one rival Safehouse. */
function bouroughsWithRivalSafehouse(G: GameState, pid: PlayerID): Set<BoroughId> {
  const out = new Set<BoroughId>();
  for (const did of rivalSafehouseDistricts(G, pid)) {
    out.add(DISTRICT_BY_ID[did].borough);
  }
  return out;
}

/** Districts adjacent to a given district (land/bridge only — not dock waterway). */
function adjacent(did: string): string[] {
  return DISTRICT_BY_ID[did]?.connections ?? [];
}

/** Does pid control a contiguous chain (land + bridge) connecting two districts? */
function controlsChain(G: GameState, pid: PlayerID, fromId: string, toId: string): boolean {
  if (!ctrl(G, pid, fromId) || !ctrl(G, pid, toId)) return false;
  const seen = new Set<string>([fromId]);
  const queue = [fromId];
  while (queue.length > 0) {
    const cur = queue.shift()!;
    if (cur === toId) return true;
    for (const next of adjacent(cur)) {
      if (seen.has(next)) continue;
      if (!ctrl(G, pid, next)) continue;
      seen.add(next);
      queue.push(next);
    }
  }
  return false;
}

/** Is district fully surrounded by Hostile turf for pid (no safe exit)? */
function noSafeExit(G: GameState, pid: PlayerID, did: string): boolean {
  const d = DISTRICT_BY_ID[did];
  // Land/bridge neighbors
  const neighbors = [...adjacent(did)];
  // Dock waterway: if it's a dock, every other dock is reachable
  if (d.tags.includes("dock")) {
    for (const other of Object.keys(G.districts)) {
      if (other === did) continue;
      if (DISTRICT_BY_ID[other].tags.includes("dock")) neighbors.push(other);
    }
  }
  for (const n of neighbors) {
    const ds = G.districts[n];
    if (ds.precinct) continue; // hostile (Pinned)
    // Hostile if rival mobsters present
    const isHostile = Object.entries(ds.mobsters).some(
      ([owner, m]) => owner !== pid && (m.bosses + m.runners) > 0
    );
    if (!isHostile) return false; // found a safe exit
  }
  return true;
}

// ============================================================================
// Per-contract evaluators
// ============================================================================

type Eval = (G: GameState, pid: PlayerID) => boolean;

const E: Record<string, Eval> = {
  // --- Gigs ---

  "five-points-hustle": (G, pid) => {
    if (!ctrl(G, pid, "fivePoints")) return false;
    const inv = barrelsAt(G, pid, "fivePoints");
    const top = topMarketTypes(G);
    // Most valuable: top[0].type. Ties on value fail.
    if (top.length > 1 && top[0].value === top[1].value) return false;
    return inv[top[0].type] >= 2;
  },

  "moonshine-express": (G, pid) => {
    // Boss in a Moonshine Speakeasy with 4+ Moonshine.
    for (const did of speakeasiesByPour(G, pid, "moonshine")) {
      if (hasBossAt(G, pid, did) && barrelsAt(G, pid, did).moonshine >= 4) return true;
    }
    return false;
  },

  "the-crimson-coup": (G, pid) => {
    // 3+ Districts in a Borough containing a Rival Safehouse.
    const targetBoroughs = bouroughsWithRivalSafehouse(G, pid);
    for (const b of targetBoroughs) {
      if (controlledByBorough(G, pid, b).length >= 3) return true;
    }
    return false;
  },

  "bloody-sunday": (G, pid) => {
    // 8+ Runners adjacent to the same Rival Safehouse.
    for (const sh of rivalSafehouseDistricts(G, pid)) {
      const adjIds = adjacent(sh);
      const runners = adjIds.reduce((s, id) => s + (G.districts[id].mobsters[pid]?.runners ?? 0), 0);
      if (runners >= 8) return true;
    }
    return false;
  },

  "empire-state": (G, pid) => {
    // More Cash than any other single Rival.
    return strictlyMost(G, pid, (id) => G.players[id].cash);
  },

  "the-toll-booth-trap": (G, pid) => {
    // At least 1 rival has no Boss in play.
    for (const id of Object.keys(G.players)) {
      if (id === pid) continue;
      if (!bossInPlay(G, id)) return true;
    }
    return false;
  },

  "the-milk-run": (G, pid) => {
    // At least 2 barrels of each Liquor type across Districts you Control.
    const sums: Record<LiquorType, number> = emptyBarrels();
    for (const did of controlledIds(G, pid)) {
      const b = barrelsAt(G, pid, did);
      for (const t of LIQUOR_TYPES) sums[t] += b[t];
    }
    return LIQUOR_TYPES.every((t) => sums[t] >= 2);
  },

  "rum-runner-s-regatta": (G, pid) => {
    // 4+ Rum in Dock Districts you Control.
    let total = 0;
    for (const did of controlledByTag(G, pid, "dock")) total += barrelsAt(G, pid, did).rum;
    return total >= 4;
  },

  "stock-market-swindle": (G, pid) => {
    // 4+ barrels of lowest-valued Liquor type (ties fail), in a District with
    // a Still of a DIFFERENT type from the liquor.
    const lo = lowestMarketTypes(G);
    if (lo.length > 1 && lo[0].value === lo[1].value) return false;
    const lowType = lo[0].type;
    for (const did of controlledIds(G, pid)) {
      const s = G.districts[did].still;
      if (!s || s.type === lowType) continue;
      if (barrelsAt(G, pid, did)[lowType] >= 4) return true;
    }
    return false;
  },

  "high-roller": (G, pid) => {
    // Boss in The Tenderloin with $2,500+ cash.
    return hasBossAt(G, pid, "tenderloin") && G.players[pid].cash >= 2500;
  },

  "union-dues": (G, pid) => {
    // 8+ Runners in Ghetto Districts.
    let total = 0;
    for (const did of controlledByTag(G, pid, "ghetto")) total += G.districts[did].mobsters[pid]?.runners ?? 0;
    return total >= 8;
  },

  "lexington-avenue-laundry": (G, pid) => {
    // $2,500+ Cash and 0 Heat markers (yours on the heat track).
    if (G.players[pid].cash < 2500) return false;
    return !G.heat.some((h) => h.owner === pid);
  },

  "the-debt-collector": (G, pid) => {
    // 5+ barrels of Liquor in a Borough whose Deed is held by a rival.
    for (const b of BOROUGHS) {
      const holder = G.titles[b.id];
      if (!holder || holder === pid) continue;
      let total = 0;
      for (const did of DISTRICTS.filter((d) => d.borough === b.id).map((d) => d.id)) {
        const inv = barrelsAt(G, pid, did);
        total += LIQUOR_TYPES.reduce((s, t) => s + inv[t], 0);
      }
      if (total >= 5) return true;
    }
    return false;
  },

  "the-insurance-job": (G, pid) => {
    // Control a Speakeasy matching the liquor type of a #12 Still you Control.
    const twelves = stillsControlled(G, pid, undefined, 12);
    for (const did of twelves) {
      const stillType = G.districts[did].still!.type;
      if (speakeasiesByPour(G, pid, stillType).length > 0) return true;
    }
    return false;
  },

  "the-angel-s-share": (G, pid) => {
    // Boss in a Whisky Speakeasy holding 3+ Whisky.
    for (const did of speakeasiesByPour(G, pid, "whisky")) {
      if (hasBossAt(G, pid, did) && barrelsAt(G, pid, did).whisky >= 3) return true;
    }
    return false;
  },

  "frame-job": (G, pid) => {
    // You have 0 Heat markers, AND a single rival has 2+.
    if (G.heat.some((h) => h.owner === pid)) return false;
    const rivalCounts: Record<string, number> = {};
    for (const h of G.heat) if (h.owner !== pid) rivalCounts[h.owner] = (rivalCounts[h.owner] ?? 0) + 1;
    return Object.values(rivalCounts).some((c) => c >= 2);
  },

  "the-quiet-drop": (G, pid) => {
    // 3+ Gin in a Staten Island Dock District.
    for (const did of ["westerleigh", "tottenville"]) {
      if (ctrl(G, pid, did) && barrelsAt(G, pid, did).gin >= 3) return true;
    }
    return false;
  },

  "full-steam-ahead": (G, pid) => {
    // Control a Still of each domestic type (Moonshine / Gin / Whisky), with
    // at least 3 Runners in each of those districts.
    const needed: LiquorType[] = ["moonshine", "gin", "whisky"];
    for (const t of needed) {
      const ds = stillsControlled(G, pid, t);
      const ok = ds.some((id) => (G.districts[id].mobsters[pid]?.runners ?? 0) >= 3);
      if (!ok) return false;
    }
    return true;
  },

  "cross-town-switch": (G, pid) => {
    // 3+ Whisky in Queens AND 3+ Gin in Manhattan (across controlled districts).
    let queensWhisky = 0;
    for (const did of controlledByBorough(G, pid, "queens")) queensWhisky += barrelsAt(G, pid, did).whisky;
    let manGin = 0;
    for (const did of controlledByBorough(G, pid, "manhattan")) manGin += barrelsAt(G, pid, did).gin;
    return queensWhisky >= 3 && manGin >= 3;
  },

  "market-correction": (G, pid) => {
    // 5+ barrels of the highest-valued Liquor type (ties on value fail) in
    // a single District.
    const top = topMarketTypes(G);
    if (top.length > 1 && top[0].value === top[1].value) return false;
    const t = top[0].type;
    for (const did of controlledIds(G, pid)) {
      if (barrelsAt(G, pid, did)[t] >= 5) return true;
    }
    return false;
  },

  "the-gin-pipeline": (G, pid) => {
    // Safehouses in Hunts Point AND Brownsville, hold 2+ Gin in each.
    return safehouseAt(G, pid, "huntsPoint") && barrelsAt(G, pid, "huntsPoint").gin >= 2 &&
           safehouseAt(G, pid, "brownsville") && barrelsAt(G, pid, "brownsville").gin >= 2;
  },

  "cobble-hill-connection": (G, pid) => {
    // 2+ Districts in BOTH Brooklyn and Queens.
    return controlledByBorough(G, pid, "brooklyn").length >= 2 &&
           controlledByBorough(G, pid, "queens").length >= 2;
  },

  // --- Rackets ---

  "the-sullivan-scheme": (G, pid) => {
    // 3+ Speakeasies in Brooklyn/Queens + $2,000+ cash.
    const speakeasies = controlledByTag(G, pid, "speakeasy")
      .filter((id) => ["brooklyn", "queens"].includes(DISTRICT_BY_ID[id].borough));
    return speakeasies.length >= 3 && G.players[pid].cash >= 2000;
  },

  "the-empty-casket": (G, pid) => {
    // Hold a Borough Deed while having fewer than 5 of your mobsters in that Borough.
    for (const b of BOROUGHS) {
      if (G.titles[b.id] !== pid) continue;
      let total = 0;
      for (const did of DISTRICTS.filter((d) => d.borough === b.id).map((d) => d.id)) {
        const m = G.districts[did].mobsters[pid];
        if (m) total += m.bosses + m.runners;
      }
      if (total < 5) return true;
    }
    return false;
  },

  "omert-s-shadow": (G, pid) => {
    // Safehouse in every Borough that contains a rival Boss.
    const needed = new Set<BoroughId>();
    for (const did of Object.keys(G.districts)) {
      const m = G.districts[did].mobsters;
      for (const opp of Object.keys(m)) {
        if (opp === pid) continue;
        if ((m[opp]?.bosses ?? 0) > 0) needed.add(DISTRICT_BY_ID[did].borough);
      }
    }
    for (const b of needed) {
      const districtsInB = DISTRICTS.filter((d) => d.borough === b).map((d) => d.id);
      const hasSH = districtsInB.some((id) => safehouseAt(G, pid, id));
      if (!hasSH) return false;
    }
    return true;
  },

  "the-butcher-s-ledger": (G, pid) => {
    // More Runners North of the East River (Manhattan + Bronx) than any rival (ties fail).
    const north = (id: PlayerID) => {
      let total = 0;
      for (const did of DISTRICTS.filter((d) => d.borough === "manhattan" || d.borough === "bronx")) {
        total += G.districts[did.id].mobsters[id]?.runners ?? 0;
      }
      return total;
    };
    return strictlyMost(G, pid, north);
  },

  "coney-island-heist": (G, pid) => {
    // Safehouse in Coney Island + 2+ barrels of each type there.
    if (!safehouseAt(G, pid, "coneyIsland")) return false;
    const inv = barrelsAt(G, pid, "coneyIsland");
    return LIQUOR_TYPES.every((t) => inv[t] >= 2);
  },

  "fortress-staten": (G, pid) => {
    // Control all 3 Staten Island Districts AND Safehouses in both Docks (Westerleigh & Tottenville).
    const sd = ["stapleton", "westerleigh", "tottenville"];
    if (!sd.every((id) => ctrl(G, pid, id))) return false;
    return safehouseAt(G, pid, "westerleigh") && safehouseAt(G, pid, "tottenville");
  },

  "the-night-mayor": (G, pid) => {
    // Control more Speakeasies than any single rival (ties fail).
    return strictlyMost(G, pid, (id) => controlledByTag(G, id, "speakeasy").length);
  },

  "ghosts-in-the-shadows": (G, pid) => {
    // At least 2 mobsters in EVERY Borough.
    for (const b of BOROUGHS) {
      let total = 0;
      for (const did of DISTRICTS.filter((d) => d.borough === b.id).map((d) => d.id)) {
        const m = G.districts[did].mobsters[pid];
        if (m) total += m.bosses + m.runners;
      }
      if (total < 2) return false;
    }
    return true;
  },

  "high-spirits": (G, pid) => {
    // 2+ High Society Districts AND 2+ Whisky Stills.
    return controlledByTag(G, pid, "highSociety").length >= 2 &&
           stillsControlled(G, pid, "whisky").length >= 2;
  },

  "hell-s-highway": (G, pid) => {
    // Continuous chain (land/bridge) East Harlem → Flushing, all controlled.
    return controlsChain(G, pid, "eastHarlem", "flushing");
  },

  "the-big-squeeze": (G, pid) => {
    // Borough Deed for the Borough containing the most Liquor barrels (ties fail).
    const totals = BOROUGHS.map((b) => {
      let sum = 0;
      for (const did of DISTRICTS.filter((d) => d.borough === b.id).map((d) => d.id)) {
        const all = G.districts[did].barrels;
        for (const owner of Object.keys(all)) {
          for (const t of LIQUOR_TYPES) sum += all[owner][t];
        }
      }
      return { id: b.id, sum };
    });
    totals.sort((a, b) => b.sum - a.sum);
    if (totals[0].sum === totals[1].sum) return false;
    return G.titles[totals[0].id] === pid;
  },

  "the-dutchman-s-deal": (G, pid) => strictlyMostBarrels(G, pid, "gin"),

  "tenement-army": (G, pid) => controlledByTag(G, pid, "ghetto").length >= 3,

  "bathtub-chemistry": (G, pid) => stillsControlled(G, pid, "gin").length >= 4,

  "cuban-prince": (G, pid) => {
    // 2+ Dock Districts AND 4+ Rum in each.
    const docks = controlledByTag(G, pid, "dock");
    if (docks.length < 2) return false;
    let qualifying = 0;
    for (const did of docks) {
      if (barrelsAt(G, pid, did).rum >= 4) qualifying += 1;
    }
    return qualifying >= 2;
  },

  "gentleman-jimmy-s-shindig": (G, pid) => {
    // Control Morris Park with Boss, 3+ Rum there, $2,500+ cash.
    if (!ctrl(G, pid, "morrisPark") || !hasBossAt(G, pid, "morrisPark")) return false;
    if (barrelsAt(G, pid, "morrisPark").rum < 3) return false;
    return G.players[pid].cash >= 2500;
  },

  "cutting-the-product": (G, pid) => {
    // 3+ Moonshine in a Controlled District with a Whisky Still.
    for (const did of stillsControlled(G, pid, "whisky")) {
      if (barrelsAt(G, pid, did).moonshine >= 3) return true;
    }
    return false;
  },

  "the-beachhead": (G, pid) => {
    // Safehouse + 2+ Rum in same District within a Borough whose Deed is held by a rival.
    for (const b of BOROUGHS) {
      const holder = G.titles[b.id];
      if (!holder || holder === pid) continue;
      for (const did of DISTRICTS.filter((d) => d.borough === b.id).map((d) => d.id)) {
        if (safehouseAt(G, pid, did) && barrelsAt(G, pid, did).rum >= 2) return true;
      }
    }
    return false;
  },

  "harlem-shakedown": (G, pid) => controlledByBorough(G, pid, "manhattan").length >= 5,

  "the-copper-heist": (G, pid) => stillsControlled(G, pid, undefined, 7).length >= 3,

  // --- Scores ---

  "the-poison-panic": (G, pid) => {
    // 1 Still of each type + 5+ matching liquor in EACH.
    for (const t of ["moonshine", "gin", "whisky"] as LiquorType[]) {
      const matchingDistricts = stillsControlled(G, pid, t);
      const ok = matchingDistricts.some((id) => barrelsAt(G, pid, id)[t] >= 5);
      if (!ok) return false;
    }
    return true;
  },

  "the-last-call": (G, pid) => {
    // 4+ Speakeasies in Manhattan + Bronx combined.
    const ms = controlledByTag(G, pid, "speakeasy")
      .filter((id) => ["manhattan", "bronx"].includes(DISTRICT_BY_ID[id].borough));
    return ms.length >= 4;
  },

  "the-informant-s-secret": (G, pid) => {
    // Most barrels of highest-valued liquor (ties on value OR quantity fail).
    const top = topMarketTypes(G);
    if (top.length > 1 && top[0].value === top[1].value) return false;
    return strictlyMostBarrels(G, pid, top[0].type);
  },

  "rum-wars": (G, pid) => {
    // Dock Districts in 3+ Boroughs AND more Rum than all rivals COMBINED.
    const dockBoroughs = new Set(controlledByTag(G, pid, "dock").map((id) => DISTRICT_BY_ID[id].borough));
    if (dockBoroughs.size < 3) return false;
    const mine = totalBarrelsAcross(G, pid, "rum");
    let others = 0;
    for (const id of Object.keys(G.players)) if (id !== pid) others += totalBarrelsAcross(G, id, "rum");
    return mine > others;
  },

  "south-side-embargo": (G, pid) => {
    // 4+ Speakeasies in Brooklyn + Queens combined.
    const ss = controlledByTag(G, pid, "speakeasy")
      .filter((id) => ["brooklyn", "queens"].includes(DISTRICT_BY_ID[id].borough));
    return ss.length >= 4;
  },

  "the-big-sleep": (G, pid) => {
    // Surround a rival Boss so they cannot move without entering Hostile turf.
    for (const opp of Object.keys(G.players)) {
      if (opp === pid) continue;
      for (const did of Object.keys(G.districts)) {
        if ((G.districts[did].mobsters[opp]?.bosses ?? 0) > 0 && noSafeExit(G, opp, did)) {
          return true;
        }
      }
    }
    return false;
  },

  "dock-domination": (G, pid) => controlledByTag(G, pid, "dock").length >= 4,

  "the-irish-goodbye": (G, pid) => strictlyMost(G, pid, (id) => {
    let sum = 0;
    for (const did of Object.keys(G.districts)) sum += G.districts[did].mobsters[id]?.runners ?? 0;
    return sum;
  }),

  "black-hand-rising": (G, pid) => {
    // At least 1 District in every Borough.
    for (const b of BOROUGHS) {
      if (controlledByBorough(G, pid, b.id).length === 0) return false;
    }
    return true;
  },

  "the-gatsby-run": (G, pid) => {
    // 4+ barrels of EACH Liquor type in a single Borough.
    for (const b of BOROUGHS) {
      const sums: Record<LiquorType, number> = emptyBarrels();
      for (const did of DISTRICTS.filter((d) => d.borough === b.id).map((d) => d.id)) {
        const inv = barrelsAt(G, pid, did);
        for (const t of LIQUOR_TYPES) sums[t] += inv[t];
      }
      if (LIQUOR_TYPES.every((t) => sums[t] >= 4)) return true;
    }
    return false;
  },

  "the-king-of-queens": (G, pid) => {
    // All 3 Speakeasies in Queens — Richmond Hill, Astoria, Flushing.
    return ctrl(G, pid, "richmondHill") && ctrl(G, pid, "astoria") && ctrl(G, pid, "flushing");
  },

  "the-grand-tour": (G, pid) => {
    // Speakeasy of each Domestic type + at least 1 Dock.
    const needed: LiquorType[] = ["moonshine", "gin", "whisky"];
    if (!needed.every((t) => speakeasiesByPour(G, pid, t).length > 0)) return false;
    return controlledByTag(G, pid, "dock").length >= 1;
  },

  "the-old-guard": (G, pid) => controlledByTag(G, pid, "highSociety").length >= 3,

  "the-five-points-accord": (G, pid) => {
    // 1 Speakeasy in EVERY Borough EXCEPT Staten Island.
    for (const b of BOROUGHS) {
      if (b.id === "staten") continue;
      const speakeasies = controlledByTag(G, pid, "speakeasy").filter((id) => DISTRICT_BY_ID[id].borough === b.id);
      if (speakeasies.length === 0) return false;
    }
    return true;
  },
};

/** Returns true/false if we have an evaluator, or null to fall back to manual choice. */
export function evaluateObjective(G: GameState, pid: PlayerID, contractId: string): boolean | null {
  const e = E[contractId];
  if (!e) return null;
  try {
    return e(G, pid);
  } catch (err) {
    // Don't crash the game on an eval bug; fall back to manual.
    console.error("Objective eval failed for", contractId, err);
    return null;
  }
}

/** Returns how many of the 56 contracts have a machine evaluator wired. */
export const ENCODED_OBJECTIVE_COUNT = Object.keys(E).length;
