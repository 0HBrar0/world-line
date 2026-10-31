import type { ReactNode } from 'react';

export const PACES = [0.5, 1, 1.5, 2];

interface GlassDockProps {
  className?: string;
  label: string;
  playing: boolean;
  canBack: boolean;
  canNext: boolean;
  pace: number;
  onTogglePlay: () => void;
  onBack: () => void;
  onNext: () => void;
  onPace: (pace: number) => void;
  onStart?: () => void;
  onEnd?: () => void;
  children?: ReactNode;
}

const Arrow = ({ flip }: { flip?: boolean }) => (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" style={flip ? { transform: 'scaleX(-1)' } : undefined}>
    <path d="M9 4.5 16.5 12 9 19.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PlayIcon = ({ playing }: { playing: boolean }) => (
  <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
    {playing ? <path d="M7 5h3.6v14H7zM13.4 5H17v14h-3.6z" fill="currentColor" /> : <path d="M8 4.8v14.4L19.5 12z" fill="currentColor" />}
  </svg>
);

/** Floating glass player controls, shared by the map and every Follow view. */
export function GlassDock({ className, label, playing, canBack, canNext, pace, onTogglePlay, onBack, onNext, onPace, onStart, onEnd, children }: GlassDockProps) {
  return (
    <div className={className ? `glass-dock ${className}` : 'glass-dock'} role="group" aria-label={label}>
      {onStart && (
        <button type="button" className="glass-btn glass-small" aria-label="Back to start" onClick={onStart}>
          ⏮
        </button>
      )}
      <button type="button" className="glass-btn" aria-label="Previous step" disabled={!canBack} onClick={onBack}>
        <Arrow flip />
      </button>
      <button type="button" className="glass-btn glass-play" aria-label={playing ? 'Pause' : 'Play'} onClick={onTogglePlay}>
        <PlayIcon playing={playing} />
      </button>
      <button type="button" className="glass-btn" aria-label="Next step" disabled={!canNext} onClick={onNext}>
        <Arrow />
      </button>
      {onEnd && (
        <button type="button" className="glass-btn glass-small" aria-label="Jump to end" onClick={onEnd}>
          ⏭
        </button>
      )}
      <label className="glass-pace">
        <span className="sr-only">Pace</span>
        <select value={pace} onChange={(e) => onPace(Number(e.target.value))}>
          {PACES.map((p) => (
            <option key={p} value={p}>
              {p}×
            </option>
          ))}
        </select>
      </label>
      {children}
    </div>
  );
}
