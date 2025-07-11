import { AuthService } from '../../../src/backend/application/services/AuthService';

jest.mock('jsonwebtoken', () => ({
    sign: jest.fn(),
    verify: jest.fn(),
    TokenExpiredError: Error,
    JsonWebTokenError: Error,
}));

jest.mock('bcryptjs', () => ({
    hash: jest.fn(),
    compare: jest.fn(),
}));

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

describe('AuthService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.JWT_SECRET = 'test-secret-key';
    });

    describe('generateToken', () => {
        it('should generate a JWT token with correct payload', () => {
            const payload = { id: 1, role: 'ADMIN' };
            const expectedToken = 'mocked-jwt-token';
            
            jwt.sign.mockReturnValue(expectedToken);

            const result = AuthService.generateToken(payload);

            expect(jwt.sign).toHaveBeenCalledWith(
                payload,
                'your_secret_key',
                { expiresIn: '1h' },
            );
            expect(result).toBe(expectedToken);
        });

        it('should use default secret when JWT_SECRET is not set', () => {
            delete process.env.JWT_SECRET;
            const payload = { id: 1, role: 'USER' };
            
            AuthService.generateToken(payload);

            expect(jwt.sign).toHaveBeenCalledWith(
                payload,
                'your_secret_key',
                { expiresIn: '1h' },
            );
        });

        it('should handle empty payload', () => {
            const payload = {};
            const expectedToken = 'empty-payload-token';
            
            jwt.sign.mockReturnValue(expectedToken);

            const result = AuthService.generateToken(payload);

            expect(result).toBe(expectedToken);
            expect(jwt.sign).toHaveBeenCalledWith(
                payload,
                'your_secret_key',
                { expiresIn: '1h' },
            );
        });

        it('should handle complex payload objects', () => {
            const payload = {
                id: 123,
                role: 'MANAGER',
                permissions: ['read', 'write'],
                metadata: { lastLogin: new Date().toISOString() },
            };
            
            AuthService.generateToken(payload);

            expect(jwt.sign).toHaveBeenCalledWith(
                payload,
                'your_secret_key',
                { expiresIn: '1h' },
            );
        });
    });

    describe('verifyToken', () => {
        it('should verify a valid token', () => {
            const token = 'valid.jwt.token';
            const expectedPayload = { id: 1, role: 'ADMIN' };
            
            jwt.verify.mockReturnValue(expectedPayload);

            const result = AuthService.verifyToken(token);

            expect(jwt.verify).toHaveBeenCalledWith(token, 'your_secret_key');
            expect(result).toBe(expectedPayload);
        });

        it('should throw error for invalid token', () => {
            const token = 'invalid.jwt.token';
            const error = new Error('Invalid token');
            
            jwt.verify.mockImplementation(() => {
                throw error;
            });

            expect(() => AuthService.verifyToken(token)).toThrow('Invalid token');
        });

        it('should handle expired tokens', () => {
            const token = 'expired.jwt.token';
            const error = new Error('Token expired');
            
            jwt.verify.mockImplementation(() => {
                throw error;
            });

            expect(() => AuthService.verifyToken(token)).toThrow(error);
        });

        it('should handle malformed tokens', () => {
            const token = 'malformed-token';
            const error = new Error('Malformed token');
            
            jwt.verify.mockImplementation(() => {
                throw error;
            });

            expect(() => AuthService.verifyToken(token)).toThrow(error);
        });
    });

    describe('hashPassword', () => {
        it('should hash password with default salt rounds', async () => {
            const password = 'mySecretPassword';
            const hashedPassword = '$2b$10$hashedPasswordString';
            
            bcrypt.hash.mockResolvedValue(hashedPassword);

            const result = await AuthService.hashPassword(password);

            expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
            expect(result).toBe(hashedPassword);
        });

        it('should handle empty password', async () => {
            const password = '';
            const hashedPassword = '$2b$10$emptyPasswordHash';
            
            bcrypt.hash.mockResolvedValue(hashedPassword);

            const result = await AuthService.hashPassword(password);

            expect(result).toBe(hashedPassword);
        });

        it('should handle special characters in password', async () => {
            const password = 'P@ssw0rd!#$%^&*()';
            const hashedPassword = '$2b$10$specialCharsHash';
            
            bcrypt.hash.mockResolvedValue(hashedPassword);

            const result = await AuthService.hashPassword(password);

            expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
            expect(result).toBe(hashedPassword);
        });

        it('should handle very long passwords', async () => {
            const password = 'a'.repeat(1000);
            const hashedPassword = '$2b$10$longPasswordHash';
            
            bcrypt.hash.mockResolvedValue(hashedPassword);

            const result = await AuthService.hashPassword(password);

            expect(result).toBe(hashedPassword);
        });

        it('should handle hashing errors', async () => {
            const password = 'testPassword';
            const error = new Error('Hashing failed');
            
            bcrypt.hash.mockRejectedValue(error);

            await expect(AuthService.hashPassword(password)).rejects.toThrow('Hashing failed');
        });
    });

    describe('comparePassword', () => {
        it('should return true for matching passwords', async () => {
            const password = 'myPassword';
            const hashedPassword = '$2b$10$hashedPassword';
            
            bcrypt.compare.mockResolvedValue(true);

            const result = await AuthService.comparePassword(password, hashedPassword);

            expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
            expect(result).toBe(true);
        });

        it('should return false for non-matching passwords', async () => {
            const password = 'wrongPassword';
            const hashedPassword = '$2b$10$hashedPassword';
            
            bcrypt.compare.mockResolvedValue(false);

            const result = await AuthService.comparePassword(password, hashedPassword);

            expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
            expect(result).toBe(false);
        });

        it('should handle empty password comparison', async () => {
            const password = '';
            const hashedPassword = '$2b$10$hashedPassword';
            
            bcrypt.compare.mockResolvedValue(false);

            const result = await AuthService.comparePassword(password, hashedPassword);

            expect(result).toBe(false);
        });

        it('should handle malformed hash', async () => {
            const password = 'password';
            const malformedHash = 'not-a-valid-hash';
            const error = new Error('Invalid hash');
            
            bcrypt.compare.mockRejectedValue(error);

            await expect(AuthService.comparePassword(password, malformedHash))
                .rejects.toThrow('Invalid hash');
        });

        it('should handle comparison with null/undefined hash', async () => {
            const password = 'password';
            const nullHash = null as any;
            const error = new Error('Hash required');
            
            bcrypt.compare.mockRejectedValue(error);

            await expect(AuthService.comparePassword(password, nullHash))
                .rejects.toThrow('Hash required');
        });
    });

    describe('integration scenarios', () => {
        it('should complete hash and compare cycle', async () => {
            const originalPassword = 'testPassword123';
            const hashedPassword = '$2b$10$actualHashedPassword';
            
            bcrypt.hash.mockResolvedValue(hashedPassword);
            
            const hash = await AuthService.hashPassword(originalPassword);
            expect(hash).toBe(hashedPassword);
            
            bcrypt.compare.mockResolvedValue(true);
            
            const isValid = await AuthService.comparePassword(originalPassword, hash);
            expect(isValid).toBe(true);
            
            bcrypt.compare.mockResolvedValue(false);
            
            const isInvalid = await AuthService.comparePassword('wrongPassword', hash);
            expect(isInvalid).toBe(false);
        });

        it('should complete token generation and verification cycle', () => {
            const payload = { id: 1, role: 'ADMIN' };
            const token = 'valid.jwt.token';
            
            jwt.sign.mockReturnValue(token);
            
            const generatedToken = AuthService.generateToken(payload);
            expect(generatedToken).toBe(token);
            
            jwt.verify.mockReturnValue(payload);
            
            const verifiedPayload = AuthService.verifyToken(generatedToken);
            expect(verifiedPayload).toBe(payload);
        });
    });

    describe('security considerations', () => {
        it('should use consistent salt rounds for password hashing', async () => {
            const passwords = ['password1', 'password2', 'password3'];
            
            bcrypt.hash.mockResolvedValue('hashedPassword');
            
            for (const password of passwords) {
                await AuthService.hashPassword(password);
                expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
            }
        });

        it('should use consistent secret for token operations', () => {
            const payload1 = { id: 1, role: 'USER' };
            const payload2 = { id: 2, role: 'ADMIN' };
            const token = 'token';
            
            jwt.sign.mockReturnValue(token);
            jwt.verify.mockReturnValue(payload1);
            
            AuthService.generateToken(payload1);
            AuthService.generateToken(payload2);
            AuthService.verifyToken(token);
            
            expect(jwt.sign).toHaveBeenCalledWith(payload1, 'your_secret_key', { expiresIn: '1h' });
            expect(jwt.sign).toHaveBeenCalledWith(payload2, 'your_secret_key', { expiresIn: '1h' });
            expect(jwt.verify).toHaveBeenCalledWith(token, 'your_secret_key');
        });
    });
});
