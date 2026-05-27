import type { Game } from "boardgame.io";
import { ActivePlayers } from "boardgame.io/core";
import type { GameState } from "./types";
import { setup, freshShadows, freshOperations, freshReckoning } from "./setup";
import {
  rollDice,
  draftDice,
  fundOps,
  confirmGrease,
  stakeContract,
  shadowsTurnOrder,
} from "./shadows";
import {
  buildOpsQueue,
  layLow,
  hustle,
  movePlay,
  recruit,
  secure,
} from "./operations";
import { ambushChoice, fold, assault, advance, fallBack, stormPrecinct, pickPlunder } from "./combat";
import { unload, push, smuggle, extort, fix, bribe, rise, rat } from "./plays";
import { capo, consigliere, courage, plunder, stealth, firepower, skiff, torch } from "./signature";
import { raidBribe, raidTakeTheFall } from "./raid";
import { startReckoning, setContractOutcome, confirmReckoning } from "./reckoning";
import { takeShylockMark, repayShylockMark } from "./shylock";
import { takeBack } from "./takeBack";

export const MoonshineKingdom: Game<GameState> = {
  name: "moonshine-kingdom",
  minPlayers: 2,
  maxPlayers: 4,
  setup,

  phases: {
    shadows: {
      start: true,
      next: "operations",
      // Every player is "active" during Shadows; in-move logic enforces the
      // real turn order via G.shadows.currentDrafterIdx / currentGreaserIdx.
      turn: { activePlayers: ActivePlayers.ALL },
      // Skip shadows entirely when resuming to a later phase.
      endIf: ({ G }) => {
        if (G._resumePhase && G._resumePhase !== "shadows") return true;
      },
      onBegin: ({ G }) => {
        if (G._resumePhase === "shadows") {
          // Resuming mid-shadows — keep saved state, just clear the flag.
          G._resumePhase = null;
          G.log.push(`[Resumed — Day ${G.day}: Shadows]`);
          return;
        }
        if (G._resumePhase) {
          // Resuming to a later phase — endIf will skip; don't touch game state.
          return;
        }
        G.shadows = freshShadows();
        G.shadows.turnOrder = shadowsTurnOrder(G);
        // Reset per-Day flags.
        for (const p of Object.values(G.players)) {
          p.laidLow = false;
          p.hustledThisDay = false;
          p.extortedThisDay = [];
        }
        for (const d of Object.values(G.districts)) {
          d.stillBrewedThisDay = false;
          d.stillExplodedThisDay = false;
        }
        G.log.push(`--- Day ${G.day}: Shadows ---`);
      },
      moves: {
        rollDice,
        draftDice,
        fundOps,
        stakeContract,
        confirmGrease,
        takeShylockMark,
        repayShylockMark,
        // A raid triggered late in Operations may still be pending when we
        // enter the next Shadows phase; expose its resolution moves so the
        // target can finish before phase logic runs.
        raidBribe,
        raidTakeTheFall,
        takeBack,
      },
    },

    operations: {
      next: "reckoning",
      turn: { activePlayers: ActivePlayers.ALL },
      // Skip operations if we're resuming directly to reckoning.
      endIf: ({ G }) => {
        if (G._resumePhase === "reckoning") return true;
      },
      onBegin: ({ G, events }) => {
        if (G._resumePhase === "operations") {
          // Resuming mid-operations — keep saved state, clear flag.
          G._resumePhase = null;
          G.log.push(`[Resumed — Day ${G.day}: Operations]`);
          // Ensure currentPlayer is set if queue is non-empty.
          if (G.operations.currentPlayer === null && G.operations.turnQueue.length > 0) {
            G.operations.currentPlayer = G.operations.turnQueue[0];
          }
          return;
        }
        G.log.push(`--- Day ${G.day}: Operations ---`);
        G.operations = freshOperations();
        G.operations.turnQueue = buildOpsQueue(G);
        // Skip players who never funded any Ops markers (they're already at 0).
        G.operations.turnQueue = G.operations.turnQueue.filter(
          (id) => G.players[id].operations > 0
        );
        // Auto-lay-low for the rest.
        for (const id of Object.keys(G.players)) {
          if (!G.operations.turnQueue.includes(id) && !G.players[id].laidLow) {
            G.players[id].laidLow = true;
            G.operations.laidLowOrder.push(id);
            G.log.push(`P${id} starts Day with 0 Ops; auto Lays Low.`);
          }
        }
        G.operations.currentPlayer = G.operations.turnQueue[0] ?? null;
        if (G.operations.currentPlayer === null) {
          // Edge case: no one funded ops at all.
          G.log.push("Nobody funded Operations; skipping to Reckoning.");
          events.endPhase();
        }
      },
      moves: {
        layLow,
        hustle,
        movePlay,
        recruit,
        secure,
        // Power Plays / Title Plays / Smuggle:
        unload,
        push,
        smuggle,
        extort,
        fix,
        bribe,
        rise,
        rat,
        // Combat moves (active only when G.operations.combat is set):
        ambushChoice,
        fold,
        assault,
        advance,
        fallBack,
        stormPrecinct,
        pickPlunder,
        // Mob signature plays (validated per family inside each move):
        capo,
        consigliere,
        courage,
        plunder,
        stealth,
        firepower,
        skiff,
        torch,
        // Raid moves (active only when G.operations.raid is set):
        raidBribe,
        raidTakeTheFall,
        takeShylockMark,
        repayShylockMark,
        takeBack,
      },
    },

    reckoning: {
      next: "shadows",
      turn: { activePlayers: ActivePlayers.ALL },
      onBegin: ({ G }) => {
        if (G._resumePhase === "reckoning") {
          // Resuming mid-reckoning — keep saved state, clear flag.
          G._resumePhase = null;
          G.log.push(`[Resumed — Day ${G.day}: Reckoning]`);
          return;
        }
        G.log.push(`--- Day ${G.day}: Reckoning ---`);
        G.reckoning = freshReckoning();
      },
      moves: {
        startReckoning,
        setContractOutcome,
        confirmReckoning,
        takeShylockMark,
        repayShylockMark,
        // Same rationale as Shadows: a raid pending from Operations needs to
        // be resolvable here too.
        raidBribe,
        raidTakeTheFall,
        takeBack,
      },
    },
  },

  endIf: ({ G }) => {
    if (G.winner) return { winner: G.winner };
    return undefined;
  },
};
