# Jobs Deck: the 3s and 5s Need Setup (2026-10-11)

Nick, the day after the deck audit (`jobs-audit-handoff.md`):

> Many jobs are circumstantial, where a player could easily complete a 3 or 5 by being in the right
> place at the right time. While this may not be completely avoidable, I think we should ensure that
> all of the harder cards require some setup. I like the 5 family card, and I don't think we use
> extort enough. I think a series of 4 cards (3 respect) extorting every speakeasy in a borough would
> be a good, symmetrical set. Jobs like the Cuban Prince are perhaps too easy.

**Applied 2026-10-11** on the `claude/job-deck-balance-57zjc0` branch: the Extort set as asked, and
three more 3s reworked because they failed the test below. Every 5 passed and is unchanged. The deck
is still 12 / 12 / 8 and still prints on 16 A4 pages. *Open for review*, at the end, lists the calls
that were mine rather than Nick's.

---

## The test

A 3 or a 5 needs **setup**: Plays spent for this Job and nothing else, before the Play that scores
it, that the table can see coming. It fails in one of two ways:

- **A home chore.** The setup exists, but it is on your own starting turf, nobody can reach it, and
  it is something you would do anyway. You claim it on Day 2 and finish it by Day 3.
- **A windfall.** The target is so common that a fight or a sale you were going to make anyway
  pays it. Whoever happens to be standing next to it claims it and cashes it the same Day.

Two board facts decide most verdicts:

- **Since 2026-10-07 every seat starts on its Borough's Pressure 5 Speakeasy**, with its Dock and
  Ward beside it. Any card that names one of those four bars, or a type they all belong to, became
  a chore or a windfall that day.
- **Secure places a Safehouse in any Safe District on the map for $500.** It is not a Move, so a
  Secure Job with no other gate is one Play from anywhere.

The gates that do make setup, and that rivals can see: a **High Society Venue** (shut until a Raid
moves its Squad), **holding several Districts at once** (whack-a-mole), the **Rum chain** (brew,
Trade at a Dock, haul), **Staten Island** (every trip is a crossing), a **rival's home turf**, and
your **Boss** in harm's way.

## The verdicts

### 3 Respect

| Card | Verdict | Why |
| --- | --- | --- |
| Cuban Prince | **Chore**, cut | Brooklyn Trades at Canarsie and Moves next door into Red Hook, its own bar: two Plays on Day 2. Nick's named example. |
| The Big Squeeze (Unload 6+ at The Tenderloin) | **Chore**, cut | Manhattan's own Pressure 5 bar: brew there, sell there. |
| Hell's Highway | **Chore**, cut | The Bronx Moves six barrels into its own bar. |
| Poison Panic | **Chore**, cut | Queens sells six at its own bar. |
| Gin Pipeline (into your home Ward) | **Chore**, reworked | Your own Still into your own block. The 2026-10-10 audit already called it the most solitaire 3. |
| Last One Standing (Secure in Astoria) | **Fails**, reworked | One Secure, $500, from anywhere on the map, on Day 2: the easiest 3 in the deck. |
| The Copper Heist (Seize a Pressure 5+ Still) | **Windfall**, reworked | Nine Districts, including all four starting bars and all four rooms, so any Seize of a rival's home bar paid it. |
| The Irish Goodbye | Borderline, kept | Manhattan can hit Red Hook over the Brooklyn Bridge on Day 2. But "take no Control" means it never pays as a by-product: you plan a raid you don't mean to win, the target can Fold to deny it, and two kills from three Runners is a coin flip. |
| Rum Row | Passes, kept | A crew and four barrels have to cross to Staten Island first. Solitaire (no rival goes there), but not chance. |
| The Eviction | Passes, kept | An assault on the most defended block a rival has. An unguarded Safehouse is the owner's mistake, and the face-up card is what warns him. |
| The Insurance Job | Passes, kept | You have to make yourself the Raid's target and steer it to your worst boiler. |
| The Smuggler's Run | Passes, kept | Staten Island, the Rum chain and a Seize. The hardest 3 before today. |

### 5 Respect: all pass, all unchanged

| Card | The setup |
| --- | --- |
| Opening Night | A room opened by a Raid, held, and eight Rum hauled into it. |
| The Toll Booth Trap | Your Boss walked into Queens, and a Boss there who stands rather than Folds. Brooklyn's home Ward borders Corona, but a Fold denies it. |
| Over the Top | A Bronx stack of five or more, and a bigger army next to it. |
| The Five Families | A District in every Borough at once, Staten Island included. |
| Union Dues | Your Safehouse in a rival's home Ward: take his over, or wait for him to leave it. |
| Bloody Sunday | An army into Manhattan, through a Safehouse garrison. |
| The Butcher's Ledger | Two big stacks in Brooklyn, and a defender who stands. |
| High Roller | A room opened by a Raid, and four Rum in it. |

## What changed

### The Extort set (Nick's), replacing the four home-bar 3s

| Card | Objective | Art |
| --- | --- | --- |
| Empire State | Extort while you Control all three Speakeasies in Manhattan. | `Empire State.jpg` |
| The Big Squeeze | Extort while you Control all three Speakeasies in the Bronx. | `Big Squeeze.jpg` |
| King of Queens | Extort while you Control all three Speakeasies in Queens. | `King of Queens.jpg` |
| The Black Hand | Extort while you Control all three Speakeasies in Brooklyn. | `Black Hand.jpg` |

The wording follows The Five Families ("Extort while you Control a District in all five Boroughs").
"All three" tells a reader going by the board's gin medallions that the crowned bar counts. The four
print together on one sheet.

**These four names were Extort cards once.** They were cut because "hold N Districts in one Borough"
was the Borough Deed paid twice (`jobs-system-handoff.md` §3, cluster 2: an Extort Job must measure
something no Deed or Title already does). The Deeds went on 2026-09-10, and the objection went with
them. The art was still in `Art/Jobs/`, unused except The Big Squeeze's, which Manhattan's home-bar
3 had borrowed.

**Why they need setup.** A Borough's three Speakeasies are its two ordinary bars and its High
Society Venue, and the Venue starts under that Borough's Police Squad. So:

1. The card is dead until a Raid moves the Squad, and dead again whenever the Squad stands on any of
   the three.
2. Steering the Squad is the setup. It hunts the freshest noise in reach, then that mob's District
   with the most barrels (ties to the hotter boiler). To open the room cleanly you want it to step
   onto a Dock or Ward you can spare:

   | Borough | Squad's reach from the room | Clean first step |
   | --- | --- | --- |
   | Manhattan | East Harlem, West Side | West Side (wins a tie with East Harlem) |
   | The Bronx | Fordham, Throggs Neck | Throggs Neck (needs strictly more barrels than Fordham) |
   | Queens | Corona, Flushing, Jamaica | Jamaica, or Corona (which Condemns a Safehouse there) |
   | Brooklyn | Red Hook, Brownsville | Brownsville only: Brooklyn's own home Ward, so Secure away first or take two Raids |

3. Then hold three Districts at once, and Extort: a Power Play that always draws Heat.

Rivals can break any of the three, take the room, or plant barrels on one of the bars and pull the
Squad back onto it. The home seat starts holding one of the three and borders the other two, so each
card is its seat's friendly 3, as the card it replaced was. For anyone else it is an invasion that
ends next to a crown room.

### Three more 3s reworked

| Card | Was | Now |
| --- | --- | --- |
| The Copper Heist | Seize a District with a Pressure 5+ Still and no Safehouse. | Seize a **High Society Venue** with no Safehouse. |
| Gin Pipeline | Move 6+ barrels into your home Ward in one Play. | Move 6+ barrels into a **District you Control in a rival's home Borough** in one Play. |
| Last One Standing | Secure your Safehouse in Astoria. | Secure your Safehouse in Astoria **holding 6+ Rum**. |

- **The Copper Heist** narrows to the four rooms, the four #7 Stills (the hottest boiler in each
  Borough, so the flavour still reads). The room has to be open, a rival has to be holding it, and
  you have to bring enough to take it. A Fold still pays, as every Seize Job does. It is also the
  table's answer to the Extort set: take a rival's room and his three are broken. The no-Safehouse
  guard stays, so a room with his Safehouse in it pays The Eviction (or in Manhattan Bloody Sunday)
  instead.
- **Gin Pipeline** moves the far end of the pipe into a rival's home Borough. You need a foothold
  there first, which its owner can see and take back, and six barrels staged beside it; the
  delivery comes a turn round later at the soonest. Each seat's nearest foothold is an Empty District
  one Move or one crossing away: East Harlem or Astoria for the Bronx, Jamaica for Manhattan (by
  water) and Brooklyn, West Side for Queens (by water). "You Control" keeps it out of every fight, so
  it can pay only beside Night Landing or The Milk Run.
- **Last One Standing** keeps Astoria, so it stays Queens' second friendly and the seat balance holds.
  Astoria brews almost nothing (Still 2), so six Rum is a whole supply chain: brew, Trade, haul, then
  Secure. Queens does it in three Plays from Whitestone, the Bronx in four by the Hell Gate (and the
  Bronx can strike Astoria from its home Ward). Six Rum on the block is also the Big Bust's favourite
  door.

The other twenty-five cards keep their text.

## What it does to the numbers

From `tools/overlap_audit.py`, `breadth_audit.py`, `fairness_audit.py` and `difficulty_audit.py`,
before and after:

| | Before | After |
| --- | --- | --- |
| Never two 5s on one Play | Passes | Passes |
| Co-firing sets over 2 Districts | 8 | 7 (Gin Pipeline + The Eviction at the home Wards is gone) |
| Districts where one Play can pay 11+ | 9 (Fordham, Red Hook, three home Wards, four Docks) | 4 (the 12s at Jamaica and Canarsie, the 11s at Whitestone and Throggs Neck), all The Smuggler's Run's |
| Respect-weighted seat spread | 1 (Brooklyn worst at -2) | 1 (unchanged) |
| 3-Respect difficulty: mean, range | 6.5, 4 to 11 | 8.7, 6 to 11 |
| 3s flagged solitaire (block + provocation 3 or less) | 5 | 3 (The Insurance Job, Rum Row, The Irish Goodbye) |
| Pressure 5+ coverage | 0.56 | 0.56 |
| High Society coverage | 0.50 (2 cards) | 1.75 (7 cards) |

**Extort is modelled once, map-wide.** An Extort pays for every District you Control, so its Jobs
read the whole map, not the District it is made from. The overlap model now enumerates it once, over
what you hold (all five Boroughs or not, and which Boroughs' three bars are all yours), and the
breadth audit reports it as "the whole map (Extort)". It never meets a non-Extort Job. Its stacks:

- Two Borough cards and The Five Families: **11 Respect**, stake 7, holding six Speakeasies (two of
  them rooms) and a District in each other Borough.
- All four Borough cards: 12 Respect, stake 8, holding all twelve Speakeasies. Stake 8 plus the
  Extort's two markers is every marker a boss can own, so it needs all ten Influence.
- Three Borough cards and The Five Families (14) needs stake 9, which leaves one marker for a
  two-marker Play: unreachable.

These are the most engineered stacks in the deck, which the breadth rule calls the feature. They do
sit above the crown's bar of 10, like the Smuggler's Run stacks already did.

## Open for review

The Extort set is Nick's. These are mine.

1. **The three reworks.** Each was the smallest change I could find that adds real setup without a
   new overlap. Alternatives weighed and set aside, so they needn't be redrawn:
   - *Last One Standing in a High Society Venue*: every High Roller would pay it too, a guaranteed
     free rider. *In a rival's home Ward*: the first half of Union Dues at a lower price.
   - *Gin Pipeline into a High Society Venue*: pays the room-and-Rum line that Opening Night and High
     Roller already pay. *Across a bridge*: a Day-3 chore for the Bronx by the Hell Gate. *Into a
     rival's home Ward*: a fight at a garrison, stacking with The Eviction and the bounties.
   - *The Copper Heist on any District holding 6+ barrels*: unclear whether the barrels you carry in
     count.
2. **Seven cards now point at the four rooms** (the Extort set, The Copper Heist, Opening Night, High
   Roller), up from two. The rooms are where the crown is taken, so this pulls the mid-game fighting
   there, which is the intent. It also feeds the room-as-fortress worry in CLAUDE.md's *Watch in
   playtest*. If it is too much, The Copper Heist is the one to move.
3. **Brooklyn's Extort card is the stiffest.** Its Squad can only step cleanly onto Brownsville,
   Brooklyn's own home Ward, so Brooklyn must Secure away first or wait out two Raids. The Bronx's is
   the cheapest (Throggs Neck). The fairness audit weighs Respect and can't see this.
4. **The Extort set at 3.** It asks for three Districts, one behind a Squad, plus a Power Play with
   Heat; by `difficulty_audit.py` it scores 10 or 11, level with the hardest 3s and above two of the
   5s. Nick asked for 3; if playtest finds it rarely completes, 5 is the other tier, but four more 5s
   would break the 12 / 12 / 8 shape and the "never two 5s" proof would need The Five Families
   re-checked against them.
5. **Dead cards in the opening Market.** The opening deal is 1s and 3s, so an Extort card or The
   Copper Heist can be dealt on Day 1 and sit until the first Raid opens a room. About one of the
   five opening cards on average, at four players.
6. **Harder 3s slow the game.** Nobody has timed it, and the bar is 10 Respect. Watch Days to the Nod.
7. **Still flagged, not changed:** The Irish Goodbye (borderline, above), and the counterplay test's
   three solitaire 3s (The Insurance Job, Rum Row, The Irish Goodbye). Nick's ask was setup, and all
   three have some.
8. **Names and art.** "King of Queens" is also a 1998 sitcom title; it was this card's name in the old
   deck. The Empire State art shows the Empire State Building, which opened in 1931; the name itself is
   the state's old nickname.

## Files changed

`tools/gen_deck.py` (the table and its notes), `Jobs Cards v0.9.html` (regenerated, 16 A4 pages, no
overflow in screen or print), `tools/overlap_audit.py` (the new predicates, and Extort modelled
map-wide), `tools/breadth_audit.py` (labels the map-wide Extort), `tools/fairness_audit.py`,
`tools/difficulty_audit.py`, `CLAUDE.md` (*Jobs: the 3s and 5s need setup*, and *Starting turf*),
`jobs-system-handoff.md` (dated notes), `jobs-audit-handoff.md` (a pointer), and
`mk-online-rules-sync.md` §30 for the port. No other component names a Job. mk-online's Jobs code is
not changed here, and is still waiting on §28.
