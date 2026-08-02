# Handoff: Updating `mk-online` to match v6.0 tabletop rules

**Repo:** `g:\My Drive\Moonshine Kingdom\Moonshine Kingdom` (branch `main`, pushed to `origin` = github.com/njdyson/Moonshine-Kingdom)
**Date of handoff:** 2026-07-07
**Purpose:** Bring the online implementation (`mk-online/`) in line with the current v6.0 rulebook and components. This session changed the tabletop rules (raid tiebreaker + still-number layout) and wrote two strategy guides; the online app has NOT been touched and is known to be behind.

---

## 🚨 STALENESS WARNING (added 2026-07-19) — do NOT port from the delta list below

**This document is twelve days and four rules generations out of date.** It was written against
"v6.0" (since renamed **v0.63**) and its "deltas to port" section lists only the raid tiebreaker and
the still-number layout. **Porting that list would leave the app just as far behind as it is now.**

The tabletop has since gone **v0.63 → v0.7 → v0.8 → v0.9**, and the changes are structural, not
numeric tweaks. Do not reconstruct them from this file. **The source of truth is two repo docs, both
written to be read cold:**
- **`jobs-system-handoff.md`** — the Jobs system and deck spec
- **`v0-8-changes.md`** — everything else, with the reasoning, in dated sections

The headline shape of what the app is missing, so you can scope the work before reading:
- **Contracts are gone.** They are now **Jobs**: a 32-card deck (12/12/8 by Respect 1/3/5), a
  **static** Market of Player Count + 1 face-up, claimed by staking Influence at **The Offers** in
  Shadows. No churn, no expiry, no per-player deck build. *(This is the single biggest port; the
  bundle's `contract data` is a different system, not a renamed one.)*
- **Favors are gone.** **Bribe** buys permanent Influence at $2,500, ceiling 10. Winning is
  **10 Influence + 15 Respect + honor intact** (no unpaid Shylock's Mark; the Rat Card left the honor
  test on 2026-07-27 and bills &minus;3 Respect instead).
- **Phases renamed**: Operations → **The Hustle**. **Public Enemy No. 1 Title cut** (3 Titles now:
  Ward Boss, Harbormaster, Night Mayor).
- **Recruit is Safehouse-only**, $500/Runner less $100 per Ward Controlled, uncapped.
- **Harbormaster names the grey Mash die** instead of paying a toll; **Night Mayor** is a new Title.
- **Wiped Out deleted; Rise absorbed it** and became a **Power Play (cost 2)** that places a Boss in
  any Safe District, with a free Safehouse if yours is also off the board.
- **Rat**: no Heat-track gate, and holding the Rat Card blocks Ratting again. *(2026-07-27: the card
  now costs **&minus;3 Respect** and nothing else. No Jobs blackout, no crown bar, no absolution; it
  leaves you only when a rival Rats. Port spec in `mk-online-rules-sync.md` §1.)*
- **The Sweep caps a District at 5 Mobsters** at Reckoning (Sicilians are Untouchable and exempt).
- **Cooperation reworked (v0.9)**: Puppeteering only to a rival who hasn't Laid Low, who may refuse;
  lent markers are spendable immediately *including mid-firefight*, and unspent ones return to the
  lender at Lay Low. Binding Handshakes expire at the end of the current Day. *(2026-08-02:
  superseded — **Puppeteering is cut entirely**, and a broken Handshake now costs a **Handshake
  card** (&minus;1 Respect at scoring, permanent, stacking) instead of a staked marker. Port spec in
  `mk-online-rules-sync.md` §7.)*

**Action item #0 below still stands and is still unanswered** — the source tree for `mk-online/` has
never been located. Nothing here is portable until it is.

---

## ⚠️ Read this first — the biggest blocker

**`mk-online/` in this repo contains only a built `dist/` bundle. There is NO source tree.**

```
mk-online/
  dist/
    index.html                     -> loads assets/index-<hash>.js
    assets/index-C-yFcYTc.js        -> 516 KB MINIFIED Vite bundle (the whole game)
    assets/index-BE30qOIH.css
    Art/, board.png, favicon.svg, icons.svg
```

There is **no `src/`, no `package.json`, no Vite config** committed. The game logic — districts, still numbers, brew/blowback, combat (Ambush/Safehouse/Threat), kickbacks, contracts — is all compiled into that one minified JS file. Confirmed by grepping the bundle: it contains `Ambush`, `Safehouse`, `Threat`, `Blowback`, `Kickback`, `stillCaps`, district names, contract data, etc.

**Action item #0 (do before anything else):** locate the actual React/TS source project. It is almost certainly outside this repo (a separate folder or repo on the user's Drive/machine). **Ask the user where the mk-online source lives.** Editing the minified `dist` bundle by hand is not viable for rules changes. Everything below assumes you will be editing source and rebuilding.

---

## The online app is running an OLDER ruleset than v6.0 (not just stale numbers)

This is the important discovery. The divergence is bigger than this session's tweaks. Evidence from the bundle:

- Bundle has **`stillCaps:{gin:14,whisky:6}`** and a liquor-degradation chain **`whisky → gin → moonshine`** on Blowback (`if(r.still.type==='whisky'){...type='gin'}` … `if(r.still.type==='gin'){...type='moonshine'}`).
- That is a **multi-liquor brewing system with per-type caps and still-type degradation.**

The **current v6.0 rules** (`Moonshine Kingdom Rules v6.0.html`) use a **single-liquor brew:**
- Only **Moonshine** is brewed at stills (Muscle-Ratio yield).
- Moonshine is **Traded 1:1 to Havana Rum** at a Dock you Control.
- Rum's only edge: it pays a **Kickback** (recycles spent Influence) when Unloaded. Moonshine pays cash only.
- Blowback in v6.0 only **kills Runners** (Muscle-Ratio casualties); the still keeps running. There is **no still-type flip / re-tap** anymore.

⚠️ Caveat / nuance to verify: the v6.0 **rulebook still contains ~25 "gin"/"whisky" mentions**, but on inspection these are mostly **flavour text** ("a barrel of gin can't hold a street corner") and **leftover icon filenames** (`Art/Icons/Gin.svg`). The *mechanical* brew section is single-Moonshine. Do NOT assume gin/whisky are still mechanical just because the words appear. Confirm against the "Phase 1: Shadows / The Brew / The Blowback" section (~lines 388–408 of the rulebook) and the Brew Simulator, which both encode the current single-liquor model.

**Recommendation:** Treat this as a rules-model migration, not a data patch. The online brew engine likely needs rewriting to the single-Moonshine + Trade-to-Rum + Kickback model, not just renumbering.

---

## What changed on the tabletop THIS session (the deltas to port)

All committed & pushed. Commits (newest first): `503be98`, `ad35423`, `eff60d4`, `a755df2`.

### 1. Raid resolution — tiebreaker + squad order  (`a755df2`)
Old rules → new rules:
- **Squad resolution order:** was "Town Planning Ledger order" → now **numbered Borough order printed on the board**.
- **Big Bust tiebreaker:** when a rival holds multiple raided districts with equal top Heat, was "most Barrels, then first on the Ledger" → now "most Barrels, then **hottest boiler = highest still Pressure**." Pressure = closeness to 7 on the 2d6 curve (7 = max pressure, tailing to 2/12). Each Borough now has **unique pressures** so this never ties.
- Source of truth: rulebook `Police Raids` section (~lines 1114–1134) and the Turn Structure card raid box.

### 2. Still-number layout — full re-balance  (`eff60d4`)  ← MOST LIKELY TO BE HARD-CODED ONLINE
The 25 districts were renumbered so each Borough has unique pressures AND every mainland Borough's High Society boiler is a **7** (Staten Island has no 7). **Canonical numbers (borough order, priority #1..n):**

| Borough | Districts (priority order) → still number |
|---|---|
| **Manhattan** | Five Points **10**, Sugar Hill **7** (HS), East Harlem **12**, The Tenderloin **8**, West Side **11**, The Bowery **9** |
| **The Bronx** | Hunts Point **9**, Morris Park **7** (HS), Belmont **11**, Fordham **8**, Throggs Neck **10** |
| **Queens** | Corona **4**, Richmond Hill **7** (HS), Astoria **2**, Flushing **6**, Whitestone **5**, Jamaica **3** |
| **Brooklyn** | Brownsville **5**, Williamsburg **7** (HS), Coney Island **3**, Red Hook **6**, Sheepshead Bay **4** |
| **Staten Island** | Stapleton **6**, Westerleigh **12**, Tottenville **4** |

Token-bag multiset (for any "supply" logic): 7×4, 6×3, 4×3, 12×1, and 2× each of {2,3,5,8,9,10,11}. Total 25.
- Source of truth: `Turn Structure Flow Card v6.0.html` (the Town Planning Ledger table) and `Still Tokens v6.0.html` (the generator `numbers` array + comment).
- **In the bundle, still numbers did NOT appear as obvious `still:7` literals** near district names — they may be in a separate keyed structure or on the district objects. Search the source for where districts get their brew number and update all 25.

### 3 & 4. Strategy guides (`ad35423`, `503be98`) — NOT game logic
`Brew Engine Strategy v6.0.html` and `Combat Strategy v6.0.html` — new player-facing reference pages, linked from `index.html`. No online impact unless you want to surface them in the web UI. Ignore for the rules port.

---

## Checklist for the online update

1. **Find the mk-online source** (ask the user). Verify you can `npm install` + build and that the build reproduces `dist/`.
2. **Audit the brew/liquor model.** Confirm whether online is on the old gin/whisky/degradation system. If so, migrate to single-Moonshine + Trade→Rum + Kickback + Runner-only Blowback. This is the big one.
3. **Update the 25 still numbers** to the table above wherever the source assigns brew numbers to districts.
4. **Update raid logic:** squad order = Borough order; Big Bust tiebreak = most Barrels → highest still pressure (define pressure = `6 - abs(7 - stillNumber)` or equivalent).
5. **Rebuild** and replace `mk-online/dist/`. Commit the rebuilt bundle (that's how this repo ships the app — `dist` is version-controlled).
6. **Spot-check parity** against the tabletop: brew a 7-still, confirm Moonshine-only yield; trigger a raid and confirm it resolves by Borough and breaks ties on pressure.

## Cross-reference files (tabletop = source of truth)
- `Moonshine Kingdom Rules v6.0.html` — the rulebook. Brew: ~L388–408. Raids: ~L1114–1134. Combat: ~L798–983. Currencies/Trade/Kickback: ~L183–213, L465–497.
- `Turn Structure Flow Card v6.0.html` — Town Planning Ledger (canonical district still numbers).
- `Still Tokens v6.0.html` — token multiset generator.
- `Brew Simulator v6.0.html` / `Combat Simulator v6.0.html` — reference implementations of the CURRENT brew & combat math (rules-verified this session). Good oracles for expected behaviour.

## Open questions to raise with the user
- Where is the mk-online source project?
- Is the online app *intended* to match v6.0 exactly, or is it deliberately on an older/simplified ruleset (e.g. multi-liquor) that they want to keep?
- Should the two new strategy guides be linked from the online app's UI, or stay as standalone HTML?
