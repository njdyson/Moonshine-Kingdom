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
     "Move <b>4+ Barrels</b> across the <b>Williamsburg Bridge</b> in a single Play.",
     "Every copper watches that bridge. Wave as you go."),
    ("The Beachhead", "Beachhead.png", "Secure",
     "Secure your Safehouse into a District <b>Land-Connected to a rival Safehouse</b>.",
     "You should meet the neighbours. They&rsquo;d rather not."),
    ("Tenement Army", "Tenament Army.png", "Recruit",
     "Recruit <b>6+ Runners</b> in a <b>Ward</b> in a single Play.",
     "Word goes round by supper. By dark, you have a crew."),
    ("Last Call", "Last Call.png", "Unload",
     "Unload <b>4+ Barrels</b> at a single Speakeasy in one Play.",
     "Pour till the taps run dry and the sirens start up."),
    ("The Empty Casket", "The Empty Casket.png", "Rise",
     "Rise a new <b>Boss</b> in a <b>Ward</b> you Control.",
     "They buried the wrong man. Ask anyone. Go on &mdash; ask."),
    ("Fortress Staten", "Fortress Staten.png", "Secure",
     "Secure your Safehouse into a <b>Staten Island</b> District.",
     "Nobody&rsquo;s home turf. Everybody&rsquo;s back door."),
    # "a Pier 6 brawl" was real period slang for an all-out waterfront fight.
    ("The Pier Six Brawl", "Dock Domination.png", "Open Fire",
     "Kill <b>2+ rival Mobsters</b> on a <b>Dock</b> District in a single Play.",
     "The pier belongs to whoever is still standing on it."),
    ("The Dutchman's Deal", "Dutchman.png", "Trade",
     "Trade <b>3+ Barrels of Moonshine</b> for Rum at a <b>Dock</b> District.",
     "He never gives a name. The windmill on the sack says plenty."),
    ("The Angel&rsquo;s Share", "The Angels Share.png", "Unload",
     "Unload <b>3+ Barrels of Rum</b> at a <b>$300 Speakeasy</b>.",
     "What the angels take, the house bills you for anyway."),
    # "Riverside" is the warehouse sign painted in the art itself.
    ("The Riverside Switch", "Switch.png", "Move",
     "Move <b>4+ Barrels</b> across water into a <b>Dock</b> District.",
     "Two boats, one lantern, and nobody the wiser."),
    ("Squatter&rsquo;s Rights", "Ghost Town.png", "Move",
     "Take Control of a <b>Defenseless District</b> in a Borough where a <b>rival holds the Deed</b>.",
     "They left the lights on. They didn&rsquo;t leave anybody."),
    ("The Grand Tour", "Cobble Hill.png", "Unload",
     "Unload <b>4+ Barrels</b> at a Speakeasy <b>outside your home turf</b>.",
     "Every borough drinks. Not every borough knows your face."),
]

THREES = [
    ("Off the Boat", "Cuban Prince.png", "Unload",
     "Unload <b>3+ Barrels of Rum</b> at <b>Sunny&rsquo;s Bar</b>.",
     "Havana to Red Hook, and never once a warehouse."),
    ("Rum Row", "Rum Runners Regatta.png", "Trade",
     "Trade <b>4+ Moonshine</b> at a <b>Staten Island Dock</b> in one Play.",
     "Forty ships past the three-mile line, waiting on a lamp."),
    # Split from Bloody Sunday along the rulebook's OWN either/or: "a rival Safehouse
    # in the District is destroyed, UNLESS you take it over instead: immediately Secure
    # the District for free by relocating your Safehouse there." Destroy XOR take over,
    # so the two can never co-fire — the rules supply the guard, we don't invent one.
    # Was "Seize a District holding a rival Safehouse", which Bloody Sunday's trigger
    # was a strict subset of => a GUARANTEED 8, and the same act at two prices.
    # Worded by BOARD CONSEQUENCE, not intention: "relocating yours into it" is a fact
    # you can see on the table, so there is no semantic argument about which card fired.
    # The relocation is also a real cost — you abandon your old base — which holds it at 3.
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
    ("The Insurance Job", "Insurance Job.png", "Raid",
     "Have a Police Raid <b>Condemn</b> the District holding <b>your Safehouse</b>.",
     "He struck the match himself. Slept fine after."),
    # MANHATTAN'S FRIENDLY — the 4th orphan Speakeasy (The Haymarket, in the
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
    # Paradise Alley = Flushing, Queens' non-starting Speakeasy — an exact mirror
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
    # of cash) — the mob ran the locals, so taking a Ward's union is how you own
    # the men on that block.
    ("Union Dues", "Union Dues.png", "Recruit",
     "Recruit <b>6+ Runners</b> in a <b>Ward outside your home turf</b>.",
     "They line up at dawn. You decide who works."),
    # WAS "in a Hostile District" — IMPOSSIBLE, caught by Nick. Rise promotes a
    # Runner who is already standing there, but Hostile means a RIVAL Controls it,
    # and you can never end a Play with Mobsters parked in rival turf (Move Pins
    # them into a Standoff; Stealth says outright "you cannot end your Play in this
    # state"). The only way to have a Runner there is to have already taken it —
    # and then you Control it, so it isn't Hostile. Note Move INTO Hostile turf is
    # fine (Hell's Highway) — it's Rise that needs a stable foothold.
    ("Last One Standing", "Last One Standing.png", "Rise",
     "Rise a new <b>Boss</b> in a Borough where a <b>rival holds the Deed</b>.",
     "The last man at the table gets the chair."),
    # Re-themed off the Boss-kill (handoff §3, cluster 1). "Do not take Control"
    # is load-bearing: it makes this structurally unable to co-fire with ANY
    # Seize card (The Eviction / The Copper Heist / Over the Top), and it is
    # exactly what the art shows — he does the thing and walks out.
    ("The Irish Goodbye", "Goodbye.png", "Open Fire",
     "Kill <b>3+ rival Mobsters</b> in a <b>Speakeasy</b> District in one Play, and <b>take no Control</b>.",
     "He left O&rsquo;Sullivan&rsquo;s without saying a word to anyone."),
]

FIVES = [
    ("Opening Night", "Jimmy.png", "Unload",
     "Unload <b>8+ Barrels</b> at a single <b>High Society</b> Speakeasy.",
     "The band plays till four. Nobody asks a thing."),
    # "with an Open Fire Play" DELETED: Hit is the Sicilians' Signature Play (Cost 2)
    # and exists purely to kill Bosses — the old wording locked the boss-killing mob
    # out of using its boss-killing power on the deck's only boss-kill card. Worded
    # by outcome now, so Open Fire, Hit and Plunder all count (§4: an event has an
    # actor, an object and a moment — not a button).
    # "your own Boss in the fight" is a SETUP hedge, not a circumstance one: you must
    # march your Boss into Queens and risk him. It also grants +1 Threat, so it's a
    # real trade rather than a tax.
    ("The Toll Booth Trap", "Toll Booth Trap.png", "Open Fire",
     "Kill a <b>rival Boss</b> in <b>Queens</b>, with your own <b>Boss</b> in the fight.",
     "A toll is a toll. Somebody always pays it."),
    # "the Bronx" is load-bearing: it keeps the four Open Fire 5s borough-disjoint,
    # so two 5s can NEVER fire on one Play. "and no Safehouse" was ALSO here to block
    # The Eviction — now REDUNDANT and removed (solver-verified: The Copper Heist's own
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
    # MANHATTAN'S BOUNTY — the 4th and last, so every mainland seat is hunted by
    # exactly one 5. Five Points is Manhattan's Ward and home turf: Safehouse, Boss
    # and 2 Runners from setup, so this is a campaign against a garrison behind the
    # Safehouse's +2 Threat. Borough-disjoint from Queens/Bronx/Brooklyn, so the
    # "never two 5s" guarantee holds. Still 10 = Pressure 3, so The Copper Heist
    # can never ride it.
    # MANHATTAN'S BOUNTY, and the 4th distinct act in the set: Queens kills the head,
    # Brooklyn the body count, the Bronx takes the ground, Manhattan burns the base.
    # WAS "Seize Five Points" — a hole: that named no garrison, so if the Manhattan
    # player Secured away you could take it off a lone Runner for 5 Respect. This
    # can't go dead either: every crew always has exactly one Safehouse, and
    # Manhattan's starts in Five Points at setup. Combat rules do the work
    # ("a rival Safehouse in the District is destroyed, unless you take it over").
    # Always co-fires with The Eviction (5+3=8, legal); mutually exclusive with
    # The Copper Heist, which forbids a Safehouse.
    ("Bloody Sunday", "Bloody Sunday.PNG", "Open Fire",
     "Destroy a <b>rival Safehouse</b> in <b>Manhattan</b>.",
     "By Monday there was nothing left to come home to."),
    # BROOKLYN'S BOUNTY. Stays in Brooklyn — Murder, Inc. ran out of Brownsville.
    ("The Butcher&rsquo;s Ledger", "Butchers Ledger.png", "Open Fire",
     "Kill <b>5+ Mobsters</b> in <b>Brooklyn</b> in a single Play.",
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
    """Length as rendered — entities collapse to one glyph."""
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
    The Play is the unit &mdash; at the end of a Play, check whether that Play did the thing.
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
head = src[:src.index('<body>')]
open(path, 'w', encoding='utf-8').write(head + body + "\n</html>\n")

print(f"ones {len(ONES)}  threes {len(THREES)}  fives {len(FIVES)}  total {total}")
print(f"print pages: {total // 4 * 2}")
