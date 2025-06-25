import { ReplenishmentRequestStatus } from '@prisma/client';
import { ILogisticsRepository } from '../../domain/repositories/ILogisticsRepository';
import { IStoreRepository } from '../../domain/repositories/IStoreRepository';

export class LogisticsService {
    constructor(private logisticRepo: ILogisticsRepository, private storeRepo: IStoreRepository) { }

    /**
     * Fait une demande de réapprovisionnement pour un produit dans un magasin.
     * @param storeId L'ID du magasin pour lequel faire la demande de réapprovisionnement.
     * @param productId L'ID du produit à réapprovisionner.
     * @param qty La quantité à réapprovisionner.
     * @returns Une promesse qui résout à la demande de réapprovisionnement créée.
     * @throws Error si le magasin n'existe pas ou si le type de magasin n'est pas valide pour la réapprovisionnement.
     */
    async requestReplenishment(
        storeId: number,
        productId: number,
        qty: number
    ) {
        const store = await this.storeRepo.findStoreById(storeId);
        if (!store) throw new Error('Store not found');
        if (store.type !== 'SALES')
            throw new Error('Invalid store type for replenishment');

        return this.logisticRepo.createReplenishmentRequest(storeId, productId, qty);
    }

    /**
     * Approuve une demande de réapprovisionnement pour un produit dans un magasin.
     * @param requestId L'ID de la demande de réapprovisionnement à approuver.
     * @returns Une promesse qui résout à la demande de réapprovisionnement mise à jour.
     * @throws Error si la demande de réapprovisionnement n'existe pas, si le magasin n'existe pas ou si le type de magasin n'est pas valide pour la réapprovisionnement.
     * @throws Error si le magasin n'est pas trouvé ou si le type de magasin n'est pas valide pour la réapprovisionnement.
     */
    async approveReplenishment(requestId: number) {
        const req = await this.logisticRepo.getReplenishmentRequest(requestId);
        if (!req) throw new Error('Request not found');

        const store = await this.storeRepo.findStoreById(req.storeId);
        if (!store) throw new Error('Store not found');
        if (store.type !== 'SALES')
            throw new Error('Invalid store type for replenishment');

        const logiStore = await this.logisticRepo.getLogisticStores();

        await this.logisticRepo.decrementCentralStock(logiStore[0].id, req.productId, req.quantity);
        await this.storeRepo.incrementStoreStock(req.storeId, req.productId, req.quantity);

        return this.logisticRepo.updateReplenishmentStatus(requestId, ReplenishmentRequestStatus.APPROVED);
    }

    /**
     * Vérifie les stocks critiques dans tous les magasins.
     * @param th Le seuil de stock critique (par défaut 5).
     * @returns Une liste de stocks de magasins dont la quantité est inférieure au seuil critique.
     */
    async checkCriticalStock(th = 5) {
        return this.storeRepo.findStoreStocksBelow(th);
    }

    async getReplenishments() {
        return this.logisticRepo.getReplenishmentRequests();
    }

    async getLogisticStores(){
        return this.logisticRepo.getLogisticStores();
    }
}
