#!/usr/bin/env python3
"""
Moonshine Kingdom v5.4 - Brew Engine Monte Carlo (isolated Shadows Phase)
=========================================================================
Question: build a 3-still production "engine" all on one number, each still
manned by a crew of 5 (Muscle Ratio 3 -> 3 barrels / fire, 3 dead / blowback).
With 15 Runners total, 3 stills x 5 crew = the whole army.

Which still NUMBER + liquor TIER gives the best $/Day once you pay for the
blowback (lost Runners @ $300, re-Tap @ $200, re-cap to restore the tier)?

Component facts honoured (Rules v5.4 + Still Tokens sheet):
  * Still bag: 3x {2,7,12}, 2x {3..6,8..11}  -> 3-stacks only on 2,7,12.
  * Pier numbers on the 8 Docks: 1,1,2,3,4,5,6,6.
  * Shadows roll: 1 White (public mash) + (players+1) Red.
  * In turn order each boss drafts 1 Red. Brew# = drafted Red + a mash you
    pick (a Pier you control, OR the public White). Every face-up Still you
    control matching Brew# fires -> Muscle Ratio barrels each.
  * Blowback# = White + the single leftover Red. Communal: every face-up
    controlled Still matching it is hit.
      - Whisky still: pops yellow cap -> reverts to Gin (no deaths).
      - Gin still:    pops pink cap  -> reverts to Moonshine (no deaths).
      - Moonshine still: Muscle-Ratio casualties (Runners first), flips
        face-down (dead until re-Tapped).
  * Values: Whisky 500 / Gin 300 / Moonshine 200 per barrel.
  * Repair-to-tier costs charged on a hit (maintained-engine model, so
    steady-state output is constant):
      Whisky hit -> re-Perfect 500/still
      Gin    hit -> re-Refine  300/still
      Moon   hit -> 3 Runners @300 + re-Tap 200 = 1100/still
"""
import random

VALUE   = {'moon': 200, 'gin': 300, 'whisky': 500}
SETUP   = {'moon': 200, 'gin': 500, 'whisky': 1000}      # one-time rig cost / still
REPAIR  = {'moon': 3*300 + 200, 'gin': 300, 'whisky': 500}  # blowback repair / still
BARRELS = 3      # crew of 5 -> Muscle Ratio brew = 3
DEAD    = 3      # crew of 5 -> Muscle Ratio dead = 3 (informational; folded into REPAIR['moon'])

d6 = lambda: random.randint(1, 6)


def pier_for(N):
    """The single best Pier to control for an engine on number N (red = N - P in 1..6)."""
    return max(1, min(6, N - 1))


def simulate(N, tier, count, players=4, days=300_000, seed=0):
    """One focal mob runs `count` stills, all number N, tier `tier`, crew 5 each.
    Opponents draft a uniformly-random remaining Red (neutral 'isolated' assumption).
    Returns dict of per-day expectations."""
    rng = random.Random(seed)
    P = pier_for(N)
    n_red = players + 1

    fire_days = blow_days = 0
    revenue = repair = 0

    for _ in range(days):
        white = rng.randint(1, 6)
        pool = [rng.randint(1, 6) for _ in range(n_red)]

        # Red values that FIRE the engine: via private pier (N-P) or public White (N-white)
        firing = set()
        if 1 <= N - P <= 6:      firing.add(N - P)
        if 1 <= N - white <= 6:  firing.add(N - white)
        danger = N - white       # leftover Red value that would set Blowback == N

        # Draft: random seat order, focal somewhere in it.
        seats = list(range(players))
        rng.shuffle(seats)
        focal_seat = rng.randrange(players)
        remaining = pool[:]
        focal_fired = False

        for s in seats:
            if s == focal_seat:
                # focal logic
                avail_fire = [r for r in remaining if r in firing]
                if avail_fire:
                    # prefer a firing red that is ALSO the dangerous die (kills two birds)
                    pick = danger if danger in avail_fire else avail_fire[0]
                    remaining.remove(pick)
                    focal_fired = True
                elif danger in remaining:        # can't fire -> defuse own blowback
                    remaining.remove(danger)
                else:
                    remaining.pop(rng.randrange(len(remaining)))
            else:
                remaining.pop(rng.randrange(len(remaining)))  # opponent: random grab

        leftover = remaining[0]
        blowback = white + leftover

        if focal_fired:
            fire_days += 1
            revenue += count * BARRELS * VALUE[tier]
        if blowback == N:
            blow_days += 1
            repair += count * REPAIR[tier]

    net = (revenue - repair) / days
    return {
        'N': N, 'tier': tier, 'count': count, 'players': players,
        'fire_pct': 100 * fire_days / days,
        'blow_pct': 100 * blow_days / days,
        'gross': revenue / days,
        'repair': repair / days,
        'net': net,
        'setup': count * SETUP[tier],
    }


def table(rows, title):
    print(f"\n=== {title} ===")
    print(f"{'engine':<26}{'fire%':>7}{'blow%':>7}{'gross/d':>10}{'repair/d':>10}{'NET/d':>9}{'setup':>8}")
    for r in rows:
        name = f"{r['count']}x #{r['N']:<2} {r['tier']}"
        print(f"{name:<26}{r['fire_pct']:>6.1f}%{r['blow_pct']:>6.1f}%"
              f"{r['gross']:>9.0f}{r['repair']:>9.0f}{r['net']:>8.0f}{r['setup']:>8}")


if __name__ == '__main__':
    PLAYERS = 4
    DAYS = 300_000

    # 1) The three 3-stackable numbers x three tiers (the real candidate engines)
    rows = []
    for N in (2, 7, 12):
        for tier in ('whisky', 'gin', 'moon'):
            rows.append(simulate(N, tier, 3, PLAYERS, DAYS, seed=N*10+hash(tier) % 7))
    table(rows, f"3-STILL ENGINES ({PLAYERS}p) - only 2/7/12 have 3 tokens")

    # 2) Whisky across every number (2-still engines for non-3-stackable), per-still normalised
    rows2 = []
    for N in range(2, 13):
        cnt = 3 if N in (2, 7, 12) else 2
        rows2.append(simulate(N, 'whisky', cnt, PLAYERS, DAYS, seed=N))
    table(rows2, f"WHISKY by NUMBER ({PLAYERS}p) - shows the blowback gradient")
    print("  per-still NET/day:", "  ".join(f"#{r['N']}:{r['net']/r['count']:.0f}" for r in rows2))

    # 3) Moonshine break-even: same engines, all three tiers, side by side per number
    print("\n=== MOONSHINE vs GIN vs WHISKY (NET/day, same number & count) ===")
    print(f"{'N':>4}{'cnt':>4}{'moon':>9}{'gin':>9}{'whisky':>9}   winner")
    for N in range(2, 13):
        cnt = 3 if N in (2, 7, 12) else 2
        res = {t: simulate(N, t, cnt, PLAYERS, DAYS, seed=N*3) for t in ('moon', 'gin', 'whisky')}
        win = max(res, key=lambda t: res[t]['net'])
        print(f"{N:>4}{cnt:>4}{res['moon']['net']:>9.0f}{res['gin']['net']:>9.0f}"
              f"{res['whisky']['net']:>9.0f}   {win}")
