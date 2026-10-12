import { useEffect, useState } from 'react';
import { lookupsApi } from '../../../shared/api/lookupsApi';
import type { Lookup } from '../../../shared/model/lookups';

export function useLookups() {
  const [data, setData] = useState<{
    categories: Lookup[];
    fuelTypes: Lookup[];
    transmissionTypes: Lookup[];
  }>({ categories: [], fuelTypes: [], transmissionTypes: [] });
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const controller = new AbortController();
    void Promise.all([
      lookupsApi.categories(controller.signal),
      lookupsApi.fuelTypes(controller.signal),
      lookupsApi.transmissionTypes(controller.signal),
    ])
      .then(([categories, fuelTypes, transmissionTypes]) =>
        setData({ categories, fuelTypes, transmissionTypes }),
      )
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) setError(reason);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);
  return { ...data, error, loading };
}
