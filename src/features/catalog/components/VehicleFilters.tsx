import { useEffect, useState } from 'react';
import type { VehicleSearchCriteria } from '../model/vehicle';
import type { Lookup } from '../../../shared/model/lookups';
import { SelectField, TextField } from '../../../shared/ui';
import styles from './catalog.module.css';

interface Props {
  criteria: VehicleSearchCriteria;
  categories: Lookup[];
  fuelTypes: Lookup[];
  transmissions: Lookup[];
  onChange: (next: VehicleSearchCriteria) => void;
}
export function VehicleFilters({
  criteria,
  categories,
  fuelTypes,
  transmissions,
  onChange,
}: Props) {
  const [minimum, setMinimum] = useState(criteria.minimumDailyPrice?.toString() ?? '');
  const [maximum, setMaximum] = useState(criteria.maximumDailyPrice?.toString() ?? '');
  useEffect(() => {
    setMinimum(criteria.minimumDailyPrice?.toString() ?? '');
    setMaximum(criteria.maximumDailyPrice?.toString() ?? '');
  }, [criteria.minimumDailyPrice, criteria.maximumDailyPrice]);
  useEffect(() => {
    const nextMinimum = minimum === '' ? undefined : Number(minimum);
    const nextMaximum = maximum === '' ? undefined : Number(maximum);
    if (nextMinimum === criteria.minimumDailyPrice && nextMaximum === criteria.maximumDailyPrice)
      return;
    const timer = window.setTimeout(
      () =>
        onChange({
          ...criteria,
          minimumDailyPrice: nextMinimum,
          maximumDailyPrice: nextMaximum,
          page: 1,
        }),
      350,
    );
    return () => window.clearTimeout(timer);
  }, [minimum, maximum, criteria, onChange]);
  const update = (key: keyof VehicleSearchCriteria, value: string) =>
    onChange({ ...criteria, [key]: value ? Number(value) : undefined, page: 1 });
  const dateValue = (value?: string) => {
    if (!value) return '';
    const date = new Date(value);
    const two = (part: number) => String(part).padStart(2, '0');
    return (
      date.getFullYear() +
      '-' +
      two(date.getMonth() + 1) +
      '-' +
      two(date.getDate()) +
      'T' +
      two(date.getHours()) +
      ':' +
      two(date.getMinutes())
    );
  };
  const setDate = (key: 'pickupDateTime' | 'expectedReturnDateTime', value: string) => {
    const utc = value ? new Date(value).toISOString() : undefined;
    onChange({ ...criteria, [key]: utc, page: 1 });
  };
  const options = (items: Lookup[]) =>
    items.map(({ id, name }) => ({ value: String(id), label: name }));
  return (
    <form
      className={styles.filters}
      aria-label="Vehicle filters"
      onSubmit={(event) => event.preventDefault()}
    >
      <SelectField
        id="category"
        label="Category"
        value={criteria.categoryId ?? ''}
        onChange={(event) => update('categoryId', event.currentTarget.value)}
        options={options(categories)}
        placeholder="All categories"
      />
      <SelectField
        id="fuel"
        label="Fuel type"
        value={criteria.fuelTypeId ?? ''}
        onChange={(event) => update('fuelTypeId', event.currentTarget.value)}
        options={options(fuelTypes)}
        placeholder="All fuel types"
      />
      <SelectField
        id="transmission"
        label="Transmission"
        value={criteria.transmissionTypeId ?? ''}
        onChange={(event) => update('transmissionTypeId', event.currentTarget.value)}
        options={options(transmissions)}
        placeholder="All transmissions"
      />
      <TextField
        id="branch"
        label="Branch number"
        inputMode="numeric"
        value={criteria.branchId ?? ''}
        onChange={(event) => update('branchId', event.currentTarget.value)}
      />
      <TextField
        id="minimum-price"
        label="Minimum daily price"
        type="number"
        min="0"
        step="0.01"
        value={minimum}
        onChange={(event) => setMinimum(event.currentTarget.value)}
      />
      <TextField
        id="maximum-price"
        label="Maximum daily price"
        type="number"
        min="0"
        step="0.01"
        value={maximum}
        onChange={(event) => setMaximum(event.currentTarget.value)}
      />
      <TextField
        id="seats"
        label="Minimum seats"
        type="number"
        min="1"
        step="1"
        value={criteria.minimumSeats ?? ''}
        onChange={(event) => update('minimumSeats', event.currentTarget.value)}
      />
      <label className={styles.nativeField}>
        Pickup time
        <input
          aria-label="Pickup time"
          type="datetime-local"
          value={dateValue(criteria.pickupDateTime)}
          onChange={(event) => setDate('pickupDateTime', event.currentTarget.value)}
        />
      </label>
      <label className={styles.nativeField}>
        Return time
        <input
          aria-label="Return time"
          type="datetime-local"
          value={dateValue(criteria.expectedReturnDateTime)}
          onChange={(event) => setDate('expectedReturnDateTime', event.currentTarget.value)}
        />
      </label>
      <SelectField
        id="sort"
        label="Sort by"
        value={criteria.sortBy}
        onChange={(event) =>
          onChange({
            ...criteria,
            sortBy: event.currentTarget.value as VehicleSearchCriteria['sortBy'],
            page: 1,
          })
        }
        options={['price', 'year', 'make', 'model'].map((value) => ({
          value,
          label: value[0].toUpperCase() + value.slice(1),
        }))}
      />
      <SelectField
        id="direction"
        label="Direction"
        value={criteria.sortDirection}
        onChange={(event) =>
          onChange({
            ...criteria,
            sortDirection: event.currentTarget.value as VehicleSearchCriteria['sortDirection'],
            page: 1,
          })
        }
        options={[
          { value: 'asc', label: 'Ascending' },
          { value: 'desc', label: 'Descending' },
        ]}
      />
    </form>
  );
}
