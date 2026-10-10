# mk-online: take the new board (2026-09-29, last done 2026-10-10)

For an agent updating the online game (`njdyson/mk-online`) to the board in this repo. Read
`DEPLOY.md` first: mk-online is its own repo, CI commits its build to its own `dist/`, and this
repo vendors that build into `mk-online/dist/`. **Never hand-edit `mk-online/dist/` here.** Make
the change in the mk-online source, let it build, then mirror `dist/` in as `DEPLOY.md` says.

## What the game shows now

The game shows `public/board.svg` (a copy of `Art/Board/Board v0.9 (screen).svg`) as an `<img>`,
with clickable Districts, piece strips and live Heat, Mash and Turn Order drawn over it. Since
2026-10-10 (mk-online 32418fc) that is the 2026-10-10 board, Manhattan's bricks and East Harlem's
corner cut included. Its overlay data, `src/ui/boardGeometry.ts`, is generated, and its connection
graph is `ADJACENCY_PAIRS` in `src/game/data.ts`.

## Catching it up after a redraw

```
# here: the sign report (each sign's box), a few seconds; the SVG is not rewritten
NODE_PATH=/opt/node22/lib/node_modules node tools/build_board.js --rooms --report=/tmp/signs.json
# in mk-online
cp "<this repo>/Art/Board/Board v0.9 (screen).svg" public/board.svg
cp "<this repo>/Art/Board/board-geometry.json" scripts/board-geometry.json
node scripts/board-ui-geometry.mjs --signs=/tmp/signs.json   # rewrites src/ui/boardGeometry.ts
npx vite-node scripts/boardcheck.ts                          # then fix ADJACENCY_PAIRS until it passes
```

The generator clips the click areas to the frame's hairline, takes the signs from the report,
reads the Heat, Mash and Turn Order sockets off the SVG, and puts each piece strip (80 x 26) at
the spot nearest under its sign that fits inside the District, clear of every sign, its hangers
and the bridges. Since 2026-10-10 (mk-online 73c3b3e) it also places each Police Squad's badge,
centred in the open ground under the sign and as large as fits (the Tenderloin's is the smallest),
and the game no longer washes a Controlled District in its owner's colour, so every Borough shows
its printed colour. The sections below are the original brief, kept for what the files hold.

## What to take from this repo

| File | Use |
| --- | --- |
| `Art/Board/Board v0.9 (screen).svg` | The new board image, replacing `board.svg`. Self-contained: fonts embedded, 1080 x 1080 viewBox (the same units as before). |
| `Art/Board/board-geometry.json` | The map as data, in the same 1080 units: `regions` (one polygon per District, plus `nj`), `chains` (every border once, with its two `sides`; `water` marks a shore), `bridges` (`join`, end points `a` and `b`, `name`, `opened`), `labels`. |

Regenerate both with `node tools/draft_board.js && node tools/build_board.js` if you change the
map; see `board-handoff.md`.

- **Click areas**: use `regions`. The Bronx and Queens Districts run under the frame to the board
  edge, so clip them to the frame's hairline (13 units in from each edge) if a click past the
  frame matters.
- **Heat Track, Mash and Turn Order overlays**: the panels were reworked on 2026-09-29, after that
  deploy (the Heat corner is 13 units shorter; the Tomorrow panel under it holds the Mash socket
  and a Turn Order socket for tomorrow's Turn Tokens, one stack, #1 on top). Take the socket
  positions from `heatTrack()` and `tomorrow()` in `tools/build_board.js`, or read them off the
  SVG, rather than trusting the old offsets.
- **The key** is now only the price list (Speakeasy: grey Moonshine cube $300, brown Rum cube
  $500; High Society: Rum $500 plus a +1 chip for the Kickback). If the UI duplicates the key or the prices, match it.

## Connection changes

**Manhattan, since 2026-10-07.** Manhattan is laid like bricks (one level line across it, East
Harlem's upright above it and Five Points' further west below it), which changes three of its
connections from the traced map's:

- **East Harlem / Tenderloin is gone.**
- **West Side / Five Points is new.**
- **Tenderloin / Bowery is new** (the Tenderloin took the stretch of Hudson shore that was Five
  Points', so the Bowery has three roads out by land, not two).

The Coastal list is unchanged (Five Points keeps its East River shore), and the Queensboro Bridge
still joins East Harlem and Astoria, moved up the river to East Harlem's shorter shore. The game
took all three on 2026-10-07 (mk-online 31456d5).

Every other connection is the traced map's. Elsewhere only the shapes changed:

- **Westchester and Nassau are gone** from the art. They were never Districts, so nothing should
  reference them, but check.
- The Queens / Brooklyn border is one straight line off the East River, and Williamsburg is a
  diamond. Astoria and Williamsburg still share a border along it.

(An earlier version of this handoff, briefly on `main` on 2026-09-29, dropped Astoria /
Williamsburg and made Corona Coastal. That was reverted. The game did pick it up (mk-online
a1b0ff4, deployed here in 5cf2640), and mk-online cc5d519 put Astoria / Williamsburg back and took Corona off the Coastal list.)

### The full graph (authoritative, from `board-geometry.json`)

Land borders (40):

```
astoria | corona              brownsville | williamsburg    flushing | whitestone
astoria | flushing            canarsie | coney_island       fordham | hunts_point
astoria | whitestone          canarsie | red_hook           fordham | morris_park
astoria | williamsburg        coney_island | red_hook       fordham | throggs_neck
belmont | fordham             corona | flushing             hunts_point | throggs_neck
belmont | hunts_point         corona | richmond_hill        jamaica | richmond_hill
belmont | sugar_hill          corona | williamsburg         morris_park | throggs_neck
bowery | five_points          east_harlem | five_points     red_hook | williamsburg
bowery | tenderloin           east_harlem | hunts_point     stapleton | tottenville
brownsville | canarsie        east_harlem | sugar_hill      stapleton | westerleigh
brownsville | corona          east_harlem | west_side       sugar_hill | west_side
brownsville | jamaica         five_points | tenderloin      tenderloin | west_side
brownsville | red_hook        five_points | west_side
brownsville | richmond_hill   flushing | richmond_hill
```

Bridges (4), which also count as Land Connected:

```
Hell Gate Bridge     hunts_point | astoria
Queensboro Bridge    east_harlem | astoria
Williamsburg Bridge  five_points | williamsburg
Brooklyn Bridge      bowery | red_hook
```

Coastal Districts (21; every District but Corona, Flushing, Fordham and Richmond Hill):

```
astoria belmont bowery brownsville coney_island east_harlem five_points hunts_point jamaica
morris_park red_hook canarsie stapleton sugar_hill tenderloin throggs_neck tottenville
west_side westerleigh whitestone williamsburg
```

To re-derive: a land border is a chain whose two `sides` are both Districts; a District is
Coastal if any chain with `water` among its sides has it on the other side.

## Done when

- The game shows the new board, and every District's click area matches its shape.
- The game's adjacency data matches the list above (write a test that loads
  `board-geometry.json`, or a copy of it, and diffs it against the game's graph).
- Heat, Mash and Turn Order overlays sit in their sockets.
- The build is mirrored into this repo's `mk-online/dist/` per `DEPLOY.md`. Then update the
  mk-online lines in `CLAUDE.md` (The board) and `board-handoff.md` (Status, and Open), which
  both say the online game lags this board.
