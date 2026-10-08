var e=`# Moonshine Kingdom: Rules for an AI Player

3–4 players. Engine move names in parentheses. The harness lists every legal option at each decision, so you never need to test legality yourself; the rules below are for judging which option is best.

## 1. Goal: Take the Crown

You win the instant you make **Take the Crown** (takeTheCrown), a Power Play costing 2 Influence, no Heat, on your own turn, with all of these true:

- you hold **the Nod** (claimed automatically the moment you own all **10 Influence** markers; there are four Nod cards, so every player who gets there holds one);
- **10+ Respect**;
- **no unpaid Shylock's Mark**;
- your **Boss stands in a High Society Venue** (one of the four Speakeasies on a #7 Still);
- 2 markers in your Ledger.

The game ends mid-Day on the spot. Nothing else is settled.

**Respect** = sum of completed Jobs (1, 3 or 5 each), **−2** while you hold the Rat Card, **−1** per Welsher card. All of it is public.

## 2. Components and currencies

- **Mob**: 1 Boss, 15 Runners, 1 Safehouse. Mobsters = Boss + Runners. Dead or arrested pieces return to your supply (Boss comes back via Rise).
- **Influence markers**: you own 6 at the start and Bribe up to 10. A marker is in one of four places:
  - **Reserves** (stash): uncommitted, and the source for Job Stakes;
  - **Ledger** (operations): max **5**, the only markers you can spend;
  - **staked on a Job** until it resolves;
  - **the Heat Track** (a noisy spend) until the next Raid returns it to your Reserves.
  - A quiet spend returns from the Ledger to your Reserves.
- **Cash**: start with **$1,500**. Cash is public.
- **Barrels**: Moonshine (supply 30), Havana Rum (supply 20). Finite; empty supply produces nothing.
- **Heat Track**: 5 spaces, with markers in order and the newest on the right.
- **Muscle Ratio** (Mobsters in one District gives brew, Blowback dead and combat dice): 1–2 = 1, 3–4 = 2, 5–6 = 3, 7–8 = 4, 9+ = 5 (half, rounded up, max 5). A Safehouse alone counts 0.

## 3. The Day

### Shadows (in this order)

1. **Roll**: the holder of Turn Token #1 rolls **players + 1** Red dice. The **Mash** (1–6) was set yesterday; on Day 1 it is random.
2. **Draft and brew** (draftDice): in Turn Order, each player takes exactly one Red die and brews at once.
   - Brew Number = Mash + Red.
   - Every active Still you Control with that number (Mobsters present, no Squad) makes **Moonshine = that District's Muscle Ratio**, taken from the supply. Each Still fires at most once a Day.
3. **Split the Batch** (chooseRelay): if the Still in your Boss's District fired, one other active Still you Control that is Land Connected (border or bridge, not water) to the Boss's District also fires, whatever its number, at its own Muscle Ratio.
   - It fires automatically when there is one candidate.
   - With 2+ candidates you choose one.
4. **Blowback**: the one undrafted Red + Mash gives the Blowback Number.
   - Every Controlled, unpadlocked Still with that number bursts, **whoever owns it**, killing Muscle Ratio Mobsters there.
   - Runners die first; the Boss dies only if no Runner is left there.
   - Barrels and turf are kept.
5. **The Offers**, in **reverse** Turn Order, one action each:
   - **Take a Job** (claimJob): stake Influence from **Reserves** equal to its Stake. Its gap stays empty for the rest of the Offers.
   - **Walk Away** from a held Job (walkAwayJob): the stake returns to Reserves and the card is discarded.
   - **Stand pat** (confirmGrease).
   - **Restock**: automatic, once everyone has chosen. A fresh Job is dealt into each gap, face-up for the whole Day before anyone can claim it.
   - **Day 1 has no Offers.** The opening Market is dealt face-down and turns face-up here instead.
6. **Fund the Ledger**: automatic. Reserves move into the Ledger up to 5. Staked markers stay on their Jobs.
7. **Harbormaster** (setMash): the player Controlling the **most Docks** (no tie) names tomorrow's Mash, 1–6. On a tie or with no Docks held, it is rolled.

### The Hustle

- Players act in today's Turn Order, **one Play per turn**, round and round, with no passing.
- **Lay Low** (layLow, cost 0) ends your Day:
  - each unspent Ledger marker goes to Reserves and pays **$100**;
  - you take the **lowest remaining Turn Token for tomorrow**, so the first to Lay Low acts first tomorrow.
  - After Laying Low you make no Plays, but you still answer invasions (Hold Fire or Fold; you cannot Ambush).
- With an empty Ledger you still take turns until you Lay Low.
- **Sunset** is the instant the last player Lays Low. Tomorrow's Turn Order is set and the next Day's Shadows begins.

**Jobs**:

- Stakes and Respect are paired: **Stake 1 pays 1**, **Stake 2 pays 3**, **Stake 3 pays 5**.
- The Market shows players + 1 cards.
- A Job completes at the end of **your own Play** that did the deed (including the fight it started and any Raid it set off). Its stake returns to Reserves and the card scores.
- "Seize" means Control must change hands from a rival.
- Your Ambush or return fire on a rival's Play completes nothing.
- A staked marker never reaches the Ledger, so while you hold Jobs you fund fewer Plays.

**Deals**:

- Handshake promises are table talk and expire at Sunset.
- Breaking one earns a Welsher card (−1 Respect, permanent).
- Cash may be handed over freely. Influence never changes hands.

## 4. Plays

Costs are in Ledger markers. **H** = draws 1 Heat: one of the Play's own markers goes to the Heat Track instead of back to Reserves. It costs no extra marker (Extort is 2 markers in all).

| Play (engine) | Cost | Effect and restrictions |
|---|---|---|
| Move (movePlay) | 1 | Any Mobsters and/or barrels from a District you Control to one Connected District. Never into a Squad's District. Into rival Mobsters: Standoff (§6). Barrels alone into rival turf become theirs. Onto a rival Safehouse with no Mobsters: take it over (evictTakeOver) or raze it (evictRaze), no fight. |
| Recruit (recruit) | 1 | Hire Runners into your Safehouse District at **$300 each**. Needs the Safehouse on the board. |
| Secure (secure) | 1 | **$500**: place or relocate your one Safehouse into any Safe District. You gain Control at once. |
| Trade (trade) | 1 | At a Dock you Control, swap Moonshine there for Rum 1:1 (limited by the Rum supply). This is the only source of Rum. |
| Beg: Loan (takeShylockMark) | 1 | +$1,500 and a Shylock's Mark (7 in all; none while all are out). Any Mark bars the Crown. |
| Beg: Square Up (repayShylockMark) | 1 | Pay $2,000 and return one Mark. |
| Collect (collect) | 1 | +$100. Use it to stall for a later Turn Token. |
| Lay Low (layLow) | 0 | See §3. |
| Unload (unload) | 2 | At a Speakeasy you Control, sell your barrels there: **Moonshine $300, Rum $500**. **High Society Venues buy Rum only**, and each Rum barrel sold there gives a **Kickback**: 1 marker moves Reserves to Ledger (lost if Reserves are empty or the Ledger is full). The Unload's own 2 markers leave first. **Greed Tax**: 4+ barrels in one Play = H. |
| Bribe (bribe) | 2 | Buy 1 permanent Influence into Reserves: 7th **$2,000**, 8th **$3,000**, 9th **$4,000**, 10th **$5,000** (the 10th claims the Nod). Boss must be on the board. |
| Extort (extort) | 2, H | **$200 per District you Control**. Once per Day; always Heat. |
| Rat (rat) | 2 | An immediate Raid (§7). Take the Rat Card (−2 Respect) from the supply or its holder. You cannot Rat while you hold it; it leaves you only when a rival Rats. |
| Rise (rise) | 2 | Boss off the board only: place him in any **Safe Ward**. |
| Take the Crown (takeTheCrown) | 2 | See §1. |

## 5. Movement and Control

- **Control**: you have a Mobster or your Safehouse in the District. It is checked at the end of each Play: walk onto an empty block and it is yours, walk off and it is not.
- **Loose barrels**: barrels left on a block nobody Controls belong to nobody. Whoever takes Control of the block takes them.
- **Golden Rule**: no two mobs share a District at the end of a Play.
- **Connected**:
  - Land (shared border or bridge);
  - Water: every **Dock** connects to every other Dock.
- **Safe District**: yours, or Defenseless (no rival Mobsters, no Squad, no rival Safehouse). Loose barrels do not matter.
- **Squad Districts** are impassable. Their Still and Speakeasy are padlocked: no brewing, no Blowback, no sales. The four High Society Venues start under Squads.
- **District kinds**: Speakeasy (12, four of them High Society), Dock, Ward (engine tag \`ghetto\`). Every District has a Still numbered 2–12.
- **Still Pressure** = 6 − |7 − number|, so the 7 is hottest and gets 6.

## 6. Combat

A fight happens inside the Move that started it. Each option costs the chooser's Ledger but never a turn.

**Dice** = Muscle Ratio (max 5). **Threat** starts at 1 and gains +1 for each of these, max 4:

- Boss in the fight;
- the Occupier defending the District holding its own Safehouse;
- the Occupier's Ambush roll only.

A die kills on: Threat 1 = 5–6, Threat 2 = 4–6, Threat 3 = 3–6, Threat 4 = 2–6.

Hits remove **Runners first**, then the Boss.

**Step 1: Standoff.** The Occupier answers (ambushChoice true/false, or fold):

- **Ambush** (1): only the Occupier rolls, at +1 Threat. This is the fight's Heat marker, and it pins the Invader. It needs a Ledger marker and is not allowed once you have Laid Low.
- **Hold Fire** (0): the Invader is pinned and no one rolls.
- **Fold** (0): the Occupier's Mobsters **Scram**: they run to one Connected Safe District (across water via Docks too), never the one the Invader came from, leaving the barrels. The Invader takes Control, the barrels, and the choice to take over or raze the Safehouse. It is not allowed with nowhere Safe to Scram.

**Step 2: Pinned.** The Invader repeats until the fight resolves:

- **Open Fire** (assault, 1): both sides roll together; the Occupier gets no Ambush bonus.
- **Advance** (1): move the pinned crew, with its carried barrels, to a Safe District Connected to this one.
- **Fall Back** (fallBack, 0): return to the origin District. Carried barrels are left for the Occupier. You must Fall Back if your Ledger is empty.

**Heat**: a fight draws exactly **one** Heat marker, owned by whoever fired first (the Ambusher, or the Invader on his first Open Fire or Hit). The Boiling Point is checked after the fight ends.

**End of the fight**:

- If the Occupier is wiped out, the Invader takes Control and **all** barrels there.
- A rival Safehouse there is taken over (yours relocates into it for free) or razed (back to its owner's supply).
- If the Invader is wiped out, the Occupier keeps its barrels and any the Invader carried.
- If both sides are wiped out and no Safehouse remains, the District is empty.

## 7. Police

- **Heat**: a Play marked H, a fight's first shot, Torch, and a Greed Tax sale each add 1 marker (the spent marker itself).
- **The Raid** is triggered when the **5th marker** lands, once the Play that placed it has fully resolved (a sale completes first; a fight ends first), or at once by Rat.
- **Squad order**: the four Squads (Staten Island has none) resolve one at a time, Manhattan, Bronx, Queens, Brooklyn.
- **Reach**: Districts directly Land Connected to the Squad (border or bridge, never water) inside its own Borough. It must be held by a mob and have no Squad. **The Sicilian Safehouse District is never in reach.**
- **Target mob**: among mobs holding a District in reach, the one whose marker sits **furthest right** on the Heat Track. If none of them has a marker, the Squad stays put.
- **Target District**: that mob's reachable District with the **most barrels**; ties go to the highest Still Pressure.
- **Scatter**: the Squad moves in.
  - The Safehouse there burns (back to supply) and all barrels there go to the supply.
  - Mobsters **Scram**, as from a Fold: to one Connected Safe District (across water via Docks too), never the Squad's origin. With two or more, the crew's owner picks (chooseScatter), even out of turn or Laid Low.
  - With no such District they are all arrested (back to supply, Boss included).
  - The Squad now holds and padlocks the District.
- **Aftermath**: all Heat markers return to their owners' Reserves.

## 8. The families (Trait + two signature Plays)

**Sicilian Syndicate: Untouchable.** Squads never target or enter their Safehouse District.

- **Hit** (hit, 2, in a fight while pinned): an Open Fire where, if you score any hits, the rival Boss takes the first. It draws Heat only as the fight's first shot.
- **Consigliere** (consigliere, 1): remove any one Heat marker (you choose it by index) and return it to its owner's Reserves.

**Hell's Kitchen Irish: Firepower.** +1 die on their own Open Fire as the Invader (max 5). It never applies on defence or to Plunder.

- **Plunder** (plunder, 1, in a fight while pinned): roll as for Open Fire, but each hit steals 1 barrel (pickPlunder) instead of killing. The Occupier's hits still kill. No Heat. Stolen barrels leave with an Advance and are dropped on a Fall Back.
- **Peddle** (peddle, 1): sell **Moonshine only** in a **Ward** you Control at $300 a barrel. Greed Tax at 4+.

**East Side Vipers: Whispers.** They may look at the top card of the Jobs deck at any time (your state shows it). It is the first card dealt at the next restock, so a gap left at the Offers brings it in (claimable the morning after).

- **Stealth** (stealth, 1): up to 5 Mobsters, no barrels, into a Connected **rival-held** District. The Occupier cannot Ambush: they Hold Fire (you are Pinned as usual: Open Fire, Advance or Fall Back) or Fold.
- **Tunnel** (tunnel, 1): move 1–5 barrels, no Mobsters, between your Safehouse District and any other District you Control, in either direction.

**Harlem Knights: Network.** Each Trade gives +1 free Rum, if the supply has one.

- **Skiff** (skiff, 1): up to 5 Mobsters, no barrels, from a Coastal District you Control to any other Coastal District (Coastal means touching water). Not into a Squad District. A rival District gives a normal Standoff; an undefended rival Safehouse gives take over or raze.
- **Torch** (torch, 1, in a fight while pinned): sacrifice one pinned Runner to destroy the rival Safehouse there. Always Heat; the fight continues.

## 9. Strategic notes

- **Influence buys capacity, not actions.** The Ledger holds 5 markers a Day. Only the High Society Rum Kickback refills it mid-Day (5 Rum poured with 2 markers left nets +3).
- **Drafting is also defence.** The die you leave in the pool may burst your own best Still. The last seat drafts from what is left but picks first at The Offers.
- **Laying Low early wins tempo.** You draft first tomorrow and brew before the supply runs thin. The cost is that you can't Ambush for the rest of the Day, so your turf becomes a sitting duck.
- **The first shot owns the Heat,** and Raids chase the freshest marker. Hold Fire and let the Invader take the marker, or have the Sicilians' Consigliere pull yours off.
- **The Crown takes three visible steps:** 10 Influence ($14,000 of Bribes), 10 Respect, and the walk into a Venue. Killing the leader's Boss costs him a Rise in a Ward plus the walk back.
- **The Crown ends the game before Sunset.** Promises due at Sunset go unpaid, so plan for betrayal.
- **Raids go for barrels.** A Raid hits a mob's District with the most barrels, so a Rum stockpile in your Venue is Raid bait.
`;export{e as default};