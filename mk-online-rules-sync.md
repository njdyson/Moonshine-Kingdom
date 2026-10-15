# mk-online: rules sync backlog

> **2026-10-13: §28 to §31 are ported** (mk-online 7b14ae3, deployed here the same day). The
> online game plays the 36-card deck, Bribe cards, Respect as the only score and the away crown.
> See *Ported 2026-10-13* under §31 for what the bots made of it.

> **2026-10-12: the Nod is gone; Respect is the only score.** Take the Crown needs 20+ Respect and
> the Boss in an away High Society Venue. Bribes buy Bribe cards (1 to 4 Respect, one of each), a
> Mark is -2 Respect while held, the Rat -3, the Blood Oath 40 combined. See §31.

> **2026-09-25: the win is a Play.** The Nod pays no Respect; it carries **Take the Crown**,
> a Power Play that wins on the spot with the Boss in a High Society Venue, no Mark and 10+
> Respect. There is no Sunset victory test and no tiebreak. See §16.

> **2026-09-23: the Commission Seat is renamed The Nod.** Same rule: claim it the instant
> you reach 10 Influence, worth 10 Respect. Winning is now framed as earning a seat on the
> Commission, so a card called a Seat read as the win. Rename the card, its log lines and
> tooltips; nothing else changes.

> **2026-09-16 (v0.9.9): the tabletop target changed again.** The core win condition is now
> **20 Respect and Solvent status**; reaching **10 Influence** claims a
> **Commission Seat worth 10 Respect**; Shylock's Marks bar victory until cleared; and the
> Blood Oath target is **40 combined Respect** with both partners Solvent. `mk-online` still
> does not implement the tabletop v0.9 rules.

> **2026-09-10 (v0.9.7): the win condition changed.** Borough Deeds are cut, Titles pay no
> Respect, Respect is Jobs only at a 10-point crown (Rat 2, Welsher 1, Blood Oath 20), and
> Bribe costs $2,000 / $3,000 / $4,000 / $5,000 for the 7th to 10th markers. `mk-online` does
> not implement any of this yet; every Deed row below is a dated record.


Rules changes landed in the tabletop files that **mk-online does not yet
implement**. The web build in `mk-online/dist` is a compiled bundle; the source
lives elsewhere, so this is written against observable behaviour and log strings
rather than line numbers.

Nothing here is a bug in the current build. It is a list of places where the
deployed game and the v0.9 rulebook have diverged, and what has to change to
close the gap.

---

## 1. The Rat Card (2026-07-27, supersedes the 2026-07-24 entry)

> **This section was rewritten, not appended to.** The 2026-07-24 spec (penalty
> moves to Jobs, exit becomes cash-for-a-marker) was never implemented — every
> box below it is still unticked — so it has been replaced outright rather than
> layered. Do **not** go looking for a two-step migration. The build still has
> the *original* behaviour (Rise clears the card, Bribe blocked), and the table
> below carries it straight to where v0.9 now sits.

The Rat's penalty is now a **price in Respect**, and the card has **no
self-service exit at all**.

### What changed, and why

Two rounds of tuning failed for the same reason: the penalty was a *gate*, not a
*number*. "Cannot Bribe", then "cannot take Jobs", then "cannot be crowned" are
all binary, and a binary cost on a *tool* means the tool is missing at exactly
the moment its purpose exists. Late game, the boss who most wanted a Raid was the
one who could least afford to call one, so the Play sat unused.

The Jobs blackout was the sharper of the two failures. The honor gate only ever
bit a boss in contention — and a boss in contention should not want sirens
anyway. The blackout bit the *trailing* player, who needs the Market more than
anyone, which shut the Rat off for precisely the seat it was designed for.

So: the blackout is gone, the honor gate is gone, and the brand now costs a flat
**−3 Respect**, tallied like any other line at the Reckoning. Because scoring
only happens at the Reckoning, the card is *free* until the night someone could
be crowned — the early-cheap/late-expensive curve now falls out of the scoring
step with no clock, track or escalation clause to implement.

### Required changes

| # | Behaviour | Now |
|---|-----------|-----|
| 1.1 | Bribe is blocked while `ratCard === player`. Log: *"Bribe failed: the Commission won't take a Rat's envelope. Rise a new Boss first."* | **Remove the block entirely.** A rat may Bribe freely. |
| 1.2 | Rise clears the card. Log: *"P{n} Rises a new Boss — the Rat Card returns to the supply."* | **Remove.** Rise no longer touches the Rat Card in any way. |
| 1.3 | — | **New:** Respect scoring subtracts **3** while `ratCard === player`. It is a scoring-time modifier, not a stored value — never mutate a Respect total on pickup, or the card passing will double-count. |
| 1.4 | Victory honor check is `ratCard !== player && shylockMarks === 0`. | **Drop the first term.** Honor is now `shylockMarks === 0` alone. A Rat may be crowned; he just needs 18 gross to show 15. |
| 1.5 | — | **No absolution action.** There is deliberately no self-service exit; do not add one. The card leaves a player *only* when a rival Rats. |
| 1.6 | Rat is blocked while already holding the card. Log: *"Rat failed: you already hold the Rat Card (cannot Rat again until you Rise)."* | **Keep the block** — it is what stops a non-contender turning 2 Influence into an unlimited Raid button. Change the message: Rise is not the exit, and neither is anything else you control. |
| 1.7 | Log on taking the card: *"Cannot Bribe, Rat, or be crowned until you Rise."* | Reword: **−3 Respect** at the Reckoning and no second Rat, until a rival takes it off you. |
| 1.8 | Seat-tab tooltip: *"Holds the Rat Card: cannot Bribe, Rat, or be crowned until they Rise a new Boss"* | Same reword. The tooltip should show the −3 explicitly; it is now the whole card. |
| 1.9 | — | **Blood Oath, if implemented:** the −3 lands in the Alliance's *combined* Respect, and the Truce ranks on current Respect — so the card in a player's hand at Crackdown 10 can change which pairs form. Both fall out of scoring correctly if 1.3 is a scoring-time modifier; both break if it is stored. |
| 1.10 | — | **Volstead, if implemented:** Volstead does not track Respect, so −3 is a no-op there and the Rat would be free. That variant **keeps the crown-bar** for the Rat Card. It is the one place the old gate survives. |

### Unchanged

- The **hot potato** stands. `ratCard` remains a single holder; a rival who Rats
  still snatches it. It is now the *only* exit, which is the whole gamble.
- The Rat Play still costs 2 Influence and still triggers a Raid.
- Shylock is untouched: **Marks still bar the crown**, still clear at $2,000 on a
  Beg. The honor gate was kept for debt on purpose — it is a conditional cost
  (free while you're losing, disqualifying when you're about to win), which is
  exactly right for a lifeline loan and exactly wrong for a weapon.

### Bot AI

The rat heuristic scores a bonus of `-4` when the bot does not already hold the
card. That number was tuned against "no Bribes until you Rise" and describes
nothing that still exists. The new cost is unusually easy to evaluate, because it
is a number in the same unit as the win condition:

- **The cost is 3 Respect, discounted by the odds of being rid of it.** A bot far
  from 15 should treat it as near-zero and Rat freely — this is the seat the Play
  is for. A bot at 12+ should price it at the full 3 and almost never call.
- **It no longer blocks anything.** The bot must not carry over "can't take Jobs"
  or "can't win" pruning; a rat bids at The Offers normally and remains a victory
  candidate throughout. This is the most likely place for a stale branch to
  survive the edit.
- **The hate-draft interaction reverses.** Ratting used to spend the bot's veto
  over the Market. It no longer does, so "deny the crowning card" and "call a
  Raid on the leader" are now compatible in the same turn and should be able to
  score together.
- **Waiting is no longer a decision.** There is nothing to pay and nothing to
  time; the bot holds the card until somebody takes it. Delete the
  pay-now-vs-wait weighing rather than re-tuning it.

---

## 2. Influence floor of 5

Independent of the Rat, and worth doing first because it is a safety rail.

A player's Influence total **never falls below 5** (a full Ledger). Without it,
a player reduced to 4 markers who then parks all 4 on the Heat Track has an
empty Ledger, no way to generate the 5th marker themselves, and is **frozen
until a rival makes noise**. 5 is exactly right: worst case is 4 on the track
plus 1 spare, so at least one Play is always available.

- The **tabletop** game reaches 4 via broken Binding Handshakes, which
  mk-online does not implement, so today the online build cannot hit the freeze.
- The 2026-07-24 spec made this urgent, because absolution destroyed a marker and
  so **introduced the path** to 4. That rule is gone (§1.5), and with it the
  urgency: nothing in the current build can drive a player below 5. The floor is
  now a **safety rail against a bug, not a live rule**, and can land whenever.
  Worth keeping on the list — the moment Handshakes ship, it is load-bearing
  again.
- **2026-08-02: it never becomes load-bearing.** The Handshake no longer touches
  Influence at all — a broken deal now costs a **Welsher card** (§7), and no
  rule in either game destroys a marker any more. The tabletop game dropped its
  own floor-of-5 clause the same day. The rail is pure belt-and-braces against
  bugs; keep it or skip it, no rule ever reaches it.
- Volstead's 3-space Heat Track needs a floor of only 3, so a single floor of 5
  covers both modes with room to spare. No variant-specific clause.

---

## 3. Rise (superseded by §11)

Held its flexible form through v0.9 and lost only its Rat-clearing side effect
(§1.2). **The destination narrowed on 2026-09-21: see §11.1.**

---

## 4. Deck generator drift (fixed, noted for the record)

`tools/gen_deck.py` had drifted from the printed deck in three places — hand
edits to `Jobs Cards v0.9.html` that a `--force` run would have silently
destroyed. All three are now folded back into the card table and the script's
own integrity check passes clean.

One is load-bearing for the rules above: **The Empty Casket** reads *"After your
Boss is killed, Rise his successor in a Ward you Control."* The generator still
held the older *"Rise a new Boss in a Ward you Control"*, which — with Rise
keeping its flexible form — pays out for relocating a living Boss into a Ward you
already hold. If mk-online implements that Job, it must gate on an actual Boss
death, not merely on a Rise.

The other two were cosmetic: *Opening Night* reads "8+ Barrels **of Rum**", and
the Job card backs read "Job" rather than "The Jobs".

---

## 5. Twist the Valves → Split the Batch (2026-07-29)

The Boss's brew bonus is **gone**, replaced by a relay. The build implements the
old rule (`+1 barrel on the Boss's Still`); the tabletop files no longer have it.

### The rule now

> **Split the Batch:** If the Still in your **Boss's** District fires, you may
> also fire **one other active Still you Control** in a District **Connected by
> Land or Bridge**, whatever its number.

Blowback is untouched — the Boss still falls first on an exact match with the
Blowback Number, and only in his own District. The relayed Still takes no extra
risk; it is exposed on its own number exactly as before.

### Why, in one line

The +1 was worth ~$102/Day on a 7-stack and **$14/Day** on the mismatched build
that most wanted it, so it was decoration. The relay pays the crew standing on
the far boiler, which is money a spread build already owns and could never
light. It cuts the gap between the dominant four-7 wall and a connected mid
build from **2.6× to 1.5×** without touching the Boss-loss rate.

### Required changes

| # | Behaviour | Now |
|---|-----------|-----|
| 5.1 | Brew adds +1 barrel when `bossDistrict === district`. | **Remove.** The Boss contributes his *body* to the Muscle Ratio and nothing more. |
| 5.2 | — | **New:** after resolving the brew, if the Boss's District's Still fired, the player may fire **one** other Still they Control, in a District Connected to the Boss's **by Land or Bridge**, that is **active** (not padlocked by a Police Squad) and **did not already fire**. It yields by the Muscle Ratio as normal. |
| 5.3 | — | **Connection here is NOT the game's general `Connected`.** The Docks waterway must be **excluded** — land borders and Bridges only. `LAND_LINKS` is already the right edge list; do not fall through to the dock-to-dock closure used by Move. Getting this wrong makes the three worst-connected corners (Jamaica, Westerleigh, Tottenville) the best Boss hubs on the map. |
| 5.4 | — | **UI:** the relay is a *choice* when two or more candidates qualify. Prompt only then; auto-resolve the single-candidate case, and skip silently when there are none. Log: *"The old man walks the batch to {district} — Still {n} fires for {b} barrels."* |
| 5.5 | Bot brew heuristic drafts the first Red that fires any Still. | **Re-tune.** Dice are no longer interchangeable: the Red that fires the Boss's Still is worth a second boiler, and taking it also removes the die that would burst it. Score each draftable Red by *total* barrels including the relay. |
| 5.6 | — | **Dry Brew** interacts: the relayed Still's yield is part of the same morning's take, so it is subject to the same "split the last barrels as you choose" rule if the grey supply runs out. |

### Not changing

The Sicilians' **Untouchable** is untouched (it exempts them from the Sweep, not
the Blowback). **Rise** is untouched, though it is now a stronger Play: it
teleports the Boss to any Safe District, which is how a player re-points the
relay at a new junction.

---

## 6. Combat rework + Lay Low as a Play (2026-07-31 / 2026-08-01)

> **BUILT 2026-08-01.** Ported into `mk-online` and deployed; the tables below are kept as the
> record of what changed. The one clause with nothing to port is 6.5 (Puppeteer loans) — the online
> build has never implemented Cooperation, so there are no loans to widen; see the checklist entry
> for what a future loan port still owes.
>
> The whole combat-Heat economy changed shape across two days of rulings. The build predated all
> of it. Source of truth: `v0-8-changes.md` sections "BUILT (2026-07-31): Ambush costs 1 + Heat"
> onward, including every 2026-08-01 entry. The Combat Simulator in this repo
> (`Combat Simulator v0.9.html`, the heat model around the trial loop) is a working reference
> implementation of the Heat logic. Nothing below changes take-rate maths; it changes costs, Heat,
> and turn structure.

### 6.1 Threat bonuses

| # | Likely current behaviour | Now |
|---|--------------------------|-----|
| 6.1.1 | Safehouse gives the Occupier **+2** Threat, excluded from the Ambush shot | **+1**, and it **stacks on the Ambush**. The full stack is Base 1 + Boss +1 + Safehouse +1 + Ambush +1 = Level 4 (kill 2+), cap Level 4. |
| 6.1.2 | Torch cost 2 (if it predates 153b77a) | **Cost 1.** Sacrifice a Pinned Runner, destroy the Safehouse (removing its +1), always Heat. |

### 6.2 Ambush costs 1, and the marker IS the fight's Heat

| # | Likely current behaviour | Now |
|---|--------------------------|-----|
| 6.2.1 | Ambush is free and always available | **Cost 1, paid from the Ledger.** If the Occupier's Ledger is empty **or they have Laid Low**, Ambush is not offered — the *sitting duck*. Check at the moment of the Standoff, not a stored flag: a loan arriving at the Standoff can re-arm a spent-out (not Laid-Low) defender, see 6.5. |
| 6.2.2 | Spent markers return to Reserves | The Ambush marker moves **Ledger → Heat Track** directly. It is not a cost *plus* a Heat marker; the spent marker is the fight's Heat marker, and it carries its **owner's** identity for raid targeting (matters when a lender funded it). |
| 6.2.3 | — | **CUT 2026-08-03.** The Irish Plunder-in-place-of-Ambush option is removed — it traded the defender's only first strike for loot that stays put and reverts to the invader if the district falls (self-defeating). **Offensive Plunder** (the Pinned invader stealing barrels) is unchanged. Nothing to port; if any build added a defensive-plunder-at-the-Standoff branch, delete it — the occupier's only Standoff options are Ambush / Hold Fire / Fold. |

### 6.3 Heat: first shot only, one marker per firefight

| # | Likely current behaviour | Now |
|---|--------------------------|-----|
| 6.3.1 | Invader gains Heat only if his dice score 1+ kills; "the Occupier never draws Heat" | **Both deleted.** A firefight adds **exactly one** Heat marker, to **whoever fired first**: the Occupier if they Ambushed, otherwise the Invader on his **first** Open Fire. Kill or whiff is irrelevant. Track a per-fight "first shot fired" flag; later volleys by either side add nothing. |
| 6.3.2 | Hit draws Heat on kills (or per use) | **Hit follows the same rule**: Heat only if it is the fight's first shot. |
| 6.3.3 | — | Consequences to keep intentional: raiding an *ambushing* defender is **heat-free** for the invader; Hold Fire then return fire is heat-free for the defender (the invader's opening volley takes the marker). Plunder never draws Heat. |

### 6.4 Lay Low is an explicit Play (Cost 0)

| # | Likely current behaviour | Now |
|---|--------------------------|-----|
| 6.4.1 | Players at 0 Influence are auto-passed / auto-laid-low (verify) | **Never automatic.** Lay Low is a **Play, Cost 0**, the only free one, chosen **on your turn**. A 0-Influence player keeps their seat until their turn comes; Lay Low is then their only legal Play, but it still happens in seat order. This is load-bearing: it decides the order tomorrow's Turn Tokens are claimed when several crews go broke the same round, and it keeps a spent-out crew loanable until they step off. |
| 6.4.2 | (unchanged mechanics, listed for the port) | On Lay Low: **collect $100 per unspent Ledger marker** (the Collect rate, §8 — the term "Odd Jobs" is retired), Ledger clears to Reserves, claim the **lowest** token left in tomorrow's set. After: no Plays and **cannot receive Puppeteer loans** until tomorrow. |
| 6.4.3 | — | **Laid Low still defends.** Raided, they answer the Standoff (Hold Fire or Fold only — no Ambush) and return fire in volleys as normal (free). Nothing fought inside a firefight is a Play in any surfaced rules copy — "no more Plays" must never block defence. (Terminology, 2026-08-02: the noun **Call** is retired; the engine rule is unchanged, only how the copy says it.) |

### 6.5 Puppeteering at the Standoff

> **DEAD 2026-08-02.** Puppeteering is cut from the game entirely (§7). Nothing in
> this table will ever need porting; it is kept as the record of a rule that
> existed for two days of rulings and never reached the build.

| # | Likely current behaviour | Now |
|---|--------------------------|-----|
| 6.5.1 | Loans spendable on next Play, or mid-Pin | Also spendable **at the Standoff, to pay the Ambush** (or Irish Plunder-Ambush). Lending remains blocked to anyone who has **Laid Low** — that block is what stops "ambush by loan" after stepping off; do not relax it. |
| 6.5.2 | Heat from a loan-funded Play locks the lender's marker | Same rule, now explicitly including the Ambush: a lender's marker that pays an Ambush **is** the fight's Heat marker and locks with the **lender's** identity — the law chases the banker. Where two mobs' markers fund one Play, the spender picks whose marker takes the fall (existing rule, unchanged). |

### 6.6 Bots

The value model changed even where legality didn't: Ambush now costs a marker plus Heat-ownership,
so small garrisons (1 die) should strongly prefer Fold; duck status makes lay-low timing a combat
decision; and a Rum Kickback re-arm (+3 Plays at dusk) raiding already-laid-low rivals is the new
strongest aggressive line. Minimum bar: bots must not crash into the new Ambush gate or the
explicit Lay Low Play. See `mk-online-bot-lookahead-handoff.md` before touching evaluation, and
the Kingpin's Guide "Duck Window" section (archived 2026-10-07: `Archive/Kingpin's Guide v0.9.html`) for the human-readable strategy the bots should at least
not embarrass themselves against.

## 7. Puppeteering cut; the Handshake pays in Respect (2026-08-02)

Two changes with one purpose: **Influence never crosses the table.** The
currency's identity is now clean — your markers fund your Plays, stake your
Jobs and buy your crown, and nothing else at the table can touch them.

### What changed, and why

- **Puppeteering is deleted.** It was the game's single biggest source of edge
  cases — the finger rule, two-lender Plays, the loan-at-the-Standoff, the
  unspent-loan return, the Laid-Low lending block — and it over-armed
  kingmakers: transferable tempo let a crew out of the running decide a
  firefight, or the crown, with somebody else's afternoon. Every proxy-war
  trick it powered has a cash-shaped cousin (bounties, off-book payments), and
  those pay only on results.
- **The Handshake stakes nothing.** A deal is now sealed with an actual
  handshake — no marker, no Play, no cost. Breaking it (for **any** reason,
  third-party sabotage included) takes a **Welsher card** from the supply:
  **−1 Respect when the books open, permanent, and they stack.** Supply is 8.
  This kills the floor-of-5 fiddle outright (a boss at the floor used to stake
  a marker he could not lose, making his word free), and it prices a broken
  word in the same unit as the win condition, exactly the shape the Rat's −3
  landed on in §1. Deals are deliberately a shade more fragile: −1 Respect is
  a lighter tooth than a forfeited marker, and that is the point — the word
  should bind contenders hardest and cost cowards their reputation, not their
  engine.

### Required changes

Mostly good news: the build never implemented Cooperation, so the Puppeteering
cut **cancels port debt rather than creating it**.

| # | Where it bites | Now |
|---|----------------|-----|
| 7.1 | 6.2.1's "a loan arriving at the Standoff can re-arm a spent-out defender" | Dead letter. Keep the live-at-the-Standoff duck check (`canAmbush` reading the Ledger is still correct — Kickbacks exist); there is simply no longer any path that re-arms a spent-out defender mid-fight. |
| 7.2 | 6.4.2's "cannot receive Puppeteer loans until tomorrow" | Dead letter. Lay Low's aftermath is just "no more Plays until tomorrow". |
| 7.3 | 6.5, the whole section | Cancelled. Nothing to port, ever. |
| 7.4 | §2's Influence floor of 5 | Never becomes load-bearing (note added there). |
| 7.5 | — | **If deals ever ship online:** a `welsherCards[player]` count; Respect scoring subtracts **1 per card at scoring time** (same never-store rule as the Rat's §1.3, and it matters here too — the cards stack). Supply of 8. **No removal path**; do not add one. |
| 7.6 | — | **Blood Oath, if implemented:** the −1s land in the Alliance's combined Respect — free if 7.5 is a scoring-time modifier. **Volstead, if implemented:** no Respect track, so a broken deal has no tooth there; that is an open design question, not something to invent in the port. |

### Bots

Nothing to unlearn (no bot ever lent a marker) and one cheap heuristic if deals
ship: a Welsher card is −1 Respect in the win-condition's own unit, so price
breaking a deal exactly like §1's Rat maths at one third strength — near-zero
far from 15, mortal at 14.

## 8. Collect: a new Standard Play (2026-08-03)

*Odd Jobs* — the "$100 per unspent marker" clause that only ever fired inside Lay
Low — is promoted to a Standard Play in its own right, **Collect**, and the term
"Odd Jobs" is retired. One economic constant now governs both: **1 Influence
marker = $100 cash**, whether you cash markers one at a time (Collect) or the
whole Ledger at once (Lay Low).

### What changed, and why

- **Collect (Standard Play, Cost 1 Influence).** Spend one marker — it returns to
  Reserves like any Standard-Play cost — and take **$100** from the bank. **No
  Heat, no board change, no combat**; it *is* the turn's Play. Legal only with at
  least one Influence in the Ledger (it costs one); at 0 Influence the only Play
  left is still Lay Low.
- **Why it exists.** A crew that wanted to stay on the street late (to outlast
  rivals and claim a *higher* Turn Token — first pick at The Offers tomorrow) had
  no legitimate do-nothing move; it had to make disruptive "filler" plays
  (shuffling a Runner between friendly districts) purely to burn a turn. Collect
  is that filler made honest: a real Play that touches no board state.
- **Money stays neutral.** Because Collect pays the same $100/marker as Lay Low's
  cash-out, total cash is identical whether a crew dumps its Ledger early or drips
  it out over several turns. Cash therefore never distorts the step-off decision —
  the only thing traded is **Turn-Token position** (low token = first Brew draft;
  high token = first pick at The Offers).
- **Lay Low is unchanged mechanically** — its per-marker payout is the Collect
  rate stated once and reused; only the copy changed (the "Odd Jobs" label is
  gone, the number is not).

### Required changes

| # | Where it bites | Now |
|---|----------------|-----|
| 8.1 | Standard Play list / action enum | Add **Collect**, Cost 1. Effect: move one marker Ledger → Reserves (standard cost path, **never** the Heat Track — Collect draws no Heat) and credit the player **$100**. It consumes the turn's Play like any other. |
| 8.2 | Legality gate | Collect is available iff the player has **≥1 Influence in the Ledger**. It is a normal priced Play, so the existing "can you afford a Cost-1 Play" check already covers it; just make sure it is offered whenever affordable and never at 0. |
| 8.3 | Lay Low payout label | Wherever the cash-out is surfaced (log line, tooltip, end-of-day summary), retire the string **"Odd Jobs"**; the mechanic (\$100 × unspent Ledger markers, then clear to Reserves) is unchanged. |
| 8.4 | Bots | Collect is the **tempo-hold** move: take it only to stay on the street for a *later* Turn Token when no value Play is available — never for the cash (it is money-neutral, so Collecting purely for coin is strictly dominated by Laying Low and freeing the seat). Rank it below every value Play and above Lay Low **only** when the bot wants a higher token (a live Job it can reach at The Offers, a rival it wants to out-sit); otherwise prefer Lay Low. |

### Bots

One heuristic: `wantsLateToken = (a reachable Offers Job the bot values) || (out-sitting a rival for draft/market order)`. If a value Play exists, play it. Else if `wantsLateToken && ledger >= 1`, **Collect**. Else **Lay Low**. Guard against a Collect loop that never steps off — cap it by the same "nothing left worth doing" test that already triggers Lay Low, plus the token motive above.

## 9. The liquor market (2026-08-22, superseded by §10)

> **Superseded on 2026-09-01.** §10 reverses the two axes: the barrel now sets the
> price and the address sets the Kickback. Build §10, not this section. What still
> stands from here is the 20-barrel Rum pool, the deleted Deed tiebreak, the padlock
> check on the Night Mayor's placement, and Peddle staying Moonshine-only in Wards.

> **This section was rewritten, not appended to.** The 2026-08-09 spec described a
> *split* market (Moonshine only at standard bars, Rum only at the Hotspot, wrong
> liquor illegal). It was never implemented, and the tabletop rules have since gone
> the other way: the market is **unified**, and exclusivity is deleted. Do not port
> the old §9. What survives from it unchanged is the Rum pool, the Deed tiebreak
> deletion and the Night Mayor's padlock check, restated below.

The rule now has two orthogonal axes, and keeping them apart is the whole point: the
**address sets the price**, the **barrel sets the Kickback**.

### What changed

| | Before (in the build) | Now |
| --- | --- | --- |
| Standard Speakeasy | Moonshine or Rum, $300 | Unchanged: **either liquor, $300** |
| Hotspot | Moonshine or Rum at $300, Rum at $500 | **$500 for whatever you pour**, Moonshine included |
| Rum Kickback | 1 marker per Rum barrel, at any venue | Unchanged: **1 marker per Rum barrel, at any address**, Wards included |
| Rum supply | 15 barrels | **20 barrels** |
| Tied Borough Deed | Broken by whoever Controls the Borough's Hotspot | **No tiebreak.** A tie sends the Deed to the Supply, like every other Title |
| Night Mayor's move | Any other Speakeasy in the Borough | Any other Speakeasy in the Borough **that is not padlocked by a Police Squad** |
| Peddle (Irish) | Either liquor in a Ward you Control, $300 | **Moonshine only.** Rum can never be Peddled |

### Why it matters for the build more than it looks

- **Nothing can strand a paid-for barrel.** The exclusivity rule was cut because it let
  the Night Mayor make a rival's Rum unsellable after they had spent three Plays on it.
  A snub now costs the victim **$200 a barrel** and never the Play. Any validator that
  rejects a sale on liquor type is wrong; the only price input is the address.
- **Peddle is the one exception, and it is a deliberate one.** Peddle costs 1 Play where
  Unload costs 2, and that discount is its whole point. If it carried Rum it would pay
  the Kickback in a Ward you already Control, which routes the tempo engine around
  Speakeasies entirely and makes the address axis irrelevant to the crew that needs it
  least. Gate Peddle on Moonshine in the action validator.
- **All four Hotspots still start padlocked**, so a fresh game has no $500 room until the
  first Raid. Rum still sells and still pays its Kickback from night one, so the locked
  door costs margin, never tempo. A bot must not treat Rum as unsellable before a
  Hotspot opens.
- **The Deed tiebreak is deleted, not moved.** Do not reimplement it anywhere.

### What has to change online

| # | Area | Change |
| --- | --- | --- |
| 9.1 | Sale pricing | Price on the **address alone**: `isHotspot ? $500 : $300`, for either liquor. No liquor-type check at a Speakeasy, and no illegal-sale rejection. If the build already prices Rum at a flat premium, that premium moves to the venue. |
| 9.2 | Kickback | Unchanged (1 spent marker, Reserves &rarr; an empty Ledger slot, lost if no marker rests or no slot is empty), and it fires **wherever a Rum barrel is sold**, Wards included. It is not gated on venue type. |
| 9.3 | Rum supply | Pool 15 &rarr; **20**. The Harlem Knights' **Network** free cask still checks the pool before granting. |
| 9.4 | Borough Deeds | Remove the Hotspot tiebreak from Deed resolution entirely; a tie returns the Deed to the Supply, matching the generic Title path. |
| 9.5 | Night Mayor | The Morning Fix move must reject any destination Speakeasy holding a Police Squad. The token's own Speakeasy being padlocked already blocks the move (a padlocked token cannot be picked up), so both ends need the check. |
| 9.6 | Peddle (Irish) | **Moonshine only**, in any Ward you Control, at the flat $300 street rate. Reject a Rum Peddle in the validator, and make sure no Kickback path fires off a Peddle. Peddle at a Speakeasy is still just Unload's venue, so the $500 Hotspot rate is reached by Unload, not by Peddle. |
| 9.7 | Jobs deck | The two cards re-cut on 2026-08-09 stand as re-cut: **The Angel's Share** is `Unload 3+ Barrels of Moonshine at East Harlem`, **Cuban Prince** is a **Move** card, `Move 3+ Barrels of Rum into Sunny's Bar`. Neither is unfirable under the unified market, so neither needs reverting. |
| 9.8 | Bots | Rum's premium is the **Kickback**, not the price, and it is unconditional. Value a Rum barrel at the venue rate plus a Play, and value Hotspot access as a flat +$200 a barrel on anything sold there. Drop any access-conditional Rum valuation: a bot with Rum and no Hotspot is not stranded. |
| 9.9 | UI | Speakeasy and Hotspot tooltips read "$300 a barrel" and "$500 a barrel", with no liquor qualifier. The Rum tooltip carries the Kickback, and it carries it at every address. |

## 10. The liquor market, reversed (2026-09-01, supersedes §9)

The two axes are still orthogonal, and they have swapped jobs: the **barrel sets the
price**, the **address sets the Kickback**.

### What changed

| | Before (§9) | Now |
| --- | --- | --- |
| Sale price | `isHotspot ? $500 : $300`, either liquor | **Moonshine $300, Rum $500**, at any Speakeasy you Control. The venue is not a price input |
| Kickback | 1 marker per **Rum** barrel, at any address | 1 marker per barrel of **either** liquor, **only at The Hotspot**. Same limits: a marker in Reserves and an empty Ledger slot, else lost |
| Greed Tax | 4+ barrels in one Play | Unchanged |
| Hotspot Tokens at setup | One per mainland Borough, under the starting Squads | **All four start in the Supply.** Nothing is on the board until a Night Mayor places one |
| Night Mayor, Morning Fix | Move one token within its Borough | **Place** one token from the Supply on an unpadlocked Speakeasy in a Borough holding none, **or move** one token to another unpadlocked Speakeasy in its own Borough. One or the other, never both |
| Token cap | One per mainland Borough | Unchanged, and Staten Island has no Speakeasy so it never holds one |
| Title changes hands or falls vacant | Tokens stay put | Unchanged: tokens stay on the board |
| Raid | Token unaffected | A Squad kicking in a District holding a token **returns it to the Supply** (Condemned, beside the Safehouse and the seized Liquor) |

### Why it matters for the build more than it looks

- **Tempo moved from the cargo to the room.** A crew with Rum and no Hotspot is rich and
  slow; a crew with a Hotspot and cheap Moonshine buys its day back. Any bot that still
  scores Rum as a Play is scoring the old rules.
- **The board opens empty.** Day 1 has no Kickback anywhere, and the first token cannot
  land until a Night Mayor is crowned at a Reckoning. A bot must not assume a Hotspot
  exists.
- **Trade is now a flat cash upgrade**, $200 a barrel at every address, with no venue
  condition attached. That makes the Dock valuation static and much simpler than §9.8's.

### What has to change online

| # | Area | Change |
| --- | --- | --- |
| 10.1 | Sale pricing | Price on the **barrel alone**: Moonshine $300, Rum $500, at any Speakeasy the seller Controls. Drop every `isHotspot` branch from the price path. |
| 10.2 | Kickback | Fire it **once per barrel Unloaded at a Hotspot**, whichever liquor, with the existing Reserves-and-empty-slot guard. Remove the liquor-type gate; add the venue gate. Peddle still fires no Kickback. |
| 10.3 | Setup | Do not place Hotspot Tokens. Squads still start on the Town Planner's default Speakeasies. |
| 10.4 | Night Mayor | The Morning Fix offers two mutually exclusive actions, place or move, and both reject a padlocked destination. Place is legal only into a Borough with no token on it; move is legal only within the token's own Borough. |
| 10.5 | Raids | The Scatter returns any Hotspot Token on the kicked District to the Supply, alongside the Safehouse destruction and Liquor seizure. |
| 10.6 | Bots | Value a barrel at its own price, and value **Hotspot access as a Play per barrel**, worth most when the Ledger is nearly spent and near zero when it is full. Drop §9.8's flat +$200-a-barrel venue premium. |
| 10.7 | UI | Speakeasy tooltips read "Moonshine $300, Rum $500". The Hotspot tooltip carries the Kickback, not a price. |
| 10.8 | Jobs deck | The two Hotspot cards still fire, but only after a Night Mayor has placed a token, so any solver that assumes a Day 1 Hotspot needs the assumption removed. |

## 11. The Boss (2026-09-21)

Four changes that land together. They only balance as a set: the Boss gets
harder to re-seat, cheaper to lose on the day, and load-bearing at the finish.

| # | Behaviour | Now |
|---|-----------|-----|
| 11.1 | Rise places the Boss in any **Safe District**, whether or not he is on the board. | **Any Safe Ward, and only with the Boss off the board.** Five legal destinations (Five Points, Hunts Point, Corona, Brownsville, Stapleton), filtered by the existing Safe test. The Play is illegal while the Boss is on the board, so it no longer relocates a living one: a Boss moves by **Move**, one Connected step at a time. Cost stays 2, and it still ignores adjacency. |
| 11.2 | A crew with no Boss skips The Offers entirely. | **Remove.** The Offers step no longer tests for a Boss; a Bossless crew claims, walks away and passes like anyone else. |
| 11.3 | Victory tests Respect and Solvency. | **Add a third term: the Boss in a High Society Venue** (Sugar Hill, Morris Park, Williamsburg, Richmond Hill; 2026-09-24, was "on the board"). Checked at the Sunset test alongside the other two, never stored. A Boss anywhere else, or in the supply, is not crowned, whatever his Respect. |
| 11.4 | Blood Oath: partners cannot attack each other. | **Remove the protection.** Partner turf is Hostile as before, and every attack Play is legal against a partner. |
| 11.5 | Blood Oath: Jobs count deeds against any other player. | **A partner is not a rival.** `rival_*` predicates must exclude the partner, so Job progress only comes off the opposing Alliance. |
| 11.6 | Blood Oath victory tests 40 combined and both Solvent. | **Add: the Alliance needs at least one Boss in a High Society Venue.** If both partners have one there, the Alliance wins and the Capo is the higher contributor. **If only one does, he wins alone**, on the combined total. |
| 11.8 | Bots: decapitation is priced by the Offers lockout. | **Re-price.** Killing a Boss no longer denies a Job claim; it costs the victim his relay, his +1 Threat, a body in the Muscle Ratio, his access to the Bribe ladder, and the walk from a Ward back to a High Society Venue. Against a rival at or near 20 Respect it denies the crown outright, which is the highest-value attack in the game and should be scored as such. |

| 11.7 | Bribe tests cash and the marker ceiling. | **Add a Boss test.** Bribe is illegal with the Boss off the board, at every rung of the ladder. This is the change that keeps decapitation live before the endgame, so it is not optional dressing on 11.3. |

### Notes for whoever ports this

- 11.1 needs a Ward flag on the district data if one is not already there. The
  Town Planner's Zone column is the reference: exactly one Ward per Borough.
- 11.3 and 11.6 are the same test in two places. Write it once.
- 11.4 and 11.5 have nothing to attach to yet: the Blood Oath does not exist in
  the online build. Ported whenever the variant is.
- The Empty Casket now reads "Rise your **Boss** into a **Defenseless Ward** in
  a Borough where **you Control no other District**". §4 asked for a gate on an
  actual Boss death; 11.1 supplies it, since a Rise can only follow one.
- 11.7 and the bot re-pricing in 11.8 are the same idea seen from both ends. A
  build that ports 11.1 and 11.3 but not 11.7 has a Boss who is only worth
  killing on the last Day.

## 12. The Kickback needs Rum (2026-09-22, amends §10)

The Hotspot tokens are gone (v0.9.8); the Kickback lives on the four fixed High Society
Venues, the #7 mainland Speakeasies. It now also needs the right cask.

| # | Behaviour | Now |
|---|-----------|-----|
| 12.1 | Kickback fires once per barrel Unloaded at a High Society Venue, either liquor. | **Rum only.** Fire it once per **Rum** barrel Unloaded at a High Society Venue you Control, with the existing Reserves-and-empty-slot guard. Moonshine sold there pays $300 and fires nothing. Peddle still fires no Kickback. |
| 12.2 | Any Speakeasy buys either liquor. | **High Society Venues buy Rum only.** Reject a Moonshine Unload at one of the four (the barrels stay in the District, the Play is illegal if it sells nothing). The eight ordinary Speakeasies are unchanged: Moonshine $300, Rum $500. |
| 12.3 | Bots value a High Society room as a Play per barrel poured. | **Re-price.** Value a Rum barrel at $500 plus a Play when it can reach a High Society Venue the bot Controls; Moonshine there is $300 and nothing more. A Dock plus a room is now one engine: score them together, and weigh the Move, Trade, Move chain against the Kickbacks it buys (a daily run of four loses a Play; a batch of ten nets about +3). |
| 12.4 | UI | The High Society tooltip reads "Rum only, $500, 1 Kickback per barrel". |
| 12.5 | Bots: Moonshine brewed at a #7 sells where it stands. | **Re-route it.** Moonshine at a High Society District has to Move to an adjacent ordinary Speakeasy (Sugar Hill to East Harlem, Morris Park to Fordham, Richmond Hill to Flushing, Williamsburg to Red Hook or Astoria) or to a Dock. Holding that neighbouring bar is now worth scoring. |

Why: two 7-Mobster stacks on High Society could Unload Moonshine in place for +4 Plays and
$2,400 a firing day. 12.2 empties the till in place as well as the Ledger refill. See `kickback-blowback-handoff.md`.

## 13. Five rulings on gaps in the wording (2026-09-23)

A Rulebook writing sweep turned up five places where the text did not settle the rule.
Nick ruled on each; the Rulebook (and, for 13.1 and 13.2, the Playbooks) now say so. None
of these is a change of intent, but the online build's behaviour on each has not been
checked, so treat every row as "verify, then port if it differs".

| # | Question | Ruling |
|---|----------|--------|
| 13.1 | Can one Move gather pieces from several Districts? | **No.** A Move goes from a single District to a single Connected District. |
| 13.2 | Can the Occupier Fold with no Connected Safe District to flee to? | **No.** With nowhere safe to go, Fold is not offered. The Knights' Skiff exit (a Coastal Safe District) counts as somewhere to go. |
| 13.3 | Does the Knights' Skiff cost its 1 Influence when used to leave a fight on a Fold or Advance? | **No, as written:** it only changes the destination of the Fold or Advance. **Open thread:** Nick is considering banning the Skiff as an escape entirely, since it is an active Play. Do not build on the escape until that is settled. |
| 13.4 | Sicilian Untouchable: when the Safehouse District would be the Raid target, what does the Squad take instead? | **It bypasses that District as if it were out of reach.** The Sicilians' next District in reach if they have one (by Barrels, then Pressure), otherwise the next marker on the Heat Track; with nothing left to chase, the Squad stays put. |
| 13.5 | When a firefight's first shot is the fifth Heat marker, does the Raid interrupt the fight? | **No.** A firefight is one Play, and Heat lands as the Play ends, so the fight resolves first and the Raid follows. The winner is standing on the block (and holding its barrels) when the Squads move. |

## 14. Jobs complete only on your own Play (2026-09-25)

*The Play Is the Unit* never said whose Play. Raised by the Coronation proposal (an on-turn
win, not adopted), which needed Respect to move only on the active player's Play. The Rulebook
and the Jobs deck masthead now say it.

| # | Question | Ruling |
|---|----------|--------|
| 14.1 | Whose Jobs are checked when a Play ends? | **The active player's only.** Check that player's claimed Jobs against the Play, including the fight it started and any Raid it set off (The Insurance Job depends on that). Never check the Occupier's. |
| 14.2 | Does a kill by the Occupier (Ambush, or return fire on an Open Fire) count toward his Jobs? | **No.** The Toll Booth Trap, the Butcher's Ledger and the Irish Goodbye pay only the Invader. The Goodbye's "take no Control" is always true for a defender, so a build that checks both sides pays it for shooting back. |
| 14.3 | Does a Fold, or a Raid Scatter set off by a rival's Play, count? | **No.** Squatter's Rights pays only when the District is taken on your own Play. A Scatter from a Raid your own Play set off does count. |

## 15. The Welsher lands before the books open (2026-09-25)

A promise unmet "when the Day ends" earns a Welsher, and the books open "the moment the final
player Lays Low"; nothing said which came first. Nick's ruling: **the Welsher first.** A boss
on exactly 20 with an unmet promise is not crowned that Sunset. The Rulebook's Sunset Win
Check and the Town Planner now say so. Only matters online if deals ship (§7.5): at Sunset,
resolve expired Handshakes into Welsher cards before anything else. (Since §16 there is no
victory test at Sunset; the ruling still orders the Welshers first.)

## 16. Take the Crown (2026-09-25, supersedes 11.3 and 11.6)

The game is won by a Play, not tested at Sunset. The Commission still seats one man; he now
has to ask for the seat on his own turn.

| # | Behaviour | Now |
|---|-----------|-----|
| 16.1 | The Nod is worth 10 Respect. | **Worth nothing.** Respect is completed Jobs, less 2 for the Rat Card and 1 per Welsher, computed at use, never stored. The Nod is a flag claimed at 10 Influence that unlocks 16.2. |
| 16.2 | Victory is tested at Sunset: 20 Respect, Solvent, Boss in a High Society Venue. | **A new Power Play, Take the Crown** (cost 2, draws no Heat). Offered only to a player holding the Nod whose Boss stands in a High Society Venue (Sugar Hill, Morris Park, Williamsburg, Richmond Hill), with no Mark and Respect of 10 or more. Making it ends the game at once and the maker wins. Nothing else resolves: open Handshakes simply die, with no Welshers. |
| 16.3 | Sunset runs the victory test, and the Final Standoff breaks ties (Respect, then cash plus Loose Change). | **Delete both.** Sunset resolves expired Handshakes into Welshers (§15) and flips the Turn Tokens. No tiebreak exists, since one player acts at a time. Retire Loose Change from any UI. |
| 16.4 | Blood Oath: 40 combined; one Boss in a room crowns the Alliance; the higher contributor is Capo. | **20 combined Respect, both partners Solvent. The partner who crowns must hold the Nod and have his own Boss in a High Society Venue, and he is the Capo.** |
| 16.5 | Bots value the Nod as 10 Respect. | **Value it as the win key**: every winner climbs the whole Bribe ladder. Take the Crown the moment it is legal. Against a rival with the Nod and 10+ Respect whose Boss is in, or one Move from, a room, the Boss kill (11.8) and sitting in the room are the highest-value Plays. Discount to zero any Handshake payment due at Sunset from a player who can crown before then. |

## 17. A raided crew may sail (2026-10-07, reverses the 2026-07-30 land-only Scatter)

| # | Behaviour | Now |
|---|-----------|-----|
| 17.1 | Run For It: the crew flees to a **Land Connected** Safe District; a Dock with no free land exit is Cornered. | **Any Connected Safe District**, the same test as Fold: a crew raided on a Dock may flee to any Safe Dock across the water. Still never the District the Squad came from, and still the owner's pick (`chooseScatter`). |
| 17.2 | Cornered lists water and the map's edge as blocked exits. | **Cornered = no Connected Safe District left.** Nothing else changes: the Safehouse burns, all liquor goes to the Supply, and a cornered crew is arrested. |
| 17.3 | Bots treat a Dock as a dead end when pricing Raid risk or planning a corner. | **A Dock crew is all but uncatchable** (Staten Island's Docks are nearly always Safe). Price the cornering play only at blocks with no pier, chiefly Coney Island and Morris Park. A crew that sails to an empty Dock takes Control of it, which can move the Harbormaster. |
| 17.4 | A Squad's reach is the Districts **Connected** to it in its own Borough, so it can hop Dock to Dock (West Side and the Bowery, Whitestone and Jamaica). | **Land Connected only**, still inside its own Borough. The dock lanes are no longer part of any Raid: crews may sail, Squads walk. |

Ported 2026-10-07 (mk-online b80e22f): `scatterCandidates` and `foldDestinations` share
`connectedDistricts` in `src/game/data.ts`, and `reachableDistricts` reads land links only, as does
the bot's own reach test (`raidExposed`). The bots price a Raid by running the engine's on a copy
of the board, so a Dock crew's escape is already in the price (17.3). `scripts/raid-reach-check.ts`
guards both rulings.

## 18. Starting turf: the North on 8, 9, 10; the South on 4, 5, 6 (2026-10-07)

| Borough | Was (Ward, Speakeasy, Dock) | Now |
|---|---|---|
| Manhattan | Five Points, East Harlem, West Side | Five Points, The Tenderloin, The Bowery |
| The Bronx | Hunts Point, Belmont, Throggs Neck | Hunts Point, Fordham, Throggs Neck |
| Queens | Corona, Astoria, Jamaica | Corona, Flushing, Whitestone |
| Brooklyn | Brownsville, Coney Island, Canarsie | Brownsville, Red Hook, Canarsie |

Ported the same day (mk-online 3d24a96): `STARTING_TURF` in `src/game/setup.ts`, and the reference
copy `LEDGER_STILLS` in `src/game/data.ts`. The bots read the board, so nothing else changes.

## 19. The Market restocks after the Offers (2026-10-07)

A Take no longer refills its gap. The Market is restocked once, after every player has had his
Offer, and the opening Market is dealt face-down and turns up at Day 1's restock, so Day 1 has no
Offers. See `jobs-system-handoff.md` §2b, *The restock*.

| # | Behaviour | Now |
|---|-----------|-----|
| 19.1 | Take a Job deals a fresh card into the gap at once. | **Leave the gap.** After the last player's Offer (Take, Walk Away or pass), deal a card into every empty slot; reshuffle the discards if the deck runs dry. Later pickers choose from a thinner Market. |
| 19.2 | Setup deals the Market face-up (1s and 3s, 5s shuffled in after). | **Same cards, face-down**, revealed at Day 1's restock. Skip Day 1's Offers entirely. |
| 19.3 | Bots may count on the refill a Take reveals. | **No refill mid-Offers.** A bot's claim tomorrow is from the cards on the table today (less what higher tokens take), which makes the late token's first pick worth more in the Lay Low heuristic (8.4). |
| 19.4 | Whispers peeks at the deck top. | **Unchanged.** The top card is now the first card of tomorrow's restock. |

Ported 2026-10-08 (mk-online cdc0a3e): a Take leaves its gap, and `closeOffers` in
`src/game/shadows.ts` restocks every gap from the deck top before the Ledgers are funded.
`marketFaceDown` hides the opening Market until Day 1's Brew and Blowback are done, and Day 1 skips
the Offers. For the bots (19.3), the Vipers' `revealValue` is gone, since a claim no longer deals the
seen card mid-Offers. The late token's first pick is priced the same day (mk-online d0f8fa3): while
a rival is still out and the Market holds a Job the bot can likely pull off, it stays on the street,
preferring a quiet one-marker Play or a paying Unload to a Collect (`pushOffersHold`,
`applyOffersHold`; numbers in mk-online's `BOT-WINRATE-HANDOFF.md`, session 6).
`scripts/restock-check.ts` guards 19.1 and 19.2.

## 20. Stealth blocks the Ambush, not the Fold (2026-10-08, amends the 2026-09-30 ruling)

| # | Behaviour | Now |
|---|-----------|-----|
| 20.1 | A Stealth skips the Occupier's answer: the fight opens Pinned, as if he had Held Fire. | **It opens on the Occupier's answer, as any Move does.** He may Hold Fire (the usual Pin) or Fold. |
| 20.2 | The Occupier cannot Ambush a Stealth, because the answer step never comes. | **He still cannot Ambush**, now refused at the answer itself, even with a marker in hand. |

Ported the same day (mk-online cbfc27d): `stealth` opens the Standoff through `initiateCombat` with a
`stealth` flag, and `ambushBlockReason` refuses the Ambush for it, so the UI, the harness options and
the bots' answer (which may now Fold) all follow. `scripts/stealth-check.ts` guards it.

## 21. Scram: one run for a Fold and a Raid (2026-10-08)

| # | Behaviour | Now |
|---|-----------|-----|
| 21.1 | A Folding crew flees to any Connected Safe District, including the block the Invader came from if he emptied it (it is Safe, and moving in takes it). | **Never the one the Invader came from**, as a raided crew never runs to the Squad's block. |
| 21.2 | The run is "flee" for a Fold and "Run For It" in the Scatter. | **Both Scram.** Fold and The Scatter keep their names; Scram is the run inside them. Logs, UI and harness text say so. |

Ported the same day (mk-online 7c00c75): `foldDestinations` drops `combat.originId`, and
`scripts/scram-check.ts` guards it (it fails on every block without the change).

## 22. Movement reads as one family (2026-10-08)

| # | Behaviour | Now |
|---|-----------|-----|
| 22.1 | Advance takes every carried barrel (the UI offers no choice; the harness can't take none). | **As many as the player likes**; the rest are the Occupier's (planting evidence on a rival who Ambushed). The engine already took a list. |
| 22.2 | Stealth's text says "rival District". | **Hostile District**, as the engine always required. |
| 22.3 | Skiff's Coastal test is "touching water". | **All but Fordham, Corona, Flushing and Richmond Hill**, named in the text. |

Ported the same day (mk-online 2e3babc): Advance steppers in the fight panel, explicit barrel counts in the
harness (`m=0` leaves them all), and the descriptions, play reference and RULES-AI.md updated.

## 23. Five gaps in the Rulebook's wording (2026-10-09)

An outside review asked where the Rulebook was silent. Each answer below is what the engine (RULES-AI.md,
and the bundle in `dist/`) or the Jobs notes in `tools/gen_deck.py` already did, so **nothing to port**.

| # | Question | The Rulebook now says |
|---|----------|-----------------------|
| 23.1 | When does a Job complete: mid-Play, or as it ends? (An Unload's Kickbacks draw on Reserves, so a stake returned mid-Play could feed them.) | **As the Play ends**, as the Jobs deck masthead always said. The stake comes home after the Kickbacks. |
| 23.2 | Does a Signature Play count toward a Job? Can one Play complete two? | **Yes to both.** Jobs are worded by outcome (gen_deck.py's Toll Booth Trap note), and the audits only bar two 5s on one Play. |
| 23.3 | Does a Raid your Play sets off "kill" the crew it arrests? | **No.** Kill Jobs check `killsByMe` in your own fight. |
| 23.4 | Both crews wiped out in one volley? | **Nobody wins.** The Occupier's Safehouse holds the block; with none it stands empty. |
| 23.5 | Whose barrels does a Move send? | **Your own**: the engine's Move starts from a District you Control. |

Also wording only: Collect is stated as what it is (spend a marker on $100; Laying Low pays the same, so it
buys a turn longer on the street), with no Turn Token talk; Extort says "one Heat marker".

Wording taken on 2026-10-10 (mk-online 32418fc): RULES-AI.md's Collect and Extort rows say the same. The
same day's Open Fire pass (only the Invader pays; the return fire is free and always comes, even Laid Low)
was already the engine's behaviour; the fight panel, play reference and RULES-AI.md now say so.

## 24. Torch is a shot; Red dice for the Invader (2026-10-09, Nick)

| # | Behaviour | Now |
|---|-----------|-----|
| 24.1 | Torch **always** draws Heat, so a fight could add two markers (the first shot and the Torch) and take the track from 4 to 6. | **Torch draws the fight's Heat only if it is the first shot**, as Hit does. A fight adds at most one marker, so no Play draws two and the track never overflows. **To port:** Torch sets `firstShotFired` and pushes Heat only when it was unset (today it always pushes). |
| 24.2 | The Rulebook gave no dice colours for a fight. | **The Invader rolls Red, the Occupier White**, so nobody has to remember who rolled which. Red also brews. Cosmetic online; worth matching if the fight panel colours its dice. |

The Rulebook, Playbooks (Knights' Torch row), The Almanac (lesson 21 now counts three sources of Heat) and the
Combat Simulator (Torch after an Ambush draws nothing) are updated.

Ported 2026-10-10 (mk-online 32418fc): `torch` claims the marker through `claimFirstShotHeat`, as a shot,
and otherwise returns its spent marker to Reserves. The fight panel shows the Heat flag on Torch and Hit only
while no shot has been fired, and labels the dice Red (Invader) and White (Occupier).
`scripts/torch-peddle-check.ts` guards it.

## 25. "Destroy", not "raze" (2026-10-10, Nick)

Wording only; the rule is unchanged. The tabletop set now has one verb for a Safehouse sent back to
its owner's supply: **destroy**. The choice on taking a block with a rival Safehouse reads "take it
over or destroy it". **To port:** the UI strings that say raze ("Raze it", "take it over or raze it",
"take over or raze?", "razes the Safehouse", "Safehouse razed") should say destroy. The move name
`evictRaze` can stay.

Ported 2026-10-10 (mk-online 32418fc): every player-facing and harness string says destroy, the harness's
option label included; `evictRaze` and the `safehouseRazed` field keep their names.

## 26. District words: Empty, unguarded, barrels (2026-10-10, Nick)

Wording only; no rule changes. **Defenseless** is renamed **Empty** (the same Districts: no Mobsters,
no Safehouse, no Squad), a rival Safehouse with no Mobsters is **unguarded** (it was "Undefended HQ"),
and rule text says **barrels**, not Liquor. **To port** (strings seen in the `dist/` bundle):

- Job objectives: The Empty Casket ("an **Empty Ward**") and Squatter's Rights ("an **Empty District**").
- "Rise failed: the Ward must be Safe (yours, or Defenseless)" and "Secure failed: ... (yours, or a
  Defenseless block)": say Empty, and District.
- "storms an Undefended HQ": unguarded Safehouse (with §25's raze fix in the same line).
- "Carried Liquor stays for the Occupier" and the Fold's "leaving Liquor and Safehouse behind": barrels.
- RULES-AI.md's Safe District line ("yours, or Defenseless").

The flag `riseIntoDefenseless` can stay; it already means "a Ward that wasn't yours".

Ported 2026-10-10 (mk-online 32418fc): all five, plus Stealth's and Skiff's "(no Liquor)", the play
reference's Move ("Into a Hostile District") and Fall Back rows. RULES-AI.md's Safe District line now
defines Empty and unguarded.

## 27. Peddle: the street rate, and no Greed Tax (2026-10-10, Nick)

A rule change. **Peddle pays $200 a barrel** (was $300) and **never draws Heat**: the Greed Tax is
Unload's alone. Moonshine only, Wards you Control only, Cost 1, all unchanged.

**To port:** the Peddle price, and drop its Greed Tax check (today 4+ barrels on a Peddle push a
Heat marker). Strings: RULES-AI.md's Peddle line ("at $300 a barrel. Greed Tax at 4+") and its
Heat list ("a Greed Tax sale" should name Unload only), plus any Peddle tooltip that shows a Heat
flag. Bots: Peddle is now the quiet bulk sale, worth it from about five barrels up; below that an
Unload at a bar pays more.

Ported 2026-10-10 (mk-online 32418fc): `PEDDLE_PRICE` is 200 and `peddle` draws no Heat; the Peddle form
starts at the whole pile and shows no Greed Tax flag. The bots' Peddle candidate sells the lot, scored at
the street rate against the Unload candidates' bar price. `scripts/torch-peddle-check.ts` guards it (a
six-barrel Peddle paid $1,800 and drew Heat before the change).

## 28. The Jobs deck rewrite (2026-10-10, Nick)

Twenty-eight objectives reworded, ten of them with a different trigger, and two cards change tier.
The full before-and-after is in `jobs-audit-handoff.md`; `tools/overlap_audit.py` holds a predicate
for every card that a port can copy. **To port** (the cards whose trigger or tier changes):

| Card | Now completes on |
| --- | --- |
| Tenement Army (1) | Recruit 4+ Runners in one Play at **Stapleton** |
| The Empty Casket (1) | Rise into any **Empty Ward** (the Borough condition is gone) |
| The Dutchman's Deal (1) | Trade 3+ barrels at **West Side** (not either Manhattan Dock) |
| The Angel's Share (1) | Unload 3+ barrels of **either** liquor at East Harlem |
| Squatter's Rights (1) | a **Move** that puts a Mobster into an Empty District in a rival's home Borough (not a Secure, Rise or barrels alone) |
| Poison Panic (3) | Unload 6+ barrels of **either** liquor at Flushing |
| Gin Pipeline (3) | Move 6+ barrels of either liquor into **your own home Ward**, from anywhere |
| The Smuggler's Run (**now 3**, Stake 2) | Seize a Dock with a Move from Staten Island carrying 4+ Rum (same trigger) |
| Last One Standing (3) | Secure your Safehouse in **Astoria** |
| Union Dues (**now 5**, Stake 3) | Recruit 4+ Runners in one Play in a **rival's home Ward** |
| High Roller (5) | Secure into a High Society Venue holding 4+ Rum (no adjacency) |

"Home Borough" is the Borough a player drew at setup, and "home Ward" its Ward; at three players one
Borough is nobody's, so it is never a rival's. A Blood Oath partner is not a rival (11.5). Every
other card keeps its trigger and needs only its string. The opening Market still sets the 5s aside,
so The Smuggler's Run can now be dealt on Day 1 and Union Dues can't. Bots: Union Dues is a reason to
keep a garrison in the home Ward.

## 29. Borough cards: the Nod, and the crown away from home (2026-10-10, Nick)

A rule change. **Take the Crown needs the Boss in a High Society Venue outside his home Borough.**
The four Nod cards are gone; four Borough cards, dealt at setup, name each boss's home Borough,
hold his unbought Influence (a Bribe takes the top marker) and carry Take the Crown. **The Nod is a
status**, not a card: 10+ Respect, all 10 Influence bought and no Mark. CLAUDE.md, *Borough cards*, has the why. **To port:**

| | Now |
| --- | --- |
| Setup | Starting Boroughs are still random (the engine already deals them); at three players one is nobody's home. |
| Victory test | The Nod (Respect >= 10, all 10 Influence bought, no Mark), and the Boss in a High Society Venue **not in his home Borough**. |
| The Nod | A derived status, never stored: it can be lost (a Rat Card or Welsher dropping Respect below 10, a Loan's Mark) and regained. Show it per player; "has the Nod" is the table's alarm. Any "claimed the Nod at 10 Influence" event should say the city instead. |
| Blood Oath | The Alliance's Nod: one partner with all 10 Influence, 20 combined Respect, no Mark on either. That partner crowns, and his own home Borough is barred. |
| Bots | Crown rooms are the three away ones: for Manhattan and Queens, Williamsburg is one Move from home; for Brooklyn, Richmond Hill; for the Bronx, Sugar Hill or Williamsburg at two. A bot's own room is worth holding for Kickbacks, not for the walk. Defend the home room as a landlord: every visiting Boss there is the leader's. |

Strings: RULES-AI.md's crown conditions and its Nod line ("claim the Nod"), and any tooltip that
names the Nod as a card.

## 30. The Jobs deck in sets: 36 cards (2026-10-11, Nick)

The deck is rebuilt (two passes the same day; `jobs-setup-handoff.md`). Nothing else in the rules
changes. It replaces §28's card list, so port this instead of §28's. `tools/overlap_audit.py` holds a
predicate for every card. **36 cards, 16 / 12 / 8** (stakes 1 / 2 / 3 as before); setup still sets
the 5s aside for the opening deal.

| Tier | Cards and what completes them |
| --- | --- |
| 1, the bars | an **Unload of 4+ barrels** at one named bar, worded "at <bar> in <District>": The Angel's Share (The Silver Dollar, East Harlem), High Spirits (The Haymarket, The Tenderloin), Bathtub Gin (DeLillo's, Belmont), Coffin Varnish (The Penny Whistle, Fordham), Giggle Water (Bohemian Hall, Astoria), Poison Panic (Paradise Alley, Flushing), Last Call (Ruby's Joint, Coney Island), Off the Boat (Sunny's Bar, Red Hook) |
| 1, singles | The Milk Run, The Dutchman's Deal, Night Landing, Tenement Army, The Beachhead (all as §28); The Pier Six Brawl (**any** Seize of a Dock, Safehouse or not); Rum Row and The Insurance Job (same triggers, **now 1s**) |
| 3, Extort | an **Extort** while you Control: all three Speakeasies of Manhattan (Empire State), the Bronx (The Big Squeeze), Queens (King of Queens) or Brooklyn (The Black Hand); a District in all five Boroughs (The Five Families, **now a 3**); 4+ Docks (Cuban Prince) |
| 3, singles | Hell's Highway (a Move across the **Hell Gate Bridge** carrying your **Boss** and 4+ Rum); Last One Standing (Secure in Astoria while 6+ Rum sits there); The Smuggler's Run (as §28); The Copper Heist (a Seize of a District whose Still is **Pressure 5**: the four starting bars and Stapleton); Opening Night and Union Dues (same triggers, **now 3s**) |
| 5, body counts | a fight in the named Borough that kills **5+ Runners**: Bloody Sunday (Manhattan), Over the Top (the Bronx), Rum Wars (Queens), The Butcher's Ledger (Brooklyn) |
| 5, Bosses | a fight in the named Borough that **kills a Boss**: Room 349 (Manhattan), The One-Way Ride (the Bronx), The Toll Booth Trap (Queens, no own-Boss clause now), The Last Hand (Brooklyn) |

Card strings carry no "in one Play" any more (the Rulebook's The Play Is the Unit says a count is what
one Play did); the triggers already count per Play. Removed: The Grand Tour, The Empty Casket, Squatter's Rights, Fortress Staten, The Eviction, Gin
Pipeline, The Irish Goodbye, High Roller. New art files: `High Spirits`, `Bathtub Chemistry`,
`Cutting`, `Cobble Hill` (Giggle Water), `Switch` (Off the Boat), `Rum Wars`, `The Big Sleep` (Room
349), `Gatsby` (The One-Way Ride), `Debt Collector` (The Last Hand), `Scheme` (The Five Families).
One Extort can complete several Extort Jobs at once. Count Runner kills apart from the Boss: the body
counts need five Runners killed in that Play, and one fight can complete a Borough's body count and
its Boss card together. Bots: every Boss is a 5 in every Borough,
so value Boss safety higher; the Extort set is a reason to steer a Squad off a room.

## 31. Respect is the only score: Bribe cards replace the Nod (2026-10-12, Nick)

A rule change; it supersedes the Nod in §16 and §29. `respect-endgame-handoff.md` has the why.
**To port:**

| | Now |
| --- | --- |
| Victory test | **Respect >= 20** and the Boss in a High Society Venue outside his home Borough. Influence and Marks are no longer tested, except through Respect. |
| Respect | Completed Jobs, plus Bribe cards (1 to 4), less 3 for the Rat Card, 2 per Mark held and 1 per Welsher. Computed, never stored. |
| Bribe | Power Play (2), Boss on the board. Buy a Bribe card the player doesn't hold yet: Precinct Captain $2,000 / 1 Respect, Alderman $3,000 / 2, Judge $4,000 / 3, Mayor $5,000 / 4. Any order, **one of each per boss**, so Influence still tops out at 10. One Influence marker moves from the supply to the Reserves. The box has four of each, so no pile runs dry. |
| Setup | The 4 unbought markers wait in the supply; the Borough card holds no stack. The Bribe piles sit face-up above the Market. |
| Beg | Loan and Square Up unchanged. A Mark is -2 Respect while held and bars nothing. |
| Rat | -3 Respect (was -2). |
| Blood Oath | 40 combined Respect. **Either** partner crowns, with his own Boss in a High Society Venue his own Borough card names; whoever crowns is Capo. No Influence or Mark clause. |
| The Nod | Gone. Remove the status, its badge and its alarm; the alarm is a Respect count near 20 with a Boss near a room. |
| Bots | Value a Bribe card as its Respect plus a marker: the Captain early for the 7th marker, the Mayor (4 Respect in one quiet Play) as the closer from inside the room. A rival at 16+ with $5,000 on hand and the Mayor unbought is one Play from 20. Price the Rat at 3 and a Loan at 2 Respect until repaid. |

Strings: RULES-AI.md's crown conditions, the Bribe ladder text, every "Nod" string, the Rat's -2 and the
Mark tooltip.

### Ported 2026-10-13 (mk-online 7b14ae3)

All of §28 (through §30's card list), §29's away crown and §31. Two engine readings worth knowing:

- **A Seize** is any change of Control from a rival on your own Play: a won fight, a Fold, or walking
  onto an unguarded Safehouse (taken over or destroyed). The Glossary's definition, so The Pier Six
  Brawl, The Smuggler's Run and The Copper Heist all pay on a walk-in.
- **A Bribe with no card named** buys the cheapest man left. The UI and the harness always name one.
  A save from before the Nod retired maps its bought markers to the cheapest cards, in order.

`scripts/crowncheck.ts` and `scripts/jobs-check.ts` in mk-online test the crown, the Bribes and every
card's trigger, with two triggers run through real engine Moves.

**For playtest: the bots' games got longer.** Same bots, same seeds, 4 players, no MCTS:

| Rules | Games | Crowned by Day 60 | Median Day crowned |
| --- | --- | --- | --- |
| Before (the Nod, 10 Respect, the old deck) | 24 | 24 | 27.5 |
| Now | 48 | 30 | about 40 to 54 |

The stalled games end with every boss on 15 to 19 Respect and every Bribe card bought, so the last
points come from Jobs. The bots complete about as many Jobs as before (13.6 a game against 15.4), but
mostly 1s: the Extort set and the murder 5s need setup they rarely manage, and the eight 5s pile up in
the Market, which only restocks a gap a claim leaves. One leader sat in his crown room on 19 Respect for
14 Days with $14,500 and nothing left to buy. The bots now claim a card to churn a clogged Market and
price the card that would take them to 20 as the game, which took the crowned share from 10 to 14 in
24 on the same seeds. Whether human tables stall the same way is a playtest question; the bots are weak
at the setup the 3s and 5s ask for, so they are a pessimistic read.

## 32. The 5s are Seizes, so a Fold pays them (2026-10-13, Nick)

A wording change on the eight 5s after the opus-vs-bots-1 playtest (`jobs-setup-handoff.md`, Round 3).
Nothing else in the rules changes.

| Set | Now |
| --- | --- |
| Body counts | "Seize a District from 5+ rival Runners in X": a Seize in the named Borough, from a crew that held **5+ Runners when the Move came in** (Bloody Sunday, Over the Top, Rum Wars, The Butcher's Ledger) |
| Bosses | "Seize a District from a rival Boss in X": a Seize in the named Borough, from a crew with **its Boss in it** when the Move came in (Room 349, The One-Way Ride, The Toll Booth Trap, The Last Hand). **Superseded by §33**: three cut, The Toll Booth Trap a Kill. |

A Fold is a Seize (§30's reading), so a Fold pays both. A kill in a fight the Invader loses pays nothing,
and nothing reads kills any more, which also retires §23.3's question. Bots: a Fold that pays the Invader
a Job is a Respect gift, so stand against longer odds when one of his Jobs names the block.

**Ported the same day** (mk-online 8b1515e, branch `claude/respect-jobs-folding-8lhwdv`): `initiateCombat` records the
defending crew at the door (`defRunnersAtStart`, `defBossesAtStart`) in place of the kill tallies; the
eight evaluators read it with `seizedBy`; the bots' Fold test adds 0.4 to its outnumbered ratio per point
of Respect the Fold would hand over (capped at 2); `scripts/jobs-check.ts` runs a Fold and a won fight
through the real engine. RULES-AI.md says it for the agents.

## 33. The 5s break up (later on 2026-10-13, Nick)

`jobs-setup-handoff.md`, Round 4. Still 36 cards, 16 / 12 / 8.

| Card | Now |
| --- | --- |
| The Toll Booth Trap (5) | "Kill a rival Boss": a rival Boss killed in your own Play's fight, **anywhere**; a Fold denies it (Nick kept the Kill) |
| The Five Families (5) | up from 3, same trigger |
| Opening Night (5) | up from 3: an Unload of **8+ Rum at the High Society Venue in the holder's home Borough** |
| Union Dues (5) | up from 3, same trigger |
| Room 349, The Last Hand | cut |
| The One-Way Ride (3) | "Move your Boss and 4+ Rum across the **Queensboro Bridge**" (East Harlem to Astoria) |
| A Bridge to Sell (3, new) | "Move your Boss and 4+ Rum across the **Brooklyn Bridge**" (the Bowery to Red Hook) |
| The Eviction (3, back) | "Take over a rival's Safehouse": any takeover on your own Play |
| The Extort set (3) | reworded only: "Extort all of the Speakeasies in X", same trigger |
| The Five Families (5), Cuban Prince (3) | reworded only: "Extort a District in all five Boroughs", "Extort 4+ Docks" |
| Body counts (5) | "Seize a District from 5+ rival **Mobsters** in X": the crew at the door counts its Boss too |

The bridge cards read as Hell's Highway does: the Move carries the Boss and 4+ Rum across, whatever the
fight at the far end does. Bots: The Eviction and Union Dues want a takeover, not a raze. The kill tally
comes back for The Toll Booth Trap (`killedRivalBoss`, set only by the Invader's own shots).

**Ported the same day** (mk-online c2e8116, 167d3ce for the Kill, 309ae35 and a5bd194 for the wording, branch `claude/respect-jobs-folding-8lhwdv`): the cards in
`jobs.ts`, the evaluators (`homeRoomOf` for Opening Night, `tookOverRivalSafehouse` for The Eviction, one
`bridgeRun` for the three Bridges), bot plans for the new cards, and `scripts/jobs-check.ts`.

## 34. Extort and the Greed Tax: loud at 5+ (2026-10-14, Nick)

A rule change after the opus-vs-bots-1 playtest ("Raids are too frequent and too punishing"). The
reasoning and the bot numbers are in CLAUDE.md, *Extort and the Greed Tax: loud at 5+*.

| Rule | Was | Now |
| --- | --- | --- |
| Extort's Heat | always, one marker | only when it squeezes **5+ Districts**, one marker |
| Greed Tax | 4+ barrels Unloaded in one Play | **5+ barrels** Unloaded in one Play |

Extort is otherwise unchanged (Power Play, once a Day, $200 per District), and so is Peddle (never the
Greed Tax). The bar 1s keep "Unload 4+ barrels", which is now a quiet sale.

**To port:** `GREED_TAX_THRESHOLD` to 5, an Extort Heat threshold of 5 Districts, and the log's flame
only on a loud Extort. Strings: the Plays panel's Heat flags and Unload form, the play reference's Extort
and Unload rows, the harness's Extort option and RULES-AI.md's Extort row and Heat list. Bots: Extort's
Heat penalty only at 5+ Districts.

**Ported the same day** (mk-online 1eb3a5c, branch `claude/raid-frequency-heat-balance-5mtr7n`):
`GREED_TAX_THRESHOLD` is 5 and `EXTORT_HEAT_DISTRICTS` is 5; the strings and the bots as above.
`scripts/heat-five-check.ts` runs Extorts of 4 and 5 Districts and Unloads of 4 and 5 barrels (the 4s
drew Heat before the change).

## 35. Extort at $100 a District, any number a Day; Collect is gone (2026-10-14, Nick)

After the opus-vipers playtest showed Extort paying 65 to 71% of the winner's cash. Nick: "the game
should rely on the brew engine and the extort path should be a secondary source." The numbers are in
CLAUDE.md, *Extort at $100, and no Collect*.

| Rule | Was | Now |
| --- | --- | --- |
| Extort's pay | $200 per District you Control | **$100** per District you Control |
| Extort's limit | once a Day | none: as often as the Ledger pays for it |
| Collect | Standard Play, 1 Influence, $100 | **cut** |

Extort's Heat is unchanged (one marker at 5+ Districts), and so is Lay Low's $100 per unspent marker.

**Ported the same day** (mk-online PR #10, 43b1302, branch `claude/project-thread-szf9e2`):
`EXTORT_PER_DISTRICT` is 100, `extortedThisDay` is gone, the `collect` move is gone (its $100 is
`LAY_LOW_CASH`), and the bots' tempo-hold (§8.4, now `stayOutScore`) lifts a quiet Play instead of
Collecting. Strings: the Plays panel, the play reference, the harness's options and RULES-AI.md.

## 36. One body count; three brew 5s (2026-10-14, Nick)

`jobs-setup-handoff.md`, Round 5. Still 36 cards, 16 / 12 / 8.

| Card | Now |
| --- | --- |
| The Butcher's Ledger (5) | "Seize a District from 5+ rival Mobsters": **any Borough** |
| Bloody Sunday, Over the Top, Rum Wars | cut |
| The Real McCoy (5, new) | "Trade 8+ Moonshine at a Dock" |
| The Noble Experiment (5, new) | "Unload 8+ Moonshine outside your home Borough" |
| The Warehouse (5, new) | "Secure your Safehouse in a District holding 10+ barrels" |

**To port:** the cards in `jobs.ts`, the evaluators (Trade and Unload counts, the home Borough, the
barrels in the District a Safehouse is Secured in), bot plans, `scripts/jobs-check.ts` and RULES-AI.md.

**Ported the same day** (mk-online PR #10, f995fe7, branch `claude/project-thread-szf9e2`): all of the
above. The bots plan The Real McCoy and The Noble Experiment as staged sales and The Warehouse as a
pile stacked out of a Squad's reach, then a Secure onto it.

## 37. Jobs pay 1, 2 or 3 (2026-10-14, Nick)

`jobs-setup-handoff.md`, Round 6. Still 36 cards, 16 / 12 / 8. Every Job's Respect equals its Stake;
the crown stays at 20.

| Card | Was | Now |
| --- | --- | --- |
| The eight bar 1s | Unload 4+ barrels at <bar> | Unload **5+** barrels at <bar> |
| Every 3 (old scale) | 3 Respect, Stake 2 | **2** Respect, Stake 2 |
| The Smuggler's Run, The Eviction | 3, Stake 2 | **3**, Stake **3** (promoted) |
| Union Dues | 5, Stake 3 | **2**, Stake **2** |
| Opening Night | 5: Unload 8+ Rum at your home room | **2**: Unload **5+** Rum at your home room |
| The Butcher's Ledger | 5: from 5+ rival Mobsters | **3**: from **4+** rival Mobsters |
| The Toll Booth Trap, The Five Families, The Noble Experiment, The Warehouse | 5, Stake 3 | **3**, Stake 3 |
| The Real McCoy | 5 | cut |
| **High Roller** (new) | | **3**, Stake 3: "Seize a High Society Venue." |

"Never two 5s on one Play" is retired: a Play can only pay what its Jobs staked.

**To port:** the cards in `jobs.ts`, the evaluators (the 5+ counts, 4+ defenders, a Seize of a High
Society Venue), bot plans and any Respect thresholds that assumed a 5, the Market's setup split (the
3s shuffled in after the opening Market), `scripts/jobs-check.ts` and RULES-AI.md.

## 38. Mobsters hold turf; two Signature Plays a family, no Traits (2026-10-15, Nick)

**Control.** Only Mobsters (Boss or Runners) Control a District. A Safehouse alone holds nothing: its
District is nobody's, so its barrels are nobody's when a Play ends, its Still is not active, and it
counts for no Extort or Harbormaster. A District holding only a rival Safehouse is **Safe**: walk in
with no Standoff, then take it over or destroy it as before. **Secure** may target it, and a Secure
there is a take over. Secure no longer grants Control. Walking onto a lone rival Safehouse is not a
Seize (nobody Controlled the District). If both crews fall in one volley, nobody Controls the District
and its Safehouse stays.

**Words.** Safe = no rival Mobsters and no Police Squad. Hostile = rival Mobsters. **Padlocked**
replaces Impassable for a District holding a Squad. **Adjacent** replaces Land Connected (same
meaning). Empty and unguarded are retired.

**Traits removed:** Untouchable (Squads may now take the Sicilian Safehouse District), Firepower,
Whispers as a passive peek, Network. **Plays removed:** Plunder, Tunnel.

| Family | Signature Plays |
| --- | --- |
| Sicilians | Hit (2, In a Firefight), Consigliere (1): unchanged |
| Irish | **Tommy Gun** (2, In a Firefight): Open Fire with 1 extra die (max 5) at +1 Threat; Heat only on the first shot. Peddle (1): unchanged |
| Vipers | **Stealth** (1): up to 5 Mobsters, no barrels, into a Connected Hostile District; no Standoff (no Ambush, no Fold), the Occupier Holds Fire. **Whispers** (1, a Play): look at the top card of the Jobs deck in secret; may claim it at once, staking from Reserves; it goes face-up. Left, it stays on top |
| Knights | Skiff (1): unchanged. **Torch** (1, In a Firefight): also sends every barrel in the District to the Supply |

**To port:** Control and every check built on it (brew, Extort, Harbormaster, Unload, Trade, Peddle,
barrel ownership at Play end, Seize), Secure's targets, the Squads' reach (no Untouchable), the four
families' plays and the removed Traits, the bots, the harness options and codec, the UI and RULES-AI.md.

### Ported 2026-10-15 (mk-online 2caaf66, PR #12)

The engine also makes volleys simultaneous, so both crews can fall. A Torch leaves barrels the
Invader carried in. A Fold onto the Invader's lone Safehouse lets the Scramming crew choose first.
`scripts/control-check.ts` covers the Control and take-over cases.

## 39. The Eviction is a Seize (2026-10-15, Nick)

**The Eviction** (3) now reads "Seize a District with a rival's Safehouse, and take it over." Win the
District by fight or Fold, then take the Safehouse over; destroying it pays nothing. Since §38 a walk
onto a lone rival Safehouse is no Seize, and neither is a Secure onto one, so neither pays it. Why:
after §38 a $500 Secure from anywhere paid three Respect, and the card lost the assault it was kept for.

**To port:** the card text, its evaluator (a takeover on a Play that Seized), the bot's plan (no
walk-in), and the jobs checks.

### Ported 2026-10-15 (mk-online, this change)

`scripts/jobs-check.ts` covers a Fold then a takeover (pays), a Fold then destroying it, a walk-in and a
Secure (none pay).

## 40. The Insurance Job up to 2 on any Raid; Union Dues down to 1 (2026-10-15, Nick)

**The Insurance Job** (now 2) reads "Set off a Raid that padlocks a Pressure 1 or 2 Still you
Control." Any Raid the holder's own Play sets off counts: a Rat, or the 5th Heat marker landing as
the Play ends (The Play Is the Unit already counts the Raid a Play sets off, 14.1). The Rat is no
longer required, so the card no longer forces the Rat Card's 3 Respect. **Union Dues** goes down to 1
(text unchanged) to keep the deck 16 / 12 / 8.

Why: at 1 the card cost the Rat Card's 3 Respect plus the District, its barrels and any Safehouse
there. Union Dues was the easiest 2 in 24 bot games (24 of 31 claims finished; next was Cuban
Prince, 21 of 41).

**To port:** both cards' tiers and text, the Raid record (any Raid the active player's Play sets
off, not only a Rat), and the jobs checks.

### Ported 2026-10-15 (mk-online, this change)

`raidPadlockedStillDistrictIds` (was `ratPadlockedStillDistrictIds`) records the mover's padlocked
Stills on any Raid during his Play; `scripts/jobs-check.ts` covers both routes. The bots still plan
only the Rat route.

## 41. The Extort set takes the open Speakeasies; the bar 1s ask 4+ (2026-10-15, Nick)

**The Extort set** (Empire State, The Big Squeeze, King of Queens, The Black Hand) reads "Extort every
open Speakeasy in X". **Open** means not Padlocked (new in the Glossary and in Territory's Blue Wall).
A Borough has one Squad, so two of its three bars are always open. **The bar 1s** read "Unload 4+
barrels at <bar> in <District>" (5+ from 2026-10-14), so a bar 1 is a quiet pour under the Greed Tax.

Why: the Squads start on the High Society Venues, so "all of the Speakeasies" was impossible until a
Squad moved, and the Market froze on these cards in an agent playtest. One Offer a morning is the
bottleneck, so easier 1s and 2s sharpen the Lay Low race rather than handing out points. Bot runs
(40 games, random styles): Extort-set claims finished 35% to 64%, bars 30% to 41%, median crown Day 46
to 39.5.

**To port:** the five texts, the Extort-set check (skip a Padlocked Speakeasy), the bar count, and the
bots' plans for both.

### Ported 2026-10-15 (mk-online, this change)

The card texts in `jobs.ts`; `allBarsIn` skips a Padlocked Speakeasy and the bar 1s count 4+
(`objectives.ts`); the bots plan both; `scripts/jobs-check.ts` covers a Padlocked room and a
Raid-padlocked bar. `RULES-AI.md` defines open.

## 42. Territory wording: the Golden Rule, Adjacent and Connected (2026-10-15, Nick)

Wording only. The Golden Rule of Turf reads "at the end of every Play" (it named Shadows and Sunset).
Connection is two terms, Adjacent (border or Bridge) and Connected (Adjacent, or Dock to Dock); "Water
Connected" is gone. A Rival Safehouse and the Playbooks no longer mention Secure; the Rulebook's Secure
row says a rival's Safehouse there is destroyed. The Blue Wall drops its restatement of Squad movement.

**To port:** nothing. `RULES-AI.md` already says all of it.

## Checklist

> **Audited against the build 2026-08-01, while porting §6.** Everything in §§1–5
> had in fact already landed — the boxes below were simply never ticked, which
> made the file read as a much bigger backlog than it was. Verified in source and
> ticked. **Two real gaps survive** and are called out inline: the Scatter still
> flees dock-to-dock, and the Blood Oath / Volstead variants don't exist in the
> online build at all (so their clauses have nothing to attach to yet).

- [x] Remove the Boss's +1 brew barrel (5.1)
- [x] Implement the relay, land/bridge adjacency only — **not** the dock waterway (5.2, 5.3)
- [x] Prompt for the relay target only when 2+ candidates qualify (5.4)
- [x] Re-tune the bot's Red draft to score total barrels incl. the relay (5.5)
- [x] Remove Bribe block for Rat holder (1.1)
- [x] Remove Rise → clears Rat Card (1.2)
- [x] Subtract 3 Respect at scoring time while holding the card — modifier, never stored (1.3)
- [x] Honor check drops the `ratCard` term; Marks alone bar the crown (1.4)
- [x] Do **not** add an absolution action; a rival Ratting is the only exit (1.5)
- [x] Keep the Rat-repeat block; reword it, the take-card log and the seat tooltip (1.6–1.8)
      — the last two stale "cannot Bribe" strings (seat tooltip, Rat play card) were cleared
      2026-08-01.
- [ ] Blood Oath: −3 flows into combined Respect and into Truce ranking (1.9)
      — **n/a until the variant exists.** mk-online implements no Alliance mode.
- [ ] Volstead: Rat Card keeps the crown-bar there, since Respect isn't tracked (1.10)
      — **n/a until the variant exists.**
- [x] Re-tune bot rat heuristic; strip the can't-Job / can't-win pruning and the pay-vs-wait logic
- [x] Influence floor of 5 (§2) — `INFLUENCE_FLOOR` in data.ts, applied at the Reckoning
- [x] Gate The Empty Casket on an actual Boss death, if implemented (§4) — `riseBossWasDown`
- [ ] **Blood Oath Target is a flat 30** (2026-07-30), not combined Respect +10. Removes the stored
      per-alliance target entirely: compare `combinedRespect >= 30`. Tiebreak is now simply the
      higher combined Respect (was "furthest over its own Target"). Note the −3 Rat modifier (1.9)
      still flows into that combined total. — **n/a until the variant exists.**
- [x] **Brew is per-seat, not two passes** (2026-07-30): each boss drafts a Red AND resolves his
      brew before the next boss drafts. The barrel supply is finite and consumed in seat order, so
      a late seat can be shorted — the order of resolution is now load-bearing, not cosmetic. When
      one player fires several Stills, that player chooses the stocking order (this is the same
      choice as the existing Dry Brew split rule, §5.6).
- [x] **Split the Batch relays over LAND only** (2026-07-30). If the port ever used a generic
      "connected" check, Docks would wrongly relay across water. `Land Connected` = shared border
      or Bridge; `Water Connected` = Dock-to-Dock; plain `Connected` = either.
- [x] **Remove the Boss's +1 brew barrel** (5.1) — reconfirmed 2026-07-30: the Rulebook's Key
      Concepts legend still described the old bonus and has now been corrected, so the tabletop
      files are finally free of it. The build is still the only place it survives.
- [x] **The Scatter is Land Connected only** (2026-07-30). A raided crew flees on foot; Dock-to-Dock
      sea lanes do NOT count, so a Dock with no free land exit is Cornered and the crew is arrested.
      **Combat retreat is unchanged** — Advance/Fold may still cross water via Docks. If the port
      shares one "connected" helper between Raid-flee and combat-retreat, it needs to branch here.
      Ported: `scatterCandidates` in `src/game/raid.ts` reads land connections only (the dock
      lanes are used only for the Squad's own reach). Since 2026-09-30 the crew's owner picks
      among them (`chooseScatter`); see `harness/README.md` in the mk-online repo.
      **Superseded by §17 (2026-10-07): the Scatter now crosses water, and the Squad's reach
      no longer does.**
- [x] **Safehouse +1 Threat, stacking with Ambush** (6.1.1); Torch cost 1 (6.1.2)
- [x] **Ambush: Cost 1 from Ledger, blocked when spent out or Laid Low** (6.2.1); the spent marker
      goes Ledger → Heat Track and keeps its owner (6.2.2); the Irish Plunder-in-place-of-Ambush
      option is **cut** (6.2.3)
- [x] **One Heat marker per firefight, to whoever fired first** — delete heat-on-kills and
      "Occupier never draws Heat" (6.3.1); Hit follows the same first-shot rule (6.3.2)
- [x] **Lay Low is an explicit Cost-0 Play on your turn, never an auto-pass at 0 Influence**
      (6.4.1); after it: no Plays, no incoming loans (6.4.2); Laid Low still answers the Standoff
      and returns fire — fought inside the raider's Play, never Plays of its own (6.4.3)
- [~] **Loans spendable at the Standoff to fund an Ambush; lender's marker becomes the fight's
      Heat** (6.5); lending to Laid-Low players stays blocked — *nothing to port: mk-online has
      never implemented Puppeteering/Cooperation, so there are no loans to widen or block. The
      half that matters when they land is already in place: the Ambush's duck check reads the
      Ledger live at the Standoff (`canAmbush`), so a marker arriving from anywhere re-arms a
      spent-out defender with no further change, and a Laid-Low crew is barred by its own flag
      regardless of where the marker came from. What a loan port must add is the lender-owned
      Heat marker (the existing `heat.push({ owner })` already carries identity, so pass the
      lender) and the lending block against Laid-Low players.*
- [x] **Bots: respect the Ambush gate and explicit Lay Low; re-tune fold/ambush and lay-low
      timing** (6.6) — bots never propose a blocked Ambush (which the engine would reject, looping
      them), fold sooner as a duck, hold fire on small garrisons now the shot costs a marker plus
      Heat-ownership, rob the crossing as the Irish, price a duck target into attack candidates,
      and discount the lay-low race by how many markers rivals still hold.
- [x] **Puppeteering cut (§7)** — nothing to port: Cooperation never existed in the build. The
      loan caveats woven through §6 (the 6.2.1 re-arm path, the 6.4.2 loan block, all of 6.5)
      are dead letters; do not implement them when porting anything else.
- [ ] **If deals ship online: Welsher cards (§7.5)** — per-player count, −1 Respect each at
      scoring time (never stored), supply of 8, no removal path.
- [ ] **Collect: new Standard Play, Cost 1 (§8)** — add to the action enum; effect is marker
      Ledger → Reserves (never Heat) plus **+$100**; offered whenever a Cost-1 Play is affordable,
      never at 0 Influence.
- [ ] **Retire the "Odd Jobs" label on the Lay Low cash-out (§8.3)** — the mechanic ($100 ×
      unspent markers, clear to Reserves) is unchanged; only the surfaced string changes.
- [ ] **Bots: Collect as the tempo-hold move (§8.4)** — take it only to hold the street for a
      higher Turn Token when no value Play exists; never for the (neutral) cash; guard the loop.
- [ ] **Unified liquor market (§9)**: the address sets the price (any Speakeasy \$300, the
      Hotspot \$500) and the barrel sets the Kickback (every Rum barrel, at every address).
      No liquor-type check on a sale. Rum pool 15 → 20. Deed tiebreak deleted. Night Mayor
      cannot move a token onto a padlocked Speakeasy. **Peddle is Moonshine only** (9.6),
      and bot Rum valuation is unconditional, not access-gated (9.8).
- [ ] **Rise is Ward-only, and only with the Boss off the board** (11.1)
- [ ] **The Offers no longer test for a Boss** (11.2)
- [ ] **A Boss in a High Society Venue is a victory term** (11.3), checked, never stored
- [ ] **Blood Oath: partners may attack each other** (11.4), variant not built yet
- [ ] **Blood Oath: a partner is not a rival for Jobs** (11.5), variant not built yet
- [ ] **Blood Oath: one Boss crowns the Alliance, a lone Boss crowns the man** (11.6)
- [ ] **Bribe requires a Boss on the board** (11.7)
- [ ] **Bots: re-price decapitation, and price it highest against a rival near 20** (11.8)
- [ ] **Jobs are checked for the active player only**, fight and self-set-off Raid included (§14)
- [ ] **If deals ship online: expired Handshakes become Welshers first thing at Sunset** (§15)
- [ ] **Take the Crown replaces the Sunset victory test** (16.1 to 16.3): the Nod pays no Respect,
      Respect ≥ 10, Final Standoff and Loose Change deleted
- [ ] **Blood Oath: 20 combined, the crowning partner holds the Nod and is Capo** (16.4), variant not built yet
- [ ] **Bots: the Nod is the win key; never trust a Sunset payment from a player who can crown** (16.5)
- [x] **The Scatter crosses water** (17.1, 17.2): `scatterCandidates` uses the Fold test, Docks included
- [x] **Bots: a Dock crew can't be cornered; corner at Coney Island and Morris Park** (17.3)
- [x] **A Squad's reach is Land Connected only** (17.4): no Dock-to-Dock hop inside its Borough
- [x] **Starting turf: the North on 8, 9, 10; the South on 4, 5, 6** (§18)
- [x] **The Market restocks after the Offers** (19.1); the opening Market is face-down and Day 1 has no Offers (19.2)
- [x] **Bots: no refill mid-Offers** (19.3): the Vipers' `revealValue` is gone
- [x] **Bots: value the late token's first pick on today's Market** (19.3, with the §8.4 Collect motive)
- [x] **Stealth blocks the Ambush, not the Fold** (§20): it opens on the Occupier's answer
- [x] **A Fold Scrams: never to the block the Invader came from** (§21)
- [x] **Movement wording: Advance's barrel choice reachable online, Stealth Hostile, Skiff's inland list** (§22)
- [x] **Rulebook wording gaps: nothing to port; Collect, Extort and Open Fire text matched** (§23)
- [x] **Torch draws Heat only as the fight's first shot; dice named Red and White** (§24)
- [x] **Destroy, not raze, in every string** (§25)
- [x] **Empty, unguarded, barrels in every string** (§26)
- [x] **Peddle at $200 with no Greed Tax; bots sell the whole pile** (§27)
- [x] **The Jobs deck rewrite: new triggers, and The Smuggler's Run 3 / Union Dues 5** (§28; ported as §30's deck)
- [x] **Borough cards: no crown in your home Borough** (§29; the Nod half retired with §31)
- [x] **The Jobs deck in sets: 36 cards, every 5 a killing** (§30; supersedes §28's card list)
- [x] **Respect is the only score: crown at 20, Bribe cards, Mark -2, Rat -3** (§31; the Blood Oath's 40 waits on the variant, which mk-online doesn't have)
- [x] **Extort draws Heat only at 5+ Districts; the Greed Tax at 5+ barrels** (§34)
- [x] **Extort at $100 per District, any number a Day; Collect cut** (§35)
- [x] **Jobs pay 1, 2 or 3; High Roller in, The Real McCoy out** (§37; mk-online PR #11)
