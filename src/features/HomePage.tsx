import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { href } from '../app/router';
import { useReduceMotion, useSettings } from '../app/settings';
import { Badge, ConfidenceLegend } from '../components/Badge';
import { EDGE_STYLES } from '../components/glyphs';
import { MechIconGroup } from '../components/MechIcon';
import { Nixie } from '../components/Nixie';
import { Linked } from '../components/Term';
import { canon } from '../data/load';
import { glossaryById, isVisible, lineLabel, mechanicById, transitionById, worldLineById } from '../data/selectors';
import type { GlossaryEntry } from '../data/schema';
import { safeText } from '../data/tierGuard';

const PREMISE_ENTRIES = ['gl-future-gadget-lab', 'gl-phonewave', 'gl-world-line'];
const EASE = [0.3, 0, 0, 1] as const;
const JUMP_MS = 1500;

function glossaryTarget(g: GlossaryEntry) {
  return { id: g.id, title: g.term, confidence: g.confidence, sourceIds: g.sourceIds, singleSource: g.singleSource, singleSourceKind: g.singleSourceKind };
}

/** The first world-line jump, played once: the meter rolls as the line drops to its new track. */
function HeroBanner() {
  const { tier } = useSettings();
  const reduce = useReduceMotion();
  const t = transitionById('tr-first-dmail')!;
  const from = worldLineById(t.from)!;
  const to = worldLineById(t.to)!;
  const style = EDGE_STYLES[t.mechanism];
  const [jumped, setJumped] = useState(false);
  const label = `A map sketch: ${lineLabel(from, tier)} at ${from.divergence} jumps by ${style.label} to ${lineLabel(to, tier)} at ${to.divergence}.`;
  const draw = (delay: number, duration: number) => (reduce ? {} : { initial: { pathLength: 0 }, animate: { pathLength: 1 }, transition: { delay, duration, ease: EASE } });

  useEffect(() => {
    const timer = window.setTimeout(() => setJumped(true), JUMP_MS);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <a className="teaser" href={href('map')}>
      <span className="sr-only">Open the map. {label}</span>
      <span aria-hidden="true" className="hero-meter">
        <Nixie value={(reduce || jumped ? to : from).divergence} size="xl" label="" />
      </span>
      <svg viewBox="0 0 1180 150" aria-hidden="true">
        <motion.path d="M 0 36 H 580" className="hero-track" {...draw(0, 0.9)} />
        <motion.path d="M 610 116 H 1180" className="hero-track" {...draw(1.5, 1)} />
        <motion.path d="M 580 36 C 590 76, 600 76, 610 116" fill="none" stroke={style.color} strokeWidth="14" opacity="0.2" {...draw(0.9, 0.6)} />
        <motion.path d="M 580 36 C 590 76, 600 76, 610 116" fill="none" stroke={style.color} strokeWidth="4" {...draw(0.9, 0.6)} />
        {[160, 340, 580].map((x) => (
          <circle key={x} className="node-core node-confirmed" cx={x} cy="36" r="7" />
        ))}
        {[790, 980].map((x) => (
          <circle key={x} className="node-core node-confirmed" cx={x} cy="116" r="7" />
        ))}
        <g transform="translate(632 76)">
          <MechIconGroup kind={t.mechanism} color={style.color} scale={1.6} />
        </g>
      </svg>
      <span className="hero-readout mono" aria-hidden="true">
        {from.divergence} → {to.divergence}
      </span>
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
        <HeroBanner />
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
      <section className="home-grid" aria-label="The premise">
        {PREMISE_ENTRIES.map((id) => {
          const g = glossaryById(id);
          if (!g || !isVisible(g, tier, undefined)) return null;
          return (
            <p key={id} className="card">
              {safeText(g.plainLanguage, tier)} <Badge compact target={glossaryTarget(g)} />
            </p>
          );
        })}
      </section>
      <p className="detail-meta home-level">
        You are set to “{level?.label}”, which covers: {safeText(level?.covers ?? '', tier)} Change it in the top bar as you watch or read further.
      </p>
      <ConfidenceLegend />
    </main>
  );
}
