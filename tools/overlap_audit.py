# -*- coding: utf-8 -*-
"""Overlap audit for the Jobs deck.

Enumerates every Play a player could make (Play x target District x board state x
what the Play did there) and reports which Jobs co-fire. Enforces handoff §3:
    - Since the 1/2/3 retier (2026-10-14) a Job's Stake is its Respect, so no Play pays more than
      the markers its Jobs locked up. "Never two 5s" (2026-10-12 to 2026-10-14) is retired; the
      audit lists the top-tier pairs (two 3s on one Play) to watch.
    - Watch:     big stacks in many Districts are luck; in one or two they were engineered.

breadth_audit.py imports this module, so the model lives in one place.

REBUILT 2026-10-10 (jobs-audit-handoff.md). The model it replaced had drifted:
  - Move and Open Fire were separate Play spaces, so a Move card never met the fight
    its own Move started. The Rulebook says the opposite ("A Firefight Is One Play":
    the Move that walked in the door is the Play), and the split hid The Smuggler's
    Run paying beside every bounty 5 on one Move. It reported PASS on a deck that broke
    the hard rule thirteen ways.
  - Several predicates still read the cards' older wording (Deed flags, Last One
    Standing as a "$300 Speakeasy", the split market's Moonshine-only bars).
  - The drift guard compared names and Respect only, so none of that tripped it.
Every Job now carries its printed objective, and the drift guard compares that too:
reword a card and this audit refuses to run until its predicate has been re-read.
"""
import html
import itertools
import os
import re
import sys
from collections import defaultdict

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

M, BX, Q, BK, ST = 'Manhattan', 'Bronx', 'Queens', 'Brooklyn', 'Staten'

# name, borough, tags, still  (pressure = 6 - |still-7|), from the Town Planner.
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
    ('Red Hook', BK, {'speakeasy'}, 6), ('Canarsie', BK, {'dock'}, 4),
    ('Brownsville', BK, {'ward'}, 5),
    ('Stapleton', ST, {'ward'}, 8), ('Westerleigh', ST, {'dock'}, 2), ('Tottenville', ST, {'dock'}, 4),
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
# is luck. Type classes are broad ("a Speakeasy" is 12 districts, "a Dock" is 8),
# so landmarks are how a card gets a small, glanceable, unarguable target set.
EAST_RIVER = {'East Harlem', 'Astoria', 'Williamsburg', 'Red Hook'}   # 4 Speakeasies
JAMAICA_BAY = {'Canarsie', 'Jamaica'}                                  # 2 Docks
WILLIAMSBURG_BRIDGE = {'Five Points', 'Williamsburg'}
HELL_GATE_BRIDGE = {'Hunts Point', 'Astoria'}
QUEENSBORO_BRIDGE = {'East Harlem', 'Astoria'}
BROOKLYN_BRIDGE = {'The Bowery', 'Red Hook'}
# A Move across a Bridge: its route name and the two Districts it joins.
BRIDGES = {'wburg': WILLIAMSBURG_BRIDGE, 'hellgate': HELL_GATE_BRIDGE,
           'qboro': QUEENSBORO_BRIDGE, 'bklyn': BROOKLYN_BRIDGE}


# --- THE JOBS ----------------------------------------------------------------
# (name, respect, Play spaces, printed objective, predicate(p, d) -> bool)
# A Play space is where the Job can complete. 'Move' covers Move, Stealth and Skiff
# AND every fight they start: a Firefight is one Play. The objective must match the
# printed card exactly (tags stripped, entities resolved); the drift guard checks.
def J(name, respect, verbs, text, fn):
    return dict(name=name, respect=respect, verbs=set(verbs), text=text, fn=fn)


JOBS = [
    # --- 1 Respect ---
    # The bar set (2026-10-11, round 2): one Unload card per ordinary Speakeasy.
] + [J(n, 1, ['Unload'], f'Unload 5+ barrels at {venue} in {bar}.',
       (lambda bar: lambda p, d: p['barrels'] >= 5 and d.name == bar)(bar))
     for n, venue, bar in (("The Angel's Share", 'The Silver Dollar', 'East Harlem'),
                           ('High Spirits', 'The Haymarket', 'The Tenderloin'),
                           ('Bathtub Gin', "DeLillo's", 'Belmont'),
                           ('Coffin Varnish', 'The Penny Whistle', 'Fordham'),
                           ('Giggle Water', 'Bohemian Hall', 'Astoria'),
                           ('Poison Panic', 'Paradise Alley', 'Flushing'),
                           ('Last Call', "Ruby's Joint", 'Coney Island'),
                           ('Off the Boat', "Sunny's Bar", 'Red Hook'))] + [
    J('The Milk Run', 1, ['Move'],
      'Move 4+ barrels across the Williamsburg Bridge.',
      lambda p, d: p['barrels'] >= 4 and p['route'] == 'wburg'),
    J("The Dutchman's Deal", 1, ['Trade'],
      'Trade 3+ barrels at West Side.',
      lambda p, d: p['barrels'] >= 3 and d.name == 'West Side'),
    J('Night Landing', 1, ['Move'],
      'Move 4+ barrels across water into a Jamaica Bay Dock.',
      lambda p, d: p['barrels'] >= 4 and p['route'] == 'water' and d.name in JAMAICA_BAY),
    # No Safehouse guard since 2026-10-11: The Eviction, which it kept off, is cut.
    J('The Pier Six Brawl', 1, ['Move'],
      'Seize a Dock.',
      lambda p, d: p['seize'] and d.has('dock')),
    J('The Beachhead', 1, ['Secure'],
      'Secure your Safehouse in a District Land Connected to a rival Safehouse.',
      lambda p, d: p['adj_rival_sh']),
    J('Tenement Army', 1, ['Recruit'],
      'Recruit 4+ Runners at Stapleton.',
      lambda p, d: p['runners'] >= 4 and d.name == 'Stapleton'),
    J('Rum Row', 1, ['Trade'],
      'Trade 4+ barrels at a Staten Island Dock.',
      lambda p, d: p['barrels'] >= 4 and d.boro == ST),
    # Modelled on the District the Raid padlocks, which must be yours.
    J('The Insurance Job', 1, ['Rat'],
      'Rat, and have the Raid padlock a Pressure 1 or 2 Still you Control.',
      lambda p, d: d.press <= 2),
    # --- 2 Respect ---
    # The Extort cards read the whole map, so an Extort is modelled once (see _extort).
    J('Empire State', 2, ['Extort'],
      'Extort all of the Speakeasies in Manhattan.',
      lambda p, d: M in p['bars']),
    J('The Big Squeeze', 2, ['Extort'],
      'Extort all of the Speakeasies in the Bronx.',
      lambda p, d: BX in p['bars']),
    J('King of Queens', 2, ['Extort'],
      'Extort all of the Speakeasies in Queens.',
      lambda p, d: Q in p['bars']),
    J('The Black Hand', 2, ['Extort'],
      'Extort all of the Speakeasies in Brooklyn.',
      lambda p, d: BK in p['bars']),
    J('The Five Families', 3, ['Extort'],
      'Extort a District in all five Boroughs.',
      lambda p, d: p['all5']),
    J('Cuban Prince', 2, ['Extort'],
      'Extort 4+ Docks.',
      lambda p, d: p['docks4']),
    J("Hell's Highway", 2, ['Move'],
      'Move your Boss and 4+ Rum across the Hell Gate Bridge.',
      lambda p, d: p['route'] == 'hellgate' and p['own_boss'] and p['barrels'] >= 4 and p['rum']),
    J('Last One Standing', 2, ['Secure'],
      'Secure your Safehouse in Astoria holding 6+ Rum.',
      lambda p, d: d.name == 'Astoria' and p['barrels'] >= 6 and p['rum']),
    J("The Smuggler's Run", 3, ['Move'],
      "Move 4+ Rum from Staten Island into a rival's Dock, and Seize it.",
      lambda p, d: p['seize'] and d.has('dock') and p['from_staten']
      and p['barrels'] >= 4 and p['rum']),
    J('The Copper Heist', 2, ['Move'],
      'Seize a District with a Pressure 5 Still.',
      lambda p, d: p['seize'] and d.press == 5),
    # The bridge set (2026-10-13): Hell's Highway's wording on the Queensboro and Brooklyn Bridges.
    J('The One-Way Ride', 2, ['Move'],
      'Move your Boss and 4+ Rum across the Queensboro Bridge.',
      lambda p, d: p['route'] == 'qboro' and p['own_boss'] and p['barrels'] >= 4 and p['rum']),
    J('A Bridge to Sell', 2, ['Move'],
      'Move your Boss and 4+ Rum across the Brooklyn Bridge.',
      lambda p, d: p['route'] == 'bklyn' and p['own_boss'] and p['barrels'] >= 4 and p['rum']),
    # Back 2026-10-13: a takeover comes with a Seize (a won fight, a Fold, or an unguarded walk-in).
    J('The Eviction', 3, ['Move'],
      "Take over a rival's Safehouse.",
      lambda p, d: p['seize'] and p['sh'] == 'takeover'),
    J('Opening Night', 2, ['Unload'],
      'Unload 5+ Rum at the High Society Venue in your home Borough.',
      lambda p, d: p['barrels'] >= 5 and d.has('highSociety') and p['home'] == 'own'),
    J('Union Dues', 2, ['Recruit'],
      "Recruit 4+ Runners in a rival's home Ward.",
      lambda p, d: p['runners'] >= 4 and d.has('ward') and p['home'] == 'rival'),
    # --- 3 Respect: the body count (2026-10-11), a Seize since 2026-10-13, one card for any
    # Borough since 2026-10-14 (Nick: the four sat unclaimed in the Market). `def_runners` and
    # `def_boss` are the crew that met the Move at the door, so a Fold pays as a won fight does.
    J("The Butcher's Ledger", 3, ['Move'], 'Seize a District from 4+ rival Mobsters.',
      lambda p, d: p['seize'] and p['def_runners'] + p['def_boss'] >= 4),
    # New 2026-10-14 (Nick's parked "Seize a Pressure 6 Still"): a crown room taken off its holder.
    J('High Roller', 3, ['Move'], 'Seize a High Society Venue.',
      lambda p, d: p['seize'] and d.has('highSociety')),
    # The brew-and-sell cards (Nick, 2026-10-14). The Real McCoy went at the retier the same day.
    J('The Noble Experiment', 3, ['Unload'], 'Unload 8+ Moonshine outside your home Borough.',
      lambda p, d: p['barrels'] >= 8 and not p['rum'] and p['home'] != 'own'),
    J('The Warehouse', 3, ['Secure'], 'Secure your Safehouse in a District holding 10+ barrels.',
      lambda p, d: p['barrels'] >= 10),
    # The one Boss card left, anywhere, and a Kill (2026-10-13): a Fold denies it.
    J('The Toll Booth Trap', 3, ['Move'], 'Kill a rival Boss.',
      lambda p, d: p['boss_killed']),
]


STAKE = {1: 1, 2: 2, 3: 3}   # since the 1/2/3 retier (2026-10-14) a Job's Stake is its Respect
VERBS = ('Move', 'Secure', 'Rise', 'Recruit', 'Unload', 'Trade', 'Extort', 'Rat')


# --- THE PLAYS -----------------------------------------------------------------
# Every distinct Play on a District, as the facts a Job can read. The board's own
# rules prune the impossible ones, so a co-fire reported here is one a player can
# actually make. Grids straddle every threshold the deck prints (3, 4, 5, 6, 8, 10 barrels;
# 4 Runners; 3 and 4 defending Runners, with and without their Boss): a silent zero is not a pass.
#
# District state before the Play:
#   empty      no Mobsters, no Safehouse, no Squad (barrels may lie there)
#   control    yours
#   hostile    rival Mobsters, no Safehouse
#   hostile_sh rival Mobsters and a rival Safehouse
#   unguarded  a rival Safehouse alone
# home: is the District in your home Borough, a rival's, or nobody's (Staten Island,
# or the unclaimed Borough at three players)?
STATES = ('empty', 'control', 'hostile', 'hostile_sh', 'unguarded')
HOMES = ('own', 'rival', 'none')
BARRELS = (0, 3, 4, 5, 6, 8, 10)


def _p(**kw):
    p = dict(barrels=0, rum=False, runners=0, def_runners=0, def_boss=False, boss_killed=False,
             seize=False, own_boss=False, crew=False, route='land',
             from_staten=False, sh='none', adj_rival_sh=False, all5=False, bars=frozenset(),
             docks4=False)
    p.update(kw)
    p['rival_sh'] = p['state'] in ('hostile_sh', 'unguarded')
    return p


def _liquor(barrels):
    return (False, True) if barrels else (False,)


def plays(verb, d):
    """Yield every distinct Play of this kind on District d."""
    for state in STATES:
        for home in HOMES:
            if d.boro == ST and home != 'none':
                continue
            yield from _plays(verb, d, state, home)


def _plays(verb, d, state, home):
    if verb == 'Move':
        # What the Play did to the District:
        #   walk   moved into your own or an Empty District
        #   gift   barrels alone into rival turf: no Standoff, they become his
        #   held   a fight the Occupier kept (you Fell Back, lost, or Advanced on)
        #   seize  you took it, by winning or by his Fold
        #   torch  you burned his Safehouse and he kept the District (Knights)
        if state in ('empty', 'control'):
            outcomes = ('walk',)
        elif state == 'unguarded':
            outcomes = ('gift', 'seize')
        else:
            outcomes = ('gift', 'held', 'seize') + (('torch',) if state == 'hostile_sh' else ())
        for out in outcomes:
            fight = out in ('held', 'seize', 'torch') and state != 'unguarded'
            # Take a District holding his Safehouse and it can't stay: take it over or
            # destroy it. Torch destroys it while he keeps the District.
            if out == 'seize' and state in ('hostile_sh', 'unguarded'):
                shs = ('takeover', 'destroy')
            else:
                shs = ('torch',) if out == 'torch' else ('none',)
            for sh in shs:
                for route in ('land', 'water') + tuple(BRIDGES):
                    if route in BRIDGES and d.name not in BRIDGES[route]:
                        continue
                    if route == 'water' and not d.has('dock'):
                        continue
                    for from_staten in (False, True):
                        # Off Staten Island a Move from it can only land on a Dock, by water.
                        if from_staten and (d.boro == ST or route != 'water'):
                            continue
                        for barrels in BARRELS:
                            if out == 'gift' and not barrels:
                                continue
                            for rum in _liquor(barrels):
                                for crew in ((False, True) if out == 'walk' else
                                             (False,) if out == 'gift' else (True,)):
                                    if not crew and not barrels:
                                        continue
                                    yield from _fight(fight, state, home, out, sh, route,
                                                      from_staten, barrels, rum, crew)
    elif verb in ('Secure', 'Rise'):
        if state not in ('empty', 'control'):
            return          # Secure and Rise target a Safe District only
        if verb == 'Rise' and not d.has('ward'):
            return
        for barrels in BARRELS:
            for rum in _liquor(barrels):
                for adj in (False, True):
                    yield _p(state=state, home=home, barrels=barrels, rum=rum, adj_rival_sh=adj)
    elif verb == 'Recruit':
        if state == 'control':  # only where your Safehouse stands
            for runners in (0, 4):
                yield _p(state=state, home=home, runners=runners)
    elif verb == 'Unload':
        if state == 'control' and d.has('speakeasy'):
            for barrels in BARRELS[1:]:
                # High Society buys Rum only; every other bar buys both.
                for rum in ((True,) if d.has('highSociety') else (False, True)):
                    yield _p(state=state, home=home, barrels=barrels, rum=rum)
    elif verb == 'Trade':
        if state == 'control' and d.has('dock'):
            for barrels in BARRELS[1:]:
                yield _p(state=state, home=home, barrels=barrels)
    elif verb == 'Extort':
        return              # map-wide: see _extort()
    elif verb == 'Rat':
        if state == 'control':
            yield _p(state=state, home=home)


def _fight(fight, state, home, out, sh, route, from_staten, barrels, rum, crew):
    base = dict(state=state, home=home, seize=out == 'seize', sh=sh, route=route,
                from_staten=from_staten, barrels=barrels, rum=rum, crew=crew)
    if not fight:
        # A crew may bring its Boss on any Move (Hell's Highway reads it).
        for own_boss in ((False, True) if crew else (False,)):
            yield _p(own_boss=own_boss, **base)
        return
    # The crew that met you at the door: its Runners (1 stands for "fewer than three"; 3 makes
    # four Mobsters with the Boss) and whether its Boss stood with them. A Fold is a seize, as a won fight is, but kills nobody;
    # a Boss can fall in a fight you win or lose (last, or first to a Sicilian Hit).
    for def_runners in (0, 1, 3, 4, 5):
        for def_boss in (False, True):
            if not def_runners and not def_boss:
                continue
            for boss_killed in ((False, True) if def_boss else (False,)):
                for own_boss in (False, True):
                    yield _p(def_runners=def_runners, def_boss=def_boss, boss_killed=boss_killed,
                             own_boss=own_boss, **base)


# An Extort pays $200 for every District you Control anywhere, so its Jobs read the whole
# map, not the District it is made from. Modelling it per District (as before 2026-10-11)
# reported The Five Families as firing in 25 places, and would have reported every pair of
# Extort Jobs as a 25-District overlap. It is one Play-space, THE_MAP, enumerated over what
# you hold: all five Boroughs or not, and which Boroughs' three Speakeasies are all yours.
# Judge an Extort stack by what it needs held and staked, not by a District count.
THE_MAP = D(('the whole map (Extort)', None, set(), 7))
MAINLAND = (M, BX, Q, BK)


def _extort():
    for all5 in (False, True):
        for docks4 in (False, True):
            for k in range(len(MAINLAND) + 1):
                for held in itertools.combinations(MAINLAND, k):
                    yield _p(state='control', home='none', all5=all5, docks4=docks4,
                             bars=frozenset(held))


def co_firing():
    """Return ({(verb, names): {districts}}, {name: {districts}})."""
    sets = defaultdict(set)
    solo = defaultdict(set)
    for verb in VERBS:
        jobs_v = [j for j in JOBS if verb in j['verbs']]
        if not jobs_v:
            continue
        for d in ([THE_MAP] if verb == 'Extort' else DS):
            for p in (_extort() if verb == 'Extort' else plays(verb, d)):
                fired = tuple(sorted(j['name'] for j in jobs_v if j['fn'](p, d)))
                for n in fired:
                    solo[n].add(d.name)
                if len(fired) >= 2:
                    sets[(verb, fired)].add(d.name)
    return sets, solo


# --- DRIFT GUARD -------------------------------------------------------------
# The predicates are hand-written, so they can silently fall out of sync with the
# real deck. They did twice: once by name (renamed and re-objectived cards), and
# again by wording (the Deed and split-market predicates outlived the text that
# justified them). Fail loudly on either.
def _plain(t):
    t = html.unescape(re.sub(r'<[^>]+>', '', t)).replace('’', "'")
    return ' '.join(t.split())


def check_drift():
    path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'Jobs Cards v0.9.html')
    src = open(path, encoding='utf-8').read()
    body = src[src.index('<body>'):]
    cards = re.findall(r'<h2 class="title[^"]*">(.*?)</h2>.*?<div class="job"><span>(.*?)</span>'
                       r'.*?data-respect="(\d)"', body, flags=re.S)
    deck = {_plain(t): (int(r), _plain(o)) for t, o, r in cards}
    model = {j['name']: (j['respect'], j['text']) for j in JOBS}
    problems = []
    for name in sorted(set(deck) | set(model)):
        if name not in model:
            problems.append(f'  in deck, not modelled: {name}')
        elif name not in deck:
            problems.append(f'  modelled, not in deck: {name}')
        elif deck[name] != model[name]:
            problems.append(f'  {name}:\n    deck:  {deck[name]}\n    model: {model[name]}')
    if problems:
        raise SystemExit('OVERLAP AUDIT IS STALE: the model does not match the deck.\n'
                         'Re-read each predicate below against its card before updating it.\n'
                         + '\n'.join(problems))
    print(f'drift guard: OK, model matches all {len(deck)} cards, objectives included\n')


def main():
    check_drift()
    respect = {j['name']: j['respect'] for j in JOBS}
    sets, _ = co_firing()
    rows = []
    for (verb, names), dists in sets.items():
        tot = sum(respect[n] for n in names)
        stake = sum(STAKE[respect[n]] for n in names)
        fives = sum(respect[n] == 3 for n in names)
        rows.append((tot, fives, verb, names, stake, sorted(dists)))
    rows.sort(reverse=True)

    print('=' * 78)
    print('Top-tier pairs: two 3s on one Play')
    print('=' * 78)
    # Since the 1/2/3 retier (Nick, 2026-10-14) every Job's Stake is its Respect, so a Play can
    # never pay more than its Jobs locked up, and the Ledger holds 10 markers at most. "Never two
    # 5s" kept a 10-Respect swing off one Play; at 3 + 3 the swing is 6 and needs 6 staked, so the
    # pairs are reported to watch, not failed. Nick took this trade when he promoted The Smuggler's
    # Run and The Eviction, both fights that meet the Ledger and the Trap.
    pairs = defaultdict(set)
    for tot, fives, verb, names, stake, dists in rows:
        if stake > 8:
            continue
        top = [n for n in names if respect[n] == 3]
        for pr in itertools.combinations(sorted(top), 2):
            pairs[pr].update(dists)
    for pr, dists in sorted(pairs.items(), key=lambda kv: (len(kv[1]), kv[0])):
        where = ', '.join(sorted(dists)) if len(dists) <= 4 else f'{len(dists)} districts'
        print(f'  {" + ".join(pr):52} @ {where}')
    bad = [r for r in rows if r[4] <= 8 and r[0] != r[4]]
    if bad:
        raise SystemExit('\nA stack pays other than its stake: a Job is off the 1/2/3 scale.')
    print()
    print('=' * 78)
    print('Largest co-firing stacks (stake <= 8)')
    print('=' * 78)
    shown = [r for r in rows if r[4] <= 8]
    # A stack that is a strict subset of a bigger one in the same places adds nothing.
    shown = [r for r in shown if not any(o is not r and o[2] == r[2] and set(r[3]) < set(o[3])
                                         and set(r[5]) <= set(o[5]) for o in shown)]
    for tot, fives, verb, names, stake, dists in shown[:14]:
        where = ', '.join(dists) if len(dists) <= 3 else f'{len(dists)} districts'
        print(f'  {tot:2} Respect  stake {stake}  [{verb:7}] @ {where:28} {" + ".join(names)}')


if __name__ == '__main__':
    main()
