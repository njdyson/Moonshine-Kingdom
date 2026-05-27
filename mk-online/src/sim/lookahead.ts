// Lookahead helpers for the bot.
//
// `simulateMove` is the simple 1-ply primitive used in Layer 2 — clone state,
// dispatch one move via a sandbox reducer, return the resulting G.
//
// `simulateMoveFull` returns the full new State so the MCTS rollouts in
// `mcts.ts` can chain many moves without re-cloning at every step (the bgio
// reducer is pure — it doesn't mutate its input, so passing the previous
// output back in is safe).

import type { State } from "boardgame.io";
import { CreateGameReducer } from "boardgame.io/internal";
import type { GameState, PlayerID } from "../game/types";
import { MoonshineKingdom } from "../game/game";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _reducer: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getSimReducer(): any {
  if (!_reducer) _reducer = CreateGameReducer({ game: MoonshineKingdom });
  return _reducer;
}

export interface SimMove {
  move: string;
  args: unknown[];
}

function deepClone<T>(value: T): T {
  // structuredClone is ~2-3x faster than JSON.parse(JSON.stringify(...)) on
  // the bgio state and handles undefined / typed arrays without surprises.
  return structuredClone(value);
}

function buildAction(move: SimMove, pid: PlayerID) {
  return {
    type: "MAKE_MOVE" as const,
    payload: { type: move.move, args: move.args, playerID: pid, credentials: "" },
  };
}

/** Simulate one move on a cloned copy of `state` and return the new G.
 *  Returns null if the move was illegal or threw. */
export function simulateMove(
  state: State<GameState>,
  move: SimMove,
  pid: PlayerID,
): GameState | null {
  try {
    const cloned = deepClone(state);
    const newState = getSimReducer()(cloned, buildAction(move, pid));
    if (!newState || !newState.G) return null;
    if (newState._stateID === cloned._stateID) return null;
    return newState.G as GameState;
  } catch {
    return null;
  }
}

/** Simulate one move and return the FULL new State (G + ctx + plugins +
 *  stateID) so callers can chain follow-up dispatches. Returns null if the
 *  move was rejected. The caller is responsible for the initial clone — pass
 *  in a fresh deep copy if `state` is shared with anything else. */
export function simulateMoveFull(
  state: State<GameState>,
  move: SimMove,
  pid: PlayerID,
): State<GameState> | null {
  try {
    const newState = getSimReducer()(state, buildAction(move, pid));
    if (!newState || !newState.G) return null;
    if (newState._stateID === state._stateID) return null;
    return newState as State<GameState>;
  } catch {
    return null;
  }
}

/** Cheap one-shot deep clone of a bgio State. */
export function cloneState(state: State<GameState>): State<GameState> {
  return deepClone(state);
}

