import { useCallback, useEffect, useRef, useState } from 'react';
import { dataEvents } from '@/utils/dataEvents';
import { extractApiError, getApiErrorStatus } from '@/utils/apiError';

interface Options {
  enabled?: boolean;
  refreshOnChange?: boolean;
}

export function useRequest<T>(fn: (signal: AbortSignal) => Promise<T>, deps: unknown[], options: Options = {}) {
  const { enabled = true, refreshOnChange = true } = options;
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const ticket = useRef(0);
  const controller = useRef<AbortController | null>(null);

  const run = useCallback(async (silent = false) => {
    const mine = ++ticket.current;
    controller.current?.abort();
    const ctl = (controller.current = new AbortController());
    if (!silent) setLoading(true);
    try {
      const result = await fnRef.current(ctl.signal);
      if (mine !== ticket.current) return;
      setData(result);
      setError(null);
      setNotFound(false);
    } catch (err) {
      if (mine !== ticket.current || ctl.signal.aborted) return;
      setError(extractApiError(err));
      setNotFound(getApiErrorStatus(err) === 404);
    } finally {
      if (mine === ticket.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    void run();
    const unsubscribe = refreshOnChange ? dataEvents.subscribe(() => void run(true)) : undefined;
    const activeTicket = ticket;
    const activeController = controller;
    return () => {
      activeTicket.current++;
      activeController.current?.abort();
      unsubscribe?.();
    };
  }, [enabled, refreshOnChange, run, ...deps]);

  return { data, loading, error, notFound, reload: useCallback(() => run(true), [run]) };
}
