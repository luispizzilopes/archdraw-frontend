import api from '@/services/api/api';
import { toDiagram, toDiagramSummary } from '@/domain/apiMappers';
import type { Diagram, DiagramSummary } from '@/types';
import type {
  CreateDiagramPayload,
  DiagramDto,
  SaveSnapshotPayload,
  SaveSnapshotResponseDto,
  SnapshotResponseDto,
  UpdateDiagramPayload,
} from '@/types/api';

const projects = (projectId: string) => `/api/v1/projects/${projectId}`;
const diagrams = (diagramId: string) => `/api/v1/diagrams/${diagramId}`;

export const diagramService = {
  async getByProject(projectId: string): Promise<DiagramSummary[]> {
    const { data } = await api.get<DiagramDto[]>(`${projects(projectId)}/diagrams`);
    return data.map(toDiagramSummary);
  },

  async getRecent(limit = 6): Promise<DiagramSummary[]> {
    const { data } = await api.get<DiagramDto[]>('/api/v1/diagrams/recent', { params: { limit } });
    return data.map(toDiagramSummary);
  },

  async getParents(diagramId: string): Promise<DiagramSummary[]> {
    const { data } = await api.get<DiagramDto[]>(`${diagrams(diagramId)}/parents`);
    return data.map(toDiagramSummary);
  },

  async getById(diagramId: string): Promise<DiagramSummary> {
    const { data } = await api.get<DiagramDto>(diagrams(diagramId));
    return toDiagramSummary(data);
  },

  async getSnapshot(diagramId: string): Promise<SnapshotResponseDto> {
    const { data } = await api.get<SnapshotResponseDto>(`${diagrams(diagramId)}/snapshot`);
    return data;
  },

  async getFull(diagramId: string): Promise<Diagram> {
    const [meta, snapshot] = await Promise.all([diagramService.getById(diagramId), diagramService.getSnapshot(diagramId)]);
    return toDiagram(meta, snapshot);
  },

  async create(projectId: string, payload: CreateDiagramPayload): Promise<DiagramSummary> {
    const { data } = await api.post<DiagramDto>(`${projects(projectId)}/diagrams`, payload);
    return toDiagramSummary(data);
  },

  async update(diagramId: string, payload: UpdateDiagramPayload): Promise<DiagramSummary> {
    const { data } = await api.put<DiagramDto>(diagrams(diagramId), payload);
    return toDiagramSummary(data);
  },

  async remove(diagramId: string): Promise<void> {
    await api.delete(diagrams(diagramId));
  },

  async duplicate(diagramId: string, name?: string): Promise<DiagramSummary> {
    const { data } = await api.post<DiagramDto>(`${diagrams(diagramId)}/duplicate`, { name });
    return toDiagramSummary(data);
  },

  async saveSnapshot(diagramId: string, payload: SaveSnapshotPayload, signal?: AbortSignal): Promise<SaveSnapshotResponseDto> {
    const { data } = await api.put<SaveSnapshotResponseDto>(`${diagrams(diagramId)}/snapshot`, payload, { signal });
    return data;
  },
};
