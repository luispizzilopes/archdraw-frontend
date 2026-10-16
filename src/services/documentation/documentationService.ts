import api from '@/services/api/api';
import { toDocument } from '@/domain/apiMappers';
import type { DocumentRecord, DocumentScope } from '@/types';
import type { DocumentDto } from '@/types/api';

const path = (scope: DocumentScope, ownerId: string) => {
  const root = scope === 'project' ? 'projects' : scope === 'diagram' ? 'diagrams' : 'components';
  return `/api/v1/${root}/${ownerId}/documentation`;
};

export const documentationService = {
  async get(scope: DocumentScope, ownerId: string): Promise<DocumentRecord> {
    const { data } = await api.get<DocumentDto>(path(scope, ownerId));
    return toDocument(data);
  },

  async save(scope: DocumentScope, ownerId: string, markdown: string, baseRevision: number): Promise<DocumentRecord> {
    const { data } = await api.put<DocumentDto>(path(scope, ownerId), { markdown, baseRevision });
    return toDocument(data);
  },
};
