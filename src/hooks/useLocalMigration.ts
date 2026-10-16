import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { legacyStorageService, type LegacyScan } from '@/services/legacy/legacyStorageService';
import { projectService } from '@/services/project/projectService';
import type { ImportResultDto } from '@/types/api';
import { extractApiError } from '@/utils/apiError';
import { dataEvents } from '@/utils/dataEvents';

export interface MigrationItem {
  legacyId: string;
  name: string;
  state: 'pending' | 'running' | 'imported' | 'already' | 'failed';
  result?: ImportResultDto;
  error?: string;
}

type Phase = 'scanning' | 'none' | 'ready' | 'running' | 'done';

const dismissedKey = (userId: string) => `archdraw:migration-dismissed:${userId}`;

export function useLocalMigration() {
  const { user } = useAuth();
  const userId = user?.userId;
  const [phase, setPhase] = useState<Phase>('scanning');
  const [scan, setScan] = useState<LegacyScan | null>(null);
  const [items, setItems] = useState<MigrationItem[]>([]);
  const [dismissed, setDismissed] = useState(false);
  const [unsupported, setUnsupported] = useState(false);

  useEffect(() => {
    let alive = true;
    try {
      setDismissed(!!userId && localStorage.getItem(dismissedKey(userId)) === '1');
    } catch {
      setDismissed(false);
    }
    legacyStorageService
      .scan()
      .then((result) => {
        if (!alive) return;
        if (!result || result.bundles.length === 0) return setPhase('none');
        setUnsupported(!result.supported);
        setScan(result);
        setItems(result.bundles.map((b) => ({ legacyId: b.project.id, name: b.project.name, state: 'pending' })));
        setPhase('ready');
      })
      .catch(() => alive && setPhase('none'));
    return () => {
      alive = false;
    };
  }, [userId]);

  const migrate = useCallback(async () => {
    if (!scan) return;
    setPhase('running');
    for (const bundle of scan.bundles) {
      const id = bundle.project.id;
      setItems((cur) => cur.map((i) => (i.legacyId === id ? { ...i, state: 'running' } : i)));
      try {
        const result = await projectService.importBundle(bundle, false);
        setItems((cur) =>
          cur.map((i) => (i.legacyId === id ? { ...i, state: result.alreadyImported ? 'already' : 'imported', result } : i)),
        );
      } catch (err) {
        setItems((cur) => cur.map((i) => (i.legacyId === id ? { ...i, state: 'failed', error: extractApiError(err) } : i)));
      }
    }
    setPhase('done');
    dataEvents.emit();
  }, [scan]);

  const dismiss = useCallback(() => {
    if (userId) {
      try {
        localStorage.setItem(dismissedKey(userId), '1');
      } catch {}
    }
    setDismissed(true);
  }, [userId]);

  const allConfirmed = phase === 'done' && items.every((i) => i.state === 'imported' || i.state === 'already');

  const clearLocal = useCallback(async () => {
    if (!allConfirmed) return;
    await legacyStorageService.clear();
    setScan(null);
    setItems([]);
    setPhase('none');
  }, [allConfirmed]);

  return { phase, items, unsupported, skipped: scan?.skipped ?? 0, dismissed, allConfirmed, migrate, dismiss, clearLocal };
}
