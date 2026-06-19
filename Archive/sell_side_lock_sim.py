#!/usr/bin/env python3
"""
Moonshine Kingdom - SELL-SIDE model for the proposed "House-Pour Lock"
======================================================================
Rule under test: a Speakeasy will only buy its own House Pour. To sell Whisky
you must control a Whisky Bar, Gin a Gin Joint, etc. (Currently any Speakeasy
buys any type at street value; matching the pour only adds the Kickback.)

This models one player's DAILY pipeline: produce barrels -> Unload them.
The brew Monte Carlo (brew_engine_sim.py) supplies production; here we ask the
new question: given the channels (Speakeasies) you control, how much can you
actually realise, how much strands, and what does the Kickback economy look like?

Assumptions (all explicit, all tweakable):
  * Crew 5 -> Muscle Ratio 3 barrels / still / fire. Expected barrels/day =
    fire_rate * 3, fire rates from the brew sim (#7~.69, #5/9~.60, #2/12~.46).
  * Rum is smuggled, not brewed: ~1.5/day with 2 Docks + crew 5.
  * Unload = Power Play, <=3 barrels/play stays under the Greed Tax (4+ = Heat).
  * S = Unload Plays/day a player can spare (action opportunity cost). We sweep it.
  * Allocate selling Plays greedily to the highest STREET VALUE sellable type.
  * Kickback (House-Pour match) refunds Influence into empty board slots (cap 5).
    Under the Lock every sale matches -> selling is ~Influence-neutral.
Street values: Whisky 500, Rum 400, Gin 300, Moonshine 200.
"""

VALUE = {'whisky': 500, 'rum': 400, 'gin': 300, 'moon': 200}
CAP   = 3          # safe barrels per Unload Play (4+ triggers Greed Tax/Heat)


def day(production, channels, lock, S):
    """production: {type: barrels/day}. channels: {type: #speakeasies controlled}.
       lock: True = House-Pour Lock, False = current free-sale rules.
       Returns realised $, stranded barrels, and Kickback Influence refunded."""
    plays = S
    revenue = 0.0
    sold = {t: 0.0 for t in production}
    # what can each type be sold AT?  Lock: only matching channel. Free: any speakeasy.
    any_channel = sum(channels.values()) > 0
    for t in sorted(production, key=lambda t: -VALUE[t]):
        if plays <= 0:
            break
        sellable = (channels.get(t, 0) > 0) if lock else any_channel
        if not sellable:
            continue
        want = production[t] - sold[t]
        while plays > 0 and want > 1e-9:
            n = min(CAP, want)
            sold[t] += n
            revenue += n * VALUE[t]
            want -= n
            plays -= 1
    stranded = sum(production[t] - sold[t] for t in production)
    total_sold = sum(sold.values())
    # Kickback: matched barrels refund Influence (cap by board slots ~5/day).
    matched = total_sold if lock else sum(
        sold[t] for t in sold if channels.get(t, 0) > 0)
    kickback = min(matched, 5)
    return revenue, stranded, total_sold, kickback


SCENARIOS = {
    'Mono-Whisky  + owns Whisky Bar': (dict(whisky=6.0),                         dict(whisky=1)),
    'Mono-Whisky  + NO Whisky Bar  ': (dict(whisky=6.0),                         dict(gin=1)),
    'Diversified  + one of each chan': (dict(whisky=2.0, gin=2.0, moon=2.0, rum=1.5), dict(whisky=1, gin=1, moon=1, rum=1)),
    'Diversified  + only W+G channel': (dict(whisky=2.0, gin=2.0, moon=2.0, rum=1.5), dict(whisky=1, gin=1)),
}

if __name__ == '__main__':
    for S in (2, 3):
        print(f"\n========== Unload Plays/day S={S} ==========")
        print(f"{'strategy':<33}{'rule':<8}{'$/day':>8}{'sold':>6}{'strand':>8}{'kick(Inf)':>10}")
        for name, (prod, chan) in SCENARIOS.items():
            for lock in (True, False):
                rev, strand, sold, kick = day(prod, chan, lock, S)
                tag = 'LOCK' if lock else 'free'
                print(f"{name:<33}{tag:<8}{rev:>8.0f}{sold:>6.1f}{strand:>8.1f}{kick:>10.1f}")
            print()

    # Trade-pressure read-out: stranded barrels = structural supply seeking a buyer.
    print("== TRADE PRESSURE under the Lock (stranded barrels/day = trade supply) ==")
    for name, (prod, chan) in SCENARIOS.items():
        _, strand, _, _ = day(prod, chan, True, S=3)
        note = ''
        if strand > 0:
            shed = [t for t in prod if chan.get(t, 0) == 0]
            note = ' -> wants a buyer for: ' + ', '.join(shed)
        print(f"  {name}: {strand:.1f} barrels/day stranded{note}")
