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
