# BUILD PROMPT (paste this into Claude Code, Opus)

You are building **"World Line"**, a static, animated, interactive web app that explains the Steins;Gate and Steins;Gate 0 story and time-travel mechanics to first-time viewers. The project folder is `E:\void\steins-gate-explainer` on Windows. Use **PowerShell** for every command. Work **only inside this folder**.

## 0. Read first (before writing any code)
Read these files fully, in this order, and follow them:
1. `CLAUDE.md`: project rules. The core rule is that every story fact comes from `data/canon.json` by id.
2. `data/canon.json`: the single source of truth. Learn its sections: `meta` (confidence levels, mediaKeys, spoilerTiers, fieldConventions, decisions), `sources`, `characters`, `glossary`, `worldLines`, `events`, `transitions`, `mechanics`, `sg0Branch`, `endings`, `works`, `disputes`.
3. `research/canon-notes.md`: narrative background. Use it for understanding only; **never** copy facts from it into the UI. If it has something canon.json lacks, log a request (see below).
4. `docs/visual-concept.md`: the UI spec (routes, map, mechanics storyboards, guided mode, compare, glossary, spoilers, badges, motion, accessibility, responsive, stack).
5. `docs/open-questions.md`: disputes and gaps, and how each must appear in the UI.

Then reply with a short plan (phases and the files you will create) and start.

## Non-negotiable rules
- **Never invent or alter story facts.** Components render canon.json content by id. If data lacks something the UI needs, append it to "Requests from the build" in `docs/open-questions.md` and use a neutral placeholder. Do not guess, and do not fill gaps from memory.
- Every displayed fact gets a confidence badge and a source-drawer link. `singleSource` with kind `fan_wiki` shows "per fan wiki".
- Spoilers: default tier `premise`. The effective tier is the max over ancestors. No leaks via tooltips, aria-labels, alt text, titles, URLs, search, or hidden DOM.
- No official art, screenshots, logos, music or script text. Original abstract visuals only.
- Stay inside `E:\void\steins-gate-explainer`.

## Standard checks (run after EVERY phase; fix all failures before moving on)
```powershell
npm run validate:canon
npm run lint
npm run test
npm run build
npx playwright test
```
Then run the app (`npm run preview`, or let Playwright's `webServer` start it) and **visually check the key screens with Playwright screenshots at desktop 1440×900 and mobile 390×844**. Save them under `e2e/__screenshots__/phase-N/`, open them and look at them yourself, and fix visual problems (overlaps, clipped labels, unreadable contrast, broken layout) before continuing. At the end of each phase write a 3–5 line phase note in `README.md` under "Build log".

## Phases

### Phase 1: Scaffold
Deliverables:
- Vite + React 18 + TypeScript (strict) app in place, without overwriting existing files: `data/`, `docs/`, `research/`, `scripts/reference/`, `CLAUDE.md`, `BUILD_PROMPT.md`, `README.md`.
- Dependencies: framer-motion, zod, vitest, @testing-library/react, jsdom, eslint (typescript-eslint, eslint-plugin-react-hooks, eslint-plugin-jsx-a11y), @playwright/test, tsx.
- Scripts in `package.json`: `dev`, `build` (with `prebuild` = `validate:canon`), `preview`, `lint`, `test`, `validate:canon` (`tsx scripts/validate-canon.ts data/canon.json`), `e2e`.
- Hash router with the routes from visual-concept §1 as placeholder pages; global chrome (top bar, tier control stub, media chips stub, Nixie readout stub).
- `src/styles/tokens.css` with the palette tokens from §2.1; self-hosted OFL fonts in `public/fonts/`.
- `playwright.config.ts` with two projects (desktop 1440×900, mobile 390×844) and a `webServer` that runs `npm run preview`.

Acceptance: all standard checks pass (validate:canon may be a stub that loads the JSON until Phase 2); home renders at both widths; there is no console error.

### Phase 2: Data layer + Zod schema + validator
Deliverables:
- `src/data/schema.ts`: Zod schema that **mirrors canon.json exactly**, including nullable fields, `reveals`, `details`, `alternateValues`, `conflicts`, `singleSource`/`singleSourceKind`, `premiseLabel`, `sortDateIsEditorial`, and `lane`. Types come from `z.infer`.
- `src/data/load.ts`: imports the JSON and parses it (strict in dev/test).
- `src/data/selectors.ts`: typed, pure selectors. Include:
  - `effectiveTier`, `isVisible(obj, tier, media)` and `visibleEvents(tier, media, order)`;
  - `eventsByCalendar` and `eventsBySeq`;
  - `transitionsFor`, `worldLineById`, `collapsedEdges(media)` (UI-only, never written back);
  - `pathBetween(a, b)`, `charactersOnLine(id)`;
  - `glossarySearchIndex(tier)`;
  - `sourcesFor(obj)`, `disputesFor(id)`.
- **`scripts/validate-canon.ts`**: must exit non-zero on any error and print a summary. It checks:
  - JSON parses and Zod-validates;
  - **broken references**: every characterId, sourceId, world-line id (`worldLineBefore/After`, `from/to`, `worldLineId`, `branchWorldLineId`, `forkFromWorldLineId`), eventId (`cause`, `keyEventIds`, `dmailsSent`, reconnection ids), transitionId and glossary `relatedIds` resolves;
  - **missing sources/confidence**: every fact-bearing object (anything with text/claim/caption/summary/plainLanguage/whatIsDifferent/outcome/description/role/notes, plus all top-level items) has non-empty `sourceIds` and a valid `confidence`;
  - no fact cites a source whose status is `failed` or `search-only`;
  - every disputes entry is `UNCLEAR` and every version has sources;
  - **timeline contradictions**:
    - events out of date order (compare `sortDate` as intervals, so partial dates like `2010-08` match any day in that month);
    - transitions whose `from`/`to`/`cause` don't match the cause event's `worldLineBefore`/`worldLineAfter`/`transitionId`;
    - an event whose world line changes with no transition;
    - **world lines in the wrong attractor band** given their divergence (alpha ⇒ 0 ≤ v < 1, beta ⇒ 1 ≤ v < 2; `steins_gate`/`other`/`unclear` and null values are exempt);
    - `divergenceNumeric` ≠ parsed `divergence`;
    - **duplicate `seq`**;
  - **spoiler-tier integrity**: valid tier ids; a premise-tier world line has a `premiseLabel`; no premise-tier world line has untiered higher-tier aliveDead content.
  - Mirror the rules in `scripts/reference/check_canon.py` (run both; they must agree).
- Unit tests for selectors and validator. Mutation tests must show the validator catches each class of error: copy canon.json in memory, break one thing, and expect failure.

Acceptance: `npm run validate:canon` exits 0 on the shipped canon.json; mutation tests pass; standard checks pass.

### Phase 3: Timeline and world-line map
Deliverables (visual-concept §3):
- SVG map with divergence bands, the 1% boundary, its own Steins Gate lane, the S;G 0 lane, and a spin-off gutter (`extras` tier only);
- tracks, nodes (confidence rings, conflict badge), and edges coloured, patterned and glyphed by mechanism, plus collapsed edges for media filtering;
- **dual x-axis toggle** (calendar ⇄ Okabe's `seq`) with animated `layout` reflow;
- July 28 "day lens"; partial-date range brackets; no labels for editorial dates;
- hover-cards, detail panel and source drawer;
- zoom/pan, mini-map, and the global Nixie readout;
- tier control and media chips fully working (`localStorage` with try/catch);
- keyboard navigation (§3.5); visually hidden and toggleable "Map as list"; mobile vertical timeline (§14).

Acceptance:
- At `premise` tier, only premise content exists in the DOM. A Playwright test searches the page HTML for a list of higher-tier strings taken from canon.json and expects none.
- Toggling the axis moves the July 28 rescue-attempt nodes.
- Keyboard-only traversal reaches every visible node.
- Screenshots at both widths look right.

### Phase 4: Mechanic animations
Deliverables (§5): one reusable `MechanicPlayer` that consumes `mechanics[].steps`, plus six storyboards (dmail, time_leap, reading_steiner, attractor_field, divergence_meter with the Nixie component, time_machine).
- Per-step tier gating; badges and sources per caption.
- "What travels / doesn't", limits, and misconception flip cards.
- Text-only mode; `prefers-reduced-motion` and the in-app toggle.
- The `visualHint` field guides drawing and is never displayed.

Acceptance:
- With reduced motion emulated, there are no transforms or rolls and the step lists are visible.
- Every caption shown equals its canon.json caption exactly.
- Screenshots at both widths.

### Phase 5: "Follow the story" guided mode
Deliverables (§6):
- playback over visible events (seq order by default, calendar optional);
- camera moves along the map, edge draw-on, Nixie roll;
- narration from title/summary/whatChanged plus unlocked reveals;
- play/pause/step/speed controls and keyboard control;
- tier walls; mechanic interludes; progress saved; `aria-live` narration.

Acceptance: stepping through at every tier never shows a higher-tier node; screenshots of 3 steps at both widths.

### Phase 6: Compare mode
Deliverables (§7): pick 2–3 visible world lines; a semantic table with what is different, alive/fallen (from `aliveDead` only), key events, media, alternate values; a "path between" strip from transitions; swipeable on mobile.

Acceptance: characters absent from `aliveDead` show "—"; no inferred fates; screenshots.

### Phase 7: Glossary
Deliverables (§8): search (tier-safe index), category chips, entry pages, `<Term>` hover/focus cards used across the app, and a "Real world" tag.

Acceptance: searching for a locked term returns nothing at a low tier; hover-cards are keyboard accessible; screenshots.

### Phase 8: Steins;Gate 0 section
Deliverables (§9):
- `#/sg0` locked below `sg0`;
- the fork diagram from `sg0Branch` (branch event, fork line, the INTERPRETATION-badged branch edge);
- floating S;G 0 lines with a "route links not mapped" note;
- ending tiles (value or "no value listed");
- a simplified VN choice tree built from `howToReach` text and labelled "simplified";
- the animeVsVn list;
- the **reconnection loop-back animation** (2025 video → July 28 email → Aug 21 decode → Steins Gate lane).
Also build `#/endings` (original VN endings), `#/characters`, `#/works`, `#/disputes`, `#/about`.

Acceptance: the loop-back has a text alternative; screenshots at both widths.

### Phase 9: Polish, accessibility, responsiveness
Deliverables:
- an axe-core pass via Playwright (`@axe-core/playwright`) with zero serious or critical issues on every route;
- focus management in drawers and dialogs;
- contrast check of the tokens;
- 200% zoom check; mobile layouts for every route;
- a performance check (no layout thrash during map pan, keeping 60 fps on mid hardware where feasible);
- About page disclaimer;
- final README.

Acceptance: all standard checks plus axe pass; final screenshots of every route at both widths saved in `e2e/__screenshots__/final/`.

## Finish
- Update `README.md`:
  - what the app is;
  - how to run it (PowerShell commands);
  - folder map;
  - the build log;
  - **"Unresolved"**, listing anything still open: requests you logged in `docs/open-questions.md`, any checks you could not make pass and why, and known limitations.
- Reply with a two-sentence summary of what you built and where it is, plus the unresolved list.
