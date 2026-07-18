# v0.8 — what changed and why (2026-07-17)

Companion to `jobs-system-handoff.md` (which covers the Jobs system itself). This is everything
*else* v0.8 changed, with the reasoning, so nobody re-opens a settled argument or "fixes" something
back to a bug. Every rule below is live in `Rulebook v0.8.html` (print-verified 23pp A4, no blanks).

> **2026-07-18 — the Jobs Market is now STATIC.** The conveyor, *Yesterday's News*, the fresh/stale
> ends and the per-player deck build are all deleted; setup is "shuffle all 32, deal P+1"; passing at
> The Offers is now explicit. The argument and the five rejected alternatives live in
> **`jobs-system-handoff.md` §2b** — not duplicated here, so the two docs can't drift.

---

## Renames (all cascaded through rulebook, turn card, playbooks, deck)

| Was | Now | Why |
|---|---|---|
| Phase 2: **Operations** | Phase 2: **The Hustle** | "Operations" was the one business-school word in a noir rulebook. Shadows / The Hustle / Reckoning. |
| **Hustle** (the Job claim) | **The Nod**, then **The Offers** | It had to move: the phase deserved the word more. A nod is the opposite of paperwork, which is what the Jobs section already argues ("no declarations, no paperwork… nobody signs contracts"). **Renamed again in a7d41d8 to The Offers** — once walking away became part of the same step, "the Nod" named only one of the things you could do there. *The Offers* names what the city puts in front of you, which is true whichever of the three you pick. |
| **The Whispers** (card backs, setup) | **The Jobs** / "Stack the Deck" | Collided head-on with the Vipers' **Whispers** trait, which is literally about the Jobs deck. The Vipers keep the word. |

**"The Handshake" was considered for this step and REJECTED.** Cooperation already has a section
headed **"A Binding Handshake"**, and worse, both mechanics stake an Influence marker from Reserves
and return it on completion — they're mechanically twinned, so sharing a name would make two
genuinely confusable things sound identical. Cooperation has the better claim. **Don't revive it.**
"The Word" was also rejected: Cooperation leans on "a Mobster's word is cheap" / "break your word".

---

## Rule changes

- **Rise** keeps its name, loses the giveaway. Was: new Boss + **2 free Runners** + a free Secure, for
  2 Influence — roughly **$1,100 of free goods for the crime of losing your Boss**, which actively
  incentivised Boss death. Now: **promote a Runner** (Cost 1, Standard Play). Boss death is a real
  setback again, reinforced by **No Boss, no business** (no Offers without a Boss).
- **Wiped Out** (new): no Boss, no Runners **and no Safehouse** → place a Boss, 2 Runners and your
  Safehouse in any **Defenseless** District, free, at the start of your turn. The trigger is narrow
  by design: Control = "one Mobster **or a Safehouse**", so while your Safehouse stands you can always
  dig out (Beg → Recruit at $400 → Rise). It is not a catch-up lever, it's an anti-elimination backstop.
- **The Rat**: "cannot Hustle" → **"cannot Bribe"**. The old clause was "cannot be crowned" stated
  twice, and it locked you out of a whole subsystem. The two clauses now cover opposite halves of the
  game: early, no Bribes stalls your whole trajectory (you start at 6, need 10); late, at 10 Influence
  it costs nothing and only "no crown" bites. Framed as one idea: *the Commission wants nothing to do
  with a rat.*
- **Shylock's vig**: $3,000 → **$2,500**. $3,000 was 100% interest = rescue-only. $2,000 (33%) would
  make Beg a mandatory opening with 8 Marks on the table. $2,500 (67%) still hurts. **Cost: the
  "takes back twice what he gave" line had to go** — it *was* the 2× rule.
- **The Offers snake**: reverse Turn Order. Not a catch-up patch — the point is to stop stacking every
  advantage (first Red, first Play, first pick) on Token #1, so both ends of the order are live.
  **This got sharper on 2026-07-18**: dropping the 1s-only opening Market means the first pick is
  now a pick between *tiers*, so the last seat's compensation is worth something on Day 1. Under a
  five-1s opening it was worth nothing on the one Day it mattered most.
  Turn order is set by *play selection*, not wealth: a 3–5 Influence firefight empties you by noon.
- **Threat bonuses** ride on **the situation, not the Play**: they apply to every attack roll from
  that position — Open Fire, Hit or **Plunder** alike. (Answers "does Plunder get the Ambush +1?" —
  yes, and it always did by RAW; Safehouse +2 explicitly excludes the Ambush shot, which proves the
  exclusions are deliberate.) The Irish **Firepower** trait is the stated exception: an extra *die*,
  Open Fire only.
- **Public Enemy No. 1: CUT.** Titles 4 → 3. See below — this one is load-bearing.
- **Gig / Racket / Score: RETIRED** as game terms. A Job prints a Stake and a Respect.

### Bugs fixed
- Blowback read "add the leftover Red to **the Black**" — a leftover from before the grey **Mash**
  die rename.
- Ferment read "**if a rival holds** the Harbormaster Title" — left your own case undefined and
  contradicted the Title's own text. Now "whoever holds it".
- "Anything above 5 stays behind as capacity: fuel to **soak up Police Heat**" — false. Heat takes the
  *spent Ledger marker*; Reserves never soak anything. Reserves are stake money plus the cushion that
  refills your 5 tomorrow.

---

## Why Public Enemy No. 1 had to die (don't bring it back)

**The arithmetic.** 4 Deeds in play (Staten's is boxed) + Titles, all worth 2 Respect:

| | Max Respect from *holdings* | Win needs |
|---|---|---|
| With Public Enemy | **16** | 15 |
| Without it | **14** | 15 |

With it, a player who dominates the board could reach 16 and **win without completing a single Job** —
the pivot's central claim was quietly falsifiable. Without it, holdings top out one short, forever:
**you can never take the crown without doing at least one Job.** The thesis is now enforced by maths.

**It was also Contracts' own sin in miniature.** The argument that killed Contracts was redundancy —
the same verb at a third price. Jobs pay you for *doing*; Public Enemy paid you *again* for having
done. Ward Boss / Harbormaster / Night Mayor each pay for a distinct kind of ground; Public Enemy paid
for your Respect pile.

**And it was the only rule that needed the tier names to be load-bearing terminology** ("1 Gig, 1
Racket, 1 Score"). Killing it is what freed Gig/Racket/Score to be retired with nothing left to reword.

Its anti-farming job is done for free by the deck's escalation arc (see handoff §2).

---

## The Brew: two findings that invalidated the strategy guide

**Retiring Favors silently broke the Brew Engine guide and simulator.** When they were written, any
mob could buy its way out of the Sweep with a Favor, so a build could legally wall 16 men onto one
boiler. That mechanic is gone. Consequences nobody had propagated:

1. **The Sweep caps a District at 5 Mobsters** every Reckoning and the Brew is the very next dawn, so
   **5 is the most that can ever stand on a boiler at first light**. Ceiling: **3 barrels, 4 with the
   Boss (Twist the Valves)**. The Muscle Ratio's `7–8 → 4` and `9+ → 5` rows are **unreachable for
   brewing** — they only ever fire in combat.
2. **The Sicilians are therefore the only mob who can brew past 4 per Still.** Untouchable ignores the
   Sweep, so they alone reach the cap of 5 (6 with Twist). **This is an unpriced buff** — Untouchable
   went from "a shortcut anyone could buy with a Favor" to a unique permanent monopoly, and the combat
   sim ranked them 2nd on *combat*, which by construction can't see a brewing advantage.

**The guide's famous "ceiling" (a 4th Still earns LESS than a 3rd) is dead.** It was an artifact of
`ceil(m/2)` rewarding 16-man stacks. Re-run with legal crews through the real simulator:

| Matching 7s | Old figures | Actual, under the Sweep |
|---|---|---|
| 1 | $676 | $445 |
| 2 | $1,023 | $792 |
| 3 | $1,137 | $1,137 |
| 4 | *(said to be worse)* | **$1,251 — best on the sheet** |

Breadth now wins monotonically to the four boilers the board will sell you. Also: **3/3 + 9/9 ($792
hostile) doubles 3 + 9 ($444)** — bracket the ends *in pairs*; a lone kettle each end is a rounding
error. Guide + simulator are updated and bumped to **v0.8**.

**The boiler census constrains everything** and was never written down: **7 ×4 | 4, 6 ×3 | rest ×2 |
12 ×1.** Only 7 stacks four deep, and all four 7s are High Society, police-locked, one per mainland
borough. A "wall of 8s" was never a wall — it's two kettles.

**A live calibration flag:** `Brew Simulator v0.8.html` defaults **Boss loss to $800**, calibrated
when Rise handed back 2 free Runners. Rise no longer does, so $800 is now a **floor** — it makes
**Twist the Valves look better than it is**. At ~8% Boss-loss/Day it only moves the bottom line by
tens of dollars, so the tables stand. Re-pricing is a design call.

---

## Housekeeping done

- `Contract Strategy v0.65.html` → `Archive/` (wholly about the retired Contract system).
- `Brew Engine Strategy` + `Brew Simulator` → **v0.8** (git-renamed, history follows).
- `index.html` was pointing at **three dead files and two retired systems**: repointed to Rulebook
  v0.8, Jobs Cards v0.8, Turn Structure & Ledger, Playbooks Reskin; Contract Strategy row removed;
  version badge → 0.8. **Every local link across the live HTML now resolves** except one pre-existing
  dead CSS ref inside the retired `Contract Cards v0.7.html`.
- **The Playbooks were still entirely on the Contract system** and are now current: Hustle removed
  from the Plays list (it isn't a Play), Vipers' Whispers rewritten to the deck-peek, and the play
  sections reshuffled to **Logistics** (Move, Unload, Trade) / **Diplomacy** (Extort, Beg, Rat, Bribe)
  / **Empire Building** (Recruit, Secure, Rise).
- The Turn card's Reckoning still had a **"Settle Accounts"** step returning markers per active
  Contract — deleted; Reckoning is Sweep + Stake Your Claim.

## Next archive candidates
`Combat Strategy v0.7.html` (still full of Contract references) and `Contract Cards v0.7.html`.
**Nick's plan:** once the Jobs deck is complete, replace all the separate guides with one unified
strategy guide rather than maintaining four that drift.

---

## Print gotchas learned the hard way (v0.8)

- **Every `body > .container` must fit A4 (1123px)** or it spills and leaves a blank page. Measure via
  CDP under `Emulation.setEmulatedMedia{media:'print'}`. Don't trust page count alone — check for
  text-free pages too.
- `table { page-break-inside: avoid }` means a table too tall for its remaining space jumps a whole
  page. Adding a Rise row to the Plays table cost 3 pages and 3 blanks.
- **`@media print` sets `.shadows-page / .components-page / .goal-page .cover img { height: auto
  !important; max-height: 68mm }`** — so the **inline `height` attribute is silently ignored on those
  three pages**, and `max-height` is the only lever. Elsewhere the attribute works, but only if the
  img also has `.tight-cover` (otherwise `.cover img { min-height: 320px }` overrides it).
- **Word trims often reflow without collapsing a line.** Measure the last line's width fraction and
  only cut what genuinely removes a line.
- A full-width table inside a 2-column `.container` **spans the columns and splits the surrounding
  content**, which orphaned half of a numbered setup step. Prefer prose; the ratio *was* the table.
