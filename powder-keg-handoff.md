# The Powder Keg: handoff

Status: **in the main game since 2026-11-01, on probation, and since the same day a pair of Plays**
(see *The keg becomes two Plays*, the last section, which supersedes the Brew, the Sunset blast and the
splash described in the record above it). Nick on probation: "I'm not 100% certain this makes the cut
... it may be extra complexity for not enough gain"; CLAUDE.md's *The Powder Keg* lists what comes out if
it is cut and holds Nick's calls. The rule as written is the Rulebook's *The Powder Keg: Light the Fuse*.
Everything before the last section is the design record and the trials (mk-online's
`harness/POWDER-KEG-TRIAL.md` has the third), so its numbers and its Brew and Sunset timing are history.
Still to do: the board's print proof, mk-online's engine (`mk-online-rules-sync.md` §46), Bomb card
art, and an Almanac lesson.

## Where it came from

It started as "the pineapple", a mob Signature Play or standalone rule discussed in an earlier
session that left no record in the repo (no file, commit, branch, issue or PR mentions it; the
branch `claude/mob-special-plays-pineapple-ruhan7` had nothing on it). This file is the first
written record. If the original pineapple notes turn up, check them against this.

Nick's aim: **table excitement and tension**. A public, slow, visible threat that everyone can
answer, which fits *Everything is on the table* and the Crown's "the table always sees it one
turn out".

## The proposal as it stands

> **The Powder Keg.** When a Still marked with the keg pours for you, you may take the black
> barrel in place of one of its barrels, if it's in the box. It Moves like a barrel and belongs
> to whoever Controls its District, but it can't be Unloaded, Traded or Peddled. At Sunset it
> goes off: its District rolls its Muscle Ratio in dice and loses a Mobster for each 4+, and
> each Adjacent District does the same on 5+, Runners first. Then it goes back in the box.
> For the Big Bust, it counts as a barrel.

One new component: a **black barrel**. No new Play, no card, no tracking. It is a **universal
rule, printed on the board** (Nick): not a Signature Play, so every family keeps its two.

### How it plays

- **Made at the Brew** (Nick): the barrels are made then, so the keg is too. Its only cost is
  the barrel it replaces. A Still with a Muscle Ratio of 1 pours one barrel, so taking the keg
  there means pouring nothing else.
- **Goes off at Sunset** (Nick): every keg gets a full Day of hot potato. Nobody can make one
  late, so "lit after everyone has Laid Low" can't happen.
- **The hot potato comes free from existing rules.** Barrels Hold Nothing: a keg sent alone
  into a rival's District becomes his at the end of the Play, and only he can Move it on.
  Every pass costs a Play. A boss who has Laid Low can't pass it back.
- **One at a time looks after itself.** The keg always goes off at Sunset (or goes to the box
  in a Raid or a Torch), so it is back in the box before every Brew. When two factories pour on
  one morning, the boss who brews first in Turn Order gets it ("the bank pays the early riser").
- **The splash** (Nick, 2026-10-31). It's a thematic stretch, since a District is a whole
  neighbourhood, but it makes the keg an event. It also stops a boss holding the keg in a
  fortress all Day and handing it off at the end, and it means an empty District is only a
  safe dump if nothing of yours borders it. Without the splash, an alert rival defused the keg
  with one Move.

### Damage

Use the Threat table's two lowest kill numbers, so players already know them: Level 2 (4+) in
the keg's District, Level 1 (5+) next door. Dice are the Muscle Ratio, so the cap of five holds
(the Muscle Ratio caps brew, dice and dead everywhere). Casualties come off Runners first, as in
the Blowback, so a keg rarely kills a Boss. A Boss-killer open to everyone would undercut the
Sicilian Hit and act as a crown-denial weapon.

Expected kills:

| Crew | Muscle Ratio | In the keg's District (4+) | Next door (5+) |
| --- | --- | --- | --- |
| Boss and four (5) | 3 | 1.5 | 1.0 |
| Boss and eight (9) | 5 | 2.5 | 1.7 |

For scale, a Boss and four invading at Threat 2 roll 3 dice at 4+: 1.5 expected kills, and
they take return fire.

"Adjacent" is the game's term for a border or a Bridge, so the blast crosses Bridges but not the
Dock-to-Dock water links. Don't add a third connection term for it (*Territory wording*).

## Where kegs are made: the factories

Nick, 2026-10-31: **one factory per Borough, on its weakest Still, limited to Docks.** Docks
gain texture, and a Speakeasy factory would add to the bar's existing edge (the brew there can
be Unloaded on the spot).

### The Docks

| Borough | Docks (Still, Pressure) | Weakest | Who starts there | Adjacent to |
| --- | --- | --- | --- | --- |
| Manhattan | West Side (11, 2), the Bowery (9, 4) | **West Side** | nobody | East Harlem, **Five Points** (MN Ward), Sugar Hill (Venue), the Tenderloin (MN bar) |
| The Bronx | Throggs Neck (10, 3) only | **Throggs Neck** | **the Bronx** | Fordham (BX bar), **Hunts Point** (BX Ward), Morris Park (Venue) |
| Queens | Whitestone (5, 5), Jamaica (3, 2) | **Jamaica** | nobody | **Brownsville** (BK Ward), Richmond Hill (Venue) |
| Brooklyn | Canarsie (4, 3) only | **Canarsie** | **Brooklyn** | **Brownsville** (BK Ward), Coney Island, Red Hook (BK bar) |
| Staten Island | Stapleton (12, 1), Tottenville (2, 1) | tie | nobody | each other only |

Adjacency is from `Art/Board/board-geometry.json` (land borders plus the four Bridges).

### The snag: the rule doesn't give a symmetric set

The Bronx and Brooklyn have **one Dock each, and it is their starting Dock**. So "the weakest
Dock in each home Borough" hands those two bosses a factory on Day 1, 3 Runners already on it,
while Manhattan and Queens have to go and take theirs. And every candidate borders a home Ward,
two of them Brooklyn's (Jamaica and Canarsie both border Brownsville).

The options weighed:

1. **Accept it**: West Side, Throggs Neck, Jamaica, Canarsie. Two home factories, two to fight
   for, and Brownsville borders two of them.
2. **The four Docks nobody starts on**: West Side, Jamaica, Stapleton, Tottenville.
3. **Four home Boroughs plus Staten Island**: five factories, and the two home factories remain.
4. **Staten Island alone**: Stapleton and Tottenville.

**Nick's call (2026-10-31): option 2, the two spare mainland Docks plus Staten Island's two.**
Nobody starts with a factory, all four are low-Pressure backwaters that gain a reason to be taken,
and Staten Island (nobody's home) gets a job. It sets aside "one per Borough": two factories on
Staten Island, none in the Bronx or Brooklyn.

Option 4 stays the fallback if kegs come too often. Both Staten Island Stills are Pressure 1 and
light only on a Mash of 1 (Tottenville) or 6 (Stapleton), so kegs would be rare and the Harbormaster
would all but decide them. And a keg there splashes only the other Staten Island Dock until someone
sails it out.

### Which Mash lights which factory

All four factories sit on 2, 3, 11 or 12, so only a low or high Mash lights any of them:

| Mash | Factories in reach (Red needed) |
| --- | --- |
| 1 | Tottenville (1), Jamaica (2) |
| 2 | Jamaica (1) |
| 3 or 4 | none |
| 5 | West Side (6) |
| 6 | West Side (5), Stapleton (6) |

So the Harbormaster can shut the factories for a Day with a Mash of 3 or 4, or pick which end of
the board brews a keg (low lights Queens and Staten Island's south, high lights Manhattan and
Staten Island's north). Split the Batch is the one way round it: a Boss whose Still fires can
fire an Adjacent factory whatever its number.

**Location matters less than it looks, because the keg sails.** A Move goes to any Connected
District, and every Dock is Connected to every other (the Rulebook's Connected entry). A keg
brewed at a Dock factory can be sent to any Dock on the map in one Move. And **every starting
Dock borders its own home Ward** (the Bowery and Five Points, Throggs Neck and Hunts Point,
Whitestone and Flushing, Canarsie and Brownsville). So any keg can reach a rival's starting
Dock, three Runners and all, with his headquarters in the splash. Who a factory borders matters
on the Brew morning; after one Move, any HQ is in range. That is why having no Bronx or
Brooklyn factory costs little, and why Staten Island's island-only adjacency doesn't strand
its kegs.

### How often kegs appear: unknown

Every candidate is a Pressure 1 to 3 Still, so factories pour rarely, and a keg could be an
event every few Days rather than daily. Nobody has measured it. Two existing levers raise it:

- **The Harbormaster** sets tomorrow's Mash, so he can line up a factory's number. The
  Harbormaster is whoever Controls the most Docks, and the factories are Docks, so the two
  contests feed each other.
- **Split the Batch** fires a Still next to your Boss's firing Still whatever its number, so a
  Boss standing beside a factory can force a pour.

A bot run in mk-online would answer this quickly: kegs per game, kills per keg, and how often a
keg is passed.

## The name

**The Powder Keg** (2026-10-31). "Pineapple" was 1920s slang for a hand grenade, the wrong object
for a barrel of explosive. A keg is a barrel, so the name describes the component, and the
idiom (a situation about to blow) is the hot potato in two words. Dynamite was weighed: it's the
period explosive (the 1920 Wall Street bombing was a wagon of it), but "the Dynamite" is clumsy
as a component name.

**Conflict to fix if adopted:** the Rulebook's Heat section says "The Heat Track is a 5-space
powder keg". One name for one thing, so reword that line when the component takes the name.

## The board mark

Nick, 2026-10-31: use a small explosion symbol or similar, not a keg, so it can't be confused
with the liquor barrels.

Mockups: `Art/Board/Mockups/powder-keg-marks.jpg`, made by `node tools/mock_powder_keg.js` (it
pins each candidate mark on the four factory Docks of the built screen board; it is not part of
the board build). Four marks, each in a gilt-rimmed disc and bare.

**Nick's pick (2026-10-31): B, the bomb and fuse, bare** (no disc): the round black bomb with a
gilt outline, a lit fuse and an orange spark, hanging off the sign under the medallion. The
others, kept for reference:

- **A, Starburst**: red-orange burst with a yellow core. The brightest of the four, and
  the recommendation before Nick chose.
- **B, Bomb and fuse**: the anarchist's round bomb. The one concern is that it's black on a
  dark sign, so its gilt outline does all the work. Check it on a print proof at 24 inches, and
  if it sinks, thicken the outline or brighten the spark rather than change the mark.
- **C, Dynamite**: three red sticks and a lit fuse. Clear in the crops, fussy at print size.
- **D, Fuse spark**: a four-point flash. Clean, but could read as a sparkle or a star.

Polish before it goes on the board: in the mockup the fuse's spark touches the medallion's rim,
so it wants a small nudge clear. If adopted, the mark wants a proper home in `tools/build_board.js` (a `keg: true` on the roster entries, drawn in `cluster()`)
and a row in the key ("Powder Keg brewed here" or similar).

## Interactions, checked against the current rules

- **Raid**: the Scatter sends the District's barrels to the Supply, so a Raid defuses the keg
  (back to the box). **The keg counts toward the Big Bust's "most barrels"** (Nick). So a keg
  planted on a rival makes his District likelier to be the Squad's pick, and the Squad that picks
  it defuses it: a boss on the Heat Track may find the cops take the keg off his hands.
- **Torch** burns every barrel in the District, so it defuses the keg too.
- **Fold**: the Occupier leaves his barrels to the Invader, keg included.
- **Advance**: the Invader takes as many carried barrels as he likes; the keg is one of them.
- **Jobs**: the keg is not a barrel for any count (The Warehouse's 10+, the bridge set, the
  bar 1s), and kills at Sunset complete nothing, since they aren't part of a Play (The Toll Booth
  Trap included).
- **The Greed Tax, Trade, Unload, Peddle**: none apply; it can't be sold.
- **Sunset order**: suggested after the Welshers and before the Turn Tokens flip. A Boss killed
  then Rises as usual on a later Day.
- **A Crown before Sunset**: the game ends mid-Day and nothing else is settled, so the keg never
  goes off. Consistent with the unpaid promise.
- **Heat: none** (Nick). The keg is not a Play and the blast draws nothing: there's no clean
  way to say whose it was, and a Heat marker on top of the casualties would punish twice.
- **Friendly fire** (Nick): the blast hits every Mobster in its path, whatever his mob, the
  keg's owner and the boss whose factory brewed it included.

## Rejected on the way, so nobody rebuilds them

- **The keg as a Play (arm it on your turn)**. The arming boss could light it after every rival
  had Laid Low, leaving no answer, and the only cost was the Influence. *Taken on 2026-11-01 in
  another shape (see the last section): Nick now calls the unanswered last Play a skill play, since
  the keg costs a Play to make and a Play to set off, and draws Heat.*
- **Fuse burns until its maker Lays Low.** Needs the table to remember who lit it, and nothing
  else in the game needs tracking beyond one Play (Nick). A card like the Rat Card was floated to
  carry the name, then made unnecessary.
- **Goes off in the Blowback** (when the Blowback Number matched its Still). An uncertain,
  multi-Day fuse, but it was only a second Blowback: anticlimactic (Nick).
- **One die per Mobster** (Nick's first numbers: 4+ in the District, 5+ next door). It beats a
  full assault without return fire, and it gets round the Muscle Ratio's cap of five.
- **"Each mob in its District"**: there is only ever one, by the Golden Rule of Turf (Nick).
- **Factories in the home Wards.** Symmetric and no texture, born in each boss's own HQ, and one
  more reason to sit in a crown room, which Nick has been taking away.
- **Factories at Speakeasies.** The bar already lets its brew be Unloaded on the spot (Nick).

## Settled (Nick, 2026-10-31)

1. **Factories**: West Side, Jamaica, Stapleton, Tottenville (option 2).
2. **Board mark**: B, the bomb and fuse, bare. Proof it in print.
3. **The Big Bust**: the keg counts as a barrel.
4. **Heat**: none.
5. **Friendly fire**: yes, every Mobster in the path, whatever his mob.
6. **Universal rule, printed on the board.** Not a Signature Play.

## Next steps

- **The board.** The rule goes on the board, so the key needs room for it, and the key is
  already full of rows. A candidate line to fit: "**Powder Keg** brewed here in place of a
  barrel. Goes off at Sunset: 4+ here, 5+ next door." The rest (who owns it, no sale, Runners
  first, the Big Bust) lives in the Rulebook. Measure the key before writing more than that.
- **A print proof** of the mark at 24 inches (see *The board mark*).
- **A bot run** in mk-online: kegs per game, kills per keg, how often it's passed, how often a
  Raid defuses it.
- **The rules pass**, when Nick asks: see *If adopted: files to touch*.

## First trial (2026-10-31)

Modelled in mk-online behind a switch (branch `claude/powder-keg-trial`; write-up in its
`harness/POWDER-KEG-TRIAL.md`). 40 paired bot games at 4 players, then one Opus-vs-bots game
(`keg-opus-1`, Opus crowned Day 20).

- **Frequency**: a keg about every 7 Days (bots took it at 43% of factory pours).
- **Damage**: about 1.4 dead a blast; 77% of kegs were Moved once or not at all; a Raid defused 5%.
- **Game length**: median crown Day 37.5 without, 39.5 with; paired, inside the noise.
- **The lone Boss**: 56 of 308 dead were Bosses (1.4 a game), each one alone. Runners first gives a
  Boss with no Runner no cover, so the keg is the cheapest crown-denial weapon on the board against a
  Boss walking to a rival's home Ward. This is the one result that argues with the design above.
- **Opus's view**: a real hot potato once it is out (the last boss with a spare marker aims it), but
  weak to take, feeble late when crews are small, and in the Harbormaster's gift (Mash 1 to 2 lights
  only Jamaica and Tottenville, 5 to 6 only West Side and Stapleton). Opus declined it all four times
  it was offered; it went off twice in the game for 2 Runners and never touched the endgame.

**Nick's response (2026-10-31)**: walking a Boss alone is bad play, since the Muscle Ratio never kills a
Boss with a Runner beside him, so the lone-Boss result is the bots' play, not a flaw in the keg. The keg
wants more teeth. His intuition: **free and optional on top of the brew** ("still a decision, as it may
hamper your plans or be hard to get rid of"), **Muscle Ratio dice at 3+ in its District and 5+ next
door**. One die per Mobster was weighed and not swept: it can kill an escorted Boss and gets round the
cap of five.

**Second round** (same 40 seeds, then `keg-opus-2`):

| | Off | As above | Free, 3+ / 5+ | Free, 3+ / 4+ |
| --- | --- | --- | --- | --- |
| Kegs | | 1 every 7.1 Days | 1 every 3.6 Days | 1 every 3.6 Days |
| Dead per blast | | 1.4 | 1.55 | 1.9 |
| Median crown Day | 37.5 | 39.5 | 42 | 43.5 |

Free doubles the kegs (the bots take one at nearly every pour), and that is what stretches the game,
probably by 4 or 5 Days at Nick's numbers. In the Opus game (Opus crowned Day 16) the keg was taken 8
times, all by one bot, and killed 12 in 6 blasts. Two things to settle:

- **Ping-pong.** Two bosses (bots) bounced it four times between their Docks, each pass making it the other's,
  until one had the last marker. Opus called it the one thing that felt off and suggested "it can't go
  back to the District it came from that Day" or "each boss Moves it once a Day".
- **The Harbormaster's keg.** A Harbormaster who holds a factory names the Mash that lights it (Mash 1
  lights Jamaica and Tottenville) and takes a keg most mornings; Split the Batch lights West Side for a
  boss brewing next door at the Tenderloin.

**Nick's calls on both (2026-10-31): no new rule for either.**

- **No anti-ping-pong rule**: it would pull the keg away from "it Moves like a barrel". Smart players will
  bounce it less, since they know it only comes back: they send it another way, or wait until the rival
  has no Influence left. The bots' bouncing is bot play.
- **The Harbormaster's keg stays**: it feeds the Lay Low race. A boss holding a high factory and a low
  one gets a keg whichever end of the dice the Harbormaster names, and the first to Lay Low drafts first.
  The Harbormaster's one shut-out is a Mash of 3 or 4, which lights no factory (Split the Batch aside),
  and the drafter still needs the right Red in the pool. Nick: that is a feature, a reason to name
  something other than 1 or 6.

Also seen: a splash can strip a Boss's last Runner and leave the next Blowback to kill him, and the keg
plays no part on the closing Day, since the Crown ends the game before Sunset.

## Watch in playtest

- **The last boss up** makes the final pass with nobody left to answer (already on the
  CLAUDE.md watch list for the Crown). The keg rewards staying up late, which costs tomorrow's
  seat, and punishes Laying Low early with crews next to the keg. Possibly good; watch it.
- **Kegs per game** (see above).
- **Neighbours on the Brew morning.** West Side borders Five Points and the Tenderloin
  (Manhattan's Ward and starting bar), and Jamaica borders Brownsville (Brooklyn's Ward), so
  Manhattan and Brooklyn live next to a factory and the Bronx and Queens don't. The keg sails, so
  this matters only until its first Move.
- **Traffic at Jamaica and West Side.** Each already has a 1 that sends players there (Jamaica
  Ginger, The Dutchman's Deal); a factory adds a second reason.

## If adopted: files to touch

Rulebook (a section, Sunset's order, Components, the Glossary, the Big Bust's barrel count,
and the Heat Track line), Town Planner (the roster and the Day's phases),
the board (`tools/build_board.js`: roster flag, mark, and the rule in the key; then mk-online's
board snapshot, per `mk-online-board-handoff.md`), The Almanac (a named lesson, by
house style), mk-online (`mk-online-rules-sync.md` gets a section), and CLAUDE.md.

## The keg becomes two Plays (2026-11-01)

Nick slept on the Brew-and-Sunset keg. **Kept**: the four weakest Stills get a boost and the board's
geography improves; the tension of the hot potato; its "dam busting" against a stubborn fortress.
**Not liked**: the added rules; two kinds of explosion (the keg's dice beside the Blowback); and a keg
spawned at a Dock, so its maker could sit on it risk-free and sail it to any Dock on his last Play.

The diagnosis that steered it: the hot potato, the dam-buster and the last-move snipe are one mechanism
(putting the keg where its owner can't answer in time). What grated was that the snipe was free and had
the whole map in reach. Banning water was weighed and ruled out: the sail is what makes the factories
fair (without it, Jamaica's keg can only reach Brownsville, since Richmond Hill starts Padlocked, and
West Side's only Manhattan, so Brooklyn and Manhattan would eat every keg).

Options weighed the same day:

1. **A Power Play that rigs a Still for tomorrow's Blowback**, placed next to a District you Control.
   One explosion and a siege's reach, but the planter would wait for the target to Lay Low, so the hot
   potato shrank; set aside for Nick's two-Play idea.
2. **An Irish Signature Play replacing Peddle** (Nick): Powder Keg (1) swaps a barrel for the keg at a
   bomb District; Detonate (1) sets it off where it sits, Heat to the Irish. The Irish hold the fuse, and
   the two Plays give the target a turn to answer unless he has Laid Low. Set aside: the Irish would pair
   two violent Plays and lose their economic one, the bombs would matter to one family, Playbooks are
   dealt at random (at three players the Irish are boxed a quarter of the time, leaving dead bombs on the
   board), and there was a theme risk in an Irish bombing family.
3. **Taken: the same two Plays, open to every mob, with a Bomb card as the fuse** (Nick). The Playbooks
   carry Powder Keg; the card carries Detonate, so its holder is the only one who can set it off, and
   nothing has to be remembered. Peddle stays, every family keeps two Signature Plays, three-player
   games are unaffected, and the four bomb Docks matter to everyone.

**What it removed**: the Brew line and its free, optional choice; the Harbormaster's keg and the Split the
Batch keg (so the bots' median of 8 kegs a game no longer applies); the third step at Sunset (Sunset is
back to a run-in paragraph on the Hustle page); the splash and its 4+ dice; the "no Heat" line.
**What it added**: one Playbook row on every front, the Bomb card, and one Rulebook page.

**The defaults** taken at implementation, Nick's to revisit: the card carries one line ("Detonate · 1
Influence" in the label, "The keg's District loses its Muscle Ratio" in the band); no timer, with "an
unspent keg goes back to the Supply at Sunset" on file as the fix if the card gets hoarded.

**Playbook room**: a one-line row measured 43px on every front, against 21px spare on the Knights, 30 on
the Sicilians and 37 on the Vipers and Irish (Chromium, 925px print box). Row padding went from 8px to
7px (15 rows, about 30px back on every front) and the Knights' Torch row dropped "fight's" ("Heat only
if it's the first shot"), which took it from three lines to two. Result: about 22px spare on the
Knights, Vipers and Irish, 15px on the Sicilians.

**Rulebook room**: the Hustle page took the Powder Keg row and Sunset's paragraph (a run-in, not an
`<h4>`, to fit), and the Rulebook stays 24 pages.

Watch in playtest: how often the keg is made and set off; whether the card gets hoarded; how often
Detonate lands on a boss who has Laid Low against one who could still answer; and whether three Plays
(make, deliver, Detonate) for up to five dead with no return fire is too cheap against a fortress.
