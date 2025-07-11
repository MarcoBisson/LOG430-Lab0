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
    },
    user: {
        findUnique: jest.fn(),
    },
};

jest.mock('@prisma/client', () => ({
    PrismaClient: jest.fn(() => mockPrismaClient),
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

        const mockSales = [
            {
                storeId: 1,
                saleItems: [
                    { quantity: 5 },
                    { quantity: 3 },
                ],
            },
            {
                storeId: 1,
                saleItems: [
                    { quantity: 2 },
                ],
            },
            {
                storeId: 2,
                saleItems: [
                    { quantity: 4 },
                    { quantity: 6 },
                ],
            },
        ];

        mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);
        mockPrismaClient.sale.findMany.mockResolvedValue(mockSales);

        const startDate = new Date('2024-01-01');
        const endDate = new Date('2024-12-31');

        const result = await prismaSaleRepository.groupSalesByStore(1, startDate, endDate);

        expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
            where: { id: 1 },
            select: { access: true },
        });

        expect(mockPrismaClient.sale.findMany).toHaveBeenCalledWith({
            where: {
                storeId: {
                    in: [1, 2],
                },
                date: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            select: {
                storeId: true,
                saleItems: { select: { quantity: true } },
            },
        });

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
        mockPrismaClient.sale.findMany.mockResolvedValue([]);

        const result = await prismaSaleRepository.groupSalesByStore(1);

        expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
            where: { id: 1 },
            select: { access: true },
        });
        
        expect(mockPrismaClient.sale.findMany).toHaveBeenCalledWith({
            where: {
                storeId: {
                    in: [],
                },
                date: {
                    gte: undefined,
                    lte: undefined,
                },
            },
            select: {
                storeId: true,
                saleItems: { select: { quantity: true } },
            },
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

        const mockSales = [
            {
                storeId: 1,
                saleItems: [{ quantity: 7 }],
            },
        ];

        mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);
        mockPrismaClient.sale.findMany.mockResolvedValue(mockSales);

        const result = await prismaSaleRepository.groupSalesByStore(1);

        expect(mockPrismaClient.sale.findMany).toHaveBeenCalledWith({
            where: {
                storeId: {
                    in: [1],
                },
                date: {
                    gte: undefined,
                    lte: undefined,
                },
            },
            select: {
                storeId: true,
                saleItems: { select: { quantity: true } },
            },
        });

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
});
