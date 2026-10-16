
export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiErrorBody {
  code: string;
  description: string;
  type: string;
  errors?: { code: string; description: string }[];
  metadata?: Record<string, unknown>;
}

export interface ProjectDto {
  id: string;
  name: string;
  description: string;
  primaryStyleId: string | null;
  secondaryStyleIds: string[];
  diagramCount: number;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export interface SaveProjectPayload {
  id?: string;
  name: string;
  description?: string;
  primaryStyleId?: string | null;
  secondaryStyleIds?: string[];
}

export interface DiagramDto {
  id: string;
  projectId: string;
  name: string;
  description: string;
  level: string;
  styleIds: string[];
  patternIds: string[];
  revision: number;
  nodeCount: number;
  connectionCount: number;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export interface NodePropertiesDto {
  name: string;
  identifier?: string | null;
  description?: string | null;
  technology?: string | null;
  responsibility?: string | null;
  notes?: string | null;
  patternId?: string | null;
  links?: { label: string; url: string }[] | null;
  linkedDiagramId?: string | null;
  metadata?: Record<string, string> | null;
}

export interface NodeDto {
  id: string;
  type: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  componentId?: string | null;
  properties: NodePropertiesDto;
}

export interface EdgeDto {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
  kind: string;
  label?: string | null;
  protocol?: string | null;
  description?: string | null;
  sync: string;
  direction: string;
  waypoints?: { x: number; y: number }[] | null;
}

export interface SnapshotBodyDto {
  nodes: NodeDto[];
  edges: EdgeDto[];
  viewport: { x: number; y: number; zoom: number };
  settings: { showGrid: boolean; snapToGrid: boolean; gridSize: number; showMinimap: boolean };
}

export interface SnapshotResponseDto extends SnapshotBodyDto {
  diagramId: string;
  revision: number;
  schemaVersion: number;
  updatedAtUtc: string;
}

export interface SaveSnapshotPayload extends SnapshotBodyDto {
  baseRevision: number;
}

export interface SaveSnapshotResponseDto {
  revision: number;
  updatedAtUtc: string;
}

export interface CreateDiagramPayload {
  id?: string;
  name: string;
  description?: string;
  level: string;
  styleIds?: string[];
  patternIds?: string[];
  snapshot?: SnapshotBodyDto;
  readme?: string;
}

export interface UpdateDiagramPayload {
  name: string;
  description?: string;
  level: string;
  styleIds?: string[];
  patternIds?: string[];
}

export interface ComponentDto {
  id: string;
  projectId: string;
  typeId: string;
  properties: NodePropertiesDto;
  usageCount: number;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export interface SaveComponentPayload {
  id?: string;
  typeId: string;
  properties: NodePropertiesDto;
}

export interface DocumentDto {
  scope: string;
  ownerId: string;
  projectId: string;
  markdown: string;
  revision: number;
  updatedAtUtc: string | null;
}

export interface ImportResultDto {
  projectId: string;
  alreadyImported: boolean;
  diagrams: number;
  nodes: number;
  connections: number;
  components: number;
  documents: number;
  warnings: string[];
}
