import type { Response } from 'express';
/**
 * @openapi
 * components:
 *   schemas:
 *     Error:
 *       type: object
 *       properties:
 *         timestamp:
 *           type: string
 *           format: date-time
 *           example: "2025-06-02T10:21:00Z"
 *         status:
 *           type: integer
 *           example: 400
 *         error:
 *           type: string
 *           example: "Bad Request"
 *         message:
 *           type: string
 *           example: "Le champ ’name’ est requis."
 *         path:
 *           type: string
 *           example: "/api/products"
 */
export function errorResponse(res: Response, status: number, error: string, message: string, path: string) {
    return res.status(status).json({
        timestamp: new Date().toISOString(),
        status,
        error,
        message,
        path,
    });
}
