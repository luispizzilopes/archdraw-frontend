import { useCallback, useEffect, useRef, useState } from 'react';
import { documentationService } from '@/services/documentation/documentationService';
import type { DocumentScope, SaveStatus } from '@/types';
import { getApiErrorStatus } from '@/utils/apiError';

export function useDocument(scope: DocumentScope, ownerId: string, delay = 600) {
  const [content, setContentState] = useState<string | null>(null);
  const [status, setStatus] = useState<SaveStatus>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pending = useRef<string | null>(null);
  const revision = useRef(0);
  const inflight = useRef<Promise<void>>(Promise.resolve());
  const ids = useRef({ scope, ownerId });
  ids.current = { scope, ownerId };

  const flush = useCallback((): Promise<void> => {
    if (timer.current) clearTimeout(timer.current);
    const run = inflight.current.then(async () => {
      const value = pending.current;
      if (value === null) return;
      const { scope: s, ownerId: o } = ids.current;
      setStatus('saving');
      try {
        const saved = await documentationService.save(s, o, value, revision.current);
        revision.current = saved.revision;
        if (pending.current === value) {
          pending.current = null;
          setStatus('saved');
        } else {
          timer.current = setTimeout(() => void flush(), delay);
        }
      } catch (err) {
        setStatus(getApiErrorStatus(err) === 409 ? 'conflict' : 'error');
      }
    });
    inflight.current = run;
    return run;
  }, [delay]);

  useEffect(() => {
    let alive = true;
    setContentState(null);
    setStatus('idle');
    pending.current = null;
    revision.current = 0;
    documentationService
      .get(scope, ownerId)
      .then((doc) => {
        if (!alive) return;
        revision.current = doc.revision;
        setContentState(doc.content);
      })
      .catch(() => alive && (setContentState(''), setStatus('error')));
    return () => {
      alive = false;
      void flush();
    };
  }, [scope, ownerId, flush]);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (pending.current !== null) e.preventDefault();
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, []);

  const setContent = useCallback(
    (value: string) => {
      setContentState(value);
      pending.current = value;
      setStatus((s) => (s === 'conflict' ? s : 'saving'));
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => void flush(), delay);
    },
    [flush, delay],
  );

  const retry = useCallback(() => flush(), [flush]);

  const keepMine = useCallback(async () => {
    const { scope: s, ownerId: o } = ids.current;
    const server = await documentationService.get(s, o);
    revision.current = server.revision;
    await flush();
  }, [flush]);

  const useServer = useCallback(async () => {
    const { scope: s, ownerId: o } = ids.current;
    const server = await documentationService.get(s, o);
    revision.current = server.revision;
    pending.current = null;
    setContentState(server.content);
    setStatus('saved');
  }, []);

  return { content, setContent, status, flush, retry, keepMine, useServer };
}
