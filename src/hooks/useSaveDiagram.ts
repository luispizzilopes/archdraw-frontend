import { useCallback, useEffect, useRef, useState } from 'react';
import { toSnapshotBody } from '@/domain/apiMappers';
import { diagramService } from '@/services/diagram/diagramService';
import { useEditorStore } from '@/store/editorStore';
import type { SaveStatus } from '@/types';
import { draftStorage } from '@/utils/draftStorage';
import { extractApiError, getApiErrorBody, getApiErrorStatus } from '@/utils/apiError';

const SAVE_DELAY = 500;
const DRAFT_DELAY = 250;
const RETRY_DELAY = 5000;
const MAX_AUTO_RETRIES = 3;

export interface SaveDiagramState {
  status: SaveStatus;
  errorMessage: string | null;
  conflictRevision: number | null;
}

export function useSaveDiagram(enabled: boolean, delay = SAVE_DELAY) {
  const [state, setState] = useState<SaveDiagramState>({ status: 'idle', errorMessage: null, conflictRevision: null });
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const draftTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const retryTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const retries = useRef(0);
  const chain = useRef<Promise<void>>(Promise.resolve());
  const saved = useRef({ content: 0, meta: 0 });
  const blocked = useRef(false);

  const isDirty = useCallback(() => {
    const s = useEditorStore.getState();
    return s.revision !== saved.current.content || s.metaRevision !== saved.current.meta;
  }, []);

  const writeDraft = useCallback(() => {
    const s = useEditorStore.getState();
    if (!s.loaded || !s.meta) return;
    const d = s.toDiagram();
    draftStorage.write({
      diagramId: d.id,
      baseRevision: s.serverRevision,
      savedAt: new Date().toISOString(),
      content: { nodes: d.nodes, edges: d.edges, viewport: d.viewport, settings: d.settings },
    });
  }, []);

  const doSave = useCallback(async () => {
    if (blocked.current) return;
    const s = useEditorStore.getState();
    if (!s.loaded || !s.meta || !isDirty()) return;

    const sentContent = s.revision;
    const sentMeta = s.metaRevision;
    const diagram = s.toDiagram();
    setState({ status: 'saving', errorMessage: null, conflictRevision: null });

    try {
      if (sentMeta !== saved.current.meta) {
        await diagramService.update(diagram.id, {
          name: diagram.name,
          description: diagram.description,
          level: diagram.level,
          styleIds: diagram.styleIds,
          patternIds: diagram.patternIds,
        });
        saved.current.meta = sentMeta;
      }

      if (sentContent !== saved.current.content) {
        const result = await diagramService.saveSnapshot(diagram.id, {
          baseRevision: s.serverRevision,
          ...toSnapshotBody(diagram),
        });
        useEditorStore.getState().setServerRevision(result.revision);
        saved.current.content = sentContent;
      }

      retries.current = 0;
      if (isDirty()) {
        setState({ status: 'saving', errorMessage: null, conflictRevision: null });
        saveTimer.current = setTimeout(() => void flush(), delay);
      } else {
        draftStorage.clear(diagram.id);
        setState({ status: 'saved', errorMessage: null, conflictRevision: null });
      }
    } catch (err) {
      if (getApiErrorStatus(err) === 409) {
        blocked.current = true;
        const current = getApiErrorBody(err)?.metadata?.currentRevision;
        setState({ status: 'conflict', errorMessage: null, conflictRevision: typeof current === 'number' ? current : null });
        return;
      }
      setState({ status: 'error', errorMessage: extractApiError(err), conflictRevision: null });
      if (retries.current < MAX_AUTO_RETRIES) {
        retries.current++;
        retryTimer.current = setTimeout(() => void flush(), RETRY_DELAY);
      }
    }
  }, [delay, isDirty]);

  const flush = useCallback((): Promise<void> => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    if (retryTimer.current) clearTimeout(retryTimer.current);
    const run = chain.current.then(doSave);
    chain.current = run;
    return run;
  }, [doSave]);

  useEffect(() => {
    if (!enabled) return;
    const s0 = useEditorStore.getState();
    saved.current = { content: s0.revision, meta: s0.metaRevision };
    blocked.current = false;
    retries.current = 0;
    setState({ status: 'idle', errorMessage: null, conflictRevision: null });

    const unsubscribe = useEditorStore.subscribe((s, prev) => {
      const contentChanged = s.revision !== prev.revision;
      const metaChanged = s.metaRevision !== prev.metaRevision;
      if (!contentChanged && !metaChanged) return;
      if (blocked.current) return;
      retries.current = 0;
      setState((cur) => (cur.status === 'saving' ? cur : { status: 'saving', errorMessage: null, conflictRevision: null }));
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => void flush(), delay);
      if (draftTimer.current) clearTimeout(draftTimer.current);
      draftTimer.current = setTimeout(writeDraft, DRAFT_DELAY);
    });

    const onHide = () => document.visibilityState === 'hidden' && isDirty() && void flush();
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty() || blocked.current) {
        writeDraft();
        e.preventDefault();
      }
    };
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('beforeunload', onBeforeUnload);

    return () => {
      unsubscribe();
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('beforeunload', onBeforeUnload);
      [saveTimer, draftTimer, retryTimer].forEach((t) => t.current && clearTimeout(t.current));
      if (isDirty() && useEditorStore.getState().loaded) writeDraft();
    };
  }, [enabled, delay, flush, isDirty, writeDraft]);

  const retry = useCallback(() => {
    retries.current = 0;
    return flush();
  }, [flush]);

  const resolveKeepMine = useCallback(async () => {
    const id = useEditorStore.getState().meta?.id;
    if (!id) return;
    const current = await diagramService.getById(id);
    useEditorStore.getState().setServerRevision(current.revision);
    blocked.current = false;
    await flush();
  }, [flush]);

  const resolveUseServer = useCallback(async () => {
    const id = useEditorStore.getState().meta?.id;
    if (!id) return;
    writeDraft();
    const server = await diagramService.getFull(id);
    useEditorStore.getState().load(server);
    saved.current = { content: 0, meta: 0 };
    blocked.current = false;
    draftStorage.clear(id);
    setState({ status: 'saved', errorMessage: null, conflictRevision: null });
  }, [writeDraft]);

  return { ...state, hasUnsaved: isDirty, flush, retry, resolveKeepMine, resolveUseServer };
}
