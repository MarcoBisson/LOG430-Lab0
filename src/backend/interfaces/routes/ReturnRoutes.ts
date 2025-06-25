import { Router } from 'express';
import { ReturnController } from '../controllers/ReturnController';

const returnRoute = Router();

/**
 * @openapi
 * /api/returns:
 *   post:
 *     summary: Enregistre un retour de produit dans le système.
 *     tags:
 *       - Returns
 *     requestBody:
 *       description: Détails du retour, notamment l'ID de la vente
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               saleId:
 *                 type: integer
 *                 example: 123
 *     responses:
 *       204:
 *         description: Retour traité avec succès, pas de contenu retourné
 *       400:
 *         description: Requête invalide ou paramètres manquants
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "ID de vente invalide ou manquant"
 */
returnRoute.post('/:saleId', ReturnController.process);

export default returnRoute;