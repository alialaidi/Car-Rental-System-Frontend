import type { VehicleSearchCriteria } from './model/vehicle';

function positiveInt(value: string | null): number | undefined {
  if (!value || !/^\d+$/.test(value)) return undefined;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : undefined;
}
function nonNegative(value: string | null): number | undefined {
  if (!value || !/^\d+(\.\d{1,2})?$/.test(value)) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}
function date(value: string | null): string | undefined {
  if (!value || Number.isNaN(Date.parse(value))) return undefined;
  return value;
}

export function parseSearchParams(params: URLSearchParams): VehicleSearchCriteria {
  const size = positiveInt(params.get('pageSize')) ?? 20;
  const sort = params.get('sortBy');
  const direction = params.get('sortDirection');
  const pickup = date(params.get('pickupDateTime'));
  const returning = date(params.get('expectedReturnDateTime'));
  return {
    categoryId: positiveInt(params.get('categoryId')),
    fuelTypeId: positiveInt(params.get('fuelTypeId')),
    transmissionTypeId: positiveInt(params.get('transmissionTypeId')),
    branchId: positiveInt(params.get('branchId')),
    minimumDailyPrice: nonNegative(params.get('minimumDailyPrice')),
    maximumDailyPrice: nonNegative(params.get('maximumDailyPrice')),
    minimumSeats: positiveInt(params.get('minimumSeats')),
    pickupDateTime: pickup,
    expectedReturnDateTime: returning,
    sortBy: sort === 'year' || sort === 'make' || sort === 'model' ? sort : 'price',
    sortDirection: direction === 'desc' ? 'desc' : 'asc',
    page: positiveInt(params.get('page')) ?? 1,
    pageSize: Math.min(size, 100),
  };
}

export function serializeSearchParams(criteria: VehicleSearchCriteria): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(criteria)) {
    if (
      value !== undefined &&
      value !== null &&
      !(key === 'page' && value === 1) &&
      !(key === 'pageSize' && value === 20)
    )
      params.set(key, String(value));
  }
  return params;
}

export function formatDailyPrice(value: number, currency = 'JOD'): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}
