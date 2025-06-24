import { PrismaClient } from '@prisma/client';
import { ReplenishmentRequestStatus } from '@prisma/client';
import { ILogisticsRepository } from '../../domain/repositories/ILogisticsRepository';
import { Product } from '../../domain/entities/Product';
import { ReplenishmentRequest } from '../../domain/entities/ReplenishmentRequest';

const prisma = new PrismaClient();

export class PrismaLogisticsRepository implements ILogisticsRepository {
    async findAllCentralStock(): Promise<{ productId: number; stock: number }[]> {
        const products = await prisma.product.findMany({ select: { id: true, stock: true } });
        return products.map(p => ({ productId: p.id, stock: p.stock }));
    }

    async decrementCentralStock(productId: number, qty: number): Promise<Product> {
        return prisma.product.update({ where: { id: productId }, data: { stock: { decrement: qty } } });
    }

    async incrementCentralStock(productId: number, qty: number): Promise<Product> {
        return prisma.product.update({ where: { id: productId }, data: { stock: { increment: qty } } });
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
}