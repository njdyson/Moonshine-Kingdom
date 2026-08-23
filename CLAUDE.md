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

## The Respect ceiling is 16, not 14

Deeds and Titles are worth 2 Respect each. Five Borough Deeds, Staten's included since it
sits in the **Supply** from night 1 rather than going back to the box, plus three Titles,
is **16**. The crown needs 15.

The old **14** came from a revision that boxed Staten's Deed, and with it the claim that
holdings land "one short of the 15" so nobody takes the crown without doing at least one
Job. That guarantee is gone, and what replaces it is practical rather than arithmetic: no
crew can garrison five Deeds and three Titles at once on 15 Runners. Do not restate the
14, and do not re-add Public Enemy No. 1 to close the gap.

`v0-8-changes.md` still argues the old arithmetic at length. It is a dated record of why
Public Enemy was cut, not a statement of the current numbers.

## The address sets the price, the barrel sets the Kickback

Since 2026-08-22 the two axes are orthogonal, and keeping them apart is the whole point:

- **every Speakeasy** buys **either liquor** at **$300** a barrel
- a **Hotspot** pays **$500** a barrel for **whatever you pour**, Moonshine included
- **Havana Rum** pays its Influence **Kickback at any address**, Wards included

The one liquor-type restriction left in the game is the Irish **Peddle**, which sells
**Moonshine only**. Peddle costs 1 Play where Unload costs 2, and that discount is the whole
card. Let it carry Rum and it pays the Kickback in a Ward you already Control, which routes
the tempo engine around Speakeasies entirely. Do not "restore consistency" by opening Peddle
to either liquor.

The exclusivity rule this replaced ("one liquor to a room", Rum sellable only at a Hotspot)
was deleted because it let the Night Mayor **strand** goods a rival had already paid three
Plays for. Nothing else in the game bricks a paid-for asset, and that is what made the Title
feel like keep-away. Now a snub costs the victim **$200 a barrel** and never the Play, so the
crown sets a premium instead of holding a hostage.

The wording that will creep back is the old "a standard bar takes Moonshine only", "The
Hotspot takes Rum only", "the Kickback rides the address, not the barrel", "the city drinks
grey", and any claim that Rum has "nowhere else to go". All of those are now false. The
Playbooks and the Town Planner carry the most compressed restatements, so they drift first,
and the Kingpin's Guide builds whole strategy passages on top of the rule, so grep it for
*argument*, not just for numbers.

The Rum pool is **20** barrels, not 15, and Trade at a Dock (1:1 from Moonshine) is still the
only way Rum enters the game.

Two knock-ons that are easy to miss:

- **All four Hotspots start padlocked under Police Squads**, so a fresh game has **no $500
  room** anywhere until the first Raid opens a door. Rum still sells and still pays its
  Kickback from night one. This is deliberate. Do not "fix" it.
- The **Night Mayor** may not move a Hotspot Token onto a padlocked Speakeasy. The clause is
  now about keeping the premium on the board rather than preventing a market shutdown.

**Borough Deed ties are no longer broken by the Hotspot.** A tie sends the Deed to the
Supply, exactly like every other Title. Do not re-add the tiebreak.

## Open design threads

`deed-sweep-handoff.md` holds a live, undecided proposal: drop the Sicilians' **Untouchable**
trait and let the **Sweep** skip Boroughs whose Deed you hold. It is not implemented and must
not be implemented without Nick asking. Read it before touching the Sweep, the Sicilian
Playbook, or Borough Deeds, and update it if the thinking moves.

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
