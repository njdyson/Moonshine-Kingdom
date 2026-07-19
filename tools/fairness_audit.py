# -*- coding: utf-8 -*-
"""Board-fairness audit for the Jobs deck.

Tests Nick's banked principles (memory: contract-deck-design):
  1. The deck should read as a FAIR MAP of the board. Uneven coverage hands a
     deck-memoriser an edge invisible to a newcomer.
  2. District-TYPE bias is tolerable; BOROUGH bias is not — it creates a
     starting-position exploit.

Jobs are events, not holdings, so this adds a third measure the Contract audit
never needed: for each borough-naming card, is it EASIER for the player who
starts in that borough (home-friendly) or HARDER (home-hostile)?
"""
import sys

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

M, BX, Q, BK, ST = 'Manhattan', 'Bronx', 'Queens', 'Brooklyn', 'Staten'

# name, borough, tags, still, setup  — setup from Turn Structure & Ledger (Zone col)
BOARD = [
    ('Sugar Hill', M, {'highSociety', 'speakeasy'}, 7, 'police'),
    ('East Harlem', M, {'speakeasy'}, 12, 'start-speak'),
    ('The Tenderloin', M, {'speakeasy'}, 8, ''),
    ('West Side', M, {'dock'}, 11, 'start-dock'),
    ('The Bowery', M, {'dock'}, 9, ''),
    ('Five Points', M, {'ward'}, 10, 'home'),
    ('Morris Park', BX, {'highSociety', 'speakeasy'}, 7, 'police'),
    ('Belmont', BX, {'speakeasy'}, 11, 'start-speak'),
    ('Fordham', BX, {'speakeasy'}, 8, ''),
    ('Throggs Neck', BX, {'dock'}, 10, 'start-dock'),
    ('Hunts Point', BX, {'ward'}, 9, 'home'),
    ('Richmond Hill', Q, {'highSociety', 'speakeasy'}, 7, 'police'),
    ('Astoria', Q, {'speakeasy'}, 2, 'start-speak'),
    ('Flushing', Q, {'speakeasy'}, 6, ''),
    ('Whitestone', Q, {'dock'}, 5, ''),
    ('Jamaica', Q, {'dock'}, 3, 'start-dock'),
    ('Corona', Q, {'ward'}, 4, 'home'),
    ('Williamsburg', BK, {'highSociety', 'speakeasy'}, 7, 'police'),
    ('Coney Island', BK, {'speakeasy'}, 3, 'start-speak'),
    ('Red Hook', BK, {'speakeasy'}, 6, ''),
    ('Sheepshead Bay', BK, {'dock'}, 4, 'start-dock'),
    ('Brownsville', BK, {'ward'}, 5, 'home'),
    ('Stapleton', ST, {'ward'}, 6, ''),
    ('Westerleigh', ST, {'dock'}, 2, ''),
    ('Tottenville', ST, {'dock'}, 4, ''),
]


def press(still):
    return 6 - abs(still - 7)


# Which district TYPES each card's objective rewards.
# types: ward / highSociety / dock / speakeasy / press5 / any
# home: {borough: stance} — a card can name two boroughs and treat them
#   DIFFERENTLY, which the first version of this audit could not express.
#   'friendly' = easier for the player who STARTS there
#   'hostile'  = harder for them / points armies at them
#   'neutral'  = naming it neither favours nor punishes the home player
CARDS = [
    # (name, respect, verb, types, home)
    ('The Milk Run',          1, 'Move',      {'any'},
     # CORRECTION: not Brooklyn-friendly. The bridge runs Five Points <-> Williamsburg.
     # Five Points is MANHATTAN'S home turf (Safehouse + Boss from setup), while
     # Williamsburg is Brooklyn's HIGH SOCIETY district — police-locked and
     # impassable until a Raid. So Manhattan hauls from turf it already owns;
     # Brooklyn must push barrels INTO Manhattan's garrison, where anything left
     # behind becomes Manhattan's.
     {M: 'friendly', BK: 'neutral'}),
    ('The Beachhead',         1, 'Secure',    {'any'},                      {}),
    ('Tenement Army',         1, 'Recruit',   {'ward'},                     {}),
    ('Last Call',             1, 'Unload',    {'speakeasy'},                {}),
    ('The Empty Casket',      1, 'Rise',      {'ward'},                     {}),
    ('Fortress Staten',       1, 'Secure',    {'any'},                      {ST: 'neutral'}),
    ('The Pier Six Brawl',    1, 'Open Fire', {'dock'},                     {}),
    ("The Dutchman's Deal",   1, 'Trade',     {'dock'},                     {}),
    ("The Angel's Share",     1, 'Unload',    {'speakeasy'},                {}),
    ('The Riverside Switch',  1, 'Move',      {'dock'},                     {}),
    ("Squatter's Rights",     1, 'Move',      {'any'},                      {}),
    ('The Grand Tour',        1, 'Unload',    {'speakeasy'},                {}),
    # Sunny's Bar = Red Hook, Brooklyn's NON-starting Speakeasy (empty at setup) —
    # so Brooklyn must still take it, but it's on their doorstep and their starting
    # Dock (Sheepshead Bay) is where they make the Rum.
    ('Off the Boat',          3, 'Unload',    {'speakeasy', 'press5'},      {BK: 'friendly'}),
    ('Rum Row',               3, 'Trade',     {'dock'},                     {ST: 'neutral'}),
    ('The Eviction',          3, 'Open Fire', {'any'},                      {}),
    ('The Copper Heist',      3, 'Open Fire', {'press5'},                   {}),
    ('The Insurance Job',     3, 'Rat',       {'any'},                      {}),
    # MANHATTAN'S FRIENDLY — orphan Speakeasy #4 (The Haymarket, the Tenderloin).
    ('The Big Squeeze',       3, 'Unload',    {'speakeasy', 'press5'},      {M: 'friendly'}),
    # BRONX'S FRIENDLY — orphan district Fordham (The Penny Whistle).
    ("Hell's Highway",        3, 'Move',      {'press5'},                   {BX: 'friendly'}),
    # Paradise Alley = Flushing -> QUEENS' FRIENDLY (mirrors Off the Boat/Sunny's Bar).
    ('Poison Panic',          3, 'Unload',    {'speakeasy', 'press5'},      {Q: 'friendly'}),
    ('Gin Pipeline',          3, 'Move',      {'press5'},                   {}),
    ('Union Dues',            3, 'Recruit',   {'ward'},                     {}),
    ('Last One Standing',     3, 'Rise',      {'any'},                      {}),
    ('The Irish Goodbye',     3, 'Open Fire', {'speakeasy'},                {}),
    ('Opening Night',         5, 'Unload',    {'highSociety', 'speakeasy'}, {}),
    ('The Toll Booth Trap',   5, 'Open Fire', {'any'},                      {Q: 'hostile'}),
    ('Over the Top',          5, 'Open Fire', {'any'},                      {BX: 'hostile'}),
    ('The Five Families',     5, 'Extort',    {'any'},
     {M: 'neutral', BX: 'neutral', Q: 'neutral', BK: 'neutral', ST: 'neutral'}),
    ("The Smuggler's Run",    5, 'Move',      {'dock'},                     {ST: 'neutral'}),
    # MANHATTAN'S BOUNTY — Five Points is Manhattan's Ward and home turf.
    ('Bloody Sunday',         5, 'Open Fire', {'any'},                      {M: 'hostile'}),
    ("The Butcher's Ledger",  5, 'Open Fire', {'any'},                      {BK: 'hostile'}),
    ('High Roller',           5, 'Secure',    {'highSociety'},              {}),
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
print(f'\n  ("any District" / no type demanded: {generic} cards — these are type-neutral)')

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
              f'UNFAIR — best seat {max(nets, key=nets.get)}, worst {min(nets, key=nets.get)}'))

print()
print('  Bounty symmetry — is every mainland borough equally hunted?')
for b in (M, BX, Q, BK):
    ho = [x[0] for x in CARDS if x[4].get(b) == 'hostile']
    mark = 'ok' if len(ho) == 1 else ('NO BOUNTY — safest seat' if not ho else 'over-targeted')
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
              'residual — every seat has 1 friendly + 1 bounty, but not at matching tiers'))
