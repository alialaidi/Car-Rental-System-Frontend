import { httpClient } from '../../../shared/api/httpClient';
import type { VehicleDetails, VehicleSearchCriteria, VehicleSearchResult } from '../model/vehicle';

export const catalogApi = {
  search(criteria: VehicleSearchCriteria, signal?: AbortSignal): Promise<VehicleSearchResult> {
    const { pickupDateTime, expectedReturnDateTime, ...filters } = criteria;
    const hasValidWindow = Boolean(
      pickupDateTime &&
      expectedReturnDateTime &&
      Date.parse(expectedReturnDateTime) > Date.parse(pickupDateTime),
    );
    return httpClient.get('/api/catalog/vehicles', {
      query: {
        ...filters,
        pickupDateTime: hasValidWindow ? pickupDateTime : undefined,
        expectedReturnDateTime: hasValidWindow ? expectedReturnDateTime : undefined,
      },
      signal,
    });
  },
  getById(vehicleId: number, signal?: AbortSignal): Promise<VehicleDetails> {
    return httpClient.get('/api/catalog/vehicles/' + vehicleId, { signal });
  },
};
