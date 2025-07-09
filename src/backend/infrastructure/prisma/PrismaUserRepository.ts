import type { Store } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import type { IUserRepository } from '../../domain/repositories/IUserRepository';
import type { User } from '../../domain/entities/User';

const prisma = new PrismaClient();

export class PrismaUserRepository implements IUserRepository {
    async getUser(username: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: {
                username,
            },
            include: {
                access: true,
            },
        });
    };

    async getUserAccess(userId: number): Promise<Store[]> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { access: true },
        });

        return user?.access ?? [];
    }
}