// Shylock's Mark: emergency loans with teeth.
//
// "At any time before the endgame triggers" — these moves can fire in any phase.
// Wiring them at the top level of the Game (not under a phase) keeps them
// universally available. Each Mark: +$1,500 on take; -$2,500 to repay
// ($1,500 with Rothstein's Favor); -1 Respect at game end per unpaid Mark.

import type { Move } from "boardgame.io";
import type { GameState } from "./types";
import {
  SHYLOCK_LOAN_AMOUNT,
  SHYLOCK_REPAY_DEFAULT,
  SHYLOCK_REPAY_WITH_ROTHSTEIN,
} from "./data";

export const takeShylockMark: Move<GameState> = ({ G, playerID }) => {
  if (!playerID) return;
  if (G.shylockMarksInBank <= 0) return;
  const p = G.players[playerID];
  p.cash += SHYLOCK_LOAN_AMOUNT;
  p.shylockMarks += 1;
  G.shylockMarksInBank -= 1;
  G.log.push(`P${playerID} takes Shylock's Mark: +$${SHYLOCK_LOAN_AMOUNT} (now ${p.shylockMarks} marks)`);
};

export const repayShylockMark: Move<GameState> = ({ G, playerID }) => {
  if (!playerID) return;
  const p = G.players[playerID];
  if (p.shylockMarks <= 0) return;
  const cost = p.favors.includes("rothstein")
    ? SHYLOCK_REPAY_WITH_ROTHSTEIN
    : SHYLOCK_REPAY_DEFAULT;
  if (p.cash < cost) {
    G.log.push(`P${playerID} repay failed: needs $${cost}, has $${p.cash}.`);
    return;
  }
  p.cash -= cost;
  p.shylockMarks -= 1;
  G.shylockMarksInBank += 1;
  G.log.push(`P${playerID} repays Shylock's Mark: -$${cost} (${p.shylockMarks} remaining)`);
};
