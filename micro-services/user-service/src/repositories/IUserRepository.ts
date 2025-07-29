import type { User } from '../entities/User';
import type { Store } from '../entities/Store';

export interface CreateUserData {
  username: string;
  email: string;
  password: string;
  role: string;
  storeId?: number | null;
}

export interface UpdateUserData {
  username?: string;
  email?: string;
  password?: string;
  role?: string;
  storeId?: number | null;
}

export interface IUserRepository {
    getUser(username: string): Promise<User | null>;
    getUserById(id: number): Promise<User | null>;
    getAllUsers(): Promise<User[]>;
    createUser(data: CreateUserData): Promise<User>;
    updateUser(id: number, data: UpdateUserData): Promise<User | null>;
    deleteUser(id: number): Promise<User | null>;
    getUserAccess(userId: number): Promise<Store[]>;
    
    // Méthodes pour gérer les accès du staff
    addStoreAccessToStaff(userId: number, storeId: number): Promise<boolean>;
    removeStoreAccessFromStaff(userId: number, storeId: number): Promise<boolean>;
    setStoreAccessForStaff(userId: number, storeIds: number[]): Promise<boolean>;
}
