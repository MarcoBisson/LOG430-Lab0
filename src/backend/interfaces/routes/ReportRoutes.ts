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
 *         description: Date de début du rapport
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de fin du rapport
 *     responses:
 *       200:
 *         description: Rapport consolidé récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               additionalProperties: true
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