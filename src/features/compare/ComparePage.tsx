import { useEffect, useMemo, useState } from 'react';
import { href, navigate, useRoute } from '../../app/router';
import { useSettings } from '../../app/settings';
import { Badge } from '../../components/Badge';
import { CharacterGlyph, EDGE_STYLES } from '../../components/glyphs';
import { MechIcon } from '../../components/MechIcon';
import { Nixie } from '../../components/Nixie';
import { useToast } from '../../components/toast';
import type { AliveDeadEntry, Tier, Transition, WorldLine } from '../../data/schema';
import { atLeast, characterById, effectiveTier, eventById, isVisible, lineFromPublicId, lineLabel, pathBetween, publicLineId, tierRank, visibleLines, visibleTransitions, worldLineById } from '../../data/selectors';
import { isTextSafe, safeText } from '../../data/tierGuard';
import { MediaList } from '../map/DetailPanel';
import { lineTarget } from '../map/targets';

const MAX_LINES = 3;

/** A fate entry the viewer may see, or null. Characters absent from aliveDead stay absent. */
function fateFor(line: WorldLine, characterId: string, tier: Tier): { status: 'alive' | 'fallen'; entry: AliveDeadEntry } | null {
  const open = (e: AliveDeadEntry) => tierRank(effectiveTier(e, line)) <= tierRank(tier);
  const alive = line.aliveDead.alive.find((e) => e.characterId === characterId && open(e));
  if (alive) return { status: 'alive', entry: alive };
  const dead = line.aliveDead.dead.find((e) => e.characterId === characterId && open(e));
  return dead ? { status: 'fallen', entry: dead } : null;
}

function FateCell({ line, characterId, tier }: { line: WorldLine; characterId: string; tier: Tier }) {
  const fate = fateFor(line, characterId, tier);
  if (!fate) return <span data-testid="fate-none">—</span>;
  const note = safeText(fate.entry.note, tier);
  return (
    <span className="fate">
      <span className={fate.status === 'fallen' ? 'fate-tag fate-fallen' : 'fate-tag fate-alive'}>
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
          <circle cx="7" cy="7" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
          {fate.status === 'fallen' ? <path d="M4.5 4.5 L9.5 9.5 M9.5 4.5 L4.5 9.5" stroke="currentColor" strokeWidth="1.5" /> : <circle cx="7" cy="7" r="2.2" fill="currentColor" />}
        </svg>{' '}
        {fate.status === 'fallen' ? 'Fallen' : 'Alive'}
      </span>
      {note && <span className="detail-meta">{note}</span>}
      <Badge compact target={{ id: line.id, title: note, ...fate.entry }} />
    </span>
  );
}

function PathStrip({ path, start, tier }: { path: Transition[]; start: string; tier: Tier }) {
  const first = worldLineById(start);
  return (
    <ol className="path-strip">
      <li className="mono">{first?.divergence ?? 'no value'}</li>
      {path.map((t) => (
        <li key={t.id}>
          <a className="path-edge" href={href('map', { ev: t.cause })} title={EDGE_STYLES[t.mechanism].label} style={{ color: EDGE_STYLES[t.mechanism].color }}>
            <MechIcon kind={t.mechanism} />
            <span className="sr-only">{EDGE_STYLES[t.mechanism].label} to</span>
          </a>
          <span className="mono">{worldLineById(t.to)?.divergence ?? 'no value'}</span>
        </li>
      ))}
      {tier === 'premise' && path.length === 0 && <li>Same line</li>}
    </ol>
  );
}

function Picker({ lines, chosen, onToggle }: { lines: WorldLine[]; chosen: string[]; onToggle: (id: string) => void }) {
  const { tier } = useSettings();
  const [query, setQuery] = useState('');
  const shown = lines.filter((l) => !query || (l.divergence ?? '').includes(query) || lineLabel(l, tier).toLowerCase().includes(query.toLowerCase()));
  const groups = atLeast(tier, 'sg_part2')
    ? [
        { label: 'Alpha', list: shown.filter((l) => l.attractorField === 'alpha') },
        { label: 'Beta', list: shown.filter((l) => l.attractorField === 'beta') },
        { label: 'Other', list: shown.filter((l) => l.attractorField !== 'alpha' && l.attractorField !== 'beta') },
      ]
    : [{ label: 'World lines', list: shown }];
  return (
    <section className="compare-picker" aria-label="Choose world lines">
      <label htmlFor="line-search">Choose up to {MAX_LINES} world lines. Search by number:</label>
      <input id="line-search" type="search" inputMode="decimal" value={query} onChange={(e) => setQuery(e.target.value)} />
      {groups
        .filter((g) => g.list.length > 0)
        .map((g) => (
          <fieldset key={g.label}>
            <legend>{g.label}</legend>
            <div className="picker-list">
              {g.list.map((l) => (
                <label key={l.id} className="picker-item">
                  <input type="checkbox" checked={chosen.includes(l.id)} disabled={!chosen.includes(l.id) && chosen.length >= MAX_LINES} onChange={() => onToggle(l.id)} />
                  <span className="mono">{l.divergence ?? 'no value'}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}
    </section>
  );
}

export function ComparePage() {
  const route = useRoute();
  const { tier, media } = useSettings();
  const toast = useToast();
  const lines = useMemo(() => visibleLines(tier, media), [tier, media]);

  const requested = (route.query.get('lines') ?? '').split(',').filter(Boolean);
  const resolved = requested.map(lineFromPublicId);
  const chosen = resolved.filter((l): l is WorldLine => !!l && isVisible(l, tier)).slice(0, MAX_LINES);
  const locked = resolved.length !== chosen.length;

  const setChosen = (next: WorldLine[]) => navigate('compare', { lines: next.map((l) => publicLineId(l.id)).join(',') }, true);

  useEffect(() => {
    if (locked) {
      toast.showLocked();
      navigate('compare', { lines: chosen.map((l) => publicLineId(l.id)).join(',') }, true);
    }
  }, [locked, chosen, toast]);

  const toggle = (id: string) => {
    const has = chosen.some((l) => l.id === id);
    const line = worldLineById(id);
    if (!line) return;
    setChosen(has ? chosen.filter((l) => l.id !== id) : [...chosen, line]);
  };

  const characterIds = [...new Set(chosen.flatMap((l) => [...l.aliveDead.alive, ...l.aliveDead.dead].map((a) => a.characterId)))].filter((id) => {
    const c = characterById(id);
    // A row of only dashes would still hint that locked fates exist, so it needs one open entry.
    return c && isVisible(c, tier) && chosen.some((l) => fateFor(l, id, tier));
  });

  const allowed = visibleTransitions(tier, media);
  const hops = chosen.slice(1).map((line, i) => {
    const from = chosen[i];
    const forward = pathBetween(from.id, line.id, allowed);
    if (forward) return { key: line.id, start: from.id, path: forward };
    const backward = pathBetween(line.id, from.id, allowed);
    return { key: line.id, start: line.id, path: backward };
  });

  const differs = (values: string[]) => new Set(values).size > 1;
  const texts = chosen.map((l) => safeText(l.whatIsDifferent, tier));

  return (
    <main id="main" className="page">
      <h1>Compare world lines</h1>
      <Picker lines={lines} chosen={chosen.map((l) => l.id)} onToggle={toggle} />
      {chosen.length === 0 && <p>Pick two or three lines to see them side by side.</p>}
      {chosen.length > 0 && (
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- keyboard users must be able to scroll this region
        <div className="compare-scroll" tabIndex={0} role="region" aria-label="Comparison table, scrolls sideways">
          <table className="compare-table">
            <caption className="sr-only">Selected world lines, side by side</caption>
            <thead>
              <tr>
                <td />
                {chosen.map((l) => (
                  <th key={l.id} scope="col">
                    <Nixie value={l.divergence} size="sm" />
                    <span className="compare-label">{lineLabel(l, tier)}</span>
                    <Badge compact target={lineTarget(l, tier)} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className={differs(texts) ? 'differs' : undefined}>
                <th scope="row">What's different</th>
                {chosen.map((l, i) => (
                  <td key={l.id}>{texts[i] || '—'}</td>
                ))}
              </tr>
              {characterIds.map((id) => (
                <tr key={id} className={differs(chosen.map((l) => fateFor(l, id, tier)?.status ?? '—')) ? 'differs' : undefined}>
                  <th scope="row">
                    <CharacterGlyph id={id} size={24} /> {characterById(id)?.name}
                  </th>
                  {chosen.map((l) => (
                    <td key={l.id}>
                      <FateCell line={l} characterId={id} tier={tier} />
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <th scope="row">Key events</th>
                {chosen.map((l) => {
                  const events = l.keyEventIds.flatMap((id) => {
                    const e = eventById(id);
                    return e && isVisible(e, tier) ? [e] : [];
                  });
                  return (
                    <td key={l.id}>
                      {events.length === 0 ? (
                        '—'
                      ) : (
                        <details>
                          <summary>
                            {events.length} key {events.length === 1 ? 'event' : 'events'}
                          </summary>
                          <ul className="fact-list">
                            {events.map((e) => (
                              <li key={e.id}>
                                <a href={href('map', { ev: e.id })}>{safeText(e.title, tier)}</a>
                              </li>
                            ))}
                          </ul>
                        </details>
                      )}
                    </td>
                  );
                })}
              </tr>
              <tr>
                <th scope="row">Seen in</th>
                {chosen.map((l) => (
                  <td key={l.id}>
                    <MediaList media={l.media} />
                  </td>
                ))}
              </tr>
              <tr>
                <th scope="row">Alternate values</th>
                {chosen.map((l) => {
                  const values = l.alternateValues.filter((a) => isTextSafe(`${a.value ?? ''} ${a.note}`, tier));
                  return (
                    <td key={l.id}>
                      {values.length === 0
                        ? '—'
                        : values.map((a, i) => (
                            <p key={i} className="detail-meta">
                              {a.value && <code className="mono">{a.value}</code>} {a.note} <Badge compact target={{ id: l.id, title: a.note, ...a }} />
                            </p>
                          ))}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      )}
      {hops.length > 0 && (
        <section className="path-section">
          <h2>Path between these lines</h2>
          {hops.map((hop) =>
            hop.path ? (
              <PathStrip key={hop.key} path={hop.path} start={hop.start} tier={tier} />
            ) : (
              <p key={hop.key} data-testid="no-path">
                No mapped path (see open questions)
              </p>
            ),
          )}
        </section>
      )}
    </main>
  );
}
