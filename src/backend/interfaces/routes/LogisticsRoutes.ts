import { Router } from 'express';
import { LogisticsController } from '../controllers/LogisticsController';
import { authenticateJWT } from '../middlewares/authentificateJWT';
import { cacheMiddleware, invalidationMiddleware } from '../middlewares/cacheMiddleware';
const logisticsRoutes = Router();

/**
 * @openapi
 * /api/logistics/replenishment:
 *   post:
 *     summary: Demande un réapprovisionnement
 *     tags:
 *       - Logistique
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - storeId
 *               - productId
 *               - quantity
 *             properties:
 *               storeId:
 *                 type: integer
 *               productId:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Réapprovisionnement demandé avec succès
 *         content:
 *           application/json:
 *              schema:
 *               $ref: '#/components/schemas/ReplenishmentRequest'
 *       400:
 *         description: Erreur de validation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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

logisticsRoutes.post('/replenishment', 
  authenticateJWT, 
  invalidationMiddleware('logistics'),
  LogisticsController.request,
);

/**
 * @openapi
 * /api/logistics/replenishment:
 *   get:
 *     summary: Récupère la liste des demandes de réapprovisionnement
 *     tags:
 *       - Logistique
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des demandes de réapprovisionnement
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ReplenishmentRequest'
 *       401:
 *         description: Accès non autorisé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
logisticsRoutes.get('/replenishment', 
  authenticateJWT, 
  cacheMiddleware('logistics:requests', { ttl: 120 }), // 2 min cache
  LogisticsController.replenishments,
);

/**
 * @openapi
 * /api/logistics/replenishment/{id}/approve:
 *   post:
 *     summary: Approuve une demande de réapprovisionnement
 *     tags:
 *       - Logistique
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la demande de réapprovisionnement à approuver
 *     responses:
 *       200:
 *         description: Demande de réapprovisionnement approuvée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReplenishmentRequest'
 *       400:
 *         description: Erreur de validation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Accès non autorisé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Demande de réapprovisionnement non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
logisticsRoutes.post('/replenishment/:id/approve', 
  authenticateJWT, 
  invalidationMiddleware('logistics'),
  LogisticsController.approve,
);

/**
 * @openapi
 * /api/logistics/alerts:
 *   get:
 *     summary: Vérifie les niveaux de stock critiques
 *     tags:
 *       - Logistique
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Alertes de stock retournées
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/StoreStock'
 *       401:
 *         description: Accès non autorisé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

logisticsRoutes.get('/alerts', 
  authenticateJWT, 
  cacheMiddleware('logistics:alerts', { ttl: 60 }), // 1 min cache pour alertes temps réel
  LogisticsController.alerts,
);

export default logisticsRoutes;