# -*- coding: utf-8 -*-
"""Difficulty + provocation scoring for the Jobs deck.

WHY THIS EXISTS (Nick, 2026-08-04): "some are clearly harder than others."
Within a tier, Stake and Respect are identical, so any difficulty spread inside
a tier is unpriced -- two cards cost the same and pay the same while asking very
different amounts. This scores every card on the axes that actually make a Job
hard, so the outliers can be found and re-tuned rather than argued about.

It also scores PROVOCATION, a DESIRABLE property Nick wants MORE of ("the Toll
Booth Trap being the premium example, I want more of this"): a face-up Job that
names a specific target moves the whole table -- the named player must defend,
rivals pile on.

*** THE CORRECTION THAT SHAPES THIS TOOL (Nick, 2026-08-04) ***
The first version scored EXECUTION COST only, and got The Five Families badly
wrong -- rating it the easiest 5 in the deck at diff 4. Nick: "this is spreading
15 runners across all 5 boroughs (~3 per district), when the job is PUBLIC. It's
a game of whack a mole. If rivals see the job on the board and see a rival
spreading -- 'John looks like he's going for Five Families, block his route to
Staten Island.' Pure actions may be cheap, but COUNTERPLAY matters."

So difficulty has two halves and the first version only measured one:
  - cost against an EMPTY board (setup, mass, dice, window)   <- was measured
  - cost against a RIVAL WHO HAS READ THE CARD                <- was missing
The BLOCK axis below is that second half. Jobs are public and static, so every
card is read by the table the moment it is face-up; a card whose plan can be
disrupted once it is visible is far harder than its action count suggests.

Note BLOCK and RIVAL are opposites, not duplicates, and both belong:
  RIVAL = a rival must GIVE you something (present a target you cannot force).
          Feels unfair. You cannot progress. Minimise this.
  BLOCK = a rival can TAKE something from you (disrupt a plan you control).
          Feels tense. You can play around it. Maximise this at high Respect.

*** THE DESIGN PRINCIPLE THIS TOOL NOW TESTS (Nick's call) ***
    "All of the bigger jobs should involve counterplay. 5-Respect solitaire
     isn't hard -- they should be lower level."
Difficulty and provocation are NOT independent at the top of the deck. A 5
should be hard BECAUSE it is contested, not because it is a long errand nobody
can see. A high-Respect card with low BLOCK and low provocation is not a
mistuned card, it is a MIS-TIERED one. See the SOLITAIRE TEST section below.

=========================== THE DIFFICULTY AXES ===============================
Each 0-3, summed to a raw score (18 = maximum pain). Deliberately unweighted --
a weighting is a second set of opinions layered on the first.

  SETUP     Plays of preparation before the scoring Play is legal.
  RIVAL     Does it need a rival to do something you cannot force? The cruellest
            axis: the only one you cannot solve by playing well. 3 = a rival
            must both present the target AND leave it there.
  DICE      Can you do everything right and still fail? Combat only. Muscle
            Ratio caps dice at 5; at base Threat each die is ~1/3.
  MASS      Volume that must exist and be in one place: barrels, Runners,
            Mobsters. Costs Plays AND supply, and feeds the Reckoning Sweep.
  WINDOW    How narrow is the opportunity? Police-locked venues, mobile
            one-per-rival pieces. Can the card sit dead for many Days?
  BLOCK     COUNTERPLAY. Once this card is face-up and rivals see you building
            toward it, how much can they do about it?
            0 = nothing. They cannot tell you are going for it, or cannot
                interfere if they can. Solitaire.
            1 = they can raise the price (Heat, a toll, a contested district).
            2 = they can deny one component -- a route, a venue, a district --
                and force you to re-plan.
            3 = whack-a-mole. The plan needs several things held at once, each
                separately deniable, and holding them is visible while you do
                it. Blocking any one resets you.

=========================== THE PROVOCATION AXES ==============================
  NAMES     Does the face-up card point at one identifiable place or player?
            0 = generic type ("a Speakeasy"). 3 = one district or one seat's
            home turf, so the table knows whose door to kick.
  DEFEND    Can the named victim actually respond? A bounty they dodge for free
            is not a threat; one forcing real defensive commitment (garrison,
            relocate, spend Influence) is the Toll Booth Trap shape.

Scores are JUDGEMENT, argued in the note on each line. The solver models
triggers, not difficulty. Disagree per-card and edit the number.
"""
import sys
from collections import defaultdict

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# name, respect, verb, setup, rival, dice, mass, window, block, names, defend, note
CARDS = [
    # ------------------------------- 1 RESPECT -------------------------------
    ("The Milk Run", 1, "Move", 1, 0, 0, 1, 0, 1, 2, 0,
     "One named crossing -- rivals can garrison either end, but it is one Play."),
    ("The Beachhead", 1, "Secure", 1, 1, 0, 0, 1, 1, 0, 1,
     "Rival can relocate the Safehouse you are creeping up on."),
    ("Tenement Army", 1, "Recruit", 1, 0, 0, 2, 0, 1, 0, 1,
     "REWRITTEN: 4+, and the Sweep caps the block at 5 -- disperse or pay."),
    ("Last Call", 1, "Unload", 1, 0, 0, 1, 0, 2, 3, 1,
     "REWRITTEN: one named venue (Coney Island), garrisoned from setup."),
    ("The Empty Casket", 1, "Rise", 1, 0, 0, 0, 1, 2, 1, 2,
     "REWRITTEN: Rise into a Ward a RIVAL holds. Blockable, provocative."),
    ("Fortress Staten", 1, "Secure", 2, 0, 0, 1, 0, 1, 1, 0,
     "REWRITTEN: +4 Barrels, which must be hauled across water."),
    ("The Pier Six Brawl", 1, "Open Fire", 1, 1, 0, 0, 1, 2, 1, 1,
     "REWRITTEN: Seize a rival Dock. No dice; garrisoning is a real answer."),
    ("The Dutchman's Deal", 1, "Trade", 2, 0, 0, 1, 0, 2, 2, 0,
     "REWRITTEN: the two Manhattan Docks. Contested turf, 2-district width."),
    ("The Angel's Share", 1, "Unload", 2, 0, 0, 1, 0, 2, 3, 1,
     "REWRITTEN: one named venue (East Harlem), garrisoned from setup."),
    ("Night Landing", 1, "Move", 2, 0, 0, 1, 1, 2, 1, 0,
     "Only 2 Docks. Take or garrison both and the card is dead."),
    ("Squatter's Rights", 1, "Move", 1, 1, 0, 0, 1, 1, 0, 1,
     "Rival can garrison the Defenseless district once they see you coming."),
    ("The Grand Tour", 1, "Unload", 1, 0, 0, 1, 0, 1, 1, 0,
     "4 named venues -- denying all four is not worth anyone's Days."),
    # ------------------------------- 3 RESPECT -------------------------------
    ("Cuban Prince", 3, "Unload", 2, 0, 0, 1, 0, 2, 3, 1,
     "ONE named venue. Take Sunny's Bar and the card is dead."),
    ("Rum Row", 3, "Trade", 2, 0, 0, 2, 1, 1, 1, 0,
     "Staten is uncontested, which is exactly why it is not blockable."),
    ("The Eviction", 3, "Open Fire", 2, 2, 1, 1, 1, 2, 0, 2,
     "Target can garrison or relocate -- and will, once you are seen coming."),
    ("The Copper Heist", 3, "Open Fire", 1, 1, 1, 0, 1, 2, 0, 1,
     "Owner can vent Pressure or garrison the boiler to break it."),
    ("The Insurance Job", 3, "Rat", 3, 0, 0, 0, 2, 1, 0, 0,
     "Engineering the Raid onto yourself is private. Nobody interferes."),
    ("The Big Squeeze", 3, "Unload", 2, 0, 0, 2, 0, 2, 3, 1,
     "ONE named venue (The Haymarket). Denial is a single Play."),
    ("Hell's Highway", 3, "Move", 2, 0, 0, 2, 0, 2, 3, 1,
     "ONE named district (Fordham). Garrison it and the card stalls."),
    ("Poison Panic", 3, "Unload", 2, 0, 0, 2, 0, 2, 3, 1,
     "ONE named venue (Paradise Alley). Same shape as its three siblings."),
    ("Gin Pipeline", 3, "Move", 2, 0, 0, 2, 0, 2, 1, 1,
     "REWRITTEN: named destination (a Ward you Control) -- a deniable end."),
    ("Union Dues", 3, "Recruit", 2, 0, 0, 2, 0, 2, 0, 1,
     "Forces your Safehouse into a named Ward -- rivals can take it first."),
    ("Last One Standing", 3, "Secure", 2, 0, 0, 0, 0, 2, 0, 1,
     "Must Secure a venue in a rival's Borough; they can hold it against you."),
    ("The Irish Goodbye", 3, "Open Fire", 2, 2, 1, 1, 1, 1, 1, 1,
     "REWRITTEN: 3+ -> 2+ kills. Dice variance was the wrong kind of hard."),
    # ------------------------------- 5 RESPECT -------------------------------
    ("Opening Night", 5, "Unload", 3, 1, 0, 3, 3, 2, 2, 0,
     "4 venues but Raid-gated: whichever opens, everyone sees it open."),
    ("The Toll Booth Trap", 5, "Open Fire", 2, 3, 2, 1, 2, 2, 3, 3,
     "Named seat garrisons the Boss or walks him out of Queens."),
    ("Over the Top", 5, "Open Fire", 2, 3, 2, 1, 2, 2, 3, 3,
     "Target can simply disperse below 5 defenders and it goes dead."),
    ("The Five Families", 5, "Extort", 3, 0, 0, 0, 1, 3, 0, 1,
     "WHACK-A-MOLE: 5 boroughs held at once, publicly, each separately deniable."),
    ("The Smuggler's Run", 5, "Move", 3, 1, 0, 3, 1, 3, 2, 2,
     "REWRITTEN: land 6 Rum on a Dock a RIVAL holds. Now a contested run."),
    ("Bloody Sunday", 5, "Open Fire", 2, 1, 2, 1, 1, 2, 3, 3,
     "Manhattan garrisons its Safehouse -- but it cannot leave the Borough."),
    ("The Butcher's Ledger", 5, "Open Fire", 2, 3, 3, 2, 2, 1, 3, 2,
     "Rivals avoid massing in Brooklyn, but cannot 'block' a kill count."),
    ("High Roller", 5, "Secure", 3, 1, 0, 2, 3, 3, 3, 2,
     "REWRITTEN: the HS district must be one a RIVAL Controls. Storm uptown."),
]

AXES = ("setup", "rival", "dice", "mass", "window", "block")


def rows():
    for c in CARDS:
        name, respect, verb = c[0], c[1], c[2]
        setup, rival, dice, mass, window, block, names, defend, note = c[3:]
        yield dict(name=name, respect=respect, verb=verb, setup=setup, rival=rival,
                   dice=dice, mass=mass, window=window, block=block,
                   names=names, defend=defend,
                   diff=setup + rival + dice + mass + window + block,
                   prov=names + defend, note=note)


R = list(rows())
by_tier = defaultdict(list)
for r in R:
    by_tier[r['respect']].append(r)

print("=" * 100)
print("DIFFICULTY BY TIER   (S=setup R=rival D=dice M=mass W=window B=block; 18 = max)")
print("=" * 100)
for tier in (1, 3, 5):
    band = sorted(by_tier[tier], key=lambda r: -r['diff'])
    scores = [r['diff'] for r in band]
    mean = sum(scores) / len(scores)
    print()
    print(f"  --- {tier} RESPECT --- {len(band)} cards | range {min(scores)}-{max(scores)} "
          f"(SPREAD {max(scores) - min(scores)}) | mean {mean:.1f}")
    print(f"  {'card':26} {'diff':>4}  {'S':>2}{'R':>2}{'D':>2}{'M':>2}{'W':>2}{'B':>2}  "
          f"{'prov':>4}  note")
    for r in band:
        flag = ""
        if r['diff'] >= mean + 3:
            flag = "  <== HARD"
        elif r['diff'] <= mean - 3:
            flag = "  <== EASY"
        print(f"  {r['name']:26} {r['diff']:4}  {r['setup']:2}{r['rival']:2}{r['dice']:2}"
              f"{r['mass']:2}{r['window']:2}{r['block']:2}  {r['prov']:4}  "
              f"{r['note'][:38]}{flag}")

print()
print("=" * 100)
print("THE SOLITAIRE TEST   (Nick: 'all of the bigger jobs should involve counterplay')")
print("=" * 100)
print("  A high-Respect Job must be hard because it is CONTESTED, not because it is a long")
print("  private errand. Test: block + provocation. Low on both at 5 Respect = MIS-TIERED.")
print()
for tier in (5, 3):
    print(f"  --- {tier} RESPECT ---")
    for r in sorted(by_tier[tier], key=lambda r: (r['block'] + r['prov'])):
        engage = r['block'] + r['prov']
        if engage <= 3:
            verdict = "SOLITAIRE — demote or re-objective"
        elif engage <= 5:
            verdict = "thin"
        else:
            verdict = "contested — correct shape"
        print(f"    block {r['block']} + prov {r['prov']} = {engage:2}  "
              f"{r['name']:26} {verdict}")
    print()

print("=" * 100)
print("WHAT THE COUNTERPLAY REWRITE CHANGED   (2026-08-04; scores BEFORE the rewrite)")
print("=" * 100)
# Pre-rewrite scores, measured on the SAME six axes -- so this diff isolates the
# effect of the objective changes, not of adding the block axis.
BEFORE = {"The Milk Run": (3, 3), "The Beachhead": (4, 2), "Tenement Army": (3, 0),
          "Last Call": (2, 0), "The Empty Casket": (6, 0), "Fortress Staten": (1, 1),
          "The Pier Six Brawl": (8, 1), "The Dutchman's Deal": (4, 1),
          "The Angel's Share": (4, 1), "Night Landing": (6, 3), "Squatter's Rights": (4, 2),
          "The Grand Tour": (3, 2), "Cuban Prince": (5, 6), "Rum Row": (6, 2),
          "The Eviction": (9, 4), "The Copper Heist": (6, 3), "The Insurance Job": (6, 1),
          "The Big Squeeze": (6, 6), "Hell's Highway": (6, 6), "Poison Panic": (6, 6),
          "Gin Pipeline": (5, 1), "Union Dues": (6, 3), "Last One Standing": (4, 3),
          "The Irish Goodbye": (10, 3), "Opening Night": (12, 4),
          "The Toll Booth Trap": (12, 8), "Over the Top": (12, 8),
          "The Five Families": (7, 4), "The Smuggler's Run": (8, 2),
          "Bloody Sunday": (9, 8), "The Butcher's Ledger": (13, 6), "High Roller": (11, 3)}
print(f"  {'card':26} {'difficulty':>18}   {'engagement (block+prov)':>24}")
for r in sorted(R, key=lambda r: -((r['block'] + r['prov']) - BEFORE[r['name']][1])):
    bd, be = BEFORE[r['name']]
    ae = r['block'] + r['prov']
    if ae == be and r['diff'] == bd:
        continue
    dd = f"{bd:2} -> {r['diff']:2}"
    de = f"{be:2} -> {ae:2}"
    mark = "  <== fixed" if ae - be >= 3 else ""
    print(f"  {r['name']:26} {dd:>18}   {de:>24}{mark}")

print()
print("=" * 100)
print("THE MONEY QUADRANT   (block+prov = ENGAGEMENT; the deck wants high-diff/high-engage)")
print("=" * 100)
med_d = sorted(r['diff'] for r in R)[len(R) // 2]
med_e = sorted(r['block'] + r['prov'] for r in R)[len(R) // 2]
print(f"  medians: difficulty {med_d}, engagement {med_e}")
for label, test in (
    ("HARD + SOLITAIRE  (worst trade in the deck)",
     lambda r: r['diff'] > med_d and r['block'] + r['prov'] <= med_e),
    ("HARD + CONTESTED  (the deck's best cards)",
     lambda r: r['diff'] > med_d and r['block'] + r['prov'] > med_e),
    ("EASY + CONTESTED  (ideal at 1-3 Respect)",
     lambda r: r['diff'] <= med_d and r['block'] + r['prov'] > med_e),
    ("EASY + SOLITAIRE  (filler)",
     lambda r: r['diff'] <= med_d and r['block'] + r['prov'] <= med_e),
):
    band = sorted([r for r in R if test(r)], key=lambda r: -r['diff'])
    print(f"\n  {label} — {len(band)}")
    for r in band:
        print(f"     diff {r['diff']:2}  engage {r['block'] + r['prov']:2}  "
              f"{r['name']:26} ({r['respect']})")
