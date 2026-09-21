import { useCallback, useEffect, useRef, useState } from 'react';

// Minimal fetch hook. Loads on mount and whenever deps change.
export function useFetch(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetcherRef = useRef(fetcher);

  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetcherRef.current();
      setData(response?.data ?? null);
    } catch (err) {
      setError(err);
      setData(null);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps]);

  return { data, loading, error, refetch: run };
}