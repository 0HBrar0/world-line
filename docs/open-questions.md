# Open questions, disputes and research gaps

Every item below is **UNCLEAR/DISPUTED**. Each one exists as a `disputes[]` entry or an event `conflicts[]` entry in `data/canon.json` (ids in backticks). Builders must **not** resolve these in code. Show them the way the "UI" line says, and if new evidence arrives, update `canon.json` first.

**Default UI pattern for any UNCLEAR item:** display the better-supported version with an amber UNCLEAR badge. Clicking the badge opens the source drawer, which lists every competing version with its sources. Never show a higher-tier version in a lower spoiler tier.

**If the UI needs a fact that is not in canon.json:** add it to the "Requests from the build" section at the bottom of this file. Do not guess.

## World-line numbers and theory

### 1. Divergence of the opening Beta line

`dsp-prologue-value` · spoiler tier: `premise`

- **Version:** 1.130426% (value typed/displayed in the VN prologue) (sources: [src-wikigg-beta](https://scienceadventure.wiki.gg/wiki/Beta_Attractor_Field), [src-wikigg-sg-vn-plot](https://scienceadventure.wiki.gg/wiki/Steins%3BGate_(visual_novel)/Plot), [src-fandom-dmail](https://steins-gate.fandom.com/wiki/D-Mail))
- **Version:** 1.130246% (the 'real' VN script value) (sources: [src-wikigg-beta](https://scienceadventure.wiki.gg/wiki/Beta_Attractor_Field))
- **Version:** 1.129848% ('beta common' label on Fandom's Timeline) (sources: [src-fandom-timeline](https://steins-gate.fandom.com/wiki/Timeline))
- **Version:** From memory only, unverified: 1.130205% at the start and 1.130426% as the return line (sources: [src-wikigg-world-line](https://scienceadventure.wiki.gg/wiki/World_Line))
- **Better supported:** 1.130426% (three sources). 1.130205% is the Ch 10 / ep 22 return line, not the start.
- **UI:** Show 1.130426 with an UNCLEAR badge and list alternates in the source drawer.

### 2. What the divergence number measures

`dsp-divergence-meaning` · spoiler tier: `premise`

- **Version:** Percent difference from the 'original' world line (sources: [src-wikigg-attractor-field](https://scienceadventure.wiki.gg/wiki/Attractor_Field))
- **Version:** Local gravitational variation relative to where the first meter was built (sources: [src-fandom-divergence-meter](https://steins-gate.fandom.com/wiki/Divergence_Meter))
- **Better supported:** Neither; treat it as an address/label.
- **UI:** Never animate it as a physical quantity.

### 3. How far must divergence move to change field?

`dsp-barrier-size` · spoiler tier: `sg_part1`

- **Version:** 1% (anime eps 7 and 14; wiki field ranges) (sources: [src-wp-episodes](https://en.wikipedia.org/wiki/List_of_Steins;Gate_episodes), [src-fandom-attractor-field](https://steins-gate.fandom.com/wiki/Attractor_Field), [src-wikigg-alpha](https://scienceadventure.wiki.gg/wiki/Alpha_Attractor_Field))
- **Version:** More than 4% (sources: [src-galileo-unbound](https://galileo-unbound.blog/tag/steins-gate/))
- **Version:** A 2% barrier (fan extrapolation) (sources: [src-gwern-votuko](https://gwern.net/doc/fiction/science-fiction/time-travel/2023-votuko-themechanicsofsteinsgate.pdf))
- **Better supported:** 1%.
- **UI:** Draw the 1% boundary only.

### 4. Is Steins Gate its own attractor field?

`dsp-sg-line-status` · spoiler tier: `sg_ending`

- **Version:** Independent attractor field (citing S;G 0 VN) (sources: [src-wikigg-sg-world-line](https://scienceadventure.wiki.gg/wiki/Steins_Gate_World_Line))
- **Version:** Between Alpha and Beta / under the influence of both (sources: [src-fandom-sg-world-line](https://steins-gate.fandom.com/wiki/Steins_Gate_World_Line), [src-fandom-attractor-field](https://steins-gate.fandom.com/wiki/Attractor_Field), [src-wikigg-sg-world-line](https://scienceadventure.wiki.gg/wiki/Steins_Gate_World_Line))
- **Better supported:** It is neither an ordinary Alpha nor Beta line; field status is wording.
- **UI:** Own highlighted lane, labelled 'Steins Gate', with an UNCLEAR info dot on 'field'.

### 5. Is convergence probabilistic or an active force?

`dsp-convergence-nature` · spoiler tier: `sg_part2`

- **Version:** Probabilistic: some events occur on more lines (sources: [src-fandom-attractor-field](https://steins-gate.fandom.com/wiki/Attractor_Field))
- **Version:** Active: the world prevents change 'by any means possible' (sources: [src-wikigg-attractor-field](https://scienceadventure.wiki.gg/wiki/Attractor_Field))
- **Better supported:** Unresolved.
- **UI:** Describe the effect, not the cause.

### 6. Mayuri ending value 1.130238

`dsp-mayuri-ending-value` · spoiler tier: `sg_ending`

- **Version:** 1.130238 in VN Ch 10 script (sources: [src-wikigg-beta-table](https://scienceadventure.wiki.gg/wiki/Attractor_Field/Beta_(%CE%B2)))
- **Version:** Flagged by wiki.gg as likely an error inconsistent with events (sources: [src-wikigg-beta](https://scienceadventure.wiki.gg/wiki/Beta_Attractor_Field))
- **Better supported:** Value appears; reliability doubtful.
- **UI:** Show with UNCLEAR.

### 7. Faris ending world line

`dsp-faris-ending-value` · spoiler tier: `sg_ending`

- **Version:** -0.275349 (Omega) in the VN Faris ending (sources: [src-fandom-dmail](https://steins-gate.fandom.com/wiki/D-Mail))
- **Version:** -0.275349 is a spin-off Omega line (Okabe dating Faris, no lab) (sources: [src-fandom-attractor-field](https://steins-gate.fandom.com/wiki/Attractor_Field))
- **Version:** 'Beyond 1%' with a strange meter output (sources: [src-wp-sg-vn](https://en.wikipedia.org/wiki/Steins;Gate_(visual_novel)))
- **Better supported:** The strange output is confirmed; the value is unclear.
- **UI:** Show 'strange output' and the value with UNCLEAR.

### 8. What causes 1.097302%?

`dsp-1097302-cause` · spoiler tier: `sg0`

- **Version:** Daru's Arc Light D-Mail (anime); VN lands on 1.129848 (sources: [src-fandom-dmail](https://steins-gate.fandom.com/wiki/D-Mail))
- **Version:** Kurisu and Okabe's D-Mail to past Kurisu (Jan 2, 2011 or Aug 17, 2010) (sources: [src-fandom-dmail](https://steins-gate.fandom.com/wiki/D-Mail))
- **Version:** Appears in S;G 0 anime ep 8 only (sources: [src-wikigg-beta](https://scienceadventure.wiki.gg/wiki/Beta_Attractor_Field), [src-wikigg-beta-table](https://scienceadventure.wiki.gg/wiki/Attractor_Field/Beta_(%CE%B2)))
- **Better supported:** Only the ep 8 appearance is solid.
- **UI:** Show the node without a cause edge.

### 9. When the Divergence Meter was invented

`dsp-meter-year` · spoiler tier: `sg_part2`

- **Version:** 2021 (VN-cited) (sources: [src-wikigg-divergence-meter](https://scienceadventure.wiki.gg/wiki/Divergence_Meter))
- **Version:** 'Some years before 2020' (Robotics;Notes DaSH) (sources: [src-wikigg-divergence-meter](https://scienceadventure.wiki.gg/wiki/Divergence_Meter), [src-wikigg-attractor-field](https://scienceadventure.wiki.gg/wiki/Attractor_Field))
- **Version:** 'The future Okabe' (no year) (sources: [src-fandom-divergence-meter](https://steins-gate.fandom.com/wiki/Divergence_Meter))
- **Better supported:** Unresolved. No source ties it to 2025.
- **UI:** Do not show an invention year.

## Original story: dates and events

### 10. When did the first D-Mail arrive?

`dsp-first-dmail-arrival` · spoiler tier: `premise`

- **Version:** July 23, 2010 (sources: [src-fandom-dmail](https://steins-gate.fandom.com/wiki/D-Mail))
- **Version:** July 24, 'five days before' (sources: [src-wikigg-sg-vn-plot](https://scienceadventure.wiki.gg/wiki/Steins%3BGate_(visual_novel)/Plot))
- **Version:** 'A week before' (sources: [src-wp-sg-vn](https://en.wikipedia.org/wiki/Steins;Gate_(visual_novel)))
- **Version:** 'Five days earlier' (sources: [src-wp-episodes](https://en.wikipedia.org/wiki/List_of_Steins;Gate_episodes))
- **Better supported:** No clear winner; 'five days' has two sources. Separate July 21/24 dates may belong to other test messages.
- **UI:** Show 'several days earlier' with UNCLEAR badge.

### 11. Why the lottery D-Mail failed

`dsp-lottery-miss` · spoiler tier: `sg_part1`

- **Version:** Luka's mistake (sources: [src-fandom-dmail](https://steins-gate.fandom.com/wiki/D-Mail))
- **Version:** Okabe got one digit wrong (sources: [src-wp-episodes](https://en.wikipedia.org/wiki/List_of_Steins;Gate_episodes))
- **Better supported:** Neither; the near-miss itself is confirmed.
- **UI:** Say 'the ticket doesn't win'; put the cause in the drawer.

### 12. Does Mayuri die on the same date on every Alpha line?

`dsp-mayuri-death-date` · spoiler tier: `sg_part2`

- **Version:** Aug 13 is a fixed point (citing VN Ch 3) (sources: [src-gwern-votuko](https://gwern.net/doc/fiction/science-fiction/time-travel/2023-votuko-themechanicsofsteinsgate.pdf))
- **Version:** A day later after the Suzuha D-Mail is undone (anime ep 17) (sources: [src-wp-episodes](https://en.wikipedia.org/wiki/List_of_Steins;Gate_episodes))
- **Version:** Aug 14 / Aug 15 on later lines (sources: [src-fandom-timeline](https://steins-gate.fandom.com/wiki/Timeline))
- **Better supported:** Outcome converges; date shifts.
- **UI:** Animate the date sliding later.

### 13. Date of the raid

`dsp-raid-date` · spoiler tier: `sg_part2`

- **Version:** Aug 13, 2010 (sources: [src-fandom-timeline](https://steins-gate.fandom.com/wiki/Timeline), [src-fandom-suzuha](https://steins-gate.fandom.com/wiki/Suzuha_Amane))
- **Version:** TLM completed Aug 13 (manga caption), raid date not given (sources: [src-wikigg-tlm](https://scienceadventure.wiki.gg/wiki/Time_Leap_Machine))
- **Better supported:** Aug 13, weakly supported.
- **UI:** Show Aug 13 with UNCLEAR date badge.

### 14. Date of the SERN deletion

`dsp-deletion-date` · spoiler tier: `sg_ending`

- **Version:** Aug 17, 2010 (sources: [src-fandom-timeline](https://steins-gate.fandom.com/wiki/Timeline))
- **Better supported:** Single source.
- **UI:** Show with UNCLEAR date badge.

### 15. Why deleting SERN's record of the first D-Mail changes the world line

`dsp-why-deletion-works` · spoiler tier: `sg_ending`

- **Version:** The mail's content plus its timestamp tipped SERN off and held the Alpha line (sources: [src-steam-sg-first-dmail](https://steamcommunity.com/app/412830/discussions/0/1621724915776285657))
- **Version:** Deleting a record is mundane; the game only says SERN noticed the timestamp (sources: [src-steam-sg-first-dmail](https://steamcommunity.com/app/412830/discussions/0/1621724915776285657))
- **Version:** World lines self-correct, so strict causality does not apply (sources: [src-steam-sg-first-dmail](https://steamcommunity.com/app/412830/discussions/0/1621724915776285657))
- **Better supported:** Not spelled out in any reference source; the event itself is confirmed.
- **UI:** Mark the mechanism 'debated' in the transition panel.

### 16. What Okabe uses for Kurisu's 'blood'

`dsp-fake-blood` · spoiler tier: `sg_ending`

- **Version:** His own blood (sources: [src-wp-episodes](https://en.wikipedia.org/wiki/List_of_Steins;Gate_episodes))
- **Version:** Red liquid from the Cyalume Saber (and his own blood) (sources: [src-fandom-operation-skuld](https://steins-gate.fandom.com/wiki/Operation_Skuld))
- **Version:** Liquid from a light-up sword (another reading of Wikipedia ep 24) (sources: [src-wp-episodes](https://en.wikipedia.org/wiki/List_of_Steins;Gate_episodes))
- **Better supported:** Unresolved; the notes even disagree on what Wikipedia says.
- **UI:** Say 'stages a bloody scene'; list versions in drawer.

### 17. The 2025 D-Mail to Aug 21 about Nakabachi's press conference

`dsp-2025-press-dmail` · spoiler tier: `sg0`

- **Version:** Listed by Fandom (sources: [src-fandom-dmail](https://steins-gate.fandom.com/wiki/D-Mail), [src-fandom-operation-skuld](https://steins-gate.fandom.com/wiki/Operation_Skuld))
- **Better supported:** Unknown whether original or S;G 0 retcon.
- **UI:** Tag media 'sg0' only; UNCLEAR.

### 18. How Alpha-line Suzuha dies

`dsp-suzuha-death` · spoiler tier: `sg_part2`

- **Version:** Suicide after memory loss (letter) (sources: [src-fandom-suzuha](https://steins-gate.fandom.com/wiki/Suzuha_Amane), [src-wikigg-suzuha](https://scienceadventure.wiki.gg/wiki/Amane_Suzuha))
- **Version:** Illness, on the new line (ep 16) (sources: [src-wp-episodes](https://en.wikipedia.org/wiki/List_of_Steins;Gate_episodes))
- **Version:** Illness at 43 in 2000 (alternate Alpha / VN Suzuha ending) (sources: [src-fandom-suzuha](https://steins-gate.fandom.com/wiki/Suzuha_Amane))
- **Better supported:** Unresolved which line gets which.
- **UI:** Show 'dies in 2000' with UNCLEAR.

### 19. Is Beta-line Suzuha also 'John Titor'?

`dsp-suzuha-titor-beta` · spoiler tier: `sg_part2`

- **Version:** Alpha Suzuha is Titor; Beta section silent (sources: [src-fandom-suzuha](https://steins-gate.fandom.com/wiki/Suzuha_Amane))
- **Version:** Titor appears online in 2000 on the Beta field (sources: [src-fandom-john-titor](https://steins-gate.fandom.com/wiki/John_Titor))
- **Better supported:** Confirmed only for Alpha.
- **UI:** Scope the reveal to Alpha.

### 20. Operations Urd and Verdandi

`dsp-norn-ops` · spoiler tier: `sg_part2`

- **Version:** Anime arc labels: Urd eps 1-12, Verdandi 13-22, Skuld 23-24 (sources: [src-skdesu](https://skdesu.com/en/what-does-steins-gate-and-el-psy-congroo/))
- **Version:** Okabe names operations after the Norns (only Skuld confirmed) (sources: [src-fandom-operation-skuld](https://steins-gate.fandom.com/wiki/Operation_Skuld))
- **Better supported:** Naming scheme confirmed; ranges single-source.
- **UI:** Show arc bands as INTERPRETATION overlay.

### 21. What 'Operation Skuld' names

`dsp-skuld-meaning` · spoiler tier: `sg_ending`

- **Version:** The final-arc plan (anime eps 23-24) (sources: [src-fandom-operation-skuld](https://steins-gate.fandom.com/wiki/Operation_Skuld), [src-skdesu](https://skdesu.com/en/what-does-steins-gate-and-el-psy-congroo/))
- **Version:** The video D-Mail itself (sources: [src-kirikiri-sg0](https://www.kirikiribasara.com/?p=16724))
- **Better supported:** Both usages exist.
- **UI:** Glossary lists both senses.

## Devices

### 22. Suzuha's time machine names

`dsp-machine-naming` · spoiler tier: `sg_part2`

- **Version:** FG204 in both Alpha and Beta (sources: [src-fandom-suzuha](https://steins-gate.fandom.com/wiki/Suzuha_Amane))
- **Version:** FG204 (Alpha), C204/C203 (Beta), C193 prototype, OR204 (Steins Gate) (sources: [src-wikigg-fg204](https://scienceadventure.wiki.gg/wiki/FG204))
- **Version:** FG204 past-only; C204 can go to the future (sources: [src-gwern-votuko](https://gwern.net/doc/fiction/science-fiction/time-travel/2023-votuko-themechanicsofsteinsgate.pdf))
- **Better supported:** Unresolved; source tagged 'inconsistent'.
- **UI:** Call it 'Suzuha's time machine'; names in drawer.

## Steins;Gate 0

### 23. Time between the failed rescue and the Amadeus seminar

`dsp-sg0-interval` · spoiler tier: `sg0`

- **Version:** Nov 23, 2010 (about 3 months) (sources: [src-wikigg-sg0-vn-plot](https://scienceadventure.wiki.gg/wiki/Steins;Gate_0_(visual_novel)/Plot))
- **Version:** 'Six months after' (sources: [src-wp-sg0-episodes](https://en.wikipedia.org/wiki/List_of_Steins;Gate_0_episodes))
- **Better supported:** Nov 23, 2010.
- **UI:** Use Nov 23.

### 24. Is S;G 0 a sequel, interquel or prequel?

`dsp-sg0-classification` · spoiler tier: `sg0`

- **Version:** Sequel on a forked timeline (sources: [src-wp-sg0-episodes](https://en.wikipedia.org/wiki/List_of_Steins;Gate_0_episodes))
- **Version:** Interquel (sources: [src-wikigg-sg0-vn](https://scienceadventure.wiki.gg/wiki/Steins;Gate_0_(visual_novel)))
- **Version:** Prequel (sources: [src-kirikiri-sg0](https://www.kirikiribasara.com/?p=16724))
- **Better supported:** Semantic.
- **UI:** Explain the fork-and-loop visually instead of labelling.

### 25. Title of episode 23-beta

`dsp-ep23b-title` · spoiler tier: `sg0`

- **Version:** 'Divide by Zero' (sources: [src-wp-episodes](https://en.wikipedia.org/wiki/List_of_Steins;Gate_episodes))
- **Version:** 'Open the Missing Link' (unverified; page failed) (sources: [src-wikigg-beta-table](https://scienceadventure.wiki.gg/wiki/Attractor_Field/Beta_(%CE%B2)))
- **Better supported:** 'Divide by Zero'.
- **UI:** Avoid showing a title, or show with UNCLEAR.

### 26. Beta Suzuha's route and Kagari separation year

`dsp-suzuha-beta-route` · spoiler tier: `sg0`

- **Version:** 1998 (sources: [src-wp-sg0-episodes](https://en.wikipedia.org/wiki/List_of_Steins;Gate_0_episodes), [src-wikigg-fg204](https://scienceadventure.wiki.gg/wiki/FG204))
- **Version:** 2000 (sources: [src-wikigg-fg204](https://scienceadventure.wiki.gg/wiki/FG204))
- **Better supported:** 1998 (Wikipedia S;G 0 episode list).
- **UI:** Show 1998 with UNCLEAR.

### 27. When Mayuri adopted Kagari

`dsp-kagari-adoption` · spoiler tier: `sg0`

- **Version:** 2032 (sources: [src-wikigg-kagari](https://scienceadventure.wiki.gg/wiki/Shiina_Kagari), [src-fandom-kagari](https://steins-gate.fandom.com/wiki/Kagari_Shiina))
- **Version:** 2036 (sources: [src-wikigg-sg0-vn-plot](https://scienceadventure.wiki.gg/wiki/Steins;Gate_0_(visual_novel)/Plot))
- **Better supported:** 2032.
- **UI:** Show 2032 with UNCLEAR.

### 28. Leskinen's agency name

`dsp-stratfor-name` · spoiler tier: `sg0`

- **Version:** Stratfor (sources: [src-wp-sg0-episodes](https://en.wikipedia.org/wiki/List_of_Steins;Gate_0_episodes), [src-tvtropes-sg0](https://tvtropes.org/pmwiki/pmwiki.php/Anime/SteinsGate0))
- **Version:** Strategic Focus (sources: [src-fandom-leskinen](https://steins-gate.fandom.com/wiki/Alexis_Leskinen))
- **Version:** Stratfoc (sources: [src-wikigg-leskinen](https://scienceadventure.wiki.gg/wiki/Alexis_Leskinen))
- **Better supported:** Same group; translation variants.
- **UI:** Show 'Stratfor' with alias list.

### 29. Leskinen's fate

`dsp-leskinen-fate` · spoiler tier: `sg0`

- **Version:** Alive (anime ep 21, one timeline) (sources: [src-wikigg-leskinen](https://scienceadventure.wiki.gg/wiki/Alexis_Leskinen))
- **Version:** Deceased (VN, light novel) (sources: [src-wikigg-leskinen](https://scienceadventure.wiki.gg/wiki/Alexis_Leskinen))
- **Better supported:** Media-dependent.
- **UI:** Show per-media.

### 30. Date of Operation Helheim

`dsp-helheim-date` · spoiler tier: `sg0`

- **Version:** December 2011 (sources: [src-wikigg-sg0-vn-plot](https://scienceadventure.wiki.gg/wiki/Steins;Gate_0_(visual_novel)/Plot))
- **Better supported:** Possibly a typo for 2010.
- **UI:** Omit date.

### 31. Which Okabe receives the Promised Rinascimento D-RINE, and when

`dsp-dride-timing` · spoiler tier: `sg0`

- **Version:** Sent Dec 2011, could overwrite Vega and Altair memories (sources: [src-steam-sg0-trueend](https://steamcommunity.com/app/825630/discussions/2/1697175413675771208))
- **Version:** Sent near the start of Vega and Altair; one step in a chain (sources: [src-steam-sg0-trueend](https://steamcommunity.com/app/825630/discussions/2/1697175413675771208))
- **Version:** Guidebook: no specific logic decides which line receives it (sources: [src-kirikiri-sg0](https://www.kirikiribasara.com/?p=16724))
- **Better supported:** 'Officially vague'.
- **UI:** Label 'officially vague', not 'solved'.

### 32. Adult Kagari in the 2025 recording

`dsp-kagari-true-end` · spoiler tier: `sg0`

- **Version:** Facial surgery explains it (sources: [src-steam-sg0-trueend](https://steamcommunity.com/app/825630/discussions/2/1697175413675771208))
- **Version:** Milky-way Crossing is a different line from Vega and Altair; no surgery happened (sources: [src-steam-sg0-trueend](https://steamcommunity.com/app/825630/discussions/2/1697175413675771208), [src-kirikiri-sg0](https://www.kirikiribasara.com/?p=16724))
- **Better supported:** Second (two community sources).
- **UI:** INTERPRETATION note only.

### 33. Is the S;G 0 anime a faithful adaptation?

`dsp-sg0-anime-adaptation` · spoiler tier: `sg0`

- **Version:** It is the 'final route' and closer to the source than assumed (sources: [src-kirikiri-sg0](https://www.kirikiribasara.com/?p=16724))
- **Version:** A loose adaptation that flattens the VN (critics cited by the same blog) (sources: [src-kirikiri-sg0](https://www.kirikiribasara.com/?p=16724))
- **Better supported:** Opinion.
- **UI:** Do not rate; describe differences.

### 34. Yugo's status in S;G 0

`dsp-yugo-sg0` · spoiler tier: `sg0`

- **Version:** Still a Rounder (sources: [src-fandom-yugo](https://steins-gate.fandom.com/wiki/Yugo_Tennouji))
- **Version:** Never worked for SERN in this field (sources: [src-fandom-yugo](https://steins-gate.fandom.com/wiki/Yugo_Tennouji))
- **Better supported:** Unresolved (same page).
- **UI:** UNCLEAR badge.

### 35. Missile destruction vs stranding in 18,000 BC

`dsp-sg0-arc-light-sequence` · spoiler tier: `sg0`

- **Version:** DURPA missile destroys the machine (anime ep 19) (sources: [src-wp-sg0-episodes](https://en.wikipedia.org/wiki/List_of_Steins;Gate_0_episodes))
- **Version:** They ran out of fuel during Arc Light and were stranded in 18,000 BC (sources: [src-wikigg-fg204](https://scienceadventure.wiki.gg/wiki/FG204), [src-wp-sg0-episodes](https://en.wikipedia.org/wiki/List_of_Steins;Gate_0_episodes))
- **Better supported:** Both reported; order unexplained.
- **UI:** Show both events; no causal edge.

## Characters

### 36. Did Okabe and Daru attend the same high school?

`dsp-okabe-daru-school` · spoiler tier: `premise`

- **Version:** Yes (sources: [src-fandom-okabe](https://steins-gate.fandom.com/wiki/Rintaro_Okabe))
- **Version:** Not mentioned on Daru's page (sources: [src-fandom-daru](https://steins-gate.fandom.com/wiki/Itaru_Hashida))
- **Better supported:** Unverified.
- **UI:** Omit.

### 37. Kurisu's age

`dsp-kurisu-age` · spoiler tier: `premise`

- **Version:** 18 (S;G), 19 (S;G 0) (sources: [src-mal-kurisu](https://myanimelist.net/character/35252))
- **Version:** Inconsistent statements (graduated at 17 vs 14) (sources: [src-fandom-kurisu](https://steins-gate.fandom.com/wiki/Kurisu_Makise))
- **Better supported:** Unresolved.
- **UI:** Omit ages.

## Works, releases and real-world facts

### 38. Is the 2013 film canon?

`dsp-film-canon` · spoiler tier: `extras`

- **Version:** Canon (sources: [src-kirikiri-sg0](https://www.kirikiribasara.com/?p=16724))
- **Version:** Non-canon (a popular video, per the same blog) (sources: [src-kirikiri-sg0](https://www.kirikiribasara.com/?p=16724))
- **Better supported:** Unresolved; Wikipedia says only 'set after the series'.
- **UI:** Mark the film lane UNCLEAR.

### 39. Re:Boot Western dates

`dsp-reboot-dates` · spoiler tier: `premise`

- **Version:** Aug 20 (PC) / Oct 29 (consoles) (sources: [src-gematsu-reboot-gamma](https://gematsu.com/2026/06/steinsgate-reboot-introduces-additional-gamma-worldline-route), [src-rpgsite-reboot-dates](https://www.rpgsite.net/news/20456-steins-gate-reboot-english-physical-release-steelbook-preorder), [src-rpgsite-xbox-delay](https://www.rpgsite.net/news/21086-steins-gate-reboot-xbox-release-date-delayed-october))
- **Version:** Aug 19 / Oct 28 (sources: [src-rpgamer-reboot](https://rpgamer.com/2026/08/adventure-corner-steinsgate-reboot/))
- **Better supported:** Aug 20 / Oct 29 (likely time zone).
- **UI:** Show Aug 20 / Oct 29.

### 40. S;G 0 PC release dates

`dsp-sg0-pc-date` · spoiler tier: `premise`

- **Version:** Japan Aug 26, 2016 (sources: [src-wikigg-sg0-vn](https://scienceadventure.wiki.gg/wiki/Steins;Gate_0_(visual_novel)))
- **Version:** Japan June 24, 2016 (headline) (sources: [src-gamer-ne-jp](https://www.gamer.ne.jp/news/201604150030/))
- **Version:** Worldwide May 6 or May 8, 2018 (sources: [src-wikigg-sg0-vn](https://scienceadventure.wiki.gg/wiki/Steins;Gate_0_(visual_novel)))
- **Better supported:** Unresolved.
- **UI:** Show year only.

### 41. Real-world Titor's claimed vehicle

`dsp-titor-car` · spoiler tier: `premise`

- **Version:** 1967 Chevrolet Corvette (sources: [src-wp-john-titor](https://en.wikipedia.org/wiki/John_Titor))
- **Version:** 1967 Chevrolet Camaro (sources: [src-fandom-john-titor](https://steins-gate.fandom.com/wiki/John_Titor))
- **Better supported:** Corvette.
- **UI:** Show Corvette.

## Event-level conflicts (stored on events as `conflicts[]`)

- `ev-0728-rescue-attempt-1` (First rescue attempt fails, tier `sg_ending`):
  - Suzuha's machine arrives at 11:15 AM ([src-wikigg-fg204](https://scienceadventure.wiki.gg/wiki/FG204))
  - Suzuha's machine arrives at 11:50 AM (the same page states both) ([src-wikigg-fg204](https://scienceadventure.wiki.gg/wiki/FG204))
- `ev-0728-rescue-attempt-2` (Operation Skuld: deceiving the past, tier `sg_ending`):
  - He stages the scene with his own blood ([src-wp-episodes](https://en.wikipedia.org/wiki/List_of_Steins;Gate_episodes))
  - He uses red liquid from the Cyalume Saber (Future Gadget No. 6) as fake blood ([src-fandom-operation-skuld](https://steins-gate.fandom.com/wiki/Operation_Skuld), [src-wp-episodes](https://en.wikipedia.org/wiki/List_of_Steins;Gate_episodes))
- `ev-0728-first-dmail` (The first (accidental) D-Mail, tier `premise`):
  - Arrived July 23, 2010 ([src-fandom-dmail](https://steins-gate.fandom.com/wiki/D-Mail))
  - Arrived July 24, 'five days before' ([src-wikigg-sg-vn-plot](https://scienceadventure.wiki.gg/wiki/Steins%3BGate_(visual_novel)/Plot))
  - Arrived 'a week before' ([src-wp-sg-vn](https://en.wikipedia.org/wiki/Steins;Gate_(visual_novel)))
  - Arrived 'five days earlier' ([src-wp-episodes](https://en.wikipedia.org/wiki/List_of_Steins;Gate_episodes))
- `ev-0803-dmail-loto6` (The LOTO SIX D-Mail, tier `sg_part1`):
  - The miss was Luka's mistake ([src-fandom-dmail](https://steins-gate.fandom.com/wiki/D-Mail))
  - Okabe got one digit wrong ([src-wp-episodes](https://en.wikipedia.org/wiki/List_of_Steins;Gate_episodes))
- `ev-08xx-suzuha-letter` (A letter from 2000, tier `sg_part2`):
  - The letter reveals she crashed, lost her memory, and later killed herself ([src-fandom-suzuha](https://steins-gate.fandom.com/wiki/Suzuha_Amane), [src-wikigg-suzuha](https://scienceadventure.wiki.gg/wiki/Amane_Suzuha))
  - The letter says she later died of illness on the new line ([src-wp-episodes](https://en.wikipedia.org/wiki/List_of_Steins;Gate_episodes))
- `ev-0815-fb-revealed` (FB unmasked, tier `sg_part2`):
  - Anime: Yugo shoots Moeka and then himself ([src-wp-episodes](https://en.wikipedia.org/wiki/List_of_Steins;Gate_episodes), [src-fandom-yugo](https://steins-gate.fandom.com/wiki/Yugo_Tennouji))
  - VN: Yugo shoots himself ([src-fandom-yugo](https://steins-gate.fandom.com/wiki/Yugo_Tennouji), [src-fandom-moeka](https://steins-gate.fandom.com/wiki/Moeka_Kiryu))
- `ev-0821-beta-suzuha` (Beta-line Suzuha arrives, tier `sg_ending`):
  - A 2025 D-Mail also tells Okabe to check Nakabachi's press conference; whether this is in the original or added by Steins;Gate 0 is unclear ([src-fandom-dmail](https://steins-gate.fandom.com/wiki/D-Mail), [src-fandom-operation-skuld](https://steins-gate.fandom.com/wiki/Operation_Skuld))
- `ev-sg0-amadeus-seminar` (The Amadeus seminar, tier `sg0`):
  - Nov 23, 2010 (VN) ([src-wikigg-sg0-vn-plot](https://scienceadventure.wiki.gg/wiki/Steins;Gate_0_(visual_novel)/Plot))
  - 'Six months after' Okabe chose to stay (anime ep 1 summary) ([src-wp-sg0-episodes](https://en.wikipedia.org/wiki/List_of_Steins;Gate_0_episodes))
- `ev-sg0-alpha-visit` (A brief return to Alpha, tier `sg0`):
  - VN: shift on Jan 21, 2011 for unknown reasons ([src-wikigg-fg204](https://scienceadventure.wiki.gg/wiki/FG204))
  - Anime: a Russian nuclear time-machine test shifts the world to Alpha in Jan 2011 ([src-wikigg-fg204](https://scienceadventure.wiki.gg/wiki/FG204))
- `ev-sg0-pandoras-box` (Choice: answer Amadeus? ('Pandora's Box'), tier `sg0`):
  - The order of 1.382733 and 1.129954 within 'Pandora's Box' is not stated ([src-wikigg-beta-table](https://scienceadventure.wiki.gg/wiki/Attractor_Field/Beta_(%CE%B2)))
- `ev-sg0-laptop-destroyed` (Kurisu's laptop destroyed, tier `sg0`):
  - VN: the masked raider is Moeka ([src-wikigg-sern](https://scienceadventure.wiki.gg/wiki/SERN))
  - Anime: the masked raider is Judy Reyes ([src-wikigg-sern](https://scienceadventure.wiki.gg/wiki/SERN))
- `ev-sg0-arc-light-dmail` (Daru's Operation Arc Light D-Mail, tier `sg0`):
  - Lands on 1.097302% in the anime ([src-fandom-dmail](https://steins-gate.fandom.com/wiki/D-Mail))
  - Lands on 1.129848% in the VN ([src-fandom-dmail](https://steins-gate.fandom.com/wiki/D-Mail))

**UI:** list conflicts in the event's source drawer. The event card shows only claims shared by all versions.

## Dates and values shown with UNCLEAR badges (weakly sourced, not disputed)

- `ev-0728-phonewave-discovery`: date 2010-07-28. single or weak source
- `ev-0729-sern-hack`: date 2010-07-29. single or weak source
- `ev-0803-dmail-loto6`: date 2010-08-03. Calendar date from Fandom's D-Mail table and Timeline only (one wiki); the order of events is confirmed separately by wiki.gg chapter mapping and Wikipedia episode summaries.
- `ev-0804-dmail-moeka`: date 2010-08-04. Calendar date from Fandom's D-Mail table and Timeline only (one wiki); the order of events is confirmed separately by wiki.gg chapter mapping and Wikipedia episode summaries.
- `ev-0806-dmail-luka`: date 2010-08-06. Calendar date from Fandom's D-Mail table and Timeline only (one wiki); the order of events is confirmed separately by wiki.gg chapter mapping and Wikipedia episode summaries.
- `ev-0807-dmail-faris`: date 2010-08-07. Calendar date from Fandom's D-Mail table and Timeline only (one wiki); the order of events is confirmed separately by wiki.gg chapter mapping and Wikipedia episode summaries.
- `ev-0809-storm-damage`: date 2010-08-09. On the calendar this precedes the Aug 10 D-Mail, but it only happens on the line that D-Mail creates.
- `ev-0810-dmail-suzuha-tail`: date 2010-08-10. Calendar date from Fandom's D-Mail table and Timeline only (one wiki); the order of events is confirmed separately by wiki.gg chapter mapping and Wikipedia episode summaries.
- `ev-0811-failed-moeka-cancel`: date 2010-08-11. Calendar Aug 11, but subjectively after the Aug 15 cancellation of Luka's D-Mail (Okabe leapt back). Calendar date from Fandom's D-Mail table and Timeline only (one wiki); the order of events is confirmed separately by wiki.gg chapter mapping and Wikipedia episode summaries.
- `ev-0813-raid`: date 2010-08-13. Aug 13 comes from Fandom (two pages), a manga caption on wiki.gg (machine completion) and a fan essay citing VN Ch 3; not independently verified.
- `ev-0813-time-leap-loop`: date 2010-08-13. Spans repeated relivings of roughly Aug 11-13; the number of leaps is not given.
- `ev-08xx-titor-reveal`: date 2010-08. No calendar date in the notes (anime ep 14).
- `ev-08xx-meter-given`: date 2010-08. No calendar date in the notes (anime ep 15).
- `ev-0813-undo-suzuha`: date 2010-08-13. Calendar date from Fandom's D-Mail table and Timeline only (one wiki); the order of events is confirmed separately by wiki.gg chapter mapping and Wikipedia episode summaries.
- `ev-08xx-suzuha-letter`: date 2010-08. No calendar date in the notes (anime ep 16).
- `ev-0814-undo-faris`: date 2010-08-14. Calendar date from Fandom's D-Mail table and Timeline only (one wiki); the order of events is confirmed separately by wiki.gg chapter mapping and Wikipedia episode summaries.
- `ev-0814-convergence-day-later`: date 2010-08-14. Anime ep 17 says 'a day later'; Fandom's Timeline lists the death on Aug 14 (0.456914 or Omega) and Aug 15 (0.571046 or 0.523307).
- `ev-vn-faris-ending-dmail`: date 2010-08-14. Date assumed from the cancellation it replaces (Aug 14); not stated in the notes.
- `ev-0815-undo-luka`: date 2010-08-15. Calendar date from Fandom's D-Mail table and Timeline only (one wiki); the order of events is confirmed separately by wiki.gg chapter mapping and Wikipedia episode summaries.
- `ev-0815-fb-revealed`: date 2010-08-15. single or weak source
- `ev-0815-undo-moeka`: date 2010-08-15. Calendar date from Fandom's D-Mail table and Timeline only (one wiki); the order of events is confirmed separately by wiki.gg chapter mapping and Wikipedia episode summaries.
- `ev-08xx-dilemma`: date 2010-08. No calendar date in the notes (anime eps 20-21).
- `ev-0817-sern-deletion`: date 2010-08-17. Aug 17 is from Fandom's Timeline only.
- `ev-vn-mayuri-ending-deletion`: date 2010-08. single or weak source
- `ev-09-epilogue-reunion`: date 2010-09. 'Late September' is from Fandom's Timeline only.
- `ev-sg0-alpha-visit`: date 2011-01. single or weak source
- `ev-sg0-alpha-kurisu-dmail`: date 2011-01. single or weak source
- `ev-sg0-arc-light-dmail`: date 2025. single or weak source
- `wl-beta-1130426`: value 1.130426, divergenceConfidence UNCLEAR.
- `wl-beta-1130238`: value 1.130238, divergenceConfidence UNCLEAR.
- `wl-omega-0275349`: value -0.275349, divergenceConfidence UNCLEAR.
- `wl-beta-sg0-ep23-unknown`: value None, divergenceConfidence UNCLEAR.
- `wl-sg0-milky-way-unlisted`: value None, divergenceConfidence UNCLEAR.
- Events with **no sourced date** (editorial `sortDate`, never display it): `ev-sg0-laptop-destroyed`, `ev-sg0-time-machine-destroyed`, `ev-sg0-tlm-rebuilt`, `ev-sg0-dride-erases-amadeus`.

## Unresolved modelling questions (data shape, not story facts)

1. **S;G 0 VN route graph.** The notes give world-line values per chapter and ending, but not which line leads to which. Only two S;G 0 transitions exist in canon.json: `tr-sg0-branch` and `tr-sg0-alpha-kurisu-dmail`, both INTERPRETATION. "Dual of Antinomy" (Alpha visit) and "Antinomic Dual" (Jan 15 choice) may or may not be the same chapter, and the VN Alpha shift is dated Jan 21. **UI:** S;G 0 nodes float in their lane, grouped by chapter/ending, with dotted "path not mapped" connectors drawn by the UI (not stored as transitions).
2. **S;G 0 anime sequence.** Anime-only values 1.097302 (ep 8), 1.123581 (ep 22) and an unnamed line (ep 23) have no sourced causes. The anime's Jan 2011 Alpha shift has no value. **UI:** place them by episode order and add no edges.
3. **Fork mechanism.** Why the world moves from 1.130209 to 1.129848 when Okabe refuses is not stated (`tr-sg0-branch`, mechanism "other", INTERPRETATION).
4. **Video D-Mail arrival.** The exact day the 2025 video arrives or decodes in the original is not named. `sg0Branch.reconnection` links the July 28 12:26 email to the Aug 21 decode.
5. **Ending world lines.** The Suzuha and Luka ending lines are inferred (`worldLineConfidence: INTERPRETATION`). The Milky-way Crossing value is unlisted (node `wl-sg0-milky-way-unlisted`).
6. **Media for in-between Beta values.** 1.130209 and 1.130212 come from the VN script, guidebooks and promo material. The anime shows no value, so anime-only filters collapse 1.130205 → 1.048596 into one dashed edge.
7. **Time-leap world-line effect.** "A leap alone does not change the world line" is INTERPRETATION (no reference source states it outright).
8. **Spoiler-tier boundaries** are editorial (see `meta.spoilerTiers`). In particular, Suzuha, Luka, Faris, Moeka and Yugo are first shown at `sg_part1`, because the notes do not say in which episode each first appears.

## Research gaps (pages that failed, sources never checked)

- **No official sources.** MAGES., Spike Chunsoft, steinsgate0.jp and Crunchyroll pages were never fetched, and neither were the official guidebooks (*Steins;Gate Official Document*, *Amadeus' Script*, *Chaos;Head & Steins;Gate Maniacs*); they are known only through fan wikis and blogs. Checking them could promote many single-source items.
- **No script verification.** Apart from one fan transcript (LP Archive Update 79), no primary VN or anime text was checked.
- **Reddit r/steinsgate, Anime Stack Exchange, MyAnimeList forums** were targeted and not reached. The "closed loop" paradox discussion probably lives there.
- **Failed pages:**
  - Fandom: World_line, List_of_world_lines, Phone_Microwave / Phonewave, Time_Machine, Committee_of_300, Achievement_Point, Kaede Kurushima.
  - wiki.gg: Operation_Skuld, the S;G 0 /Endings page and /Open_the_Missing_Link; the D-Mail page was a stub.
  - Wikipedia `Steins%3BGate_0` (encoded variant) failed.
- **Pages that returned the wrong content:**
  - Wikipedia `Steins;Gate_0` returned original S;G text.
  - The Wikipedia film URL returned VN plot.
  - Wikipedia `List_of_Steins;Gate_characters` returned S;G 0 episode summaries.
  - The Wikipedia Linear Bounded Phenogram and My Darling's Embrace pages failed or returned the main article.
- **Title or snippet only:** ANN divergence-meter clock article, Automaton Re:Boot delay, gamer.ne.jp S;G 0 PC date, MyAnimeList Kurisu character page, Moegirl "El Psy Kongroo".
- **Surfaced in search but never fetched:** Siliconera "Amadeus influences S;G 0 endings", Netto's Re:Boot review, wolfborg Patreon, the Interpretating Culture Substack essay, the Unicamp blog.
- **Topics not covered at all:**
  - Clock times for D-Mails 2-6, the raid and the Aug 21 departures.
  - Exact count of Okabe's time leaps.
  - Who physically built the PhoneWave; the timer-to-hours formula.
  - Fate of the PhoneWave and the Time Leap Machine in the original.
  - The film's mechanics (why Okabe vanishes).
  - Placement of individual Linear Bounded Phenogram stories.
  - Lab Mem 009 and 011.
  - Kanji names for Leskinen, Judy Reyes, Nakase and Kurushima.
  - The anime's on-screen value for the prologue Beta line.
  - Whether the VN stages the first rescue identically to anime ep 23.
  - Status of the live-action series and "Steins;???".
  - Exact Japanese dates for Elite and the S;G 0 anime premiere: 2018-04-12 rests on the Wikipedia S;G 0 episode list only.
  - Whether Re:Boot's Western console release has happened (it was scheduled for 2026-10-29).
- **"Rasputin"** (S;G 0) was not found in any source. Do not display it.

## Requests from the build

*(Claude Code appends here: any fact the UI needs that canon.json lacks, with the component that needs it. Do not invent the fact.)*

### 1. Per-string spoiler tiers (all components)

canon.json tiers objects, but some strings inside a low-tier object name later content. Examples: `ev-0728-first-dmail.whatChanged` names the Beta and Alpha fields at premise tier, `gl-lab-mem-numbers.details` lists Kagari at premise tier, and `gl-akihabara.details` mentions Faris's D-Mail at premise tier. canon.json was not edited. `src/data/tierGuard.ts` drops the clause that names locked content and shows the rest followed by an ellipsis, or nothing if no clause survives.

**Needed:** split each string below into a safe base plus a tiered `reveals` entry, or confirm the wording is fine at its tier. Regenerate this table with `npx tsx scripts/report-tier-leaks.ts`.

| Canon id | Field | Own tier | Text needs |
|---|---|---|---|
| `kurisu` | role | premise | sg_part1 |
| `mayuri` | role | premise | sg_part1 |
| `gl-world-line` | details | premise | sg_part2 |
| `gl-divergence` | details | premise | sg_part2 |
| `gl-divergence-barrier` | plainLanguage | sg_part1 | sg_part2 |
| `gl-gel-banana` | details | premise | sg_part1 |
| `gl-time-leap-machine` | details | sg_part2 | sg0 |
| `gl-time-machine` | details | sg_part2 | sg_ending |
| `gl-ibn-5100` | details | sg_part1 | sg_part2 |
| `gl-sern` | details | sg_part1 | sg_part2 |
| `gl-john-titor-in-universe` | details | sg_part1 | sg_part2 |
| `gl-lab-mem-numbers` | details | premise | sg0 |
| `gl-akihabara` | details | premise | sg_part1 |
| `gl-braun-tube-workshop` | plainLanguage | premise | sg_part1 |
| `gl-operation-skuld` | details | sg_ending | sg0 |
| `gl-phone-trigger` | details | premise | sg0 |
| `gl-visual-rebuilding` | plainLanguage | sg_part2 | sg0 |
| `gl-visual-rebuilding` | details | sg_part2 | sg0 |
| `gl-viktor-chondria` | plainLanguage | sg_part1 | sg0 |
| `wl-beta-1130426` | alternateValues[1].note | premise | sg0 |
| `wl-alpha-0571024` | aliveDead(kurisu).note | premise | sg_part2 |
| `wl-alpha-0571015` | aliveDead(kurisu).note | sg_part1 | sg_part2 |
| `wl-alpha-0523299` | aliveDead(kurisu).note | sg_part1 | sg_part2 |
| `wl-alpha-0456903` | aliveDead(kurisu).note | sg_part1 | sg_part2 |
| `wl-alpha-0409420` | aliveDead(kurisu).note | sg_part1 | sg_part2 |
| `wl-alpha-0337187` | whatIsDifferent | sg_part1 | sg_part2 |
| `wl-alpha-0337187` | aliveDead(kurisu).note | sg_part1 | sg_part2 |
| `wl-alpha-0337187` | aliveDead(mayuri).note | sg_part1 | sg_part2 |
| `ev-0728-first-dmail` | whatChanged | premise | sg_part2 |
| `ev-0810-dmail-suzuha-tail` | whatChanged | sg_part1 | sg_part2 |
| `tr-first-dmail` | description | premise | sg_part2 |
| `dmail` | misconceptions[1].correction | premise | sg_part2 |
| `reading_steiner` | misconceptions[0].correction | premise | sg0 |
| `attractor_field` | misconceptions[3].claim | sg_part2 | sg_ending |
| `dsp-prologue-value` | topic | premise | sg_part2 |
| `dsp-prologue-value` | versions[2] | premise | sg0 |
| `dsp-prologue-value` | versions[3] | premise | sg_ending |
| `dsp-prologue-value` | betterSupported | premise | sg_ending |
| `dsp-machine-naming` | versions[1] | sg_part2 | sg_ending |

### 2. Sources for mechanic summaries (`MechanicExtras`)

`mechanics[].oneLiner`, `whatTravels` and `whatDoesNotTravel` have no `sourceIds` or `confidence` of their own. The UI cites the union of the visible steps' sources and shows their weakest tag. `oneLiner` is shown with no badge. **Needed:** own sources and a confidence tag on these fields.

### 3. Tier for works (`WorksPage`)

`works[]` has no `spoilerTier`. The UI gates `canonStatus`, `placementInTimeline` and `notes` by a rule in `src/features/works/InfoPages.tsx` (S;G 0 works and ep 23-beta at `sg0`; film, OVA and `other` at `extras`; the rest at premise, still passing the tier guard). Their release dates and titles show at every tier. **Needed:** a tier on each work, or confirmation of this rule.

### 4. Tier for dispute links and source titles (`disputeLinks.ts`, source drawer)

Disputes have no field naming the objects they concern, so `src/data/disputeLinks.ts` is a join table built from this document. Source titles and URLs also have no tier and can name later content; the drawer hides any that trip the guard and shows "Source hidden at your spoiler level". **Needed:** an `appliesTo` list on disputes and a tier on sources.

### 5. Fixed-point events (`KNOT_EVENTS`)

The knot glyph needs to know which events are convergence fixed points. `src/features/map/constants.ts` lists four event ids by hand from their summaries. **Needed:** a flag on those events.

## Audit log (2026-10-26)

Independent re-check of canon.json against freshly fetched sources. Sources were paraphrased; no script text was copied. Note: on this date, WebFetch of the Wikipedia URLs `Steins;Gate_(visual_novel)`, `Steins;Gate_(video_game)` and `Steins;Gate_0` all returned the 2011 TV anime article, and the `%3B`-encoded variants failed. Claims that cited those pages were re-checked against wiki.gg / Fandom / MAL / news sites instead.

| # | Fact (canon.json id) | Stored value / confidence | What the fetched source says | Verdict |
|---|---|---|---|---|
| 1 | Opening Beta line (`wl-beta-1130426`, alt in `dsp-prologue-value`) | 1.130426; CONFIRMED, divergenceConfidence UNCLEAR; alt 1.130246 UNCLEAR | wiki.gg Beta: 1.130246 is the "real" script value, 1.130426 is what is typed in-game. Fandom D-Mail table starts at 1.130426. | VERIFIED |
| 2 | First D-Mail result (`tr-first-dmail`, `wl-alpha-0571024`) | 0.571024; CONFIRMED | wiki.gg Alpha and Fandom D-Mail both give 1.130426 → 0.571024. Fandom Timeline only shows a truncated 0.5710.. | VERIFIED |
| 3a | Lottery D-Mail (`wl-alpha-0571015`) | 0.571015; CONFIRMED | wiki.gg Alpha and Fandom D-Mail agree. | VERIFIED |
| 3b | Moeka's D-Mail (`wl-alpha-0523299`) | 0.523299; CONFIRMED | wiki.gg Alpha and Fandom D-Mail agree. The cited Wikipedia episode list has no digits. | VERIFIED |
| 3c | Luka's D-Mail (`wl-alpha-0456903`) | 0.456903; CONFIRMED | wiki.gg Alpha and Fandom D-Mail agree. | VERIFIED |
| 3d | Faris's D-Mail (`wl-alpha-0409420`) | 0.409420; CONFIRMED | wiki.gg Alpha and Fandom D-Mail agree. | VERIFIED |
| 3e | Suzuha D-Mail (`wl-alpha-0337187`) | 0.337187; CONFIRMED | wiki.gg Alpha and Fandom D-Mail agree. | VERIFIED |
| 4 | Cancellations (`wl-alpha-0409431`, `-0456914`, `-0523307`, `-0571046`) | 0.409431 / 0.456914 / 0.523307 / 0.571046; CONFIRMED | wiki.gg Alpha lists all four in order. Fandom D-Mail and Fandom Timeline also show them. | VERIFIED |
| 5 | Return Beta line (`wl-beta-1130205`) | 1.130205; CONFIRMED | wiki.gg Beta lists it for VN Ch 10 and anime ep 22. The Wikipedia ep 22 summary describes the deletion and the return to Beta. | VERIFIED |
| 6 | Steins Gate line (`wl-sg-1048596`) | 1.048596; CONFIRMED | wiki.gg SG World Line, Fandom Attractor Field and Fandom Timeline agree. Whether it is its own field is already in `dsp-sg-line-status`. | VERIFIED |
| 7 | S;G 0 opening (`wl-beta-1129848`) | 1.129848; CONFIRMED | The wiki.gg S;G 0 VN synopsis gives it as the opening value. wiki.gg Beta lists it for S;G 0 anime ep 1. | VERIFIED |
| 8 | D-Mail size (`gl-dmail`) | ~36 bytes, as three 12-byte pieces; CONFIRMED | wiki.gg PhoneWave: about 36 bytes, in three 12-byte segments, roughly 36 English or 18 Japanese characters. Fandom D-Mail and the LP Archive VN scene both give 36 bytes but don't mention the 3×12 split. | VERIFIED |
| 9 | Time leap (`mechanics[1]`, glossary time-leap entry, `maho` fate) | 48 h safe limit, memories only; Maho extends it to two weeks in S;G 0; CONFIRMED | Fandom TLM and wiki.gg TLM both say 48 h and memories only. wiki.gg says 336 h (two weeks) after Maho's upgrade. | VERIFIED |
| 10 | Suzuha = John Titor (Alpha), Daru's daughter, from 2036 (`suzuha`) | CONFIRMED | Fandom John Titor and Fandom Suzuha: she uses the alias in the Alpha field and is Daru's daughter. Both say 2036, and wiki.gg gives Daru and Yuki as her parents. | VERIFIED |
| 11 | FB = Mr. Braun = Yugo (`yugo`) | CONFIRMED | Fandom Yugo and Fandom Moeka: he is both, and FB stands for Ferdinand Braun. | VERIFIED |
| 12 | Kagari adopted by Mayuri (`kagari`, `dsp-kagari-adoption`) | CONFIRMED | wiki.gg Kagari and Fandom Mayuri both say Mayuri adopted her, in 2032. | VERIFIED |
| 13 | Ep 23β air date (`work-sg-ep23b`) | 2015-12-02; CONFIRMED | The Wikipedia episode list gives Dec 2, 2015, as an alternate ep 23 during the rerun. | VERIFIED |
| 14a | VN release (`work-sg-vn`) | 2009-10-15, Xbox 360 | wiki.gg S;G VN agrees. The Wikipedia URL returned the anime article. | VERIFIED (via alternate wiki) |
| 14b | Anime run (`work-sg-anime`) | 2011-04-06 to 2011-09-14 | The Wikipedia TV article gives Apr 6 – Sep 14. The Wikipedia episode list gives Sep 13. | CORRECTED (note added; start date verified) |
| 14c | S;G 0 VN (`work-sg0-vn`) | 2015-12-10, moved from 2015-11-19 | wiki.gg S;G 0 VN gives Dec 10, 2015 (PS3/PS4/Vita). A Siliconera headline confirms the delay to Dec 10. | VERIFIED |
| 14d | Film (`work-film`) | 2013-04-20 | MAL gives Apr 20, 2013. | VERIFIED |
| 14e | Re:Boot (`work-reboot`) | 2026-08-20 JP; West PC 08-20, consoles 10-29 | Siliconera: Aug 20, 2026 in Japan on all listed platforms. RPGSite: in the West, PC is Aug 20 and consoles (including the delayed Xbox) are Oct 29. | VERIFIED |
| 15 | ~1% field boundary (`gl-divergence-barrier`, `dsp-barrier-size`) | 1%; CONFIRMED | The Wikipedia episode list mentions the 1% divergence. wiki.gg Alpha gives Alpha as 0.000000–0.999999 and Suzuha's 1% goal. Fandom Attractor Field gives ranges only, with no explicit crossing rule. | VERIFIED |
| 16 | D-Mail naming (`gl-dmail`) | "coined by Daru (VN) / Mayuri (anime)" | Fandom D-Mail: in the VN Daru coins "DeLorean Mail", in the anime Mayuri names it, and Kurisu shortens it to "D-Mail". Wikipedia credits only the group (ep 6). | CORRECTED (wording clarified) |
| 17 | Lab Mem numbers (`characters[].labMemberNumber`) | 001 Okabe, 002 Mayuri, 003 Daru, 004 Kurisu (INTERP.), 005 Moeka, 006 Luka (INTERP.), 007 Faris, 008 Suzuha, 010 Kagari (INTERP.) | The Fandom pages for Mayuri, Daru, Moeka, Faris and Suzuha state their numbers. The Fandom Kurisu and Luka pages state none, and the Fandom FGL page gives a join order consistent with 004/006. | VERIFIED (as stored, tags appropriate) |
| 18 | First rescue: Okabe stabs Kurisu (`ev-0728-rescue-attempt-1`) | CONFIRMED | The Wikipedia ep 23 summary says Okabe accidentally stabs her himself and Nakabachi flees with her theory. | VERIFIED |

Residual notes (no edit): several Alpha world lines cite `src-wp-episodes`, which supports the events but not the digits. The digits rest on wiki.gg Alpha and Fandom D-Mail, two independent wikis.
