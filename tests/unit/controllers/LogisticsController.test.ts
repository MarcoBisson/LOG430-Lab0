import type { Response } from 'express';
import { UserRole } from '@prisma/client';
import type { AuthenticatedRequest } from '../../../src/backend/interfaces/middlewares/authentificateJWT';

const mockLogisticsService = {
    requestReplenishment: jest.fn(),
    approveReplenishment: jest.fn(),
    checkCriticalStock: jest.fn(),
    getReplenishments: jest.fn(),
};

const mockUserRepository = {
    getUserAccess: jest.fn(),
};

jest.mock('../../../src/backend/application/services/LogisticsService', () => ({
    LogisticsService: jest.fn().mockImplementation(() => mockLogisticsService),
}));

jest.mock('../../../src/backend/infrastructure/prisma/PrismaUserRepository', () => ({
    PrismaUserRepository: jest.fn().mockImplementation(() => mockUserRepository),
}));

jest.mock('../../../src/backend/infrastructure/prisma/PrismaStoreRepository');
jest.mock('../../../src/backend/infrastructure/prisma/PrismaLogisticsRepository');

import { LogisticsController } from '../../../src/backend/interfaces/controllers/LogisticsController';

describe('LogisticsController', () => {
    let req: Partial<AuthenticatedRequest>;
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

    describe('request', () => {
        test('should create replenishment request when user has access to store', async () => {
            const mockResult = { id: 1, storeId: 2, productId: 3, quantity: 10 };
            const mockUserAccess = [
                { id: 1, name: 'Store 1' },
                { id: 2, name: 'Store 2' },
            ];

            req.body = { storeId: 2, productId: 3, quantity: 10 };
            req.user = {
                id: 1,
                username: 'staff_user',
                password: 'password123',
                role: UserRole.STAFF,
            };

            mockUserRepository.getUserAccess.mockResolvedValue(mockUserAccess);
            mockLogisticsService.requestReplenishment.mockResolvedValue(mockResult);

            await LogisticsController.request(req as AuthenticatedRequest, res as Response);

            expect(mockUserRepository.getUserAccess).toHaveBeenCalledWith(1);
            expect(mockLogisticsService.requestReplenishment).toHaveBeenCalledWith(2, 3, 10);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(mockResult);
        });

        test('should return 401 when user does not have access to store', async () => {
            const mockUserAccess = [
                { id: 1, name: 'Store 1' },
                { id: 3, name: 'Store 3' },
            ];

            req.body = { storeId: 2, productId: 3, quantity: 10 };
            req.user = {
                id: 1,
                username: 'staff_user',
                password: 'password123',
                role: UserRole.STAFF,
            };

            mockUserRepository.getUserAccess.mockResolvedValue(mockUserAccess);

            await LogisticsController.request(req as AuthenticatedRequest, res as Response);

            expect(mockUserRepository.getUserAccess).toHaveBeenCalledWith(1);
            expect(mockLogisticsService.requestReplenishment).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'Acces Unauthorized' });
        });

        test('should return 403 when no user is provided', async () => {
            req.body = { storeId: 2, productId: 3, quantity: 10 };
            req.user = undefined;

            await LogisticsController.request(req as AuthenticatedRequest, res as Response);

            expect(mockUserRepository.getUserAccess).not.toHaveBeenCalled();
            expect(mockLogisticsService.requestReplenishment).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
        });

        test('should handle service errors', async () => {
            const mockUserAccess = [{ id: 2, name: 'Store 2' }];
            const errorMessage = 'Service error';

            req.body = { storeId: 2, productId: 3, quantity: 10 };
            req.user = {
                id: 1,
                username: 'staff_user',
                password: 'password123',
                role: UserRole.STAFF,
            };

            mockUserRepository.getUserAccess.mockResolvedValue(mockUserAccess);
            mockLogisticsService.requestReplenishment.mockRejectedValue(new Error(errorMessage));

            await LogisticsController.request(req as AuthenticatedRequest, res as Response);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
        });
    });

    describe('approve', () => {
        test('should approve replenishment for non-client users', async () => {
            const mockResult = { id: 1, approved: true };

            req.params = { id: '1' };
            req.user = {
                id: 1,
                username: 'admin_user',
                password: 'password123',
                role: UserRole.ADMIN,
            };

            mockLogisticsService.approveReplenishment.mockResolvedValue(mockResult);

            await LogisticsController.approve(req as AuthenticatedRequest, res as Response);

            expect(mockLogisticsService.approveReplenishment).toHaveBeenCalledWith(1);
            expect(res.json).toHaveBeenCalledWith(mockResult);
        });

        test('should approve replenishment for staff users', async () => {
            const mockResult = { id: 1, approved: true };

            req.params = { id: '1' };
            req.user = {
                id: 1,
                username: 'staff_user',
                password: 'password123',
                role: UserRole.STAFF,
            };

            mockLogisticsService.approveReplenishment.mockResolvedValue(mockResult);

            await LogisticsController.approve(req as AuthenticatedRequest, res as Response);

            expect(mockLogisticsService.approveReplenishment).toHaveBeenCalledWith(1);
            expect(res.json).toHaveBeenCalledWith(mockResult);
        });

        test('should return 401 for client users', async () => {
            req.params = { id: '1' };
            req.user = {
                id: 1,
                username: 'client_user',
                password: 'password123',
                role: UserRole.CLIENT,
            };

            await LogisticsController.approve(req as AuthenticatedRequest, res as Response);

            expect(mockLogisticsService.approveReplenishment).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'Acces Unauthorized' });
        });

        test('should return 401 when no user is provided', async () => {
            req.params = { id: '1' };
            req.user = undefined;

            await LogisticsController.approve(req as AuthenticatedRequest, res as Response);

            expect(mockLogisticsService.approveReplenishment).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'Acces Unauthorized' });
        });

        test('should handle service errors in approve', async () => {
            const errorMessage = 'Approval error';

            req.params = { id: '1' };
            req.user = {
                id: 1,
                username: 'admin_user',
                password: 'password123',
                role: UserRole.ADMIN,
            };

            mockLogisticsService.approveReplenishment.mockRejectedValue(new Error(errorMessage));

            await LogisticsController.approve(req as AuthenticatedRequest, res as Response);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
        });
    });

    describe('alerts', () => {
        test('should return alerts for non-client users', async () => {
            const mockAlerts = [
                { productId: 1, storeId: 1, currentStock: 5, minThreshold: 10 },
                { productId: 2, storeId: 2, currentStock: 2, minThreshold: 15 },
            ];

            req.user = {
                id: 1,
                username: 'admin_user',
                password: 'password123',
                role: UserRole.ADMIN,
            };

            mockLogisticsService.checkCriticalStock.mockResolvedValue(mockAlerts);

            await LogisticsController.alerts(req as AuthenticatedRequest, res as Response);

            expect(mockLogisticsService.checkCriticalStock).toHaveBeenCalledTimes(1);
            expect(res.json).toHaveBeenCalledWith(mockAlerts);
        });

        test('should return alerts for staff users', async () => {
            const mockAlerts = [
                { productId: 1, storeId: 1, currentStock: 5, minThreshold: 10 },
            ];

            req.user = {
                id: 1,
                username: 'staff_user',
                password: 'password123',
                role: UserRole.STAFF,
            };

            mockLogisticsService.checkCriticalStock.mockResolvedValue(mockAlerts);

            await LogisticsController.alerts(req as AuthenticatedRequest, res as Response);

            expect(mockLogisticsService.checkCriticalStock).toHaveBeenCalledTimes(1);
            expect(res.json).toHaveBeenCalledWith(mockAlerts);
        });

        test('should return 401 for client users', async () => {
            req.user = {
                id: 1,
                username: 'client_user',
                password: 'password123',
                role: UserRole.CLIENT,
            };

            await LogisticsController.alerts(req as AuthenticatedRequest, res as Response);

            expect(mockLogisticsService.checkCriticalStock).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'Acces Unauthorized' });
        });

        test('should return 401 when no user is provided', async () => {
            req.user = undefined;

            await LogisticsController.alerts(req as AuthenticatedRequest, res as Response);

            expect(mockLogisticsService.checkCriticalStock).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'Acces Unauthorized' });
        });
    });

    describe('replenishments', () => {
        test('should return replenishments for non-client users', async () => {
            const mockReplenishments = [
                { id: 1, storeId: 1, productId: 1, quantity: 10, status: 'PENDING' },
                { id: 2, storeId: 2, productId: 2, quantity: 20, status: 'APPROVED' },
            ];

            req.user = {
                id: 1,
                username: 'admin_user',
                password: 'password123',
                role: UserRole.ADMIN,
            };

            mockLogisticsService.getReplenishments.mockResolvedValue(mockReplenishments);

            await LogisticsController.replenishments(req as AuthenticatedRequest, res as Response);

            expect(mockLogisticsService.getReplenishments).toHaveBeenCalledTimes(1);
            expect(res.json).toHaveBeenCalledWith(mockReplenishments);
        });

        test('should return replenishments for staff users', async () => {
            const mockReplenishments = [
                { id: 1, storeId: 1, productId: 1, quantity: 10, status: 'PENDING' },
            ];

            req.user = {
                id: 1,
                username: 'staff_user',
                password: 'password123',
                role: UserRole.STAFF,
            };

            mockLogisticsService.getReplenishments.mockResolvedValue(mockReplenishments);

            await LogisticsController.replenishments(req as AuthenticatedRequest, res as Response);

            expect(mockLogisticsService.getReplenishments).toHaveBeenCalledTimes(1);
            expect(res.json).toHaveBeenCalledWith(mockReplenishments);
        });

        test('should return 401 for client users', async () => {
            req.user = {
                id: 1,
                username: 'client_user',
                password: 'password123',
                role: UserRole.CLIENT,
            };

            await LogisticsController.replenishments(req as AuthenticatedRequest, res as Response);

            expect(mockLogisticsService.getReplenishments).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'Acces Unauthorized' });
        });

        test('should return 401 when no user is provided', async () => {
            req.user = undefined;

            await LogisticsController.replenishments(req as AuthenticatedRequest, res as Response);

            expect(mockLogisticsService.getReplenishments).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'Acces Unauthorized' });
        });
    });
});
