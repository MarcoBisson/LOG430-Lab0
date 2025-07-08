import { Router } from 'express';
import { SaleController } from '../controllers/SaleController';
import { authenticateJWT } from '../middlewares/authentificateJWT';
const saleRoutes = Router();

/**
 * @openapi
 * /api/sales:
 *   post:
 *     summary: Enregistre une nouvelle vente
 *     tags:
 *       - Ventes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               storeId:
 *                 type: integer
 *                 example: 1
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: integer
 *                       example: 101
 *                     quantity:
 *                       type: integer
 *                       example: 3
 *     responses:
 *       201:
 *         description: Vente enregistrée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Sale'
 */

saleRoutes.post('/', authenticateJWT, SaleController.record);

/**
 * @openapi
 * /api/sales/{id}:
 *   get:
 *     summary: Récupère une vente par son ID
 *     tags:
 *       - Ventes
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la vente
 *     responses:
 *       200:
 *         description: Détails de la vente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Sale'
 *       404:
 *         description: Vente non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

saleRoutes.get('/:id', authenticateJWT, SaleController.get);

export default saleRoutes;
