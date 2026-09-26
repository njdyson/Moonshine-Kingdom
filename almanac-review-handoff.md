# The Almanac: combat stress test and revision

Status (2026-09-26): **applied.** Nick accepted the whole proposal the same day and is reading
the result one lesson at a time; The Almanac is now the text of record, so the draft prose that
used to sit in this file has been removed. What remains is the evidence (section 1), the map
of what changed (section 2), and the design observations it turned up (section 4). Every combat
figure reproduces with

```
node tools/sim_almanac_combat.js          # about a minute
node tools/sim_almanac_combat.js --quick  # seconds, noisier
```

The script rebuilds the fight loop from the Combat Simulator's own primitives (via
`tools/sim_core.js`), because the questions here need two policies the simulator doesn't have:
an Occupier who Holds Fire instead of Ambushing, and a volley budget per fight. Its section 0
checks the rebuilt loop against `simulateTrial` (84% / 60% / 49% on the Almanac's own rows, exact
match). A dead Runner is priced at $300, the cost to hire him again; the walk back only makes
folding look better.

## The short version

- **Cut three lessons and folded three pairs together** (33 to 30): the free 3 in your back yard,
  Staten Island, and "Eat the 1s" go; the cop's reach, the rival's handshake and the 1s survive
  as a line or a paragraph inside their neighbours.
- **The Gun grows by one lesson and gets sharper numbers.** A two-man picket falls to your Boss
  and three; a three-man picket costs twice that. A two-man picket should almost never Ambush,
  which is why "sitting duck" matters at three men, not two. And there's a clean answer to "when
  is folding right even with barrels on the block": nearly always against a Boss-led raid,
  because the barrels go either way.
- **The endgame lesson splits in two**: one for the leader (walk in first, buy the Nod last) and
  one for the table (watch his Boss, not his Nod). The numbers say the one-turn warning is real
  but rarely enough: a Boss dug into a room is near-proof against anything but a Sicilian Hit.
  The table's window is the walk, not the Nod.
- **Two corrections to what the book says now**: the fortress table hides that your own Boss
  dies 91% of the time at even numbers, and lesson 32's Blowback bullet implies more than a
  Blowback can do (it can't kill a Boss with a Runner beside him; it strips his guards).
- **A few named ideas** to hang the chapter on: sitting duck, picket, the toll, the walk, and
  the last man up.

---

## 1. What the stress test found

Lesson numbers in this section are the old 33-lesson book's; section 2 maps them to the new.
All fights: no Boss or Safehouse defending unless stated, up to 3 volleys. "Live" means the
Occupier Ambushes; "duck" means he can't (spent out, Laid Low) or won't (Holds Fire).

### 1.1 How many men take a picket

| Raid | vs 2 Runners (live / duck) | vs 3 Runners (live / duck) |
| --- | --- | --- |
| 3 Runners | 37% / 54% | 6% / 17% |
| 5 Runners | 72% / 81% | 30% / 49% |
| 8 Runners | 93% / 94% | 72% / 80% |
| Boss + 2 | 60% / 80% | 15% / 41% |
| Boss + 3 | 84% / 88% | 37% / 58% |
| Boss + 4 | 92% / 96% | 60% / 82% |
| Boss + 5 | 97% / 98% | 78% / 88% |
| Boss + 6 | 99% / 99% | 89% / 96% |

Reads:

- **Two men fall to your Boss and three** (84% live, 88% duck, about one body). **Three men
  cost twice as much**: the Boss and five (78% / 88%) or six (89% / 96%). The third man is a
  second die, and a second die is an Ambush worth firing.
- **The Boss is worth about three Runners against a three-man picket** (Boss + 5 at 78% beats
  8 Runners at 72%). The Almanac's current line ("three men with the Boss beat five without
  him") understates it.
- **Count to five.** Five bodies roll three dice; the sixth only stands in front of them.
  Against a two-man duck: 4 Runners 64%, 5 Runners 81%, 6 Runners 85%.
- **Volleys**: at two volleys the Boss and four take a two-man duck 86%, and a three-man duck
  57%. Two-volley raids work on twos, not threes.

### 1.2 Would a picket Ambush? (Nick's hunch is right)

Hold chance for the picket, Hold Fire vs Ambush, and what the Ambush adds to the raider's dead:

| Picket | Raid | Hold Fire | Ambush | Swing | Raider's extra dead |
| --- | --- | --- | --- | --- | --- |
| 2 Runners | 3 Runners | 45% | 61% | 16 pts | +0.6 |
| 2 Runners | Boss + 3 | 12% | 16% | 4 pts | +0.5 |
| 2 Runners | Boss + 4 | 4% | 8% | 4 pts | +0.6 |
| 3 Runners | 5 Runners | 51% | 69% | 18 pts | +1.1 |
| 3 Runners | Boss + 3 | 41% | 61% | 20 pts | +1.0 |
| 3 Runners | Boss + 4 | 18% | 39% | 21 pts | +1.1 |

Against anything with a Boss, a two-man picket's Ambush buys four points and half a man for a
marker and the Heat. Nobody sensible fires it. Three men with a marker *will* fire, and it's
worth twenty points. So **a two-man picket is a sitting duck all day, spent or not; the duck
window only matters where the picket has three or more**.

### 1.3 The toll: what a picket actually does

A picket doesn't stop a raid. It sends the bill. Markers the raid spends (the Move plus volleys
fired), 3-volley budget:

| Picket | Raid | Markers | Take |
| --- | --- | --- | --- |
| nobody | anything | 1 | 100% |
| 2 Runners | Boss + 3 | 3.1 | 84 to 88% |
| 2 Runners | 5 Runners | 3.1 to 3.3 | 72 to 81% |
| 3 Runners | Boss + 4 | 3.3 to 3.6 | 60 to 82% |

Plus the Heat if the picket Holds Fire. Two men turn a one-marker walk-in into a three-marker
fight with the law's attention on the raider.

### 1.4 Fold or stand: when a pile of barrels is worth fighting for

The insight: **if you stand and lose, the raider takes the barrels anyway.** The pile is gone
either way; the only thing standing buys is your chance to hold. So:

> stand only if **hold chance x (pile + what the block earns)** beats **your dead x $300**
>
> equivalently, the pile must be worth more than **your dead x $300 / hold chance**

| You hold | He brings | Hold (Hold Fire / Ambush) | Your dead | Stand only for a pile over |
| --- | --- | --- | --- | --- |
| 2 Runners | 3 Runners | 45% / 61% | 1.4 / 1.2 | $900 / $600 |
| 2 Runners | 5 Runners | 20% / 28% | 1.8 / 1.7 | $2,700 / $1,800 |
| 2 Runners | Boss + 3 | 12% / 16% | 1.9 / 1.8 | $4,700 / $3,500 |
| 2 Runners | Boss + 4 | 4% / 8% | 2.0 / 1.9 | $15,900 / $7,500 |
| 3 Runners | 5 Runners | 51% / 69% | 2.2 / 1.8 | $1,300 / $800 |
| 3 Runners | Boss + 4 | 18% / 39% | 2.8 / 2.4 | $4,600 / $1,800 |

So a two-man picket facing a Boss and three should fold anything short of about sixteen
barrels of Moonshine. The exceptions are real but narrow:

- **Four Heat.** Hold Fire and let him take the pile: he fires the fifth marker and stands on
  your barrels when the sirens come (lesson 27 already).
- **The block completes his Job.** A Fold hands him a *Seize* as surely as losing does, so a
  block his Job names is worth his Respect on top of its barrels.
- **The flip side, and the counter-intuitive one:** a raider on a *Kill* Job (The Butcher's
  Ledger, The Irish Goodbye, The Toll Booth Trap) is paid in your dead, not your turf. A Fold
  pays him nothing. The Irish Goodbye even requires him to take no Control, so a Fold that
  hands him the block kills the Job outright.

### 1.5 Bringing the Boss

Your Boss dies only when the Runners beside him are gone, so the rule is clean: **take him with
one Runner more than the picket has men, and he dies about one time in twenty** (Boss + 3 into
two: 1%; Boss + 4 into three: 5%; Boss + 5 into four: 2%). Short-handed, he's a coin flip: the
Boss and one into a two-man picket, 44%.

The fortress is worse than the book says. Storming Boss + 3 + Safehouse, 3 volleys:

| You bring | Take | Men you lose | **Your Boss dies** |
| --- | --- | --- | --- |
| Boss + 3 (even numbers) | 1.5% | 3.9 | **91%** |
| Boss + 4 | 8% | 4.5 | 68% |
| Boss + 5 | 23% | 4.8 | 36% |
| Boss + 6 (double) | 49% | 4.6 | 8% |
| Boss + 9 (triple) | 88% | 4.1 | 0% |

And the fourth volley that "buys eight points" (Boss + 5: 23% to 31%) also raises your Boss's
death from 36% to 53%. That belongs in "never grind".

### 1.6 The crown room: one turn to stop it

The Almanac says "you always see it one turn out". True, but what can one turn do? His Boss's
death to one rival's single Play (a Move and three volleys), leader Ambushing:

| His Boss has | Boss + 6 (Open Fire) | Boss + 8 | Sicilian Boss + 6 (Hit) |
| --- | --- | --- | --- |
| nobody | 100% | 100% | 99% |
| 1 Runner | 98% | 100% | 95% |
| 2 Runners | 83% | 96% | 89% |
| 4 Runners | 18% | 52% | 84% |
| 4 Runners + Safehouse | 7% | 34% | 80% |
| 6 Runners + Safehouse | 0% | 1% | 77% |

Reads:

- **On the walk he dies; dug in he doesn't.** A Boss with two men in the open dies 83% to a Boss
  and six. The same Boss behind four men and a Safehouse: 7%.
- **Only the Sicilian Hit reaches a dug-in Boss** (80%). The Hit is the table's one real answer
  in the last turn, and it's for hire.
- **The walk is also where a picket can kill him.** A Boss crossing a rival block can Move in and
  Advance out in one Play (two markers, two blocks) if the picket Holds Fire. If it Ambushes, a
  lone Boss dies half the time to two men and three times in four to three. With even one
  Runner beside him, a two-man picket can't touch him.
- **The Blowback strips the room, it doesn't kill.** It removes the room's Muscle Ratio, Runners
  first: Boss + 4 wakes up as Boss + 1, which a Boss and four then kill 87 to 90% of the time,
  Safehouse or not. His face shows twice in
  the pool about one morning in five at four players (13% at three), and only if the whole
  table leaves it there.
- **The Rat only works on a loud leader.** A Squad targets the freshest marker on the Track in
  its reach; a leader with no marker there is never picked. If he is picked and the room is his
  fattest door in reach, the Scatter moves him out and the Squad padlocks the room. A Sicilian
  with his Safehouse in the room is immune (Untouchable).

### 1.7 Checks on what the book already says

Every existing combat figure reproduced within a point: the fortress table (1.5 / 8 / 23 / 49 /
88%), the picket table (37/54, 72/81, 84/88, 60/82, 6/18, and the loss arrows), "one die kills
half a man", the Irish 8% to 33%, the Hit's two in three, the Vipers' three in four vs one in
four. Two gaps, both fixed in the drafts below:

- Lesson 17 never mentions that the Boss you bring usually dies.
- Lesson 32's "Leave his number in the pool" reads as if the Blowback threatens the Boss. It
  only does if he stands alone.

---

## 2. What changed in The Almanac

| Was | Now | Change |
| --- | --- | --- |
| 1 to 8 | 1 to 8 | unchanged |
| 9, 11 | 9 | "Eat the 1s" folded in as a closing paragraph, now Heat-aware: a Stake of 1 is free at 6 Influence only on a clean Heat Track (Nick's catch; the old lesson 11 said "costs nothing at 6 Influence" flat) |
| 10 | 10 | ends by saving the last Bribe for the day the Boss is in the room (lesson 28) |
| 12, 13 | 11 | the "5 with your name on it" line kept, "seat" dropped (CLAUDE.md reserves it for turn order); the free-3 table cut |
| 14 | | Staten Island cut (the Guide's Four Lanes keeps both lookups) |
| 15 | 12 | "a man holding the Nod" became "the Nod in hand or one Bribe away" |
| 16 | 13 | unchanged |
| 17 | 14 | fortress table gains "Your Boss dies"; the fourth volley's cost to your Boss added |
| 18 | 15 | rewritten: **A picket is a toll, not a wall**, with the picket table (moved here from 19, rows for three-man pickets added) |
| 19 | 16 | rewritten: **Shoot the sitting duck** (the duck that matters has three men) |
| 21 | 17 | Armies that don't march, moved up |
| 20 | 18 | Fold, check or raise: the one-die vs two-dice numbers |
| new | 19 | **Fold what you'd lose anyway**, with the fold table |
| 22 | 20 | the Hit named as the one gun that reaches a Boss dug into a room |
| 23, 24 | 21, 22 | unchanged |
| 25, 26 | 23 | the cop's reach opens Build the bust; the Borough-order warning closes it |
| 27, 28 | 24, 25 | unchanged |
| 29, 30 | 26 | the rival's handshake appended as "Same rule, other end" |
| 31 | 27 | unchanged |
| new | 28 | **Walk in first; buy the Nod last** (the leader's side) |
| 32 | 29 | rewritten: **Watch his Boss, not his Nod**, with the one-turn table |
| 33 | 30 | unchanged; Chapter V gains its "What I've Seen" |

Also: "Before You Go" lists your cash among what's in the open; the Offers "What I've Seen" no
longer has the made man climbing to ten (he stops a Bribe short now); the Figures' closing note
names the sitting duck and the $300 dead man; the Rum table's cross-reference moved to lesson 13.

Two departures from the proposal, both for the page and the reading order:

- **The Gun runs attack, then defence**: fortress, picket, duck, armies, then fold/check/raise and
  fold-what-you'd-lose. The proposal's order overfilled the chapter's third page (101% in a
  headless Chromium render). Lessons that now come before "Fold, check or raise" say "Holds Fire"
  and "Ambush" rather than "checks" and "raises".
- **Lesson 28 says "while you're still a Bribe short"** instead of "at nine Influence", to put the
  why in the sentence: the Nod is what rallies the table, so the walk goes first.

Page check: every page of the Almanac prints on one A4 sheet (16 pages, none over 97%; the old
book was 14). Measured with Playwright's Chromium in print media, the engine behind
`tools/build_pdfs.ps1`, with the Google Fonts served from a local copy: the sandbox's Chromium
can't reach them, and the first measurements, on fallback fonts, overstated some pages. With
the real fonts the Rulebook had two pages spilling onto a second sheet (A Day in the Life and
Heat), both fixed the same day by trimming flavour, 106 words in all; every Rulebook page now
has at least 1.5% to spare, bar the front page, which is sized to the sheet.

---

## 3. The vocabulary

Five named ideas, bolded on first use in the Almanac, each doing work a sentence would otherwise have to do
twice. All fit Rothstein's gambler's voice.

| Term | Means | First use |
| --- | --- | --- |
| picket | a block held by one to three Runners, no Boss or Safehouse | 15 (already used, now defined) |
| the toll | what a picket charges a raid: the Move, two or three volleys, maybe the Heat | 15 |
| sitting duck | a crew that can't Ambush: Ledger spent or Laid Low | 16 (the Guide already uses it) |
| the walk | the Boss's trip to a High Society room, the only time he's cheap to kill | 28 |
| the last man up | the boss still holding markers after the rest have Laid Low | 28 |

Considered and left out: "slow play" (right idea for buying the Nod last, but a second poker
term on top of fold/check/raise starts to read as a gimmick), "dead money" (clashes with "rent"),
and "the even man" (the sim didn't support it: for raiders the odd man who reaches a new die
matters more than the even man who shields one).

---

## 4. For Nick: design observations, not Almanac edits

None of these change a rule. They're what the stress test turned up about the watch items in
`CLAUDE.md`.

1. **The one-turn warning is honest but usually too short.** A qualified leader dug into a room
   (Boss + 4 + Safehouse, a marker for the Ambush) dies 7% to a Boss and six in one Play, 34% to
   a Boss and eight. The real warning period is the walk, before the Nod. That fits "the endgame
   has a third act", but it moves the target from "the man with the Nod" to "the man at nine
   near a room". Playtest question: does a table read that?
2. **The Sicilians hold both ends of the endgame.** The Hit is the only in-room answer (80%), and
   Untouchable plus a Safehouse in the room is the only Rat-proof crown room. A Sicilian leader
   dug in is stoppable only on the walk; a Sicilian trailer decides which leader gets stopped.
   At three players that is kingmaking with a gun. Worth watching.
3. **The last man up, quantified.** With rivals Laid Low, a boss at 9 Influence and 5 Respect,
   holding **Opening Night** (8+ Rum at one High Society Venue), with the Rum and his Boss in the
   room, two markers left, $1,000, clean books and the Track below four (the pour draws the Greed
   Tax), can chain Unload (5 Respect, $4,000, Kickbacks refill the Ledger), Bribe and Take the
   Crown with nobody able to answer. With Whispers, the Vipers can hold that Job face-down. This is
   the "win from nowhere" the Coronation was rejected for; the Crown Play closes it only while
   rivals are still up. (Nick's ruling, 2026-09-26: an Unload's own two markers are spent before
   its Kickbacks land, so two markers and five Rum take the Ledger to zero and refill it to five.
   The Rulebook's turn box lists "Pay the cost" after the Play resolves, which a literal reader
   could take the other way, so the Unload entry now says it outright.)
4. **Moving through a rival block.** A crew can Move into a block and Advance out in one Play for
   two markers if the Occupier Holds Fire: two blocks in one turn. It's rules-consistent (Hold
   Fire lets a passer-by through, as the Guide says) and it makes the Ambush the only answer
   that taxes a walking Boss. Not a problem, but nothing player-facing says it.
5. **Cash is open** (Nick, 2026-09-26). It sits on the table and anyone may ask for a count; the
   Rulebook's Cash entry now says so. So "buy the Nod last" is about attention, not secrecy: the
   table can see a man a Bribe short with $5,000 in front of him, but there's no Nod on the table
   yet to rally them.
