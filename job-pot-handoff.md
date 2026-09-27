# Cash on unclaimed Jobs: parked proposal

Status (2026-09-27): **parked, not implemented.** Nick's idea, written up so it can be tried
later: as a remedy if playtests show the Jobs Market stagnating, or as a playtest alternative
in its own right. It should not go into the rules without Nick asking. If it does, it goes in
**with a steeper Bribe ladder** (see "The Bribe ladder goes with it").

Working name: **the pot**. Nick's name was "the Take", which clashes with two existing names
(see Naming). None of the numbers below come from a playtest: game length and claim rate have
never been measured, so every figure is arithmetic on stated assumptions, and the assumptions
are given with it.

## The idea

As Nick proposed it:

- When a Job is dealt into the Market, the bank puts cash under it: **$100 per marker of its
  Stake** ($100 for a 1, $200 for a 3, $300 for a 5).
- Every morning the Job sits unclaimed, the same amount goes on again.
- When you take the Job, its cash comes with it and stays on the card under your markers.
- Complete the Job and the cash is yours. Walk Away and the cash goes back to the bank and the
  card to the discards. (The rules have no failure, so Walk Away is the only way a Job ends
  unfinished.)

What it is meant to do:

1. **Theme.** You get paid for the work.
2. **Market flow.** A Job nobody wants gets more attractive every morning, so it leaves the
   Market sooner and a fresh card surfaces.
3. **A game of chicken at the Offers.** Wait for the pot to grow and a rival may take the card
   first.
4. **It rewards claiming late**, which is already the Almanac's advice (lesson 9).

The costs Nick saw at the outset: more upkeep, a second income that could devalue the brew,
and cash that makes the Bribe ladder easier to climb.

## What problem it answers, and when to reach for it

`jobs-system-handoff.md` §2b settled that a stale Market is **a signal, not a fault**: cards
sitting unclaimed mean nobody's position fits the street, which is pivot pressure the design
wants. So the pot is not a fix for silt as such.

The live problem is the one `rules-streamline-handoff.md` names: six of the eight 5-Respect
Jobs are Borough-locked, so a crew can wait days for the one card it can use to surface. The
pot helps with that **indirectly**. Stale cards leave sooner, so new cards come up faster. It
does not make a Borough-locked Job doable for a boss who can't reach it. It only pays more to
the one or two bosses who already could.

It does nothing for the catch-up question in `jobs-system-handoff.md` §8.1 (the trailing boss
stranded once the 1s are gone). That problem keeps its own patch ladder (§2).

**Reach for it if** playtests show the same cards sitting in the Market for many Days while
bosses wait on a card that fits them.

It keeps the static Market's argument intact: a card still leaves only when a boss chooses to
take it. It passes §8's Rat test, since nothing hangs on a Raid.

## What it does well

- **It turns the bounty 5s into literal bounties.** Every seat has one 5 aimed at its Boss,
  Safehouse or men (The Toll Booth Trap, Bloody Sunday, The Butcher's Ledger, Over the Top;
  `jobs-system-handoff.md` §6b). A price on your head that climbs every morning is the
  strongest thematic payoff here, and it sharpens §2b's point that a standing bounty is one you
  have to answer.
- **It is a proven mechanic.** Puerto Rico puts a doubloon on each role nobody picked; Small
  World puts a coin on each race you skip. Players pick it up without reading anything.
- **It prices the Offers seat.** First pick at the Offers goes to whoever Laid Low last, so a fat
  pot makes a late Lay Low (and Collect, which holds your seat) worth more against an early
  pick at the Brew. That deepens a trade the game already has (Almanac lesson 2 and the
  Kingpin's Tip after the Blowback) instead of adding a new one.
- **The pots are public at no cost in rules.** Cash is open information since 2026-09-26.

## Risks

### 1. It is a second income, and not a small one

Assumptions: at 4 players the Market holds 5 cards; the cards that linger are mostly 3s and 5s,
so they average about $200 a morning; about 1.5 Jobs are claimed a Day. (§2b puts claims at
roughly 12 to 20 a game; how many Days that spans is unmeasured.)

Cash put on the street each Day:

| Version | 4 players (5 cards) | Per boss | 3 players (4 cards) | Per boss |
| --- | --- | --- | --- | --- |
| A. As proposed (on deal and every morning) | about $1,300 | about $325 | about $1,000 | about $340 |
| B. Every morning, nothing on deal | about $1,000 | about $250 | about $800 | about $265 |
| C. Flat $100 a card a morning | about $500 | about $125 | about $400 | about $135 |

For scale, the Kingpin's Guide puts a good brewing build at **$650 to $1,100 net a Day**. (The
Guide may lag the rules; the figure is quoted in `rules-streamline-handoff.md`.) Version A is a
second income a third to half the size of a good still.

What a single Job carries when claimed, by the mornings it sat in the Market first (0 means
claimed at the same Offers it was dealt):

| Mornings waited | 0 | 1 | 2 | 3 | 5 |
| --- | --- | --- | --- | --- | --- |
| A: a 5 | $300 | $600 | $900 | $1,200 | $1,800 |
| B: a 5 | $0 | $300 | $600 | $900 | $1,500 |
| C: any Job | $0 | $100 | $200 | $300 | $500 |

Assume a winner's 5s waited three mornings, 3s two and 1s one. Then the pot money that comes
with 10 Respect is:

| Winner's Jobs | A | B | C |
| --- | --- | --- | --- |
| Two 5s | $2,400 | $1,800 | $600 |
| A 5, a 3 and two 1s | $2,200 | $1,500 | $700 |

Against a **$14,000** ladder, that is about a sixth under A, about an eighth under B and about
a twentieth under C.

### 2. It links Respect to cash, and that favours the leader

`rules-streamline-handoff.md` sets out "each axis gets one source": turf feeds cash, cash feeds
Bribes, Jobs feed Respect. The crown needs both 10 Respect and the Nod. Today a boss who is
strong at Jobs still has to earn the whole $14,000. With a pot, the Respect leader is also paid
in cash, so the leader reaches the Nod faster. This is the risk to weigh most.

### 3. The chicken is mostly cook-or-burn, not a race

Most Jobs depend on board position, and a boss's board shows what they are building toward
(Almanac lesson 11). So usually only one boss can do a given card soon. That boss gets a new
choice: pull it off today, or let it cook another morning.

The table's answer is to **burn** it: Take the card and Walk Away, which sends the pot to the
bank. That is a real read, but it costs two mornings of the Offers plus the rent in between, so
often nobody pays it and the cook just waits. Early in the game, when Respect tempo matters
least, that rewards slow play, which means **more** stagnation, not less. Watch this one first.

On claiming late: rent already makes claiming late correct. The pot makes the same answer more
correct; the new decision it adds is the cook-or-burn one above.

### 4. Upkeep

§2b cut the conveyor because keeping a count per card was the fiddle. A cash pile is a count
per card. It is lighter than the conveyor was, since it shows its own count and needs no
ordering, but it is still four or five payments from the bank every morning. Version C is one
bill a card.

### 5. Smaller knock-ons

- **Whispers is slightly weaker.** A Viper's face-down card comes off the deck, so it never
  sat in the Market and carries no pot. Nick rates Whispers strong, so this is probably fine,
  and it needs no rule: it follows from where the pot goes.
- **Seat pressure.** Whichever seat's bounty 5 surfaces first carries a growing price on its
  head until somebody collects or burns it. Each seat has one such 5, so it evens out over
  many games, but not within one.
- **Table footprint.** Jobs are prose cards. Tuck the bills under the card with a corner
  showing, so the text stays readable.

## The Bribe ladder goes with it (Nick, 2026-09-27)

Nick's counterweight: if the pot goes in, **raise the Bribe costs** to absorb the extra cash,
so the brew still matters.

What that does:

- **It restores the average.** If the ladder rises by about what a winner collects from pots,
  the winner needs about as many Days of brewing as under today's rules.
- **It does not fix the distribution.** The pot pays whoever completes Jobs; the higher ladder
  charges everybody. A boss behind on Jobs pays more and collects less, so the gap between the
  Jobs leader and the rest widens. The brew matters more for the trailing bosses and about the
  same for the leader. The raise answers risk 1 and leaves risk 2 in place.
- **Game length may not move much, but margins will.** The game ends when the fastest boss
  crowns, and that is likely the Jobs leader, whose net position barely changes. The rest of
  the table falls further behind. Unmeasured.

**Raise the top rungs, not the bottom.** Early Bribes are the intended engine (Almanac
lesson 10; `rules-streamline-handoff.md` calls Bribe-first "the intended engine"). Pot income
builds up later: pots grow over time, the 5s pay the most, and the opening Market holds no 5s.
The top rungs are also what a boss past 10 Respect is buying (next section).

| Ladder (7th / 8th / 9th / 10th) | Total | Raise |
| --- | --- | --- |
| $2,000 / $3,000 / $4,000 / $5,000 (today) | $14,000 | none |
| $2,000 / $3,000 / $4,500 / $5,500 | $15,000 | $1,000 |
| $2,000 / $3,000 / $5,000 / $6,000 | $16,000 | $2,000 |

A winner collects about $2,200 to $2,400 from pots under A and $1,500 to $1,800 under B (Risk 1),
so the $16,000 ladder roughly matches A and B falls between the two. Keeping the 7th and 8th at $2,000 and $3,000 leaves Almanac lesson 10's numbers true. A flat
raise ($2,500 / $3,500 / $4,500 / $5,500) would tax the tempo rungs instead and is not
recommended. Whatever the shape, **set the raise from measured pot income**, not from the
estimates above.

## Jobs past 10 Respect (Nick, 2026-09-27)

Today Respect past 10 buys little: a margin against the Rat's 2 and each Welsher's 1, and the
Blood Oath's 20 combined. With a pot, a Job completed past 10 still pays cash, so Jobs keep
some value for a boss who already has the Respect they need. Nick's read is that this incentive
is much weaker than when the Respect still counted.

Two notes on it:

- The upside is flow. A leader who keeps clearing cards keeps dealing fresh ones to the rest of
  the table.
- The boss at 10 Respect without the Nod is buying the last and dearest rungs, so this is where
  pot cash helps the leader most. It is capped at one claim a morning, and at 9 Influence even
  a 5's Stake leaves a full Ledger (Almanac, The Figures), so rent does not slow it. A
  top-rungs raise is aimed at exactly this window.

## Variants, cheapest first

1. **C: $100 on every Job still in the Market each morning, whatever its Stake.** One bill a
   card, a little over a third of A's cash. Stale 1s grow as fast as stale 5s, so it pushes the 5s
   less.
2. **B: $100 per Stake marker each morning, nothing on deal.** The suggested starting point. A
   freshly dealt card is not stagnant and needs no nudge; "still here this morning" is exactly
   the signal the pot is meant to reward. It keeps the extra weight on the 5s, which are what
   sit. About three quarters of A's cash.
3. **A: as proposed.** The biggest dose.

Pair A or B with a top-rungs ladder raise. C may not need one; measure first.

## Rules text sketch (version B)

For the Rulebook, in its voice. The flavour and the step name are placeholders for Nick.

- **Grease the Wheels, before The Offers:** *Sweeten the Pot:* the bank puts $100 on every Job
  in the Market for each marker of its Stake.
- **Take a Job:** Claim one from the Market with its cash, stake Influence from your Reserves
  equal to its Stake, and deal a fresh card into the gap.
- **Walk Away:** Drop a Job you hold, discard it, return its cash to the bank, and take its
  staked markers back to your Reserves.
- **Claiming a Job:** a Job's cash stays on the card until the Job completes.
- **Completion:** Return its stake to your Reserves, take its cash, and add the card to your
  Respect pile.

On Day 1 the opening Market gets its first cash at the Day 1 Offers, like any morning. Nothing
needs saying about Whispers or the Crown: a face-down card never sat in the Market, and a game
that ends mid-Day settles nothing.

## Naming and theme

- **Name.** "The Take" clashes with Take a Job and Take the Crown ("Take a Job and its Take").
  CLAUDE.md keeps one name per thing. **The Pot** or **the Purse** (a prizefighter's purse,
  which fits 1929) avoids the clash. Nick's call.
- **Theme.** "Paid for the work" fits the kill bounties. It fits less well for the Jobs nobody
  would commission: Recruiting your own men (Tenement Army) or moving your Safehouse next door
  to a rival (The Beachhead). A wager reads across the whole deck: the street's book on whether
  anybody has the nerve, with the odds lengthening each day nobody tries. That also suits a
  game narrated by Rothstein. Either framing works mechanically.

## What to measure in a playtest

1. **Pot cash as a share of the winner's ladder.** This sets the ladder raise.
2. **Slow play.** Does anyone leave a Job they could finish today to let it cook? How often?
3. **Burns.** How often does a boss Take and Walk Away just to send a pot back to the bank?
4. **Flow.** Do stale 5s leave the Market sooner than in a game without pots?
5. **The leader's lead.** Is the gap between the Jobs leader and the rest at the crown wider
   than without pots?

## What a trial would touch

A rules change is never one file (CLAUDE.md). For a trial of version B with a top-rungs raise:

- **Rulebook:** Jobs (Claiming a Job; the completion paragraph), Grease the Wheels (The Offers,
  Take a Job, Walk Away), and the Bribe Play's prices.
- **Town Planner:** the Offers summary (Take / Walk Away / Pass).
- **The Almanac:** lesson 2 (the Offers seat), 9 (claiming late now also fattens the pot),
  10 (Bribe prices; unchanged if only the top rungs move, but the $14,000 total is not),
  11 (a boss visibly positioned and letting a pot cook is an announcement), 12 (a denial now
  also burns a pot), and The Figures.
- **Playbooks:** all four print the Bribe ladder.
- **CLAUDE.md:** the Bribe ladder values and "every winner has climbed all four rungs
  ($14,000)".
- **`mk-online-rules-sync.md`:** records the ladder for the online client.
- **Grep the rest of the component set** for "$14,000", "$5,000", "Walk Away" and "the Offers"
  (the Cards sheet and the Federal Crackdown Tracker must agree on the ladder). The Kingpin's
  Guide is off the site and may lag. The Volstead Act is shelved but mentions the Offers.
