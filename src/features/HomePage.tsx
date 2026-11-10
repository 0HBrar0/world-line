import { useRef, useState } from 'react';
import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { href } from '../app/router';
import { useReduceMotion, useSettings } from '../app/settings';
import { Badge, ConfidenceLegend } from '../components/Badge';
import { GearClock } from '../components/GearClock';
import { EDGE_STYLES } from '../components/glyphs';
import { LabItem, type LabItemKind } from '../components/LabItems';
import { Nixie } from '../components/Nixie';
import { Blip } from '../components/Secrets';
import { Linked } from '../components/Term';
import { canon } from '../data/load';
import { glossaryById, isVisible, lineLabel, mechanicById, transitionById, worldLineById } from '../data/selectors';
import type { GlossaryEntry, Tier } from '../data/schema';
import { safeText } from '../data/tierGuard';

const PREMISE_ENTRIES = ['gl-future-gadget-lab', 'gl-phonewave', 'gl-world-line'];
const STORY_ENTRIES = ['gl-divergence', 'gl-dmail', 'gl-reading-steiner'];
const NOTES = ['Note 01', 'Note 02', 'Note 03'];
const JUMP_AT = 0.52;
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];

// Each thing on the bench opens the glossary note about it. Ids only.
const BENCH: Array<{ kind: LabItemKind; entry: string }> = [
  { kind: 'microwave', entry: 'gl-gel-banana' },
  { kind: 'crt', entry: 'gl-braun-tube-workshop' },
  { kind: 'phone', entry: 'gl-phone-trigger' },
  { kind: 'whiteboard', entry: 'gl-lab-mem-numbers' },
];

function glossaryTarget(g: GlossaryEntry) {
  return { id: g.id, title: g.term, confidence: g.confidence, sourceIds: g.sourceIds, singleSource: g.singleSource, singleSourceKind: g.singleSourceKind };
}

const openEntries = (ids: string[], tier: Tier) =>
  ids.flatMap((id) => {
    const g = glossaryById(id);
    return g && isVisible(g, tier, undefined) ? [g] : [];
  });

function StoryCaption({ entry, tier, progress, from, to }: { entry: GlossaryEntry; tier: Tier; progress: MotionValue<number>; from: number; to: number }) {
  const opacity = useTransform(progress, [from, from + 0.05, to - 0.05, to], [0, 1, 1, 0]);
  const y = useTransform(progress, [from, from + 0.05], [18, 0]);
  // Captions share one spot, so only the one on screen may take clicks.
  const pointerEvents = useTransform(opacity, (o) => (o > 0.5 ? 'auto' : 'none'));
  return (
    <motion.p className="story-caption" style={{ opacity, y, pointerEvents }}>
      {safeText(entry.plainLanguage, tier)} <Badge compact target={glossaryTarget(entry)} />
    </motion.p>
  );
}

function StoryLines({ progress }: { progress: MotionValue<number> }) {
  const t = transitionById('tr-first-dmail')!;
  const style = EDGE_STYLES[t.mechanism];
  const before = useTransform(progress, [0.04, 0.38], [0, 1]);
  const jump = useTransform(progress, [0.38, JUMP_AT], [0, 1]);
  const after = useTransform(progress, [JUMP_AT, 0.9], [0, 1]);
  return (
    <svg className="story-lines" viewBox="0 0 1200 220" preserveAspectRatio="none" aria-hidden="true">
      <motion.path d="M 0 50 H 590" className="story-track" style={{ pathLength: before }} />
      <motion.path d="M 590 50 C 600 110, 612 110, 622 170" fill="none" stroke={style.color} strokeWidth="3" vectorEffect="non-scaling-stroke" style={{ pathLength: jump }} />
      <motion.path d="M 622 170 H 1200" className="story-track" style={{ pathLength: after }} />
    </svg>
  );
}

/** The first world-line jump, told by scrolling: the line runs, drops, and the meter changes with it. */
function JumpStory() {
  const { tier } = useSettings();
  const reduce = useReduceMotion();
  const section = useRef<HTMLElement>(null);
  const t = transitionById('tr-first-dmail')!;
  const from = worldLineById(t.from)!;
  const to = worldLineById(t.to)!;
  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] });
  const [jumped, setJumped] = useState(false);
  useMotionValueEvent(scrollYProgress, 'change', (v) => setJumped(v > JUMP_AT));
  const entries = openEntries(STORY_ENTRIES, tier);
  const label = `${lineLabel(from, tier)} at ${from.divergence} jumps by ${EDGE_STYLES[t.mechanism].label} to ${lineLabel(to, tier)} at ${to.divergence}.`;

  if (reduce) {
    return (
      <section className="act act-still" aria-label={label}>
        <Nixie value={to.divergence} size="xl" label="" />
        <p className="story-readout mono">
          {from.divergence} → {to.divergence}
        </p>
        {entries.map((g) => (
          <p key={g.id} className="story-still">
            {safeText(g.plainLanguage, tier)} <Badge compact target={glossaryTarget(g)} />
          </p>
        ))}
      </section>
    );
  }

  return (
    <section ref={section} className="act-jump" aria-label={label}>
      <div className="story-pin">
        <StoryLines progress={scrollYProgress} />
        <div className="story-meter meter-case" aria-hidden="true">
          <Nixie value={(jumped ? to : from).divergence} size="xl" label="" />
        </div>
        <div className="story-captions">
          {entries.map((g, i) => (
            <StoryCaption key={g.id} entry={g} tier={tier} progress={scrollYProgress} from={0.03 + i * 0.32} to={0.35 + i * 0.32} />
          ))}
        </div>
      </div>
    </section>
  );
}

/** Things lying around the lab. Pressing one switches it on and opens the glossary note about it. */
function LabBench({ tier }: { tier: Tier }) {
  const [on, setOn] = useState<LabItemKind | null>(null);
  const [blip, setBlip] = useState(0);
  const items = BENCH.flatMap((item) => {
    const entry = glossaryById(item.entry);
    return entry && isVisible(entry, tier) ? [{ ...item, entry }] : [];
  });
  const open = items.find((item) => item.kind === on);
  if (items.length === 0) return null;
  return (
    <section className="act act-bench" aria-labelledby="bench-title">
      <h2 id="bench-title">On the lab bench</h2>
      <p className="detail-meta">Switch something on</p>
      <ul className="bench-items">
        {items.map(({ kind, entry }) => (
          <li key={kind}>
            <button
              type="button"
              className="bench-item"
              aria-pressed={on === kind}
              onClick={() => {
                setOn(on === kind ? null : kind);
                if (kind === 'crt' && on !== kind) setBlip((b) => b + 1);
              }}
            >
              <LabItem kind={kind} on={on === kind} />
              <span>{entry.term}</span>
            </button>
          </li>
        ))}
      </ul>
      <div className="bench-note" aria-live="polite">
        {open && (
          <>
            <p>
              {safeText(open.entry.plainLanguage, tier)} <Badge compact target={glossaryTarget(open.entry)} />
            </p>
            <a className="btn btn-quiet" href={href(`glossary/${open.entry.id}`)}>
              More in the glossary
            </a>
          </>
        )}
      </div>
      <Blip token={blip} />
    </section>
  );
}

export function HomePage() {
  const { tier } = useSettings();
  const dmail = mechanicById('dmail')!;
  const level = canon.meta.spoilerTiers.find((t) => t.id === tier);
  const first = worldLineById(transitionById('tr-first-dmail')!.from)!;
  // Pressing the meter makes the tubes roll again.
  const [roll, setRoll] = useState(0);
  return (
    <main id="main" className="home">
      <section className="act act-open">
        <GearClock live className="hero-clock" />
        <div className="hero-copy">
          <p className="kicker">An unofficial fan chronicle</p>
          <h1>One text message to the past can rewrite history.</h1>
          <div className="row hero-actions">
            <a className="btn btn-primary" href={href('follow')}>
              Read the chronicle
            </a>
            <a className="btn btn-link" href={href('map')}>
              See every world line ›
            </a>
          </div>
        </div>
        <div className="hero-kit">
          <button type="button" className="meter-case" title="Press to roll the tubes" onClick={() => setRoll((r) => r + 1)}>
            <Nixie key={roll} value={first.divergence} size="lg" />
            <span className="meter-plate" aria-hidden="true">
              Divergence
            </span>
          </button>
          <div className="phone">
            <div className="phone-screen">
              <span className="phone-head" aria-hidden="true">
                <span>New mail</span>
                <span>1/1</span>
              </span>
              <p>
                <Linked text={dmail.oneLiner} tier={tier} />
              </p>
            </div>
            <div className="phone-keys" aria-hidden="true">
              {KEYS.map((key) => (
                <span key={key}>{key}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <JumpStory />

      <section className="act act-premise" aria-label="The premise">
        <div className="home-grid">
          {openEntries(PREMISE_ENTRIES, tier).map((g, i) => (
            <div key={g.id} className="premise-note">
              <span className="premise-numeral" aria-hidden="true">
                {NOTES[i]}
              </span>
              <p>
                {safeText(g.plainLanguage, tier)} <Badge compact target={glossaryTarget(g)} />
              </p>
            </div>
          ))}
        </div>
      </section>

      <LabBench tier={tier} />

      <section className="act act-doors" aria-label="Where to go next">
        <a className="door" data-file="File 01" href={href('follow')}>
          <h2>The chronicle</h2>
          <p>Every world line and every jump, in order</p>
        </a>
        <a className="door" data-file="File 02" href={href('map')}>
          <h2>World lines</h2>
          <p>All of it, on one chart</p>
        </a>
        <a className="door" data-file="File 03" href={href('dmails')}>
          <h2>D-Mails</h2>
          <p>Each message to the past, as a file</p>
        </a>
        <a className="door" data-file="File 04" href={href('mechanics')}>
          <h2>How time travel works</h2>
          <p>Six short animations</p>
        </a>
      </section>

      <footer className="home-foot">
        <p className="detail-meta">
          You are set to “{level?.label}”, which covers: {safeText(level?.covers ?? '', tier)} Change it at the top of the page as you watch or read further.
        </p>
        <ConfidenceLegend />
      </footer>
    </main>
  );
}
