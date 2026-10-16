
export type ID = string;
export type ISODate = string;

export type ArchitecturalStyleId = string;
export type ArchitecturalPatternId = string;
export type ComponentTypeId = string;
export type ConnectionKindId = string;

export interface ArchitecturalStyle {
  id: ArchitecturalStyleId;
  name: string;
  short: string;
  summary: string;
  conflictsWith: ArchitecturalStyleId[];
}

export interface ArchitecturalPattern {
  id: ArchitecturalPatternId;
  name: string;
  short: string;
  summary: string;
}

export interface ReusableComponent {
  id: ID;
  typeId: ComponentTypeId;
  size: Size;
  properties: ComponentProperties;
  savedAt: ISODate;
}

export interface Project {
  id: ID;
  name: string;
  description: string;
  primaryStyleId?: ArchitecturalStyleId;
  secondaryStyleIds: ArchitecturalStyleId[];
  diagramCount: number;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface ArchitecturalComponent {
  id: ID;
  projectId: ID;
  typeId: ComponentTypeId;
  properties: ComponentProperties;
  usageCount: number;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export type DiagramLevel = 'free' | 'context' | 'container' | 'component';

export interface Point {
  x: number;
  y: number;
}
export interface Size {
  width: number;
  height: number;
}
export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

export interface DiagramSettings {
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;
  showMinimap: boolean;
}

export interface ComponentLink {
  label: string;
  url: string;
}

export interface ComponentProperties {
  name: string;
  identifier: string;
  description: string;
  technology: string;
  responsibility: string;
  notes: string;
  patternId?: ArchitecturalPatternId;
  links: ComponentLink[];
  linkedDiagramId?: ID;
  metadata: Record<string, string>;
}

export interface DiagramNode {
  id: ID;
  type: ComponentTypeId;
  componentId?: ID;
  position: Point;
  size: Size;
  zIndex: number;
  properties: ComponentProperties;
}

export type EdgeSync = 'sync' | 'async';
export type EdgeDirection = 'forward' | 'both' | 'none';

export interface DiagramEdge {
  id: ID;
  source: ID;
  target: ID;
  sourceHandle?: string | null;
  targetHandle?: string | null;
  kind: ConnectionKindId;
  label: string;
  protocol: string;
  description: string;
  sync: EdgeSync;
  direction: EdgeDirection;
  waypoints?: Point[];
}

export interface DiagramSummary {
  id: ID;
  projectId: ID;
  name: string;
  description: string;
  level: DiagramLevel;
  styleIds: ArchitecturalStyleId[];
  patternIds: ArchitecturalPatternId[];
  revision: number;
  nodeCount: number;
  connectionCount: number;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface Diagram extends Omit<DiagramSummary, 'nodeCount' | 'connectionCount'> {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  viewport: Viewport;
  settings: DiagramSettings;
  schemaVersion: number;
}

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'conflict';

export type DocumentScope = 'project' | 'diagram' | 'component';

export interface DocumentRecord {
  scope: DocumentScope;
  ownerId: ID;
  projectId: ID;
  content: string;
  revision: number;
  updatedAt?: ISODate;
}

export interface BundleDocument {
  id: string;
  scope: 'project' | 'diagram';
  ownerId: ID;
  projectId: ID;
  content: string;
  updatedAt: ISODate;
}

export interface BundleProject extends Omit<Project, 'diagramCount'> {
  reusableComponents: ReusableComponent[];
}

export interface BundleDiagram extends Omit<Diagram, 'revision'> {
  revision?: number;
}

export interface ProjectBundle {
  format: 'archdraw.project';
  version: 1;
  exportedAt: ISODate;
  project: BundleProject;
  diagrams: BundleDiagram[];
  documents: BundleDocument[];
}

export interface AppSettings {
  theme: 'dark' | 'light';
  defaultShowGrid: boolean;
  defaultSnapToGrid: boolean;
}

export type ComponentCategoryId = 'apps' | 'data' | 'messaging' | 'infra' | 'internal' | 'context' | 'structure';

export type NodeShape = 'box' | 'cylinder' | 'pill' | 'external' | 'actor' | 'boundary' | 'note';

export interface MetadataField {
  key: string;
  label: string;
  placeholder?: string;
}

export interface ComponentTypeDef {
  id: ComponentTypeId;
  label: string;
  category: ComponentCategoryId;
  icon: string;
  shape: NodeShape;
  description: string;
  defaultName: string;
  size: Size;
  metadataFields: MetadataField[];
}

export interface ConnectionKindDef {
  id: ConnectionKindId;
  label: string;
  short: string;
  icon: string;
  defaultProtocol: string;
  sync: EdgeSync;
  direction: EdgeDirection;
  dash: string;
  width: number;
  marker: 'closed' | 'open';
  description: string;
}
