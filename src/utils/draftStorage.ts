import type { Diagram } from '@/types';

export interface DiagramDraft {
  diagramId: string;
  baseRevision: number;
  savedAt: string;
  content: Pick<Diagram, 'nodes' | 'edges' | 'viewport' | 'settings'>;
}

const key = (diagramId: string) => `archdraw:draft:${diagramId}`;

export const draftStorage = {
  read(diagramId: string): DiagramDraft | null {
    try {
      const raw = localStorage.getItem(key(diagramId));
      if (!raw) return null;
      const draft = JSON.parse(raw) as DiagramDraft;
      return draft?.diagramId === diagramId && draft.content && typeof draft.baseRevision === 'number' ? draft : null;
    } catch {
      return null;
    }
  },

  write(draft: DiagramDraft): void {
    try {
      localStorage.setItem(key(draft.diagramId), JSON.stringify(draft));
    } catch {}
  },

  clear(diagramId: string): void {
    try {
      localStorage.removeItem(key(diagramId));
    } catch {}
  },
};
