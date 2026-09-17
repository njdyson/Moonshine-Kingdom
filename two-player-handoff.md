# The 2-player mode: North vs South

**Status: proposal, not implemented.** Nothing in the player-facing set has changed. This file
records the shape the mode is taking and the map data behind it, so the reasoning survives.

Last worked: 2026-09-17.

## The premise

Two players, one half of the city each. Jobs leave the box entirely, so there is no Respect and
no Jobs Market. What is left is brewing, selling, moving muscle and holding ground, which is the
economic and positional core of the game with the politics stripped out. The target feel is
chess: one objective, perfect information, and every strong move creating a weakness.

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

Use the **Federal Crackdown Tracker**, which already exists and already advances one space per
Police Raid for the Blood Oath. In this mode, when the token reaches space 10 the game ends at
that Sunset. The player holding the most Wards wins; then the most Districts; then the fattest
bankroll.

This is the second half of the answer on Heat. Every Raid you cause shortens the game. A player
ahead on Wards can burn the clock by being loud, and a player behind has to stay quiet and build.
Heat stops being a local tax and becomes a strategic lever, with no new component and no change
to how Heat works.

## What else leaves the box at two players

- **Jobs**, the Jobs Market, and **The Offers**. Shadows becomes three steps: The Brew, The
  Blowback, The Harbormaster.
- **The Rat Play and the Rat Card.** Its cost is 2 Respect, which no longer exists, and it is a
  political card in a mode with no politics. Removing it leaves the Heat Track as the only Raid
  trigger, which makes the timing of every Raid a deterministic consequence of how loudly the
  players have been working. That also fixes when the High Society Venues open.
- **Welsher cards and the binding handshake.** No third party to deal against.
- **Commission Seats** and the Blood Oath.

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

1. **The Ward stake size.** 1 or 2. Everything else rests on this.
2. **The police asymmetry.** Both South Wards are 1 Raid from a Squad and Five Points is 3. Does
   that make the South unplayable, or does it make the South Wards the crux the whole game turns
   on?
3. **Does a Squad-held Ward count for nobody?** Proposed yes, untested.
4. **The clock length.** Space 10 is inherited from the Blood Oath and has no 2-player reasoning
   behind it yet.
5. **Hunts Point.** It is 3 moves from every other Ward. Is it a fortress that decides the mode,
   or a square nobody can ever take, which would make the win condition dead?
6. **Whether the economy runs too hot.** Extort pays $200 per District Controlled, and a player
   holding their whole half collects $2,200 from one Play. The Kingpin's Guide's $650 to $1,100 a
   Day was estimated at four players with Job stakes locking markers. Neither assumption holds
   here.
7. **The fortress.** The open Sweep question from `rules-streamline-handoff.md` applies here
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
