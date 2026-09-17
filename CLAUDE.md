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

`Turn Order (Who Strikes First)`, `Power Plays (Cost: 2 Influence)`, `Peddle (Cost: 1)`.

## The Day, the board, and the law

- The Day has two phases: **Shadows** and **The Hustle**. The last player to Lay Low ends it.
  Make the Sunset win check, then flip the Turn Tokens if nobody won.
- **Wards** are standard turf and **Recruit** costs a flat **$300** per Runner, everywhere.
- The boss Controlling the most **Docks** is **the Harbormaster** and names tomorrow's Mash;
  a tied lead rolls the Mash die instead. The fourth Shadows step carries the same name.
- The four **#7 mainland Speakeasies** are the **High Society Venues**. Each starts padlocked
  under a Police Squad and opens when a Raid moves that Squad along.
- The **Muscle Ratio** caps brewing, combat dice and Blowback casualties at **five**. Blowback
  removes Runners first; the Boss dies only when no Runner is left in that District.
- Sicilian **Untouchable**: Police Squads never enter the Sicilian Safehouse District. A Squad
  takes the next legal target in reach, or stays put.

## The crown needs 20 Respect and Solvency

Respect is completed Jobs, worth **1**, **3** or **5**, plus a **10-Respect Commission Seat**
claimed the instant a player reaches **10 Influence**, less **2** for the Rat Card and **1**
per Welsher. Nothing else on the board scores. A Kingpin wins at Sunset with **20 Respect**
and **Solvent** status. An unpaid Shylock's Mark does not change Respect, but it bars victory
until it is cleared. The Volstead Act is an intentional exception: it does not track Respect
and has its own honor rule.

The Bribe ladder escalates: **$2,000, $3,000, $4,000, $5,000** for the 7th to 10th markers,
never a flat price. Players start with **6** markers, so the Seat costs **$14,000** in total.
The 7th and 8th are tempo markers; the 10th claims the Commission Seat. In the Blood Oath,
each Alliance races to **40 combined Respect** and both partners must be Solvent. The Rulebook,
Town Planner, Playbooks, Cards sheet, Federal Crackdown Tracker, and Kingpin's Guide must agree
on these values.

## The barrel sets the price, the address sets the Kickback

The two axes are orthogonal, and keeping them apart is the whole point:

- **Moonshine** sells for **$300** a barrel and **Havana Rum** for **$500**, at **any
  Speakeasy you Control**
- a barrel Unloaded at a **High Society Venue** you Control also pays a **Kickback**: move 1
  spent Influence marker from Reserves into an empty Ledger slot, whichever liquor the barrel
  holds. No marker in Reserves, or no empty slot, and that Kickback is lost
- the **Greed Tax** fires at 4+ barrels in one Play, wherever you sell

Cash rides the cask and tempo rides the room. The **Dock** is the address that pays, since
**Trade** is the only way Rum enters the game: 1:1 from Moonshine at a Dock you Control, worth
a flat **$200** a barrel of upgrade at every address. The Rum pool is **20** barrels.

The one liquor-type restriction in the game is the Irish **Peddle**, which sells **Moonshine
only**, and **only in Wards you Control**: Speakeasy sales, the High Society Kickback included,
belong to Unload. Peddle costs 1 Play where Unload costs 2, and that discount is the whole card.
Let it reach Speakeasies and it makes Unload a dead Play for Irish Moonshine. Do not "restore
consistency" by opening Peddle to either liquor or to more addresses. (The Rulebook carried a
drifted "as well as Speakeasies" until 2026-08-23; `mk-online-rules-sync.md` §9.6 holds the
ruling.)

Wording to grep for after any market change, because all of it is false: "the address sets the
price", "a standard Speakeasy pays $300", "the Kickback rides the barrel", and any premium worth
**$200 a barrel** on the liquor type. Trade's $200 is the upgrade from swill to Rum, and it is
the only $200-a-barrel figure the market has. The Playbooks and the Town Planner carry the most
compressed restatements, so they drift first, and the Kingpin's Guide builds whole strategy
passages on top of the rule, so grep it for *argument*, not just for numbers.

## Open design threads

`rules-streamline-handoff.md` records the streamline discussion and the reasoning behind each
cut. Read it before touching the Sweep question, the Sicilian Playbook, or the player-count
setup. Two threads are live:

- **The fortress, now that the Sweep is gone.** The handoff's own warning stands: with no Sweep
  anywhere, the 7-man garrison is legal in every District, and the Guide's Magic of Seven and
  Muscle Ratio economics assume 5 to a boiler. `tools/sim_deed_sweep.js` models it and is the
  tool to reach for. The Commissioner's Ear (a Sicilian-called Sweep) was the alternative and
  was not implemented. Playtest before adding anything back.
- **A 2-player mode.** `The Volstead Act` is already a 2-player variant with no Jobs and no
  Respect, shipped as a component and marked unplaytested. A North vs South split with a
  four-Ward objective is proposed in `two-player-handoff.md`, along with stacked Heat markers.
  Read both before touching either: the open question is whether the new mode folds into
  Volstead or ships beside it, and two competing 2-player modes in one box is worse than either
  alone.

One more to watch at the table rather than in the files: the Bribe path pays twice. It pays 10
Respect, and because **Plays = Influence minus staked minus Heat, capped at the Ledger's 5
slots**, the markers above your fifth stake Jobs and absorb Heat for free. The Kingpin's Guide
calls the fifth slot the only cliff. So the 9th and 10th markers buy Respect and immunity to the
game's two brakes at the same time. The number that answers it is what fraction of games end
with a Commission Seat claimed.

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
