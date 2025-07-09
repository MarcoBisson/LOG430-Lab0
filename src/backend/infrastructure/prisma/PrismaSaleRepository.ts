import { PrismaClient } from '@prisma/client';
import type { ISaleRepository } from '../../domain/repositories/ISaleRepository';
import type { Sale } from '../../domain/entities/Sale';
import type { SaleItem } from '../../domain/entities/SaleItem';

const prisma = new PrismaClient();

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

    async groupSalesByStore(userId:number, startDate?: Date, endDate?: Date): Promise<{ storeId: number; totalQuantity: number }[]> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { access: true },
        });

        if (!user?.access)
            return [];
        
        const accessibleStoreIds = user.access.map(store => store.id);

        const sales = await prisma.sale.findMany({
            where: {
                storeId:{
                    in: accessibleStoreIds,
                },
                date: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            select: {
                storeId: true,
                saleItems: { select: { quantity: true } },
            },
        });

        const map: Record<number, number> = {};
        for (const sale of sales) {
            const sum: number = sale.saleItems.reduce((acc: number, si: { quantity: number }) => acc + si.quantity, 0);
            map[sale.storeId] = (map[sale.storeId] || 0) + sum;
        }

        return Object.entries(map).map(([storeId, totalQuantity]) => ({
            storeId: Number(storeId),
            totalQuantity,
        }));
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
