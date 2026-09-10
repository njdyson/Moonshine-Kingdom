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

## Respect is Jobs only, and the crown needs 10

Since v0.9.7 (2026-09-10) there are **no Borough Deeds** in the game and **Titles pay no
Respect**. The three Titles (Ward Boss, Harbormaster, Night Mayor) keep their powers and
are still claimed at Stake Your Claim; they are worth nothing at the count. Respect is the
pile of completed Job cards in front of you, less **2** for the Rat Card and **1** per
Welsher, and the win is **10 Influence, 10 Respect, honor intact**. The Blood Oath target is
**20** combined.

The Deeds went for the reason Public Enemy No. 1 went in v0.8: they paid a second time for
turf that Jobs already require you to hold. Do not re-add either, and do not give a Title a
Respect value. Home turf at setup is now picked (clockwise from a random boss, an empty
mainland Borough each), not dealt.

The Bribe ladder escalates: **$2,000, $3,000, $4,000, $5,000** for the 7th to 10th markers,
never a flat price. The 7th and 8th are the tempo markers, the 10th is the crown purchase,
and the rising price is what keeps a leader exposed now that nothing on the board can take
Respect off him. It is printed in the Rulebook's Bribe Play and Influence section, the
Playbooks' Bribe entry, and the Kingpin's Guide's Bribe and Three Clocks passages. The
Ledger boards stack Reserves, so the price is not printed there.

Five Jobs that named the Deed now name the count directly ("a Borough where you Control the
most Districts", "where a rival Controls more Districts than you"). Any wording that brings
back "15 Respect", "2 Respect per Title", "16", "14", a Deed, or "$2,500" is a regression.

`v0-8-changes.md` still argues the old 14/15 arithmetic at length. It is a dated record of
why Public Enemy was cut, not a statement of the current numbers.

## The barrel sets the price, the address sets the Kickback

Since 2026-09-01 the two axes are orthogonal, and keeping them apart is the whole point:

- **Moonshine** sells for **$300** a barrel and **Havana Rum** for **$500**, at **any
  Speakeasy you Control**
- a barrel Unloaded at **The Hotspot** pays an Influence **Kickback**, whichever liquor it
  holds. The usual limits apply: a marker in Reserves and an empty Ledger slot, else the
  Kickback is lost
- the Greed Tax is unchanged, at 4+ barrels in one Play, wherever you sell

This is the reverse of the 2026-08-22 arrangement, where the address set the price and Rum
carried the Kickback. Cash now rides the cask and tempo rides the room, so the **Dock** is
the crown that pays and the **Night Mayor** is the crown that hands out Plays.

The one liquor-type restriction left in the game is the Irish **Peddle**, which sells
**Moonshine only**, and **only in Wards you Control**: Speakeasy sales, The Hotspot's
Kickback included, belong to Unload. Peddle costs 1 Play where Unload costs 2, and that
discount is the whole card. Let it reach Speakeasies and it makes Unload a dead Play for
Irish Moonshine. Do not "restore consistency" by opening Peddle to either liquor or to more
addresses. (The Rulebook carried a drifted "as well as Speakeasies" until 2026-08-23;
`mk-online-rules-sync.md` §9.6 holds the ruling.)

The exclusivity rule two revisions back ("one liquor to a room", Rum sellable only at a
Hotspot) was deleted because it let the Night Mayor **strand** goods a rival had already paid
three Plays for. Nothing else in the game bricks a paid-for asset. A snub now costs the
victim tempo and never the sale: the cash is identical at every bar he Controls.

The wording that will creep back is "the address sets the price", "The Hotspot pays $500",
"a standard Speakeasy pays $300", "the Kickback rides the barrel", "Rum pays its Kickback at
any address", and any claim that the premium is worth **$200 a barrel**. All of those are now
false. The Playbooks and the Town Planner carry the most compressed restatements, so they
drift first, and the Kingpin's Guide builds whole strategy passages on top of the rule, so
grep it for *argument*, not just for numbers.

The Rum pool is **20** barrels, not 15, and Trade at a Dock (1:1 from Moonshine) is still the
only way Rum enters the game. Trade is now worth a flat **$200 a barrel**, at every address.

Three knock-ons that are easy to miss:

- **The four Hotspot Tokens start in the Supply**, not on the board, so a fresh game has no
  Kickback anywhere until a **Night Mayor** is crowned and places the first one. This is
  deliberate. Do not "fix" it by seeding the board at setup.
- Each Morning Fix the Night Mayor does **one** thing, never both: **place** a token from the
  Supply on an unpadlocked Speakeasy in a Borough that holds none, or **move** a token
  already down to another unpadlocked Speakeasy **in its own Borough**. Cap is **one token
  per mainland Borough**; Staten Island has no Speakeasy, so it never holds one. Tokens stay
  on the board when the Night Mayor changes or the Title falls vacant.
- A **Raid** that kicks in a District holding a token returns that token to the **Supply**
  (it sits on the Scatter's Condemned line, beside the Safehouse and the seized Liquor).

**The Hotspot breaks no ties.** It once broke Borough Deed ties; the Deeds are gone, and a
tied Title goes to the Supply. Do not re-add a tiebreak of any kind.

## Open design threads

`rules-streamline-handoff.md` records the v0.9.7 streamline (2026-09-07, shipped 2026-09-10)
and the parts of it still open: making the **Sweep** the Sicilians' call (The Commissioner's
Ear), a **2-player** North vs South mode, and **Borough drafting** in reverse Turn Order.
None of those is implemented and none should be without Nick asking. The universal Sweep and
the Sicilians' **Untouchable** trait still read as they always have. Read the file before
touching the Sweep, the Sicilian Playbook, or the player-count setup.

The older `deed-sweep-handoff.md` proposal (let the Sweep skip Boroughs whose Deed you hold)
was closed by the Deeds' removal and the file deleted; its combat modelling survives in
`tools/sim_deed_sweep.js`, which still runs and is the tool to reach for on any Sweep change.

## What not to edit

- `Archive/` is frozen history. Never edit it, and never let it skew a repo-wide count.
- `mk-online/dist/` is committed build output with no source in this repo. It is already
  out of sync with the current rules; do not hand-edit the bundle.

## Keeping the components in sync

A rules change is never one file. The player-facing set is:

`Rulebook`, `Kingpin's Guide`, `Playbooks`, `Cards`, `Jobs Cards`, `Town Planner`,
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
