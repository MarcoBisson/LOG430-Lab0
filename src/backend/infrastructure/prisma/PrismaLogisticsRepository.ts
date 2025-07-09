import type { StoreStock} from '@prisma/client';
import { PrismaClient, StoreType } from '@prisma/client';
import type { ReplenishmentRequestStatus } from '@prisma/client';
import type { ILogisticsRepository } from '../../domain/repositories/ILogisticsRepository';
import type { ReplenishmentRequest } from '../../domain/entities/ReplenishmentRequest';
import type { Store } from '../../domain/entities/Store';

const prisma = new PrismaClient();

export class PrismaLogisticsRepository implements ILogisticsRepository {
    async findAllCentralStock(): Promise<{ productId: number; stock: number }[]> {
        const storeStocks = await prisma.storeStock.findMany({
            where: {
                store:{
                    type: StoreType.LOGISTICS,
                },
              },
              select: {
                productId:true,
                quantity: true,
              },
        });
        return storeStocks.map(p => ({ productId: p.productId, stock: p.quantity }));
    }

    async decrementCentralStock(storeId: number, productId: number, qty: number): Promise<StoreStock> {
        return prisma.storeStock.update({ where: { storeId_productId:{storeId,productId} }, data: { quantity: { decrement: qty } } });
    }

    async incrementCentralStock(storeId: number, productId: number, qty: number): Promise<StoreStock> {
        return prisma.storeStock.update({ where: { storeId_productId:{storeId,productId} }, data: { quantity: { increment: qty } } });
    }

    async createReplenishmentRequest(storeId: number, productId: number, quantity: number): Promise<ReplenishmentRequest> {
        return prisma.replenishmentRequest.create({ data: { storeId, productId, quantity } });
    }

    async getReplenishmentRequestsByStore(storeId: number): Promise<ReplenishmentRequest[]> {
        return prisma.replenishmentRequest.findMany({ where: { storeId } });
    }

    async getReplenishmentRequest(id: number): Promise<ReplenishmentRequest | null> {
        return prisma.replenishmentRequest.findUnique({ where: { id } });
    }

    async updateReplenishmentStatus(id: number, status: ReplenishmentRequestStatus): Promise<ReplenishmentRequest> {
        return prisma.replenishmentRequest.update({ where: { id }, data: { status } });
    }

    async getReplenishmentRequests(): Promise<ReplenishmentRequest[]> {
        return prisma.replenishmentRequest.findMany();
    }

    async getLogisticStores(): Promise<Store[]> {
        return prisma.store.findMany({
            where:{
                type: StoreType.LOGISTICS,
            },
        });
    }
}