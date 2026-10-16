import type { Edge, Node } from '@xyflow/react';
import { getComponentType } from '@/data/componentCatalog';
import type { ComponentProperties, Point, Diagram, DiagramEdge, DiagramNode } from '@/types';

export interface ArchNodeData extends Record<string, unknown> {
  typeId: string;
  properties: ComponentProperties;
  componentId?: string;
}

export interface ArchEdgeData extends Record<string, unknown> {
  kind: string;
  label: string;
  protocol: string;
  description: string;
  sync: DiagramEdge['sync'];
  direction: DiagramEdge['direction'];
  waypoints?: Point[];
}

export type ArchNode = Node<ArchNodeData, 'arch'>;
export type ArchEdge = Edge<ArchEdgeData, 'semantic'>;

export const nodeClass = (typeId: string): string | undefined =>
  getComponentType(typeId).shape === 'boundary' ? 'is-boundary' : undefined;

export const toFlowNode = (n: DiagramNode): ArchNode => ({
  className: nodeClass(n.type),
  id: n.id,
  type: 'arch',
  position: n.position,
  width: n.size.width,
  height: n.size.height,
  zIndex: n.zIndex,
  data: { typeId: n.type, properties: n.properties, componentId: n.componentId },
});

export const toFlowEdge = (e: DiagramEdge): ArchEdge => ({
  id: e.id,
  type: 'semantic',
  source: e.source,
  target: e.target,
  sourceHandle: e.sourceHandle ?? null,
  targetHandle: e.targetHandle ?? null,
  data: {
    kind: e.kind,
    label: e.label,
    protocol: e.protocol,
    description: e.description,
    sync: e.sync,
    direction: e.direction,
    waypoints: e.waypoints,
  },
});

export const fromFlowNode = (n: ArchNode): DiagramNode => ({
  id: n.id,
  type: n.data.typeId,
  componentId: n.data.componentId,
  position: { x: Math.round(n.position.x), y: Math.round(n.position.y) },
  size: {
    width: Math.round(n.width ?? n.measured?.width ?? 180),
    height: Math.round(n.height ?? n.measured?.height ?? 80),
  },
  zIndex: n.zIndex ?? 10,
  properties: n.data.properties,
});

export const fromFlowEdge = (e: ArchEdge): DiagramEdge => ({
  id: e.id,
  source: e.source,
  target: e.target,
  sourceHandle: e.sourceHandle ?? null,
  targetHandle: e.targetHandle ?? null,
  kind: e.data?.kind ?? 'http',
  label: e.data?.label ?? '',
  protocol: e.data?.protocol ?? '',
  description: e.data?.description ?? '',
  sync: e.data?.sync ?? 'sync',
  direction: e.data?.direction ?? 'forward',
  waypoints: e.data?.waypoints?.length ? e.data.waypoints : undefined,
});

export const diagramToFlow = (d: Diagram) => ({
  nodes: d.nodes.map(toFlowNode),
  edges: d.edges.map(toFlowEdge),
});
