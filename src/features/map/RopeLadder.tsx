import { useMemo } from 'react';
import { navigate } from '../../app/router';
import { EDGE_STYLES } from '../../components/glyphs';
import type { Media, Tier } from '../../data/schema';
import { eventById, glossaryById, isVisible, transitionById, visibleEvents, worldLineById } from '../../data/selectors';
import { ROPE_GLOSSARY } from './constants';
import type { Selection } from './DetailPanel';
import { HopMark } from './HopMark';
import { buildMapModel, type MapEdge, type MapNode } from './layout';
import { nodeLabel, ropePath } from './MapCanvas';
import { RopeKey } from './RopeKey';

const TOP = 26;
const two = (n: number) => String(n).padStart(2, '0');

/**
 * The rope map turned on its side for a narrow screen: threads run down the page, the order lived runs
 * top to bottom, and the page scrolls like any other. Same model as the wide map, so nothing differs
 * but the direction. Each time the red strand lands on a thread, the thread's number is printed there.
 */
export function RopeLadder({ tier, media, onOpen }: { tier: Tier; media: Media[]; onOpen: (s: Selection) => void }) {
  const model = useMemo(() => buildMapModel(tier, media, 'seq', 330), [tier, media]);
  const order = useMemo(() => visibleEvents(tier, media, 'seq').map((e) => e.id), [tier, media]);
  const width = model.height;
  // The page ends just past the knots, not at the far edge the wide map keeps for its labels.
  const height = (model.ropes.length > 0 ? model.ropes[0].knotX + 56 : model.width) + TOP;
  // Model x (order lived) becomes down the page; model y (which thread) becomes across it.
  const down = (x: number) => x + TOP;

  const edgePath = (e: MapEdge) => {
    const mid = (e.from.x + e.to.x) / 2;
    return `M ${e.from.y} ${down(e.from.x)} C ${e.from.y} ${down(mid)}, ${e.to.y} ${down(mid)}, ${e.to.y} ${down(e.to.x)}`;
  };
  const side = (x: number) => (x < width / 2 ? { x: x + 12, anchor: 'start' as const } : { x: x - 12, anchor: 'end' as const });
  const open = (node: MapNode) => onOpen({ kind: node.kind === 'event' ? 'event' : 'line', id: node.id });
  const onKey = (act: () => void) => (k: React.KeyboardEvent) => {
    if (k.key !== 'Enter' && k.key !== ' ') return;
    k.preventDefault();
    act();
  };

  const first = model.nodes.find((n) => n.id === order[0]);
  const firstLine = first?.lineId ? worldLineById(first.lineId) : undefined;
  const arrivals = [
    ...(first && firstLine ? [{ key: 'start', x: first.y, y: down(first.x) - 16, value: firstLine.divergence }] : []),
    ...model.edges.flatMap((e) => {
      const to = e.transitionId ? worldLineById(transitionById(e.transitionId)?.to ?? '') : undefined;
      return to ? [{ key: e.id, x: e.to.y, y: down(e.to.x) + 22, value: to.divergence }] : [];
    }),
  ];

  return (
    <>
      <p className="map-caption">Top to bottom is the order Okabe lived it. Follow the red strand, and tap a bead or a hop to read it.</p>
      <RopeKey model={model} tier={tier} media={media} />
      <div className="map-host ladder-host">
        <svg className="rope-ladder" viewBox={`0 0 ${width} ${height}`} role="group" aria-label="World-line map, top to bottom in the order lived">
          {model.ticks.map((t) => (
            <g key={`${t.label}-${t.x}`} className="ladder-date">
              <line x1="0" x2={width} y1={down(t.x)} y2={down(t.x)} />
              <text x={width - 4} y={down(t.x) - 4} textAnchor="end">
                {t.label}
              </text>
            </g>
          ))}
          {model.boundaryY !== null && (
            <g className="boundary">
              <line x1={model.boundaryY} x2={model.boundaryY} y1="0" y2={height} />
            </g>
          )}
          <path
            className="thread"
            d={model.threads
              .filter((t) => t.until === null)
              .map((t) => `M ${t.y} 0 V ${height}`)
              .join(' ')}
          />
          {model.ropes.map((r) => (
            <path key={r.kind} className="thread thread-rope" transform={`translate(0 ${TOP})`} d={ropePath(r, false, true)} />
          ))}

          {model.tracks.map((t) => (
            <line key={t.lineId} className={t.unclear ? 'track track-unclear' : 'track'} x1={t.y} x2={t.y} y1={down(t.x1)} y2={down(t.x2)} />
          ))}
          {model.edges.map((e) => {
            const style = EDGE_STYLES[e.mechanism];
            const label = e.collapsed ? `${e.hiddenSteps} ${e.hiddenSteps === 1 ? 'step' : 'steps'} hidden by media filter` : `${style.label}${e.number ? ` ${two(e.number)}` : ''}: a jump to another thread`;
            const act = () => e.transitionId && onOpen({ kind: 'edge', id: e.transitionId });
            return (
              <g key={e.id} className={`map-edge${e.branch ? ' is-branch' : ''}`} data-edge={e.id} role="button" tabIndex={0} aria-label={label} onClick={act} onKeyDown={onKey(act)}>
                <path className="edge-hit" d={edgePath(e)} />
                <path className="edge-line" pathLength={1} strokeWidth={e.crosses ? 4.5 : 3} d={edgePath(e)} />
                <g transform={`translate(${(e.from.y + e.to.y) / 2} ${down((e.from.x + e.to.x) / 2)})`}>
                  {e.collapsed ? (
                    <text className="edge-glyph" textAnchor="middle" y="4" aria-hidden="true">
                      ⋯
                    </text>
                  ) : (
                    <HopMark mechanism={e.mechanism} number={e.number} />
                  )}
                </g>
              </g>
            );
          })}

          {arrivals.map((a) => (
            <text key={a.key} className="ladder-value" x={side(a.x).x} y={a.y} textAnchor={side(a.x).anchor} aria-hidden="true">
              {a.value ?? '------'}
            </text>
          ))}

          {model.ropes.map((r) => {
            const entry = glossaryById(ROPE_GLOSSARY[r.kind]);
            const act = () => entry && isVisible(entry, tier) && navigate(`glossary/${entry.id}`);
            return (
              <g key={r.kind} className="rope-knot" data-knot={r.kind} role="button" tabIndex={0} aria-label={`${r.label} knot: where every thread in this rope ends up. Opens its glossary entry.`} transform={`translate(${r.knotY} ${down(r.knotX)})`} onClick={act} onKeyDown={onKey(act)}>
                <circle className="node-hit" r="20" />
                <circle className="knot-core" r="8" />
                <text y="28" textAnchor="middle">
                  {r.label} knot
                </text>
              </g>
            );
          })}

          {model.nodes.map((node) => {
            const event = node.kind === 'event' ? eventById(node.id) : undefined;
            const confidence = (event?.confidence ?? 'CONFIRMED').toLowerCase();
            return (
              <g
                key={node.id}
                className={`map-node${model.latestId === node.id ? ' is-latest' : ''}`}
                data-node={node.id}
                role="button"
                tabIndex={0}
                aria-label={nodeLabel(node, tier, order.indexOf(node.id), order.length)}
                transform={`translate(${node.y} ${down(node.x)})`}
                onClick={() => open(node)}
                onKeyDown={onKey(() => open(node))}
              >
                <circle className="node-hit" r="18" />
                <circle className={`node-core node-${confidence}`} r="6.5" />
              </g>
            );
          })}
        </svg>
      </div>
    </>
  );
}
