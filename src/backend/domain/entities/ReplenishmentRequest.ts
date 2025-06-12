import { ReplenishmentRequestStatus } from '@prisma/client';

export class ReplenishmentRequest {
    constructor(
        public id: number,
        public storeId: number,
        public productId: number,
        public quantity: number,
        public status: ReplenishmentRequestStatus,
        public createdAt: Date
    ) { }
}