# The Powder Keg: handoff

Status: **design settled, not in the player-facing set; trialled in mk-online 2026-10-31** (see *First trial*). Nothing in the player-facing set mentions it.
Written 2026-10-31 from a design conversation with Nick, to resume later. Every question raised
that day is settled (see *Settled*, below); what's left is a print proof, a bot run, and the
rules pass when Nick asks for it. Nick's calls are marked as his.

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
  had Laid Low, leaving no answer, and the only cost was the Influence.
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

Open for Nick: protect the Boss (casualties stop at Runners, or the Boss falls only in the keg's own
District), then decide whether it wants more teeth (Muscle Ratio + 1 dice, or the taker keeps his barrel).

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
