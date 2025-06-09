import { PrismaRepository } from '../../infrastructure/PrismaRepository';

export class LogisticsService {
    constructor(private repo = new PrismaRepository()) { }

    async requestReplenishment(
        storeId: number,
        productId: number,
        qty: number
    ) {
        return this.repo.createReplenishmentRequest(storeId, productId, qty);
    }

    async approveReplenishment(requestId: number) {
        const req = await this.repo.getReplenishmentRequest(requestId);
        if (!req) throw new Error('Request not found');

        await this.repo.decrementCentralStock(req.productId, req.quantity);
        
        await this.repo.incrementStoreStock(
            req.storeId,
            req.productId,
            req.quantity
        );

        return this.repo.updateReplenishmentStatus(requestId, 'APPROVED');
    }

    async checkCriticalStock(th = 5) {
        return this.repo.findStoreStocksBelow(th);
    }
}
