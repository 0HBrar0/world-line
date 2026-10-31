import type { Confidence } from '../data/schema';
import { canon } from '../data/load';
import { splitClauses } from '../data/tierGuard';
import { useSourceDrawer, type SourceTarget } from './drawer';

const ICONS: Record<Confidence, string> = { CONFIRMED: '✔', INTERPRETATION: '◐', UNCLEAR: '?' };

/** The definition without the note addressed to builders. */
export function confidenceDefinition(level: Confidence): string {
  return splitClauses(canon.meta.confidenceLevels[level])
    .filter((c) => !/singleSource|UI shows/.test(c))
    .join(' ');
}

export function badgeText(item: { confidence?: Confidence; singleSource?: boolean; singleSourceKind?: string }): string {
  const confidence = item.confidence ?? 'UNCLEAR';
  const fanWiki = confidence === 'CONFIRMED' && item.singleSource && item.singleSourceKind === 'fan_wiki';
  return fanWiki ? `${confidence} · per fan wiki` : confidence;
}

/**
 * The confidence pill. It is also the source affordance: pressing it opens the source drawer,
 * so every fact that shows a badge links to its sources.
 */
export function Badge({ target, compact = false }: { target: SourceTarget; compact?: boolean }) {
  const openDrawer = useSourceDrawer();
  const confidence = target.confidence ?? 'UNCLEAR';
  const text = badgeText(target);
  return (
    <button
      type="button"
      className={`badge badge-${confidence.toLowerCase()}${compact ? ' badge-compact' : ''}`}
      title={confidenceDefinition(confidence)}
      aria-label={`${text}. Open sources.`}
      onClick={() => openDrawer(target)}
    >
      <span aria-hidden="true">{ICONS[confidence]}</span> {text}
    </button>
  );
}

/** A small dot beside a date or number whose own confidence differs from the fact's. */
export function SubConfidence({ confidence, what }: { confidence?: Confidence; what: string }) {
  if (!confidence || confidence === 'CONFIRMED') return null;
  return <span className={`sub-dot sub-${confidence.toLowerCase()}`} role="note" title={`${what}: ${confidence}`} aria-label={`${what}: ${confidence}`} />;
}

export function ConfidenceLegend() {
  const levels: Confidence[] = ['CONFIRMED', 'INTERPRETATION', 'UNCLEAR'];
  return (
    <section className="legend" aria-label="Confidence legend">
      {levels.map((level) => (
        <p key={level}>
          <span className={`badge badge-${level.toLowerCase()}`}>
            <span aria-hidden="true">{ICONS[level]}</span> {level}
          </span>{' '}
          {confidenceDefinition(level)}
        </p>
      ))}
    </section>
  );
}
