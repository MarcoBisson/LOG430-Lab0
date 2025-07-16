const mockPrismaClient = {
    user: {
        findUnique: jest.fn(),
    },
};

jest.mock('@prisma/client', () => ({
    PrismaClient: jest.fn(() => mockPrismaClient),
    StoreType: { LOGISTICS: 'LOGISTICS', SALES: 'SALES', HEADQUARTERS: 'HEADQUARTERS' },
    ReplenishmentRequestStatus: { PENDING: 'PENDING', APPROVED: 'APPROVED', REJECTED: 'REJECTED' },
}));

// Mock the PrismaClient instance used in the repository
jest.mock('../../../src/backend/infrastructure/prisma/PrismaClient', () => ({
    prisma: mockPrismaClient,
}));

import { PrismaUserRepository } from '../../../src/backend/infrastructure/prisma/PrismaUserRepository';

describe('PrismaUserRepository', () => {
    let repository: PrismaUserRepository;

    beforeEach(() => {
        repository = new PrismaUserRepository();
        jest.clearAllMocks();
    });

    test('should get user by username', async () => {
        const mockUser = {
            id: 1,
            username: 'testuser',
            password: 'hashedpass',
            role: 'ADMIN',
            access: [{ id: 1, name: 'Store 1' }],
        };

        mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);

        const result = await repository.getUser('testuser');

        expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
            where: { username: 'testuser' },
            include: { access: true },
        });
        expect(result).toEqual(mockUser);
    });

    test('should return null when user not found', async () => {
        mockPrismaClient.user.findUnique.mockResolvedValue(null);

        const result = await repository.getUser('nonexistent');

        expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
            where: { username: 'nonexistent' },
            include: { access: true },
        });
        expect(result).toBeNull();
    });

    test('should get user access by userId', async () => {
        const mockUser = {
            access: [
                { id: 1, name: 'Store 1', type: 'PHYSICAL' },
                { id: 2, name: 'Store 2', type: 'ONLINE' },
            ],
        };

        mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);

        const result = await repository.getUserAccess(1);

        expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
            where: { id: 1 },
            select: { access: true },
        });
        expect(result).toEqual(mockUser.access);
    });

    test('should return empty array when user has no access', async () => {
        mockPrismaClient.user.findUnique.mockResolvedValue(null);

        const result = await repository.getUserAccess(999);

        expect(result).toEqual([]);
    });
});
