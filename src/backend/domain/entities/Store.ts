import { StoreType } from '@prisma/client';

export class Store {
    constructor(
        public id: number,
        public name: string,
        public address: string,
        public type: StoreType
    ) { }
}