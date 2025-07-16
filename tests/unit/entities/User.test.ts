import { User } from '../../../services/user-service/src/entities/User';
import { Store } from '../../../src/backend/domain/entities/Store';
import type { StoreType } from '@prisma/client';

describe('User', () => {
    describe('constructor', () => {
        it('should create User with valid parameters', () => {
            const stores = [new Store(1, 'Store 1', '123 Main St', 'SALES' as StoreType)];
            const user = new User(1, 'MANAGER', 'john_doe', 'password123', stores);
            
            expect(user.id).toBe(1);
            expect(user.role).toBe('MANAGER');
            expect(user.username).toBe('john_doe');
            expect(user.password).toBe('password123');
            expect(user.access).toEqual(stores);
            expect(user.access).toHaveLength(1);
        });

        it('should create User with empty access list', () => {
            const user = new User(2, 'CLIENT', 'jane_doe', 'secret', []);
            
            expect(user.id).toBe(2);
            expect(user.role).toBe('CLIENT');
            expect(user.username).toBe('jane_doe');
            expect(user.password).toBe('secret');
            expect(user.access).toEqual([]);
            expect(user.access).toHaveLength(0);
        });

        it('should create User with multiple stores access', () => {
            const stores = [
                new Store(1, 'Store 1', '123 Main St', 'SALES' as StoreType),
                new Store(2, 'Warehouse', '456 Storage Ave', 'LOGISTICS' as StoreType),
                new Store(3, 'HQ', '789 Corporate Blvd', 'HEADQUARTERS' as StoreType),
            ];
            const user = new User(3, 'ADMIN', 'admin_user', 'admin_pass', stores);
            
            expect(user.id).toBe(3);
            expect(user.role).toBe('ADMIN');
            expect(user.username).toBe('admin_user');
            expect(user.password).toBe('admin_pass');
            expect(user.access).toEqual(stores);
            expect(user.access).toHaveLength(3);
        });

        it('should create User with special characters in username and password', () => {
            const user = new User(4, 'USER', 'user@domain.com', 'P@ssw0rd!', []);
            
            expect(user.id).toBe(4);
            expect(user.role).toBe('USER');
            expect(user.username).toBe('user@domain.com');
            expect(user.password).toBe('P@ssw0rd!');
            expect(user.access).toEqual([]);
        });
    });
});
