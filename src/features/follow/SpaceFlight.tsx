import { useEffect, useRef } from 'react';
import { createFlight, type Flight, type FlightView } from './flight';
import type { SpaceStop } from './spaceStops';

/** The 3D scene. Loaded on demand, so three.js never weighs down the other pages. */
export default function SpaceFlight({ stops, index, view }: { stops: SpaceStop[]; index: number; view: FlightView }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const flight = useRef<Flight | null>(null);
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

  return <canvas ref={canvas} className="space-canvas" />;
}
