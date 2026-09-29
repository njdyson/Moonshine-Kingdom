# The board: vector rebuild

Status (2026-09-29): the **drafted map with hanging signs and the Deco style is the board**, on
`main`. mk-online serves it too (`mk-online/dist/board.svg`, from mk-online a1b0ff4), with
clickable Districts and its connection graph taken from `board-geometry.json`. The Affinity export (`Art/Board (Large).png`) is untouched.

```
node tools/draft_board.js           # the traced map -> Art/Board/board-geometry.json, checked
node tools/build_board.js           # print and screen SVGs, a 2160px JPEG of each, the index tile
node tools/build_board.js --print   # also, git-ignored: the 24in print PDF (300dpi), its 7280px PNG,
                                    # and a 4320px screen JPEG; about a minute
node tools/build_board.js --report=/tmp/signs.json && node tools/tune_board.js /tmp/signs.json
                                    # suggests SETTINGS for the drafting; ten to twenty minutes
node tools/trace_board.js           # only if the Affinity board changes; rewrites the traced map,
                                    # and the drafting's point keys then need matching to it
```

The build needs Playwright's Chromium. Where Playwright is installed globally rather than in the
repo, point Node at it (`NODE_PATH=/opt/node22/lib/node_modules` in the cloud sandbox) or set
`PLAYWRIGHT_PATH`. The build fetches its four fonts from Google Fonts and embeds them in the SVG,
so the SVG renders the same anywhere; the build itself needs the network.

## How the map is made

The Affinity board was traced (`tools/trace_board.js`) into `Art/Board/Traced/board-geometry.json`:
one polygon per District, every border one shared chain, the bridges. `tools/draft_board.js`
reads that skeleton and redraws it to a plan, keeping every District and every connection:
`MOVE` (where each point goes), `DROP` (points a straight line no longer needs) and `REPLACE`
(chains that gain corners), built from named lines (`MN_WEST`, `NJ`, `ER_MN`...) so the intent
reads in the code. Its `SETTINGS` place the level and upright borders. Nick asked for a less
angular board; curved borders were tried first and rejected as hand-drawn ("the angular map
works better"), so this makes the angles deliberate instead.

- **Straight lines at a few exact angles**: level, upright, 45 degrees, and the Hudson's.
  Manhattan's west coast is one straight line (Nick: it is straight in real life). The rivers
  are even channels: the Hudson 44 wide, down to the harbour (New Jersey is squared off level
  with the Bowery's foot); the East River 49, in three reaches (45 degrees past the Williamsburg
  and Queensboro, a level turn under the Bowery, then parallel to the Hudson); Hell Gate and the
  Sound 49, a shallow chevron (3 degrees) turning at Hunts Point / Throggs Neck. Staten Island
  and Jamaica Bay are 45-degree octagons.
- **Square corners** (Nick: tight corners are dead space, since pieces can't fit in them). Where
  a border meets a slanted shore or border at a tight angle it turns on a short foot (`FOOT`,
  24) to meet it square: Manhattan's level borders at the Hudson and Five Points / Bowery at the
  East River. Belmont / Hunts Point turns on a longer foot (`hpFoot`, 60) to meet East Harlem /
  Hunts Point square.
  Williamsburg / Red Hook and the Queens / Brooklyn line both run square to the East River,
  which makes Williamsburg a square set on its corner;
  Red Hook's shore turns upright at the Narrows in line with Coney Island's (Staten Island moves
  east with it, `NARROWS_GAP`). The drafting reports any corner under 80 degrees; there are none.
- **The four-way corner** (Sugar Hill, Belmont, East Harlem, Hunts Point) stays one point. East
  Harlem needs a shallow border with Hunts Point for its sign's width, so that border runs out to
  a knee and drops upright to the Hell Gate (`ehKnee`; East Harlem takes a short stretch of that
  shore, and the Hell Gate Bridge moves 30 east to land clear of it, `BRIDGE_SHIFT`); Belmont /
  Hunts Point leaves the corner square to it before running level to Fordham (`hpFoot`).
- **No Westchester or Nassau** (Nick: sit the Districts flush against the border). The Bronx runs
  up to the frame and Queens out to it, under it to the board's edge as New Jersey does; the
  build clips them at the frame's hairline (`insideFrame()`) for everything but their fill. The
  water east of the Bronx stays, and Belmont's shore runs straight up from Manhattan's tip, so
  the Hudson keeps a mouth. **Staten Island keeps its shore all round** (Nick: it should read as
  an island; running it to the frame was tried and cut).
- **The Queens / Brooklyn line is two straight runs** (Nick, 2026-09-29: he likes clean
  borders between Boroughs, and the old one zigzagged). It leaves the East River square (45
  degrees) from the end of Corona's shore (`astoriaShore`, `coronaShore`), past Williamsburg and
  Brownsville / Corona, and turns upright where Corona's bottom meets it (`coronaBottom`), down
  past Richmond Hill and Jamaica to the bay. Williamsburg / Brownsville runs square to it, so
  Williamsburg is a square on its corner. Astoria / Corona leaves the shore square, then runs
  level. **This changed a connection**: Astoria and Williamsburg no longer meet, because
  Corona takes the East River shore between them (see Decisions). The Queensboro Bridge moved 25
  up-river (`BRIDGE_SHIFT`) to give Astoria's corner room; it still joins East Harlem and Astoria.
  The first try, a square with a 136-unit river side, could not fit Williamsburg's sign; the
  square needs about 150.
- **Queens and Brooklyn in rows and columns.** Queens' rows are level (Whitestone | Flushing |
  Richmond Hill | Jamaica), and one upright line (`queensCol`) runs from the Hell Gate down past
  Astoria / Whitestone, Astoria / Flushing and Corona / Flushing. Richmond Hill steps up a
  little at its top left to meet Flushing (30 units): one level line for both makes Richmond
  Hill thin (room 53) and Flushing huge (110) if it sits low, and starves Brownsville's sign
  (hangers over 90) if it sits high. Brooklyn is three columns under Red Hook: Coney Island, Sheepshead Bay (`coneyEast`) and
  Brownsville, whose border with Sheepshead Bay runs straight on down from Red Hook's
  (`BK_COL`) and meets the bay's 45-degree corner on a foot. The Hunts Point / Throggs Neck line
  (`hpCol`) is upright too, and **Throggs Neck's tip is cut** 24 units back (`TN_CUT`; Nick: it
  was harsh).
- **Jamaica Bay** is 90 units wider than traced (`bayEast`), which trims Jamaica, once the one
  outlier (138). 130 wider was tried and made a sea of dead water.
- **Bridges** keep their places (bar the Hell Gate's shift) and cross square to the new banks,
  so all four are 49 long. Their names and the water labels move with the shores: the geometry
  carries them as `"labels"`.
- **Checks** before writing: no crossings, no run under 3 units, no District area off the
  traced map's by more than 20% (bar those that took in Westchester or Nassau), no shrunk border
  under 45 units (`MIN_BORDER`, about 25 mm, so it still reads as a connection), no water under
  20 wide between Districts that don't meet (the narrowest is 22, the Kill van Kull), and every
  bridge square across its river (within 4 units: a one-unit move of the Bowery's foot once
  turned the Brooklyn Bridge to 84) and landing at least 20 units from a border on its shore.

### Room for pieces, and the tuner

The build prints each District's **room**: its ground at least 6 units (about 3 mm) in from every
border and clear of its sign, in cm² at 24in. No piece sizes are recorded anywhere, so this is
area, not a piece count. `SETTINGS` were tuned with `tools/tune_board.js`, which nudges one
setting at a time and keeps what scores better: the smallest rooms first, then each crown room
kept at 55 or more where it can be, then evenness (the spread of room sizes), then short
hangers. It refuses anything that fails the drafting's checks or makes a tight corner. It cannot
move two settings together, and it has no eye: it twice pushed Williamsburg's south point up for
Red Hook's hangers at the crown room's cost, it grew Jamaica Bay into dead water,
and it traded Hunts Point for Fordham, each undone by hand. Treat its output as a suggestion.

| | Smallest room | Crown rooms (Sugar Hill, Morris Park, Williamsburg, Richmond Hill) |
| --- | --- | --- |
| Traced, centred labels | 32 (West Side) | 34, 36, 50, 65 |
| Drafted, first balance, centred labels | 42 (Tenderloin) | 47, 47, 57, 64 |
| With the signs, before the Queens / Brooklyn line | 39 (Whitestone) | 47, 57, 65, 83 |
| Now (as the build reports) | 39 (Whitestone) | 47, 57, 58, 72 |

Rooms now run 39 to 91 (Flushing), Jamaica (82) included; it was 138.

## The look

- **Deco style** (Nick, 2026-09-29). One colour per Borough for every District. **Wards take
  a wide dark band round the edge** (`WARD_BAND`: 34 wide, 70% black, feathered 7), the rough
  end of town, with the Borough's own colour in the middle so the colours match. It replaced a
  whole-Ward tint 30% towards black, which made Wards read as a different colour; a 56-wide
  band at 80% blacked out narrow Five Points. The piers tell a Dock. **Speakeasies** get a gold keyline 7 units inside their border
  with a small diamond at each corner. **High Society** gets a double keyline (6 and 10.5 in)
  with the frame's Deco fan opened or closed to fill each corner, and a brighter diamond: the
  same frame with more flourish. Corners sharper than 20 degrees or blunter than 150 take no
  ornament, and junctions along a straight border are not corners. It replaced a colour shift
  per type (Speakeasies warmer, Docks cooler), which told them apart only faintly, and a gold
  sunburst on High Society.
- **Hanging signs** (`placeSign()`, Nick, 2026-09-29). Pieces would cover a centred label, and
  an earlier placer that pushed labels aside looked odd because each went somewhere different.
  Every District gets one small plaque (type medallion, name and venue) hung by gilt hangers as
  high as it fits, centred across the room there, clear of the keylines: one rule, so it reads as
  designed. **The Still rides on its own plate bolted to the sign's right end**, a touch taller
  than the sign, with its own gilt edge and a bolt in each corner, so name and Still are one sign
  in two parts (the Still standing apart in the District was tried and lost the link). Every
  shape is tried and the one whose longest hanger, plus a cost, is shortest wins: a stacked name
  costs 15, the plate hung under the sign 60 (no District needs that now; Nick doesn't like it).
  Hangers always run to the border straight above. The longest are Brownsville's 42 and
  Sugar Hill's 41, whose tops are slants. If a sign ever doesn't fit, the build
  stops with an error.
- **The title reads up New Jersey's strip beside the Bowery** (Nick, 2026-09-29: try it lower,
  in the empty half). It could not simply move down, since New Jersey narrows under the panels.
  Upright, centred in the ground under the panels, it echoes THE BRONX on the opposite edge.
  Tried: across under the panels (as it was), and stacked on three lines.
- **The Tomorrow panel** (`tomorrow()`): the Mash socket and a 36 mm socket for tomorrow's Turn
  Tokens as **one stack, #1 on top**, so "claim the lowest-numbered token left" becomes "take the
  top token". Both are set today for tomorrow, which the panel teaches. Four separate slots would
  not fit in New Jersey. **Under the Heat corner the Tomorrow panel and the key sit side by
  side** (Nick: the title was not to be sandwiched between them).
- **The key is the price list** (Nick, 2026-09-29): two rows, Speakeasy and High Society, each
  with what it buys as chips: a barrel drawn as the cube that stands for it on the table, grey
  Moonshine `$300` and brown Rum `$500` (`CUBE`; Nick, 2026-09-29: it replaced a bottle and a
  glass, which didn't match the pieces); High Society shows only Rum, which says "Rum only" without the words. The Ward,
  Dock and Still rows were cut: the Rulebook teaches the types, the piers tell a Dock and the
  Still is its own token. Before that it lost its sentences (long-winded; bridges explain
  themselves).

## Files

- `Art/Board/Traced/board-geometry.json`: the traced map, the skeleton the drafting reads. The
  tracer reproduces it exactly. The drafting keys its edits by this file's point coordinates,
  so a re-trace or a hand edit here means matching `draft_board.js`'s MOVE, DROP and REPLACE
  keys to the new points.
- `Art/Board/board-geometry.json`: the board's map as data, written by `tools/draft_board.js`.
  One polygon per District and for New Jersey, every border one shared chain (so neighbours can
  never gap or overlap), the four bridges, and where the water and bridge names sit. mk-online
  can take click areas and the adjacency graph straight from it.
- `tools/draft_board.js`: the drafting, its `SETTINGS` and its checks. `tools/tune_board.js`:
  the tuner.
- `tools/build_board.js`: the roster (zone, Still, venue, Setup mark per District, copied from
  the Town Planner), palette, type, signs, key and panels. Everything on the board is generated
  from here; nothing is hand-placed in the SVG.
- The outputs, all committed: `Board v0.9.svg` (the print master, full leather) with
  `Board v0.9 (print preview).jpg`, and `Board v0.9 (screen).svg` with `Board v0.9 (screen).jpg`
  (the same board with a flat texture, for the website and mk-online). The two builds differ
  in the `LEATHER` preset and the print bleed.
- `Art/Index/board.jpg`: the index page's tile ("The City Map", first under Components), an
  800 x 450 crop of the screen board (`TILE_CROP`: the Queensboro and Williamsburg Bridges and
  two crown rooms), rebuilt with the board. The tile opens `Board v0.9 (screen).jpg`.

## Physical spec

- The board prints **24 inches square**: 1080 units across, so 1 unit is 0.564 mm. Physical
  sizes go through the `MM` constant.
- **Bleed** (since 2026-09-29): the print master SVG, its 300dpi PNG and the PDF carry the
  frame's black **6 units (3.4 mm) past the trim** on every side (`BLEED`): the PNG is 7280 px
  and the PDF page 616.4 mm square, for a 609.6 mm board. Coordinates are unchanged (0 to 1080
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

- **Connections changed on purpose** (`FLIPS` in `draft_board.js`, which flips a border to the
  two Districts at its ends; the traced map is untouched). **Astoria / Williamsburg** (Nick,
  2026-09-29), for the straight Queens / Brooklyn line: Corona takes the East River shore
  between them, so Corona is now Coastal. Williamsburg is Land Connected to Red Hook,
  Brownsville and Corona, plus Five Points by Bridge; its ordinary Speakeasy next door is Red
  Hook alone. The Rulebook's Land Connected example, CLAUDE.md and `mk-online-rules-sync.md`
  12.5 say so. mk-online's graph changes when it takes this geometry.

- **Hanging signs, not centred labels** (see The look). Centred labels (Nick, 2026-09-28) and
  an edge placer came before them; both were removed from the build on 2026-09-29.
- **Stills are the Still Token art itself** (`Art/Still Tokens/SVG`), so board and tokens agree.
- **Muted Borough tones.** Mob colours aren't set and the Squads are blue, so the land stays
  quiet. Brooklyn moved from red to bronze to part it from Manhattan. Queens moved from a blue
  violet (`#3f3a57`) to a warmer violet (`#4a3857`), because the old one sat too close to the
  water (Nick, 2026-09-29); a dusty mauve (`#4f3a52`) was tried and leaned towards Manhattan.
- **High Society Venues:** the martini (`Art/Icons/Gin.svg`) under a crown on the sign's
  medallion, and the Deco double keyline (see The look), which replaced a gold sunburst.
  Speakeasies keep the tumbler.
- **No setup marks on the board** (Nick, 2026-09-28): he wants to playtest other setups
  without the print committing to one. The marks (ghosted pieces in a dashed tray, no words,
  and a Setup row in the key) only ever drew beside the centred labels, so their switch went
  with them on 2026-09-29. The roster still keeps each District's Town Planner mark, so they
  could come back on the signs; git history has the tray (`tray()` in `build_board.js`).
- **The Borough reads first** (Raids and Squads work by Borough), so District types are told
  apart by drawing, not colour: the Deco frames and the piers (see The look), with Wards
  banded dark at the edge. Tried and rejected before that: a colour shift per type (Speakeasies warmer, Docks
  cooler; too faint to read), and a tooled pattern per type (waves, brick, fish scales; Nick
  prefers the Districts flat).
- **Finishing touches:** piers off each Dock's most open stretch of shore, in the Dock's own
  colour (placed automatically, clear of land, bridges and labels); Art Deco quarter fans in the
  frame's corner steps (the one at the Heat corner's turn was cut, 2026-09-29: it sat on the map
  and looked odd); a soft drop shadow under every Still and type medallion, so they sit on the
  board like pieces.
- **The sign's type medallion is 18 units across** (about 10 mm at 24in) and its Still 30 units
  tall (17 mm): small enough to keep the signs out of the pieces' way, large enough to read.
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
- **No Liquor Value track.** The key carries the prices as chips (see the key, above).
- **Title is NEW YORK 1929, nothing more.** No logo, no compass, and since 2026-09-28 no north
  line either (Nick found it too prominent).
- **Leather, generated, not an image.** `leatherFilter()` builds a pebble grain from crease
  patterns multiplied (one alone draws worm-like squiggles at print scale), over soft wrinkles,
  with a sheen and uneven dye. The board is a coarse hide (pebbles 2 to 3 mm); the Heat corner is a
  **finer, flatter skin**, stitched in. The key and Mash panels carry no stitching or leather
  (Nick, 2026-09-28); since 2026-09-29 they are **lacquered plaques** to match the Heat Track:
  a polished gilt edge with a dark seat inside it, a hairline, a small diamond on each Deco
  chamfer, and a soft shadow lifting them off the hide. The Mash and Turn Token sockets (in
  the Tomorrow panel) are recessed in the Heat Track's lacquer and gilt, their names engraved
  above them. **The key's row pitch** (19 units) leaves the High Society crown clear of the
  Speakeasy medallion above it. Saddle stitching runs round the board
  edge and inside the Heat corner. The **screen** build drops the pebbles and
  keeps only soft wrinkles and dye, because at screen size the grain turns to noise (Nick asked
  for it). Presets live in `LEATHER`. It prints crisp at any size and needs no licence; a CC0
  scan (ambientCG, Poly Haven) could be tiled in if it ever needs to be photographic. Judge the
  print grain at print scale, not in the downscaled preview. Every leather filter ends by
  masking to `SourceAlpha`: the lighting is opaque across the whole region, and without the mask
  the panel filter painted grey over the entire map.
- Water labels are placed by visual centre, midway between the shores and at their angle, so
  they stay centred if the type changes. New Jersey is unlabelled (Nick cut it).

## Open

- **Other short borders** Nick may want gone: East Harlem / Five Points (32), Astoria /
  Flushing (42), Fordham / Throggs Neck (46), Brownsville / Jamaica (46) and Brownsville /
  Red Hook (47). Brownsville / Jamaica was on the list with Astoria / Williamsburg but was kept:
  it sits on the straight upright run, so dropping it adds nothing to the look, and it would
  put Richmond Hill (a crown room) on the bay, making it Coastal. Any of them is a new entry in
  `FLIPS`. Other known weak spots: Whitestone is the smallest room (39), squeezed by the Queens
  column and Astoria's border with Flushing.
- **Martini sync.** The Rulebook's component list still says "12 Speakeasies (Tumbler Glass),
  four of them High Society Venues (Crown)", and the Town Planner roster shows the tumbler on
  the High Society rows. Not changed yet; waiting on Nick.
- ~~**Rulebook wording.**~~ Fixed 2026-09-28: the Big Bust tiebreak reads "ranked highest on its
  Still's Pressure Strip", matching the Town Planner. (The Kingpin's Guide still says "the
  Borough's Pressure Strip"; it lags by design.)
- ~~**mk-online.**~~ Done 2026-09-29 (mk-online a1b0ff4): the drafted board, its click areas,
  sign-aware piece spots, the Heat, Mash and Turn Order sockets, and the graph. The game's graph
  had still followed the old raster board, so ten connections changed, not one:
  East Harlem to Five Points, Astoria to Flushing, Brownsville to Jamaica, Red Hook to Sheepshead
  Bay, and the Hell Gate and Brooklyn Bridges came in; Tenderloin to Bowery, Corona to
  Whitestone, Throggs Neck to Whitestone and Astoria to Williamsburg went. If the map changes
  again, `mk-online-board-handoff.md` is still the brief.
- **Affinity round-trip.** The SVG opens in Affinity, but the texture and soft shadows are SVG
  filters and will likely drop out, and Cinzel, Barlow, Barlow Condensed and Bebas Neue (the Still
  tokens' numbers) must be installed locally.
