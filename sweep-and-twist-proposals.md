# Two Proposals: The Conditional Sweep, and the Boss's Ear

Design notes, parked for later. Neither is implemented. Numbers come from the
`Brew Simulator v0.9.html` engine run headlessly with modified parameters
(400k-500k days per cell, 4-player contested draft, barrels $300, Recruit $300,
Boss-loss tempo penalty $800) — same model that produced the Kingpin's Guide
economy table, so figures are directly comparable to it.

Reproduce with `node tools/balance_sim.js all` (or `caps` / `heat` / `twist`).
Monte Carlo noise is around ±1%, so treat the last few dollars of any figure as
slack, not signal.

---

## Proposal 1: The Sweep only fires when the Heat Track is at 2+

### The rule

> **1. The Sweep.** *The cops can ignore a crew. They can't ignore an army — not
> while the whole city is shouting.* If the Heat Track holds **2 or more**
> markers, then in any District with more than 5 Mobsters, remove excess Runners
> to bring the count down to 5. *(The Sicilian Syndicate is Untouchable and
> ignores the Sweep entirely.)*

One line. Printable on the Heat Track itself: mark space 2 as the Sweep line.

### What it actually changes

Not the fortress game, and not the top of the economy. The Sweep is an
**economic cap on scarce numbers only**, because the ceiling on a build is
`stills of that number × cap`, and the board hands out stills unevenly
(7×4 | 4,6×3 | 2,3,5,8,9,10,11×2 | 12×1).

Net $/Day, roster reallocated to fill each cap, rolled Mash (men used in brackets):

| Build | cap 5 | cap 7 | cap 9 |
|---|---|---|---|
| four 7s (4 stills) | $1,254 (16m) | $1,251 (16m) | $1,260 (16m) |
| three 6s (3 stills) | $949 (15m) | $946 (16m) | $948 (16m) |
| **two 8s (2 stills)** | **$659** (10m) | $849 (14m) | **$950** (16m) |
| **two 3s (2 stills)** | **$265** (10m) | $341 (14m) | **$379** (16m) |
| one 12 (1 still) | $74 (5m) | $94 (7m) | $113 (9m) |

The four-7 wall is **flat across every cap** — four stills at 5 apiece is 20
slots and the roster is 16 men, so the Sweep never binds on it. The 2-still
clumps gain ~44%. Lifting the cap is a targeted buff to exactly the builds the
Kingpin's Guide currently writes off, and it is invisible to the dominant one.

The concentration is self-limiting: Respect comes from Borough Deeds and Titles,
both counts of Districts held, so men on a boiler are men off the turf that
wins. The trade is brew money (which gates the $10,000 Bribe clock to the
Commission) against Respect. Roughly a 15-day clock at $659/day versus 10 days
at $950/day.

### Why the threshold is 2, not 3

The track is bounded above by the Raid — it can never *sit* at 5, because the
5th marker resets it to 0. Reachable end-of-day states are 0-4, so "3 or more"
is 2 states out of 5 ≈ 40%, and the resets keep dragging the reading down.

Heat modelled as Poisson events per Day, reset on the 5th, sampled at Reckoning.
`caution` = chance a player declines a heat-drawing Play while the track sits at 4:

| heat/day | caution | avg track | **thr 2** | thr 3 | thr 4 |
|---|---|---|---|---|---|
| 1.5 | 0 | 1.41 | 42% | 17% | 5% |
| 2 | 0 | 1.74 | 55% | 27% | 9% |
| 2.5 | 0.5 | 2.10 | 65% | 39% | 18% |
| 3 | 0.5 | 2.29 | 70% | 46% | 24% |
| 4 | 0.5 | 2.44 | 72% | 53% | 32% |

- Threshold 3 **saturates around 53%** and cannot reach 60% at any heat rate.
- Threshold 2 lands in the 55-70% band for a plausible 2-3 markers/day.
- Careful play *raises* the reading by 5-9 points: declining the play at 4 is
  exactly what prevents the reset. Caution keeps the city hot.

Threshold 2 also protects the Sicilians. At threshold 3 the Sweep is off on
60-70% of nights and Untouchable is dead most of the game; at threshold 2 it's
off ~35-45%. Untouchable on an 8-pair is worth ~$291/Day, so the leak to rivals
roughly halves.

### Knock-on effects

- **Consigliere gains a second job.** For 1 Influence the Sicilians can drop the
  track below the line and switch the Sweep off for the whole table — a service
  they can sell, and one they're immune to needing. Their identity shifts from a
  flat immunity to controlling the city's temperature.
- **The leader has to stay loud.** A four-7 player loses nothing to the Sweep
  and everything to rivals escaping it, so they want the track above the line —
  which means making noise, which puts their marker furthest right and paints
  them as the Raid target. Suppressing the underdogs costs the leader exposure.
- **Underdogs buy the buff with passivity.** Wanting the city quiet means no
  Extort, no firefights, forgoing the loud income.
- **The last boss standing holds the dial**, deciding whether the track ends the
  Day at 1 or 2 — a second lever for the last seat, rhyming with "the last seat
  holds the match" on Blowback.
- **Post-Raid is deliberately Sweep-free.** The track clears in the Aftermath, so
  the night the doors came off ends below the line: the police are at the
  precinct filling in paperwork. Refugees bunched by Run For It survive to dawn
  — where Blowback casualties scale to 5. The boiler collects what the cops
  didn't, with no new rules written.
- **Rat can still flush the track before Reckoning** to protect a stack, but it
  costs a permanent −3 Respect and is one-shot while held. Not a repeatable
  loophole.

### Open question

The whole thing rests on the real heat rate. Count the track at Reckoning across
two or three games before committing — that number picks the threshold, and
nothing in the current files can predict it.

---

## Proposal 2: Twist the Valves — the Boss's Still fires on adjacent numbers

### The rule

> **Twist the Valves:** If your Boss stands in a District when its Still fires,
> that Still brews **+1 Barrel**. His Still also fires on either number
> **adjacent** to your Brew Number. *The old man knows the boiler by its sound,
> and coaxes a run out of it on a morning it had no business lighting.*

Blowback is untouched: the Boss's Still still bursts only on an exact match with
the Blowback Number. The reward widens; the risk does not.

### The problem it solves

At +1, the current bonus is worth **+$102/Day** on a 7-stack — about 8% of daily
net for a 1-in-13 chance of losing the Boss. On the 6/7/8 mismatch, where the
extra barrel is most wanted, it's worth **+$14/Day**: the 12.8% Boss-loss rate
eats the entire reward. Not a gamble, a decoration.

### Why not the alternatives

- **Double, or +3.** Test near-identically to each other on a 5-man boiler
  (double = +3 there). Both are near-dead on a thin boiler (double 1 = +1), both
  scale with crew size so they push every build toward the same maxed stacks,
  and both explode if the Sweep cap ever lifts (9 men → 10 barrels).
- **Flat +2.** Works, but hands its biggest absolute gain to the four-7 wall,
  which is already dominant.
- **Making it a declared Play.** Dies on arrival: a Standard Play is worth
  several hundred dollars at minimum (Extort alone is $200 × Districts), so a
  Play plus an Influence for +2 barrels ($600) is roughly break-even before the
  Boss risk, and it would be repaid every Day. The declaration already exists
  anyway — the Boss arrives by Move or Rise on the previous Day, with tomorrow's
  Mash public. It's just invisible, because the payout is too flat to notice.
- **Bursting on ±1 as well.** Symmetrical and thematically lovely; the Boss dies
  on 38-44% of mornings and every build goes negative. Binned.

### The numbers

Net $/Day, Boss-loss rate identical in every cell (7.6% / 12.8% / 6.4% / 2.5%) —
this buys more reward at unchanged risk.

| Build | +1 (current) | +2 | ±1 fire only | **±1 fire, keep +1** |
|---|---|---|---|---|
| four 7s | $1,248 | $1,394 | $1,277 | **$1,464** |
| 6/7/8 mismatch | $399 | $475 | $634 | **$819** |
| two 8s | $659 | $777 | $714 | **$884** |
| spread 3+9 | $379 | $426 | $398 | **$466** |
| *two 8s, hostile Harbormaster* | *$0* | *$0* | *$150* | ***$199*** |

The four-7 wall gains ~17%; the mismatched build **doubles**. The Boss's worth
becomes a function of the shape of your empire — near-nothing on a clump,
transformative on a spread — which is a genuine positional decision that costs
zero seconds at the table and no components. Nothing to track beyond where the
Boss is already standing.

### The cost

It blunts the Harbormaster lockout. The Guide's showpiece row — the 8-clump at
exactly $0 under a hostile crown — becomes $199. One boiler gets a lifeline
instead of a blank morning. Probably healthy, but losing the clean zero is a
real loss to a signature dynamic, and worth deciding on deliberately.

---

## If both go in

They interact once: under Proposal 1 a scarce-number clump can crew past 5, and
under Proposal 2 the Boss's Still fires on three numbers instead of one. A
9-man 8-boiler with the Boss brews 5 + 1 = 6 barrels and is live on three faces.
It is also five casualties deep if the Blowback lands on it, and it is two
Districts' worth of Respect conceded. Worth one look at the sim before shipping
both together, but the counterweights look sound.
