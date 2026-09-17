# The 2-player mode: North vs South

**Status: proposal, not implemented.** Nothing in the player-facing set has changed. This file
records the shape the mode is taking and the map data behind it, so the reasoning survives.

Last worked: 2026-09-17.

## The premise

Two players, one half of the city each. Jobs leave the box entirely, so there is no Respect and
no Jobs Market. What is left is brewing, selling, moving muscle and holding ground, which is the
economic and positional core of the game with the politics stripped out. The target feel is
chess: one objective, perfect information, and every strong move creating a weakness.

## Reconcile with The Volstead Act first

**A 2-player variant already ships in this repo**, and the first draft of this file did not
account for it. `The Volstead Act v0.9.html` is a 2-player prequel that already does most of the
scaffolding proposed here:

| | The Volstead Act | This proposal |
| --- | --- | --- |
| Players | 2 | 2 |
| Jobs and Respect | cut, The Offers skipped | cut, The Offers skipped |
| Map | standard setup, one home Borough each, empty half is the point | North vs South, two Boroughs each, Staten closed |
| The Mash | most Docks sets it, tied lead rolls | same, which is now the core rule |
| Clock | Federal Crackdown Tracker, ends at space 10 | same |
| Heat | 3-space fuse, Greed Tax at 3+, Extort unavailable | open, see below |
| The Rat | kept; the Card bars the crown outright in place of 2 Respect | proposed cut |
| Win | all 10 Influence with honor, or richest honest Kingpin at the Count | all four Wards at a Sunset |

So the Crackdown clock, the no-Jobs no-Respect frame and the Dock-sets-the-Mash rule are not new
ideas here, they are Volstead's, and it also solves a problem this file left open: with no Respect
to dock, Volstead makes the Rat Card **bar the crown outright**, exactly as an unpaid Mark does.
That is a better answer than cutting the Rat, and it argues for keeping the Rat Play, which also
preserves an on-demand Raid trigger for opening the High Society Venues.

Volstead is marked unplaytested and was deliberately pulled from the core book. Two genuinely new
things remain in this proposal: the **North vs South split**, which Volstead does not have, and
the **Ward objective**, which is a real improvement on Volstead's "richest honest Kingpin", since
a bankroll count is the weakest possible ending for a positional game.

**The decision to make before any of this is drafted into a component:** is the North/South mode a
second edition of The Volstead Act, or a separate variant sitting beside it? Two competing
2-player modes in one box is worse than either alone. The recommendation is to fold this into
Volstead and keep its era framing, its honor rule and its Rat ruling, and replace its map handling
and its win conditions.

## The halves

**North: Manhattan and The Bronx. South: Queens and Brooklyn. Staten Island is closed** and is
not a legal destination by land or water.

The split is already exact on the printed board. Nothing needs rebalancing:

| | Districts | Docks | Wards | Speakeasies | High Society | Still numbers |
| --- | --- | --- | --- | --- | --- | --- |
| North | 11 | 3 | 2 | 6 | 2 | 7–12 (Manhattan), 7–11 (Bronx) |
| South | 11 | 3 | 2 | 6 | 2 | 2–7 (Queens), 3–7 (Brooklyn) |

The still numbers are the find. North holds 7 through 12 and South holds 2 through 7. The only
number both halves own is **7**, which is where all four High Society Venues sit. Staten Island's
stills are 6, 2 and 4, so it is South-flavoured turf, which is a second reason to close it.

## The Mash is the weather, and it should stay harsh

Brew Number is Mash plus your Red die, so the Mash is a public dial from 1 to 6 that points at
one half of the city:

- **Mash 6** gives Brew Numbers 7 to 12. Every North boiler is live.
- **Mash 1** gives Brew Numbers 2 to 7. Every South boiler is live.
- **Mash 3 or 4** is the contested middle where both halves can fire.

The Harbormaster names it, and the Harbormaster is whoever Controls the most Docks. It starts 3
to 3, so the Mash is rolled until somebody breaks the tie. Take a fourth Dock and you own the
weather.

**A hostile Mash is not a lockout, and that is why the harsh version is the right one.** Under
Mash 6 the South can still fire its two #7s on a Red of 1, and under Mash 1 the North can still
fire its two #7s on a Red of 6. So the extreme Mash does not shut a player down. It funnels them
onto the four High Society Venues, which are the contested rooms, the police-guarded rooms, and
the only rooms that pay a Kickback. The harshest setting is what makes the #7s the center of the
board.

With three Red dice in the pool, at least one 1 appears about 42% of the time, and the drafter
ahead of you can take it to deny you. So on a hostile day your question is whether you can get a
Red that reaches 7, and your opponent's question is whether to spend their draft denying it. That
is a readable two-player contest every single morning, with no new rules.

The Blowback closes the loop. It is the leftover Red plus the same Mash, so setting the weather
to fire your own boilers aims the explosion at your own boilers too. And on the days the Blowback
lands on 7, both players' High Society Venues burst together.

**The runaway question answers itself.** A player who holds four Docks sets Mash 6 every morning
and fires nine boilers to the opponent's two. That is a large edge, and the reason it is not a
runaway is that every Dock is Water Connected to every other Dock, so any Dock can be attacked
from any Dock in a single Play. The Dock majority is the most volatile holding on the board. The
weather is harsh, and the crown that sets it is the cheapest thing in the game to take away.

An earlier draft proposed capping the Harbormaster to moving the Mash one pip a day. It is
recorded here as rejected: it breaks symmetry with the 4-player rule for a problem the Dock
network already solves, and it trades the sharpest decision in the mode for a grind.

## The objective: all four Wards

One win condition, not two. **Control all four Wards at a Sunset.** Five Points and Hunts Point
in the North, Corona and Brownsville in the South. You must hold both of your own and take both
of theirs.

Why the Wards:

- They are the only key District left without a job. Speakeasies sell, Docks trade and set the
  Mash, Stills brew. Since Ward Boss and the Union Fee were cut, a Ward is a crossroads and
  nothing else.
- They are where each player's Safehouse starts, so attacking a Ward is attacking a home. That
  is the king's square, and it is the right shape for a chess-like objective.
- A single objective is more chess-like than a race between an economic win and a turf win. The
  economy is not a parallel victory track, it is the thing that buys the muscle that takes the
  four squares. Every route points at the same place.

**The Commission Seats do not appear in this mode.** Bribe stays in as pure economy: cash buys
permanent markers, markers buy Plays. That is now its whole purpose, and it is a clean one.

## The Wards are not equidistant, and the asymmetry is good

Move distance between Wards, counting land and water:

| From | Five Points | Hunts Point | Corona | Brownsville |
| --- | --- | --- | --- | --- |
| Five Points | 0 | 3 | 2 | 2 |
| Hunts Point | 3 | 0 | 3 | 3 |
| Corona | 2 | 3 | 0 | 1 |
| Brownsville | 2 | 3 | 1 | 0 |

The two halves come out with different characters from identical rules:

- **North** has a forward bastion and a rear fortress. Five Points sits on the Williamsburg
  bridge and is 2 moves from both South Wards. Hunts Point is the most isolated District on the
  map, 3 moves from everything.
- **South** has a mutually supporting pair. Corona and Brownsville are land-adjacent, so muscle
  defending one is one move from the other.

That is positional asymmetry from a symmetric rulebook, which is exactly the chess property.

**Every Ward is land-adjacent to exactly one Dock**: Five Points to The Bowery, Hunts Point to
Throggs Neck, Corona to Whitestone, Brownsville to Sheepshead Bay. Since all six Docks are
mutually Water Connected, the Dock network is the road to every Ward on the board. So the Ward
war is not a war away from the Docks. It is the same war at a different range, and it gives the
Docks a second reason to matter beyond the Mash.

## The influence sink, and why the stake belongs on the Ward

Cutting Jobs removes the game's only real Influence sink. Plays cycle their markers back the same
Day, and Heat only locks a marker until the next Raid, so a player at 10 Influence can absorb four
Heat markers and still run six Plays, which is where both players start. Being loud becomes close
to free, and at two players the Scatter is survivable because Cornered almost never triggers with
only one rival's pieces blocking exits.

**The fix is to put the stake on the objective.** To count a Ward toward victory you must stake
Influence markers on it, locked while you claim it, exactly as a Job stake locks markers today.
The Rulebook already has the language for this: "The Stake Is Rent, Paid in Plays."

That single rule does four jobs at once:

- It restores the sink that Jobs provided, in the same currency and with the same feel.
- It means the player closest to winning has the fewest Plays available to defend the win. The
  winning attack overextends you, which is the tension the mode is for.
- It puts Ward stakes and Heat markers in competition for the same pool, so a loud player cannot
  also be a claiming player.
- It gives the win condition a cost, so holding four Wards for one Sunset is a real feat rather
  than a matter of walking in.

The stake size is the mode's biggest tuning dial:

| Stake per Ward | Markers locked at 4 Wards | Plays left at 6 Influence | at 10 Influence |
| --- | --- | --- | --- |
| 1 | 4 | 2 | 6 |
| 2 | 8 | not reachable | 2 |

At 2 per Ward the objective cannot be completed without Bribing first, which ties the turf win to
the economy hard. At 1 per Ward it is reachable on a lean build but crippling to hold. **Start at
1 and test.**

## Heat: stacked markers

The proposal on the table is that each Heat costs **two stacked markers** on the Heat Track, so
the 5-space track absorbs 10 markers and the Raid still triggers on the fifth Heat. The frequency
of Raids is unchanged; the tempo cost of being loud doubles.

The arithmetic that matters is the Ledger's cap. The Kingpin's Guide states it as **Plays =
Influence minus staked minus Heat, capped at 5 slots**, and calls the fifth slot the only cliff:
markers above your fifth absorb Heat for free. So the real question is not how many markers the
track holds, it is how much slack a player has above their fifth slot.

Plays available, by Heat events taken, with no Ward stakes:

| Influence | Slack above slot 5 | Today | 1 Heat | 2 Heat | 3 Heat | 4 Heat |
| --- | --- | --- | --- | --- | --- | --- |
| 6, one marker at 1 each | 1 | 5 | 5 | 4 | 3 | 2 |
| 10, one marker at 1 each | 5 | 5 | 5 | 5 | 5 | 5 |
| 6, two markers at 2 each | 1 | 5 | 4 | 2 | 0 | n/a |
| 10, two markers at 2 each | 5 | 5 | 5 | 5 | 4 | 2 |

The third row down is the finding. **Under the current rule a player at 10 Influence never feels
Heat at all**, because four locked markers still leave six free against a five-slot cap. The
doubling is the change that makes Heat bite a maxed player, from their third loud Play onward. It
is aimed exactly at the problem.

Two things to weigh against it:

- **It is regressive.** A flat cost against a variable pool bites the poorer player twice as
  hard: the first Heat costs a 6-marker player a fifth of their Day and a 10-marker player
  nothing. That is an existing property of the Heat rule, and doubling doubles it. It runs
  against using Heat as a brake on a leader, since the leader is usually the loud one.
- **Nobody under 10 Influence can fill the track alone.** Three Heats is six markers, which is a
  6-marker player's entire pool. The track is shared, so two players still reach ten between
  them, but it makes an on-demand Raid trigger more valuable, which is a second argument for
  keeping the Rat.

It combines well with the Ward stake. At 10 Influence holding all four Wards at 1 marker each,
the player has one free loud Play and then falls off a cliff: 5 Plays at no Heat, 4 at one Heat,
2 at two. The player sitting on the win condition cannot afford to make noise, which is the
tension the mode is for.

**The alternative worth testing against it**, if the regressive behaviour shows up at the table:
leave Heat at one marker and have **each marker on the track lower your Ledger cap by one** for
the Day. Cap 5 minus Heat bites every player identically regardless of bankroll, which targets
the stated problem more precisely, at the cost of changing what the Heat Track means rather than
just how much it costs.

Note the existing idiom. The Volstead Act already retunes Heat by **shortening the fuse** to
three spaces, which changes Raid frequency and leaves the cost per Heat alone. Stacking is the
orthogonal dial: same frequency, double cost. Both are available and they compose, though
Volstead's 3-space fuse plus stacking means six markers to a Raid, which for a player at 6
Influence blows the fuse at the exact moment they run dry.

## Heat gets its teeth back from the objective, not from a rules change

No 2-player exception to the Heat track is needed. Once the Wards are the win condition, a Raid
is dangerous for reasons that already exist in the rules:

- A Squad that kicks in a Ward destroys the Safehouse there, seizes the liquor, and then **sits
  on the District as an impassable wall** until a later Raid. It has frozen your win condition,
  and you cannot move in to retake it.
- Squads hunt the mob whose marker sits furthest right on the Heat Track. Your own noise aims
  them at your own ground. You cannot be loud and hold Wards at the same time.

There is one genuine asymmetry to watch here. Counting raids needed for each Borough's Squad to
walk from its High Society Venue to that Borough's Ward:

| Ward | Borough | Raids from the Squad's start |
| --- | --- | --- |
| Corona | Queens | 1 |
| Brownsville | Brooklyn | 1 |
| Hunts Point | The Bronx | 2 |
| Five Points | Manhattan | 3 |

Both South Wards are one Raid from their Squad. Five Points is three. So the South's half of the
objective is police-volatile and the North's is police-sheltered, and since the win needs all
four Wards, both players' path runs through the two squares the police can freeze most easily.
That may well be the crux that makes the mode work, or it may be the thing that breaks it. It is
the first item to watch at the table.

Proposed ruling to test alongside it: **a Ward under a Police Squad counts for nobody.** That
makes the police a shared obstacle on a shared objective rather than a one-sided punishment.

## The clock

A single objective needs a timer, or two careful players stalemate.

**The Volstead Act already does this**, and its wording can be lifted whole: place the Federal
Crackdown Tracker by the Heat Track on space 1, and every Police Raid advances it one space. When
the token reaches space 10 the game ends at that Sunset. The only change needed is what the Count
measures: the player holding the most Wards wins, then the most Districts, then the fattest
bankroll, in place of Volstead's richest honest Kingpin.

This is the second half of the answer on Heat, and Volstead already states the argument: the
briber keeps the streets quiet and stalls the count, the profiteer sells hard and drags the Feds a
step closer. A player ahead on Wards can burn the clock by being loud, and a player behind has to
stay quiet and build. Heat stops being a local tax and becomes a strategic lever, with no new
component.

## What else leaves the box at two players

- **Jobs**, the Jobs Market, and **The Offers**. Shadows becomes three steps: The Brew, The
  Blowback, The Harbormaster.
- **Welsher cards and the binding handshake.** No third party to deal against.
- **Commission Seats** and the Blood Oath.

**The Rat Play stays**, reversing this file's first draft. It was proposed for cutting because its
2 Respect cost no longer exists, but The Volstead Act already solves that: the Card **bars the
crown outright**, exactly as an unpaid Shylock's Mark does, and it leaves you only when a rival
Rats and takes it off you. Keeping it also keeps an on-demand Raid trigger, which matters for
opening the High Society Venues and for advancing the clock, and it matters more under stacked
Heat, where no player below 10 Influence can fill the track alone.

Shylock and Solvency stay. Debt is the economic pressure valve, and with the Commission Seat gone
it is the only thing that punishes overreach in cash.

## Setup sketch

1. Each player takes a half. Deal two Turn Tokens as usual; they flip at Sunset, so initiative
   alternates and the second drafter, who chooses which Red die to leave as the Blowback,
   alternates with it.
2. Each player places their Safehouse, Boss and 2 Runners in **one** of their two Wards, their
   choice, and garrisons the Speakeasy and Dock the Town Planner names in that Borough. The
   second Borough starts empty. Only one Safehouse exists per player, so the second Ward is turf
   to be held, not a second home.
3. Police Squads on the four High Society Venues as normal, padlocked.
4. Federal Crackdown Tracker on space 1.
5. Roll Day 1's Mash.

## Open questions, in the order they should be tested

1. **Volstead or a new variant.** Fold this into The Volstead Act or ship it beside it. Decide
   this before anything is drafted into a component.
2. **Stacked Heat, and whether it is needed alongside the Ward stake.** They are two answers to
   the same problem, and together they may over-lock. Test the Ward stake alone first, then add
   stacking.
3. **The Ward stake size.** 1 or 2. Much else rests on this.
4. **The police asymmetry.** Both South Wards are 1 Raid from a Squad and Five Points is 3. Does
   that make the South unplayable, or does it make the South Wards the crux the whole game turns
   on?
5. **Does a Squad-held Ward count for nobody?** Proposed yes, untested.
6. **The clock length.** Space 10 is inherited from the Blood Oath and has no 2-player reasoning
   behind it yet.
7. **Hunts Point.** It is 3 moves from every other Ward. Is it a fortress that decides the mode,
   or a square nobody can ever take, which would make the win condition dead?
8. **Whether the economy runs too hot.** Extort pays $200 per District Controlled, and a player
   holding their whole half collects $2,200 from one Play. The Kingpin's Guide's $650 to $1,100 a
   Day was estimated at four players with Job stakes locking markers. Neither assumption holds
   here. Note that The Volstead Act makes **Extort unavailable** for exactly this reason, and
   tightens the Greed Tax to 3+ barrels. Both are worth inheriting.
9. **The fortress.** The open Sweep question from `rules-streamline-handoff.md` applies here
   too, and harder: with 15 Runners and only 11 Districts to defend, a 7-man garrison on each
   Ward is affordable in a way it is not at four players. `tools/sim_deed_sweep.js` is the tool.

## Map data

Land frontier between the halves, in full. Three crossings:

- Throggs Neck (Bronx Dock, still 10) to Whitestone (Queens Dock, still 5)
- Five Points (Manhattan Ward, still 10) to Williamsburg (Brooklyn High Society, still 7)
- East Harlem (Manhattan Speakeasy, still 12) to Astoria (Queens Speakeasy, still 2)

Plus the water, where all six Docks reach each other in one Play. Three land gates and an open
center.

Police Squad reach from its starting venue, which is the Districts Land Connected to it inside
its own Borough:

- Sugar Hill (Manhattan) reaches West Side, East Harlem
- Morris Park (The Bronx) reaches Fordham, Throggs Neck
- Richmond Hill (Queens) reaches Flushing, Corona, Jamaica
- Williamsburg (Brooklyn) reaches Red Hook, Brownsville

The adjacency above was read from the district graph in `mk-online/dist`, which is build output
and must not be hand-edited. It is the only machine-readable copy of the map in the repo, and it
agrees with the printed board and the Town Planner on Borough, tag and still number for all 25
Districts.
