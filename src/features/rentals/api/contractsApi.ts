import { httpClient } from '../../../shared/api/httpClient';
import type { PagedResult } from '../../../shared/api/paging';
import type { ContractPage, RentalContract } from '../model/contract';
type WireContract = Omit<RentalContract, 'actualPickupDateUtc' | 'actualReturnDateUtc'> & {
  actualPickupDateUtc: string;
  actualReturnDateUtc: string | null;
};
const mapContract = (item: WireContract): RentalContract => ({
  ...item,
  actualPickupDateUtc: new Date(item.actualPickupDateUtc),
  actualReturnDateUtc: item.actualReturnDateUtc ? new Date(item.actualReturnDateUtc) : null,
});

export const contractsApi = {
  async listMine(page: number, pageSize: number, signal?: AbortSignal): Promise<ContractPage> {
    const result = await httpClient.get<PagedResult<WireContract>>('/api/contracts/my', {
      query: { page, pageSize: Math.min(100, Math.max(1, pageSize)) },
      signal,
    });
    return { ...result, items: result.items.map(mapContract) };
  },
  async getById(id: number, signal?: AbortSignal): Promise<RentalContract> {
    return mapContract(await httpClient.get<WireContract>('/api/contracts/' + id, { signal }));
  },
};
