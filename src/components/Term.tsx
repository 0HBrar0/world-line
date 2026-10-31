import { useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { href } from '../app/router';
import { canon } from '../data/load';
import type { Tier } from '../data/schema';
import { glossaryById, isVisible } from '../data/selectors';
import { safeText } from '../data/tierGuard';
import { useSettings } from '../app/settings';

/** A glossary term with a hover and focus card. Renders plain text when the term is locked. */
export function Term({ id, children }: { id: string; children: ReactNode }) {
  const { tier } = useSettings();
  const [open, setOpen] = useState(false);
  const cardId = useId();
  const entry = glossaryById(id);
  const closeTimer = useRef<number | undefined>(undefined);

  if (!entry || !isVisible(entry, tier)) return <>{children}</>;
  const plain = safeText(entry.plainLanguage, tier);
  const show = () => {
    window.clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const hide = () => {
    closeTimer.current = window.setTimeout(() => setOpen(false), 120);
  };

  return (
    <span className="term" onPointerEnter={show} onPointerLeave={hide}>
      <a
        className="term-link"
        href={href(`glossary/${entry.id}`)}
        aria-describedby={open ? cardId : undefined}
        onFocus={show}
        onBlur={hide}
        onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
      >
        {children}
      </a>
      {open && (
        <span id={cardId} role="tooltip" className="term-card">
          <strong>{entry.term}</strong> {plain}
        </span>
      )}
    </span>
  );
}

const TERM_PATTERNS: Array<{ id: string; pattern: RegExp }> = [
  { id: 'gl-world-line', pattern: /\bworld lines?\b/i },
  { id: 'gl-dmail', pattern: /\bD-Mails?\b/ },
  { id: 'gl-phonewave', pattern: /\bPhoneWave\b|\bphone-microwave\b/ },
  { id: 'gl-sern', pattern: /\bSERN\b/ },
  { id: 'gl-ibn-5100', pattern: /\bIBN 5100\b/ },
  { id: 'gl-rounders', pattern: /\bRounders?\b/ },
  { id: 'gl-convergence', pattern: /\b[Cc]onvergence\b/ },
  { id: 'gl-amadeus', pattern: /\bAmadeus\b/ },
  { id: 'gl-divergence-meter', pattern: /\bDivergence Meter\b/ },
  { id: 'gl-radio-kaikan', pattern: /\bRadio Kaikan\b/ },
  { id: 'gl-reading-steiner', pattern: /\bReading Steiner\b/ },
];

interface Part {
  text: string;
  term?: string;
}

function splitTerms(text: string, tier: Tier): Part[] {
  const hits = TERM_PATTERNS.flatMap(({ id, pattern }) => {
    const entry = canon.glossary.find((g) => g.id === id);
    const m = entry && isVisible(entry, tier) ? pattern.exec(text) : null;
    return m ? [{ id, index: m.index, length: m[0].length }] : [];
  }).sort((a, b) => a.index - b.index);

  const parts: Part[] = [];
  let at = 0;
  for (const hit of hits) {
    if (hit.index < at) continue;
    if (hit.index > at) parts.push({ text: text.slice(at, hit.index) });
    parts.push({ text: text.slice(hit.index, hit.index + hit.length), term: hit.id });
    at = hit.index + hit.length;
  }
  if (at < text.length) parts.push({ text: text.slice(at) });
  return parts;
}

/** Canon text with the first mention of each known term linked. The text itself is unchanged. */
export function Linked({ text, tier }: { text: string; tier: Tier }) {
  const parts = useMemo(() => splitTerms(text, tier), [text, tier]);
  return (
    <>
      {parts.map((part, i) => (part.term ? <Term key={i} id={part.term}>{part.text}</Term> : <span key={i}>{part.text}</span>))}
    </>
  );
}
