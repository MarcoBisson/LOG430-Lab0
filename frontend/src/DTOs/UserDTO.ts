import type { StoreDTO } from './StoreDTO';

export interface UserDTO {
    id: number,
    role: string,
    username: string,
    access: StoreDTO[]
}