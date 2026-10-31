import type { MapModel } from './layout';

interface MiniMapProps {
  model: MapModel;
  width: number;
  viewStart: number;
  viewWidth: number;
  onJump: (worldX: number) => void;
}

/** A strip showing the whole extent and the current viewport. Decorative for screen readers. */
export function MiniMap({ model, width, viewStart, viewWidth, onJump }: MiniMapProps) {
  const height = 34;
  const ratioX = width / Math.max(model.width, 1);
  const ratioY = height / Math.max(model.height, 1);
  const x = Math.max(0, viewStart * ratioX);
  const w = Math.min(width - x, viewWidth * ratioX);
  return (
    <svg
      className="minimap"
      width={width}
      height={height}
      aria-hidden="true"
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        onJump((e.clientX - rect.left) / ratioX);
      }}
    >
      {model.tracks.map((t) => (
        <line key={t.lineId} className="mini-track" x1={t.x1 * ratioX} x2={t.x2 * ratioX} y1={t.y * ratioY} y2={t.y * ratioY} />
      ))}
      {model.nodes.map((n) => (
        <circle key={n.id} className="mini-node" cx={n.x * ratioX} cy={n.y * ratioY} r="1.6" />
      ))}
      <rect className="mini-view" x={x} y={0.5} width={Math.max(w, 8)} height={height - 1} />
    </svg>
  );
}
