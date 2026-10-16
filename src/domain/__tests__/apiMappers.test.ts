import { describe, expect, it } from 'vitest';
import { toDiagram, toDiagramSummary, toEdge, toEdgeDto, toNode, toNodeDto, toProject, toSnapshotBody } from '@/domain/apiMappers';
import type { DiagramDto, EdgeDto, NodeDto, ProjectDto, SnapshotResponseDto } from '@/types/api';

const nodeDto: NodeDto = {
  id: 'n1',
  type: 'api-rest',
  componentId: null,
  position: { x: 10, y: 20 },
  size: { width: 200, height: 80 },
  zIndex: 3,
  properties: { name: 'API', patternId: null, linkedDiagramId: null, links: null, metadata: null, identifier: null },
};

describe('apiMappers', () => {
  it('traduz nulos da API para os padrões do editor', () => {
    const node = toNode(nodeDto);
    expect(node.componentId).toBeUndefined();
    expect(node.properties).toMatchObject({
      name: 'API',
      identifier: '',
      links: [],
      metadata: {},
      patternId: undefined,
      linkedDiagramId: undefined,
    });
  });

  it('preserva vínculo com componente e diagrama no round-trip do nó', () => {
    const dto: NodeDto = {
      ...nodeDto,
      componentId: 'c1',
      properties: { ...nodeDto.properties, linkedDiagramId: 'd2', patternId: 'layered' },
    };
    const back = toNodeDto(toNode(dto));
    expect(back.componentId).toBe('c1');
    expect(back.properties.linkedDiagramId).toBe('d2');
    expect(back.properties.patternId).toBe('layered');
  });

  it('arestas: waypoints vazios viram indefinidos e voltam como lista vazia', () => {
    const dto: EdgeDto = { id: 'e1', source: 'a', target: 'b', kind: 'http', sync: 'sync', direction: 'forward', waypoints: [] };
    const edge = toEdge(dto);
    expect(edge.waypoints).toBeUndefined();
    expect(edge.sourceHandle).toBeNull();
    expect(toEdgeDto(edge).waypoints).toEqual([]);
    expect(toEdge({ ...dto, waypoints: [{ x: 1, y: 2 }] }).waypoints).toEqual([{ x: 1, y: 2 }]);
  });

  it('monta o snapshot enviado à API a partir do estado do editor', () => {
    const body = toSnapshotBody({
      nodes: [toNode(nodeDto)],
      edges: [toEdge({ id: 'e1', source: 'n1', target: 'n1', kind: 'http', sync: 'async', direction: 'both' })],
      viewport: { x: 1, y: 2, zoom: 0.5 },
      settings: { showGrid: true, snapToGrid: false, gridSize: 20, showMinimap: false },
    });
    expect(body.nodes[0].id).toBe('n1');
    expect(body.edges[0]).toMatchObject({ sync: 'async', direction: 'both' });
    expect(body.viewport.zoom).toBe(0.5);
  });

  it('compõe metadados e snapshot em um diagrama do editor com a revisão do snapshot', () => {
    const meta = toDiagramSummary({
      id: 'd1',
      projectId: 'p1',
      name: 'D',
      description: '',
      level: 'context',
      styleIds: ['microservices'],
      patternIds: [],
      revision: 7,
      nodeCount: 1,
      connectionCount: 0,
      createdAtUtc: 'c',
      updatedAtUtc: 'u',
    } satisfies DiagramDto);
    const snapshot: SnapshotResponseDto = {
      diagramId: 'd1',
      revision: 9,
      schemaVersion: 1,
      nodes: [nodeDto],
      edges: [],
      viewport: { x: 0, y: 0, zoom: 1 },
      settings: { showGrid: true, snapToGrid: true, gridSize: 20, showMinimap: false },
      updatedAtUtc: 'u2',
    };
    const d = toDiagram(meta, snapshot);
    expect(d.revision).toBe(9);
    expect(d.updatedAt).toBe('u2');
    expect(d.nodes).toHaveLength(1);
  });

  it('projeto: estilo principal nulo vira indefinido', () => {
    const p = toProject({
      id: 'p',
      name: 'P',
      description: '',
      primaryStyleId: null,
      secondaryStyleIds: [],
      diagramCount: 2,
      createdAtUtc: 'a',
      updatedAtUtc: 'b',
    } satisfies ProjectDto);
    expect(p.primaryStyleId).toBeUndefined();
    expect(p.diagramCount).toBe(2);
  });
});
