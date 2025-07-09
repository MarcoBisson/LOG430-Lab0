import type { Store } from '@prisma/client';
import type { User } from '../entities/User';

export interface IUserRepository {
    getUser(username:string): Promise<User| null>;

    getUserAccess(userId: number): Promise<Store[]>;
}