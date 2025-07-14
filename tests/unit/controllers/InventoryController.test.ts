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
            const mockCentralStock = { products: [
                { productId: 1, stock: 100, name: 'Produit 1' },
                { productId: 2, stock: 50, name: 'Produit 2' },
            ], total: 2 };
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
            const mockCentralStock = { products: [
                { productId: 1, stock: 100, name: 'Produit 1' },
                { productId: 2, stock: 50, name: 'Produit 2' },
            ], total: 2 };
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
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                status: 401,
                error: 'Unauthorized',
                message: 'Acces Unauthorized',
                path: undefined,
            }));
        });

        test('should return 401 when no user is provided', async () => {
            req.user = undefined;

            await InventoryController.central(req as AuthenticatedRequest, res as Response);

            expect(mockInventoryService.getCentralStock).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                status: 401,
                error: 'Unauthorized',
                message: 'Acces Unauthorized',
                path: undefined,
            }));
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
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                status: 401,
                error: 'Unauthorized',
                message: 'Acces Unauthorized',
                path: undefined,
            }));
        });

        test('should return 403 when no user is provided', async () => {
            req.params = { storeId: '1' };
            req.user = undefined;

            await InventoryController.store(req as AuthenticatedRequest, res as Response);

            expect(mockUserRepository.getUserAccess).not.toHaveBeenCalled();
            expect(mockInventoryService.getStoreStock).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                status: 403,
                error: 'Forbidden',
                message: 'Invalid token',
                path: undefined,
            }));
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
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                status: 401,
                error: 'Unauthorized',
                message: 'Acces Unauthorized',
                path: undefined,
            }));
        });
    });
    test('should return 401 if user has no access to store', async () => {
        const req: any = {
            params: { storeId: '1' },
            user: { id: 1 },
        };
        const res: any = { json: jest.fn(), status: jest.fn().mockReturnThis() };
        mockUserRepository.getUserAccess.mockResolvedValue([]);
        (InventoryController as any).userRepository = mockUserRepository;
        await InventoryController.store(req, res);
        expect(res.status).toHaveBeenCalledWith(401);
    });

    test('should return 403 if no user', async () => {
        const req: any = { params: { storeId: '1' }, user: undefined };
        const res: any = { json: jest.fn(), status: jest.fn().mockReturnThis() };
        await InventoryController.store(req, res);
        expect(res.status).toHaveBeenCalledWith(403);
    });

    test('should return result with page and limit if provided', async () => {
        const mockCentralStock = { products: [
            { productId: 1, stock: 100, name: 'Produit 1' },
            { productId: 2, stock: 50, name: 'Produit 2' },
        ], total: 2 };
        mockInventoryService.getCentralStock.mockResolvedValue(mockCentralStock);

        req.query = {
            page: '1',
            limit: '10',
        };
        req.user = {
            id: 1,
            username: 'staff_user',
            password: 'password123',
            role: UserRole.STAFF,
        };

        await InventoryController.central(req as AuthenticatedRequest, res as Response);

        expect(mockInventoryService.getCentralStock).toHaveBeenCalledWith(1, 10);
        expect(res.json).toHaveBeenCalledWith(mockCentralStock);
    });


});
