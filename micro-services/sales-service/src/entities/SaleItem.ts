/**
 * @openapi
 * components:
 *   schemas:
 *     SaleItem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 101
 *         saleId:
 *           type: integer
 *           description: ID de la vente à laquelle l'article appartient
 *           example: 45
 *         productId:
 *           type: integer
 *           description: ID du produit vendu
 *           example: 7
 *         quantity:
 *           type: integer
 *           description: Quantité vendue
 *           example: 3
 *         unitPrice:
 *           type: number
 *           description: Prix unitaire au moment de la vente
 *           example: 19.99
 */
export class SaleItem {
    constructor(
        public id: number,
        public saleId: number,
        public productId: number,
        public quantity: number,
        public unitPrice: number,
    ) { }
}
