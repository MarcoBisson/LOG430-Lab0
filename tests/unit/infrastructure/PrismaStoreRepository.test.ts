const mockPrismaClient = {
    store: {
        findUnique: jest.fn(),
    },
    storeStock: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
    },
};

jest.mock('@prisma/client', () => ({
    PrismaClient: jest.fn(() => mockPrismaClient),
}));

import { PrismaStoreRepository } from '../../../src/backend/infrastructure/prisma/PrismaStoreRepository';

describe('PrismaStoreRepository', () => {
    let repository: PrismaStoreRepository;

    beforeEach(() => {
        repository = new PrismaStoreRepository();
        jest.clearAllMocks();
    });

    test('should find store by id', async () => {
        const mockStore = {
            id: 1,
            name: 'Test Store',
            type: 'PHYSICAL',
        };

        mockPrismaClient.store.findUnique.mockResolvedValue(mockStore);

        const result = await repository.findStoreById(1);

        expect(mockPrismaClient.store.findUnique).toHaveBeenCalledWith({
            where: { id: 1 },
        });
        expect(result).toEqual(mockStore);
    });

    test('should find store stock', async () => {
        const mockStoreStocks = [
            { storeId: 1, productId: 1, quantity: 50 },
            { storeId: 1, productId: 2, quantity: 30 },
        ];

        mockPrismaClient.storeStock.findMany.mockResolvedValue(mockStoreStocks);

        const result = await repository.findStoreStock(1);

        expect(mockPrismaClient.storeStock.findMany).toHaveBeenCalledWith({
            where: { storeId: 1 },
        });
        expect(result).toEqual(mockStoreStocks);
    });

    test('should find store stock by product', async () => {
        const mockStoreStock = { storeId: 1, productId: 1, quantity: 50 };

        mockPrismaClient.storeStock.findFirst.mockResolvedValue(mockStoreStock);

        const result = await repository.findStoreStockByProduct(1, 1);

        expect(mockPrismaClient.storeStock.findFirst).toHaveBeenCalledWith({
            where: { storeId: 1, productId: 1 },
        });
        expect(result).toEqual(mockStoreStock);
    });

    test('should decrement store stock', async () => {
        const mockUpdatedStock = { storeId: 1, productId: 1, quantity: 45 };

        mockPrismaClient.storeStock.update.mockResolvedValue(mockUpdatedStock);

        const result = await repository.decrementStoreStock(1, 1, 5);

        expect(mockPrismaClient.storeStock.update).toHaveBeenCalledWith({
            where: { storeId_productId: { storeId: 1, productId: 1 } },
            data: { quantity: { decrement: 5 } },
        });
        expect(result).toEqual(mockUpdatedStock);
    });

    test('should increment store stock', async () => {
        const mockUpdatedStock = { storeId: 1, productId: 1, quantity: 55 };

        mockPrismaClient.storeStock.update.mockResolvedValue(mockUpdatedStock);

        const result = await repository.incrementStoreStock(1, 1, 5);

        expect(mockPrismaClient.storeStock.update).toHaveBeenCalledWith({
            where: { storeId_productId: { storeId: 1, productId: 1 } },
            data: { quantity: { increment: 5 } },
        });
        expect(result).toEqual(mockUpdatedStock);
    });

    test('should find store stocks below threshold', async () => {
        const mockLowStocks = [
            { storeId: 1, productId: 1, quantity: 5 },
            { storeId: 2, productId: 3, quantity: 2 },
        ];

        mockPrismaClient.storeStock.findMany.mockResolvedValue(mockLowStocks);

        const result = await repository.findStoreStocksBelow(10);

        expect(mockPrismaClient.storeStock.findMany).toHaveBeenCalledWith({
            where: { quantity: { lt: 10 } },
        });
        expect(result).toEqual(mockLowStocks);
    });
});
