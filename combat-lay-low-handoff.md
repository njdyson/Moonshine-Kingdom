# Handoff: the Ambush/Lay-Low session (2026-08-01)

**State: everything described here is BUILT, committed, and merged to `main` (tip `917bc70` at
handoff time).** This doc exists so a fresh session can pick up the thread without re-deriving it.
The full reasoning lives in `v0-8-changes.md` (all 2026-08-01 sections plus the 2026-07-31 BUILT
entries they finish); this is the map, not the territory.

> **2026-08-02 — Puppeteering has since been CUT.** Points 5 and 7 below (loans fund the Ambush;
> the Lay-Low loan block is load-bearing) described real rules for one day and are now dead
> letters: there are no loans of any kind, and Handshakes now pay in Respect via Welsher cards.
> Reasoning in `v0-8-changes.md` (2026-08-02 addendum) and the port spec in
> `mk-online-rules-sync.md` §7. Everything else in this doc stands.
>
> **2026-08-02 — the noun "Call" is RETIRED.** Point 6 below named the in-fight decisions
> **Calls**; the rules they describe are unchanged, but the term is gone from the books and the
> same facts are now stated in plain language (a firefight is one Play; what happens inside it
> costs Influence, never a turn). Point 7's lawyer-loop died with Puppeteering. Reasoning in
> `v0-8-changes.md` (2026-08-02 terminology addendum).
>
> **2026-08-03 — Plunder-on-Ambush is CUT.** Point 3 below (the Irish robbing invaders *instead
> of* a gun Ambush) is a dead letter: it traded the defender's only first strike for loot that
> stays in the district and reverts to the invader if the district fell, so it's removed.
> **Offensive Plunder** — the Pinned invader stealing barrels — is unchanged. Reasoning in
> `v0-8-changes.md` (2026-08-03) and the port note in `mk-online-rules-sync.md` §6.2.3.

---

## What this session shipped, in dependency order

1. **Sync audit of the 2026-07-31 combat rework.** The Rulebook, Guide prose, and Combat Simulator
   had survived the churn intact, but the **Playbook combat cards were two rules generations
   stale** (Ambush cost 0/no Heat, Safehouse +2, Open Fire heat-on-kills). All four card backs
   synced. Past-language sweep ("the Ambush's *new* price", "Guns are never silent *now*") — rules
   text reads as timeless law; design history belongs in the changelog.

2. **The Duck Window written into the Kingpin's Guide** (new subsection after the Occupier's
   Playbook), capturing Nick's strategic read, verified against the sim figures:
   - Small crews (1 die) shouldn't Ambush — under a kill on average for a marker plus Heat — so
     **Fold dominates unless the block is a crown** (Ambush row qualified accordingly).
   - Laying low a Play or two early behind garrisons risks little (a raid needs Move + a marker
     per volley into free return fire); laying low at *noon* is how strong districts die.
   - The true exploit is the **Rum Kickback re-arm**: +3 Plays at dusk against rivals already
     laid low. "Count his barrels, not his markers."

3. **Plunder-on-Ambush: cost yes, Heat no** (Nick's ruling on the flagged open question). Costs 1
   from the Ledger like any Ambush — the Irish face the duck too — but stays silent and does
   **not** claim the fight's first shot (the invader still takes the marker if he fires).

4. **Lay Low is an explicit Play, Cost 0, on your turn** — never a reflex at 0 Influence. Added as
   a CLOSING TIME section to all four Playbook cards, reframed in the Rulebook turn box, synced to
   the Turn Structure board ("Standard 1, Power 2, Lay Low 0"). Odd Jobs ($100/marker) included on
   every surface. Structural fix: every turn demands a Play, so the timing ambiguity can't arise.

5. **Puppeteer loans can fund an Ambush** (the Standoff joins the Pin as a spend-now moment), with
   the priced consequence made explicit: the Ambush marker IS the fight's Heat marker, so a lender
   who bankrolls a defence locks **their own** marker to the Track. Guide: raiders must count a
   duck's *friends'* Ledgers; only Laid Low is past lending.

6. **Plays vs Calls defined** ("One Play, many Calls" note in the Rulebook Standoff section). The
   Move is the fight's only Play; every in-fight decision by either crew is a **Call** — it spends
   your money, not your turn. Kills three birds: why a firefight of any length is one Play, why
   defence is always available (even Laid Low — "off the streets is not off the board"), and the
   pin-note's stale "repeats this choice each turn" (fights never span turns).

7. **The lawyer-loop is sealed** (Nick's catch, on the record): with Calls ≠ Plays, only the Lay
   Low Play's "no incoming Puppeteer loans until tomorrow" clause stops a Laid-Low crew ambushing
   on a borrowed marker. That clause is **load-bearing** — do not soften it.

**Considered and rejected** (assessment only, no change): extending Irish Firepower to the Ambush.
It would collapse the attacker/defender identity split, re-muddle the small-crew fold guidance,
and outshine the just-shipped Plunder-Ambush. Revisit only with playtest evidence the Irish feel
weak at home.

## Open items

- [ ] **Nick eyeballs the Playbook cards for overflow** — CLOSING TIME section and the longer
      pin-note/Puppeteer note are the new bulk. Trim on request; the Rulebook is the authority, so
      card text can compress freely.
- [ ] **Nick reads `main` for clarity** — everything above landed there; muddled passages come
      back as trim requests.
- [ ] **mk-online port** — the deployed web build predates the entire combat rework. The complete
      engine-facing spec is **`mk-online-rules-sync.md` §6** (+ its checklist), written to be read
      cold. Bundle source lives outside this repo; deploy process in `DEPLOY.md`.
- [ ] **Rebuild shipping PDFs** after any card trims (`Build PDFs.cmd` / `tools/build_pdfs.ps1`).
- [ ] Changelog watch-items still open: duck-raid politics at the table (does the lay-low race
      stay healthy?), and whether Hold Fire earns its keep now that it competes with Ambush.

## Conventions this session followed (keep them)

- Every decision gets a dated `v0-8-changes.md` entry with the *why*; open questions get flagged
  there and resolved in place (see the RESOLVED blocks) rather than silently edited.
- Rules surfaces that must stay in lockstep: **Rulebook ↔ Playbook cards ↔ Turn Structure board ↔
  Kingpin's Guide ↔ Combat Simulator**. The cards are where sync rot hits first — check them
  after any rules commit.
- Work on a `claude/...` branch, push, fast-forward `main` when Nick asks (he reads `main`).
