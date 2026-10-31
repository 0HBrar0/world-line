import { motion } from 'framer-motion';
import { href } from '../app/router';
import { useReduceMotion, useSettings } from '../app/settings';
import { Badge, ConfidenceLegend } from '../components/Badge';
import { EDGE_STYLES } from '../components/glyphs';
import { MechIconGroup } from '../components/MechIcon';
import { Linked } from '../components/Term';
import { canon } from '../data/load';
import { glossaryById, isVisible, lineLabel, mechanicById, transitionById, worldLineById } from '../data/selectors';
import type { GlossaryEntry } from '../data/schema';
import { safeText } from '../data/tierGuard';

const PREMISE_ENTRIES = ['gl-future-gadget-lab', 'gl-phonewave', 'gl-world-line'];

function glossaryTarget(g: GlossaryEntry) {
  return { id: g.id, title: g.term, confidence: g.confidence, sourceIds: g.sourceIds, singleSource: g.singleSource, singleSourceKind: g.singleSourceKind };
}

/** A premise-tier map: two tracks and the one edge, drawn once. */
function Teaser() {
  const { tier } = useSettings();
  const reduce = useReduceMotion();
  const t = transitionById('tr-first-dmail')!;
  const from = worldLineById(t.from)!;
  const to = worldLineById(t.to)!;
  const style = EDGE_STYLES[t.mechanism];
  const label = `A map sketch: ${lineLabel(from, tier)} at ${from.divergence} jumps by ${style.label} to ${lineLabel(to, tier)} at ${to.divergence}.`;
  return (
    <a className="teaser" href={href('map')}>
      <span className="sr-only">Open the map. {label}</span>
      <svg viewBox="0 0 640 170" aria-hidden="true">
        <line className="track" x1="150" x2="340" y1="44" y2="44" />
        <line className="track" x1="352" x2="620" y1="128" y2="128" />
        <circle className="node-core node-confirmed" cx="210" cy="44" r="6" />
        <circle className="node-core node-confirmed" cx="280" cy="44" r="6" />
        <circle className="node-core node-confirmed" cx="340" cy="44" r="6" />
        <motion.path
          d="M 340 44 C 342 86, 350 86, 352 128"
          fill="none"
          stroke={style.color}
          strokeWidth="3"
          initial={reduce ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.3, 0, 0, 1] }}
        />
        <g transform="translate(372 86)">
          <MechIconGroup kind={t.mechanism} color={style.color} scale={1.2} />
        </g>
        <circle className="node-core node-confirmed" cx="440" cy="128" r="6" />
        <text className="row-label" x="140" y="48" textAnchor="end">
          {from.divergence}
        </text>
        <text className="row-label" x="340" y="132" textAnchor="end">
          {to.divergence}
        </text>
      </svg>
    </a>
  );
}

export function HomePage() {
  const { tier } = useSettings();
  const dmail = mechanicById('dmail')!;
  const level = canon.meta.spoilerTiers.find((t) => t.id === tier);
  return (
    <main id="main" className="page home">
      <section className="hero">
        <h1>One text message to the past can rewrite history.</h1>
        <p className="lede">
          <Linked text={dmail.oneLiner} tier={tier} />
        </p>
        <div className="row hero-actions">
          <a className="btn btn-primary" href={href('follow')}>
            ▶ Follow the story
          </a>
          <a className="btn" href={href('map')}>
            Explore the map
          </a>
          <a className="btn" href={href('mechanics')}>
            How time travel works
          </a>
        </div>
      </section>
      <div className="home-grid">
        <section>
          {PREMISE_ENTRIES.map((id) => {
            const g = glossaryById(id);
            if (!g || !isVisible(g, tier, undefined)) return null;
            return (
              <p key={id}>
                {safeText(g.plainLanguage, tier)} <Badge compact target={glossaryTarget(g)} />
              </p>
            );
          })}
          <p className="detail-meta">
            You are set to “{level?.label}”, which covers: {safeText(level?.covers ?? '', tier)} Change it in the top bar as you watch or read further.
          </p>
        </section>
        <Teaser />
      </div>
      <ConfidenceLegend />
    </main>
  );
}
