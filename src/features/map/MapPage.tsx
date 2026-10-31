import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { navigate, useRoute } from '../../app/router';
import { useSettings } from '../../app/settings';
import { Badge } from '../../components/Badge';
import { GlassDock } from '../../components/GlassDock';
import { useSourceDrawer } from '../../components/drawer';
import { EDGE_STYLES, MECHANIC_FOR_EDGE } from '../../components/glyphs';
import { formatDate } from '../../components/format';
import { useToast } from '../../components/toast';
import { canon } from '../../data/load';
import type { Tier } from '../../data/schema';
import { atLeast, eventById, isVisible, lineFromPublicId, lineLabel, transitionById, visibleEvents, worldLineById, type EventOrder } from '../../data/selectors';
import { safeText } from '../../data/tierGuard';
import { DetailPanel, type Selection } from './DetailPanel';
import { buildMapModel, neighbourNode, type MapEdge, type MapModel } from './layout';
import { MapCanvas } from './MapCanvas';
import { MiniMap } from './MiniMap';
import { MobileTimeline } from './MobileTimeline';
import { MapList, SpinOffGutter } from './MapList';
import { eventTarget, lineTarget, transitionTarget } from './targets';

// Marks are never drawn smaller than this at the full view, or bigger than this zoomed all the way in.
const MARK_AT_FIT = 0.67;
const MARK_AT_MOST = 2.6;
const STEP_ZOOM = 1.6;
const EDGE_ROOM = 12;
const WHEEL_EASE = 0.12;
const STEP_MS = 3200;

export function useViewport() {
  const [size, setSize] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }));
  useEffect(() => {
    const on = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return size;
}

interface Hover {
  text: { title: string; date: string; summary: string; badge?: string; media?: string };
  x: number;
  y: number;
}

export function hoverForNode(id: string, tier: Tier): Hover['text'] | null {
  const e = eventById(id);
  if (e) {
    const summary = safeText(e.summary, tier);
    const firstSentence = summary.split(/(?<=[.!?])\s/)[0] ?? '';
    return { title: safeText(e.title, tier), date: formatDate(e), summary: firstSentence, badge: e.confidence, media: e.media.join(' · ') };
  }
  const l = worldLineById(id);
  if (l) return { title: lineLabel(l, tier), date: l.divergence ?? 'no value listed', summary: 'Route links not mapped.', badge: l.confidence };
  return null;
}

export function MapPage() {
  const route = useRoute();
  const { tier, media, setFocusedLine } = useSettings();
  const openSources = useSourceDrawer();
  const toast = useToast();
  const { w, h } = useViewport();

  const [order, setOrder] = useState<EventOrder>('calendar');
  const [zoom, setZoom] = useState<number | null>(null);
  const [pan, setPan] = useState(0);
  const [rise, setRise] = useState(0);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [edgeIndex, setEdgeIndex] = useState(-1);
  const [hover, setHover] = useState<Hover | null>(null);
  const [listVisible, setListVisible] = useState(false);
  const [duration, setDuration] = useState(0.6);
  const svgHost = useRef<HTMLDivElement>(null);
  const [hostWidth, setHostWidth] = useState(1000);
  const [playing, setPlaying] = useState(false);
  const [pace, setPace] = useState(1);
  const liveMove = useRef<((viewStart: number) => void) | null>(null);

  const mobile = w < 768;
  const docked = w >= 1280 && !!selection;
  const mapHeight = Math.max(380, h - 226);

  useLayoutEffect(() => {
    const el = svgHost.current;
    if (!el) return;
    const measure = () => setHostWidth(el.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [mobile, docked]);

  // The layout is drawn once for the size of the window. Zooming only scales that finished picture, so a
  // short story is spread to fill the map, and a long one is drawn tall enough to fill it when scaled down.
  const natural = useMemo(() => buildMapModel(tier, media, order, mapHeight, 1), [tier, media, order, mapHeight]);
  const room = hostWidth - natural.gutter - EDGE_ROOM * 2;
  const across = room / Math.max(natural.width, 1);
  const spread = Math.min(3, Math.max(1, across));
  const tall = mapHeight / Math.min(1, across);
  const model: MapModel = useMemo(() => buildMapModel(tier, media, order, tall, spread), [tier, media, order, tall, spread]);
  const fit = Math.min(1, room / Math.max(model.width, 1));
  const marks = Math.max(1, MARK_AT_FIT / fit);
  const maxZoom = Math.max(fit, MARK_AT_MOST / marks);
  const scale = Math.max(fit, Math.min(maxZoom, zoom ?? fit));
  const viewHeight = model.height * fit;
  const overview = fit < 0.85 && scale < fit * 1.3;

  const orderedIds = useMemo(() => {
    const events = visibleEvents(tier, media, order).map((e) => e.id);
    const lines = model.nodes.filter((n) => n.kind === 'line').map((n) => n.id);
    return [...events, ...lines];
  }, [tier, media, order, model.nodes]);

  const viewport = hostWidth - model.gutter;
  const clampPan = useCallback(
    (p: number, s: number) => Math.min(EDGE_ROOM, Math.max(p, Math.min(EDGE_ROOM, viewport - model.width * s - EDGE_ROOM))),
    [viewport, model.width],
  );
  const clampRise = useCallback((p: number, s: number) => Math.min(0, Math.max(p, viewHeight - model.height * s)), [viewHeight, model.height]);
  const panX = clampPan(pan, scale);
  const panY = clampRise(rise, scale);

  const fitStory = useCallback(() => {
    setDuration(0.6);
    setZoom(null);
    setPan(0);
    setRise(0);
  }, []);

  const zoomBy = useCallback(
    (factor: number, screenX?: number, screenY?: number) => {
      setDuration(WHEEL_EASE);
      const next = Math.min(maxZoom, Math.max(fit, scale * factor));
      const anchorX = (screenX ?? hostWidth / 2) - model.gutter;
      const anchorY = screenY ?? viewHeight / 2;
      setZoom(next);
      setPan(anchorX - ((anchorX - panX) / scale) * next);
      setRise(anchorY - ((anchorY - panY) / scale) * next);
    },
    [fit, maxZoom, scale, hostWidth, viewHeight, model.gutter, panX, panY],
  );

  const toggleOrder = useCallback(() => {
    setDuration(0.6);
    setOrder((o) => (o === 'calendar' ? 'seq' : 'calendar'));
    setZoom(null);
    setPan(0);
    setRise(0);
  }, []);

  useEffect(() => {
    // Selection and focus can point at something this tier or filter no longer shows.
    setSelection(null);
    setFocusId(null);
    setHover(null);
  }, [tier, media]);

  // Deep links: an id that is locked redirects with a toast and is not echoed back.
  const wl = route.query.get('wl');
  const ev = route.query.get('ev');
  useEffect(() => {
    if (!wl && !ev) return;
    const line = wl ? lineFromPublicId(wl) : undefined;
    const event = ev ? eventById(ev) : undefined;
    if ((wl && (!line || !isVisible(line, tier))) || (ev && (!event || !isVisible(event, tier)))) {
      toast.showLocked();
      navigate('map', undefined, true);
      return;
    }
    if (event) {
      setSelection({ kind: 'event', id: event.id });
      setFocusId(event.id);
      if (event.worldLineAfter) setFocusedLine(event.worldLineAfter);
    } else if (line) {
      setSelection({ kind: 'line', id: line.id });
      setFocusedLine(line.id);
    }
  }, [wl, ev, tier, toast, setFocusedLine]);

  const focusLineOf = useCallback(
    (id: string) => {
      const node = model.nodes.find((n) => n.id === id);
      const e = eventById(id);
      const lineId = e?.worldLineAfter ?? node?.lineId ?? null;
      const line = lineId ? worldLineById(lineId) : undefined;
      setFocusedLine(line && isVisible(line, tier) ? line.id : null);
    },
    [model.nodes, tier, setFocusedLine],
  );

  const scrollNodeIntoView = useCallback(
    (id: string) => {
      const node = model.nodes.find((n) => n.id === id);
      if (!node) return;
      const atX = node.x * scale + panX;
      const atY = node.y * scale + panY;
      if (atX < 30 || atX > viewport - 30) setPan(viewport / 2 - node.x * scale);
      if (atY < 30 || atY > viewHeight - 30) setRise(viewHeight / 2 - node.y * scale);
    },
    [model.nodes, scale, panX, panY, viewport, viewHeight],
  );

  const focusNode = useCallback(
    (id: string) => {
      setFocusId(id);
      setEdgeIndex(-1);
      scrollNodeIntoView(id);
      focusLineOf(id);
      svgHost.current?.querySelector<SVGGElement>(`[data-node="${id}"]`)?.focus({ preventScroll: true });
    },
    [scrollNodeIntoView, focusLineOf],
  );

  const activateNode = useCallback(
    (id: string) => {
      setFocusId(id);
      focusLineOf(id);
      setSelection({ kind: eventById(id) ? 'event' : 'line', id });
    },
    [focusLineOf],
  );

  const activateEdge = useCallback((edge: MapEdge) => {
    if (edge.transitionId) setSelection({ kind: 'edge', id: edge.transitionId });
  }, []);

  const closePanel = useCallback(() => {
    setSelection(null);
    if (focusId) svgHost.current?.querySelector<SVGGElement>(`[data-node="${focusId}"]`)?.focus({ preventScroll: true });
  }, [focusId]);

  const edgesFromFocus = useMemo(() => model.edges.filter((e) => e.fromNode === focusId), [model.edges, focusId]);

  const onKeyDown = useCallback(
    (e: ReactKeyboardEvent<SVGSVGElement>) => {
      const currentId = focusId ?? orderedIds[0];
      const node = model.nodes.find((n) => n.id === currentId);
      const index = orderedIds.indexOf(currentId);
      const handled = () => {
        e.preventDefault();
        e.stopPropagation();
      };
      switch (e.key) {
        case 'ArrowRight':
          handled();
          if (orderedIds[index + 1]) focusNode(orderedIds[index + 1]);
          break;
        case 'ArrowLeft':
          handled();
          if (index > 0) focusNode(orderedIds[index - 1]);
          break;
        case 'ArrowUp':
        case 'ArrowDown': {
          handled();
          const next = node && neighbourNode(model, node, e.key === 'ArrowDown' ? 1 : -1);
          if (next) focusNode(next.id);
          break;
        }
        case 'Enter':
        case ' ':
          handled();
          if (currentId) activateNode(currentId);
          break;
        case 'e':
        case 'E': {
          handled();
          if (edgesFromFocus.length === 0) break;
          const next = (edgeIndex + 1) % edgesFromFocus.length;
          setEdgeIndex(next);
          activateEdge(edgesFromFocus[next]);
          break;
        }
        case 'm':
        case 'M': {
          handled();
          const edge = edgesFromFocus[Math.max(edgeIndex, 0)];
          const transition = edge?.transitionId ? transitionById(edge.transitionId) : undefined;
          const mechanic = transition ? MECHANIC_FOR_EDGE[transition.mechanism] : undefined;
          if (mechanic) navigate(`mechanics/${mechanic}`);
          break;
        }
        case 'o':
        case 'O':
          handled();
          toggleOrder();
          break;
        case 's':
        case 'S': {
          handled();
          const event = eventById(currentId);
          const line = worldLineById(currentId);
          if (event) openSources(eventTarget(event, tier));
          else if (line) openSources(lineTarget(line, tier));
          break;
        }
        case '+':
        case '=':
          handled();
          zoomBy(1.4);
          break;
        case '-':
          handled();
          zoomBy(1 / 1.4);
          break;
        case '0':
          handled();
          fitStory();
          break;
        case 'Escape':
          handled();
          closePanel();
          break;
        default:
      }
    },
    [focusId, orderedIds, model, focusNode, activateNode, edgesFromFocus, edgeIndex, activateEdge, toggleOrder, openSources, tier, zoomBy, fitStory, closePanel],
  );

  const onHoverNode = useCallback(
    (id: string | null, x: number, y: number) => {
      if (!id) {
        setHover(null);
        return;
      }
      const text = hoverForNode(id, tier);
      if (text) setHover({ text, x, y });
      focusLineOf(id);
    },
    [tier, focusLineOf],
  );

  const onHoverEdge = useCallback((edge: MapEdge | null, x: number, y: number) => {
    if (!edge) {
      setHover(null);
      return;
    }
    const title = edge.collapsed ? `${edge.hiddenSteps} steps hidden by media filter` : EDGE_STYLES[edge.mechanism].label;
    setHover({ text: { title, date: '', summary: edge.collapsed ? '' : 'Click for details.' }, x, y });
  }, []);

  const onPan = useCallback((x: number, y: number) => {
    setDuration(0);
    setPlaying(false);
    setPan(x);
    setRise(y);
  }, []);

  const onPanLive = useCallback(
    (x: number, y: number) => {
      const clamped = { x: clampPan(x, scale), y: clampRise(y, scale) };
      liveMove.current?.(-clamped.x / scale);
      return clamped;
    },
    [clampPan, clampRise, scale],
  );

  // Stepping moves along the story like a video: it glides to each event without opening its panel.
  const storyIds = useMemo(() => {
    const placed = new Set(model.nodes.map((n) => n.id));
    return visibleEvents(tier, media, order).map((e) => e.id).filter((id) => placed.has(id));
  }, [tier, media, order, model.nodes]);
  const storyIndex = focusId ? storyIds.indexOf(focusId) : -1;
  const storyEvent = storyIndex >= 0 ? eventById(storyIds[storyIndex]) : undefined;

  const stepTo = useCallback(
    (i: number) => {
      const id = storyIds[i];
      const node = id ? model.nodes.find((n) => n.id === id) : undefined;
      if (!node) return;
      const next = Math.min(maxZoom, Math.max(scale, STEP_ZOOM));
      setDuration(0.6);
      setZoom(next);
      setPan(viewport / 2 - node.x * next);
      setRise(viewHeight / 2 - node.y * next);
      setFocusId(id);
      setEdgeIndex(-1);
      focusLineOf(id);
    },
    [storyIds, model.nodes, maxZoom, scale, viewport, viewHeight, focusLineOf],
  );

  useEffect(() => {
    if (!playing) return;
    if (storyIndex >= storyIds.length - 1) {
      setPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => stepTo(storyIndex + 1), storyIndex < 0 ? 0 : STEP_MS / pace);
    return () => window.clearTimeout(timer);
  }, [playing, pace, storyIndex, storyIds.length, stepTo]);

  const showSgInfo = useCallback(() => {
    const line = canon.worldLines.find((l) => l.lane === 'steins_gate');
    if (line) openSources(lineTarget(line, tier));
  }, [openSources, tier]);

  if (mobile) {
    return (
      <main id="main" className="page page-map">
        <h1 className="sr-only">World-line map</h1>
        <MapIntro order={order} toggleOrder={toggleOrder} />
        <MobileTimeline tier={tier} media={media} order={order} onOpen={(s) => setSelection(s)} />
        <SpinOffGutter tier={tier} media={media} onOpen={(id) => setSelection({ kind: 'line', id })} />
        {selection && <DetailPanel selection={selection} tier={tier} modal onClose={closePanel} />}
      </main>
    );
  }

  const selectedNode = selection && selection.kind !== 'edge' ? selection.id : null;
  const selectedEdge = selection?.kind === 'edge' ? selection.id : null;

  return (
    <main id="main" className={docked ? 'page page-map has-panel' : 'page page-map'}>
      <div className="map-main">
        <h1 className="sr-only">World-line map</h1>
        <div className="map-toolbar">
          <MapIntro order={order} toggleOrder={toggleOrder} />
          <button type="button" className="btn" aria-label="Zoom in" onClick={() => zoomBy(1.4)}>
            +
          </button>
          <button type="button" className="btn" aria-label="Zoom out" onClick={() => zoomBy(1 / 1.4)}>
            −
          </button>
          <button type="button" className="btn" onClick={fitStory}>
            Fit story
          </button>
          <button type="button" className="btn" aria-pressed={listVisible} onClick={() => setListVisible((v) => !v)}>
            List view
          </button>
        </div>
        <p className="sr-only" id="map-instructions">
          Tab enters the map. Left and right arrows move along the current time order. Up and down jump to the world line above or below. Enter opens details. E cycles the edges leaving a node, M plays the mechanic for an edge, O switches the time order, S opens sources, plus and minus zoom, 0 fits the story, Escape closes the panel.
        </p>
        <div className="map-host" ref={svgHost}>
          <MapCanvas
            model={model}
            tier={tier}
            panX={panX}
            panY={panY}
            zoom={scale}
            overview={overview}
            marks={marks}
            viewportWidth={hostWidth}
            viewHeight={viewHeight}
            orderedIds={orderedIds}
            focusId={focusId}
            selectedId={selectedNode}
            selectedEdgeId={selectedEdge}
            duration={duration}
            onActivateNode={activateNode}
            onActivateEdge={activateEdge}
            onFocusNode={(id) => {
              setFocusId(id);
              focusLineOf(id);
            }}
            onHoverNode={onHoverNode}
            onHoverEdge={onHoverEdge}
            onKeyDown={onKeyDown}
            onPan={onPan}
            onPanLive={onPanLive}
            onZoomWheel={zoomBy}
            onSgInfo={showSgInfo}
          />
          {storyEvent && (
            <div className="glass-now">
              <strong>{hoverForNode(storyEvent.id, tier)?.title}</strong>
              <span className="detail-meta">{formatDate(storyEvent)}</span>
              <Badge target={eventTarget(storyEvent, tier)} />
            </div>
          )}
          <GlassDock
            className="glass-dock-map"
            label="Story player"
            playing={playing}
            canBack={storyIndex > 0}
            canNext={storyIndex < storyIds.length - 1}
            pace={pace}
            onTogglePlay={() => setPlaying((p) => !p)}
            onBack={() => stepTo(storyIndex - 1)}
            onNext={() => stepTo(storyIndex + 1)}
            onPace={setPace}
          >
            <MiniMap
              model={model}
              width={Math.max(120, Math.min(560, hostWidth - 320))}
              viewStart={-panX / scale}
              viewWidth={viewport / scale}
              duration={duration}
              liveMove={liveMove}
              onJump={(x) => {
                setDuration(0);
                setPan(viewport / 2 - x * scale);
              }}
            />
          </GlassDock>
        </div>
        <SpinOffGutter tier={tier} media={media} onOpen={(id) => setSelection({ kind: 'line', id })} />
        {atLeast(tier, 'premise') && <FocusedBadge selection={selection} />}
        <MapList tier={tier} media={media} order={order} visible={listVisible} />
      </div>
      {hover && (
        <div className="hover-card" role="presentation" style={{ left: Math.min(hover.x + 14, w - 320), top: Math.min(hover.y + 14, h - 170) }}>
          <strong>{hover.text.title}</strong>
          {hover.text.date && <span className="detail-meta">{hover.text.date}</span>}
          {hover.text.badge && <span className="pill">{hover.text.badge}</span>}
          {hover.text.summary && <span>{hover.text.summary}</span>}
        </div>
      )}
      {selection && <DetailPanel selection={selection} tier={tier} modal={w < 1280} onClose={closePanel} />}
    </main>
  );
}

function FocusedBadge({ selection }: { selection: Selection | null }) {
  const { tier } = useSettings();
  if (selection?.kind !== 'edge') return null;
  const t = transitionById(selection.id);
  return t ? (
    <p className="sr-only">
      <Badge target={transitionTarget(t, tier)} />
    </p>
  ) : null;
}

function MapIntro({ order, toggleOrder }: { order: EventOrder; toggleOrder: () => void }) {
  return (
    <div className="map-intro">
      <div className="segmented" role="group" aria-label="Time order">
        <button type="button" className="btn" aria-pressed={order === 'calendar'} onClick={() => order !== 'calendar' && toggleOrder()}>
          Calendar order
        </button>
        <button type="button" className="btn" aria-pressed={order === 'seq'} onClick={() => order !== 'seq' && toggleOrder()}>
          Okabe's order
        </button>
      </div>
      <p className="map-caption">Calendar order = when it happened. Okabe's order = when he lived it.</p>
    </div>
  );
}

