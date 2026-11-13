# Moonshine Kingdom: house rules for editing

## No em dashes. Ever.

This is the convention that regresses most often, so it goes first.

**Never use an em dash in this repo.** That means both spellings, because they render
identically and only one of them is greppable:

- the literal character `—`
- the HTML entity `&mdash;`

Both are banned in player-facing prose *and* in source comments. The repo baseline is
zero; anything above zero is a regression, not a style preference.

Rewrite instead of substituting. An em dash is almost always doing one of four jobs, and
each has a better mark:

| The dash was doing this | Use |
| --- | --- |
| Introducing an explanation | a colon |
| Tacking on an apposition or aside | commas |
| Joining two independent clauses | a full stop or a semicolon |
| Fencing a parenthetical (a matched pair) | parentheses |

If none of those reads well, the sentence wants restructuring. Cutting the aside outright
is usually an improvement, since the dash is often padding a point the surrounding prose
already makes.

**En dashes are fine and are in active use.** `&ndash;` marks numeric ranges (`1&ndash;6`,
`84&ndash;92%`). Do not "fix" those.

Check before committing:

```
python3 tools/check_style.py
```

## Callout boxes: at most one per page

Two callouts on one page is too many. If a page needs a second, the weaker one should be
folded into the surrounding prose, which is usually where it belonged anyway.

The stylesheet defines two kinds, and they are not interchangeable:

- `.key-rule` (crimson) is for **binding rules** that must not read as optional.
- `.note` (gold) is for **flavour and strategy**, including "Kingpin's Tip".

A rule that governs when something resolves is not a tip. If a rule reads as a rider on
the step next to it, fold it into that step rather than boxing it; if it deserves standing
on its own, make it a plain `<h4>` section in the reading order. Reach for `.key-rule`
only when a rule is genuinely easy to miss *and* costly to get wrong.

## Labels use parentheses, not dashes

`Turn Order (Who Strikes First)`, `Supply (Harbormaster)`, `Demand (Night Mayor)`.

## Setting: New York, 1929

Since 2026-09-23 the game is set in **1929**, after Arnold Rothstein's murder. The story is
the war for what he left behind. Rules are unchanged; only the fiction moved:

- **The Crown is the prize; the Commission is the judge** (since 2026-09-26). You fight over
  **the Crown** (the Play, the board's crown icons, the cards' crown shields all say so). **The
  Commission** is the table where the families settle their business: they set the terms the
  Crown's conditions answer: they want the man who can stand in another family's home Ward,
  so that is where it is taken (since 2026-10-24; it was the High Society Venues, where they
  drink with the judges). They *accept* the new man; he does not found or head
  the Commission (an earlier draft said so and read too strong, so no "Boss of Bosses"), and
  at the climax they "rise to their feet". **Never call the prize a seat or a chair**: "seat"
  already means a turn-order position ("the first seat brews richest", "Hold your seat",
  and throughout The Almanac), and "the chair" is the family's, which Rise refills. A brief
  2026-09-26 draft called it "a seat; on the street, the Crown"; two names for one prize read
  as muddle. "The crown of this town has lain in the gutter since November" nods to Rothstein
  without naming him.
- **The endgame reads in one order everywhere**: the crown, then what the families want (a name:
  **20 Respect**, earned by Jobs and bought by Bribes), then the walk into a rival's home Ward and
  the Play. The Rulebook's Goal page is "Respect: Earn It or Buy It" (it was "Your Goal: The Crown of New York" until 2026-10-13, when the title moved to what the page teaches; the Crown has its one home on Winning the Game), with **Jobs: Forge Your Legend** and
  **Bribes: Buy the City** as its two sections (it was "Influence: Buy the City" until 2026-10-12,
  "The Nod: Buy the City" before that, and "Earning Respect" before that). Buy the City's one-line
  why: "The families bring the guns. The new man brings the city."
- **Sunset** is a moment, not a phase: the instant the final player Lays Low. It keeps its
  name because other rules point at it (the Handshake deadline, the Welsher, the Turn Tokens,
  and a promise "due at Sunset" dying when the Crown is taken). Deals run out "at Sunset",
  never "at the end of the Day" or "by Day's end": one name for one moment.
- **Influence** stays political: every Bribe card is a man on the payroll (the Precinct Captain,
  the Alderman, the Judge, the Mayor), and each brings one marker. **The Nod retired on 2026-10-12**
  (see *The crown is a Play*): don't bring it back, nor its earlier names (the Commission Seat
  until 2026-09-23, renamed because a card called a Seat read as the win). "The Nomination" was
  weighed on 2026-09-26 and not taken: it promises a nominator and a vote still to come, and nobody
  votes.
- **History is a nod, not a lesson.** Most players won't know it. The Rulebook names
  Rothstein once, in Setting the Scene (its lore page, which replaced A Day in the Life on 2026-10-16), and stops; the front page is a hook,
  not a history. **The Almanac** is the prequel and the
  player-facing strategy book: Rothstein's advice to a young Charlie Lucania at Lindy's on
  4 November 1928, the night he was shot. It carries the scene, not the history.
  Every Almanac lesson has a **name** before its maxim (The Reverse Snake, The Kill Shot, The
  Decoy Warehouse), mostly the Kingpin's Guide's coinages; keep them when editing, since the
  names are what players carry to the table (`almanac-review-handoff.md` 5.5).
- The **Kingpin's Guide** was archived on 2026-10-07 and, with the rest of the repo's frozen
  history, moved out of the repo entirely on 2026-10-08 (see "What not to edit" below for where).
  The Almanac replaced it. It still holds useful long-form material to mine, but it lags the rules
  (it still says Commission Seat, and still crowns at Sunset on 20 Respect). Don't bring its
  claims back without checking them against the Rulebook.

## v0.9.8 streamlined rules

This supersedes the older Titles, Hotspot, and Sweep notes below until they are fully retired.

- The Day has two phases only: <b>Shadows</b> and <b>The Hustle</b>. When the final player Lays Low, unmet promises take their Welsher, then flip Turn Tokens. Nobody wins at Sunset: the game is won mid-Day, by Take the Crown.
- Title cards and Hotspot tokens are removed. Wards are standard turf; Recruiting always costs $300 per Runner.
- The player Controlling the most Docks is <b>the Harbormaster</b> and sets tomorrow's Mash; tied lead rolls the Mash die. The fourth Shadows step is named <b>The Harbormaster</b> (it was "The Morning Fix" until 2026-09-16; the Title of that name is gone, the step keeps the theme).
- The four #7 mainland Speakeasies are fixed High Society venues. They began under the Police Squads until the Open City (2026-11-11), which starts them open. At an unpadlocked one you Control, every barrel of Rum Unloaded pays a Kickback (see below).
- There is no Sweep. Muscle (a District's Mobsters, max five) sets brewing and combat dice; the Still's Pressure sets Blowback casualties (see *Small Mob*). Blowback removes Runners first; the Boss dies only with no Runner left in that District.
- No family has a passive Trait since 2026-10-15 (see *Mobsters hold turf; two Signature Plays a family*): Untouchable is gone, so a Squad may take any District in its reach.

## Small Mob: a dozen men, one die a man

Since 2026-11-09 (Nick; the thread "Assess a 10 Runner cap", bot rows in `/mnt/project-files/bot-runs/log.md`,
mk-online-rules-sync §55). The game's core is **a small mob holding a big city** through tactics and the
threat of violence, and Nick's main goal is a game his gateway-gamer friends can learn. Four changes:

- **12 Runners** a family (15 before). Nick chose 12 over the 10 first tried for the sound of **"a dozen
  men"**. Use the phrase where it lands (the Rulebook's opening, The Almanac's lesson 16), not everywhere:
  Nick doesn't want it overdone. The start is Boss and 2 in the Ward, 2 on the Dock, 2 at the bar.
- **Muscle**: a District's Mobsters, **max five**, one barrel and one die a man. The Muscle Ratio (half the
  crew, rounded up) is gone; a sixth man in one District adds nothing. The cap of five is what keeps a big
  pile from mattering (Nick). The Rulebook doesn't use the word: since the 2026-11-09 trim, the Brew and the Rules of
  Engagement each say "one barrel (one die) per Mobster, up to 5", and the "Muscle: Street Math" box is gone
  (Nick: the rule reads best where it is used). Don't bring the box back.
- **Blowback by Pressure**: 1 dead at Pressure 1&ndash;2, 2 at 3&ndash;4, 3 at 5&ndash;6, Runners first. The gauge
  gets a second job, and the 7s (where the leaders sit) hurt most. Nick wants Pressure only; a "half the
  crew, capped by tier" version was weighed and not taken. The board's gauge is drawn in **three pairs**
  (a wider gap between the 2nd and 3rd and the 4th and 5th segments, `tools/still_art.js`), one colour
  a pair: gold, orange, red (Nick, the same evening: "while it doesn't look quite as good, I think it'll
  make the rule clearer"; it was a six-step gold-to-red ramp). The Rulebook's map text names the colours.
- **The Safehouse adds no Threat** (Nick's pick on a decision card). With one die a man, a Boss and three
  behind a Safehouse threw back a Boss and six four times in five; without the +1 it is a coin flip.
  Threat now tops out at 3 (Boss and Ambush, or Boss and Tommy Gun), so the Threat tables stop at Level 3.
  The Safehouse is still the Recruit point and the Rise is still at home; it is no wall. Torch burns it and
  the barrels but does nothing for the fight, and the Combat Simulator dropped its Safehouse box and Torch kit.

Bots field about five Runners whatever the cap, so the cap and start don't show in bot runs; one die a man
shortened the crown median (51.5 to the low 40s) and moved cash toward Unload. Turtling needs a real game.
`tools/sim_almanac_combat.js` reproduces The Almanac's figures under these rules.

## The Open City: two Precincts, ten Docks, Snitch

Since 2026-11-11 (Nick, after his own Day 9 game as the Irish; the thread "Ease police pressure and open up the
map", mk-online-rules-sync §61, bot rows in `/mnt/project-files/bot-runs/log.md`). His complaints: the police
were too oppressive (six Raids in nine Days, four Squads padlocking the Venues and the Docks), the 2:1 Trade was
never worth the walk, nobody wanted the ordinary Speakeasies, the Rat went unused, and the Hook never had a
chance. **This section supersedes** the older ones below where they disagree (Contact Docks, the four Squads and
their Borough lock, Skiff, the swap Hook, the Rat Card and the Welshers, the starting bars of Queens and Brooklyn).

- **Two Precincts**, East Harlem and Corona: **no Still and no business**. The North Squad starts on East Harlem,
  the South Squad on Corona, and once a Squad leaves anyone may hold the District. The High Society Venues start
  **open**.
  Since 2026-11-12 East Harlem borders Belmont (Nick), so each Precinct reaches five Districts, three on its
  own side and two on the other. A Precinct is drawn with a faint blue hatching, and the key marks it with the
  Squad's blue shield. The Boroughs lost their numbers the same day; the Squads are numbered 1 (North) and 2 (South).
- **Two Squads**, North (Manhattan, the Bronx) and South (Queens, Brooklyn). Reach is any District Adjacent on its
  own side (a Bridge inside the side counts); it never crosses to the other side. North moves first. A Squad with
  nobody in reach on the Heat Track **goes home** to its Precinct and raids whoever stands there, **Heat or none**
  (Nick: it keeps the Squads central and gives the Precincts a use after the first Raid).
- **Ten Docks.** Belmont and Red Hook are Docks: every mainland Borough is one ordinary Speakeasy, one High
  Society Venue, a Ward and two Docks; Staten Island two Docks. **Every Dock Trades 1:1.** The Contact Docks, their
  schooners and medallions retire; "Rum Row" stays on the board as theme. There are **8 Speakeasies** now.
- **Stills.** The four 7s stay (they dodge the Harbormaster); the mainland 2 and 12 go instead (Nick). The Bowery
  11, Belmont 11, Whitestone 3, Red Hook 3; Queens' bar is **Astoria** and Brooklyn's **Coney Island**, each on the
  6. 2 and 12 are Staten Island's alone. Every start still totals Pressure 12, and the Pressure 5 Stills are still
  the four starting bars.
- **Snitch** is the Rat Play renamed: Power Play, 2, **repeatable**, each one takes a **Rat card** (-1 Respect). A
  broken promise takes a Rat card too. **Twelve Rat cards** (Nick: print 12); none left, nobody Snitches. The Rat
  Card (-3) and the seven Welshers retire, so the Cards sheet is 40 (7 Marks, 12 Rat cards, the Blood Oath on the
  Marks' second sheet). "Rat" still names the card, and a man who breaks his word is a rat.
- **A Rat card is for good.** **Patsy** (Power Play, 2 Influence and any one of your Runners: he goes to your
  supply and a Rat card goes back) shipped with the Open City and was **cut on 2026-11-12** (Nick): it turned the
  Snitch's price into a loan, softened a broken promise, kept the twelve cards from ever running out, and was one
  more Play to teach. It is **parked as a possible mob Signature Play** (see *Open design threads*).
- **Hook** (Irish): plain theft, **up to 2 barrels** from an Adjacent rival District into one you Control, 2
  Influence, no Heat (Nick: he played the Irish and the swap never had a chance).
- **Haul** (Knights, replaces **Skiff**, which Nick disliked, worse with more Docks): Power Play, 2. Mobsters, no
  barrels, **two Adjacent steps**, the first **Safe**; a Standoff if the second is Hostile, with Fall Back to the
  first. Nick floated it for all mobs ("a sprint rather than a walk") and gave it to the Knights "to start with".
- **Jobs.** The four bar 1s whose bars went: The Angel's Share "Seize Belmont.", Poison Panic "Seize Red Hook.",
  Bathtub Gin and Off the Boat "Trade 4+ barrels at" Belmont and Red Hook (Nick: "seize the docks. That encourages
  combat."). Nick will do a full Jobs pass once the core rules settle, so leave the rest of the deck alone.

Bots (40 games, random styles, against today's rules): crown median Day 39 against 51.5; a Raid hits 1.9 Districts
against 3.4; Kickbacks 26.8 a game against 6.6; Rum Traded 89 against 34.5; Extort 34% of cash against 55%; fights
flat (31 against 33); about 4.5 Snitches and 5.5 homecomings a game. Bots barely used Hook and Patsy. Deferred: new
map connections (Hunts Point to Sugar Hill was floated) and a separate Influence sink.

## Everything is on the table

Since 2026-09-26 cash is open information: it sits on the table in front of you and anyone may
ask for a count (the Rulebook's Cash entry). Everything else already was: Jobs and their
stakes, Respect and the Bribe cards behind it, barrels, Heat and Ledgers. The one hidden thing in the game is the
top card of the Jobs deck, which the Vipers read with their Whispers Play (a Play since
2026-10-15, when it also became a claim: a Job claimed with it goes face-up like any other; a
peek at any time from 2026-09-30, a face-down claim before that).

## The Market restocks after the Offers

Since 2026-10-07. A Job taken at the Offers leaves its gap empty; once every boss has chosen,
deal a fresh Job into each gap. The opening Market (Player Count + 1, off the top 15 cards, which
hold no 3s since 2026-11-11; see *Late 3s and the Blood Oath card*) is dealt **face-down** at setup and turns face-up at Day 1's restock, so **Day 1 has no
Offers**. The rule's one home is Grease the Wheels; the Town Planner restates it.

Why: the immediate refill was a lottery that dealt the next picker a card nobody chose. Now every
Job is face-up a full Day before anyone can claim it, the high token picks from the full Market
while the low token takes what's left (a sharper Reverse Snake), and Day 1 is learned on the board
instead of over five cards of prose. Whispers loses a little (the table gets a Day's notice too, and
the Vipers see only the first card of tomorrow's restock); Nick accepts it, and the buff on file is
a fixed top two cards. Don't restore the immediate refill. The Speakeasy grid (a Job per Controlled
Speakeasy, tiered by bar) is parked in `jobs-system-handoff.md` §2b with the problems to solve
first.

## Late 3s and the Blood Oath card

Since 2026-11-11 (Nick). Two setup changes, one step:

- **The 3s come late.** Set the eight 3s aside, shuffle the rest and count 15 off the top, shuffle the
  3s into what's left, put the 15 back on top, then deal the Market. About ten Days of restocks pass
  before the first 3 can appear. In bot runs the 3s held 25% of the Market's slots by Day 5 and 43% by
  Day 10 (they are hard and they sit); with the late 3s, 0% and 15%. The bots did not crown sooner
  (median Day 49 against 43, overlapping quartiles; `bot-runs/log.md`), and Nick took it for the
  cleaner early Market. Its one home is the Rulebook's Stack the Job Deck.
- **The Blood Oath card** replaces the Federal Crackdown Tracker (retired the same day: the page, its
  index tile and its PDF). It wears a Job's back and goes in with the 3s, so it is dealt somewhere from
  the 11th draw on; the restock that deals it forms the Alliances, and a Job takes its gap. Why: a
  Raid count could be stalled to pick a partner, and nobody can time a card. It prints on the Cards
  sheet, in the slot of an eighth Welsher, with the Job back (Nick, the same day: both decks stay 36
  and every sheet is full; there are **7 Welshers**). Print both decks in one run on one stock, or its
  back can be told from a Job's. Art:
  `Art/Jobs/Omerta.jpg` (unused until then); Nick may make a new image. It can't be claimed, so a
  Viper whose Whispers finds it leaves it on top for the next restock, and may tell the table or not.
  In 20 bot games it fired between Day 6 and Day 24. The face carries the title (in red, so it stands
  out from the Jobs), the rule and the flavour only: no tier band and no label (Nick, the same day).

The Volstead Act (shelved) still uses the Tracker as its clock; see *Open design threads*.

## Jobs: one verb, one place

Since 2026-10-10 (Nick; `jobs-audit-handoff.md`). Every Job objective follows one house style,
written out above the card table in `tools/gen_deck.py`:

- **One verb, one place, and at most one other condition**, which should be a fact you can see on
  the table. Naming one District is the point: while the card sits in the Market, that District is
  where the table looks.
- Counts read "N+ barrels", "N+ Moonshine" or "N+ Rum". The Rulebook's The Play Is the Unit says
  a count is what one Play did, so cards don't add "in one Play" (Nick, 2026-10-11; the 2026-10-10
  audit had put it on every count).
- Name the **District**, the big word on the board's sign. A bar card names the bar too, from the
  small line under it: "at the Haymarket in the Tenderloin" (Nick, 2026-10-11). The bar is the theme;
  the District is what the table finds.
- Use the defined word: Seize, Safe, take over, **home Borough** and **home Ward** (in the Glossary
  since the same day). Never a count of Districts across a Borough. Those were the Deeds' stand-ins:
  Tenement Army's described your own home Ward, so it was free on Day 2, and two had no answer for
  a tie.

**The Smuggler's Run** Seizes a Dock, and a firefight is part of the Move that starts it, so it can pay
beside any other Seize Job on one Play. Run `tools/overlap_audit.py` before moving any card that can
Seize into the 3s: it models a Move and its fight as one Play, and it refuses to run until each card's
printed objective matches its model.

**A Fold is a Seize, and the body counts are Seizes** (Nick, 2026-10-13, after the opus-vs-bots-1
playtest in mk-online's `harness/transcripts/`). Until then all eight 5s read "Kill ...", and a Fold
denied them all: of 69 Standoffs, 40 ended in a Fold, six 5s were claimed and none completed, and every
lone Boss Folded. Now the body count reads "Seize a District from 5+ rival Mobsters" (Mobsters,
so a Boss and four Runners are five), so the
Occupier stands and makes the Invader win it, or runs and pays him anyway.
The crew is counted as it met the Invader at the door (the Rulebook's Pulling It Off, its one home).
A kill in a fight the Invader loses pays nothing on them.

**One body count, any Borough** (Nick, 2026-10-14, after the opus-vs-bots-3 playtest). There were four,
one per Borough (Bloody Sunday, Over the Top, Rum Wars, The Butcher's Ledger). Nobody stacked five
Mobsters in one District, so from about Day 25 the four sat in the Market for fifteen Days and kept
newer Jobs out. **The Butcher's Ledger** stays, naming no Borough (Nick's favourite of the four themes;
4+ Mobsters since the retier, below, since nobody built five). Three brew-and-sell 5s replaced the others, to pull
toward the Still now that Extort pays $100 a District:

- **The Real McCoy**: Trade 8+ Moonshine at a Dock. Cut at the retier the same day: Trade draws no Heat,
  so it paid 5 Respect for a profitable Trade you'd make anyway.
- **The Noble Experiment**: Unload 8+ Moonshine outside your home Borough.
- **The Warehouse**: Secure your Safehouse in a District holding 10+ barrels.

Each is a stockpile built in public, and its counterplay is the Raid (a pile that size is the Big
Bust's pick) and taking the District first. Weighed and not taken the same day: **Over the Top** as
"Move across a bridge with ..." (too easy, and it overlapped the bridge 3s). Nick's "Seize a Pressure 6
Still" (a High Society Venue) went in at the retier as **High Roller**.

**The Toll Booth Trap stays a Kill** ("Kill a rival Boss.", anywhere; Nick, the same evening): "a
situational strong arm. You can corner him so he can't fold, or use it as a decoy if you want them to
fold (earning its name 'trap')." A crew with no Connected Safe District to Scram to can't Fold, so the
hunter's work is the cornering, and a face-up Trap that makes a Boss run hands over his block. It is
the deck's one kill Job, so the Rulebook keeps its kill lines ("a Raid makes arrests, not kills", "your
Ambush or return fire completes nothing") and the Glossary its Kill entry. Don't make it a Seize.

## Jobs pay 1, 2 or 3

Since 2026-10-14 (Nick; `jobs-setup-handoff.md` round 6, and the review behind it in the project's
`reviews/jobs-balance-2026-10-14.md`). A Job pays its **Stake**: 1, 2 or 3 Respect. "5 is too swingy":
one card was a quarter of the bar, and a Fold handed over five points at once. **The bar stays 20**
(Nick: a round number; 18 was weighed and not taken), and the Jobs are a touch easier to make up for it.

Because a Play can only pay what its Jobs staked, and the Ledger holds ten markers at most, "never two
5s on one Play" (2026-10-12 to 2026-10-14) is retired. `overlap_audit.py` lists the top-tier pairs (two
3s on one Play) to watch, and fails only if a card leaves the 1/2/3 scale.

The bots' completion rates on the 1/3/5 deck drove the moves (24 games): Union Dues was the easiest card
in the deck (20 of 25) and went down to 2; The Real McCoy (16 of 29, and a win/win) was cut; The
Butcher's Ledger (0 of 34) went to 4+ Mobsters; Opening Night (0 of 30) went down to 2 at 5+ Rum, so the
pour always draws the Greed Tax; the bar 1s went to 5+ barrels for the same reason. Nick likes Opening
Night: don't cut it. Nick dislikes **compounding** Jobs, a card that pays Respect for a Play that
already pays well (8 barrels Traded is a win/win), and likes Jobs whose secondary purpose changes what
rivals do (the Ledger makes them stand rather than Fold). A Job about a rival Safehouse says **destroy**
(a Seize then destroy, or a Torch, both count), never "Torch": only one mob has it. **No Market churn rule** (discarding an unclaimed Job): Nick will decide that
separately, with a bounty idea he has parked.

## Easy 1s, open bars

Since 2026-10-15 (Nick, after the game-length sweep in the project's `reviews/game-length-2026-10-15.md`
and an agent playtest that crowned on Day 23). Two card changes:

- **The Extort set reads "Extort every open Speakeasy in X"**. A Squad starts on each High Society Venue,
  so "all of the Speakeasies" was impossible until it moved, and dead again whenever a Raid parked a Squad
  on a bar; in the playtest the Market sat frozen for four Days on these cards. A Borough has one Squad,
  so two of its three bars are always open and the card needs no floor. At home it is your starting bar
  and the next one: the answer is **denial**, a rival taking the card in the Offers, where for him it is
  a real Job. Weighed and not taken: "outside your home Borough" (a card one boss can never claim).
- **The bar 1s ask 4+ barrels** (5+ from 2026-10-14). Since 2026-11-08 every Unload draws Heat, so
  the 1s carry it too.

Why: one Offer a morning is the bottleneck, so an easy card is still a race to claim it at the right
time, and the easier the cards, the sharper the Lay Low race and the Reverse Snake. The ladder Nick
agreed: **1s quick and easy, 2s a setup the table can see, 3s hard and planned**. Don't make the 3s
easier on this argument. In bot runs (40 games, random styles): Extort-set claims finished 35% to 64%,
the bars 30% to 41%, median crown Day 46 to 39.5, runner-up still about 3 Respect behind at the crown.

## The Market pass: barrels on the bridges

Since 2026-10-17 (Nick; the project's `reviews/jobs-market-stuck-2026-10-17.md`). The goal is a deck in
which no card is reliably ignored. Eight cards held 48% of the Market's slot-Days in 74 bot games and
finished under 15% of claims, and agent seats left the Rum cards face-up to the end. The cure is the
house style: one verb, one place, one condition. A card dies when it asks for two scarce things in one
place, a target only a rival builds, or a place that starts Padlocked.

- **Rum is the gate.** Rum rarely stands anywhere (2 to 5 barrels on the whole board on an average Day):
  it is Traded and poured at a Venue in short order. So the bridge set dropped "your Boss and 4+ Rum" for
  "4+ barrels", The Milk Run joined it at 2 (its bridge ends in a Venue that starts Padlocked), and Last
  One Standing asks 4+ barrels. All four now finish 25 to 40% of claims. Don't put Rum back on a card
  that names one place.
- **The pull toward the Trade** comes from Trade cards instead: The Dutchman's Deal, The Mother Ship and Jamaica
  Ginger. A Trade card at a starting Dock is a home chore, and a big "Trade N+ anywhere" is The Real
  McCoy, cut for compounding.
- **Churn** (Nick, 2026-10-17): not against "a clever, subtle or occasional churn that adds to the game",
  but against cards that don't stick around, since players would turtle and wait for a card that suits.
  Walk Away already lets a boss clear a card he holds. A Raid that discards the oldest Job was tested and
  ends long stalls, but fires about 15 times a game.
- **Still open:** The Smuggler's Run ("Seize a Dock holding 4+ Rum" was tried and still sat) and The
  Butcher's Ledger (3+ barely helped bots). The weighted seat spread went from 3 to 4 (Manhattan gained
  The Milk Run's extra point).

## Jobs: sets, and setup

Since 2026-10-11 (Nick; `jobs-setup-handoff.md`). Two rules shape the deck.

**A 2 or a 3 needs setup**: Plays spent for it alone, before the Play that scores it, that the table
can see coming. Two ways to fail: a **home chore** (on your starting turf, unreachable, what you'd do
anyway) and a **windfall** (a target so common that a fight or sale you'd make anyway pays it).
Every seat starts on its Pressure 5 bar, and Secure reaches any Safe District on the map for $500,
so check any card that names a starting bar, a type the starting bars share, or a Secure with no
other gate.

**Most cards come in symmetric sets**, one card per place in one wording, so a player reads a set
once. The deck is 36 cards, 16 / 12 / 8:

- **1s**: **the bars**, one Unload card for each of the eight ordinary Speakeasies ("Unload 4+
  barrels at <bar> in <District>"; 4+ since 2026-10-15, see *Easy 1s, open bars*), and eight singles for the landmarks, the Docks and
  Staten Island, with **Union Dues** ("Recruit 4+ Runners in a rival's home Borough"; a 1 since
  2026-10-15, the easiest 2 in 24 bot games, 24 of 31 claims finished; a rival's home Ward until
  2026-11-11, when Nick found it too hard at the table: Recruit is only at your Safehouse, so it
  meant Seizing his HQ and taking his Safehouse over, The Eviction plus a hire for 1; bots finished
  it only because they leave their Wards thin), **Cuban Prince** ("Extort
  4+ Docks"; a 1 since 2026-10-17, the easiest 2, 62 of 99) and **Jamaica Ginger** ("Trade 4+ barrels
  at Whitestone"; 2026-10-17, Nick: more Trade cards to pull toward the Rum Trade; it replaced Night
  Landing). Every barrel count on a 1 is 4+, The Dutchman's Deal at the Bowery included (3+ until
  2026-10-21, a card the sets pass missed). The two named Trade cards sit on the empty Contact Dock of
  Manhattan and of Queens, and moved with them on 2026-11-08 (*Contact Docks*): they were West Side and
  Jamaica. Jamaica Ginger kept its name (the tonic, not the place); Nick may want a new one.
- **2s**: **the Extort set**, *Extort every open Speakeasy in* Manhattan (Empire
  State), the Bronx (The Big Squeeze), Queens (King of Queens) or Brooklyn (The Black Hand);
  **the bridge set**, *Move 4+ barrels across* the Williamsburg (The Milk Run), the Hell Gate (Hell's
  Highway), the Queensboro (The One-Way Ride) or the Brooklyn Bridge (A Bridge to Sell); and singles,
  **Last One Standing** ("Secure your Safehouse in Astoria holding 4+ barrels"), The Copper Heist,
  **The Insurance Job** and
  **Opening Night** ("Unload 5+ Rum at the High Society Venue in your home Borough"). Opening Night
  was made home-only so the pour couldn't be made in the room its holder crowned in; since the Crown
  moved to the Wards (2026-10-24) it is not crown-related, and the text stands. The Insurance Job reads
  "Set off a Raid that padlocks a Pressure 1 or 2 Still you Control" (Nick, 2026-10-15): any Raid
  your own Play sets off, the 5th Heat marker or a Rat, so it no longer forces the Rat Card. It
  stays the deck's one Rat-shaped card by Nick's call (`jobs-system-handoff.md` §4).
- **3s**: no set (Nick, 2026-10-13: "more variety is likely better to avoid a stale standard
  ending"). **The Butcher's Ledger** ("Seize a District from 4+ rival Mobsters", anywhere), **The
  Toll Booth Trap** ("Kill a rival Boss", anywhere), **High Roller** ("Seize a High Society Venue"),
  **The Smuggler's Run**, **The Eviction** ("Seize a District with a rival's Safehouse, and take it
  over"; Nick, 2026-10-15: once a Safehouse alone held nothing, a $500 Secure onto a lone one paid it
  from anywhere, so a walk-in or a Secure no longer counts), **The Five Families**, **The Noble Experiment** and
  **The Warehouse**. Nick likes the body count as a stand-in for the cut Sweep: any fat stack is a
  target. Don't add a "but no Boss" clause back.
  From 2026-10-14 to 2026-10-23, High Roller taken last brought the Respect and walked the Boss into
  the room on one Play (Nick: a feature, "it would create a final battle"). Since the Crown moved to
  the Wards it is an assault on the best real estate on the board, no longer a crown card. The same
  final battle now comes from The Eviction, whose target starts in a crown room.

The Extort names were Extort cards once, cut because the Borough Deed already paid for holding a
Borough; the Deeds' removal ended that objection, so don't cut them on it again. The overlap model
treats an Extort as one map-wide Play. Nick rates the deck card by card on a review page; its link
is in `jobs-setup-handoff.md`.

## Barrels travel alone

Since 2026-10-01 (a wording pass; the rule itself is old). A Move can send barrels with no
Mobster beside them: the **distribution network** runs them, and the Mobsters ride shotgun
(the Runners' blurb no longer calls them "wheelmen who haul hooch"). When a Play ends, liquor
belongs to whoever Controls the block it sits in; that rule's one home is Barrels Hold Nothing,
in Territory. So barrels sent alone into a District you don't Control stop being yours, with no
Standoff. That is the point, not a hole: it is how a boss sells a rival his stock (Deals on the
Side: only Cash crosses the table, liquor goes by Move), and how he plants evidence to steer a
Big Bust. Follow the Smoke still picks the mob, so planting only picks the door, but the door is
what matters: a rival's dug-in stronghold, or the High Society room his Boss is walking to. It
is a second answer to the room-as-fortress worry under "Watch in playtest".

Do not restrict lone barrels to your own turf, and do not split them into a Play of their own
("Shift" or "Distribute" was floated and set aside as rule bloat).

## The crown is a Play: Take the Crown at 20 Respect

Since 2026-09-25; Respect became the only score on 2026-10-12 (Nick; `respect-endgame-handoff.md`
holds the reasoning, every option weighed, and the watch list). There are no Borough Deeds, Titles,
or other board-scoring cards. **Respect is your pile**: completed Jobs (1, 2 or 3) and Bribe cards
(1 to 4), less **2** per Shylock's Mark you hold and **1** per Rat card (the Rat Card's 3 and the Welshers' 1 until *The Open City*). The
game's one ending Play is **Take the Crown** (Power Play, 2 Influence, no Heat). Make it on your turn
with **20+ Respect** and your **Boss in a rival's home Ward** (since 2026-10-24; see *The Crown in
the Wards*), and you win on the spot. It lives on the Winning the Game page (a heading and a two-item
list: the Name, the Ward) and since 2026-10-12 on the Playbooks (Nick: "these are all of the
actions you can take, play that one and you win the game"). Keep it out of the Rulebook's standard
Power Plays table. On the Playbooks it is not one of the rows: listed beside Bribe and Rise it read
as an ordinary Play, so it closes the Plays as a gilt capstone after Lay Low, in one line that names
the room (a rival's home Ward; until 2026-10-24 it pointed to the Borough card for the rooms). To make room the fronts dropped their "Mob Playbook: colour"
kicker (the enamel band keeps the colour; the backs' "Combat Reference" went too, to match) and Beg,
Rat and Bribe went to one line each.
Move then handed rival turf to the reverse ("Into rival turf: see reverse"), which carries a **Rival
Safehouse** line (with no Mobsters beside it, walk in; guarded, win the District by Fold or fight;
then take it over, free, or destroy it) under the Pinned note, and the
**Handshake** as a rule panel at its foot: it is not a Play, so no 0-cost socket. Since 2026-10-14
the room Collect's row freed went to the fronts' rows (5px padding, 11.5px text, 12.5px names; Nick: "more breathing room
... up the font a touch"). On 2026-10-15 the Faction Trait panel went from the fronts and its room
went to the rows too (8px padding), which leaves the busiest front (the Knights) about 20px spare in
its 925px print box. A new front row needs that room back from somewhere.

The game ends mid-Day and **nothing else is settled**: a promise due at Sunset dies unpaid.
That free final betrayal is Nick's call, on purpose ("cleaner and more brutal"); do not patch
it by having the Crown open the books. Promises still come due when the final player Lays Low
(the Welsher lands before anything else at Sunset), and one broken by an act lands its Welsher
at once, so only a promise not yet due goes free. One boss acts at a time, so there is no
tiebreak: the Final Standoff is gone, and with it the Loose Change the Playbooks printed.

**Bribe cards** (2026-10-12). Sixteen, four of each, in four face-up piles above the Jobs Market.
The Bribe Play (Power Play, Boss on the board) buys one at its printed price; the card goes in your
Respect pile and one Influence marker moves from your supply to your Reserves (unbought Influence
waits in the supply, not on the Borough card). **One of each per boss, in any order.**

| Card | Price | Respect |
| --- | --- | --- |
| Precinct Captain | $2,000 | 1 |
| Alderman | $3,000 | 2 |
| Judge | $4,000 | 3 |
| Mayor | $5,000 | 4 |

The dearer the man, the cheaper his Respect ($2,000 a point for the Captain, $1,250 for the Mayor),
so the order is a real choice: the Captain is the cheap tempo marker, the Mayor the cheap Respect and
the natural closer. One of each because otherwise a rich boss buys Mayors and denies the pile (Nick).
Don't flatten the prices, put powers on the cards (that is the Titles back), or make the officials
unique to one boss. The card titles drop "The" because "The Precinct Captain" needs 8pt to fit.
Since 2026-10-13 the card prints only what it gives (Nick): the price in the kicker, the Respect on
the shield, and "+1 Influence" in the rules band. The Play's rule, "one of each" included, lives in
the Playbooks' Bribe row and the Rulebook; don't put it back on the card. The same day the rest of
the Cards sheet went the same way: **every card carries one short line and no rule text** (the
Rat "No Rat till a rival Rats", the Mark "Square Up: $2,000", the Welsher "Forever", a Borough its
three rooms). The Respect is on the shield, so no card restates it.

In the Blood Oath (Nick, 2026-11-11), an Alliance races to **30 combined Respect**, and **both partners** must
Take the Crown, each with his own Boss in a home Ward of the opposing Alliance, with the Alliance at 30 each
time (so a partner can't crown and then take Marks or break deals to pay for it). The first crown wins nothing:
turn that Ward's Borough card face down ("their Ward has fallen"), and nobody crowns there again. The second
partner crowns in the other Ward, still face-up, and **both partners win**. The universal crown rule reads "a
rival's home Ward whose Borough card lies face-up" (the Rulebook's Winning list; in the standard game nothing
flips). The Rulebook's section is *Their Ward Has Fallen*.

Why: from 2026-10-12 to 2026-11-11 the target was 40 combined and either partner crowned. A combined bar moves
the leader's finish line at the Truce (needing 4, then 15), and a solo 20 with a shared win lets the 4th-place
partner win carried, which Nick called a shallow victory. Two crowns make each partner earn it, and the lower
bar keeps the jump small; two crown Plays in two Wards mean no Alliance can win the moment it forms. Weighed and
not taken: tracking the first crown with the Blood Oath card (the Borough card flip is simpler), and serial
crowns in any Ward (the pair would queue at one door). Before the shared win (*One Crown, One Capo*, until the
same day) only the crowner won, and in the first agent game partners fought over the crown rooms nine times.
Don't bring back a Capo-only win.
The Rulebook, Town Planner, Playbooks, Cards sheet, Jobs deck (the Blood Oath card), and The Almanac must
agree on these values.

Why it works: the Crown is its own Play, made from a room the Boss already stands in, so the
Play that takes a boss to 20 can never also crown him. The table always sees it one turn out,
without a special rule. Respect is public, and the Crown's two markers mean a boss who spends out
reaching 20 waits for tomorrow.

**Where the crown is won** (since 2026-09-24; it was "Boss on the board"). The Boss must be
standing in a **rival's home Ward** when he Takes the Crown (since 2026-10-24; from 2026-10-10 a
High Society Venue outside his home Borough, before that any High Society Venue), and a fallen Boss
**Rises only in a Safe District of his home Borough** (any Safe Ward until 2026-10-24). The gap
between the two is the point: it gives the endgame a third act, where the leader's Boss is the
table's target and a kill sends him home, costing him a Rise, a walk and the Crown: five markers at
least, a whole Ledger. Rivals get two kinds of denial, both visible and paid for: kill the Boss and
crowd his home Borough, or hold the Ward he needs (its landlord already does). A full lockout (rival
Mobsters or the Squad on every District of his home Borough) is a feature, not a hole: Recruit,
Unload and Jobs still run, and it lasts only while rivals hold all of it.

Rejected on the way, so nobody rebuilds them:

- **Rise at the Safehouse** (mirroring Recruit). Players Secure their most valuable District,
  which will be the crown room, so a killed Boss would respawn on the winning square.
  Any "Boss in a place" win needs Rise somewhere the value isn't.
- **Crown in a Ward** (start in a Ward, end in a Ward). Rise lands in a Ward, so a kill hands
  the leader the win. A "Risen Boss lies on his side for a Day" patch fixed it and was cut as
  too fiddly. Taken on 2026-10-24 in another shape: the crown room is a *rival's* home Ward and
  Rise is confined to your own home Borough, so a kill sends the Boss home, never into a crown room.
- **Last Call**, the variable ending (`last-call-handoff.md`): extra time only gives the table
  longer to bash the leader.
- **The Coronation** (sudden death, 2026-09-25): win at the end of any Play of yours that meets
  the test. No warning at all: walking into the room won on arrival, and a face-down Vipers Job
  could win from nowhere. Take the Crown keeps its good parts (own turn only, no tiebreak).
- **The Nod still worth 10, plus a Crown Play at 20.** The 10 was dead weight because every winner
  had to hold the Nod: it only moved the bar. Bribe cards differ because they are optional.
- **The Nod itself** (2026-09-23 to 2026-10-12: 10+ Respect, all 10 Influence, no Mark), and the
  alternatives weighed when it went (a Respect-gated Bribe ladder, a flat price, a Bribe at each
  room): all in `respect-endgame-handoff.md`.

Watch in playtest:

- The room doubles as the leader's fortress (Boss, Safehouse, Ambush, and the Recruit point on
  one square). The counters in the rules are the Raid (the Big Bust goes for the most barrels,
  and a Rum stockpile there is Raid bait) and the away crown: since 2026-10-24 the fortress
  has to be built in another boss's home Ward, his own headquarters, which his whole family
  defends and next to which he Rises. A Ward has no bar, so the fortress earns only its brew.
- **The last boss up.** Rivals who have Laid Low get no turns and can't Ambush, so a boss with
  three markers left after them can walk in and crown back to back.
- **Cash's share of the crown**: up to 10 of the 20. If it proves too strong, 1 / 2 / 2 / 3 caps it
  at 8. The Captain pays twice (a marker and a point) for $2,000.
- **Shylock**: a boss with Respect to spare can carry a Mark to the Crown.
- Game length: Bribes are optional, but the bar is 20. Untimed.

## The Crown in the Wards

Since 2026-10-24 (Nick; mk-online's `harness/WARD-CROWN-RULES-HANDOFF.md`, and the engine, bots and
AI harness on its `claude/ward-crown`). Two rules changed, nothing else:

- **Take the Crown in a rival's home Ward**: the Ward of a Borough another boss was dealt. Never your
  own. At three players the boxed Borough's Ward is nobody's home and crowns nobody, so a boss has
  three crown rooms at four players and two at three. It was a High Society Venue outside your home
  Borough (2026-10-10 to 2026-10-23).
- **Rise in any Safe District of your home Borough.** It was any Safe Ward. This is what stops a boss
  from taking a rival's Ward with Runners and Rising straight into it, one Play from the Crown.

Unchanged: the 20 bar, the Play's 2 markers, Bribe cards, setup, and the High Society Venues
themselves (Squads at the start, Rum only, Kickbacks, the #7 Stills), Opening Night and High Roller.

The theme (Nick): **the Wards are the centre of mob power, deep behind the glitz.** Your Boss starts in
your home Ward and comes back in your home Borough, and your rivals must come there to crown. The
Venues are where the money is made. The Rulebook states the two consequences once, on Winning the
Game: every rival's home Ward starts as his headquarters (Boss and Safehouse inside), so the crown is
usually taken by a fight; and a Ward has no bar, so a crew dug in to wait earns only its Still's brew.

Words: the Rulebook's Winning list is **the Name, the Ward** (it was the Room). "Crown room" is the
engine's and harness's word; player text says "a rival's home Ward". The Borough card names its own
Ward under "Home Ward", with "where your rivals crown".

**The Blood Oath** crowns in a home Ward of the **opposing Alliance**. This was a call made in the
rules pass, not by Nick, and is his to confirm: a partner's Ward would let the pair hand the room over
by agreement (he steps out, you walk in), which skips the fight the rule is built on, and "Nothing on
Your Books" already makes a partner worth nothing on the Jobs.

The interactions, all with unchanged text: **Union Dues** (then Recruit 4+ in a rival's home Ward;
his home Borough since 2026-11-11) built a garrison in a crown room; **The Eviction** points at the same doors as the Crown, since every
rival Safehouse starts in his home Ward, and the two chain (take his house over, then Recruit there);
**High Roller** and **Opening Night** are no longer crown-related.

**The board followed the same day** (Nick). The High Society medallions lost their crowns (a gilt disc
and the martini), and the key's Ward row shows the crown where it said "Boss Rises". And **Flushing is
Queens' home Ward**, with Corona its starting Speakeasy: the two swapped type and Still (Corona took
the 6, Flushing the 4). Flushing's bar was Paradise Alley (a real Flushing bar, opened in 1979); Corona's
is **The Junction** (Nick), for Junction Boulevard and the elevated line, and Poison Panic names it. Corona and Brownsville, two home Wards, had
bordered each other, so in a Queens-vs-Brooklyn game each Boss started one Move from a crown room. Now
no two home Wards touch (every pair is two Moves apart, Five Points and Flushing three), Queens' Ward
sits beside its starting Dock, and every home Ward stands on a Pressure 3 or 4 Still (10, 9, 4, 5), so
camping in one pays little. Nick wants it that way: less incentive to sit in a crown room.

## Borough cards: your home Ward

Since 2026-10-10 (Nick). The four **Borough cards** replace the four Nod cards in the Cards sheet,
using the archived Deed plates (`Art/Cards/Manhattan.jpg` and its three siblings). Deal one to each
boss at setup, face-up: it is his **home Borough** (three players: box the fourth, and that Borough
is nobody's home). Each card carries:

- Under "Home Ward", its own Ward (Manhattan's: Five Points) and "where your rivals crown"
  (since 2026-10-24). The card in front of each rival names a room you can crown in; yours names
  the one you defend. **No boss crowns in his own home Ward.** From 2026-10-10 to 2026-10-23 the
  card listed, under "The Crown", the three High Society Venues outside its Borough, with its home
  Ward in the kicker; the kicker now reads "Home Borough". Until 2026-10-13 it printed the whole
  Play; the Play lives on the Playbooks.

From 2026-10-10 to 2026-10-12 the card also held the boss's four unbought Influence markers in a
stack and stated the Nod; both went with the Nod, and the markers wait in the supply.

Why: "home Borough" had no reminder on the table, and how to draw Boroughs was open. The away crown
ends the home fortress (Boss, Safehouse, Ambush and Recruit point on one square behind the home
garrison): every room now has a landlord who can't crown there but lives next door. The home room
still pays its Kickbacks; it just can't win you the game. Since 2026-10-24 the crown room is the
landlord's own home Ward, so he no longer lives next door: he lives there.

The 2026-10-10 watch list (Williamsburg hosting the endgame, Morris Park a backwater) was about the
away Venues and went with them. Watch now: at three players the boxed Borough's Ward crowns nobody,
and Queens' Corona bar borders Brownsville, so Queens starts three Runners one Move from Brooklyn's
crown room (its Boss starts two Moves off, in Flushing).

## Dive bars: any barrel $200; Rum $500 only at High Society

Since 2026-11-13 (Nick, after the Day 17 four-Haiku game, `playtests/haiku55-4p-7-day17-2026-11-13.md`):
an **ordinary Speakeasy pays $200 for any barrel**, Moonshine or Rum, and only a **High Society Venue**
pays $500 for Rum (and only Rum). Theme (Nick): "a dive bar buys anything cheap and won't pay a premium,
the glitz will only buy the good stuff and pays a fortune for it." Why: Rum paid $500 at any bar, so the
Rum run ended at the home bar beside a Dock with no Kickback (the Brooklyn seat won both Open City agent
games pouring Rum at Coney Island, $17,800 in five Unloads in the Day 17 game), and the Venues were
optional. Now the Rum premium lives at the Venues, every premium barrel pays a Kickback, and Moonshine is
the raw product. Stuck Rum still sells at $200, so nothing is stranded; dumping it loses only the
Trade's marker. Nick first floated a Moonshine-only dive bar and chose this to keep that outlet. He
shipped it without waiting for bots ("they don't tell us much about how the game actually plays"); the
A/B is in `bot-runs/log.md`. mk-online keeps the old price for older saves (`G.diveBar`).

The rule sentence: "An ordinary Speakeasy pays $200 per barrel, Moonshine or Rum. A High Society Venue
buys only Havana Rum, at $500." The board key's Speakeasy row is a grey and a brown cube at $200 each.
Watch: Kickbacks (every premium barrel now pays one) and whether the Venues become the fights.

The section below is the older rule (2026-09-22 to 2026-11-12) and its reasoning; where it says Rum
pays $500 at an ordinary Speakeasy, this section supersedes it.

## High Society buys Rum only; elsewhere the barrel sets the price

Since 2026-09-22:

- **Moonshine** sells for **$200** a barrel ($300 until 2026-11-08; see *The Rum economy*) and
  **Havana Rum** for **$500** (until 2026-11-13; now $200, see *Dive bars*), at **any of the eight
  ordinary Speakeasies you Control**
- the **four High Society Venues buy Havana Rum and nothing else**, at $500, and every
  barrel Unloaded there pays an Influence **Kickback**. The usual limits apply: a marker in
  Reserves and an empty Ledger slot, else the Kickback is lost. ("The High Society joints
  don't buy swill.")
- every Unload draws one Heat marker wherever you sell, since 2026-11-08 (see *Every Unload and every
  Extort draws Heat*); Trade never does

Why: the four High Society Venues sit on the four #7 Stills, which the Harbormaster can never
lock out. When any barrel paid a Kickback, two 7-Mobster stacks could brew, Unload in place
and net +4 Plays and $2,400 on a firing day, from a position rivals struggle to crack. Tying
the Kickback to Rum makes the tempo engine a supply chain (Still, Dock, room): a daily run
loses Plays, a batched run of about ten nets roughly +3, and the stockpile is a Raid target.
Peak cash is unchanged, since the Rum run always existed. Barring swill from those rooms
came next (same day): it states the room's job in one line instead of two clauses, empties
the stack's till in place, and gives the **ordinary Speakeasy next door** a reason to be
held and taken. Every High Society room has one adjacent (Sugar Hill to East Harlem, Morris
Park to Fordham, Richmond Hill to Corona, Williamsburg to Red Hook, Astoria or Corona), so the
Moonshine is never stranded: it walks one block, or Trades up at the Dock. Numbers and reasoning are in
`kickback-blowback-handoff.md`; `tools/sim_kickback_ledger.js` reproduces them.

Do not "restore" the old any-barrel Kickback, do not open it to Wards or to other
Speakeasies, and do not let Moonshine back across a High Society bar. The wording that will
creep back is "any Speakeasy you Control buys Moonshine", "every barrel Unloaded there pays
a Kickback", "either kind", "whatever is in them", and "tempo belongs to the room". The
Playbooks and the Town Planner carry the most compressed restatements, so they drift first,
and The Almanac builds strategy passages on the Kickback, so grep it for *argument*,
not just for numbers.

An Unload's own two markers are spent before its Kickbacks land (Nick, 2026-09-26): two markers
left and five Rum poured takes the Ledger to zero, then refills it to five. The Rulebook's Unload
entry says so in as many words (the turn box lists "Pay the cost" last, which read the other way
without it); the Almanac's Rum table ("5 Rum, net +3") and `tools/sim_kickback_ledger.js` assume it.

Peddle (the Irish sold Moonshine in their Wards at $200, with no Heat) was cut on 2026-11-08 (Nick:
"I never liked peddle anyway"): with Moonshine at $200 at the bar, it would have beaten Unload outright.
The Irish have **Hook** in its place (see *The Rum economy*). Don't bring Peddle back.

The Rum pool is **20** barrels, and Trade (2:1 at any Dock, 1:1 at a Contact Dock; see *The Rum economy*)
is the only way Rum enters the game. At a Contact Dock it is worth **$300 a barrel** in cash, at any other
Dock $100 a Rum, plus the Kickback if the Rum is poured at High Society.

History, so nobody rebuilds it: 2026-08-22 had the address set the price and Rum carry the
Kickback at any address; 2026-09-01 reversed that to "any barrel, only at The Hotspot"; v0.9.8
deleted the Hotspot tokens and Titles and fixed the Kickback to the four High Society Venues.
The rule that let the Night Mayor **strand** goods (one liquor to a room) stays dead: nothing
in the game bricks a paid-for asset.

## The Rum economy: Moonshine $200, Trade at any Dock, Hook

Since 2026-11-11 every Dock Trades 1:1 and the Hook is plain theft (*The Open City*). Moonshine $200 stands.

Since 2026-11-08 (Nick, with *Every Unload and every Extort draws Heat*: "This encourages players to
interact with rum"). Three changes, one direction:

- **Moonshine sells for $200** at an ordinary Speakeasy (it was $300). Rum stays $500.
- **Trade at any Dock you Control: 2 Moonshine for 1 Rum; at a Contact Dock, 1 for 1.** Still 1 Influence,
  no Heat, from the pool of 20. Theme: at a Contact Dock the rum comes straight off the boats; anywhere else
  a middleman takes half. The Rulebook's Trade row carries that line.
- **The Irish lose Peddle and gain Hook** (Power Play, 2 Influence, no Heat): swap barrels one for one
  between a District you Control and an **Adjacent** District a rival Controls (a border or a Bridge, not
  the water), any barrels each way: usually your Moonshine for his Rum, but sending Rum or taking his
  Moonshine can deny a rival a Job (Nick, the same evening; the first draft fixed Moonshine out and Rum in).
  Nick, the same evening, after
  a first draft called **Waterfront** (1 Influence and $200: Trade 1:1 at any Dock) turned out dull: a
  plain Trade already draws no Heat, so it only upgraded the Docks ("which is no fun"). He proposed the
  swap (as "Plunder", the Knights' old trait name, so it is Hook instead: one verb, slang for lifting
  cargo) and chose Adjacent over Connected, since Dock to Dock would let it reach every pier on the map.
  Its counterplay is not stacking Rum beside an Irish block.

Bot sweep (40 games an arm, mk-online `lengthdiag.ts`, `/mnt/project-files/bot-runs/log.md`), on the Heat
rule, with a free Irish 1:1 Trade standing in for the Irish Play: Rum traded rose from 20.8 to 34.1 a game,
the crown median went from 50.5 to 44.5 (quartiles overlap), Kickbacks 7.2 to 9.2, and Extort's share of
cash rose from 55% to 62%. Moonshine at $200 alone did most of it (28.6 Rum). Nick expects smart players to
Extort less; his levers if the game drags are cheaper Bribes, richer brews, or cheaper Runners or Secure.

The map followed the same day (see *Contact Docks*): West Side and Jamaica each bordered a High Society
Venue (Sugar Hill, Richmond Hill), so Manhattan and Queens had a one-Move Rum run at 1:1 and the others
didn't. With the Bowery and Whitestone as Contact Docks every Venue is two Moves from one; in bots that
evened the Venues but cut Kickbacks (6.9 a game, against 9.2).

The 1:1 Docks were renamed **Contact Docks** (see *Contact Docks*). Still open (Nick,
2026-11-08): Williamsburg sells the
least Rum in every arm, so its problem is something else; Nick floated swapping it with Red Hook.

## Contact Docks: the Bowery, Whitestone, Stapleton, Tottenville

Retired on 2026-11-11 by *The Open City*: every Dock Trades 1:1. Kept as history.

Since 2026-11-04 (Nick; `trade-docks-handoff.md` holds the evidence and the work list). The four **Contact
Docks** are the Bowery, Whitestone, Stapleton and Tottenville, the Docks nobody starts on, which are the
four Pressure 1 Stills (the 2s and 12s). Until 2026-11-08 Manhattan's and Queens' were West Side and
Jamaica; Nick switched them that day (the Bowery takes West Side's 12 and gives it its 9, Whitestone
takes Jamaica's 2 and gives it its 5, and Manhattan and Queens start on West Side and Jamaica), because
West Side borders Sugar Hill and Jamaica borders Richmond Hill: a one-Move Rum run at 1:1 that only
Manhattan and Queens had. From 2026-11-04 to 2026-11-07 they were the only Docks that Traded;
since 2026-11-08 they Trade 1:1 and every other Dock 2:1 (see *The Rum economy*). The board marks them with
a gilt medallion carrying the Dock's anchor (since 2026-11-09, Nick, after a Gemini read found the corner
schooner easy to miss; the key's Contact Dock row matches) and a rum-runner schooner under the sign, and "RUM ROW" sits low in the Narrows over a small gilt triangle pointing off the
board, with "12 MILES" above it (Nick, 2026-11-09: from 1924 Rum Row lay about twelve miles out). From 2026-11-04 to 2026-11-07 dashed **shipping lanes** ran to it from all four; Nick cut them on
2026-11-08 ("I do like them but they add clutter and confusion"), and then the short arrow left in their
place ("looks like it's broken and coming from nowhere"). Don't bring either back.

- **Words.** They are **Contact Docks** (Nick, 2026-11-09): the mother ships stay out on Rum Row, and
  their fast contact boats run the cargo in to these piers, so no middleman takes his half. They were
  **Landing Docks** for a night (2026-11-08), which Nick dropped because it said the Rum Row boats
  themselves tied up there. From 2026-11-04 they were **Trade Docks** (Nick: a new player never read
  "Trade at any Dock", so the name said what they were for); once every Dock Traded, that name told a
  new player the other Docks couldn't. Rum Dock, Smuggler's Dock, Dark Dock and Free Dock were weighed and not taken. **Rum Row** is where the board's marker points: the line of mother ships offshore,
  the source of the Rum. It names no District. The Job that was called Rum Row (Trade 4+ at a Staten
  Island Dock) is **The Mother Ship** since 2026-11-04 (Nick), so the name means one thing; its art is
  the mother steamer. All three Trade Jobs already name a Contact Dock.
- **One rule sentence.** The Rulebook's Trade row says "At a Dock you Control ... two for one, or one for
  one at a Contact Dock"; the Playbooks' row the same. State it in the positive and stop.
- **Not taken, don't bring back:** an extra Rum per Trade at a Contact Dock (the old Knights trait): it
  rewards one-barrel "micro trades" that waste Days to double up. Two Rum for one Moonshine is too strong. Counting
  Contact Docks twice for the Harbormaster: fiddly, and Staten Island alone would make you Harbormaster.

Why: in four three-Opus games the four already carried 59% of Rum traded, and a starting-Dock Trade was
a small top-up. Naming them makes the Rum a supply chain the table can see (Still, Contact Dock, Venue)
and gives the four weakest Stills a reason to be held. Watch in playtest: Kickbacks (bot sweeps showed
them flat at four players and down at three) and game length (four players ran about 5 Days longer).

## The Powder Keg: cut on 2026-11-04

From 2026-10-31 to 2026-11-04 the game had one black barrel, the **Powder Keg**, and a card, the
**Detonator**: Rig (1) took both at one of the four factory Docks, and Detonate (1, Heat) cost the
District it stood in its Muscle Ratio in Mobsters. It was on probation from the day it became two
Plays, and Nick cut it after the trials: in every version (the written rule, a splash and a dice keg)
it never decided a game, and in the written rule's Opus playtest nobody Rigged it in 22 Days.
`powder-keg-handoff.md` holds the design and everything weighed, and mk-online's
`harness/POWDER-KEG-TRIAL.md` every trial. mk-online keeps the code behind a switch, off.

**The Still swap stays** (West Side 12 / East Harlem 11, Jamaica 2 / Astoria 3; since 2026-11-08 West
Side's 12 and Jamaica's 2 are the Bowery's and Whitestone's, see *Contact Docks*): it made the four
spare Docks the four Pressure 1 Stills, and they are now the Contact Docks, which is the boost to the
weakest Stills Nick liked. Its art stays in the repo, unused: the Detonator card
(`Art/Cards/Detonator.jpg`) and the lit keg (`Art/Rulebook/Powder Keg.png` and its WebP).
The Heat Track's flavour line still calls the track "a 5-space fuse", which names nothing else now.
Don't bring the keg back without Nick asking.

## Open design threads

**Signature Plays under review** (Nick, 2026-11-12: "I'm still not convinced by a couple of them"). **Patsy** is
parked as a candidate mob Play (cut from the standard Plays the same day). **Haul** was a quick replacement for
Skiff and may be good; not proven yet. **Torch** has got much weaker since the Safehouse lost its +1 Threat (*Small
Mob*): a burned Safehouse no longer costs the defender a die. Nothing decided; don't change them without Nick.

`respect-endgame-handoff.md` (2026-10-12, shipped the same day) holds the endgame redesign that
retired the Nod (see *The crown is a Play*): every option weighed, why the numbers are what they
are, the art notes for the Bribe cards, and what to watch in playtest.

`powder-keg-handoff.md` (2026-10-31, the Play version 2026-11-01) holds the Powder Keg's design, the
trials and every option weighed; the keg was cut on 2026-11-04 (see *The Powder Keg: cut*).

`trade-docks-handoff.md` (2026-11-04) holds the Contact Docks' evidence, the board's shipping lanes (cut 2026-11-08),
mk-online's switches (Contact Docks on, keg off, the Commission's Day 28 limit) and the Opus test still
to run. The **Day 28 limit** (if nobody has Taken the Crown by Sunset of Day 28, the Commission crowns
the most Respect, cash breaking a tie, then whoever Laid Low first) is on trial in mk-online only, where
it caps the cost of an AI game that never crowns. Nick is on the fence (2026-11-04): if it stays he will
likely bring back his old Loose Change rule for ties, and a physical game has no easy way to track the
Day without a big extra track or a token that gets forgotten. Keep it out of the Rulebook.

`rules-streamline-handoff.md` records the v0.9.7 streamline (2026-09-07, shipped 2026-09-10)
and the part of it still open: making the **Sweep** the Sicilians' call (The Commissioner's
Ear). It is not implemented and should not be without Nick asking. The universal Sweep and
the Sicilian Playbook still read as they always have (Untouchable was cut on 2026-10-15). Read the file before
touching the Sweep, the Sicilian Playbook, or the player-count setup.

The older `deed-sweep-handoff.md` proposal (let the Sweep skip Boroughs whose Deed you hold)
was closed by the Deeds' removal and the file deleted; its combat modelling survives in
`tools/sim_deed_sweep.js`, which still runs and is the tool to reach for on any Sweep change.

**The game is 3 to 4 players** since 2026-09-23. The 2-player North vs South mode is
shelved, not pending, and so is **The Volstead Act** (2026-09-25). It still breaks ties on the
Loose Change the Playbooks no longer print, so it needs a new tiebreak if it returns, and its clock
was the Federal Crackdown Tracker, retired on 2026-11-11, so it needs a new clock too. Two questions are open, and both
belong to playtest rather than invention:

- **Three-player kingmaking.** Respect is public and the win is a threshold, so at three the
  trailing boss can see who is about to crown and decide the game by stopping one rival
  and not the other. The Blood Oath answers this at four. At three, the current answer is the
  crown itself (above): it needs 20 Respect, a room that has to be held (four to cover), and a
  Play of its own, so the table always gets a turn's warning. Whether that is enough is a
  playtest question. Last Call and the Coronation were rejected.
- **Game length.** The box used to say 90 to 120 minutes. Nobody has timed the current
  rules, so the figure was cut from the Rulebook and the site. Put one back only from a timed
  playtest.

`almanac-review-handoff.md` (2026-09-26, second pass 2026-10-06) holds the combat stress test
behind The Almanac's Gun and endgame lessons (pickets, the sitting duck, folding on barrels, the
walk to the room) and the second pass's lesson-by-lesson corrections; `tools/sim_almanac_combat.js`
and `tools/sim_kickback_ledger.js` reproduce every figure. Sections 4 and 5.4 list observations
for playtest: only a Sicilian Hit reliably stops a Boss dug into a room; the last man up can chain
a pour, a Bribe and the Crown with nobody left to answer; a leader wearing the Rat Card makes
every later Rat hand him back three points (two before 2026-10-12); and the four rooms differ in exits and in their
distance from a Ward.

`kickback-blowback-handoff.md` (2026-09-22) holds the Rum-only Kickback (shipped the same
day) and one still-open proposal: a Blowback shield for the Still that brewed. The shield is
not implemented and should not be without Nick asking; read the file before touching the
Blowback.

## Engine and Rulebook rulings (2026-09-30)

Nick's rulings on the differences mk-online's harness found (the list is in mk-online's
`harness/README.md`):

- **Skiff is a Move on your own turn, nothing more.** The escape by boat on a Fold or Advance
  was cut; don't bring it back.
- **Stealth skips the Standoff** (since 2026-10-15; see below): no Ambush and no Fold, the
  Occupier Holds Fire, and the Pin is the standard one, free Fall Back included.
- **Loose barrels belong to nobody**: whoever takes Control of the District takes them.
- **The raided crew's owner picks** which Connected Safe District it runs to (by water too since
  2026-10-07; see below).
- **Split the Batch** stays "may"; the engine never offers a pass, since nobody would refuse it.
- **Whispers is a Play** since 2026-10-15: look at the top card of the Jobs deck, and claim it at
  once or leave it on top. What the Viper tells the table is his business (Nick, 2026-11-11: "keep it
  to yourself" was unenforceable, and sharing or bluffing makes the Play better). From 2026-09-30 it was a peek at any time (Nick then rated
  the peek the higher-skill play); the 2026-10-15 cut of the passive Traits made it a Play.
- **Starting Boroughs are random** (the reverse-order pick is gone). Since 2026-10-10 they are
  dealt as the four Borough cards (see Borough cards, above).

## Mobsters hold turf; two Signature Plays a family

Since 2026-10-15 (Nick; `mk-online-rules-sync.md` §38).

**Only Mobsters Control a District.** A Safehouse alone holds nothing, so its District is nobody's:
its barrels are anyone's who walks in, its Still is not active for its owner (a lone Safehouse
brewed nothing before either, at Muscle Ratio 0), and it counts for no Extort or Harbormaster. A
District holding only a rival Safehouse is Safe: walk in, no Standoff, take it over or destroy it.
Secure can land on it, and the rival's is destroyed (the Secure row says so; since 2026-10-15 no
Territory line or Playbook calls it a takeover, because naming Secure beside the free takeover made
the takeover read as paid). Secure no longer grants Control, so a new base is two
Plays (Secure, then Recruit). Walking onto a lone Safehouse is not a Seize: nobody Controlled it.
The Rulebook's Key Concepts and Territory carry it.

**No passive Traits.** Each family has exactly two Signature Plays: the Sicilians Hit and
Consigliere (2 markers since 2026-11-09; see below); the Irish **Tommy Gun** (2, In a Firefight: Open Fire with an extra die at +1 Threat)
and **Hook** (2, swap barrels 1:1 with an Adjacent rival; Peddle until 2026-11-08); the Vipers Stealth (see *Stealth skips the Standoff*) and **Whispers** (1, a Play: read
the top Job, claim it at once or leave it); the Knights Skiff and Torch (which now burns
the District's barrels too). Gone: Untouchable, Firepower, Network, passive Whispers, Plunder and
Tunnel. The Playbooks lost their Faction Trait panel, and its room went to the rows.

Watch in playtest:

- **The Tommy Gun** costs a volley: on three markers it lifts a Boss and four into a Boss and three
  from 9% to 18%; on four, two bursts take it 24% against 10% (`tools/sim_almanac_combat.js`, Small Mob
  rules).
- **Whispers** claims outside the Offers, so the Vipers can take a 3 off the deck on Day 1.

## Consigliere costs 2

Since 2026-11-09 (Nick, after the third four-Haiku game in mk-online,
`/mnt/project-files/playtests/haiku55-4p-2-2026-11-09.md`). Once every Extort and Unload drew Heat,
Consigliere at 1 marker cancelled the Heat on any of them: the winning Sicilians removed 14 of the 27
markers laid, mostly their own, as "squeeze, then pull my marker". At 2 a heatless Extort costs 4
markers, so the clean-up is for a big squeeze or pour, and re-aiming a Raid by pulling a rival's marker
stays the Play's other use. "Not your own marker" was weighed and not taken.

## Stealth skips the Standoff

Since 2026-10-15 (Nick, with the Traits' cut: the Vipers are the assassins). A Stealth gets no
Standoff: the Occupier can neither Ambush nor Fold, he Holds Fire, and the Vipers are Pinned. This
reverses 2026-10-08, when the Fold was opened again because barring it made the plain Move a tell (a
Viper who wanted the block without a fight had to come by the front door, and that told the
Occupier to Ambush). Nick accepts the tell now: the plain Move is how a Viper asks for a Fold, and the
Stealth is how he comes to kill.

Watch in playtest: a Boss and four on a Stealth take a Boss and two Runners nineteen times in twenty
(The Almanac's lesson 19; four in ten by the front door), and a lone Boss caught by one can't run, so the Vipers are the
natural hunters for The Toll Booth Trap.

## Torch is a shot; Red dice for the Invader

Since 2026-10-09 (Nick). Torch draws the fight's Heat only if it is the first shot, as Hit does. It
used to draw Heat always, so a fight's first shot plus a Torch put two markers down in one Play and
could take the track from 4 to 6. Now no Play draws more than one marker. Since 2026-10-15 Torch
also sends every barrel in the District to the Supply (it left them unharmed), so it answers a
stockpile as the Raid does. In a fight the Invader rolls
**Red** and the Occupier **White**, so nobody has to remember who rolled which; Red also brews.

## Every Unload and every Extort draws Heat

Since 2026-11-08 (Nick, after two agent games in mk-online where nobody laid the fifth marker and the
first Raid came on Day 17). **Every Unload and every Extort draws one Heat marker**, however many barrels
go or Districts pay. The Greed Tax is gone, and so is Extort's 5+ Districts threshold. Trade (and the
Irish Hook) never draws Heat. Nick: "a play creates heat or it doesn't". Good play is batching: one big pour or
one big squeeze costs the same marker as a small one. He hopes it makes the Rum Trade more appealing,
and if it proves too much, Extort is the first lever to dial back.

State it once per page and stop: no "however small", no "even four barrels". The Playbooks' Unload and
Extort rows say nothing about Heat beyond the flame on the name; the Rulebook's Drawing Heat list has one
line for both (Money Talks).

Bot sweep on matched seeds (40 games a rule, mk-online 7d40cd2, `lengthdiag.ts --heatThresholds`;
`/mnt/project-files/bot-runs/log.md`), new against the 5+ thresholds: Raids 0.66 a Day against 0.34;
crown median Day 50.5 against 37.5, with 4 of 40 games uncrowned at Day 90; Kickbacks and Rum Traded
flat (7.2 against 7.3 a game; 20.8 against 20.1 barrels); Unloads fewer and bigger (3.55 barrels against
3.13). The bots are not retuned for it (they don't batch Extorts), so read length with care; the agent
seats, which avoided Heat under the thresholds, are the real test.

History: from 2026-10-14 to 2026-11-07 an Extort drew Heat only at **5+ Districts** and the Greed Tax at
**5+ barrels** ("five in one Play is loud"), after the opus-vs-bots-1 playtest where Extort laid 54 of 83
Heat markers. Before that every Extort drew Heat and the Greed Tax was 4+. Weighed then and not taken:
no Extort Heat at all (a Raid every 3.5 Days, too rare), and the thresholds at 4+ or 6+.

Watch in playtest:

- **Game length** (above), and whether a Raid every day and a half is fun or just punishing.
- **The Nightcap** (lesson 12): a pour now locks one marker, so N Rum refill N slots only with N+1
  markers clear of Jobs and the Track (`tools/sim_kickback_ledger.js`).
- **The Volstead Act** (shelved) still prints "The Greed Tax bites at three ... (down from 5+)". The rule
  it tightened is gone, so it needs a new twist if it returns.

## Extort at $100, and no Collect

Since 2026-10-14 (Nick, after the opus-vipers playtest in mk-online). **Extort** pays **$100 per District
you Control**, as often as your Ledger pays for it (it was $200, once a Day). **Collect is cut.** Heat: one marker
when it squeezed 5+ Districts; since 2026-11-08 every Extort (see *Every Unload and every Extort draws Heat*).

Why: Extort paid 65 to 71% of the winner's cash, and three of four families had all four Bribes by Day 19.
Nick: "the game should rely on the brew engine and the extort path should be a secondary source." At $100
a District, two Extorts cost four markers to earn what one did, so the daily limit was only a rule to
remember. Collect was niche (0.1% of bot cash): a marker spent on $100 that Laying Low pays anyway, so all
it bought was a turn longer on the street, and any small Play does that. A Trade split in two is the
Almanac's example (lesson 2).

In mk-online, on matched seeds (12 bot games a rule set): Extort's share of cash fell from 66% to 40% and
Unload's rose from 32% to 58%. Extorts per boss per Day stayed at 0.46, because the Ledger is the limit.
The Bribe ladder slowed by half (median Day bought: Alderman 6 to 12, Judge 11 to 22, Mayor 18 to 35)
and Raids eased from 0.48 to 0.39 a Day. An Opus-vs-bots game crowned on Day 41 (the two before it on the
old economy: Days 15 and 22).

Watch in playtest:

- **Game length.** Bribes were half of every winner's Respect, so slower Bribes slow the race unless Jobs
  make it up. Nick's next levers: Bribe prices, or more pull for brew and Unload (Unload at 1 Influence was
  floated; it also makes Kickbacks stronger).
- **The Rum pour.** A Venue pour of 4 and then 3 Rum in two Plays dodged the Greed Tax (until 2026-11-08),
  and the Kickbacks refund more markers than the two Unloads spent. In that game it paid for a Judge and a Mayor in three
  Days.

## A Safehouse is taken over or destroyed

Since 2026-10-10 (Nick). One mechanical verb: a Safehouse sent back to its owner's supply is
**destroyed**, never "razed" (undefined, and gone from the set) or "burns". "Burn down" (Torch) and
"Condemned" (the Raid's Scatter) stay as flavour labels; the rule sentence under each says destroyed.
The printed Bloody Sunday card already said "Destroy". The choice has one home, **A Rival Safehouse**
in Territory: take Control of a block holding one and it can't stay, so **take it over** (yours moves
in from wherever it stood, free) or **destroy** it. Move, Skiff, the Fold and Victory point there. Do
not call the free takeover a Secure: it read as costing a Play or $500. Since 2026-10-15 a Secure
onto a lone rival Safehouse is a takeover too, the paid one (see *Mobsters hold turf*).

## District words: Safe, Hostile, Padlocked; barrels, not Liquor

Since 2026-10-15 (Nick; it was five states from 2026-10-10). Once only Mobsters hold turf, a District
is one of three, each with one word, and Control says whose:

| On the District | Word |
| --- | --- |
| No rival Mobsters, no Squad (yours, or nobody's; barrels and a lone Safehouse don't count) | **Safe** |
| Rival Mobsters | **Hostile** |
| A Police Squad | **Padlocked** |

A Speakeasy that isn't Padlocked is **open** (since 2026-10-15, for the Extort set: "open for business").
It is a word for bars only, not a fourth District state.

You **Control** a District your Mobsters stand on. Retired the same day: **Empty** (no job left once
Safe is defined directly), **unguarded** (a lone rival Safehouse is just Safe), and **Impassable**
(Padlocked names both the District and its shut bar and Still). Before them, "Empty" had replaced
**Defenseless**. Where a rule depends on rival Mobsters, say **Hostile**, not "rival turf". Rule
prose says "a District nobody Controls" where it needs the nobody's case.

Rule sentences say **District**, not block, and **barrels**, not Liquor. "Block" and "liquor" stay in
flavour (italics, scene-setting, the Almanac's voice), and "Liquor Barrels" stays as the component's
name. "Loose Liquor" is retired: barrels in a District nobody Controls are nobody's.

## The Glossary

Since 2026-10-10 the Rulebook ends with **Glossary: Speak the Lingo**: one line per term of art the
aids use without defining, each naming the section that holds the rule. It defines the word and
stops; the rule stays in its section. It is a second home for every definition it carries, so a
change to Connected, Safe, Control, Kill, Seize or any other term listed must be made there too.

## Scram: one run for a Fold and a Raid

Since 2026-10-08 (Nick). A Folding crew and a raided one run the same way, and the run has one name:
it **Scrams**, to one Connected Safe District of its owner's choice, **never the one the trouble
came from**, carrying no liquor. Fold gained that last clause the same day: before it, a Fold could
land on the block the Invader had just emptied and take it, so the two crews swapped blocks. The
Scatter always barred the Squad's block.

What stays apart is what the trigger decides, not the run: **Fold** is the Occupier's choice and
keeps its name (The Almanac's lessons 17 and 18 are built on the poker trio, and a Fold hands the
Invader a Seize); a Raid gives no choice but where. A Fold leaves barrels and Safehouse to the
Invader; a Raid destroys the Safehouse and sends the barrels to the Supply. Nowhere to Scram means no
Fold, but an arrest in a Raid. The Raid step stays **The Scatter**; Scram is the run inside it.
Scram is explained inline where it happens (the Fold entry, the Scatter), not as a Territory
entry: Nick's call. "Scram" is 1928 slang.

## Territory wording (2026-10-15, Nick)

- **The Golden Rule of Turf** says "at the end of every Play". It named Shadows and Sunset, which
  read as though two mobs could share a District across several Plays.
- **Two connection terms, no third**: **Adjacent** (a border or a Bridge) and **Connected** (Adjacent,
  or Dock to Dock across the water). Don't bring back "Water Connected" or "Land Connected".
- The Blue Wall no longer restates how Squads move: Police Raids is its home.

## Movement reads as one family

Since 2026-10-08 (a consistency pass; Nick). Every movement is a Move or a variation on one, and
the shared terms carry the rules:

- **"Connected" already includes water**, so no movement adds "across water via Docks if you
  like". That rider was cut from Advance, Fold, the Scatter's Scram, the Playbooks' Advance and
  the Town Planner: it was left over from the land-only Scatter, and its absence on Move made
  readers wonder whether Move crossed water. Fall Back keeps "across water if that's how you
  came", since a Skiff's origin isn't Connected in the usual sense.
- **Advance takes as many of the carried barrels as you like; the rest are the Occupier's.** Do
  not simplify this to "all of them": leaving barrels is a play (Nick). A rival who Ambushed you
  holds the freshest Heat marker, so the barrels you leave make his block the Big Bust. The
  Rulebook's Advance entry carries that as its flavour line; mk-online's Advance has steppers.
- **Stealth targets a Hostile District** (the defined term: guarded by rival Mobsters). A lone
  rival Safehouse is a plain Move's job, and the engine always refused a Stealth there.
- **Skiff is otherwise a Move**: a Standoff in Hostile turf, take over or destroy a lone rival
  Safehouse. Its entry names the four inland Districts (Fordham, Corona, Flushing, Richmond Hill),
  which mk-online's `NON_COASTAL` holds and `scripts/boardcheck.ts` checks against the board.
- The Playbooks' **Fall Back** row says the carried barrels stay for the Occupier and that an
  empty Ledger forces it (it grew to two lines; every card still fits its print box).

## A raided crew may sail

Since 2026-10-07 a raided crew runs as a Folding one does (since 2026-10-08 both are one run,
**Scram**; see above): to one **Connected** Safe District, across water via Docks if it likes. It
was land-only from 2026-07-30 ("No boats; a Dock is a dead end"). Nick reversed it because Raids
were culling too often, and because the board made one cull close to automatic: the Queens Squad
starts on Richmond Hill beside what was then the Queens starting Dock, Jamaica, whose only other
land exit is Brownsville, Brooklyn's home Ward. No other Borough's starting Dock was that exposed.
(Queens started on Whitestone from the same day until 2026-11-08, when it went back to Jamaica with
the Contact Docks' switch; since crews sail, the Richmond Hill Squad no longer boxes it in. Watch it.)

The 2026-07-30 case had four legs. Consistency with Skiff and Tunnel fell on 2026-09-30 (Skiff is a
Move on your own turn; Tunnel carries no crew). The cost that remains is real and accepted: a crew
raided on a Dock almost always has a Safe pier to sail for, since Staten Island's two Docks are
usually empty and no Squad goes there. The Raid still takes all the liquor, which on a Dock is
usually the Rum. Watch in playtest: a crew that sails to an empty Dock takes Control of it, so a
Raid can hand it a free Move across the map and swing the Harbormaster.

The places a crew can still be boxed with one road left are not Docks: Coney Island (Squad on Red
Hook or Canarsie) and Morris Park (Squad on Fordham or Throggs Neck). The Almanac's lesson 21 names
those two. Do not restore "on foot" or "Adjacent" to the Scatter.

**Squads walk** (same day). A Squad's reach is the Districts directly **Adjacent** to it (Land
Connected until 2026-10-15)
inside its own Borough. The Rulebook had said "Connected", which let a Squad hop by water between
the two Docks of one Borough (West Side and the Bowery, Whitestone and Jamaica), as mk-online did
until it took the ruling the same day. Nick ruled it out as a hop nobody would spot; the (now
archived) Kingpin's Guide had always said a Squad "cannot jump the water". Crews may sail, cops walk.

Since 2026-11-11 two Squads roam a side of the city each (*The Open City*). Before that, Squads stayed in their own Borough. Letting them roam was weighed on 2026-10-07 and not taken: free
rein of the map sends all four after the one freshest name, and one step across Borough lines lets
them bunch up and leave a Borough with no police. The Borough lock is what makes the existing levers
(Heat timing, planted barrels, the Rat) readable.

## Starting turf: the North on 8, 9, 10; the South on 4, 5, 6

Since 2026-11-11 Queens starts on Astoria and Brooklyn on Coney Island, each on the 6 (*The Open City*); the
table below is the older one.

Since 2026-10-07 (Nick). Each Borough still starts with a Safehouse, its Boss and 2 Runners in its
Ward, and 2 Runners each in one Speakeasy and one Dock (3 until 2026-11-09; see *Small Mob*), but the Speakeasy and Dock moved so that the
North starts on its 8, 9 and 10 and the South on its 4, 5 and 6:

| Borough | Ward | Speakeasy | Dock |
| --- | --- | --- | --- |
| Manhattan | Five Points 10 | The Tenderloin 8 | West Side 9 |
| The Bronx | Hunts Point 9 | Fordham 8 | Throggs Neck 10 |
| Queens | Flushing 4 | Corona 6 | Jamaica 5 |
| Brooklyn | Brownsville 5 | Red Hook 6 | Canarsie 4 |

The two sides mirror each other round the 7, so every Borough's starting Stills total the same
Pressure, 12 (it was 6 in Manhattan and Queens, 9 in the Bronx and Brooklyn). Queens' Ward and bar
swapped places on 2026-10-24 (Corona was the Ward, Flushing the bar), Stills and all, so the numbers
held; see *The Crown in the Wards*. On 2026-11-08 Manhattan's Dock moved from the Bowery to West Side
and Queens' from Whitestone to Jamaica, each taking the old Dock's Still (see *Contact Docks*). The list's one home is
the Town Planner's Setup column: the Rulebook's Setup defers to it, the board build's roster copies
it (undrawn), and mk-online's `STARTING_TURF` follows it.

Watch in playtest:

- **Each Borough now starts on its orphan Speakeasy**, the one `jobs-system-handoff.md` built the
  four 3-Respect friendly Jobs on. That made all four home chores, and on 2026-10-11 the Extort set
  replaced them (see *Jobs: sets, and setup*).
- **Night Landing** (a Dock on Jamaica Bay) suited Queens and Brooklyn, who both started on one;
  then only Brooklyn did. It was cut on 2026-10-17 for Jamaica Ginger, which Queens and Brooklyn both
  reach.
- **Manhattan's start touches Sugar Hill again** since 2026-11-08 (West Side borders it), as every
  other Borough's start touches its Squad and Venue.
- **Queens starts on Jamaica**, beside Brownsville (Brooklyn's home Ward, a crown room) and the
  Richmond Hill Squad, and not beside its own Ward, Flushing. Corona already bordered Brownsville.
- The Brooklyn Bridge joins Brooklyn's starting bar (Red Hook) to a Contact Dock (the Bowery) since
  2026-11-08; it joined two starting Districts before.

## The board

The board is generated vector art. `tools/draft_board.js` redraws the traced map
(`Art/Board/Traced/`) with straight lines, even rivers and square corners into
`Art/Board/board-geometry.json`, and `tools/build_board.js` draws the board from that and a roster
copied from the Town Planner, each District with a hanging sign. Read `board-handoff.md` before
touching it: it holds the build commands, the 24-inch print spec (Heat Track sockets are the
Ledger's 39 mm chips), the decisions Nick has made so far, and the next pass he has in mind.
mk-online serves a snapshot of this board (`mk-online/dist/board.svg`). The 2026-11-04 board
(Contact Docks: schooners, Rum Row's route and a Contact Dock key row), approved by Nick, is in
mk-online's `public/board.svg` (its PR #36) and deployed here (latest: mk-online 6ef15ff, PR #37,
the Job renamed The Mother Ship). Its click areas, piece
spots and sockets are generated by mk-online's `scripts/board-ui-geometry.mjs` from
`board-geometry.json`, the screen SVG and the build's sign report, and its `scripts/boardcheck.ts`
checks the connection graph against a copy of `board-geometry.json`. Redraw the board and
mk-online needs the same update again (`mk-online-board-handoff.md`).

## Staten Island: two Docks

Since 2026-10-25 (Nick). The board has **24 Districts**. Westerleigh is gone, merged into
Stapleton, and the island is **Stapleton** (Dock, Still 12) over **Tottenville** (Dock, Still 2),
tapering to the south-west like the real island. Stapleton is no longer a Ward, so the four home
Wards are the only Wards. Every Still number now appears on exactly two Districts, but the 7s
(four). Consequences, text unchanged: the Pressure 5 Stills are the four starting bars alone (The
Copper Heist), and Staten Island's pair, a 2 beside a 12, is no bracket (only a Mash of 1 or 6
lights either; The Almanac's lesson 4 says so). The same pass gave the Bowery a blunt point.
`board-handoff.md` has the geometry and its numbers.

## Respect shields are generated SVG

Since 2026-10-12 every Respect badge (the Jobs deck's 1, 2 and 3; the Cards sheet's Bribes 1 to 4,
Welsher -1, Mark -2 and Rat -3) is an SVG in `Art/Shields/` (`plus1.svg` to `plus5.svg`,
`minus1.svg` to `minus3.svg`), drawn by `tools/build_shields.py` (`pip install fonttools`): one
shield traced from the old PNGs, Cinzel Black numerals (the card titles' face, and the board's for
its Borough and Heat Track numbers) as outlines, so the files need no font. Bebas Neue, the Stills'
face, was tried the same day and Nick preferred Cinzel. The Stills keep Bebas Neue: a Still's "12"
must fit a 51-unit boiler, and Cinzel's is 1.34 times as wide as it is tall against Bebas's 0.78,
so at today's 37.8-unit height it would run wall to wall. Edit the script and rerun it; don't hand-edit the SVGs or bring back PNG
shields. **No CSS `filter` on `.respect`**: Chrome prints a filtered element as a bitmap, so the
drop shadow is drawn inside the SVG as stacked translucent strokes, and the badges print as vectors.

## What not to edit

- There is no in-repo `Archive/` any more. On 2026-10-08 its contents moved to the outer
  "Moonshine Kingdom" Drive folder's own `Archive/` (under a dated era subfolder), alongside the
  rest of the project's pre-repo history, so the repo stops carrying its weight and repo-wide
  greps/counts stop tripping over its old terminology. It is still frozen history: don't mine it
  for claims without checking them against the current Rulebook, and don't recreate an in-repo
  `Archive/` to stash new "old versions" in, since the next session won't know to leave it alone
  the way this rule protected the old one.
- `mk-online/dist/` is committed build output with no source in this repo (the source is
  `njdyson/mk-online`). Do not hand-edit the bundle; mirror it in as `DEPLOY.md` says.

## Keeping the components in sync

A rules change is never one file. The player-facing set is:

`Rulebook`, `The Almanac`, `Playbooks`, `Cards`, `Jobs Cards`, `Town Planner`,
`The Volstead Act` (shelved), `Turn Tokens`, `The Ledger`, `Brew Simulator`,
`Combat Simulator`, `index.html`, and the board
(`tools/build_board.js`: its roster and key).

After changing a rule, grep the whole set for the old wording. The Town Planner and the
Playbooks carry compressed restatements of rules that the Rulebook states in full, and
those restatements drift silently. So does the Rulebook's own Glossary.

## When a rule is cut, don't argue with its ghost

This has happened after nearly every rule deletion the game has had, and unlike the em
dashes it has no baseline to check against: a grep will never catch it, because every
sentence it produces is *true*. The pass is not done when the old wording is
gone. It is done when the new prose reads correctly to someone **who never knew the old
rule**.

The tell is a sentence that defends the rule instead of stating it: a reassurance, a
"still", a "never", a "nobody can". Each one is answering an objection the current rules no
longer raise, so a new reader is being argued with about a question they never asked. That
reads as anxiety rather than instruction, and it compounds, because each ghost looks locally
sensible and only the pile-up feels wrong.

Real examples, all written *after* the market was unified and all cut on 2026-08-23:

| The ghost | What it was defending against |
| --- | --- |
| "the barrels are never dead" | the old rule, where Rum could be stranded |
| "still sells, just for less" | the same |
| "Rum still sells and still pays its Kickback from night one" | the same |
| "nobody can take it off you" | the Night Mayor's deleted power to strand goods |
| "either liquor at any bar", "any liquor $300" | the deleted one-liquor-to-a-room rule |

The fix is always the same: **state the rule in the positive and stop.** "Speakeasy: any
liquor $300" is a map legend arguing with a dead rule; "Speakeasy: $300/barrel" is a map
legend. If a contrast genuinely earns its place, give it **one home**, in the section whose
argument actually needs it, and let every other mention be a passing clause. Four full
restatements of the same idea is drift, not emphasis.

Two habits that catch it:

- Read the changed passage **cold**, as a first-time player. Any sentence that only makes
  sense if you remember the previous version is a ghost, however true it is.
- Keep one unit for a recurring number. The snub cost had been alternating between "$200 a
  barrel" and "$600" across five passages; both were right, and together they made the
  reader do arithmetic to check the pages agreed.

A deletion also tends to leave prose **re-explaining a table it sits next to**, since the
argument that justified the old rule collapses once the rule is gone. If a paragraph walks
the same ladder as the table above it, cut the walk and keep the argument.
