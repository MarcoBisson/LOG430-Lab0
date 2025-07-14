import type { Request, Response } from 'express';

const mockSaleService = {
    recordSale: jest.fn(),
    getSaleById: jest.fn(),
};

const mockSaleRepository = {};
const mockStoreRepository = {};

jest.mock('../../../src/backend/application/services/SaleService', () => ({
    SaleService: jest.fn().mockImplementation(() => mockSaleService),
}));

jest.mock('../../../src/backend/infrastructure/prisma/PrismaSaleRepository', () => ({
    PrismaSaleRepository: jest.fn().mockImplementation(() => mockSaleRepository),
}));

jest.mock('../../../src/backend/infrastructure/prisma/PrismaStoreRepository', () => ({
    PrismaStoreRepository: jest.fn().mockImplementation(() => mockStoreRepository),
}));

import { SaleController } from '../../../src/backend/interfaces/controllers/SaleController';

describe('SaleController', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;

    beforeEach(() => {
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        
        jest.clearAllMocks();
    });

    test('should record sale successfully', async () => {
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
            ],
        };

        mockRequest = {
            body: {
                storeId: '1',
                items: [{ productId: 1, quantity: 2 }],
            },
        };

        mockSaleService.recordSale.mockResolvedValue(mockSale);

        await SaleController.record(mockRequest as Request, mockResponse as Response);

        expect(mockSaleService.recordSale).toHaveBeenCalledWith(1, [{ productId: 1, quantity: 2 }]);
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith(mockSale);
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
                    unitPrice: 29.99,
                },
            ],
        };

        mockRequest = {
            params: {
                id: '1',
            },
        };

        mockSaleService.getSaleById.mockResolvedValue(mockSale);

        await SaleController.get(mockRequest as Request, mockResponse as Response);

        expect(mockSaleService.getSaleById).toHaveBeenCalledWith(1);
        expect(mockResponse.json).toHaveBeenCalledWith(mockSale);
        expect(mockResponse.status).not.toHaveBeenCalledWith(404);
    });

    test('should return 404 when sale not found', async () => {
        mockRequest = {
            params: {
                id: '999',
            },
        };

        mockSaleService.getSaleById.mockResolvedValue(null);

        await SaleController.get(mockRequest as Request, mockResponse as Response);

        expect(mockSaleService.getSaleById).toHaveBeenCalledWith(999);
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
            status: 404,
            error: 'Not Found',
            message: 'Vente non trouvée',
            path: undefined,
            timestamp: expect.any(String),
        }));
    });

    test('should return 404 if getSaleById returns null', async () => {
            const req: any = { params: { id: '1' }, originalUrl: '/api/sales/1' };
            const res: any = { json: jest.fn(), status: jest.fn().mockReturnThis() };
            (SaleController as any).saleService = { getSaleById: jest.fn().mockResolvedValue(null) };
            await SaleController.get(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
    });

    test('should return 400 on error during sale recording', async () => {
        mockRequest = {
            body: {
                storeId: '1',
                items: [{ productId: 1, quantity: 2 }],
            },
        };

        mockSaleService.recordSale.mockRejectedValue(new Error('Error recording sale'));

        await SaleController.record(mockRequest as Request, mockResponse as Response);

        expect(mockSaleService.recordSale).toHaveBeenCalledWith(1, [{ productId: 1, quantity: 2 }]);
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
            status: 400,
            error: 'Bad Request',
            message: "Erreur lors de l'enregistrement de la vente",
        }));
    });
});
