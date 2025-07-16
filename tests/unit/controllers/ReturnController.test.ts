import type { Request, Response } from 'express';

const mockReturnService = {
    processReturn: jest.fn(),
};

const mockSaleRepository = {
    getSaleById: jest.fn(),
};

jest.mock('../../../src/backend/application/services/ReturnService', () => ({
    ReturnService: jest.fn().mockImplementation(() => mockReturnService),
}));

jest.mock('../../../src/backend/infrastructure/prisma/PrismaSaleRepository', () => ({
    PrismaSaleRepository: jest.fn().mockImplementation(() => mockSaleRepository),
}));

jest.mock('../../../src/backend/infrastructure/prisma/PrismaStoreRepository');

// Mock logger
jest.mock('../../../src/backend/utils/logger', () => ({
    createControllerLogger: jest.fn(() => ({
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
    })),
}));

// Mock errorResponse
import { errorResponse } from '../../../src/backend/utils/errorResponse';
jest.mock('../../../src/backend/utils/errorResponse', () => ({
    errorResponse: jest.fn((res, status, error, message, path) => {
        res.status(status).json({
            status,
            error,
            message,
            path,
            timestamp: new Date().toISOString(),
        });
    }),
}));

import { ReturnController } from '../../../src/backend/interfaces/controllers/ReturnController';

describe('ReturnController', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;

    beforeEach(() => {
        req = {
            body: {},
            originalUrl: '/api/returns/process',
        };
        res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
            end: jest.fn(),
        };

        jest.clearAllMocks();
    });

    describe('process', () => {
        test('should process return when sale exists', async () => {
            const mockSale = {
                id: 1,
                storeId: 1,
                total: 100,
                date: new Date('2023-01-01'),
            };

            req.body = { saleId: 1 };
            req.originalUrl = '/api/returns/process';

            mockSaleRepository.getSaleById.mockResolvedValue(mockSale);
            mockReturnService.processReturn.mockResolvedValue(undefined);

            await ReturnController.process(req as Request, res as Response);

            expect(mockSaleRepository.getSaleById).toHaveBeenCalledWith(1);
            expect(mockReturnService.processReturn).toHaveBeenCalledWith(1);
            expect(res.status).toHaveBeenCalledWith(204);
            expect(res.end).toHaveBeenCalledTimes(1);
        });

        test('should return 404 when sale does not exist', async () => {
            req.body = { saleId: 999 };
            req.originalUrl = '/api/returns/process';

            mockSaleRepository.getSaleById.mockResolvedValue(null);

            await ReturnController.process(req as Request, res as Response);

            expect(mockSaleRepository.getSaleById).toHaveBeenCalledWith(999);
            expect(mockReturnService.processReturn).not.toHaveBeenCalled();
            expect(errorResponse).toHaveBeenCalledWith(res, 404, 'Not Found', 'Ventes introuvable', '/api/returns/process');
        });

        test('should handle string saleId in body', async () => {
            const mockSale = {
                id: 42,
                storeId: 1,
                total: 200,
                date: new Date('2023-01-02'),
            };

            req.body = { saleId: '42' };
            req.originalUrl = '/api/returns/process';

            mockSaleRepository.getSaleById.mockResolvedValue(mockSale);
            mockReturnService.processReturn.mockResolvedValue(undefined);

            await ReturnController.process(req as Request, res as Response);

            expect(mockSaleRepository.getSaleById).toHaveBeenCalledWith(42);
            expect(mockReturnService.processReturn).toHaveBeenCalledWith(42);
            expect(res.status).toHaveBeenCalledWith(204);
            expect(res.end).toHaveBeenCalledTimes(1);
        });

        test('should handle numeric conversion for saleId', async () => {
            const mockSale = {
                id: 100,
                storeId: 1,
                total: 150,
                date: new Date('2023-01-03'),
            };

            req.body = { saleId: 100 };
            req.originalUrl = '/api/returns/process';

            mockSaleRepository.getSaleById.mockResolvedValue(mockSale);
            mockReturnService.processReturn.mockResolvedValue(undefined);

            await ReturnController.process(req as Request, res as Response);

            expect(mockSaleRepository.getSaleById).toHaveBeenCalledWith(100);
            expect(mockReturnService.processReturn).toHaveBeenCalledWith(100);
            expect(res.status).toHaveBeenCalledWith(204);
            expect(res.end).toHaveBeenCalledTimes(1);
        });

        test('should handle service errors gracefully', async () => {
            const mockSale = {
                id: 1,
                storeId: 1,
                total: 100,
                date: new Date('2023-01-01'),
            };

            req.body = { saleId: 1 };
            req.originalUrl = '/api/returns/process';

            mockSaleRepository.getSaleById.mockResolvedValue(mockSale);
            mockReturnService.processReturn.mockRejectedValue(new Error('Service error'));

            await ReturnController.process(req as Request, res as Response);

            expect(mockSaleRepository.getSaleById).toHaveBeenCalledWith(1);
            expect(mockReturnService.processReturn).toHaveBeenCalledWith(1);
            expect(errorResponse).toHaveBeenCalledWith(res, 400, 'Bad Request', 'Erreur processus de retour pour saleId 1', '/api/returns/process');
        });

        test('should handle repository errors gracefully', async () => {
            req.body = { saleId: 1 };
            req.originalUrl = '/api/returns/process';

            mockSaleRepository.getSaleById.mockRejectedValue(new Error('Repository error'));

            await ReturnController.process(req as Request, res as Response);

            expect(mockSaleRepository.getSaleById).toHaveBeenCalledWith(1);
            expect(mockReturnService.processReturn).not.toHaveBeenCalled();
            expect(errorResponse).toHaveBeenCalledWith(res, 400, 'Bad Request', 'Erreur processus de retour pour saleId 1', '/api/returns/process');
        });
    });
});
