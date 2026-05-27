import type {
  GameState,
  PlayerState,
  PlayerID,
  MobFamily,
  BoroughId,
  DistrictState,
  LiquorType,
  TitleId,
} from "./types";
import {
  DISTRICTS,
  INITIAL_PRECINCTS,
  MOB_DEFINITIONS,
  OPERATIONS_SLOTS,
  STARTING_CASH,
  STARTING_INFLUENCE_TOTAL,
  STARTING_MARKET_VALUES,
  STILL_TOKENS,
} from "./data";
import { CONTRACTS_BY_TIER } from "./cards.generated";

const LIQUOR_TYPES: LiquorType[] = ["moonshine", "gin", "whisky", "rum"];

function emptyBarrels(): Record<LiquorType, number> {
  return { moonshine: 0, gin: 0, whisky: 0, rum: 0 };
}

function freshDistrict(precinct: boolean): DistrictState {
  return {
    controller: null,
    mobsters: {},
    safehouses: {},
    barrels: {},
    precinct,
    still: null,
  };
}

/** Fisher-Yates shuffle of a fresh copy (uses Math.random; pre-bgio setup
 * has no access to the seeded RNG, so games are non-reproducible from the
 * seed for now. Acceptable until we wire seed handling). */
function shuffle<T>(arr: T[]): T[] {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function freshPlayer(family: MobFamily, idx: number): PlayerState {
  const def = MOB_DEFINITIONS[family];
  return {
    family,
    startingBorough: null,
    cash: STARTING_CASH,
    stash: STARTING_INFLUENCE_TOTAL - OPERATIONS_SLOTS, // 2
    operations: OPERATIONS_SLOTS, // 5 markers in ops slots at setup
    staked: [],
    hand: [],
    completed: [],
    favors: [],
    shylockMarks: 0,
    totalInfluence: STARTING_INFLUENCE_TOTAL,
    turnToken: { moon: "new", number: idx + 1 }, // randomized later in setup move
    laidLow: false,
    hustledThisDay: false,
    extortedThisDay: [],
    hasCommission: false,
    runnersInSupply: 15,
    bossesInSupply: def.bosses,
    safehousesInSupply: 3,
    bossDown: false,
    kickbacksReceived: 0,
  };
}

// All four families and boroughs; both are shuffled at setup time.
const ALL_FAMILIES: MobFamily[] = ["sicilian", "irish", "vipers", "knights"];

// All four non-Staten boroughs; shuffled at setup time.
const ALL_BOROUGHS: Exclude<BoroughId, "staten">[] = [
  "manhattan",
  "brooklyn",
  "queens",
  "bronx",
];

// Authoritative starting turf per Borough Deed (source: Borough Deeds and the
// Turn Structure Flow Card v5 "Start: ..." annotations). Hard-coded rather
// than derived from tags because Manhattan/Queens have multiple
// docks/speakeasies and only one is the starting one.
const STARTING_TURF: Record<Exclude<BoroughId, "staten">, {
  ghetto: string;
  dock: string;
  speakeasy: string;
}> = {
  manhattan: { ghetto: "fivePoints", dock: "westSide", speakeasy: "eastHarlem" },
  bronx: { ghetto: "huntsPoint", dock: "throggsNeck", speakeasy: "belmont" },
  queens: { ghetto: "corona", dock: "jamaica", speakeasy: "astoria" },
  brooklyn: { ghetto: "brownsville", dock: "sheepsheadBay", speakeasy: "coneyIsland" },
};

function startingDistrictsFor(borough: Exclude<BoroughId, "staten">) {
  return STARTING_TURF[borough];
}

export function setup({ ctx }: { ctx: { numPlayers: number } }): GameState {
  // Resume from a saved game. Key is set by Lobby.resume() and cleared by
  // Lobby.start() (New Game). We intentionally do NOT remove it here because
  // React Strict Mode / Local() transport call setup() multiple times; all
  // calls should return the same saved state.
  if (typeof window !== "undefined") {
    const pending = window.localStorage.getItem("mk-resume-pending");
    if (pending) {
      try {
        return JSON.parse(pending) as GameState;
      } catch {
        // Fall through to normal setup if JSON is corrupt.
      }
    }
  }

  const numPlayers = ctx.numPlayers;
  const players: Record<PlayerID, PlayerState> = {};
  const districts: Record<string, DistrictState> = {};

  for (const d of DISTRICTS) {
    districts[d.id] = freshDistrict(INITIAL_PRECINCTS.includes(d.id));
  }

  // Randomly assign the 25 Still tokens (7 Whisky / 8 Gin / 10 Moonshine,
  // each pre-paired with its activation number 2-12) to the 25 districts.
  const shuffledStills = shuffle(STILL_TOKENS);
  DISTRICTS.forEach((d, i) => {
    districts[d.id].still = shuffledStills[i];
  });

  // Use Lobby-selected assignments if available, otherwise fall back to a
  // random shuffle. The Lobby writes "mk-setup-picks" before calling onStart.
  let families: MobFamily[] = shuffle([...ALL_FAMILIES]);
  let boroughs: Exclude<BoroughId, "staten">[] = shuffle([...ALL_BOROUGHS]);
  if (typeof window !== "undefined") {
    try {
      const picks = window.localStorage.getItem("mk-setup-picks");
      if (picks) {
        const p = JSON.parse(picks) as { families: MobFamily[]; boroughs: string[] };
        if (Array.isArray(p.families) && p.families.length >= numPlayers)
          families = p.families;
        if (Array.isArray(p.boroughs) && p.boroughs.length >= numPlayers)
          boroughs = p.boroughs as Exclude<BoroughId, "staten">[];
      }
    } catch { /* ignore corrupt picks */ }
  }

  // Players
  for (let i = 0; i < numPlayers; i++) {
    const id = String(i);
    const family = families[i];
    const p = freshPlayer(family, i);
    if (i < boroughs.length) {
      p.startingBorough = boroughs[i];
    }
    players[id] = p;

    if (p.startingBorough && p.startingBorough !== "staten") {
      const starts = startingDistrictsFor(p.startingBorough);
      // Ghetto: 1 Safehouse, 1 Boss, 2 Runners
      const ghetto = districts[starts.ghetto];
      ghetto.controller = id;
      ghetto.mobsters[id] = { bosses: 1, runners: 2 };
      ghetto.safehouses[id] = 1;
      ghetto.barrels[id] = emptyBarrels();
      p.bossesInSupply -= 1;
      p.runnersInSupply -= 2;
      p.safehousesInSupply -= 1;
      // Dock: 3 Runners
      const dock = districts[starts.dock];
      dock.controller = id;
      dock.mobsters[id] = { bosses: 0, runners: 3 };
      dock.barrels[id] = emptyBarrels();
      p.runnersInSupply -= 3;
      // Speakeasy: 3 Runners
      const spk = districts[starts.speakeasy];
      spk.controller = id;
      spk.mobsters[id] = { bosses: 0, runners: 3 };
      spk.barrels[id] = emptyBarrels();
      p.runnersInSupply -= 3;
    }
  }

  // Each mob holds the deed to its starting borough from turn 1 — this is
  // what lets them Extort their own neighbourhood on Day 1 instead of waiting
  // for the first Reckoning to redistribute titles. Reckoning's
  // redistributeTitles() will keep validating these against district counts
  // (min 2 controlled), and each mob starts with 3 districts in-borough so
  // the deed naturally renews.
  const titles: GameState["titles"] = {
    manhattan: null,
    bronx: null,
    queens: null,
    brooklyn: null,
    staten: null,
    wardBoss: null,
    ginSyndicate: null,
    whiskySyndicate: null,
    moonshineSyndicate: null,
    rumSyndicate: null,
  };
  for (let i = 0; i < numPlayers; i++) {
    const id = String(i);
    const b = players[id].startingBorough;
    if (b && b !== "staten") {
      titles[b as TitleId] = id;
    }
  }

  return {
    day: 1,
    moonPhase: "new",
    districts,
    players,
    market: { ...STARTING_MARKET_VALUES },
    titles,
    heat: [],
    ratCard: null,
    crackdown: 0,
    decks: {
      // Shuffle all three decks at setup so every game draws in a different order.
      gig: shuffle([...CONTRACTS_BY_TIER.gig]),
      racket: shuffle([...CONTRACTS_BY_TIER.racket]),
      score: shuffle([...CONTRACTS_BY_TIER.score]),
      gigDiscard: [],
      racketDiscard: [],
      scoreDiscard: [],
    },
    supply: { moonshine: 25, gin: 25, whisky: 25, rum: 25 }, // 100 barrels / 4 types
    shylockMarksInBank: 12,
    shadows: freshShadows(),
    operations: freshOperations(),
    reckoning: freshReckoning(),
    winner: null,
    log: ["Game setup complete."],
    _resumePhase: null,
  };
}

export function freshReckoning(): GameState["reckoning"] {
  return {
    subPhase: "sweep",
    pendingDeadlines: [],
    confirmed: [],
  };
}

export function freshOperations(): GameState["operations"] {
  return {
    currentPlayer: null,
    turnQueue: [],
    laidLowOrder: [],
    combat: null,
    raid: null,
    playInProgress: false,
  };
}

export function freshShadows(): GameState["shadows"] {
  return {
    subPhase: "roll",
    diceRolled: false,
    redDice: [],
    whiteDice: [],
    turnOrder: [],
    currentDrafterIdx: 0,
    currentGreaserIdx: 0,
    blowbackNumber: null,
    events: [],
  };
}

export const _LIQUOR_TYPES = LIQUOR_TYPES;
