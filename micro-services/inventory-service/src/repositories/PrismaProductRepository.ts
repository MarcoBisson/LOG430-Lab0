import { PrismaClient } from '@prisma/client';
import type { IProductRepository } from './IProductRepository';
import { Product, ProductStock } from '../entities/Product';

export class PrismaProductRepository implements IProductRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async createProduct(
        storeId: number,
        data: Partial<Pick<ProductStock, 'name' | 'price' | 'description' | 'category' | 'stock'>>
    ): Promise<Product> {
        const result = await this.prisma.$transaction(async (tx: PrismaClient) => {
            // Créer le produit
            const product = await tx.product.create({
                data: {
                    name: data.name!,
                    price: data.price!,
                    description: data.description || null,
                    category: data.category || null,
                },
            });

            // Créer le stock pour le magasin si spécifié
            if (data.stock !== undefined && data.stock > 0) {
                await tx.storeStock.create({
                    data: {
                        storeId,
                        productId: product.id,
                        quantity: data.stock,
                    },
                });
            }

            return product;
        });

        return new Product(
            result.id,
            result.name,
            result.price,
            result.description,
            result.category
        );
    }

    async findProductById(id: number): Promise<Product | null> {
        const product = await this.prisma.product.findUnique({
            where: { id },
        });

        if (!product) return null;

        return new Product(
            product.id,
            product.name,
            product.price,
            product.description,
            product.category
        );
    }

    async findProductsByName(name: string): Promise<Product[]> {
        const products = await this.prisma.product.findMany({
            where: {
                name: {
                    contains: name,
                    mode: 'insensitive',
                },
            },
        });

        return products.map(
            p => new Product(p.id, p.name, p.price, p.description, p.category)
        );
    }

    async findProductsByCategory(category: string): Promise<Product[]> {
        const products = await this.prisma.product.findMany({
            where: {
                category: {
                    equals: category,
                    mode: 'insensitive',
                },
            },
        });

        return products.map(
            p => new Product(p.id, p.name, p.price, p.description, p.category)
        );
    }

    async listProducts(): Promise<Product[]> {
        const products = await this.prisma.product.findMany({
            orderBy: { createdAt: 'desc' },
        });

        return products.map(
            p => new Product(p.id, p.name, p.price, p.description, p.category)
        );
    }

    async updateProduct(
        productId: number,
        storeId: number,
        data: Partial<Pick<ProductStock, 'name' | 'price' | 'description' | 'category' | 'stock'>>
    ): Promise<ProductStock> {
        const result = await this.prisma.$transaction(async (tx: PrismaClient) => {
            // Mettre à jour le produit
            const product = await tx.product.update({
                where: { id: productId },
                data: {
                    name: data.name,
                    price: data.price,
                    description: data.description,
                    category: data.category,
                },
            });

            // Mettre à jour ou créer le stock si spécifié
            let stock = 0;
            if (data.stock !== undefined) {
                const storeStock = await tx.storeStock.upsert({
                    where: {
                        storeId_productId: {
                            storeId,
                            productId,
                        },
                    },
                    update: {
                        quantity: data.stock,
                    },
                    create: {
                        storeId,
                        productId,
                        quantity: data.stock,
                    },
                });
                stock = storeStock.quantity;
            } else {
                // Récupérer le stock existant
                const existingStock = await tx.storeStock.findUnique({
                    where: {
                        storeId_productId: {
                            storeId,
                            productId,
                        },
                    },
                });
                stock = existingStock?.quantity || 0;
            }

            return { product, stock };
        });

        return new ProductStock(
            result.product.id,
            result.product.name,
            result.product.price,
            result.product.description,
            result.product.category,
            result.stock
        );
    }

    async deleteProduct(id: number): Promise<Product> {
        const product = await this.prisma.product.delete({
            where: { id },
        });

        return new Product(
            product.id,
            product.name,
            product.price,
            product.description,
            product.category
        );
    }

    async findProductsByStore(
        storeId: number,
        limit?: number,
        page?: number
    ): Promise<{ products: ProductStock[]; total: number }> {
        const where = {
            storeStocks: {
                some: {
                    storeId,
                },
            },
        };

        const total = await this.prisma.product.count({ where });

        const products = await this.prisma.product.findMany({
            where,
            include: {
                storeStocks: {
                    where: { storeId },
                },
            },
            orderBy: { createdAt: 'desc' },
            ...(limit && { take: limit }),
            ...(page && limit && { skip: (page - 1) * limit }),
        });

        const productStocks = products.map(p => {
            const stock = p.storeStocks[0]?.quantity || 0;
            return new ProductStock(
                p.id,
                p.name,
                p.price,
                p.description,
                p.category,
                stock
            );
        });

        return { products: productStocks, total };
    }

    async searchProducts(
        searchTerm: string,
        page?: number,
        limit?: number
    ): Promise<{ products: Product[]; total: number }> {
        const where = {
            OR: [
                {
                    name: {
                        contains: searchTerm,
                        mode: 'insensitive' as const,
                    },
                },
                {
                    description: {
                        contains: searchTerm,
                        mode: 'insensitive' as const,
                    },
                },
                {
                    category: {
                        contains: searchTerm,
                        mode: 'insensitive' as const,
                    },
                },
            ],
        };

        const total = await this.prisma.product.count({ where });

        const products = await this.prisma.product.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            ...(limit && { take: limit }),
            ...(page && limit && { skip: (page - 1) * limit }),
        });

        const productEntities = products.map(
            p => new Product(p.id, p.name, p.price, p.description, p.category)
        );

        return { products: productEntities, total };
    }
}
