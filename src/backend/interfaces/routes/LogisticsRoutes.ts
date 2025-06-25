import { Router } from 'express';
import { LogisticsController } from '../controllers/LogisticsController';
const logisticsRoutes = Router();

/**
 * @openapi
 * /api/logistics/replenishment/request:
 *   post:
 *     summary: Enregistre une demande de réapprovisionnement
 *     tags:
 *       - Logistics
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
 *               productId:
 *                 type: integer
 *                 example: 42
 *               quantity:
 *                 type: integer
 *                 example: 50
 *     responses:
 *       201:
 *         description: Demande créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReplenishmentRequest'
 *       400:
 *         description: Erreur lors de la création
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
logisticsRoutes.post('/replenishment', LogisticsController.request);

/**
 * @openapi
 * /api/logistics/replenishment/approve/{id}:
 *   post:
 *     summary: Approuve une demande de réapprovisionnement
 *     tags:
 *       - Logistics
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la demande à approuver
 *     responses:
 *       200:
 *         description: Demande approuvée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReplenishmentRequest'
 *       400:
 *         description: Erreur lors de l’approbation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
logisticsRoutes.get('/replenishment', LogisticsController.replenishments);

/**
 * @openapi
 * /api/logistics/alerts:
 *   get:
 *     summary: Alerte sur les stocks critiques
 *     tags:
 *       - Logistics
 *     responses:
 *       200:
 *         description: Liste des alertes de stock critique
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   productId:
 *                     type: integer
 *                     example: 42
 *                   productName:
 *                     type: string
 *                     example: "Produit A"
 *                   stock:
 *                     type: integer
 *                     example: 3
 */
logisticsRoutes.post('/replenishment/:id/approve', LogisticsController.approve);

/**
 * @openapi
 * /api/logistics/replenishments:
 *   get:
 *     summary: Liste toutes les demandes de réapprovisionnement
 *     tags:
 *       - Logistics
 *     responses:
 *       200:
 *         description: Liste des demandes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ReplenishmentRequest'
 */
logisticsRoutes.get('/alerts', LogisticsController.alerts);

export default logisticsRoutes;