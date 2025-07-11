import type { Request, Response } from 'express';

const mockAuthService = {
    comparePassword: jest.fn(),
    generateToken: jest.fn(),
};

const mockUserRepository = {
    getUser: jest.fn(),
};

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
        mockRequest = { body: {} };
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

        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
    });
});
