import type { ISaleRepository } from '../../domain/repositories/ISaleRepository';
import type { Sale } from '../../domain/entities/Sale';
import type { SaleItem } from '../../domain/entities/SaleItem';
import { prisma } from './PrismaClient';

export class PrismaSaleRepository implements ISaleRepository {
    async createSale(storeId: number, items: { productId: number; quantity: number }[]): Promise<Sale & { saleItems: SaleItem[] }> {
        return prisma.sale.create({
            data: {
                storeId,
                saleItems: { create: items.map(i => ({ productId: i.productId, quantity: i.quantity, unitPrice: /* fetch current price */ 0 })) },
            },
            include: { saleItems: true },
        });
    }

    async getSaleById(id: number): Promise<(Sale & { saleItems: SaleItem[] }) | null> {
        return prisma.sale.findUnique({
            where: { id },
            include: { saleItems: true },
        });
    }

    async deleteSale(id: number): Promise<void> {
        await prisma.saleItem.deleteMany({ where: { saleId: id } });
        await prisma.sale.delete({ where: { id } });
    }

    async groupSalesByStore(userId: number, startDate?: Date, endDate?: Date, limit?: number): Promise<{ storeId: number; totalQuantity: number }[]> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { access: true },
        });

        if (!user?.access)
            return [];


        // 1. Récupérer tous les stores accessibles de type 'SALES' uniquement
        const stores = await prisma.store.findMany({
            where: {
                id: { in: user.access.map(store => store.id) },
                type: 'SALES',
            },
            select: { id: true },
        });

        // 2. Pour chaque store, sommer les quantités vendues (via aggregate sur saleItem)
        const results = await Promise.all(
            stores.map(async (store) => {
                const agg = await prisma.saleItem.aggregate({
                    where: {
                        sale: {
                            storeId: store.id,
                            date: { gte: startDate, lte: endDate },
                        },
                    },
                    _sum: { quantity: true },
                });
                return { storeId: store.id, totalQuantity: agg._sum.quantity || 0 };
            }),
        );

        // 3. Trier par totalQuantity décroissant
        results.sort((a, b) => b.totalQuantity - a.totalQuantity);

        // 4. Appliquer la limite côté TypeScript si précisé
        if (limit && limit > 0) {
            return results.slice(0, limit);
        }
        return results;
    }

    async getTopProducts(userId: number,limit: number,startDate?: Date, endDate?: Date): Promise<{ productId: number; totalQuantity: number }[]> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { access: true },
        });

        if (!user?.access)
            return [];

        const accessibleStoreIds = user.access.map(store => store.id);

        const items = await prisma.saleItem.findMany({ 
            where: {
                sale: {
                    storeId: {
                        in: accessibleStoreIds,
                    },
                    date: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
            },
            select: { 
                productId: true, 
                quantity: true, 
            }, 
        });

        const map: Record<number, number> = {};
        for (const item of items) {
            map[item.productId] = (map[item.productId] || 0) + item.quantity;
        }

        const result = Object.entries(map)
            .map(([pid, totalQuantity]) => ({ productId: Number(pid), totalQuantity }));
        result.sort((a, b) => b.totalQuantity - a.totalQuantity);

        return result.slice(0, limit);
    }
}
