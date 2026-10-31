import { useSettings } from '../../app/settings';
import { Badge } from '../../components/Badge';
import { EDGE_STYLES } from '../../components/glyphs';
import { formatDate } from '../../components/format';
import type { Media, Tier } from '../../data/schema';
import { lineLabel, transitionById, transitionTier, tierRank, visibleEvents, visibleLines, worldLineById, type EventOrder } from '../../data/selectors';
import { safeText } from '../../data/tierGuard';
import { eventTarget, lineTarget } from './targets';

/** The text alternative for the whole map: same content, always in the DOM, optionally visible. */
export function MapList({ tier, media, order, visible }: { tier: Tier; media: Media[]; order: EventOrder; visible: boolean }) {
  const events = visibleEvents(tier, media, order);
  return (
    <section id="map-list" className={visible ? 'map-list' : 'sr-only'} aria-label="Map as list">
      <h2>Map as list</h2>
      <ol>
        {events.map((e) => {
          const t = e.transitionId ? transitionById(e.transitionId) : undefined;
          const to = t && tierRank(transitionTier(t)) <= tierRank(tier) ? worldLineById(t.to) : undefined;
          return (
            <li key={e.id}>
              <strong>{safeText(e.title, tier)}</strong> ({formatDate(e)}) <Badge compact target={eventTarget(e, tier)} />
              <br />
              {safeText(e.summary, tier)}
              {t && to && (
                <>
                  {' '}
                  {EDGE_STYLES[t.mechanism].label} to world line {to.divergence ?? 'with no listed value'}.
                </>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/** Spin-off values, shown only with the extras tier and the Other chip. */
export function SpinOffGutter({ tier, media, onOpen }: { tier: Tier; media: Media[]; onOpen: (id: string) => void }) {
  const { legendOpen } = useSettings();
  const lines = visibleLines(tier, media).filter((l) => l.lane === 'spinoff');
  if (lines.length === 0) return null;
  return (
    <details className="spinoff-gutter" open={!legendOpen}>
      <summary>Spin-offs gutter ({lines.length} values)</summary>
      <ul className="spinoff-list">
        {lines.map((l) => (
          <li key={l.id}>
            <button type="button" className="btn btn-small mono" title={lineLabel(l, tier)} onClick={() => onOpen(l.id)}>
              {l.divergence}
            </button>
            <Badge compact target={lineTarget(l, tier)} />
          </li>
        ))}
      </ul>
    </details>
  );
}
