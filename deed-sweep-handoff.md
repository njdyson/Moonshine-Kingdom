# Deeds and the Sweep: an open proposal

**Status: undecided. Nothing here is implemented, and nothing here should be implemented
without Nick saying so.** The Sweep and the Sicilians' Untouchable trait both still read as
they always have. This file exists so the reasoning survives the session it happened in.

Last worked: 2026-08-06.

## The proposal

Drop the Sicilian **Untouchable** trait, replacing it with something to be decided, and
instead make the **Sweep skip any Borough whose Deed you hold**.

The goal is a true home turf distinction, and to make Borough Deeds matter continuously
rather than only as 2 Respect at the final count. It also couples into the Hotspot Deed
tiebreaker and, through it, the Night Mayor.

## Where it stands

Settled:

- **Untouchable has to go**, not be rescoped. Rescoping it to "every Borough is home turf to
  you" was considered and rejected. Under the new general rule the Sweep would only bite in
  the minority of districts a player holds outside their own Deed Boroughs, so the trait
  becomes vestigial; it is worse still at two players, where each boss holds more Deeds; and
  it makes Deeds nearly worthless to the Sicilians during play, pure denial, which defeats
  the entire point of the redesign for one seat.
- **A raised cap of 7 is rejected.** It was proposed off an over-priced fear (see below) and
  it adds a second number to remember for a problem the Deed already solves.
- **Staten's Deed goes to the Supply.** Done in a separate commit, for its own reasons.

Open:

- Whether the rule ships at all. Nick is not sold.
- If it ships: uncapped, or some other shape.
- **The order swap.** Reckoning currently runs Sweep, then Stake Your Claim, so the Sweep
  reads yesterday's Deeds. Swapping to Claim then Sweep is safe, because the Sweep removes
  Runners but never changes who Controls a District, so Deed counting is unaffected either
  way. Nick is tempted, for the desperation it creates: win this fight or be arrested at
  nightfall. See the finding below; the swap is load bearing, not flavour.
- **The Sicilian replacement.** Blocked on the decision above. Two candidates:
  - **On the Payroll.** A Police Squad never padlocks your Speakeasy or Still. The block
    stays Impassable, but the business runs. Keeps their existing flavour line verbatim,
    since the precinct captains are already on the payroll in their current text, and it is
    sharpest exactly where Squads start, on the Hotspot Speakeasies and the 7 boilers.
  - **Old Blood.** Rise costs 1 instead of 2. Duller, very hard to break, and a neat
    counterweight to their own Hit.
  - Avoid a tribute or tax trait, which echoes Ward Boss's Union Fee, and avoid "wins ties",
    which collides with the Hotspot Deed tiebreaker.

## What the modelling says

Run it yourself:

```
node tools/sim_deed_sweep.js          # or --quick
```

That drives the Brew and Combat Simulators' own maths, extracted from the component HTML at
runtime rather than copied, so it tracks the components or fails loudly. It reproduces the
Kingpin's Guide's published figures exactly (Boss + 6 behind a Safehouse holds 70%).

**The economy effect is modest.** Best crewing of 16 men, capped at 5 versus uncapped:
about +$230 to +$350 a day, and **exactly zero on three matching boilers**. The Muscle Ratio
is concave, so nine men on one boiler (5 barrels) equals five plus four on two matching
boilers (3 + 2). The rule pays narrow builds and pays breadth nothing.

**The garrison effect is a phase change.** Against the biggest raid a day can mass, a
defender behind a Safehouse is taken 70.6% of the time at 5 men, 49.0% at 6, and **9.1% at
7**. The mechanism is the dice bands (1-2, 3-4, 5-6, 7-8, 9+): today's cap of 5 parks every
defender in the 3 dice band, and 7 men crosses into 4 dice.

**But the 15 Runner budget does the balancing.** This is the part that matters, and it is
why the alarming garrison numbers do not mean what they first appear to:

- A 9 man keep spends 9 of your 16. The thin blocks left behind fall to a Boss + 3 raid at
  3 Influence: 83.7% against two Runners, 78.5% against two Runners and a Safehouse.
- Deeds are counted in **districts, not bodies**, so the fortress protects the fortress, not
  the Deed. Take two districts in the Borough and the Deed changes hands at Stake Your
  Claim, and the stack that was legal all game is culled to five that same night without a
  shot fired. The rule polices itself, through the Deed rather than through combat.
- The keep cannot leave home. A 9 man stack attacking a standard 5 man garrison takes it
  33.9% at 3 Influence and **loses 6.6 of its 9 men**. It is defensive only; the moment it
  moves it evaporates.

**The attacker is not dice capped, only band capped.** Anything from 9 men upward rolls the
same five dice, but bodies still matter enormously through attrition: against a 7 man
garrison at equal Influence, Boss + 9 takes it 14.6% while Boss + 14 takes it 92.8%. A 9 man
keep facing a full crew commitment is about 42%, a coin flip, not a wall.

## Two consequences worth carrying forward

**The order swap is load bearing.** Cracking a 7 man home garrison needs a near full crew.
If the Sweep ran first, that assault into a rival's Deed Borough would be culled to 5 at
nightfall even when it succeeded, because the attacker does not hold that Deed yet. Home
turf would wall off the map. Running Claim first means winning the Borough transfers the
Deed and the army survives. If the rule ships, the swap ships with it.

**Staten Island changed under this proposal.** When the Deed/Sweep idea was first discussed,
Staten's Deed was boxed at setup, so Staten would have been the one Borough nobody could
ever fortify. Its Deed now sits in the Supply, so whoever takes the island can hold its Deed
and fortify it. Staten is also the only Borough with **no Police Squad**, and it carries a
rich scattering of Respect across the Jobs deck. Under an uncapped rule it becomes the only
place on the map where an unsweepable garrison can sit with no Squad ever arriving to break
it up. That may well be a feature, since it gives the empty island a reason to be fought
over, but it was not part of the picture when the proposal was first weighed.
