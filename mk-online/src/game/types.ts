// Moonshine Kingdom — core game types
// Designed for boardgame.io: GameState (G) is the single serializable source of truth.

export type PlayerID = string; // bgio uses string IDs ("0".."3")

export type MobFamily =
  | "sicilian"
  | "irish"
  | "vipers"
  | "knights";

export type BoroughId =
  | "manhattan"
  | "bronx"
  | "queens"
  | "brooklyn"
  | "staten";

export type LiquorType = "moonshine" | "gin" | "whisky" | "rum";

export type DistrictTag =
  | "ghetto"
  | "dock"
  | "speakeasy"
  | "highSociety";

export interface District {
  id: string;
  name: string;
  borough: BoroughId;
  tags: DistrictTag[];
  /** House pour for speakeasies. */
  housePour?: LiquorType;
  /** Power broker living here (High Society only). */
  broker?: BrokerId;
  /** Adjacent districts by land/bridge. Docks also implicitly connect to all docks. */
  connections: string[];
}

/** Still token: 25 total, randomly placed one per district at setup. */
export type StillType = "moonshine" | "gin" | "whisky";
export interface StillToken {
  number: number; // 2..12
  type: StillType;
}

export type BrokerId = "walker" | "rothstein" | "stClair" | "guinan";

export interface DistrictState {
  /** Owning player ID (controller), or null if abandoned/police-only. */
  controller: PlayerID | null;
  /** Mobsters present, keyed by player. */
  mobsters: Record<PlayerID, { bosses: number; runners: number }>;
  /** Safehouses present, keyed by player. */
  safehouses: Record<PlayerID, number>;
  /** Liquor barrels present, keyed by player (loose barrels are the controller's). */
  barrels: Record<PlayerID, Record<LiquorType, number>>;
  /** Precinct present? */
  precinct: boolean;
  /** Still token at this district (randomized at setup). */
  still: StillToken | null;
  /** Still already triggered/exploded this Day? Cleared each Shadows phase. */
  stillBrewedThisDay?: boolean;
  stillExplodedThisDay?: boolean;
}

// ---- Cards ----

export type ContractTier = "gig" | "racket" | "score";

export interface ContractCard {
  id: string;
  name: string;
  tier: ContractTier;
  /** Days to deadline (1 for gig, 2 for racket, 3 for score). */
  deadline: number;
  /** Respect on completion (1 / 3 / 5). */
  respect: number;
  /** Cash payout on completion (500 / 1500 / 3000). */
  take: number;
  /** Human-readable objective text (rendered to player). */
  objective: string;
  /** Machine-readable objective spec for engine to check (filled in later). */
  spec?: ObjectiveSpec;
  artPath?: string | null;
}

/** Discriminated union of machine-readable objectives. Populated as we encode each card. */
export type ObjectiveSpec =
  | { kind: "raw"; description: string } // placeholder — manual completion until encoded
  | { kind: "controlDistricts"; districtIds: string[] }
  | { kind: "controlSpeakeasies"; count: number; type?: LiquorType }
  | { kind: "haveBarrels"; type: LiquorType; count: number }
  | { kind: "haveCash"; amount: number };

export interface StakedContract {
  card: ContractCard;
  /** Influence markers remaining on the card; reaches 0 → deadline this Reckoning. */
  markersRemaining: number;
}

export interface FavorCard {
  id: BrokerId;
  name: string;
  district: string;
  effect: string; // human-readable; machine effects applied via switch in engine
}

export type TitleId =
  | "manhattan"
  | "bronx"
  | "queens"
  | "brooklyn"
  | "staten"
  | "wardBoss"
  | "ginSyndicate"
  | "whiskySyndicate"
  | "moonshineSyndicate"
  | "rumSyndicate";

// ---- Player state ----

export interface PlayerState {
  family: MobFamily;
  startingBorough: BoroughId | null;
  cash: number;
  /** Influence in the Stash (uncommitted). */
  stash: number;
  /** Influence in Operations slots (max 5). */
  operations: number;
  /** Influence markers locked on staked contracts. */
  staked: StakedContract[];
  /** Contracts in hand (not yet staked). */
  hand: ContractCard[];
  /** Completed contracts (Respect pile). */
  completed: ContractCard[];
  /** Owned favor cards (broker IDs). */
  favors: BrokerId[];
  /** Outstanding Shylock's Mark loans (number of unpaid marks). */
  shylockMarks: number;
  /** Total Influence pool (default 7, +1 per favor permanent marker, etc.). */
  totalInfluence: number;
  /** Turn token: { moon: "new" | "full", number: 1..4 }. */
  turnToken: { moon: "new" | "full"; number: number };
  /** Has Laid Low this Day. */
  laidLow: boolean;
  /** Has Hustled this Day (once per day limit). */
  hustledThisDay: boolean;
  /** Extort actions used per borough this Day (once per Borough per Day). */
  extortedThisDay: BoroughId[];
  /** Holds the Commission Card? */
  hasCommission: boolean;
  /** Remaining unplaced runners in supply (cap 15 total in play). */
  runnersInSupply: number;
  /** Remaining unplaced bosses in supply (1 default, 2 for Sicilians). */
  bossesInSupply: number;
  /** Remaining unplaced safehouses in supply (3 default). */
  safehousesInSupply: number;
  /** Crippled state if Boss is dead — reduces threat until Rise. */
  bossDown: boolean;
  /** Lifetime count of Kickback markers received from Unload (housePour
   *  match → 1 Stash returns to Ops, snowballing speakeasy specialists).
   *  Tracked separately from cash so we can see who's exploiting it. */
  kickbacksReceived: number;
}

// ---- Phase / turn state ----

export type PhaseId = "shadows" | "operations" | "reckoning";

export type ShadowsSubPhase = "roll" | "draft" | "blowback" | "grease" | "done";

export interface ShadowsState {
  subPhase: ShadowsSubPhase;
  diceRolled: boolean;
  redDice: number[]; // current pool, spliced as drafted
  whiteDice: number[];
  /** Turn order for drafting/greasing this Day. */
  turnOrder: PlayerID[];
  currentDrafterIdx: number;
  currentGreaserIdx: number;
  blowbackNumber: number | null;
  /** Per-player events this Shadows (for log/UI). */
  events: string[];
}

export interface OperationsState {
  /** Player currently taking a Play. */
  currentPlayer: PlayerID | null;
  /** Players still active this Day (not yet Laid Low), in rotation order. */
  turnQueue: PlayerID[];
  /** Players who have Laid Low this Day, in the order they did so. */
  laidLowOrder: PlayerID[];
  /** Combat in progress? */
  combat: CombatState | null;
  /** Police raid in progress? */
  raid: RaidState | null;
  /** Plays counter for the active turn (most Plays = 1; combat is multi-step). */
  playInProgress: boolean;
}

export interface CombatState {
  districtId: string;
  attacker: PlayerID;
  /** Rival defender. For Police-pinned combats this is empty (use vsPolice). */
  defender: PlayerID | null;
  /** True if the attacker is pinned at a Police district (Storm the Precinct). */
  vsPolice: boolean;
  /** Origin district the attacker came from (for Fall Back). */
  originId: string;
  /** Pinned invading force currently at districtId (subset of mobsters that moved). */
  pinned: { bosses: number; runners: number };
  /** Barrels the attacker brought; left for defender if Fall Back. */
  carried: Record<LiquorType, number>;
  /** Defender's choice / current resolution stage. */
  stage: "ambush" | "pinned" | "resolved";
  /** Has the attacker landed kills on the defender this Play? (drives Heat at end) */
  attackerKilled: boolean;
  /** Temporary +Threat for the attacker's NEXT roll (Irish Courage). Resets after use. */
  attackerThreatBonus?: number;
  /** Temporary +Threat for the defender's NEXT Ambush roll (Irish Courage on defense). Resets after use. */
  defenderThreatBonus?: number;
  /** Temporary +dice for the attacker's NEXT roll (Vipers Firepower). Resets after use. */
  attackerExtraDice?: number;
  /** Plunder mode: next Assault/Ambush by attacker steals barrels instead of killing. */
  plunderMode?: boolean;
  /** Awaiting player's plunder picks (set after Plunder Assault rolls hits). */
  pendingPlunder?: { hits: number } | null;
  /** Stealth mode: attacker entered without Ambush; must Assault or Advance, can't Fall Back as free exit at first (still allowed, but rule). */
  stealthEntry?: boolean;
}

export interface RaidState {
  target: PlayerID;
  /** Districts to be hit, in order; one entry per Precinct that found a valid target. */
  hits: Array<{
    precinctDistrictId: string;
    targetDistrictId: string;
    resolved: false | "bribe" | "fall";
  }>;
  /** Index of current hit awaiting decision. */
  currentIdx: number;
}

export interface ReckoningState {
  subPhase: "sweep" | "contracts" | "done";
  /** Contracts that hit their deadline this Reckoning, awaiting player decision. */
  pendingDeadlines: Array<{
    playerID: PlayerID;
    contractIdx: number; // index into player's staked[]
    decided: boolean;
    completed: boolean;
  }>;
  /** Players who have confirmed their Reckoning decisions. */
  confirmed: PlayerID[];
}

// ---- Top-level game state ----

export interface GameState {
  day: number;
  moonPhase: "new" | "full";
  districts: Record<string, DistrictState>;
  players: Record<PlayerID, PlayerState>;
  market: Record<LiquorType, number>;
  /** Titles in play: who holds them (null = supply). */
  titles: Record<TitleId, PlayerID | null>;
  /** Communal Heat Track: ordered list of (owner, position). */
  heat: Array<{ owner: PlayerID }>;
  /** Who currently holds the Rat Card (null = in supply). The holder
   *  cannot Hustle and loses 3 Respect at game end if still holding it. */
  ratCard: PlayerID | null;
  /** Federal Crackdown tracker (4P team variant only). */
  crackdown: number;
  /** Card decks. */
  decks: {
    gig: ContractCard[];
    racket: ContractCard[];
    score: ContractCard[];
    gigDiscard: ContractCard[];
    racketDiscard: ContractCard[];
    scoreDiscard: ContractCard[];
  };
  /** Supply of unused barrels by type. */
  supply: Record<LiquorType, number>;
  /** Unused Shylock's Marks remaining in the bank (12 total at start). */
  shylockMarksInBank: number;
  /** Phase-specific scratch state. */
  shadows: ShadowsState;
  operations: OperationsState;
  reckoning: ReckoningState;
  /** Winner once decided. */
  winner: PlayerID | null;
  /** Free-form log for the in-game ticker. */
  log: string[];
  /** Internal: set when restoring from a save to skip phase re-initialisation. */
  _resumePhase?: string | null;
}
