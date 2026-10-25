# -*- coding: utf-8 -*-
"""Board-fairness audit for the Jobs deck.

Tests Nick's banked principles (memory: contract-deck-design):
  1. The deck should read as a FAIR MAP of the board. Uneven coverage hands a
     deck-memoriser an edge invisible to a newcomer.
  2. District-TYPE bias is tolerable; BOROUGH bias is not: it creates a
     starting-position exploit.

Jobs are events, not holdings, so this adds a third measure the Contract audit
never needed: for each borough-naming card, is it EASIER for the player who
starts in that borough (home-friendly) or HARDER (home-hostile)?
"""
import sys

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

M, BX, Q, BK, ST = 'Manhattan', 'Bronx', 'Queens', 'Brooklyn', 'Staten'

# name, borough, tags, still, setup: setup from the Town Planner's Setup column.
# Since 2026-10-07 the North (Manhattan, Bronx) starts on its 8, 9 and 10 and the
# South (Queens, Brooklyn) on its 4, 5 and 6.
BOARD = [
    ('Sugar Hill', M, {'highSociety', 'speakeasy'}, 7, 'police'),
    ('East Harlem', M, {'speakeasy'}, 12, ''),
    ('The Tenderloin', M, {'speakeasy'}, 8, 'start-speak'),
    ('West Side', M, {'dock'}, 11, ''),
    ('The Bowery', M, {'dock'}, 9, 'start-dock'),
    ('Five Points', M, {'ward'}, 10, 'home'),
    ('Morris Park', BX, {'highSociety', 'speakeasy'}, 7, 'police'),
    ('Belmont', BX, {'speakeasy'}, 11, ''),
    ('Fordham', BX, {'speakeasy'}, 8, 'start-speak'),
    ('Throggs Neck', BX, {'dock'}, 10, 'start-dock'),
    ('Hunts Point', BX, {'ward'}, 9, 'home'),
    ('Richmond Hill', Q, {'highSociety', 'speakeasy'}, 7, 'police'),
    ('Astoria', Q, {'speakeasy'}, 2, ''),
    ('Corona', Q, {'speakeasy'}, 6, 'start-speak'),
    ('Whitestone', Q, {'dock'}, 5, 'start-dock'),
    ('Jamaica', Q, {'dock'}, 3, ''),
    ('Flushing', Q, {'ward'}, 4, 'home'),
    ('Williamsburg', BK, {'highSociety', 'speakeasy'}, 7, 'police'),
    ('Coney Island', BK, {'speakeasy'}, 3, ''),
    ('Red Hook', BK, {'speakeasy'}, 6, 'start-speak'),
    ('Canarsie', BK, {'dock'}, 4, 'start-dock'),
    ('Brownsville', BK, {'ward'}, 5, 'home'),
    ('Stapleton', ST, {'dock'}, 12, ''),
    ('Tottenville', ST, {'dock'}, 2, ''),
]


def press(still):
    return 6 - abs(still - 7)


# Which district TYPES each card's objective rewards.
# types: ward / highSociety / dock / speakeasy / press5 / any
# home: {borough: stance}. A card can name two boroughs and treat them
#   DIFFERENTLY, which the first version of this audit could not express.
#   'friendly' = easier for the player who STARTS there
#   'hostile'  = harder for them / points armies at them
#   'neutral'  = naming it neither favours nor punishes the home player
CARDS = [
    # (name, respect, verb, types, home)
    # --- 1 Respect: the bar set (2026-10-11, round 2), two per seat by construction ---
    # East Harlem borders both Five Points and Hunts Point: two seats' home Wards.
    ("The Angel's Share",     1, 'Unload',    {'speakeasy'},                {M: 'friendly', BX: 'friendly'}),
    ('High Spirits',          1, 'Unload',    {'speakeasy', 'press5'},      {M: 'friendly'}),
    ('Bathtub Gin',           1, 'Unload',    {'speakeasy'},                {BX: 'friendly'}),
    ('Coffin Varnish',        1, 'Unload',    {'speakeasy', 'press5'},      {BX: 'friendly'}),
    ('Giggle Water',          1, 'Unload',    {'speakeasy'},                {Q: 'friendly'}),
    ('Poison Panic',          1, 'Unload',    {'speakeasy', 'press5'},      {Q: 'friendly'}),
    ('Last Call',             1, 'Unload',    {'speakeasy'},                {BK: 'friendly'}),
    ('Off the Boat',          1, 'Unload',    {'speakeasy', 'press5'},      {BK: 'friendly'}),
    # --- 1 Respect: singles ---
    # Not Brooklyn-friendly: the bridge runs from Manhattan's home Ward to Brooklyn's
    # police-locked room, so Manhattan hauls from turf it already owns.
    ('The Milk Run',          2, 'Move',      {'any'},                      {M: 'friendly', BK: 'neutral'}),
    # West Side: the empty Manhattan Dock beside Five Points and the Tenderloin.
    ("The Dutchman's Deal",   1, 'Trade',     {'dock'},                     {M: 'friendly'}),
    # Jamaica: Queens' second Dock, next door to Brooklyn's home Ward (2026-10-17, replaced Night Landing).
    ('Jamaica Ginger',        1, 'Trade',     {'dock'},                     {Q: 'friendly', BK: 'friendly'}),
    ('The Pier Six Brawl',    1, 'Open Fire', {'dock'},                     {}),
    ('The Beachhead',         1, 'Secure',    {'any'},                      {}),
    ('Tenement Army',         1, 'Recruit',   {'ward'},                     {ST: 'neutral'}),
    ('Rum Row',               1, 'Trade',     {'dock'},                     {ST: 'neutral'}),
    ('The Insurance Job',     2, 'Raid',      {'any'},                      {}),
    # --- 2 Respect: the Extort set, one per seat, each its seat's friendly 2 ---
    # 'press5': each set holds its seat's starting bar (Pressure 5) and its room (6).
    ('Empire State',          2, 'Extort',    {'speakeasy', 'highSociety', 'press5'}, {M: 'friendly'}),
    ('The Big Squeeze',       2, 'Extort',    {'speakeasy', 'highSociety', 'press5'}, {BX: 'friendly'}),
    ('King of Queens',        2, 'Extort',    {'speakeasy', 'highSociety', 'press5'}, {Q: 'friendly'}),
    ('The Black Hand',        2, 'Extort',    {'speakeasy', 'highSociety', 'press5'}, {BK: 'friendly'}),
    ('The Five Families',     3, 'Extort',    {'any'},
     {M: 'neutral', BX: 'neutral', Q: 'neutral', BK: 'neutral', ST: 'neutral'}),
    ('Cuban Prince',          1, 'Extort',    {'dock'},                     {}),
    # --- 2 Respect: singles ---
    # The Hell Gate runs from Hunts Point (the Bronx's home Ward) to Astoria: the Bronx
    # starts on its near end with its Boss; anyone else crosses into the Bronx garrison.
    ("Hell's Highway",        2, 'Move',      {'any'},                      {BX: 'friendly'}),
    # Astoria, Queens' empty bar, three Plays from Whitestone.
    ('Last One Standing',     2, 'Secure',    {'speakeasy'},                {Q: 'friendly'}),
    # The four Pressure 5 Stills: every seat's starting bar (Stapleton's 8 made five until
    # 2026-10-25), so it is aimed at every seat alike.
    ('The Copper Heist',      2, 'Open Fire', {'press5'},                   {}),
    # The bridge set (2026-10-13). The Queensboro's ends are empty bars: East Harlem beside the
    # Manhattan and Bronx home Wards, Astoria beside three Queens starts and the Bronx's Ward. The Brooklyn
    # Bridge joins Manhattan's starting Dock to Brooklyn's starting bar.
    ('The One-Way Ride',      2, 'Move',      {'speakeasy'},                {M: 'friendly', BX: 'friendly', Q: 'friendly'}),
    ('A Bridge to Sell',      2, 'Move',      {'dock', 'speakeasy', 'press5'}, {M: 'friendly', BK: 'friendly'}),
    # Each seat's own room, so every seat's friendly 2 alike.
    ('Opening Night',         2, 'Unload',    {'highSociety', 'speakeasy'}, {}),
    ('Union Dues',            1, 'Recruit',   {'ward'},                     {}),
    # --- 3 Respect (the top tier since the 1/2/3 retier, 2026-10-14): aimed at every seat alike ---
    ("The Butcher's Ledger",  3, 'Open Fire', {'any'},                      {}),
    ("The Smuggler's Run",    3, 'Move',      {'dock'},                     {ST: 'neutral'}),
    # A rival's Safehouse: aimed at every seat alike.
    ('The Eviction',          3, 'Open Fire', {'ward'},                     {}),
    # Any of the four rooms, from whoever holds it.
    ('High Roller',           3, 'Open Fire', {'highSociety', 'speakeasy'}, {}),
    # Any ordinary bar outside your home Borough: every seat's away bars alike.
    ('The Noble Experiment',  3, 'Unload',    {'speakeasy'},                {}),
    ('The Warehouse',         3, 'Secure',    {'any'},                      {}),
    ('The Toll Booth Trap',   3, 'Open Fire', {'any'},                      {}),
]

TYPE_COUNT = {
    'ward':        sum(1 for d in BOARD if 'ward' in d[2]),
    'highSociety': sum(1 for d in BOARD if 'highSociety' in d[2]),
    'dock':        sum(1 for d in BOARD if 'dock' in d[2]),
    'speakeasy':   sum(1 for d in BOARD if 'speakeasy' in d[2]),
    'press5':      sum(1 for d in BOARD if press(d[3]) >= 5),
}

print('=' * 78)
print('1. COVERAGE BY DISTRICT TYPE   (old audit: ~0.75-1.0 healthy, <0.5 starved)')
print('=' * 78)
print(f'  {"type":14}{"on board":>9}{"cards":>7}{"per district":>14}   read')
for t, n in sorted(TYPE_COUNT.items(), key=lambda kv: -kv[1]):
    c = sum(1 for x in CARDS if t in x[3])
    cov = c / n
    read = 'well covered' if cov >= 0.75 else 'healthy' if cov >= 0.5 else 'STARVED'
    print(f'  {t:14}{n:>9}{c:>7}{cov:>14.2f}   {read}')
generic = sum(1 for x in CARDS if 'any' in x[3])
print(f'\n  ("any District" / no type demanded: {generic} cards; these are type-neutral)')

print()
print('=' * 78)
print('2. COVERAGE BY BOROUGH   (Nick: type bias OK, BOROUGH bias is NOT)')
print('=' * 78)
for b in (M, BX, Q, BK, ST):
    hits = [x for x in CARDS if b in x[4]]
    ndist = sum(1 for d in BOARD if d[1] == b)
    bar = '#' * len(hits)
    print(f'  {b:11} {len(hits):>2} cards  ({ndist} districts)  {bar}')
    for x in hits:
        print(f'                 - {x[0]:22} [{x[4][b]}]')

print()
print('=' * 78)
print('3. THE STARTING-POSITION EXPLOIT  (mainland only; nobody starts on Staten)')
print('=' * 78)
print('  For each home borough: cards made EASIER vs HARDER by starting there.')
print('  A fair deck nets ~0 everywhere.')
print()
nets = {}
for b in (M, BX, Q, BK):
    fr = [x[0] for x in CARDS if x[4].get(b) == 'friendly']
    ho = [x[0] for x in CARDS if x[4].get(b) == 'hostile']
    nets[b] = len(fr) - len(ho)
    print(f'  {b:11} friendly {len(fr)}  hostile {len(ho)}   net {nets[b]:+d}')
    for n in fr:
        print(f'                 + {n}   (easier for them)')
    for n in ho:
        print(f'                 - {n}   (aimed at them)')

print()
spread = max(nets.values()) - min(nets.values())
print(f'  SPREAD (best seat - worst seat): {spread}')
print('  ' + ('FAIR' if spread == 0 else
              f'UNFAIR: best seat {max(nets, key=nets.get)}, worst {min(nets, key=nets.get)}'))

print()
print('  Bounty symmetry: is every mainland borough equally hunted?')
for b in (M, BX, Q, BK):
    ho = [x[0] for x in CARDS if x[4].get(b) == 'hostile']
    # No Borough bounties since 2026-10-14: the one body count names no Borough. Fair while every
    # seat has the same number (one each 2026-10-13, two with a Boss card each before).
    mark = 'ok' if all(sum(1 for x in CARDS if x[4].get(o) == 'hostile') == len(ho)
                       for o in (M, BX, Q, BK)) else 'over-targeted'
    print(f'    {b:11} {len(ho)} hostile card(s)   {mark}')

print()
print('=' * 78)
print('4. RESPECT-WEIGHTED SEAT BALANCE')
print('=' * 78)
print('  Card COUNTS being equal is not the same as VALUE being equal: a seat whose')
print('  friendly card pays 1 while its bounty pays a rival 5 is still a bad seat.')
print()
print(f'  {"seat":11}{"friendly":>22}{"bounty":>24}{"weighted":>10}')
wnets = {}
for b in (M, BX, Q, BK):
    fr = [(x[0], x[1]) for x in CARDS if x[4].get(b) == 'friendly']
    ho = [(x[0], x[1]) for x in CARDS if x[4].get(b) == 'hostile']
    w = sum(r for _, r in fr) - sum(r for _, r in ho)
    wnets[b] = w
    fs = ', '.join(f'{n} ({r})' for n, r in fr) or '-'
    hs = ', '.join(f'{n} ({r})' for n, r in ho) or '-'
    print(f'  {b:11}{fs:>22}{hs:>24}{w:>+10d}')
wspread = max(wnets.values()) - min(wnets.values())
print()
print(f'  WEIGHTED SPREAD: {wspread}   '
      f'(best {max(wnets, key=wnets.get)}, worst {min(wnets, key=wnets.get)})')
print('  ' + ('FLAT' if wspread == 0 else
              'residual: the friendly cards differ by seat (no Borough bounties since 2026-10-14)'))
