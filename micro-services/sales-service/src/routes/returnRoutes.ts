import { Router } from 'express';
import { ReturnController } from '../controllers/ReturnController';

const returnRoutes = Router();

/**
 * @openapi
 * /api/returns/{saleId}:
 *   post:
 *     summary: Traite un retour pour une vente existante
 *     description: Lance le traitement d'un retour en se basant sur l'ID de la vente fournie.
 *     tags:
 *       - Retour
 *     parameters:
 *       - in: path
 *         name: saleId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la vente à retourner
 *     responses:
 *       204:
 *         description: Retour traité avec succès
 *       404:
 *         description: Vente introuvable
 *       400:
 *         description: Erreur lors du traitement du retour
 */
returnRoutes.post('/:saleId', ReturnController.process);

export default returnRoutes;
