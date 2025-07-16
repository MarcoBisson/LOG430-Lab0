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
        findMany: jest.fn(),
    },
};

// Mock the entire PrismaClient module
jest.mock('@prisma/client', () => ({
    PrismaClient: jest.fn(() => mockPrismaClient),
    StoreType: { LOGISTICS: 'LOGISTICS', SALES: 'SALES', HEADQUARTERS: 'HEADQUARTERS' },
    ReplenishmentRequestStatus: { PENDING: 'PENDING', APPROVED: 'APPROVED', REJECTED: 'REJECTED' },
}));

// Mock the PrismaClient instance used in the repository
jest.mock('../../../src/backend/infrastructure/prisma/PrismaClient', () => ({
    prisma: mockPrismaClient,
}));

import { PrismaLogisticsRepository } from '../../../src/backend/infrastructure/prisma/PrismaLogisticsRepository';

describe('PrismaLogisticsRepository', () => {
    let repository: PrismaLogisticsRepository;

    beforeEach(() => {
        repository = new PrismaLogisticsRepository();
        jest.clearAllMocks();
    });

    test('should find all central stock', async () => {
        // Mock groupBy pour retourner des données agrégées
        const groupedData = [
            { productId: 1, _sum: { quantity: 100 } },
            { productId: 2, _sum: { quantity: 50 } },
        ];
        
        // Mock findMany pour les informations produits
        const productsData = [
            { id: 1, name: 'Produit 1' },
            { id: 2, name: 'Produit 2' },
        ];

        // Premier appel groupBy pour les données paginées
        mockPrismaClient.storeStock.groupBy.mockResolvedValueOnce(groupedData);
        // Deuxième appel groupBy pour le total
        mockPrismaClient.storeStock.groupBy.mockResolvedValueOnce(groupedData);
        mockPrismaClient.product.findMany.mockResolvedValue(productsData);

        const result = await repository.findAllCentralStock();

        expect(mockPrismaClient.storeStock.groupBy).toHaveBeenCalledTimes(2);
        expect(mockPrismaClient.product.findMany).toHaveBeenCalledWith({
            where: { id: { in: [1, 2] } },
            select: { id: true, name: true },
        });
        
        expect(result).toEqual({
            products: [
                { productId: 1, stock: 100, name: 'Produit 1' },
                { productId: 2, stock: 50, name: 'Produit 2' },
            ],
            total: 2,
        });
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
        const groupedData = [
            { productId: 1, _sum: { quantity: 10 } },
            { productId: 2, _sum: { quantity: 20 } },
        ];
        
        const productsData = [
            { id: 1, name: 'A' },
            { id: 2, name: 'B' },
        ];

        // Premier appel pour les données paginées
        mockPrismaClient.storeStock.groupBy.mockResolvedValueOnce(groupedData);
        // Deuxième appel pour le total
        mockPrismaClient.storeStock.groupBy.mockResolvedValueOnce(groupedData);
        mockPrismaClient.product.findMany.mockResolvedValue(productsData);

        await repository.findAllCentralStock(2, 5);

        // Vérifier le premier appel groupBy avec pagination
        expect(mockPrismaClient.storeStock.groupBy).toHaveBeenNthCalledWith(1, {
            by: ['productId'],
            where: { store: { type: 'LOGISTICS' } },
            _sum: { quantity: true },
            orderBy: { productId: 'asc' },
            skip: 5, // (2-1) * 5
            take: 5,
        });
        
        // Vérifier le deuxième appel groupBy pour le total
        expect(mockPrismaClient.storeStock.groupBy).toHaveBeenNthCalledWith(2, {
            by: ['productId'],
            where: { store: { type: 'LOGISTICS' } },
            _sum: { quantity: true },
        });
    });

    test('should skip set 0 if page < 0', async () => {
        const groupedData = [{ productId: 1, _sum: { quantity: 10 } }];
        const productsData = [{ id: 1, name: 'A' }];

        mockPrismaClient.storeStock.groupBy.mockResolvedValueOnce(groupedData);
        mockPrismaClient.storeStock.groupBy.mockResolvedValueOnce(groupedData);
        mockPrismaClient.product.findMany.mockResolvedValue(productsData);
        
        await repository.findAllCentralStock(-1, 100);
        
        expect(mockPrismaClient.storeStock.groupBy).toHaveBeenNthCalledWith(1, {
            by: ['productId'],
            where: { store: { type: 'LOGISTICS' } },
            _sum: { quantity: true },
            orderBy: { productId: 'asc' },
            skip: 0,
            take: 100,
        });
    });

    test('should return correct product name mapping and stock 0 if quantity is null', async () => {
        const groupedData = [{ productId: 1, _sum: { quantity: null } }];
        const productsData = [{ id: 1, name: 'ProduitTest' }];

        mockPrismaClient.storeStock.groupBy.mockResolvedValueOnce(groupedData);
        mockPrismaClient.storeStock.groupBy.mockResolvedValueOnce(groupedData);
        mockPrismaClient.product.findMany.mockResolvedValue(productsData);
        
        const result = await repository.findAllCentralStock();
        
        expect(result.products[0].name).toBe('ProduitTest');
        expect(result.products[0].stock).toBe(0);
    });

    test('should return empty name if product name is null', async () => {
        const groupedData = [{ productId: 1, _sum: { quantity: null } }];
        const productsData = [{ id: 1, name: null }];

        mockPrismaClient.storeStock.groupBy.mockResolvedValueOnce(groupedData);
        mockPrismaClient.storeStock.groupBy.mockResolvedValueOnce(groupedData);
        mockPrismaClient.product.findMany.mockResolvedValue(productsData);
        
        const result = await repository.findAllCentralStock();
        
        expect(result.products[0].name).toBe('');
        expect(result.products[0].stock).toBe(0);
    });
});