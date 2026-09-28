# The board: vector rebuild

Status (2026-09-28): **in progress, not merged.** The work lives on branch
`claude/board-image-design-509xha`. Nick is iterating on the look one round at a time. The
Affinity export (`Art/Board (Large).png`) is untouched and is still what mk-online serves.

```
node tools/build_board.js           # SVG + 2160px preview JPEG, a few seconds
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
- `Art/Board/Board v0.9.svg` and `Board v0.9 (preview).jpg`: the outputs, committed.

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

- **Labels sit at the edge, not the centre.** Centred would look nicer, but pieces would hide
  the Still. The placer puts each cluster where it leaves the largest open circle for pieces,
  keeps it clear of neighbouring clusters across a border (an early version put Belmont's 11
  beside Fordham's 8), and prefers the stacked layout. Nick agreed.
- **Stills are the Still Token art itself** (`Art/Still Tokens/SVG`), so board and tokens agree.
- **Muted Borough tones.** Mob colours aren't set and the Squads are blue, so the land stays
  quiet. Brooklyn moved from red to bronze to part it from Manhattan.
- **High Society Venues:** the martini (`Art/Icons/Gin.svg`) under a crown, plus a gold
  sunburst and inner keyline. Speakeasies keep the tumbler, one colour for all.
- **Setup marks are ghosted pieces in a dashed tray, no words**: Home Turf (Safehouse, Boss,
  2 Runners), 3 Runners, and a Squad shield. Nick's brief: a crown room must not read as always
  policed. The key's Setup row says "Where the pieces start".
- **The Heat Track is one row, numbered left to right.** A Raid chases the marker "furthest
  right on the Heat Track"; wrapping it into two rows would break that. The sockets copy the
  Ledger's (dark wells, a faint gold ring); only the numerals warm from gold towards rust, with
  RAID on the 5th. Nick asked for subtle escalation or none: `HEAT_NUM` and `HEAT_TINT` hold it,
  and setting both flat gives the Ledger's plain look.
- **No Liquor Value track.** The key's prices are worded as the Town Planner's legend.
- **Title is NEW YORK 1929 with a drawn north line.** No logo, no compass (Nick's call).
- **Leather, generated, not an image.** The `leather` filter builds a pebble grain from three
  crease patterns multiplied (one alone draws worm-like squiggles at print scale), over soft
  wrinkles, with a sheen and uneven dye; saddle stitching runs round the board edge, both sides
  of the Heat corner, and inside each panel. It prints crisp at any size and needs no licence.
  If it ever needs to be more photographic, a CC0 scan (ambientCG, Poly Haven) could be tiled
  in instead; not tried yet. Judge the grain at print scale, not in the preview: the downscaled
  JPEG makes it look busier than it prints.
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
