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

## 2026-07-19 — Recruit, mob colours, and the play-aid pass

### Recruit is Safehouse-only, and Wards set the price

Was "$300 in any Ward you Control, or $400 at your Safehouse". Now: hire **only** into the District
holding your Safehouse, **$500 per Runner, less $100 for every Ward you Control anywhere on the
map** — uncapped, so all five Wards make muscle free. There is no floor; a $100 floor was proposed
and cut as an arbitrary cap on a state that means you have already won.

The trade is **spatial flexibility for price**. Before, three Wards meant cheap muscle in three
places and no logistics problem at all. Now it means cheap muscle in *one* place plus a ferrying
bill, which promotes **Secure** from a footnote to a live play and turns the Safehouse into a
forward operating base. It also pays off the fairness audit's long-standing "Ward drought".

**Starting economics are unchanged** — setup puts your Safehouse in your home Ward, so everyone opens
at 1 Ward = $400/Runner, exactly the old Safehouse price. That is the tell that the numbers are right.

Three deliberate knock-ons:

1. **No Safehouse now means you cannot Recruit at all.** Stated outright in the rulebook. This is a
   large buff to **Torch** and to the Police *Condemned* result; Rise's free-Safehouse clause is the
   only valve. Chosen over a Boss-fallback because burning a rival's HQ *should* cripple them.
2. **Only five Wards exist** (Five Points/M, Hunts Point/Bx, Corona/Q, Brownsville/Bk, Stapleton/SI —
   one per borough), so the live band is 1–2 Wards = $400–$300. The $200/$100/free rows are
   aspirational; **do not tune as if they are reachable.**
3. **Vipers' Tunnel is now the best logistics tool in the game** — it deletes exactly the ferrying
   friction this change introduces. Watch it in playtest.

### Mob colours are fixed

**Sicilians RED · Irish GREEN · Vipers BLUE · Knights YELLOW.** Was free choice ("each player claims
a color"). Fixed wins because the mobs have *persistent board-relevant* powers, so identity is read
every turn — and Safehouse-only Recruit sharpened that, since "where is their Safehouse and can they
reach the front" is now a constant read with a wildly different answer for Vipers.

The pairing is **canonical but not binding**: no rule anywhere references a colour, so swapping stays
free for colourblind players, house rules, or an expansion mob borrowing a base set. The expansion
worry (new mobs without new pieces) is answered the way Root and Scythe answer it — expansion mobs
ship their own pieces — and floating colours never solved it anyway, since four piece sets cap you at
four players regardless.

Red is the **Hit / Blood Oath / `Vendetta.png`** cluster, the strongest colour-to-mechanic link on
the board. Nick's ideal at production is **Sicilians black** (mafia, and it frees blue entirely);
the current set is driven by the off-the-shelf trilby meeples he owns. **Blue clashes with the
Police** — do *not* rename *The Blue Wall*, it is real police slang and one of the book's better
names; the prototype fix is white buildings for the Squads.

Built as a tinted `.card-bar` plus a dot **and the colour name** in the kicker line. The name is
load-bearing: yellow-on-gold is the one pairing the bar alone cannot carry.

### The Rat, twice

**The 1+ Heat gate is deleted.** It was a needless exception — the Raid rules already self-enforce it
("if no District in reach carries any Heat, the Squad stays put"), so a 0-Heat Rat resolves as a Raid
where nothing moves.

**The Rat can't Rat.** Holding the Rat Card now also blocks the Rat Play. This fixes two things: the
Mark of the Snitch was a *one-time* toll, so a committed rat could spam Raids for 2 Influence each;
and it closes the Blood Oath clock-spam that deleting the gate exposed (a 0-Heat Rat still advances
the Federal Crackdown Tracker, and the 4th-place player wants the Sit-Down early). No single player
can drive that clock now — they would need a rival to Rat and snatch the card first. **So the
variant-level patch "a Raid that moves no Squad does not advance the Tracker" is NOT needed.**

Safe because it is not a permanent lockout: a rival snatching the card and "The Mark Dies with the
Don" both return it. The flavour already justified it — the cell has always read *"Not one of them
will take your envelope, let alone your call."*

### Jobs deck: one free rider closed, one card repaired

**`Union Dues` was a strict subset of `Tenement Army`** (both "Recruit 6+ in a Ward"), so the two
co-fired on *every* completion. It never appeared in `overlap_audit.py` output because at 1+3 Respect
it sits under the tool's 7-Respect display cutoff — **the tool was right and silent; the report hid
it.** When hunting free riders, read the model lambdas for subset relationships rather than scanning
printed stacks.

Split on the **Borough Deed**, which is a card you physically hold and therefore verifiable at a
glance. An intermediate "home Ward" version was wrong: not verifiable, and "home turf" is *ambiguous*
once Deeds change hands.

| | Stake | Objective |
|---|---|---|
| Tenement Army | 1 | Recruit **6+** Runners in a **Ward whose Borough Deed you hold**, in a single Play |
| Union Dues | 3 | Recruit **4+** Runners in a **Ward whose Borough Deed you don't hold**, in one Play |

They mirror on the Ward/Deed split then separate on a **second axis, because they bite at different
times**: Tenement Army is early (supply full, cash scarce) so its cost is the burst; Union Dues is
later (cash flows, Runner slots don't) so 4+ respects the **15-Runner cap**, the real mid-game
constraint. Tenement Army was briefly 4+ and that was wrong — it paid you for your *default opening
line*. Jobs pay for what you **do**; never let one rebate what a player was already doing.

Counter-intuitive but settled: **hold-the-Deed is the EASY half.** Setup deals you a Deed *and* puts
your Safehouse in that Borough, so it is free on day one, and the card cannot tell a built Deed from
a dealt one.

**`The Insurance Job` → "Rat, and have the Raid Padlock a Pressure 2 or lower Still you Control."**
The old text had **no checkpoint**: a Raid is an interrupt, not a Play, and *The Play Is the Unit*
only checks Jobs when a Play ends — so a *rival* could trigger the Condemn and nothing defined
whether you scored it. Naming Rat makes it a real Play, with no rules exception needed. **"Raid" was
never a Play a player could make; check every card's verb against the Playbooks' Play list.**

Condemn became **Padlock** because *this same session* broke the old objective: Safehouse-only
Recruit means losing your Safehouse locks you out of hiring, so a 3-Respect card carrying that *plus*
the Rat Card is one nobody claims — and in a static Market an unclaimed card squats a slot forever.
**Watch for that pattern generally: a rules change can silently make an existing card
uncompletable-in-practice, which post-conveyor is a permanent blockage, not a bad draw.**

Pressure **1** was proposed and widened to **≤2**: P1 is only East Harlem (M), Astoria (Q) and
Westerleigh (ST), and **Staten has no Squad** ("one per *mainland* Borough"), so P1 was a
two-district, Manhattan/Queens-only card — borough bias, the one kind ruled out. "You Control" is
load-bearing, or padlocking a rival's still counts. The tension that makes it good: the Raid
tie-break takes the boiler ranked *highest* on the Pressure Strip, so a low-Pressure district is the
Squad's **last** pick — you must trick the cops into kicking the wrong door.

Ward coverage held at **0.60 healthy** only because *both* Recruit cards name a Ward. Borough-only
versions dropped it to 0.20 STARVED; one card on Ward gives 0.40, still starved. Audits all green:
drift guard OK, never-two-5s PASS, no co-firing, 12/12/8 across 16 pages, seat spread 1.

### Play aids: endgame single-sourced, and cards are now a fixed box

The playbooks' whole **WINNING THE GAME block is deleted** — it doubled up with the turn card's FINAL
RECKONING, and the playbook should carry less cognitive load. The **Respect breakdown moved onto the
turn card** rather than being lost: it was the only statement anywhere on the play aids of *where
Respect comes from*, and Final Reckoning quotes the 15+ target without it. A tie-break line was added
alongside it. The Lowdown's kicker is now **"Combat Reference"**, since it holds no endgame content.

The turn card's dense prose bodies now run **one labelled action per line**. The measured lesson:
**line breaks are expensive.** Restructuring alone took the card 974→1001px (*worse*). It only paid
off once every sub-line was trimmed to fit a **single** line: 974→844, a +16% print size gain. A
sub-line that wraps costs two lines and throws the whole benefit away.

**All cards are now a fixed 518 × 969 box** (`.card{width:470px; height:925px}`, content-box) with
**square corners** for guillotine cutting. This is not cosmetic: the fit script uses
`min(A5W/w, A5H/h)`, and since every card shares a width, **height always won** — so each card got
its own zoom and a *shorter* card rendered **wider**. Fronts at 0.806 against backs at 0.980 meant
duplex sides could not line up. Per-card vertical scaling was silently producing per-card horizontal
size. Uniform zoom is now **0.7699**. Tallest real content is 917 against a 925 box, so **8px of
headroom — content past that clips silently** (`overflow:hidden`); re-check `scrollHeight` vs
`clientHeight` after any addition, and raise the height in *both* card files together.

### Editorial

**Capitalise after a run-in label colon** (`<b>The Loan:</b> **T**here's no limit…`). A bold label is
a miniature heading, not the first clause of a sentence. Colons inside flowing prose stay lowercase.
Both conventions are legitimate English, so this is house style — but the textbook "capitalise only
before a complete sentence" test produces *mixed* results inside one card, which reads as a typo.
19 fixed across six files, and the three misses each exposed a different hole in the check: the naive
regex, a label shielded behind an `<i>` tag, and a file left off the list entirely.

---

## 2026-07-19 (later) — the Jobs deck audit pass

A full read of all 32 cards against the rules as they now stand, driven by the Safehouse-only Recruit
change. **The headline is a rule change, not a card change:** see `jobs-system-handoff.md` §3, which
has been rewritten. Overlap is now judged by **breadth** — how many districts a co-firing set can fire
in, ≤2 being a feature and >2 a flag — and not by whether the stack is guaranteed. The old
guaranteed-vs-conditional framing led me to "fix" `The Dutchman's Deal`, which fires with `Rum Row` at
exactly two Staten Docks; that was reverted.

### Cards changed

| Card | Change | Why |
|---|---|---|
| **Cuban Prince** | was *Off the Boat* | back on its own art (`Cuban Prince.png`); no "The", so it clears the 16-char `title--long` threshold |
| **Night Landing** | was *The Riverside Switch*; new art `Skiff.png` | the old art had RIVERSIDE STORAGE painted across a suspension bridge, on a card about a bay that had **no bridge in 1926** (Marine Parkway 1937, Cross Bay 1939) |
| **Rum Row** | new art `Rum Row.png` | its flavour already described this picture: "Forty ships past the three-mile line, waiting on a lamp" |
| **Last Call** | + "$300 Speakeasy" | Opening Night is High-Society-only, so the deck's biggest geographic swing (6 Respect across 4 joints) is now structurally impossible |
| **The Grand Tour** | + "along the East River" | 12 → 4 districts; also retires "outside your home turf" |
| **The Irish Goodbye** | + "along the East River" | 12 → 4; the hostile mirror of The Grand Tour |
| **Tenement Army** | 6+ → **5+ Runners** | trims the hidden Sweep tax (below) |
| **Tenement Army / Union Dues** | both now say **"with your Safehouse in a Ward…"** | Recruit became Safehouse-only *this same session* and the two cards that depend on it hid the dependency |
| **The Beachhead** | "Land-Connected" → **"Connected by Land or Bridge"** | the term was defined nowhere; the rulebook's own bullet already said it |
| **The Milk Run** | names **Five Points and Williamsburg** | "Williamsburg Bridge" is printed on no component |
| **The Butcher's Ledger** | + "**rival** Mobsters" | its two siblings both say it; on a 5, "5+ Mobsters" reads as both sides |
| **Bloody Sunday** | + "with your own **Mobsters** in the District" | a Police Raid also destroys Safehouses, and the printed card carries no verb, so Rat → Raid → Condemn could argue it |

**Bloody Sunday's guard had one constraint that ruled out the obvious wording:** Torch destroys a
Safehouse but leaves the rival **in Control**, so any "take the District" clause would lock the
Knights out of the card their trait was built for. Requiring your own Mobsters present admits Open
Fire, Hit and Torch, excludes the cops, and reuses The Toll Booth Trap's existing grammar.

### Tenement Army's hidden Sweep tax
Your home Ward already holds a Boss and 2 Runners, so hiring 6 put **9 Mobsters on one block** and the
Reckoning Sweep culled 4 of them — an invisible third cost on a **1**-Respect card, on top of $2,400
and 6 of your 7 reserve Runners. At 5+ the cull is 3 and the bill is $2,000. **It cannot be removed
entirely** without making the card trivial (the cap is 5 and the Ward starts with 3): disperse with a
Move before the Reckoning, or pay it. **The Sicilians are Untouchable and pay neither** — one more
unpriced Sicilian edge alongside the brewing one above.

### Two decisions taken, so they don't get re-opened
- **`The Insurance Job` keeps the Rat verb**, against §4's own Respectability test. Nick: *"I totally
  agree on theme, but I really like the card and the variety."* Kept for what it does to the draft — a
  Market of nothing but "Unload X at Y" is a worse game. Known exception, not a precedent.
- **Rise is down to one card, and it cost nothing.** Both Rise cards paid you for being decapitated,
  reopening the incentive the Rise rework closed. Cutting one looked expensive — tiers are fixed at
  12/12/8 and each must be a multiple of 4, so a cut demands a replacement in the same tier. Nick's
  answer avoided that entirely: **re-verb `Last One Standing` from Rise to Secure** and the tier count
  never moves.

  `The Empty Casket` is the keeper, and the reason is thematic: it is **faking your own death and
  rising from the ashes**, which galvanises the mob — that is what the Respect is paying for. Kept at
  1 Respect, kept on Rise.

  The re-verb also closed the **empty 3-Respect Secure slot** flagged in the same audit, so Secure went
  from 3 cards with a hole in the middle to a clean **1 / 1 / 3 / 5**, on the verb Safehouse-only
  Recruit had just promoted. And it killed the 4-Respect `Last One Standing` + `The Empty Casket`
  overlap across the four mainland Wards, which was the very overlap the `rival_deed` tool fix had
  just made visible. **One edit, four problems.**

  `Last One Standing` is now: *"Secure your Safehouse into a **$300 Speakeasy** in a Borough whose
  **Deed you don't hold**."* The `$300` excludes High Society so `High Roller` can never ride it
  (without it, High Roller is a strict subset across three Boroughs — an 8-Respect stack). The Deed
  clause is the difficulty: it forces your Safehouse off home turf, and under Safehouse-only Recruit
  that moves your entire spawn point into a rival's Borough. Name, art and flavour all survive the
  change unaltered — a lone man at a bar table reads better as claiming a joint than as a succession.

**Verb spread after the pass:** Open Fire 8 · Unload 7 · Move 6 · **Secure 4** · Recruit 2 · Trade 2 ·
**Rise 1** · Rat 1 · Extort 1.

### Tooling
- **`tools/breadth_audit.py` is new** and encodes the breadth rule. Run it alongside the other two.
- **Two holes in `overlap_audit.py` fixed.** `rival_deed` was missing from Rise's `VERB_BOOLS`, so
  `Last One Standing` had **never been checked** — it reported clean because it reported nothing.
  Fixing it immediately surfaced a real 4-Respect overlap with `The Empty Casket` across the four
  mainland Wards. And the Runner magnitudes only tried 0 and 6, so a 4+ Recruit card and a 6+ one were
  indistinguishable. **A silent zero is not a pass.**

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
