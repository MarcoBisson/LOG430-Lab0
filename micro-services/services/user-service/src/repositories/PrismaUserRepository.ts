import type { Store } from '../entities/Store';
import { PrismaClient } from '@prisma/client';
import type { IUserRepository, CreateUserData, UpdateUserData } from './IUserRepository';
import type { User } from '../entities/User';

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
    }

    async getUserById(id: number): Promise<User | null> {
        return prisma.user.findUnique({
            where: { id },
            include: {
                access: true,
            },
        });
    }

    async getAllUsers(): Promise<User[]> {
        return prisma.user.findMany({
            include: {
                access: true,
            },
        });
    }

    async createUser(data: CreateUserData): Promise<User> {
        // Créer l'utilisateur d'abord
        const user = await prisma.user.create({
            data: {
                username: data.username,
                email: data.email,
                password: data.password,
                role: data.role as any,
                storeId: data.storeId,
            },
            include: {
                access: true,
            },
        });

        // Ensuite, définir les accès selon le rôle
        await this.updateUserAccess(user.id, data.role);

        // Retourner l'utilisateur avec ses accès mis à jour
        return await prisma.user.findUnique({
            where: { id: user.id },
            include: {
                access: true,
            },
        }) as User;
    }

    // Méthode privée pour mettre à jour les accès selon le rôle
    private async updateUserAccess(userId: number, role: string): Promise<void> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { storeId: true }
        });

        if (!user) return;

        // D'abord, supprimer tous les accès existants
        await prisma.user.update({
            where: { id: userId },
            data: {
                access: {
                    set: []
                }
            }
        });

        let storesToConnect: { id: number }[] = [];

        switch (role) {
            case 'ADMIN':
                // L'admin a accès à tous les magasins
                const allStores = await prisma.store.findMany({ select: { id: true } });
                storesToConnect = allStores;
                break;

            case 'CLIENT':
                // Le client a accès à tous les magasins de type SALES
                const salesStores = await prisma.store.findMany({
                    where: { type: 'SALES' },
                    select: { id: true }
                });
                storesToConnect = salesStores;
                break;

            case 'STAFF':
                // Le staff a accès aux magasins qui lui sont assignés via la relation access
                // On garde les accès existants pour le staff (ils sont gérés manuellement)
                const currentStaffUser = await prisma.user.findUnique({
                    where: { id: userId },
                    include: { access: true }
                });
                
                if (currentStaffUser && currentStaffUser.access.length > 0) {
                    // Si le staff a déjà des accès assignés, on les garde
                    storesToConnect = currentStaffUser.access.map((store: any) => ({ id: store.id }));
                } else if (user.storeId) {
                    // Sinon, on lui donne accès à son magasin par défaut s'il en a un
                    storesToConnect = [{ id: user.storeId }];
                }
                break;

            case 'LOGISTICS':
                // La logistique a accès aux magasins de type SALES et LOGISTICS
                const logisticsStores = await prisma.store.findMany({
                    where: {
                        type: { in: ['SALES', 'LOGISTICS'] }
                    },
                    select: { id: true }
                });
                storesToConnect = logisticsStores;
                break;
        }

        // Connecter les magasins appropriés
        if (storesToConnect.length > 0) {
            await prisma.user.update({
                where: { id: userId },
                data: {
                    access: {
                        connect: storesToConnect
                    }
                }
            });
        }
    }

    async updateUser(id: number, data: UpdateUserData): Promise<User | null> {
        try {
            const currentUser = await prisma.user.findUnique({
                where: { id },
                select: { role: true }
            });

            if (!currentUser) return null;

            // Mettre à jour l'utilisateur
            const updatedUser = await prisma.user.update({
                where: { id },
                data: {
                    ...(data.username && { username: data.username }),
                    ...(data.password && { password: data.password }),
                    ...(data.role && { role: data.role as any }),
                    ...(data.storeId !== undefined && { storeId: data.storeId }),
                },
                include: {
                    access: true,
                },
            });

            // Si le rôle a changé, recalculer les accès
            if (data.role && data.role !== currentUser.role) {
                await this.updateUserAccess(id, data.role);
                
                // Retourner l'utilisateur avec ses accès mis à jour
                return await prisma.user.findUnique({
                    where: { id },
                    include: {
                        access: true,
                    },
                }) as User;
            }

            return updatedUser;
        } catch (error) {
            return null;
        }
    }

    async deleteUser(id: number): Promise<User | null> {
        try {
            return await prisma.user.delete({
                where: { id },
                include: {
                    access: true,
                },
            });
        } catch (error) {
            return null;
        }
    }

    async getUserAccess(userId: number): Promise<Store[]> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { 
                role: true,
                storeId: true
            },
        });

        if (!user) {
            return [];
        }

        switch (user.role) {
            case 'ADMIN':
                // L'admin a accès à tous les magasins
                return await prisma.store.findMany();

            case 'CLIENT':
                // Le client a accès à tous les magasins de type SALES
                return await prisma.store.findMany({
                    where: {
                        type: 'SALES'
                    }
                });

            case 'STAFF':
                // Le staff a accès aux magasins qui lui sont assignés
                const staffUser = await prisma.user.findUnique({
                    where: { id: userId },
                    include: { access: true }
                });
                
                if (staffUser && staffUser.access.length > 0) {
                    // Retourner les magasins assignés via la relation access
                    return staffUser.access;
                } else if (staffUser && staffUser.storeId) {
                    // Si pas d'accès spécifiques, retourner le magasin par défaut
                    const store = await prisma.store.findUnique({
                        where: { id: staffUser.storeId }
                    });
                    return store ? [store] : [];
                }
                return [];

            case 'LOGISTICS':
                // La logistique a accès aux magasins de type SALES et LOGISTICS
                return await prisma.store.findMany({
                    where: {
                        type: {
                            in: ['SALES', 'LOGISTICS']
                        }
                    }
                });

            default:
                return [];
        }
    }

    // Méthode publique pour recalculer les accès de tous les utilisateurs
    async recalculateAllUserAccess(): Promise<void> {
        const users = await prisma.user.findMany({
            select: { id: true, role: true }
        });

        for (const user of users) {
            await this.updateUserAccess(user.id, user.role);
        }
    }

    // Méthodes spécifiques pour gérer les accès du staff
    async addStoreAccessToStaff(userId: number, storeId: number): Promise<boolean> {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { role: true }
            });

            if (!user || user.role !== 'STAFF') {
                return false;
            }

            await prisma.user.update({
                where: { id: userId },
                data: {
                    access: {
                        connect: { id: storeId }
                    }
                }
            });

            return true;
        } catch (error) {
            return false;
        }
    }

    async removeStoreAccessFromStaff(userId: number, storeId: number): Promise<boolean> {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { role: true }
            });

            if (!user || user.role !== 'STAFF') {
                return false;
            }

            await prisma.user.update({
                where: { id: userId },
                data: {
                    access: {
                        disconnect: { id: storeId }
                    }
                }
            });

            return true;
        } catch (error) {
            return false;
        }
    }

    async setStoreAccessForStaff(userId: number, storeIds: number[]): Promise<boolean> {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { role: true }
            });

            if (!user || user.role !== 'STAFF') {
                return false;
            }

            // D'abord supprimer tous les accès
            await prisma.user.update({
                where: { id: userId },
                data: {
                    access: {
                        set: []
                    }
                }
            });

            // Puis ajouter les nouveaux accès
            if (storeIds.length > 0) {
                await prisma.user.update({
                    where: { id: userId },
                    data: {
                        access: {
                            connect: storeIds.map(id => ({ id }))
                        }
                    }
                });
            }

            return true;
        } catch (error) {
            return false;
        }
    }
}
