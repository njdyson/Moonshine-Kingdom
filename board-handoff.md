# The board: vector rebuild

Status (2026-09-28): **merged to `main`**, still being refined one round at a time. The
Affinity export (`Art/Board (Large).png`) is untouched and is still what mk-online serves, so
the online game shows the old board until it is switched over.

```
node tools/build_board.js           # print and screen SVGs + a 2160px JPEG of each, seconds
node tools/build_board.js --print   # also, git-ignored: the 24in print PDF (300dpi), its 7200px PNG,
                                    # and a 4320px screen JPEG; about a minute
node tools/trace_board.js           # only if the Affinity board changes; rewrites the geometry
```

Both scripts need Playwright's Chromium. Where Playwright is installed globally rather than in
the repo, point Node at it (`NODE_PATH=/opt/node22/lib/node_modules` in the cloud sandbox) or set
`PLAYWRIGHT_PATH`. The build fetches its four fonts from Google Fonts and embeds them in the SVG,
so the SVG renders the same anywhere; the build itself needs the network.

## Experiment: organic borders (branch `board-organic-experiment`, 2026-09-29)

Nick asked whether the Districts could be less angular while keeping their connections clear,
as a copy that can be thrown away. Everything it adds lives beside the board, not in it:

```
node tools/smooth_board.js              # skeleton -> Art/Board/Organic/board-geometry.json, with checks
node tools/build_board.js --organic     # the same build from that geometry, into Art/Board/Organic/
```

- **The traced geometry stays the source.** `tools/smooth_board.js` reads
  `board-geometry.json` untouched and writes a curved copy in the same format (regions, one
  shared chain per border, bridges), so mk-online could take either. To move a border, edit
  the skeleton and re-run.
- **What it does.** Coasts are curved as whole shorelines, straight through the junctions on
  them, with rounded corners and a slow meander (two long waves, a few units high) that fades
  out in narrow water and near bridge landings. Land borders keep their junctions and take a
  gentle bow, capped at 6.5 units, on whichever side opens the tighter angle at their ends.
  Bridges re-land where their axis meets the new shore. All the knobs are in `P` at the top.
- **What it checks before writing.** No chain crosses another; no border shortens below 92%;
  no District's area moves more than 12%; no strait under 60 units closes up; each bridge
  stays within 10 units of its old length. Topology cannot change: every chain keeps its two
  sides and its two end junctions, so every adjacency survives. `--force` writes a failing
  result so it can be looked at.
- **Piers now follow a curved shore** (`alongShore()` in the build): each pier sits square to
  its own stretch of coast. On the straight board this nudges most piers by about a unit and
  moves the Bowery's from its south shore to its west shore, so the straight board was **not**
  rebuilt on this branch.
- `Art/Board/Organic/Before and after.jpg` puts the two screen boards side by side.
- **The four-way corner** (Sugar Hill, Belmont, East Harlem, Hunts Point meet at one point)
  is unchanged. Splitting it would create a border between one diagonal pair, which is a rules
  change. The thick Borough line running through it keeps Sugar Hill and Hunts Point, and
  Belmont and East Harlem, reading as apart.
- **To adopt it:** point `DIR` at the organic geometry by default (or copy it over the
  skeleton's outputs), rebuild the index tile, and delete the `--organic` switch. **To
  discard it:** delete the branch.

## Files

- `Art/Board/board-geometry.json`: the map as data, traced from the Affinity PNG in its own
  1080-unit frame. One polygon per District and off-board landmass, every border one shared
  chain (so neighbours can never gap or overlap), and the four bridges. The tracer reproduces
  it exactly. mk-online can take click areas and the adjacency graph straight from it.
- `tools/build_board.js`: the roster (zone, Still, venue, Setup mark per District, copied from
  the Town Planner), palette, type, label placement, key and panels. Everything on the board is
  generated from here; nothing is hand-placed in the SVG.
- The outputs, all committed: `Board v0.9.svg` (the print master, full leather) with
  `Board v0.9 (print preview).jpg`, and `Board v0.9 (screen).svg` with `Board v0.9 (screen).jpg`
  (the same board with a flat texture, for the website and mk-online). The two builds differ
  only in the `LEATHER` preset.
- `Art/Index/board.jpg`: the index page's tile ("The City Map", first under Components), an
  800 x 450 crop of the screen board (`TILE_CROP`), rebuilt with the board. The tile opens
  `Board v0.9 (screen).jpg`.

## Physical spec

- The board prints **24 inches square**: 1080 units across, so 1 unit is 0.564 mm. Physical
  sizes go through the `MM` constant.
- **Heat Track sockets are the Ledger's**: 39 mm casino chips, 2 mm apart, in a tray padded
  6 mm (`css/ledger-board.css`, the poker-chip build). If the Ledger's socket changes,
  `heatTrack()` changes with it. Five sockets need 381 units, a little more than the New Jersey
  strip, so the Heat Track sits in a **corner cut out of the map**: the board's gold edge steps
  in around it and the hairline follows (`frame()`), so the New Jersey coast meets its edge
  instead of running under a floating panel (Nick, 2026-09-28).
- **Mash square**: 24 mm.

## Bridges (period accurate, named for Jobs)

Nick wants the crossings named so Jobs can refer to them, and accurate to 1929 even if that
moves a connection. They live in `board-geometry.json` with their opening year, and the tracer
keeps them on a re-trace.

| Bridge | Joins | Opened |
| --- | --- | --- |
| Hell Gate Bridge | Hunts Point and Astoria | 1917 (railway) |
| Queensboro Bridge | East Harlem and Astoria | 1909 |
| Williamsburg Bridge | Five Points and Williamsburg | 1903 |
| Brooklyn Bridge | The Bowery and Red Hook | 1883 |

- **The Queensboro was moved.** The Affinity board had this crossing from upper East Harlem, which
  is the Triborough's line (opened 1936). The 1929 crossing runs from East 59th Street to Long
  Island City, so it now leaves East Harlem's southern shore for Astoria's. It still joins the
  same two Districts: **no connection changed.**
- The Manhattan Bridge (1909) also lands by the Bowery; Brooklyn Bridge was preferred as the
  better-known name. Either is accurate.
- **There is no bridge between Throggs Neck and Whitestone**, on the Affinity board or in 1929
  (the Bronx-Whitestone Bridge opened in 1939). The Almanac's bracket passage ("A bridge joins
  them, so a Boss on one can Split the Batch into the other") and the Kingpin's Guide ("stares
  across a bridge") both assumed one. They are only Water Connected, and Split the Batch needs
  Land. **The Almanac is fixed** (2026-09-28): the only land-touching bracket on the board is
  Red Hook's 6 and The Bowery's 9, across the Brooklyn Bridge, and the lesson now names it. The
  Kingpin's Guide still has the old claim and its $740 figure; it lags the rules by design.
- **The Milk Run** names the Williamsburg Bridge again ("across the Williamsburg Bridge"). It
  had dropped the name only because no component printed it. The Almanac now names the Brooklyn
  Bridge too. Both rely on this board, so they should merge with it.
- Hell Gate as a *water* landmark was rejected for Jobs (it is a strait inside the East River);
  the Hell Gate *Bridge* is a crossing, which is unambiguous.

## Decisions, so nobody undoes them

- **Labels are centred in each District** (Nick, 2026-09-28: cleaner, accepting that pieces will
  sit round them). Each cluster goes where it is furthest from every border, and along a strip
  the spot nearest the District's middle; all use the stacked layout. The earlier placer is
  still there behind `LABEL_PLACEMENT = 'edge'`: it pushes each cluster aside to leave the
  largest open circle for pieces and keeps it clear of its neighbours' across a border. Worth
  comparing once pieces are on a printed board.
- **Stills are the Still Token art itself** (`Art/Still Tokens/SVG`), so board and tokens agree.
- **Muted Borough tones.** Mob colours aren't set and the Squads are blue, so the land stays
  quiet. Brooklyn moved from red to bronze to part it from Manhattan.
- **High Society Venues:** the martini (`Art/Icons/Gin.svg`) under a crown, plus a gold
  sunburst from the crown. The inner gold keyline they once had is gone (Nick). Speakeasies
  keep the tumbler, one colour for all.
- **No setup marks on the board** (Nick, 2026-09-28): he wants to playtest other setups
  without the print committing to one. `SHOW_SETUP = true` brings them back: ghosted pieces in
  a dashed tray, no words (Home Turf: Safehouse, Boss, 2 Runners; 3 Runners; a Squad shield,
  kept quiet so a crown room never read as always policed), plus the key's Setup row. The
  roster keeps each District's Town Planner mark either way.
- **Each District type shifts its Borough's colour a touch** (`TONE`, `TINT`): Speakeasies
  and High Society warmer, Docks cooler, Wards the Borough's own colour. The Borough must still
  read first (Raids and Squads work by Borough), so the shift is 13%, and "cool" is a slate,
  not a blue: blue turned Manhattan's red Docks plum, a step towards Queens. Tried first and
  rejected (Nick, 2026-09-28): a tooled pattern per type (waves, brick, fish scales); he
  prefers the Districts flat.
- **Finishing touches:** piers off each Dock's most open stretch of shore, in the Dock's own
  colour (placed automatically, clear of land, bridges and labels); Art Deco quarter fans in the
  frame's corner steps and at the Heat corner's turn; a soft drop shadow under every Still and
  zone roundel, so they sit on the board like pieces.
- **Zone roundels are 28 units across** (`R = 14`, about 16 mm at 24in), big enough to read
  a District's type at a glance beside its Still.
- **The Heat Track is one row, numbered left to right.** A Raid chases the marker "furthest
  right on the Heat Track"; wrapping it into two rows would break that. The sockets copy the
  Ledger's (dark wells, a faint gold ring); only the numerals warm from gold towards rust, with
  RAID on the 5th. Nick asked for subtle escalation or none: `HEAT_NUM` and `HEAT_TINT` hold it,
  and setting both flat gives the Ledger's plain look.
- **No Liquor Value track.** The key's prices are worded as the Town Planner's legend.
- **Title is NEW YORK 1929, nothing more.** No logo, no compass, and since 2026-09-28 no north
  line either (Nick found it too prominent).
- **Leather, generated, not an image.** `leatherFilter()` builds a pebble grain from crease
  patterns multiplied (one alone draws worm-like squiggles at print scale), over soft wrinkles,
  with a sheen and uneven dye. The board is a coarse hide (pebbles 2 to 3 mm); the Heat corner is a
  **finer, flatter skin**, stitched in. The key and Mash panels are flat (a gilt edge and a
  hairline, no stitching or leather: Nick, 2026-09-28). Saddle stitching runs round the board
  edge and inside the Heat corner. The **screen** build drops the pebbles and
  keeps only soft wrinkles and dye, because at screen size the grain turns to noise (Nick asked
  for it). Presets live in `LEATHER`. It prints crisp at any size and needs no licence; a CC0
  scan (ambientCG, Poly Haven) could be tiled in if it ever needs to be photographic. Judge the
  print grain at print scale, not in the downscaled preview. Every leather filter ends by
  masking to `SourceAlpha`: the lighting is opaque across the whole region, and without the mask
  the panel filter painted grey over the entire map.
- Water and land labels are placed by visual centre, midway between the shores and at their
  angle, so they stay centred if the type changes. New Jersey is unlabelled (Nick cut it);
  Westchester and Nassau keep theirs.

## Open

- **Martini sync.** The Rulebook's component list still says "12 Speakeasies (Tumbler Glass),
  four of them High Society Venues (Crown)", and the Town Planner roster shows the tumbler on
  the High Society rows. Not changed yet; waiting on Nick.
- ~~**Rulebook wording.**~~ Fixed 2026-09-28: the Big Bust tiebreak reads "ranked highest on its
  Still's Pressure Strip", matching the Town Planner. (The Kingpin's Guide still says "the
  Borough's Pressure Strip"; it lags by design.)
- **mk-online.** The geometry is ready for it; the mk-online source is its own repo
  (`njdyson/mk-online`), not this one.
- **Affinity round-trip.** The SVG opens in Affinity, but the texture and soft shadows are SVG
  filters and will likely drop out, and Cinzel, Barlow, Barlow Condensed and Bebas Neue must be
  installed locally.
