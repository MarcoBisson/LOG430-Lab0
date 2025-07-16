import type { Response, NextFunction } from 'express';
import { authenticateJWT } from '../../../src/backend/interfaces/middlewares/authentificateJWT';
import type { AuthenticatedRequest } from '../../../src/backend/interfaces/middlewares/authentificateJWT';
import { AuthService } from '../../../services/user-service/src/services/AuthService';

jest.mock('../../../src/backend/application/services/AuthService');

describe('authenticateJWT middleware', () => {
    let mockRequest: Partial<AuthenticatedRequest>;
    let mockResponse: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
        mockRequest = {
            headers: {},
        };

        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        mockNext = jest.fn();

        jest.clearAllMocks();
    });

    it('should authenticate successfully with valid Bearer token', () => {
        const mockUser = { id: 1, username: 'testuser', role: 'ADMIN' };
        mockRequest.headers = {
            authorization: 'Bearer valid-jwt-token',
        };

        (AuthService.verifyToken as jest.Mock).mockReturnValue(mockUser);

        authenticateJWT(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

        expect(AuthService.verifyToken).toHaveBeenCalledWith('valid-jwt-token');
        expect(mockRequest.user).toEqual(mockUser);
        expect(mockNext).toHaveBeenCalled();
        expect(mockResponse.status).not.toHaveBeenCalled();
        expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should return 401 when no authorization header is provided', () => {
        mockRequest.headers = {};

        authenticateJWT(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Token required' });
        expect(mockNext).not.toHaveBeenCalled();
        expect(AuthService.verifyToken).not.toHaveBeenCalled();
    });

    it('should return 401 when authorization header does not start with Bearer', () => {
        mockRequest.headers = {
            authorization: 'Basic invalid-auth',
        };

        authenticateJWT(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Token required' });
        expect(mockNext).not.toHaveBeenCalled();
        expect(AuthService.verifyToken).not.toHaveBeenCalled();
    });

    it('should return 401 when authorization header is just "Bearer" without token', () => {
        mockRequest.headers = {
            authorization: 'Bearer',
        };

        authenticateJWT(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Token required' });
        expect(mockNext).not.toHaveBeenCalled();
        expect(AuthService.verifyToken).not.toHaveBeenCalled();
    });

    it('should return 403 when token verification fails', () => {
        mockRequest.headers = {
            authorization: 'Bearer invalid-token',
        };

        (AuthService.verifyToken as jest.Mock).mockImplementation(() => {
            throw new Error('Invalid token');
        });

        authenticateJWT(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

        expect(AuthService.verifyToken).toHaveBeenCalledWith('invalid-token');
        expect(mockResponse.status).toHaveBeenCalledWith(403);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Invalid token' });
        expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 403 when decoded user is null/undefined', () => {
        mockRequest.headers = {
            authorization: 'Bearer token-with-no-user',
        };

        (AuthService.verifyToken as jest.Mock).mockReturnValue(null);

        authenticateJWT(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

        expect(AuthService.verifyToken).toHaveBeenCalledWith('token-with-no-user');
        expect(mockResponse.status).toHaveBeenCalledWith(403);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Invalid token' });
        expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle empty Bearer token', () => {
        mockRequest.headers = {
            authorization: 'Bearer ',
        };

        (AuthService.verifyToken as jest.Mock).mockImplementation(() => {
            throw new Error('Invalid token');
        });

        authenticateJWT(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

        expect(AuthService.verifyToken).toHaveBeenCalledWith('');
        expect(mockResponse.status).toHaveBeenCalledWith(403);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Invalid token' });
        expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle malformed authorization header', () => {
        mockRequest.headers = {
            authorization: 'Bearer token1 token2 extra',
        };

        const mockUser = { id: 1, username: 'testuser', role: 'ADMIN' };
        (AuthService.verifyToken as jest.Mock).mockReturnValue(mockUser);

        authenticateJWT(mockRequest as AuthenticatedRequest, mockResponse as Response, mockNext);

        expect(AuthService.verifyToken).toHaveBeenCalledWith('token1');
        expect(mockRequest.user).toEqual(mockUser);
        expect(mockNext).toHaveBeenCalled();
    });
});
