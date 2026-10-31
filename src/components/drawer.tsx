import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSettings } from '../app/settings';
import type { Confidence, Source } from '../data/schema';
import { atLeast, disputesFor, publicLineId, sourceById } from '../data/selectors';
import { isTextSafe, safeText } from '../data/tierGuard';
import { confidenceDefinition } from './Badge';
import { useFocusTrap } from './useFocusTrap';

export interface SourceTarget {
  id: string;
  title: string;
  confidence?: Confidence;
  sourceIds: string[];
  singleSource?: boolean;
  singleSourceKind?: string;
  conflicts?: Array<{ claim: string; sourceIds: string[] }>;
  /** Extra versions to list, such as a world line's alternate values. */
  alternates?: Array<{ value: string | null; note: string; sourceIds: string[]; confidence: Confidence }>;
}

const DrawerContext = createContext<(target: SourceTarget) => void>(() => undefined);

export const useSourceDrawer = () => useContext(DrawerContext);

const STATUS_LABEL: Record<Source['status'], string> = {
  fetched: 'fetched',
  partial: 'partly fetched',
  'wrong-content': 'returned wrong page',
  failed: 'failed to load',
  'search-only': 'search result only',
};

/** Source titles and URLs can name later content, so they pass through the same guard as story text. */
function sourceIsSafe(source: Source, tier: Parameters<typeof isTextSafe>[1]): boolean {
  let url = source.url;
  try {
    url = decodeURI(source.url);
  } catch {
    // Keep the raw form.
  }
  return isTextSafe(`${source.title} ${url.replace(/[_/;]/g, ' ')}`, tier);
}

function SourceRow({ id }: { id: string }) {
  const { tier } = useSettings();
  const source = sourceById(id);
  if (!source) return null;
  if (!sourceIsSafe(source, tier)) {
    return (
      <li className="source-row">
        <span>Source hidden at your spoiler level</span>
        <span className="pill">Tier {source.tier}</span>
      </li>
    );
  }
  const notes = safeText(source.notes, tier);
  return (
    <li className="source-row">
      <a href={source.url} target="_blank" rel="noopener noreferrer">
        {source.title}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
      <span className="pill">Tier {source.tier}</span>
      <span className={source.status === 'fetched' ? 'pill' : 'pill pill-warn'}>{STATUS_LABEL[source.status]}</span>
      {notes && <p className="source-notes">{notes}</p>}
    </li>
  );
}

function DrawerBody({ target, onClose }: { target: SourceTarget; onClose: () => void }) {
  const { tier } = useSettings();
  const panel = useRef<HTMLDivElement>(null);
  useFocusTrap(panel, onClose);

  const displayId = atLeast(tier, 'sg_part2') ? target.id : publicLineId(target.id);
  const disputes = disputesFor(target.id, tier);
  const conflicts = (target.conflicts ?? []).filter((c) => isTextSafe(c.claim, tier));
  const alternates = (target.alternates ?? []).filter((a) => isTextSafe(`${a.value ?? ''} ${a.note}`, tier));

  return (
    <motion.div
      ref={panel}
      className="drawer"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
      initial={{ x: 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 40, opacity: 0 }}
      transition={{ duration: 0.24, ease: [0.2, 0, 0, 1] }}
    >
      <div className="drawer-head">
        <h2 id="drawer-title">Sources</h2>
        <button type="button" className="btn" onClick={onClose}>
          Close
        </button>
      </div>
      {target.title && <p className="drawer-sub">{target.title}</p>}
      <p className="canon-id">
        <code>{displayId}</code>
        <button type="button" className="btn btn-small" onClick={() => void navigator.clipboard?.writeText(displayId).catch(() => undefined)}>
          Copy id
        </button>
      </p>
      {target.confidence && (
        <p>
          <strong>{target.confidence}:</strong> {confidenceDefinition(target.confidence)}
        </p>
      )}
      <h3>Sources</h3>
      <ul className="source-list">
        {target.sourceIds.map((id) => (
          <SourceRow key={id} id={id} />
        ))}
      </ul>
      {alternates.length > 0 && (
        <>
          <h3>Other values</h3>
          <ul className="source-list">
            {alternates.map((a, i) => (
              <li key={i} className="source-row">
                {a.value && <code>{a.value}</code>} {a.note}
                <ul className="source-list nested">
                  {a.sourceIds.map((id) => (
                    <SourceRow key={id} id={id} />
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </>
      )}
      {conflicts.length > 0 && (
        <>
          <h3>Conflicts</h3>
          <ul className="source-list">
            {conflicts.map((c, i) => (
              <li key={i} className="source-row">
                {c.claim}
                <ul className="source-list nested">
                  {c.sourceIds.map((id) => (
                    <SourceRow key={id} id={id} />
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </>
      )}
      {disputes.map((d) => {
        const topic = safeText(d.topic, tier);
        const versions = d.versions.filter((v) => isTextSafe(v.claim, tier));
        if (!topic || versions.length === 0) return null;
        return (
          <section key={d.id}>
            <h3>Disputed: {topic}</h3>
            <ul className="source-list">
              {versions.map((v, i) => (
                <li key={i} className="source-row">
                  {v.claim}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
      <p className="drawer-foot">Spot a problem? Open items are tracked in docs/open-questions.md.</p>
    </motion.div>
  );
}

export function SourceDrawerProvider({ children }: { children: ReactNode }) {
  const [target, setTarget] = useState<SourceTarget | null>(null);
  const opener = useRef<HTMLElement | null>(null);

  const open = useCallback((next: SourceTarget) => {
    opener.current = document.activeElement as HTMLElement | null;
    setTarget(next);
  }, []);

  const close = useCallback(() => {
    setTarget(null);
    opener.current?.focus();
  }, []);

  const { tier } = useSettings();
  useEffect(() => setTarget(null), [tier]);

  const value = useMemo(() => open, [open]);

  return (
    <DrawerContext.Provider value={value}>
      {children}
      <AnimatePresence>
        {target && (
          <div className="drawer-layer" key="drawer">
            <button type="button" className="drawer-scrim" aria-label="Close sources" tabIndex={-1} onClick={close} />
            <DrawerBody target={target} onClose={close} />
          </div>
        )}
      </AnimatePresence>
    </DrawerContext.Provider>
  );
}
