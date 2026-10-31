import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { BROKEN_LINES } from './oddities';

const SETTLE_MS = 1500;
const COUNT_MS = 950;
const LEAVE_MS = 1000;

/** The game-over screen. At zero the world is rebuilt behind it, and it fades away to reveal the fresh scene. */
export function WorldLost({ onRebuild, onDone }: { onRebuild: () => void; onDone: () => void }) {
  const [count, setCount] = useState<number | null>(null);
  const [leaving, setLeaving] = useState(false);
  const [line] = useState(() => BROKEN_LINES[Math.floor(Math.random() * BROKEN_LINES.length)]);

  useEffect(() => {
    const steps = [3, 2, 1].map((n, i) => window.setTimeout(() => setCount(n), SETTLE_MS + i * COUNT_MS));
    const rebuild = window.setTimeout(() => {
      onRebuild();
      setLeaving(true);
    }, SETTLE_MS + 3 * COUNT_MS);
    const done = window.setTimeout(onDone, SETTLE_MS + 3 * COUNT_MS + LEAVE_MS);
    return () => [...steps, rebuild, done].forEach(window.clearTimeout);
  }, [onRebuild, onDone]);

  return createPortal(
    <div className={leaving ? 'world-lost is-leaving' : 'world-lost'} role="alert">
      <div className="world-lost-band">
        <h2>World line lost</h2>
        <p>{line}</p>
        <p className="world-lost-count" aria-live="off">
          {count === null ? ' ' : (
            <>
              Reconverging in <b key={count}>{count}</b>
            </>
          )}
        </p>
      </div>
    </div>,
    document.body,
  );
}
