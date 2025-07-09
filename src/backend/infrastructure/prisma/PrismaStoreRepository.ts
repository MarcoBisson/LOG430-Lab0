import { PrismaClient } from '@prisma/client';
import type { IStoreRepository } from '../../domain/repositories/IStoreRepository';
import type { Store } from '../../domain/entities/Store';
import type { StoreStock } from '../../domain/entities/StoreStock';

const prisma = new PrismaClient();

export class PrismaStoreRepository implements IStoreRepository {
    async findStoreById(id: number): Promise<Store | null> {
        return prisma.store.findUnique({ where: { id: id } });
    }

    async findStoreStock(storeId: number): Promise<StoreStock[]> {
        return prisma.storeStock.findMany({ where: { storeId } });
    }

    async findStoreStockByProduct(storeId: number, productId: number): Promise<StoreStock | null> {
        return prisma.storeStock.findFirst({ where: { storeId, productId } });
    }

    async decrementStoreStock(storeId: number, productId: number, qty: number): Promise<StoreStock> {
        return prisma.storeStock.update({
            where: { storeId_productId: { storeId, productId } },
            data: { quantity: { decrement: qty } },
        });
    }

    async incrementStoreStock(storeId: number, productId: number, qty: number): Promise<StoreStock> {
        return prisma.storeStock.update({
            where: { storeId_productId: { storeId, productId } },
            data: { quantity: { increment: qty } },
        });
    }

    async findStoreStocksBelow(threshold: number): Promise<StoreStock[]> {
        return prisma.storeStock.findMany({ where: { quantity: { lt: threshold } } });
    }
}