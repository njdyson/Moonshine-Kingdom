# Endgame: Respect Is the Only Score (2026-10-12)

**Status: shipped 2026-10-12** on the `claude/respect-endgame` branch (see *Shipped*, at the end).
Nick, after the discussion below: "I think the direction is the right one. It's thematic and easier
to teach than the current system." Then: "add these images for now and make the rule changes".
CLAUDE.md's *The crown is a Play* is now the short statement of the rules; this file keeps the why.

## Why

Nick: "I think 'the nod' is confusing." The Nod bundles two scores (Respect and Influence) and a
debt check into a status nobody holds a piece for, and it can be lost. He also thinks a bar of 10
Respect is "borderline too low".

## The proposal

1. **Take the Crown** stays a Power Play (2 Influence), made on your turn, with your Boss in a High
   Society Venue outside your home Borough (the three your Borough card names). Its one other
   condition is **20 or more Respect**. The Nod is retired as a term; the table's alarm is a
   Respect count, which is already public.
2. **Respect is your pile.** Jobs (1, 3 or 5) and Bribe cards (1 to 4) add to it. The Rat Card
   takes **3**, each Shylock's Mark you hold takes **2**, each Welsher takes 1.
3. **Bribe cards**, four kinds, four of each (16 cards):

   | Card | Price | Respect | Price per point |
   | --- | --- | --- | --- |
   | The Precinct Captain | $2,000 | 1 | $2,000 |
   | The Alderman | $3,000 | 2 | $1,500 |
   | The Judge | $4,000 | 3 | $1,333 |
   | The Mayor | $5,000 | 4 | $1,250 |

4. **Bribe** stays a Power Play (2 Influence) with your Boss on the board. Pay the price on any
   card in the piles, put the card in your Respect pile, and move one Influence marker from your
   supply to your Reserves. Buy in **any order**, but **one of each kind per boss** (Nick, same
   day): otherwise "you could nearly win by just buying Mayor cards, and you deny the other players
   the option", and it reads better as a ladder. Four of each is then one per seat, so no pile runs
   dry. Influence still starts at 6, with a ceiling of 10: your Influence is 6 plus your Bribe cards,
   so the cards are the count.
5. **Setup:** the 16 Bribe cards go in four face-up piles, one per kind, beside the board above the
   Jobs Market. Your 4 unbought Influence markers stay loose in your supply (Nick, same day: "it
   doesn't need to sit on a card in this system"). The Borough card's stack (since 2026-10-10) held
   them so a bare card could read as the city bought; with Influence out of the win, nothing needs
   to read it, and the Bribe cards in your Respect pile already show how many you've bought.
6. **Shylock:** the Loan ($1,500) and Square Up ($2,000) are unchanged. A Mark costs 2 Respect while
   you hold it and bars nothing on its own: not a Bribe, not the Crown.
7. **The Rat Card at 3.** It was 3 before the v0.9.7 streamline, which cut it to 2 because "at a
   10-point target, 3 was 30% of the crown" (`rules-streamline-handoff.md`). At 20 it is 15%.
8. **The Blood Oath at 40 combined Respect.** Nick's reason: lower than 40 and an Alliance could
   form already past the bar, so the Truce would hand it the game and the first of its bosses to
   reach a room would crown. Following from the rest (confirm when implementing):
   - Either partner may Take the Crown, with his own Boss in a room his own Borough card names;
     whoever crowns is the Capo. "The partner with all 10 Influence" goes.
   - "Neither partner holds a Mark" goes: a Mark is already 2 off the combined total.
   - Bribe cards always count. "Nothing on Your Books" is about Jobs, and a Bribe is not a Job.
   - The Truce ranks bosses by Respect, so Bribe cards count there too.

## Why these numbers

- **Respect rises with price, so the order is a choice.** With 2 Respect on every card, everyone
  would buy the cheapest first and the names would be decoration. Now the Precinct Captain is the
  cheap tempo marker and the Mayor is the cheapest Respect: take the Captain now for the marker, or
  sit on cash for the Mayor? Cash is open information, so a boss saving for the Mayor is visible and
  his bankroll, barrels and bars are worth attacking. That is the leader check the escalating
  ladder was built to give (`rules-streamline-handoff.md`, "The Bribe ladder").
- **The prices are the old ladder's**, $14,000 for all four. The streamline gave two reasons for
  escalating: each marker is worth less than the one before, and the 10th bought the Crown. The
  second is gone (no Bribe completes anything); the rising Respect now answers the first.
- **Ten of the 20 can be bought.** A boss who buys all four still needs 10 from Jobs, the bar the
  deck is tuned for today. If cash proves too strong, 1 / 2 / 2 / 3 caps Bribes at 8.
- **This is not the rejected "Nod still worth 10, plus a Crown Play at 20"** (CLAUDE.md). That 10
  was dead weight because every winner had to hold the Nod, so it only moved the bar. Bribe cards
  are optional: a boss can skip them, buy the cheap ones, or buy all four.
- **Why the dearer card pays more Respect, in the fiction:** Respect is your name on the street. A
  bent cop is nothing to boast about; the Mayor at your table makes the front page.

## Theme and art

Nick generates the art; aim for what suits the theme best.

- **Job titles, not real names.** History is a nod, not a lesson: most players won't know the real
  men, but everyone knows what a judge is for. The Rulebook's own list ("every judge, alderman and
  precinct captain") is three of the four, with the Mayor on top. The art carries the faces.
- **The Precinct Captain:** uniform and brass buttons, on a street at night, an envelope going into
  his cap.
- **The Alderman:** Tammany's man on the Board of Aldermen (licences, permits, votes). Nick's
  fedora portrait (green banker's lamp, leather chair, back room) reads as a Tammany clubhouse.
- **The Judge:** robes, in chambers, an envelope under the law books.
- **The Mayor:** a slim, dapper, late-night man at a nightclub table (Jimmy Walker, unnamed), with
  Texas Guinan working the room behind him. The top Bribe is then pictured in the kind of room
  where the Crown is taken.
- **Texas Guinan is not a card.** She isn't an official, so she would be the one card that breaks
  "Influence stays political". `Art/Texas.png` (the portrait Nick shared) is in the repo and unused;
  she suits the Mayor's background, a High Society Venue or The Almanac.
- `Art/Cards/Night Mayor.jpg` (the cut Title's art: a heavyset boss in a leather chair, a jazz band
  behind) is also unused. It reads as a nightclub owner more than a mayor.
- **Card face:** the price, the Respect drawn the way the Jobs cards draw it (so a Bribe reads like
  a Job in the Respect pile), and the marker.

**Art (Nick, 2026-10-12, second round; not yet in the repo).** Four 1536 x 1024 images, so 3:2,
the Cards sheet's 57 x 38 mm frame, with nothing lost to the crop. Four distinct men: a burly young
Captain in the rain, a hand in a fedora dropping the envelope into his cap (the Boss making the drop
in person); a jowly Alderman with a cigar under the flag and bunting; a thin old Judge in round
glasses, the envelope under his law books; and a slim dandy of a Mayor in a fur-collared coat at a
nightclub table, with Texas (cream hat and fur, as in `Art/Texas.png`) on his shoulder. Each has one
envelope, which ties the set together, and the set climbs from the street to the club. The first
round was square and one face in four costumes; both are fixed.

Beside them, the existing Rat, Shylock and Welsher art was dark and sepia. Nick went the other way
the same day: he regenerated those three brighter, since bright art prints better on the dark card.
Average brightness (0 to 255): the old three 17 to 20, darker than anything else on the Cards and Jobs
sheets (the Jobs art runs 22 to 66); the new three 51 to 63; the Bribe set 41 to 75. The darkest art
still in use is on the Jobs sheet: `Last One Standing.jpg` 22, `Tenament Army.jpg` 27, `Skiff.jpg` and
`Bloody Sunday.jpg` 28, `Quiet Drop.jpg` and `Scheme.jpg` 31. None of the new images is in the repo yet.

## Rejected on the way

- **Respect gates the Bribe ladder; the Crown needs only a bare Borough card** (Nick's first idea).
  Respect would be checked at each Bribe and never again, so once the card was bare the Rat Card and
  Welshers cost nothing. "No Bribe while in debt" left Loans free at the top (a Mark's only cost
  today is barring the Crown) and stopped Shylock funding a Bribe at all.
- **Keep the three conditions, drop the name.** The smallest change; superseded.
- **A flat price** ($3,000, or the old $2,500). Order stops mattering, and the first marker gets
  dearer, which the Jobs handoff warns against: the 7th and 8th are the rungs that make holding Jobs
  affordable.
- **Every card at 2 Respect.** Always cheapest first.
- **One Bribe per High Society Venue, the Boss visiting each.** The rooms start padlocked under
  Squads until a Raid, so the tempo markers would wait on Raids; a four-room tour is long (Morris
  Park is three or more Moves from every other home); and the away crown already makes the Boss walk.
  The lighter "Bribe only with your Boss in a room" waits on the padlocks too.
- **One shared copy of each official.** A second market to balance, with a race to deny the Mayor.
- **Powers on the cards.** That is the cut Title cards coming back. Price, Respect and one marker.
- **Names:** not "Ward Boss" (Ward and Boss are both game terms), not "Commissioner" (the
  Commission), not "the Night Mayor" (the cut Title's name).

## Watch in playtest

- **Cash's share.** Up to 10 of the 20; 1 / 2 / 2 / 3 is the fallback.
- **The Precinct Captain pays twice** (a tempo marker and 1 Respect) for $2,000.
- **Jobs at a bar of 20.** The deck holds 92 Respect in 36 cards, and completed Jobs never return.
- **Shylock.** A boss with Respect to spare can carry a Mark to the Crown, and The Almanac's Blood
  Oath padlock ("his Mark is your padlock until he's clean") is gone.
- **The Rat at 3.** The Almanac's observation that a leader wearing the Rat Card gets two points
  back from every later Rat becomes three.
- **Game length.** Bribes are optional again, but the bar is 20. Untimed, as before.
- **Unchanged and still worth watching:** the last boss up, three-player kingmaking, the room as a
  fortress.

## Shipped (2026-10-12)

Every item on the old "When Nick says go" list is done, art first:

- **Art/Cards:** the four Bribe portraits (`Precinct Captain.jpg`, `Alderman.jpg`, `Judge.jpg`,
  `Mayor.jpg`) and the brighter `Rat.jpg`, `Shylock.jpg` and `Welsher.jpg`, all 898 x 599 JPEG q88 as
  `tools/optimise_art.py` sizes card art. The Respect shields were then redrawn as
  SVG the same day (`tools/build_shields.py`, `Art/Shields/`), replacing every shield PNG.
- **Rulebook:** opening scene, components (Bribe Cards (16)), the Goal page (its second section is
  now **Bribes: Buy the City**, with the four prices inline), Setup (the piles; markers in the
  supply), Beg, Bribe, Rat, Winning the Game (Take the Crown as a two-item list: the Name, the Room;
  Count Your Respect gains **Friends in High Places** and **On the Hook**), the Blood Oath and the
  Glossary (Bribe card in, the Nod out). Still 23 printed pages, measured in headless Chromium. A
  table of the four cards on the Goal page pushed it to 25; the prices went inline instead, and the
  "bent cop" line moved to the Mayor's card.
- **Cards:** four sheets of the payroll (sheets 6 to 9, one of each per sheet), the Rat at -3, the
  Marks at -2, Borough cards without the stack or the Nod. The titles drop "The": "The Precinct
  Captain" needs 8pt to fit the title box, so all four read Precinct Captain, Alderman, Judge, Mayor.
  The art lift drops from 1.2 to the Jobs deck's 1.1, since the plates are bright now (Nick redrew the
  four Borough plates brighter the same day: 39 to 55 became 52 to 67); his second Bronx drops a patch of
  modern graffiti, and his second Welsher drops the garbled contract text and the real brand label; his second Shylock drops
  the skullcap and the Old Crow poster, so he reads as a loan shark, not a caricature. Every card measures 88mm with no overflow.
- **Playbooks, Town Planner, Federal Crackdown Tracker:** the Beg, Rat and Bribe rows; the crown
  plaque and the Respect line; 40 combined. Playbook rows measure identical to before.
- **The Almanac:** The Cheap Rungs, Bury the Card, The Refund (which also had a stale "pays 3
  Respect" for The Insurance Job, a 1 since 2026-10-11), Cheap Paper, The Walk (maxim now "Go in
  first; buy the Mayor last"), The Cartel (maxim now "Watch his Boss, not his count") and The Shotgun
  Wedding. Lesson names kept. Still 16 pages.
- **CLAUDE.md**, **`mk-online-rules-sync.md` §31** (the port table and a checklist line), and a
  comment in `tools/gen_deck.py` on the Rat's price.
- **Playbooks** (later the same day, Nick): Take the Crown closes each front as a gilt row after
  Lay Low ("20+ Respect and your Boss in a room your Borough card names: you win"). Room came from
  dropping the "Mob Playbook" kicker and taking Beg, Rat and Bribe to one line each.
- **The site's Cards tile** (`Art/Index/cards.jpg`) was the cut Night Mayor Title's art; it is
  now the Mayor's Bribe portrait, cropped to 800 x 450.
- Untouched: `The Volstead Act` (shelved), the board (its crowns mark the rooms, which haven't moved),
  and older handoffs, which are history.
