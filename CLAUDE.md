# CLAUDE.md: Steins;Gate world-line explainer

## Purpose
A static, animated, interactive web app that explains the Steins;Gate and Steins;Gate 0 story and time-travel mechanics to first-time viewers: a branching world-line map, mechanic animations, guided playback, compare mode, glossary and an S;G 0 section. It is spoiler-safe by default.

## THE CORE RULE (non-negotiable)
1. **Every story fact shown in the UI comes from `data/canon.json`, referenced by its id.** Never hardcode, invent, paraphrase anew, "fix" or alter story facts in components, tests, fixtures, alt text, page titles or copy. UI chrome text (button labels, help text about how the app works) is fine; plot, dates, values, names-as-facts and outcomes are not.
2. **If the UI needs a fact that is not in canon.json, do not guess.** Add it under "Requests from the build" in `docs/open-questions.md` (what is needed, which component), then render a neutral placeholder.
3. **Every displayed fact shows its confidence badge** (CONFIRMED / INTERPRETATION / UNCLEAR; with "per fan wiki" when `singleSource` and `singleSourceKind: "fan_wiki"`) **and links to its sources** through the source drawer, which shows the canon id and URLs.
4. UNCLEAR and disputed items follow `docs/open-questions.md`. Never pick a winner in code that canon.json has not picked.
5. Only `data/canon.json` may change story data. Edit it only when explicitly asked or when fixing a validator error, and keep every edit sourced (sourceIds + confidence).

## Spoiler policy
- Tiers (in order): `premise` → `sg_part1` → `sg_part2` → `sg_ending` → `sg0` → `extras`. **Default = `premise`.**
- Effective tier of anything = max(its own `spoilerTier`/`firstSpoilerTier`, every ancestor's). This applies to `reveals[]`, `details[]`, aliases, relationships, fates and aliveDead entries.
- Never leak higher-tier text through tooltips, `aria-label`, alt text, `<title>`, URLs/route params, search results, console logs, prefetch, or DOM nodes hidden with CSS. Gated content must **not be in the DOM** at all.
- World lines at `premise` tier use `premiseLabel`. Attractor-field names and band labels appear only at tier ≥ `sg_part2`.
- `sortDate` with `sortDateIsEditorial: true` is an ordering key, never a displayed date.

## No copyrighted assets
No official art, screenshots, logos, character likenesses, music, voice or script text, with one exception: character pictures the owner adds to `src/assets/characters/` appear on the character tiles and pages. Everywhere else, original abstract visuals only (monogram glyphs, Nixie digits, lines, icons). Fonts are self-hosted OFL fonts.

## Stack
Vite + React 18 + TypeScript (strict) · SVG + Framer Motion · Zod (schema mirrors canon.json) · Vitest + Testing Library · ESLint (typescript-eslint, react-hooks, jsx-a11y) · Playwright (screenshots at 1440×900 and 390×844, keyboard flows). Static site, hash routing, no runtime network requests. The one approved exception is Creator Uplink: `uplink-service/` on Railway, contacted only when a visitor presses send, plus Cloudflare Turnstile, loaded only for a visitor over their limit. Nothing else may depend on it.

## Folder layout
```
steins-gate-explainer/
  CLAUDE.md  BUILD_PROMPT.md  README.md
  data/canon.json              # single source of truth (story data)
  docs/visual-concept.md       # UI spec
  docs/open-questions.md       # disputes, gaps, "Requests from the build"
  research/sources.md          # all 106 source URLs by tier
  research/canon-notes.md      # narrative research write-up (read-only reference)
  scripts/validate-canon.ts    # CI validator (npm run validate:canon)
  scripts/reference/check_canon.py  # original Python checker (reference)
  src/
    data/  (schema.ts, load.ts, selectors.ts)   components/   features/{map,follow,mechanics,compare,glossary,sg0,characters,works}
    styles/tokens.css   assets/icons/   app/ (routes, providers)
  tests/ (vitest)   e2e/ (playwright)   public/fonts/
```

## Commands (Windows PowerShell, run in `E:\void\steins-gate-explainer`)
```powershell
npm install
npm run dev              # Vite dev server
npm run build            # tsc --noEmit + vite build -> dist/
npm run preview          # serve dist/
npm run lint             # eslint .
npm run test             # vitest run
npm run validate:canon   # tsx scripts/validate-canon.ts data/canon.json (must exit 0)
npx playwright install chromium   # once
npx playwright test      # e2e + screenshots (e2e/__screenshots__)
python scripts/reference/check_canon.py data/canon.json   # optional cross-check
```
`npm run build` must run `validate:canon` first (prebuild) and fail on any validator error.

## Working rules
- Work only inside `E:\void\steins-gate-explainer`. Do not touch anything else on the machine, system settings, or other drives. Machine: Windows, PowerShell default; Node, npm, git, Python and WSL are installed.
- Keep `README.md` current (what it is, how to run, what is unresolved) whenever features or scripts change.
- Before finishing any task: build, lint, test, validate:canon and Playwright all pass.
- Prefer selectors in `src/data/selectors.ts` over ad-hoc lookups; components receive ids and resolved, tier-filtered objects.
- Accessibility (keyboard map navigation, text alternatives for every animation, `prefers-reduced-motion`) is a requirement, not polish.
