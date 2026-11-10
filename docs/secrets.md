# Secrets

Small things for fans to find. None of them states a story fact of its own: each opens something already in `data/canon.json`, and only if the visitor's spoiler level allows it.

| Try this | What happens |
|---|---|
| Type a divergence value anywhere, such as the one on the home page meter | The map opens on that world line. Values from later in the story do nothing. |
| Type the lab's motto (glossary entry `gl-el-psy-kongroo`) | Its glossary entry opens. |
| Type Mayuri's greeting (in her character entry) | Her character page opens. |
| Press the divergence meter on the home page | The Nixie tubes roll again. |
| Switch on the things on the lab bench | Each opens its glossary note; the old TV cuts to static. |
| Watch the clock behind the home page | It keeps your local time. The clock in the chronicle shows the story's time instead. |

Typing inside a text box never triggers a secret. The code is in `src/components/Secrets.tsx` and `LabBench` in `src/features/HomePage.tsx`.
