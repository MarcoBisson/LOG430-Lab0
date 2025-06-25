import { Router } from 'express';
import { SaleController } from '../controllers/SaleController';
const saleRoutes = Router();

/**
 * @openapi
 * /api/sales:
 *   post:
 *     summary: Enregistre une vente dans le système.
 *     tags:
 *       - Sales
 *     requestBody:
 *       description: Détails de la vente, incluant l'ID du magasin et les articles vendus
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
 *                       example: 42
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
 *       400:
 *         description: Requête invalide
 */
saleRoutes.post('/', SaleController.record);

/**
 * @openapi
 * /api/sales/{id}:
 *   get:
 *     summary: Récupère une vente par son ID
 *     tags:
 *       - Sales
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
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
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Not found"
 */
saleRoutes.get('/:id', SaleController.get);

export default saleRoutes;
