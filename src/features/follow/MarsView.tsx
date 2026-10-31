import { createPortal } from 'react-dom';
import { MARS_TASKS, type MarsTaskId } from './oddities';
import '../../styles/mars.css';

/** The words over the live scene once the camera has reached Mars. The scene itself is in marsCamp.ts. */
export function MarsCaption({ job, onLeave }: { job: MarsTaskId; onLeave: () => void }) {
  const task = MARS_TASKS.find((t) => t.id === job)!;
  return createPortal(
    <div className="mars-caption" role="status">
      <div key={task.id} className="mars-words">
        <span className="mars-kicker">Meanwhile, on Mars</span>
        <strong>{task.title}</strong>
        <p>{task.line}</p>
      </div>
      <p className="mars-keys">Scroll up for his next job. Scroll down to pull back.</p>
      <button type="button" className="btn mars-back" onClick={onLeave}>
        Back to space
      </button>
    </div>,
    document.body,
  );
}

/** A mouse with its wheel rolling upward, shown beside Mars while it is pointed at. */
export function MarsHint({ x, y }: { x: number; y: number }) {
  return createPortal(
    <div className="mars-hint" style={{ left: x, top: y }}>
      <svg width="26" height="38" viewBox="0 0 26 38" aria-hidden="true">
        <rect x="1.5" y="1.5" width="23" height="35" rx="11.5" fill="none" stroke="currentColor" strokeWidth="2" />
        <rect className="mars-hint-wheel" x="11" y="9" width="4" height="9" rx="2" fill="currentColor" />
      </svg>
      <span>Scroll up to go closer</span>
    </div>,
    document.body,
  );
}
