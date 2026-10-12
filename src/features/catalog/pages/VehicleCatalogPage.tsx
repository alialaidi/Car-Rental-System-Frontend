import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { EmptyState, ErrorState, LoadingState, PageHeader, Pagination } from '../../../shared/ui';
import { VehicleCard } from '../components/VehicleCard';
import { VehicleFilters } from '../components/VehicleFilters';
import styles from '../components/catalog.module.css';
import { useLookups } from '../hooks/useLookups';
import { useVehicleSearch } from '../hooks/useVehicleSearch';
import { parseSearchParams, serializeSearchParams } from '../searchParams';
import type { VehicleSearchCriteria } from '../model/vehicle';

export function VehicleCatalogPage() {
  const [params, setParams] = useSearchParams();
  const criteria = useMemo(() => parseSearchParams(params), [params]);
  const search = useVehicleSearch(criteria);
  const lookups = useLookups();
  const update = useCallback(
    (next: VehicleSearchCriteria) => setParams(serializeSearchParams(next), { replace: true }),
    [setParams],
  );

  return (
    <>
      <PageHeader
        title="Find your next vehicle"
        description="Browse available vehicles and refine your search."
      />
      {lookups.error ? <ErrorState error={lookups.error} /> : null}
      {lookups.loading ? <LoadingState label="Loading vehicle filters" /> : null}
      <VehicleFilters
        criteria={criteria}
        categories={lookups.categories}
        fuelTypes={lookups.fuelTypes}
        transmissions={lookups.transmissionTypes}
        onChange={update}
      />
      {search.loading ? <LoadingState label="Searching vehicles" /> : null}
      {!search.loading && search.error ? (
        <ErrorState error={search.error} onRetry={search.retry} />
      ) : null}
      {!search.loading && !search.error && search.data?.items.length === 0 ? (
        <EmptyState
          title="No vehicles match"
          description="Try changing or removing some filters."
        />
      ) : null}
      {!search.loading && !search.error && search.data?.items.length ? (
        <>
          <p className={styles.resultsMeta} aria-live="polite">
            {search.data.totalCount} vehicles found
          </p>
          <div className={styles.grid}>
            {search.data.items.map((vehicle) => (
              <VehicleCard key={vehicle.vehicleId} vehicle={vehicle} />
            ))}
          </div>
          <Pagination
            page={search.data.page}
            pageSize={search.data.pageSize}
            totalCount={search.data.totalCount}
            onPageChange={(page) => update({ ...criteria, page })}
            onPageSizeChange={(pageSize) =>
              update({ ...criteria, page: 1, pageSize: Math.min(100, pageSize) })
            }
          />
        </>
      ) : null}
    </>
  );
}
