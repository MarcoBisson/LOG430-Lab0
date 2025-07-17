/**
 * @openapi
 * components:
 *   schemas:
 *     CartItem:
 *       type: object
 *       properties:
 *         productId:
 *           type: integer
 *           example: 42
 *         quantity:
 *           type: integer
 *           example: 3
 */
export class CartItem {
    constructor(
        public productId: number,
        public quantity: number,
    ) { }
}
