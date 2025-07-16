import type { Response } from 'express';
import { UserRole } from '@prisma/client';
import type { AuthenticatedRequest } from '../../../src/backend/interfaces/middlewares/authentificateJWT';

const mockReportService = {
    getConsolidatedReport: jest.fn(),
};

jest.mock('../../../src/backend/application/services/ReportService', () => ({
    ReportService: jest.fn().mockImplementation(() => mockReportService),
}));

jest.mock('../../../src/backend/infrastructure/prisma/PrismaSaleRepository');
jest.mock('../../../src/backend/infrastructure/prisma/PrismaLogisticsRepository');

import { ReportController } from '../../../src/backend/interfaces/controllers/ReportController';

describe('ReportController', () => {
    let req: Partial<AuthenticatedRequest>;
    let res: Partial<Response>;

    beforeEach(() => {
        req = {};
        res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
        };

        jest.clearAllMocks();
    });

    describe('consolidated', () => {
        test('should return consolidated report with date filters', async () => {
            const mockReport = {
                sales: [
                    { id: 1, total: 100, date: '2023-01-01' },
                    { id: 2, total: 200, date: '2023-01-02' },
                ],
                products: [
                    { id: 1, name: 'Product 1', sold: 5 },
                    { id: 2, name: 'Product 2', sold: 10 },
                ],
                stock: [
                    { productId: 1, storeId: 1, quantity: 50 },
                    { productId: 2, storeId: 1, quantity: 30 },
                ],
            };

            req.query = {
                startDate: '2023-01-01',
                endDate: '2023-01-31',
            };
            req.user = {
                id: 1,
                username: 'admin_user',
                password: 'password123',
                role: UserRole.ADMIN,
            };
            req.originalUrl = '/api/reports/consolidated';

            mockReportService.getConsolidatedReport.mockResolvedValue(mockReport);

            await ReportController.consolidated(req as AuthenticatedRequest, res as Response);

            expect(mockReportService.getConsolidatedReport).toHaveBeenCalledWith(
                req.user,
                {
                    startDate: new Date('2023-01-01'),
                    endDate: new Date('2023-01-31'),
                },
            );
            expect(res.json).toHaveBeenCalledWith(mockReport);
        });

        test('should return consolidated report without date filters', async () => {
            const mockReport = {
                sales: [
                    { id: 1, total: 100, date: '2023-01-01' },
                ],
                products: [
                    { id: 1, name: 'Product 1', sold: 5 },
                ],
                stock: [
                    { productId: 1, storeId: 1, quantity: 50 },
                ],
            };

            req.query = {};
            req.user = {
                id: 1,
                username: 'staff_user',
                password: 'password123',
                role: UserRole.STAFF,
            };
            req.originalUrl = '/api/reports/consolidated';

            mockReportService.getConsolidatedReport.mockResolvedValue(mockReport);

            await ReportController.consolidated(req as AuthenticatedRequest, res as Response);

            expect(mockReportService.getConsolidatedReport).toHaveBeenCalledWith(
                req.user,
                {
                    startDate: undefined,
                    endDate: undefined,
                },
            );
            expect(res.json).toHaveBeenCalledWith(mockReport);
        });

        test('should return consolidated report for client users', async () => {
            const mockReport = {
                sales: [
                    { id: 1, total: 100, date: '2023-01-01' },
                ],
                products: [
                    { id: 1, name: 'Product 1', sold: 5 },
                ],
                stock: [],
            };

            req.query = {};
            req.user = {
                id: 1,
                username: 'client_user',
                password: 'password123',
                role: UserRole.CLIENT,
            };
            req.originalUrl = '/api/reports/consolidated';

            mockReportService.getConsolidatedReport.mockResolvedValue(mockReport);

            await ReportController.consolidated(req as AuthenticatedRequest, res as Response);

            expect(mockReportService.getConsolidatedReport).toHaveBeenCalledWith(
                req.user,
                {
                    startDate: undefined,
                    endDate: undefined,
                },
            );
            expect(res.json).toHaveBeenCalledWith(mockReport);
        });

        test('should handle only startDate parameter', async () => {
            const mockReport = {
                sales: [
                    { id: 1, total: 100, date: '2023-01-01' },
                ],
                products: [
                    { id: 1, name: 'Product 1', sold: 5 },
                ],
                stock: [
                    { productId: 1, storeId: 1, quantity: 50 },
                ],
            };

            req.query = {
                startDate: '2023-01-01',
            };
            req.user = {
                id: 1,
                username: 'admin_user',
                password: 'password123',
                role: UserRole.ADMIN,
            };
            req.originalUrl = '/api/reports/consolidated';

            mockReportService.getConsolidatedReport.mockResolvedValue(mockReport);

            await ReportController.consolidated(req as AuthenticatedRequest, res as Response);

            expect(mockReportService.getConsolidatedReport).toHaveBeenCalledWith(
                req.user,
                {
                    startDate: new Date('2023-01-01'),
                    endDate: undefined,
                },
            );
            expect(res.json).toHaveBeenCalledWith(mockReport);
        });

        test('should handle only endDate parameter', async () => {
            const mockReport = {
                sales: [
                    { id: 1, total: 100, date: '2023-01-01' },
                ],
                products: [
                    { id: 1, name: 'Product 1', sold: 5 },
                ],
                stock: [
                    { productId: 1, storeId: 1, quantity: 50 },
                ],
            };

            req.query = {
                endDate: '2023-01-31',
            };
            req.user = {
                id: 1,
                username: 'admin_user',
                password: 'password123',
                role: UserRole.ADMIN,
            };
            req.originalUrl = '/api/reports/consolidated';

            mockReportService.getConsolidatedReport.mockResolvedValue(mockReport);

            await ReportController.consolidated(req as AuthenticatedRequest, res as Response);

            expect(mockReportService.getConsolidatedReport).toHaveBeenCalledWith(
                req.user,
                {
                    startDate: undefined,
                    endDate: new Date('2023-01-31'),
                },
            );
            expect(res.json).toHaveBeenCalledWith(mockReport);
        });

        test('should return 403 when no user is provided', async () => {
            req.query = {};
            req.user = undefined;
            req.originalUrl = '/api/reports/consolidated';

            await ReportController.consolidated(req as AuthenticatedRequest, res as Response);

            expect(mockReportService.getConsolidatedReport).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                status: 403,
                error: 'Forbidden',
                message: 'Invalid token',
                path: '/api/reports/consolidated',
                timestamp: expect.any(String), 
            }));
        });

        test('should handle service errors and return 500', async () => {
            req.query = {};
            req.user = {
                id: 1,
                username: 'admin_user',
                password: 'password123',
                role: UserRole.ADMIN,
            };
            req.originalUrl = '/api/reports/consolidated';

            mockReportService.getConsolidatedReport.mockRejectedValue(new Error('Service error'));

            await ReportController.consolidated(req as AuthenticatedRequest, res as Response);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                status: 500,
                error: 'Internal Server Error',
                message: 'Service error',
                path: '/api/reports/consolidated',
                timestamp: expect.any(String), 
            }));
        });

        test('should handle invalid date formats', async () => {
            const mockReport = {
                sales: [],
                products: [],
                stock: [],
            };

            req.query = {
                startDate: 'invalid-date',
                endDate: 'another-invalid-date',
            };
            req.user = {
                id: 1,
                username: 'admin_user',
                password: 'password123',
                role: UserRole.ADMIN,
            };
            req.originalUrl = '/api/reports/consolidated';

            mockReportService.getConsolidatedReport.mockResolvedValue(mockReport);

            await ReportController.consolidated(req as AuthenticatedRequest, res as Response);

            expect(mockReportService.getConsolidatedReport).toHaveBeenCalledWith(
                req.user,
                expect.objectContaining({
                    startDate: expect.any(Date),
                    endDate: expect.any(Date),
                }),
            );
            expect(res.json).toHaveBeenCalledWith(mockReport);
        });

        test('should handle array query parameters', async () => {
            const mockReport = {
                sales: [],
                products: [],
                stock: [],
            };

            req.query = {
                startDate: ['2023-01-01', '2023-01-02'],
                endDate: ['2023-01-31', '2023-02-01'],
            };
            req.user = {
                id: 1,
                username: 'admin_user',
                password: 'password123',
                role: UserRole.ADMIN,
            };
            req.originalUrl = '/api/reports/consolidated';

            mockReportService.getConsolidatedReport.mockResolvedValue(mockReport);

            await ReportController.consolidated(req as AuthenticatedRequest, res as Response);

            expect(mockReportService.getConsolidatedReport).toHaveBeenCalledWith(
                req.user,
                expect.objectContaining({
                    startDate: expect.any(Date),
                    endDate: expect.any(Date),
                }),
            );
            expect(res.json).toHaveBeenCalledWith(mockReport);
        });
    });
    test('should handle error in consolidated', async () => {
        const req: any = { 
            user: { id: 1 }, 
            originalUrl: '/api/reports/consolidated',
            query: {}
        };
        const res: any = { json: jest.fn(), status: jest.fn().mockReturnThis() };
        
        mockReportService.getConsolidatedReport.mockRejectedValue(new Error('fail'));
        
        await ReportController.consolidated(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            status: 500,
            error: 'Internal Server Error',
            message: 'fail',
            path: '/api/reports/consolidated',
            timestamp: expect.any(String),
        }));
    });

    test('should return result if limit and stockOffset are provided', async () => {
        const req: any = {
            user: { id: 1, role: UserRole.ADMIN },
            query: { limit: '10', stockOffset: '5' },
            originalUrl: '/api/reports/consolidated',
        };
        const res: any = { json: jest.fn(), status: jest.fn().mockReturnThis() };
        const mockReport = {
                sales: [],
                products: [],
                stock: [],
            };
         mockReportService.getConsolidatedReport.mockResolvedValue(mockReport);

        await ReportController.consolidated(req as AuthenticatedRequest, res as Response);
        expect(mockReportService.getConsolidatedReport).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 1,
                role: UserRole.ADMIN,
            }),
            expect.objectContaining({
                limit: 10,
                stockOffset: 5,
            }),
        );
    });

    test('should return 403 if user is not authenticated', async () => {
        const req: any = { 
            user: null, 
            originalUrl: '/api/reports/consolidated',
            query: {}
        };
        const res: any = { json: jest.fn(), status: jest.fn().mockReturnThis() };
        
        await ReportController.consolidated(req, res);
        
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            status: 403,
            error: 'Forbidden',
            message: 'Invalid token',
            path: '/api/reports/consolidated',
            timestamp: expect.any(String),
        }));
    });
});