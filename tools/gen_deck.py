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
ONES = [
    ("The Milk Run", "The Milk Run.jpg", "Move",
     "Move <b>4+ Barrels</b> between <b>Five Points</b> and <b>Williamsburg</b> in a single Play.",
     "Every copper watches that bridge. Wave as you go."),
    ("The Beachhead", "Beachhead.jpg", "Secure",
     "Secure your Safehouse into a District <b>Land Connected</b> to a rival <b>Safehouse</b>.",
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
    ("Tenement Army", "Tenament Army.jpg", "Recruit",
     "Recruit <b>4+ Runners</b> in one Play, with your <b>Safehouse</b> in a <b>Ward</b> whose <b>Borough Deed you hold</b>.",
     "Word goes round by supper. By dark, you have a crew."),
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
    ("Last Call", "Last Call.jpg", "Unload",
     "Unload <b>4+ Barrels</b> at <b>Coney Island</b> in one Play.",
     "Pour till the taps run dry and the sirens start up."),
    # "After your Boss is killed" is LOAD-BEARING, and doubly so from v0.9, where
    # Rise keeps its flexible form (place your Boss in any Safe District, whether
    # he is on the board or not). Without the death clause a living Boss simply
    # relocates into a Ward you already Control and the card pays for nothing.
    # Folded back from a hand edit to the HTML, 2026-07-24.
    # COUNTERPLAY PASS (2026-08-04). Scored diff 6 / engagement 0 -- the worst trade in
    # the deck. RIVAL 3 and WINDOW 3: it is not merely hard, it is DEAD until a rival
    # chooses to kill your Boss, which you cannot cause and they can simply decline to do.
    #
    # ⚠ THE FIRST REWRITE WAS AN IMPOSSIBLE CARD (Nick caught it, 2026-08-04). It read
    # "Rise your Boss in a Ward a rival Controls", which fails TWICE over:
    #   1. TIMING. Taking the district is its own Play; Control transfers the moment you
    #      win. So at the instant of the Rise the Ward is YOURS, and the objective can
    #      never be true at its own checkpoint. You cannot fight and Rise in one Play.
    #   2. THE PLAY'S OWN TEXT. Rise is "Place your Boss in any SAFE District", and the
    #      rulebook defines Safe as "any District you Control, plus any Defenseless
    #      block". Rival-held turf is Hostile by definition, so Rise can never target it.
    # LESSON, and it is the handoff's own §6 lesson arriving from a new direction: check
    # a rewritten objective against the PLAY'S TEXT, not just the deck's audits. The
    # overlap model encoded the same impossibility (ward AND hostile), so every audit
    # passed a dead card. A silent zero is not a pass.
    #
    # THE FIX, which stays inside Rise's real rules: a Defenseless block IS Safe, so
    # Rising into an unclaimed district in a rival's BOROUGH is legal, contestable (they
    # can garrison or claim it before you get there) and provocative (a Boss appearing on
    # their turf is the deterrent this deck is built on). "A Borough whose Deed you don't
    # hold" is the same glance-verifiable test Union Dues and Last One Standing use --
    # you hold the card or you don't -- rather than a Control state that changes mid-Play.
    ("The Empty Casket", "The Empty Casket.jpg", "Rise",
     "Rise your <b>Boss</b> into a <b>Defenseless District</b> in a Borough whose <b>Deed you don&rsquo;t hold</b>.",
     "They buried the wrong man. Ask anyone. Go on, ask."),
    # COUNTERPLAY PASS (2026-08-04). Scored diff 1 -- the easiest card in the deck by a
    # clear margin, and BLOCK 0: nobody goes to Staten, so nobody can stop you going.
    # "+ 4 Barrels" is the cheapest possible fix and it uses the board's own geography:
    # Staten grows almost nothing (Westerleigh is Pressure 1, Tottenville 3), so the
    # barrels must be HAULED in across water, which is visible and interceptable. That
    # is the same logic The Smuggler's Run is built on, at a 1-Respect scale.
    # Keeps the theme exactly: you are not just moving in, you are moving in stocked.
    ("Fortress Staten", "Fortress Staten.jpg", "Secure",
     "Secure your Safehouse into a <b>Staten Island</b> District holding <b>4+ Barrels</b>.",
     "Nobody&rsquo;s home turf. Everybody&rsquo;s back door."),
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
    ("The Pier Six Brawl", "Dock Domination.jpg", "Open Fire",
     "Seize a <b>Dock</b> District held by a rival, with <b>no Safehouse</b>.",
     "The pier belongs to whoever is still standing on it."),
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
    ("The Dutchman's Deal", "Dutchman.jpg", "Trade",
     "Trade <b>3+ Barrels of Moonshine</b> for Rum at a <b>Manhattan Dock</b>.",
     "He never gives a name. The windmill on the sack says plenty."),
    # COUNTERPLAY PASS (2026-08-04). Was "a $300 Speakeasy" = 8 venues, BLOCK 1, and it
    # was ALSO the deck's widest flagged overlap: Last Call + Angel's Share co-fired
    # across FIVE districts (breadth_audit). Naming one venue each fixes the engagement
    # AND the overlap in a single edit -- the two cards now name different venues, so
    # they can never co-fire at all.
    # East Harlem is Manhattan's starting Speakeasy (garrisoned from setup, Still 12 =
    # Pressure 1, so it brews nothing and the Rum must be shipped in) and it is on the
    # East River, which The Grand Tour already names -- reusing a landmark venue rather
    # than spending a new named location against Manhattan's 4-per-borough quota.
    ("The Angel&rsquo;s Share", "The Angels Share.jpg", "Unload",
     "Unload <b>3+ Barrels of Moonshine</b> at <b>East Harlem</b>.",
     "What the angels take, the house bills you for anyway."),
    # RENAMED from "The Riverside Switch" and re-arted (Nick, 2026-07-19). The old
    # art (Switch.png) has RIVERSIDE STORAGE painted across a moonlit suspension
    # bridge, which fought the objective twice over: Jamaica Bay is a bay, and in
    # 1926 it had no major bridge at all (Marine Parkway is 1937, Cross Bay 1939).
    # Skiff.png is two men running a LIQUOR crate across black water in the rain,
    # harbour lights behind: the flavour line drawn as a picture. At 13 characters
    # the new name also clears the 16-char title--long threshold.
    # LANDMARK: "on Jamaica Bay" is labelled on the board and holds exactly two
    # Docks: Sheepshead Bay (Bk) and Jamaica (Q). Coney Island sits on that water
    # but carries no anchor, so there is nothing to argue about. This was the fix
    # for the deck's other big geographic swing: this card was a strict
    # SUBSET of The Smuggler's Run (Staten -> mainland at 6+ barrels IS "4+ across
    # water into a Dock"), paying 6 Respect across 6 Docks. Now 2.
    ("Night Landing", "Skiff.jpg", "Move",
     "Move <b>4+ Barrels</b> across water into a <b>Dock on Jamaica Bay</b>.",
     "Two boats, one lantern, and nobody the wiser."),
    ("Squatter&rsquo;s Rights", "Ghost Town.jpg", "Move",
     "Take Control of a <b>Defenseless District</b> in a Borough where a <b>rival holds the Deed</b>.",
     "They left the lights on. They didn&rsquo;t leave anybody."),
    # LANDMARK (Nick, 2026-07-19): "along the East River" is a labelled feature on
    # the board, so the set is readable at a glance and cannot be argued: East
    # Harlem (M), Astoria (Q), Williamsburg (Bk), Red Hook (Bk). Coney Island is on
    # the ocean and is NOT in it. Breadth 12 -> 4. Also retires "outside your home
    # turf", the phrase rejected as ambiguous on Union Dues ("where you started, or
    # where your Deed is now?") but left standing here.
    ("The Grand Tour", "Cobble Hill.jpg", "Unload",
     "Unload <b>4+ Barrels</b> at a Speakeasy <b>along the East River</b>.",
     "Every borough drinks. Not every borough knows your face."),
]

THREES = [
    # Renamed from "Off the Boat" (2026-07-19, Nick): the art has always been
    # Cuban Prince.png, so the card is back on its own picture and the name now
    # points at the Havana end of the run rather than the Red Hook end. No "The":
    # at 12 characters it stays under the 16-char title--long threshold and
    # prints at full size.
    # SPLIT MARKET PASS (2026-08-09). Rum now pours under a Hotspot token and nowhere
    # else, so "Unload Rum at Sunny's Bar" was unfirable: Red Hook is a standard bar.
    # Retargeting the SALE to Brooklyn's Hotspot cost two things -- it took Brooklyn's
    # friendly 3 off its orphan joint (breaking the one-per-seat set the Guide teaches)
    # and it printed a 9-Respect triple with Opening Night + The Grand Tour, a new deck
    # maximum. Moving the OBJECTIVE instead of the address fixes both: the card keeps
    # Red Hook, keeps the Rum, and lands on the step the new economy actually made
    # hard, which is getting the brown stuff to an address at all. The flavour line was
    # always about the run rather than the sale, so it now reads literally.
    ("Cuban Prince", "Cuban Prince.jpg", "Move",
     "Move <b>3+ Barrels of Rum</b> into <b>Sunny&rsquo;s Bar</b>.",
     "Havana to Red Hook, and never once a warehouse."),
    # Re-arted from Rum Runners Regatta.png (Nick found the set in Unused/): a full
    # moon, the mother steamer lit up, six small boats waiting off a dark shore. The
    # flavour line already described this exact image. Rum Row 3.png was tried first
    # and is the better painting, but it is rainier and much lower contrast; at
    # 57x38mm this one reads, and the moon gives the eye somewhere to land.
    # NOT the same file as Art/Rum Row.png, which the rulebook uses on p.188.
    ("Rum Row", "Rum Row.jpg", "Trade",
     "Trade <b>4+ Moonshine</b> at a <b>Staten Island Dock</b> in one Play.",
     "Forty ships past the three-mile line, waiting on a lamp."),
    # Split from Bloody Sunday along the rulebook's OWN either/or: "a rival Safehouse
    # in the District is destroyed, UNLESS you take it over instead: immediately Secure
    # the District for free by relocating your Safehouse there." Destroy XOR take over,
    # so the two can never co-fire: the rules supply the guard, we don't invent one.
    # Was "Seize a District holding a rival Safehouse", which Bloody Sunday's trigger
    # was a strict subset of => a GUARANTEED 8, and the same act at two prices.
    # Worded by BOARD CONSEQUENCE, not intention: "relocating yours into it" is a fact
    # you can see on the table, so there is no semantic argument about which card fired.
    # The relocation is also a real cost (you abandon your old base) which holds it at 3.
    ("The Eviction", "Crimson Coup.jpg", "Open Fire",
     "Take over a rival&rsquo;s <b>Safehouse</b>, relocating yours into it.",
     "Nice place. He won&rsquo;t be needing it."),
    # "and no Safehouse" is the guard that closes handoff §3 cluster 3 for good.
    # The Eviction REQUIRES a rival Safehouse; this now FORBIDS one, so the two
    # can never ride the same Seize. Without it, one Open Fire on Richmond Hill
    # or Williamsburg paid 11 (Toll Booth/Butcher's Ledger + Eviction + Heist).
    # Theme holds: you're robbing a boiler standing on its own, not storming HQ.
    ("The Copper Heist", "Copper Heist.jpg", "Open Fire",
     "Seize a District with a <b>Pressure 5+ Still</b> and <b>no Safehouse</b>.",
     "The good boilers run hot. So do the men who own them."),
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
    ("The Insurance Job", "Insurance Job.jpg", "Rat",
     "<b>Rat</b>, and have the Raid <b>Padlock</b> a <b>Pressure 2 or lower Still</b> you Control.",
     "He struck the match himself. Slept fine after."),
    # MANHATTAN'S FRIENDLY: the 4th orphan Speakeasy (The Haymarket, in the
    # Tenderloin). Name restored from the cut Extort card, and its own art reused:
    # cops coming through the door of a joint mid-sale while men grab bottles and
    # cash. That IS the Greed Tax (Unload 4+ draws Heat) drawn as a picture.
    ("The Big Squeeze", "Big Squeeze.jpg", "Unload",
     "Unload <b>6+ Barrels</b> at <b>The Haymarket</b>.",
     "Six barrels in one night. The wagons come for less."),
    # BRONX'S FRIENDLY. Was the Bronx's second BOUNTY, which made it the worst seat;
    # re-objectived (Nick: keep the theme, change the objective) onto the Bronx's
    # orphan district. Fordham Road is a real Bronx thoroughfare, so "Hell's Highway"
    # now fits the objective better than it did.
    ("Hell&rsquo;s Highway", "Hells Highway.jpg", "Move",
     "Move <b>6+ Barrels</b> into <b>Fordham</b> in a single Play.",
     "Forty miles of bad road and worse intentions."),
    # QUEENS' FRIENDLY, and free: Queens was the only borough with nothing easy.
    # Paradise Alley = Flushing, Queens' non-starting Speakeasy: an exact mirror
    # of Off the Boat at Sunny's Bar (Red Hook) for Brooklyn. Also lifts Manhattan
    # and Queens off the named-location floor. The ironic name pairing is free.
    ("Poison Panic", "Poison Panic.jpg", "Unload",
     "Unload <b>6+ Barrels of Moonshine</b> at <b>Paradise Alley</b>.",
     "One bad batch and the whole city stops drinking."),
    # COUNTERPLAY PASS (2026-08-04). Engagement 1 -- near-solitaire: your own Still, your
    # own barrels, and ANY direction out, so there was nothing for a rival to deny.
    # Naming the destination is what creates the counterplay. A Ward is the right target:
    # every mainland Borough has exactly one (so it stays self-balancing, handoff §5),
    # Wards are where Recruiting happens so they are always garrisoned and always
    # contested, and it turns a private haul into a delivery someone can sit on.
    # The pipeline theme is unchanged and arguably better -- a pipeline needs two ends.
    # "you Control" is the guard: a bare "into a Ward" co-fired with Squatter's Rights
    # across 4 districts (a Move into an empty Ward is also a Take Control of a
    # Defenseless District). Controlled XOR Defenseless, so the two are now disjoint --
    # and a pipeline delivering into turf you hold is the more sensible reading anyway.
    ("Gin Pipeline", "Gin Pipeline.jpg", "Move",
     "Move <b>6+ Barrels of Moonshine</b> from a District with a <b>Pressure 5+ Still</b> into a <b>Ward you Control</b>.",
     "It never sees daylight. That is the entire idea."),
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
    ("Union Dues", "Union Dues.jpg", "Recruit",
     "Recruit <b>4+ Runners</b> in one Play, with your <b>Safehouse</b> in a <b>Ward</b> whose <b>Borough Deed you don't hold</b>.",
     "They line up at dawn. You decide who works."),
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
    ("Last One Standing", "Last One Standing.jpg", "Secure",
     "Secure your Safehouse into a <b>$300 Speakeasy</b> in a Borough whose <b>Deed you don&rsquo;t hold</b>.",
     "The last man at the table gets the chair."),
    # Re-themed off the Boss-kill (handoff §3, cluster 1). "Do not take Control"
    # is load-bearing: it makes this structurally unable to co-fire with ANY
    # Seize card (The Eviction / The Copper Heist / Over the Top), and it is
    # exactly what the art shows: he does the thing and walks out.
    # LANDMARK, and the HOSTILE half of the East River, the mirror of The Grand
    # Tour, so the four riverside joints are both a place to sell and a place to be
    # shot at, and the three seats they touch net out. Different verb from The
    # Grand Tour (Open Fire vs Unload), so the pair can never co-fire. Also drops
    # this from 12 Speakeasies to 4, which takes its stacks with The Toll Booth
    # Trap and The Butcher's Ledger down to 1 and 2 districts.
    # COUNTERPLAY PASS (2026-08-04). SOLITAIRE FAILURE: diff 10 -- the hardest 3 in the
    # deck and harder than THREE of the 5s -- for engagement 3. DICE 3 was the culprit:
    # 3 kills in one Play is the deck's second-worst variance, and variance is the wrong
    # kind of hard (you can play perfectly and fail).
    # 3+ -> 2+ kills. That is the whole edit. It keeps every structural job this card
    # does -- the East River landmark, the "take no Control" guard that makes it unable
    # to co-fire with any Seize card, the hostile half of the landmark that balances
    # The Grand Tour -- while pulling the dice requirement down to the Muscle Ratio's
    # comfortable range. It also inherits the 2-kill threshold The Pier Six Brawl just
    # vacated, so the deck keeps a low-variance combat step between 2 and Butcher's 5.
    ("The Irish Goodbye", "Goodbye.jpg", "Open Fire",
     "Kill <b>2+ rival Mobsters</b> in a Speakeasy <b>along the East River</b> in one Play, and <b>take no Control</b>.",
     "He left O&rsquo;Sullivan&rsquo;s without saying a word to anyone."),
]

FIVES = [
    # "of Rum" is redundant with the rules (High Society pours nothing else) but
    # says the quiet part out loud on the card: 8 barrels means the whole Trade
    # chain, not 8 barrels of swill. Folded back from a hand edit, 2026-07-24.
    ("Opening Night", "Jimmy.jpg", "Unload",
     "Unload <b>8+ Barrels of Rum</b> at a single <b>High Society</b> Speakeasy.",
     "The band plays till four. Nobody asks a thing."),
    # "with an Open Fire Play" DELETED: Hit is the Sicilians' Signature Play (Cost 2)
    # and exists purely to kill Bosses: the old wording locked the boss-killing mob
    # out of using its boss-killing power on the deck's only boss-kill card. Worded
    # by outcome now, so Open Fire, Hit and Plunder all count (§4: an event has an
    # actor, an object and a moment: not a button).
    # "your own Boss in the fight" is a SETUP hedge, not a circumstance one: you must
    # march your Boss into Queens and risk him. It also grants +1 Threat, so it's a
    # real trade rather than a tax.
    ("The Toll Booth Trap", "Toll Booth Trap.jpg", "Open Fire",
     "Kill a <b>rival Boss</b> in <b>Queens</b>, with your own <b>Boss</b> in the fight.",
     "A toll is a toll. Somebody always pays it."),
    # "the Bronx" is load-bearing: it keeps the four Open Fire 5s borough-disjoint,
    # so two 5s can NEVER fire on one Play. "and no Safehouse" was ALSO here to block
    # The Eviction: now REDUNDANT and removed (solver-verified: The Copper Heist's own
    # "no Safehouse" already makes it and The Eviction mutually exclusive, which is what
    # actually closed cluster 3). Max stack unchanged at 9.
    ("Over the Top", "Old Guard.jpg", "Open Fire",
     "Seize a <b>Bronx</b> District <b>defended by 5+ Mobsters</b>.",
     "These boys went over the top in France. This is a street."),
    ("The Five Families", "Accord.jpg", "Extort",
     "Collect from a District in <b>all five Boroughs</b> in a single Extort Play.",
     "Not the richest table in town. Just the widest."),
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
    ("The Smuggler&rsquo;s Run", "Quiet Drop.jpg", "Move",
     "Move <b>4+ Rum</b> from a <b>Staten Island Dock</b> into a <b>Dock a rival Controls</b>, and take <b>Control</b> of it.",
     "Nobody watches Staten Island. Every Dock touches it."),
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
    ("Bloody Sunday", "Bloody Sunday.jpg", "Open Fire",
     "Destroy a <b>rival Safehouse</b> in <b>Manhattan</b>, with your own <b>Mobsters</b> in the District.",
     "By Monday there was nothing left to come home to."),
    # BROOKLYN'S BOUNTY. Stays in Brooklyn: Murder, Inc. ran out of Brownsville.
    ("The Butcher&rsquo;s Ledger", "Butchers Ledger.jpg", "Open Fire",
     "Kill <b>5+ rival Mobsters</b> in <b>Brooklyn</b> in a single Play.",
     "Every name in it is crossed out but one."),
    # The campaign Secure: the four High Society joints start padlocked and
    # impassable, so this cannot even be attempted until a Raid throws one open.
    # + "4+ Barrels of Rum": the Raid gate alone made this a 2-Play card. Rum forces
    # the whole Trade chain on top, and the swanky room only pays $500 for what you
    # shipped in. Setup hedge, not circumstance.
    # COUNTERPLAY PASS (2026-08-04). SOLITAIRE FAILURE at 5 Respect: diff 11, engagement
    # 3. Nick's rule -- "all of the bigger jobs should involve counterplay; 5-Respect
    # solitaire isn't hard, they should be lower level." Every point of its difficulty
    # was private cost (Raid gate + Rum chain + relocation); no rival could do a thing
    # about any of it.
    # ⚠ "a rival Controls" WAS TRIED AND IS ILLEGAL -- the same impossibility that killed
    # the first Empty Casket rewrite (Nick, 2026-08-04). Secure reads "Place your one
    # Safehouse in any SAFE District", and Safe = "any District you Control, plus any
    # Defenseless block". Rival-held turf is Hostile, so Secure can never target it. Any
    # Job whose objective contradicts its own Play's text is a dead card, and NO audit
    # here will tell you -- read the Playbook entry for the verb. (Move is the exception
    # that misleads: it explicitly permits rival turf via the Standoff, which is why
    # The Smuggler's Run CAN say "a Dock a rival Controls" and this cannot.)
    #
    # "took from a rival" was drafted and REJECTED before it shipped: it is a claim about
    # HISTORY, not a fact on the table, and §3's rule is to prefer visible, self-checking
    # consequences to intentions (the same reason The Eviction says "relocating yours
    # into it" rather than "take over"). Two Days later nobody can prove who held it.
    #
    # THE FIX THAT IS BOTH LEGAL AND GLANCE-VERIFIABLE: keep Secure on turf you hold, and
    # put the counterplay in the RIVAL SAFEHOUSE clause. Every crew has exactly one
    # Safehouse, so "Land Connected to a rival Safehouse" means you are moving in next
    # door to a specific named player -- they can see it, and they can relocate to break
    # it (a real cost, which is the point). It reuses The Beachhead's own wording, so the
    # deck already teaches this phrase, and it keeps the Raid gate and the Rum chain.
    ("High Roller", "High Roller.jpg", "Secure",
     "Secure your Safehouse into a <b>High Society</b> District holding <b>4+ Rum</b>, <b>Land Connected</b> to a rival <b>Safehouse</b>.",
     "He moved uptown. The neighbours are still adjusting."),
]

PIPS = {1: 1, 3: 2, 5: 3}
CLS = {1: "gig", 3: "racket", 5: "score"}

# Back reads "Job", singular and unbroken: it is the back of ONE card, and the
# two-line "The/Jobs" set the title band taller than the Rat and Marks backs in
# Cards v0.9. Folded back from a hand edit, 2026-07-24.
BACK = ('  <div class="back"><div class="back-dia"></div><div class="back-title">Job</div>'
        '<div class="back-rule"></div><div class="back-sub">Moonshine Kingdom</div>'
        '<div class="back-foot">New York &middot; 1926</div></div>')


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

body = f'''<body>

<div class="masthead">
  <div class="masthead-kicker">Prohibition &middot; New York &middot; 1926</div>
  <div class="masthead-title">The Jobs Deck</div>
  <div class="masthead-sub">{VERSION} &middot; Complete Deck &middot; {total} Cards &middot; 12 / 12 / 8</div>
  <p class="masthead-note">
    Every Job is an <b>event</b>, not a board state: a verb, an object, and a moment.
    The Play is the unit: at the end of a Play, check whether that Play did the thing.
    Things that happened during the Play count, even if undone before it ended.
  </p>
</div>

{tier_head("1 RESPECT", "Stake 1 &middot; an evening&rsquo;s work, little setup &middot; 12 cards")}
{blocks(ONES, 1)}
{tier_head("3 RESPECT", "Stake 2 &middot; one Play, real turf behind it &middot; 12 cards")}
{blocks(THREES, 3)}
{tier_head("5 RESPECT", "Stake 3 &middot; one Play, and a campaign to earn it &middot; 8 cards")}
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
