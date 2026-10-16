import api from '@/services/api/api';
import { toProject } from '@/domain/apiMappers';
import type { Project, ProjectBundle } from '@/types';
import type { ImportResultDto, PaginatedResult, ProjectDto, SaveProjectPayload } from '@/types/api';

const BASE = '/api/v1/projects';

export const projectService = {
  async getAll(pageNumber = 1, pageSize = 100, search?: string): Promise<PaginatedResult<Project>> {
    const { data } = await api.get<PaginatedResult<ProjectDto>>(BASE, { params: { pageNumber, pageSize, search } });
    return { ...data, items: data.items.map(toProject) };
  },

  async getById(id: string): Promise<Project> {
    const { data } = await api.get<ProjectDto>(`${BASE}/${id}`);
    return toProject(data);
  },

  async getSummary(): Promise<{ projects: number; diagrams: number; components: number; documents: number }> {
    const { data } = await api.get(`${BASE}/summary`);
    return data;
  },

  async create(payload: SaveProjectPayload): Promise<Project> {
    const { data } = await api.post<ProjectDto>(BASE, payload);
    return toProject(data);
  },

  async update(id: string, payload: SaveProjectPayload): Promise<Project> {
    const { data } = await api.put<ProjectDto>(`${BASE}/${id}`, payload);
    return toProject(data);
  },

  async remove(id: string): Promise<void> {
    await api.delete(`${BASE}/${id}`);
  },

  async importBundle(bundle: ProjectBundle, asCopy: boolean): Promise<ImportResultDto> {
    const { data } = await api.post<ImportResultDto>(`${BASE}/import`, { ...bundle, asCopy }, { timeout: 120_000 });
    return data;
  },
};
