# -*- coding: utf-8 -*-
"""Regenerate the Jobs deck body from a data table.

Guarantees the load-bearing build rule: gallery blocks are EXACTLY 4 cards + 4
backs, or the duplex front/back pairing breaks in print.
"""
import os
import re
import sys

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# (title, art, verb, objective_html, flavour)
#
# HOUSE STYLE (2026-10-10, jobs-audit-handoff.md). One verb, one place, and at most one
# other condition, which should be a fact you can see on the table. Counts read
# "N+ barrels", "N+ Moonshine" or "N+ Rum", with no "in one Play": since 2026-10-11 (Nick)
# the Rulebook's The Play Is the Unit says a count is what one Play did, so the cards don't
# repeat it (the 2026-10-10 audit had added it to every count). Name the
# District, the big word on the board's sign. A bar card also names the bar on the small line
# under it, as "at <bar> in <District>" (Nick, 2026-10-11): the bar is the theme, the District is
# what the table finds on the board.
# Use the defined word (Seize, Empty, take over, home Borough) rather than spelling out
# its meaning, and never ask for a count of Districts across a Borough: those were the
# Deeds' stand-ins, and they could not be checked at a glance or settle a tie.
ONES = [
    # THE BARS (Nick, 2026-10-11, round 2; jobs-setup-handoff.md). One Unload card for each of
    # the eight ordinary Speakeasies, all worded alike: "Unload 4+ barrels at <bar> in <District> in
    # one Play". The bar is the venue on the board's sign (Nick: more thematic than the District
    # alone); the District stays so the table can find it. The 2026-10-10 audit had dropped the venue
    # names off three cards; these put them back on all eight.
    # Every seat starts on one of its Borough's two (the Tenderloin, Fordham, Flushing, Red Hook)
    # and is one Move from the other (East Harlem, Belmont, Astoria, Coney Island), so the set is
    # two friendly 1s per seat by construction. The High Society Venues are left out: they buy Rum
    # only and are Opening Night's. Four or more barrels is the Greed Tax, so every one of these is
    # a noisy sale. The set replaces The Grand Tour, whose "East River" invited an argument about
    # Coney Island (Nick's round-1 note).
    # COUNTERPLAY PASS (2026-08-04). Was "a $300 Speakeasy" = 8 venues, BLOCK 1, and it
    # was ALSO the deck's widest flagged overlap: Last Call + Angel's Share co-fired
    # across FIVE districts (breadth_audit). Naming one venue each fixes the engagement
    # AND the overlap in a single edit -- the two cards now name different venues, so
    # they can never co-fire at all.
    # East Harlem is Manhattan's starting Speakeasy (garrisoned from setup, Still 12 =
    # Pressure 1, so it brews nothing and the Rum must be shipped in) and it is on the
    # East River, which The Grand Tour already names -- reusing a landmark venue rather
    # than spending a new named location against Manhattan's 4-per-borough quota.
    # AUDIT 2026-10-10: "of Moonshine" cut. It answered the split market (note above), and
    # every ordinary bar has bought both liquors since 2026-09-22.
    # SETS PASS 2026-10-11: 3+ became 4+, the bar set's one count.
    ("The Angel&rsquo;s Share", "The Angels Share.jpg", "Unload",
     "Unload <b>4+ barrels</b> at <b>The Silver Dollar</b> in <b>East Harlem</b>.",
     "What the angels take, the house bills you for anyway."),
    # Manhattan's starting bar (The Haymarket). Art: bootleggers with bottles, the ghosts behind
    # them drawn from the smoke.
    ("High Spirits", "High Spirits.jpg", "Unload",
     "Unload <b>4+ barrels</b> at <b>The Haymarket</b> in <b>The Tenderloin</b>.",
     "It never closes. It only gets quieter."),
    # The Bronx's empty bar. Belmont is the Bronx's Little Italy; Arthur Avenue is its high street.
    ("Bathtub Gin", "Bathtub Chemistry.jpg", "Unload",
     "Unload <b>4+ barrels</b> at <b>DeLillo&rsquo;s</b> in <b>Belmont</b>.",
     "Mixed in a tub off Arthur Avenue. Poured like champagne."),
    # The Bronx's starting bar (The Penny Whistle). "Coffin varnish" was 1920s slang for liquor
    # that might kill you; the art is a man cutting a jar of it.
    ("Coffin Varnish", "Cutting.jpg", "Unload",
     "Unload <b>4+ barrels</b> at <b>The Penny Whistle</b> in <b>Fordham</b>.",
     "Two parts water, one part kerosene, all of it profit."),
    # Queens' empty bar (Bohemian Hall). "Giggle water" is period slang for any drink. The art was
    # The Grand Tour's: a handshake over a crate of bottles.
    ("Giggle Water", "Cobble Hill.jpg", "Unload",
     "Unload <b>4+ barrels</b> at <b>Bohemian Hall</b> in <b>Astoria</b>.",
     "Poured by the pitcher, and nobody asks what is in it."),
    # Queens' starting bar (Paradise Alley). Back as a 1 on its own art: it was a 3 at 6+ until the
    # setup pass cut it as a home chore. As a 1, a home sale is the right size.
    ("Poison Panic", "Poison Panic.jpg", "Unload",
     "Unload <b>4+ barrels</b> at <b>Paradise Alley</b> in <b>Flushing</b>.",
     "One bad batch and the whole city stops drinking."),
    # "$300" is the guard: Opening Night is High-Society-only, so the two are now
    # structurally unable to co-fire rather than merely unlikely to. That pair was
    # the deck's biggest purely-geographic swing (6 Respect across the 4 High
    # Society joints). Matches the wording The Angel's Share already uses.
    # COUNTERPLAY PASS (2026-08-04). Was "a single $300 Speakeasy" = 8 venues, which
    # scored BLOCK 0: deny one and seven remain, so no rival ever spends a Play on it.
    # This was the deck's most inert card. Naming ONE venue is the counterplay knob --
    # compare Cuban Prince (1 venue, BLOCK 2) against this exact objective at 8 venues.
    # Coney Island is Brooklyn's STARTING Speakeasy, so it is garrisoned from setup and
    # someone always cares about it; "last call" on the boardwalk is the flavour already.
    # AUDIT 2026-10-10: since the 2026-10-07 setup Coney Island is not Brooklyn's starting
    # Speakeasy; it is the empty block beside two Brooklyn starts (Red Hook, Canarsie).
    # SETS PASS 2026-10-11: one of the bar set; text unchanged.
    ("Last Call", "Last Call.jpg", "Unload",
     "Unload <b>4+ barrels</b> at <b>Ruby&rsquo;s Joint</b> in <b>Coney Island</b>.",
     "Pour till the taps run dry and the sirens start up."),
    # Brooklyn's starting bar (Sunny's Bar). "Off the Boat" was Cuban Prince's first name. Switch.jpg
    # (boats unloading under a suspension bridge) left Night Landing because Jamaica Bay had no bridge;
    # Red Hook sits at the Brooklyn Bridge's end, so it fits here.
    ("Off the Boat", "Switch.jpg", "Unload",
     "Unload <b>4+ barrels</b> at <b>Sunny&rsquo;s Bar</b> in <b>Red Hook</b>.",
     "Unloaded at midnight, poured by one, gone by two."),
    # THE SINGLES: landmarks, Docks and Staten Island, which no Borough set can carry.
    ("The Milk Run", "The Milk Run.jpg", "Move",
     "Move <b>4+ barrels</b> across the <b>Williamsburg Bridge</b>.",
     "Every copper watches that bridge. Wave as you go."),
    # Briefly restricted to "a mainland Dock" to stop Rum Row paying this card
    # too, then REVERTED (Nick, 2026-07-19): that stack fires only at Westerleigh
    # and Tottenville (2 districts), and a 2-district overlap you had to draft
    # over two Days and keep staked is good play, not a bug. Breadth is the test,
    # not whether the stack is guaranteed. See the note above ONES.
    # COUNTERPLAY PASS (2026-08-04). Was "a Dock" = 8 districts, BLOCK 1. Named to the
    # two MANHATTAN Docks: the Dutchman (Schultz) was a Manhattan operator, so the theme
    # improves rather than survives. Two districts is the deck's engineered-overlap
    # width (handoff §3), it is Manhattan's own turf so somebody always contests it, and
    # it pairs the card with The Bowery/West Side, which no other Job names.
    # AUDIT 2026-10-10: one named Dock. "A Manhattan Dock" included The Bowery, Manhattan's
    # starting Dock since 2026-10-07, so it had become a home chore. West Side is the empty
    # Manhattan Dock beside Sugar Hill, and every starting Dock reaches it by water. "for
    # Rum" cut: Trade only ever makes Rum.
    ("The Dutchman's Deal", "Dutchman.jpg", "Trade",
     "Trade <b>3+ barrels</b> at <b>West Side</b>.",
     "He never gives a name. The windmill on the sack says plenty."),
    # RENAMED from "The Riverside Switch" and re-arted (Nick, 2026-07-19). The old
    # art (Switch.png) has RIVERSIDE STORAGE painted across a moonlit suspension
    # bridge, which fought the objective twice over: Jamaica Bay is a bay, and in
    # 1929 it had no major bridge at all (Marine Parkway is 1937, Cross Bay 1939).
    # Skiff.png is two men running a LIQUOR crate across black water in the rain,
    # harbour lights behind: the flavour line drawn as a picture. At 13 characters
    # the new name also clears the 16-char title--long threshold.
    # LANDMARK: "on Jamaica Bay" is labelled on the board and holds exactly two
    # Docks: Canarsie (Bk) and Jamaica (Q). Coney Island sits on that water
    # but carries no anchor, so there is nothing to argue about. This was the fix
    # for the deck's other big geographic swing: this card was a strict
    # SUBSET of The Smuggler's Run (Staten -> mainland at 6+ barrels IS "4+ across
    # water into a Dock"), paying 6 Respect across 6 Docks. Now 2.
    ("Night Landing", "Skiff.jpg", "Move",
     "Move <b>4+ barrels</b> across water into a <b>Jamaica Bay Dock</b>.",
     "Two boats, one lantern, and nobody the wiser."),
    # "a Pier 6 brawl" was real period slang for an all-out waterfront fight.
    # TRIED AND REVERTED: pinning this to Jamaica Bay as the hostile mirror of
    # Night Landing. It balanced the seats by CARD COUNT and then broke them by
    # WEIGHT: Queens and Brooklyn fell to -4 because the East River pair is
    # tier-mismatched (The Grand Tour is a 1, The Irish Goodbye a 3), and adding a
    # third bounty to those two seats compounded it. Generic Docks costs almost
    # nothing in breadth: the 9-Respect Open Fire triples it appears in already sit
    # at 1-2 districts, which is the engineered end. LESSON: a landmark's friendly
    # and hostile halves must match on TIER, not just exist.
    # COUNTERPLAY PASS (2026-08-04). SOLITAIRE FAILURE: diff 8 (the hardest 1 in the
    # deck, harder than five of the 3s) with engagement 1. The difficulty was DICE plus
    # RIVAL 2 -- the two axes you cannot play around -- and it paid 1 Respect for them.
    # Re-objectived off the kill count onto SEIZING the pier. Three things this fixes:
    #   1. No dice. Seizing a Dock is a decision, not a roll.
    #   2. It is blockable: a garrisoned Dock is a real defensive commitment, and the
    #      card tells rivals in advance which kind of district to hold.
    #   3. It keeps the deck's Open Fire count moving in the right direction on VARIANCE
    #      without cutting an Open Fire card (the verb is still over-represented, but
    #      only two kill-count Jobs now remain: The Irish Goodbye and Butcher's Ledger).
    # "Hostile" (rival-held) is the guard that stops this being a free grab of empty
    # dock: you must take it off somebody. The flavour line already says exactly this.
    # "and no Safehouse" is the GUARD, and it is not optional: the first draft of this
    # rewrite ("Seize a Dock held by a rival") re-opened handoff §3 cluster 3 -- it
    # co-fired with The Eviction across all 8 Docks, the widest flag in the deck. The
    # Eviction REQUIRES a rival Safehouse; this FORBIDS one, so the two are now
    # structurally unable to ride the same Seize. Same guard, same wording, same reason
    # as The Copper Heist -- which is also what keeps this disjoint from Bloody Sunday.
    # Theme is unharmed: a brawl over a working pier, not an assault on somebody's HQ.
    # AUDIT 2026-10-10: "held by a rival" cut, since Seize already means taking it from one.
    # The guard stays. It still rides every Smuggler's Run onto a Dock with no Safehouse
    # (4 Respect now that card is a 3).
    # SETS PASS 2026-10-11: "with no Safehouse" cut (Nick: a Dock with a Safehouse is harder to take,
    # so it should pay too). The guard existed to keep The Eviction off it, and The Eviction is cut.
    # The cost: it now pays beside every Smuggler's Run, which always Seizes a Dock.
    ("The Pier Six Brawl", "Dock Domination.jpg", "Open Fire",
     "Seize a <b>Dock</b>.",
     "The pier belongs to whoever is still standing on it."),
    ("The Beachhead", "Beachhead.jpg", "Secure",
     "Secure your Safehouse in a District <b>Land Connected</b> to a rival <b>Safehouse</b>.",
     "You should meet the neighbours. They&rsquo;d rather not."),
    # "a Ward" made this a strict SUPERSET of Union Dues (also "Recruit 6+ in a
    # Ward"), so Union Dues could never fire without paying this too: a guaranteed
    # free rider, invisible to overlap_audit's output because 1+3 sits under its
    # 7-Respect display cutoff. Split on the DEED instead (Nick): you physically
    # hold the Deed card, so it is verifiable at a glance and it moves during play
    # (unlike "home turf", which is ambiguous once Deeds change hands: where you
    # started, or where your Deed is now?). Deed / no-Deed is perfectly disjoint.
    # Hold-the-Deed is the EASY half despite sounding like more prep: setup deals
    # you a Deed AND puts your Safehouse in that Borough's WARD, so it is free on
    # day one. Mirrors Union Dues exactly (same verb, same 4+, opposite Deed
    # state), which also puts Ward turf back to 3 cards / 0.60 in fairness_audit.
    # COUNTERPLAY PASS (2026-08-04). Scored engagement 0 -- with Last Call, the purest
    # solitaire in the deck: it happens at YOUR Safehouse, in YOUR Ward, on a Deed you
    # already hold, so no rival can see it coming or reach it. Setup hands it to you on
    # Day 1 for free.
    # Keeping the Deed split (it is what makes this and Union Dues perfectly disjoint --
    # see the note below) but adding the Sweep as the real cost: 5 Runners plus a Boss
    # plus 2 starting Runners is 8 Mobsters on one block, and the Reckoning Sweep caps
    # a district at 5. So you must hire them AND disperse them before the Reckoning, or
    # pay to have them culled. That is a visible, priceable commitment rather than a
    # private button -- rivals can read the crowd and time their move on it.
    # Magnitude drops 5+ -> 4+ because "hold them at Day's end" is the new difficulty
    # and stacking both would overshoot; Union Dues (4+, no Deed) stays the harder half
    # on POSITION, which is the axis that separated them all along.
    # FOLDED BACK 2026-09-23 from the printed deck, which moved on when v0.9.7 cut the
    # Borough Deeds and v0.9.8 fixed High Society to the four #7 Venues. The notes above
    # record the Deed-era reasoning.
    # AUDIT 2026-10-10: the Deed split and the Sweep cost above are both gone. The Borough
    # count that stood in for the Deed described your own home Ward, so the card was done
    # on Day 2 for $1,200, and it had no answer for a tie. Now one named Ward: Stapleton,
    # the one nobody starts in, so the Safehouse has to travel first. Disjoint from Union
    # Dues (a rival's home Ward) by construction.
    ("Tenement Army", "Tenament Army.jpg", "Recruit",
     "Recruit <b>4+ Runners</b> at <b>Stapleton</b>.",
     "Word goes round by supper. By dark, you have a crew."),
    # Re-arted from Rum Runners Regatta.png (Nick found the set in Unused/): a full
    # moon, the mother steamer lit up, six small boats waiting off a dark shore. The
    # flavour line already described this exact image. Rum Row 3.png was tried first
    # and is the better painting, but it is rainier and much lower contrast; at
    # 57x38mm this one reads, and the moon gives the eye somewhere to land.
    # NOT the same file as Art/Rum Row.png, which the rulebook uses on p.188.
    # SETS PASS 2026-10-11: DOWN TO 1 (Nick: too easy for a 3). Text unchanged.
    ("Rum Row", "Rum Row.jpg", "Trade",
     "Trade <b>4+ barrels</b> at a <b>Staten Island Dock</b>.",
     "Forty ships past the three-mile line, waiting on a lamp."),
    # WAS "Have a Police Raid Condemn ..." with verb Raid, which had no checkpoint:
    # a Raid is an INTERRUPT, not a Play, and "The Play Is the Unit" only checks
    # Jobs when a Play ends. A Raid fires two ways (5th Heat marker, or a Rat), so
    # a RIVAL could trigger the Condemn and nothing defined whether you scored it
    # (Nick). Naming Rat makes it a real Play (Rat is a Power Play), so the unit
    # holds with no rules exception, and it turns the card into pure SETUP: Raid
    # targeting is automated (hottest mob, then most barrels), so you must engineer
    # being the target yourself, then drop the dime. The flavour was always this.
    # PADLOCK, not Condemn (Nick): Safehouse-only Recruit made "Condemn your own
    # Safehouse" catastrophic: it now locks you out of hiring entirely, so a
    # 3-Respect card also carrying the Rat Card (no Jobs, no crown) would never
    # be claimed, and in a STATIC Market an unclaimed card squats a slot forever.
    # NB the Rat penalty moved from "no Bribes" to "no Jobs" (v0.9): this card is
    # still claimable, since you hold it BEFORE you Rat, but ratting for it now
    # freezes you out of the Market until you buy the brand off.
    # Padlocking your worst boiler is a proportionate price. Nick proposed
    # Pressure 1; widened to <=2 because P1 is only East Harlem (M), Astoria (Q)
    # and Westerleigh (ST), and Staten has NO Squad (one per MAINLAND Borough),
    # so P1 was a 2-district, Manhattan/Queens-only card = borough bias, the one
    # kind Nick rules out. P2 adds West Side (M), Belmont (Bx), Jamaica (Q) and
    # Coney Island (Bk): exactly one per mainland Borough. "you Control" is
    # load-bearing: without it, padlocking a RIVAL's still counts, which is just
    # ratting on someone else. The tension that makes it good: the Raid's
    # tie-break takes the boiler ranked HIGHEST on the Pressure Strip, so a low
    # Pressure district is the Squad's LAST pick. You must trick the cops into
    # kicking the wrong door. Also gives low-Pressure turf its first payoff.
    # SETS PASS 2026-10-11: DOWN TO 1 (Nick: a niche 1). Ratting hands you the Rat Card (-2 Respect),
    # so at 1 this is a rebate on a Rat you meant to make anyway, not a profit.
    ("The Insurance Job", "Insurance Job.jpg", "Rat",
     "<b>Rat</b>, and have the Raid <b>padlock</b> a <b>Pressure 1 or 2 Still</b> you Control.",
     "He struck the match himself. Slept fine after."),
]

THREES = [
    # THE EXTORT SET (Nick, 2026-10-11; jobs-setup-handoff.md). One card per mainland
    # Borough, each its seat's friendly 3, replacing the four home-bar 3s (Cuban Prince,
    # The Big Squeeze, Hell's Highway, Poison Panic). Since 2026-10-07 every seat starts on
    # the bar those four named, so each was a home chore done by Day 2 or 3.
    #   Why these need setup: a Borough's three Speakeasies are its two ordinary bars and its
    #   High Society Venue, and the Venue starts under that Borough's Police Squad. So the
    #   card is dead until a Raid moves the Squad, and dead again whenever the Squad stands
    #   on any of the three. The holder steers the Squad (Follow the Smoke, then the Big Bust:
    #   be the freshest noise in reach, with the most barrels where you can afford the cops),
    #   then holds three Districts at once and spends a Power Play that always draws Heat.
    #   Rivals can break any of the three, or plant barrels to pull the Squad back onto one.
    #   The home seat starts holding one of the three and borders the other two, so the card
    #   is his friendly; for anyone else it is an invasion that ends next to a crown room.
    #   The Squad's clean first step differs by Borough: Throggs Neck for the Bronx, West Side
    #   for Manhattan, Jamaica or Corona for Queens, and only Brownsville (Brooklyn's own home
    #   Ward) for Brooklyn, whose card is the stiffest. Watch it in playtest.
    #   History: these four names were Extort cards once ("hold N Districts in one Borough")
    #   and were cut because the Borough Deed already paid for holding a Borough (handoff §3,
    #   cluster 2). The Deeds went on 2026-09-10, and the objection with them. They come back
    #   on their own art, worded as The Five Families is: "Extort while you Control ...".
    #   "all three" says the crowned bar counts, which a reader going by the board's gin
    #   medallions might otherwise miss.
    ("Empire State", "Empire State.jpg", "Extort",
     "Extort while you Control <b>all three Speakeasies</b> in <b>Manhattan</b>.",
     "From Sugar Hill to the Tenderloin, every till pays one man."),
    # The name and art came off Manhattan's old home-bar 3 (Unload 6+ at The Tenderloin),
    # which had restored them from the cut Extort card. Back on an Extort, where a squeeze
    # belongs; the art (the wagons at the door mid-count) is Extort's Heat drawn as a picture.
    ("The Big Squeeze", "Big Squeeze.jpg", "Extort",
     "Extort while you Control <b>all three Speakeasies</b> in the <b>Bronx</b>.",
     "The whole Bronx pays on Friday. Nobody has to ask twice."),
    ("King of Queens", "King of Queens.jpg", "Extort",
     "Extort while you Control <b>all three Speakeasies</b> in <b>Queens</b>.",
     "Every glass poured in Queens, the King takes a sip."),
    # The Black Hand letters (an inked palm, a sum, a threat) were the shakedown of the
    # Italian blocks in Brooklyn and East Harlem. The art is a butcher reading one.
    ("The Black Hand", "Black Hand.jpg", "Extort",
     "Extort while you Control <b>all three Speakeasies</b> in <b>Brooklyn</b>.",
     "The letter had a hand drawn on it. The shop paid by noon."),
    # FOLDED BACK 2026-09-23 from the printed deck, which moved on when v0.9.7 cut the
    # Borough Deeds and v0.9.8 fixed High Society to the four #7 Venues. The notes above
    # record the Deed-era reasoning.
    # SETS PASS 2026-10-11: DOWN TO 3, where the Extort set lives, so the 5s can be murder alone.
    # New art (Nick: Accord was washed out and showed four men): Scheme, three men over a city map.
    # One Extort can pay it beside Borough cards and Cuban Prince; all are 3s, so no hard-rule issue.
    ("The Five Families", "Scheme.jpg", "Extort",
     "Extort while you Control a District in <b>all five Boroughs</b>.",
     "Not the richest table in town. Just the widest."),
    # SETS PASS 2026-10-11 (Nick: keep the name and art, give it a new objective). The waterfront's
    # Extort card: four of the eight Docks, held at once. Holding four almost always makes you the
    # Harbormaster too. Was "Move 3+ Rum into Red Hook", cut on the setup pass as a Brooklyn chore.
    ("Cuban Prince", "Cuban Prince.jpg", "Extort",
     "Extort while you Control <b>4+ Docks</b>.",
     "Every boat from Havana ties up at one of his piers."),
    # SETS PASS 2026-10-11 (Nick's wording). The Hell Gate joins Hunts Point (the Bronx's home Ward) and
    # Astoria, so it is the Bronx's friendly 3, the seat with the fewest cards aimed its way. The Rum
    # chain and a Boss on the road are the setup; a hostile far end makes it a fight. Was "Move 6+
    # barrels into Fordham", cut on the setup pass as a Bronx chore.
    ("Hell&rsquo;s Highway", "Hells Highway.jpg", "Move",
     "Move your <b>Boss</b> and <b>4+ Rum</b> across the <b>Hell Gate Bridge</b>.",
     "Forty miles of bad road and worse intentions."),
    # RE-VERBED Rise -> Secure (Nick, 2026-07-19). Two problems solved by one edit,
    # with no change to the 12/12/8 tier counts:
    #   1. BOTH Rise cards paid you for being decapitated, reopening the incentive
    #      the Rise rework closed (see v0-8-changes: old Rise "actively incentivised
    #      Boss death"). Nick keeps The Empty Casket -- its theme is faking your own
    #      death and rising from the ashes, which galvanises the mob and is what the
    #      Respect is for -- so this is the one that moves.
    #   2. Secure had 3 cards and NONE at 3 Respect, on the verb that Safehouse-only
    #      Recruit just promoted from a footnote to a live play. Now 1/1/3/5.
    # The name survives the change: last man in the room takes the chair, and the art
    # is a lone man at a bar table, which reads better as claiming a joint than as a
    # succession. "$300" excludes High Society, so High Roller (Secure into High
    # Society + 4 Rum) can never ride this -- without it, High Roller would be a
    # strict subset across 3 Boroughs, an 8-Respect stack. The Deed clause is the
    # difficulty: it forces your Safehouse OFF your home turf, and under
    # Safehouse-only Recruit that moves your whole spawn point into a rival's
    # Borough. Deed / no-Deed is glance-verifiable -- you hold the card or you don't
    # -- and it mirrors Union Dues.
    # FOLDED BACK 2026-09-23 from the printed deck, which moved on when v0.9.7 cut the
    # Borough Deeds and v0.9.8 fixed High Society to the four #7 Venues. The notes above
    # record the Deed-era reasoning.
    # AUDIT 2026-10-10: the printed card had moved onto High Society, against the "$300"
    # guard above, and stacked with High Roller and The Beachhead for 9 on one Secure. Now
    # one named bar: Astoria (Bohemian Hall), Queens' empty Speakeasy, with a bridge each to
    # the Bronx and Manhattan and Brooklyn's room next door.
    # SETUP PASS 2026-10-11: "holding 6+ Rum". Secure places a Safehouse in any Safe District
    # on the map for $500, so the bare card was one Play from anywhere on Day 2, the easiest
    # 3 in the deck. Astoria brews almost nothing (Still 2), so the Rum is a whole supply
    # chain: brew, Trade at a Dock, haul it in, then Secure. Queens does it in three Plays
    # from Whitestone, so it stays Queens' second friendly; the Bronx (by the Hell Gate) needs
    # four and Manhattan (by the Queensboro) more, and the Bronx can strike it from its home Ward.
    # Six Rum on the block is also the Big Bust's favourite door. Secure-only Jobs can't meet
    # it: High Roller is the rooms, Fortress Staten is Staten Island, and The Beachhead pays
    # beside it only while a rival Safehouse stands in Corona.
    ("Last One Standing", "Last One Standing.jpg", "Secure",
     "Secure your Safehouse in <b>Astoria</b> holding <b>6+ Rum</b>.",
     "The last man at the table gets the chair."),
    # Moonshine -> RUM (Nick). A setup hedge: Rum only exists via Trade at a Dock you
    # Control, and Staten's own boilers are hopeless (Westerleigh Pressure 1,
    # Tottenville 3), so the moonshine must be hauled IN, Traded, then run out.
    # Roughly doubles the setup. Bonus: now mutually exclusive with Gin Pipeline
    # (Moonshine), which it used to be able to co-fire with.
    # COUNTERPLAY PASS (2026-08-04). SOLITAIRE FAILURE at 5 Respect: diff 8, engagement 2
    # -- the lowest-difficulty 5 once counterplay is scored, and unblockable BY DESIGN
    # ("nobody watches Staten Island" is the card's own flavour line). A long private
    # haul is not a headline job.
    # ⚠ "to a Dock a rival Controls" WAS TRIED AND IS IMPOSSIBLE -- the THIRD card this
    # pass to die on its own Play's rules, and the subtlest. A Move into rival turf can
    # never END with your barrels sitting in their District:
    #   FOLD      -> "The Invader immediately claims Control" -- no longer rival-held.
    #   AMBUSH    -> win and you take Control; lose and "any [barrels] left in a rival's
    #                District become theirs" -- they are no longer YOUR barrels.
    #   HOLD FIRE -> "You cannot end your Play Pinned"; you Open Fire (as above) or
    #                Advance to a Connected SAFE District, carrying the cargo back out.
    # No branch satisfies the objective at the checkpoint. LESSON: for a card that
    # delivers goods, "into rival turf" is never a legal destination -- combat resolution
    # always changes either who holds the District or who owns the barrels.
    #
    # THE FIX IS NICK'S (2026-08-04): deliver AND take the District in the same Play.
    # "Move 4+ Rum into a rival-Controlled Dock, and take Control of the District."
    # Why this is better than the three alternatives I drafted:
    #   - It closes the barrels-alone hole by construction. Nick's correction: barrels
    #     CAN travel alone ("Your MOBSTERS are Pinned" -- send none, nothing to Pin), so
    #     the plain rival-turf version was legal but a GIFT: the delivery always lands,
    #     the Job pays via "it stays done even if the deed didn't survive the Play", and
    #     the rival just pockets 6 Rum without a decision. Requiring Control forces
    #     Mobsters into the District, which forces the Standoff. The rival now CHOOSES.
    #   - It is opportunistic, which is the play pattern the deck wants: you watch for
    #     the moment their Dock is thinly garrisoned and hit it. High risk, self-timed.
    #   - Taking Control means the barrels are yours at the checkpoint, so the "any left
    #     in a rival's District become theirs" clause never bites. No rules friction.
    # 6+ -> 4+ because the card now buys a firefight as well as a haul.
    # NOT Staten-specific, and Nick flagged exactly this ("or elsewhere if SI is
    # overrepresented"): setup RETURNS STATEN'S DEED TO THE BOX and nobody starts there,
    # so "a rival-Controlled Staten Dock" would depend on a rival having first bothered
    # to go take one -- rare, and it would make the card dead for long stretches. Any
    # Dock keeps it live; the origin clause already guarantees the Staten leg.
    # AUDIT 2026-10-10: DEMOTED TO 3. It Seizes a Dock, and every mainland Dock is in a
    # bounty Borough, so one Move could pay it with Over the Top (Throggs Neck), The Toll
    # Booth Trap (Whitestone, Jamaica), The Butcher's Ledger (Canarsie) or Bloody Sunday (the
    # Manhattan Docks): two 5s. A Fold pays both at Throggs Neck and the Manhattan Docks. The
    # old overlap model kept Move and Open Fire apart and never saw it. "Seize" says "into a
    # Dock a rival Controls, and take Control of it" in one word.
    # SETS PASS 2026-10-11 (Nick: the barrels don't Seize anything, the fight does). Same trigger,
    # worded as the Move and then the Seize.
    ("The Smuggler&rsquo;s Run", "Quiet Drop.jpg", "Move",
     "Move <b>4+ Rum</b> from <b>Staten Island</b> into a rival&rsquo;s <b>Dock</b>, and Seize it.",
     "Nobody watches Staten Island. Every Dock touches it."),
    # "and no Safehouse" is the guard that closes handoff §3 cluster 3 for good.
    # The Eviction REQUIRES a rival Safehouse; this now FORBIDS one, so the two
    # can never ride the same Seize. Without it, one Open Fire on Richmond Hill
    # or Williamsburg paid 11 (Toll Booth/Butcher's Ledger + Eviction + Heist).
    # Theme holds: you're robbing a boiler standing on its own, not storming HQ.
    # SETUP PASS 2026-10-11: one kind of District, the High Society Venue. "A Pressure 5+
    # Still" was nine Districts, and since 2026-10-07 every seat's starting Speakeasy is one,
    # so any Seize of a rival's home bar paid it: a windfall from a fight you'd fight anyway.
    # The four Venues sit on the four #7 Stills, the hottest boiler in each Borough, so the
    # flavour still reads. Now the room must be open (a Raid moved its Squad), a rival must
    # be holding it, and you must bring enough to take it; a Fold still pays, as every Seize
    # Job does. It is also the answer to the Extort set: taking a rival's room breaks his
    # three. The guard stays, for the same reason as before: a room with his Safehouse in it
    # pays The Eviction (or, in Manhattan, Bloody Sunday) instead, never both. It meets each
    # bounty 5 only in that Borough's room (one District each).
    # SETS PASS 2026-10-11 (Nick): "a Pressure 5 Still", not the rooms, which are contested enough.
    # There are five, one per Borough: the four starting bars and Stapleton, so it is a standing
    # reason to garrison home. No Safehouse guard now that The Eviction is cut.
    ("The Copper Heist", "Copper Heist.jpg", "Open Fire",
     "Seize a District with a <b>Pressure 5 Still</b>.",
     "The good boilers run hot. So do the men who own them."),
    # "of Rum" is redundant with the rules (High Society pours nothing else) but
    # says the quiet part out loud on the card: 8 barrels means the whole Trade
    # chain, not 8 barrels of swill. Folded back from a hand edit, 2026-07-24.
    # FOLDED BACK 2026-09-23 from the printed deck, which moved on when v0.9.7 cut the
    # Borough Deeds and v0.9.8 fixed High Society to the four #7 Venues. The notes above
    # record the Deed-era reasoning.
    # AUDIT 2026-10-10: "of Rum" and "a single" cut; the room buys Rum only and an Unload is
    # always at one bar. "in one Play" is what the count needed.
    # SETS PASS 2026-10-11: DOWN TO 3 (Nick: $4,000 and the Kickbacks as well as 5 Respect was too
    # much of a win/win). Text unchanged.
    ("Opening Night", "Jimmy.jpg", "Unload",
     "Unload <b>8+ Rum</b> at a <b>High Society Venue</b>.",
     "The band plays till four. Nobody asks a thing."),
    # Renamed off "Five Points Hustle": Five Points IS Manhattan's Ward, so for a
    # Manhattan player the old name named the one Ward the card EXCLUDES. "Union
    # Dues" restores an old-deck name and its art (a queue of working men, a fist
    # of cash): the mob ran the locals, so taking a Ward's union is how you own
    # the men on that block.
    # The hard half, and Safehouse-only Recruit is what makes it hard: hiring
    # happens ONLY at your Safehouse, so this forces you to Secure your Safehouse
    # out of your own power base and into one specific district, that Borough's
    # Ward. That is the prep, and it is the friction the Recruit change created.
    # 5+ here, 4+ on Union Dues. The pair is separated by the DEED, which is
    # perfectly disjoint, so the magnitudes only have to keep the two feeling
    # different. Was 6+, dropped to 5+ (Nick, 2026-07-19) to trim the hidden SWEEP
    # TAX: your home Ward already holds a Boss and 2 Runners, so hiring 6 put 9
    # Mobsters on one block and the Reckoning Sweep culled 4 of them. At 5 it culls
    # 3, and the bill drops from $2,400 to $2,000. The tax cannot be removed
    # entirely without making the card trivial -- disperse with a Move before the
    # Reckoning, or pay it. NOTE the Sicilians are Untouchable and pay neither.
    # Union Dues is LATER (cash flows, Runner slots don't), so 4+ there respects
    # the 15-RUNNER CAP, which is the real constraint mid-game, not money.
    # "in one Play" added to match the model (and Tenement Army): without it the
    # Runners could be banked across several days, far easier than its Stake 3.
    # FOLDED BACK 2026-09-23 from the printed deck, which moved on when v0.9.7 cut the
    # Borough Deeds and v0.9.8 fixed High Society to the four #7 Venues. The notes above
    # record the Deed-era reasoning.
    # AUDIT 2026-10-10: PROMOTED TO 5, and re-objectived. The Borough count that replaced
    # the Deed had a hole on a tie, and the Sweep tax above is dead (no Sweep since v0.9.8).
    # It swaps tiers with The Smuggler's Run, which could pay beside a bounty 5 on one Move.
    # A Recruit never shares a Play with a fight, so this 5 cannot break the hard rule. To
    # Recruit in another boss's home Ward your Safehouse must be there: take over his, or
    # wait for him to leave it. Every rival sees it coming and garrisons home.
    # SETS PASS 2026-10-11: DOWN TO 3 so the 5s can be murder alone. Text unchanged.
    ("Union Dues", "Union Dues.jpg", "Recruit",
     "Recruit <b>4+ Runners</b> in a rival&rsquo;s <b>home Ward</b>.",
     "They line up at dawn. You decide who works."),
]

FIVES = [
    # THE MURDER SETS (Nick, 2026-10-11, round 2). Every 5 is a killing, in two sets of four, one
    # card per mainland Borough each: a body count ("Kill 5+ rival Runners in X") and a Boss ("Kill
    # a rival Boss in X"). Each seat is hunted by two 5s in its own Borough.
    # TWO 5s ON ONE PLAY: one Play is in one Borough, so only that Borough's two cards can meet, and
    # only on a fight that kills a Boss AND five Runners (Runners die first, so the District held at
    # least six). Round 2 printed "but no Boss" on the body counts to rule it out; Nick cut it on
    # 2026-10-12 as not worth the words: holding both cards stakes 6 of at most 10 markers, leaving 4
    # for the Move and the volleys, and six kills against a stack of six is beyond what 4 markers
    # buy (about 10 Runners and a Boss average five kills in three Open Fires). The Offers deal one
    # card a Day, so both must be drafted on separate Days too. overlap_audit.py reports the four
    # same-Borough pairs as allowed and still fails any other pair of 5s.
    # Every 5 is a kill Job, so a Fold denies all eight: all four seats can turn a bounty down
    # mid-fight (before round 2, only Queens and Brooklyn could).
    # Mob fit, to watch: the Irish Firepower die helps body counts and the Sicilian Hit makes a Boss
    # take the first hit, so those two mobs gain most; the Knights' Torch and the Vipers' Stealth
    # have no marquee 5 now.
    # MANHATTAN'S BOUNTY: the 4th and last, so every mainland seat is hunted by
    # exactly one 5. Five Points is Manhattan's Ward and home turf: Safehouse, Boss
    # and 2 Runners from setup, so this is a campaign against a garrison behind the
    # Safehouse's +1 Threat. Borough-disjoint from Queens/Bronx/Brooklyn, so the
    # "never two 5s" guarantee holds. Still 10 = Pressure 3, so The Copper Heist
    # can never ride it.
    # MANHATTAN'S BOUNTY, and the 4th distinct act in the set: Queens kills the head,
    # Brooklyn the body count, the Bronx takes the ground, Manhattan burns the base.
    # WAS "Seize Five Points": a hole: that named no garrison, so if the Manhattan
    # player Secured away you could take it off a lone Runner for 5 Respect. This
    # can't go dead either: every crew always has exactly one Safehouse, and
    # Manhattan's starts in Five Points at setup. Combat rules do the work
    # ("a rival Safehouse in the District is destroyed, unless you take it over").
    # Always co-fires with The Eviction (5+3=8, legal); mutually exclusive with
    # The Copper Heist, which forbids a Safehouse.
    # SETS PASS 2026-10-11: Manhattan's body count (Nick: the Safehouse wording was unclear).
    ("Bloody Sunday", "Bloody Sunday.jpg", "Open Fire",
     "Kill <b>5+ rival Runners</b> in <b>Manhattan</b>.",
     "By Monday there was nothing left to come home to."),
    # "the Bronx" is load-bearing: it keeps the four Open Fire 5s borough-disjoint,
    # so two 5s can NEVER fire on one Play. "and no Safehouse" was ALSO here to block
    # The Eviction: now REDUNDANT and removed (solver-verified: The Copper Heist's own
    # "no Safehouse" already makes it and The Eviction mutually exclusive, which is what
    # actually closed cluster 3). Max stack unchanged at 9.
    # SETS PASS 2026-10-11: the Bronx's body count. A Fold now denies it, as it does the others.
    ("Over the Top", "Old Guard.jpg", "Open Fire",
     "Kill <b>5+ rival Runners</b> in <b>the Bronx</b>.",
     "These boys went over the top in France. This is a street."),
    # SETS PASS 2026-10-11: Queens' body count. The Toll Booth Trap moved to the Boss set, where it
    # started. Art: a gunfight on a burning pier.
    ("Rum Wars", "Rum Wars.jpg", "Open Fire",
     "Kill <b>5+ rival Runners</b> in <b>Queens</b>.",
     "Nobody counted the bodies. Everybody counted the crates."),
    # BROOKLYN'S BOUNTY. Stays in Brooklyn: Murder, Inc. ran out of Brownsville.
    # SETS PASS 2026-10-11: Brooklyn's body count, and the model for the set (Nick).
    ("The Butcher&rsquo;s Ledger", "Butchers Ledger.jpg", "Open Fire",
     "Kill <b>5+ rival Runners</b> in <b>Brooklyn</b>.",
     "Every name in it is crossed out but one."),
    # SETS PASS 2026-10-11: Manhattan's Boss. A nod, not a lesson: the Park Central room where the
    # story starts, unnamed. Art: a man dead in a hotel bed, two men in the doorway.
    ("Room 349", "The Big Sleep.jpg", "Open Fire",
     "Kill a <b>rival Boss</b> in <b>Manhattan</b>.",
     "He went upstairs to talk business. They carried him down."),
    # SETS PASS 2026-10-11: the Bronx's Boss. "Taken for a ride" was the 1920s phrase for a gangland
    # killing. Art: a tommy gun from a running car.
    ("The One-Way Ride", "Gatsby.jpg", "Open Fire",
     "Kill a <b>rival Boss</b> in <b>the Bronx</b>.",
     "Get in the car. Nobody asks where it is going."),
    # "with an Open Fire Play" DELETED: Hit is the Sicilians' Signature Play (Cost 2)
    # and exists purely to kill Bosses: the old wording locked the boss-killing mob
    # out of using its boss-killing power on the deck's only boss-kill card. Worded
    # by outcome now, so Open Fire, Hit and Plunder all count (§4: an event has an
    # actor, an object and a moment: not a button).
    # "your own Boss in the fight" is a SETUP hedge, not a circumstance one: you must
    # march your Boss into Queens and risk him. It also grants +1 Threat, so it's a
    # real trade rather than a tax.
    # SETS PASS 2026-10-11: Queens' Boss. "with your own Boss in the fight" cut (Nick: niche enough
    # without it).
    ("The Toll Booth Trap", "Toll Booth Trap.jpg", "Open Fire",
     "Kill a <b>rival Boss</b> in <b>Queens</b>.",
     "A toll is a toll. Somebody always pays it."),
    # SETS PASS 2026-10-11: Brooklyn's Boss. Art: a man taken by the collar at a card table.
    ("The Last Hand", "Debt Collector.jpg", "Open Fire",
     "Kill a <b>rival Boss</b> in <b>Brooklyn</b>.",
     "He was holding aces. It did not help."),
]

PIPS = {1: 1, 3: 2, 5: 3}
CLS = {1: "gig", 3: "racket", 5: "score"}

# Back reads "Job", singular and unbroken: it is the back of ONE card, and the
# two-line "The/Jobs" set the title band taller than the Rat and Marks backs in
# Cards v0.9. Folded back from a hand edit, 2026-07-24.
# The back's look is css/card-back.css, shared with Cards v0.9 (2026-10-07).
BACK = ('  <div class="back"><div class="back-title">Job</div>'
        '<div class="back-sub">Moonshine Kingdom</div>'
        '<div class="back-foot">New York &middot; 1929</div></div>')


def visible_len(t):
    """Length as rendered: entities collapse to one glyph."""
    return len(re.sub(r'&[a-z]+;', 'x', t))


def card(entry, respect):
    title, art, verb, obj, flav = entry
    pips = "".join('<span class="pip"></span>' for _ in range(PIPS[respect]))
    longcls = ' title--long' if visible_len(title) >= 16 else ''
    return (
        f'  <div class="card card--{CLS[respect]}">\n'
        f'    <div class="tier"><span class="stake"><span class="stake-lbl">Stake</span>{pips}</span></div>\n'
        f'    <h2 class="title{longcls}">{title}</h2>\n'
        f'    <div class="art"><img src="Art/Jobs/{art}" alt=""></div>\n'
        f'    <div class="job-label">The Job</div>\n'
        f'    <div class="job"><span>{obj}</span></div>\n'
        f'    <div class="flavour">{flav}</div>\n'
        f'    <div class="respect" data-respect="{respect}"></div>\n'
        f'    <span class="verb">{verb}</span>\n'
        f'  </div>'
    )


def tier_head(lbl, meta):
    return ('<div class="tier-head">\n'
            f'  <span class="dia"></span><span class="lbl">{lbl}</span>\n'
            f'  <span class="meta">{meta}</span>\n'
            '  <span class="rule"></span>\n'
            '</div>')


def blocks(cards, respect):
    if len(cards) % 4:
        raise SystemExit(f"{respect}-Respect tier has {len(cards)} cards; must be a multiple of 4")
    out = []
    for i in range(0, len(cards), 4):
        chunk = cards[i:i + 4]
        out.append('<div class="gallery">\n' + "\n".join(card(c, respect) for c in chunk) + '\n</div>')
        out.append('<div class="backs">\n' + "\n".join([BACK] * 4) + '\n</div>')
    return "\n".join(out)


total = len(ONES) + len(THREES) + len(FIVES)

# Resolve against the REPO ROOT (this script's parent), not the shell's cwd. A bare
# relative path made the integrity check depend on where you launched from: it threw
# FileNotFoundError from anywhere but the root, and would have rewritten a same-named
# file in any other directory that had one.
DECK = 'Jobs Cards v0.9.html'
path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), DECK)
# Version comes off the filename so the masthead can't drift from it again (it was
# still printing "v0.8" on the v0.9 sheet).
VERSION = re.search(r'v\d+(?:\.\d+)*', DECK).group(0)

# "your own Plays" (2026-09-25): the unit never said whose Play. Four cards could
# pay on defence: The Toll Booth Trap and The Butcher's Ledger by Ambush or return
# fire, The Irish Goodbye the same way (a defender never takes Control, so its
# "take no Control" is always true), and Squatter's Rights by a Fold or a Raid
# Scatter into a Defenseless District. The same gap Nick closed on The Insurance
# Job by naming the Rat. A Raid your own Play sets off is still part of that Play.
body = f'''<body>

<div class="masthead">
  <div class="masthead-kicker">Prohibition &middot; New York &middot; 1929</div>
  <div class="masthead-title">The Jobs Deck</div>
  <div class="masthead-sub">{VERSION} &middot; Complete Deck &middot; {total} Cards &middot; {len(ONES)} / {len(THREES)} / {len(FIVES)}</div>
  <p class="masthead-note">
    Every Job is an <b>event</b>, not a board state: a verb, an object, and a moment.
    The Play is the unit: at the end of each of your own Plays, check whether that Play did the thing.
    A count is what that one Play did.
    Things that happened during the Play count, even if undone before it ended.
  </p>
</div>

{tier_head("1 RESPECT", f"Stake 1 &middot; an evening&rsquo;s work, little setup &middot; {len(ONES)} cards")}
{blocks(ONES, 1)}
{tier_head("3 RESPECT", f"Stake 2 &middot; one Play, real turf behind it &middot; {len(THREES)} cards")}
{blocks(THREES, 3)}
{tier_head("5 RESPECT", f"Stake 3 &middot; one Play, and a campaign to earn it &middot; {len(FIVES)} cards")}
{blocks(FIVES, 5)}

</body>'''

src = open(path, encoding='utf-8').read()
# Anchor on the tag at a LINE START, not the first occurrence anywhere. A plain
# .index() also matches the string inside a <style> or <script> comment, and the
# head then gets truncated mid-comment and the rest of the stylesheet silently
# discarded -- the exact destruction the SAFETY block below exists to prevent.
# (Live near-miss 2026-07-18: the trim-mode comment in the deck's head said
# "adds .trim to <body>", and this line matched THAT.)
m = re.search(r'^<body>', src, re.M)
if not m:
    raise SystemExit(f"{path}: no <body> tag at a line start; refusing to guess.")
head = src[:m.start()]
new = head + body + "\n</html>\n"

# SAFETY (added after the deck was declared complete at v0.8).
# This script rewrites the ENTIRE <body> of the deck file from the table above, so any
# polish edit made to the HTML by hand is silently destroyed the next time it runs.
# The deck is finished, so that is now the likely outcome of running it, not the
# intended one. It therefore refuses to write unless the file already matches (no-op)
# or you pass --force. Run it with no arguments as an integrity check: "no change"
# means the printed deck and this card table still agree.
if new == src:
    print(f"no change: {path} already matches this card table")
elif '--force' not in sys.argv:
    raise SystemExit(
        f"REFUSING TO WRITE: {path} differs from the card table in this script.\n"
        "The deck is complete, so this is most likely a hand edit to the HTML that a\n"
        "write would destroy. Fold the change into the table above instead, then re-run\n"
        "with --force. Do not run this simply to 'refresh' the file."
    )
else:
    open(path, 'w', encoding='utf-8').write(new)
    print(f"WROTE {path}")

print(f"ones {len(ONES)}  threes {len(THREES)}  fives {len(FIVES)}  total {total}")
print(f"print pages: {total // 4 * 2}")
