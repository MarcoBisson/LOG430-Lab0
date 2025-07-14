const mockPrismaClient = {
    storeStock: {
        findMany: jest.fn(),
        update: jest.fn(),
        groupBy: jest.fn(),
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
    product: {
        findMany: jest.fn(), // Ajoute ce mock pour éviter l'erreur sur product.findMany
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
        // Simule groupBy si le repo l'utilise, sinon adapte findMany pour matcher la sortie attendue
        mockPrismaClient.storeStock.groupBy = jest.fn().mockResolvedValue([
            { productId: 1, _sum: { quantity: 100 } },
            { productId: 2, _sum: { quantity: 50 } },
        ]);
        mockPrismaClient.product.findMany = jest.fn().mockResolvedValue([
            { id: 1, name: 'Produit 1' },
            { id: 2, name: 'Produit 2' },
        ]);

        // Si le repo utilise groupBy :
        const result = await repository.findAllCentralStock();

        expect(mockPrismaClient.storeStock.groupBy).toHaveBeenCalled();
        expect(mockPrismaClient.product.findMany).toHaveBeenCalled();
        expect(result.products).toEqual([
            { productId: 1, stock: 100, name: 'Produit 1' },
            { productId: 2, stock: 50, name: 'Produit 2' },
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

    test('should handle updateReplenishmentStatus', async () => {
        mockPrismaClient.replenishmentRequest.update.mockResolvedValue({ id: 1, status: 'APPROVED' });
        const result = await repository.updateReplenishmentStatus(1, 'APPROVED' as any);
        expect(result).toEqual({ id: 1, status: 'APPROVED' });
    });

    test('should handle getReplenishmentRequests', async () => {
        mockPrismaClient.replenishmentRequest.findMany.mockResolvedValue([{ id: 1 }]);
        const result = await repository.getReplenishmentRequests();
        expect(result).toEqual([{ id: 1 }]);
    });

    test('should handle groupBy returning empty', async () => {
        mockPrismaClient.storeStock.groupBy.mockResolvedValue([]);
        mockPrismaClient.product.findMany.mockResolvedValue([]);
        const result = await repository.findAllCentralStock();
        expect(result.products).toEqual([]);
        expect(result.total).toBe(0);
    });

    test('should use skip, take, and orderBy when page and limit are provided', async () => {
        // Arrange
        mockPrismaClient.storeStock.groupBy.mockResolvedValue([
            { productId: 1, _sum: { quantity: 10 } },
            { productId: 2, _sum: { quantity: 20 } },
        ]);
        mockPrismaClient.product.findMany.mockResolvedValue([
            { id: 1, name: 'A' },
            { id: 2, name: 'B' },
        ]);
        // For total
        mockPrismaClient.storeStock.groupBy.mockResolvedValueOnce([
            { productId: 1, _sum: { quantity: 10 } },
            { productId: 2, _sum: { quantity: 20 } },
        ]).mockResolvedValueOnce([
            { productId: 1, _sum: { quantity: 10 } },
            { productId: 2, _sum: { quantity: 20 } },
        ]);

        await repository.findAllCentralStock(2, 5);

        // Assert
        expect(mockPrismaClient.storeStock.groupBy).toHaveBeenCalledWith(expect.objectContaining({
            by: ['productId'],
            where: { store: { type: 'LOGISTICS' } },
            _sum: { quantity: true },
            orderBy: { productId: 'asc' },
            skip: 5,
            take: 5,
        }));
    });

    test('should skip set 0 if page < 0', async () => {
        mockPrismaClient.storeStock.groupBy.mockResolvedValue([
            { productId: 1, _sum: { quantity: 10 } },
        ]);
        mockPrismaClient.product.findMany.mockResolvedValue([
            { id: 1, name: 'A' },
        ]);
        mockPrismaClient.storeStock.groupBy.mockResolvedValueOnce([
            { productId: 1, _sum: { quantity: 10 } },
        ]).mockResolvedValueOnce([
            { productId: 1, _sum: { quantity: 10 } },
        ]);
        await repository.findAllCentralStock(-1, 100);
        expect(mockPrismaClient.storeStock.groupBy).toHaveBeenCalledWith(expect.objectContaining({
            skip: 0,
            take: expect.any(Number),
            orderBy: expect.anything(),
        }));
    });

    test('should return correct product name mapping and stock 0 if quantity is null', async () => {
        mockPrismaClient.storeStock.groupBy.mockResolvedValue([
            { productId: 1, _sum: { quantity: null } },
        ]);
        mockPrismaClient.product.findMany.mockResolvedValue([
            { id: 1, name: 'ProduitTest' },
        ]);
        mockPrismaClient.storeStock.groupBy.mockResolvedValueOnce([
            { productId: 1, _sum: { quantity: null } },
        ]).mockResolvedValueOnce([
            { productId: 1, _sum: { quantity: null } },
        ]);
        const result = await repository.findAllCentralStock();
        expect(result.products[0].name).toBe('ProduitTest');
        expect(result.products[0].stock).toBe(0);
    });

    test('should return empty name if product name is null', async () => {
        mockPrismaClient.storeStock.groupBy.mockResolvedValue([
            { productId: 1, _sum: { quantity: null } },
        ]);
        mockPrismaClient.product.findMany.mockResolvedValue([
            { id: 1, name: null },
        ]);
        mockPrismaClient.storeStock.groupBy.mockResolvedValueOnce([
            { productId: 1, _sum: { quantity: null } },
        ]).mockResolvedValueOnce([
            { productId: 1, _sum: { quantity: null } },
        ]);
        const result = await repository.findAllCentralStock();
        expect(result.products[0].name).toBe('');
        expect(result.products[0].stock).toBe(0);
    });
});