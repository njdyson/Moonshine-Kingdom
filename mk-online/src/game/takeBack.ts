// Take Back move — restores a previously-captured G snapshot in place.
//
// History is maintained client-side (ui/liveState.ts); the engine just
// receives the snapshot it should restore and replaces every top-level field
// of the live G. We assign each field explicitly (rather than Object.assign
// + delete) because the iterate-and-delete pattern on an Immer draft was
// observed to break bgio's Local() multiplayer sync — only the dispatching
// client would update, leaving sibling clients diverged.

import type { Move } from "boardgame.io";
import type { GameState } from "./types";

export const takeBack: Move<GameState> = ({ G }, snapshot: GameState) => {
  if (!snapshot || typeof snapshot !== "object") {
    G.log.push("Take Back: invalid snapshot, ignored.");
    return;
  }
  // Deep clone so we never write Immer drafts that point into shared refs
  // (the snapshot is JSON-parsed plain data already, but being explicit
  // makes the move robust against future callers).
  const s = JSON.parse(JSON.stringify(snapshot)) as GameState;
  G.day = s.day;
  G.moonPhase = s.moonPhase;
  G.districts = s.districts;
  G.players = s.players;
  G.market = s.market;
  G.titles = s.titles;
  G.heat = s.heat;
  G.crackdown = s.crackdown;
  G.decks = s.decks;
  G.supply = s.supply;
  G.shylockMarksInBank = s.shylockMarksInBank;
  G.shadows = s.shadows;
  G.operations = s.operations;
  G.reckoning = s.reckoning;
  G.winner = s.winner;
  G.log = s.log;
  G._resumePhase = s._resumePhase ?? null;
  G.log.push("↶ Take Back: rewound to before the last human action.");
};
