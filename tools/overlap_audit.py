# -*- coding: utf-8 -*-
"""Overlap audit for the Jobs deck.

Enumerates every Play a player could make (verb x target district x magnitude
x board conditions) and reports which Jobs co-fire. Enforces handoff §3:
    - HARD RULE: never two 5s on one Play.
    - Watch:     a 5 plus small change is fine; big 3-stacks are suspect.
"""
import itertools
import sys
from collections import defaultdict

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

M, BX, Q, BK, ST = 'Manhattan', 'Bronx', 'Queens', 'Brooklyn', 'Staten'

# name, borough, tags, still  (pressure = 6 - |still-7|)
DISTRICTS = [
    ('Sugar Hill', M, {'highSociety', 'speakeasy'}, 7), ('East Harlem', M, {'speakeasy'}, 12),
    ('The Tenderloin', M, {'speakeasy'}, 8), ('West Side', M, {'dock'}, 11),
    ('The Bowery', M, {'dock'}, 9), ('Five Points', M, {'ward'}, 10),
    ('Morris Park', BX, {'highSociety', 'speakeasy'}, 7), ('Belmont', BX, {'speakeasy'}, 11),
    ('Fordham', BX, {'speakeasy'}, 8), ('Throggs Neck', BX, {'dock'}, 10),
    ('Hunts Point', BX, {'ward'}, 9),
    ('Richmond Hill', Q, {'highSociety', 'speakeasy'}, 7), ('Astoria', Q, {'speakeasy'}, 2),
    ('Flushing', Q, {'speakeasy'}, 6), ('Whitestone', Q, {'dock'}, 5),
    ('Jamaica', Q, {'dock'}, 3), ('Corona', Q, {'ward'}, 4),
    ('Williamsburg', BK, {'highSociety', 'speakeasy'}, 7), ('Coney Island', BK, {'speakeasy'}, 3),
    ('Red Hook', BK, {'speakeasy'}, 6), ('Sheepshead Bay', BK, {'dock'}, 4),
    ('Brownsville', BK, {'ward'}, 5),
    ('Stapleton', ST, {'ward'}, 6), ('Westerleigh', ST, {'dock'}, 2), ('Tottenville', ST, {'dock'}, 4),
]


def pressure(still):
    return 6 - abs(still - 7)


class D:
    def __init__(self, row):
        self.name, self.boro, self.tags, self.still = row
        self.press = pressure(self.still)

    def has(self, t):
        return t in self.tags


DS = [D(r) for r in DISTRICTS]

# --- BOARD LANDMARKS ---------------------------------------------------------
# Labelled water on the board, used to narrow cards that would otherwise target a
# whole district TYPE. Nick's rule: an overlap firing in <=2 districts is a
# feature (you had to draft both cards and engineer the Play); one firing in many
# is luck. Type classes are broad — "a Speakeasy" is 12 districts, "a Dock" is 8 —
# so landmarks are how a card gets a small, glanceable, unarguable target set.
EAST_RIVER = {'East Harlem', 'Astoria', 'Williamsburg', 'Red Hook'}   # 4 Speakeasies
JAMAICA_BAY = {'Sheepshead Bay', 'Jamaica'}                            # 2 Docks

# A Play: verb, target district, and a bag of booleans/magnitudes.
# Each Job is (name, respect, verb, predicate(play) -> bool)


def J(name, respect, verb, fn):
    return dict(name=name, respect=respect, verb=verb, fn=fn)


JOBS = [
    # --- 1 Respect ---
    J('The Milk Run', 1, 'Move', lambda p: p['barrels'] >= 4 and p['williamsburg_bridge']),
    J('The Beachhead', 1, 'Secure', lambda p: p['adj_rival_safehouse']),
    # own_deed / not own_deed: mutually exclusive with Union Dues by construction.
    # COUNTERPLAY PASS: 5+ -> 4+ (the Sweep is the new cost, not the headcount).
    J('Tenement Army', 1, 'Recruit',
      lambda p: p['runners'] >= 4 and p['d'].has('ward') and p['own_deed']),
    # COUNTERPLAY PASS: was any non-HS Speakeasy (8 venues, BLOCK 0). Now one named
    # venue, which also makes it disjoint from The Angel's Share (East Harlem).
    J('Last Call', 1, 'Unload',
      lambda p: p['barrels'] >= 4 and p['d'].name == 'Coney Island'),
    # COUNTERPLAY PASS: was "after your Boss is killed, in a Ward you Control" (dead
    # until a rival acted). The first rewrite ("a Ward a rival Controls") was IMPOSSIBLE
    # -- Rise places the Boss in a SAFE District, and Control transfers the instant you
    # win the fight, so the trigger could never be true at its own checkpoint. This
    # model encoded the same impossibility and every audit still reported PASS.
    # Now: a Defenseless block (which IS Safe) in a Borough whose Deed you don't hold.
    J('The Empty Casket', 1, 'Rise',
      lambda p: p['defenseless'] and p['rival_deed']),
    # COUNTERPLAY PASS: + 4 barrels, which must be hauled to Staten across water.
    J('Fortress Staten', 1, 'Secure', lambda p: p['d'].boro == ST and p['barrels'] >= 4),
    # COUNTERPLAY PASS: re-objectived off the kill count (dice) onto a Seize. Note this
    # now shares the Seize space, so it is re-checked against Eviction/Copper Heist.
    J('The Pier Six Brawl', 1, 'Open Fire',
      lambda p: p['seize'] and p['d'].has('dock') and p['hostile']
      and not p['rival_safehouse']),
    # COUNTERPLAY PASS: was any Dock (8). Now the two Manhattan Docks.
    J("The Dutchman's Deal", 1, 'Trade',
      lambda p: p['barrels'] >= 3 and p['d'].has('dock') and p['d'].boro == M),
    # COUNTERPLAY PASS: was any non-HS Speakeasy (8), and co-fired with Last Call across
    # 5 districts. Now one named venue, disjoint from Last Call by construction.
    # SPLIT MARKET PASS: Rum now pours only under a Hotspot token, and East Harlem
    # is a standard bar, so the old "of Rum" objective was unfirable there. Re-cut
    # as the Moonshine job the venue can actually pay.
    J("The Angel's Share", 1, 'Unload',
      lambda p: p['barrels'] >= 3 and not p['rum'] and p['d'].name == 'East Harlem'),
    J('Night Landing', 1, 'Move',
      lambda p: p['barrels'] >= 4 and p['across_water'] and p['d'].name in JAMAICA_BAY),
    J("Squatter's Rights", 1, 'Move', lambda p: p['defenseless'] and p['rival_deed']),
    J('The Grand Tour', 1, 'Unload',
      lambda p: p['barrels'] >= 4 and p['d'].name in EAST_RIVER),
    # --- 3 Respect ---
    # SPLIT MARKET PASS: same problem as The Angel's Share, opposite fix. Retargeting
    # the SALE to Brooklyn's Hotspot was tried and rejected twice over: it took the
    # seat's friendly 3 off its orphan joint, and it printed Cuban Prince + Opening
    # Night + The Grand Tour at Williamsburg for 9, a new deck maximum. Moving the
    # objective instead of the address keeps Red Hook, keeps the Rum, and puts the card
    # on the step the split market actually made hard: landing the brown stuff at all.
    # Verb moves Unload -> Move, which is also what takes it out of the Unload stacks.
    J('Cuban Prince', 3, 'Move',
      lambda p: p['barrels'] >= 3 and p['rum'] and p['d'].name == 'Red Hook'),
    # NOTE (counterplay pass): Rum Row left unchanged. It scored engagement 2, but its
    # unblockability is a deliberate board fact (Staten is nobody's turf) and the card
    # is the ONLY reason anyone visits Westerleigh/Tottenville. Fixing it would need a
    # rival to hold a Staten Dock, which the board does not encourage. Left as filler.
    J('Rum Row', 3, 'Trade', lambda p: p['barrels'] >= 4 and p['d'].has('dock') and p['d'].boro == ST),
    # takeover XOR destroy — the rulebook's own either/or, so Eviction and Bloody
    # Sunday are structurally unable to co-fire.
    J('The Eviction', 3, 'Open Fire',
      lambda p: p['seize'] and p['rival_safehouse'] and p['takeover']),
    J('The Copper Heist', 3, 'Open Fire',
      lambda p: p['seize'] and p['d'].press >= 5 and not p['rival_safehouse']),
    J('The Insurance Job', 3, 'Rat',
      lambda p: p['d'].press <= 2 and p['control']),
    # The Haymarket = The Tenderloin (Manhattan's orphan Speakeasy)
    J('The Big Squeeze', 3, 'Unload', lambda p: p['barrels'] >= 6 and p['d'].name == 'The Tenderloin'),
    J("Hell's Highway", 3, 'Move', lambda p: p['barrels'] >= 6 and p['d'].name == 'Fordham'),
    # Paradise Alley = Flushing (Queens' orphan Speakeasy)
    J('Poison Panic', 3, 'Unload',
      lambda p: p['barrels'] >= 6 and not p['rum'] and p['d'].name == 'Flushing'),
    # COUNTERPLAY PASS: destination named (a Ward), so the haul has a deniable end.
    J('Gin Pipeline', 3, 'Move',
      lambda p: p['barrels'] >= 6 and not p['rum'] and p['origin_press5']
      and p['d'].has('ward') and p['control']),
    J('Union Dues', 3, 'Recruit',
      lambda p: p['runners'] >= 4 and p['d'].has('ward') and not p['own_deed']),
    J('Last One Standing', 3, 'Secure',
      lambda p: p['d'].has('speakeasy') and not p['d'].has('highSociety') and not p['own_deed']),
    # COUNTERPLAY PASS: 3+ -> 2+ kills. Dice variance was the wrong kind of hard.
    J('The Irish Goodbye', 3, 'Open Fire',
      lambda p: p['kills'] >= 2 and p['d'].name in EAST_RIVER and not p['seize']),
    # --- 5 Respect ---
    J('Opening Night', 5, 'Unload', lambda p: p['barrels'] >= 8 and p['d'].has('highSociety')),
    # Fires on Open Fire OR Hit OR Plunder now. Modelled as Open Fire because that is
    # where all stacking lives — no other Job triggers on Hit, so Hit can only ever
    # fire this one alone (=5, safe).
    J('The Toll Booth Trap', 5, 'Open Fire',
      lambda p: p['boss_killed'] and p['d'].boro == Q and p['own_boss']),
    J('Over the Top', 5, 'Open Fire',
      lambda p: p['seize'] and p['d'].boro == BX and p['defenders'] >= 5),
    J('The Five Families', 5, 'Extort', lambda p: p['all_five_boroughs']),
    # COUNTERPLAY PASS (Nick's rewrite): deliver AND seize in one Play. 'seize' is what
    # closes the barrels-alone hole -- taking Control needs Mobsters, which forces the
    # Standoff. NB this puts the card in the SEIZE space, so it is now checked against
    # The Eviction / The Copper Heist / Over the Top / The Pier Six Brawl.
    J("The Smuggler's Run", 5, 'Move',
      lambda p: p['barrels'] >= 4 and p['rum'] and p['from_staten_dock']
      and p['d'].has('dock') and p['seize']),
    J('Bloody Sunday', 5, 'Open Fire',
      lambda p: p['seize'] and p['rival_safehouse'] and not p['takeover'] and p['d'].boro == M),
    J("The Butcher's Ledger", 5, 'Open Fire', lambda p: p['kills'] >= 5 and p['d'].boro == BK),
    # COUNTERPLAY PASS: "a rival Controls" was ILLEGAL here (Secure targets SAFE turf
    # only -- same trap as The Empty Casket). Counterplay now comes from the adjacency:
    # you move in next door to a specific rival's one Safehouse, which they can relocate.
    J('High Roller', 5, 'Secure',
      lambda p: p['d'].has('highSociety') and p['rum'] and p['barrels'] >= 4
      and p['adj_rival_safehouse']),
]

STAKE = {1: 1, 3: 2, 5: 3}

# Only the flags each verb's Jobs actually read — keeps the search tractable.
VERB_BOOLS = {
    # COUNTERPLAY PASS: 'control' added for Gin Pipeline's "into a Ward you Control";
    # 'seize' for The Smuggler's Run, which now takes the Dock it delivers to. A Move
    # CAN seize -- the rulebook's Move entry covers walking into rival turf and the
    # undefended-HQ takeover -- so this is a real Play, not a modelling convenience.
    'Move': ['williamsburg_bridge', 'across_water', 'defenseless', 'rival_deed',
             'hostile', 'origin_press5', 'from_staten_dock', 'rum', 'control', 'seize'],
    'Unload': ['rum'],   # off_home_turf retired: The Grand Tour now names the East River
    # COUNTERPLAY PASS: 'hostile' added for High Roller (Secure into a rival-held High
    # Society district). Without it that predicate would be permanently False and the
    # card would silently never be overlap-checked -- see the Rise note below.
    'Secure': ['adj_rival_safehouse', 'rum', 'own_deed', 'hostile'],
    'Recruit': ['own_deed'],
    # rival_deed was MISSING here, so Last One Standing's predicate was permanently
    # False and the card had never been overlap-checked at all. Any flag a Job's
    # lambda reads must appear in its verb's list or the Job silently never fires.
    # COUNTERPLAY PASS: 'defenseless' added for The Empty Casket's rewrite. Omitting it
    # pinned the flag False and made the card unfirable -- the SECOND time this exact
    # bug has bitten this one verb (rival_deed was missing here in 2026-07-19). The new
    # LIVENESS check in breadth_audit.py caught it; the overlap audit reported PASS.
    'Rise': ['control', 'hostile', 'rival_deed', 'defenseless'],
    'Trade': [],
    # COUNTERPLAY PASS: 'hostile' added for The Pier Six Brawl, which is now a Seize.
    'Open Fire': ['seize', 'rival_safehouse', 'boss_killed', 'own_boss', 'takeover',
                  'hostile'],
    'Extort': ['all_five_boroughs'],
    'Rat': ['control'],
}
ALL_BOOLS = sorted({b for v in VERB_BOOLS.values() for b in v})


# --- DRIFT GUARD -------------------------------------------------------------
# These predicates are hand-written, so they can silently fall out of sync with
# the real deck (they did once — this audit reported PASS on a deck that had been
# renamed and re-objectived out from under it). Fail loudly instead.
def _check_drift():
    import re, html, os
    path = os.path.join(os.path.dirname(__file__), '..', 'Jobs Cards v0.9.html')
    src = open(path, encoding='utf-8').read()
    body = src[src.index('<body>'):]
    pairs = re.findall(
        r'<h2 class="title[^"]*">(.*?)</h2>.*?data-respect="(\d)"', body, flags=re.S)
    deck = {(html.unescape(re.sub(r'<[^>]+>', '', t)).replace('’', "'"), int(r))
            for t, r in pairs}
    model = {(j['name'], j['respect']) for j in JOBS}
    if deck != model:
        raise SystemExit(
            'OVERLAP AUDIT IS STALE — model does not match the deck.\n'
            f'  in deck, not modelled: {sorted(deck - model)}\n'
            f'  modelled, not in deck: {sorted(model - deck)}')
    print(f'drift guard: OK — model matches all {len(deck)} cards in the deck\n')


_check_drift()

seen = {}
worst = []

for verb, bools in VERB_BOOLS.items():
    jobs_v = [j for j in JOBS if j['verb'] == verb]
    for d in DS:
        for barrels in (0, 3, 4, 6, 8):
            # 4 and 5 added: at (0, 6) the search could not tell a 4+ Recruit card
            # from a 6+ one, so Tenement Army and Union Dues always looked identical.
            for runners in (0, 4, 5, 6):
                for kills in (0, 2, 3, 5):
                    for defenders in (0, 5):
                        for combo in itertools.product((False, True), repeat=len(bools)):
                            p = {b: False for b in ALL_BOOLS}
                            p.update(dict(zip(bools, combo)))
                            p.update(d=d, barrels=barrels, runners=runners,
                                     kills=kills, defenders=defenders)
                            # --- physical consistency of the board state ---
                            # SPLIT MARKET PASS: an Unload sells one liquor, and which
                            # one is decided by the address, not the seller. A Hotspot
                            # buys Rum and nothing else; every other bar buys Moonshine
                            # and nothing else. Enumerating the impossible half of that
                            # invented co-fires no player could ever make.
                            if verb == 'Unload' and p['rum'] != d.has('highSociety'):
                                continue
                            if p['seize'] and p['defenseless']:
                                continue
                            if p['boss_killed'] and kills < 1:
                                continue
                            if p['rival_safehouse'] and p['defenseless']:
                                continue
                            # you can only take over a Safehouse that is there
                            if p['takeover'] and not p['rival_safehouse']:
                                continue
                            if p['from_staten_dock'] and d.boro == ST:
                                continue
                            if p['seize'] and defenders == 0 and kills == 0:
                                continue
                            # Defenseless (no rival Mobsters) and Hostile (rival-held)
                            # are contradictory.
                            if p['defenseless'] and p['hostile']:
                                continue
                            # COUNTERPLAY PASS additions. A district you Control cannot
                            # simultaneously be rival-held or an unclaimed Defenseless
                            # one, and a rival Safehouse implies the district is theirs.
                            if p['control'] and (p['hostile'] or p['defenseless']):
                                continue
                            if p['rival_safehouse'] and p['control']:
                                continue
                            # You Seize a district FROM someone: a Seize target is
                            # hostile by definition, never one you already Control.
                            if p['seize'] and p['control']:
                                continue
                            # The Williamsburg Bridge lands only at its two ends.
                            if p['williamsburg_bridge'] and d.name not in ('Williamsburg', 'Five Points'):
                                continue
                            # Both Staten Docks are Pressure 1 and 3 — a Staten-Dock
                            # origin can never also be a Pressure 5+ origin.
                            if p['from_staten_dock'] and p['origin_press5']:
                                continue
                            # Staten's Deed is returned to the box at setup, so no
                            # rival can ever hold it.
                            if p['rival_deed'] and d.boro == ST:
                                continue
                            # Same reason: you can never hold Staten's Deed either.
                            if p.get('own_deed') and d.boro == ST:
                                continue
                            # You cannot Move barrels in from across water and also
                            # over the Williamsburg Bridge in the same Play.
                            if p['across_water'] and p['williamsburg_bridge']:
                                continue
                            fired = [j for j in jobs_v if j['fn'](p)]
                            if len(fired) < 2:
                                continue
                            tot = sum(j['respect'] for j in fired)
                            stake = sum(STAKE[j['respect']] for j in fired)
                            if stake > 8:   # handoff: ~8 markers is the real stake ceiling
                                continue
                            fives = sum(1 for j in fired if j['respect'] == 5)
                            key = (verb, tuple(sorted(j['name'] for j in fired)))
                            if key not in seen:
                                seen[key] = True
                                worst.append((tot, fives, verb, key[1], stake, d.name))

worst.sort(reverse=True)
violations = [w for w in worst if w[1] >= 2]

print('=' * 74)
print('HARD RULE — never two 5s on one Play')
print('=' * 74)
if violations:
    for tot, fives, verb, names, stake, dn in violations:
        print(f'  !! {tot:2} Respect  [{verb}] @ {dn}: {" + ".join(names)}')
else:
    print('  PASS — no Play in the deck can fire two 5-Respect Jobs.')

print()
print('=' * 74)
print('Largest co-firing stacks (stake <= 8)')
print('=' * 74)
for tot, fives, verb, names, stake, dn in worst[:12]:
    print(f'  {tot:2} Respect  stake {stake}  [{verb:9}] @ {dn:15} {" + ".join(names)}')
