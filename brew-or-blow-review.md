# Brew or Blow: a deep dive (2026-11-24)

Nick asked for a deep dive into the new brew phase, the best strategies in it, an update of The Almanac's
lessons, and a recommendation on whether it is an upgrade over the brews it replaced. This file holds the
evidence, the strategy, what changed in The Almanac and the verdict. **No rule changed in this pass.**

The rules under test are the Rulebook's Shadows step 2 as it stands (CLAUDE.md: *Brew or blow*, *Brew only
what the Supply covers*, *Three free Safehouses*): the Mash is on the board from yesterday; in Turn Order each
boss rolls one Red die per Dock he Controls and picks one; he brews Mash + die (every active Still on it
pours, whoever owns it, 1 barrel, 2 beside its owner's Safehouse, once a morning), blows it (1 Ledger marker
to the Heat Track; every active Still on it loses half its crew, rounded down, and pours nothing more) or passes.

## The verdict

**Yes, keep it. It is the best brew the game has had,** and the gap is widest against the drafted brews.

- Every boss gets one pick with three real answers (brew, blow, pass), and the right one depends on who
  else stands on the number. The draft's pick was nearly always "the die that brews most for me", and the
  2026-11-19 Boss brew gave the last seat no brew at all: he had to blow, 56 times a game in bots, wanted
  or not.
- It turns the neighbour from an enemy into a partner. The starts mirror (the North on 8, 9, 10, the South
  on 4, 5, 6), so under the draft the man beside you competed for your dice and then blew your Stills by
  brewing his own. Now his pick pours yours. Half of a starting family's barrels come off the neighbour's
  dice.
- The Blowback stopped being weather. It has an author, a price and a name on the Heat Track. In the
  leftover-die draft the bots lost 6 Bosses a game to it; here, none in 20 games.
- It gives the board's pieces a job at the Brew: a Dock is a die, a Safehouse is a barrel, a 7 is company.
- It has fewer moving parts than the draft it replaced (no shared pool, no repeats set aside, no Split the
  Batch, no Harbormaster, no leftover die), for a Blowback marker and the cover rule.
- In bots it brews the most (4.5 barrels a Day at the table against 2.7 to 3.6) and moves the most cash
  from Extort to Unload (45% of the two against 25% to 36%), which is the direction Nick has asked for since
  2026-10-14 ("the game should rely on the brew engine").

Four things to watch, in order. Each is in *Watch list* below with numbers:

1. **A sensible table brews less than the bots do.** Bots pour rivals' numbers for nothing; people will
   pass. At the opening that is the difference between 5.3 barrels a Day and 3.2.
2. **Three players: the boss alone on his side of the river brews half** what the other two do.
3. **The opening is thin**: under a barrel a Day each, and no barrel at all on 48% of mornings.
4. **The blow rarely pays on its own arithmetic**, and the bots blow far more than the arithmetic supports,
   so the bot death counts overstate what a table will see.

None of these needs a rule today. The first has an answer in play (lesson 4, The Corkage: sell the pour)
and a rule on file if the table stays miserly (*An option on file*).

## Evidence, and how far to trust it

**`tools/sim_brew_or_blow.js`** (new, `node tools/sim_brew_or_blow.js`, about 25 seconds). It reads the
board out of `tools/build_board.js` and enumerates every Mash face, every Turn Order and every roll of every
boss's Dock dice, so its figures are exact for a position and a policy. It is frozen at one morning: it knows
nothing of the Hustle. Its default boss is **stingy**: he brews the number that pours most for him and passes
on a number that pours only for rivals. Every figure in The Almanac's Chapter I comes from it.

**Bot games** (mk-online 2a960b0, `scripts/lengthdiag.ts`, seeds `len:0` to `len:19`, four bots, random
styles, 90-Day limit). Five rule sets on the same seeds, everything else the current rules:

| Arm | Switches | What it is |
| --- | --- | --- |
| now | defaults | Brew or Blow, the covered brew and the pass, three free Safehouses |
| one house | `--safeBrew=0 --freeSecure=0 --safehouses3=0` | Brew or Blow as it shipped on the morning of 2026-11-20: the Boss's barrel, one $500 Safehouse |
| last seat | the above and `--blowChoice=0 --coverBrew=0` | The Boss brew of 2026-11-19: the last seat must blow, the Safehouse shields, Dry Taps |
| draft, bad batch | `--dockBrew=0 --safehouses3=0 --freeSecure=0` | The Even City's draft (2026-11-18): Red pool, Muscle Ratio, Split the Batch, the Harbormaster, the second Still blows |
| draft, leftover die | the above and `--clash=0` | The same draft with the older Blowback: the undrafted die blows its number |

Four more arms on the same seeds, all on today's rules: every bot passing a brew that pours more for rivals
than for him (`--spitePass=1`), and three in which seat 0 alone plays differently (it never blows, it blows
at every chance, it alone spite-passes). 180 games in all.

Caveats, all of which matter:

- The two draft arms run the old brew inside today's game (22 Districts, four Squads, today's Jobs). They
  are not replays of the rule sets those brews shipped in. Turning the Dock brew off also turns one die a man
  off in the engine, so those two arms fight and blow on the Muscle Ratio.
- Twenty games an arm. Crown Days overlap between every pair of arms; read nothing into length.
- Nick puts little faith in bot speed, rightly. The bots do not sell pours, do not thin a crew when the
  Mash can reach it, value a dead rival Runner at a full barrel and a half, and pour for rivals whenever
  they have nothing of their own to brew.
- The reviews and bot log CLAUDE.md points to (`/mnt/project-files/reviews/`, `bot-runs/log.md`) were not
  mounted in this session, so nothing here was checked against them, and these rows were not added to the log.

## What the morning pays

All figures are barrels a Day for one boss, stingy bosses all round, from the sim.

**The opening.** Manhattan and Queens 0.76, the Bronx and Brooklyn 0.81 (their Ward sits on a 9 or a 5,
where Manhattan's and Queens' sits on a 10 or a 4). The table brews 3.16. Half of each boss's barrels come
from his own pick and half from his neighbour's. He has no barrel at all on 48% of mornings. A Still on a 6
or an 8 pours on 25% of mornings, a 5 or a 9 on 20%, a 4 or a 10 on 15%.

**Turn Order does not move barrels.** A number pours the same whoever picks it, so the first and the last
seat brew the same to two decimal places, at the opening and at a grown table, for a boss who brews on the
spot and for one who counts the picks still to come. Turn Order matters at the Brew in two cases only: the
blow (below), and a short Supply.

| Manhattan holds | Barrels a Day | Dry mornings |
| --- | --- | --- |
| Its start, West Side lost (no Dock) | 0.31 | 78% |
| Its start (one Dock, the house on Five Points) | 0.76 | 48% |
| A second house, on the Tenderloin (8) | 1.02 | 48% |
| A second house, on West Side (9) | 0.97 | 48% |
| Houses on all three | 1.22 | 48% |
| The start and the Bowery (a second Dock) | 1.04 | 35% |
| The start and three Docks | 1.18 | 29% |
| Houses on all three and a second Dock | 1.60 | 35% |
| Houses on all three and three Docks | 1.79 | 29% |

**The sevens.** A 7 held alone is a poor boiler: only its owner's dice make it, 17% of mornings a Dock, so
it adds 0.17 barrels a Day, 0.33 with a house. Its value is company. With every boss on his own Venue's 7
and two Docks each, a 7 pours on 73% of mornings (52% with one Dock each), where the 6s and 8s pour on a
third. At that table a boss with a housed 7 brews 2.58 to 2.66, and the boss without one brews 1.17. A house
on the 7 is worth 0.68 barrels a Day there, more than the two houses on the starting bar and Dock together (0.46).

**The twin.** Take Fordham's 8 off the Bronx, so Manhattan holds both 8s: Manhattan goes from 0.76 to 0.79
and the Bronx from 0.81 to 0.56. Holding both twins gains nothing, because it removes the neighbour's die
from the number. It is denial only.

**The pass.** With one Dock at the opening, a boss's die makes a number of his own on a third of mornings,
nobody's on a third, and on a third a number only the men across the river cook, worth 2.58 barrels to them.

| At the opening | Manhattan | The Bronx | Queens | Brooklyn | Table |
| --- | --- | --- | --- | --- | --- |
| Everybody passes on a rivals' number | 0.76 | 0.81 | 0.76 | 0.81 | 3.16 |
| Everybody brews whatever he rolls | 1.29 | 1.38 | 1.29 | 1.38 | 5.35 |
| Manhattan and Queens pour for each other | 1.05 | 1.12 | 1.05 | 1.12 | 4.35 |
| Manhattan alone pours for rivals | 0.76 | 0.81 | 1.05 | 1.12 | 3.76 |

A pact between two bosses lifts all four about equally (the neighbours share the numbers), so it buys no
edge. Pouring for nothing gains the pourer nothing. Selling the pour is the only version with an edge in it.

**The Supply.** "Brew only a number the Supply can cover" bites at a grown table: four housed 7s ask 8
barrels in one pick, so under 8 in the Supply the 7s cannot pour at all, and the first seat starts to
out-brew the last (1.68 against 1.47 with 8 in the Supply; 0.80 against 0.49 with 3). In the bot games the
Supply stood at a median of 23 to 25 barrels at dawn and under 8 on fewer than 1 Day in 100, so the rule
almost never fired. Bots do not stockpile; a table running Rum in batches of ten will meet it more often.

## What a blow is worth

A blown crew loses half, rounded down: 1 man loses none, 2 or 3 lose 1, 4 or 5 lose 2, 6 or 7 lose 3. Once
the Mash is on the board and a number is in reach, one Dock rolls it on 17% of mornings, two on 31%, three
on 42%, four on 52%.

Price it for a boss racing three rivals, where a loss to one rival is worth a third of that loss to him, a
dead man is $300 and a barrel $200:

- At the opening every block holds three men. A blow kills one man on each Still that cooks the number:
  two rivals' men from across the river, or one of his and one of the blower's on a number they share. Two
  $300 men, spread over two rivals, for a marker.
- The best target on the board is the 7s, for a boss who holds none: all three rivals lose half a crew
  each, and if he picks before them, 2 barrels each as well. To him that is worth 3.5 barrels with two or
  three men in each room, 5 with four or five; picking after them, 1.5 or 3.
- The cost is a marker today, the same marker locked on the Heat Track until the next Raid (the bots raid
  about every two or three Days), and the freshest name on the track.

Put together: with rivals who only brew, a no-7 boss on two Docks who blows whenever it pays him fires on
about a morning in five from the first seat when a blow costs him 2.5 barrels all told, and never from the
last seat unless the rooms hold five men. Where everybody holds a 7 and everybody is armed, nobody fires at
all: a boss with a Still on the number shoots his own men and his own pour. The shared number polices itself.

So the blow is not an income. It pays in three cases, which are lesson 6 now:

1. **Before an assault.** A Boss and four become a Boss and two, and the same Boss and six that took the
   block 17% of the time take it 92% (the Almanac's lesson 27 table). One marker for 75 points, and the low
   token gives both halves: first pick at the Brew and first move in the Hustle.
2. **On a number the blower does not cook and the others do.** The four 7s above all.
3. **On a fat stack.** Four or more men.

The defence is cheap for a boss who looks. Tomorrow's Mash is on the board all Day, so every boss knows by
evening which of his Stills can blow in the morning. Odd crews are the efficient ones (three lose the same
one man as two), a lone man is immune, and spare men can sleep on a number the Mash cannot reach.

## The bot games

Twenty games an arm on the same seeds.

| | Now | One house | Last seat | Draft, bad batch | Draft, leftover die |
| --- | --- | --- | --- | --- | --- |
| Crowned by Day 90 | 17 | 17 | 18 | 15 | 13 |
| Median crown Day | 59 | 60 | 61 | 51 | 57 |
| Barrels brewed a Day (table) | 4.52 | 4.13 | 3.48 | 2.74 | 3.58 |
| Of them, poured by a rival's pick | 47% | 47% | 56% | none | none |
| Blows a game | 32.5 | 22.2 | 56.1 (forced) | none | 70.5 (the die) |
| Mobsters dead to Blowback a game | 60.7 | 40.4 | 24.5 | 33.3 | 81.7 |
| Bosses dead to Blowback, all 20 games | 0 | 0 | 0 | 0 | 127 |
| Unload's share of Unload + Extort cash | 45% | 35% | 36% | 25% | 35% |
| Unload cash a game | $31,700 | $25,500 | $25,000 | $19,800 | $30,400 |
| Rum Traded a game | 72 | 61 | 54 | 48 | 66 |
| Kickbacks a game | 27 | 23 | 21 | 18 | 25 |
| Fights a game | 55 | 41 | 39 | 40 | 35 |
| Runners Recruited a game | 150 | 104 | 90 | 107 | 126 |

Reading it:

- **Brew.** Each step since the draft raised it: the Dock brew over the bad-batch draft, the choice to
  blow over the forced blow (the last seat brews again), the free Safehouses over the one house.
- **Cash.** The share moving to Unload, and the Rum and Kickbacks that follow it, is the clearest win.
- **Blood.** "Now" kills the most men by Blowback of any arm but the leftover die: 61 a game, about a
  man a Day, and 150 Recruits a game to replace them. That is the bots' price list, not the rule's: they
  count a dead rival Runner at a barrel and a half or more and the blow at 2.5, where the sim's racer
  counts a rival's loss at a third. Still, it is the figure to watch at the table.
- **No Dock, no pick.** A boss sat out the Brew with no Dock on about 46 seat-mornings a game, one in
  six. Losing the last Dock costs a starting family three barrels in five and the gun.

**One seat's policy changed, the other three left alone** (seat 0, the same 20 seeds, on a local copy of the
bot with a per-seat blow price and a per-seat pass; nothing pushed to mk-online). The bots' own blow price is
2.5 barrels.

| Seat 0 | Its wins in 20 | Its mean rank | Its Respect at the end | Table blows a game | Table barrels a Day | Median crown Day |
| --- | --- | --- | --- | --- | --- | --- |
| As the other bots | 3 | 2.30 | 16.1 | 32.5 | 4.52 | 59 |
| Never blows | 7 | 2.25 | 15.9 | 21.9 | 5.04 | 48.5 |
| Blows whenever a shot nets anything | 4 | 2.25 | 14.6 | 41.1 | 4.35 | 57 |
| Passes whenever a brew pours more for rivals than for him | 5 | 2.55 | 13.9 | 33.8 | 4.54 | 57 |

- **Never blowing cost the seat nothing**, and it won 7 games where it had won 3. With that one gun
  silent the table's blows fell by a third, it buried 19 fewer men a game, brewed a tenth more and crowned
  ten Days sooner. Twenty games is suggestive, not proof, but it points the same way as the
  sim: the bots' blows are mostly bad trades for the blower.
- **Blowing at every chance** left the seat's rank where it was and its Respect 1.5 lower.
- **Passing your own barrels to starve a rival** (the bots' "spite pass", harsher than the sim's stingy boss,
  who never passes a number that pours for him) cost the seat 2 Respect and a quarter of a rank, with 5 wins
  against 3. No clear signal either way; nothing in The Almanac rests on it.

## The best strategies

In the order a player meets them. Each is a lesson in The Almanac's Chapter I.

1. **Two Secures on Day 1.** A house on the starting bar and one on the starting Dock lift the brew from
   0.76 to 1.22 for two Plays, for good. The bar first: its 6 or 8 pours oftenest.
2. **Keep the Dock, then add one.** No Dock is a 60% cut and no pick. The second Dock is worth 0.28 a Day
   to a bare start and 0.38 to a housed one, so houses come first. The third and fourth add about half as
   much each. Staten Island is two dice for two men, with no Squad in reach.
3. **Treat the neighbour as a partner at the Brew.** His dice pour your Stills. Do not take his twin for
   barrels. Race him for the house on the shared number.
4. **Sell the rivals' number.** One roll in three makes a number only the men across the river cook. Pass
   it for nothing, or sell it for cash before brewing; never pour it free, and never for the leader.
5. **Take the Venue when the others take theirs, and house it.** A housed 7 at a full table out-brews a
   whole starting family. With all three houses out, the next Secure moves one: it goes to the 7.
6. **Without a 7, hold the match.** Houses on every Still and a third Dock get a no-7 boss to 2.0 against
   2.6, and he is the one boss who can blow the 7s for nothing.
7. **Crews of one, three or five on a Still the Mash can reach.** Read tomorrow's Mash before Laying Low.
8. **Blow as the first shot of an attack**, not for the bodies. Lay Low first the Day before, and only on
   an evening when the Mash on the board can reach his number.
9. **At three players, the boss alone on his side** needs his houses down on Day 1, a second Dock in the
   first week, and should pay for pours.

## What changed in The Almanac

Chapter I (The Stills) was rewritten against the sim. Lesson numbers are unchanged, so nothing else in the
book moved.

| # | Lesson | Change |
| --- | --- | --- |
| 2 | The Reverse Snake | The low token "doesn't brew a barrel more": it holds the gun, drinks first from a short Supply and moves first. It said "the barrels and the gun". |
| 3 | The Magic of Seven | The reason changed. Range is still true; the money is the company: four boilers, everybody's dice. A lone 7 is a one-in-six boiler. Figures added. |
| 4 | **The Corkage** (new; it was The Other Way Out) | "Never pour another man's number for nothing." The pass, and selling the pour. |
| 5 | The Leash | What each Dock is worth; houses before piers; Staten Island; losing the last pier. The bracket survives as one sentence (take a pier from the far end of the board). |
| 6 | The Kill Shot | The blow's price in full, the three cases where it pays, the odds by Docks, reading tomorrow's Mash, odd crews. |
| 7 | The Sidecar | Two Secures on Day 1, the bar first; the moved house goes to the 7; one man or three beside it. |
| 8 | The Double | New maxim: "Every boiler has a twin, and his dice pour yours." The twin is a partner; taking it is denial; the three-handed table. |
| | What I've Seen | The made man "stands his Boss on the busiest boiler" was the Boss barrel, gone since 2026-11-20. Now a house and three men. |
| 20 | The Cold Trail | "Only three things put a marker on the Heat Track" is four: a blow at the Brew is the fourth. |
| 23 | The Refund | A paragraph on the earliest trigger in the Day: at four Heat a blow is the fifth marker, and the Raid runs mid-Brew with the blower's name freshest. |
| | New table | "What the morning pays, in barrels a Day", seven rows from the sim. |

**Why The Other Way Out went.** "Can't get sevens? Bracket the ends" was advice against a Harbormaster who
chose the Mash to starve you. With a rolled Mash and Dock dice, a bracket is worth 0.04 barrels a Day over
any other spare pier (1.08 against 1.04) and six points fewer dry mornings. That is one sentence, and it is
in lesson 5.

**Why "corkage".** The fee a house charges to pour a bottle it did not sell you. The word has
been in print since the 1830s (Merriam-Webster gives 1838), it is one word a table can say ("corkage is a hundred a head"), and it names the one new move the
pass created.

Two stale lines went with the rewrite: lesson 8's "or the one with your Boss on it" and the made man's
Boss on the boiler. Both were the Boss barrel.

## Watch list

**1. A sensible table brews less than the bots.** The pass is right as a rule (Nick: "you don't have to
blow if you only match a rival Still"), but it makes the stingy line the selfish one, and the bots do not
take it: 47% of the barrels in the "now" arm were poured by a rival's pick. With every bot passing whenever
a brew would pour more for rivals than for him (`--spitePass=1`, 20 games, the same seeds) the table brewed
3.76 barrels a Day against 4.52, Unload's share of cash fell from 45% to 37%, and 13 games crowned by Day 90
against 17. At the opening the sim puts the gap wider: 3.16 against 5.35. If tables turn out
dry, the cure is on file below; if they haggle every morning, watch the clock instead.

**2. Three players.** The boxed Borough leaves one boss alone on his side of the river: 0.42 barrels a Day
against 0.76 and 0.81, dry on 67% of mornings. Under the draft the loner was the lucky one (nobody to share
dice with, nobody to blow him). He has more free turf beside him, including two Venues, and houses and a
second Dock bring him to 1.08. Whether that is enough is a table question, and the first one to ask of a
three-player game.

**3. The thin opening.** Under a barrel a Day, and Lay Low pays $100 a marker, so in the first week two
markers taken home beat the whole brew. The two Day 1 Secures fix a third of it. If every table opens
Secure, Secure, that is not a decision, and setup could start all three houses on the starting Stills.

**4. The blow.** Rarely worth it on arithmetic, cheap to duck for a boss who reads the Mash, and still 61
dead a game in bots. Watch whether it reads at the table as a weapon with a use (before an assault, against
the 7s) or as a tax on anyone who forgets to count. The Rulebook's Kingpin's Tip ("Any big stack on a Still
is a target, whoever picks before its owner") undersells the late blow: a blow after the owner has brewed
still takes the men.

**5. The evening check.** Good play now includes looking at every Still the Mash can reach before Laying
Low. That is a habit to teach (the Town Planner could carry it) and one more thing to forget.

**6. One Dock is no choice.** Every boss starts with one Dock, so in the first week the Brew is a roll
and a yes or no, where the draft gave every boss a pick from Day 1. The choice of face arrives with the
second Dock. And the low token's prize at the Brew is now the gun alone, since Turn Order moves no
barrels: watch whether anybody still races to Lay Low on a Day he does not mean to blow.

**7. Day 1's Wards.** The Bronx and Brooklyn open 6% ahead at the Brew because their Ward's Still is a 9 or
a 5. It vanishes once three houses are down.

## An option on file

Not a recommendation to ship, and not in any rule text. If tables pass their way into dry mornings, the
smallest rule that removes the reason to pass is **the middleman's cut**: a boss whose pick pours only
rivals' Stills takes 1 barrel himself, into any District he Controls. The sim's section 10 prices it:

| | Today, by seat | Dry | With the cut | Dry |
| --- | --- | --- | --- | --- |
| The opening | 0.76 to 0.81 | 48% | 1.55 to 1.64 | 19% |
| Three players | 0.76, 0.81, 0.42 | 54% | 1.33, 1.40, 1.33 | 21% |
| The grown table | 2.58 to 2.66 | 7% | 3.39 to 3.52 | 1% |

It doubles the opening, closes the three-player gap, and takes the haggling out. It costs a sentence, and
it puts a second barrel source in the Brew, which Nick has cut before (Split the Batch). The Corkage is the
same idea with no rule, so try the table first.

## Files

- `tools/sim_brew_or_blow.js`: the sim. `require()` it from another script to borrow `morning()`.
- `The Almanac v0.9.html`: lessons 2 to 8 and the Figures' captions and note.
- `CLAUDE.md`: *The Brew or Blow review*.
- `Brew Simulator v0.9.html`: its out-of-date note said a Still pours "2 with its Boss"; it says the
  Safehouse now. The tool itself is still the old draft; this sim is the model to rebuild it from.
- Not touched: the Rulebook, the Town Planner, the Playbooks.
