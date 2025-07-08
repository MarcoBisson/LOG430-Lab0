import { Store } from "@prisma/client";
import { User } from "../entities/User";

export interface IUserRepository {
    getUser(username:string): Promise<User| null>;

    getUserAccess(userId: number): Promise<Store[]>;
}