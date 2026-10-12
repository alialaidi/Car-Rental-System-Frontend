export type ContractStatus = 'Active' | 'Completed' | 'Cancelled';
export type FuelLevel = 'Empty' | 'Quarter' | 'Half' | 'ThreeQuarters' | 'Full';
export interface RentalContract {
  contractId: number;
  reservationId: number | null;
  contractNumber: string;
  customerId: number;
  vehicleId: number;
  employeeId: number;
  actualPickupDateUtc: Date;
  pickupMileage: number;
  pickupFuelLevel: FuelLevel;
  conditionNotes: string | null;
  rentalDays: number;
  basicRentalPrice: number;
  discountAmount: number;
  additionalFees: number;
  fuelCharges: number;
  damageCharges: number;
  totalAmount: number;
  status: ContractStatus;
  pickupBranchId: number;
  actualReturnDateUtc: Date | null;
  returnMileage: number | null;
  returnFuelLevel: FuelLevel | null;
}
export interface ContractPage {
  items: RentalContract[];
  page: number;
  pageSize: number;
  totalCount: number;
}
