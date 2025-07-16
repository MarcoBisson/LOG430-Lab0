import { Router } from 'express';
import { InventoryController } from '../controllers/InventoryController';
import { authenticateJWT } from '../middlewares/authentificateJWT';
import { cacheMiddleware } from '../middlewares/cacheMiddleware';
const inventoryRoutes = Router();

/**
 * @openapi
 * /api/stock/central:
 *   get:
 *     summary: Récupère le stock central (paginé)
 *     tags:
 *       - Inventaire
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         required: false
 *         description: Page de pagination (optionnel)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         required: false
 *         description: Nombre d'éléments par page (optionnel)
 *     responses:
 *       200:
 *         description: Stock central récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 products:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       productId:
 *                         type: integer
 *                       stock:
 *                         type: integer
 *                       name:
 *                         type: string
 *                 total:
 *                   type: integer
 *       401:
 *         description: Accès non autorisé (CLIENT)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
/**
 * @openapi
 * /api/stock/store/{storeId}:
 *   get:
 *     summary: Récupère le stock d’un magasin spécifique (paginé)
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
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         required: false
 *         description: Page de pagination (optionnel)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         required: false
 *         description: Nombre d'éléments par page (optionnel)
 *     responses:
 *       200:
 *         description: Stock du magasin récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ProductStock'
 *                 total:
 *                   type: integer
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

inventoryRoutes.get('/central', 
  authenticateJWT, 
  cacheMiddleware('inventory:central', { ttl: 300 }), // 5 min cache
  InventoryController.central,
);

inventoryRoutes.get('/store/:storeId', 
  authenticateJWT, 
  cacheMiddleware('inventory:store', { ttl: 180 }), // 3 min cache
  InventoryController.store,
);

export default inventoryRoutes;