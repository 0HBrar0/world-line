import { useState } from 'react';
import { motion } from 'framer-motion';
import { href } from '../../app/router';
import { useReduceMotion, useSettings } from '../../app/settings';
import { Badge, SubConfidence } from '../../components/Badge';
import { Nixie } from '../../components/Nixie';
import type { SourceTarget } from '../../components/drawer';
import { canon } from '../../data/load';
import type { Sg0Ending, Tier } from '../../data/schema';
import { atLeast, eventById, isVisible, lineLabel, publicLineId, transitionById, worldLineById } from '../../data/selectors';
import { safeText } from '../../data/tierGuard';
import { lineTarget, transitionTarget } from '../map/targets';

const branch = canon.sg0Branch;

const branchTarget = (title: string): SourceTarget => ({ id: 'sg0Branch', title, confidence: branch.confidence, sourceIds: branch.sourceIds });

const eventTitle = (id: string, tier: Tier) => {
  const e = eventById(id);
  return e ? safeText(e.title, tier) : '';
};

function ForkDiagram({ tier }: { tier: Tier }) {
  const fork = worldLineById(branch.forkFromWorldLineId)!;
  const opening = worldLineById(branch.branchWorldLineId)!;
  const transition = transitionById('tr-sg0-branch')!;
  return (
    <figure className="diagram">
      <svg viewBox="0 0 760 210" role="img" aria-label={`The original line ${fork.divergence} forks at the failed rescue into the sequel line ${opening.divergence}. The fork is an interpretation.`}>
        <line x1="30" x2="730" y1="60" y2="60" stroke="#6b7a88" strokeWidth="3" />
        <path d="M 250 60 C 290 60, 300 150, 350 150 H 730" fill="none" stroke="var(--edge-other)" strokeWidth="3" strokeDasharray="4 4" />
        <circle cx="250" cy="60" r="8" fill="var(--bg-0)" stroke="var(--conf-confirmed)" strokeWidth="3" />
        <circle cx="350" cy="150" r="8" fill="var(--bg-0)" stroke="var(--conf-interp)" strokeWidth="3" />
        <circle cx="690" cy="60" r="9" fill="var(--band-sg-stroke)" />
        <text x="30" y="44" className="diagram-text">
          {fork.divergence}
        </text>
        <text x="250" y="36" textAnchor="middle" className="diagram-text">
          {eventTitle(branch.branchEventId, tier)}
        </text>
        <text x="690" y="36" textAnchor="middle" className="diagram-text">
          Steins Gate
        </text>
        <text x="370" y="176" className="diagram-text">
          {opening.divergence}
        </text>
      </svg>
      <figcaption className="row">
        Fork edge: <Badge target={transitionTarget(transition, tier)} />
      </figcaption>
    </figure>
  );
}

function LoopBack({ tier }: { tier: Tier }) {
  const reduce = useReduceMotion();
  const [run, setRun] = useState(0);
  const rec = branch.reconnection;
  const steps = [rec.fromEventId, rec.toEventId, rec.unlocksEventId].map((id) => eventTitle(id, tier));
  const draw = (delay: number, duration: number) => (reduce ? {} : { initial: { pathLength: 0 }, animate: { pathLength: 1 }, transition: { delay, duration, ease: [0.3, 0, 0, 1] as const } });
  return (
    <section aria-labelledby="loop-title">
      <h2 id="loop-title">The loop back</h2>
      <figure className="diagram">
        <svg key={run} viewBox="0 0 760 240" aria-hidden="true">
          <line x1="40" x2="720" y1="180" y2="180" stroke="#6b7a88" strokeWidth="3" />
          <line x1="420" x2="720" y1="60" y2="60" stroke="var(--band-sg0)" strokeWidth="10" />
          <circle cx="680" cy="60" r="10" fill="var(--edge-reconnect)" />
          <circle cx="110" cy="180" r="9" fill="var(--bg-0)" stroke="var(--edge-reconnect)" strokeWidth="3" />
          <circle cx="420" cy="180" r="9" fill="var(--bg-0)" stroke="var(--edge-reconnect)" strokeWidth="3" />
          <circle cx="640" cy="180" r="11" fill="var(--band-sg-stroke)" />
          <text x="720" y="30" textAnchor="end" className="diagram-text">
            {steps[0]}
          </text>
          <text x="40" y="208" className="diagram-text">
            {steps[1]}
          </text>
          <text x="420" y="208" textAnchor="middle" className="diagram-text">
            {steps[2]}
          </text>
          <text x="640" y="162" textAnchor="middle" className="diagram-text">
            Steins Gate
          </text>
          <motion.path d="M 680 60 C 560 -40, 200 -30, 110 180" fill="none" stroke="var(--edge-reconnect)" strokeWidth="3" strokeDasharray="10 6" {...draw(0.2, 1.8)} />
          <motion.path d="M 110 180 C 200 110, 330 110, 420 180" fill="none" stroke="var(--edge-reconnect)" strokeWidth="3" {...draw(2.1, 1)} />
          <motion.path d="M 420 180 H 640" fill="none" stroke="var(--band-sg-stroke)" strokeWidth="5" {...draw(3.2, 0.8)} />
        </svg>
        <figcaption>
          <button type="button" className="btn btn-small" disabled={reduce} onClick={() => setRun((r) => r + 1)}>
            Replay
          </button>
        </figcaption>
      </figure>
      <p>{safeText(rec.description, tier)}</p>
      <ol aria-label="The loop back, step by step">
        {steps.map((title, i) => (
          <li key={i}>{title}</li>
        ))}
      </ol>
      <p className="row">
        <Badge target={{ id: 'sg0Branch', title: 'Reconnection', confidence: rec.confidence, sourceIds: rec.sourceIds, singleSource: rec.singleSource, singleSourceKind: rec.singleSourceKind }} />
      </p>
      <p className="detail-meta">{safeText(rec.arrivalDateNote, tier)}</p>
    </section>
  );
}

function EndingTile({ ending, tier }: { ending: Sg0Ending; tier: Tier }) {
  const line = worldLineById(ending.worldLineId);
  return (
    <li className={ending.isTrueEnd ? 'tile ending-tile is-true' : 'tile ending-tile'}>
      <h3>
        {ending.isTrueEnd && <span aria-hidden="true">★ </span>}
        {ending.name}
      </h3>
      <p className="detail-meta">{ending.route}</p>
      {ending.value ? (
        <>
          <Nixie value={ending.value} size="sm" />
          {line && <SubConfidence confidence={line.divergenceConfidence} what="Value confidence" />}
        </>
      ) : (
        <p className="detail-meta">No value listed</p>
      )}
      <p>{safeText(ending.outcome, tier)}</p>
      <p className="detail-meta">{ending.howToReach}</p>
      <Badge compact target={{ title: ending.name, ...ending }} />
    </li>
  );
}

interface TreeNode {
  label: string;
  children: Map<string, TreeNode>;
  leaves: Sg0Ending[];
}

/** Builds the choice tree from howToReach text only: the capitalised phone choices are the branches. */
export function buildChoiceTree(endings: Sg0Ending[]) {
  const root: TreeNode = { label: '', children: new Map(), leaves: [] };
  const other: Sg0Ending[] = [];
  for (const ending of endings) {
    const choices = [...ending.howToReach.matchAll(/Phone (ON|OFF)|\b(ANSWER|IGNORE)\b/g)].map((m) => (m[1] ? `Phone ${m[1]}` : m[2]));
    if (choices.length === 0) {
      other.push(ending);
      continue;
    }
    let at = root;
    for (const choice of choices) {
      if (!at.children.has(choice)) at.children.set(choice, { label: choice, children: new Map(), leaves: [] });
      at = at.children.get(choice)!;
    }
    at.leaves.push(ending);
  }
  return { root, other };
}

function TreeList({ node }: { node: TreeNode }) {
  return (
    <ul className="choice-tree">
      {[...node.children.values()].map((child) => (
        <li key={child.label}>
          <span className="choice">{child.label}</span>
          {child.children.size > 0 && <TreeList node={child} />}
          {child.leaves.map((leaf) => (
            <p key={leaf.id} className="choice-leaf">
              <strong>{leaf.name}:</strong> {leaf.howToReach}
            </p>
          ))}
        </li>
      ))}
    </ul>
  );
}

function FloatingLines({ tier }: { tier: Tier }) {
  const { media } = useSettings();
  const lines = canon.worldLines.filter((l) => l.lane === 'sg0' && isVisible(l, tier, media));
  return (
    <section>
      <h2>Lines on this branch</h2>
      <p className="detail-meta">Route links not mapped: the sources give values per chapter and ending, but not which line leads to which.</p>
      <ul className="floating-lines">
        {lines.map((l) => (
          <li key={l.id}>
            <a className="mono" href={href('map', { wl: publicLineId(l.id) })}>
              {l.divergence ?? 'no value listed'}
            </a>
            <span>{lineLabel(l, tier)}</span>
            <Badge compact target={lineTarget(l, tier)} />
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Sg0Page() {
  const { tier, media } = useSettings();
  if (!atLeast(tier, branch.spoilerTier)) {
    return (
      <main id="main" className="page">
        <h1>Steins;Gate 0</h1>
        <div className="tile tile-locked">Steins;Gate 0: the sequel's branch 🔒</div>
      </main>
    );
  }
  const endings = branch.endings.filter((e) => e.media.some((m) => media.includes(m)));
  const { root, other } = buildChoiceTree(branch.endings);
  const description = safeText(branch.description, tier);
  return (
    <main id="main" className="page sg0">
      <h1>Steins;Gate 0</h1>
      <section aria-labelledby="fork-title">
        <h2 id="fork-title">The fork</h2>
        <p>{description}</p>
        <p className="row">
          <Badge target={branchTarget('The fork')} />
        </p>
        <ForkDiagram tier={tier} />
      </section>
      <LoopBack tier={tier} />
      <FloatingLines tier={tier} />
      <section>
        <h2>Endings</h2>
        <ul className="tile-grid ending-grid">
          {endings.map((e) => (
            <EndingTile key={e.id} ending={e} tier={tier} />
          ))}
        </ul>
      </section>
      <section>
        <h2>VN choice tree (simplified)</h2>
        <p className="detail-meta">The grouping is simplified for reading; each ending's route text is quoted from the data as it stands.</p>
        <TreeList node={root} />
        {other.map((leaf) => (
          <p key={leaf.id} className="choice-leaf">
            <strong>{leaf.name}:</strong> {leaf.howToReach}
          </p>
        ))}
      </section>
      <section>
        <h2>Anime and VN differences</h2>
        <ul className="fact-list">
          {branch.animeVsVn.map((item, i) => (
            <li key={i}>
              {item.text} <Badge compact target={{ id: 'sg0Branch', title: item.text, ...item }} />
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2>What to call it</h2>
        <p>
          {branch.classification.text} <Badge compact target={{ id: 'sg0Branch', title: 'Classification', ...branch.classification }} />
        </p>
      </section>
    </main>
  );
}
