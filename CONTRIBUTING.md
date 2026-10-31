# Contributing

Read `CLAUDE.md` first. The main rules:

- Story facts live only in `data/canon.json`, each with sources and a confidence tag.
- If the UI needs a fact that is missing, log it under "Requests from the build" in `docs/open-questions.md`. Do not guess.
- Locked spoilers must not be in the DOM.
- No official art, screenshots, logos, music or script text.

Before opening a pull request, run:

```powershell
npm run lint
npm run test
npm run build
npx playwright test
```
