import type { LiquorType, StillType } from "../game/types";

// Source: Game Assets/Mob Playbooks v5.html .section-title background-color per mob class.
// Canonical mob names live in game/data.ts MOB_DEFINITIONS.
export const MOB_COLORS: Record<string, string> = {
  sicilian: "#000000", // Sicilian Syndicate — black
  irish:    "#003600", // Hell's Kitchen Irish — dark green
  vipers:   "#5f0000", // East Side Vipers — dark crimson
  knights:  "#310158", // Harlem Knights — dark purple
};

/** Derive the colour map for all players in the current game from their families. */
export function buildPlayerColors(
  players: Record<string, { family: string }>
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(players).map(([id, p]) => [id, MOB_COLORS[p.family] ?? "#555"])
  );
}

// Source: Game Assets/Still Tokens v4.5.html CSS (.whisky/.gin/.moonshine background)
export const STILL_COLOR: Record<StillType, string> = {
  moonshine: "#646464",
  gin:       "#9837a5",
  whisky:    "#d4af37",
};

export const LIQUOR_COLOR: Record<LiquorType, string> = {
  moonshine: "#646464",
  gin:       "#9837a5",
  whisky:    "#d4af37",
  rum:       "#c4946b", // no still token in game; barrel colour unchanged
};
