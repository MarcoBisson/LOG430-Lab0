import { PrismaClient } from '@prisma/client';
import { IProductRepository } from '../../domain/repositories/IProductRepository';
import { Product } from '../../domain/entities/Product';

const prisma = new PrismaClient();

export class PrismaProductRepository implements IProductRepository {
    async createProduct(data: {
        name: string;
        price: number;
        description?: string | null;
        category?: string | null;
        stock: number;
    }): Promise<Product> {
        return prisma.product.create({ data });
    }

    async findProductById(id: number): Promise<Product | null> {
        return prisma.product.findUnique({ where: { id } });
    }

    async findProductsByName(name: string): Promise<Product[]> {
        return prisma.product.findMany({
            where: { name: { contains: name, mode: 'insensitive' } },
        });
    }

    async findProductsByCategory(category: string): Promise<Product[]> {
        return prisma.product.findMany({
            where: { category },
        });
    }

    async listProducts(): Promise<Product[]> {
        return prisma.product.findMany();
    }

    async updateProduct(
        id: number,
        data: Partial<Pick<Product, 'name' | 'price' | 'description' | 'category'>>
    ): Promise<Product> {
        return prisma.product.update({ where: { id }, data });
    }

    async deleteProduct(id: number): Promise<Product> {
        return prisma.product.delete({ where: { id } });
    }
}