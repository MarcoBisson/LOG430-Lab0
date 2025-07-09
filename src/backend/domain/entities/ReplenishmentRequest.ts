import type { ReplenishmentRequestStatus } from '@prisma/client';

/**
 * @openapi
 * components:
 *   schemas:
 *     ReplenishmentRequest:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 12
 *         storeId:
 *           type: integer
 *           example: 3
 *         productId:
 *           type: integer
 *           example: 7
 *         quantity:
 *           type: integer
 *           example: 50
 *         status:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED]
 *           example: PENDING
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-06-24T14:32:00Z"
 */
export class ReplenishmentRequest {
    constructor(
        public id: number,
        public storeId: number,
        public productId: number,
        public quantity: number,
        public status: ReplenishmentRequestStatus,
        public createdAt: Date,
    ) { }
}