# The Jobs System — Handoff (v0.8, 2026-07-17)

Everything needed to resume cold. Written for whoever picks this up next, human or agent.

**Status:** design settled. **Rulebook v0.8 print-verified: 23pp A4, no blanks.**
**Latest change (2026-07-18): the Market is now STATIC — the conveyor and *Yesterday's News* are
deleted, setup is "shuffle all 32, deal P+1", and passing at The Offers is explicit. Read §2b before
touching any of it.**
**The deck is COMPLETE: 32 of 32 cards at 12 / 12 / 8, print-verified 16pp A4, no blanks.**
All three overlap clusters are closed and the hard rule is now machine-checked (see §3).

**Live files:** `Rulebook v0.8.html` · `Jobs Cards v0.8.html` (deck) ·
`Turn Structure and Ledger v0.7 Reskin.html` · `Playbooks v0.7 Reskin.html` ·
`Brew Engine Strategy v0.8.html` + `Brew Simulator v0.8.html`.
`Rulebook v0.7.html` is the superseded Contract edition — expect it to disagree with everything here.

> This doc is flat and current. There is no addendum; if it's written here, it's true as of v0.8.

---

## 1. The system in one line

Deeds and Titles pay you for what you **hold**; Jobs pay you for what you **do**. Jobs are public,
action-triggered, drafted face-up from a market of Player Count + 1, and complete the moment you
perform the trigger. No deadlines, no declarations, no hand.

**The load-bearing argument** (do not re-litigate): Contracts were board-state snapshots on a
countdown — the same verb Deeds and Titles already paid for, at a third price. Jobs make the Respect
layer *doing*. Everything else is downstream. This is a restoration: the v10 deck
(`Archive/Moonshine Kingdom v10/Job Cards.html`) was already action-triggered.

---

## 2. Decided — current as of v0.8

| Rule | Decision |
|---|---|
| A Job prints | A **Stake** (Influence locked from Reserves at claim, returned on completion) and a **Respect** (1, 3 or 5). That's all. |
| Tier names | **Gig / Racket / Score are RETIRED** as game terms (v0.8). Cards carry no tier word. Sort by the Respect shield. |
| Claiming | **The Offers**, a step inside Shadows → Grease the Wheels. One Job per Day, no fee — the stake *is* the cost. |
| Offers order | **Reverse Turn Order.** Last boss off the street last night picks first. ("First to the mash, last to the handshake.") |
| The three options | **Take a Job**, **Walk Away**, or **nothing at all** — one of the three, never two. Passing is legal and the rulebook now says so outright. |
| No Boss, no business | A crew with no Boss on the board skips The Offers entirely. |
| Holding Jobs | No hand limit. Run as many at once as your Reserves can stake. |
| Market | Player Count + 1, face-up. **Static: no order, no ends, no fresh/stale.** |
| Churn | **NONE.** The Market moves only when a player moves it — a Job leaves, deal a fresh card into the gap. Nothing ages out. **See §2b before adding any churn back.** |
| Discard | A real discard pile, reshuffled if the deck runs dry. Only Walk Aways reach it. Completed Jobs leave **permanently** (Respect pile) — the deck is consumable. |
| Abandoning | **Walk Away**, and it costs your entire Offer for the Day (a7d41d8 closed the free-discard loophole). Card → discard, markers home. |
| Resolution | **The Play is the unit.** A Job is a deed, not a board position. It counts even if undone before the Play ended. |
| Deck size | **12 / 12 / 8** (1s / 3s / 5s) = **32 cards printed**. |
| Setup | **Set the 5s aside, shuffle the rest, deal Player Count + 1 face-up, then shuffle the 5s back into the deck.** No per-player deck build. The opening Market is **1s and 3s only** — see the Day 1 Reserves crunch below. |

### The 3:3:2 per-player build is GONE — and why it was safe to drop
The old setup counted **3 ones / 3 threes / 2 fives per player** and boxed the rest, defended here as
*"don't simplify this."* Read what that ratio was actually protecting: the per-player supply of small
Jobs being identical at 2, 3 and 4 players, *"what keeps the escalation arc firing at the same point
in the game regardless of table size."* It existed to make the 1s **run dry on schedule** — a
mechanism the static Market deliberately softens (see the arc, below). It was defending a feature
that no longer earns its keep, and it was the fiddliest step in setup.

Setup is now **shuffle all 32, deal Player Count + 1.** Three consequences:

- **The 1s-only seed is gone — but a 1s-AND-3s seed replaced it, for a different reason.** What made
  the old seed bad was that it removed *choice*: deal five 1s and picking first is worth nothing, so
  the reverse-order Offers stop compensating the last seat on the one Day that compensation matters
  most. A **1s + 3s** opening keeps that choice (two tiers, two stakes) while fixing the affordability
  problem below. The cost is that the deterrent layer starts dark, but only briefly — the 5s are
  **8 of the remaining 27**, and at 4p up to four cards are claimed per Offers, so bounties surface
  within a Day or two of drafting actually starting.
- **Replayability survives.** The old "at 2p you use 16 of 32, so half the deck differs" argument is
  replaced by shuffle variance — a random 13-of-32 varies *more* than a random 13-of-a-preboxed-16.
- **12/12/8 is no longer pinned to 3:3:2.** Divisibility by player count was the only reason for that
  ratio. Tier counts are now a free tuning knob in `tools/gen_deck.py`, which is what makes patch 2
  below cheap.

### What a big stake actually costs — and the Day 1 setup artifact (fixed)
**A big stake costs actions, not access.** Stakes are paid from **Reserves** and The Offers run
*before* Fund the Ledger ("stake first, fund second"). Every normal morning the Reckoning has already
cleared your Ledger back to Reserves, so all 6 markers are in Reserves at Offers time: stake 3 for a
5-Respect Job and you fund the day with 3 instead of 5. **Half your actions, which is the intended
price of a headline job.** Nothing is ever unclaimable for want of Reserves.

**Day 1 used to be an exception, and it was a setup artifact, not a design intent.** Setup read *"slot
5 onto your Ledger, drop the last 1 into your Reserves"*, which left 1 marker in Reserves at the Day 1
Offers and capped the first morning's stake at 1 by the literal text. Unlike the **Mash die** — which
setup genuinely must pre-seed, because *Ferment Tomorrow's Mash* is step 4 of Shadows and so never
fires before Day 1's brew — the Ledger pre-load duplicated a step that Day 1 already runs. **Fixed
2026-07-18:** setup hands all 6 markers to **Reserves** and lets Day 1's own Fund the Ledger step do
its work. Identical end state on a no-stake opening (5 on the Ledger, 1 spare); the difference is that
Day 1 staking now behaves like every other day, which is what the economy always assumed.

**Why the opening Market is still restricted to 1s and 3s.** Not because a 5 is unclaimable — it is
claimable from Day 1. Because a 5 costs **half your first day's actions** at the exact moment everyone
is poorest, *and a static Market has no churn to clear it*. A 5 dealt at setup would squat a slot until
someone is both rich enough and willing, which may be many Days. One setup step removes the dead zone.

### The arc (still a feature, now steeper — this is the thing to watch)
Completed Jobs leave permanently, so the 1s still bleed out one-way and the market still escalates.
**This is why Public Enemy No. 1 was cut** — the deck does its anti-farming job structurally.

**Static makes the slope steeper.** Cards leave the Market only by being claimed, and 1s are the
preferentially-claimed tier, so they cycle out while unclaimed 3s and 5s occupy the slots. Retaining
12 ones instead of 7 (no 1s-only seed) softens the slope; it does not reverse it. The arc is still
**anti-catch-up**: when the cheap Respect is gone, a trailing player has no ladder.

**The patch ladder, cheapest first. Do not skip to the bottom.**
1. **Ship as written and measure** (§8, metric 1).
2. **If the 1s starve:** raise the 1s count in `tools/gen_deck.py` and reprint. One knob, no new
   rules, no new table footprint. Possible *only because* the per-player build was dropped.
3. **Only if 1 and 2 both fail:** the three-row Splendor market (§2b). It works, but it is structural
   and it costs Day-1 reading and table space.

---

## 2b. Why the Market is STATIC — read before adding churn back

**The conveyor is gone.** Cards no longer age out. The Market changes only when a player changes it:
take a Job or walk away from one, and a fresh card fills the gap. *Yesterday's News* is deleted from
Shadows, and "fresh end / stale end" is deleted game-wide.

**The argument, so it isn't re-litigated:**

1. **The ordering was pure upkeep.** Fresh end / stale end / close the gap meant a physical slide
   every time a card left, on a table already carrying the Heat Track, four Pressure Strips, the
   Ledger and the mash dice. All that machinery existed only to identify the oldest card.
2. **Churn was defusing the deck's own best mechanism.** §4's naming rule exists because *"a named Job
   sitting face-up moves four Bosses whether or not it's taken."* Under the conveyor that threat
   expired in five Days, so the correct response to a bounty on your head was **wait it out**. Static,
   the Toll Booth Trap is a standing bounty you have to actually answer. The churn was quietly
   cancelling the argument that justified the naming rule.
3. **It converts random denial into social denial.** The card you were quietly building toward used to
   vanish through nobody's decision — a dice roll on your plan. Now the only thing that takes it is a
   rival who read you. Same uncertainty, but it's a read instead of a timer, and the tell (claim early
   and telegraph your intent, or build quiet and risk the snipe) becomes a real decision.
4. **A static Market self-regulates its own churn.** A Market full of claimable cards empties fast —
   up to four Takes per Offers at 4p. A Market nobody can act on freezes. So churn rate is
   automatically proportional to how well the offers fit the board, and **silt is a signal, not a
   fault**: it means nobody's position matches what's on the street, which is exactly the pivot
   pressure the design wants. This is why §8's old "does the market silt?" metric is retired.

**Rejected alternatives, each with the reason it died:**

- *Refresh the whole Market on each Police Raid.* **Rejected.** Rat triggers a Raid on demand, so this
  hands every player a market-nuke aimed at whatever a rival is visibly building toward — and Jobs are
  public and named precisely to be visible. See §8 for the general form of this test.
- *A rotating "stale" marker instead of a sliding row.* **Rejected.** The fiddle being removed is
  **having a per-card timer to track at all**, not the sliding. A token hides the timer worse than a
  row position displays it, and "which slot do I empty?" is AP, not depth.
- *Splendor-style three rows — 1s / 3s / 5s, each its own pile, (P−1) wide.* **Genuinely good, and it
  is patch 3** if the arc bites. It guarantees cheap Respect forever and keeps 5s permanently visible.
  It died on cost, not merit: 3×3 at 4p is **nine prose triggers face-up** plus three draw piles and
  three discards — ~15 card positions beside an already-crowded board, and a heavy Day-1 read. Jobs
  cards are prose, not Splendor's glanceable icons. Don't pay this before the problem is measured.
- *Stacking the deck 1s → 3s → 5s.* **Arithmetically broken.** Cards now leave only by being claimed
  (~12–20 a game), so the 5s at deck positions 25–32 are unreachable. That doesn't just cost the 5s,
  it deletes the entire §6b bounty set and the borough-fairness structure built on it.
- *Bottom-biasing the 5s in the shuffle.* Same reachability problem in weaker form, **plus it
  optimises backwards**: escalation wants 5s late, the deterrent thesis wants them **early**, and
  under a static Market the deterrent argument is much the stronger of the two.

**Knock-on:** Vipers' **Whispers** (peek the deck top, claim it face-down instead of a Market card) is
mildly **buffed** — under a static Market it is the only route to a card that isn't already public.
Worth watching alongside §8.5, which already rated it strong.

---

## 3. The overlap rule — READ BEFORE WRITING A CARD

**Never two 5s on one Play.** A 5 plus small change is fine. Overlap risk scales with the square of
the stack, which is the real reason the Score pool is small.

**All three clusters are CLOSED (v0.8, deck build).** Max stack in the deck is now **9**, down from
15 / 13 / 11. **Don't undo the guards below** — each is load-bearing and each is commented in the
generator.

**The audit is automated. Run it before and after touching any card:**
`tools/overlap_audit.py` models every Job as a predicate over a real district and enumerates
every Play (verb × district × magnitude × board state), then asserts the hard rule. It encodes the
board's physical constraints (Defenseless ⊻ Hostile, the Williamsburg Bridge only lands at its two
ends, Staten Docks are Pressure 1 and 3, Staten's Deed is boxed). **Hand-analysis is not enough —
the solver caught two live violations that four rounds of human reading missed.**

How each cluster was closed:

1. **Queens Speakeasy Boss-kill (was 15).** Toll Booth Trap is now the deck's **only** "kill a Boss".
   `The Butcher's Ledger` moved to **Brooklyn** (Murder, Inc. ran out of Brownsville). `The Irish
   Goodbye` was re-themed off the Boss-kill to a **3**: *kill 3+ in a Speakeasy and **do not take
   Control***. That last clause is the guard — it makes the card structurally unable to co-fire with
   **any** Seize card, and it is exactly what the art shows (he does it and walks out).
2. **One Extort (was 13). `Five Families` is now the deck's only Extort Job**, so the cluster cannot
   form — a card can't overlap itself. **The rule Nick set:** an Extort Job earns its place only when
   it measures something **no Deed or Title already measures**. Five Families measures *spread*
   (a District in all five Boroughs); nothing else does, and Extort costs 2 Influence and always draws
   Heat, so it isn't the passive Deed. `Empire State` / `King of Queens` / `Big Squeeze` / `Black Hand`
   were all "hold N Districts in one Borough" — **that is the Borough Deed, re-paid**, i.e. verbatim
   the redundancy argument that killed Contracts. **CUT.** (Note the trap: demoting them does *not*
   help — a cheaper card lowers the stake and lets you fit *more* of them under the cap.)
3. **Seize cluster (was 11).** The engine was never `Over the Top` — it was **`The Eviction` +
   `The Copper Heist` riding along on any Seize**. Copper Heist now reads *"and **no Safehouse**"*,
   which The Eviction *requires*, so the two can **never** ride the same Seize. `Over the Top` also
   gained **"a Bronx District"**, which makes the **four Open Fire 5s borough-disjoint** — Toll Booth
   Trap (Q) · Butcher's Ledger (Bk) · Over the Top (Bx) · Bloody Sunday (M). **That disjointness is
   what makes "never two 5s" structurally impossible rather than merely unobserved, and it is the
   same set as the bounty set in §6b — one constraint doing two jobs. Don't collapse it.**
4. **A pre-existing violation the handoff never listed:** `Toll Booth Trap` + `Over the Top` were both
   5s firing on one Open Fire (storm a Queens district held by 5+ including the Boss = **10**). Only
   the solver found it. Same for `Butcher's Ledger` in Brooklyn. Closed by the disjointness above.

5. **The Safehouse free rider (a guaranteed 8).** `Bloody Sunday`'s trigger was a strict *subset* of
   `The Eviction`'s, so completing it by Seize collected **8 every single time** — not a rare
   coincidence like every other stack, and the same act sold at two prices. **Fixed with the
   rulebook's own either/or**, no invented guard: *"a rival Safehouse in the District is **destroyed**,
   **unless you take it over instead**."* Destroy XOR take over. So `The Eviction` = *take it over*,
   `Bloody Sunday` = *destroy it*, and they can never co-fire. **Bloody Sunday now stacks with
   NOTHING — a clean 5.**
   The wording matters: The Eviction is phrased by **board consequence**, not intention —
   *"relocating yours into it"* — because "take over" is a state of mind players will argue about,
   whereas *where your Safehouse ends up* is a fact on the table. **Prefer visible, self-checking
   consequences to intentions.** (The relocation is also a real cost — you abandon your old base —
   which is what holds the card at 3.)

**Root cause in every case: over-broad qualifiers.** "in a Speakeasy" is 12 venues; "all five
Boroughs" is any big Extort; "Pressure 5+ Still" is 10 districts. Name *specific* things, and prefer
a guard that makes two cards **mutually exclusive** (X requires it, Y forbids it) over one that
merely makes them rarer. **Best of all is a mutual exclusion the RULES already enforce** (destroy vs
take over) — nothing to remember, nothing to drift.

**Watch for the free rider.** Not all stacks are equal: a *conditional* stack needs a rare board
coincidence, a *guaranteed* one fires every time because card A's trigger is a subset of card B's.
Guaranteed stacks are the bug. Five Families (cluster 2) and The Eviction (above) were both this.

---

## 4. The two tests every card must pass

1. **Contestable:** does it make me build something rivals can see and fight — or pay me for the line
   I was already playing? *"Seize a District containing a rival Safehouse"* passes.
   *"Earn $600 from a single Extort"* fails: that's a Title in disguise wearing a verb.
2. **Respectable:** Respect is *standing*. Would you brag about it?

Test 2 is why **Bribe, Beg and Rat cannot carry Jobs** — a rat cannot gain Respect; the Rat Card
exists to say you're dishonoured. Usable verbs: **Move, Unload, Trade, Extort, Secure, Recruit**
(+ **Rise**, which works: coming back from a decapitation is respectable).

### ⚠ "OPEN FIRE" IS NOT A PLAY — a FIREFIGHT is one Play (rulebook tightened, v0.8)
This list used to include "Open Fire" and it was **wrong**, which put a dead card in the deck.
Open Fire is a **repeatable round** — one simultaneous volley — inside a Pin. The combat table says so:
*"**Repeat:** If both sides stand, remain Pinned. Spend another Influence to Open Fire again."*
It is not on the Playbooks' Plays list.

So *"Kill 5+ Mobsters **with a single Open Fire Play**"* read literally as **five hits from one
volley**. The **Muscle Ratio caps combat dice at 5** (Mobsters ÷ 2, capped), so that needs 9+ Mobsters
massed *and* all five dice hitting — at base Threat, **(1/3)⁵ ≈ 0.4%**. `The Butcher's Ledger` was
uncompletable and `The Pier Six Brawl` was luck-on-a-1-Respect-card. **Nick caught this by reading the
card literally; the solver could not — it models triggers, not dice. Read your cards out loud.**

**The fix went in the RULEBOOK, not the cards.** The intent was already there but stated only once, by
accident, inside the Fold branch ("*The Invaders are not Pinned; their Play ends*"). §3 Pinned now
opens with it outright:
> **A firefight is one Play.** Moving in starts it, and it is not over until the Pin is resolved —
> however many rounds of fire that takes. Each round costs its own Influence, but the whole bloody
> business counts as the **single Play** that walked in the door.

(There is precedent for a Play costing more than 1 Influence: *"Power Plays cost 2 Influence, but
still count as a single Play in the turn cycle."*)

**So combat Jobs use the deck's OWN unit — "in a single Play"** — and need no second term. "Firefight"
was tried and dropped: it reads as though it could mean one round, and a second unit alongside "Play"
re-creates the very ambiguity we were removing. All three kill-count Jobs now say **"in a single
Play"**: The Pier Six Brawl · The Irish Goodbye · The Butcher's Ledger.
**Rulebook re-verified after the edit: 23pp, no blanks.**

---|---|---|---|---|
| Queens | The Toll Booth Trap | kill the **head** | Sicilian Syndicate | **Hit** — the Boss takes the first hit |
| Manhattan | Bloody Sunday | burn the **base** | Harlem Knights | **Torch** — burn a rival Safehouse |
| Brooklyn | The Butcher's Ledger | the **body count** | Hell's Kitchen Irish | **Firepower** — +1 die, Open Fire only |
| Bronx | Over the Top | take the **ground** | East Side Vipers | **Stealth** — no Ambush, and they cannot Fold |

Three consequences: **(1)** four distinct acts, so no two bounties are the same card twice; **(2)** every
mob has one marquee 5 its trait was made for; **(3)** all four MUST stay outcome-worded or each
excludes its own mob. **Watch at playtest:** Torch is a real discount (no garrison to beat), which
reads as a deliberate buff to the Knights — the sim's weakest mob — but it is unpriced.
- **Difficulty is the master knob**, not the marker cost. Stake = markers × Days held, so harder Jobs
  sit staked longer.
- **Name specific locations.** A named Job is a **deterrent before anyone claims it** — "Kill a rival
  Boss in Queens" sitting face-up moves four Bosses whether or not it's taken. A secret card could
  never do that. This is an argument *for* the whole open-market pivot.
- **Theme first** — name + art + flavour, then the objective. Nick's call and it's the right way round.
- **THE NAMING RULE: a Job's name must carry an EVENT, never a bare board location.** If the name
  could be printed on the map, it's wrong. This falls straight out of the design thesis (a Job is an
  event, not a board state) and the v0.7 deck already knew it: *Coney Island **Heist***, *The
  Dutchman's **Deal***, *Cross-Town **Switch***, *Gentleman Jimmy's **Shindig***. Naming the real
  target is GOOD (§4 wants the deterrent) — naming a district the card does NOT target is the sin.
  `Coney Island` pointed at a Speakeasy while asking for a Dock; `Five Points Hustle` named the one
  Ward it excluded. **A misleading name is usually a symptom of a broken objective — check that first.**
- **Method:** mine the old decks for name + art (`Contract Cards v0.7.html` has ~40;
  `Archive/` has more), write a fresh event objective, place where the borough quota is short.
  **`Art/Jobs/_contact sheet.png` shows all 58 images — LOOK AT IT, don't guess from filenames**
  (`Gatsby.png` is a car chase, not a party; it cost three wrong assignments).

---

## 5. Board facts the deck is written against

### The boiler census (verified from the Ledger — this constrains everything)
| Boiler | Count | Districts |
|---|---|---|
| **7** | **4** | Sugar Hill, Morris Park, Richmond Hill, Williamsburg — **all four are High Society, police-locked at setup, one per mainland Borough** |
| 4 | 3 | Corona, Sheepshead Bay, Tottenville |
| 6 | 3 | Flushing, Red Hook, Stapleton |
| 2, 3, 5, 8, 9, 10, 11 | 2 each | |
| 12 | 1 | East Harlem |

**Only 7 can be stacked four deep. Only 4, 6 and 7 reach three.** Everything else is a pair.
`Pressure = 6 − |Still − 7|` (written down nowhere but the ledger's values; verified across all 25).

### Generic targets that are self-balancing (use freely, no quota)
Every mainland borough has **1 Ward, 1 High Society, 2 Speakeasies, 2 Pressure-5+ Stills**.

### NOT balanced
- **Docks:** Manhattan 2, Queens 2, Bronx 1, Brooklyn 1, Staten 2.
- **Districts:** M 6, Q 6, Bx 5, Bk 5, Staten 3. Every mainland borough has one under a Police Squad
  and squad turf can't be Controlled → real availability **M5, Q5, Bx4, Bk4**.
- **Extort quartet** (scale the number, never copy it): M $800+, Q $800+, Bx $600+, Bk $600+ (4/5ths
  of available districts × $200).

### Other facts
- **All Docks connect across water as one Move Play.** This makes **Staten Island the best-connected
  borough for barrels** — and nobody goes there. Westerleigh is Still 2 / Pressure 1, so you must
  *haul* moonshine there before smuggling it out. That's what *The Smuggler's Run* is built on.
- **Staten Island is nobody's Home Turf**, so naming it is always neutral. Its Deed is boxed at setup.
- **Bridges are unnamed on the board.** Nick is researching real names. The only documented crossing is
  Williamsburg ↔ Five Points (the Williamsburg Bridge), which *The Milk Run* uses.

### The spread rule
Generic Ward / High Society / Speakeasy / Pressure-Still targets are self-balancing — use freely.
**Named** mainland locations get a hard quota of **four per borough**. Docks and Extort slices are
uneven by construction.

---

## 6. Deck state — COMPLETE, 32 of 32

**12 / 12 / 8, print-verified 16pp A4, no blanks.** No drafts remain; the `.gallery--draft` CSS is
kept (unused) because the draft gallery is a useful tool for the next round of argument.

**The deck is generated, not hand-edited.** `tools/gen_deck.py` holds the card table and rebuilds
the `<body>` from it, which is what guarantees the exactly-4-cards-per-block rule (§7). Edit the table
and re-run; don't hand-edit the HTML or the blocking will drift.

**It is now guarded (2026-07-18), because it rewrites the entire `<body>` and would silently destroy
any hand polish.** It refuses to write unless the file already matches (a no-op) or you pass
`--force`. **Run it with no arguments as a free integrity check** — "no change" means the printed deck
and the card table still agree, which is worth doing before any print run. It was kept rather than
deleted for two reasons: the 4-per-block rule is what keeps duplex front/back pairing correct, so
hand-editing the HTML is *more* dangerous than the generator ever was; and the table carries the
design reasoning for individual cards (the Eviction guard, the period-slang notes) that exists
nowhere else. `overlap_audit.py` and `fairness_audit.py` parse the built HTML and do **not** import
it, so they are unaffected either way.

**Verb spread** (the "Open Fire is over-represented" flag is resolved):
Move 7 · Open Fire 7 · Unload 6 · Secure 3 · Trade 3 · Recruit 2 · Rise 2 · Extort 1 · Rat 1.

**Live flags:**
- **`Land-Connected` (on `The Beachhead`) is defined NOWHERE in the rulebook.** The rulebook says
  Districts are Connected by "Land & Bridges", and separately that all Docks connect across water.
  **A rulebook wording gap, not a card bug — Nick's call.**
- ~~`The Insurance Job` uses a **"Raid" trigger**~~ **RESOLVED 2026-07-19.** "Raid" was never a Play
  a player could make, so the card had no checkpoint (*The Play Is the Unit* only checks Jobs when a
  **Play** ends) and a *rival* could trigger the Condemn. It now names the **Rat** Play, which is real,
  and its objective moved off "Condemn your own Safehouse" (Safehouse-only Recruit made that
  self-crippling) to **"Padlock a Pressure 2 or lower Still you Control"**. See `v0-8-changes.md`.
  **General lesson: check every card verb against the Playbooks' actual Play list.**
- **`Bloody Sunday`** is the only card in the deck with **red** in it (all other art is sepia/gold), and
  the name is a loaded real-world term (Dublin 1920, Derry 1972). Both deliberate-ish; flagged.
- **20 of 58 images unused.**

## 6b. Board fairness — the starting-position exploit (`tools/fairness_audit.py`)

**Nick's banked principle** (memory: contract-deck-design): *a slight district-TYPE bias is fine,
BOROUGH bias is not* — it lets a player who starts where the deck pays win off turf they already
hold, and hands a deck-memoriser an edge a newcomer can't see.

Jobs are events, so this audit adds a measure the old Contract audit never needed: for each
borough-naming card, is it **friendly** (easier for whoever starts there) or a **bounty** (points
rivals at them)? **A fair deck nets ~0 per seat.** It started at Manhattan +1 / Brooklyn 0 /
Bronx −1 / Queens −1, with **nobody paid to attack Manhattan at all** — the best seat in the game.

**THE ORPHAN SPEAKEASY SET — the board was built for this; don't break it.**
Every mainland borough has **exactly one Speakeasy that is neither garrisoned at setup nor
police-locked**, and *all four sit at Pressure 5*:

| Borough | Starting Speak | Police-locked (HS) | **Orphan** | Card |
|---|---|---|---|---|
| Manhattan | East Harlem | Sugar Hill | **The Haymarket** (Tenderloin) | The Big Squeeze |
| Bronx | Belmont | Morris Park | **The Penny Whistle** (Fordham) | Hell's Highway |
| Queens | Astoria | Richmond Hill | **Paradise Alley** (Flushing) | Poison Panic |
| Brooklyn | Coney Island | Williamsburg | **Sunny's Bar** (Red Hook) | Off the Boat |

These are each borough's **friendly** card, all at 3 Respect. Matched by **one bounty per borough,
all Open Fire 5s and borough-disjoint** (which is also what guarantees "never two 5s"):
Bloody Sunday (M) · Over the Top (Bx) · Toll Booth Trap (Q) · Butcher's Ledger (Bk).

**Result: every seat reads a 3 friendly and a 5 bounty.** Weighted spread 4 → **1**; the only
residual is `The Milk Run` (1 Respect, Manhattan-friendly, since Five Points is Manhattan's home
turf), leaving Manhattan at −1 vs −2 elsewhere. Left alone: the Williamsburg Bridge is the deck's
best specific and the bridge is the only crossing the board documents.

**Coverage, all healthy now** (per district of that type): Ward 0.80 · Speakeasy 0.67 ·
Pressure-5 0.67 · Dock 0.62 · High Society 0.50. Docks were **over**-paid at 0.88 (they are already
triple-rewarded: Harbormaster + Trade is Dock-only + Jobs); Pressure-5 was **starved at 0.22** and the
orphan set fixed it for free.

**Named tally (counted from the card file, not guessed): M1 / Bk4 / Bx3 / Q1.** Quota is ≤4 per
mainland borough, so nothing is over — but the spread is **lopsided**, and this is the deck's main
open issue:
- **Brooklyn is AT the cap (4):** The Milk Run (Williamsburg Bridge), Off the Boat (Sunny's Bar),
  Coney Island, The Butcher's Ledger. **No more Brooklyn names without dropping one.**
- **Manhattan (1) and Queens (1) are badly under-named** — Manhattan's only mention is the Five Points
  end of the Williamsburg Bridge, and Queens' is the Toll Booth Trap. Both boroughs are nearly
  invisible in the deck, which wastes the deterrent effect §4 argues is the point of naming
  ("a named Job moves four Bosses whether or not it's taken").
- Staten (3) is exempt — it's nobody's home turf, so naming it is always neutral.
**If you re-art or re-theme anything, spend it on Manhattan and Queens.** Both have an unused
High Society venue with a name already in canon (The Cotton Club / The Triangle) and no card yet.

---

## 7. Build facts (save yourself the rediscovery)

- **Art wells are 57×38mm = exactly 3:2** — the native ratio of 55 of the 58 job images (1536×1024).
  Changing one number without the other silently crops the art.
- **Gallery blocks MUST be exactly 4 cards + 4 backs.** Print is a 2×2 grid with
  `page-break-after:always`; a 5th card spills to its own page and the duplex front/back pairing is
  lost. **`tools/gen_deck.py` now enforces this** — it rebuilds the body from a card table and
  refuses to emit a tier that isn't a multiple of 4. Use it rather than hand-editing.
- The 2×2 grid is **horizontally centred but top-aligned** on the sheet (`align-content:center` does
  nothing on an auto-height grid), leaving the lower third blank. Fronts and backs are top-aligned
  *identically*, so duplex registration is unaffected — it's cosmetic. Left alone deliberately:
  changing it risks the front/back alignment for no gameplay gain.
- **Print art recipe:** `filter: brightness(1.1) contrast(1.08) saturate(1.04)`. Don't darken art.
- **Icon canon:** `Gin.svg` = Speakeasy, `Crown.svg` = High Society, `Fist.svg` = Ward,
  `anchor.svg` = Dock, `fire.svg` = Heat. Tinted by the canonical filter at
  `css/moonshine-rules.css` (`--gold-tint` in `:root`). `hat.svg` is dead.
- **Respect badges:** `Art/shield1.png` / `shield3.png` / `shield5.png`, number baked into the art,
  12.5mm top-right. The element carries no text.
- **`display:flex` eats whitespace between inline children.** `.job` flexed directly turned every
  `<b>` into a flex item: "Move4+ Barrelsacross aBridge". The text must stay in a single `<span>`.
- **Source order beats specificity at equal weight.** `.gallery--draft{display:none}` placed *before*
  `.gallery{display:grid}` silently failed and the drafts printed. Print overrides go last.
- **The Reskin files are canonical and class-based — don't let inline styles creep back in.**

### Verifying print (this works; reuse it)
```bash
chrome --headless --disable-gpu --no-pdf-header-footer --virtual-time-budget=15000 \
  --print-to-pdf="<ABSOLUTE WINDOWS PATH>" "file:///<url-encoded path>"
```
Chrome **needs an absolute Windows path** for `--print-to-pdf`. Check with pypdfium2.
**Targets: Jobs deck = 16 A4 pages, no blanks (32 cards ÷ 4 = 8 blocks × 2 sheets). Rulebook = 23pp,
no blanks.** (The old 12-page target was the 16-card sample; drafts didn't print.)
For per-container overflow, drive Chrome via CDP (`--remote-debugging-port`, `PUT /json/new`, then
`Emulation.setEmulatedMedia{media:'print'}`) and measure `body > .container` heights against
**A4 = 1123px**. Every container must fit on one page or it spills and leaves a blank.
**Actually look at the rendered image** — that's what caught the Gatsby mistake, the 13% crop, and a
setup table that silently split a numbered step in half.

---

## 8. Playtest — what to measure

1. **The catch-up question, stated so it's falsifiable:** from the moment the last **1** leaves the
   Market, does a trailing player have any route to Respect that isn't holdings? If no, go to patch 2
   in §2. *(The old metric — "count face-up cards untouched for 3+ Days" — is **retired**. Under a
   static Market, silt is a signal rather than a fault: see §2b.4.)*
2. **Does the leader ever leave a marker in Reserves involuntarily?** At 10 Influence the Ledger caps
   at 5, so 5 markers have no competing use and the stake is free. If the leader never feels it, the
   ceiling/cap coincidence needs a nudge.
3. **How many Days after someone hits 10 Influence does the game end?** Consistently under four →
   Jobs have become the whole endgame and Deeds/Titles are decoration.
4. **When the 1s run out, is the trailing player stranded?** (See the arc, §2.)
5. **Vipers' Whispers** (deck-top peek + face-down claim). Nick rates it strong.
6. **Hate-drafting.** a7d41d8 made Take and Walk Away mutually exclusive, so denying one card costs
   **two** Offers — the Take on Day 1, the Walk Away on Day 2 — with the stake locked in between.
   Measure whether that price is steep enough. Note it is also now the **only** route to the discard
   pile, so hate-drafting is the only thing that can exhaust the deck mid-game.

### The one structural crack to keep an eye on
This note used to read *"Heat can be a churn dial or a tax dial, never both,"* and warned against ever
re-attaching churn to Raids. **Downgraded, because it was stated as a law and isn't one.** Coupling two
systems to one clock is frequently a virtue — a single escalating clock gives the whole table one
rhythm to read — and the claim only bites if you ever want to push churn and Raid frequency in
*opposite* directions, which nobody has wanted yet.

The part with real content is narrower, and it survives. Apply **this** test instead:

> **Rat triggers a Police Raid on demand. So anything you hang on a Raid, any player can fire at will.**

Ask not "is this coupled to Heat?" but "**would Rat weaponise it?**" That is what actually killed the
raid-refresh proposal (§2b): it would have made Rat a market-nuke pointed at whatever a rival was
visibly building toward.

Both are moot while churn doesn't exist. They matter again the moment someone proposes a Market
refresh trigger.
