#!/usr/bin/env python3
"""
House-Pour Lock - MARKET GEOGRAPHY analysis
===========================================
Question: under the Lock, how far is each liquor from its only legal market?
Data pulled from the mk-online bundle (district coords + house pours). The true
edge list isn't shipped (Na={}), so hop-distance uses a coordinate proximity
graph (connect districts within THRESH; all Docks interconnect per the water
rule). Euclidean distance is reported alongside as a graph-free check.
The borough-level channel structure below is EXACT, not a proxy.
"""
import math, heapq
from collections import defaultdict, Counter

DISTRICTS = [
    {"id": "eastHarlem", "name": "East Harlem", "bor": "Ea", "tags": "speakeasy", "pour": "whisky", "pier": "", "x": 54.1, "y": 33.8},
    {"id": "tenderloin", "name": "The Tenderloin", "bor": "Ea", "tags": "speakeasy", "pour": "gin", "pier": "", "x": 32.6, "y": 39.3},
    {"id": "westSide", "name": "West Side", "bor": "Ea", "tags": "dock", "pour": "", "pier": "3", "x": 40.8, "y": 30.4},
    {"id": "bowery", "name": "The Bowery", "bor": "Ea", "tags": "dock", "pour": "", "pier": "4", "x": 21.2, "y": 57.9},
    {"id": "fivePoints", "name": "Five Points", "bor": "Ea", "tags": "ghetto", "pour": "", "pier": "", "x": 27.4, "y": 47.2},
    {"id": "morrisPark", "name": "Morris Park", "bor": "Da", "tags": "highSociety speakeasy", "pour": "whisky", "pier": "", "x": 88.7, "y": 16.2},
    {"id": "belmont", "name": "Belmont", "bor": "Da", "tags": "speakeasy", "pour": "rum", "pier": "", "x": 57.2, "y": 13.2},
    {"id": "fordham", "name": "Fordham", "bor": "Da", "tags": "speakeasy", "pour": "moonshine", "pier": "", "x": 75.0, "y": 14.9},
    {"id": "throggsNeck", "name": "Throggs Neck", "bor": "Da", "tags": "dock", "pour": "", "pier": "6", "x": 81.7, "y": 26.4},
    {"id": "huntsPoint", "name": "Hunts Point", "bor": "Da", "tags": "ghetto", "pour": "", "pier": "", "x": 68.6, "y": 26.3},
    {"id": "richmondHill", "name": "Richmond Hill", "bor": "Oa", "tags": "highSociety speakeasy", "pour": "gin", "pier": "", "x": 82.7, "y": 68.5},
    {"id": "astoria", "name": "Astoria", "bor": "Oa", "tags": "speakeasy", "pour": "rum", "pier": "", "x": 66.9, "y": 44.9},
    {"id": "flushing", "name": "Flushing", "bor": "Oa", "tags": "speakeasy", "pour": "moonshine", "pier": "", "x": 86.0, "y": 54.7},
    {"id": "whitestone", "name": "Whitestone", "bor": "Oa", "tags": "dock", "pour": "", "pier": "2", "x": 82.9, "y": 40.6},
    {"id": "jamaica", "name": "Jamaica", "bor": "Oa", "tags": "dock", "pour": "", "pier": "5", "x": 85.9, "y": 88.0},
    {"id": "corona", "name": "Corona", "bor": "Oa", "tags": "ghetto", "pour": "", "pier": "", "x": 70.8, "y": 58.4},
    {"id": "williamsburg", "name": "Williamsburg", "bor": "ka", "tags": "highSociety speakeasy", "pour": "moonshine", "pier": "", "x": 55.6, "y": 59.8},
    {"id": "coneyIsland", "name": "Coney Island", "bor": "ka", "tags": "speakeasy", "pour": "whisky", "pier": "", "x": 33.8, "y": 88.6},
    {"id": "redHook", "name": "Red Hook", "bor": "ka", "tags": "speakeasy", "pour": "gin", "pier": "", "x": 42.1, "y": 70.1},
    {"id": "sheepsheadBay", "name": "Sheepshead Bay", "bor": "ka", "tags": "dock", "pour": "", "pier": "1", "x": 49.4, "y": 88.2},
    {"id": "brownsville", "name": "Brownsville", "bor": "ka", "tags": "ghetto", "pour": "", "pier": "", "x": 64.7, "y": 76.7},
    {"id": "stapleton", "name": "Stapleton", "bor": "Aa", "tags": "ghetto", "pour": "", "pier": "", "x": 17.1, "y": 83.0},
    {"id": "westerleigh", "name": "Westerleigh", "bor": "Aa", "tags": "dock", "pour": "", "pier": "6", "x": 10.6, "y": 72.8},
    {"id": "tottenville", "name": "Tottenville", "bor": "Aa", "tags": "dock", "pour": "", "pier": "1", "x": 11.7, "y": 93.2},
]

ds = [dict(d) for d in DISTRICTS]
# Sugar Hill was dropped by the extractor; add it back (Manhattan rum / high society).
if not any(d['id'] == 'sugarHill' for d in ds):
    ds.append(dict(id='sugarHill', name='Sugar Hill', bor='Ea', tags='highSociety speakeasy',
                   pour='rum', pier='', x=40.4, y=21.6))
BOR = {'Ea': 'Manhattan', 'Da': 'Bronx', 'Oa': 'Queens', 'ka': 'Brooklyn', 'Aa': 'Staten Island'}
for d in ds:
    d['borough'] = BOR[d['bor']]

speak = [d for d in ds if d['pour']]
docks = [d for d in ds if 'dock' in d['tags']]
dist = lambda a, b: math.hypot(a['x'] - b['x'], a['y'] - b['y'])

# ---- 1. EXACT borough x house-pour structure ----
print("=== Speakeasies by borough x type (EXACT) ===")
grid = defaultdict(dict)
for s in speak:
    grid[s['borough']][s['pour']] = s['name']
types = ['whisky', 'gin', 'moonshine', 'rum']
print(f"{'borough':<14}" + "".join(f"{t:<12}" for t in types))
for b in ['Manhattan', 'Bronx', 'Queens', 'Brooklyn', 'Staten Island']:
    row = grid.get(b, {})
    print(f"{b:<14}" + "".join(f"{(row.get(t,'--')):<12}" for t in types)
          + ("   <- MISSING: " + ",".join(t for t in types if t not in row) if any(t not in row for t in types) else ""))

# ---- 2. Coordinate proximity graph -> hops to nearest market ----
THRESH = 24.0   # tuned so mean land-degree ~3-4 (planar-map-like)
adj = defaultdict(set)
for i, a in enumerate(ds):
    for b in ds[i+1:]:
        if dist(a, b) <= THRESH:
            adj[a['id']].add(b['id']); adj[b['id']].add(a['id'])
dock_ids = [d['id'] for d in docks]
for i in dock_ids:                       # all Docks connect across water
    for j in dock_ids:
        if i != j: adj[i].add(j)
byid = {d['id']: d for d in ds}

def hops_to_type(start_id, typ):
    seen = {start_id}; q = [(0, start_id)]
    while q:
        h, cur = heapq.heappop(q)
        if byid[cur]['pour'] == typ and cur != start_id:
            return h
        if byid[start_id]['pour'] == typ:    # already a market of that type
            return 0
        for n in adj[cur]:
            if n not in seen:
                seen.add(n); heapq.heappush(q, (h+1, n))
    return None

print("\n=== Avg distance from a borough's districts to its NEAREST market of each type ===")
print("    (hops = proximity-graph estimate;  euc = straight-line map units)")
print(f"{'borough':<14}" + "".join(f"{t+'(hop/euc)':<16}" for t in types))
for b in ['Manhattan', 'Bronx', 'Queens', 'Brooklyn', 'Staten Island']:
    cells = []
    for t in types:
        hs, es = [], []
        for d in [x for x in ds if x['borough'] == b]:
            h = hops_to_type(d['id'], t); hs.append(h if h is not None else 99)
            e = min(dist(d, s) for s in speak if s['pour'] == t); es.append(e)
        cells.append(f"{sum(hs)/len(hs):.1f}/{sum(es)/len(es):.0f}")
    print(f"{b:<14}" + "".join(f"{c:<16}" for c in cells))

# ---- 3. The painful away-trips: each borough's MISSING type ----
print("\n=== The away-trip each home borough is forced into (its missing channel) ===")
for b in ['Manhattan', 'Bronx', 'Queens', 'Brooklyn']:
    row = grid[b]
    for t in types:
        if t not in row:
            # nearest market of that type to this borough's centroid
            cds = [d for d in ds if d['borough'] == b]
            cx = sum(d['x'] for d in cds)/len(cds); cy = sum(d['y'] for d in cds)/len(cds)
            nearest = min((s for s in speak if s['pour'] == t),
                          key=lambda s: math.hypot(s['x']-cx, s['y']-cy))
            print(f"  {b:<10} cannot sell {t:<10} at home -> nearest is {nearest['name']} ({nearest['borough']})")
