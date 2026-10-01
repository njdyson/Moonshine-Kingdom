# mk-online: take the new board (2026-09-29)

For an agent updating the online game (`njdyson/mk-online`) to the board in this repo. Read
`DEPLOY.md` first: mk-online is its own repo, CI commits its build to its own `dist/`, and this
repo vendors that build into `mk-online/dist/`. **Never hand-edit `mk-online/dist/` here.** Make
the change in the mk-online source, let it build, then mirror `dist/` in as `DEPLOY.md` says.

## What the game shows now

The live game (deployed in a23d1e4, source e0c1f7b) shows `board.svg` as an `<img>`
(`className: board-map-img`), with clickable Districts and live Heat and Mash drawn over it. That
SVG is the vector board **from before the drafting**: the traced Affinity shapes, with
Westchester and Nassau as off-board land. Its click areas and connection graph presumably come
from the same traced map (`Art/Board/Traced/board-geometry.json`). Check that in the source
before relying on it.

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

None. Every connection and every Coastal District is the same as the traced map's, which the
current game presumably uses. What changed is only the shapes:

- **Westchester and Nassau are gone** from the art. They were never Districts, so nothing should
  reference them, but check.
- The Queens / Brooklyn border is one straight line off the East River, and Williamsburg is a
  diamond. Astoria and Williamsburg still share a border along it.

(An earlier version of this handoff, briefly on `main` on 2026-09-29, dropped Astoria /
Williamsburg and made Corona Coastal. That was reverted. The game did pick it up (mk-online
a1b0ff4, deployed here in 5cf2640), and mk-online cc5d519 put Astoria / Williamsburg back and took Corona off the Coastal list.)

### The full graph (authoritative, from `board-geometry.json`)

Land borders (39):

```
astoria | corona              brownsville | williamsburg     flushing | whitestone
astoria | flushing            coney_island | red_hook        fordham | hunts_point
astoria | whitestone          coney_island | canarsie        fordham | morris_park
astoria | williamsburg        corona | flushing              fordham | throggs_neck
belmont | fordham             corona | richmond_hill         hunts_point | throggs_neck
belmont | hunts_point         corona | williamsburg          jamaica | richmond_hill
belmont | sugar_hill          east_harlem | five_points      morris_park | throggs_neck
bowery | five_points          east_harlem | hunts_point      red_hook | canarsie
brownsville | corona          east_harlem | sugar_hill       red_hook | williamsburg
brownsville | jamaica         east_harlem | tenderloin       stapleton | tottenville
brownsville | red_hook        east_harlem | west_side        stapleton | westerleigh
brownsville | richmond_hill   five_points | tenderloin       sugar_hill | west_side
brownsville | canarsie        flushing | richmond_hill       tenderloin | west_side
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
