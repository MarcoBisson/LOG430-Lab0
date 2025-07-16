import type { IProductRepository } from '../../domain/repositories/IProductRepository';
import type { Product, ProductStock } from '../../domain/entities/Product';
import { prisma } from './PrismaClient';

export class PrismaProductRepository implements IProductRepository {
    async createProduct(
        storeId: number,
        data: Partial<Pick<ProductStock, 'name' | 'price' | 'description' | 'category'| 'stock'>>,
    ): Promise<Product> {
        const product = await prisma.product.create({ 
            data : {
                name: data.name ?? '',
                price: data.price ?? 0,
                description: data.description,
                category: data.category,
            },
        });

        await prisma.storeStock.create({
            data: {
                storeId: storeId,
                productId: product.id,
                quantity: data.stock ?? 0,
            },
        });

        return product;
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
        productId: number,
        storeId: number,
        data: Partial<Pick<ProductStock, 'name' | 'price' | 'description' | 'category'| 'stock'>>,
    ): Promise<ProductStock> {
        const { stock, ...productData } = data;

        const updatedProduct = await prisma.product.update({ where: { id: productId }, data: productData });

        if (stock !== undefined) {
            await prisma.storeStock.update({
            where: {
                storeId_productId: {
                storeId,
                productId,
                },
            },
            data: {
                quantity: stock,
            },
            });
        }

        return {
            ...updatedProduct,
            stock: stock ?? (await prisma.storeStock.findUnique({
            where: {
                storeId_productId: {
                storeId,
                productId,
                },
            },
            }))?.quantity ?? 0,
        };
    }

    async deleteProduct(id: number): Promise<Product> {
        return prisma.product.delete({ where: { id } });
    }

    async findProductsByStore(storeId: number, limit?: number, page?: number): Promise<{ products: ProductStock[]; total: number }> {
        let take: number | undefined = undefined;
        let skip: number | undefined = undefined;
        if (typeof limit === 'number' && typeof page === 'number') {
            take = limit;
            skip = page > 0 ? (page - 1) * take : 0;
        }
        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where: {
                    storeStocks: {
                        some: {
                            storeId: storeId,
                        },
                    },
                },
                select: {
                    id: true,
                    name: true,
                    price: true,
                    description: true,
                    category: true,
                    storeStocks: {
                        where: { storeId },
                        select: { quantity: true },
                    },
                },
                ...(typeof skip === 'number' ? { skip } : {}),
                ...(typeof take === 'number' ? { take } : {}),
            }),
            prisma.product.count({
                where: {
                    storeStocks: {
                        some: {
                            storeId: storeId,
                        },
                    },
                },
            }),
        ]);
        return {
            products: products.map(p => ({
                id: p.id,
                name: p.name,
                price: p.price,
                description: p.description,
                category: p.category,
                stock: p.storeStocks[0]?.quantity ?? 0,
            })),
            total,
        };
    }
}