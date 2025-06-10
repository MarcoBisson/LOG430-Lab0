import { PrismaRepository } from '../../infrastructure/PrismaRepository';

export class LogisticsService {
    constructor(private repo = new PrismaRepository()) { }

    async requestReplenishment(
        storeId: number,
        productId: number,
        qty: number
    ) {
        const store = await this.repo.findStoreById(storeId);
        if (!store) throw new Error('Store not found');
        if (store.type !== 'SALES')
            throw new Error('Invalid store type for replenishment');

        return this.repo.createReplenishmentRequest(storeId, productId, qty);
    }

    async approveReplenishment(requestId: number) {
        const req = await this.repo.getReplenishmentRequest(requestId);
        if (!req) throw new Error('Request not found');

        const store = await this.repo.findStoreById(req.storeId);
        if (!store) throw new Error('Store not found');
        if (store.type !== 'SALES')
            throw new Error('Invalid store type for replenishment');

        await this.repo.decrementCentralStock(req.productId, req.quantity);
        await this.repo.incrementStoreStock(req.storeId, req.productId, req.quantity);

        return this.repo.updateReplenishmentStatus(requestId, 'APPROVED');
    }

    async checkCriticalStock(th = 5) {
        return this.repo.findStoreStocksBelow(th);
    }
}
