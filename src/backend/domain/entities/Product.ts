/**
 * @openapi
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: "Chaise ergonomique"
 *         price:
 *           type: number
 *           example: 89.99
 *         description:
 *           type: string
 *           nullable: true
 *           example: "Chaise en bois avec dossier confortable"
 *         category:
 *           type: string
 *           nullable: true
 *           example: "Mobilier"
 */
export class Product {
    constructor(
        public id: number,
        public name: string,
        public price: number,
        public description: string | null,
        public category: string | null,
    ) { }
}

/**
 * @openapi
 * components:
 *   schemas:
 *     ProductStock:
 *       allOf:
 *         - $ref: '#/components/schemas/Product'
 *         - type: object
 *           properties:
 *             stock:
 *               type: integer
 *               example: 100
 */
export class ProductStock extends Product {
    constructor(
        id: number,
        name: string,
        price: number,
        description: string | null,
        category: string | null,
        public stock: number 
    ) {
        super(id, name, price, description, category);
    }
}