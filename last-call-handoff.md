# Last Call: a variable ending (proposal, not implemented)

**Status: open, 2026-09-23.** Nothing here is in any component. Nick wants to think it through
before any rules text is written. Do not implement it without Nick asking.

## The idea

Reaching today's win test (20 Respect, Solvent, Boss on the board) no longer ends the game. It
**calls Last Call**. From then on the game can end at any Sunset, on a roll that gets likelier
each night. When the Commission sits, it seats the qualifying boss with the most Respect.

Nick's intent is for this to become **the main mode for 3 to 4 players**, with the Blood Oath
sitting on top of it and **40 combined Respect** as its trigger.

Why:

- **Three-player kingmaking** (see the open thread in `CLAUDE.md`). Kingmaking needs a known last
  turn. Today everyone can see the Sunset coming where a boss crosses 20, and the player who can't
  win decides whether to stop them. Under Last Call nobody knows which Sunset is the last, so a
  trailing boss can't be sure they are out, and keeps playing to win.
- **A comeback.** Under the current rules a lead is close to permanent (see the facts below), so
  the first boss to 20 usually just wins. Last Call gives the others a few Days to overtake.

What it does not do: it doesn't abolish kingmaking. A trailing boss can still decide whose Boss to
hit. It blunts it, because they can't know which night counts. The honest claim is "leader-bashing
instead of kingmaking", which is the better problem, since everyone at the table is still playing
to win.

## Facts the design leans on

Checked against the Rulebook on 2026-09-23.

- **No Play lowers a rival's Respect.** Respect is completed Jobs, plus the Nod, less 2 for the Rat
  Card and 1 per Welsher. Completed Jobs never leave the pile, Bribed Influence markers are
  permanent (so the Nod stays), the Rat Card sits with whoever Ratted last, and a Welsher lands on
  the boss who broke the Handshake. Ratting even *helps* a leader who holds the Rat Card, since it
  takes the card off them. So during Last Call the others have exactly two routes: **out-score**
  the leader (Jobs, a late Nod) or **disqualify** them on the night it ends.
- **Disqualification is short-lived.** Rise is one Play (Boss into any Safe Ward), unless the table
  holds every Ward he could use, which the Almanac now teaches (lesson 22). Square Up is
  $2,000 and one Play per Mark (Beg is "one deal per visit"). A boss who has Laid Low still
  defends their turf, so a Boss killed after its owner Lays Low stays dead until tomorrow.
- **A tiebreak already exists.** The Final Standoff: most Respect, then the fattest bankroll,
  including the loose change printed on the Playbook.
- **The Almanac already teaches the late hit.** Lesson 34: post the bounty late, when the leader
  has Laid Low or is too spent to Rise before the books open. Under Last Call that stops being a
  one-night trick and becomes the endgame.

## The shape so far (for discussion, not rules text)

1. **The Call.** The first Sunset a boss passes today's win test, they don't win: Last Call is
   called.
2. **The roll.** At each Sunset after the Call, roll the Last Call timer (see loose end 2). If it
   says the Commission sits, the game ends.
3. **The seat.** The Commission seats the boss with the most Respect among those who are Solvent
   with a Boss on the board. Ties go to the Final Standoff.
4. **It never closes.** Once called, Last Call stays called, even if the caller drops below 20.

## Loose ends

### 1. Nobody qualifies when the Commission sits

Nick's question: on the final roll, every boss has either a Shylock's Mark or an empty chair.

- **(a) Postpone.** *Current lean.* The Commission has been called; it sits at the first Sunset
  anyone qualifies. No more rolls: the next Sunset where any boss passes the Solvent and Boss test
  ends the game, and the most Respect among them wins. Both bars clear in one Play (Rise, or
  Square Up with $2,000), so this normally costs a single Day, and that Day is a race to square up
  and Rise, which is good drama. The risk is a stall: everyone broke and in hock at once. Shylock
  holds only 7 Marks and cash keeps coming from Collect, so a long stall needs every boss short of
  $2,000 a Mark for several Days. Unmeasured.
- **(b) Most Respect wins regardless.** Simplest to state. But it makes disqualification
  worthless on the one night it matters, and it rewards a boss who wrecks everyone's eligibility,
  their own included.
- **(c) Turn the bars into Respect penalties at the end** (so much per Mark, so much for an empty
  chair). Every Sunset stays decisive, but it rewrites Solvency and needs numbers from a table.
  The most work.

A related question: **does the winner still need 20?** If a 23-Respect leader loses their Boss on
the final night, does the boss on 14 take the seat? Lean: yes, most Respect among the qualifiers,
no floor. That is where the late hit gets its teeth, and it is the comeback. A floor (the winner
must also hold 20) turns every disqualification into a delay and sends more games into (a).

### 2. Tracking the Sunsets

The timer has to count Sunsets since the Call without anyone having to remember. Four candidates.
The odds are exact arithmetic, not playtest.

| Timer | What does the counting | Ends on Sunset 1 / 2 / 3 / 4 / 5 / 6+ | Average |
| --- | --- | --- | --- |
| One die, ends on a 1 | nothing to count | 17 / 14 / 12 / 10 / 8 / 40% | 6 Sunsets |
| One die, ends on "Sunsets since the Call" or lower | a marker on a six-box track | 17 / 28 / 28 / 19 / 8 / 2% | 2.8 |
| **Growing pool**: add a die each Sunset, roll them all, any marked face ends it | the dice themselves | 17 / 25 / 24 / 17 / 10 / 6% | 3.0 |
| Countdown deck: six cards, one "the Commission sits", flip one per Sunset | the discard pile | 17% each, never past 6 | 3.5 |

- The **flat die** is out: 40% of games run six or more Sunsets past the Call, and one in ten run
  past twelve. Nobody has timed a Day yet, so that tail could be hours.
- **Growing pool** is the current lean. It counts itself (the number of dice on the table is the
  number of Sunsets), it escalates without a rule to remember, and it takes the custom die Nick
  floated: six dice with one face marked (the Commission's table). It needs its own dice, since a
  pool that sits out between Sunsets can't borrow the White or Red dice the Day needs. On a
  seventh Sunset or later (about 2% of games) keep rolling all six.
- The **six-box track** is the fallback: print the ending numbers in the boxes (1, 1 to 2, 1 to 3,
  and so on) and roll any spare die. It needs a card or a strip. In a Blood Oath game the Federal
  Crackdown Tracker sits idle after the Sit-Down and could carry it, but not if Last Call is called
  before the Sit-Down (see 5).
- The **countdown deck** is the most thematic (flavour lines on the blanks: "Not tonight", "Park
  Central, eight o'clock") but its odds are flat and it is another deck to print.

### 3. Does the Sunset of the Call roll?

Lean: **no**. The first roll comes the Sunset after the Call, so everyone gets at least one full Day
to answer it. Rolling on the night of the Call ends one game in six the old way, on the Sunset the
leader crossed 20, which is the kingmaking moment this is meant to remove.

### 4. What calls it

- **(a) The full win test** (20 Respect, Solvent, Boss on the board). *Lean.* Today's win becomes
  the Call, so everything that teaches the road to 20 stays true.
- **(b) 20 Respect alone.** Simpler to check, but a boss in hock at 20 would start a clock they
  can't yet win.

### 5. The Blood Oath on top

Today the Blood Oath is a free-for-all until the Federal Crackdown Tracker reaches 10; then the
Sit-Down pairs 1st with 4th and 2nd with 3rd, and both Alliances race to 40 combined. Open:

- **Can a single boss call Last Call before the Sit-Down?** If so, what happens when the Tracker
  reaches 10 during Last Call? Options:
  - (i) the Sit-Down still happens and the running Last Call switches to Alliance scoring;
  - (ii) the Call stops the Tracker, so there is no Sit-Down;
  - (iii) nobody can call Last Call before the Sit-Down; only an Alliance at 40 can.

  (iii) is the cleanest, and it keeps the pairing's purpose: a boss at 20 before the Sit-Down gets
  paired with 4th place. But it needs the Sit-Down to arrive reliably, and nobody has measured how
  often Raids fire.
- **Eligibility and "nobody qualifies"**: the same rules at Alliance level (both partners Solvent,
  at least one Boss on the board).
- **The Capo di Tutti Capi** rule (whoever contributed more Respect) can stay as it is.

### 6. Game length

Last Call adds Days after the old finish: about three on average with the escalating timers.
Nobody has timed a Day, so nobody can say what that is in minutes. If games run long, the dial is
the trigger (call at 15 or 18 instead of 20), but that changes what Jobs and the Nod are worth
against the target. Time a game first.

### 7. Watch in playtest

- **Is there Respect left to take late?** Last Call is only a comeback if the trailing bosses can
  still score. `jobs-system-handoff.md` §8.1 already asks whether a trailing player has any route
  to Respect once the 1s leave the Market; under Last Call that question decides whether it works.
- **Does the leader turtle?** Once they've made the Call, the leader's best plan may be to guard
  the Boss and the cash. If Last Call Days are dull, that's why.
- **Is it 2 against 1 every game at three?** That is leader-bashing, which is players playing to
  win, but it may feel bad for the boss who earned the Call.
- **Is losing on a roll anticlimactic?** The Call is earned; the ending isn't.
- **The Nod as the comeback.** A late Nod is a 10-point swing in one Bribe. It may decide more
  Last Calls than Jobs do.
- **Does the late Boss hit become the only endgame?**

## Names

- **Last Call** for the clock: the barman's warning suits a game about Speakeasies.
- **"The Commission sits"** for the end.
- Not "the Sit-Down": that is already the Blood Oath's pairing event.

## If it ships, what changes

The "first to 20 wins" wording will try to survive as reassurances, so read the ghost rule in
`CLAUDE.md` before the pass.

- **Rulebook**: the front page ("The Only Crown Worth Having"), The Commission, the Sunset Win
  Check, Winning the Game (Solvency, The Chair, The Final Standoff), the Blood Oath's Claiming the
  Empire, and the component list if dice or a card are added.
- **Town Planner** quick reference and the **Federal Crackdown Tracker** strip (its "race for 40"
  line).
- **The Almanac**: lessons 14, 22, 32, 33 and 34 are built on crossing 20 as the finish. Rewrite
  the argument, not just the numbers.
- **Cards**, if the timer is a card or a deck.
- **`CLAUDE.md`** ("The crown needs 20 Respect and Solvency") and **`mk-online-rules-sync.md`**.

## Reproducing the odds

```python
def timer(ends):  # ends[k] = chance the (k+1)th Sunset after the Call ends it
    alive, out = 1.0, []
    for p in ends:
        out.append(alive * p); alive -= alive * p
    return out

timer([1/6] * 60)                                      # one die, ends on a 1
timer([k/6 for k in range(1, 7)])                      # one die, escalating
timer([1 - (5/6) ** min(k, 6) for k in range(1, 60)])  # growing pool of six
timer([1/(6 - k) for k in range(6)])                   # countdown deck of six
```
