import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, useReactFlow, type EdgeProps } from '@xyflow/react';
import { memo, type PointerEvent as RPointerEvent } from 'react';
import { orthogonalRoute, roundedPolyline } from '@/domain/edgePath';
import { useEditorStore } from '@/store/editorStore';
import type { Point } from '@/types';
import { getIcon } from '@/components/ui/iconMap';
import { getConnectionKind } from '@/data/connectionCatalog';
import type { ArchEdge } from '@/domain/flowMapper';

const MARKER = {
  closed: 'M0,0 L10,5 L0,10 z',
  open: 'M1,1 L9,5 L1,9',
};

function SemanticEdgeImpl(props: EdgeProps<ArchEdge>) {
  const { id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data, selected } = props;
  const kind = getConnectionKind(data?.kind ?? 'http');
  const sync = data?.sync ?? kind.sync;
  const direction = data?.direction ?? kind.direction;
  const rf = useReactFlow();
  const waypoints = data?.waypoints;
  const manual = !!waypoints?.length;
  const auto = getSmoothStepPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, borderRadius: 10 });
  const route: Point[] = [{ x: sourceX, y: sourceY }, ...(waypoints ?? []), { x: targetX, y: targetY }];
  const horizontalSide = (pos: string) => pos === 'left' || pos === 'right';
  const ortho = manual ? orthogonalRoute(route, horizontalSide(sourcePosition), horizontalSide(targetPosition)) : null;
  const poly = ortho ? roundedPolyline(ortho.points) : null;
  const path = poly ? poly.path : auto[0];
  const lx = poly ? poly.mid.x : auto[1];
  const ly = poly ? poly.mid.y : auto[2];

  const toFlow = (e: PointerEvent | RPointerEvent): Point => {
    const p = rf.screenToFlowPosition({ x: e.clientX, y: e.clientY });
    const { snapToGrid, gridSize } = useEditorStore.getState().settings;
    return snapToGrid
      ? { x: Math.round(p.x / gridSize) * gridSize, y: Math.round(p.y / gridSize) * gridSize }
      : { x: Math.round(p.x), y: Math.round(p.y) };
  };

  const startDrag = (e: RPointerEvent, index: number, base: Point[]) => {
    e.stopPropagation();
    e.preventDefault();
    const st = useEditorStore.getState();
    st.commit();
    st.setEdgeWaypoints(id, base);
    const move = (ev: PointerEvent) => {
      const next = [...base];
      next[index] = toFlow(ev);
      useEditorStore.getState().setEdgeWaypoints(id, next);
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const removePoint = (index: number) => {
    const st = useEditorStore.getState();
    st.commit();
    st.setEdgeWaypoints(
      id,
      (waypoints ?? []).filter((_, i) => i !== index),
    );
  };

  const mids = selected ? (ortho ? ortho.segmentMids : [{ x: auto[1], y: auto[2] }]).map((m, i) => ({ x: m.x, y: m.y, seg: i })) : [];
  const color = selected ? 'var(--accent)' : sync === 'async' ? 'var(--edge-async)' : 'var(--edge-sync)';
  const Icon = getIcon(kind.icon);
  const open = kind.marker === 'open';
  const endId = `${id}-end`;
  const startId = `${id}-start`;
  const text = data?.label;

  const marker = (mid: string, orient: string) => (
    <marker
      id={mid}
      viewBox="0 0 10 10"
      refX={open ? 8 : 9}
      refY="5"
      markerWidth="5"
      markerHeight="5"
      orient={orient}
      markerUnits="strokeWidth"
    >
      <path d={MARKER[kind.marker]} fill={open ? 'none' : color} stroke={color} strokeWidth={open ? 1.5 : 0.5} strokeLinejoin="round" />
    </marker>
  );

  return (
    <>
      <defs>
        {direction !== 'none' && marker(endId, 'auto')}
        {direction === 'both' && marker(startId, 'auto-start-reverse')}
      </defs>
      <BaseEdge
        id={id}
        path={path}
        markerEnd={direction !== 'none' ? `url(#${endId})` : undefined}
        markerStart={direction === 'both' ? `url(#${startId})` : undefined}
        interactionWidth={22}
        style={{ stroke: color, strokeWidth: kind.width + (selected ? 0.75 : 0), strokeDasharray: kind.dash || undefined }}
      />
      <EdgeLabelRenderer>
        {selected &&
          mids.map((m) => (
            <div
              key={`m${m.seg}`}
              className="wp wp-add nodrag nopan"
              title="Arraste para criar uma curva"
              style={{ transform: `translate(-50%, -50%) translate(${m.x}px, ${m.y}px)` }}
              onPointerDown={(e) => {
                const base = [...(waypoints ?? [])];
                base.splice(m.seg, 0, { x: m.x, y: m.y });
                startDrag(e, m.seg, base);
              }}
            />
          ))}
        {selected &&
          (waypoints ?? []).map((w, i) => (
            <div
              key={`w${i}`}
              className="wp nodrag nopan"
              title="Arraste para mover · duplo clique para remover"
              style={{ transform: `translate(-50%, -50%) translate(${w.x}px, ${w.y}px)` }}
              onPointerDown={(e) => startDrag(e, i, [...(waypoints ?? [])])}
              onDoubleClick={() => removePoint(i)}
            />
          ))}
        <div
          className={`edge-chip nodrag nopan ${selected ? 'selected' : ''} ${sync}`}
          style={{ transform: `translate(-50%, -50%) translate(${lx}px, ${ly}px)` }}
          title={[kind.label, data?.protocol, sync === 'async' ? 'assíncrono' : 'síncrono', data?.description].filter(Boolean).join(' · ')}
        >
          <Icon size={11} />
          <b>{kind.short}</b>
          {text && <span>{text}</span>}
          {sync === 'async' && <i>async</i>}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export const SemanticEdge = memo(SemanticEdgeImpl);
