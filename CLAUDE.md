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
`84&ndash;92%`) and separates a Play from its cost in Kingpin's Guide headings
(`Ambush &ndash; 1 Influence`). Do not "fix" those.

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

- **The Commission** is the table where the families settle their business. Winning at
  Sunset (20 Respect, Solvent, Boss on the board) means **earning a seat on it**. The
  winner does not found it or head it: an earlier draft said so and read too strong.
- **Influence** stays political: judges, aldermen and precinct captains bought with Bribes.
  Reaching 10 Influence claims **the Nod** (the city vouching for you, 10 Respect). The card
  was called the Commission Seat until 2026-09-23; it was renamed because a card called a
  Seat read as the win. Don't bring the old name back.
- **History is a nod, not a lesson.** Most players won't know it. The Rulebook names
  Rothstein once, on the front page, and stops. **The Almanac** is the prequel and the
  player-facing strategy book: Rothstein's advice to a young Charlie Lucania at Lindy's on
  4 November 1928, the night he was shot. It carries the scene, not the history.
- The **Kingpin's Guide** is off the site (no index tile). It stays in the repo as the
  long-form design reference and may lag the rules (it still says Commission Seat).

## v0.9.8 streamlined rules

This supersedes the older Titles, Hotspot, and Sweep notes below until they are fully retired.

- The Day has two phases only: <b>Shadows</b> and <b>The Hustle</b>. When the final player Lays Low, make the Sunset win check, then flip Turn Tokens if no one won.
- Title cards and Hotspot tokens are removed. Wards are standard turf; Recruiting always costs $300 per Runner.
- The player Controlling the most Docks is <b>the Harbormaster</b> and sets tomorrow's Mash; tied lead rolls the Mash die. The fourth Shadows step is named <b>The Harbormaster</b> (it was "The Morning Fix" until 2026-09-16; the Title of that name is gone, the step keeps the theme).
- The four #7 mainland Speakeasies are fixed High Society venues. They begin under the Police Squads. At an unpadlocked one you Control, every barrel of Rum Unloaded pays a Kickback (see below).
- There is no Sweep. The Muscle Ratio still caps brewing, combat dice, and Blowback casualties at five. Blowback removes Runners first; the Boss dies only with no Runner left in that District.
- Sicilian <b>Untouchable</b> means Police Squads never enter their Safehouse District. A Squad selects the next legal target in reach or stays put.

## The crown needs 20 Respect and Solvency

There are no Borough Deeds, Titles, or other board-scoring cards. Respect is completed Jobs,
plus **the Nod** (10 Respect), claimed the instant a player reaches **10 Influence**,
less **2** for the Rat Card and **1** per Welsher. A Kingpin wins at Sunset with **20 Respect**
and **Solvent** status. An unpaid Shylock's Mark does not change Respect, but it bars victory
until it is cleared. The Volstead Act remains an intentional exception: it does not track Respect
and has its own honor rule.

The Bribe ladder escalates: **$2,000, $3,000, $4,000, $5,000** for the 7th to 10th markers,
never a flat price. The 7th and 8th are tempo markers; the 10th claims the Nod.
In the Blood Oath, each Alliance races to **40 combined Respect** and both partners must be
Solvent. The Rulebook, Town Planner,
Playbooks, Cards sheet, Federal Crackdown Tracker, and The Almanac must agree on these values.

## High Society buys Rum only; elsewhere the barrel sets the price

Since 2026-09-22:

- **Moonshine** sells for **$300** a barrel and **Havana Rum** for **$500**, at **any of
  the eight ordinary Speakeasies you Control**
- the **four High Society Venues buy Havana Rum and nothing else**, at $500, and every
  barrel Unloaded there pays an Influence **Kickback**. The usual limits apply: a marker in
  Reserves and an empty Ledger slot, else the Kickback is lost. ("The High Society joints
  don't buy swill.")
- the Greed Tax is unchanged, at 4+ barrels in one Play, wherever you sell

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

The one other liquor-type restriction is the Irish **Peddle**, which sells **Moonshine
only**, and **only in Wards you Control**: Speakeasy sales belong to Unload. Peddle costs 1
Play where Unload costs 2, and that discount is the whole card. Let it reach Speakeasies and it
makes Unload a dead Play for Irish Moonshine. Do not "restore consistency" by opening Peddle to
either liquor or to more addresses. (`mk-online-rules-sync.md` §9.6 holds the ruling.)

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
shelved, not pending: two players have The Volstead Act. Two questions are open, and both
belong to playtest rather than invention:

- **Three-player kingmaking.** Respect is public and the win is a threshold, so at three the
  trailing boss can see who is about to cross 20 and decide the game by stopping one rival
  and not the other. The Blood Oath answers this at four; three has no answer yet. Do not add
  one without Nick asking, and bring numbers from a real table.
- **Game length.** The box used to say 90 to 120 minutes. Nobody has timed the current
  rules, so the figure was cut from the Rulebook and the site. Put one back only from a timed
  playtest.

`kickback-blowback-handoff.md` (2026-09-22) holds the Rum-only Kickback (shipped the same
day) and one still-open proposal: a Blowback shield for the Still that brewed. The shield is
not implemented and should not be without Nick asking; read the file before touching the
Blowback.

## What not to edit

- `Archive/` is frozen history. Never edit it, and never let it skew a repo-wide count.
- `mk-online/dist/` is committed build output with no source in this repo. It is already
  out of sync with the current rules; do not hand-edit the bundle.

## Keeping the components in sync

A rules change is never one file. The player-facing set is:

`Rulebook`, `The Almanac`, `Playbooks`, `Cards`, `Jobs Cards`, `Town Planner`,
`The Volstead Act`, `Still Tokens`, `Turn Tokens`, `The Ledger` (both), `Brew Simulator`,
`Combat Simulator`, `Federal Crackdown Tracker`, `index.html`.

After changing a rule, grep the whole set for the old wording. The Town Planner and the
Playbooks carry compressed restatements of rules that the Rulebook states in full, and
those restatements drift silently.

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
