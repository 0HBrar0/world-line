import { EDGE_STYLES } from '../../components/glyphs';
import type { Media, Mechanism, Tier } from '../../data/schema';
import { visibleTransitions } from '../../data/selectors';
import { HopSwatch } from './HopMark';
import type { MapModel } from './layout';

const ORDER: Mechanism[] = ['dmail', 'dmail_cancellation', 'time_machine', 'database_erasure', 'other'];

function Line({ kind }: { kind: 'thread' | 'strand' | 'gap' | 'bead' | 'knot' | 'end' | 'side' }) {
  return (
    <svg className={`key-swatch key-${kind}`} width="30" height="20" viewBox="0 0 30 20" aria-hidden="true">
      {kind === 'knot' ? (
        <>
          <path d="M1 4 C10 4 12 10 20 10 M1 16 C10 16 12 10 20 10 M1 10 H20" />
          <circle cx="22" cy="10" r="5" />
        </>
      ) : (
        <>
          <line x1="1" x2="29" y1="10" y2="10" />
          {(kind === 'bead' || kind === 'end') && <circle cx="15" cy="10" r="5" />}
        </>
      )}
    </svg>
  );
}

/**
 * How to read the map, in the map's own words. Every entry is drawn from what is on the map right now,
 * so a part the visitor has not reached is neither named nor hinted at.
 */
export function RopeKey({ model, tier, media }: { model: MapModel; tier: Tier; media: Media[] }) {
  const kinds = new Set(visibleTransitions(tier, media).filter((t) => t.from !== t.to).map((t) => t.mechanism));
  const hops = ORDER.filter((m) => kinds.has(m));
  const free = model.rows.some((r) => r.kind === 'steins_gate');
  const side = model.edges.some((e) => e.branch);
  return (
    <ul className="rope-key" aria-label="How to read the map">
      <li>
        <Line kind="thread" />
        <span>
          <strong>Thread</strong> one world line
        </span>
      </li>
      <li>
        <Line kind="strand" />
        <span>
          <strong>Red strand</strong> the path lived
        </span>
      </li>
      <li>
        <Line kind="bead" />
        <span>
          <strong>Bead</strong> an event
        </span>
      </li>
      {hops.map((m) => (
        <li key={m}>
          <HopSwatch mechanism={m} />
          <span>
            <strong>Hop</strong> {EDGE_STYLES[m].label}
          </span>
        </li>
      ))}
      {model.boundaryY !== null && (
        <li>
          <Line kind="gap" />
          <span>
            <strong>The gap</strong> {model.boundaryLabel}
          </span>
        </li>
      )}
      {model.ropes.length > 0 && (
        <li>
          <Line kind="knot" />
          <span>
            <strong>Rope and knot</strong> threads bound to one outcome
          </span>
        </li>
      )}
      {free && (
        <li>
          <Line kind="thread" />
          <span>
            <strong>Free thread</strong> in neither rope
          </span>
        </li>
      )}
      {side && (
        <li>
          <Line kind="side" />
          <span>
            <strong>Dotted hop</strong> an ending off the main path
          </span>
        </li>
      )}
      {model.latestId && (
        <li>
          <Line kind="end" />
          <span>
            <strong>Red bead</strong> as far as you have unlocked
          </span>
        </li>
      )}
    </ul>
  );
}
