import type { IStoreRepository, CreateStoreData, UpdateStoreData } from '../repositories/IStoreRepository';
import type { Store } from '../entities/Store';
import type { StoreStock } from '../entities/StoreStock';
import { prisma } from '../config/database';

export class PrismaStoreRepository implements IStoreRepository {
    async findStoreById(id: number): Promise<Store | null> {
        const store = await prisma.store.findUnique({ 
            where: { id } 
        });
        return store as Store | null;
    }

    async findAllStores(): Promise<Store[]> {
        const stores = await prisma.store.findMany({
            orderBy: { name: 'asc' }
        });
        return stores as Store[];
    }

    async findStoresByType(type: 'SALES' | 'LOGISTICS' | 'HEADQUARTER'): Promise<Store[]> {
        const stores = await prisma.store.findMany({
            where: { type },
            orderBy: { name: 'asc' }
        });
        return stores as Store[];
    }

    async createStore(storeData: CreateStoreData): Promise<Store> {
        const store = await prisma.store.create({
            data: {
                name: storeData.name,
                address: storeData.address,
                type: storeData.type
            }
        });
        return store as Store;
    }

    async updateStore(id: number, storeData: UpdateStoreData): Promise<Store | null> {
        try {
            const store = await prisma.store.update({
                where: { id },
                data: {
                    ...(storeData.name && { name: storeData.name }),
                    ...(storeData.address && { address: storeData.address }),
                    ...(storeData.type && { type: storeData.type })
                }
            });
            return store as Store;
        } catch (error) {
            return null;
        }
    }

    async deleteStore(id: number): Promise<boolean> {
        try {
            await prisma.store.delete({
                where: { id }
            });
            return true;
        } catch (error) {
            return false;
        }
    }

    async findStoreStock(storeId: number): Promise<StoreStock[]> {
        const stocks = await prisma.storeStock.findMany({ 
            where: { storeId } 
        });
        return stocks as StoreStock[];
    }

    async findStoreStockByProduct(storeId: number, productId: number): Promise<StoreStock | null> {
        const stock = await prisma.storeStock.findFirst({ 
            where: { storeId, productId } 
        });
        return stock as StoreStock | null;
    }

    async decrementStoreStock(storeId: number, productId: number, qty: number): Promise<StoreStock> {
        const stock = await prisma.storeStock.update({
            where: { storeId_productId: { storeId, productId } },
            data: { quantity: { decrement: qty } },
        });
        return stock as StoreStock;
    }

    async incrementStoreStock(storeId: number, productId: number, qty: number): Promise<StoreStock> {
        const stock = await prisma.storeStock.update({
            where: { storeId_productId: { storeId, productId } },
            data: { quantity: { increment: qty } },
        });
        return stock as StoreStock;
    }

    async upsertStoreStock(storeId: number, productId: number, quantity: number): Promise<StoreStock> {
        const stock = await prisma.storeStock.upsert({
            where: { storeId_productId: { storeId, productId } },
            update: { quantity },
            create: { storeId, productId, quantity }
        });
        return stock as StoreStock;
    }

    async findStoreStocksBelow(threshold: number): Promise<StoreStock[]> {
        const stocks = await prisma.storeStock.findMany({ 
            where: { quantity: { lt: threshold } } 
        });
        return stocks as StoreStock[];
    }
}
