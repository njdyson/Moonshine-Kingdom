# The Jobs System — Handoff (v0.8, 2026-07-17)

Everything needed to resume cold. Written for whoever picks this up next, human or agent.

**Status:** design settled. **Rulebook v0.8 print-verified: 23pp A4, no blanks.** Deck is
**26 of 32 cards**, and building it out is the next job.

**Live files:** `Rulebook v0.8.html` · `Jobs Cards v0.8.html` (deck) ·
`Turn Structure and Ledger v0.7 Reskin.html` · `Playbooks v0.7 Reskin.html` ·
`Brew Engine Strategy v0.8.html` + `Brew Simulator v0.8.html`.
`Rulebook v0.7.html` is the superseded Contract edition — expect it to disagree with everything here.

> This doc is flat and current. There is no addendum; if it's written here, it's true as of v0.8.

---

## 1. The system in one line

Deeds and Titles pay you for what you **hold**; Jobs pay you for what you **do**. Jobs are public,
action-triggered, drafted face-up from a market of Player Count + 1, and complete the moment you
perform the trigger. No deadlines, no declarations, no hand.

**The load-bearing argument** (do not re-litigate): Contracts were board-state snapshots on a
countdown — the same verb Deeds and Titles already paid for, at a third price. Jobs make the Respect
layer *doing*. Everything else is downstream. This is a restoration: the v10 deck
(`Archive/Moonshine Kingdom v10/Job Cards.html`) was already action-triggered.

---

## 2. Decided — current as of v0.8

| Rule | Decision |
|---|---|
| A Job prints | A **Stake** (Influence locked from Reserves at claim, returned on completion) and a **Respect** (1, 3 or 5). That's all. |
| Tier names | **Gig / Racket / Score are RETIRED** as game terms (v0.8). Cards carry no tier word. Sort by the Respect shield. |
| Claiming | **The Nod**, a step inside Shadows → Grease the Wheels. One Job per Day, no fee — the stake *is* the cost. |
| Nod order | **Reverse Turn Order.** Last boss off the street last night picks first. ("First to the mash, last to the handshake.") |
| No Boss, no business | A crew with no Boss on the board takes no Nod. |
| Holding Jobs | No hand limit. Run as many at once as your Reserves can stake. |
| Market | Player Count + 1, face-up, a row: **fresh** end by the deck, **stale** end far. |
| Churn | **Conveyor.** Each Shadows (*Yesterday's News*) the stale-end card is discarded. Whenever a Job leaves for any reason, close the gap and deal at the fresh end **immediately**. |
| Discard | A real discard pile, reshuffled when the deck runs dry. Completed Jobs leave **permanently** (Respect pile) — the deck is consumable. |
| Abandoning | Free, any time on your turn, not a Play. Card → discard, markers home. |
| Resolution | **The Play is the unit.** A Job is a deed, not a board position. It counts even if undone before the Play ended. |
| Deck size | **12 / 12 / 8** (1s / 3s / 5s) = **32 cards printed**. |
| Setup | **3 ones, 3 threes and 2 fives PER PLAYER** (2p 6/6/4=16, 3p 9/9/6=24, 4p 12/12/8=32). Rest to the box unseen. Seed the market with **1s only**. |

### Why the ratio is 3:3:2 (don't "simplify" this)
12/12/8 reduces to exactly **3:3:2**, so it scales to whole numbers at every player count and the
**per-player supply of small Jobs is identical at 2, 3 and 4 players**. That is what keeps the
escalation arc firing at the same point in the game regardless of table size. Bonus: at 2p you use
16 of 32 cards, so half the deck differs between games.

### The arc (this is a feature, and it replaced a Title)
Completed Jobs leave permanently; discards reshuffle. So the 1s bleed out one-way and the market
escalates on its own. **This is why Public Enemy No. 1 was cut** — the deck does its anti-farming
job structurally. Watch: the arc is **anti-catch-up** (when the 1s are gone, a trailing player has
no cheap Respect). The 12 threes are the buffer. If playtest strands trailing players, **add threes,
not ones.**

---

## 3. The overlap rule — READ BEFORE WRITING A CARD

**Never two 5s on one Play.** A 5 plus small change is fine. Overlap risk scales with the square of
the stack, which is the real reason the Score pool is small.

**Three clusters are currently BROKEN and must be fixed as the deck is built:**

1. **Queens Speakeasy Boss-kill = 15 Respect.** `Toll Booth Trap` (Boss in Queens) +
   `The Irish Goodbye` (Boss in a Speakeasy) + `The Butcher's Ledger` (5+ Mobsters in Queens) all
   fire on one Open Fire. **Agreed direction:** keep Toll Booth as the deck's *only* "kill a Boss";
   move **Butcher's Ledger to Brooklyn** (Murder, Inc. ran out of Brownsville — historically perfect,
   and Brooklyn is short on named cards); **re-theme The Irish Goodbye off the Boss-kill entirely.**
   The contact sheet settles the theme: `Goodbye.png` is a lone figure walking away from
   **O'Sullivan's Tavern** down a wet street — a man leaving without a word, not a decapitation.
2. **One Extort = up to 13 Respect.** `Five Families` (5) + `Empire State` (5) + `King of Queens` (3).
   The Influence ceiling brakes it but not enough: staking all five Extort cards costs 12 and the cap
   is 10, but Extort only needs 2 in the Ledger, so 8 staked → 13 Respect on a single Play — 87% of
   the win requirement. **`Five Families` is the free rider** ("a District in all five Boroughs" fires
   on any big Extort). Either it stops being an Extort card, or Empire State drops to a 3.
3. **Seize cluster = 11 Respect.** `The Eviction` (3, rival Safehouse) + `The Copper Heist`
   (3, Pressure 5+ Still) + `Over the Top` (5, defended by 5+ Mobsters) can co-fire on one Seize.

**Root cause of 1 and 2: over-broad qualifiers.** "in a Speakeasy" is 12 venues; "all five Boroughs"
is any big Extort. Name *specific* things.

---

## 4. The two tests every card must pass

1. **Contestable:** does it make me build something rivals can see and fight — or pay me for the line
   I was already playing? *"Seize a District containing a rival Safehouse"* passes.
   *"Earn $600 from a single Extort"* fails: that's a Title in disguise wearing a verb.
2. **Respectable:** Respect is *standing*. Would you brag about it?

Test 2 is why **Bribe, Beg and Rat cannot carry Jobs** — a rat cannot gain Respect; the Rat Card
exists to say you're dishonoured. Usable verbs: **Move, Unload, Trade, Extort, Open Fire, Secure,
Recruit** (+ **Rise**, which works: coming back from a decapitation is respectable).

### Card-writing rules
- **Event framing forces precision:** an event has an actor, an object and a moment. *"Seize a
  District which **contains** 5+ Mobsters"* is ambiguous; *"**defended by** 5+ Mobsters"* means the
  garrison you had to beat.
- **5s are single-Play with enormous setup, never "do X, N times."** The ladder is how much board
  must exist before the one Play lands: 1 ≈ none, 3 = a real position, 5 = a campaign.
- **Difficulty is the master knob**, not the marker cost. Stake = markers × Days held, so harder Jobs
  sit staked longer.
- **Name specific locations.** A named Job is a **deterrent before anyone claims it** — "Kill a rival
  Boss in Queens" sitting face-up moves four Bosses whether or not it's taken. A secret card could
  never do that. This is an argument *for* the whole open-market pivot.
- **Theme first** — name + art + flavour, then the objective. Nick's call and it's the right way round.
- **Method:** mine the old decks for name + art (`Contract Cards v0.7.html` has ~40;
  `Archive/` has more), write a fresh event objective, place where the borough quota is short.
  **`Art/Jobs/_contact sheet.png` shows all 58 images — LOOK AT IT, don't guess from filenames**
  (`Gatsby.png` is a car chase, not a party; it cost three wrong assignments).

---

## 5. Board facts the deck is written against

### The boiler census (verified from the Ledger — this constrains everything)
| Boiler | Count | Districts |
|---|---|---|
| **7** | **4** | Sugar Hill, Morris Park, Richmond Hill, Williamsburg — **all four are High Society, police-locked at setup, one per mainland Borough** |
| 4 | 3 | Corona, Sheepshead Bay, Tottenville |
| 6 | 3 | Flushing, Red Hook, Stapleton |
| 2, 3, 5, 8, 9, 10, 11 | 2 each | |
| 12 | 1 | East Harlem |

**Only 7 can be stacked four deep. Only 4, 6 and 7 reach three.** Everything else is a pair.
`Pressure = 6 − |Still − 7|` (written down nowhere but the ledger's values; verified across all 25).

### Generic targets that are self-balancing (use freely, no quota)
Every mainland borough has **1 Ward, 1 High Society, 2 Speakeasies, 2 Pressure-5+ Stills**.

### NOT balanced
- **Docks:** Manhattan 2, Queens 2, Bronx 1, Brooklyn 1, Staten 2.
- **Districts:** M 6, Q 6, Bx 5, Bk 5, Staten 3. Every mainland borough has one under a Police Squad
  and squad turf can't be Controlled → real availability **M5, Q5, Bx4, Bk4**.
- **Extort quartet** (scale the number, never copy it): M $800+, Q $800+, Bx $600+, Bk $600+ (4/5ths
  of available districts × $200).

### Other facts
- **All Docks connect across water as one Move Play.** This makes **Staten Island the best-connected
  borough for barrels** — and nobody goes there. Westerleigh is Still 2 / Pressure 1, so you must
  *haul* moonshine there before smuggling it out. That's what *The Smuggler's Run* is built on.
- **Staten Island is nobody's Home Turf**, so naming it is always neutral. Its Deed is boxed at setup.
- **Bridges are unnamed on the board.** Nick is researching real names. The only documented crossing is
  Williamsburg ↔ Five Points (the Williamsburg Bridge), which *The Milk Run* uses.

### The spread rule
Generic Ward / High Society / Speakeasy / Pressure-Still targets are self-balancing — use freely.
**Named** mainland locations get a hard quota of **four per borough**. Docks and Extort slices are
uneven by construction.

---

## 6. Deck state — 26 of 32

**Finished (16):** 5 × 1-Respect, 5 × 3, 6 × 5.
**Drafts (10):** in the screen-only `.gallery--draft` gallery, excluded from print, awaiting promotion.
Themes/art/flavour set; objectives written.

**To hit 12/12/8 from here:** promoting all 10 drafts gives **5 / 12 / 9**. So the threes are done,
the fives need **one demoted**, and the ones need **+7**.

**Demotion candidates to 1-Respect:** `Fortress Staten` (Secure into empty Staten is one Play with no
setup — it is not a 3), and one of `Hell's Highway` / `Poison Panic`.

**Flags:**
- **Open Fire is over-represented** — it's the verb that most needs an army, so combat mobs get more
  Job options than trade mobs.
- **32 of 58 images are unused.** Strong 1-Respect candidates read off the contact sheet:
  *Quiet Drop* (crates onto a boat at night), *Gin Pipeline* (crates through a tunnel), *Cobble Hill*
  (handshake over a bar), *Dock Domination* (tommy guns on a pier), *Old Guard*, *Switch*, *Jimmy*,
  *Ghost Town*, *Bathtub Chemistry*, *Full Steam*.
- `The Insurance Job` uses a **"Raid" trigger** (Have a Raid Condemn your Safehouse's District) —
  not one of the 7 Play verbs. Watch it.
- **Named tally after fills: M3 / Bk3 / Bx3 / Q3** (quota ≤4 ✓). The Triangle (Richmond Hill) = Queens
  High Society; Jockey Club (Morris Park) = Bronx.

---

## 7. Build facts (save yourself the rediscovery)

- **Art wells are 57×38mm = exactly 3:2** — the native ratio of 55 of the 58 job images (1536×1024).
  Changing one number without the other silently crops the art.
- **Gallery blocks MUST be exactly 4 cards + 4 backs.** Print is a 2×2 grid with
  `page-break-after:always`; a 5th card spills to its own page and the duplex front/back pairing is
  lost. There is a 1-card block at the end of the 1s — the next ones written go there, up to 4.
- **Print art recipe:** `filter: brightness(1.1) contrast(1.08) saturate(1.04)`. Don't darken art.
- **Icon canon:** `Gin.svg` = Speakeasy, `Crown.svg` = High Society, `Fist.svg` = Ward,
  `anchor.svg` = Dock, `fire.svg` = Heat. Tinted by the canonical filter at
  `css/moonshine-rules.css` (`--gold-tint` in `:root`). `hat.svg` is dead.
- **Respect badges:** `Art/shield1.png` / `shield3.png` / `shield5.png`, number baked into the art,
  12.5mm top-right. The element carries no text.
- **`display:flex` eats whitespace between inline children.** `.job` flexed directly turned every
  `<b>` into a flex item: "Move4+ Barrelsacross aBridge". The text must stay in a single `<span>`.
- **Source order beats specificity at equal weight.** `.gallery--draft{display:none}` placed *before*
  `.gallery{display:grid}` silently failed and the drafts printed. Print overrides go last.
- **The Reskin files are canonical and class-based — don't let inline styles creep back in.**

### Verifying print (this works; reuse it)
```bash
chrome --headless --disable-gpu --no-pdf-header-footer --virtual-time-budget=15000 \
  --print-to-pdf="<ABSOLUTE WINDOWS PATH>" "file:///<url-encoded path>"
```
Chrome **needs an absolute Windows path** for `--print-to-pdf`. Check with pypdfium2.
**Targets: Jobs deck = 12 A4 pages, no blanks. Rulebook = 23pp, no blanks.**
For per-container overflow, drive Chrome via CDP (`--remote-debugging-port`, `PUT /json/new`, then
`Emulation.setEmulatedMedia{media:'print'}`) and measure `body > .container` heights against
**A4 = 1123px**. Every container must fit on one page or it spills and leaves a blank.
**Actually look at the rendered image** — that's what caught the Gatsby mistake, the 13% crop, and a
setup table that silently split a numbered step in half.

---

## 8. Playtest — what to measure

1. **Does the market silt?** Count face-up cards untouched for 3+ Days. More than one → the conveyor
   isn't churning hard enough.
2. **Does the leader ever leave a marker in Reserves involuntarily?** At 10 Influence the Ledger caps
   at 5, so 5 markers have no competing use and the stake is free. If the leader never feels it, the
   ceiling/cap coincidence needs a nudge.
3. **How many Days after someone hits 10 Influence does the game end?** Consistently under four →
   Jobs have become the whole endgame and Deeds/Titles are decoration.
4. **When the 1s run out, is the trailing player stranded?** (See the arc, §2.)
5. **Vipers' Whispers** (deck-top peek + face-down claim). Nick rates it strong.
6. **Free abandon** — Nod-once-per-Day means a speculative claim burns your whole Nod, and that may be
   price enough. Reckoning-only abandon is the ready patch if playtest shows deny-spam.

### The one structural crack to keep an eye on
**Churn and stake-cost were on the same dial, and the conveyor is what decoupled them.** The Heat
Track is shared, 5 deep, and fully amnestied on every Raid — so Heat is a **flow, not a stock**.
Nobody can carry enough to squeeze their own stake capacity. **Heat can be a churn dial or a tax
dial, never both.** If churn ever gets re-attached to Raids, this breaks again.
