# -*- coding: utf-8 -*-
"""Overlap BREADTH audit for the Jobs deck.

Nick's rule (2026-07-19): a small overlap is a FEATURE. Spotting it, drafting
both cards one Offer at a time, carrying both stakes for two-plus Days and then
landing the Play that pays both is good play. What is broken is a swing you fall
into by luck. So the test is not "is the stack guaranteed?" but:

    HOW MANY DISTRICTS can this set of cards co-fire in?

<= 2 districts  -> you had to engineer it. Feature.
 > 2 districts  -> it finds you. Flag it.

The model (Districts, Jobs, every legal Play) lives in overlap_audit.py and is
imported here. Until 2026-10-10 this file re-implemented the enumeration and had to be
kept in step by hand; it drifted at least once (2026-08-04), so it no longer does.
"""
import os
import sys

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import overlap_audit as oa  # noqa: E402

oa.check_drift()
JOBS, STAKE = oa.JOBS, oa.STAKE
respect = {j['name']: j['respect'] for j in JOBS}
sets, solo = oa.co_firing()

# set-of-cards -> {districts where it can co-fire}, across every kind of Play
districts_for = {}
for (verb, names), dists in sets.items():
    districts_for.setdefault(names, set()).update(dists)

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
print(f'ENGINEERED (<=2 districts): {len(narrow)} sets; these are the feature, left alone')
print('=' * 92)
for nd, tot, stake, names, dists in sorted(narrow, key=lambda r: -r[1])[:14]:
    print(f'  {nd:2} district(s) | {tot:2} Respect | {" + ".join(names):58} @ {", ".join(dists)}')

print()
print('=' * 92)
print('SOLO BREADTH: how many districts each card can fire in')
print('=' * 92)
for n, ds in sorted(solo.items(), key=lambda kv: -len(kv[1])):
    if len(ds) >= 8:
        print(f'  {len(ds):2} districts  {n} ({respect[n]})')

# --- LIVENESS ---------------------------------------------------------------
# Added 2026-08-04 after a rewritten card shipped that COULD NOT FIRE. The
# counterplay pass gave The Empty Casket "Rise in a Ward a rival Controls",
# which is impossible two ways over: Control transfers the instant you win the
# fight (so it is false at its own checkpoint), and Rise only ever places the
# Boss in a SAFE District. Nick caught it by reading the card; every audit
# passed it, because the model encoded the same impossibility and a predicate
# that is never true simply never appears in any co-firing set.
#
# THIS IS THE HANDOFF'S "silent zero is not a pass" RULE, GENERALISED: the
# overlap and breadth audits only ever report cards that DO fire, so a dead card
# is invisible to both by construction. The enumeration above already visits
# every legal board state, so liveness is free: a card that never landed in
# `solo` cannot fire anywhere on the board.
#
# NOTE this checks the MODEL, not the card text -- it catches a predicate that
# is unsatisfiable, not one that is satisfiable here but barred by the Play's
# own rules. Always also read the objective against the Playbook entry for its
# verb (that is what "Place your Boss in any Safe District" would have told you).
print()
print('=' * 92)
print('LIVENESS: can each card fire at all? (a dead card is invisible to the audits)')
print('=' * 92)
dead = [j['name'] for j in JOBS if not solo.get(j['name'])]
if dead:
    for n in dead:
        print(f'  !! DEAD: never fires anywhere on the board: {n} ({respect[n]})')
    raise SystemExit(f'\n{len(dead)} unfirable card(s). Fix before printing.')
print(f'  PASS: all {len(JOBS)} cards can fire in at least one district.')
