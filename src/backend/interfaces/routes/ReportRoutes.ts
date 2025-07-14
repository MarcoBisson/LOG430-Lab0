import { Router } from 'express';
import { ReportController } from '../controllers/ReportController';
import { authenticateJWT } from '../middlewares/authentificateJWT';

const reportRoutes = Router();

/**
 * @openapi
 * /api/reports/consolidated:
 *   get:
 *     summary: Récupère un rapport consolidé des ventes
 *     tags:
 *       - Rapports
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Date de début du rapport (optionnel)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Date de fin du rapport (optionnel)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         required: false
 *         description: Nombre d'éléments par page pour les tableaux paginés (optionnel)
 *       - in: query
 *         name: stockOffset
 *         schema:
 *           type: integer
 *         required: false
 *         description: Décalage pour la pagination du stock central (optionnel)
 *     responses:
 *       200:
 *         description: Rapport consolidé récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 salesByStore:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       storeId:
 *                         type: integer
 *                       totalQuantity:
 *                         type: integer
 *                 topProducts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       productId:
 *                         type: integer
 *                       totalQuantity:
 *                         type: integer
 *                 centralStock:
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
 *                 centralStockTotal:
 *                   type: integer
 *       403:
 *         description: Jeton invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erreur serveur interne
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

reportRoutes.get('/consolidated', authenticateJWT,  ReportController.consolidated);

export default reportRoutes;