import type { PrismaRepository } from '../../infrastructure/PrismaRepository';
import type { Product } from '@prisma/client';

export class ProductService {
    constructor(private readonly repo: PrismaRepository) { }

    async addProduct(
        name: string,
        price: number,
        stock: number,
        category?: string,
    ): Promise<Product> {
        return this.repo.createProduct({ name, price, stock, category });
    }
}