const mockPrismaClient = {
    product: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
    storeStock: {
        create: jest.fn(),
        update: jest.fn(),
        findUnique: jest.fn(),
    },
};

jest.mock('@prisma/client', () => ({
    PrismaClient: jest.fn(() => mockPrismaClient),
}));

import { PrismaProductRepository } from '../../../src/backend/infrastructure/prisma/PrismaProductRepository';

describe('PrismaProductRepository', () => {
    let repository: PrismaProductRepository;

    beforeEach(() => {
        repository = new PrismaProductRepository();
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should create a product', async () => {
        const mockProduct = {
            id: 1,
            name: 'Test Product',
            description: 'Test Description',
            price: 100,
            category: 'Electronics',
        };

        const mockStoreStock = {
            storeId: 1,
            productId: 1,
            quantity: 10,
        };

        mockPrismaClient.product.create.mockResolvedValue(mockProduct);
        mockPrismaClient.storeStock.create.mockResolvedValue(mockStoreStock);

        const result = await repository.createProduct(1, {
            name: 'Test Product',
            description: 'Test Description',
            price: 100,
            category: 'Electronics',
            stock: 10,
        });

        expect(mockPrismaClient.product.create).toHaveBeenCalledWith({
            data: {
                name: 'Test Product',
                description: 'Test Description',
                price: 100,
                category: 'Electronics',
            },
        });
        expect(mockPrismaClient.storeStock.create).toHaveBeenCalledWith({
            data: {
                storeId: 1,
                productId: 1,
                quantity: 10,
            },
        });
        expect(result).toEqual(mockProduct);
    });

    test('should find product by id', async () => {
        const mockProduct = {
            id: 1,
            name: 'Test Product',
            description: 'Test Description',
            price: 100,
            category: 'Electronics',
        };

        mockPrismaClient.product.findUnique.mockResolvedValue(mockProduct);

        const result = await repository.findProductById(1);

        expect(mockPrismaClient.product.findUnique).toHaveBeenCalledWith({
            where: { id: 1 },
        });
        expect(result).toEqual(mockProduct);
    });

    test('should list all products', async () => {
        const mockProducts = [
            {
                id: 1,
                name: 'Product 1',
                description: 'Description 1',
                price: 100,
                category: 'Electronics',
            },
            {
                id: 2,
                name: 'Product 2',
                description: 'Description 2',
                price: 200,
                category: 'Clothing',
            },
        ];

        mockPrismaClient.product.findMany.mockResolvedValue(mockProducts);

        const result = await repository.listProducts();

        expect(mockPrismaClient.product.findMany).toHaveBeenCalledWith();
        expect(result).toEqual(mockProducts);
    });

    test('should update product with stock successfully', async () => {
        const mockProduct = {
            id: 1,
            name: 'Updated Product',
            description: 'Updated description',
            price: 25.99,
            category: 'ELECTRONICS',
        };

        const mockStoreStock = {
            id: 1,
            storeId: 1,
            productId: 1,
            quantity: 50,
        };

        mockPrismaClient.product.update.mockResolvedValue(mockProduct);
        mockPrismaClient.storeStock.update.mockResolvedValue(mockStoreStock);

        const result = await repository.updateProduct(1, 1, {
            name: 'Updated Product',
            description: 'Updated description',
            price: 25.99,
            stock: 50,
        });

        expect(mockPrismaClient.product.update).toHaveBeenCalledWith({
            where: { id: 1 },
            data: {
                name: 'Updated Product',
                description: 'Updated description',
                price: 25.99,
            },
        });

        expect(mockPrismaClient.storeStock.update).toHaveBeenCalledWith({
            where: {
                storeId_productId: {
                    storeId: 1,
                    productId: 1,
                },
            },
            data: {
                quantity: 50,
            },
        });

        expect(result).toEqual({
            ...mockProduct,
            stock: 50,
        });
    });

    test('should update product without stock change', async () => {
        const mockProduct = {
            id: 1,
            name: 'Updated Product Only',
            description: 'Updated description only',
            price: 35.99,
            category: 'CLOTHING',
        };

        const mockExistingStock = {
            id: 1,
            storeId: 1,
            productId: 1,
            quantity: 25,
        };

        mockPrismaClient.product.update.mockResolvedValue(mockProduct);
        mockPrismaClient.storeStock.findUnique.mockResolvedValue(mockExistingStock);

        const result = await repository.updateProduct(1, 1, {
            name: 'Updated Product Only',
            description: 'Updated description only',
            price: 35.99,
        });

        expect(mockPrismaClient.product.update).toHaveBeenCalledWith({
            where: { id: 1 },
            data: {
                name: 'Updated Product Only',
                description: 'Updated description only',
                price: 35.99,
            },
        });

        expect(mockPrismaClient.storeStock.update).not.toHaveBeenCalled();
        expect(mockPrismaClient.storeStock.findUnique).toHaveBeenCalledWith({
            where: {
                storeId_productId: {
                    storeId: 1,
                    productId: 1,
                },
            },
        });

        expect(result).toEqual({
            ...mockProduct,
            stock: 25,
        });
    });

    test('should delete product successfully', async () => {
        const mockProduct = {
            id: 1,
            name: 'Product to Delete',
            description: 'Description',
            price: 19.99,
            category: 'BOOKS',
        };

        mockPrismaClient.product.delete.mockResolvedValue(mockProduct);

        const result = await repository.deleteProduct(1);

        expect(mockPrismaClient.product.delete).toHaveBeenCalledWith({
            where: { id: 1 },
        });
        expect(result).toEqual(mockProduct);
    });

    test('should find products by category', async () => {
        const mockProducts = [
            {
                id: 1,
                name: 'Electronics Product 1',
                description: 'Description 1',
                price: 99.99,
                category: 'ELECTRONICS',
            },
            {
                id: 2,
                name: 'Electronics Product 2',
                description: 'Description 2',
                price: 149.99,
                category: 'ELECTRONICS',
            },
        ];

        mockPrismaClient.product.findMany.mockResolvedValue(mockProducts);

        const result = await repository.findProductsByCategory('ELECTRONICS');

        expect(mockPrismaClient.product.findMany).toHaveBeenCalledWith({
            where: { category: 'ELECTRONICS' },
        });
        expect(result).toEqual(mockProducts);
    });

    test('should find products by name', async () => {
        const mockProducts = [
            {
                id: 1,
                name: 'iPhone 14',
                description: 'Latest iPhone',
                price: 999.99,
                category: 'ELECTRONICS',
            },
        ];

        mockPrismaClient.product.findMany.mockResolvedValue(mockProducts);

        const result = await repository.findProductsByName('iPhone');

        expect(mockPrismaClient.product.findMany).toHaveBeenCalledWith({
            where: {
                name: {
                    contains: 'iPhone',
                    mode: 'insensitive',
                },
            },
        });
        expect(result).toEqual(mockProducts);
    });

    test('should find products by store', async () => {
        const mockProducts = [
            {
                id: 1,
                name: 'Store Product 1',
                price: 29.99,
                description: 'Product in specific store',
                category: 'HOME',
                storeStocks: [{ quantity: 15 }],
            },
            {
                id: 2,
                name: 'Store Product 2',
                price: 49.99,
                description: 'Another product in store',
                category: 'SPORTS',
                storeStocks: [{ quantity: 30 }],
            },
        ];

        mockPrismaClient.product.findMany.mockResolvedValue(mockProducts);

        const result = await repository.findProductsByStore(1);

        expect(mockPrismaClient.product.findMany).toHaveBeenCalledWith({
            where: {
                storeStocks: {
                    some: {
                        storeId: 1,
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
                    where: {
                        storeId: 1,
                    },
                    select: {
                        quantity: true,
                    },
                },
            },
        });

        expect(result).toEqual([
            {
                id: 1,
                name: 'Store Product 1',
                price: 29.99,
                description: 'Product in specific store',
                category: 'HOME',
                stock: 15,
            },
            {
                id: 2,
                name: 'Store Product 2',
                price: 49.99,
                description: 'Another product in store',
                category: 'SPORTS',
                stock: 30,
            },
        ]);
    });

    test('should handle findProductsByStore with no stock', async () => {
        const mockProducts = [
            {
                id: 1,
                name: 'Product No Stock',
                price: 19.99,
                description: 'Product without stock',
                category: 'BOOKS',
                storeStocks: [],
            },
        ];

        mockPrismaClient.product.findMany.mockResolvedValue(mockProducts);

        const result = await repository.findProductsByStore(1);

        expect(result).toEqual([
            {
                id: 1,
                name: 'Product No Stock',
                price: 19.99,
                description: 'Product without stock',
                category: 'BOOKS',
                stock: 0,
            },
        ]);
    });
});
