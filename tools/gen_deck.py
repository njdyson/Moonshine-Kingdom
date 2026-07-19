# -*- coding: utf-8 -*-
"""Regenerate the Jobs deck body from a data table.

Guarantees the load-bearing build rule: gallery blocks are EXACTLY 4 cards + 4
backs, or the duplex front/back pairing breaks in print.
"""
import re
import sys

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# (title, art, verb, objective_html, flavour)
ONES = [
    ("The Milk Run", "The Milk Run.png", "Move",
     "Move <b>4+ Barrels</b> between <b>Five Points</b> and <b>Williamsburg</b> in a single Play.",
     "Every copper watches that bridge. Wave as you go."),
    ("The Beachhead", "Beachhead.png", "Secure",
     "Secure your Safehouse into a District <b>Connected by Land or Bridge</b> to a rival <b>Safehouse</b>.",
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
    ("Tenement Army", "Tenament Army.png", "Recruit",
     "Recruit <b>5+ Runners</b> in one Play, with your <b>Safehouse</b> in a <b>Ward</b> whose <b>Borough Deed you hold</b>.",
     "Word goes round by supper. By dark, you have a crew."),
    # "$300" is the guard: Opening Night is High-Society-only, so the two are now
    # structurally unable to co-fire rather than merely unlikely to. That pair was
    # the deck's biggest purely-geographic swing (6 Respect across the 4 High
    # Society joints). Matches the wording The Angel's Share already uses.
    ("Last Call", "Last Call.png", "Unload",
     "Unload <b>4+ Barrels</b> at a single <b>$300 Speakeasy</b> in one Play.",
     "Pour till the taps run dry and the sirens start up."),
    ("The Empty Casket", "The Empty Casket.png", "Rise",
     "Rise a new <b>Boss</b> in a <b>Ward</b> you Control.",
     "They buried the wrong man. Ask anyone. Go on, ask."),
    ("Fortress Staten", "Fortress Staten.png", "Secure",
     "Secure your Safehouse into a <b>Staten Island</b> District.",
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
    ("The Pier Six Brawl", "Dock Domination.png", "Open Fire",
     "Kill <b>2+ rival Mobsters</b> on a <b>Dock</b> District in a single Play.",
     "The pier belongs to whoever is still standing on it."),
    # Briefly restricted to "a mainland Dock" to stop Rum Row paying this card
    # too, then REVERTED (Nick, 2026-07-19): that stack fires only at Westerleigh
    # and Tottenville (2 districts), and a 2-district overlap you had to draft
    # over two Days and keep staked is good play, not a bug. Breadth is the test,
    # not whether the stack is guaranteed. See the note above ONES.
    ("The Dutchman's Deal", "Dutchman.png", "Trade",
     "Trade <b>3+ Barrels of Moonshine</b> for Rum at a <b>Dock</b> District.",
     "He never gives a name. The windmill on the sack says plenty."),
    ("The Angel&rsquo;s Share", "The Angels Share.png", "Unload",
     "Unload <b>3+ Barrels of Rum</b> at a <b>$300 Speakeasy</b>.",
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
    ("Night Landing", "Skiff.png", "Move",
     "Move <b>4+ Barrels</b> across water into a <b>Dock on Jamaica Bay</b>.",
     "Two boats, one lantern, and nobody the wiser."),
    ("Squatter&rsquo;s Rights", "Ghost Town.png", "Move",
     "Take Control of a <b>Defenseless District</b> in a Borough where a <b>rival holds the Deed</b>.",
     "They left the lights on. They didn&rsquo;t leave anybody."),
    # LANDMARK (Nick, 2026-07-19): "along the East River" is a labelled feature on
    # the board, so the set is readable at a glance and cannot be argued: East
    # Harlem (M), Astoria (Q), Williamsburg (Bk), Red Hook (Bk). Coney Island is on
    # the ocean and is NOT in it. Breadth 12 -> 4. Also retires "outside your home
    # turf", the phrase rejected as ambiguous on Union Dues ("where you started, or
    # where your Deed is now?") but left standing here.
    ("The Grand Tour", "Cobble Hill.png", "Unload",
     "Unload <b>4+ Barrels</b> at a Speakeasy <b>along the East River</b>.",
     "Every borough drinks. Not every borough knows your face."),
]

THREES = [
    # Renamed from "Off the Boat" (2026-07-19, Nick): the art has always been
    # Cuban Prince.png, so the card is back on its own picture and the name now
    # points at the Havana end of the run rather than the Red Hook end. No "The":
    # at 12 characters it stays under the 16-char title--long threshold and
    # prints at full size.
    ("Cuban Prince", "Cuban Prince.png", "Unload",
     "Unload <b>3+ Barrels of Rum</b> at <b>Sunny&rsquo;s Bar</b>.",
     "Havana to Red Hook, and never once a warehouse."),
    # Re-arted from Rum Runners Regatta.png (Nick found the set in Unused/): a full
    # moon, the mother steamer lit up, six small boats waiting off a dark shore. The
    # flavour line already described this exact image. Rum Row 3.png was tried first
    # and is the better painting, but it is rainier and much lower contrast; at
    # 57x38mm this one reads, and the moon gives the eye somewhere to land.
    # NOT the same file as Art/Rum Row.png, which the rulebook uses on p.188.
    ("Rum Row", "Rum Row.png", "Trade",
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
    ("The Eviction", "Crimson Coup.png", "Open Fire",
     "Take over a rival&rsquo;s <b>Safehouse</b>, relocating yours into it.",
     "Nice place. He won&rsquo;t be needing it."),
    # "and no Safehouse" is the guard that closes handoff §3 cluster 3 for good.
    # The Eviction REQUIRES a rival Safehouse; this now FORBIDS one, so the two
    # can never ride the same Seize. Without it, one Open Fire on Richmond Hill
    # or Williamsburg paid 11 (Toll Booth/Butcher's Ledger + Eviction + Heist).
    # Theme holds: you're robbing a boiler standing on its own, not storming HQ.
    ("The Copper Heist", "Copper Heist.png", "Open Fire",
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
    # 3-Respect card also carrying the Rat Card (no Bribes, no crown) would never
    # be claimed, and in a STATIC Market an unclaimed card squats a slot forever.
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
    ("The Insurance Job", "Insurance Job.png", "Rat",
     "<b>Rat</b>, and have the Raid <b>Padlock</b> a <b>Pressure 2 or lower Still</b> you Control.",
     "He struck the match himself. Slept fine after."),
    # MANHATTAN'S FRIENDLY: the 4th orphan Speakeasy (The Haymarket, in the
    # Tenderloin). Name restored from the cut Extort card, and its own art reused:
    # cops coming through the door of a joint mid-sale while men grab bottles and
    # cash. That IS the Greed Tax (Unload 4+ draws Heat) drawn as a picture.
    ("The Big Squeeze", "Big Squeeze.png", "Unload",
     "Unload <b>6+ Barrels</b> at <b>The Haymarket</b>.",
     "Six barrels in one night. The wagons come for less."),
    # BRONX'S FRIENDLY. Was the Bronx's second BOUNTY, which made it the worst seat;
    # re-objectived (Nick: keep the theme, change the objective) onto the Bronx's
    # orphan district. Fordham Road is a real Bronx thoroughfare, so "Hell's Highway"
    # now fits the objective better than it did.
    ("Hell&rsquo;s Highway", "Hells Highway.png", "Move",
     "Move <b>6+ Barrels</b> into <b>Fordham</b> in a single Play.",
     "Forty miles of bad road and worse intentions."),
    # QUEENS' FRIENDLY, and free: Queens was the only borough with nothing easy.
    # Paradise Alley = Flushing, Queens' non-starting Speakeasy: an exact mirror
    # of Off the Boat at Sunny's Bar (Red Hook) for Brooklyn. Also lifts Manhattan
    # and Queens off the named-location floor. The ironic name pairing is free.
    ("Poison Panic", "Poison Panic.png", "Unload",
     "Unload <b>6+ Barrels of Moonshine</b> at <b>Paradise Alley</b>.",
     "One bad batch and the whole city stops drinking."),
    ("Gin Pipeline", "Gin Pipeline.png", "Move",
     "Move <b>6+ Barrels of Moonshine</b> out of a District with a <b>Pressure 5+ Still</b> in one Play.",
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
    ("Union Dues", "Union Dues.png", "Recruit",
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
    ("Last One Standing", "Last One Standing.png", "Secure",
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
    ("The Irish Goodbye", "Goodbye.png", "Open Fire",
     "Kill <b>3+ rival Mobsters</b> in a Speakeasy <b>along the East River</b> in one Play, and <b>take no Control</b>.",
     "He left O&rsquo;Sullivan&rsquo;s without saying a word to anyone."),
]

FIVES = [
    ("Opening Night", "Jimmy.png", "Unload",
     "Unload <b>8+ Barrels</b> at a single <b>High Society</b> Speakeasy.",
     "The band plays till four. Nobody asks a thing."),
    # "with an Open Fire Play" DELETED: Hit is the Sicilians' Signature Play (Cost 2)
    # and exists purely to kill Bosses: the old wording locked the boss-killing mob
    # out of using its boss-killing power on the deck's only boss-kill card. Worded
    # by outcome now, so Open Fire, Hit and Plunder all count (§4: an event has an
    # actor, an object and a moment: not a button).
    # "your own Boss in the fight" is a SETUP hedge, not a circumstance one: you must
    # march your Boss into Queens and risk him. It also grants +1 Threat, so it's a
    # real trade rather than a tax.
    ("The Toll Booth Trap", "Toll Booth Trap.png", "Open Fire",
     "Kill a <b>rival Boss</b> in <b>Queens</b>, with your own <b>Boss</b> in the fight.",
     "A toll is a toll. Somebody always pays it."),
    # "the Bronx" is load-bearing: it keeps the four Open Fire 5s borough-disjoint,
    # so two 5s can NEVER fire on one Play. "and no Safehouse" was ALSO here to block
    # The Eviction: now REDUNDANT and removed (solver-verified: The Copper Heist's own
    # "no Safehouse" already makes it and The Eviction mutually exclusive, which is what
    # actually closed cluster 3). Max stack unchanged at 9.
    ("Over the Top", "Old Guard.png", "Open Fire",
     "Seize a <b>Bronx</b> District <b>defended by 5+ Mobsters</b>.",
     "These boys went over the top in France. This is a street."),
    ("The Five Families", "Accord.png", "Extort",
     "Collect from a District in <b>all five Boroughs</b> in a single Extort Play.",
     "Not the richest table in town. Just the widest."),
    # Moonshine -> RUM (Nick). A setup hedge: Rum only exists via Trade at a Dock you
    # Control, and Staten's own boilers are hopeless (Westerleigh Pressure 1,
    # Tottenville 3), so the moonshine must be hauled IN, Traded, then run out.
    # Roughly doubles the setup. Bonus: now mutually exclusive with Gin Pipeline
    # (Moonshine), which it used to be able to co-fire with.
    ("The Smuggler&rsquo;s Run", "Quiet Drop.png", "Move",
     "Move <b>6+ Rum</b> from a <b>Staten Island Dock</b> to a <b>mainland Dock</b> in one Play.",
     "Nobody watches Staten Island. Every Dock touches it."),
    # MANHATTAN'S BOUNTY: the 4th and last, so every mainland seat is hunted by
    # exactly one 5. Five Points is Manhattan's Ward and home turf: Safehouse, Boss
    # and 2 Runners from setup, so this is a campaign against a garrison behind the
    # Safehouse's +2 Threat. Borough-disjoint from Queens/Bronx/Brooklyn, so the
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
    ("Bloody Sunday", "Bloody Sunday.PNG", "Open Fire",
     "Destroy a <b>rival Safehouse</b> in <b>Manhattan</b>, with your own <b>Mobsters</b> in the District.",
     "By Monday there was nothing left to come home to."),
    # BROOKLYN'S BOUNTY. Stays in Brooklyn: Murder, Inc. ran out of Brownsville.
    ("The Butcher&rsquo;s Ledger", "Butchers Ledger.png", "Open Fire",
     "Kill <b>5+ rival Mobsters</b> in <b>Brooklyn</b> in a single Play.",
     "Every name in it is crossed out but one."),
    # The campaign Secure: the four High Society joints start padlocked and
    # impassable, so this cannot even be attempted until a Raid throws one open.
    # + "4+ Barrels of Rum": the Raid gate alone made this a 2-Play card. Rum forces
    # the whole Trade chain on top, and the swanky room only pays $500 for what you
    # shipped in. Setup hedge, not circumstance.
    ("High Roller", "High Roller.png", "Secure",
     "Secure your Safehouse into a <b>High Society</b> District holding <b>4+ Rum</b>.",
     "He moved uptown. The neighbours are still adjusting."),
]

PIPS = {1: 1, 3: 2, 5: 3}
CLS = {1: "gig", 3: "racket", 5: "score"}

BACK = ('  <div class="back"><div class="back-dia"></div><div class="back-title">The<br>Jobs</div>'
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

body = f'''<body>

<div class="masthead">
  <div class="masthead-kicker">Prohibition &middot; New York &middot; 1926</div>
  <div class="masthead-title">The Jobs Deck</div>
  <div class="masthead-sub">v0.8 &middot; Complete Deck &middot; {total} Cards &middot; 12 / 12 / 8</div>
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

path = 'Jobs Cards v0.8.html'
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
