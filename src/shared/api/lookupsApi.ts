import { httpClient } from './httpClient';
import type { Lookup } from '../model/lookups';

export const lookupsApi = {
  categories: (signal?: AbortSignal) =>
    httpClient.get<Lookup[]>('/api/lookups/categories', { signal }),
  fuelTypes: (signal?: AbortSignal) =>
    httpClient.get<Lookup[]>('/api/lookups/fuel-types', { signal }),
  transmissionTypes: (signal?: AbortSignal) =>
    httpClient.get<Lookup[]>('/api/lookups/transmission-types', { signal }),
};
