# mk-online: rules sync backlog

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
| 1.9 | — | **Blood Oath, if implemented:** the −3 lands in the Alliance's *combined* Respect, and the Sit-Down ranks on current Respect — so the card in a player's hand at Crackdown 10 can change which pairs form. Both fall out of scoring correctly if 1.3 is a scoring-time modifier; both break if it is stored. |
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

## 3. Rise

Confirmed **unchanged** in v0.9 — it keeps its flexible form: place your Boss in
any Safe District, relocating him if he was already on the board and anointing a
successor if he was not.

The only edit is the removal of its Rat-clearing side effect (§1.2). Flavour text
in the tabletop files was rewritten to cover both duties rather than only
succession; mk-online has no equivalent prose to update.

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
the Kingpin's Guide "Duck Window" section for the human-readable strategy the bots should at least
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
- [ ] Blood Oath: −3 flows into combined Respect and into Sit-Down ranking (1.9)
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
- [ ] **The Scatter is Land Connected only** (2026-07-30). A raided crew flees on foot; Dock-to-Dock
      sea lanes do NOT count, so a Dock with no free land exit is Cornered and the crew is arrested.
      **Combat retreat is unchanged** — Advance/Fold may still cross water via Docks. If the port
      shares one "connected" helper between Raid-flee and combat-retreat, it needs to branch here.
      — **STILL OPEN, and the one live divergence left outside the variants.** The helpers are
      already separate, so the branch is not needed: `safeFleeDistrict` in `src/game/raid.ts` is
      raid-only, and it is the single place that appends the dock-to-dock neighbours. Dropping
      that loop ports the rule; combat's Advance/Fold path is untouched by it.
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
