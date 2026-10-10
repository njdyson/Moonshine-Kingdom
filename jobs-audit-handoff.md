# Jobs Deck Audit (2026-10-10)

An audit of all 32 Jobs against the current rules, for clarity first and board tension second.
**Nothing here is applied yet.** Every rewrite is a proposal for Nick; `tools/gen_deck.py` and
`Jobs Cards v0.9.html` are untouched.

What was checked: each objective read cold against its Play's Rulebook entry, the Glossary's
defined terms, the 2026-10-07 starting turf, and the board's connection graph; then the whole deck
and the proposed deck run through a corrected copy of the overlap model (see *The audit tools have
drifted*, below).

The yardstick is Nick's: **simple objectives, and named places that turn a District into a focal
point while the card sits in the Market.** The best cards in the deck already do this in one line:
*Move 4+ barrels across the Williamsburg Bridge*, *Unload 4+ barrels at Coney Island*,
*Kill a rival Boss in Queens*.

---

## The findings, worst first

### 1. The Smuggler's Run breaks "never two 5s"

The printed deck can pay two 5s on one Play, 13 different ways, all through The Smuggler's Run.
It Seizes a Dock, and every mainland Dock sits in a Borough that one of the four bounties covers:

| Dock | Second 5 on the same Move | Most on one Play |
| --- | --- | --- |
| Throggs Neck | Over the Top (a Bronx District defended by 5+) | 13 |
| Whitestone, Jamaica | The Toll Booth Trap (bring your Boss, kill theirs) | 14 |
| Canarsie | The Butcher's Ledger (5 kills in Brooklyn) | 14 |
| The Bowery, West Side | Bloody Sunday (a rival Safehouse on the Dock, destroyed) | 10 |

The Rulebook is clear that this is one Play: "The Move that walked in the door is the Play" (A
Firefight Is One Play), and a Job counts "the fight it starts". `jobs-system-handoff.md` §3 says the
bounties' Borough split makes the hard rule "structurally impossible" to break. That holds for the
four Open Fire 5s among themselves. It was never checked against a Move card that Seizes.

**Proposed fix: swap tiers.** The Smuggler's Run drops to 3 and Union Dues (rewritten, below) rises
to 5. A Recruit can never share a Play with a fight, so the new 5 can't break the rule either, and
the tiers stay 12 / 12 / 8. The Smuggler's Run becomes the hardest 3 in the deck.

If Nick would rather keep it a 5, the other route is to take the fight out:
*Move 4+ Rum from Staten Island into a Dock you Control in a rival's home Borough.* That costs a
hedge and the deliver-and-seize design from 2026-08-04, so I'd take the swap.

### 2. Five cards still speak Deed

When the Borough Deeds were cut (2026-09-10), every "a Borough whose Deed you hold / don't hold"
became a count of Districts across a Borough:

| Card | The clause |
| --- | --- |
| Tenement Army | in a Borough where you Control the most Districts |
| Union Dues | in a Borough where a rival Controls more Districts than you |
| Last One Standing | in a Borough where you do not Control the most Districts |
| Squatter's Rights | in a Borough where a rival Controls 2+ Districts |
| The Empty Casket | in a Borough where you Control no other District |

A Deed was a card in front of you. A count has to be made across up to six Districts, at the end
of the Play, by a player who is trying to win. Three of them also leave a hole on a tie for most:
Tenement Army and Last One Standing don't say whether a tie is "the most", and Union Dues is simply
false. Tenement Army is the example Nick named,
and it's the worst: its four conditions describe your own home Ward, so it's done on Day 2 for
$1,200. Its cost used to be the Sweep, which v0.9.8 deleted.

**Proposed fix:** name a place where one makes a focal point (Tenement Army at Stapleton, Last One
Standing at Astoria), and use one fixed fact everywhere else: **your home Borough**. The handoff
rejected "home turf" on 2026-07-19 because Deeds moved ("where you started, or where your Deed is
now?"). With the Deeds gone that ambiguity is gone too: the Borough you drew at setup never
changes. It needs one Glossary line (see *Decisions*, below).

### 3. Every High Roller also pays The Beachhead, and Last One Standing joins them

High Roller ends "Land Connected to a rival Safehouse", which is The Beachhead's whole objective. So
whenever High Roller completes, a held Beachhead completes too: a guaranteed 6. Today's
`breadth_audit.py` already flags the pair (4 Districts).

Last One Standing makes it worse. Its own note in `gen_deck.py` says it was kept off High Society so
High Roller "can never ride this". The printed card moved onto High Society anyway (around v0.9.8)
and was folded back into the table on 2026-09-23 with that note still above it. One
Secure into a room you don't lead can now pay High Roller + Last One Standing + The Beachhead,
**9 Respect**. The audits miss it because they still model Last One Standing as an ordinary
Speakeasy.

**Proposed fix:** High Roller drops the adjacency clause; Last One Standing moves to Astoria.

### 4. One idea, several spellings

- **Barrels:** five forms: "N+ Barrels", "N+ Barrels of Moonshine", "N+ Moonshine",
  "N+ Barrels of Rum", "N+ Rum". Rules sentences say "barrels" (CLAUDE.md, 2026-10-10).
- **One Play:** six cards say "in one Play", three say "in a single Play", and ten count barrels with
  no phrase at all. The Big Squeeze (*Unload 6+ Barrels at The Haymarket*) reads naturally as six
  across the Day. Five Families says "in one Play" about an Extort, which is always one Play.
- **Places:** three cards name the venue (The Haymarket, Paradise Alley, Sunny's Bar) and three name
  the District (Coney Island, East Harlem, Fordham). The District is the big word on the board's
  sign; the venue is the small line under it.
- **Defined terms spelled out:** "Seize a Dock District held by a rival" (Seize already means from a
  rival), "Trade ... for Rum" (Trade only makes Rum), "Unload 8+ Barrels of Rum at a single High
  Society Venue" (the room buys Rum only, and an Unload is always at one bar), "Take over a rival's
  Safehouse, relocating yours into it" ("take over" has been a Glossary term since today).

### 5. Ghosts of the split market

The Angel's Share and Poison Panic both say "of Moonshine". The Angel's Share's dates from
2026-08-09, when ordinary bars bought Moonshine only and its old Rum objective became unfirable
(its note in `gen_deck.py` says so). Poison Panic's has no note; I'd guess the same era, but I
haven't found a record. Since 2026-09-22 every ordinary Speakeasy buys both, so neither restriction
does anything a player would miss. Cut both.

### 6. The 2026-10-07 setup made some cards home chores

Known for the four friendly 3s (CLAUDE.md, *Watch in playtest*). The same move also hit:

- **Gin Pipeline.** Each seat's starting Speakeasy is Pressure 5 and borders its home Ward, so all
  three of its qualifiers describe your own opening position. It was nearly as easy before (the
  orphan was empty and next door); the wording just hides that.
- **The Grand Tour** is a Brooklyn chore: Red Hook, on the river, is now Brooklyn's own bar (the
  same block as Cuban Prince, one of the four friendlies).
- **The Dutchman's Deal** is a Manhattan chore at The Bowery, its starting Dock.

Not proposing to move the friendlies here. If playtest says they want it: the four Speakeasies nobody
starts on (East Harlem, Belmont, Astoria, Coney Island) are a new one-per-Borough set, one block out.
Three of them carry a card already or in this proposal (The Angel's Share, Last Call, Last One
Standing), so they would share.

---

## House style for an objective

1. **One verb, one place, and at most one other condition**, which should be a fact you can see on
   the table.
2. **Numbers:** "N+ barrels", "N+ Moonshine", "N+ Rum". Never "Barrels of".
3. **"in one Play" ends every count.** Single events (Seize, Secure, Rise, take over, kill a Boss)
   don't need it.
4. **Name the District**, not the venue.
5. **Use the defined word** (Seize, Empty, take over, home Borough) rather than spelling out its
   meaning.
6. **No condition that needs a count across a Borough.**

---

## Card by card

**Keep** = unchanged. **Style** = house style only, same rule. **Rework** = the objective changes.

### 1 Respect

| Card | Now | Proposed | Why |
| --- | --- | --- | --- |
| The Milk Run | Move 4+ Barrels across the Williamsburg Bridge in a single Play. | Move 4+ barrels across the Williamsburg Bridge in one Play. | Style. The model card. |
| The Beachhead | Secure your Safehouse into a District Land Connected to a rival Safehouse. | Secure your Safehouse in a District Land Connected to a rival Safehouse. | Style ("in", as the Secure entry says). |
| Tenement Army | Recruit 4+ Runners in one Play, with your Safehouse in a Ward in a Borough where you Control the most Districts. | Recruit 4+ Runners in one Play at Stapleton. | **Rework** (finding 2). Stapleton is the one Ward nobody starts in, so the Safehouse has to travel first. Pairs with Fortress Staten. |
| Last Call | Unload 4+ Barrels at Coney Island in one Play. | Unload 4+ barrels at Coney Island in one Play. | Style. |
| The Empty Casket | Rise your Boss into an Empty Ward in a Borough where you Control no other District. | Rise your Boss in an Empty Ward. | **Rework.** Rise already needs a dead Boss and a Safe Ward, and Empty already excludes yours. The clause only stopped a Rise into your own abandoned Ward. |
| Fortress Staten | Secure your Safehouse into a Staten Island District holding 4+ Barrels. | Secure your Safehouse in a Staten Island District holding 4+ barrels. | Style. |
| The Pier Six Brawl | Seize a Dock District held by a rival, with no Safehouse. | Seize a Dock with no Safehouse. | Style. The guard stays: it keeps The Eviction off it. |
| The Dutchman's Deal | Trade 3+ Barrels of Moonshine for Rum at a Manhattan Dock. | Trade 3+ barrels at West Side in one Play. | **Rework.** One named Dock instead of two, and not Manhattan's starting one. West Side is empty, borders Sugar Hill, and every starting Dock reaches it by water. |
| The Angel's Share | Unload 3+ Barrels of Moonshine at East Harlem. | Unload 3+ barrels at East Harlem in one Play. | Style (finding 5). |
| Night Landing | Move 4+ Barrels across water into a Dock on Jamaica Bay. | Move 4+ barrels across water into a Jamaica Bay Dock in one Play. | Style. |
| Squatter's Rights | Take Control of an Empty District in a Borough where a rival Controls 2+ Districts. | Move a Mobster into an Empty District in a rival's home Borough. | **Rework** (finding 2). "Move a Mobster" rather than "Take Control": the old verb also paid on a Secure or a Rise, where it rode The Beachhead in 25 Districts and The Empty Casket in 5. |
| The Grand Tour | Unload 4+ Barrels at a Speakeasy along the East River. | Unload 4+ barrels at an East River Speakeasy in one Play. | Style. A Brooklyn chore (finding 6). |

### 3 Respect

| Card | Now | Proposed | Why |
| --- | --- | --- | --- |
| Cuban Prince | Move 3+ Barrels of Rum into Sunny's Bar. | Move 3+ Rum into Red Hook in one Play. | Style. |
| Rum Row | Trade 4+ Moonshine at a Staten Island Dock in one Play. | Trade 4+ barrels at a Staten Island Dock in one Play. | Style. |
| The Eviction | Take over a rival's Safehouse, relocating yours into it. | Take over a rival's Safehouse. | Style. "Take over" is defined now; the rider was written when it wasn't. |
| The Copper Heist | Seize a District with a Pressure 5+ Still and no Safehouse. | (unchanged) | Keep. |
| The Insurance Job | Rat, and have the Raid Padlock a Pressure 2 or lower Still you Control. | Rat, and have the Raid padlock a Pressure 1 or 2 Still you Control. | Style. Still the hardest card to read; it is Nick's argued exception (handoff §4), so it stays. |
| The Big Squeeze | Unload 6+ Barrels at The Haymarket. | Unload 6+ barrels at The Tenderloin in one Play. | Style. The missing "in one Play" is a real misreading. |
| Hell's Highway | Move 6+ Barrels into Fordham in a single Play. | Move 6+ barrels into Fordham in one Play. | Style. |
| Poison Panic | Unload 6+ Barrels of Moonshine at Paradise Alley. | Unload 6+ barrels at Flushing in one Play. | Style (finding 5). |
| Gin Pipeline | Move 6+ Barrels of Moonshine from a District with a Pressure 5+ Still into a Ward you Control. | Move 6+ barrels into your home Ward in one Play. | **Rework.** Same card, honestly worded (finding 6). Still the most solitaire 3; a candidate for a named target later. |
| Union Dues | Recruit 4+ Runners in one Play, with your Safehouse in a Ward in a Borough where a rival Controls more Districts than you. | Recruit 4+ Runners in one Play in a rival's home Ward. **Becomes a 5.** | **Rework** (findings 1 and 2). You must get your Safehouse into another boss's home Ward: take over his, or wait for him to leave it. Every rival sees it coming and garrisons home. |
| Last One Standing | Secure your Safehouse into a High Society Venue in a Borough where you do not Control the most Districts. | Secure your Safehouse in Astoria. | **Rework** (findings 2 and 3). Astoria is the map's crossroads: Queens' empty bar, a bridge each to the Bronx and Manhattan, next door to Brooklyn's room. It hands Queens, the worst seat, a friendly 3. |
| The Irish Goodbye | Kill 2+ rival Mobsters in a Speakeasy along the East River in one Play, and take no Control. | Kill 2+ rival Mobsters at an East River Speakeasy in one Play, and take no Control. | Style. The guard stays. |
| The Smuggler's Run | (a 5 today) | Seize a Dock by Moving 4+ Rum in from Staten Island. **Becomes a 3.** | **Rework** (finding 1). "Seize" says "into a Dock a rival Controls, and take Control of it" in one word. |

### 5 Respect

| Card | Now | Proposed | Why |
| --- | --- | --- | --- |
| Opening Night | Unload 8+ Barrels of Rum at a single High Society Venue. | Unload 8+ Rum at a High Society Venue in one Play. | Style. |
| The Toll Booth Trap | Kill a rival Boss in Queens, with your own Boss in the fight. | (unchanged) | Keep. |
| Over the Top | Seize a Bronx District defended by 5+ Mobsters. | (unchanged) | Keep. |
| The Five Families | Extort with a District you Control in all five Boroughs, in one Play. | Extort while you Control a District in all five Boroughs. | Style. |
| Bloody Sunday | Destroy a rival Safehouse in Manhattan, with your own Mobsters in the District. | (unchanged) | Keep. The Mobsters clause is what stops a Rat's Raid from paying it. |
| The Butcher's Ledger | Kill 5+ rival Mobsters in Brooklyn in a single Play. | Kill 5+ rival Mobsters in Brooklyn in one Play. | Style. |
| High Roller | Secure your Safehouse into a High Society Venue holding 4+ Rum, Land Connected to a rival Safehouse. | Secure your Safehouse in a High Society Venue holding 4+ Rum. | **Rework** (finding 3). It loses the next-door-to-a-rival tension from the 2026-08-04 pass; the room is still the contest, and four Rum in it is Raid bait. |
| Union Dues | (a 3 today) | Recruit 4+ Runners in one Play in a rival's home Ward. | See the 3s. |

Average objective length falls from about 68 characters to 52, and the longest from 122 (Union
Dues) to 83 (The Irish Goodbye). A few short cards grow by "in one Play", but none past today's
longest, so print fit should hold. Not yet print-verified.

---

## What the proposed deck does to the numbers

From the corrected model (`jobs_model.py`, in this session's scratchpad, not the repo) and a copy
of `fairness_audit.py`:

| | Printed deck | Proposed deck |
| --- | --- | --- |
| Never two 5s | **Fails**, 13 ways (all The Smuggler's Run) | Passes |
| Co-firing sets over 2 Districts | 17 | 8 |
| Respect-weighted seat spread | 3 (Queens worst at -4) | 1 (Queens -1, Brooklyn worst at -2) |

The 8 remaining flags: The Eviction riding a fight (four sets, the mobile-Safehouse case the handoff
already judges by hand); High Roller + The Beachhead (no longer guaranteed: only when a rival
Safehouse sits next to the room); The Pier Six Brawl riding The Smuggler's Run on a Dock with no
Safehouse (4 Respect); Fortress Staten + The Beachhead (2 Respect).

The fairness figure counts three named 1s that `fairness_audit.py` leaves unclassified: Last Call
(Brooklyn), The Dutchman's Deal (Manhattan), and The Angel's Share (Manhattan and the Bronx, whose
home Wards both border East Harlem). Those calls are mine. As the tool stands, the printed deck reads
a spread of 2.

**Still open in both decks: one Play can pay more than the crown.** Hell's Highway + Over the Top +
The Copper Heist at Fordham pays 11; Cuban Prince + The Butcher's Ledger + a 3 at Red Hook pays 11;
the proposed Smuggler's Run stacks reach 12 at Jamaica and Canarsie. Each is one District, three or
four Offers and 7 to 8 staked markers, so the breadth rule calls it earned. But the bar is 10 now, not
20. Worth a look in playtest; the crown still needs the Nod and its own Play.

---

## The audit tools have drifted

The four scripts run, and `overlap_audit.py` reports PASS on the printed deck. The model under them
is out of date:

- **Move and Open Fire are separate Play spaces**, so no Move card ever meets the fight its own Move
  started. This hides all of finding 1 and the 11-point stacks.
- **Last One Standing** is modelled on its old "$300 Speakeasy" text, not High Society.
- **Unload** still enforces the split market (ordinary bars Moonshine only).
- **Tenement Army, Union Dues, Squatter's Rights and The Empty Casket** still read Deed flags.
  Squatter's Rights is only checked on a Move. The Empty Casket's model doesn't require a Ward.
- **The drift guard** compares names and Respect only, so none of this tripped it.

The scratch model fixes all of these and runs in about five seconds. It should be ported into
`overlap_audit.py` and `breadth_audit.py` with the card changes, along with the three
classifications in `fairness_audit.py`. `jobs-system-handoff.md` §3's line that the bounties make the
hard rule "structurally impossible" to break should be corrected at the same time.

---

## Decisions for Nick

1. **The Smuggler's Run:** swap tiers with Union Dues (recommended), or keep it a 5 with no fight.
2. **"Home Borough" as a term.** The Rulebook's Setup already gives each player a Borough "as their
   home turf", but the Town Planner labels the Ward "Home Turf". Proposed Glossary line:
   *Home Borough: the mainland Borough you drew at setup. Its Ward is your home Ward.* At three
   players one Borough is nobody's home, so it never counts as a rival's.
3. **District names over venue names** on the cards. The venues drop off The Big Squeeze, Poison
   Panic and Cuban Prince unless a flavour line takes them.
4. **Tenement Army at Stapleton** costs a Secure ($500) and a Play before the Recruit. If that's too
   dear for a 1, the plainest fallback is *Recruit 5+ Runners in one Play*: simple, but solitaire.
5. **Gin Pipeline:** accept it as honest filler, or retarget it to a named District.
6. **Union Dues at 5:** a judgement, not measured. It's contested and a campaign, which is what the
   2026-08-04 pass asked of a 5, but it has not been played.

## If adopted, the files

`tools/gen_deck.py` (the table and its notes; then `--force`), `Jobs Cards v0.9.html` (regenerated),
`tools/overlap_audit.py`, `tools/breadth_audit.py`, `tools/fairness_audit.py`,
`tools/difficulty_audit.py` (re-score the reworked cards), the Rulebook's Setup and Glossary (home
Borough), `jobs-system-handoff.md` (§3 and the deck notes), and mk-online's Jobs and harness
(`mk-online-rules-sync.md` gets a section). No other component names a Job.
