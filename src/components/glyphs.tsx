import type { Mechanism } from '../data/schema';
import { characterById } from '../data/selectors';

// Presentation choices, not story facts: original monogram rings instead of any likeness.
const MONOGRAMS: Record<string, { mono: string; color: string }> = {
  okabe: { mono: 'OK', color: '#ff8a1f' },
  kurisu: { mono: 'KM', color: '#ff5a6e' },
  mayuri: { mono: 'MS', color: '#7fd1ae' },
  daru: { mono: 'DA', color: '#e6c84a' },
  suzuha: { mono: 'SA', color: '#8bd450' },
  luka: { mono: 'LU', color: '#b79cff' },
  faris: { mono: 'FA', color: '#ff9ed8' },
  moeka: { mono: 'MK', color: '#9db4c0' },
  yugo: { mono: 'YT', color: '#d9a066' },
  nae: { mono: 'NT', color: '#f4b6c2' },
  nakabachi: { mono: 'NA', color: '#c2b280' },
  yukitaka: { mono: 'YA', color: '#a3c4f3' },
  yuki: { mono: 'YU', color: '#ffd6a5' },
  maho: { mono: 'MH', color: '#caffbf' },
  leskinen: { mono: 'AL', color: '#bdb2ff' },
  kagari: { mono: 'KS', color: '#ffadad' },
  'amadeus-kurisu': { mono: 'AM', color: '#9bf6ff' },
  'judy-reyes': { mono: 'JR', color: '#d0d0d0' },
  'katsumi-nakase': { mono: 'KN', color: '#fdffb6' },
  'kaede-kurushima': { mono: 'KK', color: '#e0c3fc' },
};

export function CharacterGlyph({ id, size = 30 }: { id: string; size?: number }) {
  const glyph = MONOGRAMS[id] ?? { mono: '??', color: '#a9b4bf' };
  const name = characterById(id)?.name ?? '';
  return (
    <svg className="glyph" width={size} height={size} viewBox="0 0 32 32" role="img" aria-label={name}>
      <circle cx="16" cy="16" r="14" fill="#12161b" stroke={glyph.color} strokeWidth="2.5" />
      <text x="16" y="20.5" textAnchor="middle" fontSize="12" fontWeight="700" fontFamily="var(--font-mono)" fill={glyph.color}>
        {glyph.mono}
      </text>
    </svg>
  );
}

export interface EdgeStyle {
  color: string;
  dash?: string;
  label: string;
  double?: boolean;
}

export const EDGE_STYLES: Record<Mechanism, EdgeStyle> = {
  dmail: { color: 'var(--edge-dmail)', label: 'D-Mail' },
  dmail_cancellation: { color: 'var(--edge-cancel)', dash: '8 4', label: 'D-Mail cancellation' },
  time_machine: { color: 'var(--edge-machine)', label: 'Time machine', double: true },
  database_erasure: { color: 'var(--edge-erasure)', dash: '10 3 2 3', label: 'Database erasure' },
  other: { color: 'var(--edge-other)', dash: '3 3', label: 'Other or unstated' },
};

/** The mechanic explainer behind each edge type, when there is one. */
export const MECHANIC_FOR_EDGE: Partial<Record<Mechanism, string>> = {
  dmail: 'dmail',
  dmail_cancellation: 'dmail',
  time_machine: 'time_machine',
  database_erasure: 'attractor_field',
};
