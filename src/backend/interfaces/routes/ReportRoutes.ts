import { Router } from 'express';
import { ReportController } from '../controllers/ReportController';

const reportRoutes = Router();

/**
 * @openapi
 * /api/reports/consolidated:
 *   get:
 *     summary: Récupère un rapport consolidé des ventes, produits et stocks.
 *     tags:
 *       - Reports
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Date de début de l'intervalle (format ISO 8601)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: false
 *         description: Date de fin de l'intervalle (format ISO 8601)
 *     responses:
 *       200:
 *         description: Rapport consolidé retourné avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReportDTO'
 *       400:
 *         description: Paramètres invalides
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Date invalide"
 */
reportRoutes.get('/consolidated', ReportController.consolidated);

export default reportRoutes;