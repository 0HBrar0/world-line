// Original line drawings of things from the lab. No official art is copied or traced.

export type LabItemKind = 'microwave' | 'crt' | 'phone' | 'whiteboard';

function Microwave({ on }: { on: boolean }) {
  return (
    <>
      <rect x="8" y="30" width="80" height="44" rx="4" />
      <rect x="14" y="36" width="50" height="32" rx="3" className="lab-glass" />
      <path className={on ? 'lab-banana is-gel' : 'lab-banana'} d="M26 60c8 4 20 2 28-10c-4 14-18 20-30 14z" />
      <path d="M72 38h10M72 46h10M72 54h10" />
      <circle cx="77" cy="64" r="3" />
      <rect x="58" y="12" width="14" height="18" rx="2" />
      <path d="M68 12V4M62 18h6M62 23h6" />
      <path d="M16 74v6M80 74v6" />
    </>
  );
}

function Crt({ on }: { on: boolean }) {
  return (
    <>
      <path d="M36 18L24 4M52 18L66 4" />
      <rect x="8" y="18" width="80" height="56" rx="8" />
      <rect x="15" y="25" width="50" height="42" rx="10" className="lab-glass" />
      {on && <path className="lab-static" d="M19 33h42M19 39h42M19 45h42M19 51h42M19 57h42" />}
      <circle cx="76" cy="34" r="4" />
      <circle cx="76" cy="48" r="4" />
      <path d="M71 60h10M71 65h10" />
      <path d="M20 74v6M76 74v6" />
    </>
  );
}

function Phone({ on }: { on: boolean }) {
  return (
    <>
      <rect x="30" y="4" width="36" height="38" rx="5" />
      <rect x="35" y="9" width="26" height="24" rx="2" className="lab-glass" />
      {on && <path className="lab-static" d="M39 15h18M39 21h14M39 27h10" />}
      <rect x="30" y="44" width="36" height="38" rx="5" />
      <path d="M38 52h4M46 52h4M54 52h4M38 60h4M46 60h4M54 60h4M38 68h4M46 68h4M54 68h4" />
      <path d="M40 42v2M56 42v2" />
    </>
  );
}

function Whiteboard({ on }: { on: boolean }) {
  return (
    <>
      <rect x="6" y="10" width="84" height="54" rx="2" />
      <rect x="14" y="20" width="14" height="10" />
      <rect x="40" y="20" width="14" height="10" />
      <rect x="27" y="42" width="14" height="10" />
      <path d="M28 25h12M47 30v6l-13 6" />
      <path className={on ? 'lab-scribble is-on' : 'lab-scribble'} d="M62 22c4-4 6 4 10 0s6 4 10 0M62 34c4-4 6 4 10 0s6 4 10 0M62 46c4-4 6 4 10 0" />
      <path d="M26 64h44M22 64l-8 18M74 64l8 18" />
    </>
  );
}

const DRAWINGS: Record<LabItemKind, (props: { on: boolean }) => JSX.Element> = { microwave: Microwave, crt: Crt, phone: Phone, whiteboard: Whiteboard };

export function LabItem({ kind, on = false }: { kind: LabItemKind; on?: boolean }) {
  const Drawing = DRAWINGS[kind];
  return (
    <svg className="lab-item" viewBox="0 0 96 86" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <Drawing on={on} />
    </svg>
  );
}
