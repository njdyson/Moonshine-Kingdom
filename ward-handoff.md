# Giving the Ward a job: the Boss takes the chair

**Status: proposal, not implemented.** Nothing in the player-facing set has changed.

Last worked: 2026-09-17.

## The problem

Since the Ward Boss Title and the Union Fee were cut, a Ward does almost nothing. The audit
across the player-facing set:

| Component | Ward mentions | What they are |
| --- | --- | --- |
| Cards | 0 | |
| Playbooks | 1 | the Irish Peddle |
| Kingpin's Guide | 2 | Peddle, and a note that a Safehouse creeping into a rival's Ward is a tell |
| Rulebook | 4 | the map blurb, setup, Peddle twice |
| Town Planner | 6 | the zone column in the District Roster |

For three of the four mobs a Ward is a label on a table. The Guide, which is where turf gets its
meaning, has no Ward passage at all. Meanwhile the Rulebook's map blurb still promises "every one
is a crossroads worth holding", which is the cut Title talking.

There are **five** Wards, not four: Five Points, Hunts Point, Corona, Brownsville, and
**Stapleton** on Staten Island, which is nobody's home turf and carries no setup marker.

## The rule

Change **Rise** from "Place your Boss in any Safe District" to:

> **Rise: place your Boss in any Safe Ward.**

Everything else about Rise is unchanged: it still costs 2 Influence as a Power Play, still
relocates a living Boss or anoints a successor to a dead one.

**The load-bearing word is Safe, not Controlled.** The Rulebook defines Safe Districts as "any
District you Control, plus any Defenseless block: no rival Mobsters, no Police Squad, and no rival
Safehouse." So a crew holding no Ward can still Rise into any undefended Ward, Stapleton included.
Written as "a Ward you Control" instead, the rule becomes a hard lockout and should not ship.

The Boss can still **walk** anywhere by Move, so the Guide's Boss-walking tactics are untouched.
What the rule charges for is the cheap teleport and the respawn address.

## Why it has teeth

The Boss anchors **Split the Batch**, which fires off the Still in his District. Under the rule his
Still is always one of:

| Ward | Still |
| --- | --- |
| Five Points | 10 |
| Hunts Point | 9 |
| Stapleton | 6 |
| Brownsville | 5 |
| Corona | 4 |

That plugs Wards into the game the Guide already analyses at length: the public Mash, the
Harbormaster, and walking the Boss to whichever end tomorrow's Mash feeds. A crew's home Ward now
shapes its brewing character from setup. Stapleton at 6 is the median of the five, on the island
the Guide already calls the quiet road, so the neutral Ward becomes a real prize under a hostile
Harbormaster rather than a curiosity.

## The denial play, and why it is healthy

The Rulebook already locks a Bossless crew out of the Jobs economy, in Shadows step 3: "No Boss,
no business: A crew with no Boss skips this step entirely." The Guide already builds on it:
killing a rival's Boss "deletes him from tomorrow's queue."

So the lockout is not new. What the rule changes is the price of the cure: today it is one Play to
Rise anywhere Safe, and under the rule it is one Play **and a Safe Ward**. That turns a tempo hit
into something the table can extend.

Costing it out: keeping a Boss down needs all five Wards un-Safe for him at once, so a Mobster, a
Police Squad or a rival Safehouse on each. In a normal 3-4 player game every player sits on their
own Ward, so the lock needs three things together: his Boss dead, his own Ward taken off him, and
Stapleton covered. That is expensive, highly visible, and usually needs more than one player to
hold. The counter is real but costly, since at −1 Threat he must win a fight for a tenement he
used to own.

**This lands on a known gap.** `rules-streamline-handoff.md` recorded that the one real loss in
cutting the Deeds was contestable Respect, and that the leader-check would have to come from
elsewhere. This is elsewhere: a check on a runaway that comes out of positional play rather than a
scoring rule, with Stapleton as the pressure valve that stops it being permanent.

## The risk

It makes players garrison the Boss harder, because his death costs more. That pushes toward
stacking, which is exactly the fortress question the Sweep cull left open, so two threads that
were independent become coupled. `tools/sim_deed_sweep.js` is the tool if the interaction needs
modelling.

## The loose end

**The Empty Casket** reads "Rise your Boss into a Defenseless District in a Borough where you
Control no other District." Under the rule that narrows to a Defenseless *Ward* in a Borough where
you hold nothing else, since each Borough has exactly one. Still completable, considerably
tighter. It wants either a reword or a decision that the tighter version is fine.

The only other Job naming the Boss is **The Toll Booth Trap** ("kill a rival Boss in Queens, with
your own Boss in the fight"), which is unaffected.

## Rejected alternatives, so they are not reopened

| Idea | Why it was cut |
| --- | --- |
| Recruit only in a Ward you Control | Hard lockout. No Ward means no army, so no way to take a Ward |
| Recruit at your Safehouse **or** a Ward | No teeth. The Safehouse rarely moves, since Secure at $500 is an important cash sink, so it almost never differs from today |
| A Recruit discount in a Ward | Unexciting and fiddly |
| A Ward as a Scatter sanctuary, fleeing there ignoring adjacency | Too easy an escape, and it takes the bite out of Cornered. It would also give the Ward idea a second home and dilute both |

## If it ships

The player-facing set to change: the **Rulebook** (the Rise Play, and the map blurb's promise about
crossroads, which this rule finally makes true), the **Cards** sheet (Rise), the **Playbooks**
(Rise in the Play reference), the **Kingpin's Guide** (the Rise passage, the "No Boss, no business"
passage, and the Ward chapter it has never had), and the **Jobs Cards** if The Empty Casket is
reworded. The Town Planner needs nothing, since the zone column already names every Ward.

Note the Irish gain a second reason to want Wards, on top of Peddle. That reads as strengthening
the tenement mob's identity rather than diluting it, but their Playbook is worth a look if this
ships.
