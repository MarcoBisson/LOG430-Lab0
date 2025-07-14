import { Product, ProductStock } from '../../../src/backend/domain/entities/Product';
import type { IProductRepository } from '../../../src/backend/domain/repositories/IProductRepository';

export class MockProductRepository implements IProductRepository {
    private products: (Product & { stock?: number })[] = [];
    private nextId = 1;

    // Helper method to seed test data
    seed(products: (Product & { stock?: number })[]) {
        this.products = products;
        this.nextId = Math.max(...products.map(p => p.id), 0) + 1;
    }

    // Helper method to clear data
    clear() {
        this.products = [];
        this.nextId = 1;
    }

    async createProduct(
        _storeId: number,
        data: Partial<Pick<ProductStock, 'name' | 'price' | 'description' | 'category' | 'stock'>>,
    ): Promise<Product> {
        const product = new Product(
            this.nextId++,
            data.name || '',
            data.price || 0,
            data.description || null,
            data.category || null,
        );
        this.products.push({ ...product, stock: data.stock || 0 });
        return product;
    }

    async findProductById(id: number): Promise<Product | null> {
        const product = this.products.find(p => p.id === id);
        return product ? new Product(product.id, product.name, product.price, product.description, product.category) : null;
    }

    async findProductsByName(name: string): Promise<Product[]> {
        return this.products
            .filter(p => p.name.toLowerCase().includes(name.toLowerCase()))
            .map(p => new Product(p.id, p.name, p.price, p.description, p.category));
    }

    async findProductsByCategory(category: string): Promise<Product[]> {
        return this.products
            .filter(p => p.category === category)
            .map(p => new Product(p.id, p.name, p.price, p.description, p.category));
    }

    async listProducts(): Promise<Product[]> {
        return this.products.map(p => new Product(p.id, p.name, p.price, p.description, p.category));
    }

    async updateProduct(
        productId: number,
        _storeId: number,
        data: Partial<Pick<ProductStock, 'name' | 'price' | 'description' | 'category' | 'stock'>>,
    ): Promise<ProductStock> {
        const index = this.products.findIndex(p => p.id === productId);
        if (index === -1) throw new Error(`Product ${productId} not found`);

        const product = this.products[index];
        Object.assign(product, data);

        return new ProductStock(
            product.id,
            product.name,
            product.price,
            product.description,
            product.category,
            product.stock || 0,
        );
    }

    async deleteProduct(id: number): Promise<Product> {
        const index = this.products.findIndex(p => p.id === id);
        if (index === -1) throw new Error(`Product ${id} not found`);

        const product = this.products.splice(index, 1)[0];
        return new Product(product.id, product.name, product.price, product.description, product.category);
    }

    async findProductsByStore(_storeId: number, limit?: number, page?: number): Promise<{ products: ProductStock[]; total: number }> {
        let products = this.products.map(p => new ProductStock(
            p.id,
            p.name,
            p.price,
            p.description,
            p.category,
            p.stock || 0,
        ));
        const total = products.length;
        if (typeof limit === 'number' && typeof page === 'number') {
            const start = (page - 1) * limit;
            products = products.slice(start, start + limit);
        }
        return { products, total };
    }
}
