import { useEffect, useRef, type MutableRefObject, type PointerEvent as ReactPointerEvent } from 'react';
import type { MapModel } from './layout';

interface MiniMapProps {
  model: MapModel;
  width: number;
  viewStart: number;
  viewWidth: number;
  duration: number;
  /** Set by the strip so a drag on the map can slide the box without a React render. */
  liveMove: MutableRefObject<((viewStart: number) => void) | null>;
  onJump: (worldX: number) => void;
}

/** A strip showing the whole extent and the current viewport. Decorative for screen readers. */
export function MiniMap({ model, width, viewStart, viewWidth, duration, liveMove, onJump }: MiniMapProps) {
  const height = 34;
  const ratioX = width / Math.max(model.width, 1);
  const ratioY = height / Math.max(model.height, 1);
  const x = Math.max(0, viewStart * ratioX);
  const w = Math.min(width - x, viewWidth * ratioX);
  const box = useRef<SVGRectElement>(null);

  useEffect(() => {
    liveMove.current = (start) => {
      if (!box.current) return;
      box.current.style.transitionDuration = '0s';
      box.current.setAttribute('x', String(Math.max(0, start * ratioX)));
    };
    return () => {
      liveMove.current = null;
    };
  }, [liveMove, ratioX]);

  const scrub = (e: ReactPointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    onJump((e.clientX - rect.left) / ratioX);
  };

  return (
    <svg
      className="minimap"
      width={width}
      height={height}
      aria-hidden="true"
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        scrub(e);
      }}
      onPointerMove={(e) => {
        if (e.buttons & 1) scrub(e);
      }}
    >
      {model.tracks.map((t) => (
        <line key={t.lineId} className="mini-track" x1={t.x1 * ratioX} x2={t.x2 * ratioX} y1={t.y * ratioY} y2={t.y * ratioY} />
      ))}
      {model.nodes.map((n) => (
        <circle key={n.id} className="mini-node" cx={n.x * ratioX} cy={n.y * ratioY} r="1.6" />
      ))}
      <rect ref={box} className="mini-view" x={x} y={0.5} width={Math.max(w, 8)} height={height - 1} style={{ transitionDuration: `${duration}s` }} />
    </svg>
  );
}
