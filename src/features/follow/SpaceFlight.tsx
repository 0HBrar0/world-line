import { useCallback, useEffect, useRef, useState, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { createPortal } from 'react-dom';
import { useSettings } from '../../app/settings';
import { readStore } from '../../app/storage';
import { createFlight, type Flight, type FlightView } from './flight';
import { ODDITIES, pickLine, type OddityId } from './oddities';
import type { Oddity } from './orbiters';
import { MarsCloseUp, MarsHint } from './MarsCloseUp';
import type { SpaceStop } from './spaceStops';
import { WorldLost } from './WorldLost';

const NOTE_MS = 9000;
const NOTE_WIDTH = 270;

/** The 3D scene. Loaded on demand, so three.js never weighs down the other pages. */
interface SpaceFlightProps {
  stops: SpaceStop[];
  index: number;
  view: FlightView;
  onHover: (index: number | null, x: number, y: number) => void;
  onPick: (index: number) => void;
  onWheel: (deltaY: number) => void;
}

interface Note {
  id: OddityId;
  line: string;
  x: number;
  y: number;
}

export default function SpaceFlight({ stops, index, view, onHover, onPick, onWheel }: SpaceFlightProps) {
  const { prefs } = useSettings();
  const canvas = useRef<HTMLCanvasElement>(null);
  const flight = useRef<Flight | null>(null);
  const pointed = useRef<number | null>(null);
  const latest = useRef(index);
  latest.current = index;
  const latestPrefs = useRef(prefs);
  latestPrefs.current = prefs;
  const [note, setNote] = useState<Note | null>(null);
  const [lost, setLost] = useState(false);
  const [world, setWorld] = useState(0);
  const [overMars, setOverMars] = useState<{ x: number; y: number } | null>(null);
  const [closeUp, setCloseUp] = useState<{ x: number; y: number; r: number } | null>(null);

  useEffect(() => {
    if (!canvas.current || stops.length === 0) return;
    const created = createFlight(canvas.current, stops, latest.current, view, latestPrefs.current, () => setLost(true));
    flight.current = created;
    // Local 3D tests reach the scene here; this flag is never set for real visitors.
    if (readStore('wl.force3d', 0)) (window as unknown as { worldLineFlight: Flight }).worldLineFlight = created;
    return () => {
      flight.current = null;
      created.dispose();
    };
  }, [stops, view, world]);

  useEffect(() => flight.current?.goTo(index), [index]);
  useEffect(() => flight.current?.configure(prefs), [prefs]);

  const closeNote = useCallback(() => {
    setNote(null);
    flight.current?.hold(null);
  }, []);

  useEffect(() => {
    if (!note) return;
    const timer = window.setTimeout(closeNote, NOTE_MS);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeNote();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('keydown', onKey);
    };
  }, [note, closeNote]);

  const rebuild = useCallback(() => {
    delete document.body.dataset.doom;
    setWorld((w) => w + 1);
  }, []);
  useEffect(() => () => void delete document.body.dataset.doom, []);
  const finish = useCallback(() => setLost(false), []);

  const point = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const mars = flight.current?.marsAt(e.clientX, e.clientY) ?? null;
    setOverMars((was) => (!mars ? null : was && Math.hypot(was.x - mars.x, was.y - mars.y) < 12 ? was : { x: mars.x, y: mars.y + mars.r + 10 }));
    const thing = flight.current?.objectAt(e.clientX, e.clientY) ?? null;
    flight.current?.highlight(thing);
    const star = thing ? null : (flight.current?.starAt(e.clientX, e.clientY) ?? null);
    pointed.current = star;
    flight.current?.hover(star);
    e.currentTarget.style.cursor = star === null && !thing ? '' : 'pointer';
    onHover(star, e.clientX, e.clientY);
  };

  const showNote = (thing: Oddity, e: ReactMouseEvent) => {
    flight.current?.hold(thing);
    // Mars sits to the right of the man on it, so his note opens on the other side.
    const x = thing.id === 'elon' ? Math.max(e.clientX - NOTE_WIDTH - 24, 12) : Math.min(e.clientX + 20, window.innerWidth - NOTE_WIDTH - 12);
    setNote({ id: thing.id, line: pickLine(thing.id), x, y: Math.max(e.clientY - 40, 60) });
  };

  const touch = window.matchMedia?.('(pointer: coarse)').matches;

  return (
    <>
      <canvas
        ref={canvas}
        className="space-canvas"
        onPointerMove={point}
        onWheel={(e) => {
          const mars = e.deltaY < 0 ? flight.current?.marsAt(e.clientX, e.clientY) : null;
          if (mars) {
            setOverMars(null);
            setCloseUp(mars);
          } else {
            onWheel(e.deltaY);
          }
        }}
        onPointerLeave={(e) => {
          pointed.current = null;
          setOverMars(null);
          flight.current?.hover(null);
          flight.current?.highlight(null);
          e.currentTarget.style.cursor = '';
          onHover(null, 0, 0);
        }}
        onClick={(e) => {
          const thing = flight.current?.objectAt(e.clientX, e.clientY) ?? null;
          if (thing) {
            showNote(thing, e);
            return;
          }
          if (note) closeNote();
          // Stars drift, so a click goes to the highlighted one even if it has moved off the cursor.
          const star = pointed.current ?? flight.current?.starAt(e.clientX, e.clientY) ?? null;
          if (star !== null) onPick(star);
        }}
        onContextMenu={(e) => {
          const thing = flight.current?.objectAt(e.clientX, e.clientY) ?? null;
          if (!thing) return;
          e.preventDefault();
          closeNote();
          if (flight.current?.destroy(thing)) document.body.dataset.doom = 'true';
        }}
      />
      {note &&
        createPortal(
          <div className="oddity-note" style={{ left: note.x, top: note.y, width: NOTE_WIDTH }}>
            <strong>{ODDITIES[note.id].name}</strong>
            <p>{note.line}</p>
            <p className="oddity-hint">{`${touch ? 'Press and hold' : 'Right-click'} to destroy`}</p>
          </div>,
          document.body,
        )}
      {overMars && !closeUp && <MarsHint x={overMars.x} y={overMars.y} />}
      {closeUp && <MarsCloseUp from={closeUp} onClose={() => setCloseUp(null)} />}
      {lost && <WorldLost onRebuild={rebuild} onDone={finish} />}
    </>
  );
}
