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
 *         email:
 *           type: string
 *           example: "admin@example.com"
 *         password:
 *           type: string
 *           example: "hashed_password"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         access:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Store'
 */

import { Store } from "./Store";

export class User {
    constructor(
        public id: number,
        public role: UserRole,
        public username: string,
        public email: string,
        public password: string,
        public createdAt: Date,
        public updatedAt: Date,
        public access: Store[],
        public storeId?: number | null,
    ) { }
}

export type UserRole = 'CLIENT' | 'ADMIN' | 'STAFF' | 'LOGISTICS';
