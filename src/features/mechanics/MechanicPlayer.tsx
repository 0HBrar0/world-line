import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useReduceMotion, useSettings } from '../../app/settings';
import { Badge } from '../../components/Badge';
import { GlassDock } from '../../components/GlassDock';
import type { SourceTarget } from '../../components/drawer';
import type { Confidence, Mechanic, Tier } from '../../data/schema';
import { effectiveTier, tierRank } from '../../data/selectors';
import { isTextSafe, safeText } from '../../data/tierGuard';
import { STAGE, StageDefs } from './scene';
import { STORYBOARDS } from './storyboards';

// Time to watch a frame play out, plus time to read its caption at an easy pace.
const WATCH_MS = 4800;
const READ_MS_PER_CHAR = 45;

type Step = Mechanic['steps'][number];

export function stepIsOpen(step: Step, mechanic: Mechanic, tier: Tier): boolean {
  return tierRank(effectiveTier(step, mechanic)) <= tierRank(tier) && isTextSafe(step.caption, tier);
}

const stepTarget = (m: Mechanic, s: Step): SourceTarget => ({
  id: m.id,
  title: s.caption,
  confidence: s.confidence,
  sourceIds: s.sourceIds,
  singleSource: s.singleSource,
  singleSourceKind: s.singleSourceKind,
});

/** Mechanics carry no top-level sources, so summary text cites its steps and takes their weakest tag. */
function summaryTarget(m: Mechanic, steps: Step[], title: string): SourceTarget {
  const rank: Confidence[] = ['UNCLEAR', 'INTERPRETATION', 'CONFIRMED'];
  const weakest = rank.find((c) => steps.some((s) => s.confidence === c)) ?? 'CONFIRMED';
  return { id: m.id, title, confidence: weakest, sourceIds: [...new Set(steps.flatMap((s) => s.sourceIds))] };
}

interface PlayerProps {
  mechanic: Mechanic;
  /** Inline use in guided mode: no chrome below the player. */
  compact?: boolean;
}

export function MechanicPlayer({ mechanic, compact = false }: PlayerProps) {
  const { tier, prefs } = useSettings();
  const reduce = useReduceMotion();
  const steps = mechanic.steps;
  const openFlags = useMemo(() => steps.map((s) => stepIsOpen(s, mechanic, tier)), [steps, mechanic, tier]);
  const first = Math.max(openFlags.indexOf(true), 0);
  const [index, setIndex] = useState(first);
  const [playing, setPlaying] = useState(false);
  const [textOnly, setTextOnly] = useState(false);
  const [pace, setPace] = useState(1);

  const nextOpen = useCallback(
    (from: number, dir: 1 | -1) => {
      for (let i = from + dir; i >= 0 && i < steps.length; i += dir) if (openFlags[i]) return i;
      return null;
    },
    [steps.length, openFlags],
  );

  useEffect(() => {
    setIndex(first);
    setPlaying(!reduce && !compact && prefs.autoplayMechanics);
  }, [mechanic.id, first, reduce, compact, prefs.autoplayMechanics]);

  // Autoplay skips locked frames and stops at the last open one.
  useEffect(() => {
    if (!playing || reduce || textOnly) return;
    const timer = window.setTimeout(() => {
      const next = nextOpen(index, 1);
      if (next === null) setPlaying(false);
      else setIndex(next);
    }, (WATCH_MS + steps[index].caption.length * READ_MS_PER_CHAR) / pace);
    return () => window.clearTimeout(timer);
  }, [playing, reduce, textOnly, index, nextOpen, steps, pace]);

  const step = steps[index];
  const open = openFlags[index];
  const Frame = STORYBOARDS[mechanic.id]?.[index];
  const showList = textOnly || reduce;

  return (
    <section className={compact ? 'player is-compact' : 'player'} aria-label={`${safeText(mechanic.title, tier)} player`}>
      <div className="player-picture">
        {!textOnly && (
          <div className="stage" aria-hidden="true">
            {open && Frame ? (
              <svg className="mech-svg" viewBox={`0 0 ${STAGE.width} ${STAGE.height}`} preserveAspectRatio="xMidYMid meet">
                <StageDefs />
                <AnimatePresence mode="wait">
                  <motion.g key={index} initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={reduce ? undefined : { opacity: 0 }} transition={{ duration: reduce ? 0 : 0.18 }}>
                    <Frame />
                  </motion.g>
                </AnimatePresence>
              </svg>
            ) : (
              <div className="stage-locked">
                <span>🔒 later in the story</span>
              </div>
            )}
          </div>
        )}
        <div className="step-thread">
          {steps.map((s, i) => (
            <button
              key={s.order}
              type="button"
              className={`step-dot${i === index ? ' is-current' : ''}${i < index ? ' is-past' : ''}${openFlags[i] ? '' : ' is-locked'}`}
              aria-label={openFlags[i] ? `Step ${i + 1}` : `Step ${i + 1}, locked`}
              aria-current={i === index ? 'step' : undefined}
              onClick={() => setIndex(i)}
            >
              <span aria-hidden="true">{i + 1}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="player-words">
        <span className="mono caption-count">
          Step {index + 1} of {steps.length}
        </span>
        <div className="caption-bar">
          {open ? (
            <>
              <p className="caption" data-testid="caption" aria-live={playing ? 'off' : 'polite'}>
                {step.caption}
              </p>
              <Badge target={stepTarget(mechanic, step)} />
            </>
          ) : (
            <p className="caption">🔒 later in the story</p>
          )}
        </div>
        <div className="player-controls">
          <GlassDock
            className="glass-dock-player"
            label="Step controls"
            playing={playing}
            playDisabled={reduce || textOnly}
            canBack={nextOpen(index, -1) !== null}
            canNext={nextOpen(index, 1) !== null}
            pace={pace}
            onTogglePlay={() => setPlaying((p) => !p)}
            onBack={() => setIndex(nextOpen(index, -1) ?? index)}
            onNext={() => setIndex(nextOpen(index, 1) ?? index)}
            onPace={setPace}
          />
          <button type="button" className="btn btn-quiet" aria-pressed={textOnly} onClick={() => setTextOnly((v) => !v)}>
            Text only
          </button>
        </div>
      </div>
      <ol className={showList ? 'step-list' : 'sr-only'} aria-label="All steps as text">
        {steps.map((s, i) => (
          <li key={s.order}>
            {openFlags[i] ? (
              <>
                <span data-testid="step-text">{s.caption}</span> <Badge compact target={stepTarget(mechanic, s)} />
              </>
            ) : (
              '🔒 later in the story'
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

export function FlipCard({ claim, correction, target }: { claim: string; correction: string; target: SourceTarget }) {
  const [flipped, setFlipped] = useState(false);
  const reduce = useReduceMotion();
  return (
    <div className="flip">
      <button type="button" className="flip-face" aria-expanded={flipped} onClick={() => setFlipped((f) => !f)}>
        <motion.span key={String(flipped)} className="flip-inner" initial={reduce ? false : { rotateX: 90 }} animate={{ rotateX: 0 }} transition={{ duration: 0.18 }}>
          {flipped ? (
            <>
              <span className="flip-tag">Actually</span>
              {correction}
            </>
          ) : (
            <>
              <span className="flip-tag">Common claim</span>
              {claim}
            </>
          )}
        </motion.span>
      </button>
      <Badge compact target={target} />
    </div>
  );
}

export function MechanicExtras({ mechanic }: { mechanic: Mechanic }) {
  const { tier } = useSettings();
  const openSteps = mechanic.steps.filter((s) => stepIsOpen(s, mechanic, tier));
  const travels = safeText(mechanic.whatTravels, tier);
  const stays = safeText(mechanic.whatDoesNotTravel, tier);
  const limits = mechanic.limits.filter((l) => tierRank(effectiveTier(l, mechanic)) <= tierRank(tier) && isTextSafe(l.text, tier));
  const myths = mechanic.commonMisconceptions.filter((c) => isTextSafe(c.claim, tier) && isTextSafe(c.correction, tier));
  const hasTravel = travels !== 'n/a' && stays !== 'n/a' && !!travels && !!stays;
  return (
    <div className="mechanic-extras">
      {hasTravel && (
        <section className="travel-grid">
          <div className="card">
            <h2>What travels</h2>
            <p>{travels}</p>
            <Badge compact target={summaryTarget(mechanic, openSteps, travels)} />
          </div>
          <div className="card">
            <h2>What doesn't</h2>
            <p>{stays}</p>
            <Badge compact target={summaryTarget(mechanic, openSteps, stays)} />
          </div>
        </section>
      )}
      {limits.length > 0 && (
        <section>
          <h2>Limits</h2>
          <ul className="fact-list">
            {limits.map((l, i) => (
              <li key={i}>
                {l.text} <Badge compact target={{ id: mechanic.id, title: l.text, ...l }} />
              </li>
            ))}
          </ul>
        </section>
      )}
      {myths.length > 0 && (
        <section>
          <h2>Common misconceptions</h2>
          <div className="flip-grid">
            {myths.map((m, i) => (
              <FlipCard key={i} claim={m.claim} correction={m.correction} target={{ id: mechanic.id, title: m.claim, ...m }} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
