# -*- coding: utf-8 -*-
"""Overlap BREADTH audit for the Jobs deck.

Nick's rule (2026-07-19): a small overlap is a FEATURE. Spotting it, drafting
both cards one Offer at a time, carrying both stakes for two-plus Days and then
landing the Play that pays both is good play. What is broken is a swing you fall
into by luck — so the test is not "is the stack guaranteed?" but:

    HOW MANY DISTRICTS can this set of cards co-fire in?

<= 2 districts  -> you had to engineer it. Feature.
 > 2 districts  -> it finds you. Flag it.

Enumeration and physical constraints mirror overlap_audit.py.
"""
import io, itertools, os, re, sys, contextlib
from collections import defaultdict

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
os.chdir(ROOT)
src = open(os.path.join('tools', 'overlap_audit.py'), encoding='utf-8').read()
prefix = src[:src.index('seen = {}')].replace(
    'sys.stdout.reconfigure', 'getattr(sys.stdout, "reconfigure", lambda **k: None)')
ns = {'__name__': 'oa', '__file__': os.path.join(ROOT, 'tools', 'overlap_audit.py')}
buf = io.StringIO()
with contextlib.redirect_stdout(buf):
    exec(compile(prefix, 'overlap_audit.py', 'exec'), ns)
print(buf.getvalue().strip())

JOBS, DS, VERB_BOOLS, ALL_BOOLS = ns['JOBS'], ns['DS'], ns['VERB_BOOLS'], ns['ALL_BOOLS']
STAKE, ST = ns['STAKE'], ns['ST']

BARRELS, RUNNERS, KILLS, DEFENDERS = (0, 3, 4, 6, 8), (0, 4, 5, 6), (0, 2, 3, 5), (0, 5)

respect = {j['name']: j['respect'] for j in JOBS}
# set-of-cards -> {districts where it can co-fire}
districts_for = defaultdict(set)
# card -> {districts where it can fire at all}, for the solo breadth table
solo = defaultdict(set)

for verb, bools in VERB_BOOLS.items():
    jobs_v = [j for j in JOBS if j['verb'] == verb]
    for d in DS:
        for barrels in BARRELS:
            for runners in RUNNERS:
                for kills in KILLS:
                    for defenders in DEFENDERS:
                        for combo in itertools.product((False, True), repeat=len(bools)):
                            p = {b: False for b in ALL_BOOLS}
                            p.update(dict(zip(bools, combo)))
                            p.update(d=d, barrels=barrels, runners=runners,
                                     kills=kills, defenders=defenders)
                            if p['seize'] and p['defenseless']: continue
                            if p['boss_killed'] and kills < 1: continue
                            if p['rival_safehouse'] and p['defenseless']: continue
                            if p['takeover'] and not p['rival_safehouse']: continue
                            if p['from_staten_dock'] and d.boro == ST: continue
                            if p['seize'] and defenders == 0 and kills == 0: continue
                            if p['defenseless'] and p['hostile']: continue
                            if p['williamsburg_bridge'] and d.name not in ('Williamsburg', 'Five Points'): continue
                            if p['from_staten_dock'] and p['origin_press5']: continue
                            if p['rival_deed'] and d.boro == ST: continue
                            if p.get('own_deed') and d.boro == ST: continue
                            if p['across_water'] and p['williamsburg_bridge']: continue
                            fired = tuple(sorted(j['name'] for j in jobs_v if j['fn'](p)))
                            for n in fired:
                                solo[n].add(d.name)
                            if len(fired) >= 2:
                                districts_for[fired].add(d.name)

rows = []
for names, dists in districts_for.items():
    tot = sum(respect[n] for n in names)
    stake = sum(STAKE[respect[n]] for n in names)
    if stake > 8:      # handoff: ~8 markers is the real stake ceiling
        continue
    rows.append((len(dists), tot, stake, names, sorted(dists)))

print()
print('=' * 92)
print('CO-FIRING SETS BY BREADTH   (>2 districts = flag; <=2 = engineered, keep)')
print('=' * 92)
for nd, tot, stake, names, dists in sorted(rows, reverse=True):
    if nd <= 2:
        continue
    where = ', '.join(dists) if nd <= 6 else f'{nd} districts'
    print(f'  {nd:2} districts | {tot:2} Respect | stake {stake} | {" + ".join(names)}')
    print(f'               {where}')

narrow = [r for r in rows if r[0] <= 2]
print()
print('=' * 92)
print(f'ENGINEERED (<=2 districts): {len(narrow)} sets — these are the feature, left alone')
print('=' * 92)
for nd, tot, stake, names, dists in sorted(narrow, key=lambda r: -r[1])[:14]:
    print(f'  {nd:2} district(s) | {tot:2} Respect | {" + ".join(names):58} @ {", ".join(dists)}')

print()
print('=' * 92)
print('SOLO BREADTH — how many districts each card can fire in')
print('=' * 92)
for n, ds in sorted(solo.items(), key=lambda kv: -len(kv[1])):
    if len(ds) >= 8:
        print(f'  {len(ds):2} districts  {n} ({respect[n]})')
