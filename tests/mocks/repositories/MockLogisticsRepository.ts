import type { Store } from '../../../src/backend/domain/entities/Store';
import { ReplenishmentRequest } from '../../../src/backend/domain/entities/ReplenishmentRequest';
import type { ILogisticsRepository } from '../../../src/backend/domain/repositories/ILogisticsRepository';
import type { ReplenishmentRequestStatus, StoreStock } from '@prisma/client';

export class MockLogisticsRepository implements ILogisticsRepository {
    private centralStock: { productId: number; stock: number }[] = [];
    private replenishmentRequests: ReplenishmentRequest[] = [];
    private logisticStores: Store[] = [];
    private nextRequestId = 1;

    // Helper methods
    seed(centralStock: { productId: number; stock: number }[] = [], replenishmentRequests: ReplenishmentRequest[] = [], logisticStores: Store[] = []) {
        this.centralStock = centralStock;
        this.replenishmentRequests = replenishmentRequests;
        this.logisticStores = logisticStores;
        this.nextRequestId = Math.max(...replenishmentRequests.map(r => r.id), 0) + 1;
    }

    clear() {
        this.centralStock = [];
        this.replenishmentRequests = [];
        this.logisticStores = [];
        this.nextRequestId = 1;
    }

    async findAllCentralStock(page?: number, limit?: number): Promise<{ products: { productId: number; stock: number; name: string }[]; total: number }> {
        // Simule la pagination si page et limit sont fournis, sinon retourne tout
        let products = this.centralStock.map(s => ({
            productId: s.productId,
            stock: s.stock,
            name: `Produit ${s.productId}`,
        }));
        const total = products.length;
        if (typeof page === 'number' && typeof limit === 'number') {
            const start = (page - 1) * limit;
            products = products.slice(start, start + limit);
        }
        return { products, total };
    }

    constructor(private storeRepository?: any) {}

    async decrementCentralStock(storeId: number, productId: number, qty: number): Promise<StoreStock> {
        // Si nous avons une référence au StoreRepository, l'utiliser
        if (this.storeRepository) {
            return await this.storeRepository.decrementStoreStock(storeId, productId, qty);
        }
        
        // Sinon, utiliser la logique de stock central global (fallback)
        const stock = this.centralStock.find(s => s.productId === productId);
        if (!stock) throw new Error(`Central stock not found for product ${productId}`);
        
        if (stock.stock < qty) {
            throw new Error(`Insufficient central stock: available ${stock.stock}, requested ${qty}`);
        }
        
        stock.stock -= qty;
        
        return {
            id: Math.floor(Math.random() * 1000),
            storeId: storeId,
            productId,
            quantity: stock.stock,
        } as StoreStock;
    }

    async incrementCentralStock(_storeId: number, productId: number, qty: number): Promise<StoreStock> {
        let stock = this.centralStock.find(s => s.productId === productId);
        
        if (stock) {
            stock.stock += qty;
        } else {
            stock = { productId, stock: qty };
            this.centralStock.push(stock);
        }
        
        return {
            id: Math.floor(Math.random() * 1000),
            storeId: 1, // Mock logistics store ID
            productId,
            quantity: stock.stock,
        } as StoreStock;
    }

    async createReplenishmentRequest(storeId: number, productId: number, quantity: number): Promise<ReplenishmentRequest> {
        const request = new ReplenishmentRequest(
            this.nextRequestId++,
            storeId,
            productId,
            quantity,
            'PENDING' as ReplenishmentRequestStatus,
            new Date(),
        );
        
        this.replenishmentRequests.push(request);
        return request;
    }

    async getReplenishmentRequestsByStore(storeId: number): Promise<ReplenishmentRequest[]> {
        return this.replenishmentRequests.filter(r => r.storeId === storeId);
    }

    async getReplenishmentRequest(id: number): Promise<ReplenishmentRequest | null> {
        return this.replenishmentRequests.find(r => r.id === id) || null;
    }

    async updateReplenishmentStatus(id: number, status: ReplenishmentRequestStatus): Promise<ReplenishmentRequest> {
        const request = this.replenishmentRequests.find(r => r.id === id);
        if (!request) throw new Error(`Replenishment request ${id} not found`);
        
        request.status = status;
        return request;
    }

    async getReplenishmentRequests(): Promise<ReplenishmentRequest[]> {
        return [...this.replenishmentRequests];
    }

    async getLogisticStores(): Promise<Store[]> {
        return [...this.logisticStores];
    }
}
