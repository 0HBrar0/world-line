# The Rope: framework for the world line map

Status: built for desktop in `src/features/map/` (see "What was built" at the end). On phones the same map is turned to run down the page (`RopeLadder.tsx`). Reference sheets: [the parts](rope-map/sheet-a-parts.png), [a rope untwisted](rope-map/sheet-b-untwisted.png), [spoiler levels](rope-map/sheet-c-spoiler-levels.png) (all three on one page in `rope-map/sheets.html`). The sheets show the whole story and are for the owner, not the site.

## The idea in one sentence

History is a rope: many threads (world lines) twisted together and tied at a knot (the outcome none of them can avoid), and the story is one red strand that hops from thread to thread until it gets out of the rope.

## The nine parts

Each part has one name, one look and one source in `data/canon.json`. Nothing on the map exists without a row here.

| # | Part | Means | Looks like | Comes from |
|---|------|-------|------------|------------|
| 1 | Rope | An attractor field: a family of world lines bound to one outcome | A twisted bundle of threads | `worldLines[].attractorField` (`alpha`, `beta`); name and text from `gl-alpha-field`, `gl-beta-field` |
| 2 | Thread | One world line | One thin ink line, labelled with its divergence number | `worldLines[]` (`divergence`, `label`, `premiseLabel`) |
| 3 | Knot | The outcome every thread in the rope arrives at | The threads pinch to a single dot | The field's glossary entry and `aliveDead` notes (see Gaps) |
| 4 | The gap | The 1% divergence barrier | Empty space between ropes with a dashed red line at 1.000000 | `gl-divergence-barrier` |
| 5 | Hop | A jump to another thread in the same rope | A short red step with a numbered badge | `transitions[]` where `crossesAttractorField` is false |
| 6 | Crossing | A jump over the gap to the other rope | A long dashed red drop through the gap | `transitions[]` where `crossesAttractorField` is true |
| 7 | Bead | One event that happens on a thread | A small ring on the thread | `events[]` without a `transitionId` |
| 8 | Red strand | The path actually lived, in the order it was lived | The only red line on the map | Jump events in `seq` order |
| 9 | Free thread | A world line in neither rope, so it has no knot | A single straight thread lying in the gap | `attractorField: steins_gate` |

Badge styles tell the kind of jump apart: filled red for a D-Mail, hollow red for an undo, a square for a time machine trip (`transitions[].mechanism`). Badge numbers are the same numbers the Chronicle uses, so "hop 04" means the same thing on both pages.

## Rules that keep it readable

1. **Up and down is the number.** Rope β (1.x) is above the gap, rope α (0.x) below. Inside a rope, threads sit in divergence order. Spacing is even, not to scale, because the real values are too close together to see.
2. **Left to right is the order it was lived** (`seq`), not the calendar. The red strand therefore never doubles back, even when the story does.
3. **Only one thing is red.** Red always means "the path lived" or "the barrier". Everything else is ink.
4. **Twisted to look at, flat to read.** The twist is the overview. Opening a rope lays its threads flat and parallel (sheet B); that is where labels, hops and beads are read. Twisted threads never carry labels.
5. **A knot belongs to a rope, not to a thread.** It is drawn once per rope and states the outcome in the glossary's own words.
6. **Every part has an address** that can be said out loud and linked: rope, then thread, then hop or bead. Example: "Rope α, thread 0.337187, hop 06". Links keep the current `#/map?wl=<id>` form.

## Three levels of reading

| Level | Shows | Answers |
|-------|-------|---------|
| Ropes (overview) | Both ropes, the gap, knots, the whole red strand | Where does the story go, and what is it trying to escape? |
| Threads (a rope opened) | The rope's threads flat, with hops and beads | Which jump led where, and in what order? |
| Bead or hop (detail) | The existing detail panel and D-Mail file | What happened here? |

Moving between levels: select a rope to open it, select a hop or bead for its detail, Escape goes back up one level. The text list of world lines stays as the keyboard and screen-reader route.

## What the viewer sees at each spoiler level

The picture grows with the viewer. Parts that are not unlocked are not in the page at all.

| Level | Drawn |
|-------|-------|
| Premise | Two flat threads and one jump between them, using `premiseLabel`. No ropes, no names. |
| Part 1 | More flat threads appear under the first, one per hop. The gap gets its 1.000000 line. |
| Part 2 | The threads twist into ropes, the knots appear, and the ropes get their names. The undo hops climb back up. |
| Ending | The return crossing, the free thread and its glossary note. |
| S;G 0 | A second rope-length branching off rope β where the data says it forks (`sg0Branch`). |
| Extras | Spin-off threads as pale loose strands at the edges, off by default. |

The twist arriving at Part 2 is deliberate: it is the moment the story explains convergence, so the map changes shape at the same time.

## Why this shape

- It is the story's own picture of world lines, so the map teaches the vocabulary instead of adding a new one.
- Sheet B shows the real path from the data: six D-Mails step down the ladder, four undos climb back up, then one crossing leaves. The symmetry of the plot is visible without reading a word.
- Storyline charts read best when lines stay straight and cross rarely. The flat level follows that; the twist is kept for the overview, where the shape matters more than the labels.

## Gaps to settle before building

1. **Knots.** The data states each field's fixed outcome in its glossary entry and in `aliveDead` notes, but has no dated "this always happens" event per rope. The first build draws one knot per rope and uses the glossary text. Placing knots at a point in time needs a request in `docs/open-questions.md`.
2. **Threads without a number** (`wl-beta-sg0-ep23-unknown`, `wl-sg0-milky-way-unlisted`) cannot be placed by value. They sit at the rope's edge, dashed, with no number.
3. **The Faris ending line** (`wl-omega-0275349`, field `other`) is below zero. It is drawn as a loose strand under rope α.
4. **Events with no world line** (seven in the data) cannot be beads. They stay in the Chronicle only.

## Building it

- One SVG, same as now. A thread's path is its flat position plus a twist term; a single `twist` value from 0 (flat) to 1 (twisted) animates between the two levels. Reduced motion switches without animating.
- A pure layout function turns tier-filtered selectors into ropes, thread slots, the strand and badge positions, so it can be unit tested without drawing.
- About 46 threads at most; no blend modes or filters on the chart, as panning is slow without a GPU.
- Order of work: flat level first (it carries the content), then the twist and knots, then S;G 0 and extras, then phone layout.

## What was built

The map is one picture instead of two levels, because switching between a twisted view and a flat view made people lose their place:

- Threads run flat across the story, where they are read. After the story ends, each rope's threads twist together and pinch shut at its knot. So "flat to read, twisted to look at" is one view, read left to right.
- The red strand is the lived part of each thread plus the hops between them. Everything else is ink.
- Hops carry the Chronicle's numbers (counted per kind of jump). The mark's shape says how the jump was made: filled circle D-Mail, hollow circle cancellation, square time machine, diamond database erasure.
- A side ending the main story does not take leaves its thread as a dotted hop and does not stretch the red strand.
- The red bead marks the last event of the main story the visitor has unlocked.
- A knot shows its rope's glossary text on hover and opens that entry when pressed.
- The key above the map lists only the parts on the map at the current spoiler level.
- The map opens in the order lived. Calendar order is still one press away.

Code: `layout.ts` (threads, ropes, hop numbers, branches), `MapCanvas.tsx` (drawing), `HopMark.tsx`, `RopeKey.tsx`, `constants.ts` (which glossary entry states each rope's outcome). Tests: `tests/rope.test.ts` and "the rope map" in `e2e/v3.spec.ts`.

On a narrow screen the map is turned on its side: threads run down the page, the order lived runs top to bottom, the page scrolls normally, and each thread's number is printed where the red strand lands on it (`RopeLadder.tsx`, same layout model).

Still open: several knots along a rope (needs data, gap 1).
