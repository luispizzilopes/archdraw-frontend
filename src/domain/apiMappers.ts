import type {
  ArchitecturalComponent,
  ComponentProperties,
  Diagram,
  DiagramEdge,
  DiagramNode,
  DiagramSummary,
  DocumentRecord,
  DocumentScope,
  Project,
} from '@/types';
import type {
  ComponentDto,
  DiagramDto,
  DocumentDto,
  EdgeDto,
  NodeDto,
  NodePropertiesDto,
  ProjectDto,
  SnapshotBodyDto,
  SnapshotResponseDto,
} from '@/types/api';

export const toProject = (d: ProjectDto): Project => ({
  id: d.id,
  name: d.name,
  description: d.description,
  primaryStyleId: d.primaryStyleId ?? undefined,
  secondaryStyleIds: d.secondaryStyleIds,
  diagramCount: d.diagramCount,
  createdAt: d.createdAtUtc,
  updatedAt: d.updatedAtUtc,
});

export const toDiagramSummary = (d: DiagramDto): DiagramSummary => ({
  id: d.id,
  projectId: d.projectId,
  name: d.name,
  description: d.description,
  level: d.level as DiagramSummary['level'],
  styleIds: d.styleIds,
  patternIds: d.patternIds,
  revision: d.revision,
  nodeCount: d.nodeCount,
  connectionCount: d.connectionCount,
  createdAt: d.createdAtUtc,
  updatedAt: d.updatedAtUtc,
});

export const toProperties = (p: NodePropertiesDto): ComponentProperties => ({
  name: p.name,
  identifier: p.identifier ?? '',
  description: p.description ?? '',
  technology: p.technology ?? '',
  responsibility: p.responsibility ?? '',
  notes: p.notes ?? '',
  patternId: p.patternId ?? undefined,
  links: p.links ?? [],
  linkedDiagramId: p.linkedDiagramId ?? undefined,
  metadata: p.metadata ?? {},
});

export const toPropertiesDto = (p: ComponentProperties): NodePropertiesDto => ({
  name: p.name,
  identifier: p.identifier,
  description: p.description,
  technology: p.technology,
  responsibility: p.responsibility,
  notes: p.notes,
  patternId: p.patternId ?? null,
  links: p.links,
  linkedDiagramId: p.linkedDiagramId ?? null,
  metadata: p.metadata,
});

export const toNode = (n: NodeDto): DiagramNode => ({
  id: n.id,
  type: n.type,
  componentId: n.componentId ?? undefined,
  position: n.position,
  size: n.size,
  zIndex: n.zIndex,
  properties: toProperties(n.properties),
});

export const toNodeDto = (n: DiagramNode): NodeDto => ({
  id: n.id,
  type: n.type,
  componentId: n.componentId ?? null,
  position: n.position,
  size: n.size,
  zIndex: n.zIndex,
  properties: toPropertiesDto(n.properties),
});

export const toEdge = (e: EdgeDto): DiagramEdge => ({
  id: e.id,
  source: e.source,
  target: e.target,
  sourceHandle: e.sourceHandle ?? null,
  targetHandle: e.targetHandle ?? null,
  kind: e.kind,
  label: e.label ?? '',
  protocol: e.protocol ?? '',
  description: e.description ?? '',
  sync: e.sync as DiagramEdge['sync'],
  direction: e.direction as DiagramEdge['direction'],
  waypoints: e.waypoints?.length ? e.waypoints : undefined,
});

export const toEdgeDto = (e: DiagramEdge): EdgeDto => ({
  id: e.id,
  source: e.source,
  target: e.target,
  sourceHandle: e.sourceHandle ?? null,
  targetHandle: e.targetHandle ?? null,
  kind: e.kind,
  label: e.label,
  protocol: e.protocol,
  description: e.description,
  sync: e.sync,
  direction: e.direction,
  waypoints: e.waypoints ?? [],
});

export const toSnapshotBody = (d: Pick<Diagram, 'nodes' | 'edges' | 'viewport' | 'settings'>): SnapshotBodyDto => ({
  nodes: d.nodes.map(toNodeDto),
  edges: d.edges.map(toEdgeDto),
  viewport: d.viewport,
  settings: d.settings,
});

export const toDiagram = (meta: DiagramSummary, snapshot: SnapshotResponseDto): Diagram => ({
  id: meta.id,
  projectId: meta.projectId,
  name: meta.name,
  description: meta.description,
  level: meta.level,
  styleIds: meta.styleIds,
  patternIds: meta.patternIds,
  revision: snapshot.revision,
  nodes: snapshot.nodes.map(toNode),
  edges: snapshot.edges.map(toEdge),
  viewport: snapshot.viewport,
  settings: snapshot.settings,
  schemaVersion: snapshot.schemaVersion,
  createdAt: meta.createdAt,
  updatedAt: snapshot.updatedAtUtc,
});

export const toComponent = (c: ComponentDto): ArchitecturalComponent => ({
  id: c.id,
  projectId: c.projectId,
  typeId: c.typeId,
  properties: toProperties(c.properties),
  usageCount: c.usageCount,
  createdAt: c.createdAtUtc,
  updatedAt: c.updatedAtUtc,
});

export const toDocument = (d: DocumentDto): DocumentRecord => ({
  scope: d.scope.toLowerCase() as DocumentScope,
  ownerId: d.ownerId,
  projectId: d.projectId,
  content: d.markdown,
  revision: d.revision,
  updatedAt: d.updatedAtUtc ?? undefined,
});
