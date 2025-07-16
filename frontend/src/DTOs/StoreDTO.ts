import type { StoreType } from '@prisma/client';

export interface StoreDTO {
    id: number,
    name: string,
    address: string,
    type: StoreType
}