import { SaleItem } from './SaleItem';

/**
 * @openapi
 * components:
 *   schemas:
 *     Sale:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 123
 *         date:
 *           type: string
 *           format: date-time
 *           example: "2025-06-24T12:30:00Z"
 *         storeId:
 *           type: integer
 *           example: 5
 *         saleItems:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SaleItem'
 */
export class Sale {
    constructor(
        public id: number,
        public date: Date,
        public storeId: number,
        public saleItems: SaleItem[]
    ) { }
}