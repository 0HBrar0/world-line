# Sources

**Total distinct source URLs: 106** (extracted verbatim from all six research-notes files and deduplicated; checked by script that every URL in the notes appears here and nothing else does).

- By tier: Tier 1 = 1, Tier 2 = 89, Tier 3 = 16.
- By status: fetched = 87, partial (title/snippet only) = 7, wrong content returned = 3, failed = 4, search-only = 5.
- Three URL pairs probably point to the same page (Wikipedia `Steins;Gate_(visual_novel)` / `Steins;Gate_(video_game)`; wiki.gg `Beta_Attractor_Field` / `Attractor_Field/Beta_(β)`; wiki.gg `Time_Machine` / `FG204`), so there are about 103 distinct pages. They are kept separate because different notes cited different URLs. Treat each pair as **one** source when judging independence.
- **No official publisher source** (MAGES., Spike Chunsoft, steinsgate0.jp, Crunchyroll) was consulted. Tier 1 contains only an unofficial fan transcript of the VN text.
- `canon.json` ids are given in backticks; "cited N×" counts how many fact objects in `data/canon.json` reference the source. Sources marked FAILED or SEARCH RESULT ONLY are cited **0 times** by design, and the validator enforces this.
- Independence warning: the Fandom *Reading Steiner* page cites the votuko PDF as its main reference, so agreement between the two is **not** independent confirmation. Two pages of the same wiki also count as one source.

Companion file: `research/canon-notes.md` (narrative write-up from a separate writer). Open questions and gaps: `docs/open-questions.md`.

## Tier 1: Primary / official

- **Let's Play Archive: Steins;Gate, Update 79 (VN scene transcript)**: <https://lparchive.org/SteinsGate/Update%2079>  
  `src-lparchive-sg-79` · status: fetched · cited 1× in canon.json  
  *Used for:* VN scene in which Daru gives LHC numbers, Kurisu explains the microwave as a particle accelerator, mini black holes becoming Kerr black holes, data compression and the 36-byte limit.  
  *Caveat:* Unofficial fan transcript of the VN text, the closest thing to primary text in the notes. Paraphrase only; never copy.  
  *Notes file(s):* worldline_theory.md

## Tier 2: Reputable references (Wikipedia, fan wikis, databases, games press)

### Wikipedia

- **Wikipedia: Steins;Gate (visual novel)**: <https://en.wikipedia.org/wiki/Steins;Gate_(visual_novel)>  
  `src-wp-sg-vn` · status: fetched · cited 45× in canon.json  
  *Used for:* Release dates and developers, D-Mail and time-leap basics, 1.048596% as Steins Gate, the VN endings, Faris ending 'beyond 1%', phone trigger, Reading Steiner's unexplained origin.  
  *Caveat:* Probably the same article as src-wp-sg-video-game (different URL used by different researchers).  
  *Notes file(s):* worldline_theory.md, main_story_chronology.md
- **Wikipedia: Steins;Gate (video game)**: <https://en.wikipedia.org/wiki/Steins;Gate_(video_game)>  
  `src-wp-sg-video-game` · status: fetched · cited 71× in canon.json  
  *Used for:* PhoneWave, D-Mail definition, IBN 5100 role, SERN based on CERN, Moeka's group kills Mayuri, Suzuha = Titor, character roles, writers, platforms, inspirations, sales, Elite.  
  *Caveat:* Probably the same article as src-wp-sg-vn.  
  *Notes file(s):* devices_and_organizations.md, characters_and_works.md
- **Wikipedia: List of Steins;Gate episodes**: <https://en.wikipedia.org/wiki/List_of_Steins;Gate_episodes>  
  `src-wp-episodes` · status: fetched · cited 137× in canon.json  
  *Used for:* Episode-by-episode plot: first D-Mail (ep 1), gel bananas, CRT lifter (ep 11), Time Leap Machine and raid (ep 12), convergence (eps 13-21), Titor reveal (ep 14), meter (ep 15), letter (ep 16), FB (eps 19-20), SERN deletion (ep 22), eps 23-24, ep 23-beta, OVA, air dates.  
  *Caveat:* Some notes report the ep 24 'blood' wording differently (own blood vs light-up-sword liquid); see disputes.  
  *Notes file(s):* worldline_theory.md, devices_and_organizations.md, main_story_chronology.md, disputes_and_adaptation_differences.md
- **Wikipedia URL 'Steins;Gate_0' (returned original Steins;Gate article content)**: <https://en.wikipedia.org/wiki/Steins;Gate_0>  
  `src-wp-sg0-url` · status: WRONG CONTENT returned · cited 7× in canon.json  
  *Used for:* Used only for ORIGINAL Steins;Gate facts its returned text contained: failed rescue, Beta return, cast losing memories, 1.048596%, original VN endings, S;G 0 release dates, alternate ep 23 date.  
  *Caveat:* The fetch did NOT return the Steins;Gate 0 article. Do not cite it for S;G 0 plot specifics. A '%3B' variant of the URL failed entirely.  
  *Notes file(s):* worldline_theory.md, devices_and_organizations.md, steins_gate_0_branch.md, disputes_and_adaptation_differences.md
- **Wikipedia URL for the 2013 film (returned VN plot text)**: <https://en.wikipedia.org/wiki/Steins;Gate:_The_Movie_%E2%88%92_Load_Region_of_D%C3%A9j%C3%A0_Vu>  
  `src-wp-film-url` · status: WRONG CONTENT returned · cited 0× in canon.json  
  *Used for:* Used only for VN plot text it returned: Faris-ending memory loss, Kurisu retaining some memories.  
  *Caveat:* Did NOT return the film article. Supports nothing about the film itself.  
  *Notes file(s):* worldline_theory.md
- **Wikipedia: Rintaro Okabe**: <https://en.wikipedia.org/wiki/Rintaro_Okabe>  
  `src-wp-okabe` · status: fetched · cited 2× in canon.json  
  *Used for:* Kurisu's deja vu on the Steins Gate line; reinvented meter in Robotics;Notes DaSH glitching around 1.048596; S;G 0 Okabe's trauma.  
  *Notes file(s):* worldline_theory.md
- **Wikipedia: List of Steins;Gate 0 episodes**: <https://en.wikipedia.org/wiki/List_of_Steins;Gate_0_episodes>  
  `src-wp-sg0-episodes` · status: fetched · cited 40× in canon.json  
  *Used for:* S;G 0 anime: Amadeus (eps 1-2), Leskinen/Stratfor (ep 18), Kagari separated in 1998, laptop destroyed (ep 11), DURPA missile and WWIII (ep 19), TLM rebuilt (ep 19), D-RINE erases Amadeus (ep 22), 2025 video D-Mail and 18,000 BC rescue (ep 23), air dates, OVA.  
  *Caveat:* The disputes notes list it as 'surfaced in search but not fetched'; the devices and S;G 0 notes fetched and used it.  
  *Notes file(s):* devices_and_organizations.md, steins_gate_0_branch.md, disputes_and_adaptation_differences.md
- **Wikipedia: John Titor (real-world internet persona)**: <https://en.wikipedia.org/wiki/John_Titor>  
  `src-wp-john-titor` · status: fetched · cited 4× in canon.json  
  *Used for:* Real-world Titor timeline (1998 fax, 2000-2001 posts), IBM 5100 claim, machine description (Corvette), hoax investigation, Steins;Gate's use of the legend.  
  *Notes file(s):* devices_and_organizations.md, characters_and_works.md
- **Wikipedia: Steins;Gate (franchise)**: <https://en.wikipedia.org/wiki/Steins;Gate_(franchise)>  
  `src-wp-franchise` · status: fetched · cited 10× in canon.json  
  *Used for:* Film (Apr 20, 2013), Linear Bounded Phenogram, My Darling's Embrace (non-canon), Elite, ep 23-beta leading into S;G 0.  
  *Notes file(s):* steins_gate_0_branch.md
- **Wikipedia: Steins;Gate**: <https://en.wikipedia.org/wiki/Steins;Gate>  
  `src-wp-sg` · status: fetched · cited 15× in canon.json  
  *Used for:* Franchise release history, spin-off canon labels, anime, film, manga, Octet, inspirations.  
  *Notes file(s):* characters_and_works.md
- **Wikipedia: Steins;Gate 0 (TV series)**: <https://en.wikipedia.org/wiki/Steins;Gate_0_(TV_series)>  
  `src-wp-sg0-tv` · status: fetched · cited 2× in canon.json  
  *Used for:* S;G 0 VN Japan date Dec 10, 2015 (moved from Nov 19); alternate ep 23 on Dec 2, 2015.  
  *Notes file(s):* characters_and_works.md
- **Wikipedia: Steins;Gate (TV series)**: <https://en.wikipedia.org/wiki/Steins;Gate_(TV_series)>  
  `src-wp-sg-tv` · status: fetched · cited 6× in canon.json  
  *Used for:* Anime dates, ep 23-beta, OVA (Feb 22, 2012), film release, music, Elite's new animation for routes not in the anime.  
  *Notes file(s):* disputes_and_adaptation_differences.md
- **Wikipedia URL 'List of Steins;Gate characters' (returned S;G 0 anime episode summaries)**: <https://en.wikipedia.org/wiki/List_of_Steins;Gate_characters>  
  `src-wp-characters-url` · status: WRONG CONTENT returned · cited 7× in canon.json  
  *Used for:* Low-confidence S;G 0 per-character plot points (Okabe brain-dead by 2036, Luka dies in 2036, Amadeus built ~8 months before Kurisu's death, Alpha-line Kurisu's D-Mail).  
  *Caveat:* Returned an episode-summary-like text, not the character list. Facts from it are tagged INTERPRETATION or UNCLEAR.  
  *Notes file(s):* characters_and_works.md

### Steins;Gate Fandom wiki (steins-gate.fandom.com)

- **Steins;Gate Fandom wiki: Attractor Field**: <https://steins-gate.fandom.com/wiki/Attractor_Field>  
  `src-fandom-attractor-field` · status: fetched · cited 45× in canon.json  
  *Used for:* Attractor-field definition and ranges, Alpha/Beta outcomes, Steins Gate as an exception between fields, spin-off fields (Gamma, Delta, Epsilon, Omega, Chi), S;G 0 mostly in Beta.  
  *Caveat:* Fan-edited.  
  *Notes file(s):* worldline_theory.md, disputes_and_adaptation_differences.md
- **Steins;Gate Fandom wiki: Reading Steiner**: <https://steins-gate.fandom.com/wiki/Reading_Steiner>  
  `src-fandom-reading-steiner` · status: fetched · cited 29× in canon.json  
  *Used for:* Reading Steiner trigger, sensation, non-triggers; partial recall in others; S;G 0 encephalitis and President's Disease; film role.  
  *Caveat:* Cites the votuko PDF as its main mechanics reference [1], so agreement with votuko is not independent.  
  *Notes file(s):* worldline_theory.md, characters_and_works.md, disputes_and_adaptation_differences.md
- **Steins;Gate Fandom wiki: Divergence Meter**: <https://steins-gate.fandom.com/wiki/Divergence_Meter>  
  `src-fandom-divergence-meter` · status: fetched · cited 15× in canon.json  
  *Used for:* Meter builder and custody chain, gravitational-variation claim, display limits (6 decimals, no negatives), only Okabe can use it, spin-off superposition.  
  *Caveat:* Fan-edited.  
  *Notes file(s):* worldline_theory.md
- **Steins;Gate Fandom wiki: D-Mail**: <https://steins-gate.fandom.com/wiki/D-Mail>  
  `src-fandom-dmail` · status: fetched · cited 73× in canon.json  
  *Used for:* Full D-Mail table (senders, targets, dates, divergence before/after), 36-byte limit, CRT electrons, reconstruction model, D-RINE, naming difference (Daru vs Mayuri), Arc-Light value difference.  
  *Caveat:* Its table contains some odd entries (e.g. Faris cancellation row 'not stated'); single wiki for dates.  
  *Notes file(s):* devices_and_organizations.md, main_story_chronology.md, characters_and_works.md
- **Steins;Gate Fandom wiki: Timeline**: <https://steins-gate.fandom.com/wiki/Timeline>  
  `src-fandom-timeline` · status: fetched · cited 28× in canon.json  
  *Used for:* Dated Alpha/Beta/Steins Gate events (Aug 1-21, 2010), raid on Aug 13, Beta deletion Aug 17, epilogue late September.  
  *Caveat:* Single wiki for most dates; labels the July 28 Beta state '1.129848' (conflicts with other sources).  
  *Notes file(s):* main_story_chronology.md
- **Steins;Gate Fandom wiki: Operation Skuld**: <https://steins-gate.fandom.com/wiki/Operation_Skuld>  
  `src-fandom-operation-skuld` · status: fetched · cited 16× in canon.json  
  *Used for:* Skuld steps, video D-Mail, Aug 21 return, Norn naming scheme, Metal Upa, Cyalume Saber liquid, 15 years of planning.  
  *Caveat:* Fan-edited.  
  *Notes file(s):* devices_and_organizations.md, main_story_chronology.md
- **Steins;Gate Fandom wiki: Steins Gate World Line**: <https://steins-gate.fandom.com/wiki/Steins_Gate_World_Line>  
  `src-fandom-sg-world-line` · status: fetched · cited 8× in canon.json  
  *Used for:* 'Between Alpha and Beta'; Metal Upa swap; thesis burned on the plane; film memory-implant; Anonymous;Code meter trivia.  
  *Caveat:* Fan-edited.  
  *Notes file(s):* main_story_chronology.md, disputes_and_adaptation_differences.md
- **Steins;Gate Fandom wiki: Suzuha Amane**: <https://steins-gate.fandom.com/wiki/Suzuha_Amane>  
  `src-fandom-suzuha` · status: fetched · cited 26× in canon.json  
  *Used for:* Suzuha = Titor (Alpha), Lab Mem 008, Suzu Hashida, fates per line, Mayuri's Aug 13 Alpha death, seven-years badge, FG204 in both fields, VN Suzuha ending.  
  *Caveat:* Fan-edited.  
  *Notes file(s):* main_story_chronology.md, characters_and_works.md, disputes_and_adaptation_differences.md
- **Steins;Gate Fandom wiki: Time Leap Machine**: <https://steins-gate.fandom.com/wiki/Time_Leap_Machine>  
  `src-fandom-tlm` · status: fetched · cited 18× in canon.json  
  *Used for:* Builders, mechanism, 48-hour safe limit and reason, two-week S;G 0 upgrade, phone requirements, other users.  
  *Caveat:* Fan-edited.  
  *Notes file(s):* devices_and_organizations.md, disputes_and_adaptation_differences.md
- **Steins;Gate Fandom wiki: John Titor**: <https://steins-gate.fandom.com/wiki/John_Titor>  
  `src-fandom-john-titor` · status: fetched · cited 9× in canon.json  
  *Used for:* Suzuha = Titor, FG204 as Daru's signature, Alpha vs Beta Titor appearances, real-Titor machine description (Camaro claim).  
  *Caveat:* Its Camaro claim conflicts with Wikipedia (Corvette).  
  *Notes file(s):* devices_and_organizations.md
- **Steins;Gate Fandom wiki: Amadeus**: <https://steins-gate.fandom.com/wiki/Amadeus>  
  `src-fandom-amadeus` · status: fetched · cited 9× in canon.json  
  *Used for:* Amadeus definition, Viktor Chondria University, Leskinen and Maho, Visual Rebuilding, Mozart name.  
  *Caveat:* Fan-edited.  
  *Notes file(s):* devices_and_organizations.md, characters_and_works.md
- **Steins;Gate Fandom wiki: Rounders**: <https://steins-gate.fandom.com/wiki/Rounders>  
  `src-fandom-rounders` · status: fetched · cited 2× in canon.json  
  *Used for:* Rounders as mercenaries separate from SERN taking FB's orders; Moeka leads the assault team (ep 12).  
  *Caveat:* Fan-edited.  
  *Notes file(s):* devices_and_organizations.md
- **Steins;Gate Fandom wiki: SERN**: <https://steins-gate.fandom.com/wiki/SERN>  
  `src-fandom-sern` · status: fetched · cited 5× in canon.json  
  *Used for:* CERN analogue, Committee of 300, Z Program, ECHELON, 2036 dystopia description, S;G 0 laptop raid.  
  *Caveat:* Fan-edited.  
  *Notes file(s):* devices_and_organizations.md
- **Steins;Gate Fandom wiki: Future Gadget Laboratory**: <https://steins-gate.fandom.com/wiki/Future_Gadget_Laboratory>  
  `src-fandom-fgl` · status: fetched · cited 15× in canon.json  
  *Used for:* Lab location above the Braun Tube Workshop, member join order, Yuki as promo-only Lab Mem.  
  *Caveat:* Number grid 002-011 shown without names.  
  *Notes file(s):* characters_and_works.md
- **Steins;Gate Fandom wiki: Rintaro Okabe**: <https://steins-gate.fandom.com/wiki/Rintaro_Okabe>  
  `src-fandom-okabe` · status: fetched · cited 8× in canon.json  
  *Used for:* Okabe's names, Lab Mem 001, S;G 0 state, VN vs anime notes.  
  *Caveat:* Fan-edited.  
  *Notes file(s):* characters_and_works.md
- **Steins;Gate Fandom wiki: Kurisu Makise**: <https://steins-gate.fandom.com/wiki/Kurisu_Makise>  
  `src-fandom-kurisu` · status: fetched · cited 9× in canon.json  
  *Used for:* Kurisu's names and nicknames, affiliations, relationships, VN vs anime notes.  
  *Caveat:* Contains inconsistent age statements.  
  *Notes file(s):* characters_and_works.md
- **Steins;Gate Fandom wiki: Mayuri Shiina**: <https://steins-gate.fandom.com/wiki/Mayuri_Shiina>  
  `src-fandom-mayuri` · status: fetched · cited 7× in canon.json  
  *Used for:* Mayuri Lab Mem 002, 'Tutturu', the 'hostage' backstory, Kagari adoption, her wish.  
  *Caveat:* The chronology notes say this page gave no usable content on their fetch; the characters notes used it successfully.  
  *Notes file(s):* main_story_chronology.md, characters_and_works.md
- **Steins;Gate Fandom wiki: Itaru Hashida**: <https://steins-gate.fandom.com/wiki/Itaru_Hashida>  
  `src-fandom-daru` · status: fetched · cited 12× in canon.json  
  *Used for:* Daru Lab Mem 003, wife and daughter, builds Suzuha's time machine, Alpha future fate.  
  *Caveat:* Fan-edited.  
  *Notes file(s):* characters_and_works.md
- **Steins;Gate Fandom wiki: Luka Urushibara**: <https://steins-gate.fandom.com/wiki/Luka_Urushibara>  
  `src-fandom-luka` · status: fetched · cited 8× in canon.json  
  *Used for:* Luka's names, 'Lukako', D-Mail effect, Luka VN ending.  
  *Caveat:* Fan-edited.  
  *Notes file(s):* characters_and_works.md
- **Steins;Gate Fandom wiki: Faris NyanNyan**: <https://steins-gate.fandom.com/wiki/Faris_NyanNyan>  
  `src-fandom-faris` · status: fetched · cited 8× in canon.json  
  *Used for:* Rumiho Akiha, Lab Mem 007, father Yukitaka.  
  *Caveat:* The fetch summary garbled Faris's D-Mail; the D-Mail table version is preferred.  
  *Notes file(s):* characters_and_works.md
- **Steins;Gate Fandom wiki: Moeka Kiryu**: <https://steins-gate.fandom.com/wiki/Moeka_Kiryu>  
  `src-fandom-moeka` · status: fetched · cited 14× in canon.json  
  *Used for:* Moeka Lab Mem 005, 'Shining Finger', Rounder under FB, fates, a 'Gamma' world line mention.  
  *Caveat:* Fan-edited.  
  *Notes file(s):* characters_and_works.md
- **Steins;Gate Fandom wiki: Yugo Tennouji**: <https://steins-gate.fandom.com/wiki/Yugo_Tennouji>  
  `src-fandom-yugo` · status: fetched · cited 19× in canon.json  
  *Used for:* Mr. Braun = FB (Ferdinand Braun), relationship to Suzu Hashida, VN vs anime death, S;G 0 status.  
  *Caveat:* Internally inconsistent about his S;G 0 Rounder status.  
  *Notes file(s):* characters_and_works.md
- **Steins;Gate Fandom wiki: Nae Tennouji**: <https://steins-gate.fandom.com/wiki/Nae_Tennouji>  
  `src-fandom-nae` · status: fetched · cited 3× in canon.json  
  *Used for:* Nae, 'Vengeful Nae' alternate arc, Robotics;Notes cameo, Yugo's family.  
  *Caveat:* Fan-edited.  
  *Notes file(s):* characters_and_works.md
- **Steins;Gate Fandom wiki: Shouichi Makise (Dr. Nakabachi)**: <https://steins-gate.fandom.com/wiki/Shouichi_Makise>  
  `src-fandom-shouichi` · status: fetched · cited 9× in canon.json  
  *Used for:* Nakabachi as Kurisu's father, thesis theft, fates per line.  
  *Caveat:* Fan-edited.  
  *Notes file(s):* characters_and_works.md
- **Steins;Gate Fandom wiki: Maho Hiyajo**: <https://steins-gate.fandom.com/wiki/Maho_Hiyajo>  
  `src-fandom-maho` · status: fetched · cited 4× in canon.json  
  *Used for:* Maho's role at Viktor Chondria, Amadeus, brainwashing claim.  
  *Caveat:* Fan-edited.  
  *Notes file(s):* characters_and_works.md
- **Steins;Gate Fandom wiki: Kagari Shiina**: <https://steins-gate.fandom.com/wiki/Kagari_Shiina>  
  `src-fandom-kagari` · status: fetched · cited 8× in canon.json  
  *Used for:* Kagari Lab Mem 010, adoption by Mayuri, brainwashing, Kurisu resemblance.  
  *Caveat:* Single source for Lab Mem 010.  
  *Notes file(s):* characters_and_works.md
- **Steins;Gate Fandom wiki: Alexis Leskinen**: <https://steins-gate.fandom.com/wiki/Alexis_Leskinen>  
  `src-fandom-leskinen` · status: fetched · cited 5× in canon.json  
  *Used for:* Leskinen as Kurisu's mentor and secret intelligence agent ('Strategic Focus').  
  *Caveat:* Group name differs from other sources.  
  *Notes file(s):* characters_and_works.md
- **Steins;Gate Fandom wiki: Steins;Gate 0 (returned a Steins;Gate 0 Elite stub)**: <https://steins-gate.fandom.com/wiki/Steins;Gate_0>  
  `src-fandom-sg0` · status: PARTIAL (title/headline/snippet only) · cited 2× in canon.json  
  *Used for:* Steins;Gate 0 Elite announcement (Jan 26, 2020) only.  
  *Caveat:* Returned only an Elite stub, not the S;G 0 article.  
  *Notes file(s):* steins_gate_0_branch.md
- **Steins;Gate Fandom wiki: Phone Microwave (name subject to change)**: <https://steins-gate.fandom.com/wiki/Phone_Microwave_(name_subject_to_change)>  
  `src-fandom-phonewave-a` · status: FAILED, supports nothing · cited 0× in canon.json  
  *Used for:* Nothing (fetch failed).  
  *Caveat:* Client error on fetch; supports nothing.  
  *Notes file(s):* devices_and_organizations.md
- **Steins;Gate Fandom wiki: Phonewave (name subject to change)**: <https://steins-gate.fandom.com/wiki/Phonewave_(name_subject_to_change)>  
  `src-fandom-phonewave-b` · status: FAILED, supports nothing · cited 0× in canon.json  
  *Used for:* Nothing (fetch failed).  
  *Caveat:* Client error on fetch; supports nothing.  
  *Notes file(s):* devices_and_organizations.md
- **Steins;Gate Fandom wiki: Time Machine**: <https://steins-gate.fandom.com/wiki/Time_Machine>  
  `src-fandom-time-machine` · status: FAILED, supports nothing · cited 0× in canon.json  
  *Used for:* Nothing (fetch failed).  
  *Caveat:* Client error on fetch; supports nothing.  
  *Notes file(s):* devices_and_organizations.md
- **Steins;Gate Fandom wiki: Committee of 300**: <https://steins-gate.fandom.com/wiki/Committee_of_300>  
  `src-fandom-committee-300` · status: FAILED, supports nothing · cited 0× in canon.json  
  *Used for:* Nothing (fetch failed).  
  *Caveat:* Client error on fetch; supports nothing.  
  *Notes file(s):* devices_and_organizations.md

### Science Adventure wiki (scienceadventure.wiki.gg)

- **Science Adventure wiki: Alpha Attractor Field**: <https://scienceadventure.wiki.gg/wiki/Alpha_Attractor_Field>  
  `src-wikigg-alpha` · status: fetched · cited 59× in canon.json  
  *Used for:* Every core Alpha divergence value with its cause and VN chapter / anime episode mapping; spin-off Alpha values; 0.000000; Suzuha's 1% goal.  
  *Caveat:* The disputes notes list it as 'surfaced in search but not fetched'; the theory and chronology notes fetched and used it.  
  *Notes file(s):* worldline_theory.md, main_story_chronology.md, disputes_and_adaptation_differences.md
- **Science Adventure wiki: Beta Attractor Field**: <https://scienceadventure.wiki.gg/wiki/Beta_Attractor_Field>  
  `src-wikigg-beta` · status: fetched · cited 40× in canon.json  
  *Used for:* All Beta values (1.130426/1.130246 prologue, 1.130205, 1.130209, 1.130212, 1.130238, S;G 0 values), Kurisu's death, WWIII.  
  *Caveat:* Probably the same page as src-wikigg-beta-table (different URL).  
  *Notes file(s):* worldline_theory.md, main_story_chronology.md
- **Science Adventure wiki: Attractor Field/Beta (beta) table**: <https://scienceadventure.wiki.gg/wiki/Attractor_Field/Beta_(%CE%B2)>  
  `src-wikigg-beta-table` · status: fetched · cited 38× in canon.json  
  *Used for:* Full Beta table mapping values to works, including S;G 0 VN chapters, S;G 0 anime eps 8/22/23 and spin-offs.  
  *Caveat:* Probably the same page as src-wikigg-beta.  
  *Notes file(s):* steins_gate_0_branch.md
- **Science Adventure wiki: World Line**: <https://scienceadventure.wiki.gg/wiki/World_Line>  
  `src-wikigg-world-line` · status: fetched · cited 13× in canon.json  
  *Used for:* World-line definition, one active line, first digit as a 'rule of thumb', superposed values in spin-offs.  
  *Caveat:* Page tagged 'Inconsistent sources'; does not list 1.130205 or 1.130426.  
  *Notes file(s):* worldline_theory.md, disputes_and_adaptation_differences.md
- **Science Adventure wiki: Steins Gate World Line**: <https://scienceadventure.wiki.gg/wiki/Steins_Gate_World_Line>  
  `src-wikigg-sg-world-line` · status: fetched · cited 12× in canon.json  
  *Used for:* 1.048596, creator pun, guidebooks list it without a field symbol, 'independent field' vs 'between' wording, reached through countless attempts.  
  *Caveat:* Internally inconsistent on whether it is an independent field.  
  *Notes file(s):* worldline_theory.md, main_story_chronology.md, steins_gate_0_branch.md, disputes_and_adaptation_differences.md
- **Science Adventure wiki: Attractor Field**: <https://scienceadventure.wiki.gg/wiki/Attractor_Field>  
  `src-wikigg-attractor-field` · status: fetched · cited 10× in canon.json  
  *Used for:* Convergence rules, 'percent difference' meaning, no-parallel-universes explanation, 2021 meter date, Major Divergence rule.  
  *Caveat:* Some claims marked 'citation needed' on the page itself.  
  *Notes file(s):* worldline_theory.md
- **Science Adventure wiki: Divergence Meter**: <https://scienceadventure.wiki.gg/wiki/Divergence_Meter>  
  `src-wikigg-divergence-meter` · status: fetched · cited 6× in canon.json  
  *Used for:* Six decimals, Shikura's 'seven digits' quote, 2021 vs pre-2020 invention conflict, Anonymous;Code 'special talent'.  
  *Caveat:* Creator quote seen only through the wiki.  
  *Notes file(s):* worldline_theory.md
- **Science Adventure wiki: Reading Steiner**: <https://scienceadventure.wiki.gg/wiki/Reading_Steiner>  
  `src-wikigg-reading-steiner` · status: fetched · cited 11× in canon.json  
  *Used for:* Definition, 'Magic Eye', age-8 fever, triggers and sensation, S;G 0 encephalitis cases, Suzuha's envy.  
  *Caveat:* Fan-edited.  
  *Notes file(s):* worldline_theory.md
- **Science Adventure wiki: Time Machine**: <https://scienceadventure.wiki.gg/wiki/Time_Machine>  
  `src-wikigg-time-machine` · status: fetched · cited 10× in canon.json  
  *Used for:* Kerr black hole control, 1.130209 -> 1.130212 per trip, 1.382733 as Russia's time machine, FG204 details.  
  *Caveat:* Probably the same page as src-wikigg-fg204; page tagged 'inconsistent sources'.  
  *Notes file(s):* worldline_theory.md
- **Science Adventure wiki: Time Machine / FG204**: <https://scienceadventure.wiki.gg/wiki/FG204>  
  `src-wikigg-fg204` · status: fetched · cited 34× in canon.json  
  *Used for:* FG204/C204/C203/C193/OR204 designations, builders, Radio Kaikan location, fuel, one-way limit, trip logs, SERN's 2034 machine, Altair, S;G 0 VN vs anime differences.  
  *Caveat:* Page tagged 'inconsistent sources'; states both 1998 and 2000, and both 11:15 and 11:50, for Beta trips.  
  *Notes file(s):* devices_and_organizations.md
- **Science Adventure wiki: PhoneWave**: <https://scienceadventure.wiki.gg/wiki/PhoneWave>  
  `src-wikigg-phonewave` · status: fetched · cited 15× in canon.json  
  *Used for:* Future Gadget No. 8, components, 2.45 GHz, Kerr/naked singularity, CRT lifter, '#' activation, discovery dates, 3 x 12-byte split, one-hour increments, gelification.  
  *Caveat:* Single wiki for most specs.  
  *Notes file(s):* worldline_theory.md, devices_and_organizations.md
- **Science Adventure wiki: Time Leap Machine**: <https://scienceadventure.wiki.gg/wiki/Time_Leap_Machine>  
  `src-wikigg-tlm` · status: fetched · cited 14× in canon.json  
  *Used for:* Aug 13, 2010 completion (manga caption), 3.24 TB, 64 lines, 36 bytes, 0.02 A, memories only, 336-hour extension.  
  *Caveat:* Completion date is from a manga image caption.  
  *Notes file(s):* devices_and_organizations.md
- **Science Adventure wiki: Amane Suzuha**: <https://scienceadventure.wiki.gg/wiki/Amane_Suzuha>  
  `src-wikigg-suzuha` · status: fetched · cited 8× in canon.json  
  *Used for:* Parents, Valkyrie membership, death statuses per field, birthdate, aliases.  
  *Caveat:* Single wiki.  
  *Notes file(s):* devices_and_organizations.md
- **Science Adventure wiki: Valkyrie**: <https://scienceadventure.wiki.gg/wiki/Valkyrie>  
  `src-wikigg-valkyrie` · status: fetched · cited 2× in canon.json  
  *Used for:* Resistance group, members by field and medium, OR204 plan.  
  *Caveat:* Stub page flagged 'inconsistent sources'.  
  *Notes file(s):* devices_and_organizations.md
- **Science Adventure wiki: SERN**: <https://scienceadventure.wiki.gg/wiki/SERN>  
  `src-wikigg-sern` · status: fetched · cited 15× in canon.json  
  *Used for:* Founding, Z Program dates, Jellyman's Report, LHC 2001, ECHELON storage of the first D-Mail, FB as Rounders leader, Alpha future timeline, S;G 0 raid VN/anime difference.  
  *Caveat:* Single wiki for dates and numbers.  
  *Notes file(s):* devices_and_organizations.md
- **Science Adventure wiki: IBN 5100**: <https://scienceadventure.wiki.gg/wiki/IBN_5100>  
  `src-wikigg-ibn5100` · status: fetched · cited 8× in canon.json  
  *Used for:* Specs, hidden language function, shrine donation vs sale, Moeka's theft, Rounder elimination rule, S;G 0 use.  
  *Caveat:* Single wiki for specs.  
  *Notes file(s):* devices_and_organizations.md
- **Science Adventure wiki: Steins;Gate (visual novel)**: <https://scienceadventure.wiki.gg/wiki/Steins;Gate_(visual_novel)>  
  `src-wikigg-sg-vn` · status: fetched · cited 3× in canon.json  
  *Used for:* VN chapter titles and ending route names ('Isolated Jamais Vu', 'Stardust Sky', 'Paradox Meltdown').  
  *Caveat:* Chapters 02 and 05 titles not listed.  
  *Notes file(s):* main_story_chronology.md
- **Science Adventure wiki: Steins;Gate (visual novel)/Plot**: <https://scienceadventure.wiki.gg/wiki/Steins%3BGate_(visual_novel)/Plot>  
  `src-wikigg-sg-vn-plot` · status: fetched · cited 15× in canon.json  
  *Used for:* VN July 28 timestamps (11:43, 12:03, 12:12, 12:26, 12:39, 12:54), first-shift values, arrival-date ambiguity, Ch 02 SERN hack.  
  *Caveat:* Single wiki for the clock times.  
  *Notes file(s):* main_story_chronology.md
- **Science Adventure wiki: D-Mail (stub)**: <https://scienceadventure.wiki.gg/wiki/D-Mail>  
  `src-wikigg-dmail` · status: PARTIAL (title/headline/snippet only) · cited 0× in canon.json  
  *Used for:* Nothing usable (stub).  
  *Caveat:* Stub page; supports nothing.  
  *Notes file(s):* main_story_chronology.md
- **Science Adventure wiki: Alexis Leskinen**: <https://scienceadventure.wiki.gg/wiki/Alexis_Leskinen>  
  `src-wikigg-leskinen` · status: fetched · cited 9× in canon.json  
  *Used for:* Leskinen's affiliations (VCU, 'Stratfoc'), inconsistent fate, VN vs anime difference in Kagari's contact (1998), July 7, 2011 battle.  
  *Caveat:* Stub with several unsourced claims.  
  *Notes file(s):* steins_gate_0_branch.md
- **Science Adventure wiki: Steins;Gate 0 (visual novel)**: <https://scienceadventure.wiki.gg/wiki/Steins;Gate_0_(visual_novel)>  
  `src-wikigg-sg0-vn` · status: fetched · cited 20× in canon.json  
  *Used for:* S;G 0 VN release dates, premise (stab, Aug 21 return), cast, phone-choice mechanic, 1.129848, cut Phantom Route, 'interquel' note.  
  *Caveat:* Gives two Windows WW dates (May 6 and May 8, 2018).  
  *Notes file(s):* steins_gate_0_branch.md
- **Science Adventure wiki: Steins;Gate 0 (visual novel)/Plot**: <https://scienceadventure.wiki.gg/wiki/Steins;Gate_0_(visual_novel)/Plot>  
  `src-wikigg-sg0-vn-plot` · status: fetched · cited 33× in canon.json  
  *Used for:* Nov 23, 2010 UPX seminar, chapter events and divergence values, Kagari/'Kana', Moeka, 2036 visit, Operation Helheim, President Syndrome.  
  *Caveat:* Kagari adoption year differs from the Kagari page.  
  *Notes file(s):* steins_gate_0_branch.md
- **Science Adventure wiki: Steins;Gate 0 (anime)**: <https://scienceadventure.wiki.gg/wiki/Steins;Gate_0_(anime)>  
  `src-wikigg-sg0-anime` · status: fetched · cited 8× in canon.json  
  *Used for:* Episode titles and dates, episode count, 23-beta belongs to the original series, staff adaptation approach.  
  *Notes file(s):* steins_gate_0_branch.md
- **Science Adventure wiki: Shiina Kagari**: <https://scienceadventure.wiki.gg/wiki/Shiina_Kagari>  
  `src-wikigg-kagari` · status: fetched · cited 9× in canon.json  
  *Used for:* Kagari's origin (Valkyrie, war orphan, adopted by Mayuri 2032, named after a bonfire), fates per line, Yuki impersonation.  
  *Caveat:* Internally inconsistent age data.  
  *Notes file(s):* steins_gate_0_branch.md
- **Science Adventure wiki: Steins;Gate 0 (disambiguation)**: <https://scienceadventure.wiki.gg/wiki/Steins;Gate_0>  
  `src-wikigg-sg0-disambig` · status: fetched · cited 2× in canon.json  
  *Used for:* White Fox; Steins;Gate 0 Elite unreleased.  
  *Caveat:* Disambiguation page only.  
  *Notes file(s):* steins_gate_0_branch.md

### Other reference databases and games/anime press

- **MyAnimeList: Steins;Gate: Load Region of Deja Vu (film)**: <https://myanimelist.net/anime/11577>  
  `src-mal-film` · status: fetched · cited 1× in canon.json  
  *Used for:* Film synopsis (Okabe's flashes, vanishing, Kurisu's deja vu), White Fox, April 20, 2013, ~90 min.  
  *Caveat:* User-maintained database.  
  *Notes file(s):* worldline_theory.md
- **MyAnimeList: Steins;Gate episode 23**: <https://myanimelist.net/anime/9253/Steins_Gate/episode/23>  
  `src-mal-ep23` · status: fetched · cited 4× in canon.json  
  *Used for:* Ep 23 synopsis: Okabe bumps into Kurisu (the '15 minutes earlier' loop), video D-Mail, Nakabachi to Russia.  
  *Caveat:* User-maintained database.  
  *Notes file(s):* main_story_chronology.md
- **MyAnimeList: Kurisu Makise (character)**: <https://myanimelist.net/character/35252>  
  `src-mal-kurisu` · status: PARTIAL (title/headline/snippet only) · cited 1× in canon.json  
  *Used for:* Search snippet only: age 18 (Steins;Gate), 19 (Steins;Gate 0).  
  *Caveat:* Search snippet only; page not fetched.  
  *Notes file(s):* characters_and_works.md
- **IMDb plot summary, title tt2156203 (final-arc episode)**: <https://imdb.com/title/tt2156203/plotsummary>  
  `src-imdb-tt2156203` · status: fetched · cited 3× in canon.json  
  *Used for:* 2025 future-Okabe video, Operation Skuld instructions, deceiving the past self, ~5.7 billion WWIII deaths.  
  *Caveat:* User-written plot summary; single source for the 5.7 billion figure.  
  *Notes file(s):* worldline_theory.md
- **IMDb plot summary, title tt2156197 (mid-series episode)**: <https://www.imdb.com/title/tt2156197/plotsummary>  
  `src-imdb-tt2156197` · status: fetched · cited 2× in canon.json  
  *Used for:* '1% divergence barrier', IBN 5100 / SERN hack plan, reverse-order undoing, Rounders killing Mayuri after her watch stops.  
  *Caveat:* User-written plot summary.  
  *Notes file(s):* worldline_theory.md
- **Anime News Network (Aug 6, 2015): 'Get Steins;Gate Divergence Meter as a Nixie Tube Clock'**: <https://www.animenewsnetwork.com/interest/2015-08-06/get-steins-gate-divergence-meter-as-a-nixie-tube-clock/.91352>  
  `src-ann-meter-clock` · status: PARTIAL (title/headline/snippet only) · cited 0× in canon.json  
  *Used for:* Title only: existence of real-world Nixie-tube meter merchandise.  
  *Caveat:* Fetch failed; title seen in search results only. Supports nothing beyond the title.  
  *Notes file(s):* worldline_theory.md
- **Anime News Network (Dec 14, 2017): Steins;Gate 0 TV anime April premiere**: <https://cdn02.animenewsnetwork.com/news/2017-12-14/steins-gate-0-tv-anime-promo-video-reveals-april-premiere-date/.125277>  
  `src-ann-sg0-anime-2017` · status: fetched · cited 2× in canon.json  
  *Used for:* S;G 0 anime April 2018, staff; S;G 0 game JP Dec 2015 / West Nov 2016.  
  *Notes file(s):* characters_and_works.md
- **Anime News Network (Dec 10, 2019): My Darling's Embrace and S;G 0 Western releases**: <https://cdn.animenewsnetwork.com/news/2019-12-10/steins-gate-my-darling-embrace-steins-gate-0-games-get-new-western-releases/.154198>  
  `src-ann-mde-2019` · status: fetched · cited 2× in canon.json  
  *Used for:* My Darling's Embrace = Hiyoku Renri no Darling; port history; S;G 0 Switch West.  
  *Notes file(s):* characters_and_works.md
- **Gematsu (Jun 5, 2026): Steins;Gate Re:Boot introduces additional 'Gamma Worldline' route**: <https://gematsu.com/2026/06/steinsgate-reboot-introduces-additional-gamma-worldline-route>  
  `src-gematsu-reboot-gamma` · status: fetched · cited 6× in canon.json  
  *Used for:* Gamma Worldline route content; Re:Boot JP/West dates.  
  *Notes file(s):* characters_and_works.md
- **Gematsu (Dec 10, 2019): My Darling's Embrace now available in the West**: <https://gematsu.com/2019/12/steinsgate-my-darlings-embrace-now-available-for-ps4-switch-and-pc-in-the-west>  
  `src-gematsu-mde-2019` · status: fetched · cited 2× in canon.json  
  *Used for:* My Darling's Embrace Western release Dec 10, 2019; 'What if?' romcom.  
  *Notes file(s):* characters_and_works.md
- **Siliconera (Nov 10, 2016): Steins;Gate 0's new cast members introduced**: <https://www.siliconera.com/steinsgate-0s-new-cast-members-introduced/>  
  `src-siliconera-sg0-cast` · status: fetched · cited 24× in canon.json  
  *Used for:* S;G 0 new cast: Maho, Leskinen, Kagari, Judy Reyes, Katsumi Nakase, Kaede Kurushima, Yuki Amane.  
  *Notes file(s):* characters_and_works.md
- **Siliconera (May 7, 2026): Steins;Gate Re:Boot remake arrives in August**: <https://www.siliconera.com/steinsgate-reboot-remake-arrives-in-august/>  
  `src-siliconera-reboot-aug` · status: fetched · cited 1× in canon.json  
  *Used for:* Re:Boot Japan release Aug 20, 2026; English subtitles in JP version.  
  *Notes file(s):* characters_and_works.md
- **Siliconera: Amadeus influences Steins;Gate 0 endings**: <https://www.siliconera.com/amadeus-influences-steinsgate-0-endings/>  
  `src-siliconera-amadeus-endings` · status: SEARCH RESULT ONLY, not fetched, supports nothing · cited 0× in canon.json  
  *Used for:* Nothing (surfaced in search, not used).  
  *Caveat:* Not fetched; supports nothing.  
  *Notes file(s):* steins_gate_0_branch.md
- **RPG Site: Steins;Gate Re:Boot Xbox release delayed to October**: <https://www.rpgsite.net/news/21086-steins-gate-reboot-xbox-release-date-delayed-october>  
  `src-rpgsite-xbox-delay` · status: fetched · cited 2× in canon.json  
  *Used for:* Re:Boot Western Xbox delay to Oct 29, 2026.  
  *Notes file(s):* characters_and_works.md
- **RPG Site: Steins;Gate Re:Boot English physical release**: <https://www.rpgsite.net/news/20456-steins-gate-reboot-english-physical-release-steelbook-preorder>  
  `src-rpgsite-reboot-dates` · status: fetched · cited 4× in canon.json  
  *Used for:* Re:Boot release dates and content changes.  
  *Notes file(s):* characters_and_works.md
- **RPGamer (Aug 2026): Adventure Corner, Steins;Gate Re:Boot**: <https://rpgamer.com/2026/08/adventure-corner-steinsgate-reboot/>  
  `src-rpgamer-reboot` · status: fetched · cited 3× in canon.json  
  *Used for:* Re:Boot review; MAGES./Chiyomaru Studio; Aug 19 / Oct 28 dates; new scene linking to S;G 0.  
  *Caveat:* Gives dates one day earlier than other sources (likely time zone).  
  *Notes file(s):* characters_and_works.md
- **Automaton: Steins;Gate Re:Boot postponed to 2026 (headline)**: <https://automaton-media.com/en/news/steinsgate-reboot-postponed-for-2026-new-artwork-and-gameplay-stills-revealed-more-details-coming-this-november/>  
  `src-automaton-reboot` · status: PARTIAL (title/headline/snippet only) · cited 1× in canon.json  
  *Used for:* Headline only: Re:Boot delayed to 2026.  
  *Caveat:* Headline only.  
  *Notes file(s):* characters_and_works.md
- **Nintendo Wire (Sep 26, 2018): Steins;Gate Elite launching Feb 19 in NA/EU**: <https://nintendowire.com/news/2018/09/26/steinsgate-elite-launching-february-19-in-north-america-and-europe/>  
  `src-nintendowire-elite` · status: fetched · cited 2× in canon.json  
  *Used for:* Elite Western release Feb 19, 2019.  
  *Notes file(s):* characters_and_works.md
- **Gamer (gamer.ne.jp) news headline, Apr 15, 2016**: <https://www.gamer.ne.jp/news/201604150030/>  
  `src-gamer-ne-jp` · status: PARTIAL (title/headline/snippet only) · cited 1× in canon.json  
  *Used for:* Search headline only: S;G 0 PC Japan June 24 (2016).  
  *Caveat:* Headline only; conflicts with the wiki's Aug 26, 2016.  
  *Notes file(s):* characters_and_works.md

## Tier 3: Community / interpretation (blogs, guides, forums, essays)

- **Galileo Unbound blog (David D. Nolte): Steins;Gate tag**: <https://galileo-unbound.blog/tag/steins-gate/>  
  `src-galileo-unbound` · status: fetched · cited 2× in canon.json  
  *Used for:* Physicist's reading of attractor fields as basins of attraction.  
  *Caveat:* Its '4%' figure is contradicted by every other source; do not use it as fact.  
  *Notes file(s):* worldline_theory.md
- **Kiri Kiri Basara: Steins;Gate endings guide**: <https://kirikiribasara.com/?p=14644>  
  `src-kirikiri-endings` · status: fetched · cited 11× in canon.json  
  *Used for:* VN ending branch chapters and triggers; no Moeka ending in the original; Re:Boot Moeka route.  
  *Caveat:* Blog/guide.  
  *Notes file(s):* main_story_chronology.md
- **Kiri Kiri Basara: 'Why Steins;Gate 0 is often misunderstood'**: <https://www.kirikiribasara.com/?p=16724>  
  `src-kirikiri-sg0` · status: fetched · cited 21× in canon.json  
  *Used for:* Route-iteration chain, Operation Skuld as the video D-Mail, Arc-Light/Ouroboros origins, Amadeus' Script guidebook claims, anime as final route, movie canon.  
  *Caveat:* Interpretive analysis; secondary report of an untranslated guidebook.  
  *Notes file(s):* steins_gate_0_branch.md, disputes_and_adaptation_differences.md
- **Kiri Kiri Basara (Sep 25, 2018): Steins;Gate Elite Western release**: <https://kirikiribasara.com/?p=2529>  
  `src-kirikiri-elite` · status: fetched · cited 2× in canon.json  
  *Used for:* Elite West date; Linear Bounded Phenogram bundled with PS4/PC Elite; 8-Bit ADV on Switch.  
  *Caveat:* Blog; release facts corroborated by Nintendo Wire.  
  *Notes file(s):* characters_and_works.md
- **Magic Game World: Steins;Gate 0 all endings guide**: <https://www.magicgameworld.com/?p=18554>  
  `src-magicgameworld-sg0` · status: fetched · cited 17× in canon.json  
  *Used for:* Six S;G 0 VN endings, choice triggers with in-game dates, True End unlock.  
  *Caveat:* Walkthrough site. The disputes notes list it as not fetched; the S;G 0 notes fetched it.  
  *Notes file(s):* steins_gate_0_branch.md, disputes_and_adaptation_differences.md
- **TV Tropes: Steins;Gate 0 (anime)**: <https://tvtropes.org/pmwiki/pmwiki.php/Anime/SteinsGate0>  
  `src-tvtropes-sg0` · status: fetched · cited 14× in canon.json  
  *Used for:* Factions (DURPA/Stratfor/Russia), Leskinen/Reyes as antagonists, Kurisu's laptop, Operation Arc Light spellings, anime vs VN differences, 18,000 BC.  
  *Caveat:* Community wiki.  
  *Notes file(s):* steins_gate_0_branch.md
- **Suki Desu: What do 'Steins;Gate' and 'El Psy Congroo' mean?**: <https://skdesu.com/en/what-does-steins-gate-and-el-psy-congroo/>  
  `src-skdesu` · status: fetched · cited 4× in canon.json  
  *Used for:* El Psy Kongroo usage and spelling; Norn-named anime arcs (Urd eps 1-12, Verdandi 13-22, Skuld 23-24); Hayashi on 'Stein'.  
  *Caveat:* Blog; its etymologies are speculation.  
  *Notes file(s):* devices_and_organizations.md, disputes_and_adaptation_differences.md
- **Moegirl (ja): El Psy Kongroo**: <https://zh.moegirl.org.cn/ja/El_Psy_Kongroo>  
  `src-moegirl-elpsy` · status: PARTIAL (title/headline/snippet only) · cited 1× in canon.json  
  *Used for:* Page title only: 'Congroo' is an early mistranslation.  
  *Caveat:* Only title and metadata were readable.  
  *Notes file(s):* disputes_and_adaptation_differences.md
- **votuko, 'The Mechanics of Steins;Gate' (2023 PDF hosted on gwern.net)**: <https://gwern.net/doc/fiction/science-fiction/time-travel/2023-votuko-themechanicsofsteinsgate.pdf>  
  `src-gwern-votuko` · status: fetched · cited 8× in canon.json  
  *Used for:* Time leap vs D-Mail, 48 hours, partial Reading Steiner, Aug 13 fixed point, FG204/C204, Titor background, Maniacs Q&A 29.  
  *Caveat:* Fan explainer; the Fandom Reading Steiner page cites it, so the two are not independent.  
  *Notes file(s):* disputes_and_adaptation_differences.md
- **Steam discussion (Steins;Gate): the first D-Mail and its deletion**: <https://steamcommunity.com/app/412830/discussions/0/1621724915776285657>  
  `src-steam-sg-first-dmail` · status: fetched · cited 3× in canon.json  
  *Used for:* Fan dispute on why deleting the first D-Mail matters; causality complaints.  
  *Caveat:* Forum thread; INTERPRETATION only.  
  *Notes file(s):* disputes_and_adaptation_differences.md
- **Steam discussion (Steins;Gate 0): True End, Kagari and D-RINE timing**: <https://steamcommunity.com/app/825630/discussions/2/1697175413675771208>  
  `src-steam-sg0-trueend` · status: fetched · cited 6× in canon.json  
  *Used for:* Kagari in the True End, D-RINE timing, Milky-way Crossing vs Vega and Altair.  
  *Caveat:* Forum thread; INTERPRETATION only.  
  *Notes file(s):* disputes_and_adaptation_differences.md
- **Netto's Game Room: which version of Steins;Gate should you play?**: <https://www.nettosgameroom.com/2026/08/which-version-of-steinsgate-should-you.html>  
  `src-netto-which-version` · status: fetched · cited 1× in canon.json  
  *Used for:* Anime removed extra endings, Chaos;Head references and science exposition; Elite and Re:Boot changes.  
  *Caveat:* Single blog source.  
  *Notes file(s):* disputes_and_adaptation_differences.md
- **Netto's Game Room: Steins;Gate Re:Boot review**: <https://www.nettosgameroom.com/2026/08/steinsgate-reboot-review.html>  
  `src-netto-reboot-review` · status: SEARCH RESULT ONLY, not fetched, supports nothing · cited 0× in canon.json  
  *Used for:* Nothing (surfaced in search only).  
  *Caveat:* Not fetched; supports nothing.  
  *Notes file(s):* devices_and_organizations.md
- **wolfborg (Patreon/YouTube): 'Attractor Fields in Steins;Gate (Anime Science)'**: <https://www.patreon.com/wolfborg/posts/attractor-fields-73792572>  
  `src-patreon-wolfborg` · status: SEARCH RESULT ONLY, not fetched, supports nothing · cited 0× in canon.json  
  *Used for:* Nothing (surfaced in search only).  
  *Caveat:* Not fetched; supports nothing.  
  *Notes file(s):* disputes_and_adaptation_differences.md
- **Interpretating Culture (Substack) essay on Steins;Gate**: <https://interpretatingculture.substack.com/p/steinsgate>  
  `src-substack-interpretating` · status: SEARCH RESULT ONLY, not fetched, supports nothing · cited 0× in canon.json  
  *Used for:* Nothing (surfaced in search only).  
  *Caveat:* Not fetched; supports nothing.  
  *Notes file(s):* disputes_and_adaptation_differences.md
- **Unicamp blog post (Steins;Gate 0)**: <https://www.blogs.unicamp.br/zero/?p=1969>  
  `src-unicamp-blog` · status: SEARCH RESULT ONLY, not fetched, supports nothing · cited 0× in canon.json  
  *Used for:* Nothing (surfaced in search only).  
  *Caveat:* Not fetched; supports nothing.  
  *Notes file(s):* steins_gate_0_branch.md

## Pages named as failed or unreachable without a full URL (not counted above)

- Steins;Gate Fandom wiki: 'List_of_world_lines' (worldline_theory.md): Fetch error; Beta prologue value could not be cross-checked.
- Steins;Gate Fandom wiki: 'World_line' (https://steins-gate.fandom.com/wiki/World_line appears in the S;G 0 notes' unreachable list as plain text) (worldline_theory.md, main_story_chronology.md, steins_gate_0_branch.md): Client error on every attempt.
- Science Adventure wiki: 'Operation_Skuld' (worldline_theory.md): Fetch error; how S;G 0 connects into anime eps 23-24 could not be checked there.
- Steins;Gate Fandom wiki: 'Achievement_Point' (anime ep 24 page) (main_story_chronology.md): Fetch failed.
- Science Adventure wiki: S;G 0 '/Endings' and '/Open_the_Missing_Link' pages (steins_gate_0_branch.md): Client error; the ep 23-beta title 'Open the Missing Link' therefore unverified.
- Steins;Gate Fandom wiki: Kaede Kurushima (characters_and_works.md): Could not be fetched.
- Wikipedia: 'Steins%3BGate_0' (encoded variant) (steins_gate_0_branch.md): url_not_found; direct curl blocked by proxy.
- Wikipedia: 'Steins;Gate:_Linear_Bounded_Phenogram' and 'Steins;Gate:_My_Darling's_Embrace' (characters_and_works.md): Failed or returned the main Steins;Gate game article.
- Official MAGES. / Spike Chunsoft / steinsgate0.jp / Crunchyroll pages (all): Never fetched (tool budget). No official publisher page supports anything in canon.json.
- Reddit r/steinsgate FAQ, Anime Stack Exchange, MyAnimeList forums (disputes_and_adaptation_differences.md): Targeted but not surfaced or not reached.
