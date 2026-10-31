import { useEffect, useRef } from 'react';
import { useSettings } from '../../app/settings';
import { href } from '../../app/router';
import { Badge, SubConfidence } from '../../components/Badge';
import { CharacterGlyph, EDGE_STYLES, MECHANIC_FOR_EDGE } from '../../components/glyphs';
import { formatDate } from '../../components/format';
import { MechIcon } from '../../components/MechIcon';
import { Nixie } from '../../components/Nixie';
import { useFocusTrap } from '../../components/useFocusTrap';
import { MEDIA_LABELS } from '../../components/TopBar';
import { Linked } from '../../components/Term';
import type { Media, Mechanism, StoryEvent, Tier, Transition, WorldLine } from '../../data/schema';
import { atLeast, characterById, disputesFor, eventById, isVisible, lineLabel, mechanicById, transitionById, transitionTier, tierRank, worldLineById } from '../../data/selectors';
import { safeText } from '../../data/tierGuard';
import { eventTarget, lineTarget, transitionTarget } from './targets';

export type Selection = { kind: 'event' | 'line' | 'edge'; id: string };

export function MediaList({ media }: { media: Media[] }) {
  return (
    <span className="media-list">
      {media.map((m) => (
        <span key={m} className="pill">
          {MEDIA_LABELS[m]}
        </span>
      ))}
    </span>
  );
}

export function Reveals({ reveals, tier, ancestorId }: { reveals: StoryEvent['reveals']; tier: Tier; ancestorId: string }) {
  const { peeks, peek } = useSettings();
  const open = reveals.filter((r) => tierRank(r.spoilerTier) <= tierRank(tier));
  const locked = reveals.filter((r) => tierRank(r.spoilerTier) > tierRank(tier));
  if (open.length === 0 && locked.length === 0) return null;
  return (
    <section>
      {open.length > 0 && <h3>Later you learn</h3>}
      <ul className="fact-list">
        {open.map((r, i) => (
          <li key={i}>
            {safeText(r.text, tier)} <Badge compact target={{ id: `${ancestorId}#reveal`, title: '', ...r }} />
          </li>
        ))}
        {locked.map((r, i) => {
          const key = `${ancestorId}:${i}`;
          return (
            <li key={key}>
              {peeks.has(key) ? (
                <>
                  {r.text} <Badge compact target={{ id: `${ancestorId}#reveal`, title: '', ...r }} />
                </>
              ) : (
                <button type="button" className="btn btn-small" onClick={() => peek(key)}>
                  Reveal this fact
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function PlayMechanic({ mechanism, tier }: { mechanism: Mechanism; tier: Tier }) {
  const id = MECHANIC_FOR_EDGE[mechanism];
  const mechanic = id ? mechanicById(id) : undefined;
  if (!mechanic) return null;
  if (!isVisible(mechanic, tier)) return null;
  return (
    <a className="btn" href={href(`mechanics/${mechanic.id}`)}>
      ▶ Play mechanic
    </a>
  );
}

function LineMove({ before, after, tier }: { before: string | null; after: string | null; tier: Tier }) {
  const lines = [before, after].map((id) => (id ? worldLineById(id) : undefined));
  const [from, to] = lines.map((l) => (l && isVisible(l, tier) ? l : undefined));
  if (!from && !to) return null;
  if (!from || !to || from.id === to.id) {
    const only = from ?? to!;
    return (
      <p className="line-move">
        <Nixie value={only.divergence} size="sm" />
      </p>
    );
  }
  return (
    <p className="line-move">
      <Nixie value={from.divergence} size="sm" /> <span aria-hidden="true">→</span> <span className="sr-only">changes to</span>{' '}
      <Nixie value={to.divergence} size="sm" />
    </p>
  );
}

function EventDetail({ event, tier }: { event: StoryEvent; tier: Tier }) {
  const changed = event.whatChanged ? safeText(event.whatChanged, tier) : '';
  const summary = safeText(event.summary, tier);
  const characters = event.characterIds.flatMap((id) => {
    const c = characterById(id);
    return c && isVisible(c, tier) ? [c] : [];
  });
  const transition = event.transitionId ? transitionById(event.transitionId) : undefined;
  const openTransition = transition && tierRank(transitionTier(transition)) <= tierRank(tier) ? transition : undefined;
  const conflictCount = event.conflicts.filter((c) => safeText(c.claim, tier) === c.claim).length;
  const date = formatDate(event);
  return (
    <>
      <h2 id="detail-title">{safeText(event.title, tier)}</h2>
      <p className="detail-meta">
        {date}
        <SubConfidence confidence={event.dateConfidence} what="Date confidence" />
        {event.location && safeText(event.location, tier) && ` · ${safeText(event.location, tier)}`}
      </p>
      <p className="row">
        <Badge target={eventTarget(event, tier)} />
        <MediaList media={event.media} />
      </p>
      <LineMove before={event.worldLineBefore} after={event.worldLineAfter} tier={tier} />
      {summary && (
        <p>
          <Linked text={summary} tier={tier} />
        </p>
      )}
      {changed && (
        <>
          <h3>What changed</h3>
          <p>{changed}</p>
        </>
      )}
      {characters.length > 0 && (
        <p className="glyph-row">
          {characters.map((c) => (
            <a key={c.id} href={href(`characters/${c.id}`)}>
              <CharacterGlyph id={c.id} />
            </a>
          ))}
        </p>
      )}
      {conflictCount > 0 && <p className="detail-meta">⇆ {conflictCount} conflicting source claims. Open sources to compare them.</p>}
      <Reveals reveals={event.reveals} tier={tier} ancestorId={event.id} />
      {openTransition && (
        <p>
          <PlayMechanic mechanism={openTransition.mechanism} tier={tier} />
        </p>
      )}
    </>
  );
}

function LineDetail({ line, tier }: { line: WorldLine; tier: Tier }) {
  const different = safeText(line.whatIsDifferent, tier);
  return (
    <>
      <h2 id="detail-title">{lineLabel(line, tier)}</h2>
      <p className="line-move">
        <Nixie value={line.divergence} size="sm" />
        <SubConfidence confidence={line.divergenceConfidence} what="Value confidence" />
      </p>
      <p className="row">
        <Badge target={lineTarget(line, tier)} />
        <MediaList media={line.media} />
      </p>
      {!line.divergence && <p className="detail-meta">No value listed.</p>}
      {different && <p>{different}</p>}
      {atLeast(tier, 'sg_ending') && disputesFor(line.id, tier).length > 0 && <p className="detail-meta">Disputed: see sources.</p>}
      <Reveals reveals={line.reveals} tier={tier} ancestorId={line.id} />
      <p>
        <a className="btn" href={href('compare', { lines: line.id.replace(/^wl-(alpha|beta)-/, 'wl-') })}>
          Compare this line
        </a>
      </p>
    </>
  );
}

function EdgeDetail({ transition, tier }: { transition: Transition; tier: Tier }) {
  const style = EDGE_STYLES[transition.mechanism];
  const cause = eventById(transition.cause);
  const description = safeText(transition.description, tier);
  const note = transition.note ? safeText(transition.note, tier) : '';
  const remembers = transition.whoRemembers.filter((w) => {
    const c = characterById(w.characterId);
    return c && isVisible(c, tier) && safeText(w.extent, tier) === w.extent;
  });
  return (
    <>
      <h2 id="detail-title">
        <MechIcon kind={transition.mechanism} size={20} /> {style.label}
      </h2>
      <p className="row">
        <Badge target={transitionTarget(transition, tier)} />
        <MediaList media={transition.media} />
      </p>
      <LineMove before={transition.from} after={transition.to} tier={tier} />
      {description && <p>{description}</p>}
      {note && <p className="detail-meta">{note}</p>}
      {transition.mechanismConfidence && <p className="detail-meta">Why this works: debated ({transition.mechanismConfidence}).</p>}
      {cause && isVisible(cause, tier) && <p className="detail-meta">Caused by: {safeText(cause.title, tier)}</p>}
      {remembers.length > 0 && (
        <>
          <h3>Who remembers</h3>
          <ul className="fact-list">
            {remembers.map((w) => (
              <li key={w.characterId} className="row">
                <CharacterGlyph id={w.characterId} size={24} /> {w.extent}
              </li>
            ))}
          </ul>
        </>
      )}
      {transition.crossesAttractorField && atLeast(tier, 'sg_part2') && <p className="detail-meta">This jump crosses a field boundary.</p>}
      <p>
        <PlayMechanic mechanism={transition.mechanism} tier={tier} />
      </p>
    </>
  );
}

export function DetailBody({ selection, tier }: { selection: Selection; tier: Tier }) {
  if (selection.kind === 'event') {
    const e = eventById(selection.id);
    return e ? <EventDetail event={e} tier={tier} /> : null;
  }
  if (selection.kind === 'line') {
    const l = worldLineById(selection.id);
    return l ? <LineDetail line={l} tier={tier} /> : null;
  }
  const t = transitionById(selection.id);
  return t ? <EdgeDetail transition={t} tier={tier} /> : null;
}

interface PanelProps {
  selection: Selection;
  tier: Tier;
  modal: boolean;
  onClose: () => void;
}

/** Docked aside on wide screens; a focus-trapped overlay or bottom sheet everywhere else. */
export function DetailPanel({ selection, tier, modal, onClose }: PanelProps) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    if (modal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && ref.current?.contains(document.activeElement)) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modal, onClose]);
  return modal ? (
    <ModalPanel selection={selection} tier={tier} onClose={onClose} />
  ) : (
    <aside ref={ref} className="detail-panel" aria-labelledby="detail-title">
      <button type="button" className="btn detail-close" onClick={onClose}>
        Close
      </button>
      <DetailBody selection={selection} tier={tier} />
    </aside>
  );
}

function ModalPanel({ selection, tier, onClose }: Omit<PanelProps, 'modal'>) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, onClose);
  return (
    <div className="sheet-layer">
      <div ref={ref} className="detail-panel detail-sheet" role="dialog" aria-modal="true" aria-labelledby="detail-title">
        <button type="button" className="btn detail-close" onClick={onClose}>
          Close
        </button>
        <DetailBody selection={selection} tier={tier} />
      </div>
    </div>
  );
}

