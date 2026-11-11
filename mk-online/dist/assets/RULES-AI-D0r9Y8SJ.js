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

- **Mob**: 1 Boss, 12 Runners, 1 Safehouse. You start with your Boss, 2 Runners and your Safehouse in your home Ward, and 2 Runners each on your starting Dock and Speakeasy; the other 6 Runners wait in your supply. Mobsters = Boss + Runners. Dead or arrested pieces return to your supply (Boss comes back via Rise).
- **Influence markers**: you own 6 at the start, and each of your four Bribe cards brings one more, so 10 at most. A marker is in one of four places:
  - **Reserves** (stash): uncommitted, and the source for Job Stakes;
  - **Ledger** (operations): max **5**, the only markers you can spend;
  - **staked on a Job** until it resolves;
  - **the Heat Track** (a noisy spend) until the next Raid returns it to your Reserves.
  - A quiet spend returns from the Ledger to your Reserves.
- **Cash**: start with **$1,500**. Cash is public.
- **Barrels**: Moonshine (supply 30), Havana Rum (supply 20). Finite; empty supply produces nothing.
- **Heat Track**: 5 spaces, with markers in order and the newest on the right.
- **Muscle** (brew and combat dice): the Mobsters in one District, **max 5**: each man brews one barrel and rolls one die; a sixth man adds nothing. A Safehouse alone counts 0. Blowback dead are set by the Still's Pressure, not the crew (below).

## 3. The Day

### Shadows (in this order)

1. **Roll**: the holder of Turn Token #1 rolls **players + 1** Red dice. The **Mash** (1–6) was set yesterday; on Day 1 it is random.
2. **Draft and brew** (draftDice): in Turn Order, each player takes exactly one Red die and brews at once.
   - Brew Number = Mash + Red.
   - Every active Still you Control with that number (Mobsters present, no Squad) makes **Moonshine = that District's Muscle** (its Mobsters, max 5), taken from the supply. Each Still fires at most once a Day.
3. **Split the Batch** (chooseRelay): if the Still in your Boss's District fired, one other active Still you Control that is Adjacent (border or bridge, not water) to the Boss's District also fires, whatever its number, at its own Muscle.
   - It fires automatically when there is one candidate.
   - With 2+ candidates you choose one.
4. **Blowback**: the one undrafted Red + Mash gives the Blowback Number.
   - Every Controlled, unpadlocked Still with that number bursts, **whoever owns it**, killing Mobsters there by the Still's **Pressure** (6 on the 7, one less each step away, 1 on the 2 and the 12): Pressure 1–2 kills 1, 3–4 kills 2, 5–6 kills 3.
   - Runners die first; the Boss dies only if no Runner is left there.
   - Barrels and turf are kept.
5. **The Offers**, in **reverse** Turn Order, one action each:
   - **Take a Job** (claimJob): stake Influence from **Reserves** equal to its Stake. Its gap stays empty for the rest of the Offers.
   - **Walk Away** from a held Job (walkAwayJob): the stake returns to Reserves and the card is discarded.
   - **Stand pat** (confirmGrease).
   - **Restock**: automatic, once everyone has chosen. A fresh Job is dealt into each gap, face-up for the whole Day before anyone can claim it.
   - **Day 1 has no Offers.** The opening Market is dealt face-down and turns face-up here instead.
   - **The 3s come late.** No 3-Respect Job sits in the top 15 cards of the deck (the opening Market included), so the first 3 turns up after about ten Days of restocks.
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
- The deck is 36 cards (16 / 12 / 8): an Unload card for each of the eight ordinary Speakeasies ("Unload 4+ barrels at <bar> in <District>"), an Extort card for each mainland Borough's Speakeasies ("Extort every open Speakeasy in X": every one there that isn't Padlocked), 4+ barrels across each of four Bridges (Williamsburg, Hell Gate, Queensboro, Brooklyn), and among the 2s Opening Night (Unload 5+ Rum at your home Borough's High Society Venue) and The Insurance Job (set off a Raid, by the 5th Heat marker or a Rat on your own Play, that padlocks a Pressure 1 or 2 Still you Control). Union Dues (Recruit 4+ Runners in a rival's home Ward) is a 1. The eight 3s are The Butcher's Ledger, The Toll Booth Trap, High Roller (Seize a High Society Venue), The Smuggler's Run, The Eviction (Seize a District with a rival's Safehouse, by fight or Fold, and take the Safehouse over; a walk-in or a Secure is no Seize), The Noble Experiment (Unload 8+ Moonshine outside your home Borough), The Warehouse (Secure your Safehouse in a District holding 10+ barrels) and The Five Families. The eight 3s are kept out of the opening Market.
- A staked marker never reaches the Ledger, so while you hold Jobs you fund fewer Plays.

**Deals**:

- A **Handshake** is a promise made in table talk ("I won't cross the river today", "I'll leave your Docks alone till Sunset"). It lasts until Sunset unless it says otherwise.
- Breaking one earns a **Welsher** card (−1 Respect, permanent). In this online game the engine cannot see promises, so nothing deals the card automatically: a human at the table can hand it out, and every boss remembers who broke his word. Reputation is the real enforcement.
- **Cash crosses the table freely**: on any Hustle decision, **give cash** (giveCash) hands a rival any whole hundreds. It is not a Play and costs nothing, so your turn goes on. Pay for a deal, pay a bounty on the leader's Boss, or pay up front when you don't trust a promise. Influence never changes hands.
- Deals are worth making. Three bosses who agree to stay out of each other's way while they hit the leader all gain; a boss who stays silent fights everyone.

## 4. Plays

Costs are in Ledger markers. **H** = draws 1 Heat: one of the Play's own markers goes to the Heat Track instead of back to Reserves. It costs no extra marker (Extort is 2 markers in all).

| Play (engine) | Cost | Effect and restrictions |
|---|---|---|
| Move (movePlay) | 1 | Any Mobsters and/or barrels from a District you Control to one Connected District. Never into a Padlocked District (a Squad's). Into a Hostile District (rival Mobsters): Standoff (§6). Barrels alone belong to whoever Controls the District they land in: a rival's become his, and in one nobody Controls they are nobody's. Mobsters into a District where a rival Safehouse stands with no Mobsters: no Standoff; take it over (evictTakeOver) or destroy it (evictRaze). |
| Recruit (recruit) | 1 | Hire Runners into your Safehouse District at **$300 each**. Needs the Safehouse on the board, not Control; the new Runners take Control. |
| Secure (secure) | 1 | **$500**: place or relocate your one Safehouse into any Safe District. On a rival Safehouse it is a take over: theirs is destroyed (back to its owner's supply) and yours moves in. A Safehouse grants no Control by itself. |
| Trade (trade) | 1 | At a **Dock** you Control, swap Moonshine there for Havana Rum: **2 Moonshine for 1 Rum**, or **1 for 1 at a Contact Dock** (**the Bowery, Whitestone, Stapleton, Tottenville**: the four Docks nobody starts on). N is the Rum you receive (limited by the Rum supply). This is the only source of Rum. No Heat. Barrels Move Dock to Dock across the water, so Moonshine on any Dock can be shipped to a Contact Dock in one Move. |
| Beg: Loan (takeShylockMark) | 1 | +$1,500 and a Shylock's Mark (7 in all; none while all are out). Each Mark held is −2 Respect. |
| Beg: Square Up (repayShylockMark) | 1 | Pay $2,000 and return one Mark (its −2 Respect goes with it). |
| Lay Low (layLow) | 0 | See §3. |
| Unload (unload) | 2, H | At a Speakeasy you Control, sell your barrels there: **Moonshine $200, Rum $500**. **High Society Venues buy Rum only**, and each Rum barrel sold there gives a **Kickback**: 1 marker moves Reserves to Ledger (lost if Reserves are empty or the Ledger is full). The Unload's own 2 markers leave first. One Heat marker however many barrels go, so a big pour costs no more Heat than a small one. |
| Bribe (bribe) | 2 | Buy one Bribe card you don't hold yet, in any order: **Precinct Captain $2,000 (1 Respect)**, **Alderman $3,000 (2)**, **Judge $4,000 (3)**, **Mayor $5,000 (4)**. It goes in your Respect pile and brings 1 Influence marker into Reserves. One of each per boss. Boss must be on the board. |
| Extort (extort) | 2, H | **$100 per District you Control**. As often as your Ledger pays for it; each Extort draws one Heat marker however many Districts pay. |
| Rat (rat) | 2 | An immediate Raid (§7). Take the Rat Card (−3 Respect) from the supply or its holder. You cannot Rat while you hold it; it leaves you only when a rival Rats. |
| Rise (rise) | 2 | Boss off the board only: place him in any **Safe District of your home Borough**. |
| Take the Crown (takeTheCrown) | 2 | See §1. |

## 5. Movement and Control

- **Control**: your Boss or a Runner stands in the District. **A Safehouse alone holds nothing**: a District with no Mobsters is Controlled by nobody, so its Still does not brew for you, it does not count for Extort or the Harbormaster, and you cannot Unload, Trade or Move barrels there. It is checked at the end of each Play: walk in and it is yours, walk off and it is not.
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

**Dice** = Muscle: one per Mobster, max 5. **Threat** starts at 1 and gains +1 for each of these, max 3:

- Boss in the fight;
- the Irish Tommy Gun (the Invader's volley only);
- the Occupier's Ambush roll only.

A die kills on: Threat 1 = 5–6, Threat 2 = 4–6, Threat 3 = 3–6.

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

- **Heat**: a Play marked H (Unload and Extort among them) and a fight's first shot (Ambush, Open Fire, Hit, Tommy Gun or Torch) each add 1 marker (the spent marker itself).
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
- **Consigliere** (consigliere, 2): remove any one Heat marker (you choose it by index) and return it to its owner's Reserves.

**Hell's Kitchen Irish**

- **Tommy Gun** (tommyGun, 2, in a fight): Open Fire with 1 extra attack die (max 5) at +1 Threat. The Occupier returns fire as normal. Heat only as the fight's first shot.
- **Hook** (hook, 2): from a District you Control, swap barrels **one for one** with a rival in an **Adjacent** District he Controls (a border or a Bridge, never Dock to Dock across the water). You pick which barrels go each way: usually your Moonshine for his Rum, but sending Rum or taking his Moonshine can strip a pile a rival's Job needs. N is how many barrels change hands; the default option sends your Moonshine first and takes his Rum first, and the "other way" option sends your Rum first and takes his Moonshine first. No Heat, no fight. It is not a Trade.

**East Side Vipers**

- **Stealth** (stealth, 1): up to 5 Mobsters, no barrels, into a Connected **Hostile** District (rival Mobsters on it). The Occupier gets no Standoff choice: no Ambush, no Fold. He Holds Fire and you are Pinned as usual (Open Fire, Advance or Fall Back).
- **Whispers** (whispers, 1, costs the turn): look at the top card of the Jobs deck (only you see it; you may tell the table, bluff or say nothing), then claim it at once (whispersChoice true), staking Influence from your Reserves equal to its Stake, or let it lie on top of the deck (whispersChoice false). A claimed Job is held like any other; it is outside the once-a-morning Offers limit.

**Harlem Knights**

- **Skiff** (skiff, 1): up to 5 Mobsters, no barrels, from a Coastal District you Control to any other Coastal District (every District but Fordham, Corona, Flushing and Richmond Hill). Not into a Padlocked District. A Hostile District gives a normal Standoff; a rival Safehouse with no Mobsters gives take over or destroy.
- **Torch** (torch, 1, in a fight): sacrifice one pinned Runner to destroy the rival Safehouse there and send **every barrel in the District to the Supply**. The rival keeps Control and the fight continues. It is a shot: Heat only if it is the fight's first.

## 9. Strategic notes

- **Influence buys capacity, not actions.** The Ledger holds 5 markers a Day. Only the High Society Rum Kickback refills it mid-Day: pour on your last two markers so there are empty slots, and N Rum refills N slots only if you have N+1 markers clear of Jobs and the Heat Track (the pour's own Heat locks one away).
- **Drafting is also defence.** The die you leave in the pool may burst your own best Still. The last seat drafts from what is left but picks first at The Offers.
- **Laying Low early wins tempo.** You draft first tomorrow and brew before the supply runs thin. The cost is that you can't Ambush for the rest of the Day, so your turf becomes a sitting duck.
- **The first shot owns the Heat,** and Raids chase the freshest marker. Hold Fire and let the Invader take the marker, or have the Sicilians' Consigliere pull yours off.
- **The Crown takes visible steps:** 20 Respect, then the walk into a rival's home Ward (usually a fight, since it is his turf), then a Play of its own. Bribe cards can buy up to 10 of the 20 ($14,000 for all four); the Mayor is the cheapest Respect ($1,250 a point) and the natural closer, the Captain the cheapest marker. A rival at 16+ with $5,000 and the Mayor unbought is one Play from 20. Killing the leader's Boss costs him a Rise back in his home Borough plus the walk back out to a rival's Ward.
- **The Crown ends the game before Sunset.** Promises due at Sunset go unpaid, so plan for betrayal.
- **Raids go for barrels.** A Raid hits a mob's District with the most barrels, so a Rum stockpile in your Venue is Raid bait.

## 10. Playing well (from The Almanac)

The rules say what you may do; these say what pays. Each lesson's name is the one players use.

**Every Day**

- **The One Line.** Plays today = Influence − staked − Heat, up to five. Count your Plays before your money.
- **Don't Lay Low as income.** Lay Low pays $100 a marker, which is the floor, not a plan. Turf is the investment that beats it: every District you hold pays $100 on every Extort for the rest of the game, so Recruiting Runners and spreading to more Districts pays back many times over, where a Lay Low pays once. If you have Laid Low first with five unspent markers two Days running, you are losing: the leaders are turning those markers into Respect. Spend them on what moves you toward 20 (a Job's setup, a Bribe, taking turf back, a Recruit where your next Job is). Lay Low early on purpose only for the draft (The Kill Shot, below) or when every Play left really is worth less than $100.
- **The Reverse Snake.** The low token drafts and acts first; the high token picks first at the Offers. Laying Low first buys tomorrow's first pick but leaves every District you hold a **sitting duck** (no Ambush) for the rest of today. If a rival crew is next to your Boss, don't Lay Low first.
- **Have a plan that reaches 20.** Write it as numbers: Respect now, which Jobs and Bribes get you to 20, which rival home Ward you will crown in and how your Boss gets there. Re-check it each Day.

**Stills and the draft**

- **The Magic of Seven.** No Mash can starve a 7, and the four 7s (the High Society Venues) open when a Raid moves their Squad. Elsewhere, hold a low Still and a high one (a 3 and a 9): one end is live whatever Mash is named.
- **The Leash.** The Harbormaster names a Mash that lights his own Stills. Build on his numbers, or take the most Docks yourself.
- **The Double.** Your Blowback risk is a second die of your number left in the pool. Draft to leave the Blowback on a rival's Still, not yours.

**Jobs and Bribes**

- **The Claim-Late Doctrine.** A held Job ties up its stake every Day. Build the position first, claim the morning you can finish it. Claim early only to beat a rival to it, or to bury the card that would carry a leader to 20.
- **Eat the 1s early.** Half of them ask for what your liquor does anyway.
- **The Cheap Rungs.** Buy the Captain and Alderman early: each brings a marker that pays for a Job's stake every Day after. Save the Mayor (the cheapest Respect, $1,250 a point) for last.
- **The Tell.** Assemble late and fast: six barrels arriving in one Move on the morning you claim is a done deal; six arriving over four Days is an announcement.

**The gun**

- **The Sucker Bet.** Never attack even numbers into a dug-in crew; bring double or triple, plan to win in two or three volleys, and Fall Back rather than grind. Read the FIGHT ODDS.
- **The Picket.** Most blocks are held by one to three men. Pay the toll once with enough to be sure: your Boss and three take two men better than eight times in ten.
- **The Sitting Duck.** A boss who has Laid Low or has an empty Ledger cannot Ambush. That is your afternoon: hit him then.
- **Fold, Check or Raise.** Fold scrap corners (men cost $300 to replace). Hold Fire is the check: he pays for every volley and takes the Heat. Ambush only with three or more men. Fold what you would lose anyway, but read his Jobs first: a Fold hands him a Seize.
- **Strangers Next Door.** Don't march an army. Secure your Safehouse one step from the target ($500) and Recruit there, late in the Day.

**The law**

- **Be loud in bulk.** One Heat marker per Extort or Unload however big, so squeeze many Districts and pour many barrels at once.
- **The Cold Trail.** A Raid chases the newest marker in each Squad's reach, not the most markers. Be loud right after a Raid; let others shout last.
- **Heat at 3 or 4 is not a reason to sit still.** Ask who the Raid would hit (the HEAT line tells you). If it would hit a rival, or a corner you can spare, laying the 5th marker is good: it refunds everyone's markers, moves Squads off Stills and Venues, and opens High Society rooms. **The Refund**: sometimes you want the sirens.
- **The Decoy Warehouse.** The Squad kicks the door with the most barrels. When your name is newest, make that a corner you can lose; when a rival's is, send barrels onto the door you want kicked.
- **The Liquor Defense.** At four Heat, if a man walks onto your block, Hold Fire: his first shot is the fifth marker, with his name on it.

**The table and the Crown**

- **Watch the leader's Boss, not just his count.** A rival at 16+ with a Bribe left and the cash for it, or at 19 with a Job one Play away, whose Boss is in or next to a crown room, crowns within a Day unless someone stops him. Stopping him is everyone's job: kill or chase his Boss (a kill sends him home to Rise), stand in his road, take or bust his stockpile, bury the card he needs. Say so at the table and split the work.
- **Be the last man up.** Once the others Lay Low they get no more turns. If a rival can crown this Day, don't Lay Low before him. If you can, plan to be the one still standing.
- **The Walk.** Take the rival Ward first, dig your Boss in (four men around him, a marker kept for the Ambush), then buy the last Bribe and crown on the same afternoon. The Eviction and Union Dues pay for the walk.
- **The Wax Seal.** Promise only what you alone control ("I won't cross the river today"), never what a third boss can ruin.
- **Cheap Paper.** A boss one Play from the Crown owes you nothing: every promise due at Sunset dies when he crowns.

**Your family's edge**

- **Sicilians:** the Hit is the one gun that reliably kills a Boss dug into a Ward. Consigliere (2 markers) removes any marker: pull a rival's to re-aim a Raid, or your own before a big pour or squeeze.
- **Irish:** the Tommy Gun wins by going through doors (two bursts take a fortress 43% against 11% for plain volleys). Hook steals Rum stacked next to your blocks, so hold blocks next to rival piles.
- **Vipers:** Stealth takes thin blocks with no Ambush and no Fold; snipe, don't lay siege. Whispers takes a card before it reaches the Market.
- **Knights:** Skiff lands five men on any coast, and three of the four home Wards are on the water. Torch burns a stockpile and a Safehouse.
`;export{e as default};