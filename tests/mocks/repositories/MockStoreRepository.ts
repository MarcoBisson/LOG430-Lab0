import type { Store } from '../../../src/backend/domain/entities/Store';
import { StoreStock } from '../../../src/backend/domain/entities/StoreStock';
import type { IStoreRepository } from '../../../src/backend/domain/repositories/IStoreRepository';

export class MockStoreRepository implements IStoreRepository {
    private stores: Store[] = [];
    private storeStocks: StoreStock[] = [];

    // Helper methods
    seed(stores: Store[], storeStocks: StoreStock[] = []) {
        this.stores = stores;
        this.storeStocks = storeStocks;
    }

    clear() {
        this.stores = [];
        this.storeStocks = [];
    }

    async findStoreById(id: number): Promise<Store | null> {
        return this.stores.find(s => s.id === id) || null;
    }

    async findStoreStock(storeId: number): Promise<StoreStock[]> {
        return this.storeStocks.filter(ss => ss.storeId === storeId);
    }

    async findStoreStockByProduct(storeId: number, productId: number): Promise<StoreStock | null> {
        return this.storeStocks.find(ss => ss.storeId === storeId && ss.productId === productId) || null;
    }

    async incrementStoreStock(storeId: number, productId: number, quantity: number): Promise<StoreStock> {
        let storeStock = this.storeStocks.find(ss => ss.storeId === storeId && ss.productId === productId);

        if (storeStock) {
            storeStock.quantity += quantity;
        } else {
            storeStock = new StoreStock(
                Math.floor(Math.random() * 1000),
                storeId,
                productId,
                quantity,
            );
            this.storeStocks.push(storeStock);
        }

        return storeStock;
    }

    async decrementStoreStock(storeId: number, productId: number, quantity: number): Promise<StoreStock> {
        const storeStock = this.storeStocks.find(ss => ss.storeId === storeId && ss.productId === productId);

        if (!storeStock) {
            throw new Error(`Stock not found for store ${storeId} and product ${productId}`);
        }

        if (storeStock.quantity < quantity) {
            throw new Error(`Insufficient stock: available ${storeStock.quantity}, requested ${quantity}`);
        }

        storeStock.quantity -= quantity;
        return storeStock;
    }

    async findStoreStocksBelow(threshold: number): Promise<StoreStock[]> {
        return this.storeStocks.filter(ss => ss.quantity < threshold);
    }
}
