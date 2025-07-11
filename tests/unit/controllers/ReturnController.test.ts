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

import { ReturnController } from '../../../src/backend/interfaces/controllers/ReturnController';

describe('ReturnController', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;

    beforeEach(() => {
        req = {};
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

            mockSaleRepository.getSaleById.mockResolvedValue(mockSale);
            mockReturnService.processReturn.mockResolvedValue(undefined);

            await ReturnController.process(req as Request, res as Response);

            expect(mockSaleRepository.getSaleById).toHaveBeenCalledWith(1);
            expect(mockReturnService.processReturn).toHaveBeenCalledWith(1);
            expect(res.status).toHaveBeenCalledWith(204);
            expect(res.end).toHaveBeenCalledTimes(1);
        });

        test('should process return when sale does not exist but continues with saleId', async () => {
            req.body = { saleId: 999 };

            mockSaleRepository.getSaleById.mockResolvedValue(null);
            mockReturnService.processReturn.mockResolvedValue(undefined);

            await ReturnController.process(req as Request, res as Response);

            expect(mockSaleRepository.getSaleById).toHaveBeenCalledWith(999);
            expect(mockReturnService.processReturn).toHaveBeenCalledWith(999);
            expect(res.status).toHaveBeenCalledWith(204);
            expect(res.end).toHaveBeenCalledTimes(1);
        });

        test('should handle string saleId in body', async () => {
            const mockSale = {
                id: 42,
                storeId: 1,
                total: 200,
                date: new Date('2023-01-02'),
            };

            req.body = { saleId: '42' };

            mockSaleRepository.getSaleById.mockResolvedValue(mockSale);
            mockReturnService.processReturn.mockResolvedValue(undefined);

            await ReturnController.process(req as Request, res as Response);

            expect(mockSaleRepository.getSaleById).toHaveBeenCalledWith(42);
            expect(mockReturnService.processReturn).toHaveBeenCalledWith(42);
            expect(res.status).toHaveBeenCalledWith(204);
            expect(res.end).toHaveBeenCalledTimes(1);
        });

        test('should handle numeric conversion for saleId', async () => {
            req.body = { saleId: 100 };

            mockSaleRepository.getSaleById.mockResolvedValue(null);
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

            mockSaleRepository.getSaleById.mockResolvedValue(mockSale);
            mockReturnService.processReturn.mockRejectedValue(new Error('Service error'));

            await expect(ReturnController.process(req as Request, res as Response)).rejects.toThrow('Service error');

            expect(mockSaleRepository.getSaleById).toHaveBeenCalledWith(1);
            expect(mockReturnService.processReturn).toHaveBeenCalledWith(1);
        });

        test('should handle repository errors gracefully', async () => {
            req.body = { saleId: 1 };

            mockSaleRepository.getSaleById.mockRejectedValue(new Error('Repository error'));

            await expect(ReturnController.process(req as Request, res as Response)).rejects.toThrow('Repository error');

            expect(mockSaleRepository.getSaleById).toHaveBeenCalledWith(1);
            expect(mockReturnService.processReturn).not.toHaveBeenCalled();
        });
    });
});
