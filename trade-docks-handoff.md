# Handoff: Trade Docks, the keg's cut, the board's Rum Row lanes, and an Opus test (2026-11-04)

For a fresh session. Nick's decisions are settled; the work is to write them into the game, redraw the board,
bring mk-online in line, and play one three-Opus game. Read CLAUDE.md first (house rules, no em dashes, one
callout a page, "don't argue with a cut rule's ghost"), then this file.

## Progress (2026-11-04, second session): start here

A, B and C below are done on this branch and mk-online's; D (the Opus game) has not been run.

- **A. Rules: done** (42590d3). Trade Docks are in, stated once in the positive (the Rulebook's Trade row,
  Docks legend, Liquor line, Battle for the Docks example and a Glossary entry; the Playbooks' Trade row;
  the Town Planner's four tags and key row, now "Trade Dock"; the Almanac's Rum run says "a Trade Dock").
  The keg is out of every component: the Cards sheet and the Playbooks are byte-for-byte their pre-keg
  selves (bar the Trade row), the Rulebook page, rows and Glossary lines are gone, `tools/mock_powder_keg.js`
  and its mockup are deleted. CLAUDE.md has a *Trade Docks* section, the keg section is a short record of
  the cut, and the Day 28 limit is noted as on trial. `overlap_audit.py` models Trade at the four only
  (same output). The keg's art (`Art/Cards/Detonator.jpg`, `Art/Rulebook/Powder Keg.*`) stays, unused.
- **B. Board: a draft for Nick** (the commit after 42590d3; `board-handoff.md`, Decisions, has the
  detail). A schooner hangs under each Trade Dock's medallion where the dynamite was; a faint dashed
  sea-green lane runs from each one's middle pier off the edge with "Rum Row" beside its arrowhead; the key
  has a Trade Dock row and its pitch went from 19 to 16 to fit. The lanes are drawn under the land, so
  they never cross a District. **Show Nick `Art/Board/Board v0.9 (screen).jpg` before anything copies
  it.** The print PDF is stale: `--print` died in the cloud sandbox on the 7280px screenshot ("Unable to
  capture screenshot"), so rerun `node tools/build_board.js --print` on a bigger machine once he approves.
  Then mk-online's `public/board.svg` follows (`mk-online-board-handoff.md`).
  **Nick's first round (2026-11-04):** Staten Island's label moved upright onto the west shore and
  Tottenville's piers onto the south-east shore; the lanes became curves; and he didn't love the
  sea-green, so the colour is on trial (four options in `board-handoff.md`, Decisions; `LANE_COLOR`
  proofs another). The committed board still uses the sea-green until he picks.
- **C. mk-online: done** (8233b86 on its `claude/powder-keg-rule-feedback-46lnh4`, unmerged; this repo's
  `mk-online-rules-sync.md` §47). Trade Docks on and the keg off by default (`rumrow=0`, `keg=main` turn
  them back); the Commission is `commission=28`. Seats read `harness/RULES-AI.md` alone in a default game,
  plus one block per switch that changes the rules. All 17 check scripts, `tsc -b`, the fuzz and the lint
  comparison are clean. A Respect and cash tie goes to whoever Laid Low first that Day (Nick: fine for
  now; mk-online 0b029f0 dropped the "provisional"); cash is counted after the last Lay Low's $100 a marker.
- **D. The Opus test: not run.** It costs about 3.7M subagent tokens and 3 to 5 hours, so it waits for
  Nick's go-ahead. The command is now
  `scripts/play.sh new players=3 seats=0,1,2 seed=trade-docks-3way-1 talk=1 commission=28`
  (Trade Docks on and the keg off are the defaults). The brief no longer needs a line about appended
  rules beyond the Commission's block. The rest of section D stands.

**The Day 28 limit, Nick's view (2026-11-04):** on the fence. He hopes it isn't needed; for now it caps
the online spend (an Opus game that never crowns). The tie-break is first to Lay Low; if the limit stays
he will likely bring back his old "Loose Change" rule instead. The open problem for the physical game is
tracking the Day without a big extra track or an easily forgotten token. Don't write it into the
Rulebook.

Still open for Nick: the lane colour, then approval of the board; go-ahead for the Opus game.

## What Nick decided (2026-11-04)

1. **Trade Docks.** Moonshine is Traded for Havana Rum only at the four **Trade Docks**: West Side, Jamaica,
   Stapleton, Tottenville (the Docks nobody starts on, on the Stills 2 and 12; the keg's old dynamite Docks).
   Trade is otherwise unchanged: 1 Influence, 1:1, at a Trade Dock you Control, from the pool of 20.
2. **Words.** The four are **Trade Docks** (Nick: a new player never read "Trade at any Dock", so the name
   reads as what they're for, not as a leftover). **Rum Row** is where their shipping lanes lead: the line of
   mother ships offshore, the source of the Rum. It names no District. The Job "Rum Row" (Trade 4+ at a Staten
   Island Dock) keeps its name; it now reads as a run out toward the ships.
3. **Cut the Powder Keg entirely.** It didn't earn its page (see Evidence). Use CLAUDE.md's probation cut list
   (*The Powder Keg*, "On probation"). **Keep the Still swap** (West Side 12 / East Harlem 11, Jamaica 2 /
   Astoria 3): the Trade Docks are exactly the four Pressure 1 Stills, which is the boost Nick liked.
4. **Not taken, don't bring back:** an extra Rum per Trade at a Trade Dock (the old Knights trait): it rewards
   one-barrel "micro trades" that waste Days to double up. A straight 2:1 is too strong. Counting Trade Docks
   twice for the Harbormaster: fiddly, and Staten Island alone would make you Harbormaster.
5. **The away-Ward crown stays out.** The written rule stands (crown in a rival's home Ward). mk-online keeps
   it as a switch (`crownaway=1`), off.
6. **The Day 28 limit** (Nick: optional, recommended): if nobody has Taken the Crown by Sunset of Day 28, the
   Commission crowns the boss with the most Respect; cash breaks a tie. For the test it is **announced to the
   seats** up front. Whether and how it goes into the Rulebook is Nick's call after the test; ask him about a
   tie in both Respect and cash (suggest: the earlier seat in tomorrow's turn order).

## Evidence (all in mk-online `harness/`, branch `claude/powder-keg-rule-feedback-46lnh4`)

- `POWDER-KEG-TRIAL.md` holds every keg trial: the written rule (keg-opus-3, nobody Rigged it in 22 Days), the
  splash (two Opus games; a Boss-killer that stalled the leader, 83 Bosses in 20 bot games), the dice keg
  (one Opus game; only one seat used it, never on a big pile; its effect was deterrence). It never decided a game.
- Trade in four three-Opus games (117 game-Days): the four Trade Docks already carried 59% of Rum traded (79 of
  135 barrels, 5.3 a Trade); starting-Dock Trades were small top-ups (3.1 a Trade). 33 Trades, 20 Kickback pours.
  All three Trade Jobs already name a Trade Dock (The Dutchman's Deal, Jamaica Ginger, Rum Row). West Side
  borders Sugar Hill and Jamaica borders Richmond Hill; the Bronx and Brooklyn Venues are a step further.
- Bot sweeps, keg off, Trade Docks off vs on, 20 seeds (`transcripts/keg/rumrow-p3-*.txt`, `rumrow-p4-*.txt`):

  | Per game-Day | 3P off | 3P on | 4P off | 4P on |
  | --- | --- | --- | --- | --- |
  | Trades | 0.23 | 0.12 | 0.27 | 0.13 |
  | Rum traded | 0.64 | 0.38 | 0.86 | 0.43 |
  | Kickback markers | 0.22 | 0.12 | 0.18 | 0.16 |
  | Crown Day quartiles | 30/40/48 | 37/39/49 | 32/33/37 | 37/44/49 |

  Paired: 3P Kickbacks down 3.9 a game (se 1.5), length +1.6 Days (noise); 4P Kickbacks flat, games +5.6 Days
  (se 2.4). The bots route Rum crudely (they poured only a third of their Rum at a Venue even before), so treat
  the Kickback drop as a floor, not a forecast. Watch game length and Kickbacks in the Opus game.
- The last three Opus games all reached about Day 28 with a leader on 19 to 21 and no crown; the Day 28 limit
  would have crowned the board leader each time (`transcripts/keg-splash-3way-*.md`, `keg-dice-3way-1.md`).

## The work

### A. Rules (this repo)

1. **Trade Docks in.** Rulebook: the Trade row (Standard Plays table, about line 694), the Dock description
   ("Where the rum comes ashore", about line 331), Components, Setup if it mentions Trade, and a Glossary entry
   for **Trade Dock** (and Rum Row only if a rule needs the word). Playbooks' Trade row ("At a Trade Dock you
   Control..."), Town Planner (key and the four Docks), Cards if any card says Trade, The Almanac (grep Trade:
   its Rum lessons argue routes, so check the *argument*, not just the words, per CLAUDE.md's Kickback section),
   index.html. CLAUDE.md's "High Society buys Rum only" section says "Trade at a Dock (1:1 from Moonshine) is the
   only way Rum enters the game": update it to the Trade Docks.
2. **State it in the positive and stop.** No "only at", "no longer", "your home Dock can't" anywhere but the one
   rule sentence. A new player never knew Trade happened anywhere else.
3. **Keg out.** CLAUDE.md lists every place: the Rulebook's *The Powder Keg: Light the Fuse* page (Sunset needs
   nothing back), the Standard Plays Rig row, Components (the black barrel), Setup, Drawing Heat's Detonate
   bullet, the Glossary entries (dynamite Docks, the Kill entry's Detonate line, the Respect entry's Detonator
   -2), Count Your Respect (The Lit Fuse); the Playbooks' Rig row (row padding can go back from 7px to 8px; the
   Knights' Torch row lost "the first shot" for room and can have it back); the Detonator (sheet 10 of the Cards
   sheet) and its `minus2` shield use; the Town Planner's keg tags, key row and Heat-list clause; the board's
   `keg: true` flags; `tools/mock_powder_keg.js`. Jobs: six counted the keg as a barrel (the bridge cards, Last
   One Standing, The Warehouse): their text needs nothing. The Toll Booth Trap's Detonate clause goes.
   Rewrite CLAUDE.md's *The Powder Keg* section as a short record (what it was, why it was cut, Still swap kept)
   and point at `powder-keg-handoff.md` for history; add a *Trade Docks* section with decisions 1, 2 and 4.
4. Run `python3 tools/check_style.py` (zero em dashes) and grep the whole player-facing set for "keg",
   "Detonat", "dynamite", "Rig", and "Trade at a Dock".

### B. The board (this repo; read `board-handoff.md` first)

- In `tools/build_board.js`, the four `keg: true` Docks become the Trade Docks (rename the flag, e.g.
  `trade: true`). Replace the dynamite mark with a **rum-runner schooner** (not a barrel: a barrel reads as
  liquor on the Docks where barrels move; the fused barrel was rejected for that reason).
- Draw **faint dashed shipping lanes** from each Trade Dock off the board's edge toward Rum Row, ending in an
  arrowhead or a small offshore ship. Suggested routes: West Side down the Hudson to the bay and out; Jamaica out
  through Jamaica Bay; Stapleton and Tottenville out past the Lower Bay. They must not read as Connections: the
  water already carries the Dock-to-Dock links, so use a different colour and a lighter dash, and add a key row
  such as "Trade Dock: Trade here. Its lanes run to Rum Row; they are not Connections."
- Render it and show Nick before anything downstream copies it. mk-online's board snapshot then follows
  (`mk-online-board-handoff.md`: `scripts/board-ui-geometry.mjs`, `scripts/boardcheck.ts`).

### C. mk-online (repo `njdyson/mk-online`, branch `claude/powder-keg-rule-feedback-46lnh4`, unmerged)

The branch already has, behind switches: the splash and dice kegs (`setPowderKeg`), the away-Ward crown
(`setCrownAnyWard`), and Trade Docks (`src/game/rumrow.ts`: `setRumRow`, `canTradeAt`, `RUM_ROW_DOCKS`, used by
the Trade move, the UI and the bots, which also ship Moonshine to a Trade Dock by water). Checks:
`scripts/rumrow-check.ts`, `scripts/keg-check.ts`, `scripts/crown-away-check.ts`.

1. Make Trade Docks the default and the keg off by default (keep the keg code behind its switch, as CLAUDE.md
   says). Update `harness/RULES-AI.md`'s Trade line (about line 95) so the `rules` appendix isn't needed.
2. Add the **Commission limit** as a switch (e.g. `setCommissionDay(28)`, `G.commissionDay`; `play-file new ...
   commission=28`): at Sunset of that Day, if nobody has crowned, the game ends and the winner is the most shown
   Respect (`computeRespect`), cash breaking a tie; log it and set `G.winner`. Find where Sunset is resolved (the
   Lay Low / end-of-Day code in `src/game/operations.ts` or `shadows.ts`). Append a rules line when it's on. A
   check script like the others; `npx tsc -b`; lint (see Pitfalls); `scripts/harness-fuzz.ts`.
3. The board snapshot once B is approved.

### D. The Opus test (mk-online)

- `new players=3 seats=0,1,2 seed=trade-docks-3way-1 talk=1 keg=off commission=28` (Trade Docks on by default
  by then; no `crownaway`). Brief: `harness/seat-brief.md`, plus one line that the rules' appended lines are the
  ones in force, and one that states the Day 28 limit plainly. Shifts of four Days (stop at the first decision of
  Days 5, 9, 13, ...); copy each `harness/play/pN/plan.md` after every shift. `harness/MULTI-AGENT-HANDOFF.md`
  has the method; the last games' briefs and handovers are under `harness/transcripts/*-plans/`.
- Write it up like `harness/transcripts/keg-dice-3way-1.md` (header, Respect table, what decided it, Trade and
  Kickback counts: compare the 59% / 33 Trades / 20 pours baseline above), commit the transcript, save and
  handovers. Questions: do players treat the Trade Docks as an upgrade worth fighting for; does anyone lock up
  Staten Island; Kickbacks and length against the last three games; how the seats play the announced Day 28.

## Pitfalls from the last sessions

- `pkill -f play-file.ts` matches its own shell and kills it. Use `scripts/play.sh stop`.
- Restart the game process after any code change (it loads the code once).
- When the game ends at Day 28 by the orchestrator, seats blocked in `wait` for a Day 29 decision never return:
  message them to write their handover. (With the engine's Commission switch the game ends properly instead.)
- `Session.create(...).G` is frozen: `structuredClone` it before staging a position.
- ESLint here has no `unix` formatter: compare `-f json` output against a `origin/main` worktree. The branch adds
  no errors as of 5d86d7e (6 pre-existing errors in the touched files).
- `scripts/keg-sweep.ts --max-days` leaks (games can run past it); both sides of a comparison share it.
- Don't commit sweep output while it is still being written; a stop hook flags untracked files, so exclude them
  locally in `.git/info/exclude` until they finish.
- Cost: a three-Opus game to Day 28 has been about 3.7M subagent tokens and 3 to 5 hours.
