import { Router } from 'express';
import { LogisticsController } from '../controllers/LogisticsController';
import { authenticateJWT } from '../middlewares/authentificateJWT';
const logisticsRoutes = Router();

/**
 * @openapi
 * /api/logistics/replenishment/request:
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

logisticsRoutes.post('/replenishment', authenticateJWT, LogisticsController.request);

/**
 * @openapi
 * /api/logistics/replenishment/approve/{id}:
 *   post:
 *     summary: Approuve un réapprovisionnement
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
 *         description: ID du réapprovisionnement
 *     responses:
 *       200:
 *         description: Réapprovisionnement approuvé
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
 */

logisticsRoutes.get('/replenishment', authenticateJWT, LogisticsController.replenishments);

/**
 * @openapi
 * /api/logistics/alerts:
 *   get:
 *     summary: Récupère les alertes de stock critique
 *     tags:
 *       - Logistique
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des alertes
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

logisticsRoutes.post('/replenishment/:id/approve', authenticateJWT, LogisticsController.approve);

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

logisticsRoutes.get('/alerts', authenticateJWT, LogisticsController.alerts);

export default logisticsRoutes;