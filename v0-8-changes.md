# v0.8 — what changed and why (2026-07-17)

Companion to `jobs-system-handoff.md` (which covers the Jobs system itself). This is everything
*else* v0.8 changed, with the reasoning, so nobody re-opens a settled argument or "fixes" something
back to a bug. Every rule below is live in `Rulebook v0.8.html` (print-verified 23pp A4, no blanks).

> **2026-07-18 — the Jobs Market is now STATIC.** The conveyor, *Yesterday's News*, the fresh/stale
> ends and the per-player deck build are all deleted; **all 32 cards are in play, though the opening
> Market is still dealt from the 1s and 3s only**; passing at The Offers is now explicit. The argument and the five rejected alternatives live in
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
  incentivised Boss death. Boss death is a real setback again, reinforced by **No Boss, no business**
  (no Offers without a Boss).

  > **CORRECTION (2026-07-20).** This entry used to end "Now: **promote a Runner** (Cost 1, Standard
  > Play)", and the next bullet introduced a separate **Wiped Out** Play. **Neither survived.** Rise
  > landed as a **Power Play (Cost 2)**, available only while your Boss is off the board: **place your
  > Boss in any Safe District**, and if your **Safehouse** is off the board too it goes up in the same
  > District, **free**. That free-Safehouse clause is Wiped Out, absorbed; there is no separate Play.
  > The rulebook and the playbook cards have been right all along and this doc was the stale one; it
  > also contradicted itself, since the *No Safehouse means no Recruit* knock-on below already leans
  > on "Rise's free-Safehouse clause". Verified against `Rulebook v0.9.html` (Power Plays table),
  > `Playbooks v0.7 Reskin.html` (Rise, cost 2) and `mk-online-handoff.md`.
- **The Rat**: "cannot Hustle" → **"cannot Bribe"**. The old clause was "cannot be crowned" stated
  twice, and it locked you out of a whole subsystem. The two clauses now cover opposite halves of the
  game: early, no Bribes stalls your whole trajectory (you start at 6, need 10); late, at 10 Influence
  it costs nothing and only "no crown" bites. Framed as one idea: *the Commission wants nothing to do
  with a rat.*

  > **CORRECTION (2026-07-27) — this bullet is two generations stale.** "Cannot Bribe" became
  > "cannot take Jobs" on 2026-07-24, and on 2026-07-27 **every gate on the Rat was replaced by a
  > flat −3 Respect**. Do not restore any of them. The full reasoning is the last section of this
  > file, *the Rat is a price, not a gate*; the online port is `mk-online-rules-sync.md` §1.
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

## 2026-07-19 (later still) — the rulebook wording pass, and Cooperation's rules holes

Commits `21c0075` (rulebook + art) and `1dedcd0` (playbooks). **Pushed — `origin/main` is current
again after sitting 3 commits behind.**

### The wording pass: 2,483 → 2,193 words over four sections

Sections done so far: front page, "A Day in the Life", Components, **Key Concepts** (1,247→1,098),
**Your Goal** (855→748), **Setup** (381→347). Next up is Gameplay / Phase 1: Shadows.

**One pattern accounts for nearly every cut, and it has a reliable tell: a passage restating a rule
that already has a canonical home announces itself with its own `(see X)` cross-reference.** Three
examples, each a different flavour:
- The map legend was stating each Title's criterion for the **third** time (after the Titles section
  and Stake Your Claim), plus the whole Ward→Recruit discount. Compressed to "Count for the **Ward
  Boss** Title". **Keep the identifying fact, cut the procedure** — $300 vs $500 a barrel IS what a
  Speakeasy is, so that stays.
- *Claiming a Job* re-listed all three of The Offers' options, which Grease the Wheels owns as a
  numbered procedure. **Hand steps back to the phase that runs them**; the concept section keeps the
  concept.
- *The Commission* re-taught Bribe and the 10-Influence ceiling for the third time. Kept who they
  are and "you need both"; cut the mechanics. That paragraph alone gave up 27 words.

**The counter-rule still holds** (it cost a revert once): a lookup duplicated where the player's hand
actually needs it is an ergonomic feature, not bloat. The Muscle Ratio table stays on the combat page.

### Setup had a real ambiguity, not just clumsy wording

**"3 Runners at your Dock, and 3 Runners in your Speakeasy" does not resolve for a single seat.**
Manhattan and Queens each hold **two** Docks, and every mainland Borough holds **two** ordinary
Speakeasies. The only thing that disambiguates is the **`Setup` column of the District Roster** on the
Town Planning Ledger, which names them outright (West Side not The Bowery; Jamaica not Whitestone) and
marks the Police Squads too. Setup now points at it, and Raise the Blue Wall opens "The same column
marks the law". **Boroughs are NOT uniform — M 6 · Bx 5 · Q 6 · Bk 5 · SI 3 = 25** — so never assume
one Dock or one Speakeasy per Borough.

**Resequenced to: Crew → Turf → Blue Wall → Job Deck → Cut → Turn Order → Ferment the First Mash**
("establish the city, then roll out the jobs"). The Mash roll moved from **first to last**, which has
a structural justification beyond taste: *Ferment Tomorrow's Mash* is the closing step of Shadows, so
setup rolling it last is the exact mirror, "the night before Day 1" — which is what *The Brew* already
claims setup is. Also: "Stack the Deck" → **"Stack the Job Deck"**, "the eight 5s" → **"the eight
5-Respect Jobs"** (a new player has no reason to read a bare "5" as a Respect value), and
"Unfold the Game Board and lay out the Cash and Dice" cut as self-evident.

### Cooperation: five rules holes, and one of them was live

1. **Puppeteering was unbounded in time.** "At any time during the Hustle" allowed lending to a player
   who had already Laid Low and banked their turn. Now: **only to a rival who hasn't yet Laid Low.**
2. **No consent.** The recipient might not want the marker. Now: **they may refuse.**
3. **"now or later" was simply wrong** — a rival can't spend "now" when it isn't their turn.
4. **⚠ THE FIX THAT NEARLY BROKE THE FEATURE.** The natural rewrite is "they may use them on their
   next Play" — and that **silently kills the mid-firefight rescue**, because *a firefight is ONE
   Play*. A Pinned Invader at 0 Influence (who "must Fall Back") would never reach a "next Play" in
   time. **Decision: keep the rescue**, worded "on their next Play, **or right now if they're Pinned**
   and weighing whether to keep firing." The lender still pays real Influence and carries the Heat, so
   it isn't free intervention.
5. **⚠ A LOAN WAS A GIFT — the one nobody had spotted.** Lay Low says *"clear any remaining **Ledger**
   markers to your **Reserves**"*, so an **unspent lent marker became the borrower's permanent
   property**. Self-limiting in a standard game (nobody gifts win-condition Influence), but **Blood
   Oath** makes Puppeteering "your strongest weapon… freely lend to your partner" while the win needs
   "at least one partner holding 10 Influence" — i.e. **lend-and-don't-spend was a legal route to
   stacking a partner to 10**. Now: unspent markers **return to the lender's Reserves at Lay Low**.
   **Odd Jobs on borrowed markers stays LEGAL** (Nick's call, and it's right — Puppeteering moves
   markers *out of* the lender's Ledger and Reserve markers don't pay, so the $100s travel with the
   marker; it's a transfer, not new money. My "money pump" reading was wrong).

**Binding Handshakes never expired.** The old text asked for "a specific deadline" but offered
*"until you pay me $1,000"* as an example — a **condition, not a deadline** — so "I promise to take
Manhattan by the end of the game" could lock a marker permanently with no mechanism to force
resolution. **Every deal now runs out at the end of the current Day.** Multi-Day arrangements just get
re-staked each Day, which is better: it costs a fresh commitment. Also deleted **Barrel Exchanges**
(already implied by Move) and bolded **Reserves** in Stake a Marker. Blood Oath's Puppeteering line now
says "the standard **lending** rules apply" (was "Heat rules"), so it inherits all of the above.

### The Lowdown now carries Cooperation

The playbook back had ~204px spare since the endgame block moved to the turn card. It now closes with
a **COOPERATION** panel: **Puppeteer (0)** and **Handshake (1)** as cost/name/desc rows, plus an
italic closer for the loan caveat. "A **willing** rival who hasn't Laid Low" carries the whole consent
rule in one word, which is what keeps each row to one line.

**A third row, "Cash", was written and then cut (Nick): handing cash across the table is an informal
courtesy with no name and no cost, so it isn't a rule the play aid should be teaching.** Cutting it
paid for the better treatment — the section is wrapped in **`.sig`**, the same bordered/washed panel
the fronts use for SIGNATURE PLAYS, instead of a bare `.sec` header. That gives the visual break the
back needed after the dense combat reference, **and it makes the duplex pair rhyme**: both sides now
end with a boxed panel in the same position on the card. Net effect on height is *positive* — one
fewer row (−36px) more than pays for the box (+27px). Card sits at **914px of 965, 51px spare.**

### Art: one folder, and the crop problem finally has a number

All rulebook art moved to **`Art/Rulebook/`** (`git mv`, clean renames). **Grep every HTML file before
moving shared art** — `Moonshine Kingdom.png` is also `index.html`'s logo and `Unload 2.png` is used by
`Contract Cards v0.7.html`. New art: Titles page takes `Speakeasy.png`, Winning the Game takes
`Crown 2.png`, the map page takes `Kingdom.png`.

**The no-crop height is `702 / aspect`** (the text column is 702px = A4's 794 minus 2×46 padding). The
covers are two families: **16:9 (1672×941) → 395px** and **3:2 (1536×1024) → 468px**, so **no single
height can serve both**. At the default 460px the 3:2 art loses a harmless 8px of height, but 16:9 art
is scaled **up** and **sheared 7% off each side** — which is what chopped `Kingdom.png`'s "HELL'S
KITCHEN" water tower into "LL'S / CHEN". Added **`.cover img.cover-wide { height:395px }`**, now on all
eight 16:9 covers. **The old art is all 3:2 and every new commission is 16:9**, so as the last three
(`Police`, `Influence Boss`, `Vendetta`) are replaced, `height:395` can become the single global rule
and cropping stops being a concept. Each conversion also hands the page **65px** of slack; the book is
now 23pp at **20.2 pages of ink**.

**Judge cover art on the CROP, not the source file.** From the full-res files `Crown.png` (a ring
presented in a box) was the better picture; at 700×460 the ring shrinks to an unreadable smudge and it
degrades into a generic handshake, while `Crown 2.png` holds its read. Cheap test, no browser needed:
PIL-crop to 700:460 centred, resize, look.

---

## Print gotchas learned the hard way (v0.8)

- **Every `body > .container` must fit A4 (1123px)** or it spills and leaves a blank page. Measure via
  CDP under `Emulation.setEmulatedMedia{media:'print'}`. Don't trust page count alone — check for
  text-free pages too.
- `table { page-break-inside: avoid }` means a table too tall for its remaining space jumps a whole
  page. Adding a Rise row to the Plays table cost 3 pages and 3 blanks.
- ~~**`@media print` sets `.shadows-page / .components-page / .goal-page .cover img`…**~~ **STALE as
  of the v0.9 reskin.** `.tight-cover`, the per-page `max-height` overrides and the inline `height`
  attributes are all gone. Cover sizing is now three classes in `css/moonshine-rules.css`:
  **`.cover img` 460px · `.cover-wide` 395px (16:9, uncropped) · `.cover-sm` 350px (a deliberate
  space lever, still crops on purpose).** The old lesson survives in general form: **after any global
  sizing change, grep the print block for surviving per-page overrides of the same property** — two
  legacy rules once sat later and more specific than the central one, so two pages silently kept a
  ~257px image while every other page grew, and the page-fill numbers still moved enough to
  "confirm" a fix that hadn't happened.
- **Word trims often reflow without collapsing a line.** Measure the last line's width fraction and
  only cut what genuinely removes a line.
- A full-width table inside a 2-column `.container` **spans the columns and splits the surrounding
  content**, which orphaned half of a numbered setup step. Prefer prose; the ratio *was* the table.
- **A high page-fill % can mean bad column BALANCE, not too much content — look at the render before
  cutting words.** `ol.sub-section > li` is `break-inside: avoid`, so **every numbered step is an
  atomic block**. Merging two Setup steps made one too tall for column 1, which shoved it whole into
  column 2 and left column 1 half-empty: fill jumped **90.2% → 99.0% (10px slack) on +11 words**.
  Splitting it back fixed it. Keep steps in a numbered list similar in size so they pack.
- **On a >95% page, reach for the cover, not the sentences.** Adding the Cooperation rules to the
  book's tightest page (98.0%, 20px) overflowed it to 24pp + a blank; prose trims were **not** enough
  and `cover-sm` on `Puppet.png` (−110px) fixed it in one move.
- **Playbook cards clip SILENTLY** (`.card` is a fixed 925px box with `overflow:hidden`), so measure
  after any addition. **Summing children's `offsetTop+offsetHeight` does NOT work** — `.card` is
  `display:flex` and stretches them, so every card reports the same ~959px regardless of real ink.
  Per card, save `style.height`, set `height:auto; overflow:visible`, read
  `getBoundingClientRect().height`, restore. Current headroom: **fronts are full** (Vipers **4px**,
  Knights/Irish 23, Sicilians 39), Lowdown 51.

---

## The Ledger player board: two builds, and what is still open (2026-07-20)

**There are now TWO board files and they are not interchangeable.**

| File | Socket | Board | Sheet | Use |
|---|---|---|---|---|
| `The Ledger v0.8.html` | **26mm** | 260 x 75mm | 2 per A4 landscape | **Current prototype.** Markers are 25mm; the socket is 26 so the ring stays visible around a seated chip. |
| `The Ledger v0.8 (Poker Chips).html` | **39mm** | 275 x 85mm | 2 per A4 landscape | Future build for real casino chips. |

The poker file was **generated from** the prototype, so they are structurally identical; only the
socket size, board dimensions and row spacing differ. Keep it that way. If the board design changes,
change the prototype and regenerate rather than hand-editing both.

**The rulebook's plate is rendered from the PROTOTYPE file.** `Art/Rulebook/Ledger.png` (3685x1063,
3.47:1). Recipe: print the file to PDF headless, render page 1 at `scale=5`, crop the first board
strip (`x = (W - 260mm)/2`, `y = ((210 - (2*75 + 15))/2)mm`), save over the PNG. `Art/Rulebook/Operations.png`
is retired to `Art/Unused/`; nothing references it.

**THE TURN TOKEN IS DELIBERATELY NOT ON THE BOARD (Nick, 2026-07-20).** It used to sit in the socket
row. It is not part of the Reserves -> Ledger -> Heat cycle at all: it is a claimed number, not a
spent resource, so it lives beside the board on the table. Its socket and the `.divider` rule are
deleted from both files. **Do not put it back**; it is also what makes a single row of chip-sized
sockets fit at all.

**Why the sizes are what they are, so nobody re-derives it.** A single row of SEVEN positions caps
out at **28.9mm** at normal spacing and **34.1mm** even with the board stretched to the sheet's full
usable width and every gap tightened. Seven 39mm chips need **311mm**, which is 14mm wider than the
whole A4 sheet. Dropping the Turn token to six positions is what buys chip size. **Two separate
overflow bugs were found by rendering after the arithmetic said it fitted** (the socket row ran past
the frame and clipped the last socket; a corner-positioned Turn slot overlapped it). Render, do not
trust the sums.

**Square Turn tokens: Nick's idea, and worth doing.** Shape encodes a *category* difference rather
than an identity one, which colour cannot, and it survives dim light and colourblindness. Not yet
decided or built.

### Open, not started

1. **Custom poker chips as the Influence marker.** Agreed direction: weight and the clack are most
   of what "premium" means at a table, and chips are thematically exact for a Prohibition game.
   Costs to weigh: ~16 markers x 4 mobs is a real BOM line, plus box weight and shipping.
2. **Inline the board into the rulebook instead of shipping a PNG.** Argument for: the old
   `Operations.png` disagreed with its own source file for months precisely because an image cannot
   be grepped or diffed. Inlining kills that class of drift, is vector, and removes a re-render step.
   Costs: the board's class names (`.socket`, `.label`, `.cluster`, `.corner`) collide with the
   rulebook's 1400-line stylesheet so they need scoping, the board is sized in mm and the rulebook
   column is 702px so it needs a `transform: scale()`, and the markup would then exist in two files.
   A `tools/` script generating the rulebook block from the ledger file removes that last objection
   at the cost of a build step the project does not currently have.
3. **The Reserves socket is labelled twice**, once above and once inside. Pre-existing; may be
   deliberate so players know where spent markers go. Nick's call.
4. **~300 words of lower-confidence wording cuts** the audit surfaced and I held back, all voice
   calls on signature lines: the italic stings on Recruit and Secure, the *Capo di Tutti Capi* trim,
   and the Blue Wall restatement inside Move.
5. **`v0-8-changes.md` carries 77 em dashes.** The style rule's gate list covers player-facing files
   only, so internal docs were never swept. Decide whether the rule extends here.

---

## 2026-07-27 — the Rat is a price, not a gate

Three tunings of this card failed for one reason, and it took a fourth to see it: **every penalty on
the Rat was binary.** "Cannot Hustle", then "cannot Bribe", then "cannot take Jobs", plus "cannot be
crowned" running underneath all three. A switch is the wrong instrument for a *weapon*, because a
switch means the tool is unavailable at exactly the moment its purpose exists. The Rat is a Raid on
demand aimed at whoever fired the last loud shot; the boss who most wants that is the boss closing on
the leader, and he was the one who could never afford to call it. The card sat in the box.

### The diagnosis that actually mattered

The honor gate was **not** the culprit, which is why removing it alone would not have worked. "Cannot
be crowned" is free to a boss who was not going to be crowned — and a boss in contention *should not*
want sirens. That part was working.

**The Jobs blackout was the bug.** Holdings top out at 14 Respect, so every crew must come through the
Market to reach 15 (see *Why Public Enemy No. 1 had to die*). Shutting the Market therefore hurts the
trailing player most — the exact seat the Rat exists to serve. The blackout switched the Play off for
the only player with a reason to make the call. That is why it read as unusable "especially late".

### What landed

- **No Jobs blackout.** The Market deals to a rat like anyone else.
- **No crown gate on the Rat.** Removed from *A Kingpin Must Have Honor*.
- **−3 Respect while you hold the card**, tallied at the Reckoning as a fourth line in *Earning
  Respect*, alongside Turf, Titles and Legends.
- **No absolution.** The marker-for-forgiveness exit is deleted. The card leaves you **only** when a
  rival Rats and takes it off you.
- **"Cannot Rat again" stays.** Load-bearing: without it a non-contender turns 2 Influence into an
  unlimited Raid button, since a flat penalty makes the second call free.
- Rat still costs **2 Influence** and still fires a Raid with **no marker on the Track**.

### Why −3, and why it needed no clock

−3 against a 15 threshold is a Borough Deed and a half, or one 3-Respect Job — meaningful, payable,
never disqualifying. The elegant part is free: **Respect is only tallied at the Reckoning**, so the
brand costs literally nothing until the night somebody could be crowned. The "cheap early, brutal
late" curve that three previous versions tried to write explicitly now falls straight out of the
existing scoring step. No track, no counter, no escalation clause.

The penalty also always lands on the player who **chose** it — the card cannot be thrown at you, only
taken by you — so −3 is a price tag, never a feel-bad.

Deleting absolution killed the nastiest corner in the old rules as a bonus: absolution could not take
you below 5 Influence, so a broke crew was branded permanently. The player who most needed the exit
was the one who could not buy it.

### Shylock was deliberately NOT changed. Don't "finish the job."

The obvious symmetry — make Marks −2 Respect each and delete *A Kingpin Must Have Honor* outright —
was considered and **rejected**. The honor gate is a *conditional* cost: free while you are losing,
disqualifying when you are about to win. That is exactly right for a lifeline loan and exactly wrong
for a weapon. Convert it to a flat −2 and the only player who ever Begs, the one who is behind, gets
shoved further behind by the game's own catch-up valve. It also would not have simplified anything:
three Marks at −2 is −6 carried on a public scoreboard all game.

So the rule survives, halved: **the council crowns no debtor.** One clause, one card type, easier to
teach than the two-headed version. The theme improves rather than degrades — a rat is a rumour and
the street prices a rumour; a Mark is a signature, and no commission hands the crown to a man another
man owns. Each cost now lands in the currency it belongs to.

### Knock-ons, all of which fall out for free

- **The Insurance Job** (Rat + steer the bust onto a Pressure-2 Still you Control) pays **3** Respect,
  which now exactly cancels the −3. Left at 3 on purpose: a Job whose whole payoff is laundering your
  own brand is thematically perfect and still costs a Stake, a Play and the engineering. Watch it in
  play — if it becomes an auto-take, it is a 1, not a 3.
- **The hate-draft veto returns.** Ratting used to spend your ability to deny the crowning card at
  the Market. It no longer does, so "call a Raid on the leader" and "deny him the Market" are
  compatible in the same week. This is a real power increase to the trailing seats, riding along with
  the intended one.
- **Blood Oath**: the −3 flows into the Alliance's *combined* Respect, and the Sit-Down ranks on
  current Respect — so the card in your hand at Crackdown 10 can drop you a place and change **who
  you marry**. Nothing to write; it falls out of *Earning Respect* being referenced by both.
- **Respect floors at zero: NOT added, and don't add it.** It can never matter. Every player compared
  in the Final Standoff has already cleared 15, so a negative total is never in the comparison, and
  Volstead does not track Respect at all.

### The one place the old gate survives: Volstead

The Volstead Act returns all Job Cards to the box and **does not track Respect**, so −3 is a no-op
there and the Rat would be a completely free Raid — on a variant whose whole tension is the Crackdown
clock, and where "the richest **honest** Kingpin" is one of the two roads out. Honor is load-bearing
in that variant in a way it is not in the main game.

So Volstead keeps the crown-bar on the Rat Card, as an explicit override in its own honor clause. It
costs nothing to teach (that document already overrides the Rulebook wholesale) and the theme is
free: 1920, the bench still means it, a rumour still sinks you.

### Deck geometry, measured

Losing the blackout and the absolution clause cut the Rat's rules text from **14.9mm to 11.5mm** —
which is, to the pixel, the Harbormaster's height, and the holdings geometry already houses that in a
16mm band. So the **debts geometry moved 35/19 → 38/16** and the Rat's art gained 3mm. The deck's two
geometries now coincide; they are still two knobs, and rewriting either tall card parts them again.
Measured in headless Chromium at 96dpi: all eight cards land on 88.0mm with zero overflow.

The Rat's badge is now `Art/shield-3.png` (a real −3 shield, recovered from the archived Debts deck)
in place of the broken crown, which stays on Shylock's Marks where it is still true. **Open art job:**
that plate is the older 1024px glossy generation with a soft glow, not a sibling of the flat 256px
`shield1/3/5`, so it reads a shade hot next to the broken crowns on the same print sheet. Semantically
correct today; wants a reshoot in the flat style.

---

## 2026-07-29 — Twist the Valves is retired; **Split the Batch** replaces it

> **This supersedes every "Twist the Valves" reference above**, including the *"3 barrels, 4 with the
> Boss"* ceiling, the Sicilians' *"6 with Twist"*, and the `$800 Boss-loss` calibration flag. The Boss
> no longer adds a barrel to anything. Those passages are left as written because this file is a
> record of what v0.8 decided, not a live spec.

### The rule

> **Split the Batch:** If the Still in your **Boss's** District fires, you may also fire **one other
> active Still you Control** in a District **Connected by Land or Bridge**, whatever its number.

Blowback is untouched: the Boss still falls first, still only in his own District. The reward widened;
the risk did not move a point.

### Why the +1 had to go

It was decoration. Measured on the same engine as the economy table, the bonus was worth **+$102/Day**
on a 7-stack and **+$14/Day** on the 6/7/8 mismatch — the build that most wanted it — because a 12.8%
Boss-loss rate ate the whole reward. Nobody was making a decision; they were remembering a rider.

Three replacements were weighed. **Drop the Boss rule entirely** (he becomes a body, Blowback takes
him last) still costs a clause, and a Boss who cannot die at the boiler strands *The Empty Casket*,
prices *Rise* wrong and turns the game's best dramatic beat into a token you park and forget.
**Keep only the liability** (falls first, no bonus) reads as a decision but isn't one: tomorrow's Mash
is public tonight, so "keep him outside `Mash+1 … Mash+6`" is a solved puzzle that costs a Play to
execute and pays nothing. The relay was the only one of the three that *added* a decision.

### What it actually fixes

The board's problem was never the Boss; it was that a clump on one number crushed everything else.
Under the relay a spread build lights a second boiler with men it already owns and previously could
never use. Net $/Day, 4-player contested draft, ~16-man roster, cap 5, rolled Mash:

| Build | +1 (old) | Split the Batch |
|---|---|---|
| four 7s (the wall) | $1,252 | **$1,117** |
| 3 mismatched 6/7/8, Connected | $488 | **$765** |
| Sugar Hill spread 7/12/11/8, Connected | $477 | **$751** |
| Bronx block 8/11/9/10, Connected | $400 | **$631** |
| 2 clumped 8s (not adjacent) | $660 | $543 |
| spread 3+9 (Docks only, no land link) | $379 | $332 |

**The wall-to-spread gap falls from 2.6× to 1.5×**, and the Boss-loss rate is unchanged in every row.

### Four things that fell out of the sim, and are load-bearing

1. **The four 7s are one to a Borough and no two of them touch.** A wall of sevens cannot relay a
   single barrel. The board was already drawn to punish this exploit; nothing needed adding.
2. **The hostile-Harbormaster $0 survives.** The 8-clump still brews *nothing* under a hostile crown,
   because the relay needs the Boss's own Still to fire first and the lockout stops that. (The earlier
   "fires on ±1" proposal cost that clean zero — $0 → $199. This one doesn't.) The fully-Connected
   Bronx block zeroes too: connection is not armour, range is.
3. **Dropping the +1 does not drive the Boss into hiding.** Even with no relay available, the wall
   keeps him on the boiler (+$91/Day): his *body* is worth a barrel on a 5-man Still ~46% of mornings,
   which already beats a 7.7% Blowback. The Muscle Ratio was doing the +1's job all along.
4. **Drafting his number disarms the die that kills him** — the Red that fires the Boss's Still is the
   same Red that bursts it if left in the pool. That also forced a model change: the simulator's focal
   drafter now takes the die that *brews most* rather than the first that fires, because the dice
   stopped being interchangeable. This is why Boss-loss on the 6/7/8 now reads ~7% where the old
   figure said 12.7% — that number modelled an indifferent drafter.

### Restricted to Land or Bridge, deliberately

The game's general **Connected** includes the Docks waterway (all 8 Docks link to each other), which
would take the Boss's average reach from **3.0** to **4.6** distinct still numbers and make the map's
three dead-end corners — Jamaica, Westerleigh, Tottenville — its best Boss hubs. Measured cost of
allowing it: **+$139/Day** to a dedicated all-Docks build, so this is a clarity and geography call,
not a balance rescue. The phrasing already exists on the Jobs card *The Beachhead*.

### Files touched

`Rulebook v0.9.html` (rule + the worked example, where Sugar Hill now relays to West Side's 11 on a
morning nothing could reach an 11), `Turn Structure and Ledger v0.9.html`, `Kingpin's Guide v0.9.html`
(*Park the Boss* rewritten, economy table regenerated, two new Connected rows),
`Brew Simulator v0.9.html` (new **Connected to Boss?** column per Still, two new presets, relay in the
engine, value-maximising draft), `mk-online-rules-sync.md` §5.

**Unplaytested.** The figures are Monte Carlo (300–400k days/cell, ±1%) on the brew economy only —
Respect isn't modelled, and the relay rewards holding *adjacent* districts, which is also more Deeds
and Titles. The real effect on win rate is probably larger than the dollars.

---

## 2026-07-30 — Clarity pass: Control, Connection, the Brew, Blood Oath

**Control (Territory).** *Instant Possession* said Control shifted "the moment your piece enters …
even if you are gone again by nightfall", which is the opposite of the intent. Now **Walk In, Walk
Out**: Control is settled at the END of each Play. *Abandonment* → **Barrels Hold Nothing** (leads
with the rule, not the flavour). The Golden Rule of Turf no longer claims rivals "cannot enter your
turf without starting a firefight" — they can (Hold Fire, and the Viper Stealth explicitly relies on
it); the real rule is that you may not END a Play beside them.

**Connection is now two named terms.** `Land Connected` (border or Bridge) and `Water Connected`
(Dock-to-Dock). Plain **Connected** stays the umbrella term a Move follows, so every existing card
and rule using it is still correct. *Land Connected* was previously undefined vocabulary used by
Split the Batch and The Beachhead — v0.8 had "fixed" this by expanding the card to "Connected by Land
or Bridge" (see the 2026-07-18 table); that is now reverted to the short term, which is defined.

**The Brew: draft and brew are ONE step, per seat.** Previously steps 2 and 3, which read as two
passes round the table — and the worked example reinforced it by resolving all four drafts before
any brewing. Now: in Turn Order each boss drafts **and immediately brews before the next boss
drafts**. This matters because the grey supply is **finite, shared, and first come, first served** —
new key-rule box, which also absorbs the old *Dry Brew* aside and adds the missing ruling that
**when several of your Stills fire, you choose which to stock first**. The example's table gained a
`Brews` column so each boss's dice and barrels sit on one row.

**Blood Oath target: combined Respect +10 → a flat 30.** The +10 required tracking a derived number
that is unrecoverable from the board if you forget to write it down; 30 is always countable from
what's in front of you. The 1st+4th / 2nd+3rd pairing was already doing the balancing work — across
six modelled Respect spreads the two alliances start within 1–3 of each other, so "+10 each" mostly
re-solved a solved problem. **Deliberate consequence:** a head start now survives the Sit-Down
(under +10 the race always reset to 10/10). Nick's call, and the Guide's advice inverts with it —
rank buys you a partner, Respect on your books buys you a head start.

> **OPEN, deliberately deferred (Nick, 2026-07-30):** if the Crackdown hits space 10 late, two
> alliances can already be at ~25 combined and the race after the Sit-Down is very short. Unknowable
> without playtest — it varies wildly by table style. **Called a feature for now.** If it needs
> fixing, the two candidates are: an escalator (leader within 5 of victory → Target shifts to 35 or
> 40), or letting the players **bid** the Target at the Sit-Down. Do not "fix" this blind.

**The Rat card** dropped "you are −3 Respect and" from its rules text — the card already carries a
−3 badge (`data-respect="-3"`), so it said it twice. The rulebook still teaches both, which is right.

### Files touched
`Rulebook v0.9.html`, `Cards v0.9.html`, `Turn Structure and Ledger v0.9.html` (Draft & Brew merged;
also corrected Split the Batch from "1 Connected" to "1 **Land** Connected" — a live rules error, it
would have let a water-connected Dock relay), `Federal Crackdown Tracker v0.9.html` (both sizes),
`Kingpin's Guide v0.9.html`, `tools/gen_deck.py` + `Jobs Cards v0.9.html`.

**Verified:** Rulebook 24pp / Guide 35pp, no blank pages, fill-scan diffed against a HEAD baseline —
only the edited pages moved. Turn card measured `scrollHeight == clientHeight` (965) and rendered;
no clipping. Deck audits (`overlap_audit`, `fairness_audit`) unchanged: max stack 9, weighted spread 1.

### Two bugs found in `tools/gen_deck.py` while regenerating
1. **Masthead hard-coded `v0.8`** on a file named `Jobs Cards v0.9.html` — the card count beside it
   was computed but the version was not. Now derived from the filename.
2. **`path` was a bare relative filename**, resolved against the shell's cwd, not the repo. Verified:
   threw `FileNotFoundError` from anywhere but the root, and in any other directory holding a
   same-named file it would have rewritten the WRONG file. Now anchored via `__file__`.

### Stealth: Fall Back is a fallback, not a third option (2026-07-30)

Nick: *"does Fall Back need to be an option here, as there is literally no reason for it until you've
first opened fire?"* Correct as a tactic — moving in and silently back out wastes the Play. **But it
cannot be cut.** Stealth costs 1; a Viper who spends their last Influence on it is Pinned with **0**,
and Open Fire (1) and Advance (1) are both unaffordable. Without a free Fall Back the player cannot
satisfy "you cannot end your Play Pinned" and the rules deadlock. This is exactly what the combat
table's *"If you have 0 Influence remaining, you must Fall Back"* exists for.

Fix was presentational, not mechanical: Stealth now lists **Open Fire or Advance** as the choices,
with the free Fall Back named as what's left when you can't pay. Same in `Playbooks v0.9.html`.

> **RESOLVED same day — see the follow-up note below.** Original finding kept for the method.
>
> **PRE-EXISTING BUG FOUND, NOT FIXED — `Playbooks v0.9.html`.** Three of the four front cards
> measure over their fixed 965px box: **Vipers +38px**, Sicilians +3, Irish +4 (`scrollHeight` vs
> `clientHeight`; card indices 2/4/6). The render confirms it on the Vipers: **Tunnel's last line is
> cut through mid-text and the gold frame doesn't close.** Verified **identical at HEAD** — this
> predates today's work and my edits moved it 0px.
> **Do not try to fix it by trimming words.** I cut ~10 words from the trait and Stealth and the
> block heights (trait 77.8, sig 162.3) did not change by a single pixel — the text reflows without
> losing a line, the trap `rulebook-print-workflow` already records. It needs a whole rendered LINE
> removed, or `.card{height:925px}` raised in **both** `Playbooks v0.9.html` and
> `Turn Structure and Ledger v0.9.html` together (they must stay equal or duplex sides won't line
> up). Measure with scroll-vs-client and confirm with a render; the fill scan can't see it.

**FIXED, and by the rules edit rather than a layout fix (2026-07-30).** Nick, on the Stealth card
text: *"it's a prompt not the full rule, and the rest is implied."* Correct — "the Occupier can only
**Hold Fire**" already implies no Ambush and no Fold, and the Pinned resolution is generic combat,
not Stealth-specific. Cutting the card entry back to two sentences removed **two rendered lines**
from `.sig` (162.3 → 131.6px) and took the Vipers card from **+38px to +7px**.

**The render is clean:** Tunnel's last line is whole and the gold frame closes. The residual +7
(Sicilians +3, Irish +4) is the known false-positive band — `scrollHeight` over-reports on a
`display:flex` card, which is exactly why the memory says settle it with a render. All four fronts
verified visually. **No change to `.card{height:925px}` was needed**, so Playbooks and
Turn Structure stay in sync for duplex printing.

Lesson worth keeping: the fix came from asking *what does this card actually need to say* rather than
from trimming words to buy pixels. The word-trimming attempt moved the height by literally 0px; the
scope cut moved it by 31.

### Clarity sweep + "relay" retired as vocabulary (2026-07-30)

**Two live rules errors found by reading the book front-to-back:**

1. **The Boss "brews an extra barrel" — FALSE, and had been for a while.** The Key Concepts legend
   still promised the Boss's old +1 brew bonus, which was **retired and replaced by Split the Batch**
   (`mk-online-rules-sync.md` §5 says outright: *"The Boss's brew bonus is gone, replaced by a relay…
   the tabletop files no longer have it"* — except this one line still did). It also contradicted the
   Muscle Ratio directly, which counts the Boss as just another Mobster. He now correctly reads: *when
   the Still on his block fires, a second Still runs with it.*
2. **"Reserves soak up Heat" — FALSE, and already listed as a fixed bug in this very file** (see
   *Bugs fixed*, v0.8: *"Heat takes the spent Ledger marker; Reserves never soak anything"*). It was
   fixed in one place and survived in **two more** in the Rulebook plus **one** in the Guide. All
   three now say what Reserves actually do: stake Jobs, and refill the five that the Heat Track keeps.
   *Lesson: fixing a phrase is not the same as grepping for it.*

**"Relay" is retired in favour of "the Split" (Nick).** It was invented vocabulary that appears in no
rule, so a reader had nothing to map it onto — the rule is called **Split the Batch**. Reworded, not
find-and-replaced, so the verb reads naturally each time ("he Splits near half of all mornings", "a
wall of sevens cannot Split a barrel"). Covers `Kingpin's Guide v0.9.html` (9 uses) and the
**user-facing** strings in `Brew Simulator v0.9.html` (the checkbox label, the KPI tile, a table
header, two prose lines). **The simulator's internal JS identifiers — `relayed`, `relayDays`,
`pRelay` — were deliberately left alone**: invisible to readers, and renaming them risks the engine
for no gain. Verified no JS errors via CDP after the edits.

**Also:** `Brew Simulator v0.9.html` had `<title>…v0.8</title>` — the same stale-version bug fixed in
`gen_deck.py` earlier today. Worth a periodic grep for `v0\.8` in v0.9 filenames.

**Checked and found correct, so not changed:** setup's *"stake first, fund second"* (The Offers really
does precede Fund the Ledger, so Day 1 is consistent).

### The Scatter is LAND ONLY (2026-07-30)

Surfaced by the Land/Water split: *Run For It* said the raided crew flees to a **Connected** Safe
District, which now formally includes **Water Connected** (Dock-to-Dock, anywhere on the map), while
*Cornered* in the very next line still listed **water** as a thing that blocks an exit. Both readings
could not be right.

**Settled as land-only** (Nick). Thematically the police are already through the door, so there is no
time to put out to sea; mechanically it makes Raids meaningfully harsher, which the game wants, and
it closes a hole where **every Dock District had a guaranteed escape hatch** — the Docks all connect
to each other, so a raided pier could essentially never be Cornered.

**The decisive argument is consistency, not balance.** Both water/rail movement Plays already say so
in as many words: **Skiff** and **Tunnel** each read *"not an escape hatch: you cannot use it to flee
combat or a Police Raid."* A generic "Connected" here would have handed every Dock, for free, the
exact thing the Knights' signature Play is explicitly denied.

**Combat retreat is deliberately NOT changed and must stay that way.** *Advance* says *"including
across water via Docks"* in as many words, and *Fold* is likewise unrestricted. Fleeing a rival mob
by boat is legal; fleeing the law by boat is not. Do not "consistency-fix" these to match the Raid.

Cascaded to `Turn Structure and Ledger v0.9.html` (Raid step) and `Kingpin's Guide v0.9.html`
(Part IV's back-door note, plus the Conspiracies "corner him, then call" play). The Guide's note
gains the corollary: a pier with one land exit is a cell with a view.

### Combat Heat: the "1+ kills" rule STAYS (2026-07-30)

Considered replacing *Heat if the Invader's dice score 1+ kills* with *Heat if the Invader Opens
Fire*, because the current rule fires almost every time and costs a per-round check. The numbers back
that up — P(1+ kills) per volley for an invader:

| dice | Threat 1 | Threat 2 | Threat 3 |
|---|---|---|---|
| 2 | 55.6% | 75.0% | 88.9% |
| 3 | 70.4% | 87.5% | 96.3% |
| 5 | 86.8% | 96.9% | 99.6% |

Across a 3-volley fight at 3 dice / base Threat, Heat lands **97.4%** of the time.

**REJECTED, and Nick's question is why: if it's the gunshots that make the noise, why doesn't an
Ambush draw Heat?** It doesn't — *"The Occupier never draws Heat"*, and Ambush costs 0 and carries
+1 Threat. So the defender shoots first, for free, and the law never hears it.

That proves the rule is **not** modelling noise. It models **who the law blames**: the Occupier is
the aggrieved party on their own block; the Invader is the stranger who came in and left bodies.
Read that way *"1+ kills"* is the point, not a clumsy proxy — **no bodies, no case.** A whiffed
volley walks free because nothing happened worth reporting. "Open Fire draws Heat" would be cleaner
to execute but would break that fiction and tax the one outcome with nothing to report. The ~97%
rate is a **feature**: attacking should nearly always cost Heat, because attacking nearly always
leaves bodies.

> **SHELVED FOR v0.10 — "whoever starts the shooting takes the Heat" (Nick's third path).** A better
> model of blame than what we have, and it has a genuinely elegant emergent consequence: paying to
> Ambush means a defender with nothing in Reserves **cannot** Ambush and must absorb the first
> volley, which finally makes *Hold Fire* a real choice rather than a fallback. **Not built, on
> Nick's own read that it throws up too many edge cases.** Reasons to be careful if it is revisited:
> (1) **Ambush and Fold both cost 0 by design**, so an Occupier is never helpless — charging for
> defence lets a player lose turf without rolling a die; (2) it gives **Reserves a fourth job**
> (stake money, tomorrow's refill, Heat cushion, and now defence money), adding a hoarding incentive
> that works against *capacity, not actions*; (3) the open questions are real — does the Ambush cost
> return, does Heat land if the Ambush kills nobody, what about a defender whose last marker is
> staked on a Job. Deserves a clean playtest, not a patch: the Heat page is at **100% of its column**
> and cannot fit the extra explanation.

---

## OPEN FOR DISCUSSION — combat Heat and the cost of Open Fire (2026-07-30)

> **RESOLVED & BUILT 2026-07-31 — see "BUILT: Ambush costs 1 + Heat" at the end of this file.**
> The discussion below is kept for the reasoning; the shipped rule and the pool decision (Reserves,
> not the Ledger) live in that final section.

**Nothing below is built. Nick wants to think about it. Do not implement any of this without him.**
This supersedes the "1+ kills STAYS" note above: that note's defence of the rule does not survive
the kill-attribution bug in §2.

### 1. My "a broke Occupier could not defend" objection was WRONG

I argued against charging Influence to Ambush on the grounds that it lets a player lose turf without
rolling a die. **False, and Nick caught it.** *Open Fire* has **both sides roll simultaneously**, and
the cost falls on the Invader — the Occupier returns fire for free either way. Charging for Ambush
would remove only the **first strike**, not the defence. The remaining objections (Reserves gaining a
fourth job; the edge cases) still stand but are weaker.

### 2. THE REAL BUG: "1+ kills" does not track bodies, it tracks whose dice made them

Heat lands on the Invader *only if their own dice score*. So a volley where the **Occupier** kills and
the Invader whiffs leaves corpses on the board and **draws no Heat at all**. Frequency of "bodies but
no Heat", one volley, Invader at T1:

| matchup | P(inv kills) | P(occ kills) | **bodies, NO heat** |
|---|---|---|---|
| 2v2, occ T2 | 55.6% | 75.0% | **33.3%** |
| 3v3, occ T2 | 70.4% | 87.5% | **25.9%** |
| 2v4 vs Safehouse | 55.6% | 98.8% | **43.9%** |
| 5v3, occ T2 | 86.8% | 87.5% | **11.5%** |

A quarter to nearly half of volleys. The invader's own dead make no noise.

### 3. The three candidate rules are nearly indistinguishable in play

P(Heat) across a 3-volley fight, 3 dice, inv T1 / occ T2:

| rule | P(Heat) | verdict |
|---|---|---|
| **A. Invader's dice kill** (current) | 97.4% | buggy per §2 |
| **B. Any bodies** | 100% | **dominated** — fiddly AND double-punishes the whiff (Nick) |
| **C. Invader Opens Fire** | 100% | cleanest to adjudicate; no dice inspection |

They are the same rule with different bookkeeping. **B is dominated and should not be chosen.**
Nick leans to **C** ("whoever opens fire takes the Heat"). Known cost of C: the Viper Stealth probe
and the one-volley-then-Fall-Back play stop being free. Under C the Ambush asymmetry is answered
consistently — the *Invader's* gunfire is what gets reported — rather than by a dice check that
misfires a third of the time.

### 4. Nick's further idea: make Open Fire FREE (Cost 0)

Appeal: a combat Play would cost only 1–2 Influence total (the Move in, plus an Advance), so a failed
attack can no longer drain a whole day.

**But it removes the only thing that ENDS a firefight.** Today the fight terminates because the
Invader runs dry — the rulebook says so (*"until the Pin is resolved, or you run dry and must Fall
Back"*), *The Cost of Pride* is built on it, and `Combat Simulator v0.9.html` states its whole model
as *"the Pinned invader spends Influence per volley until it runs out."* Free volleys mean both sides
grind until one is annihilated. 20k trials, 6 Mobsters a side:

| | invader takes turf | invader wiped | avg volleys |
|---|---|---|---|
| costed (~3 volleys) | 1.5% | 16.6% | 2.99 |
| **free, fight to the death** | **18.4%** | **81.6%** | **5.06** |

Attacking gets **12× more likely to succeed** and **5× more likely to annihilate you**, and the
board's body count rises sharply. That may be a *good* game — it makes assaults decisive instead of
attritional — but it is a **major balance change, not a cost tweak**, and it would need a cap
(volley limit, or Fall Back forced after N rounds) plus a full re-run of the combat sim and the
mob-balance work in the Kingpin's Guide.

### What to settle, when this is picked up
1. Fix §2 regardless — the current rule is defensible only if the misfire is intended, and it is not.
2. A or C? (B is out.) If C, decide whether the Stealth probe stays free.
3. Free Open Fire: separate question, bigger blast radius. Needs a termination rule and a sim re-run.
4. The Heat page is at **100% of its column** — any new wording must be a trade, not an addition.

### Update (2026-07-30, same session): free Open Fire, and the shape of the "first to fire" rule

**Free Open Fire: my "needs a termination rule" claim was overstated — Nick is right.** The Invader
can always **Fall Back** (free), so a fight still ends; free volleys mean *more dice thrown*, not an
unbreakable loop. The annihilation figures above still describe what happens when both sides *choose*
to keep firing, so it remains a real balance change, but it does not strictly require a new
termination mechanic. **Nick leans against it anyway** — it trades the game's *cold-war* feel for
something closer to Risk. Not ruled out; parked.

**Nick leans to "whoever fires first takes the Heat" over the simpler "invader Opens Fire = Heat",**
preferring its theme and strategy. He costed it at three rules; it is really **two**, and one of
them is a *repeal*:

1. ~~"You may leave markers in Reserves for defence"~~ — **this is not an addition, it is a REPEAL.**
   *Fund the Ledger* currently reads *"Move whatever's left in your Reserves into the Ledger, up to
   its 5 slots"* — funding is **mandatory**. Note the cost: that clause exists to stop hoarding, and
   it is the same rule the redundant "never hold any back" sentence was trimmed from earlier today.
   Making funding optional reopens the hoarding question.
2. ~~"An Occupier can't Ambush if the stash is empty"~~ — **not a separate rule.** It is just what
   happens when a player with no markers meets rule 3. Only needs the cost to be payable from
   Reserves.
3. **Whoever fires first pays 1 and takes the Heat (never both).**

**The "sitting duck" analysis is sound, and self-corrects as players grow.** Reserves after Shadows
= total − 5 − staked:

| total | staked 0 | 1 | 2 | 3 |
|---|---|---|---|---|
| **6** | 1 | **duck** | **duck** | **duck** |
| **7** | 2 | 1 | **duck** | **duck** |
| **8** | 3 | 2 | 1 | **duck** |
| **10** | 5 | 4 | 3 | 2 |

**But it is sharply tied to Jobs:** a Day-1 crew at 6 Influence that stakes a single Job is a duck
all morning, so the rule taxes early staking hardest — which is the opposite of what the Jobs system
wants. **And one correction to Nick's read:** he expected Reserves to refill "1+ play into their
turn (markers refunded)", but only **quiet** plays refund — a noisy one locks the marker to the Heat
Track. A crew that opens with Extort, Torch or a firefight **stays a duck for its whole turn**.
(Emergent and rather good: the loud crew is the exposed crew.)

**The strongest argument for it, and it is Nick's:** an empty stash is *public information*, so a
sitting duck becomes a desirable target, and **Hold Fire finally has a reason to exist**. It turns
Influence from a private resource into a readable tell. That is worth a playtest.

**Two honest costs to weigh first:** it reopens hoarding (see 1), and it punishes early Job-staking.

### Update (2026-07-31): the Safehouse/Ambush rework reframes this — still open, nothing built

The same-day combat rework (Safehouse +1 Threat **stacking on the Ambush shot**, so Boss + Safehouse
+ Ambush = Level 4; Torch cost 1 — commit `153b77a`) changes the weight of the arguments above,
mostly **toward** "first shot draws Heat":

1. **The free lunch grew.** The opening shot is now the deadliest single event in combat — a free,
   Heat-free Level 4 volley from a defended Safehouse. The imbalance the first-shot rule exists to
   tax is larger than when it was proposed.
2. **Both changes rescue Hold Fire, from opposite sides.** The rework gave it diplomatic value (wave
   the "passer-by" through; his promise to keep walking can be broken, and betrayal dodges the
   ambush). The first-shot rule gives it economic value (keep the marker, stay off the Track).
   Together it becomes a real three-sided choice; today Ambush still strictly dominates it whenever
   the Occupier means to fight.
3. **The blame fiction flipped.** "The Occupier never draws Heat" read naturally while defence was
   passive resistance. Now the defining defensive act is a premeditated Level-4 massacre from
   prepared positions — "the law only books the stranger" is harder to sustain when the loudest
   thing on the block was the defender's opening volley.
4. **The §2 bug got louder.** The worst "bodies, no Heat" row was already the Safehouse ambush
   (43.9%); a Level 4 ambush kills more per shot, all permanently Heat-free.

**And two costs amplified:** the sitting duck now forfeits a Level 4 shot, not a Level 3 one, so the
funded/broke defender gap widens and the early-Job-staking tax steepens. And every number printed in
the Guide's combat chapter assumes the ambush always fires — if it costs Influence + Heat, some
defenders Hold Fire instead, so adopting this rule means a sim re-run with the defender's
fire/don't-fire *decision* inside the model, not a constant.

**Nick's biggest reservation (2026-07-31), and it is about rule 1, not rule 3:** repealing mandatory
*Fund the Ledger* reopens the **choose-how-many-markers-to-hold-back** decision, which he reads as a
heavy AP decision — it slows the game every single morning, for every player, and its stakes are
invisible to new players (you cannot see why you'd hold markers back until you've been ducked once).
The firefight is occasional; the funding choice is constant. That asymmetry is the current blocker.

~~**Shape worth weighing when this is picked up: charge the first shot in Heat only, not
Influence.**~~ **WRONG FRAMING, Nick caught it:** Heat is never "cost-free" — a Heat marker IS one
of your Influence markers locked to the Track, so the only real question is which pool it leaves
from. Splitting "Heat" from "cost" was incoherent.

### Nick's coupling (2026-07-31, same discussion): the Ambush marker IS the Heat marker

**"Ambush: Cost 1 from the Ledger, and the spent marker locks to the Heat Track."** Not a new
mechanic — it is exactly the noisy-play pattern Extort and Torch already use (spend the marker, the
law keeps it). Ambush becomes "Cost 1, always Heat" in the Plays table and "whoever fires first
takes the Heat" falls out of existing machinery with one line of rules text. Nick: "not actually a
terrible idea." **Still open, nothing built.**

What it solves, all at once:
- **The AP blocker dies at the root.** Fund the Ledger is untouched — funding stays mandatory, no
  morning hold-back decision ever exists. The Ambush is paid from the Ledger, which every active
  crew has by construction.
- **The sitting duck becomes a thematic state, not an economy accident.** You cannot ambush only if
  your Ledger is spent out or you have **Laid Low** — and a crew that has laid low *shouldn't* be
  able to spring an ambush; they've stood down. The invisible Day-1-staker duck is replaced by a
  state players enter visibly and on purpose.
- **The tell survives in better form:** the Ledger is public, so "can they afford the first shot?"
  is countable by the whole table without Reserves entering it.
- **It prices exactly what the `153b77a` rework buffed:** the Level 4 Safehouse ambush now costs a
  marker and books you — premeditated and avoidable, and Hold Fire stops being dominated for the
  first time.
- **The §2 bug still dies:** blame assigned once per fight to whoever struck the match, no dice
  inspection.

Two consequences to weigh, both arguably features:
1. **A late-day attack window opens.** Laid-low crews lose their first strike, so hitting someone
   after they've gone home gets meaningfully better — attack timing joins the lay-low race alongside
   the Turn Token (same direction as the Reverse Snake: outlasting pays). Makes early laying-low
   more punishing than today; playtest eye needed.
2. **Every combat number printed in the Guide assumes the ambush always fires.** A broke or
   Heat-wary Occupier sometimes won't, so adopting this means the sim re-run with the
   fire/don't-fire decision modelled, not a constant.

Open details if picked up: refund timing for the *invader's* first volley under "never both" (does
the occupier ambushing make the invader's volleys Heat-free for the whole Play — presumably yes,
Heat is once per Play already); and whether an occupier's off-turn Ledger spend needs any wording
(it is the first off-turn spend in the game, mechanically fine, just novel).

---

## BUILT (2026-07-31): Ambush costs 1 + Heat, Open Fire always draws Heat

**Shipped into the live rules. Supersedes every "open / nothing built" note above.** Nick's landing
point in discussion: *"ambush costing 1 influence, and producing heat. And open fire also creating
heat (always, but never more than 1)."* The two halves are one marker each — a loud Play's cost
marker locks onto the Track instead of refunding, exactly the Extort/Torch pattern.

**The rule as shipped:**
- **Ambush — Cost 1, draws Heat.** Only the Occupier rolls, at +1 Threat, first. **Paid from the
  Ledger — the spent marker moves Ledger → Heat Track.** A crew that is **spent out or has Laid Low**
  can't Ambush (the sitting duck).
- **Open Fire — draws Heat whether or not it kills**, once per firefight, however many volleys.
  This is the "never more than 1" cap — it was already how combat Heat worked (once per Play), so no
  per-volley bookkeeping is added. Replaces the old *"Invader gains Heat only if their dice score 1+
  kills,"* which retires the §2 kill-attribution bug.
- **Sicilian *Hit*** resolves "like an ordinary Open Fire," so it now draws Heat on firing, not on
  the kill (Rulebook + Playbooks).
- **Deleted:** *"The Occupier never draws Heat."* Both shooters now heat, so a contested block puts
  **two** markers on the Track.
- **Marker order (2026-07-31 follow-up, Nick).** Since a firefight now lays *two* markers, order
  matters: the Raid's "Follow the Smoke" step targets the mob whose marker sits **furthest right**.
  The two markers go down at the end of the firefight in **firing order (Ambush first, Open Fire
  last)**, so the invader's marker is furthest right and the law chases *him*, not the defender. This
  is not a new dynamic; it makes rules-correct the Guide's existing Rat/decoy strategy (which already
  assumes the taker's marker is freshest, e.g. the Rat "hunts whoever fired the last loud shot").
  Deferring both markers to end-of-Play also settles Nick's other point: a Raid can't trigger
  mid-Standoff and interrupt a pinned firefight.
- **Track overflow (2026-07-31 follow-up, Nick).** A firefight lays two markers, so on a Track
  already at 4 it needs two spaces with one left. Rule: place both in firing order, *then* check the
  Boiling Point (not the instant the first marker lands). This matters for targeting, not just
  bookkeeping: if the trigger fired on the first marker, the defender's Ambush would be furthest
  right and the Raid would chase *the defender*. Placing both first keeps the invader's Open Fire
  freshest, so the aggressor is chased as intended. A firefight is the only Play that can push the
  Track past its fifth space; the spill just fires the Raid the moment the fight ends, and the Raid's
  refund returns both spent markers to Reserves anyway. Emergent bonus: attacking into a near-boiling
  Track calls the feds onto yourself, a natural brake on aggression. (Codified in the Police Raids
  trigger; left as R1 over a "cap at 5, drop a marker" alternative because the Ambush marker is spent
  and must land somewhere, and capping would silently undercount combat Heat.)
- **Open Fire Heat is the Invader's only** (clarity fix): in Open Fire only the Invader pays per
  volley, so only the Invader draws Heat; the Occupier's return fire is free, and the Occupier's Heat
  comes solely from the Ambush. Wording tightened across Rulebook + Guide. (Em-dashes introduced in
  the combat rewrite were also stripped at Nick's request.)

**Pool decision — the Ledger (confirmed by Nick: "the cost is spent and the marker goes from ledger
to heat track").** This is the "Nick's coupling" mechanic above, shipped as written: pay 1 from the
Ledger, that marker locks to the Track. **Fund the Ledger is untouched, funding stays mandatory, and
no morning hold-back AP decision exists** — the Ambush is paid from the Ledger every active crew has
by construction. The duck is a **spent-out or Laid-Low** crew, not an over-staked one; a broke
Day-1-staker is not automatically defenceless. (An earlier draft of this entry mis-shipped the cost
from *Reserves* and framed it as a staking "leverage tax" — corrected same day.)

**The strategic layer is a late-day / lay-low timing window, not a staking tax.** A crew that has
spent its Ledger or gone home for the day can't spring the Level-4 first shot, so **striking a rival
after he's acted gets meaningfully better** — attack timing joins the lay-low / Turn-Token race
(same direction as the Reverse Snake: outlasting pays). Laying low early is now more exposed. There
is a softer, emergent staking effect too — a crew busy working staked Jobs spends its Ledger down and
is caught spent-out more often — but it's a consequence of *activity*, not a hard wealth threshold.

**Plunder-on-Ambush is the one exception, left untouched.** The Irish rob at the crossing instead of
shooting; Plunder is the deliberate "no Heat, ever" trait, so a Plunder-Ambush stays **free and
silent**. Flagged in the Rulebook as the exception to the Ambush's new price. (Open if Nick disagrees:
should the Irish face the duck too? Left as-is to avoid a silent Irish rebalance.)

> **RESOLVED 2026-08-01: Nick ruled it — cost yes, Heat no.** A Plunder-Ambush now costs 1 from the
> Ledger like any Ambush (the Irish face the duck), but stays silent: they aren't *firing* first, so
> the Heat exception stands. See the entry at the end of this file.

### Figures (Combat Simulator model, ported to Python and validated against the printed Guide table)

- **The take-rate tables are unchanged.** A funded strong defender still Ambushes, so Invader
  "Takes It" and "Losses" don't move — only the Heat column changes. The Guide's numeric spine
  survives; this is a Heat-column + prose rewrite, not a renumber.
- **Heat on the block = 2** in every contested row (defender's Ambush + invader's fire). On the
  5-space track that is a Raid after ~2–3 fights: violence now visibly summons the feds, and a quiet
  table still draws zero combat Heat.
- **Ambush vs Hold Fire is decisive where it matters, negligible where it doesn't.** Secured
  defender, swing the Ambush buys over holding fire: +45 (vs 3-runner raid), +56 (4), +33 (5), +7
  (6), ~0 at 7+ (you lose anyway, but still bleed ~2). So for a funded defender who means to hold,
  Ambush is auto-correct; the real trilemma lives at weak-defender-close-fights and *can-I-afford-it*.
- **The sitting-duck swing is the headline: +31 points.** Secured block vs a 6-runner+Boss raid — a
  defender with a Ledger marker in hand holds at 49%, a spent-out one (can't Ambush) at 20% held /
  80% taken. Catching a rival after he's spent his Ledger or laid low turns a coin-flip block into a
  near-certain take. This is the mechanical engine behind the late-day attack window.

### Watch-items for first playtest (not blockers)
1. **Turn-order / lay-low timing.** Because duck-status is a Ledger state, it is **transient** — it
   resets when the Ledger refills next morning — so there is no "poorer → permanently a duck"
   spiral to fear (a real worry under the discarded Reserves model, now moot). The thing to watch
   instead is whether going *last* becomes too strong: the crew that acts after everyone has spent
   out / laid low can raid ducks cheaply. Same direction as the existing lay-low race; watch that it
   doesn't tip into "nobody wants to act first."
2. **Mob-balance sim re-run.** Every Guide combat number assumed the ambush always fires. It's now a
   *decision*, so the balance pass wants the defender's fire/hold choice inside the model.

### Files changed
`Rulebook v0.9.html` (Ambush block, Open Fire Heat, worked example, Blood-on-the-Pavement →
"Guns Draw Heat", Sicilian Hit, Plunder-on-Ambush) · `Kingpin's Guide v0.9.html` (choice bars,
asymmetry note, odds-table Heat column → "Heat on the Block" = 2, Principles 1 & 3, Occupier's
Playbook table incl. new sitting-duck row, Part IV "What the Law Hears" + "Defending is free"
rewrite, methodology disclaimer) · `Playbooks v0.9.html` (Sicilian Hit) · `Combat Simulator
v0.9.html` (Heat model: invader heat on fire + occupier ambush heat, "Heat on the Block" readout,
explainer, kit notes).

**Not updated: the `mk-online` bundle.** Its rules are compiled into the minified `dist` JS and the
source lives outside this repo — the online game will be out of sync on combat Heat until that source
is rebuilt. Tracked in `mk-online-handoff.md`.

---

## REVISED (2026-07-31): one marker, "first to fire" — the two-marker rule is dead

**Supersedes the two-marker / firing-order / overflow rules above.** Nick killed them, correctly:
a firefight lays *two* markers, and on a Track already at 4 that needs a sixth slot the board
physically does not have. "It briefly becomes a 6-space track" is an un-teachable exception, and no
amount of "the Raid clears it anyway" hand-waving fixes that a player is asked to place a marker
where there is no space. The root cause was **two markers per firefight**; the fix is to go back to
**one**.

**The rule now — First Shot Draws Heat.** A firefight adds exactly **one** Heat marker, and it
belongs to **whoever fired first**: the Occupier if they **Ambush**, otherwise the Invader on his
first **Open Fire**. One marker, however many volleys; its owner is the one the Raid chases. A
firefight is now an ordinary single-marker loud Play, so it can never overflow and needs no
exception. (Ambush still costs 1 from the Ledger; that spent marker *is* the Heat marker when you
ambush. Spent-out or Laid-Low still can't Ambush.)

Nick picked this ("first to fire") over the two alternatives: **#1 ambush costs but draws no Heat**
(keeps ambush strong and the invader as the blamed party, but a loud gun-ambush the law can't hear
is un-thematic and low-tension), and **#3 first to *kill*** (reintroduces the whiff problem — a
blank-rolling Ambush draws nothing — and forces adjudicating kills inside a simultaneous volley).
"First to fire" is unambiguous and needs no kill-tracking.

**What it changes, and it's a real shift in feel:**
- **Ambush now draws the Heat onto the ambusher** and makes them the raid target. This is the
  "devalues ambush" cost Nick named, and it's the point: Hold Fire finally competes, because holding
  fire shoves the Heat onto the invader when *he* shoots first.
- **Raiding an ambushing defender is heat-free for the invader** — the defender fired first and took
  the marker. The Guide's odds table now shows "Invader Heat: none" against a Secured (ambushing)
  block. Attacking an ambush costs you dice and bodies, not the law's attention.
- **The Guide's Rat/decoy strategy was reworked** from "the law hunts whoever fired the *last* loud
  shot / the invader who took turf" to "**whoever fired first**." The bait play is now explicit:
  **Hold Fire** (don't Ambush) so the invader shoots first, takes the Heat, and can be Ratted;
  ambushing would put the freshest marker on *you*. Reinforced in "the liquor defense" and the Rat
  section.
- **Figures unchanged.** Take-rate, losses and the +31 spent-out swing are combat-outcome numbers,
  untouched by the Heat rule; only markers-per-fight drops from 2 to 1. Simulator remodelled to
  one marker to the first shooter.

**Deleted:** the "Guns Draw Heat / both sides / firing order / Ambush first, Open Fire last" placement
rule and the Police-Raids overflow note. Files touched: Rulebook (Ambush, Open Fire, First-Shot rule,
worked example, Hit), Kingpin's Guide (choice bars, asymmetry note, odds table, Principles 1 & 3,
Playbook rows, Part IV table + prose, Rat, liquor-defense, methodology), Playbooks (Hit), Combat
Simulator. mk-online bundle still out of sync (compiled source outside the repo).

## 2026-08-01 — Ambush-rework sync audit: Playbook cards caught two rules behind

A review pass over the Ambush/Heat rework found the **Playbooks combat quick-reference cards**
(all four card backs) were never updated by either combat commit — they still showed the rules
from two revisions ago:

- **Ambush: Cost 0, no Heat** → now **Cost 1** with the fire icon, "Firing first, the fight's
  Heat is yours. Spent out or Laid Low? No Ambush."
- **Safehouse (Occ.): +2** → **+1** (the `153b77a` stacking rework never reached the cards).
- **Open Fire: "Invader takes Heat for any kills this fight (once, not per kill)"** — the
  kill-attribution rule deleted in `f76bef2` → now the first-shot rule: "Only the fight's first
  shot draws Heat: yours if the Occupier Held Fire, already his if he Ambushed."
- Sicilian **Hit** heat note tightened to "Heat as per Open Fire: only if it's the fight's
  first shot."

**Past-language sweep** (rules text must read as law, not as a diff): Rulebook Plunder-on-Ambush
"the Ambush's *new* price" → "the Ambush's price"; Guide Part IV "Guns are never silent *now*"
→ "Guns are never silent". (Guide lines like "Rise no longer rebuilds the house" are deliberate
design-history voice in strategy prose and were left.)

**Guide: the duck analysis is now written down, both sides of it.** New Occupier's-Playbook
subsection **"The Duck Window: Timing the Lay Low"** capturing Nick's read, which matches the
watch-items in the BUILT entry:

1. **Small-crew Fold dominance:** one die's Ambush averages under a kill whatever the bonuses, a
   fat bill at 1 marker + the fight's Heat — the Ambush row now says the 30–50-point swing rides
   on real muscle, and a 1–2-body crew should Fold unless the block is a crown.
2. **The window is timing arithmetic, not a panic:** a raid needs Move + a marker per volley, and
   a duck still returns fire with Safehouse/Boss intact — a rival on one marker can't touch a
   defended block, two buy one volley. Laying low a Play or two early behind garrisons risks
   almost nothing; laying low at noon on full rival Ledgers is what the ~30-point discount prices.
3. **The real predator is the Rum re-arm:** Kickbacks hand +3 Plays at dusk after rivals are laid
   low (and a laid-low crew can't even be Puppeteered a marker); he wears Greed-Tax + first-shot
   Heat but raids ducks with markers nobody budgeted for. "Count his barrels, not his markers."

Files: Playbooks (4 card backs), Rulebook (1 line), Kingpin's Guide (Ambush row, duck row
cross-ref, Duck Window section, Part IV line). Combat Simulator checked — already correct.
mk-online bundle still out of sync (compiled source outside the repo).

## 2026-08-01 — Plunder-on-Ambush: cost yes, Heat no (Nick's ruling)

The BUILT entry left Plunder-on-Ambush **free and silent** as the one exception to the Ambush's
price, with an open question flagged: should the Irish face the duck too? Nick ruled: **the cost
exception goes, the Heat exception stays.**

- **Cost 1 from the Ledger, like any Ambush.** A spent-out or Laid-Low Irish crew can't rob the
  crossing any more than anyone else can shoot it — the duck is universal now, no silent Irish
  privilege at the Standoff.
- **Still no Heat.** Plunder's "never generates Heat" identity is untouched, and the reasoning is
  thematic and mechanical at once: nobody *fired*. Which produces a real wrinkle worth the text it
  costs: a Plunder-Ambush does **not** claim the fight's first shot, so the one Heat marker is
  still on the table — it lands on the Invader the moment he Opens Fire. The Irish are the only
  crew that can hurt an invader at the crossing *and* leave him holding the Heat if he presses on.

Files: Rulebook (Plunder cell: cost + the first-shot-still-open clause), Playbooks (Irish card:
"May replace your Ambush at the crossing: same cost, still silent"), Kingpin's Guide (Part IV
"Plunder is free" → "Plunder is silent, Ambush included"). Resolution note added under the BUILT
entry's plunder paragraph. Combat Simulator unaffected (it models invader-side Plunder only).

## 2026-08-01 — Spent out vs Laid Low: the timing is now load-bearing, so it's now written down

Nick's edge case: an Ambush fired on your **last** Ledger marker. Does the defender Lay Low on the
spot, mid-firefight (thematically odd, and a race if the invader also runs dry)?

**Resolution: the existing rules already handle it — nothing changed mechanically.** A firefight
resolves entirely inside the invader's Play; Lay Low is a *turn*, taken when the rotation reaches
you and you have no Play left to make, never a reflex triggered at 0 Influence. The broke defender
fights the battle out (return fire is free), then steps off when their seat comes up. If both crews
leave a fight broke, tomorrow's tokens fall in today's turn order — deterministic, no mid-fight
token claims.

**Why it needs text now when it never did before:** pre-rework, "0 Influence" and "Laid Low" were
indistinguishable states — neither could do anything, so *when* you formally stepped off never
mattered inside a round. The Ambush cost (and the Puppeteer boundary) split them: a spent-out crew
still takes its turn and can still accept a loan; a Laid-Low crew is off the street past even that.
The designer himself misread it, which is the test for a teaching gap. Added:

- **Rulebook**, Lay Low turn-exit box: "Laying Low is a turn, not a reflex" note (empty Ledger
  fights on; step off on your turn; broke-both-sides → tokens in turn order).
- **Guide**, Duck Window: the two-duck-states distinction folded into the timing paragraph.

**Accepted timing consequence, on the record:** a full 5-marker Ledger day runs ~6 rotations, and
the last lap is just players taking a turn to step off. That lap is not dead air by design: it is
where the token race resolves (Lay Low order = tomorrow's initiative), where Odd Jobs pay out, and
it is the tail of the Duck Window — the gap between a crew's last Play and its Lay Low is exactly
when it can be raided as a duck. Shortening it (e.g. auto-lay-low at 0) would delete the window and
the race; not worth it.

**Watch-item (RAW ambiguity, nothing built):** can a Puppeteer loan fund an *Ambush*? Lent markers
are spendable "on their next Play, or right now if they're Pinned" — a defender at the Standoff is
neither. Strict RAW says no ambush-by-loan; if table play wants the drama of a rival bankrolling
your defence mid-raid, that line needs widening. Flagged, undecided.

## 2026-08-01 — Lay Low is a Play (Cost 0), and a loan can fire the Ambush

Two rulings from Nick, finishing the spent-out/Laid-Low thread:

**1. Lay Low is now an explicit Play, the only one that costs 0.** The teaching problem was *when*
you lay low; the fix is structural, not another note: every turn demands a Play, Lay Low is the one
free Play, therefore it necessarily happens *on your turn* — the ambiguity can't arise. Added to all
four Playbook cards as a new CLOSING TIME section (Cost 0: Odd Jobs $100/marker, clear Ledger to
Reserves, swap your Turn Token for the lowest in tomorrow's set, then no Plays and no Puppeteer
loans until tomorrow — Nick's wording, plus the Odd Jobs step his draft omitted). Rulebook turn box
reframed to match: "Make a Play... or make the one Play that costs nothing", exit box retitled
"Lay Low (Cost: 0): the Play that ends your Day", and yesterday's "a turn, not a reflex" note is now
"a Play, not a reflex".

**2. The Puppeteer-Ambush watch-item is resolved: YES, a loan can fund an Ambush.** Nick's call,
for consistency and teaching — lent markers "spend as their own" shouldn't carry a hidden combat
exception. Rulebook Cooperation now lists the Standoff alongside the Pin as a spend-now moment, and
the Risk line names the Ambush explicitly, because the consequence has teeth: the Ambush marker IS
the fight's Heat marker, so a lender who bankrolls a defence locks **their own** marker to the
Track and becomes the name the law reads. Guide updated in two places: the proxy-war bullet prices
the new play ("bankrolling a defence buys the law's attention at the door"), and the Duck Window
now warns raiders to **count the duck's friends' Ledgers too** — a spent-out crew with a willing
partner on the street has teeth on credit; only Laid Low is past lending.

Strategic net: the duck window narrows politically (a duck with allies isn't fully a duck), but the
lender pays in Heat-ownership, which keeps the mercy priced. The Playbook Puppeteer card note now
reads "even mid-fight: another volley, or the Ambush itself."

Files: Playbooks (4× CLOSING TIME section, 4× Puppeteer note), Rulebook (turn box ×3 spots,
Cooperation ×2), Kingpin's Guide (Duck Window, proxy-war bullet), this changelog.
