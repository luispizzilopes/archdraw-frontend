import api from '@/services/api/api';
import { toComponent } from '@/domain/apiMappers';
import type { ArchitecturalComponent } from '@/types';
import type { ComponentDto, SaveComponentPayload } from '@/types/api';

export const componentService = {
  async getByProject(projectId: string): Promise<ArchitecturalComponent[]> {
    const { data } = await api.get<ComponentDto[]>(`/api/v1/projects/${projectId}/components`);
    return data.map(toComponent);
  },

  async getById(id: string): Promise<ArchitecturalComponent> {
    const { data } = await api.get<ComponentDto>(`/api/v1/components/${id}`);
    return toComponent(data);
  },

  async create(projectId: string, payload: SaveComponentPayload): Promise<ArchitecturalComponent> {
    const { data } = await api.post<ComponentDto>(`/api/v1/projects/${projectId}/components`, payload);
    return toComponent(data);
  },

  async update(id: string, payload: SaveComponentPayload): Promise<ArchitecturalComponent> {
    const { data } = await api.put<ComponentDto>(`/api/v1/components/${id}`, payload);
    return toComponent(data);
  },

  async remove(id: string, detach = false): Promise<void> {
    await api.delete(`/api/v1/components/${id}`, { params: { detach } });
  },
};
