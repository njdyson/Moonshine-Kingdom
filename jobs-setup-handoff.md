# Jobs Deck: Setup, then Sets (2026-10-11)

Two passes on one day, made on the `claude/job-deck-balance-57zjc0` branch and on main since
2026-10-12 (Nick: "it will still need more work afterwards"). **Round 2 is the
live deck**; round 1 is the record of how it got there, and its card tables describe a deck that has
since changed again.

## Round 2: symmetric sets (later on 2026-10-11)

Nick rated every card on a review page (https://claude.ai/artifact/DJ6iKhq2fLiB87eTu4YEc9, private to
him; his piles, stars and notes are in its `reviews` collection, readable with `ArtifactData`). Then:

> I think my inclination is to make more symmetrical sets. This helps with balance and simplicity as
> players can parse them quickly if they are a familiar format/type.
>
> Could we take it further? Make all 8 non-HS speakeasies unload cards at 1 respect. Add a set of
> boss kill 5s, so the 5's simply become murder cards.

**Applied on the branch.** The deck is now **36 cards, 16 / 12 / 8** (18 A4 pages; the Rulebook's
component list says 36). Most cards come in sets, one per place, in one wording:

| Tier | Set | Cards |
| --- | --- | --- |
| 1 | **The bars**: Unload 4+ barrels at <bar> in <District> | The Angel's Share (The Silver Dollar, East Harlem), High Spirits (The Haymarket, the Tenderloin), Bathtub Gin (DeLillo's, Belmont), Coffin Varnish (The Penny Whistle, Fordham), Giggle Water (Bohemian Hall, Astoria), Poison Panic (Paradise Alley, Flushing), Last Call (Ruby's Joint, Coney Island), Off the Boat (Sunny's Bar, Red Hook) |
| 3 | **The Extort set**: Extort while you Control all three Speakeasies in X | Empire State, The Big Squeeze, King of Queens, The Black Hand |
| 5 | **Body counts**: Kill 5+ rival Runners in X | Bloody Sunday (Manhattan), Over the Top (the Bronx), Rum Wars (Queens), The Butcher's Ledger (Brooklyn) |
| 5 | **Bosses**: Kill a rival Boss in X | Room 349 (Manhattan), The One-Way Ride (the Bronx), The Toll Booth Trap (Queens), The Last Hand (Brooklyn) |

The bar cards name the bar from the board's sign as well as its District (Nick: more thematic),
which settles the 2026-10-10 audit's open item 7 the other way: venue names are back, beside the
District rather than instead of it.

No card says "in one Play" (Nick: that's the rule). The Rulebook's The Play Is the Unit now says it
once: "A count on a Job is what that one Play did: 4+ barrels means four barrels in a single Play."
The deck's masthead says the same. The Rulebook still prints on 23 pages.

The rest are singles. **1s:** The Milk Run, The Dutchman's Deal, Night Landing, The Pier Six Brawl
("Seize a Dock", guard dropped), The Beachhead, Tenement Army, Rum Row (down from 3), The Insurance
Job (down from 3). **3s:** The Five Families (down from 5, new art), Cuban Prince ("Extort while you
Control 4+ Docks"), Hell's Highway ("Move your Boss and 4+ Rum across the Hell Gate
Bridge"), Last One Standing, The Smuggler's Run (reworded: "Move 4+ Rum from Staten Island into a
rival's Dock, and Seize it"), The Copper Heist ("Seize a District with a Pressure 5 Still"), Opening
Night (down from 5), Union Dues (down from 5).

**Cut:** The Grand Tour (its "East River" invited an argument about Coney Island; the bars replace
it), The Empty Casket (stale: nobody loses a Boss for 1), Squatter's Rights (Nick's discard),
Fortress Staten (Nick's drop candidate), The Eviction, Gin Pipeline (too complex, and any "into your
home Borough" wording lets six barrels go out and straight back), The Irish Goodbye (easy with a big
crew, dead if the target Folds), High Roller (overlaps the endgame).

Every change follows a note Nick left on the page except four calls of mine: cutting The Eviction
(unrated) to fit 12 threes, the names and art of the ten new cards, and a "but no Boss" clause
Nick cut the next day (below).

### A Borough's two 5s may pay together

Combat removes Runners first, and the Boss dies only when no Runner is left (a Sicilian Hit aside).
So a Borough's body count and its Boss card both pay only on a fight that kills a Boss and five
Runners, against a District holding six or more. Round 2 first printed "but no Boss" on the body
counts to rule that out. **Nick cut the clause on 2026-10-12**:

> It's hard to attempt 2x 5 respect cards at once, because you'd need to stake 6 influence (making it
> nearly impossible to complete the jobs anyway with a maximum of 4 markers left). Second, if they do
> have a boss in the same district, the maths prevents the win. A district with 5 runners and a boss
> is very hard to fight (you'd need to take 10 runners plus a boss to the fight to avg 5 kills in 3
> open fires).

He likes what it does to the board, too: a body count pays most against a fat stack, so every
big garrison becomes a target, a little of what the Sweep did before v0.9.8 cut it.

A boss takes at most one Job a morning at the Offers, so holding both also takes two Days of drafting. "Never two 5s" is
therefore absolute except for these four pairs: `overlap_audit.py` lists them as allowed
(`ALLOWED_DOUBLE_FIVES`) and fails any other. Its biggest stacks now read 13 (a pair plus The Copper
Heist or Hell's Highway), but those stake 8, leaving the Move and one volley, which can't kill six.

### What it does to the numbers

| | Round 1 | Round 2 |
| --- | --- | --- |
| Never two 5s | Passes | Passes, except a Borough's body count and Boss together (allowed 2026-10-12) |
| Co-firing sets over 2 Districts | 7 | 1 (The Pier Six Brawl rides every Smuggler's Run, 4 Respect, now that its guard is gone), plus the four allowed body-and-Boss pairs |
| Biggest stack on one District | 12 (Jamaica, Canarsie) | 10 (the same two Docks) |
| Biggest stack on one Extort | 11 | 12, four Extort 3s; it needs 8 staked plus the Extort's 2, so all ten Influence |
| 5s: difficulty range | 7 to 13 | 12 to 13, all "contested" |
| 3s flagged solitaire | 3 | 0 (The Five Families, Opening Night and Cuban Prince read "thin") |
| Respect-weighted seat spread | 1 | **3** (the Bronx -1, Queens -2, Manhattan -3, Brooklyn -4) |

**The seat spread is the singles.** The three sets are equal by construction: each seat has two bar
1s, one Extort 3 and two 5s aimed at it. What separates the seats is the friendly singles: the Bronx
has Hell's Highway (3) and shares The Angel's Share, Queens has Last One Standing (3), Manhattan has
The Milk Run and The Dutchman's Deal (1 each), and Brooklyn has only Night Landing (1). A Brooklyn
3, or turning one landmark single into a set, would close it.

### Open for review (round 2)

1. **Half the 3s are Extort cards** (six of twelve). A boss can Extort once a Day, so they compete
   for one Play, but one Extort can pay several at once.
2. **The murder sets favour two mobs.** The Irish Firepower die helps body counts; the Sicilian Hit
   makes any Boss take the first hit. The Knights and the Vipers have no marquee 5 now.
3. **Every Boss is hunted everywhere.** A Boss card exists for each Borough, the crown is taken in an
   away room, and a kill costs a Rise. That is the endgame's third act, louder. Watch for kill-fests.
4. **The Copper Heist** is the easiest 3 (difficulty 6): four of its five targets are the starting
   bars. Nick's intent is that it makes players garrison home.
5. **The deck grew** from 32 to 36. The extra cards are all 1s, which is the handoff's own patch for
   the 1s running dry (`jobs-system-handoff.md` §2, the arc).
6. **Names**: Room 349 nods to the Park Central room where the story starts, unnamed. All ten new
   names and their art are proposals.

---

## Round 1: the setup test

Nick, the day after the deck audit (`jobs-audit-handoff.md`):

> Many jobs are circumstantial, where a player could easily complete a 3 or 5 by being in the right
> place at the right time. While this may not be completely avoidable, I think we should ensure that
> all of the harder cards require some setup. I like the 5 family card, and I don't think we use
> extort enough. I think a series of 4 cards (3 respect) extorting every speakeasy in a borough would
> be a good, symmetrical set. Jobs like the Cuban Prince are perhaps too easy.

Round 1 added the Extort set as asked and reworked three more 3s that failed the test below; every
5 passed. The deck stayed 12 / 12 / 8.

### The test

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

### The verdicts

#### 3 Respect

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

#### 5 Respect: all pass, all unchanged

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

### What changed

#### The Extort set (Nick's), replacing the four home-bar 3s

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

#### Three more 3s reworked

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

### What it does to the numbers

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

### Open for review

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

Round 2: `tools/gen_deck.py` (the card table, the set notes, and tier counts read off the table),
`Jobs Cards v0.9.html` (regenerated: 36 cards, 18 A4 pages, no overflow in screen or print),
`tools/overlap_audit.py` (bar Unloads, Runner kills counted apart from the Boss, both bridges as
routes, a Boss riding a Move, 4+ Docks on an Extort), `tools/fairness_audit.py` (two bounties per seat
is now "ok"), `tools/difficulty_audit.py`, the Rulebook's component list (36 Job Cards), `CLAUDE.md`
(*Jobs: one verb, one place*, *Jobs: sets, and setup*, *Borough cards*), `jobs-system-handoff.md`,
`jobs-audit-handoff.md`, and `mk-online-rules-sync.md` §30 (rewritten for the round-2 deck).

Round 1 touched the same tools and docs. No other player-facing component names a Job. mk-online's
Jobs code is not changed here, and is still waiting on §28.
