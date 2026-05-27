// Tiny pub-sub for sharing the latest bgio G snapshot from inside the
// MKClient out to the wrapping App shell, plus a Take Back history ring.
//
// All MKClient instances render the same G via Local() multiplayer, so it's
// safe to have every Board push and let "last writer wins" — they all write
// the same snapshot in lockstep.

import type { GameState } from "../game/types";

type Listener = (snapshot: GameState | null) => void;

let current: GameState | null = null;
const listeners = new Set<Listener>();

export function publishLiveG(g: GameState | null) {
  current = g;
  for (const l of listeners) l(g);
}

export function getLiveG(): GameState | null {
  return current;
}

export function subscribeLiveG(fn: Listener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

// ---- Take Back history ----------------------------------------------------
//
// Each entry is a snapshot taken AFTER a state transition, tagged with the
// player who's currently expected to act (the "active actor") so Take Back
// can rewind past intervening AI moves and land on the most recent state
// where it was a human's turn to act.

interface HistEntry {
  /** Deep-cloned G snapshot. */
  G: GameState;
  /** Player ID expected to act NEXT from this snapshot, or null if none. */
  activeActor: string | null;
  /** bgio _stateID at the time this was captured (for dedupe). */
  stateID: number;
  /** bgio phase at the time this was captured. takeBack only restores within
   *  the same phase to keep ctx.phase consistent with G's substate. */
  phase: string | undefined;
}

const HISTORY_LIMIT = 80;
let history: HistEntry[] = [];

export function pushHistory(entry: HistEntry) {
  // Dedupe: if the most recent entry has the same stateID, don't double-push.
  const last = history[history.length - 1];
  if (last && last.stateID === entry.stateID) return;
  history.push(entry);
  if (history.length > HISTORY_LIMIT) history.shift();
}

export function clearHistory() {
  history = [];
}

/**
 * Smart-rewind: walk back through history, skip any entries where the active
 * actor is in `aiPlayers`, and return the most recent snapshot whose active
 * actor was a HUMAN player and which precedes the current state.
 *
 * Restricted to entries that match the current bgio phase so ctx.phase stays
 * consistent with restored G substate. Returns null if no suitable target.
 *
 * Also truncates `history` so subsequent Take Backs step further back.
 */
export function takeBackSmart(aiPlayers: string[], currentPhase: string | undefined): GameState | null {
  if (history.length < 2) return null;
  // Skip the latest entry (that's the current state).
  for (let j = history.length - 2; j >= 0; j--) {
    const e = history[j];
    // Only restore within the same phase — cross-phase rewinds desync ctx.
    if (e.phase !== currentPhase) {
      // Stop searching — anything older is also from a different phase, since
      // phase transitions are forward-only in bgio.
      return null;
    }
    if (!e.activeActor || !aiPlayers.includes(e.activeActor)) {
      const target = e;
      history = history.slice(0, j + 1);
      return target.G;
    }
  }
  return null;
}

/** True if there's at least one rewind target available in the current phase. */
export function canTakeBack(aiPlayers: string[], currentPhase: string | undefined): boolean {
  if (history.length < 2) return false;
  for (let j = history.length - 2; j >= 0; j--) {
    const e = history[j];
    if (e.phase !== currentPhase) return false;
    if (!e.activeActor || !aiPlayers.includes(e.activeActor)) return true;
  }
  return false;
}

/** Clear live G + history. Call when leaving a game (back to lobby). */
export function resetLiveG() {
  current = null;
  history = [];
  for (const l of listeners) l(null);
}
