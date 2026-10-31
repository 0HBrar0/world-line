import { useEffect, useRef, type PointerEvent as ReactPointerEvent } from 'react';
import { createFlight, type Flight, type FlightView } from './flight';
import type { SpaceStop } from './spaceStops';

/** The 3D scene. Loaded on demand, so three.js never weighs down the other pages. */
interface SpaceFlightProps {
  stops: SpaceStop[];
  index: number;
  view: FlightView;
  onHover: (index: number | null, x: number, y: number) => void;
  onPick: (index: number) => void;
  onWheel: (deltaY: number) => void;
}

export default function SpaceFlight({ stops, index, view, onHover, onPick, onWheel }: SpaceFlightProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const flight = useRef<Flight | null>(null);
  const pointed = useRef<number | null>(null);
  const latest = useRef(index);
  latest.current = index;

  useEffect(() => {
    if (!canvas.current || stops.length === 0) return;
    const created = createFlight(canvas.current, stops, latest.current, view);
    flight.current = created;
    return () => {
      flight.current = null;
      created.dispose();
    };
  }, [stops, view]);

  useEffect(() => flight.current?.goTo(index), [index]);

  const point = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const star = flight.current?.starAt(e.clientX, e.clientY) ?? null;
    pointed.current = star;
    flight.current?.hover(star);
    e.currentTarget.style.cursor = star === null ? '' : 'pointer';
    onHover(star, e.clientX, e.clientY);
  };

  return (
    <canvas
      ref={canvas}
      className="space-canvas"
      onPointerMove={point}
      onWheel={(e) => onWheel(e.deltaY)}
      onPointerLeave={(e) => {
        pointed.current = null;
        flight.current?.hover(null);
        e.currentTarget.style.cursor = '';
        onHover(null, 0, 0);
      }}
      onClick={(e) => {
        // Stars drift, so a click goes to the highlighted one even if it has moved off the cursor.
        const star = pointed.current ?? flight.current?.starAt(e.clientX, e.clientY) ?? null;
        if (star !== null) onPick(star);
      }}
    />
  );
}
