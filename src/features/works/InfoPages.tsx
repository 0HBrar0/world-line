import { useSettings } from '../../app/settings';
import { Badge, ConfidenceLegend, SubConfidence } from '../../components/Badge';
import { Nixie } from '../../components/Nixie';
import { canon } from '../../data/load';
import type { Ending, Tier, Work } from '../../data/schema';
import { atLeast, isVisible, sourceById, worldLineById } from '../../data/selectors';
import { isTextSafe, safeText } from '../../data/tierGuard';

export function LockedPage({ title }: { title: string }) {
  return (
    <main id="main" className="page">
      <h1>{title}</h1>
      <div className="tile tile-locked">🔒 later in the story</div>
    </main>
  );
}

function EndingCard({ ending, tier }: { ending: Ending; tier: Tier }) {
  const line = ending.worldLineId ? worldLineById(ending.worldLineId) : undefined;
  const outcome = safeText(ending.outcome, tier);
  const shownLine = line && isVisible(line, tier) ? line : undefined;
  return (
    <li className={ending.isCanonical ? 'tile ending-tile is-true' : 'tile ending-tile'}>
      <h2>
        {ending.isCanonical && <span aria-hidden="true">★ </span>}
        {ending.name}
      </h2>
      <p className="detail-meta">{ending.chapter}</p>
      {shownLine?.divergence ? (
        <p className="line-move">
          <Nixie value={shownLine.divergence} size="sm" />
          <SubConfidence confidence={ending.worldLineConfidence} what="World-line confidence" />
        </p>
      ) : (
        <p className="detail-meta">No value listed</p>
      )}
      {ending.worldLineNote && <p className="detail-meta">{safeText(ending.worldLineNote, tier)}</p>}
      <p>{outcome}</p>
      <p className="detail-meta">How to reach it: {safeText(ending.howToReach, tier)}</p>
      <Badge compact target={{ title: ending.name, ...ending }} />
    </li>
  );
}

export function EndingsPage() {
  const { tier } = useSettings();
  if (!atLeast(tier, 'sg_ending')) return <LockedPage title="Endings" />;
  return (
    <main id="main" className="page">
      <h1>Original VN endings</h1>
      <ul className="tile-grid ending-grid">
        {canon.endings.map((e) => (
          <EndingCard key={e.id} ending={e} tier={tier} />
        ))}
      </ul>
    </main>
  );
}

/** Titles are premise-safe. How each work fits the story is gated by what it belongs to. */
function workTier(w: Work): Tier {
  if (w.mediaKey === 'sg0_vn' || w.mediaKey === 'sg0_anime' || w.id === 'work-sg-ep23b') return 'sg0';
  if (w.mediaKey === 'film' || w.mediaKey === 'other' || w.id === 'work-sg-ova') return 'extras';
  return 'premise';
}

// open-questions.md: never show ep 23-beta's disputed titles; S;G 0 PC dates are year-only.
const OMIT_ALT_TITLES = new Set(['work-sg-ep23b']);
const OMIT_NOTES = new Set(['work-sg0-vn']);

export function WorksPage() {
  const { tier } = useSettings();
  return (
    <main id="main" className="page">
      <h1>Works and releases</h1>
      <div className="table-scroll">
        <table className="works-table">
          <caption className="sr-only">Works, release dates and how each fits the story</caption>
          <thead>
            <tr>
              <th scope="col">Title</th>
              <th scope="col">Japan</th>
              <th scope="col">West</th>
              <th scope="col">Studio</th>
              <th scope="col">Where it fits</th>
            </tr>
          </thead>
          <tbody>
            {canon.works.map((w) => {
              const open = atLeast(tier, workTier(w));
              const status = open ? safeText(w.canonStatus.text, tier) : '';
              const placement = open ? safeText(w.placementInTimeline, tier) : '';
              const notes = open && w.notes && !OMIT_NOTES.has(w.id) ? safeText(w.notes, tier) : '';
              return (
                <tr key={w.id}>
                  <th scope="row">
                    {w.title}
                    {!OMIT_ALT_TITLES.has(w.id) && w.altTitles.length > 0 && <span className="detail-meta block">{w.altTitles.join(' · ')}</span>}
                  </th>
                  <td data-label="Japan">{w.releaseJapan ?? '—'}</td>
                  <td data-label="West">{w.releaseWest ?? '—'}</td>
                  <td data-label="Studio">{w.developerOrStudio ?? '—'}</td>
                  <td>
                    {open ? (
                      <>
                        {status && <p>{status}</p>}
                        {placement && <p className="detail-meta">{placement}</p>}
                        {notes && <p className="detail-meta">{notes}</p>}
                        <Badge compact target={{ id: w.id, title: w.title, ...w.canonStatus, sourceIds: [...new Set([...w.sourceIds, ...w.canonStatus.sourceIds])] }} />
                      </>
                    ) : (
                      <span className="detail-meta">🔒 later in the story</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}

export function DisputesPage() {
  const { tier } = useSettings();
  const shown = canon.disputes.flatMap((d) => {
    const topic = safeText(d.topic, tier);
    const versions = d.versions.filter((v) => isTextSafe(v.claim, tier));
    return isVisible(d, tier) && topic && versions.length > 0 ? [{ d, topic, versions }] : [];
  });
  return (
    <main id="main" className="page">
      <h1>What fans and sources disagree on</h1>
      <p>Nothing here is settled in the app. Each entry lists the competing versions as the sources give them.</p>
      <ul className="dispute-list">
        {shown.map(({ d, topic, versions }) => {
          const better = safeText(d.betterSupported, tier);
          return (
            <li key={d.id} className="card">
              <h2>{topic}</h2>
              <ul>
                {versions.map((v, i) => (
                  <li key={i}>{v.claim}</li>
                ))}
              </ul>
              {better && <p className="detail-meta">Better supported: {better}</p>}
              <Badge compact target={{ id: d.id, title: topic, confidence: d.confidence, sourceIds: [...new Set(versions.flatMap((v) => v.sourceIds))] }} />
            </li>
          );
        })}
      </ul>
    </main>
  );
}

export function AboutPage() {
  const { tier } = useSettings();
  const byTier = [1, 2, 3, 4].map((n) => ({ n, count: canon.sources.filter((s) => s.tier === n).length })).filter((x) => x.count > 0);
  const weak = canon.sources.filter((s) => s.status !== 'fetched');
  return (
    <main id="main" className="page entry">
      <h1>About World Line</h1>
      <p className="lede">
        An unofficial fan explainer. It is not affiliated with MAGES., Spike Chunsoft, Nitroplus, White Fox or Kadokawa. Names belong to their owners. Facts are sourced and linked.
      </p>
      <h2>No official assets</h2>
      <p>
        There is no official art, screenshot, logo, character design, music, voice or script text here. Character monograms, the abstract pod and the Nixie tubes are original drawings, and all story text is a paraphrase. Fonts are self-hosted under the SIL Open Font License.
      </p>
      <h2>Spoilers</h2>
      <p>The app starts at the premise and shows only what your chosen level allows. Locked content is not hidden with styling: it is not on the page at all.</p>
      <h2>How facts are tagged</h2>
      <ConfidenceLegend />
      <h2>Sources</h2>
      <p>
        {canon.sources.length} sources back this data. Press any confidence badge to see the sources behind that fact.
      </p>
      <ul>
        {byTier.map((x) => (
          <li key={x.n}>
            Tier {x.n}: {x.count} sources
          </li>
        ))}
      </ul>
      <p>
        {weak.length} of them failed, returned the wrong page, or were only partly read. They stay listed so you can see why a fact is weak, and no fact cites a failed page.
      </p>
      <h2>Weak or failed sources</h2>
      <ul>
        {weak
          .filter((s) => isTextSafe(`${sourceById(s.id)?.title ?? ''}`, tier))
          .map((s) => (
            <li key={s.id}>
              {s.title} <span className="pill pill-warn">{s.status}</span>
            </li>
          ))}
      </ul>
    </main>
  );
}
