# Handoff — TOC pages, subsection anchors, and page compression

**For:** a fresh agent picking up the Rulebook + Kingpin's Guide layout work.
**Repo:** `njdyson/Moonshine-Kingdom` · **Dev branch:** `claude/kingpins-guide-improvements-7s1d8f` (currently in sync with `main`).
**Live site:** https://mk.psybob.uk

---

## 1. The ask (three tasks)

1. **Add a Table of Contents page** to `Rulebook v0.9.html` and `Kingpin's Guide v0.9.html`.
   - Must **print well** (it's a physical-book TOC) **and** be **clickable in HTML** (anchor links that jump to the section).
2. **Light restructure of the Kingpin's Guide** so **every subsection/strategy has a name to anchor it** — i.e. give each `<h3>` (and the strategy `<h4>`s worth linking) a stable `id`, so the TOC can point at them. Most already have good visible titles; the work is mostly adding `id` slugs (and disambiguating a couple of repeated titles).
3. **Compress whitespace pages** in the Kingpin's Guide — several pages are mostly blank; merge them so two half-pages become one.

Deliver all three, verify (screen **and** print), then commit + deploy (see §7).

---

## 2. How these documents are built (read before touching layout)

Both files share `css/moonshine-rules.css` (the same skin as the decks/playbooks). Structure:

```
<body>
  <div class="front-page"> … cover … </div>
  <div class="container one-column"> … a section … </div>
  <div class="container one-column"> … next section … </div>
  …
</body>
```

- **Each top-level `.container` (and `.front-page`) is exactly ONE printed page.** In the print block, `body > .container { break-after: page }` (moonshine-rules.css:**1641-1644**; last one is excepted at 1646). There is intentionally **no `min-height` in print** (comment at ~1377).
- **On screen**, `.container { width:210mm; min-height:297mm }` (moonshine-rules.css:**1160-1163**) — so every container renders as a full A4-tall "page," which is why a short section looks like a big blank page in the browser too.
- Guides are **`.one-column`**; the Rulebook mixes one- and two-column containers. Two-column pages flow into CSS columns; `break-inside: avoid` is set on tables, `.kingpin`, `.principle`, etc., so those never split.
- **Mobile** now renders the true page scaled to fit: the guides set `<meta name="viewport" content="width=920">` (a recent change). A new TOC container inherits this automatically — no extra mobile work, but do screenshot it at 390px to confirm.

### Why there's blank space, and how to compress it
Because **one container == one page**, a `.container.one-column` holding only a couple of short paragraphs still forces a full-page break after itself → a half-blank page. **To merge two pages into one, delete the seam between two adjacent containers** — i.e. turn:

```html
</div>
<div class="container one-column">
```
into nothing (join the two `.container` bodies under a single `.container`). The combined content then shares one page and one gold frame.

**Constraint:** only merge containers whose **combined content fits within one A4 page** in print, or it will spill to a second page anyway. Verify with a print/PDF render (see §6), not by eye on screen. Good merge candidates in the Kingpin's Guide are the short single-`<h4>` or single-table containers (e.g. the "So What's the Optimal Play?" tables, the "Three Principles" blocks). There are **38 containers** in the guide today — expect to remove a handful of seams, not restructure wholesale.

---

## 3. Task 1 — the TOC page

**The CSS scaffolding exists but is OLD — restyle it, don't reuse as-is.** `moonshine-rules.css` defines the pattern (`.toc-container` line **1633-1637**; `.toc-list`, `.toc-list a`, `.toc-text`, `.toc-dots` dotted leader, `.toc-page`, `.toc-list .sub-item` at **1102-1143**; print tweaks **1651-1659**). It predates the v0.9 reskin, so **bring it up to the current look** the sims/guides now use: Cinzel for the TOC heading/part rows, Barlow for entries, the token palette (`--gold-bright`, `--gold-label`, `--rule`, `--wash`), and the framed panel feel. Keep the class names (so it stays print-paginated) but modernize the type, colour, and spacing. No HTML file consumes these yet — you're the first, so you own the restyle.

Markup shape:

```html
<div class="container one-column toc-container">
  <h2>Contents</h2>
  <ul class="toc-list">
    <li><a href="#brew">
      <span class="toc-text">Part I · The Brew Engine</span>
      <span class="toc-dots"></span>
      <span class="toc-page">1</span>
    </a>
      <ul class="toc-list">
        <li class="sub-item"><a href="#magic-of-seven">
          <span class="toc-text">The Magic of Seven</span>
          <span class="toc-dots"></span><span class="toc-page"></span>
        </a></li>
        …
      </ul>
    </li>
    …
  </ul>
</div>
```

Place it **right after `<div class="front-page">…</div>` and before the first content container**, so it prints as page 2. Anchor links (`href="#id"`) are what makes it clickable in HTML — that part is free.

### Page numbers — user decision: OMIT FOR NOW, keep the door open
The user wants page numbers **in the printed booklet eventually**, but hit exactly the known problem last time: **browsers can't reliably auto-generate an anchor's target page number in native print** (`target-counter(attr(href), page)` is CSS Paged Media — paged.js/Prince only, not Chrome "Save as PDF"), and hand-numbered pages drift out of sync every time the layout changes. So for **this pass**:
- **Ship without page numbers.** Titles + dotted leaders, fully clickable in HTML — that's the priority ("definitely in HTML").
- **Keep the `.toc-page` span in the markup** (empty), so numbers can be slotted in later without re-templating.
- **Document the real path for the printed booklet:** the only robust way to get consistent print page numbers is a paged-media renderer — **paged.js** (client-side, browser-friendly) generating the numbers via `target-counter`. That's a deliberate future add for the print run, not this task. Don't hand-number.

---

## 4. Task 2 — anchor the Kingpin's Guide subsections

**h2 Parts already have ids:** `#shape #brew #market #standoff #heat #table #coda`. Link those directly.

**Every `<h3>` subsection lacks an id** — add a stable slug to each so the TOC (and future deep links) can target it. The h3 list (with current line numbers — will drift as you edit; match on text):

- Part I: The One Rule That Governs Everything · The Hand on the Dice: The Harbormaster · The Magic of Seven · Count the Boilers Before You Plan a Stack · The Other Way Out: Spread the Ends · Read the Docks · The Kill Shot: Mirror, Then Lay Low First · Three Principles of the Brew · Park the Boss: Split the Batch · The Numbers Behind It
- Part II: The One Rule That Governs Everything · Heat Is Billed to the Same Account · One Claim a Day Is a Rate, Not a Limit · The Five-Play Ceiling Is a Fiction: The Kickback · The Market Never Moves · The Reverse Snake · The Staring Contest · What the Deck Actually Asks You For · Reading the Board: The Four Lanes · Denial · Overlaps · Three Principles of the Offers · The Four Mobs at the Offers
- Part III: Two Numbers Run Every Fight · The Standoff: The Whole Game in Two Questions · How Steep Is the Premium? · Three Principles of the Street · The Occupier's Playbook · The Four Mobs at War
- Part IV: What the Law Hears · What Heat Actually Costs You · How the Raid Picks Its Door · When You Want the Fire · The Rat: A Raid on Demand
- Part V: Why Deal at All? · What Actually Trades · The Handshake · The Off-Book Sale · Conspiracies · The Frame-Up · Specialist Services · The Blood Oath *(Puppeteering cut 2026-08-02)*

**Watch out:**
- **"The One Rule That Governs Everything" appears twice** (Part I line ~233 and Part II line ~625). Give them distinct ids (`#brew-one-rule`, `#market-one-rule`) and consider distinct visible titles so the TOC isn't ambiguous.
- **"So What's the Optimal Play?"** recurs as an `<h4>` in several Parts — same disambiguation if you list them.
- Use lowercase-hyphen slugs (`id="magic-of-seven"`). Keep them descriptive and stable; they may become shared URLs.
- The existing **"What's in the Book"** list (`.guide-toc`, ~line 202) stays, but **reword it as an introduction** (user's call): turn the five-Part bullet list into short intro prose that sets up the book, and let the **new TOC page own navigation**. Don't just delete it — repurpose the content as a lead-in.

The Rulebook already has ids on most `<h2>`/`<h3>` (`#overview #components #concepts #mob #muscle-ratio #map #currencies #logistics #goal #setup #gameplay #shadows #hustle #reckoning #win #cooperation #combat #heat #consolidation`). Add ids only to the few h3s still missing them, then build its TOC from the existing ones.

---

## 5. Constraints / don't-break list

- **`css/moonshine-rules.css` is shared** by the Rulebook, both guides, Playbooks, Turn Structure, and index. Prefer reusing existing classes; if you add CSS, scope it so you don't disturb other docs. The TOC classes are already global and safe.
- **Keep it print-first.** Screen is defined as "a preview of print" (see the long comment at moonshine-rules.css:1146). Don't optimize the TOC for screen at print's expense.
- **Merging containers** removes a gold frame boundary — that's intended (two pages → one framed page). Just confirm the merged content fits one page.
- Don't renumber or rewrite the strategy content while anchoring — this is a structural/id pass, not an editing pass. (Two known-stale labels exist elsewhere: the sims still say "v0.7/v0.8" — out of scope here.)

---

## 6. How to verify (screen + print)

A headless-Chromium screenshot harness already exists in the session scratchpad (`shot.js`, uses `playwright-core` + `/opt/pw-browsers/chromium_headless_shell-1194`). Reuse the pattern:
- **Screen/mobile:** load `file://…/Kingpin's Guide v0.9.html`, screenshot at desktop (≥1000px) and mobile (390px, `isMobile`).
- **Print — important for this task:** render a PDF to check real pagination and that blank pages are gone:
  ```js
  const p = await browser.newPage();               // full chrome binary, not headless_shell, for pdf
  await p.goto('file://…/Kingpin's Guide v0.9.html', {waitUntil:'networkidle'});
  await p.pdf({ path: 'guide.pdf', format: 'A4', printBackground: true });
  ```
  (Use the full `chromium-1194/chrome-linux/chrome` with `--headless=new` for `page.pdf`; `headless_shell` is fine for screenshots.) Count pages before/after compression; confirm the TOC lands on page 2 and every anchor jumps correctly in the HTML.

---

## 7. Ship it

- Work on the designated dev branch; commit in logical chunks (TOC / anchors / compression are naturally separate commits).
- **Deploy = push to `main`.** The `.github/workflows/deploy.yml` action rsyncs the repo to the VPS on every push to main (~40s, watch the run). There is **no build step** — the HTML is served as-is.
- Only push to main when the user has approved (this session's pattern: screenshot → sign-off → deploy). Confirm the deploy run goes green before reporting done.

---

## 8. Definition of done

- [ ] Rulebook has a clickable, print-styled TOC page (page 2) linking every major section.
- [ ] Kingpin's Guide has the same, linking Parts **and** named subsections.
- [ ] Every Kingpin `<h3>` (and any linked `<h4>`) has a stable, unique `id`; duplicate titles disambiguated.
- [ ] Blank/half-empty pages in the Kingpin's Guide reduced by merging short containers; verified via PDF that no content spilled and page count dropped.
- [ ] Verified on desktop, mobile (390px), and print/PDF; deploy run green on `main`.
