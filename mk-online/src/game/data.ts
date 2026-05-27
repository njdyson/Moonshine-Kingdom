// Static game data: districts, boroughs, mob playbooks, favors.
// Source of truth: "Turn Structure Flow Card v5.html" (Town Planning Ledger)
// and "Moonshine Kingdom Rules v5.html".

import type { BrokerId, District, MobFamily, LiquorType, StillToken } from "./types";

export const STARTING_MARKET_VALUES: Record<LiquorType, number> = {
  rum: 500,
  whisky: 400,
  gin: 300,
  moonshine: 200,
};

export const STARTING_CASH = 1500;
export const STARTING_INFLUENCE_TOTAL = 7;
export const OPERATIONS_SLOTS = 5;
export const SWEEP_LIMIT = 5; // max mobsters in district after Reckoning
export const HAND_LIMIT_DEFAULT = 3;
export const HAND_LIMIT_WITH_GUINAN = 5;
export const RUNNER_CAP = 15;

export const RECRUIT_COST_DEFAULT = 300;
export const RECRUIT_COST_WARD_BOSS = 200;
export const SECURE_COST = 500;
export const BRIBE_COST = 2500;
export const SHYLOCK_REPAY_DEFAULT = 2500;
export const SHYLOCK_REPAY_WITH_ROTHSTEIN = 1500;
export const RAID_BRIBE_COST = 1000;
export const STORM_PRECINCT_COST = 1;
export const SHYLOCK_LOAN_AMOUNT = 1500;
export const SHYLOCK_MARKS_TOTAL = 12;

// ---- Districts ----
// `connections` will be filled in once we extract the adjacency graph from the
// board image. For now, intra-borough fully-connected as a placeholder so
// movement/connectivity code can be exercised. Adjacency TODO is tracked
// separately; rule for docks (all docks connect to each other) is handled in
// the connectivity helper, not in this list.

const M = "manhattan" as const;
const B = "bronx" as const;
const Q = "queens" as const;
const K = "brooklyn" as const;
const S = "staten" as const;

interface DistrictSeed {
  id: string;
  name: string;
  borough: typeof M | typeof B | typeof Q | typeof K | typeof S;
  tags: District["tags"];
  housePour?: LiquorType;
  broker?: BrokerId;
  /** Approximate (x, y) in 0–100 percent of the board image. Tune in calibrate mode. */
  mapCenter: { x: number; y: number };
}

const SEEDS: DistrictSeed[] = [
  // Manhattan (6)
  { id: "sugarHill", name: "Sugar Hill", borough: M, tags: ["highSociety", "speakeasy"], housePour: "rum", broker: "stClair", mapCenter: { x: 40.4, y: 21.6 } },
  { id: "eastHarlem", name: "East Harlem", borough: M, tags: ["speakeasy"], housePour: "whisky", mapCenter: { x: 54.1, y: 33.8 } },
  { id: "tenderloin", name: "The Tenderloin", borough: M, tags: ["speakeasy"], housePour: "gin", mapCenter: { x: 32.6, y: 39.3 } },
  { id: "westSide", name: "West Side", borough: M, tags: ["dock"], mapCenter: { x: 40.8, y: 30.4 } },
  { id: "bowery", name: "The Bowery", borough: M, tags: ["dock"], mapCenter: { x: 21.2, y: 57.9 } },
  { id: "fivePoints", name: "Five Points", borough: M, tags: ["ghetto"], mapCenter: { x: 27.4, y: 47.2 } },

  // Bronx (5)
  { id: "morrisPark", name: "Morris Park", borough: B, tags: ["highSociety", "speakeasy"], housePour: "rum", broker: "walker", mapCenter: { x: 88.7, y: 16.2 } },
  { id: "belmont", name: "Belmont", borough: B, tags: ["speakeasy"], housePour: "whisky", mapCenter: { x: 57.2, y: 13.2 } },
  { id: "fordham", name: "Fordham", borough: B, tags: ["speakeasy"], housePour: "moonshine", mapCenter: { x: 75.0, y: 14.9 } },
  { id: "throggsNeck", name: "Throggs Neck", borough: B, tags: ["dock"], mapCenter: { x: 81.7, y: 26.4 } },
  { id: "huntsPoint", name: "Hunts Point", borough: B, tags: ["ghetto"], mapCenter: { x: 68.6, y: 26.3 } },

  // Queens (6)
  { id: "richmondHill", name: "Richmond Hill", borough: Q, tags: ["highSociety", "speakeasy"], housePour: "gin", broker: "guinan", mapCenter: { x: 82.7, y: 68.5 } },
  { id: "astoria", name: "Astoria", borough: Q, tags: ["speakeasy"], housePour: "rum", mapCenter: { x: 66.9, y: 44.9 } },
  { id: "flushing", name: "Flushing", borough: Q, tags: ["speakeasy"], housePour: "moonshine", mapCenter: { x: 86.0, y: 54.7 } },
  { id: "whitestone", name: "Whitestone", borough: Q, tags: ["dock"], mapCenter: { x: 82.9, y: 40.6 } },
  { id: "jamaica", name: "Jamaica", borough: Q, tags: ["dock"], mapCenter: { x: 85.9, y: 88.0 } },
  { id: "corona", name: "Corona", borough: Q, tags: ["ghetto"], mapCenter: { x: 70.8, y: 58.4 } },

  // Brooklyn (5)
  { id: "williamsburg", name: "Williamsburg", borough: K, tags: ["highSociety", "speakeasy"], housePour: "gin", broker: "rothstein", mapCenter: { x: 55.6, y: 59.8 } },
  { id: "coneyIsland", name: "Coney Island", borough: K, tags: ["speakeasy"], housePour: "whisky", mapCenter: { x: 33.8, y: 88.6 } },
  { id: "redHook", name: "Red Hook", borough: K, tags: ["speakeasy"], housePour: "moonshine", mapCenter: { x: 42.1, y: 70.1 } },
  { id: "sheepsheadBay", name: "Sheepshead Bay", borough: K, tags: ["dock"], mapCenter: { x: 49.4, y: 88.2 } },
  { id: "brownsville", name: "Brownsville", borough: K, tags: ["ghetto"], mapCenter: { x: 64.7, y: 76.7 } },

  // Staten Island (3)
  { id: "stapleton", name: "Stapleton", borough: S, tags: ["ghetto"], mapCenter: { x: 17.1, y: 83.0 } },
  { id: "westerleigh", name: "Westerleigh", borough: S, tags: ["dock"], mapCenter: { x: 10.6, y: 72.8 } },
  { id: "tottenville", name: "Tottenville", borough: S, tags: ["dock"], mapCenter: { x: 11.7, y: 93.2 } },
];

/**
 * Land + Bridge adjacencies, read from the board image. Dock-to-dock waterway
 * connections are NOT listed here — they're applied implicitly by movement
 * code via the `dock` tag.
 *
 * Pairs only need to be listed once; the loop further below makes the graph
 * symmetric.
 *
 * Source legend:
 *   [R] = stated explicitly in the rulebook
 *   [B] = read from the board image
 */
const ADJACENCY_PAIRS: [string, string][] = [
  // ---- Manhattan internal ----
  ["sugarHill", "westSide"],         // [B]
  ["sugarHill", "eastHarlem"],       // [B]
  ["westSide", "eastHarlem"],        // [B]
  ["westSide", "tenderloin"],        // [B]
  ["eastHarlem", "tenderloin"],      // [B]
  ["tenderloin", "fivePoints"],      // [B]
  ["tenderloin", "bowery"],          // [B]
  ["fivePoints", "bowery"],          // [B]

  // ---- Bronx internal ----
  ["belmont", "fordham"],            // [B]
  ["fordham", "morrisPark"],         // [B]
  ["belmont", "huntsPoint"],         // [B]
  ["fordham", "huntsPoint"],         // [B]
  ["fordham", "throggsNeck"],        // [B]
  ["morrisPark", "throggsNeck"],     // [B]
  ["huntsPoint", "throggsNeck"],     // [B]

  // ---- Queens internal ----
  ["astoria", "whitestone"],         // [B]
  ["astoria", "corona"],             // [B]
  ["whitestone", "flushing"],        // [B]
  ["whitestone", "corona"],          // [B]
  ["flushing", "corona"],            // [B]
  ["flushing", "richmondHill"],      // [B]
  ["corona", "richmondHill"],        // [B]
  ["richmondHill", "jamaica"],       // [B]

  // ---- Brooklyn internal ----
  ["williamsburg", "redHook"],       // [R][B]
  ["williamsburg", "brownsville"],   // [R][B]
  ["redHook", "brownsville"],        // [B]
  ["redHook", "coneyIsland"],        // [B]
  ["coneyIsland", "sheepsheadBay"],  // [B]
  ["sheepsheadBay", "brownsville"],  // [B]

  // ---- Staten Island internal ----
  ["westerleigh", "stapleton"],      // [B]
  ["stapleton", "tottenville"],      // [B]

  // ---- Cross-borough land borders ----
  ["sugarHill", "belmont"],          // [B] Manhattan ↔ Bronx (top)
  ["eastHarlem", "huntsPoint"],      // [B] Manhattan ↔ Bronx
  ["throggsNeck", "whitestone"],     // [B] Bronx ↔ Queens
  ["williamsburg", "corona"],        // [R] Brooklyn ↔ Queens
  ["williamsburg", "astoria"],       // [R] Brooklyn ↔ Queens
  ["brownsville", "corona"],         // [B] Brooklyn ↔ Queens

  // ---- Bridges across water ----
  ["fivePoints", "williamsburg"],    // [R] Manhattan ↔ Brooklyn (the Bowery-area bridge)
  ["eastHarlem", "astoria"],         // [B] Manhattan ↔ Queens (bridge over the East River)

  // (Staten Island has no land/bridge link to any other borough — connections
  // are dock-to-dock waterway via Westerleigh / Tottenville only.)
];

const ADJACENCY: Record<string, string[]> = {};
for (const [a, b] of ADJACENCY_PAIRS) {
  (ADJACENCY[a] ??= []).push(b);
  (ADJACENCY[b] ??= []).push(a);
}

function intraBoroughConnections(id: string, _borough: string): string[] {
  return ADJACENCY[id] ?? [];
}

export const DISTRICTS: (District & { mapCenter: { x: number; y: number } })[] = SEEDS.map((s) => ({
  ...s,
  connections: intraBoroughConnections(s.id, s.borough),
}));

/**
 * The 25 still tokens, fixed type+number per the physical game.
 * Distribution: 7 Whisky, 8 Gin, 10 Moonshine.
 */
export const STILL_TOKENS: StillToken[] = [
  // Whisky (7)
  { type: "whisky", number: 2 },
  { type: "whisky", number: 3 },
  { type: "whisky", number: 5 },
  { type: "whisky", number: 7 },
  { type: "whisky", number: 8 },
  { type: "whisky", number: 11 },
  { type: "whisky", number: 12 },
  // Gin (8)
  { type: "gin", number: 2 },
  { type: "gin", number: 3 },
  { type: "gin", number: 4 },
  { type: "gin", number: 6 },
  { type: "gin", number: 7 },
  { type: "gin", number: 9 },
  { type: "gin", number: 10 },
  { type: "gin", number: 11 },
  // Moonshine (10)
  { type: "moonshine", number: 2 },
  { type: "moonshine", number: 4 },
  { type: "moonshine", number: 5 },
  { type: "moonshine", number: 6 },
  { type: "moonshine", number: 7 },
  { type: "moonshine", number: 8 },
  { type: "moonshine", number: 9 },
  { type: "moonshine", number: 10 },
  { type: "moonshine", number: 11 },
  { type: "moonshine", number: 12 },
];

export const DISTRICT_BY_ID: Record<string, District> = Object.fromEntries(
  DISTRICTS.map((d) => [d.id, d])
);

// Adjacency is now authored in ADJACENCY_PAIRS above and applied through
// intraBoroughConnections at DISTRICTS build time. No post-hoc fixup needed.

// Town Planning Ledger order (federal rebuilding priority per borough).
export const REBUILD_PRIORITY: Record<District["borough"], string[]> = {
  manhattan: ["sugarHill", "eastHarlem", "tenderloin", "westSide", "bowery", "fivePoints"],
  bronx: ["morrisPark", "belmont", "fordham", "throggsNeck", "huntsPoint"],
  queens: ["richmondHill", "astoria", "flushing", "whitestone", "jamaica", "corona"],
  brooklyn: ["williamsburg", "coneyIsland", "redHook", "sheepsheadBay", "brownsville"],
  staten: ["stapleton", "westerleigh", "tottenville"],
};

// Initial Precinct districts: each borough's High Society + Stapleton.
export const INITIAL_PRECINCTS = [
  "sugarHill",
  "morrisPark",
  "richmondHill",
  "williamsburg",
  "stapleton",
];

/**
 * Coastal Districts — districts with shoreline. The Knights' Skiff signature
 * Play moves between any two Coastal Districts (ignoring the connection
 * graph). Only 4 districts are NOT coastal: Fordham, Corona, Richmond Hill,
 * Flushing (all inland).
 */
const NON_COASTAL = new Set(["fordham", "corona", "richmondHill", "flushing"]);

export function isCoastal(districtId: string): boolean {
  return !NON_COASTAL.has(districtId);
}

// ---- Boroughs ----

export const BOROUGHS = [
  { id: M, name: "Manhattan", respect: 3 },
  { id: B, name: "The Bronx", respect: 3 },
  { id: Q, name: "Queens", respect: 3 },
  { id: K, name: "Brooklyn", respect: 3 },
  { id: S, name: "Staten Island", respect: 2 },
] as const;

// ---- Mob Playbooks ----

export interface MobDefinition {
  id: MobFamily;
  name: string;
  tagline: string;
  bosses: 1 | 2;
  signaturePlays: { name: string; cost: number; description: string }[];
}

export const MOB_DEFINITIONS: Record<MobFamily, MobDefinition> = {
  sicilian: {
    id: "sicilian",
    name: "Sicilian Syndicate",
    tagline: "Old blood, older rules.",
    bosses: 2,
    signaturePlays: [
      { name: "Capo", cost: 2, description: "Promote a Runner to a second Boss (+1 Threat; +2 with both Bosses)." },
      { name: "Consigliere", cost: 1, description: "Remove 1 marker from the Heat Track, return to owner's Stash." },
    ],
  },
  irish: {
    id: "irish",
    name: "Hell's Kitchen Irish",
    tagline: "They brew it strong and fight dirty.",
    bosses: 1,
    signaturePlays: [
      { name: "Courage", cost: 0, description: "Before you roll in a fight, discard 1 of your barrels in the combat district for +1 Threat for that roll (max 4). Cannot be stacked — at most one use per combat." },
      { name: "Plunder", cost: 1, description: "Special attack: hits steal liquor instead of killing. No Heat. Ambush version costs 0." },
    ],
  },
  vipers: {
    id: "vipers",
    name: "East Side Vipers",
    tagline: "They move like smoke and strike like snakes.",
    bosses: 1,
    signaturePlays: [
      { name: "Stealth", cost: 1, description: "Move up to 5 mobsters (no liquor) into rival district without Ambush. Must Assault or Advance." },
      { name: "Firepower", cost: 0, description: "Pay $200 flat when Assaulting/Ambushing to roll exactly one additional attack die (max 5 dice total). Cannot be stacked. Cannot be used when defending an Assault." },
    ],
  },
  knights: {
    id: "knights",
    name: "Harlem Knights",
    tagline: "Dressed to kill, literally.",
    bosses: 1,
    signaturePlays: [
      { name: "Skiff", cost: 1, description: "Move up to 5 mobsters (with liquor) between Coastal Districts without Docks." },
      { name: "Torch", cost: 2, description: "Burn down a rival Safehouse. Requires Pinned Runner (sacrificed). Generates Heat." },
    ],
  },
};

// ---- Favors ----

export const FAVORS: Record<BrokerId, { name: string; district: string; effect: string }> = {
  walker: {
    name: "Mayor Jimmy Walker",
    district: "morrisPark",
    effect: "City Hall Pass: Your Districts may hold any number of mobsters without penalty during The Sweep.",
  },
  rothstein: {
    name: "Arnold Rothstein",
    district: "williamsburg",
    effect: "The Inside Vig: Repay each Shylock's Mark for $1,500 instead of $2,500.",
  },
  stClair: {
    name: "Stephanie St. Clair",
    district: "sugarHill",
    effect: "Untouchable: Ignore the Greed Tax. Unload 4+ barrels without generating Heat.",
  },
  guinan: {
    name: "Texas Guinan",
    district: "richmondHill",
    effect: "High Society Whispers: Hustle draws 3 Contracts (not 2). Hand Limit becomes 5.",
  },
};

// ---- Production & Combat ratios ----

export function productionCap(mobsters: number): { brewed: number; dead: number } {
  if (mobsters <= 0) return { brewed: 0, dead: 0 };
  if (mobsters <= 2) return { brewed: 1, dead: 1 };
  if (mobsters <= 4) return { brewed: 2, dead: 2 };
  return { brewed: 3, dead: 3 };
}

export function combatDice(mobsters: number): number {
  if (mobsters <= 0) return 0;
  if (mobsters <= 2) return 1;
  if (mobsters <= 4) return 2;
  if (mobsters <= 6) return 3;
  if (mobsters <= 8) return 4;
  return 5;
}

export function smugglingDice(crew: number): number {
  if (crew <= 0) return 0;
  if (crew <= 2) return 1;
  if (crew <= 4) return 2;
  return 3;
}

export function smugglingTarget(docksControlled: number): number {
  if (docksControlled <= 1) return 5;
  if (docksControlled === 2) return 4;
  if (docksControlled === 3) return 3;
  return 2;
}

/** Threat level (1..4) → minimum die value that kills. */
export function killThreshold(threat: number): number {
  const clamped = Math.max(1, Math.min(4, threat));
  return 6 - clamped; // 1→5, 2→4, 3→3, 4→2
}
