# The rules streamline: shipped core, open remainder

**Status: the core shipped in v0.9.7 (2026-09-10).** Borough Deeds are cut, Titles pay no
Respect, Respect is Jobs only at a 10-point crown, the Rat is 2 Respect, the Blood Oath is
20 combined, Titles still move at Stake Your Claim, and the Bribe ladder escalates
($2,000 / $3,000 / $4,000 / $5,000). Every player-facing component reads that way.

**Still open, and not to be implemented without Nick asking:** the Sweep (The Commissioner's
Ear), the 2-player North vs South mode, and Borough drafting in reverse Turn Order. Setup
today picks home turf clockwise from a random boss, which is the smallest change that worked
without Deeds to deal; it is not the draft.

The rest of this file is the record of the discussion as it stood before the decision, kept
so the reasoning survives. Where it says "if it ships", it shipped, except for the Sweep.

Last worked: 2026-09-10.

## The direction, as it stood at the end of the session

Nick proposed a streamline of the whole rules loop, then refined it in discussion. What is
below is the refined version, not the first draft. Where a point was settled in discussion it
says so; where it is still open it says that too.

**Settled in discussion (pending Nick's sleep on it):**

- **Borough Deeds are cut.** All five cards leave the box. The Borough majority count stops
  being a scoring object.
- **Titles are worth 0 Respect.** Ward Boss, Harbormaster and Night Mayor keep their powers
  (Union Fee, naming the Mash, placing and sliding Hotspot Tokens) and pay nothing at the count.
- **Respect comes from Jobs only.** The win is 10 Influence, 10 Respect, Honor intact, checked
  once a Day at the moment the last player Lays Low. Tiebreak: highest Respect, then fattest
  bankroll.
- **Any combination of Jobs reaches 10.** There is no gate that requires a particular Job value.
  Nick's reasoning: the market concept is more central than any one card, and this keeps the
  v0.8 decision that cards carry no tier word (Gig, Racket and Score are retired; see
  `jobs-system-handoff.md` §2). The draft's "Grade I/II/III" names are therefore dropped along
  with the gate.
- **Titles are evaluated at the end of the Day**, not at the end of every Play. Nick backtracked
  on the draft's immediate evaluation for being fiddly and for flip-flopping when a crew empties
  a District for a turn to move through it. The repo already argues this side: two of the three
  Titles only act at the Morning Fix, and the Guide treats the nightfall delay on Ward Boss as a
  timing decision (take the Ward the Day before you mass recruit).
- **Rat Card at 2 Respect, not 3.** At a 10-point target, 3 was 30% of the crown.
- **Blood Oath at 20 combined Respect**, two winners' worth, matching the current 30 = 2 × 15.

**Still open:**

- **The Sweep.** The draft removes the universal Sweep and gives the Sicilians a new trait, The
  Commissioner's Ear: at Sunset they may call a citywide Sweep that thins every District above
  5 Mobsters, their own included. Not settled. See "The Sweep" below.
- **The Bribe ladder.** Three shapes were discussed; see "The Bribe ladder" below. Nick leans
  toward an escalating cash cost and no gate.
- **Game length.** Nick is inclined to concede that this is a 2 to 3 hour game rather than
  cram it into 90 minutes. A faster end-of-Day sequence is part of that trade; see below.
- **The 2-player mode** (North vs South, Staten closed, four Staten Jobs removed for a 28-card
  deck) and **Borough drafting** for 3 to 4 players (reverse Turn Order, empty mainland Borough).
  Neither was argued against; neither was worked through. The 2-player mode is a whole new
  section, not a tweak: the Rulebook today has only the "short table" Turn Token note.

## Why cutting Deeds and Title Respect is the right move

The argument, so it is not re-litigated:

- **Jobs already require turf.** Unload needs a Speakeasy you Control, Trade a Dock, Recruit a
  Safehouse in a Ward, and the Borough Jobs need presence in a Borough. Holding turf was paid
  twice: as the prerequisite for the Job and again as 2 Respect at nightfall. Cutting the second
  payment removes the double count without removing the reason to hold turf. Turf feeds cash,
  cash feeds Bribes, Bribes feed the Influence track. Each axis gets one source.
- **Respect becomes a pile that only goes up.** Today it is recomputed every Reckoning from
  Deeds, Titles, the Jobs pile, the Rat and the Welshers, and it can fall when a Borough slips.
  Under the direction it is a stack of cards anyone can count across the table.
- **Titles at zero still pull.** Naming the Mash, placing the Hotspot and taxing every rival
  Recruit are each worth fighting over on their own, and the Guide's Ward and Dock timing
  arguments already rest on the powers rather than the 2 Respect.
- **The one real loss is contestable Respect.** Deeds were the only Respect a rival could take
  off you. Under the direction both tracks are ratchets: Jobs never leave the pile, nothing
  destroys an Influence marker. The leader-check has to come from elsewhere: the market (Jobs
  are public and named, the Market is static, so a card can be sniped), the economy (cash is
  attackable through Plunder, Torch and seizure), and Honor. An escalating Bribe cost helps
  here; see below.
- **Boroughs keep their identity.** Squads, Pressure Strips, Hotspot Tokens and a dozen Job
  cards are keyed to Boroughs already. Only the majority count as a scoring object goes.

Five Jobs currently name the Deed. The draft rewrites each to "Control the most Districts in
the Borough" or "a rival Controls more", which is the Deed condition without the card. Note that
the draft's Empty Casket ("a Borough where you Control 0 other Districts") is a different Job
from today's ("a Borough whose Deed you don't hold"), not a substitution.

## Why the grade gate was dropped

The first draft gated the 8th, 9th and 10th markers on a completed Job of each tier. Nick's
hesitation, which decided it: once a crew has done a few small Jobs, the only card that
advances it is a 5, so every other Job on the Market is dead to it except as a tiebreak. The
deck makes that worse. Six of the eight 5-Respect Jobs are Borough-locked (Queens, Bronx,
Manhattan, Brooklyn, Staten, all five), so a crew waits on roughly three specific cards
surfacing in a static Market, and the 2-player deck trim removes two more of them.

Fixing the Market composition at two 1s, two 3s and one 5 was considered. It fixes visibility
but not fit: a Bloody Sunday in the 5-slot is still a lockout for everyone outside Manhattan.
Recorded in case it comes back: it is less fiddly than it sounds (setup already sorts the 5s
out; three face-down piles, refill each slot from its own pile), it is the Splendor idea
`jobs-system-handoff.md` §2b rejected for table space but without the three rows, and it
changes the "cheap Respect drains one way" arc because the 1s always hold two slots. The
claim-and-dump reroll for an unfit 5 costs 3 markers locked for a Day plus the Offer, and
there is no hand limit, so claiming a 5 does not stop you claiming the one it reveals.

A Respect threshold on each Bribe (8th at 3, 9th at 6, 10th at 9, or similar) was proposed
and then withdrawn. The Kingpin's Guide already argues against any gate: "Bribe is a Jobs
play", the 7th marker makes a 3 free to hold, the 8th makes a 5 free, early Bribes are the
cheapest tempo in the game. Bribe-first is the intended engine, not a degenerate line, and the
current game already runs with no gate.

## The Bribe ladder

Nick's candidate: **escalating cost, $2,000 / $3,000 / $4,000 / $5,000** for the 7th to 10th
markers, $14,000 in total against today's $10,000 flat.

Why it is a better ladder than either gate:

- The value of each marker falls as you climb (the 7th and 8th stake Jobs for free, the 9th and
  10th only buy Heat headroom and the crown), so a rising price against a falling value makes
  each rung a real decision, and the 10th becomes a pure crown purchase at the top price.
  Under flat $2,500 the crown marker costs the same as the tempo markers.
- It partly replaces the leader-check lost with Deeds: a leader saving $5,000 for the last
  marker is exposed for longer, and their bankroll, barrels and Speakeasies are attackable.
- It needs no component. "Count your markers" sets the price; one line on The Ledger or the
  Volstead Act carries it.

The thing to watch is length. The Guide's brew table puts a good build at roughly $650 to
$1,100 net a Day, so the extra $4,000 is several more Days of brewing per player, on top of the
Jobs now needed for all 10 Respect. If it runs long, move the price points rather than the
shape: $1,500 / $2,500 / $3,500 / $4,500 keeps the escalation at $12,000.

Where "$2,500 a rung" is printed today: the Bribe Play in the Rulebook and on the Cards, the
Guide's "Plays = Influence minus staked minus Heat" table, its Bribe passages in the Jobs
chapter, and the Three Clocks line.

## The Sweep

The draft removes the universal Sweep and makes it the Sicilians' call. Not settled, and the
place to slow down. The numbers in `deed-sweep-handoff.md` apply: against the biggest raid a
Day can mass, a Safehouse garrison falls 70.6% at 5 men, 49.0% at 6 and 9.1% at 7. The
15-Runner budget balanced that only for Deed Boroughs, because a big keep left thin blocks
behind. With no Sweep anywhere the 7-man fortress is legal everywhere, and the Guide's Magic
of Seven and Muscle Ratio economics assume 5 to a boiler.

The Commissioner's Ear is an interesting political lever, but as the sole check on stacking
it is fragile: it hits the Sicilians' own garrisons too, so it only pays them when rivals
stack harder than they do, and a table where the Sicilians are behind, or a 2-player game
without them, has no Sweep at all. Run `node tools/sim_deed_sweep.js` on "no cap" before
committing.

`deed-sweep-handoff.md` was resolved by deletion on 2026-09-10: its proposal was the only
thing that made a Deed pay during play, and there are no Deeds. Its modelling tool,
`tools/sim_deed_sweep.js`, stays.

## The end of the Day

The draft's "Reckoning removed" oversells it. What remains at Sunset is: the Sweep if called,
Stake Your Claim, the victory check, then the Turn Tokens flip. That is today's Reckoning
with the Sweep made conditional and the Respect tally gone. The order between Sweep and Claim
does not matter, because the Sweep never changes who Controls a District (already noted in
`deed-sweep-handoff.md`). The real saving is the tally: with Respect a pile of cards and
Titles worth nothing, there is no count to do at nightfall, only crowns to move.

Nick's note on length: speeding up the end of the Day could matter to the 2 to 3 hour question.

## What the edit cascade touches, if it ships

Large. Deed references sit in the Cards (29), the Kingpin's Guide (14), the Rulebook (11), the
Town Planner and the Jobs Cards. The Sweep is in seven components including both Simulators
and the Playbooks (Untouchable). The 15-Respect count, the 2-Respect-per-Title lines and the
Final Reckoning section are Rulebook, Guide and index text. `CLAUDE.md`'s "The Respect ceiling
is 16" section and its Staten Deed notes become false and must be rewritten, not left to argue
with a ghost. `v0-8-changes.md` stays as dated history.
