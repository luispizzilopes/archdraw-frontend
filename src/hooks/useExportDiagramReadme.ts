import { useMutation } from '@/hooks/useMutation';
import { documentationService } from '@/services/documentation/documentationService';
import { slugify } from '@/utils/id';

export function useExportDiagramReadme() {
  return useMutation(
    async (diagramId: string, name: string) => {
      const doc = await documentationService.get('diagram', diagramId);
      return { filename: `${slugify(name)}.md`, text: doc.content || `# ${name}\n` };
    },
    { invalidate: false },
  );
}
