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

## Experiment: the drafted board (branch `board-drafted-experiment`, 2026-09-29)

Nick asked for a less angular board; curved borders were tried first (branch
`board-organic-experiment`) and rejected as hand-drawn and scribbled: "the angular map works
better". This goes the other way, making the angles deliberate. The traced map is nearly a
designed one: about 30% of its border length runs a few degrees off level, 17% a few degrees
off upright, the rivers wander in width, and the tracer left 3 to 5 unit jogs. The drafted pass
keeps every shape and every connection and makes those near-misses exact.

```
node tools/draft_board.js                              # skeleton -> Art/Board/Drafted/, both variants, checked
node tools/build_board.js --geometry=Drafted           # builds into Art/Board/Drafted/
node tools/build_board.js --geometry=Drafted/Chamfered # the variant with bevelled corners
```

- **The traced geometry stays the source.** `tools/draft_board.js` reads `board-geometry.json`
  untouched and applies a table of drafting moves: `MOVE` (where each point goes), `DROP` (jogs
  and points a straight line no longer needs) and `REPLACE` (chains that gain corners). The
  moves are built from named lines, so the intent reads in the code: `MN_WEST`, `NJ`, `ER_MN`
  and so on.
- **What changed.** Manhattan's west coast is one straight line (Nick: it is straight in real
  life) with New Jersey's shore parallel, so the Hudson is an even 44. The East River is one
  channel 49 wide in three reaches: 45 degrees past the Williamsburg and Queensboro, a level
  turn under the Bowery, then parallel to the Hudson past the Brooklyn Bridge. Hell Gate and
  the Sound are the same 49, a chevron turning at the Hunts Point / Throggs Neck line; that
  also opened the 22-unit pinch between Throggs Neck and Whitestone, which are not connected
  and read as if they nearly touched. Manhattan's borders are level at 262, 358, 453 and 548.
  The Bronx's east shore and Queens' Nassau line are upright; Red Hook's south side and the
  Rockaways are level. Staten Island and Jamaica Bay are 45-degree octagons.
- **Labels.** The Bronx's label is centred on its east shore, which now runs to the top of
  the board; Manhattan's sits beside the Tenderloin and Five Points, clear of West Side's
  piers; Westchester's is centred in its strip.
- **Bridges** keep their places and cross square to the new banks, so all four are 49 long
  (they were 43 to 55). Their names, and the water labels, move with the shores: the drafted
  geometry carries them as `"labels"`, which `build_board.js` uses when a geometry has them.
- **Room for pieces, balanced** (Nick, 2026-09-29: "every district [must] fit as many pieces
  in as possible"). The build now prints each District's **room**: its ground at least 6 units
  (about 3 mm) in from every border and clear of its label, in cm² at 24in. No piece sizes are
  recorded anywhere, so this is area, not a piece count. The drafted borders sit on `SETTINGS`
  at the top of `draft_board.js`, and those were tuned by a hill-climb (a scratch script, not
  kept) that raised the smallest Districts, the crown rooms weighted extra, with every land
  border kept at 32 units or longer so it still reads as a connection. Its moves: Manhattan
  widened 8 units west (New Jersey follows, so the Hudson keeps its 44) and its level borders
  lowered; the Westchester line up 9; Morris Park 22 units wider; Hell Gate's chevron flattened
  from 15 to 9 degrees, giving the Bronx some of Queens' shore; Williamsburg's south point
  down 28; Corona's north border up 10; the Bowery's bottom up 20 so Staten Island could grow
  north. Before and after:

  | | Smallest | Crown rooms (Sugar Hill, Morris Park, Williamsburg, Richmond Hill) |
  | --- | --- | --- |
  | Traced | 32 (West Side) | 34, 36, 50, 65 |
  | Drafted, first pass | 34 (Morris Park, Sugar Hill) | 34, 34, 45, 64 |
  | Drafted, balanced | 42 (Tenderloin) | 47, 47, 57, 64 |

  Nine Districts now sit between 42 and 46. The big ones stay big because nothing small
  borders them: Jamaica (114), Sheepshead Bay (72), Coney Island (70). Change a setting by hand
  and the room report says what it cost.
- **Chamfers** (`Drafted/Chamfered`) bevel coast corners sharper than 110 degrees that aren't
  junctions. The drafting already made most corners 45-degree cuts, so only four qualify
  (Throggs Neck's tip, the Bowery's south-west corner, the Rockaway spit, Sheepshead's hook).
  The difference is slight.
- **Piers** are placed as before, on each Dock's longest open straight shore; with the
  Rockaways now one straight line, Jamaica's piers face the ocean instead of the bay.
- **Checks** before writing: no crossings, no run under 3 units, no District area off by more
  than 20%, no short border shrinking below 80%, no water under 20 wide between Districts that
  don't meet (the narrowest is 25, the Bowery to Westerleigh).
- The four-way corner (Sugar Hill, Belmont, East Harlem, Hunts Point) is unchanged; splitting it
  would add a border.
- `Art/Board/Drafted/Before and after.jpg` puts the two screen boards side by side.
- **The Deco style** (`--style=deco`, written to `Drafted/Deco/`; Nick, 2026-09-29). The
  type tints told a Dock from a Speakeasy only faintly, and the piers now do that job, so this
  tells the types apart by drawing instead. One colour per Borough for Docks, Speakeasies and
  High Society; **Wards darker** (30% towards black, `WARD_DARK`: the rough end of town; 20%
  was too faint).
  **Speakeasies** get a gold keyline inset 7 units inside their border with a small diamond at
  each corner. **High Society** gets a double keyline (6 and 10.5 in) with the frame's Deco
  fan opened or closed to fill each corner, and a brighter diamond: the same frame with more
  flourish, **in place of the sunburst and glow**. Corners sharper than 20 degrees or blunter
  than 150 take no ornament, and junctions along a straight border are not corners. The
  default build (`STYLE = 'tone'`) is untouched and still rebuilds byte for byte.
  `Drafted/Deco/Before and after.jpg` compares the two on the drafted board.
- **To adopt it:** copy `Drafted/board-geometry.json` over the skeleton (or build from it by
  default), rebuild, and drop the `--geometry` switch if nothing else uses it. **To discard
  it:** delete the branch.

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
- **Bleed** (since 2026-09-29): the print master SVG, its 300dpi PNG and the PDF carry the
  frame's black **6 units (3.4 mm) past the trim** on every side (`BLEED`): the PNG is 7280 px
  and the PDF page 616.6 mm square, for a 609.6 mm board. Coordinates are unchanged (0 to 1080
  is the trim); the screen build and both previews stop at the trim. 3 mm is the usual minimum
  for flat printing; a wrapped board (a printed sheet folded over greyboard) needs a wrap
  margin set by the manufacturer's own template, which wins over this. **Safe margin:**
  nothing but the black band sits outside the gold edge's centre line, 7 units (3.9 mm) in.
  If a manufacturer wants more, the frame (`FRAME_OUT`, `FRAME_IN`) moves in, not the art.
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
  frame's corner steps (the one at the Heat corner's turn was cut, 2026-09-29: it sat on the map
  and looked odd); a soft drop shadow under every Still and zone roundel, so they sit on the
  board like pieces.
- **Zone roundels are 28 units across** (`R = 14`, about 16 mm at 24in), big enough to read
  a District's type at a glance beside its Still.
- **The Heat Track is one row, numbered left to right.** A Raid chases the marker "furthest
  right on the Heat Track"; wrapping it into two rows would break that. The sockets keep the
  Ledger's size and spacing (39 mm chips, 2 mm apart). **Dressed as a gilt instrument** since
  2026-09-29 (Nick found the plain wells "a touch cheap" and wants a premium feel): a polished
  gold bezel round each socket, a lacquer floor with a fine guilloché sunburst and a track
  ring like a watch dial, a shadow under the bezel's upper edge so the floor reads as
  recessed, numerals engraved in graded gold over a drop shadow, diamonds in the spandrels
  between sockets, and a routed tray with a gilt lip. **HEAT is cut into a gilt plate hanging
  from the board's gold edge** (`heatPlate()`), a Deco cartouche drawn over the frame, not a
  line above the tray: that band went, and the Heat corner is 13 units shorter, pulling its
  corner back from Manhattan's tip (Nick: it sat too close). The plate starts at the gold
  edge's centre line, inside the safe margin (see Bleed). Escalation
  stays subtle, as Nick asked: the floors warm a touch towards rust (`HEAT_TINT`), and only the
  5th, the Raid, changes metal, to rose-copper on an oxblood floor (`GILT`, `COPPER`).
- **No Liquor Value track.** The key's prices are worded as the Town Planner's legend.
- **Title is NEW YORK 1929, nothing more.** No logo, no compass, and since 2026-09-28 no north
  line either (Nick found it too prominent).
- **Leather, generated, not an image.** `leatherFilter()` builds a pebble grain from crease
  patterns multiplied (one alone draws worm-like squiggles at print scale), over soft wrinkles,
  with a sheen and uneven dye. The board is a coarse hide (pebbles 2 to 3 mm); the Heat corner is a
  **finer, flatter skin**, stitched in. The key and Mash panels carry no stitching or leather
  (Nick, 2026-09-28); since 2026-09-29 they are **lacquered plaques** to match the Heat Track:
  a polished gilt edge with a dark seat inside it, a hairline, a small diamond on each Deco
  chamfer, and a soft shadow lifting them off the hide. The Mash square is a recessed socket
  in the Heat Track's lacquer and gilt, with MASH engraved above it, centred in a panel as
  tall as the key. **The key's rows share one pitch** (16.5 units): the High Society crown
  used to add a gap under the first row. Saddle stitching runs round the board
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
