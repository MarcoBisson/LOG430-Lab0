const mockPrismaClient = {
    storeStock: {
        findMany: jest.fn(),
        update: jest.fn(),
    },
    replenishmentRequest: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
    },
    store: {
        findMany: jest.fn(),
    },
};

jest.mock('@prisma/client', () => ({
    PrismaClient: jest.fn(() => mockPrismaClient),
    StoreType: { LOGISTICS: 'LOGISTICS', PHYSICAL: 'PHYSICAL', ONLINE: 'ONLINE' },
    ReplenishmentRequestStatus: { PENDING: 'PENDING', APPROVED: 'APPROVED', REJECTED: 'REJECTED' },
}));

import { PrismaLogisticsRepository } from '../../../src/backend/infrastructure/prisma/PrismaLogisticsRepository';

describe('PrismaLogisticsRepository', () => {
    let repository: PrismaLogisticsRepository;

    beforeEach(() => {
        repository = new PrismaLogisticsRepository();
        jest.clearAllMocks();
    });

    test('should find all central stock', async () => {
        const mockStoreStocks = [
            { productId: 1, quantity: 100 },
            { productId: 2, quantity: 50 },
        ];

        mockPrismaClient.storeStock.findMany.mockResolvedValue(mockStoreStocks);

        const result = await repository.findAllCentralStock();

        expect(mockPrismaClient.storeStock.findMany).toHaveBeenCalledWith({
            where: {
                store: {
                    type: 'LOGISTICS',
                },
            },
            select: {
                productId: true,
                quantity: true,
            },
        });
        expect(result).toEqual([
            { productId: 1, stock: 100 },
            { productId: 2, stock: 50 },
        ]);
    });

    test('should decrement central stock', async () => {
        const mockUpdatedStock = { storeId: 1, productId: 1, quantity: 90 };

        mockPrismaClient.storeStock.update.mockResolvedValue(mockUpdatedStock);

        const result = await repository.decrementCentralStock(1, 1, 10);

        expect(mockPrismaClient.storeStock.update).toHaveBeenCalledWith({
            where: { storeId_productId: { storeId: 1, productId: 1 } },
            data: { quantity: { decrement: 10 } },
        });
        expect(result).toEqual(mockUpdatedStock);
    });

    test('should increment central stock', async () => {
        const mockUpdatedStock = { storeId: 1, productId: 1, quantity: 110 };

        mockPrismaClient.storeStock.update.mockResolvedValue(mockUpdatedStock);

        const result = await repository.incrementCentralStock(1, 1, 10);

        expect(mockPrismaClient.storeStock.update).toHaveBeenCalledWith({
            where: { storeId_productId: { storeId: 1, productId: 1 } },
            data: { quantity: { increment: 10 } },
        });
        expect(result).toEqual(mockUpdatedStock);
    });

    test('should create replenishment request', async () => {
        const mockRequest = {
            id: 1,
            storeId: 1,
            productId: 1,
            quantity: 50,
            status: 'PENDING',
        };

        mockPrismaClient.replenishmentRequest.create.mockResolvedValue(mockRequest);

        const result = await repository.createReplenishmentRequest(1, 1, 50);

        expect(mockPrismaClient.replenishmentRequest.create).toHaveBeenCalledWith({
            data: { storeId: 1, productId: 1, quantity: 50 },
        });
        expect(result).toEqual(mockRequest);
    });

    test('should get replenishment requests by store', async () => {
        const mockRequests = [
            { id: 1, storeId: 1, productId: 1, quantity: 50, status: 'PENDING' },
            { id: 2, storeId: 1, productId: 2, quantity: 30, status: 'APPROVED' },
        ];

        mockPrismaClient.replenishmentRequest.findMany.mockResolvedValue(mockRequests);

        const result = await repository.getReplenishmentRequestsByStore(1);

        expect(mockPrismaClient.replenishmentRequest.findMany).toHaveBeenCalledWith({
            where: { storeId: 1 },
        });
        expect(result).toEqual(mockRequests);
    });

    test('should get replenishment request by id', async () => {
        const mockRequest = {
            id: 1,
            storeId: 1,
            productId: 1,
            quantity: 50,
            status: 'PENDING',
        };

        mockPrismaClient.replenishmentRequest.findUnique.mockResolvedValue(mockRequest);

        const result = await repository.getReplenishmentRequest(1);

        expect(mockPrismaClient.replenishmentRequest.findUnique).toHaveBeenCalledWith({
            where: { id: 1 },
        });
        expect(result).toEqual(mockRequest);
    });

    test('should get logistics stores', async () => {
        const mockStores = [
            { id: 1, name: 'Logistics Center 1', type: 'LOGISTICS' },
            { id: 2, name: 'Logistics Center 2', type: 'LOGISTICS' },
        ];

        mockPrismaClient.store.findMany.mockResolvedValue(mockStores);

        const result = await repository.getLogisticStores();

        expect(mockPrismaClient.store.findMany).toHaveBeenCalledWith({
            where: {
                type: 'LOGISTICS',
            },
        });
        expect(result).toEqual(mockStores);
    });
});
