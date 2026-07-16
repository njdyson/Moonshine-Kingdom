# The Jobs System — Handoff (v0.8, 2026-07-16)

Everything needed to resume the Contracts → Jobs overhaul cold. Written for whoever
picks this up next, human or agent.

**Status:** design settled, deck ~26/36 written (10 draft objectives proposed), **rulebook v0.8 drafted**.
**Live files:** `Jobs Cards v0.8.html` (deck), `Turn Structure and Ledger v0.7 Reskin.html`
(venue names + Pressure), `Playbooks v0.7 Reskin.html`, **`Rulebook v0.8.html` (the Jobs rulebook,
print-verified 22pp A4)**. `Rulebook v0.7.html` is the superseded contract-system edition.

> **READ §0 FIRST — it supersedes several rows of the §2 decision table.**

## 0. Addendum — 2026-07-16 evening (rulebook drafted; decisions revised with Nick)

- **Claiming — Hustle is now a Shadows step, not an Operations Play.** Grease the Wheels runs:
  (a) *Yesterday's News*: discard the stale-end Market card, refill (moved here from Reckoning);
  (b) *Hustle*: in Turn Order, each boss may claim one Job, staking from Reserves — no 1-Influence
  fee, the stake is the cost; (c) *Fund the Ledger* from what's left. This kills the telegraph
  problem (holding markers back all day announced a Score) and the two-source mid-day confusion.
  Reckoning is now just Sweep + Stake Your Claim.
- **Multi-Job Plays — allowed, but the deck is CURATED against strict nesting.** A "one Job per
  Play" rule was tried and REJECTED (fiddly exception). Rule of thumb: overlap is fine when
  *additive* (combined cost ≈ sum, e.g. Five Families + a borough Extort slice) or *Gig-sized*
  (Last Call inside a bigger Unload); it is forbidden when a Racket+ card sits strictly inside
  another (a free 8+ Respect swing on one Play). De-nested this pass: **Big Squeeze → Brooklyn
  $600+** (flavour reworded, "the island" is gone); **King of Queens → Extort Queens $800+** (was
  Unload at The Triangle, nested inside Opening Night); **Poison Panic → 6+ Moonshine at a $300
  Speakeasy** (was High Society, same nest); **Rum Row → Staten Island Dock, Rum Wars → mainland
  Dock** (were 4+/8+ at any Dock, fully nested). Extort quartet now: Empire State M $1,000 (Score),
  King of Queens Q $800, Big Squeeze Bk $600, Black Hand Bx $600 — all disjoint, all additive with
  Five Families.
- **Abandoning:** free, any time on your turn (not a Play); card → discard pile, markers home.
  Reckoning-only abandon considered and dropped (denial happens at claim, so abandon timing can't
  fix it); it's the ready patch if playtest shows deny-spam.
- **Vipers' Whispers RESOLVED:** when they Hustle they may peek at the Jobs deck's top card and
  claim it face-down instead of a Market card; rivals see the Stake, never the job; reveal on
  completion. Nick rates it strong — watch in playtest.
- **Resolution rule wording:** Nick found §2's "write it exactly like this" text confusing; the
  approved rulebook version is *"A Job is a deed, not a board position… The deed counts even if it
  didn't survive the Play."* Do not restore the old wording. The rulebook also defines **Seize**
  (take Control of a District from a rival) since three cards hang on it.
- **Known gaps for the next agent:** only **4 Gigs** exist but 4-player setup needs 5 to seed the
  Market — the remaining ~10 cards must skew Gig. **Open Fire is ×6** (worst over-representation).
  The 10 draft objectives are filled but still in the screen-only draft gallery pending Nick's
  promotion. Conjunction overlaps were kept deliberately as "skilled moves" (a Boss killed in a
  Queens Speakeasy fires Toll Booth Trap + Irish Goodbye together) — watch the Queens pile-up.

---

## 1. What changed, and the one argument that matters

**Contracts** were secret, blind-drawn, board-state snapshots checked at a ticking deadline.
**Jobs** are public, action-triggered, drafted from an open face-up market, and complete the
moment you perform the trigger.

The reason isn't "the old one had too much RNG" — that was the presenting complaint, and it was
half wrong. The real faults:

1. **Redundancy.** Deeds pay for holding a Borough. Titles pay for holding the most X. Contracts
   paid for "control 3 Speakeasies in Queens." That's *the same verb at three prices* — Contracts
   weren't a third pillar, they were a reskinned Title with a countdown. Jobs make the Respect
   layer **doing** rather than **holding**. This is the load-bearing argument. Everything else is
   downstream.
2. **Unfixable draw variance.** Hustle was once/Day, draw 2, hand limit 3. Draw a card your
   position can't serve and you couldn't cycle it. An open market fixes exactly this by turning a
   random draw into a decision.
3. **The snapshot rule cost the soul, and it was solving a problem its replacement solves better.**
   It was imposed to make objectives verifiable. But a snapshot checked at simultaneous Reckoning
   is the *hardest* thing in the game to adjudicate. An action-triggered Job is self-witnessing —
   you do it, everyone watches, nothing gets audited.

**This is a restoration, not a new darling.** `Archive/Moonshine Kingdom v10/Job Cards.html` was
already action-triggered ("Ensure one of your own Stills is Condemned in a police Raid";
"Sacrifice your boss by getting him killed in combat, then Crown a new boss in the District that
killed him"). v0.7 stripped the granted powers (correct — Titles absorbed that role) *and* imposed
snapshots (the part that hurt). Only one of those two changes was necessary.

---

## 2. Decided — do not re-litigate

| Rule | Decision |
|---|---|
| Tier → Stake → Respect | Gig 1→1, Racket 2→3, Score 3→5. Stake from Reserves at claim, returns on completion. |
| Claiming | **Hustle**, 1 Ledger Influence, **once per Day**, one Job. The once-per-Day cap is load-bearing — it's what stops Job throughput scaling with wealth. Don't quietly drop it. |
| Multi-Job Plays | **Allowed.** Needs no rules text; the deck is written for minimal overlap. |
| Declaration | None. You do the thing; the trigger fires. |
| "No Boss, No Business" | **Dropped** as a simplification. Claiming no longer requires a living Boss. |
| Market size | Player Count + 1, face-up. |
| Market churn | **Conveyor.** Market is a row; new cards enter at the fresh end. Each Reckoning, the card at the stale end is **discarded**. |
| Refill | Whenever a Job leaves the market for any reason, **slide the row closed and deal its replacement at the fresh end** — immediately, not at Reckoning. One rule covers claims and expiry both; the Reckoning step is just a discard, not a procedure. |
| Discard | **Yes, a real discard pile**, reshuffled when the deck runs dry. (Bottoming instead would make the deck a fixed loop — with no reshuffle trigger, setup order would hold all game and the same unloved card would return on a metronome.) |
| Abandoning | Free — markers back. Watch it in playtest; Hustle-once-per-Day means a speculative claim burns your whole Hustle, and that may be price enough. |
| Deck size | ~36. **Completed Jobs leave the game permanently** (Respect pile), so the deck is *consumable* — it must exceed expected completions plus buffer. |
| Setup | Seed the market with Gigs only; bigger Jobs filter in as Gigs are claimed. |

### The resolution rule (write it exactly like this)

> **The Play is the unit.** At the end of each Play, check whether that Play performed a Job's
> action. Events that happened during the Play count, **even if their effects were undone before
> the Play ended.**

Jobs are **events, not states** — that's the whole difference from the snapshot deck. "Kill a rival
Boss" is a thing that happened; losing the firefight afterwards doesn't un-kill him.

**Consequence — the edge case is already ruled:** Moving into hostile turf triggers a Standoff, but
the Move Play *completed* — the barrels are across. So the Job fires, and *then* you're in a
firefight you may lose. You made the crossing; keeping the load is a separate story.

---

## 3. The two tests every card must pass

1. **Contestable:** does it make me build toward something rivals can *see and contest* — or does it
   pay me for the line I was already playing? *"Seize a District containing a rival Safehouse"*
   passes. *"Earn $600 from a single Extort"* fails — that's a Title in disguise wearing a verb.
2. **Respectable:** Respect is *standing*, not points. A Job must be something you'd brag about.

Test 2 is why **Bribe, Beg and Rat cannot carry Jobs.** Bribe is paying off cops. Beg is going to a
shylock hat-in-hand. Rat is informing — and the Rat Card exists precisely to say *you are
dishonoured* (it blocks your crown), so a Job paying Respect for it has the game arguing with itself.
The seven usable verbs are **Move, Unload, Trade, Extort, Open Fire, Secure, Recruit** (+ **Rise**,
which works: coming back from a decapitation is very respectable).

### Card-writing rules

- **Event framing forces precision:** an event has an actor, an object and a moment — name all three.
  *"Seize a District which **contains** 5+ Mobsters"* is ambiguous (contains when? whose?).
  *"Seize a District **defended by** 5+ Mobsters"* means the garrison you had to beat.
- **Scores are single-Play with enormous setup, never "do X, N times."** A multi-Play Job isn't
  triggered by any single Play and would need progress tracking on the card. The tier ladder is
  *how much board must exist before the one Play lands*: Gig ≈ none, Racket = a real position,
  Score = a campaign. That's "difficulty is the master knob" turned into card text.
- **Difficulty is the master knob**, not the marker cost. Stake cost = markers × Days held, so harder
  Jobs sit staked longer — slowing Respect, consuming the leader's slack, and widening the window for
  rivals to interfere. One dial, lives in the deck, tunable per card.
- **Name specific locations.** A named Job is a **deterrent before anyone claims it** — "Kill a rival
  Boss in Queens" sitting face-up moves four Bosses whether or not it's taken. A secret card could
  never do that. This is an argument *for* the whole open-market pivot.
- **Method:** mine the old decks for name + art, write a fresh event objective, place it wherever the
  borough quota is short. `Art/Jobs/_contact sheet.png` shows all 58 images — **look at it, don't
  guess from filenames** (`Gatsby.png` is a car chase, not a party; it cost three wrong assignments).

---

## 4. Board facts the deck is written against

**Verified from `Turn Structure and Ledger v0.7 Reskin.html` and `Rulebook v0.7.html`.**

### Generic targets that are self-balancing (use freely, no quota)
Every mainland borough has **1 Ward, 1 High Society, 2 Speakeasies, 2 Pressure-5+ Stills**. So any
card written against a generic one of those is automatically fair. This is the v0.75 symmetry work
still paying out.

### Targets that are NOT balanced
- **Docks:** Manhattan 2, Queens 2, Bronx 1, Brooklyn 1, Staten 2. Dock cards mildly favour
  Manhattan/Queens.
- **District counts:** Manhattan 6, Queens 6, Bronx 5, Brooklyn 5, Staten 3.
- **Every mainland borough permanently has one District under a Police Squad**, and squad turf can't
  be Controlled. So real availability is **Manhattan 5, Queens 5, Bronx 4, Brooklyn 4.**

### The Extort quartet (scale the number, never copy it)
Extort is one map-wide collection at $200/District, once per Day, always Heat. You can't "Extort
Manhattan" — you measure the *Manhattan slice of it*.

| Borough | Districts | Available (minus Squad) | 4/5ths of it | Card reads |
|---|---|---|---|---|
| Manhattan | 6 | 5 | 4 | **$800+** |
| Queens | 6 | 5 | 4 | **$800+** |
| The Bronx | 5 | 4 | 3 | **$600+** |
| Brooklyn | 5 | 4 | 3 | **$600+** |

### Other facts worth knowing
- **`Pressure = 6 − |Still − 7|`** — how close the boiler sits to the most probable 2d6 roll. Written
  down nowhere but the ledger's values; verified across all 25 Districts. Pressure 5+ = Stills 6, 7, 8
  = exactly 9 Districts, four of which are the High Society venues.
- **All Docks connect to each other across water as one Move Play** (rulebook's own example: "West
  Side to Throggs Neck in one Play"). This makes **Staten Island the best-connected borough on the
  board for barrels** — and nobody goes there. Westerleigh is Still 2 / Pressure 1, so it brews almost
  nothing: you must *haul* moonshine there before you can smuggle it out. That's what *The Smuggler's
  Run* is built on.
- **Staten Island is nobody's Home Turf**, so naming it is always neutral.
- **Bridges are unnamed on the board.** Nick is researching real names and will label them. The only
  crossing the rulebook documents is Williamsburg ↔ Five Points (historically the Williamsburg
  Bridge), which is what *The Milk Run* currently uses — swap when the board lands.

### The spread rule
> Generic **Ward / High Society / Speakeasy / Pressure-Still** targets are self-balancing — use freely.
> **Named** mainland locations get a hard quota of **four per borough** across the finished deck.
> **Docks** and **Extort slices** are uneven by construction — scale the number, don't copy it.

**Current named tally: Manhattan 2, Brooklyn 2, Bronx 1, Queens 1.** Tilted; correct it as you write.
*The Milk Run* is the lever — whichever bridge you name decides which two boroughs it charges, so
choose it last.

---

## 5. Deck state

**16 finished + 10 theme-locked drafts** in `Jobs Cards v0.8.html`.

Verb spread: Open Fire ×4, Unload ×3, Move ×2, Trade ×2, Extort ×2, Secure/Recruit/Rise ×1.
**Open Fire is over-represented** and it's the verb that most needs an army — combat mobs get more
Job options than trade mobs. Watch it.

**Drafts** carry name + art + flavour with the objective open, tagged with a suggested verb
(bottom-left) and the borough the quota needs (bottom-right). They're screen-only, excluded from print.
Theme-first was Nick's call and it's the right way round — it's easier to fill in an objective under a
theme than to bolt a theme onto a mechanic.

### Cut, and why
- **The Frame Job** (*Play Rat, have the Raid seize a rival's barrels*) — dead on the respectability
  test. A rat cannot gain Respect.
- **The Whole Town** ($2,000 Extort = 10 Districts = 40% of the map) — a card you can only complete
  once you've already won.
- **Two in the Hat** (*kill a rival Boss*, unqualified) — too easy for a Score, and killing a Boss is
  already enormous. Replaced by **The Toll Booth Trap** (*kill a rival Boss **in Queens***): harder,
  circumstantial, political, and a Godfather reference. Nick's call and clearly right.

---

## 6. Build facts (save yourself the rediscovery)

- **Art wells are 57×38mm = exactly 3:2** — the native ratio of 55 of the 58 job images (1536×1024).
  **Changing one number without the other silently crops the art.** There's a comment on the rule.
  (`Blow the Lid`, `Ghost Town`, `Last One Standing` are 1448×1086 = 4:3 and still crop slightly.)
- **Print art recipe:** `filter: brightness(1.1) contrast(1.08) saturate(1.04)` — lifts art off dark
  stock. Established by `.job-image-container` in `Contract Cards v0.7.html:18`. Don't darken art.
- **Icon canon:** `Gin.svg` = Speakeasy, `Crown.svg` = High Society, `Fist.svg` = Ward,
  `anchor.svg` = Dock, `fire.svg` = Heat. All black source art, tinted by the canonical filter at
  `css/moonshine-rules.css:161` (kept in `:root` as `--gold-tint`). `hat.svg` is dead.
- **Respect badges:** `Art/shield1.png` / `shield3.png` / `shield5.png`, number baked into the art,
  12.5mm top-right. Element carries no text.
- **The Reskin files are canonical.** They're class-based now — **don't let inline styles creep back
  in**. Refactor before making a content change to any that are still inline-styled.
- **`display:flex` eats whitespace between inline children.** `.job` flexed directly turned every
  `<b>` into a flex item and rendered "Move4+ Barrelsacross aBridge". The text must stay wrapped in a
  single `<span>`. Same trap will bite any centred rich-text box.
- **Source order beats specificity at equal weight.** `.gallery--draft{display:none}` placed *before*
  `.gallery{display:grid}` silently failed and the drafts printed. Print overrides go last.

### Verifying a change (this works; reuse it)
```bash
chrome --headless --disable-gpu --no-pdf-header-footer --virtual-time-budget=12000 \
  --print-to-pdf="<ABSOLUTE WINDOWS PATH>" "file:///<url-encoded path>"
```
Chrome **needs an absolute Windows path** for `--screenshot`/`--print-to-pdf` — relative or bash-style
paths fail with "Access is denied." Then check with pypdfium2: Jobs deck = **10 A4 pages
(595×842pt), no blanks**. To eyeball one card, `sed` a temp copy into the scratchpad injecting
`<base href="file:///G:/My%20Drive/Moonshine%20Kingdom/Moonshine%20Kingdom/">` plus a rule hiding the
others, and render with `--force-device-scale-factor=2`. **Actually look at the image** — that's what
caught the Gatsby mistake and the 13% crop.

---

## 7. Open questions

- **Which of the 10 drafts earn a slot**, and their objectives. Nick wants to work theme-first.
- **The named-borough quota is unfilled** (M2/Bk2/Bx1/Q1 → needs 4 each).
- **Open Fire over-representation.**
- **Free abandon** — watch in playtest.
- **East Side Vipers' Whispers is structurally obsolete** in an open-information game. It needs a new
  fantasy, not a patch. Candidates: claim a Job face-down (rivals see the stake size, so they know the
  *tier* but not the card); or a stake discount. Nick has deprioritised it as downstream of the core loop.
- **Rulebook v0.8 is not started.** Deliberately: the deck generates the rulebook's TODO list for free,
  and prose written before the deck settles gets written twice. `Rulebook v0.7.html` still describes
  Contracts, deadlines, Hand Limit 3 and the old Hustle throughout.

## 8. Playtest — the three things to measure

1. **Does the market silt?** Count face-up cards untouched for 3+ Days. More than one → the conveyor
   isn't churning hard enough.
2. **Does the leader ever leave a marker in Reserves involuntarily?** At 10 Influence the Ledger caps
   at 5, so 5 markers have no competing use and the stake is free. If the leader never feels it, the
   ceiling/cap coincidence needs a nudge.
3. **How many Days after someone hits 10 Influence does the game end?** Consistently under four → Jobs
   have become the whole endgame and Deeds/Titles are decoration.

### The one structural crack to keep an eye on
**Churn and stake-cost were on the same dial, and the conveyor is what decoupled them.** The Heat
Track is shared, 5 deep, and *fully amnestied* on every Raid — so Heat is a **flow, not a stock**.
Nobody can carry enough to squeeze their own stake capacity, and the more you carry the sooner the
amnesty. That means **Heat can be a churn dial or a tax dial, never both**. If churn ever gets
re-attached to Raids, this breaks again.
