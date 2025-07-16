import type { StoreStock} from '@prisma/client';
import { StoreType } from '@prisma/client';
import type { ReplenishmentRequestStatus } from '@prisma/client';
import type { ILogisticsRepository } from '../../domain/repositories/ILogisticsRepository';
import type { ReplenishmentRequest } from '../../domain/entities/ReplenishmentRequest';
import type { Store } from '../../domain/entities/Store';
import { prisma } from './PrismaClient';

export class PrismaLogisticsRepository implements ILogisticsRepository {
    async findAllCentralStock(page?: number, limit?: number): Promise<{ products: { productId: number; stock: number; name: string }[]; total: number }> {
        // Si page ou limit ne sont pas fournis, on ne fait pas de pagination
        let skip: number | undefined = undefined;
        let take: number | undefined = undefined;
        let orderBy: any = undefined;
        const paginate = typeof page === 'number' && typeof limit === 'number';
        if (paginate) {
            take = limit;
            skip = page > 0 ? (page - 1) * take : 0;
            orderBy = { productId: 'asc' };
        }

        const groupByArgs: any = {
            by: ['productId'],
            where: {
                store: { type: StoreType.LOGISTICS },
            },
            _sum: { quantity: true },
            ...(paginate ? { orderBy } : {}),
            ...(paginate && typeof skip === 'number' ? { skip } : {}),
            ...(paginate && typeof take === 'number' ? { take } : {}),
        };

        const grouped = await prisma.storeStock.groupBy(groupByArgs);

        // Récupère le nom des produits pour les productId concernés
        const productIds = grouped.map(g => g.productId);
        const productsInfo = await prisma.product.findMany({
            where: { id: { in: productIds } },
            select: { id: true, name: true },
        });
        const nameMap = new Map(productsInfo.map(p => [p.id, p.name]));

        // Nombre total de produits distincts en stock central
        const total = await prisma.storeStock.groupBy({
            by: ['productId'],
            where: { store: { type: StoreType.LOGISTICS } },
            _sum: { quantity: true },
        });

        return {
            products: grouped.map(g => ({
                productId: g.productId,
                stock: (g._sum?.quantity ?? 0),
                name: nameMap.get(g.productId) ?? '',
            })),
            total: total.length,
        };
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