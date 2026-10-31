import { useCallback, useEffect, useRef, useState } from 'react';
import { href, useRoute } from '../app/router';
import { MEDIA_KEYS, tierIndex, useSettings, type MediaKey, type TierId } from '../app/settings';
import canonMeta from '../data/meta';
import { Nixie } from './Nixie';
import { useFocusTrap } from './useFocusTrap';

const TABS: Array<{ path: string; label: string }> = [
  { path: 'map', label: 'Map' },
  { path: 'follow', label: 'Follow' },
  { path: 'mechanics', label: 'Mechanics' },
  { path: 'compare', label: 'Compare' },
  { path: 'glossary', label: 'Glossary' },
  { path: 'characters', label: 'Characters' },
  { path: 'sg0', label: 'S;G 0' },
  { path: 'endings', label: 'Endings' },
  { path: 'works', label: 'Works' },
  { path: 'disputes', label: 'Disputes' },
  { path: 'about', label: 'About' },
];

export const MEDIA_LABELS: Record<MediaKey, string> = {
  vn: 'VN',
  anime: 'Anime',
  sg0_vn: 'S;G 0 VN',
  sg0_anime: 'S;G 0 Anime',
  film: 'Film',
  other: 'Other',
};

function TierConfirm({ onYes, onNo }: { onYes: () => void; onNo: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, onNo);
  return (
    <div ref={ref} className="tier-confirm" role="alertdialog" aria-modal="true" aria-labelledby="tier-confirm-text">
      <p id="tier-confirm-text">This will reveal story content up to the level you picked. It can't be unseen.</p>
      <div className="row">
        <button type="button" className="btn btn-primary" onClick={onYes}>
          Yes, reveal
        </button>
        <button type="button" className="btn" onClick={onNo}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export function TierControl() {
  const { tier, setTier } = useSettings();
  const [pending, setPending] = useState<TierId | null>(null);

  const cancel = useCallback(() => setPending(null), []);

  const choose = (next: TierId) => {
    // Going past part 1 asks once, so nobody lands on spoilers by a stray click.
    if (tierIndex(next) > tierIndex('sg_part1') && tierIndex(next) > tierIndex(tier)) setPending(next);
    else setTier(next);
  };

  return (
    <div className="tier-control">
      <label htmlFor="tier-select">How far have you watched or read?</label>
      <select id="tier-select" value={tier} onChange={(e) => choose(e.target.value as TierId)}>
        {canonMeta.spoilerTiers.map((t) => (
          <option key={t.id} value={t.id}>
            {t.label}
          </option>
        ))}
      </select>
      {pending && (
        <TierConfirm
          onYes={() => {
            setTier(pending);
            setPending(null);
          }}
          onNo={cancel}
        />
      )}
    </div>
  );
}

export function MediaChips() {
  const { media, toggleMedia } = useSettings();
  return (
    <div className="chips" role="group" aria-label="Filter by media">
      {MEDIA_KEYS.map((key) => (
        <button key={key} type="button" className="chip" aria-pressed={media.includes(key)} onClick={() => toggleMedia(key)}>
          {MEDIA_LABELS[key]}
        </button>
      ))}
    </div>
  );
}

export function TopBar({ readout }: { readout: string | null }) {
  const route = useRoute();
  const { legendOpen, setLegendOpen, motionPref, setMotionPref } = useSettings();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const controls = useRef<HTMLDivElement>(null);
  const active = route.path[0] ?? '';
  const reduceOn = motionPref === 'reduce';

  useEffect(() => {
    if (!filtersOpen) return;
    const close = (e: Event) => {
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : !controls.current?.contains(e.target as Node)) setFiltersOpen(false);
    };
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('pointerdown', close);
      document.removeEventListener('keydown', close);
    };
  }, [filtersOpen]);

  return (
    <header className="topbar">
      <div className="topbar-row">
        <a className="wordmark" href={href('')}>
          World Line
        </a>
        <Nixie value={readout} size="sm" />
        <nav aria-label="Main" className="tabs">
          {TABS.map((tab) => (
            <a key={tab.path} href={href(tab.path)} aria-current={active === tab.path ? 'page' : undefined}>
              {tab.label}
            </a>
          ))}
        </nav>
      </div>
      <div ref={controls} className="topbar-row topbar-controls">
        <TierControl />
        <button type="button" className="btn filters-toggle" aria-expanded={filtersOpen} onClick={() => setFiltersOpen((open) => !open)}>
          Filters
        </button>
        <div className={filtersOpen ? 'filters filters-open' : 'filters'}>
          <MediaChips />
          <button type="button" className="btn btn-quiet" aria-pressed={legendOpen} onClick={() => setLegendOpen(!legendOpen)}>
            Confidence legend
          </button>
          <button type="button" className="btn btn-quiet" aria-pressed={reduceOn} onClick={() => setMotionPref(reduceOn ? 'system' : 'reduce')}>
            Reduce motion
          </button>
        </div>
      </div>
    </header>
  );
}
