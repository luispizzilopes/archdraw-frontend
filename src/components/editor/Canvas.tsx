import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  MiniMap,
  ReactFlow,
  useReactFlow,
  type Viewport as RFViewport,
} from '@xyflow/react';
import { useCallback, useMemo, type DragEvent } from 'react';
import { getComponentType } from '@/data/componentCatalog';
import type { ArchEdge, ArchNode as ArchNodeType } from '@/domain/flowMapper';
import { useEditorStore } from '@/store/editorStore';
import type { ReusableComponent } from '@/types';
import { ArchNode } from './ArchNode';
import { DND_REUSABLE, DND_TYPE } from './Library';
import { SemanticEdge } from './SemanticEdge';

export type Tool = 'select' | 'pan';

interface Props {
  tool: Tool;
  reusables: ReusableComponent[];
  onOpenDiagram: (id: string) => void;
}

const nodeTypes = { arch: ArchNode };
const edgeTypes = { semantic: SemanticEdge };

export function Canvas({ tool, reusables, onOpenDiagram }: Props) {
  const rf = useReactFlow();
  const nodes = useEditorStore((s) => s.nodes);
  const edges = useEditorStore((s) => s.edges);
  const settings = useEditorStore((s) => s.settings);
  const viewport = useEditorStore((s) => s.viewport);
  const st = useEditorStore.getState;

  const onDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      const typeId = e.dataTransfer.getData(DND_TYPE);
      const reusableId = e.dataTransfer.getData(DND_REUSABLE);
      if (!typeId && !reusableId) return;
      const pt = rf.screenToFlowPosition({ x: e.clientX, y: e.clientY });
      const reusable = reusableId ? reusables.find((r) => r.id === reusableId) : undefined;
      const size = reusable ? reusable.size : getComponentType(typeId).size;
      const g = settings.snapToGrid ? settings.gridSize : 1;
      const pos = {
        x: Math.round((pt.x - size.width / 2) / g) * g,
        y: Math.round((pt.y - size.height / 2) / g) * g,
      };
      if (reusable) st().addReusable(reusable, pos);
      else st().addNode(typeId, pos);
    },
    [rf, reusables, settings.snapToGrid, settings.gridSize, st],
  );

  const onDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const grid = settings.gridSize;
  const snapGrid = useMemo<[number, number]>(() => [grid, grid], [grid]);
  const select = tool === 'select';

  return (
    <ReactFlow<ArchNodeType, ArchEdge>
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onNodesChange={st().onNodesChange}
      onEdgesChange={st().onEdgesChange}
      onConnect={st().onConnect}
      edgesReconnectable
      reconnectRadius={20}
      onReconnect={(old, c) => st().reconnectEdge(old.id, c)}
      onNodeDragStart={() => st().commit()}
      onNodeDoubleClick={(_, n) => n.data.properties.linkedDiagramId && onOpenDiagram(n.data.properties.linkedDiagramId)}
      onMoveEnd={(_, v: RFViewport) => st().setViewport(v)}
      onDrop={onDrop}
      onDragOver={onDragOver}
      defaultViewport={viewport}
      onInit={(inst) => {
        const v = st().viewport;
        if (st().nodes.length && v.x === 0 && v.y === 0 && v.zoom === 1) void inst.fitView({ padding: 0.2, maxZoom: 1, duration: 0 });
      }}
      connectionMode={ConnectionMode.Loose}
      connectionRadius={28}
      snapToGrid={settings.snapToGrid}
      snapGrid={snapGrid}
      minZoom={0.1}
      maxZoom={2.5}
      deleteKeyCode={null}
      selectionKeyCode={null}
      multiSelectionKeyCode={['Shift', 'Meta', 'Control']}
      selectionOnDrag={select}
      panOnDrag={select ? [1, 2] : true}
      panActivationKeyCode="Space"
      disableKeyboardA11y
      zoomOnDoubleClick={false}
      elevateNodesOnSelect={false}
      elevateEdgesOnSelect
      proOptions={{ hideAttribution: true }}
    >
      {settings.showGrid && <Background variant={BackgroundVariant.Dots} gap={grid} size={1.4} color="var(--grid-dot)" />}
      {settings.showMinimap && (
        <MiniMap pannable zoomable className="minimap" maskColor="var(--minimap-mask)" nodeColor="var(--minimap-node)" />
      )}
    </ReactFlow>
  );
}
