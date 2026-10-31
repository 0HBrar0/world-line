import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { readStore, writeStore } from './storage';
import canonMeta from '../data/meta';

export type TierId = 'premise' | 'sg_part1' | 'sg_part2' | 'sg_ending' | 'sg0' | 'extras';
export type MediaKey = 'vn' | 'anime' | 'sg0_vn' | 'sg0_anime' | 'film' | 'other';
export type MotionPref = 'system' | 'reduce' | 'full';

export const TIER_ORDER = canonMeta.spoilerTiers.map((t) => t.id as TierId);
export const MEDIA_KEYS: MediaKey[] = ['vn', 'anime', 'sg0_vn', 'sg0_anime', 'film', 'other'];
const DEFAULT_MEDIA: MediaKey[] = ['vn', 'anime'];

export function tierIndex(tier: TierId): number {
  return TIER_ORDER.indexOf(tier);
}

interface Settings {
  tier: TierId;
  setTier: (tier: TierId) => void;
  media: MediaKey[];
  toggleMedia: (key: MediaKey) => void;
  motionPref: MotionPref;
  setMotionPref: (pref: MotionPref) => void;
  legendOpen: boolean;
  setLegendOpen: (open: boolean) => void;
  /** The world line whose number the global readout shows; kept in memory only. */
  focusedLine: string | null;
  setFocusedLine: (id: string | null) => void;
  /** Session-only "Reveal this fact" peeks. */
  peeks: Set<string>;
  peek: (key: string) => void;
}

const SettingsContext = createContext<Settings | null>(null);

function defaultMediaFor(tier: TierId): MediaKey[] {
  return tierIndex(tier) >= tierIndex('sg0') ? [...DEFAULT_MEDIA, 'sg0_vn', 'sg0_anime'] : DEFAULT_MEDIA;
}

function initialTier(): TierId {
  const stored = readStore<string>('wl.tier', 'premise');
  return TIER_ORDER.includes(stored as TierId) ? (stored as TierId) : 'premise';
}

function initialMedia(tier: TierId): MediaKey[] {
  const fromUrl = new URLSearchParams(window.location.hash.split('?')[1] ?? '').get('m');
  const raw = fromUrl ? fromUrl.split(',') : readStore<string[]>('wl.media', defaultMediaFor(tier));
  const valid = raw.filter((k): k is MediaKey => MEDIA_KEYS.includes(k as MediaKey));
  return valid.length > 0 ? valid : defaultMediaFor(tier);
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [tier, setTierState] = useState<TierId>(initialTier);
  const [media, setMedia] = useState<MediaKey[]>(() => initialMedia(initialTier()));
  const [motionPref, setMotionPrefState] = useState<MotionPref>(() => readStore<MotionPref>('wl.motion', 'system'));
  const [legendOpen, setLegendOpen] = useState(false);
  const [focusedLine, setFocusedLine] = useState<string | null>(null);
  const [peeks, setPeeks] = useState<Set<string>>(() => new Set());

  const setTier = useCallback((next: TierId) => {
    setTierState(next);
    writeStore('wl.tier', next);
    setFocusedLine(null);
    setMedia((current) => {
      const sg0On = tierIndex(next) >= tierIndex('sg0');
      const updated: MediaKey[] = sg0On
        ? [...new Set<MediaKey>([...current, 'sg0_vn', 'sg0_anime'])]
        : current.filter((k) => k !== 'sg0_vn' && k !== 'sg0_anime');
      writeStore('wl.media', updated);
      return updated;
    });
  }, []);

  const toggleMedia = useCallback((key: MediaKey) => {
    setMedia((current) => {
      const updated = current.includes(key) ? current.filter((k) => k !== key) : [...current, key];
      writeStore('wl.media', updated);
      const [path, query = ''] = window.location.hash.split('?');
      const params = new URLSearchParams(query);
      params.set('m', updated.join(','));
      window.history.replaceState(null, '', `${path || '#/'}?${params.toString().replace(/%2C/g, ',')}`);
      return updated;
    });
  }, []);

  const setMotionPref = useCallback((pref: MotionPref) => {
    setMotionPrefState(pref);
    writeStore('wl.motion', pref);
  }, []);

  const peek = useCallback((key: string) => setPeeks((p) => new Set(p).add(key)), []);

  const value = useMemo(
    () => ({ tier, setTier, media, toggleMedia, motionPref, setMotionPref, legendOpen, setLegendOpen, focusedLine, setFocusedLine, peeks, peek }),
    [tier, setTier, media, toggleMedia, motionPref, setMotionPref, legendOpen, focusedLine, peeks, peek],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): Settings {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings needs SettingsProvider');
  return ctx;
}

function useSystemReducedMotion(): boolean {
  const query = '(prefers-reduced-motion: reduce)';
  const [reduced, setReduced] = useState(() => window.matchMedia?.(query).matches ?? false);
  useEffect(() => {
    const mq = window.matchMedia?.(query);
    if (!mq) return;
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

/** True when motion must be off: the in-app toggle overrides the system setting. */
export function useReduceMotion(): boolean {
  const ctx = useContext(SettingsContext);
  const system = useSystemReducedMotion();
  if (ctx?.motionPref === 'reduce') return true;
  if (ctx?.motionPref === 'full') return false;
  return system;
}
