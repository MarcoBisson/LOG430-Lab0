/**
 * @openapi
 * components:
 *   schemas:
 *     StoreStock:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 10
 *         storeId:
 *           type: integer
 *           example: 3
 *         productId:
 *           type: integer
 *           example: 42
 *         quantity:
 *           type: integer
 *           example: 75
 */
export class StoreStock {
    constructor(
        public id: number,
        public storeId: number,
        public productId: number,
        public quantity: number
    ) { }
}