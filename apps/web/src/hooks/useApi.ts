import { useEffect, useState } from 'react';

export function useApi<T>(request: () => Promise<T>) {
  const [data, setData] = useState<T>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    request().then(setData).finally(() => setLoading(false));
  }, [request]);

  return { data, loading };
}
