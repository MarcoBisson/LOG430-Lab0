import { ReplenishmentRequestStatus } from '@prisma/client';
import type { ILogisticsRepository } from '../../domain/repositories/ILogisticsRepository';
import type { IStoreRepository } from '../../domain/repositories/IStoreRepository';

export class LogisticsService {
    constructor(private readonly logisticRepo: ILogisticsRepository, private readonly storeRepo: IStoreRepository) { }

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
        qty: number,
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
     * @throws Error si aucun magasin logistique ne contient le produit demandé ou si le stock est insuffisant.
     */
    async approveReplenishment(requestId: number) {
        const req = await this.logisticRepo.getReplenishmentRequest(requestId);
        if (!req) throw new Error('Request not found');

        const store = await this.storeRepo.findStoreById(req.storeId);
        if (!store) throw new Error('Store not found');
        if (store.type !== 'SALES')
            throw new Error('Invalid store type for replenishment');

        // Récupérer tous les magasins logistiques
        const logisticStores = await this.logisticRepo.getLogisticStores();
        if (!logisticStores || logisticStores.length === 0) {
            throw new Error('No logistics stores available');
        }

        // Trouver le magasin logistique qui contient le produit demandé avec suffisamment de stock
        let sourceLogisticStore = null;

        for (const logisticStore of logisticStores) {
            // Vérifier le stock du produit dans ce magasin logistique
            const stockInfo = await this.storeRepo.findStoreStockByProduct(logisticStore.id, req.productId);
            if (stockInfo && stockInfo.quantity >= req.quantity) {
                sourceLogisticStore = logisticStore;
                break;
            }
        }

        if (!sourceLogisticStore) {
            throw new Error(`Insufficient stock in logistics stores for product ${req.productId}. Required: ${req.quantity}`);
        }

        // Effectuer le transfert de stock
        await this.logisticRepo.decrementCentralStock(sourceLogisticStore.id, req.productId, req.quantity);
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
