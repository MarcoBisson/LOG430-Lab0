import { Store } from "./Store";

/**
 * @openapi
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         role:
 *           type: string
 *           example: "ADMIN"
 *         username:
 *           type: string
 *           example: "admin_user"
 *         password:
 *           type: string
 *           example: "hashed_password"
 *         access:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Store'
 */

export class User {
    constructor(
        public id: number,
        public role: string,
        public username: string,
        public password: string,
        public access: Store[]
    ) { }
}

/**
 * @openapi
 * components:
 *   schemas:
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: "Acces refusé"
 */