import { useCallback, useState } from 'react';
import { dataEvents } from '@/utils/dataEvents';
import { extractApiError } from '@/utils/apiError';

interface Options {
  invalidate?: boolean;
}

export function useMutation<A extends unknown[], R>(fn: (...args: A) => Promise<R>, options: Options = {}) {
  const { invalidate = true } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (...args: A): Promise<R> => {
      setLoading(true);
      setError(null);
      try {
        const result = await fn(...args);
        if (invalidate) dataEvents.emit();
        return result;
      } catch (err) {
        const message = extractApiError(err);
        setError(message);
        throw Object.assign(new Error(message), { cause: err });
      } finally {
        setLoading(false);
      }
    },
    [invalidate],
  );

  return { execute, loading, error };
}
