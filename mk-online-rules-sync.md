# mk-online: rules sync backlog

Rules changes landed in the tabletop files that **mk-online does not yet
implement**. The web build in `mk-online/dist` is a compiled bundle; the source
lives elsewhere, so this is written against observable behaviour and log strings
rather than line numbers.

Nothing here is a bug in the current build. It is a list of places where the
deployed game and the v0.9 rulebook have diverged, and what has to change to
close the gap.

---

## 1. The Rat Card (2026-07-24)

The Rat's penalty and its exit condition both changed. The old rule tied the
brand to the Boss; the new rule severs that link entirely.

### What changed, and why

The card used to clear only when you spent a **Rise**. That made the penalty a
*price* rather than a *duration*, and any price is payable at a moment of your
choosing, so the rat simply picked a cheap one. Worse, Rise doubles as a Boss
relocation you often wanted anyway, so laundering the brand frequently cost
nothing at all.

The penalty also used to be **"cannot Bribe"**, which shared an account with the
shed cost and produced a hard lock: a boss at 5 Influence holding the card could
not shed (floor) and could not Bribe (card), leaving no self-service exit and
handing rivals a kingmaking veto.

So: the penalty moved to **Jobs**, and the exit became **cash-for-a-marker**.

### Required changes

| # | Behaviour | Now |
|---|-----------|-----|
| 1.1 | Bribe is blocked while `ratCard === player`. Log: *"Bribe failed: the Commission won't take a Rat's envelope. Rise a new Boss first."* | **Remove the block entirely.** A rat may Bribe freely. |
| 1.2 | Rise clears the card. Log: *"P{n} Rises a new Boss — the Rat Card returns to the supply."* | **Remove.** Rise no longer touches the Rat Card in any way. |
| 1.3 | — | **New:** while holding the card, the player **cannot Take a Job** at The Offers. They may still **Walk Away** from a Job they already hold, and this must stay available — it is the only release valve for staked Influence. |
| 1.4 | — | **New action, "buy absolution":** return **1 Influence marker from Reserves** to the supply and discard the Rat Card. Available at any time, not a Play, and it costs no Influence to *use* beyond the marker it destroys. Requires a marker actually sitting in Reserves. |
| 1.5 | — | **New:** an Influence **floor of 5**. Absolution is illegal if it would take the player below 5 total. See §2. |
| 1.6 | Rat is blocked while already holding the card. Log: *"Rat failed: you already hold the Rat Card (cannot Rat again until you Rise)."* | **Keep the block, change the message** — Rise is no longer the exit. |
| 1.7 | Log on taking the card: *"Cannot Bribe, Rat, or be crowned until you Rise."* | Reword: cannot take Jobs, cannot Rat, cannot be crowned. |
| 1.8 | Seat-tab tooltip: *"Holds the Rat Card: cannot Bribe, Rat, or be crowned until they Rise a new Boss"* | Same reword. |

### Unchanged

- The **hot potato** stands. `ratCard` remains a single holder; a rival who Rats
  still snatches it. That is now the *free* exit, and waiting for it is a
  deliberate gamble against needing the Market sooner.
- The **honor check** on victory (`ratCard !== player && shylockMarks === 0`) is
  correct as written and needs no edit.
- The Rat Play still costs 2 Influence and still triggers a Raid.

### Bot AI

The rat heuristic scores a bonus of `-4` when the bot does not already hold the
card. That number was tuned against "no Bribes until you Rise" and no longer
describes the cost. It needs re-tuning against the new shape, which is roughly:

- **Cheap early** — a bot with a thin Respect pile and no Job it urgently wants
  loses almost nothing, so ratting should be *more* attractive than it is now.
- **Expensive late** — the cost is a frozen Respect engine plus, if it cannot
  wait for a rival, a rung off the Influence ladder and $2,500 to climb back.
  Ratting at 8–10 Influence should be strongly discouraged.

The bot also needs to understand absolution as an option, and to weigh "wait for
a rival to Rat" against "pay the marker now" — the interesting decision the rule
creates. A bot that always pays immediately will misplay it badly.

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
- Adding absolution (§1.4) **introduces the path**, which is why the floor must
  land in the same change, not after it.
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

- [ ] Influence floor of 5 enforced globally (§2)
- [ ] Remove Bribe block for Rat holder (1.1)
- [ ] Remove Rise → clears Rat Card (1.2)
- [ ] Block Take a Job for Rat holder; keep Walk Away (1.3)
- [ ] Add "buy absolution" action, Reserves-only, floor-aware (1.4, 1.5)
- [ ] Reword Rat-repeat block, take-card log, seat-tab tooltip (1.6–1.8)
- [ ] Re-tune bot rat heuristic; teach it absolution and the waiting game
- [ ] Gate The Empty Casket on an actual Boss death, if implemented (§4)
