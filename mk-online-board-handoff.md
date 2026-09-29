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
  $500; High Society: Rum $500). If the UI duplicates the key or the prices, match it.

## Connection changes

Against the traced map, exactly one connection changed and one District became Coastal:

- **Astoria and Williamsburg no longer share a border.** Corona now has a stretch of East River
  shore between them.
- **Corona is now Coastal** (it touches the East River). Coastal matters for the boat Move, and
  for Fold or Advance to a Coastal Safe District.
- **Westchester and Nassau are gone** from the art. They were never Districts, so nothing should
  reference them, but check.
- Nothing else changed. Water Connected is still Dock to Dock.

So Williamsburg is Land Connected to Red Hook, Brownsville and Corona by border, and to Five
Points by the Williamsburg Bridge. Its ordinary Speakeasy next door, for bots re-routing
Moonshine off a High Society room (`mk-online-rules-sync.md` 12.5), is Red Hook only.

### The full graph (authoritative, from `board-geometry.json`)

Land borders (38):

```
astoria | corona          corona | flushing          flushing | richmond_hill
astoria | flushing        corona | richmond_hill     flushing | whitestone
astoria | whitestone      corona | williamsburg      fordham | hunts_point
belmont | fordham         east_harlem | five_points  fordham | morris_park
belmont | hunts_point     east_harlem | hunts_point  fordham | throggs_neck
belmont | sugar_hill      east_harlem | sugar_hill   hunts_point | throggs_neck
bowery | five_points      east_harlem | tenderloin   jamaica | richmond_hill
brownsville | corona      east_harlem | west_side    morris_park | throggs_neck
brownsville | jamaica     five_points | tenderloin   red_hook | sheepshead_bay
brownsville | red_hook    coney_island | red_hook    red_hook | williamsburg
brownsville | richmond_hill   coney_island | sheepshead_bay   stapleton | tottenville
brownsville | sheepshead_bay  sugar_hill | west_side          stapleton | westerleigh
brownsville | williamsburg    tenderloin | west_side
```

Bridges (4), which also count as Land Connected:

```
Hell Gate Bridge     hunts_point | astoria
Queensboro Bridge    east_harlem | astoria
Williamsburg Bridge  five_points | williamsburg
Brooklyn Bridge      bowery | red_hook
```

Coastal Districts (22; every District but Fordham, Flushing and Richmond Hill):

```
astoria belmont bowery brownsville coney_island corona east_harlem five_points hunts_point
jamaica morris_park red_hook sheepshead_bay stapleton sugar_hill tenderloin throggs_neck
tottenville west_side westerleigh whitestone williamsburg
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
