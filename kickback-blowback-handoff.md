# Rum Kickback and the Blowback shield: open proposal

Status (2026-09-22): **Proposal 1 (Rum-only Kickback) is implemented** across the Rulebook,
Kingpin's Guide, Playbooks, Town Planner, `CLAUDE.md` and `mk-online-rules-sync.md` §12.
**Proposal 2 (the shield) is still open**: Nick's lean is to playtest the Rum rule first and
reach for the shield only if doubles still frustrate.

The maths is reproducible with three scripts in `tools/` (plain `node`, no arguments):
`sim_kickback_ledger.js`, `sim_blowback_shield.js`, `sim_blowback_empire.js`.

## Proposal 1: only Havana Rum pays the High Society Kickback (shipped)

**Rule, as shipped:** a High Society Venue buys **Havana Rum and nothing else**, at $500, and
each barrel Unloaded there pays a Kickback. ("The High Society joints don't buy swill.") The
Rum-only Kickback went in first; barring Moonshine from the room followed the same day, after
Nick made the case that it states the room's job in one line and gives the ordinary Speakeasy
next door a reason to be held. Every venue has one adjacent, so Moonshine is never stranded.

**The problem it fixes (Nick's case):** the four High Society Venues sit on the four #7 Stills,
and a 7 can never be locked out by the Harbormaster. Two venues with 7 Mobsters each brew
8 barrels on a firing day; Unloading in place pays $2,400 **and** nets +4 Plays. The stacks are
hard to crack (Safehouse on one, Boss on the other), so the engine snowballs.

**Why it works:** the Kickback now needs a supply chain (Dock, Trade, relay), so the crew can't
all sit on the stacks. It forces every serious player to engage with Trade.

Ledger model, one firing day, Plays against a normal 5-Play Day:

| Engine | Plays | Cash |
| --- | --- | --- |
| Current: 2 stacks, Unload Moonshine in place | +4 | $2,400 |
| New: 2 stacks, Unload Moonshine in place | -4 | $2,400 |
| New: 2 stacks, daily Rum run (Move, Trade, Move, Unload) | -2 | $4,000 |
| Current: 1 venue, 10 barrels in two Unloads | +6 | $3,000 |
| New: 1 venue, 10-barrel batch Rum run | +3 | $5,000 |

Findings:

- A daily Rum run loses Plays; batching still pays, at about half the old rate. Stockpiles sit
  on the board as targets (the Big Bust hits the District with the most Barrels).
- Peak cash does not rise: the $4,000 Rum run was already available. The rule only deletes the
  cheap in-place Play engine.
- Dock distances (from the mk-online board data): West Side, Throggs Neck and Jamaica are each
  1 Move from their Borough's venue; The Havemeyer is 2 from any Dock.
- Knock-ons to watch: the Knights' free Rum makes them the natural Kickback crew; a player
  could hoard Rum to dry the 20-barrel pool and deny rivals Kickbacks.
- It reversed the "address sets the Kickback, barrel sets the price" split in `CLAUDE.md`.
  That split existed to give the Dock and the Night Mayor separate crowns; the Titles are gone
  (v0.9.8), so its reason had lapsed. `CLAUDE.md` has been rewritten.

## Proposal 2: a Still that brewed today can't blow (the shield)

**The frustration:** doubles are everywhere. A 5-die pool holds a pair **90.7%** of the time,
and the leftover matches a face somebody drafted **51.8%** of the time, so about half of all
Blowbacks hit a number that was brewed that morning.

**Rule, tracking-free:** each boss keeps their drafted Red in front of them until the Blowback.
A Still does not burst if its owner drafted a Red of the same face as the leftover.
("The die you draft shields your number.")

Findings:

- Nick's objection to the pure case is right: every Controlled District has an active Still, so
  nobody holds only one number. Modelled empire (two 7-stacks of 7, plus a Dock, Ward and
  Speakeasy of 3 each):

  | | Something blows | Mobsters lost / day |
  | --- | --- | --- |
  | Current rule | 19.1% of days | 0.65 |
  | Shield | 11.9% of days | 0.24 |

- But the **stacks themselves become immune**: the heavy number is always the die you draft,
  so it is always shielded. What Blowback remains falls only on thin outposts (1 to 2 dead).
  Under the current rule, a double 7-stack blows on only about 4% of days (0.35 Mobsters/day),
  so Blowback was never a strong check on it; the shield turns a weak check into none.
- Concern about the mental overhead: the concept is simple but reads as confusing. Likely fine
  after a few Days of play.

**Alternative kept on the table:** keep every Blowback but soften it, e.g. casualties at half
the Mobsters **rounded down** (7 Mobsters lose 3, not 4). Fixes the sting without immunity.

## Rejected: Vent the Pipe

The last seat choosing to discard the leftover die (no Blowback that Day). Rejected because the
last seat already chooses between the final two dice, it makes that seat immune and turns
Blowback into a paid protection racket that favours the richest player, the last seat is
whoever Laid Low last (so it rewards playing late), and it stalls Shadows with negotiation.

## If it ships

Both change the full component set: Rulebook (Blowback step, Unload, the Day 6 worked
example whose moral is "7 paid them and bled them", the Kingpin's Tip), Kingpin's Guide,
Playbooks, Town Planner, Cards, Brew Simulator, and `CLAUDE.md`. The two should be
playtested together: with the shield, the Rum rule is the main brake on the 7-stack.
