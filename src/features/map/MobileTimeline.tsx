import { Badge } from '../../components/Badge';
import { EDGE_STYLES } from '../../components/glyphs';
import { MechIcon } from '../../components/MechIcon';
import { formatDate } from '../../components/format';
import type { Media, StoryEvent, Tier } from '../../data/schema';
import { atLeast, transitionById, transitionTier, tierRank, visibleEvents, worldLineById, type EventOrder } from '../../data/selectors';
import { safeText } from '../../data/tierGuard';
import type { Selection } from './DetailPanel';
import { eventLine } from './layout';
import { eventTarget } from './targets';

function railClass(e: StoryEvent, tier: Tier): string {
  if (!atLeast(tier, 'sg_part2')) return 'rail-neutral';
  const id = eventLine(e);
  const field = id ? worldLineById(id)?.attractorField : null;
  if (e.lane === 'sg0') return 'rail-sg0';
  return field === 'alpha' ? 'rail-alpha' : field === 'beta' ? 'rail-beta' : field === 'steins_gate' ? 'rail-sg' : 'rail-neutral';
}

/** Below 768 px the map becomes a vertical timeline: time runs top to bottom. */
export function MobileTimeline({ tier, media, order, onOpen }: { tier: Tier; media: Media[]; order: EventOrder; onOpen: (s: Selection) => void }) {
  const events = visibleEvents(tier, media, order);
  return (
    <ol className="vtimeline" aria-label="World-line timeline">
      {events.map((e) => {
        const lineId = eventLine(e);
        const line = lineId ? worldLineById(lineId) : undefined;
        const visibleLine = line && tierRank(line.spoilerTier) <= tierRank(tier) ? line : undefined;
        const t = e.transitionId ? transitionById(e.transitionId) : undefined;
        const openT = t && tierRank(transitionTier(t)) <= tierRank(tier) ? t : undefined;
        const to = openT ? worldLineById(openT.to) : undefined;
        const value = visibleLine?.divergenceNumeric;
        return (
          <li key={e.id} className={`vrow ${railClass(e, tier)}`} data-node={e.id}>
            <button type="button" className="vrow-main" onClick={() => onOpen({ kind: 'event', id: e.id })}>
              <span className="mono vrow-value">{visibleLine?.divergence ?? '------'}</span>
              {value !== null && value !== undefined && (
                <span className="mini-axis" aria-hidden="true">
                  <span className="mini-dot" style={{ left: `${Math.max(0, Math.min(1, value / 2)) * 100}%` }} />
                </span>
              )}
              <span className="detail-meta">{formatDate(e)}</span>
              <strong>{safeText(e.title, tier)}</strong>
            </button>
            <Badge compact target={eventTarget(e, tier)} />
            {openT && (
              <button type="button" className="chip vrow-edge" onClick={() => onOpen({ kind: 'edge', id: openT.id })}>
                <MechIcon kind={openT.mechanism} /> {EDGE_STYLES[openT.mechanism].label} → {to?.divergence ?? 'no value'}
              </button>
            )}
          </li>
        );
      })}
    </ol>
  );
}
