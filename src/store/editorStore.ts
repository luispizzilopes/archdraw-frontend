import { applyEdgeChanges, applyNodeChanges, type Connection, type EdgeChange, type NodeChange } from '@xyflow/react';
import { create } from 'zustand';
import { getComponentType } from '@/data/componentCatalog';
import { getConnectionKind } from '@/data/connectionCatalog';
import { cloneSubgraph, createEdge, createNode, createProperties } from '@/domain/factories';
import {
  diagramToFlow,
  fromFlowEdge,
  fromFlowNode,
  nodeClass,
  toFlowEdge,
  toFlowNode,
  type ArchEdge,
  type ArchEdgeData,
  type ArchNode,
} from '@/domain/flowMapper';
import { align, distribute, type AlignMode, type Box, type DistributeAxis } from '@/domain/layout';
import type { ComponentProperties, ConnectionKindId, Diagram, DiagramSettings, Point, ReusableComponent, Viewport } from '@/types';

interface Snapshot {
  nodes: ArchNode[];
  edges: ArchEdge[];
}

interface Meta {
  id: string;
  projectId: string;
  name: string;
  description: string;
  level: Diagram['level'];
  styleIds: string[];
  patternIds: string[];
  createdAt: string;
  updatedAt: string;
}

const HISTORY_LIMIT = 100;
let lastCoalesce: { key: string; at: number } | null = null;
let clipboard: { nodes: ReturnType<typeof fromFlowNode>[]; edges: ReturnType<typeof fromFlowEdge>[] } | null = null;

const sizeOf = (n: ArchNode) => ({ w: n.width ?? n.measured?.width ?? 180, h: n.height ?? n.measured?.height ?? 80 });

interface EditorState {
  loaded: boolean;
  meta: Meta | null;
  settings: DiagramSettings;
  viewport: Viewport;
  nodes: ArchNode[];
  edges: ArchEdge[];
  past: Snapshot[];
  future: Snapshot[];
  defaultEdgeKind: ConnectionKindId;
  revision: number;
  viewRevision: number;
  metaRevision: number;
  serverRevision: number;

  load(d: Diagram): void;
  reset(): void;
  setServerRevision(revision: number): void;
  markDirty(): void;
  toDiagram(): Diagram;

  onNodesChange(changes: NodeChange<ArchNode>[]): void;
  onEdgesChange(changes: EdgeChange<ArchEdge>[]): void;
  onConnect(c: Connection): void;
  commit(coalesceKey?: string): void;
  undo(): void;
  redo(): void;

  addNode(typeId: string, position: Point): string;
  addReusable(r: ReusableComponent, position: Point): string;
  updateNodeProps(id: string, patch: Partial<ComponentProperties>, coalesce?: boolean): void;
  detachComponent(id: string): void;
  linkComponent(id: string, componentId: string): void;
  unlinkComponentEverywhere(componentId: string): void;
  setNodeType(id: string, typeId: string): void;
  updateEdgeData(id: string, patch: Partial<ArchEdgeData>, coalesce?: boolean): void;
  reverseEdge(id: string): void;
  setEdgeWaypoints(id: string, pts: Point[] | undefined): void;
  reconnectEdge(oldId: string, c: Connection): void;
  setDefaultEdgeKind(k: ConnectionKindId): void;

  deleteSelection(): void;
  duplicateSelection(): void;
  copySelection(): void;
  paste(at?: Point): void;
  selectAll(): void;
  clearSelection(): void;
  nudge(dx: number, dy: number): void;
  alignSelection(mode: AlignMode): void;
  distributeSelection(axis: DistributeAxis): void;
  bringForward(front: boolean): void;

  setMeta(patch: Partial<Pick<Meta, 'name' | 'description' | 'level' | 'styleIds' | 'patternIds'>>): void;
  setSettings(patch: Partial<DiagramSettings>): void;
  setViewport(v: Viewport): void;
}

const initialSettings: DiagramSettings = { showGrid: true, snapToGrid: true, gridSize: 20, showMinimap: false };

export const useEditorStore = create<EditorState>((set, get) => {
  const bump = () => set((s) => ({ revision: s.revision + 1 }));
  const selected = () => get().nodes.filter((n) => n.selected);

  return {
    loaded: false,
    meta: null,
    settings: initialSettings,
    viewport: { x: 0, y: 0, zoom: 1 },
    nodes: [],
    edges: [],
    past: [],
    future: [],
    defaultEdgeKind: 'http',
    revision: 0,
    viewRevision: 0,
    metaRevision: 0,
    serverRevision: 0,

    load(d) {
      const { nodes, edges } = diagramToFlow(d);
      lastCoalesce = null;
      set({
        loaded: true,
        meta: {
          id: d.id,
          projectId: d.projectId,
          name: d.name,
          description: d.description,
          level: d.level,
          styleIds: d.styleIds,
          patternIds: d.patternIds,
          createdAt: d.createdAt,
          updatedAt: d.updatedAt,
        },
        settings: { ...initialSettings, ...d.settings },
        viewport: d.viewport,
        nodes,
        edges,
        past: [],
        future: [],
        revision: 0,
        viewRevision: 0,
        metaRevision: 0,
        serverRevision: d.revision,
      });
    },

    reset() {
      set({
        loaded: false,
        meta: null,
        nodes: [],
        edges: [],
        past: [],
        future: [],
        revision: 0,
        viewRevision: 0,
        metaRevision: 0,
        serverRevision: 0,
      });
    },

    setServerRevision(revision) {
      set({ serverRevision: revision });
    },

    markDirty: bump,

    toDiagram() {
      const { meta, settings, viewport, nodes, edges, serverRevision } = get();
      if (!meta) throw new Error('Editor sem diagrama carregado');
      return {
        ...meta,
        revision: serverRevision,
        settings,
        viewport,
        nodes: nodes.map(fromFlowNode),
        edges: edges.map(fromFlowEdge),
        schemaVersion: 1,
      };
    },

    commit(key) {
      const now = Date.now();
      if (key && lastCoalesce && lastCoalesce.key === key && now - lastCoalesce.at < 1200) {
        lastCoalesce.at = now;
        return;
      }
      lastCoalesce = key ? { key, at: now } : null;
      set((s) => ({
        past: [...s.past, { nodes: s.nodes, edges: s.edges }].slice(-HISTORY_LIMIT),
        future: [],
      }));
    },

    undo() {
      const { past, nodes, edges } = get();
      if (!past.length) return;
      lastCoalesce = null;
      const prev = past[past.length - 1];
      set((s) => ({
        past: s.past.slice(0, -1),
        future: [{ nodes, edges }, ...s.future],
        nodes: prev.nodes,
        edges: prev.edges,
      }));
      bump();
    },

    redo() {
      const { future, nodes, edges } = get();
      if (!future.length) return;
      lastCoalesce = null;
      const next = future[0];
      set((s) => ({
        future: s.future.slice(1),
        past: [...s.past, { nodes, edges }],
        nodes: next.nodes,
        edges: next.edges,
      }));
      bump();
    },

    onNodesChange(changes) {
      const persistable = changes.some(
        (c) =>
          c.type === 'position' ||
          c.type === 'add' ||
          c.type === 'remove' ||
          c.type === 'replace' ||
          (c.type === 'dimensions' && c.resizing !== undefined),
      );
      set((s) => ({ nodes: applyNodeChanges(changes, s.nodes) }));
      if (persistable) bump();
    },

    onEdgesChange(changes) {
      const persistable = changes.some((c) => c.type !== 'select');
      set((s) => ({ edges: applyEdgeChanges(changes, s.edges) }));
      if (persistable) bump();
    },

    onConnect(c) {
      if (!c.source || !c.target) return;
      get().commit();
      const kind = getConnectionKind(get().defaultEdgeKind);
      const e = toFlowEdge(createEdge(c.source, c.target, kind.id, { sourceHandle: c.sourceHandle, targetHandle: c.targetHandle }));
      set((s) => ({ edges: [...s.edges.map((x) => ({ ...x, selected: false })), { ...e, selected: true }] }));
      bump();
    },

    addNode(typeId, position) {
      get().commit();
      const node = toFlowNode(createNode(typeId, position));
      node.selected = true;
      set((s) => ({
        nodes: [...s.nodes.map((n) => ({ ...n, selected: false })), node],
        edges: s.edges.map((e) => ({ ...e, selected: false })),
      }));
      bump();
      return node.id;
    },

    addReusable(r, position) {
      get().commit();
      const dn = createNode(r.typeId, position, structuredClone(r.properties), r.size);
      const node = { ...toFlowNode({ ...dn, componentId: r.id }), selected: true };
      set((s) => ({ nodes: [...s.nodes.map((n) => ({ ...n, selected: false })), node] }));
      bump();
      return node.id;
    },

    updateNodeProps(id, patch, coalesce = true) {
      get().commit(coalesce ? `props:${id}:${Object.keys(patch).join(',')}` : undefined);
      const componentId = get().nodes.find((n) => n.id === id)?.data.componentId;
      const { linkedDiagramId, ...shared } = patch;
      const hasShared = Object.keys(shared).length > 0;
      set((s) => ({
        nodes: s.nodes.map((n) => {
          if (n.id === id) return { ...n, data: { ...n.data, properties: { ...n.data.properties, ...patch } } };
          if (componentId && hasShared && n.data.componentId === componentId)
            return { ...n, data: { ...n.data, properties: { ...n.data.properties, ...shared } } };
          return n;
        }),
      }));
      void linkedDiagramId;
      bump();
    },

    linkComponent(id, componentId) {
      get().commit();
      set((s) => ({ nodes: s.nodes.map((n) => (n.id === id ? { ...n, data: { ...n.data, componentId } } : n)) }));
      bump();
    },

    unlinkComponentEverywhere(componentId) {
      set((s) => ({
        nodes: s.nodes.map((n) => (n.data.componentId === componentId ? { ...n, data: { ...n.data, componentId: undefined } } : n)),
      }));
      bump();
    },

    detachComponent(id) {
      get().commit();
      set((s) => ({
        nodes: s.nodes.map((n) => (n.id === id ? { ...n, data: { ...n.data, componentId: undefined } } : n)),
      }));
      bump();
    },

    setNodeType(id, typeId) {
      get().commit();
      set((s) => ({
        nodes: s.nodes.map((n) => {
          if (n.id !== id) return n;
          const keepsName = n.data.properties.name !== getComponentType(n.data.typeId).defaultName;
          const base = createProperties(typeId, keepsName ? { name: n.data.properties.name } : {});
          return { ...n, className: nodeClass(typeId), data: { typeId, properties: { ...n.data.properties, name: base.name } } };
        }),
      }));
      bump();
    },

    updateEdgeData(id, patch, coalesce = true) {
      get().commit(coalesce ? `edge:${id}:${Object.keys(patch).join(',')}` : undefined);
      set((s) => ({
        edges: s.edges.map((e) => (e.id === id && e.data ? { ...e, data: { ...e.data, ...patch } } : e)),
      }));
      bump();
    },

    reverseEdge(id) {
      get().commit();
      set((s) => ({
        edges: s.edges.map((e) =>
          e.id === id ? { ...e, source: e.target, target: e.source, sourceHandle: e.targetHandle, targetHandle: e.sourceHandle } : e,
        ),
      }));
      bump();
    },

    setEdgeWaypoints(id, pts) {
      set((s) => ({
        edges: s.edges.map((e) => (e.id === id && e.data ? { ...e, data: { ...e.data, waypoints: pts?.length ? pts : undefined } } : e)),
      }));
      bump();
    },

    reconnectEdge(oldId, c) {
      if (!c.source || !c.target) return;
      get().commit();
      set((s) => ({
        edges: s.edges.map((e) =>
          e.id === oldId
            ? {
                ...e,
                source: c.source,
                target: c.target,
                sourceHandle: c.sourceHandle,
                targetHandle: c.targetHandle,
                data: e.data && { ...e.data, waypoints: undefined },
              }
            : e,
        ),
      }));
      bump();
    },

    setDefaultEdgeKind: (k) => set({ defaultEdgeKind: k }),

    deleteSelection() {
      const { nodes, edges } = get();
      const ids = new Set(nodes.filter((n) => n.selected).map((n) => n.id));
      const removeEdge = (e: ArchEdge) => e.selected || ids.has(e.source) || ids.has(e.target);
      if (!ids.size && !edges.some((e) => e.selected)) return;
      get().commit();
      set({ nodes: nodes.filter((n) => !ids.has(n.id)), edges: edges.filter((e) => !removeEdge(e)) });
      bump();
    },

    copySelection() {
      const sel = selected();
      if (!sel.length) return;
      const ids = new Set(sel.map((n) => n.id));
      clipboard = {
        nodes: sel.map((n) => ({ ...fromFlowNode(n), componentId: undefined })),
        edges: get()
          .edges.filter((e) => ids.has(e.source) && ids.has(e.target))
          .map(fromFlowEdge),
      };
    },

    paste(at) {
      if (!clipboard) return;
      get().commit();
      const minX = Math.min(...clipboard.nodes.map((n) => n.position.x));
      const minY = Math.min(...clipboard.nodes.map((n) => n.position.y));
      const offset = at ? { x: at.x - minX, y: at.y - minY } : { x: 32, y: 32 };
      const { nodes, edges } = cloneSubgraph(clipboard.nodes, clipboard.edges, offset);
      clipboard = {
        nodes: clipboard.nodes.map((n) => ({ ...n, position: { x: n.position.x + 16, y: n.position.y + 16 } })),
        edges: clipboard.edges,
      };
      set((s) => ({
        nodes: [...s.nodes.map((n) => ({ ...n, selected: false })), ...nodes.map((n) => ({ ...toFlowNode(n), selected: true }))],
        edges: [...s.edges.map((e) => ({ ...e, selected: false })), ...edges.map(toFlowEdge)],
      }));
      bump();
    },

    duplicateSelection() {
      get().copySelection();
      if (clipboard) {
        get().paste();
      }
    },

    selectAll() {
      set((s) => ({ nodes: s.nodes.map((n) => ({ ...n, selected: true })) }));
    },

    clearSelection() {
      set((s) => ({
        nodes: s.nodes.map((n) => (n.selected ? { ...n, selected: false } : n)),
        edges: s.edges.map((e) => (e.selected ? { ...e, selected: false } : e)),
      }));
    },

    nudge(dx, dy) {
      const sel = selected();
      if (!sel.length) return;
      get().commit(`nudge`);
      const ids = new Set(sel.map((n) => n.id));
      set((s) => ({
        nodes: s.nodes.map((n) => (ids.has(n.id) ? { ...n, position: { x: n.position.x + dx, y: n.position.y + dy } } : n)),
      }));
      bump();
    },

    alignSelection(mode) {
      const sel = selected();
      const boxes: Box[] = sel.map((n) => ({ id: n.id, x: n.position.x, y: n.position.y, ...sizeOf(n) }));
      const pos = align(boxes, mode);
      if (!pos.size) return;
      get().commit();
      set((s) => ({ nodes: s.nodes.map((n) => (pos.has(n.id) ? { ...n, position: pos.get(n.id)! } : n)) }));
      bump();
    },

    distributeSelection(axis) {
      const sel = selected();
      const boxes: Box[] = sel.map((n) => ({ id: n.id, x: n.position.x, y: n.position.y, ...sizeOf(n) }));
      const pos = distribute(boxes, axis);
      if (!pos.size) return;
      get().commit();
      set((s) => ({ nodes: s.nodes.map((n) => (pos.has(n.id) ? { ...n, position: pos.get(n.id)! } : n)) }));
      bump();
    },

    bringForward(front) {
      const sel = selected();
      if (!sel.length) return;
      get().commit();
      const ids = new Set(sel.map((n) => n.id));
      const zs = get().nodes.map((n) => n.zIndex ?? 10);
      const target = front ? Math.max(...zs) + 1 : Math.min(...zs) - 1;
      set((s) => ({ nodes: s.nodes.map((n) => (ids.has(n.id) ? { ...n, zIndex: target } : n)) }));
      bump();
    },

    setMeta(patch) {
      set((s) => (s.meta ? { meta: { ...s.meta, ...patch }, metaRevision: s.metaRevision + 1 } : s));
    },

    setSettings(patch) {
      set((s) => ({ settings: { ...s.settings, ...patch } }));
      bump();
    },

    setViewport(v) {
      set((s) => ({ viewport: v, viewRevision: s.viewRevision + 1 }));
    },
  };
});
