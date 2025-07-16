import type { Request, Response } from 'express';

// Mock all dependencies before imports
const mockAuthService = {
    comparePassword: jest.fn(),
    generateToken: jest.fn(),
};

const mockUserRepository = {
    getUser: jest.fn(),
};

const mockErrorResponse = jest.fn();
const mockLogger = {
    warn: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
};
jest.mock('../../../src/backend/utils/errorResponse', () => ({
    errorResponse: mockErrorResponse,
}));

jest.mock('../../../src/backend/utils/logger', () => ({
    createControllerLogger: jest.fn(() => mockLogger),
}));

// Mock any Redis cache service to avoid connections
jest.mock('../../../src/backend/application/services/RedisCacheService', () => ({
    redisCacheService: {
        isHealthy: jest.fn(() => true),
        get: jest.fn(),
        set: jest.fn(),
        smartInvalidation: jest.fn(),
    },
}));
jest.mock('../../../src/backend/application/services/AuthService', () => ({
    AuthService: mockAuthService,
}));

jest.mock('../../../src/backend/infrastructure/prisma/PrismaUserRepository', () => ({
    PrismaUserRepository: jest.fn().mockImplementation(() => mockUserRepository),
}));

import { AuthController } from '../../../src/backend/interfaces/controllers/AuthController';

describe('AuthController login', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;

    beforeEach(() => {
        mockRequest = { 
            body: {},
            originalUrl: '/api/auth/login' 
        };
        mockResponse = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
        };
        jest.clearAllMocks();
    });

    test('should login with valid credentials', async () => {
        const mockUser = { id: 1, username: 'test', password: 'hash', role: 'ADMIN' };
        const mockToken = 'token123';
        
        mockRequest.body = { username: 'test', password: 'pass' };
        mockUserRepository.getUser.mockResolvedValue(mockUser);
        mockAuthService.comparePassword.mockResolvedValue(true);
        mockAuthService.generateToken.mockReturnValue(mockToken);

        await AuthController.login(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.json).toHaveBeenCalledWith({
            user: { id: 1, role: 'ADMIN' },
            token: mockToken,
        });
    });

    test('should reject invalid credentials', async () => {
        mockRequest.body = { username: 'test', password: 'wrong' };
        mockUserRepository.getUser.mockResolvedValue(null);

        await AuthController.login(mockRequest as Request, mockResponse as Response);

        expect(mockErrorResponse).toHaveBeenCalledWith(
            mockResponse,
            401,
            'Unauthorized',
            'Invalid credentials',
            '/api/auth/login'
        );
    });
});
