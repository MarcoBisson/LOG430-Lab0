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
 *           enum: [SALES, LOGISTICS, HEADQUARTER]
 *           example: "SALES"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
export class Store {
    constructor(
        public id: number,
        public name: string,
        public address: string,
        public type: StoreType,
        public createdAt: Date,
        public updatedAt: Date
    ) { }
}

export type StoreType = 'SALES' | 'LOGISTICS' | 'HEADQUARTER';
