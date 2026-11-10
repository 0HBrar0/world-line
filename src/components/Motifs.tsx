import { useEffect, useRef } from 'react';
import { useRoute } from '../app/router';
import { Wheel } from './GearClock';

/** A red thread along the top edge that grows as a long page is read. */
export function ReadingThread() {
  const bar = useRef<HTMLDivElement>(null);
  const where = useRoute().path.join('/');
  useEffect(() => {
    const update = () => {
      const room = document.documentElement.scrollHeight - window.innerHeight;
      // A page that barely scrolls has nothing to measure.
      const done = room > 240 ? Math.min(1, window.scrollY / room) : 0;
      if (bar.current) bar.current.style.transform = `scaleX(${done})`;
    };
    update();
    const settle = window.setTimeout(update, 400);
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.clearTimeout(settle);
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [where]);
  return <div className="reading-thread" ref={bar} aria-hidden="true" />;
}

/** A small wheel that turns slowly beside the name, and gives one quick turn on each new page. */
export function GearMark() {
  const page = useRoute().path[0] ?? '';
  return (
    <svg className="gear-mark" viewBox="-20 -20 40 40" width="18" height="18" aria-hidden="true">
      <g key={page} className="gear-kick">
        <g className="gear-spin" style={{ animationDuration: '18s', animationTimingFunction: 'steps(216)' }}>
          <Wheel teeth={10} size={3.2} spokes={3} />
        </g>
      </g>
    </svg>
  );
}

/** An escape wheel that steps like a ticking clock: shown while something is running. */
export function TickMark() {
  return (
    <svg className="tick-mark" viewBox="-24 -24 48 48" width="22" height="22" aria-hidden="true">
      <g className="gear-spin" style={{ animationDuration: '15s', animationTimingFunction: 'steps(15)' }}>
        <Wheel teeth={15} size={2.6} spokes={3} pointed />
      </g>
    </svg>
  );
}

/** A D-Mail leaving: rings from the phone, and the message sliding back along the days. Decoration only. */
export function DmailSend() {
  return (
    <svg className="dmail-send" viewBox="0 0 320 48" aria-hidden="true">
      <path className="send-days" d="M12 36H276 M12 31V41 M56 31V41 M100 31V41 M144 31V41 M188 31V41 M232 31V41 M276 31V41" />
      <g transform="translate(298 22)">
        <rect className="send-phone" x="-9" y="-16" width="18" height="32" rx="2.5" />
        <circle className="send-ring" r="12" />
        <circle className="send-ring is-late" r="12" />
      </g>
      <g className="send-mail">
        <rect x="-10" y="-7" width="20" height="14" />
        <path d="M-10 -7L0 2L10 -7" />
      </g>
    </svg>
  );
}
