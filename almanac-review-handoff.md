# The Almanac: combat stress test and revision proposal

Status (2026-09-26): **proposal only. The Almanac itself is unchanged.** Everything below is
draft text and findings for Nick to accept, cut or redirect. Every combat figure reproduces with

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

- **Cut three lessons and fold three pairs together** (33 to 30): the free 3 in your back yard,
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

## 2. Proposed shape: 33 lessons to 30

| Now | Lesson | Proposal | New |
| --- | --- | --- | --- |
| 1, 2 | Count your Plays; Your token's a trade | keep | 1, 2 |
| 3 to 8 | The Stills | keep (optional: trim lesson 4's Whitestone paragraph to a clause) | 3 to 8 |
| 9 | The stake is rent | keep, **absorbs 11** as a closing paragraph | 9 |
| 10 | Bribe early | keep, one clause pointing at the new 28 | 10 |
| 11 | Eat the 1s | **merged into 9** | |
| 12 | Your board talks | keep, **absorbs 13's** "a 5 with your name on it" line | 11 |
| 13 | A free 3 in its back yard | **cut** (board lookup, not a lesson; the Guide's Four Lanes keeps it) | |
| 14 | Staten Island | **cut** (same) | |
| 15 | Only deny a card that would crown somebody | keep, fix "holding the Nod" (see 3.9) | 12 |
| 16 | Pour Rum late, and in batches | keep | 13 |
| 17 | Never walk into even numbers | keep, **add the Boss-dies column** | 14 |
| 18 | The fight you'll win is against a picket | **rewrite**: A picket is a toll, not a wall | 15 |
| 19 | Hit him when his Ledger's empty | moves after 20 | |
| 20 | Fold, check or raise | light edit (the numbers for one die vs two) | 16 |
| 19 | (rewrite) | **Shoot the sitting duck** | 17 |
| new | | **Fold what you'd lose anyway** | 18 |
| 21 | Armies that don't march | keep | 19 |
| 22 | Know your family's edge | keep, one line on the Hit as the crown-stopper | 20 |
| 23, 24 | The law counts Plays; freshest name | keep | 21, 22 |
| 25 | A cop can only reach one block | **merged into 26** as its opening | |
| 26 | Build the bust yourself | keep, absorbs 25 | 23 |
| 27, 28 | Four Heat; Sometimes you want the sirens | keep | 24, 25 |
| 29 | Promise only what you alone control | keep, **absorbs 30** as a second paragraph | 26 |
| 30 | A rival's handshake is a target | **merged into 29** | |
| 31 | Count his distance from the crown | keep | 27 |
| new | | **Walk in first; buy the Nod last** (the leader's side) | 28 |
| 32 | When a man holds the Nod, his Boss is the target | **rewrite**: Watch his Boss, not his Nod (the table's side) | 29 |
| 33 | The Blood Oath | keep | 30 |

Chapter counts: Sit Down 2, Stills 6, Offers 5 (was 8), Gun 7 (was 6), Law 5 (was 6), Table 5.

---

## 3. Draft text

Written to drop into the HTML as it stands. **Bold** marks a named idea on first use.

### 3.1 Lesson 14. Never walk into even numbers, and never grind. (edit)

Second paragraph and table become:

> Every volley costs a marker, too. Plan to win in two or three. If the door isn't breaking,
> Fall Back. A fourth volley buys you about eight points of odds, costs a Play you could have
> spent anywhere else, and kills your own Boss one time in six more. Bring the old man to a
> fortress short-handed and he's usually one of the men you bury.

| You bring | You take it | Men you lose | Your Boss dies |
| --- | --- | --- | --- |
| Boss + 3 Runners (even numbers) | 1.5% | 3.9 | 91% |
| Boss + 4 | 8% | 4.5 | 68% |
| Boss + 5 | 23% | 4.8 | 36% |
| Boss + 6 (double) | 49% | 4.6 | 8% |
| Boss + 9 (triple) | 88% | 4.1 | 0% |

### 3.2 Lesson 15. A picket is a toll, not a wall. (replaces 18)

> The fortress is the exception: nobody has the men to build more than one. Every other block
> your rival holds is watched by one man, two, three, or nobody, and a **picket** of two won't
> stop anybody who brought five. What it does is send the bill. An empty corner costs you one
> Move. Two men cost you the Move, two or three volleys and, if he checks, the Heat.
>
> So pay **the toll** once, and bring enough to be sure. Against two men, your Boss and three
> take it better than eight times in ten. A third man is a second die, and a second die is an
> Ambush worth firing, so against three you want the Boss and five. And count to five: five
> bodies roll three dice, where the sixth only stands in front of them.
>
> Take the old man, but never short-handed. Your men die before he does, so with one Runner more
> than the picket has men, he's dead about one time in twenty. Walk him in with one Runner
> against two, and it's nearly one in two.

Table (replaces lesson 19's; its right-hand column is where the next-but-one lesson points):

| You bring | Against | He can Ambush | He's spent out | Men you lose |
| --- | --- | --- | --- | --- |
| 5 Runners | 2 Runners | 72% | 81% | 1.3 to 0.7 |
| Boss + 3 | 2 Runners | 84% | 88% | 1.2 to 0.7 |
| Boss + 4 | 2 Runners | 92% | 96% | 1.1 to 0.5 |
| 8 Runners | 3 Runners | 72% | 80% | 2.2 to 1.2 |
| Boss + 4 | 3 Runners | 60% | 82% | 2.3 to 1.2 |
| Boss + 5 | 3 Runners | 78% | 88% | 2.2 to 1.1 |

(In the HTML the loss column keeps its `&rarr;` arrows.)

### 3.3 Lesson 16. Fold, check or raise. (light edit)

Replace the two sentences starting "With two dice or more" with:

> Three men roll two dice, and their Ambush swings a fight twenty points. Two men roll one, and
> theirs kills half a man and moves a Boss-led raid four points, for your marker on the Track.

### 3.4 Lesson 17. Shoot the sitting duck. (replaces 19)

> A man with no marker in his Ledger can't Ambush, and neither can a man who's Laid Low. On the
> street he's a **sitting duck**, and since every Ledger sits on the table, everybody knows it.
> Catch a picket that way and you take it more often, and you bury about half the men doing it.
> The price is that you fire first, so the Heat is yours.
>
> The duck that matters has three men. Two men are a duck all day, spent or not, because no
> sensible man fires one die. Three men with a marker will raise, and it costs you: your Boss and
> four take them six times in ten through the Ambush, eight in ten when the Ledger's dry, and you
> bury one man instead of two. So when three men are left minding something worth owning at dusk
> and the Ledger behind them is empty, that's your afternoon.

### 3.5 Lesson 18. Fold what you'd lose anyway. (new)

> Men hate to fold a block with barrels on it. It feels like handing him the money. But look at
> what happens when you stand and lose: he takes the block, and the barrels, and your men
> besides. The pile goes either way. All that standing buys is your chance to hold, so price it
> like a bet. Take the men you'll bury, at $300 a head to hire again, and divide by your chance
> to hold. A pile worth less than that, you fold.
>
> You'll fold more than you think. Two men facing a Boss and three hold one time in eight and
> bury two doing it: stand only for $4,700, sixteen barrels of swill. Three men with a marker to
> raise hold nearly two times in five against a Boss and four, and six barrels make that stand
> worth it.
>
> Two things beat the arithmetic. At four Heat, check and let him have the pile: he fires the
> fifth marker and he's standing on your barrels when the sirens come. And read his Jobs before
> you answer. A Fold hands him a Seize as surely as losing does, so a block his Job names is
> worth more than its barrels. But a man on a Kill Job is paid in your dead, not your turf, and
> a Fold pays him nothing.

| You hold | He brings | You hold it (Hold Fire / Ambush) | Men you lose | Stand only for a pile over |
| --- | --- | --- | --- | --- |
| 2 Runners | 3 Runners | 45% / 61% | 1.4 / 1.2 | $900 / $600 |
| 2 Runners | 5 Runners | 20% / 28% | 1.8 / 1.7 | $2,700 / $1,800 |
| 2 Runners | Boss + 3 | 12% / 16% | 1.9 / 1.8 | $4,700 / $3,500 |
| 3 Runners | 5 Runners | 51% / 69% | 2.2 / 1.8 | $1,300 / $800 |
| 3 Runners | Boss + 4 | 18% / 39% | 2.8 / 2.4 | $4,600 / $1,800 |

### 3.6 Lesson 20. Know your family's edge. (one line)

In the Sicilian paragraph, after "kills his Boss about two times in three":

> ...and it's the one gun at this table that reaches a Boss dug into a High Society room.

### 3.7 Lesson 28. Walk in first; buy the Nod last. (new, the leader's side)

> I told you to Bribe early. All but the last one. Every man at this table can count to ten, and
> the day you hold the Nod, three bosses stop fighting each other and start hunting your Boss.
> He's never cheaper than on **the walk**: with a man or two around him in the open, a Boss and
> six that reach him finish him eight times in ten. So turn the order round. Walk him into the
> room at nine Influence, dig him in, and buy the tenth judge last. Then the Nod and the crown
> are two Plays on one afternoon, and the table gets one turn to answer.
>
> - **Give the walk a reason.** At eight Influence a 5 costs you no Plays to hold, and every
>   Borough has one that marches an army in: a Boss to kill in Queens, a Safehouse to burn in
>   Manhattan, a five-man block in the Bronx, five bodies in Brooklyn. Let them guard what the
>   card is hunting while the old man turns into the room. If the Job comes off too, so much the
>   better.
> - **Dig him in.** Four men and your Safehouse around him, and a marker kept back for the
>   Ambush, and a Boss and six get to him one time in fourteen. A Sicilian Hit gets to him four
>   times in five, so know where the Sicilians are.
> - **Come in clean and quiet.** Square Up with Shylock the week before: a Mark on the last day
>   costs a Play, $2,000 and your secret. Keep your name off the Heat Track, because a Squad
>   never comes for a man with no marker there, whoever drops the dime. And promise nothing a
>   third man can break: at ten Respect, one Welsher drops you to nine.
> - **Be the last man up.** Once the others have Laid Low they get no more turns, and the Nod
>   and the crown are only four markers.

### 3.8 Lesson 29. Watch his Boss, not his Nod. (replaces 32)

> The crown goes to a man, not a number: he takes it with his Boss standing in a High Society
> room, and the taking is a Play of its own, so you always see it one turn out. One turn is
> rarely enough. A man who knows his business buys the Nod last, with the old man already dug
> in, and a Boss behind four men and a Safehouse shrugs off a Boss and six thirteen times in
> fourteen. Only a Sicilian Hit gets through as a rule. So don't wait for the Nod. Watch the man at nine Influence, with clean books
> and ten Respect, whose Boss is on the move toward a room, and kill him on the walk. The whole
> table has one target, and nobody hits it alone. Split the bill, each of you doing the cheap
> piece.
>
> - **Put out a hit.** Post a cash bounty on his Boss. A dead Boss Rises in a Ward and walks
>   back, and the Rise, the walk and the crown cost him five markers at least, a whole Ledger,
>   with your turns between each. Then shut the Wards: he Rises only in a Safe one, and a Runner
>   of yours in each Ward he doesn't hold is a door he can't come home through.
> - **Stand in his road.** Sit in the room nearest him and he has to walk to the next. If he
>   crosses your block, don't check: Hold Fire and he pays one more marker and Advances straight
>   through. Ambush him. Alone, he dies half the time to two men and three times in four to
>   three.
> - **Count his Rum, not his markers.** Rum under the bar of his own room is a second Ledger at
>   dusk. Take the room or bust the stockpile before the rest of you go home, because the last
>   man up crowns without a word from anybody.
> - **Rat him out of the room.** If his name is freshest on the Track and the room is his
>   fattest door in a Squad's reach, one phone call scatters him out and padlocks it behind him.
>   A Sicilian with his Safehouse in the room is the one man it can't touch.
> - **Leave his number in the pool.** A Blowback on his room won't kill a Boss with a man beside
>   him, but it takes his guards, Runners first. A Boss and four wake up as a Boss and one, and
>   your Boss and four finish that nearly nine times in ten before dinner.

Table:

| His Boss has | Boss + 6 open fire | A Sicilian Hit (Boss + 6) |
| --- | --- | --- |
| Nobody | 100% | 99% |
| One Runner | 98% | 95% |
| Two Runners | 83% | 89% |
| Four Runners | 18% | 84% |
| Four Runners and a Safehouse | 7% | 80% |

Caption: "One turn to stop the crown: his Boss dies, one rival's Play of up to 3 volleys, he
Ambushes".

### 3.9 Smaller edits

- **Lesson 9 (the stake is rent)**, new closing paragraph from 11: "The one rent you never feel is
  a 1. A Stake of 1 costs nothing at six Influence, and half the 1s in the deck ask for what your
  liquor does anyway: haul some barrels, sell some, make a Trade. Eat them early. The cheap ones
  leave the deck first, and the man who sniffs at 1s on Day 3 is shopping in a market full of wars
  on Day 12."
- **Lesson 10 (Bribe early)**, end of the paragraph: "...so buy the cheap ones while they still
  work for you, and save the last for the day your Boss is already standing in the room (lesson
  28)."
- **Lesson 11 (your board talks)**, new closing sentence from 13: "And read the street the same
  way. Every Borough has a 5 with its name on it, a bounty on its Boss, its Safehouse or its men.
  When yours turns up, move whatever it's hunting." (Drops "seat", which CLAUDE.md reserves for
  turn order.)
- **Lesson 12 (only deny a card that would crown somebody)**: "the card that would carry a man
  holding the Nod to 10" leaves a hole once lesson 28 teaches buying the Nod last. Suggest "the
  card that would carry a man to 10 with the Nod in hand or one Bribe away".
- **Lesson 23 (build the bust)**, new opening from 25: "A Squad only looks at the Districts right
  beside it, inside its own Borough, and Staten Island has none. Hold nothing next to a Squad and
  you can be the loudest crew in town and never see a badge." Keep 25's Borough-order warning as
  the lesson's last line.
- **Lesson 26 (promise only what you alone control)**: 30's paragraph appended as-is, opening
  "Same rule, other end."
- **Chapter V "What I've Seen"** (it's the only chapter without one): "The greenhorn buys the Nod,
  then goes looking for a room, and the whole table meets him on the way. The old hand walks the
  old man in first and buys the Nod with him already at the bar. The made man has a war Job on his
  books to explain the walk, and buys the Nod after the rest have gone home."
- **Cross-references**: the Figures' "lesson 16" (the Rum table) becomes lesson 13. "Lessons 3 to
  5", "3, 4 and 7" and "1, 9 and 10" are unchanged.
- **The Figures' closing note**: add that a dead man is priced at $300 in lesson 18, that
  "spent out" is the sitting duck, and that lesson 29's odds use the same model with the Hit
  where it says so.

---

## 4. The vocabulary

Five named ideas, bolded on first use, each doing work a sentence would otherwise have to do
twice. All fit Rothstein's gambler's voice.

| Term | Means | First use |
| --- | --- | --- |
| picket | a block held by one to three Runners, no Boss or Safehouse | 15 (already used, now defined) |
| the toll | what a picket charges a raid: the Move, two or three volleys, maybe the Heat | 15 |
| sitting duck | a crew that can't Ambush: Ledger spent or Laid Low | 17 (the Guide already uses it) |
| the walk | the Boss's trip to a High Society room, the only time he's cheap to kill | 28 |
| the last man up | the boss still holding markers after the rest have Laid Low | 28 |

Considered and left out: "slow play" (right idea for buying the Nod last, but a second poker
term on top of fold/check/raise starts to read as a gimmick), "dead money" (clashes with "rent"),
and "the even man" (the sim didn't support it: for raiders the odd man who reaches a new die
matters more than the even man who shields one).

---

## 5. For Nick: design observations, not Almanac edits

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
   rivals are still up.
   This uses the repo's Ledger model (`sim_kickback_ledger.js`, the Almanac's Rum table): the
   Unload's two markers leave the Ledger before its Kickbacks land. The Guide says so ("moves one
   spent marker"), but the Rulebook's turn box lists "Pay the cost" after the Play resolves, and a
   literal reader could take it the other way: then a pour can never leave more than three
   markers, the Almanac's "5 Rum, net +3" becomes +1, and this chain needs Bribe first, from four
   markers and $5,000 in hand. Worth one clarifying clause in the Rulebook's Kickback text.
4. **Moving through a rival block.** A crew can Move into a block and Advance out in one Play for
   two markers if the Occupier Holds Fire: two blocks in one turn. It's rules-consistent (Hold
   Fire lets a passer-by through, as the Guide says) and it makes the Ambush the only answer
   that taxes a walking Boss. Not a problem, but nothing player-facing says it.
5. **Is cash open or hidden?** I couldn't find a rule either way. It matters here: if cash is
   hidden, $5,000 for the last rung is the one thing the table can't count, and "buy the Nod
   last" gets sharper.

---

## 6. If this goes ahead

- [ ] Nick picks: all, some, or none of section 2's cuts and merges.
- [ ] Apply the drafts to `The Almanac v0.9.html`; renumber lessons, the contents list and the
      anchors (keep existing `id`s where the lesson survives, so old links still land).
- [ ] `python3 tools/check_style.py` (em dashes) and a read-through cold, per the ghost rule.
- [ ] No other component carries these lessons; the Kingpin's Guide may lag and is off the site.
