var e=`# Moonshine Kingdom: Rules for an AI Player

3–4 players. Engine move names in parentheses. The harness lists every legal option at each decision, so you never need to test legality yourself; the rules below are for judging which option is best. Fight decisions also carry **FIGHT ODDS**: the exact chance to take the District and the average Mobsters lost and killed, assuming the Invader Opens Fire every volley his Ledger pays for. Read them rather than working out the dice yourself.

## 1. Goal: Take the Crown

You win the instant you make **Take the Crown** (takeTheCrown), a Power Play costing 2 Influence, no Heat, on your own turn, with all of these true:

- **20+ Respect**;
- your **Boss stands in a rival's home Ward** (the Ward of a rival boss's home Borough; no boss crowns in his own home Ward, and at three players the Ward of the Borough nobody was dealt is nobody's crown room);
- 2 markers in your Ledger.

Your **home Borough** is the one you were dealt at setup, and its Ward is your **home Ward**: where your Boss starts, and where your rivals crown. At three players one Borough is nobody's home.

The game ends mid-Day on the spot. Nothing else is settled.

**Respect** = completed Jobs (1, 2 or 3 each) plus Bribe cards (1 to 4 each), **−3** while you hold the Rat Card, **−2** per Shylock's Mark you hold, **−1** per Welsher card. All of it is public.

## 2. Components and currencies

- **Mob**: 1 Boss, 15 Runners, 1 Safehouse. Mobsters = Boss + Runners. Dead or arrested pieces return to your supply (Boss comes back via Rise).
- **Influence markers**: you own 6 at the start, and each of your four Bribe cards brings one more, so 10 at most. A marker is in one of four places:
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
3. **Split the Batch** (chooseRelay): if the Still in your Boss's District fired, one other active Still you Control that is Adjacent (border or bridge, not water) to the Boss's District also fires, whatever its number, at its own Muscle Ratio.
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

- A Job pays its Stake: **1, 2 or 3 Respect**.
- The Market shows players + 1 cards.
- A Job completes at the end of **your own Play** that did the deed (including the fight it started and any Raid it set off). Its stake returns to Reserves and the card scores.
- "Seize" means Control must change hands from a rival (a won fight or a Fold). Walking in on a rival Safehouse with no Mobsters is no Seize: nobody Controlled the District.
- The Butcher's Ledger Seizes **from** a crew: "Seize a District from 4+ rival Mobsters" (anywhere; a Boss counts). The crew is counted as it met your Move at the door, so a Fold pays the Job as surely as winning the fight; only a stand that holds the District denies it.
- The Toll Booth Trap is a kill: "Kill a rival Boss" (anywhere). A "kill" is a rival Mobster shot dead in your own Play's fight; a Raid's arrests are not kills. It pays even if you then lose the fight, and a Fold denies it, so a Boss with no Safe District to Scram to is the target.
- Your Ambush or return fire on a rival's Play completes nothing.
- A count is what one Play did: "4+ barrels" means four in a single Play.
- The deck is 36 cards (16 / 12 / 8): an Unload card for each of the eight ordinary Speakeasies ("Unload 4+ barrels at <bar> in <District>"), an Extort card for each mainland Borough's Speakeasies ("Extort every open Speakeasy in X": every one there that isn't Padlocked), a Boss and 4+ Rum across each of three Bridges (Hell Gate, Queensboro, Brooklyn), and among the 2s Opening Night (Unload 5+ Rum at your home Borough's High Society Venue) and The Insurance Job (set off a Raid, by the 5th Heat marker or a Rat on your own Play, that padlocks a Pressure 1 or 2 Still you Control). Union Dues (Recruit 4+ Runners in a rival's home Ward) is a 1. The eight 3s are The Butcher's Ledger, The Toll Booth Trap, High Roller (Seize a High Society Venue), The Smuggler's Run, The Eviction (Seize a District with a rival's Safehouse, by fight or Fold, and take the Safehouse over; a walk-in or a Secure is no Seize), The Noble Experiment (Unload 8+ Moonshine outside your home Borough), The Warehouse (Secure your Safehouse in a District holding 10+ barrels) and The Five Families. The eight 3s are kept out of the opening Market.
- A staked marker never reaches the Ledger, so while you hold Jobs you fund fewer Plays.

**Deals**:

- Handshake promises are table talk and expire at Sunset.
- Breaking one earns a Welsher card (−1 Respect, permanent).
- Cash may be handed over freely. Influence never changes hands.

## 4. Plays

Costs are in Ledger markers. **H** = draws 1 Heat: one of the Play's own markers goes to the Heat Track instead of back to Reserves. It costs no extra marker (Extort is 2 markers in all).

| Play (engine) | Cost | Effect and restrictions |
|---|---|---|
| Move (movePlay) | 1 | Any Mobsters and/or barrels from a District you Control to one Connected District. Never into a Padlocked District (a Squad's). Into a Hostile District (rival Mobsters): Standoff (§6). Barrels alone belong to whoever Controls the District they land in: a rival's become his, and in one nobody Controls they are nobody's. Mobsters into a District where a rival Safehouse stands with no Mobsters: no Standoff; take it over (evictTakeOver) or destroy it (evictRaze). |
| Recruit (recruit) | 1 | Hire Runners into your Safehouse District at **$300 each**. Needs the Safehouse on the board, not Control; the new Runners take Control. |
| Secure (secure) | 1 | **$500**: place or relocate your one Safehouse into any Safe District. On a rival Safehouse it is a take over: theirs is destroyed (back to its owner's supply) and yours moves in. A Safehouse grants no Control by itself. |
| Trade (trade) | 1 | At a Dock you Control, swap Moonshine there for Rum 1:1 (limited by the Rum supply). This is the only source of Rum. |
| Beg: Loan (takeShylockMark) | 1 | +$1,500 and a Shylock's Mark (7 in all; none while all are out). Each Mark held is −2 Respect. |
| Beg: Square Up (repayShylockMark) | 1 | Pay $2,000 and return one Mark (its −2 Respect goes with it). |
| Lay Low (layLow) | 0 | See §3. |
| Unload (unload) | 2 | At a Speakeasy you Control, sell your barrels there: **Moonshine $300, Rum $500**. **High Society Venues buy Rum only**, and each Rum barrel sold there gives a **Kickback**: 1 marker moves Reserves to Ledger (lost if Reserves are empty or the Ledger is full). The Unload's own 2 markers leave first. **Greed Tax**: 5+ barrels in one Play = H. |
| Bribe (bribe) | 2 | Buy one Bribe card you don't hold yet, in any order: **Precinct Captain $2,000 (1 Respect)**, **Alderman $3,000 (2)**, **Judge $4,000 (3)**, **Mayor $5,000 (4)**. It goes in your Respect pile and brings 1 Influence marker into Reserves. One of each per boss. Boss must be on the board. |
| Extort (extort) | 2, H at 5+ | **$100 per District you Control**. As often as your Ledger pays for it; each Extort draws one Heat marker only when you Control **5+ Districts**. |
| Rat (rat) | 2 | An immediate Raid (§7). Take the Rat Card (−3 Respect) from the supply or its holder. You cannot Rat while you hold it; it leaves you only when a rival Rats. |
| Rise (rise) | 2 | Boss off the board only: place him in any **Safe District of your home Borough**. |
| Take the Crown (takeTheCrown) | 2 | See §1. |

## 5. Movement and Control

- **Control**: your Boss or a Runner stands in the District. **A Safehouse alone holds nothing**: a District with no Mobsters is Controlled by nobody, so its Still does not brew for you, it does not count for Extort or the Harbormaster, and you cannot Unload, Trade, Peddle or Move barrels there. It is checked at the end of each Play: walk in and it is yours, walk off and it is not.
- **Barrels belong to whoever Controls the District** at the end of a Play. Barrels in a District nobody Controls belong to nobody; whoever takes Control takes them.
- **Golden Rule**: no two mobs share a District at the end of a Play.
- **Adjacent**: a shared border or a bridge.
- **Connected**: Adjacent, or Dock to Dock (every **Dock** connects to every other Dock by water).
- **Safe District**: no rival Mobsters and no Police Squad. Barrels and Safehouses do not count, so a District where only a rival Safehouse stands is Safe.
- **Hostile District**: rival Mobsters stand in it.
- **A rival Safehouse**: whoever takes Control of a District holding one (Move, Skiff, Advance, Scram, Rise, a won fight, a Fold) must take it over (yours moves in, free) or destroy it (back to its owner's supply). Walking in on one with no Mobsters starts no Standoff.
- **Padlocked**: a District holding a Police Squad. Nobody enters it; its Still and Speakeasy are shut: no brewing, no Blowback, no sales. The four High Society Venues start under Squads. Every other Speakeasy is **open**.
- **District kinds**: Speakeasy (12, four of them High Society), Dock, Ward (engine tag \`ghetto\`). Every District has a Still numbered 2–12.
- **Still Pressure** = 6 − |7 − number|, so the 7 is hottest and gets 6.

## 6. Combat

A fight happens inside the Move that started it. Each option costs the chooser's Ledger but never a turn.

**Dice** = Muscle Ratio (max 5). **Threat** starts at 1 and gains +1 for each of these, max 4:

- Boss in the fight;
- the Irish Tommy Gun (the Invader's volley only);
- the Occupier defending the District holding its own Safehouse;
- the Occupier's Ambush roll only.

A die kills on: Threat 1 = 5–6, Threat 2 = 4–6, Threat 3 = 3–6, Threat 4 = 2–6.

Hits remove **Runners first**, then the Boss.

**Step 1: Standoff.** The Occupier answers (ambushChoice true/false, or fold):

- **Ambush** (1): only the Occupier rolls, at +1 Threat. This is the fight's Heat marker, and it pins the Invader. It needs a Ledger marker and is not allowed once you have Laid Low.
- **Hold Fire** (0): the Invader is pinned and no one rolls.
- **Fold** (0): the Occupier's Mobsters **Scram**: they run to one Connected Safe District, never the one the Invader came from, leaving the barrels. The Invader takes Control, the barrels, and the choice to take over or destroy the Safehouse. It is not allowed with nowhere Safe to Scram, nor against a Stealth.

**Step 2: Pinned.** The Invader repeats until the fight resolves:

- **Open Fire** (assault, 1): both sides roll together, the Invader Red and the Occupier White; the Occupier gets no Ambush bonus. Only the Invader pays: the return fire is free and always comes, even from a crew that has Laid Low.
- **Advance** (1): move the pinned crew to a Safe District Connected to this one, with as many of its carried barrels as you choose; the rest are left for the Occupier (a way to plant evidence on a rival who Ambushed you, since his Heat marker is now the freshest).
- **Fall Back** (fallBack, 0): return to the origin District. Carried barrels are left for the Occupier. You must Fall Back if your Ledger is empty.

**Heat**: a fight draws exactly **one** Heat marker, owned by whoever fired first (the Ambusher, or the Invader on his first Open Fire, Hit, Tommy Gun or Torch). The Boiling Point is checked after the fight ends.

**End of the fight**:

- If the Occupier is wiped out, the Invader takes Control and **all** barrels there.
- A rival Safehouse there is taken over (yours relocates into it for free) or destroyed (back to its owner's supply).
- If the Invader is wiped out, the Occupier keeps its barrels and any the Invader carried.
- If both sides are wiped out in one volley, nobody Controls the District; any Safehouse stays where it is.

## 7. Police

- **Heat**: a Play marked H, a fight's first shot (Ambush, Open Fire, Hit, Tommy Gun or Torch), and a Greed Tax Unload each add 1 marker (the spent marker itself).
- **The Raid** is triggered when the **5th marker** lands, once the Play that placed it has fully resolved (a sale completes first; a fight ends first), or at once by Rat.
- **Squad order**: the four Squads (Staten Island has none) resolve one at a time, Manhattan, Bronx, Queens, Brooklyn.
- **Reach**: Districts directly Adjacent to the Squad (border or bridge, never water) inside its own Borough. It must be Controlled by a mob (Mobsters there) and have no Squad.
- **Target mob**: among mobs Controlling a District in reach, the one whose marker sits **furthest right** on the Heat Track. If none of them has a marker, the Squad stays put.
- **Target District**: that mob's reachable District with the **most barrels**; ties go to the highest Still Pressure.
- **Scatter**: the Squad moves in.
  - The Safehouse there is destroyed (back to supply) and all barrels there go to the supply.
  - Mobsters **Scram**, as from a Fold: to one Connected Safe District, never the Squad's origin. With two or more, the crew's owner picks (chooseScatter), even out of turn or Laid Low. Scramming onto a rival Safehouse, he must take it over or destroy it.
  - With no such District they are all arrested (back to supply, Boss included).
  - The Squad now holds the District: it is Padlocked.
- **Aftermath**: all Heat markers return to their owners' Reserves.

## 8. The families (two signature Plays each, no Traits)

A Play marked "in a fight" is made while Pinned as the Invader: it costs Influence but not a turn.

**Sicilian Syndicate**

- **Hit** (hit, 2, in a fight): an Open Fire where, if you score any hits, the rival Boss takes the first. It draws Heat only as the fight's first shot.
- **Consigliere** (consigliere, 1): remove any one Heat marker (you choose it by index) and return it to its owner's Reserves.

**Hell's Kitchen Irish**

- **Tommy Gun** (tommyGun, 2, in a fight): Open Fire with 1 extra attack die (max 5) at +1 Threat (max 4). The Occupier returns fire as normal. Heat only as the fight's first shot.
- **Peddle** (peddle, 1): sell **Moonshine only** in a **Ward** you Control at the **$200** street rate. Never the Greed Tax, however many barrels: a big pile goes out quietly in one Play, while a small batch fetches more by Unload at a bar ($300).

**East Side Vipers**

- **Stealth** (stealth, 1): up to 5 Mobsters, no barrels, into a Connected **Hostile** District (rival Mobsters on it). The Occupier gets no Standoff choice: no Ambush, no Fold. He Holds Fire and you are Pinned as usual (Open Fire, Advance or Fall Back).
- **Whispers** (whispers, 1, costs the turn): look at the top card of the Jobs deck (only you see it), then claim it at once (whispersChoice true), staking Influence from your Reserves equal to its Stake, or let it lie on top of the deck (whispersChoice false). A claimed Job is held like any other; it is outside the once-a-morning Offers limit.

**Harlem Knights**

- **Skiff** (skiff, 1): up to 5 Mobsters, no barrels, from a Coastal District you Control to any other Coastal District (every District but Fordham, Corona, Flushing and Richmond Hill). Not into a Padlocked District. A Hostile District gives a normal Standoff; a rival Safehouse with no Mobsters gives take over or destroy.
- **Torch** (torch, 1, in a fight): sacrifice one pinned Runner to destroy the rival Safehouse there and send **every barrel in the District to the Supply**. The rival keeps Control and the fight continues. It is a shot: Heat only if it is the fight's first.

## 9. Strategic notes

- **Influence buys capacity, not actions.** The Ledger holds 5 markers a Day. Only the High Society Rum Kickback refills it mid-Day (5 Rum poured with 2 markers left nets +3).
- **Drafting is also defence.** The die you leave in the pool may burst your own best Still. The last seat drafts from what is left but picks first at The Offers.
- **Laying Low early wins tempo.** You draft first tomorrow and brew before the supply runs thin. The cost is that you can't Ambush for the rest of the Day, so your turf becomes a sitting duck.
- **The first shot owns the Heat,** and Raids chase the freshest marker. Hold Fire and let the Invader take the marker, or have the Sicilians' Consigliere pull yours off.
- **The Crown takes visible steps:** 20 Respect, then the walk into a rival's home Ward (usually a fight, since it is his turf), then a Play of its own. Bribe cards can buy up to 10 of the 20 ($14,000 for all four); the Mayor is the cheapest Respect ($1,250 a point) and the natural closer, the Captain the cheapest marker. A rival at 16+ with $5,000 and the Mayor unbought is one Play from 20. Killing the leader's Boss costs him a Rise back in his home Borough plus the walk back out to a rival's Ward.
- **The Crown ends the game before Sunset.** Promises due at Sunset go unpaid, so plan for betrayal.
- **Raids go for barrels.** A Raid hits a mob's District with the most barrels, so a Rum stockpile in your Venue is Raid bait.
`;export{e as default};