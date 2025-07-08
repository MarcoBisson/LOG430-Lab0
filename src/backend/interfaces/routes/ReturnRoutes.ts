import { Router } from 'express';
import { ReturnController } from '../controllers/ReturnController';
import { authenticateJWT } from '../middlewares/authentificateJWT';

const returnRoute = Router();

/**
 * @openapi
 * /api/returns:
 *   post:
 *     summary: Traite un retour pour une vente existante
 *     description: Lance le traitement d’un retour en se basant sur l’ID de la vente fournie.
 *     tags:
 *       - Retour
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - saleId
 *             properties:
 *               saleId:
 *                 type: integer
 *                 description: ID de la vente à retourner
 *                 example: 42
 *     responses:
 *       204:
 *         description: Retour traité avec succès
 *       404:
 *         description: Vente introuvable
 *       401:
 *         description: Token JWT manquant ou invalide
 */
returnRoute.post('/:saleId', authenticateJWT, ReturnController.process);

export default returnRoute;