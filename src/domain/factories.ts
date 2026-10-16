import { getComponentType } from '@/data/componentCatalog';
import { getConnectionKind } from '@/data/connectionCatalog';
import type {
  ComponentProperties,
  ComponentTypeId,
  ConnectionKindId,
  Diagram,
  DiagramEdge,
  DiagramLevel,
  DiagramNode,
  DiagramSettings,
  Point,
} from '@/types';
import { newId, nowIso, slugify } from '@/utils/id';

export const SCHEMA_VERSION = 1;
export const DEFAULT_GRID = 20;

export const defaultSettings = (over: Partial<DiagramSettings> = {}): DiagramSettings => ({
  showGrid: true,
  snapToGrid: true,
  gridSize: DEFAULT_GRID,
  showMinimap: false,
  ...over,
});

export function createProperties(typeId: ComponentTypeId, over: Partial<ComponentProperties> = {}): ComponentProperties {
  const def = getComponentType(typeId);
  const name = over.name ?? def.defaultName;
  return {
    name,
    identifier: slugify(name),
    description: '',
    technology: '',
    responsibility: '',
    notes: '',
    links: [],
    metadata: {},
    ...over,
  };
}

export function createNode(
  typeId: ComponentTypeId,
  position: Point,
  over: Partial<ComponentProperties> = {},
  size?: { width?: number; height?: number },
  zIndex?: number,
): DiagramNode {
  const def = getComponentType(typeId);
  return {
    id: newId(),
    type: typeId,
    position,
    size: { width: size?.width ?? def.size.width, height: size?.height ?? def.size.height },
    zIndex: zIndex ?? (def.shape === 'boundary' ? 0 : 10),
    properties: createProperties(typeId, over),
  };
}

export function createEdge(source: string, target: string, kind: ConnectionKindId, over: Partial<DiagramEdge> = {}): DiagramEdge {
  const k = getConnectionKind(kind);
  return {
    id: newId(),
    source,
    target,
    sourceHandle: null,
    targetHandle: null,
    kind,
    label: '',
    protocol: k.defaultProtocol,
    description: '',
    sync: k.sync,
    direction: k.direction,
    ...over,
  };
}

export function createDiagram(input: {
  projectId: string;
  name: string;
  description?: string;
  level?: DiagramLevel;
  styleIds?: string[];
  patternIds?: string[];
  nodes?: DiagramNode[];
  edges?: DiagramEdge[];
  settings?: Partial<DiagramSettings>;
}): Diagram {
  const now = nowIso();
  return {
    id: newId(),
    projectId: input.projectId,
    name: input.name.trim(),
    description: input.description?.trim() ?? '',
    level: input.level ?? 'free',
    styleIds: input.styleIds ?? [],
    patternIds: input.patternIds ?? [],
    nodes: input.nodes ?? [],
    edges: input.edges ?? [],
    viewport: { x: 0, y: 0, zoom: 1 },
    settings: defaultSettings(input.settings),
    revision: 0,
    schemaVersion: SCHEMA_VERSION,
    createdAt: now,
    updatedAt: now,
  };
}

export function cloneSubgraph(nodes: DiagramNode[], edges: DiagramEdge[], offset: Point): { nodes: DiagramNode[]; edges: DiagramEdge[] } {
  const map = new Map<string, string>();
  const newNodes = nodes.map((n) => {
    const id = newId();
    map.set(n.id, id);
    return {
      ...structuredClone(n),
      id,
      position: { x: n.position.x + offset.x, y: n.position.y + offset.y },
    };
  });
  const newEdges = edges
    .filter((e) => map.has(e.source) && map.has(e.target))
    .map((e) => ({ ...structuredClone(e), id: newId(), source: map.get(e.source)!, target: map.get(e.target)! }));
  return { nodes: newNodes, edges: newEdges };
}
