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

## Checklist

- [ ] Remove Bribe block for Rat holder (1.1)
- [ ] Remove Rise → clears Rat Card (1.2)
- [ ] Subtract 3 Respect at scoring time while holding the card — modifier, never stored (1.3)
- [ ] Honor check drops the `ratCard` term; Marks alone bar the crown (1.4)
- [ ] Do **not** add an absolution action; a rival Ratting is the only exit (1.5)
- [ ] Keep the Rat-repeat block; reword it, the take-card log and the seat tooltip (1.6–1.8)
- [ ] Blood Oath: −3 flows into combined Respect and into Sit-Down ranking (1.9)
- [ ] Volstead: Rat Card keeps the crown-bar there, since Respect isn't tracked (1.10)
- [ ] Re-tune bot rat heuristic; strip the can't-Job / can't-win pruning and the pay-vs-wait logic
- [ ] Influence floor of 5 (§2) — no longer urgent, but keep it queued
- [ ] Gate The Empty Casket on an actual Boss death, if implemented (§4)
