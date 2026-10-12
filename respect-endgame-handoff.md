# Endgame: Respect Is the Only Score (2026-10-12)

**Status: direction agreed, nothing implemented.** The live rules (the Nod, the Bribe ladder, the
Mark barring the Crown, the Rat at 2) stand until Nick says to make the change. Nick, after the
discussion below: "I think the direction is the right one. It's thematic and easier to teach than
the current system."

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
   supply to your Reserves. Buy in **any order**. Influence still starts at 6, with a ceiling of 10:
   your Influence is 6 plus your Bribe cards, so the cards are the count.
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

## Open

1. **Can a boss buy two of the same card?** Not yet decided. Four of each suits one of each per
   boss: at four players every boss can buy the full set and no pile runs dry. Without that limit a
   rich boss could buy Mayors at the best rate (four would be 16 Respect for $20,000) and empty the
   pile on the table.
2. **The Borough cards' text.** The stack and the Nod line go. The card keeps the home Borough, the
   home Ward and Take the Crown, which reads "20+ Respect, your Boss in X, Y or Z".

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

## When Nick says go

A grep on 2026-10-12 found "the Nod" in the Rulebook (12), Cards (8), The Almanac (7) and Playbooks
(4). The set to change:

- **Rulebook:** The Only Crown Worth Having, Your Goal, Influence: Buy the City (its one-line why,
  "The families bring the guns. The new man brings the city.", needs a new home or a new line), Bribe,
  Beg, Rat, Winning the Game (The Nod goes; Take the Crown; Count Your Respect), Setup (the piles;
  the 4 unbought markers stay in your supply, not stacked on the Borough card), the component list
  (16 Bribe cards), the Blood Oath (The Target, Claiming the Empire, One Crown, One Capo), and the
  Glossary (the Nod goes; Mark, Respect, Rat, Supply, and a Bribe card entry).
- **Cards:** the Borough cards (no stack, no Nod line), the Marks (−2 while held), the Rat (−3), and
  a new Bribe card sheet.
- **Playbooks:** the Beg row ("Any Mark bars the Crown"), the Bribe row's prices, the Rat.
- **Town Planner:** The Crown & Sunset.
- **Federal Crackdown Tracker:** 20 combined becomes 40.
- **The Almanac:** The Cheap Rungs, The Walk ("buy the tenth judge last", "the Nod and the crown are
  two Plays on one afternoon"), the Blood Oath lessons ("only one of you needs to buy the city", the
  Mark as padlock), and every "a Bribe short" and "the Nod" passage. Grep for the argument, not
  just the words. Keep the lesson names.
- **CLAUDE.md:** the Setting bullets on the Nod and the endgame order, "The crown is a Play", "Borough
  cards" (its stack and the reasoning behind it), "Everything is on the table", and the Bribe ladder paragraph.
- **mk-online:** a new section in `mk-online-rules-sync.md` (the engine is `njdyson/mk-online`).
- `The Volstead Act` is shelved; leave it.
