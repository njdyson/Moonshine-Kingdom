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
  Crown's conditions answer, and the High Society Venues are where they drink with the
  judges, so that is where it is taken. They *accept* the new man; he does not found or head
  the Commission (an earlier draft said so and read too strong, so no "Boss of Bosses"), and
  at the climax they "rise to their feet". **Never call the prize a seat or a chair**: "seat"
  already means a turn-order position ("the first seat brews richest", "Hold your seat",
  and throughout The Almanac), and "the chair" is the family's, which Rise refills. A brief
  2026-09-26 draft called it "a seat; on the street, the Crown"; two names for one prize read
  as muddle. "The crown of this town has lain in the gutter since November" nods to Rothstein
  without naming him.
- **The endgame reads in one order everywhere**: the crown, then what the families want (a
  name, which is Respect; the city, which is the Nod; a man nobody owns, which is no Mark),
  then the walk into a High Society Venue and the Play. The Rulebook's Goal page is "The Crown
  of New York", with Jobs and **The Nod: Buy the City** as its two sections; it was "Earning
  Respect" with the Nod filed under it, a layout left over from the card paying 10 Respect.
  The Nod's one-line why: "The families bring the guns. The new man brings the city."
- **Sunset** is a moment, not a phase: the instant the final player Lays Low. It keeps its
  name because other rules point at it (the Handshake deadline, the Welsher, the Turn Tokens,
  and a promise "due at Sunset" dying when the Crown is taken). Deals run out "at Sunset",
  never "at the end of the Day" or "by Day's end": one name for one moment.
- **Influence** stays political: judges, aldermen and precinct captains bought with Bribes.
  Reaching 10 Influence claims **the Nod** (the city vouching for you). The card
  was called the Commission Seat until 2026-09-23; it was renamed because a card called a
  Seat read as the win. Don't bring the old name back. Since 2026-09-25 it pays no Respect:
  it carries the Play that wins, so "the Nod" (permission from above) now fits it exactly.
  "The Nomination" was weighed on 2026-09-26 and not taken: it promises a nominator and a
  vote still to come, and nobody votes; you claim the Nod yourself at 10. Don't call the Nod
  "untouchable" either: that is the Sicilians' keyword.
- **History is a nod, not a lesson.** Most players won't know it. The Rulebook names
  Rothstein once, in the scene that opens A Day in the Life, and stops; the front page is a hook,
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
- The four #7 mainland Speakeasies are fixed High Society venues. They begin under the Police Squads. At an unpadlocked one you Control, every barrel of Rum Unloaded pays a Kickback (see below).
- There is no Sweep. The Muscle Ratio still caps brewing, combat dice, and Blowback casualties at five. Blowback removes Runners first; the Boss dies only with no Runner left in that District.
- Sicilian <b>Untouchable</b> means Police Squads never enter their Safehouse District. A Squad selects the next legal target in reach or stays put.

## Everything is on the table

Since 2026-09-26 cash is open information: it sits on the table in front of you and anyone may
ask for a count (the Rulebook's Cash entry). Everything else already was: Jobs and their
stakes, Respect, the Nod, barrels, Heat and Ledgers. The one hidden thing in the game is the
top card of the Jobs deck, which Whispers lets the Vipers read (since 2026-09-30; before that
Whispers claimed it face-down).

## The Market restocks after the Offers

Since 2026-10-07. A Job taken at the Offers leaves its gap empty; once every boss has chosen,
deal a fresh Job into each gap. The opening Market (Player Count + 1, 1s and 3s, the 5s shuffled in
after) is dealt **face-down** at setup and turns face-up at Day 1's restock, so **Day 1 has no
Offers**. The rule's one home is Grease the Wheels; the Town Planner restates it.

Why: the immediate refill was a lottery that dealt the next picker a card nobody chose. Now every
Job is face-up a full Day before anyone can claim it, the high token picks from the full Market
while the low token takes what's left (a sharper Reverse Snake), and Day 1 is learned on the board
instead of over five cards of prose. Whispers loses a little (the table gets a Day's notice too, and
the Vipers see only the first card of tomorrow's restock); Nick accepts it, and the buff on file is
a fixed top two cards. Don't restore the immediate refill. The Speakeasy grid (a Job per Controlled
Speakeasy, tiered 1/3/5 by bar) is parked in `jobs-system-handoff.md` §2b with the problems to solve
first.

## Jobs: one verb, one place

Since 2026-10-10 (Nick; `jobs-audit-handoff.md`). Every Job objective follows one house style,
written out above the card table in `tools/gen_deck.py`:

- **One verb, one place, and at most one other condition**, which should be a fact you can see on
  the table. Naming one District is the point: while the card sits in the Market, that District is
  where the table looks.
- Counts read "N+ barrels", "N+ Moonshine" or "N+ Rum", and end "in one Play". A single event
  (Seize, Secure, Rise, take over, kill a Boss) needs no such phrase.
- Name the **District**, the big word on the board's sign, not the venue under it.
- Use the defined word: Seize, Empty, take over, **home Borough** and **home Ward** (in the Glossary
  since the same day). Never a count of Districts across a Borough. Those were the Deeds' stand-ins:
  Tenement Army's described your own home Ward, so it was free on Day 2, and two had no answer for
  a tie.

**The Smuggler's Run is a 3 and Union Dues a 5** (same day). The Smuggler's Run Seizes a Dock, every
mainland Dock is in a bounty Borough, and a firefight is part of the Move that starts it, so it could
pay beside a bounty 5 on one Play. Run `tools/overlap_audit.py` before moving any card that can
Seize or kill into the 5s: it models a Move and its fight as one Play, and it refuses to run until
each card's printed objective matches its model.

**A Fold turns down a kill Job, and that stays.** It denies The Toll Booth Trap, The Butcher's Ledger
and The Irish Goodbye, and pays every Seize Job. The denial is priced (the folding crew leaves the
District, its barrels and its Safehouse), it turns a face-up kill Job into a bluff that buys ground,
and it puts the kill fights where running costs too much, above all a High Society room in the
endgame. Watch in playtest: Queens and Brooklyn can turn their bounty down by Folding; the Bronx and
Manhattan can't.

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
("Shift" or "Distribute" was floated and set aside as rule bloat). Tunnel's edge is reach
(Connected or not); its card dropped "(no Mobsters)", which read as if the Vipers owned the power.

## The crown is a Play: Take the Crown, and only the Nod carries it

Since 2026-09-25. There are no Borough Deeds, Titles, or other board-scoring cards. Respect is
completed Jobs, less **2** for the Rat Card and **1** per Welsher. **The Nod**, claimed the
instant a player reaches **10 Influence**, pays no Respect: it carries the game's one ending
Play, **Take the Crown** (Power Play, 2 Influence, no Heat). Make it on your turn with your
**Boss in a High Society Venue**, no unpaid **Shylock's Mark** and **10+ Respect**, and you win
on the spot. An unpaid Mark does not change Respect, but it bars the Crown until it is cleared.
It is a special, one-time Play that the Nod unlocks, so it lives on the Winning the Game page
(a heading and a three-item list; a Plays-style table there split the page and was cut) and on
the Nod card. Keep it out of the standard Power Plays table
and off the Playbooks' Play lists: listed beside Bribe and Rise, it read as an ordinary Play.

The game ends mid-Day and **nothing else is settled**: a promise due at Sunset dies unpaid.
That free final betrayal is Nick's call, on purpose ("cleaner and more brutal"); do not patch
it by having the Crown open the books. Promises still come due when the final player Lays Low
(the Welsher lands before anything else at Sunset), and one broken by an act lands its Welsher
at once, so only a promise not yet due goes free. One boss acts at a time, so there is no
tiebreak: the Final Standoff is gone, and with it the Loose Change the Playbooks printed.

The Bribe ladder escalates: **$2,000, $3,000, $4,000, $5,000** for the 7th to 10th markers,
never a flat price. The 7th and 8th are tempo markers; the 10th claims the Nod, so every winner
has climbed all four rungs ($14,000).
In the Blood Oath, an Alliance needs **20 combined Respect** with neither partner holding a
Mark (the design docs call this "Solvent"; the Rulebook never defined it, so it isn't
player-facing), and a partner **holding the Nod** Takes the Crown with his own Boss in a High Society Venue; whoever
crowns is the Capo. The Rulebook, Town Planner, Playbooks, Cards sheet, Federal Crackdown
Tracker, and The Almanac must agree on these values.

Why it works: the Crown is its own Play, made from a room the Boss already stands in, so the
Play that completes a boss's conditions can never also crown him. The table always sees it
one turn out, without a special rule. The Nod is public, so is Respect, and the Crown's two
markers mean a boss who spends out qualifying waits for tomorrow.

**Where the crown is won** (since 2026-09-24; it was "Boss on the board"). The Boss must be
standing in one of the four High Society Venues when he Takes the Crown, and a fallen Boss still
**Rises only in a Safe Ward**. The gap between the two is the point: it gives the endgame a
third act, where the leader's Boss is the table's target and a kill costs him a Rise, a walk
and the Crown: five markers at least, a whole Ledger. Rivals get two kinds of denial, both visible and paid for: kill the Boss and hold the
Wards (five on the board), or sit in the room he needs. A full Ward lockout is a feature, not
a hole: Recruit, Unload and Jobs still run, and it lasts only while rivals keep a Runner on
every Ward.

Rejected on the way, so nobody rebuilds them:

- **Rise at the Safehouse** (mirroring Recruit). Players Secure their most valuable District,
  which will be the High Society room, so a killed Boss would respawn on the winning square.
  Any "Boss in a place" win needs Rise somewhere the value isn't.
- **Crown in a Ward** (start in a Ward, end in a Ward). Rise lands in a Ward, so a kill hands
  the leader the win. A "Risen Boss lies on his side for a Day" patch fixed it and was cut as
  too fiddly.
- **Last Call**, the variable ending (`last-call-handoff.md`): extra time only gives the table
  longer to bash the leader.
- **The Coronation** (sudden death, 2026-09-25): win at the end of any Play of yours that meets
  the test. No warning at all: walking into the room won on arrival, and a face-down Vipers Job
  could win from nowhere. Take the Crown keeps its good parts (own turn only, no tiebreak).
- **The Nod still worth 10, plus a Crown Play at 20.** The 10 is dead weight once every winner
  must hold the Nod: it only moves the bar.

Watch in playtest:

- The room doubles as the leader's fortress (Boss, Safehouse, Ambush, and the Recruit point on
  one square). The counter already in the rules is the Raid: the Big Bust goes for the most
  barrels, and a Rum stockpile there is Raid bait.
- **The last boss up.** Rivals who have Laid Low get no turns and can't Ambush, so a boss with
  three markers left after them can walk in and crown back to back.
- Against a bar of 10, the Rat's **2** and each Welsher's **1** weigh twice what they did.
- The Bribe ladder is now compulsory: whether $14,000 lengthens games is untimed.

## High Society buys Rum only; elsewhere the barrel sets the price

Since 2026-09-22:

- **Moonshine** sells for **$300** a barrel and **Havana Rum** for **$500**, at **any of
  the eight ordinary Speakeasies you Control**
- the **four High Society Venues buy Havana Rum and nothing else**, at $500, and every
  barrel Unloaded there pays an Influence **Kickback**. The usual limits apply: a marker in
  Reserves and an empty Ledger slot, else the Kickback is lost. ("The High Society joints
  don't buy swill.")
- the Greed Tax is unchanged, at 4+ barrels Unloaded in one Play, wherever you sell (Peddle
  is exempt since 2026-10-10; see below)

Why: the four High Society Venues sit on the four #7 Stills, which the Harbormaster can never
lock out. When any barrel paid a Kickback, two 7-Mobster stacks could brew, Unload in place
and net +4 Plays and $2,400 on a firing day, from a position rivals struggle to crack. Tying
the Kickback to Rum makes the tempo engine a supply chain (Still, Dock, room): a daily run
loses Plays, a batched run of about ten nets roughly +3, and the stockpile is a Raid target.
Peak cash is unchanged, since the Rum run always existed. Barring swill from those rooms
came next (same day): it states the room's job in one line instead of two clauses, empties
the stack's till in place, and gives the **ordinary Speakeasy next door** a reason to be
held and taken. Every High Society room has one adjacent (Sugar Hill to East Harlem, Morris
Park to Fordham, Richmond Hill to Flushing, Williamsburg to Red Hook or Astoria), so the
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

The one other liquor-type restriction is the Irish **Peddle**, which sells **Moonshine
only**, and **only in Wards you Control**: Speakeasy sales belong to Unload. Since 2026-10-10
(Nick) it pays the **$200 street rate** and **never draws Heat**: no Greed Tax, however many
barrels. It used to sell at the bar's $300 for half the Influence, a strict discount that made
Unload a dead Play for Irish Moonshine. Now the Irish choose: a small batch fetches more at a bar
(three barrels: $900 by Unload, $600 by Peddle), and a big pile goes out quietly in one Play
(ten: $2,000 and no Heat, where an Unload pays $3,000 and draws it). Do not "restore
consistency" by opening Peddle to either liquor or to more addresses, or by putting the Greed
Tax back on it. Watch in playtest: a packed Ward is now a silent cash engine, and a quiet Peddle
clears Raid bait without making the Irish the freshest noise. (`mk-online-rules-sync.md` §9.6
and §27.)

The Rum pool is **20** barrels, and Trade at a Dock (1:1 from Moonshine) is the only way Rum
enters the game. Trade is worth **$200 a barrel** in cash, plus the Kickback if the Rum is
poured at High Society. The Knights' free Rum on every Trade makes them the natural Kickback
crew; watch that in playtest.

History, so nobody rebuilds it: 2026-08-22 had the address set the price and Rum carry the
Kickback at any address; 2026-09-01 reversed that to "any barrel, only at The Hotspot"; v0.9.8
deleted the Hotspot tokens and Titles and fixed the Kickback to the four High Society Venues.
The rule that let the Night Mayor **strand** goods (one liquor to a room) stays dead: nothing
in the game bricks a paid-for asset.

## Open design threads

`rules-streamline-handoff.md` records the v0.9.7 streamline (2026-09-07, shipped 2026-09-10)
and the part of it still open: making the **Sweep** the Sicilians' call (The Commissioner's
Ear). It is not implemented and should not be without Nick asking. The universal Sweep and
the Sicilians' **Untouchable** trait still read as they always have. Read the file before
touching the Sweep, the Sicilian Playbook, or the player-count setup.

The older `deed-sweep-handoff.md` proposal (let the Sweep skip Boroughs whose Deed you hold)
was closed by the Deeds' removal and the file deleted; its combat modelling survives in
`tools/sim_deed_sweep.js`, which still runs and is the tool to reach for on any Sweep change.

**The game is 3 to 4 players** since 2026-09-23. The 2-player North vs South mode is
shelved, not pending, and so is **The Volstead Act** (2026-09-25). It still breaks ties on the
Loose Change the Playbooks no longer print, so it needs a new tiebreak if it returns. Two questions are open, and both
belong to playtest rather than invention:

- **Three-player kingmaking.** Respect is public and the win is a threshold, so at three the
  trailing boss can see who is about to crown and decide the game by stopping one rival
  and not the other. The Blood Oath answers this at four. At three, the current answer is the
  crown itself (above): it needs the Nod, a room that has to be held (four to cover), and a
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
every later Rat hand him back two points; and the four rooms differ in exits and in their
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
- **Stealth is a Move where the Occupier cannot Ambush** (since 2026-10-08; see below). Hold
  Fire and Fold stay open, and the Pin is the standard one, free Fall Back included.
- **Loose barrels belong to nobody**: whoever takes Control of the District takes them.
- **The raided crew's owner picks** which Connected Safe District it runs to (by water too since
  2026-10-07; see below).
- **Split the Batch** stays "may"; the engine never offers a pass, since nobody would refuse it.
- **Whispers is peek-only**: the Vipers may look at the top card of the Jobs deck at any time.
  The face-down claim is gone. Nick rates the peek the higher-skill play: they can prepare for a
  Job before it reaches the Market.
- **Starting Boroughs are random** (the reverse-order pick is gone). How to draw them at the
  table is open: "at random" is the placeholder. Ideas: a Borough on the back of the four Nod
  cards, or four Borough cards kept as your home-Borough card (possibly with an edge there).

## Stealth blocks the Ambush, not the Fold

Since 2026-10-08 (Nick). From 2026-09-30 a Stealth left the Occupier only Hold Fire. Barring the
Fold made the plain Move a tell: a Viper who wanted the block without a fight had to come by the
front door to leave the Fold open, and that told the Occupier to Ambush. Now the Occupier answers a
Stealth as he would any Move, less the Ambush, so the way a Viper comes in says nothing about what
he wants.

Watch in playtest: Stealth now beats a plain Move for any Viper crew of five or fewer with no
barrels, and a thin block facing one will usually Fold (The Almanac's lesson 20: a Boss and four on
a Stealth take a Boss, two Runners and a Safehouse three times in four if he stands). So the Vipers
take more blocks and kill fewer Bosses than they did. Do not bring back "never Fold".

## Torch is a shot; Red dice for the Invader

Since 2026-10-09 (Nick). Torch draws the fight's Heat only if it is the first shot, as Hit does. It
used to draw Heat always, so a fight's first shot plus a Torch put two markers down in one Play and
could take the track from 4 to 6. Now no Play draws more than one marker. In a fight the Invader rolls
**Red** and the Occupier **White**, so nobody has to remember who rolled which; Red also brews.

Collect is stated as what it is: a marker spent on $100, which Laying Low would pay anyway, so it buys a
turn longer on the street. What that does to tomorrow's Turn Token is The Almanac's to teach (lesson 2);
the Rulebook entry describing it through tokens read as a token procedure and was cut.

## A Safehouse is taken over or destroyed

Since 2026-10-10 (Nick). One mechanical verb: a Safehouse sent back to its owner's supply is
**destroyed**, never "razed" (undefined, and gone from the set) or "burns". "Burn down" (Torch) and
"Condemned" (the Raid's Scatter) stay as flavour labels; the rule sentence under each says destroyed.
The printed Bloody Sunday card already said "Destroy". The choice has one home, **A Rival Safehouse**
in Territory: take Control of a block holding one and it can't stay, so **take it over** (yours moves
in from wherever it stood, free) or **destroy** it. Move, Skiff, the Fold and Victory point there. Do
not call the takeover a Secure: it read as costing a Play or $500.

## District words: Empty, Hostile, unguarded; barrels, not Liquor

Since 2026-10-10 (Nick). A District is in one of five states, each with one word:

| On the District | Word |
| --- | --- |
| Your Mobster or Safehouse | you **Control** it |
| No Mobsters, no Safehouse, no Squad (barrels don't count) | **Empty** |
| Rival Mobsters | **Hostile** |
| A rival Safehouse with no Mobsters | **unguarded** |
| A Police Squad | **Impassable** |

**Safe** is yours or Empty. "Empty" replaced **Defenseless**, which read as "a rival block nobody
guards", the unguarded case, which it never included; the same Districts, so the Jobs that used it
(The Empty Casket, Squatter's Rights) are unchanged in play. "Undefended HQ", "standing alone" and
"Empty rival Safehouse" are all **unguarded** now. Where a rule depends on rival Mobsters, say
**Hostile**, not "rival turf": an unguarded Safehouse is rival turf and gets no Standoff.

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
keeps its name (The Almanac's lessons 18 and 19 are built on the poker trio, and a Fold hands the
Invader a Seize); a Raid gives no choice but where. A Fold leaves barrels and Safehouse to the
Invader; a Raid destroys the Safehouse and sends the barrels to the Supply. Nowhere to Scram means no
Fold, but an arrest in a Raid. The Raid step stays **The Scatter**; Scram is the run inside it.
Scram is explained inline where it happens (the Fold entry, the Scatter), not as a Territory
entry: Nick's call. "Scram" is 1928 slang.

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
- **Stealth targets a Hostile District** (the defined term: guarded by rival Mobsters). An
  unguarded Safehouse is a plain Move's job, and the engine always refused a Stealth there.
- **Skiff is otherwise a Move**: a Standoff in Hostile turf, take over or destroy an unguarded
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
(Queens has started on Whitestone since the same day; see Starting turf.)

The 2026-07-30 case had four legs. Consistency with Skiff and Tunnel fell on 2026-09-30 (Skiff is a
Move on your own turn; Tunnel carries no crew). The cost that remains is real and accepted: a crew
raided on a Dock almost always has a Safe pier to sail for, since Staten Island's two Docks are
usually empty and no Squad goes there. The Raid still takes all the liquor, which on a Dock is
usually the Rum. Watch in playtest: a crew that sails to an empty Dock takes Control of it, so a
Raid can hand it a free Move across the map and swing the Harbormaster.

The places a crew can still be boxed with one road left are not Docks: Coney Island (Squad on Red
Hook or Canarsie) and Morris Park (Squad on Fordham or Throggs Neck). The Almanac's lesson 23 names
those two. Do not restore "on foot" or "Land Connected" to the Scatter.

**Squads walk** (same day). A Squad's reach is the Districts directly **Land Connected** to it
inside its own Borough. The Rulebook had said "Connected", which let a Squad hop by water between
the two Docks of one Borough (West Side and the Bowery, Whitestone and Jamaica), as mk-online did
until it took the ruling the same day. Nick ruled it out as a hop nobody would spot; the (now
archived) Kingpin's Guide had always said a Squad "cannot jump the water". Crews may sail, cops walk.

Squads stay in their own Borough. Letting them roam was weighed on 2026-10-07 and not taken: free
rein of the map sends all four after the one freshest name, and one step across Borough lines lets
them bunch up and leave a Borough with no police. The Borough lock is what makes the existing levers
(Heat timing, planted barrels, the Rat) readable.

## Starting turf: the North on 8, 9, 10; the South on 4, 5, 6

Since 2026-10-07 (Nick). Each Borough still starts with a Safehouse, its Boss and 2 Runners in its
Ward, and 3 Runners each in one Speakeasy and one Dock, but the Speakeasy and Dock moved so that the
North starts on its 8, 9 and 10 and the South on its 4, 5 and 6:

| Borough | Ward | Speakeasy | Dock |
| --- | --- | --- | --- |
| Manhattan | Five Points 10 | The Tenderloin 8 | The Bowery 9 |
| The Bronx | Hunts Point 9 | Fordham 8 | Throggs Neck 10 |
| Queens | Corona 4 | Flushing 6 | Whitestone 5 |
| Brooklyn | Brownsville 5 | Red Hook 6 | Canarsie 4 |

The two sides mirror each other round the 7, so every Borough's starting Stills total the same
Pressure, 12 (it was 6 in Manhattan and Queens, 9 in the Bronx and Brooklyn). The list's one home is
the Town Planner's Setup column: the Rulebook's Setup defers to it, the board build's roster copies
it (undrawn), and mk-online's `STARTING_TURF` follows it.

Watch in playtest:

- **Each Borough now starts on its orphan Speakeasy**, the one `jobs-system-handoff.md` built the
  four 3-Respect friendly Jobs on (The Big Squeeze, Hell's Highway, Poison Panic, Cuban Prince).
  Still one per seat, so still symmetric, but each is now a Job on the home seat's own turf.
- **Night Landing** (a Dock on Jamaica Bay) suited Queens and Brooklyn, who both started on one;
  now only Brooklyn does. `tools/fairness_audit.py` puts Queens last on the weighted seat balance
  (weighted spread 1 to 2).
- **Manhattan's start no longer touches Sugar Hill**: on Day 1 its Squad has nothing in reach and
  its Crown room is two blocks off. The Bronx, Queens and Brooklyn each start with two Districts
  beside their Squad and their room.
- The Brooklyn Bridge now joins two starting Districts (the Bowery and Red Hook); the Hell Gate
  Bridge (Hunts Point to Astoria) no longer does.

## The board

The board is generated vector art. `tools/draft_board.js` redraws the traced map
(`Art/Board/Traced/`) with straight lines, even rivers and square corners into
`Art/Board/board-geometry.json`, and `tools/build_board.js` draws the board from that and a
roster copied from the Town Planner, each District with a hanging sign. Read `board-handoff.md`
before touching it: it holds the build commands, the 24-inch print spec (Heat Track sockets are
the Ledger's 39 mm chips), the decisions Nick has made so far, and the next pass he has in mind.
mk-online serves a snapshot of this board (`mk-online/dist/board.svg`, the 2026-10-07 board with
Manhattan laid like bricks, from mk-online 31456d5). Its click areas, piece spots and sockets are
generated by mk-online's `scripts/board-ui-geometry.mjs` from `board-geometry.json`, the screen SVG
and the build's sign report, and its `scripts/boardcheck.ts` checks the connection graph against a
copy of `board-geometry.json`. Redraw the board and mk-online needs the same update again
(`mk-online-board-handoff.md`).

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
`The Volstead Act` (shelved), `Still Tokens`, `Turn Tokens`, `The Ledger`, `Brew Simulator`,
`Combat Simulator`, `Federal Crackdown Tracker`, `index.html`, and the board
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
