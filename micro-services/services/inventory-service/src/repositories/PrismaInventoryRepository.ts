import { PrismaClient } from '@prisma/client';
import type { IInventoryRepository } from './IInventoryRepository';
import { StoreStock } from '../entities/StoreStock';

export class PrismaInventoryRepository implements IInventoryRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async findAllCentralStock(page?: number, limit?: number): Promise<{ products: Array<{ productId: number; stock: number; name: string }>; total: number }> {
        // Construire les options de requête
        const queryOptions: any = {
            by: ['productId'],
            _sum: {
                quantity: true,
            },
            orderBy: {
                productId: 'asc' as const
            }
        };

        if (limit) {
            queryOptions.take = limit;
        }

        if (page && limit) {
            queryOptions.skip = (page - 1) * limit;
        }

        // Agrégation du stock central (somme de tous les stocks des magasins)
        const stockAggregation = await this.prisma.storeStock.groupBy(queryOptions);

        const total = await this.prisma.storeStock.groupBy({
            by: ['productId'],
            _count: true,
        }).then((results: any[]) => results.length);

        // Récupérer les noms des produits
        const productIds = stockAggregation.map((item: any) => item.productId);
        const products = await this.prisma.product.findMany({
            where: {
                id: { in: productIds },
            },
            select: {
                id: true,
                name: true,
            },
        });

        const productMap = new Map(products.map((p: any) => [p.id, p.name]));

        const result = stockAggregation.map((item: any) => ({
            productId: item.productId,
            stock: item._sum.quantity || 0,
            name: productMap.get(item.productId) || 'Produit inconnu',
        }));

        return { products: result, total };
    }

    async decrementCentralStock(storeId: number, productId: number, qty: number): Promise<StoreStock> {
        return this.decrementStoreStock(storeId, productId, qty);
    }

    async incrementCentralStock(storeId: number, productId: number, qty: number): Promise<StoreStock> {
        return this.incrementStoreStock(storeId, productId, qty);
    }

    async findStoreStock(storeId: number): Promise<StoreStock[]> {
        const stocks = await this.prisma.storeStock.findMany({
            where: { storeId },
            include: {
                product: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        return stocks.map((stock: any) => 
            new StoreStock(stock.id, stock.storeId, stock.productId, stock.quantity)
        );
    }

    async findStoreStockByProduct(storeId: number, productId: number): Promise<StoreStock | null> {
        const stock = await this.prisma.storeStock.findUnique({
            where: {
                storeId_productId: {
                    storeId,
                    productId,
                },
            },
        });

        if (!stock) return null;

        return new StoreStock(stock.id, stock.storeId, stock.productId, stock.quantity);
    }

    async upsertStoreStock(storeId: number, productId: number, quantity: number): Promise<StoreStock> {
        const stock = await this.prisma.storeStock.upsert({
            where: {
                storeId_productId: {
                    storeId,
                    productId,
                },
            },
            update: {
                quantity,
            },
            create: {
                storeId,
                productId,
                quantity,
            },
        });

        return new StoreStock(stock.id, stock.storeId, stock.productId, stock.quantity);
    }

    async incrementStoreStock(storeId: number, productId: number, quantity: number): Promise<StoreStock> {
        const stock = await this.prisma.storeStock.upsert({
            where: {
                storeId_productId: {
                    storeId,
                    productId,
                },
            },
            update: {
                quantity: {
                    increment: quantity,
                },
            },
            create: {
                storeId,
                productId,
                quantity,
            },
        });

        return new StoreStock(stock.id, stock.storeId, stock.productId, stock.quantity);
    }

    async decrementStoreStock(storeId: number, productId: number, quantity: number): Promise<StoreStock> {
        const existingStock = await this.prisma.storeStock.findUnique({
            where: {
                storeId_productId: {
                    storeId,
                    productId,
                },
            },
        });

        if (!existingStock) {
            throw new Error('Stock non trouvé');
        }

        if (existingStock.quantity < quantity) {
            throw new Error('Stock insuffisant');
        }

        const stock = await this.prisma.storeStock.update({
            where: {
                storeId_productId: {
                    storeId,
                    productId,
                },
            },
            data: {
                quantity: {
                    decrement: quantity,
                },
            },
        });

        return new StoreStock(stock.id, stock.storeId, stock.productId, stock.quantity);
    }

    async findStoreStocksBelow(threshold: number): Promise<StoreStock[]> {
        const stocks = await this.prisma.storeStock.findMany({
            where: {
                quantity: {
                    lte: threshold,
                },
            },
            include: {
                product: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        return stocks.map((stock: any) => 
            new StoreStock(stock.id, stock.storeId, stock.productId, stock.quantity)
        );
    }

    // Méthodes utilitaires supplémentaires pour la gestion avancée
    async transferStock(fromStoreId: number, toStoreId: number, productId: number, quantity: number): Promise<{ from: StoreStock; to: StoreStock }> {
        const result = await this.prisma.$transaction(async (tx: any) => {
            // Vérifier le stock source
            const sourceStock = await tx.storeStock.findUnique({
                where: {
                    storeId_productId: {
                        storeId: fromStoreId,
                        productId,
                    },
                },
            });

            if (!sourceStock || sourceStock.quantity < quantity) {
                throw new Error('Stock source insuffisant');
            }

            // Décrémenter le stock source
            const updatedSource = await tx.storeStock.update({
                where: {
                    storeId_productId: {
                        storeId: fromStoreId,
                        productId,
                    },
                },
                data: {
                    quantity: {
                        decrement: quantity,
                    },
                },
            });

            // Incrémenter le stock destination
            const updatedDestination = await tx.storeStock.upsert({
                where: {
                    storeId_productId: {
                        storeId: toStoreId,
                        productId,
                    },
                },
                update: {
                    quantity: {
                        increment: quantity,
                    },
                },
                create: {
                    storeId: toStoreId,
                    productId,
                    quantity,
                },
            });

            return { source: updatedSource, destination: updatedDestination };
        });

        return {
            from: new StoreStock(result.source.id, result.source.storeId, result.source.productId, result.source.quantity),
            to: new StoreStock(result.destination.id, result.destination.storeId, result.destination.productId, result.destination.quantity),
        };
    }
}
