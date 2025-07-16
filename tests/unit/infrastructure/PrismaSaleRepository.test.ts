const mockPrismaClient = {
    sale: {
        create: jest.fn(),
        findUnique: jest.fn(),
        delete: jest.fn(),
        findMany: jest.fn(),
    },
    saleItem: {
        deleteMany: jest.fn(),
        findMany: jest.fn(),
        aggregate: jest.fn(),
    },
    user: {
        findUnique: jest.fn(),
    },
    store: {
        findMany: jest.fn(),
    },
};

jest.mock('@prisma/client', () => ({
    PrismaClient: jest.fn(() => mockPrismaClient),
    StoreType: { LOGISTICS: 'LOGISTICS', SALES: 'SALES', HEADQUARTERS: 'HEADQUARTERS' },
    ReplenishmentRequestStatus: { PENDING: 'PENDING', APPROVED: 'APPROVED', REJECTED: 'REJECTED' },
}));

// Mock the PrismaClient instance used in the repository
jest.mock('../../../src/backend/infrastructure/prisma/PrismaClient', () => ({
    prisma: mockPrismaClient,
}));
import { PrismaSaleRepository } from '../../../src/backend/infrastructure/prisma/PrismaSaleRepository';

describe('PrismaSaleRepository', () => {
    let prismaSaleRepository: PrismaSaleRepository;

    beforeEach(() => {
        prismaSaleRepository = new PrismaSaleRepository();
        jest.clearAllMocks();
    });

    test('should create sale with items successfully', async () => {
        const mockSale = {
            id: 1,
            storeId: 1,
            date: new Date(),
            saleItems: [
                {
                    id: 1,
                    saleId: 1,
                    productId: 1,
                    quantity: 2,
                    unitPrice: 19.99,
                },
                {
                    id: 2,
                    saleId: 1,
                    productId: 2,
                    quantity: 1,
                    unitPrice: 29.99,
                },
            ],
        };

        mockPrismaClient.sale.create.mockResolvedValue(mockSale);

        const items = [
            { productId: 1, quantity: 2 },
            { productId: 2, quantity: 1 },
        ];

        const result = await prismaSaleRepository.createSale(1, items);

        expect(mockPrismaClient.sale.create).toHaveBeenCalledWith({
            data: {
                storeId: 1,
                saleItems: {
                    create: [
                        { productId: 1, quantity: 2, unitPrice: 0 },
                        { productId: 2, quantity: 1, unitPrice: 0 },
                    ],
                },
            },
            include: { saleItems: true },
        });
        expect(result).toEqual(mockSale);
    });

    test('should get sale by id successfully', async () => {
        const mockSale = {
            id: 1,
            storeId: 1,
            date: new Date(),
            saleItems: [
                {
                    id: 1,
                    saleId: 1,
                    productId: 1,
                    quantity: 3,
                    unitPrice: 15.99,
                },
            ],
        };

        mockPrismaClient.sale.findUnique.mockResolvedValue(mockSale);

        const result = await prismaSaleRepository.getSaleById(1);

        expect(mockPrismaClient.sale.findUnique).toHaveBeenCalledWith({
            where: { id: 1 },
            include: { saleItems: true },
        });
        expect(result).toEqual(mockSale);
    });

    test('should return null when sale not found', async () => {
        mockPrismaClient.sale.findUnique.mockResolvedValue(null);

        const result = await prismaSaleRepository.getSaleById(999);

        expect(mockPrismaClient.sale.findUnique).toHaveBeenCalledWith({
            where: { id: 999 },
            include: { saleItems: true },
        });
        expect(result).toBeNull();
    });

    test('should delete sale and its items successfully', async () => {
        mockPrismaClient.saleItem.deleteMany.mockResolvedValue({ count: 2 });
        mockPrismaClient.sale.delete.mockResolvedValue({
            id: 1,
            storeId: 1,
            date: new Date(),
        });

        await prismaSaleRepository.deleteSale(1);

        expect(mockPrismaClient.saleItem.deleteMany).toHaveBeenCalledWith({
            where: { saleId: 1 },
        });
        expect(mockPrismaClient.sale.delete).toHaveBeenCalledWith({
            where: { id: 1 },
        });
    });

    test('should group sales by store for authorized user', async () => {
        const mockUser = {
            access: [
                { id: 1, name: 'Store 1' },
                { id: 2, name: 'Store 2' },
            ],
        };

        // Le repository du projet utilise store.findMany pour récupérer les stores accessibles
        mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);
        mockPrismaClient.store.findMany.mockResolvedValue([
            { id: 1 },
            { id: 2 },
        ]);
        // Simule l'aggregate sur saleItem pour chaque store
        mockPrismaClient.saleItem = {
            deleteMany: jest.fn(),
            findMany: jest.fn(),
            aggregate: jest.fn()
                .mockResolvedValueOnce({ _sum: { quantity: 10 } })
                .mockResolvedValueOnce({ _sum: { quantity: 10 } }),
        };

        const startDate = new Date('2024-01-01');
        const endDate = new Date('2024-12-31');

        const result = await prismaSaleRepository.groupSalesByStore(1, startDate, endDate);

        expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
            where: { id: 1 },
            select: { access: true },
        });

        expect(mockPrismaClient.store.findMany).toHaveBeenCalledWith({
            where: {
                id: { in: [1, 2] },
                type: 'SALES',
            },
            select: { id: true },
        });

        expect(mockPrismaClient.saleItem.aggregate).toHaveBeenCalledTimes(2);
        expect(result).toEqual([
            { storeId: 1, totalQuantity: 10 },
            { storeId: 2, totalQuantity: 10 },
        ]);
    });

    test('should return empty array when user has no store access', async () => {
        const mockUser = {
            access: [],
        };

        mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);
        mockPrismaClient.store.findMany.mockResolvedValue([]);

        const result = await prismaSaleRepository.groupSalesByStore(1);

        expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
            where: { id: 1 },
            select: { access: true },
        });
        expect(mockPrismaClient.store.findMany).toHaveBeenCalledWith({
            where: {
                id: { in: [] },
                type: 'SALES',
            },
            select: { id: true },
        });
        expect(result).toEqual([]);
    });

    test('should return empty array when user not found', async () => {
        mockPrismaClient.user.findUnique.mockResolvedValue(null);

        const result = await prismaSaleRepository.groupSalesByStore(999);

        expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
            where: { id: 999 },
            select: { access: true },
        });
        expect(result).toEqual([]);
    });

    test('should get top products for authorized user', async () => {
        const mockUser = {
            access: [
                { id: 1, name: 'Store 1' },
                { id: 2, name: 'Store 2' },
            ],
        };

        const mockSaleItems = [
            { productId: 1, quantity: 10 },
            { productId: 1, quantity: 5 },
            { productId: 2, quantity: 8 },
            { productId: 3, quantity: 12 },
            { productId: 2, quantity: 2 },
        ];

        mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);
        mockPrismaClient.saleItem.findMany.mockResolvedValue(mockSaleItems);

        const startDate = new Date('2024-01-01');
        const endDate = new Date('2024-12-31');

        const result = await prismaSaleRepository.getTopProducts(1, 2, startDate, endDate);

        expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
            where: { id: 1 },
            select: { access: true },
        });

        expect(mockPrismaClient.saleItem.findMany).toHaveBeenCalledWith({
            where: {
                sale: {
                    storeId: {
                        in: [1, 2],
                    },
                    date: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
            },
            select: {
                productId: true,
                quantity: true,
            },
        });

        expect(result).toEqual([
            { productId: 1, totalQuantity: 15 },
            { productId: 3, totalQuantity: 12 },
        ]);
    });

    test('should return empty array for top products when user has no access', async () => {
        const mockUser = {
            access: [],
        };

        mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);
        mockPrismaClient.saleItem.findMany.mockResolvedValue([]);

        const result = await prismaSaleRepository.getTopProducts(1, 5);

        expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
            where: { id: 1 },
            select: { access: true },
        });
        
        expect(mockPrismaClient.saleItem.findMany).toHaveBeenCalledWith({
            where: {
                sale: {
                    storeId: {
                        in: [],
                    },
                    date: {
                        gte: undefined,
                        lte: undefined,
                    },
                },
            },
            select: {
                productId: true,
                quantity: true,
            },
        });
        expect(result).toEqual([]);
    });

    test('should return empty array for top products when user not found', async () => {
        mockPrismaClient.user.findUnique.mockResolvedValue(null);

        const result = await prismaSaleRepository.getTopProducts(999, 5);

        expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
            where: { id: 999 },
            select: { access: true },
        });
        expect(result).toEqual([]);
    });

    test('should handle groupSalesByStore without date filters', async () => {
        const mockUser = {
            access: [{ id: 1, name: 'Store 1' }],
        };

        mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);
        mockPrismaClient.store.findMany.mockResolvedValue([
            { id: 1 },
        ]);
        mockPrismaClient.saleItem.aggregate = jest.fn().mockResolvedValue({ _sum: { quantity: 7 } });

        const result = await prismaSaleRepository.groupSalesByStore(1);

        expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
            where: { id: 1 },
            select: { access: true },
        });

        expect(mockPrismaClient.store.findMany).toHaveBeenCalledWith({
            where: {
                id: { in: [1] },
                type: 'SALES',
            },
            select: { id: true },
        });

        expect(mockPrismaClient.saleItem.aggregate).toHaveBeenCalledTimes(1);
        expect(result).toEqual([
            { storeId: 1, totalQuantity: 7 },
        ]);
    });

    test('should handle getTopProducts without date filters', async () => {
        const mockUser = {
            access: [{ id: 1, name: 'Store 1' }],
        };

        const mockSaleItems = [
            { productId: 1, quantity: 5 },
            { productId: 2, quantity: 3 },
        ];

        mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);
        mockPrismaClient.saleItem.findMany.mockResolvedValue(mockSaleItems);

        const result = await prismaSaleRepository.getTopProducts(1, 10);

        expect(mockPrismaClient.saleItem.findMany).toHaveBeenCalledWith({
            where: {
                sale: {
                    storeId: {
                        in: [1],
                    },
                    date: {
                        gte: undefined,
                        lte: undefined,
                    },
                },
            },
            select: {
                productId: true,
                quantity: true,
            },
        });

        expect(result).toEqual([
            { productId: 1, totalQuantity: 5 },
            { productId: 2, totalQuantity: 3 },
        ]);
    });

    test('should return [] if user.access is falsy', async () => {
        mockPrismaClient.user.findUnique.mockResolvedValue({});
        const result = await prismaSaleRepository.groupSalesByStore(1);
        expect(result).toEqual([]);
    });

    test('should slice results if limit is provided', async () => {
        const mockUser = {
            access: [{ id: 1, name: 'Store 1' }],
        };

        mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);
        mockPrismaClient.store.findMany.mockResolvedValue([
            { id: 1 },
        ]);
        mockPrismaClient.saleItem.aggregate = jest.fn().mockResolvedValue({ _sum: { quantity: 10 } });

        const result = await prismaSaleRepository.groupSalesByStore(1, undefined, undefined, 1);

        expect(result).toEqual([{ storeId: 1, totalQuantity: 10 }]);
    });

    test('should stores with no sales return empty array', async () => {
        const mockUser = {
            access: [],
        };

        mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);
        mockPrismaClient.store.findMany.mockResolvedValue([]);
        mockPrismaClient.saleItem.aggregate = jest.fn().mockResolvedValue({ _sum: { quantity: 0 } });

        const result = await prismaSaleRepository.groupSalesByStore(1);

        expect(result).toEqual([]);
    });

    test('should aggregate saleItems return undefined _sum when no items', async () => {
        const mockUser = {
            access: [{ id: 1, name: 'Store 1' }],
        };

        mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);
        mockPrismaClient.store.findMany.mockResolvedValue([
            { id: 1 },
        ]);
        mockPrismaClient.saleItem.aggregate = jest.fn().mockResolvedValue({ _sum: { quantity: undefined } });

        const result = await prismaSaleRepository.groupSalesByStore(1);

        expect(result).toEqual([{ storeId: 1, totalQuantity: 0 }]);
    });
});
