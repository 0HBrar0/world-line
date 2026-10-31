# Visual concept: Steins;Gate world-line explainer

A static, fully client-side web app that shows a first-time viewer how Steins;Gate and Steins;Gate 0 bend time: animated, interactive and spoiler-safe by default. Every story fact on screen comes from `data/canon.json` by id. This document defines the screens, interactions, motion and visual language. It contains **no story facts of its own**: wherever an example below quotes a value, the build must pull it from canon.json.

> **Hard rule on assets:** no official art, screenshots, character portraits, logos, music or script text. Everything is original and abstract: lines, nodes, glyphs, Nixie digits, silhouettes and icons. Characters are represented by **coloured monogram glyphs** (e.g. a ring with "OK"), never likenesses. Quoted dialogue is never shown; captions are paraphrases taken from canon.json.

---

## 1. Information architecture and routes

Hash-based routing (`#/…`) so the static build works from any folder and from `file://` previews. A route never contains spoiler text: ids only, and ids are opaque kebab-case.

| Route | Screen | Min tier to show content |
|---|---|---|
| `#/` | **Home**: one-paragraph premise, "Start here" (guided mode), map teaser, spoiler-tier selector | premise |
| `#/map` | **World-line map** (the core screen) | premise (content grows with tier) |
| `#/map?wl=<worldLineId>&ev=<eventId>` | Map focused on a node/edge (deep link) | the item's tier, else a redirect to `#/map` with a locked toast |
| `#/follow` · `#/follow/<stepIndex>` | **Follow the story** guided playback | per step |
| `#/mechanics` | Mechanics index (six cards) | premise |
| `#/mechanics/<mechanicId>` | Animated explainer: `dmail`, `time_leap`, `reading_steiner`, `attractor_field`, `divergence_meter`, `time_machine` | mechanic's `spoilerTier`, steps individually gated |
| `#/compare?lines=a,b,c` | **Compare** 2–3 world lines | max tier of the chosen lines |
| `#/glossary` · `#/glossary/<glossaryId>` | Glossary with search | per entry |
| `#/characters` · `#/characters/<characterId>` | Character cards (glyph, role, Reading Steiner, fates by field) | `firstSpoilerTier`; fates/aliases/relationships per own tier |
| `#/sg0` | **Steins;Gate 0** section: the fork, its lines, endings, loop-back | sg0 |
| `#/endings` | Original VN endings board | sg_ending |
| `#/works` | Works and release table (VN, anime, film, S;G 0, Elite, Re:Boot + Gamma route) | premise for titles; placement text per tier |
| `#/disputes` | "What fans and sources disagree on" | per dispute tier |
| `#/about` | Sources, confidence system, no-official-assets statement | none |

Global chrome on every screen: top bar (logo wordmark in original type, route tabs), **spoiler tier control**, **media filter chips**, **confidence legend** toggle, and a Nixie **divergence readout** that reflects the currently focused world line (or "------" when none is focused).

---

## 2. Visual language

### 2.1 Palette (design tokens)

Dark sci-fi lab at night: CRT phosphor, Nixie-tube glow, blueprint lines. All tokens live in `src/styles/tokens.css` as CSS custom properties. Contrast targets: text ≥ 4.5:1 on its background, UI strokes ≥ 3:1.

| Token | Value | Use |
|---|---|---|
| `--bg-0` | `#0b0d10` | page background |
| `--bg-1` | `#12161b` | panels |
| `--bg-2` | `#1a2027` | raised cards, drawer |
| `--grid` | `#1f2a33` | blueprint grid lines (decorative) |
| `--ink-0` | `#e8edf2` | primary text |
| `--ink-1` | `#a9b4bf` | secondary text |
| `--ink-2` | `#6c7884` | tertiary / disabled |
| `--nixie` | `#ff8a1f` | **accent**: Nixie digits, focus ring, primary buttons |
| `--nixie-glow` | `rgba(255,138,31,.35)` | glow / halo (decorative only) |
| `--band-alpha` | `#1b2a3a` | Alpha band fill (0.x) |
| `--band-beta` | `#2a1f33` | Beta band fill (1.x) |
| `--band-sg` | `#2a2a14` + gold stroke `#e6c84a` | Steins Gate lane |
| `--band-sg0` | `#14262a` | S;G 0 lane |
| `--boundary` | `#ff8a1f` @ 60% | the 1% boundary line |
| `--conf-confirmed` | `#3ecf8e` | CONFIRMED badge |
| `--conf-interp` | `#7aa7ff` | INTERPRETATION badge |
| `--conf-unclear` | `#ffb020` | UNCLEAR badge |
| `--danger` | `#ff5a6e` | death markers in compare view (always paired with an icon) |

**Edge colours by mechanism.** These are colour-blind safe (Okabe–Ito-derived), and **every edge also carries a stroke pattern and an end glyph**, so colour is never the only cue:

| Mechanism | Colour | Pattern | End glyph |
|---|---|---|---|
| `dmail` | `#E69F00` (orange) | solid | envelope ✉ |
| `dmail_cancellation` | `#56B4E9` (sky) | long dash `8 4` | envelope with slash |
| `time_machine` | `#009E73` (green) | double line | capsule ◉ |
| `time_leap_actions` | `#CC79A7` (pink) | dotted `2 4` | brain/arc glyph |
| `database_erasure` | `#D55E00` (vermillion) | dash-dot `10 3 2 3` | eraser ⌫ |
| `other` | `#BBBBBB` (grey) | short dash `3 3` | ring ○ |
| collapsed (UI-only, media filter) | inherits | dashed + "⋯" midpoint | none |
| reconnection (S;G 0 video loop) | `#F0E442` (yellow) | animated dash, curved arc | play ▶ |

### 2.2 Typography

- **Divergence numbers and all digits:** a monospace with tabular figures, e.g. **JetBrains Mono** or **IBM Plex Mono** (self-hosted woff2, OFL). The Nixie readout renders each digit as a separate tube glyph (see §5.5).
- **UI and body:** **Inter** or **IBM Plex Sans** (OFL), 16px base, 1.5 line height, max 70ch for prose.
- **Display / headings:** **Space Grotesk** or **Rajdhani** (OFL) for a technical lab feel. Use it sparingly.
- No fonts are fetched at runtime from third parties; ship them in `public/fonts/`.

### 2.3 Iconography and glyphs

A hand-made SVG set in `src/assets/icons/`: envelope, capsule, brain-arc, eraser, phone, microwave box, CRT box, meter, ring-singularity, skull-free "fallen" marker (a hollow ✕ in a circle, used for "dead" in compare view; never gore), and character monogram rings. Each character has a glyph colour plus a 2-letter monogram, assigned in a UI constants file. Note that these are presentation choices, not story facts.

---

## 3. The world-line map (core screen)

### 3.1 Concept

A multi-lane **branching timeline**. The x-axis is time; the y-axis is divergence. World lines are horizontal **tracks** at their divergence height; events are **nodes** on those tracks; transitions are **edges** that jump between tracks.

```
 divergence %
 1.40 ┤                                                    · 1.382733 (S;G0, floats)
      │  ╔═══════════════════ BETA BAND (1.x) ═══════════════════════════════════╗
 1.13 ┤  ║ ●━━●━━●━━●┓1.130426                    1.130205 ●━━●━━◉━━●━━◉━━┓     ║
      │  ║           ┃✉                                   ⌫┃     1.130209 ┃     ║
 1.12 ┤  ║           ┃                     S;G 0 lane ─────┼──────●1.129848 ┃···  ║
      │  ╚═══════════┃═════════════════════════════════════┃════════════════┃═════╝
 1.05 ┤   ═══════════┃══════ STEINS GATE LANE (gold) ══════┃═══════ ★1.048596 ┛═══
 1.00 ┼ ─ ─ ─ ─ ─ ─ ┃─ ─ ─ 1% BOUNDARY ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┃─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─
      │  ╔═══════════┃═══════ ALPHA BAND (0.x) ════════════┃═════════════════════╗
 0.57 ┤  ║           ┗●━━━━●┓0.571024          0.571046 ●━━┛                     ║
 0.52 ┤  ║                  ┗━●┓0.523299      0.523307●━━┛←✉̸                     ║
 0.45 ┤  ║                     ┗●┓0.456903   0.456914●━┛←✉̸                      ║
 0.40 ┤  ║                       ┗●┓0.409420 0.409431●┛←✉̸                       ║
 0.33 ┤  ║                         ┗●━━●━━●━━●┛0.337187                          ║
      │  ╚═══════════════════════════════════════════════════════════════════════╝
      └──┬──────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┬────┬── ··· ──┬──
        7/28   8/1    8/4    8/7   8/10   8/13   8/15   8/17   8/21  9/–   2010-11→2025
                        CALENDAR ORDER  [⇄ switch to OKABE'S ORDER]
```
*(ASCII is schematic: values and labels are rendered from canon.json at runtime.)*

### 3.2 Axes

- **y = divergence.** Piecewise-linear scale with three **bands**:
  - the Alpha band, 0.0–1.0, with the core lines 0.33–0.58 zoomed to about 55% of its height;
  - the Beta band, 1.0–2.0, with 1.12–1.14 zoomed and 1.38 compressed into an "outlier" strip;
  - spin-off values (negative, ≥2.0, Chi) sit in a collapsible **"Spin-offs" gutter**, shown only when the `extras` tier and the `other` media chip are on.
  - The **1% boundary** is a dashed Nixie-orange rule labelled "1% boundary" (label hidden below `sg_part1`, where it reads just "boundary").
  - **Band labels** ("Alpha / Beta") and band tints appear only at tier ≥ `sg_part2`. Below that the bands are neutral grey and world lines show their `premiseLabel`, so attractor-field names never leak.
- **Steins Gate lane:** the world line with `attractorField: "steins_gate"` is drawn in its **own highlighted lane** between the bands (gold stroke, subtle shimmer), not inside Beta, even though its number is 1.x. An info dot links to dispute `dsp-sg-line-status`.
- **x = time, with a dual-axis toggle:**
  - **Calendar order** (default). Uses each event's `sortDate` plus `time`, on a non-linear scale: July 28 gets a widened hour-scale "day lens" (11:00–13:00 plus evening), Jul 29–Aug 21 run at day scale, and a break glyph `≈` leads into Sept and then an S;G 0 extension segment (2010-11 → 2011 → 2025 → 2036) on compressed years. Partial dates (`2010-08`) render as a **range bracket** under the node rather than a point. Events whose `sortDateIsEditorial` is true show **no date label** at all.
  - **Okabe's order.** Uses `seq` (1…37 for the main story, 150+ for VN branch endings drawn as offshoots, 200+ in the S;G 0 lane). Spacing is uniform.
  - **Switching animates** each node horizontally to its new x over 600 ms (Framer Motion `layout`), so viewers literally see the July 28 rescue attempts fly from the start of the story to near its end. A caption explains the difference: "Calendar order = when it happened. Okabe's order = when he lived it."

### 3.3 Nodes, tracks and edges

- **Track:** a horizontal line for each world line, from its first to its last associated event. A label on the left shows the Nixie-styled divergence (or `premiseLabel` at premise tier). A track's opacity reflects `divergenceConfidence` (UNCLEAR → dashed track and an amber dot).
- **Node:** a circle per event. Its fill colour is the lane colour. Its ring shows confidence: solid for CONFIRMED, double ring for INTERPRETATION, dashed amber ring for UNCLEAR. Nodes with `conflicts[]` get a tiny "⇆" badge. Fixed convergence events (e.g. Mayuri's deaths on Alpha lines, from `aliveDead` and event data) get a **knot glyph**, and only at tier ≥ `sg_part2`.
- **Edge:** a transition drawn as a vertical-ish Bézier from the cause node to the next track, coloured and patterned by `mechanism` (§2.1). If `crossesAttractorField` is true, the edge thickens as it crosses the 1% rule and emits a brief pulse.
- **Collapsed edges:** when media chips hide the intermediate world lines (e.g. anime-only hides 1.130209 and 1.130212), the UI joins consecutive transitions into one dashed "collapsed" edge with a `⋯` midpoint and a tooltip "2 steps hidden by media filter". This is generated in a selector, **never stored**.
- **Floating nodes:** S;G 0 world lines with no transitions sit in the S;G 0 lane, grouped by chapter/ending and joined by a thin dotted UI connector labelled "route links not mapped" (see open-questions, gaps).
- **Reconnection arc:** in the S;G 0 section and on the full map at tier `sg0`, a yellow animated arc runs from `sg0Branch.reconnection.fromEventId` back to `toEventId` (the July 28 email), with a second short arc to `unlocksEventId`.

### 3.4 Interaction

- **Hover or focus a node** to get a hover-card with title, date (or "date unknown"), confidence badge, media chips, and a one-line summary (tier-gated).
- **Click a node** to open the **detail panel** (right side on desktop, bottom sheet on mobile). It shows the summary, what changed, before/after divergence as a rolling Nixie pair, characters as monogram glyphs, conflicts, unlocked reveals, and the **Source drawer** button.
- **Click an edge** to see the transition: its mechanism with a "Play mechanic" button (deep-links to the right mechanic animation), `whoRemembers`, and whether it crosses a field.
- **Zoom/pan:** wheel or pinch zoom on x; the y-bands stay fixed. A "Fit story" button resets the view.
- **Mini-map** strip at the bottom shows the full extent and the current viewport.
- The **divergence readout** in the global chrome rolls to the focused world line's value.

### 3.5 Keyboard navigation (map)

The SVG has `role="application"` with an `aria-roledescription="world-line map"` and a visually hidden instructions paragraph.

| Key | Action |
|---|---|
| `Tab` | Enter the map (focus goes to the first visible event in the current x-order) |
| `←` / `→` | Previous / next event along the current x-axis order (calendar or seq) |
| `↑` / `↓` | Jump to the nearest event on the world line above / below at a similar x |
| `Enter` / `Space` | Open the detail panel |
| `E` | Cycle through the edges leaving the focused node |
| `M` | Play the mechanic for the focused edge |
| `O` | Toggle calendar ⇄ Okabe's order |
| `S` | Open the source drawer |
| `+` / `-` / `0` | Zoom in / out / fit |
| `Esc` | Close the panel and return focus to the node |

Every node gets an `aria-label` built from tier-safe fields only, e.g. "Event 5 of 37: The first D-Mail. July 28, 2010, 12:54. World line changes. Confidence: confirmed." A parallel, visually hidden **"Map as list"** `<ol>` (also togglable to visible via a "List view" button) carries the same content for screen-reader users and is the **text alternative** for the whole map.

---

## 4. Spoiler system

- **Tiers** come from `meta.spoilerTiers`: premise → sg_part1 → sg_part2 → sg_ending → sg0 → extras. **The default is `premise`.** The choice persists in `localStorage` (wrapped in try/catch; it falls back to premise).
- **Control:** a segmented "How far have you watched/read?" selector in the top bar, with a short description from `covers` for each tier. Raising the tier above `sg_part1` needs one confirm click ("This will reveal …", using tier-safe wording).
- **The gate is effective tier = max(object tier, every ancestor tier).** Applies to: text, aliases, relationships, fates, `reveals[]`, `details[]`, aliveDead entries, edges, nodes, glossary related links, page `<title>`, `aria-label`s, tooltip text, alt text, and the URL (ids only; never slugs made from titles).
- **Locked placeholders:** gated nodes render as a neutral **"🔒 later in the story"** pill with no title, no date and no character glyphs. Locked glossary entries show only the term if the term itself is tier-safe; otherwise they are hidden entirely. Search never matches locked text.
- **Deep links** to a locked item show a toast ("This part is locked at your current spoiler level") with a button to raise the tier. The URL is not echoed back.
- **Peek:** individual reveals can be unblurred one at a time ("Reveal this fact") without changing the global tier; this is session-only.

---

## 5. Mechanic explainers (click-through animations)

Each mechanic page uses the same **player**: an SVG stage (16:9 desktop, 4:5 mobile) with a caption bar below it. Each "frame" is one `steps[]` entry from canon.json:
- the `caption` is shown verbatim;
- `visualHint` guides the animation build and is never displayed;
- a confidence badge and source button sit on each caption.

Controls: ⏮ ⏯ ⏭, step dots, and a "Text only" toggle. A step whose tier is locked shows a 🔒 frame and is skipped by autoplay. Under the player:
- "What travels / what doesn't";
- limits;
- common misconceptions as flip cards (claim → correction, with badge).

Below are the storyboards (frame numbers = `steps[].order`).

### 5.1 D-Mail (`dmail`)

```
 F1                         F2                          F3
 ┌──────────────────┐      ┌──────────────────┐       ┌──────────────────┐
 │ [phone]──[μwave] │      │  LAB    [μwave]  │       │     ◯ ring       │
 │  ☎ ring  # 0 1 2 │      │ ─────────┊────── │       │  🍌→ ◯ →▓ gel    │
 │     timer: 00:00 │      │  SHOP  [CRT]⚡   │       │  ✉ → ◯ → ✉ (ok)  │
 └──────────────────┘      └──────────────────┘       └──────────────────┘
 F4                         F5                          F6–F7
 ┌──────────────────┐      ┌──────────────────┐       ┌──────────────────┐
 │ "msg............"│      │ ◀──✉✉✉───┤ now   │       │ 0.571024 → 0.57… │
 │ [12B][12B][12B]~~│      │ |hour|hour|hour| │       │ ☺☺☺ tapes rewrite│
 │   overflow fades │      │   lands on tick  │       │ OK tape copied ▶ │
 └──────────────────┘      └──────────────────┘       └──────────────────┘
```
Motion: in F3 the ring singularity spins (`rotate`, 4 s loop) and the banana "squashes" into a gel blob (scale-Y then wobble). In F5 the packets travel along a calendar strip. In F6 the strip **reweaves**: a horizontal wipe changes tile colours, and the Nixie rolls. In F7 three generic figures' memory tapes rewind and recolour while Okabe's glyph keeps its tape and it slides across.

### 5.2 Time leap (`time_leap`)

```
 F1 head ➜ data cube   F2 cube ➜ collider ring ➜ ·packet   F3 packet ◀ ≤2 day tiles
 F4 past-self lifts ☎ to ear, threads flow in        F5 Nixie stays frozen (INTERPRETATION badge)
```
Visual distinction from D-Mail: the packet is **pink with a brain-arc glyph**, not an envelope; the calendar shows at most two day tiles lit; the body silhouette stays in place, with a "body stays here" label.

### 5.3 Reading Steiner (`reading_steiner`)

```
 F1 Nixie rolls   F2 scene desaturates ▸ twists ▸ re-forms (small differences highlighted)
 F3 Okabe glyph's memory tape slides from old scene into new   F4 monochrome swirl around Okabe only
 F5 three crossed-out icons: tiny change · time traveller · time leap   F6 (sg_part2) faint ghost frames on others
```
Motion: a 1.2 s "vertigo" (scale 1 → 1.03 → 1, hue-rotate to greyscale, 6° skew), then recovery.

### 5.4 Attractor fields and convergence (`attractor_field`)

```
 F1 many threads braid into two ropes (INTERPRETATION badge: metaphor)
 F2 each rope ties into a knot; knot labels from canon (tier-gated)
 F3 thread hops to a neighbour; still hits knot; date label slides "+1 day"
 F4 (sg_ending) thread leaps across the 1% gap
 F5 (sg_ending) gold thread runs between the ropes, avoiding both knots
```

### 5.5 Divergence Meter (`divergence_meter`): animated Nixie display

Eight tubes: `[d][.][d][d][d][d][d][d]`. Each tube is an SVG with stacked digit paths 0–9 at 8% opacity (the "unlit cathodes") and the active digit glowing. Glow is a filter of `--nixie` plus two blur layers. The roll animation runs each tube through random digits for 80–600 ms, staggered left to right, then settles. A leading blank tube is used for negative values (per the canon limit). Frames:
- F1: idle glow;
- F2: roll to a new value;
- F3: split screen, Okabe's view (old/new) vs another observer (new only);
- F4: leading digit highlight with band label (tier-gated);
- F5: the seventh digit flickers but never shows, and a blank first tube.

**This same component is the global divergence readout.**

### 5.6 Suzuha's time machine (`time_machine`)

```
 F1 capsule outline with ring singularity inside   F2 battery gauge drains one notch per jump
 F3 traveller silhouette stays solid while world reweaves around it
 F4 (sg_ending) Nixie ticks in the last decimal places per trip   F5 arrow ◀ only; ▶ greyed (one-way)
```
The capsule is an abstract pod. It must not reproduce the in-show "satellite" design.

**Every animation has a text alternative:** the step list rendered as an `<ol>` (captions plus badges) directly under the stage. It is always present in the DOM and visible when "Text only" is on or when `prefers-reduced-motion` applies.

---

## 6. "Follow the story": guided mode

A cinematic walkthrough of the map.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  FOLLOW THE STORY                         tier: [premise ▾]  media: VN Anime │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│        (map viewport, camera framed on current node, others dimmed 30%)      │
│                         ●━━━━━━━┓                                            │
│                                 ┃✉   ← edge animates while narrating         │
│                                 ┗━━●                                         │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ 05/37  The first (accidental) D-Mail          [CONFIRMED]  [sources]         │
│ Okabe texts Daru that Kurisu has been stabbed. The text arrives days in the  │
│ past…                                  ⟨ 1.130426 ⟩ → ⟨ 0.571024 ⟩ (Nixie)   │
│  ⏮  ⏪  ⏯  ⏩  ⏭     speed 1× ▾     [▶ play D-Mail mechanic]   [order: Okabe ▾]│
└──────────────────────────────────────────────────────────────────────────────┘
```

- **Sequence:** all events visible at the current tier and media filter, ordered by `seq` by default ("Okabe's order") or by calendar. Narration text = event `title` + `summary` + `whatChanged`, plus any unlocked `reveals` appended as "Later you learn: …".
- **Camera:** each step tweens the viewBox to frame the current node and the next edge (700 ms ease-in-out). On a transition step the edge draws itself (`pathLength` 0 → 1), the Nixie readout rolls, and for `crossesAttractorField` edges the 1% rule pulses.
- **Controls:** play/pause (autoplay dwell = 4 s + 60 ms per word of narration), step back/forward, jump to start/end, speed 0.5×/1×/1.5×. Keyboard: `Space` play/pause, `←/→` step, `Home/End`.
- **Interludes:** at the first D-Mail, the first time leap, the Titor reveal and the field crossing, the player offers "Watch how this works" and opens the matching mechanic player inline, returning afterwards.
- **Tier walls:** when the next step is above the viewer's tier, playback stops at a wall card ("The next part reveals [tier label]. Raise your spoiler level to continue.").
- **Progress** is saved per tier in `localStorage` (try/catch).

---

## 7. Compare mode

Choose 2–3 world lines from a picker. The picker lists only lines visible at the current tier and media filter, grouped by band, searchable by number.

```
┌──────────────────────┬──────────────────────┬──────────────────────┐
│  ⟨0.571024⟩  [CONF]  │  ⟨0.337187⟩  [CONF]  │  ⟨1.048596⟩  [CONF]  │
│  After the 1st D-Mail│  'Follow Suzuha'     │  Steins Gate         │
├──────────────────────┼──────────────────────┼──────────────────────┤
│ WHAT'S DIFFERENT     │ WHAT'S DIFFERENT     │ WHAT'S DIFFERENT     │
│ …(whatIsDifferent)   │ …                    │ …                    │
├──────────────────────┼──────────────────────┼──────────────────────┤
│ ALIVE  ◉KM           │ ALIVE  ◉KM           │ ALIVE  ◉MS ◉KM       │
│ FALLEN ⊗MS (+note)   │ FALLEN ⊗MS (+note)   │ FALLEN —             │
├──────────────────────┼──────────────────────┼──────────────────────┤
│ KEY EVENTS (3)  ▸    │ KEY EVENTS (7)  ▸    │ KEY EVENTS (2)  ▸    │
│ SEEN IN  VN · Anime  │ SEEN IN  VN · Anime  │ VN · Anime · Film…   │
│ ALT VALUES —         │ —                    │ superposed (extras)  │
└──────────────────────┴──────────────────────┴──────────────────────┘
   ▸ "Path between these lines": 0.571024 ─✉→ … ─✉→ 0.337187 ─✉̸→ … ─⌫→ … ─◉→ 1.048596
```

- Alive/fallen rows come **only** from `aliveDead`, each entry with its own badge and tier gate. Characters not listed show as "—", never inferred.
- The "Path between" strip runs a shortest path over transitions (directed), showing edge glyphs. If there is no path it shows "No mapped path (see open questions)".
- Differences are highlighted with a subtle Nixie underline on rows that differ.
- Mobile: columns become horizontally swipeable cards with a sticky header.

---

## 8. Glossary

- **Search:** client-side fuzzy search over `term`, `aliases`, `plainLanguage` (tier-safe fields only), built with a tiny index (e.g. Fuse.js or a hand-written trigram index) rebuilt when the tier changes.
- Category filter chips (device, theory, organization, operation, phenomenon, place, other).
- **Entry card:** term; plain-language explanation (always first, newcomer-friendly); "More detail" expander (`details`); related terms; unlocked reveals; badge; sources.
- **Hover-cards everywhere:** any `<Term id="gl-…">` in UI copy shows a hover/focus card with `plainLanguage` and a link to the glossary entry. They open on focus as well as hover, close on `Esc`, and are announced via `aria-describedby`.
- Real-world entries (`realWorld: true`, e.g. the real-world John Titor) get a "Real world" tag so they are never confused with in-story facts.

---

## 9. Steins;Gate 0 section (`#/sg0`)

Locked entirely below tier `sg0` (the entry tile shows only "Steins;Gate 0: the sequel's branch 🔒").

```
┌────────────────────────────────────────────────────────────────────────────┐
│  THE FORK                                                                  │
│  original lane ━━●(failed rescue, branchEventId)━━◉━━●━━★ Steins Gate      │
│                    ╲ (tr-sg0-branch, INTERPRETATION, grey dashed)          │
│  S;G 0 lane         ●━━●━━●···(floating chapter clusters)···━━● 2025 ▶     │
│                                                            ╰──yellow arc──╯ │
│                                       back to July 28 email (reconnection) │
├────────────────────────────────────────────────────────────────────────────┤
│  ENDINGS (VN)   [Gehenna's Stigma] [Twin Automata] [Mother Goose]          │
│                 [Promised Rinascimento] [Vega and Altair] [★ Milky-way]    │
│  ANIME FINALE   [★ ep 23]                                                  │
│  Each tile: value Nixie (or "no value listed"), outcome, how to reach, badge│
├────────────────────────────────────────────────────────────────────────────┤
│  ANIME vs VN (from sg0Branch.animeVsVn)   ·   classification (UNCLEAR)     │
└────────────────────────────────────────────────────────────────────────────┘
```

- **Branch choice diagram** for the VN endings: a small decision tree built from each ending's `howToReach` text. The nodes are the phone choices and the leaves are endings. The tree shape is **drawn from text, not invented**: each leaf shows its `howToReach` verbatim, and the tree layout is a UI grouping (labelled "simplified").
- The **loop-back** is the hero animation: the 2025 video D-Mail node emits a yellow arc that travels back across the whole map to the July 28 12:26 email on the original lane. A second arc then lights the Aug 21 "video decodes" node, which leads to the successful second attempt and the gold Steins Gate lane. Caption from `sg0Branch.reconnection.description`.

---

## 10. Confidence badges and source drawer

- **Badges:** `CONFIRMED` (green, ✔), `INTERPRETATION` (blue, ◐ "a reading"), `UNCLEAR` (amber, ?). Each is a pill with icon plus text (never colour alone), `role="note"`, and a tooltip with the definition from `meta.confidenceLevels`.
  - If `singleSource: true` and `singleSourceKind: "fan_wiki"`, the CONFIRMED pill gets a suffix: "✔ CONFIRMED · per fan wiki".
  - Date or value sub-confidence (`dateConfidence`, `divergenceConfidence`) is a small dot next to the date or number.
- **Every on-screen fact has a source affordance:** a ⓘ button (or the badge itself) that opens the **Source drawer** (right drawer on desktop, bottom sheet on mobile). The drawer shows:
  - the canon.json id (monospace, copyable);
  - the confidence definition;
  - each source as title, tier label, status, notes caveat, and an external link (`rel="noopener noreferrer"`, opens in a new tab);
  - `conflicts[]` / disputes listing competing claims;
  - "Report a problem" text pointing to `docs/open-questions.md`.
- **Failed or wrong-content sources** show their status pill ("returned wrong page") so viewers can see why a fact is weak.

---

## 11. Media filter chips

Chips: **VN · Anime · S;G 0 VN · S;G 0 Anime · Film · Other**, with keys from `meta.mediaKeys`.
- Default: VN + Anime on. The S;G 0 chips are auto-enabled when the tier reaches `sg0`; Other and Film are off.
- An item is visible if its `media` ∩ the active chips is non-empty.
- When the filter hides intermediate world lines, collapsed edges appear (§3.3).
- Chip state is in the URL query (`?m=vn,anime`) and `localStorage`.
- Chips are toggle buttons (`aria-pressed`).

---

## 12. Motion principles

1. **Motion explains causality.** Only animate what changed: edges draw, Nixie digits roll, the timeline reweaves. Nothing decorative loops while the user reads, apart from a slow (≥ 6 s) Nixie flicker that is disabled under reduced motion.
2. **Durations:** micro 120–180 ms; panels 240 ms; camera 600–800 ms; Nixie roll ≤ 600 ms. Easing: `[0.2, 0, 0, 1]` (standard) and `[0.3, 0, 0, 1]` (emphasis).
3. **One focal motion at a time.** Stagger children by 40 ms at most.
4. **Interruptible.** Every animation can be skipped by the next user input.
5. **`prefers-reduced-motion: reduce`** (plus an in-app "Reduce motion" toggle that overrides it):
   - camera moves become instant cuts with a 150 ms crossfade;
   - edges appear fully drawn;
   - the Nixie readout swaps digits without rolling;
   - the vertigo effect becomes a static monochrome frame with the caption;
   - mechanic players default to step-through (no autoplay) with text visible;
   - no parallax, shimmer or pulse.
6. **No flashing** more than 3 times per second; glow effects stay below the luminance-flash thresholds.

---

## 13. Accessibility checklist

- WCAG 2.2 AA target. Full keyboard operability (map shortcuts in §3.5, visible 2px Nixie focus ring with a 2px offset).
- Landmarks: `header`, `nav`, `main`, `aside` (detail panel, drawer), plus a skip link "Skip to map list".
- **Text alternatives for every animation and diagram:** the map's "Map as list"; each mechanic's step `<ol>`; the S;G 0 tree as nested lists; compare mode is a real `<table>` with `scope` headers.
- Live region (`aria-live="polite"`) announces guided-mode narration and divergence changes ("World line now 0.571024").
- Colour-blind-safe edge palette with patterns and glyphs; badges use icon plus text.
- Hit targets ≥ 44×44 px on touch. Text resizable to 200% without loss of content.
- Dialogs and drawers trap focus and restore it on close; `Esc` closes them.
- The language attribute is `en`. Japanese-order names are marked `lang="ja-Latn"`, and kanji as `lang="ja"`.

---

## 14. Responsive layout

| Width | Layout |
|---|---|
| ≥ 1280 px | Map full width; detail panel docked right (380 px); mechanic player 16:9 |
| 768–1279 | Map full width; detail panel as an overlay drawer; chips collapse into a "Filters" popover |
| < 768 (mobile) | **Vertical timeline:** time runs top → bottom, divergence becomes a horizontal mini-axis per row (a small band strip with a dot), and transitions show as connector chips between rows ("✉ D-Mail → 0.571015"). Bands shown as left-edge colour rails. Detail opens as a bottom sheet. Guided mode becomes full-screen cards with a sticky control bar. Compare uses swipeable columns. |

```
 MOBILE (vertical)          ┌─────────────────────────┐
                            │ ⟨0.571024⟩  ▮▮▯ Alpha    │  ← band rail (tier-gated label)
                            │ Jul 28 12:54            │
                            │ The first D-Mail  [✔]   │
                            │ ✉ D-Mail ↓  crosses 1%  │
                            ├─────────────────────────┤
                            │ ⟨0.571024⟩              │
                            │ Jul 28 evening  …       │
                            └─────────────────────────┘
```

---

## 15. Recommended stack

- **Vite + React 18 + TypeScript (strict)**: a fast static build with no server. Output goes to `dist/`, deployable from any static host or opened via `npm run preview`.
- **SVG + Framer Motion** for rendering and animation.
  - *Why Framer Motion over GSAP:* the map, players and panels are React state machines. Framer Motion's declarative `animate`/`layout`/`AnimatePresence` ties animation to React state, which suits the calendar ⇄ Okabe-order reflow (`layout` on nodes), panel enter/exit, and `useReducedMotion` built in.
  - GSAP's timeline is stronger for long scripted sequences, but it is imperative, needs refs and manual cleanup in React, and its licence has changed over time.
  - The mechanic players are short step-based sequences, which fit Framer variants well. If one storyboard proves too complex, a single isolated GSAP timeline inside that one component is acceptable.
- **Zod** schema mirroring canon.json, run at build time (validator script) and at app start (dev only), plus `z.infer` types for selectors.
- **Vitest** + Testing Library for selectors and components; **Playwright** for screenshots at 1440×900 and 390×844, plus keyboard flows; **ESLint** (typescript-eslint, react-hooks, jsx-a11y).
- **No backend, no analytics, no external runtime requests.** Fonts and icons are self-hosted.

---

## 16. Key screens: wireframes

### Home
```
┌──────────────────────────────────────────────────────────────────────────┐
│ ⟨ - . - - - - - - ⟩  WORLD LINE    Map  Follow  Mechanics  Glossary  …   │
│                                    Spoilers: [Premise ▾]  Media: ▢▢▢▢    │
├──────────────────────────────────────────────────────────────────────────┤
│   One text message to the past can rewrite history.                      │
│   (premise paragraph from canon.json premise-tier glossary/events)       │
│                                                                          │
│   [ ▶ Follow the story ]   [ Explore the map ]   [ How time travel works ]│
│                                                                          │
│   ┌ teaser: premise-tier map, 2 tracks + 1 edge, animated once ┐         │
│   └─────────────────────────────────────────────────────────────┘         │
│   Legend: ✔ confirmed  ◐ interpretation  ? unclear · Sources on every fact│
└──────────────────────────────────────────────────────────────────────────┘
```

### Map with detail panel (desktop)
```
┌───────────────────────────────────────────────────────┬──────────────────┐
│ [Calendar ⇄ Okabe] [Fit] [List view]  chips…          │ EVENT  ev-…      │
│                                                       │ Title      [✔]   │
│   (map, §3)                                           │ Jul 28 · 12:54   │
│                                                       │ ⟨1.130426⟩→⟨0.571024⟩
│                                                       │ Summary…         │
│                                                       │ What changed…    │
│                                                       │ ◉OK ◉DA          │
│                                                       │ ⇆ Conflicts (4)  │
│                                                       │ [▶ mechanic][ⓘ]  │
│ ▁▁▁▁▁▁▁▁▁▁▁ mini-map ▁▁▁▁▁▁▁▁▁▁▁▁▁                     │                  │
└───────────────────────────────────────────────────────┴──────────────────┘
```

### Mechanic player
```
┌──────────────────────────────────────────────────────────────────────────┐
│  D-MAIL: TEXTING THE PAST                                     [Text only] │
│ ┌──────────────────────────────────────────────────────────────────────┐ │
│ │                        (SVG stage, §5.1)                              │ │
│ └──────────────────────────────────────────────────────────────────────┘ │
│  3/7  The microwave makes tiny spinning black holes…   [✔ · per fan wiki]│
│  ⏮ ⏯ ⏭   ● ● ◉ ○ ○ ○ ○                                           [ⓘ]   │
│  WHAT TRAVELS | WHAT DOESN'T | LIMITS | MISCONCEPTIONS (flip cards)      │
└──────────────────────────────────────────────────────────────────────────┘
```

### Source drawer
```
                                          ┌───────────────────────────────┐
                                          │ SOURCES · ev-0728-first-dmail │
                                          │ ✔ CONFIRMED: stated as canon… │
                                          │ ─ Fandom: D-Mail (Tier 2) ↗   │
                                          │ ─ wiki.gg: VN/Plot (Tier 2) ↗ │
                                          │ CONFLICTS                     │
                                          │  • Arrived July 23 [src]      │
                                          │  • Arrived July 24 [src] …    │
                                          │ [copy id]                     │
                                          └───────────────────────────────┘
```

---

## 17. Content and rights

- All story text in the UI is a paraphrase stored in canon.json; there are no quotes from the script or episodes.
- No official artwork, screenshots, logos, character designs, music or voice clips. Character monograms, the abstract pod and the Nixie tubes are original drawings.
- An "About" page states: an unofficial fan explainer, not affiliated with MAGES., Spike Chunsoft, Nitroplus, White Fox or Kadokawa; names belong to their owners; facts are sourced and linked.
