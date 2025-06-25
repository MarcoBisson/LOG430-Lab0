import { Router } from 'express';
import { InventoryController } from '../controllers/InventoryController';
const inventoryRoutes = Router();

/**
 * @openapi
 * /api/stock/central:
 *   get:
 *     summary: Récupère le stock central
 *     tags:
 *       - Stock
 *     responses:
 *       200:
 *         description: Stock central récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProductStock'
 */
inventoryRoutes.get('/central', InventoryController.central);

/**
 * @openapi
 * /api/stock/store/{storeId}:
 *   get:
 *     summary: Récupère le stock d’un magasin spécifique
 *     tags:
 *       - Stock
 *     parameters:
 *       - in: path
 *         name: storeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du magasin
 *     responses:
 *       200:
 *         description: Stock du magasin récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProductStock'
 *       404:
 *         description: Magasin introuvable
 */
inventoryRoutes.get('/store/:storeId', InventoryController.store);

export default inventoryRoutes;