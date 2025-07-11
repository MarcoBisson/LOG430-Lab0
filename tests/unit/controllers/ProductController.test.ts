import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../../src/backend/interfaces/middlewares/authentificateJWT';

const mockProductService = {
    listProducts: jest.fn(),
    getProductById: jest.fn(),
    getProductsByName: jest.fn(),
    getProductsByCategory: jest.fn(),
    createProduct: jest.fn(),
    updateProduct: jest.fn(),
    deleteProduct: jest.fn(),
    getProductsByStore: jest.fn(),
};

const mockUserRepository = {
    getUserAccess: jest.fn(),
};

const mockProductRepository = {};

jest.mock('../../../src/backend/application/services/ProductService', () => ({
    ProductService: jest.fn().mockImplementation(() => mockProductService),
}));

jest.mock('../../../src/backend/infrastructure/prisma/PrismaProductRepository', () => ({
    PrismaProductRepository: jest.fn().mockImplementation(() => mockProductRepository),
}));

jest.mock('../../../src/backend/infrastructure/prisma/PrismaUserRepository', () => ({
    PrismaUserRepository: jest.fn().mockImplementation(() => mockUserRepository),
}));

import { ProductController } from '../../../src/backend/interfaces/controllers/ProductController';

describe('ProductController', () => {
    let mockRequest: Partial<AuthenticatedRequest>;
    let mockResponse: Partial<Response>;

    beforeEach(() => {
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            end: jest.fn(),
        };
        
        jest.clearAllMocks();
    });

    test('should list all products successfully', async () => {
        const mockProducts = [
            { id: 1, name: 'Product 1', price: 19.99 },
            { id: 2, name: 'Product 2', price: 29.99 },
        ];

        mockRequest = {};
        mockProductService.listProducts.mockResolvedValue(mockProducts);

        await ProductController.list(mockRequest as AuthenticatedRequest, mockResponse as Response);

        expect(mockProductService.listProducts).toHaveBeenCalled();
        expect(mockResponse.json).toHaveBeenCalledWith(mockProducts);
    });

    test('should get product by id successfully', async () => {
        const mockProduct = { id: 1, name: 'Product 1', price: 19.99 };

        mockRequest = {
            params: { id: '1' },
        };

        mockProductService.getProductById.mockResolvedValue(mockProduct);

        await ProductController.get(mockRequest as AuthenticatedRequest, mockResponse as Response);

        expect(mockProductService.getProductById).toHaveBeenCalledWith(1);
        expect(mockResponse.json).toHaveBeenCalledWith(mockProduct);
    });

    test('should return 404 when product not found by id', async () => {
        mockRequest = {
            params: { id: '999' },
        };

        mockProductService.getProductById.mockResolvedValue(null);

        await ProductController.get(mockRequest as AuthenticatedRequest, mockResponse as Response);

        expect(mockProductService.getProductById).toHaveBeenCalledWith(999);
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Not found' });
    });

    test('should get products by name successfully', async () => {
        const mockProducts = [{ id: 1, name: 'iPhone', price: 999.99 }];

        mockRequest = {
            params: { name: 'iPhone' },
        };

        mockProductService.getProductsByName.mockResolvedValue(mockProducts);

        await ProductController.getByName(mockRequest as AuthenticatedRequest, mockResponse as Response);

        expect(mockProductService.getProductsByName).toHaveBeenCalledWith('iPhone');
        expect(mockResponse.json).toHaveBeenCalledWith(mockProducts);
    });

    test('should return 404 when no products found by name', async () => {
        mockRequest = {
            params: { name: 'NonExistent' },
        };

        mockProductService.getProductsByName.mockResolvedValue(null);

        await ProductController.getByName(mockRequest as AuthenticatedRequest, mockResponse as Response);

        expect(mockProductService.getProductsByName).toHaveBeenCalledWith('NonExistent');
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Not found' });
    });

    test('should get products by category successfully', async () => {
        const mockProducts = [
            { id: 1, name: 'Laptop', price: 1299.99, category: 'ELECTRONICS' },
            { id: 2, name: 'Phone', price: 699.99, category: 'ELECTRONICS' },
        ];

        mockRequest = {
            params: { category: 'ELECTRONICS' },
        };

        mockProductService.getProductsByCategory.mockResolvedValue(mockProducts);

        await ProductController.getByCategory(mockRequest as AuthenticatedRequest, mockResponse as Response);

        expect(mockProductService.getProductsByCategory).toHaveBeenCalledWith('ELECTRONICS');
        expect(mockResponse.json).toHaveBeenCalledWith(mockProducts);
    });

    test('should create product when user is authorized', async () => {
        const mockProduct = { id: 1, name: 'New Product', price: 49.99 };

        mockRequest = {
            params: { id: '1' },
            body: { name: 'New Product', price: 49.99 },
            user: { id: 1, username: 'admin', password: 'hashed', role: 'ADMIN' },
        };

        mockProductService.createProduct.mockResolvedValue(mockProduct);

        await ProductController.create(mockRequest as AuthenticatedRequest, mockResponse as Response);

        expect(mockProductService.createProduct).toHaveBeenCalledWith(1, { name: 'New Product', price: 49.99 });
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith(mockProduct);
    });

    test('should return 401 when client tries to create product', async () => {
        mockRequest = {
            params: { id: '1' },
            body: { name: 'New Product', price: 49.99 },
            user: { id: 1, username: 'client', password: 'hashed', role: 'CLIENT' },
        };

        await ProductController.create(mockRequest as AuthenticatedRequest, mockResponse as Response);

        expect(mockProductService.createProduct).not.toHaveBeenCalled();
        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Action Unauthorized' });
    });

    test('should update product when user is authorized', async () => {
        const mockProduct = { id: 1, name: 'Updated Product', price: 59.99 };

        mockRequest = {
            params: { productId: '1', storeId: '1' },
            body: { name: 'Updated Product', price: 59.99 },
            user: { id: 1, username: 'staff', password: 'hashed', role: 'STAFF' },
        };

        mockProductService.updateProduct.mockResolvedValue(mockProduct);

        await ProductController.update(mockRequest as AuthenticatedRequest, mockResponse as Response);

        expect(mockProductService.updateProduct).toHaveBeenCalledWith(1, 1, { name: 'Updated Product', price: 59.99 });
        expect(mockResponse.json).toHaveBeenCalledWith(mockProduct);
    });

    test('should return 401 when client tries to update product', async () => {
        mockRequest = {
            params: { productId: '1', storeId: '1' },
            body: { name: 'Updated Product', price: 59.99 },
            user: { id: 1, username: 'client', password: 'hashed', role: 'CLIENT' },
        };

        await ProductController.update(mockRequest as AuthenticatedRequest, mockResponse as Response);

        expect(mockProductService.updateProduct).not.toHaveBeenCalled();
        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Action Unauthorized' });
    });

    test('should delete product when user is authorized', async () => {
        mockRequest = {
            params: { id: '1' },
            user: { id: 1, username: 'admin', password: 'hashed', role: 'ADMIN' },
        };

        mockProductService.deleteProduct.mockResolvedValue(undefined);

        await ProductController.delete(mockRequest as AuthenticatedRequest, mockResponse as Response);

        expect(mockProductService.deleteProduct).toHaveBeenCalledWith(1);
        expect(mockResponse.status).toHaveBeenCalledWith(204);
        expect(mockResponse.end).toHaveBeenCalled();
    });

    test('should return 401 when client tries to delete product', async () => {
        mockRequest = {
            params: { id: '1' },
            user: { id: 1, username: 'client', password: 'hashed', role: 'CLIENT' },
        };

        await ProductController.delete(mockRequest as AuthenticatedRequest, mockResponse as Response);

        expect(mockProductService.deleteProduct).not.toHaveBeenCalled();
        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Action Unauthorized' });
    });

    test('should get products by store when user has access', async () => {
        const mockProducts = [
            { id: 1, name: 'Store Product 1', price: 19.99, stock: 10 },
            { id: 2, name: 'Store Product 2', price: 29.99, stock: 5 },
        ];

        const mockUserAccess = [
            { id: 1, name: 'Store 1' },
            { id: 2, name: 'Store 2' },
        ];

        mockRequest = {
            params: { id: '1' },
            user: { id: 1, username: 'staff', password: 'hashed', role: 'STAFF' },
        };

        mockUserRepository.getUserAccess.mockResolvedValue(mockUserAccess);
        mockProductService.getProductsByStore.mockResolvedValue(mockProducts);

        await ProductController.getByStore(mockRequest as AuthenticatedRequest, mockResponse as Response);

        expect(mockUserRepository.getUserAccess).toHaveBeenCalledWith(1);
        expect(mockProductService.getProductsByStore).toHaveBeenCalledWith(1);
        expect(mockResponse.json).toHaveBeenCalledWith(mockProducts);
    });

    test('should return 401 when user does not have store access', async () => {
        const mockUserAccess = [
            { id: 2, name: 'Store 2' },
            { id: 3, name: 'Store 3' },
        ];

        mockRequest = {
            params: { id: '1' },
            user: { id: 1, username: 'staff', password: 'hashed', role: 'STAFF' },
        };

        mockUserRepository.getUserAccess.mockResolvedValue(mockUserAccess);

        await ProductController.getByStore(mockRequest as AuthenticatedRequest, mockResponse as Response);

        expect(mockUserRepository.getUserAccess).toHaveBeenCalledWith(1);
        expect(mockProductService.getProductsByStore).not.toHaveBeenCalled();
        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Acces Unauthorized' });
    });

    test('should return 403 when user is not authenticated', async () => {
        mockRequest = {
            params: { id: '1' },
            user: undefined,
        };

        await ProductController.getByStore(mockRequest as AuthenticatedRequest, mockResponse as Response);

        expect(mockUserRepository.getUserAccess).not.toHaveBeenCalled();
        expect(mockProductService.getProductsByStore).not.toHaveBeenCalled();
        expect(mockResponse.status).toHaveBeenCalledWith(403);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Invalid token' });
    });

    test('should return 404 when no products found by store', async () => {
        const mockUserAccess = [
            { id: 1, name: 'Store 1' },
        ];

        mockRequest = {
            params: { id: '1' },
            user: { id: 1, username: 'staff', password: 'hashed', role: 'STAFF' },
        };

        mockUserRepository.getUserAccess.mockResolvedValue(mockUserAccess);
        mockProductService.getProductsByStore.mockResolvedValue(null);

        await ProductController.getByStore(mockRequest as AuthenticatedRequest, mockResponse as Response);

        expect(mockUserRepository.getUserAccess).toHaveBeenCalledWith(1);
        expect(mockProductService.getProductsByStore).toHaveBeenCalledWith(1);
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Not found' });
    });
});
