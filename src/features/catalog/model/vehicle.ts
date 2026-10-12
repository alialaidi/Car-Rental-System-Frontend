import type { PagedResult } from '../../../shared/api/paging';

export type VehicleStatus = 'Available' | 'Reserved' | 'Rented' | 'Maintenance' | string;
export interface VehicleListItem {
  vehicleId: number;
  make: string;
  model: string;
  year: number;
  categoryId: number;
  categoryName: string;
  fuelTypeId: number;
  fuelTypeName: string;
  transmissionTypeId: number;
  transmissionTypeName: string;
  seatsCount: number;
  dailyPrice: number;
  branchId: number;
  status: VehicleStatus;
  primaryImageUrl: string | null;
}
export interface VehicleImage {
  imageId: number;
  vehicleId: number;
  imageUrl: string;
  isPrimary: boolean;
}
export interface VehicleDetails extends Omit<VehicleListItem, 'primaryImageUrl'> {
  plateNumber: string;
  currentMileage: number;
  images: VehicleImage[];
}
export interface VehicleSearchCriteria {
  categoryId?: number;
  fuelTypeId?: number;
  transmissionTypeId?: number;
  branchId?: number;
  minimumDailyPrice?: number;
  maximumDailyPrice?: number;
  minimumSeats?: number;
  pickupDateTime?: string;
  expectedReturnDateTime?: string;
  sortBy: 'price' | 'year' | 'make' | 'model';
  sortDirection: 'asc' | 'desc';
  page: number;
  pageSize: number;
}
export type VehicleSearchResult = PagedResult<VehicleListItem>;
