import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { getIcon } from '@/components/ui/iconMap';
import { getCategory, getComponentType } from '@/data/componentCatalog';
import { getConnectionKind } from '@/data/connectionCatalog';

export interface StageNode {
  id: string;
  typeId: string;
  name: string;
  tech?: string;
  desc?: string;
  x: number;
  y: number;
  w: number;
  h: number;
  tag?: string;
  link?: boolean;
}

export interface StageEdge {
  id: string;
  from: string;
  to: string;
  kind: string;
  label?: string;
}

interface Props {
  width: number;
  height: number;
  nodes: StageNode[];
  edges: StageEdge[];
  /** ids (de nós e arestas) atualmente visíveis */
  shown: ReadonlySet<string>;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  /** arestas com “pacotes” percorrendo o caminho */
  pulseEdges?: ReadonlySet<string>;
  label: string;
  minScale?: number;
}

type Pt = { x: number; y: number };

function route(a: StageNode, b: StageNode): { d: string; mid: Pt; end: Pt } {
  const ac = { x: a.x + a.w / 2, y: a.y + a.h / 2 };
  const bc = { x: b.x + b.w / 2, y: b.y + b.h / 2 };
  const horizontal = Math.abs(bc.x - ac.x) * 0.55 >= Math.abs(bc.y - ac.y) || (b.x > a.x + a.w && Math.abs(bc.y - ac.y) < a.h);
  const r = 10;
  if (horizontal) {
    const dir = bc.x >= ac.x ? 1 : -1;
    const p1 = { x: dir > 0 ? a.x + a.w : a.x, y: ac.y };
    const p2 = { x: dir > 0 ? b.x : b.x + b.w, y: bc.y };
    const mx = (p1.x + p2.x) / 2;
    const dy = p2.y - p1.y;
    const mid = { x: mx, y: (p1.y + p2.y) / 2 };
    if (Math.abs(dy) < 2) return { d: `M${p1.x} ${p1.y}L${p2.x} ${p2.y}`, mid, end: p2 };
    const sy = Math.sign(dy);
    const rr = Math.min(r, Math.abs(dy) / 2);
    return {
      d: `M${p1.x} ${p1.y}H${mx - dir * rr}Q${mx} ${p1.y} ${mx} ${p1.y + sy * rr}V${p2.y - sy * rr}Q${mx} ${p2.y} ${mx + dir * rr} ${p2.y}H${p2.x}`,
      mid,
      end: p2,
    };
  }
  const dir = bc.y >= ac.y ? 1 : -1;
  const p1 = { x: ac.x, y: dir > 0 ? a.y + a.h : a.y };
  const p2 = { x: bc.x, y: dir > 0 ? b.y : b.y + b.h };
  const my = (p1.y + p2.y) / 2;
  const dx = p2.x - p1.x;
  const mid = { x: (p1.x + p2.x) / 2, y: my };
  if (Math.abs(dx) < 2) return { d: `M${p1.x} ${p1.y}L${p2.x} ${p2.y}`, mid, end: p2 };
  const sx = Math.sign(dx);
  const rr = Math.min(r, Math.abs(dx) / 2);
  return {
    d: `M${p1.x} ${p1.y}V${my - dir * rr}Q${p1.x} ${my} ${p1.x + sx * rr} ${my}H${p2.x - sx * rr}Q${p2.x} ${my} ${p2.x} ${my + dir * rr}V${p2.y}`,
    mid,
    end: p2,
  };
}

/** Palco que reaproveita as classes visuais do editor real (`.arch-node`, `.edge-chip`, …) sem React Flow. */
export function DiagramStage({ width, height, nodes, edges, shown, selectedId, onSelect, pulseEdges, label, minScale = 0.5 }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const fit = () => setScale(Math.max(minScale, Math.min(1, el.clientWidth / width)));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [width, minScale]);

  const byId = new Map(nodes.map((n) => [n.id, n]));
  const key = (e: KeyboardEvent, id: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect?.(id);
    }
  };

  return (
    <div className="stage-wrap" ref={wrap} style={{ height: height * scale }}>
      <div className="stage-scroll">
        <div className="stage-box" style={{ width: width * scale, height: height * scale }}>
          <div className="stage" role="group" aria-label={label} style={{ width, height, transform: `scale(${scale})` }}>
            <svg className="stage-edges" width={width} height={height} aria-hidden>
              {edges.map((e) => {
                const a = byId.get(e.from);
                const b = byId.get(e.to);
                if (!a || !b) return null;
                const kind = getConnectionKind(e.kind);
                const on = shown.has(e.id);
                const selected = selectedId === e.from || selectedId === e.to;
                const color = selected ? 'var(--accent-fg)' : kind.sync === 'async' ? 'var(--edge-async)' : 'var(--edge-sync)';
                const { d } = route(a, b);
                const open = kind.marker === 'open';
                const mid = `m-${e.id}`;
                return (
                  <g key={e.id} className={`stage-edge ${on ? 'on' : ''}`}>
                    <defs>
                      <marker
                        id={mid}
                        viewBox="0 0 10 10"
                        refX={open ? 8 : 9}
                        refY="5"
                        markerWidth="5"
                        markerHeight="5"
                        orient="auto"
                        markerUnits="strokeWidth"
                      >
                        <path
                          d={open ? 'M1,1 L9,5 L1,9' : 'M0,0 L10,5 L0,10 z'}
                          fill={open ? 'none' : color}
                          stroke={color}
                          strokeWidth={open ? 1.5 : 0.5}
                          strokeLinejoin="round"
                        />
                      </marker>
                    </defs>
                    <path
                      d={d}
                      fill="none"
                      pathLength={1}
                      stroke={color}
                      strokeWidth={kind.width}
                      strokeDasharray={kind.dash ? kind.dash : undefined}
                      markerEnd={kind.direction !== 'none' ? `url(#${mid})` : undefined}
                      className={kind.dash ? 'fade' : 'draw'}
                    />
                    {on && pulseEdges?.has(e.id) && (
                      <circle r="4.5" fill="var(--accent)" className="packet">
                        <animateMotion dur="1.7s" repeatCount="indefinite" path={d} />
                      </circle>
                    )}
                  </g>
                );
              })}
            </svg>

            {edges.map((e) => {
              const a = byId.get(e.from);
              const b = byId.get(e.to);
              if (!a || !b) return null;
              const kind = getConnectionKind(e.kind);
              const Icon = getIcon(kind.icon);
              const { mid } = route(a, b);
              return (
                <div
                  key={e.id}
                  className={`edge-chip stage-chip ${kind.sync} ${shown.has(e.id) ? 'on' : ''}`}
                  style={{ left: mid.x, top: mid.y }}
                >
                  <Icon size={11} />
                  <b>{kind.short}</b>
                  {e.label && <span>{e.label}</span>}
                  {kind.sync === 'async' && <i>async</i>}
                </div>
              );
            })}

            {nodes.map((n) => {
              const def = getComponentType(n.typeId);
              const cat = getCategory(def.category);
              const Icon = getIcon(def.icon);
              const interactive = !!onSelect;
              const boundary = def.shape === 'boundary';
              return (
                <div
                  key={n.id}
                  className={`arch-node shape-${def.shape} stage-node ${shown.has(n.id) ? 'on' : ''} ${selectedId === n.id ? 'selected' : ''} ${interactive && !boundary ? 'clickable' : ''}`}
                  style={{ left: n.x, top: n.y, width: n.w, height: n.h, ['--accent' as string]: cat.color }}
                  role={interactive && !boundary ? 'button' : undefined}
                  tabIndex={interactive && !boundary && shown.has(n.id) ? 0 : -1}
                  aria-hidden={!shown.has(n.id)}
                  aria-pressed={interactive && !boundary ? selectedId === n.id : undefined}
                  aria-label={interactive && !boundary ? `${def.label}: ${n.name}` : undefined}
                  onClick={interactive && !boundary ? () => onSelect(n.id) : undefined}
                  onKeyDown={interactive && !boundary ? (e) => key(e, n.id) : undefined}
                >
                  {boundary ? (
                    <div className="boundary-label">
                      <Icon size={13} />
                      <span>{n.name}</span>
                      {n.tag && <em className="tag">{n.tag}</em>}
                    </div>
                  ) : (
                    <>
                      <div className="node-head">
                        <Icon size={14} />
                        <span className="node-type">{def.label}</span>
                        {n.tag && <em className="tag">{n.tag}</em>}
                      </div>
                      <div className="node-name">{n.name}</div>
                      {n.tech && <div className="node-tech">{n.tech}</div>}
                      {n.desc && (
                        <p className="node-desc" style={{ WebkitLineClamp: 2 }}>
                          {n.desc}
                        </p>
                      )}
                      {n.link && <span className="node-link">detalhe</span>}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
