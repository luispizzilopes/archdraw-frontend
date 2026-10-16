import { useMutation } from '@/hooks/useMutation';
import { parseBundle } from '@/domain/projectBundle';
import { projectService } from '@/services/project/projectService';

export function useImportProject() {
  return useMutation(async (fileText: string) => {
    const bundle = parseBundle(fileText);
    return projectService.importBundle(bundle, true);
  });
}
