# The board: vector rebuild

Status (2026-09-28): **in progress, not merged.** The work lives on branch
`claude/board-image-design-509xha`. Nick is iterating on the look one round at a time. The
Affinity export (`Art/Board (Large).png`) is untouched and is still what mk-online serves.

```
node tools/build_board.js           # print and screen SVGs + a 2160px JPEG of each, seconds
node tools/build_board.js --print   # also the 7200px print PNG (24in at 300dpi), git-ignored
node tools/trace_board.js           # only if the Affinity board changes; rewrites the geometry
```

Both scripts need Playwright's Chromium. Where Playwright is installed globally rather than in
the repo, point Node at it (`NODE_PATH=/opt/node22/lib/node_modules` in the cloud sandbox) or set
`PLAYWRIGHT_PATH`. The build fetches its four fonts from Google Fonts and embeds them in the SVG,
so the SVG renders the same anywhere; the build itself needs the network.

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
- **Zone roundels are 28 units across** (`R = 14`, about 16 mm at 24in), big enough to read
  a District's type at a glance beside its Still.
- **The Heat Track is one row, numbered left to right.** A Raid chases the marker "furthest
  right on the Heat Track"; wrapping it into two rows would break that. The sockets copy the
  Ledger's (dark wells, a faint gold ring); only the numerals warm from gold towards rust, with
  RAID on the 5th. Nick asked for subtle escalation or none: `HEAT_NUM` and `HEAT_TINT` hold it,
  and setting both flat gives the Ledger's plain look.
- **No Liquor Value track.** The key's prices are worded as the Town Planner's legend.
- **Title is NEW YORK 1929 with a drawn north line.** No logo, no compass (Nick's call).
- **Leather, generated, not an image.** `leatherFilter()` builds a pebble grain from crease
  patterns multiplied (one alone draws worm-like squiggles at print scale), over soft wrinkles,
  with a sheen and uneven dye. The board is a coarse hide (pebbles 2 to 3 mm); the panels (Heat
  corner, key, Mash) are a **finer, flatter skin**, stitched on like patches. Saddle stitching
  runs round the board edge and inside each panel. The **screen** build drops the pebbles and
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
- **Rulebook wording.** The Big Bust tiebreak says "ranked highest on its Borough's printed
  Pressure Strip". Nothing printed is a strip per Borough: each Still carries its own, and the
  Town Planner says "its Still's Pressure Strip". Probably a one-phrase fix; not made.
- **mk-online.** The geometry is ready for it; the mk-online source is its own repo
  (`njdyson/mk-online`), not this one.
- **Affinity round-trip.** The SVG opens in Affinity, but the texture and soft shadows are SVG
  filters and will likely drop out, and Cinzel, Barlow, Barlow Condensed and Bebas Neue must be
  installed locally.
