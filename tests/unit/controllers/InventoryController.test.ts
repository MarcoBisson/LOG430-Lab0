import type { Response } from 'express';
import { UserRole } from '@prisma/client';
import type { AuthenticatedRequest } from '../../../src/backend/interfaces/middlewares/authentificateJWT';

const mockInventoryService = {
    getCentralStock: jest.fn(),
    getStoreStock: jest.fn(),
};

const mockUserRepository = {
    getUserAccess: jest.fn(),
};

jest.mock('../../../src/backend/application/services/InventoryService', () => ({
    InventoryService: jest.fn().mockImplementation(() => mockInventoryService),
}));

jest.mock('../../../src/backend/infrastructure/prisma/PrismaUserRepository', () => ({
    PrismaUserRepository: jest.fn().mockImplementation(() => mockUserRepository),
}));

jest.mock('../../../src/backend/infrastructure/prisma/PrismaStoreRepository');
jest.mock('../../../src/backend/infrastructure/prisma/PrismaLogisticsRepository');

import { InventoryController } from '../../../src/backend/interfaces/controllers/InventoryController';

describe('InventoryController', () => {
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

    describe('central', () => {
        test('should return central stock for non-client users', async () => {
            const mockCentralStock = [
                { productId: 1, quantity: 100 },
                { productId: 2, quantity: 50 },
            ];
            mockInventoryService.getCentralStock.mockResolvedValue(mockCentralStock);

            req.user = {
                id: 1,
                username: 'staff_user',
                password: 'password123',
                role: UserRole.STAFF,
            };

            await InventoryController.central(req as AuthenticatedRequest, res as Response);

            expect(mockInventoryService.getCentralStock).toHaveBeenCalledTimes(1);
            expect(res.json).toHaveBeenCalledWith(mockCentralStock);
        });

        test('should return central stock for admin users', async () => {
            const mockCentralStock = [
                { productId: 1, quantity: 100 },
                { productId: 2, quantity: 50 },
            ];
            mockInventoryService.getCentralStock.mockResolvedValue(mockCentralStock);

            req.user = {
                id: 1,
                username: 'admin_user',
                password: 'password123',
                role: UserRole.ADMIN,
            };

            await InventoryController.central(req as AuthenticatedRequest, res as Response);

            expect(mockInventoryService.getCentralStock).toHaveBeenCalledTimes(1);
            expect(res.json).toHaveBeenCalledWith(mockCentralStock);
        });

        test('should return 401 for client users', async () => {
            req.user = {
                id: 1,
                username: 'client_user',
                password: 'password123',
                role: UserRole.CLIENT,
            };

            await InventoryController.central(req as AuthenticatedRequest, res as Response);

            expect(mockInventoryService.getCentralStock).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'Acces Unauthorized' });
        });

        test('should return 401 when no user is provided', async () => {
            req.user = undefined;

            await InventoryController.central(req as AuthenticatedRequest, res as Response);

            expect(mockInventoryService.getCentralStock).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'Acces Unauthorized' });
        });
    });

    describe('store', () => {
        test('should return store stock when user has access to store', async () => {
            const storeId = 2;
            const mockStoreStock = [
                { productId: 1, quantity: 20 },
                { productId: 2, quantity: 15 },
            ];
            const mockUserAccessData = [
                { id: 1, name: 'Store 1' },
                { id: 2, name: 'Store 2' },
            ];

            req.params = { storeId: storeId.toString() };
            req.user = {
                id: 1,
                username: 'staff_user',
                password: 'password123',
                role: UserRole.STAFF,
            };

            mockUserRepository.getUserAccess.mockResolvedValue(mockUserAccessData);
            mockInventoryService.getStoreStock.mockResolvedValue(mockStoreStock);

            await InventoryController.store(req as AuthenticatedRequest, res as Response);

            expect(mockUserRepository.getUserAccess).toHaveBeenCalledWith(1);
            expect(mockInventoryService.getStoreStock).toHaveBeenCalledWith(2);
            expect(res.json).toHaveBeenCalledWith(mockStoreStock);
        });

        test('should return 401 when user does not have access to store', async () => {
            const storeId = 3;
            const mockUserAccessData = [
                { id: 1, name: 'Store 1' },
                { id: 2, name: 'Store 2' },
            ];

            req.params = { storeId: storeId.toString() };
            req.user = {
                id: 1,
                username: 'staff_user',
                password: 'password123',
                role: UserRole.STAFF,
            };

            mockUserRepository.getUserAccess.mockResolvedValue(mockUserAccessData);

            await InventoryController.store(req as AuthenticatedRequest, res as Response);

            expect(mockUserRepository.getUserAccess).toHaveBeenCalledWith(1);
            expect(mockInventoryService.getStoreStock).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'Acces Unauthorized' });
        });

        test('should return 403 when no user is provided', async () => {
            req.params = { storeId: '1' };
            req.user = undefined;

            await InventoryController.store(req as AuthenticatedRequest, res as Response);

            expect(mockUserRepository.getUserAccess).not.toHaveBeenCalled();
            expect(mockInventoryService.getStoreStock).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
        });

        test('should handle numeric store ID conversion', async () => {
            const storeId = '42';
            const mockStoreStock = [{ productId: 1, quantity: 30 }];
            const mockUserAccessData = [{ id: 42, name: 'Store 42' }];

            req.params = { storeId };
            req.user = {
                id: 1,
                username: 'staff_user',
                password: 'password123',
                role: UserRole.STAFF,
            };

            mockUserRepository.getUserAccess.mockResolvedValue(mockUserAccessData);
            mockInventoryService.getStoreStock.mockResolvedValue(mockStoreStock);

            await InventoryController.store(req as AuthenticatedRequest, res as Response);

            expect(mockUserRepository.getUserAccess).toHaveBeenCalledWith(1);
            expect(mockInventoryService.getStoreStock).toHaveBeenCalledWith(42);
            expect(res.json).toHaveBeenCalledWith(mockStoreStock);
        });

        test('should handle empty user access list', async () => {
            const storeId = 1;
            const mockUserAccessData: any[] = [];

            req.params = { storeId: storeId.toString() };
            req.user = {
                id: 1,
                username: 'staff_user',
                password: 'password123',
                role: UserRole.STAFF,
            };

            mockUserRepository.getUserAccess.mockResolvedValue(mockUserAccessData);

            await InventoryController.store(req as AuthenticatedRequest, res as Response);

            expect(mockUserRepository.getUserAccess).toHaveBeenCalledWith(1);
            expect(mockInventoryService.getStoreStock).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'Acces Unauthorized' });
        });
    });
});
