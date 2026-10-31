import { useEffect, useMemo, useState } from 'react';
import { href, navigate } from '../../app/router';
import { useSettings } from '../../app/settings';
import { Badge } from '../../components/Badge';
import type { SourceTarget } from '../../components/drawer';
import { Linked, Term } from '../../components/Term';
import { useToast } from '../../components/toast';
import type { GlossaryEntry } from '../../data/schema';
import { glossaryById, glossarySearchIndex, isVisible } from '../../data/selectors';
import { safeText } from '../../data/tierGuard';
import { Reveals } from '../map/DetailPanel';
import { searchGlossary } from './search';

const CATEGORIES: GlossaryEntry['category'][] = ['device', 'theory', 'organization', 'operation', 'phenomenon', 'place', 'other'];

// open-questions.md: this entry's only detail is a date the UI must omit.
const OMIT_DETAILS = new Set(['gl-operation-helheim']);

export function glossaryTarget(g: GlossaryEntry): SourceTarget {
  return { id: g.id, title: g.term, confidence: g.confidence, sourceIds: g.sourceIds, singleSource: g.singleSource, singleSourceKind: g.singleSourceKind };
}

function RealWorldTag({ entry }: { entry: { realWorld?: boolean } }) {
  return entry.realWorld ? <span className="pill pill-real">Real world</span> : null;
}

export function GlossaryIndex() {
  const { tier } = useSettings();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const index = useMemo(() => glossarySearchIndex(tier), [tier]);
  const results = searchGlossary(index, query).filter((g) => !category || g.category === category);

  return (
    <main id="main" className="page">
      <h1>Glossary</h1>
      <label className="search-label" htmlFor="glossary-search">
        Search terms
      </label>
      <input id="glossary-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)} />
      <div className="chips glossary-chips" role="group" aria-label="Filter by category">
        {CATEGORIES.map((c) => (
          <button key={c} type="button" className="chip" aria-pressed={category === c} onClick={() => setCategory(category === c ? null : c)}>
            {c}
          </button>
        ))}
      </div>
      <p role="status" className="detail-meta">
        {results.length} {results.length === 1 ? 'term' : 'terms'}
      </p>
      <ul className="tile-grid" data-testid="glossary-results">
        {results.map((g) => {
          const entry = glossaryById(g.id)!;
          return (
            <li key={g.id}>
              <div className="tile">
                <h2>
                  <a href={href(`glossary/${g.id}`)}>{g.term}</a> <RealWorldTag entry={entry} />
                </h2>
                <p>{g.plainLanguage || 'Details unlock at a later spoiler level.'}</p>
                <Badge compact target={glossaryTarget(entry)} />
              </div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}

export function GlossaryEntryPage({ id }: { id: string }) {
  const { tier } = useSettings();
  const toast = useToast();
  const entry = glossaryById(id);
  const open = !!entry && isVisible(entry, tier);

  useEffect(() => {
    if (!open) {
      toast.showLocked();
      navigate('glossary', undefined, true);
    }
  }, [open, toast]);

  if (!entry || !open) return null;
  const plain = safeText(entry.plainLanguage, tier);
  const details = OMIT_DETAILS.has(entry.id) ? '' : safeText(entry.details, tier);
  const related = entry.relatedIds.flatMap((rid) => {
    const r = glossaryById(rid);
    return r && isVisible(r, tier) ? [r] : [];
  });
  const aliases = entry.aliases.filter((a) => safeText(a, tier) === a);

  return (
    <main id="main" className="page entry">
      <p>
        <a href={href('glossary')}>All terms</a>
      </p>
      <h1>
        {entry.term} <RealWorldTag entry={entry} />
      </h1>
      {aliases.length > 0 && <p className="detail-meta">Also: {aliases.join(', ')}</p>}
      <p className="lede">
        <Linked text={plain || 'Details unlock at a later spoiler level.'} tier={tier} />
      </p>
      <p className="row">
        <Badge target={glossaryTarget(entry)} />
        <span className="pill">{entry.category}</span>
      </p>
      {details && (
        <details>
          <summary>More detail</summary>
          <p>{details}</p>
        </details>
      )}
      <Reveals reveals={entry.reveals} tier={tier} ancestorId={entry.id} />
      {related.length > 0 && (
        <section>
          <h2>Related terms</h2>
          <ul className="fact-list">
            {related.map((r) => (
              <li key={r.id}>
                <Term id={r.id}>{r.term}</Term>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
