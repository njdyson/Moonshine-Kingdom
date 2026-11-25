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
# Use the defined word (Seize, Safe, take over, home Borough) rather than spelling out
# its meaning, and never ask for a count of Districts across a Borough: those were the
# Deeds' stand-ins, and they could not be checked at a glance or settle a tie.
# THE SUNSET JOBS DECK (Nick, 2026-11-24; the project's reviews/jobs-rework-2026-11-24.md). The deck is
# 12 / 16 / 8. Two kinds of Job: DEEDS, checked as your own Play ends (one verb, one place, one
# condition, as before), and SUNSET JOBS (a sixth field, True), a board position checked at Sunset,
# the instant the final boss Lays Low. Every card names a place no family starts on (the spare Docks,
# Staten Island, a Venue, the Brooklyn Bridge) or is relative to the claimer ("a rival's"), but for
# the four Kings, which are a home puzzle on purpose. The cards' history before this pass is in git
# (this file before 2026-11-24) and in the reviews it cites.
ONES = [
    # The spare-Dock Trades: every seat sails to any of them in one Move.
    ('Jamaica Ginger', 'Rum Row 3.jpg', 'Trade', 'Trade <b>4+ barrels</b> at <b>Jamaica</b>.',
     'Sold by the case as a tonic. Nobody asks what ails you.'),
    ("The Dutchman's Deal", 'Dutchman.jpg', 'Trade', 'Trade <b>4+ barrels</b> at <b>the Bowery</b>.',
     'He never gives a name. The windmill on the sack says plenty.'),
    ('Bathtub Gin', 'Bathtub Chemistry.jpg', 'Trade', 'Trade <b>4+ barrels</b> at <b>Belmont</b>.',
     'Mixed in a tub off Arthur Avenue. Poured like champagne.'),
    ('Off the Boat', 'Switch.jpg', 'Trade', 'Trade <b>4+ barrels</b> at <b>Red Hook</b>.',
     'Unloaded at midnight, poured by one, gone by two.'),
    ('The Pier Six Brawl', 'Dock Domination.jpg', 'Open Fire', 'Seize a <b>Dock</b>.',
     'The pier belongs to whoever is still standing on it.'),
    ('Union Dues', 'Union Dues.jpg', 'Recruit', 'Recruit <b>4+ Runners</b> in a rival&rsquo;s <b>home Borough</b>.',
     'They line up at dawn. You decide who works.'),
    ('The Mother Ship', 'Rum Row.jpg', 'Control', 'Control <b>both Staten Island Docks</b>.',
     'Forty ships past the three-mile line, waiting on a lamp.', True),
    ('A Bridge to Sell', 'Night Mayor.jpg', 'Control', 'Control <b>both ends</b> of the <b>Brooklyn Bridge</b>.',
     'He sold it to a rube on Tuesday. Tonight he charges the toll.', True),
    ('Cuban Prince', 'Cuban Prince.jpg', 'Control', 'Control a <b>Dock</b> in <b>three Boroughs</b>.',
     'Every boat from Havana ties up at one of his piers.', True),
    ('The Beachhead', 'Beachhead.jpg', 'Secure', 'Control a District Adjacent to a rival&rsquo;s <b>home Ward</b>, with <b>your Safehouse</b> in it.',
     'You should meet the neighbours. They&rsquo;d rather not.', True),
    ('The Angel&rsquo;s Share', 'The Angels Share.jpg', 'Hoard', 'Have <b>3+ Rum</b> in one District you Control.',
     'What the angels take, the house bills you for anyway.', True),
    ('The Sit-Down', 'High Spirits.jpg', 'Move', 'Your <b>Boss</b> stands in a rival&rsquo;s <b>home Borough</b>.',
     'He came alone, sat down, and ordered for both of them.', True),
]

TWOS = [
    ('Opening Night', 'Jimmy.jpg', 'Unload', 'Unload <b>5 Rum</b> at the <b>High Society Venue</b> in your <b>home Borough</b>.',
     'The band plays till four. Nobody asks a thing.'),
    ('The Insurance Job', 'Insurance Job.jpg', 'Raid', 'Set off a Raid that <b>padlocks</b> a <b>Pressure 2 Still</b> you Control.',
     'He struck the match himself. Slept fine after.'),
    ('Poison Panic', 'Poison Panic.jpg', 'Raid', 'Set off a Raid that <b>padlocks</b> a rival&rsquo;s <b>Speakeasy</b>.',
     'One bad batch and the whole city stops drinking.'),
    ('Last Call', 'Last Call.jpg', 'Unload', 'Unload <b>4+ barrels</b> at a <b>dive</b> outside your <b>home Borough</b>.',
     'Pour till the taps run dry and the sirens start up.'),
    ('The Copper Heist', 'Copper Heist.jpg', 'Open Fire', 'Seize a District with a <b>Pressure 5 Still</b>.',
     'The good boilers run hot. So do the men who own them.'),
    ('Coffin Varnish', 'Cutting.jpg', 'Open Fire', 'Seize a District where a <b>rival Boss</b> stands.',
     'He was drinking with the wrong man. Briefly.'),
    ('The Firebug', 'Cobble Hill.jpg', 'Destroy', 'Destroy a rival&rsquo;s <b>Safehouse</b>.',
     'Nobody saw a thing. Everybody smelled it.'),
    ('The Milk Run', 'The Milk Run.jpg', 'Move', 'Move <b>4+ barrels</b> across the <b>Williamsburg Bridge</b>.',
     'Every copper watches that bridge. Wave as you go.'),
    ('Hell&rsquo;s Highway', 'Hells Highway.jpg', 'Move', 'Move <b>4+ barrels</b> across the <b>Hell Gate Bridge</b>.',
     'Forty miles of bad road and worse intentions.'),
    ('The One-Way Ride', 'Gatsby.jpg', 'Move', 'Move <b>4+ barrels</b> across the <b>Queensboro Bridge</b>.',
     'Get in the car. Nobody asks where it is going.'),
    # THE KINGS (Nick's idea): they replace the Extort set. A Borough's two Speakeasies are its dive and
    # its Venue, which starts under a Squad, so the home boss must draw the Squad off and then hold both.
    ('Empire State', 'Empire State.jpg', 'Control', 'Control <b>both Speakeasies</b> in <b>Manhattan</b>.',
     'From Sugar Hill to the Tenderloin, every till pays one man.', True),
    ('The Big Squeeze', 'Big Squeeze.jpg', 'Control', 'Control <b>both Speakeasies</b> in <b>the Bronx</b>.',
     'The whole Bronx pays on Friday. Nobody has to ask twice.', True),
    ('King of Queens', 'King of Queens.jpg', 'Control', 'Control <b>both Speakeasies</b> in <b>Queens</b>.',
     'Every glass poured in Queens, the King takes a sip.', True),
    ('The Black Hand', 'Black Hand.jpg', 'Control', 'Control <b>both Speakeasies</b> in <b>Brooklyn</b>.',
     'The letter had a hand drawn on it. The shop paid by noon.', True),
    ('Tenement Army', 'Tenament Army.jpg', 'Muster', 'Have <b>5+ of your Mobsters</b> in one District outside your <b>home Borough</b>.',
     'Word goes round by supper. By dark, you have a crew.', True),
    ('Three-Card Monte', 'Quiet Drop.jpg', 'Secure', 'In each of <b>three Boroughs</b>, Control a District with <b>your Safehouse</b> in it.',
     'Follow the house. Find the house. Lose your shirt.', True),
]

THREES = [
    # The Butcher's Ledger stays a Seize from a crew counted at the door (a Fold pays it).
    # The Toll Booth Trap stays the deck's one kill (Nick): corner him so he can't Fold.
    ('The Butcher&rsquo;s Ledger', 'Butchers Ledger.jpg', 'Open Fire', 'Seize a District from <b>4+ rival Mobsters</b>.',
     'Every name in it is crossed out but one.'),
    ('The Toll Booth Trap', 'Toll Booth Trap.jpg', 'Open Fire', 'Kill a <b>rival Boss</b>.',
     'A toll is a toll. Somebody always pays it.'),
    ('High Roller', 'High Roller.jpg', 'Open Fire', 'Seize a <b>High Society Venue</b>.',
     'Everyone at the big table brought a stake. He brought a pistol.'),
    ('The Noble Experiment', 'Full Steam.jpg', 'Unload', 'Unload <b>5 Rum</b> at a <b>High Society Venue</b> outside your <b>home Borough</b>.',
     'Hoover called it noble. The bars call it Tuesday.'),
    # With three Safehouses scattered, a District with one is no longer his front door; the Ward is.
    ('The Eviction', 'Crimson Coup.jpg', 'Open Fire', 'Seize a rival&rsquo;s <b>home Ward</b>.',
     'Nice place. He won&rsquo;t be needing it.'),
    ('The Five Families', 'Scheme.jpg', 'Control', 'Control a District in <b>all five Boroughs</b>.',
     'Not the richest table in town. Just the widest.', True),
    ('Last One Standing', 'Last One Standing.jpg', 'Control', 'Control <b>3+ Districts</b> in a rival&rsquo;s <b>home Borough</b>.',
     'The last man at the table gets the chair.', True),
    ('The Warehouse', 'Gin Pipeline.jpg', 'Hoard', 'Have <b>8+ barrels</b> in one District you Control.',
     'Eight barrels, one roof, and every cop can smell it.', True),
]

PIPS = {1: 1, 2: 2, 3: 3}
CLS = {1: "gig", 2: "racket", 3: "score"}

# Back reads "Job", singular and unbroken: it is the back of ONE card, and the
# two-line "The/Jobs" set the title band taller than the Rat and Marks backs in
# Cards v0.9. Folded back from a hand edit, 2026-07-24.
# The back's look is css/card-back.css, shared with Cards v0.9 (2026-10-07).
BACK = ('  <div class="back"><div class="back-title">Job</div>'
        '<div class="back-sub">Moonshine Kingdom</div>'
        '<div class="back-foot">New York &middot; 1929</div></div>')


# THE BLOOD OATH CARD (2026-11-11) wears this back but prints on the Cards sheet, in a Welsher's
# slot, so both decks stay 36 (Nick, the same day). Keep its back in step with BACK above.



def visible_len(t):
    """Length as rendered: entities collapse to one glyph."""
    return len(re.sub(r'&[a-z]+;', 'x', t))


def card(entry, respect):
    title, art, verb, obj, flav = entry[:5]
    sunset = len(entry) > 5 and entry[5]
    # A Sunset Job carries no label: its text ends "at Sunset", which says which kind it is.
    if sunset:
        obj = obj.rstrip('.') + ' at <b>Sunset</b>.'
    pips = "".join('<span class="pip"></span>' for _ in range(PIPS[respect]))
    longcls = ' title--long' if visible_len(title) >= 16 else ''
    return (
        f'  <div class="card card--{CLS[respect]}{" card--sunset" if sunset else ""}">\n'
        f'    <div class="tier"><span class="stake"><span class="stake-lbl">Stake</span>{pips}</span></div>\n'
        f'    <h2 class="title{longcls}">{title}</h2>\n'
        f'    <div class="art"><img src="Art/Jobs/{art}" alt=""></div>\n'
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


total = len(ONES) + len(TWOS) + len(THREES)

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
  <div class="masthead-sub">{VERSION} &middot; Complete Deck &middot; {total} Cards &middot; {len(ONES)} / {len(TWOS)} / {len(THREES)}</div>
  <p class="masthead-note">
    Two kinds of Job. A <b>deed</b> completes as your own Play ends, if that Play did it:
    a count is what that one Play did, and what happened during the Play counts even if undone before it ended.
    A <b>Sunset Job</b>, whose text ends &ldquo;at Sunset&rdquo;, is a position: it completes at Sunset, the
    instant the final boss Lays Low, if the board shows it then.
  </p>
</div>

{tier_head("1 RESPECT", f"Stake 1 &middot; an evening&rsquo;s work, little setup &middot; {len(ONES)} cards")}
{blocks(ONES, 1)}
{tier_head("2 RESPECT", f"Stake 2 &middot; a setup the table can see &middot; {len(TWOS)} cards")}
{blocks(TWOS, 2)}
{tier_head("3 RESPECT", f"Stake 3 &middot; a campaign &middot; {len(THREES)} cards")}
{blocks(THREES, 3)}

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

print(f"ones {len(ONES)}  twos {len(TWOS)}  threes {len(THREES)}  total {total}")
print(f"print pages: {total // 4 * 2}")
