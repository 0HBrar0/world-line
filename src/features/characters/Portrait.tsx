import { useId, type ReactNode } from 'react';
import { glyphColor } from '../../components/glyphs';

// Original poster art: a faceless silhouette over an abstract pattern in the character's colour.
// Nothing here copies a character design or hints at the story; the shapes are only there to tell posters apart.

type Hair = 'short' | 'spiky' | 'long' | 'bob' | 'pony' | 'twin' | 'bun' | 'wavy' | 'side';
type Body = 'coat' | 'plain' | 'high' | 'open';
type Motif = 'rays' | 'rings' | 'waves' | 'grid' | 'orbit' | 'petals' | 'shards' | 'dots' | 'circuit' | 'scan';

const LOOKS: Record<string, { hair: Hair; body: Body; motif: Motif; flip?: boolean }> = {
  okabe: { hair: 'spiky', body: 'coat', motif: 'rays' },
  kurisu: { hair: 'long', body: 'open', motif: 'orbit' },
  mayuri: { hair: 'bob', body: 'plain', motif: 'petals' },
  daru: { hair: 'short', body: 'high', motif: 'circuit' },
  suzuha: { hair: 'twin', body: 'high', motif: 'shards' },
  luka: { hair: 'bob', body: 'high', motif: 'waves', flip: true },
  faris: { hair: 'twin', body: 'plain', motif: 'dots' },
  moeka: { hair: 'side', body: 'open', motif: 'scan' },
  yugo: { hair: 'short', body: 'plain', motif: 'grid' },
  nae: { hair: 'pony', body: 'plain', motif: 'petals', flip: true },
  nakabachi: { hair: 'spiky', body: 'coat', motif: 'grid', flip: true },
  yukitaka: { hair: 'short', body: 'high', motif: 'waves' },
  yuki: { hair: 'wavy', body: 'plain', motif: 'rings' },
  maho: { hair: 'bun', body: 'coat', motif: 'orbit', flip: true },
  leskinen: { hair: 'side', body: 'coat', motif: 'rings', flip: true },
  kagari: { hair: 'long', body: 'high', motif: 'shards', flip: true },
  'amadeus-kurisu': { hair: 'long', body: 'plain', motif: 'scan', flip: true },
  'judy-reyes': { hair: 'pony', body: 'coat', motif: 'circuit', flip: true },
  'katsumi-nakase': { hair: 'bob', body: 'open', motif: 'dots', flip: true },
  'kaede-kurushima': { hair: 'wavy', body: 'open', motif: 'rays', flip: true },
};

const FALLBACK = { hair: 'short', body: 'plain', motif: 'rings' } as const;

const SHOULDERS = 'M26 500C36 402 120 374 170 352C180 342 180 300 176 270H224C220 300 220 342 230 352C280 374 364 402 374 500Z';
// Patterns that run off the poster repeat sideways, so wide tiles stay covered.
const TILED: Motif[] = ['waves', 'grid', 'dots', 'circuit', 'scan', 'shards'];
const HAIR: Record<Hair, string[]> = {
  short: ['M130 214C112 96 288 96 270 214C262 176 236 160 200 160S138 176 130 214Z'],
  spiky: ['M126 222L112 170 134 158 122 118 156 124 164 88 196 112 226 84 240 122 276 116 268 158 290 172 274 222C262 178 236 160 200 160S138 178 126 222Z'],
  long: ['M124 196C112 76 288 76 276 196C284 250 300 306 288 362C268 346 258 304 256 262H144C142 304 132 346 112 362C100 306 116 250 124 196Z'],
  bob: ['M122 200C108 84 292 84 278 200C286 250 288 280 276 304H238V240H162V304H124C112 280 114 250 122 200Z'],
  pony: ['M130 214C112 96 288 96 270 214C262 176 236 160 200 160S138 176 130 214Z', 'M258 128C318 112 346 176 330 250C322 296 300 326 278 346C292 286 296 216 262 170Z'],
  twin: ['M130 214C112 96 288 96 270 214C262 176 236 160 200 160S138 176 130 214Z', 'M134 148C80 150 62 230 76 306C84 340 100 356 116 366C108 310 110 240 142 194Z', 'M266 148C320 150 338 230 324 306C316 340 300 356 284 366C292 310 290 240 258 194Z'],
  bun: ['M130 214C112 96 288 96 270 214C262 176 236 160 200 160S138 176 130 214Z', 'M200 62a38 38 0 1 0 .1 0Z'],
  wavy: ['M122 196C110 74 290 74 278 196C298 226 280 256 296 288C310 316 296 340 304 372C276 356 262 310 258 262H142C138 310 124 356 96 372C104 340 90 316 104 288C120 256 102 226 122 196Z'],
  side: ['M128 216C106 90 292 86 274 208C282 262 300 300 296 356C272 330 262 280 262 226C250 178 214 150 160 158C142 170 134 190 128 216Z'],
};

function motif(kind: Motif, color: string): ReactNode {
  const line = { fill: 'none', stroke: color, strokeWidth: 2 };
  const spread = (count: number) => Array.from({ length: count }, (_, i) => i);
  switch (kind) {
    case 'rays':
      return spread(28).map((i) => {
        const a = (i / 28) * Math.PI * 2;
        return <line key={i} x1={200 + Math.cos(a) * 110} y1={200 + Math.sin(a) * 110} x2={200 + Math.cos(a) * 520} y2={200 + Math.sin(a) * 520} {...line} strokeWidth={i % 2 ? 1 : 3} />;
      });
    case 'rings':
      return spread(11).map((i) => <circle key={i} cx="200" cy="205" r={96 + i * 34} {...line} strokeWidth={1 + (i % 3)} />);
    case 'waves':
      return spread(16).map((i) => {
        const y = 10 + i * 34;
        return <path key={i} d={`M-20 ${y}C60 ${y - 40} 120 ${y + 40} 200 ${y}S340 ${y - 40} 420 ${y}`} {...line} />;
      });
    case 'grid':
      return spread(15).map((i) => (
        <g key={i}>
          <line x1={i * 30} y1="0" x2={i * 30} y2="500" {...line} strokeWidth={1} />
          <line x1="0" y1={i * 36} x2="400" y2={i * 36} {...line} strokeWidth={1} />
        </g>
      ));
    case 'orbit':
      return spread(5).map((i) => <ellipse key={i} cx="200" cy="205" rx="330" ry={70 + i * 34} transform={`rotate(${-34 + i * 32} 200 205)`} {...line} />);
    case 'petals':
      return spread(14).map((i) => <ellipse key={i} cx="200" cy="48" rx="46" ry="158" transform={`rotate(${(i / 14) * 360} 200 205)`} {...line} strokeWidth={1.5} />);
    case 'shards':
      return spread(12).map((i) => <path key={i} d={`M${(i * 83) % 400} ${(i * 131) % 460}l${40 + (i * 17) % 50} ${-70 - (i * 23) % 60}l${30 + (i * 11) % 30} ${90 + (i * 7) % 40}Z`} fill={color} opacity={0.5} />);
    case 'dots':
      return spread(64).map((i) => <circle key={i} cx={20 + (i % 8) * 52 + ((i >> 3) % 2) * 26} cy={22 + (i >> 3) * 62} r={3 + (i % 5) * 2.4} fill={color} />);
    case 'circuit':
      return spread(14).map((i) => {
        const x = 16 + i * 28;
        const turn = 60 + ((i * 53) % 230);
        return (
          <g key={i}>
            <path d={`M${x} 0V${turn}l${i % 2 ? 34 : -34} 34V500`} {...line} />
            <circle cx={x} cy={turn} r="5" fill={color} />
          </g>
        );
      });
    case 'scan':
      return spread(42).map((i) => <rect key={i} x="0" y={i * 12} width="400" height={1 + (i % 4)} fill={color} />);
  }
}

export function Portrait({ id, className }: { id: string; className?: string }) {
  const look = LOOKS[id] ?? FALLBACK;
  const color = glyphColor(id);
  const uid = useId().replace(/:/g, '');
  const hair = HAIR[look.hair].map((d) => <path key={d} d={d} />);
  const figure = (
    <>
      {hair}
      <path d={SHOULDERS} />
      <ellipse cx="200" cy="208" rx="60" ry="74" />
    </>
  );
  return (
    <svg className={className} viewBox="0 0 400 500" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <defs>
        <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" stopColor={color} />
          <stop offset="0.62" stopColor={color} stopOpacity="0.5" />
          <stop offset="1" stopColor={color} stopOpacity="0.12" />
        </linearGradient>
        <linearGradient id={`${uid}-body`} x1="0" y1="0" x2="1" y2="0.3">
          <stop offset="0" stopColor="#3a3640" />
          <stop offset="0.5" stopColor="#141218" />
          <stop offset="1" stopColor="#08070b" />
        </linearGradient>
        <radialGradient id={`${uid}-halo`}>
          <stop offset="0" stopColor="#fff" stopOpacity="0.85" />
          <stop offset="0.55" stopColor="#fff" stopOpacity="0.28" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="-800" width="2000" height="500" fill="#0c0b10" />
      <rect x="-800" width="2000" height="500" fill={`url(#${uid}-sky)`} />
      <g transform={look.flip ? 'matrix(-1 0 0 1 400 0)' : undefined}>
        <g opacity="0.3" style={{ mixBlendMode: 'multiply' }}>
          {(TILED.includes(look.motif) ? [-800, -400, 0, 400, 800] : [0]).map((x) => (
            <g key={x} transform={`translate(${x} 0)`}>
              {motif(look.motif, '#0c0b10')}
            </g>
          ))}
        </g>
        <circle cx="200" cy="200" r="205" fill={`url(#${uid}-halo)`} />
        <g fill={color} stroke={color} strokeWidth="9" strokeLinejoin="round">
          {figure}
        </g>
        <g fill={`url(#${uid}-body)`}>{figure}</g>
        {look.body === 'coat' && <path d="M164 346L132 500M236 346L268 500M164 346L200 410 236 346" fill="none" stroke={color} strokeWidth="3" opacity="0.75" />}
        {look.body === 'high' && <path d="M158 338C176 360 224 360 242 338" fill="none" stroke={color} strokeWidth="3" opacity="0.75" />}
        {look.body === 'open' && <path d="M164 346L200 440 236 346M200 440V500" fill="none" stroke={color} strokeWidth="3" opacity="0.75" />}
      </g>
    </svg>
  );
}
