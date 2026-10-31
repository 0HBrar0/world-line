import { memo, useCallback, useEffect, useMemo, useRef, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { motion } from 'framer-motion';
import { useReduceMotion } from '../../app/settings';
import { EDGE_STYLES } from '../../components/glyphs';
import { MechIconGroup } from '../../components/MechIcon';
import { formatDate } from '../../components/format';
import type { Tier } from '../../data/schema';
import { atLeast, eventById, lineLabel, transitionById, worldLineById } from '../../data/selectors';
import { safeText } from '../../data/tierGuard';
import { KNOT_EVENTS } from './constants';
import { declutter, type MapEdge, type MapModel, type MapNode } from './layout';

const EASE = [0.2, 0, 0, 1] as const;

function edgePath(e: MapEdge): string {
  const mid = (e.from.y + e.to.y) / 2;
  return `M ${e.from.x} ${e.from.y} C ${e.from.x + 2} ${mid}, ${e.to.x - 2} ${mid}, ${e.to.x} ${e.to.y}`;
}

export function nodeLabel(node: MapNode, tier: Tier, index: number, total: number): string {
  if (node.kind === 'line') {
    const line = worldLineById(node.id);
    return line ? `World line ${line.divergence ?? 'with no listed value'}: ${lineLabel(line, tier)}. Route links not mapped.` : '';
  }
  const e = eventById(node.id);
  if (!e) return '';
  const changes = e.transitionId && transitionById(e.transitionId) ? ' World line changes.' : '';
  return `Event ${index + 1} of ${total}: ${safeText(e.title, tier)}. ${formatDate(e)}.${changes} Confidence: ${e.confidence.toLowerCase()}.`;
}

interface NodeProps {
  node: MapNode;
  tier: Tier;
  label: string;
  selected: boolean;
  focusable: boolean;
  dimmed: boolean;
  duration: number;
  /** Marks are drawn larger on a map so wide it opens very small. */
  marks: number;
  onActivate: (id: string) => void;
  onFocusNode: (id: string) => void;
  onHover: (id: string | null, x: number, y: number) => void;
}

const Node = memo(function Node({ node, tier, label, selected, focusable, dimmed, duration, marks, onActivate, onFocusNode, onHover }: NodeProps) {
  const event = node.kind === 'event' ? eventById(node.id) : null;
  const line = node.kind === 'line' ? worldLineById(node.id) : null;
  const confidence = event?.confidence ?? line?.divergenceConfidence ?? 'CONFIRMED';
  const knot = !!event && KNOT_EVENTS.has(event.id) && atLeast(tier, 'sg_part2');
  const conflicted = (event?.conflicts.length ?? 0) > 0;
  const dateUnsure = event?.dateConfidence === 'UNCLEAR';

  return (
    <motion.g
      className={`map-node${selected ? ' is-selected' : ''}`}
      data-node={node.id}
      role="button"
      tabIndex={focusable ? 0 : -1}
      aria-label={label}
      initial={false}
      animate={{ x: node.x, y: node.y, opacity: dimmed ? 0.3 : 1 }}
      transition={{ duration, ease: EASE }}
      onClick={() => onActivate(node.id)}
      onFocus={() => onFocusNode(node.id)}
      onPointerEnter={(e) => onHover(node.id, e.clientX, e.clientY)}
      onPointerLeave={() => onHover(null, 0, 0)}
    >
      <g transform={marks === 1 ? undefined : `scale(${marks})`}>
      <circle className="node-hit" r="13" />
      <circle className={`node-halo halo-${confidence.toLowerCase()}`} r="11" />
      {confidence === 'INTERPRETATION' && <circle r="9" className="node-ring node-ring-interp" />}
      <circle
        r="6"
        className={`node-core node-${confidence.toLowerCase()}`}
        strokeDasharray={confidence === 'UNCLEAR' ? '2 2' : undefined}
      />
      {knot && <path className="node-knot" d="M-4 -4 L4 4 M4 -4 L-4 4" />}
      {conflicted && (
        <text className="node-conflict" x="7" y="-7" aria-hidden="true">
          ⇆
        </text>
      )}
      {dateUnsure && <circle className="node-date-dot" cx="-7" cy="-7" r="1.8" />}
      </g>
    </motion.g>
  );
});

interface CanvasProps {
  model: MapModel;
  tier: Tier;
  /** Screen-space pan in pixels. */
  panX: number;
  panY?: number;
  /** The whole map is scaled like a picture; nothing in it is laid out again. */
  zoom?: number;
  /** Fades the fine detail while the whole story is in view. */
  overview?: boolean;
  marks?: number;
  viewportWidth: number;
  viewHeight?: number;
  orderedIds: string[];
  focusId: string | null;
  selectedId: string | null;
  selectedEdgeId?: string | null;
  duration: number;
  /** Guided mode dims everything except the current node. */
  spotlightId?: string | null;
  spotlightEdgeId?: string | null;
  interactive?: boolean;
  onActivateNode: (id: string) => void;
  onActivateEdge: (edge: MapEdge) => void;
  onFocusNode: (id: string) => void;
  onHoverNode: (id: string | null, x: number, y: number) => void;
  onHoverEdge: (edge: MapEdge | null, x: number, y: number) => void;
  onKeyDown: (e: ReactKeyboardEvent<SVGSVGElement>) => void;
  onPan: (panX: number, panY: number) => void;
  /** Called on every drag move; returns the pan the map may actually use. */
  onPanLive?: (panX: number, panY: number) => { x: number; y: number };
  onZoomWheel: (factor: number, screenX: number, screenY: number) => void;
  onSgInfo: () => void;
}

export function MapCanvas({
  model,
  tier,
  panX,
  panY = 0,
  zoom = 1,
  overview = false,
  marks = 1,
  viewportWidth,
  viewHeight,
  orderedIds,
  focusId,
  selectedId,
  selectedEdgeId,
  duration,
  spotlightId,
  spotlightEdgeId,
  interactive = true,
  onActivateNode,
  onActivateEdge,
  onFocusNode,
  onHoverNode,
  onHoverEdge,
  onKeyDown,
  onPan,
  onPanLive,
  onZoomWheel,
  onSgInfo,
}: CanvasProps) {
  const reduce = useReduceMotion();
  const svg = useRef<SVGSVGElement>(null);
  const world = useRef<SVGGElement>(null);
  const axis = useRef<SVGGElement>(null);
  const rows = useRef<SVGGElement>(null);
  const drag = useRef<{ startX: number; startY: number; panX: number; panY: number; moved: boolean; x: number; y: number } | null>(null);
  const moveDuration = reduce ? 0 : duration;
  const panRef = useRef(panX);
  panRef.current = panX;
  const panYRef = useRef(panY);
  panYRef.current = panY;
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;
  const gutterRef = useRef(model.gutter);
  gutterRef.current = model.gutter;

  // Pans write straight to the group's transform and commit once, so a drag never re-renders nodes.
  const onPointerDown = useCallback(
    (e: ReactPointerEvent<SVGSVGElement>) => {
      if (!interactive || e.button !== 0) return;
      drag.current = { startX: e.clientX, startY: e.clientY, panX, panY, moved: false, x: panX, y: panY };
    },
    [interactive, panX, panY],
  );
  const onPointerMove = useCallback((e: ReactPointerEvent<SVGSVGElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (Math.hypot(dx, dy) > 4) d.moved = true;
    if (!d.moved) return;
    const next = onPanLive ? onPanLive(d.panX + dx, d.panY + dy) : { x: d.panX + dx, y: d.panY + dy };
    d.x = next.x;
    d.y = next.y;
    const put = (el: SVGGElement | null, transform: string) => {
      if (!el) return;
      el.style.transitionDuration = '0s';
      el.style.transform = transform;
    };
    put(world.current, `translate(${next.x + gutterRef.current}px, ${next.y}px) scale(${zoomRef.current})`);
    put(axis.current, `translateX(${next.x + gutterRef.current}px)`);
    put(rows.current, `translateY(${next.y}px)`);
  }, [onPanLive]);
  const onPointerUp = useCallback(() => {
    const d = drag.current;
    drag.current = null;
    if (d?.moved) onPan(d.x, d.y);
  }, [onPan]);

  useEffect(() => {
    const el = svg.current;
    if (!el || !interactive) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      // A sideways swipe moves along the timeline; only an up or down scroll zooms.
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        onPan(panRef.current - e.deltaX, panYRef.current);
        return;
      }
      const rect = el.getBoundingClientRect();
      onZoomWheel(e.deltaY < 0 ? 1.15 : 1 / 1.15, e.clientX - rect.left, e.clientY - rect.top);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [interactive, onPan, onZoomWheel]);

  const modelRef = useRef(model);
  modelRef.current = model;

  // Hover focus toggles classes directly, so moving the pointer never re-renders the map.
  const applyFocus = useCallback((nodeId: string | null, edge: MapEdge | null) => {
    const el = svg.current;
    if (!el) return;
    el.querySelectorAll('.is-related').forEach((item) => item.classList.remove('is-related'));
    el.classList.toggle('has-focus', !!(nodeId || edge));
    if (!nodeId && !edge) return;
    const m = modelRef.current;
    const origin = m.nodes.find((n) => n.id === (nodeId ?? edge?.fromNode));
    const rows = new Set<number>();
    if (origin) rows.add(origin.y);
    if (edge) rows.add(edge.to.y);
    const yOfNode = new Map(m.nodes.map((n) => [n.id, n.y]));
    const edges = new Map(m.edges.map((e) => [e.id, e]));
    el.querySelectorAll<SVGElement>('[data-node], [data-row-y], [data-edge]').forEach((item) => {
      const { node, rowY, edge: edgeId } = item.dataset;
      const other = edgeId ? edges.get(edgeId) : undefined;
      const related = other
        ? edge
          ? other.id === edge.id
          : rows.has(other.from.y) || rows.has(other.to.y)
        : rows.has(node ? (yOfNode.get(node) ?? NaN) : Number(rowY));
      if (related) item.classList.add('is-related');
    });
  }, []);

  const hoverNode = useCallback(
    (id: string | null, x: number, y: number) => {
      onHoverNode(id, x, y);
      if (interactive && !drag.current) applyFocus(id, null);
    },
    [applyFocus, interactive, onHoverNode],
  );
  const hoverEdge = (edge: MapEdge | null, x: number, y: number) => {
    onHoverEdge(edge, x, y);
    if (interactive && !drag.current) applyFocus(null, edge);
  };

  const dimmedNode = (id: string) => !!spotlightId && spotlightId !== id;
  const gutter = model.gutter;
  const shownHeight = viewHeight ?? model.height;
  const slide = { transitionDuration: `${moveDuration}s` };
  // Grid lines follow the labels, so both thin out together while the map is small.
  const ticks = useMemo(() => declutter(model.ticks.map((t) => ({ ...t, x: t.x * zoom }))), [model.ticks, zoom]);
  const canDragUp = model.height * zoom > shownHeight + 1;

  return (
    <svg
      ref={svg}
      className={overview ? 'map-svg is-overview' : 'map-svg'}
      style={{ '--zoom': zoom, touchAction: canDragUp ? 'none' : undefined } as CSSProperties}
      width={viewportWidth}
      height={shownHeight + 34}
      role="application"
      aria-roledescription="world-line map"
      aria-label="World-line map. Use the arrow keys to move between events."
      aria-describedby="map-instructions"
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      <defs>
        <clipPath id="map-clip">
          <rect x={gutter} y="0" width={Math.max(0, viewportWidth - gutter)} height={shownHeight} />
        </clipPath>
        <clipPath id="map-clip-axis">
          <rect x={gutter} y={shownHeight} width={Math.max(0, viewportWidth - gutter)} height="34" />
        </clipPath>
        <clipPath id="map-clip-rows">
          <rect x="0" y="0" width={viewportWidth} height={shownHeight} />
        </clipPath>
      </defs>

      <g clipPath="url(#map-clip)">
        <g
          ref={world}
          className="map-world"
          style={{ transform: `translate(${panX + gutter}px, ${panY}px) scale(${zoom})`, ...slide }}
        >
          {model.bands.map((b) => (
            <rect key={b.key} className={`band band-${b.kind}`} x={-2000} y={b.y0} width={model.width + 4000} height={b.y1 - b.y0} />
          ))}
          {model.boundaryY !== null && (
            <g className={spotlightEdgeId && model.edges.find((e) => e.id === spotlightEdgeId)?.crosses ? 'boundary is-pulsing' : 'boundary'}>
              <line x1={-2000} x2={model.width + 2000} y1={model.boundaryY} y2={model.boundaryY} />
            </g>
          )}
          {ticks.map((t) => (
            <line key={`${t.label}-${t.x}`} className="tick-line" x1={t.x / zoom} x2={t.x / zoom} y1={0} y2={model.height} />
          ))}

          {model.tracks.map((t) => (
            <motion.line
              key={t.lineId}
              data-row-y={t.y}
              className={t.unclear ? 'track track-unclear' : `track${t.lineId === 'wl-sg-1048596' ? ' track-gold' : ''}`}
              initial={false}
              animate={{ x1: t.x1, x2: t.x2, y1: t.y, y2: t.y, opacity: spotlightId ? 0.4 : 1 }}
              transition={{ duration: moveDuration, ease: EASE }}
            />
          ))}

          {model.floatConnector && (
            <g className="float-connector">
              <line x1={model.floatConnector.x1} x2={model.floatConnector.x2} y1={model.floatConnector.y} y2={model.floatConnector.y} />
              <text x={model.floatConnector.x2} y={model.floatConnector.y - 4} textAnchor="end">
                route links not mapped
              </text>
            </g>
          )}

          {model.brackets.map((b) => (
            <g key={b.eventId} className="bracket">
              <path d={`M ${b.x1} ${b.y - 3} V ${b.y} H ${b.x2} V ${b.y - 3}`} />
              {b.label && (
                <text x={(b.x1 + b.x2) / 2} y={b.y + 10} textAnchor="middle">
                  {b.label}
                </text>
              )}
            </g>
          ))}

          {model.edges.map((e) => {
            const style = EDGE_STYLES[e.mechanism];
            const active = !spotlightEdgeId || spotlightEdgeId === e.id;
            const width = e.crosses ? 3.5 : 2;
            const path = edgePath(e);
            const drawOn = spotlightEdgeId === e.id && !reduce;
            const label = e.collapsed
              ? `${e.hiddenSteps} ${e.hiddenSteps === 1 ? 'step' : 'steps'} hidden by media filter`
              : `${style.label} edge`;
            return (
              <g
                key={e.id}
                className={`map-edge${selectedEdgeId === e.id ? ' is-selected' : ''}`}
                data-edge={e.id}
                role="button"
                tabIndex={-1}
                aria-label={label}
                opacity={active ? 1 : 0.25}
                onClick={() => onActivateEdge(e)}
                onPointerEnter={(p) => hoverEdge(e, p.clientX, p.clientY)}
                onPointerLeave={() => hoverEdge(null, 0, 0)}
              >
                <motion.path className="edge-hit" initial={false} animate={{ d: path }} transition={{ duration: moveDuration, ease: EASE }} />
                <motion.path className="edge-halo" stroke={style.color} strokeWidth={width + 7} initial={false} animate={{ d: path }} transition={{ duration: moveDuration, ease: EASE }} />
                {style.double && !e.collapsed && (
                  <motion.path
                    className="edge-line"
                    stroke={style.color}
                    strokeWidth={width + 3}
                    initial={false}
                    animate={{ d: path }}
                    transition={{ duration: moveDuration, ease: EASE }}
                  />
                )}
                <motion.path
                  key={drawOn ? 'draw' : 'static'}
                  className="edge-line"
                  stroke={style.double && !e.collapsed ? 'var(--bg-0)' : style.color}
                  strokeWidth={style.double && !e.collapsed ? 2 : width}
                  strokeDasharray={e.collapsed ? '6 4' : drawOn ? undefined : style.dash}
                  initial={drawOn ? { pathLength: 0, d: path } : false}
                  animate={{ d: path, pathLength: 1 }}
                  transition={{ duration: drawOn ? 0.7 : moveDuration, ease: EASE }}
                />
                <motion.g className="edge-badge" initial={false} animate={{ x: e.to.x + 11, y: (e.from.y + e.to.y) / 2 }} transition={{ duration: moveDuration, ease: EASE }}>
                  {e.collapsed ? (
                    <text className="edge-glyph" fill={style.color} textAnchor="middle" y="4" aria-hidden="true">
                      ⋯
                    </text>
                  ) : (
                    <MechIconGroup kind={e.mechanism} color={style.color} />
                  )}
                </motion.g>
              </g>
            );
          })}

          {model.arcs.map((a) => {
            const top = -Math.abs(a.fromX - a.toX) * 0.06 + Math.min(a.fromY, a.toY) - 8;
            return (
              <path
                key={a.id}
                className={reduce ? 'reconnect-arc' : 'reconnect-arc is-animated'}
                d={`M ${a.fromX} ${a.fromY} C ${a.fromX} ${top}, ${a.toX} ${top}, ${a.toX} ${a.toY}`}
              />
            );
          })}

          {model.nodes.map((node) => {
            const index = orderedIds.indexOf(node.id);
            return (
              <Node
                key={node.id}
                node={node}
                tier={tier}
                label={nodeLabel(node, tier, index, orderedIds.length)}
                selected={selectedId === node.id}
                focusable={interactive && (focusId ? focusId === node.id : index === 0)}
                dimmed={dimmedNode(node.id)}
                duration={moveDuration}
                marks={marks}
                onActivate={onActivateNode}
                onFocusNode={onFocusNode}
                onHover={hoverNode}
              />
            );
          })}
        </g>
      </g>

      <g clipPath="url(#map-clip-axis)">
        <g ref={axis} className="map-slide" style={{ transform: `translateX(${panX + gutter}px)`, ...slide }}>
          {ticks.map((t) => (
            <g key={`${t.label}-${t.x}`} className="tick">
              <text x={t.x + 3} y={shownHeight + 16}>
                {t.label}
              </text>
            </g>
          ))}
          {model.breaks.map((x) => (
            <text key={x} className="axis-break" x={x * zoom} y={shownHeight + 16} aria-hidden="true">
              ≈
            </text>
          ))}
        </g>
      </g>

      <rect className="gutter-bg" x="0" y="0" width={gutter} height={shownHeight + 34} />
      <g clipPath="url(#map-clip-rows)">
      <g ref={rows} className="map-slide" style={{ transform: `translateY(${panY}px)`, ...slide }}>
      {model.boundaryY !== null && (
        <text className="boundary-label" x={viewportWidth - 10} y={model.boundaryY * zoom - 4} textAnchor="end">
          {model.boundaryLabel}
        </text>
      )}
      {model.bands.map(
        (b) =>
          b.label && (
            <text key={b.key} className="band-label" x={gutter + 8} y={b.y0 * zoom + 12}>
              {b.label}
            </text>
          ),
      )}
      {model.rows.map((r) => {
        const y = r.y * zoom;
        const line = r.lineId ? worldLineById(r.lineId) : null;
        if (!line) {
          return (
            <text key={r.key} className="row-label row-label-note" x={gutter - 8} y={y + 4} textAnchor="end">
              no line stated
            </text>
          );
        }
        const usePremise = !!line.premiseLabel && tier === 'premise';
        return (
          <g key={r.key} data-row-y={r.y}>
            {usePremise && (
              <text className="row-label row-label-note" x={gutter - 8} y={y - 8} textAnchor="end">
                {line.premiseLabel}
              </text>
            )}
            <text className={`row-label${r.ghost ? ' row-label-ghost' : ''}`} x={gutter - 8} y={y + (usePremise ? 10 : 4)} textAnchor="end">
              {line.divergence ?? '------'}
            </text>
            {line.id === 'wl-sg-1048596' && (
              <g className="info-dot" role="button" tabIndex={interactive ? 0 : -1} aria-label="Unclear: open sources on whether this line is its own field" onClick={onSgInfo} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSgInfo()}>
                <circle cx={gutter - 96} cy={y} r="8" />
                <text x={gutter - 96} y={y + 4} textAnchor="middle" aria-hidden="true">
                  ?
                </text>
              </g>
            )}
          </g>
        );
      })}
      </g>
      </g>
    </svg>
  );
}
