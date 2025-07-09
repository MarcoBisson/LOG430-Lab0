import type { StoreType } from '@prisma/client';
/**
 * @openapi
 * components:
 *   schemas:
 *     Store:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: "Magasin Sherbrooke"
 *         address:
 *           type: string
 *           example: "123 rue King Ouest"
 *         type:
 *           type: string
 *           enum: [SALES, LOGISTICS, HEADQUARTERS]
 *           example: "SALES"
 */
export class Store {
    constructor(
        public id: number,
        public name: string,
        public address: string,
        public type: StoreType,
    ) { }
}