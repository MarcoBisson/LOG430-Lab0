import { Router } from 'express';
import { InventoryController } from '../controllers/InventoryController';
import { authenticateJWT } from '../middlewares/authentificateJWT';
const inventoryRoutes = Router();

/**
 * @openapi
 * /api/stock/central:
 *   get:
 *     summary: Récupère le stock central
 *     tags:
 *       - Inventaire
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stock central récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProductStock'
 *       401:
 *         description: Accès non autorisé (CLIENT)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

inventoryRoutes.get('/central', authenticateJWT, InventoryController.central);

/**
 * @openapi
 * /api/stock/store/{storeId}:
 *   get:
 *     summary: Récupère le stock d’un magasin spécifique
 *     tags:
 *       - Inventaire
 *     security:
 *       - bearerAuth: []
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
 *       401:
 *         description: Accès non autorisé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Token invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

inventoryRoutes.get('/store/:storeId', authenticateJWT, InventoryController.store);

export default inventoryRoutes;