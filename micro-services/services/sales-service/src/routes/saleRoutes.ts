import { Router } from 'express';
import { SaleController } from '../controllers/SaleController';

const saleRoutes = Router();

/**
 * @openapi
 * /api/sales:
 *   post:
 *     summary: Enregistre une nouvelle vente
 *     tags:
 *       - Ventes
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
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: integer
 *                       example: 101
 *                     quantity:
 *                       type: integer
 *                       example: 3
 *     responses:
 *       201:
 *         description: Vente enregistrée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 date:
 *                   type: string
 *                   format: date-time
 *                 storeId:
 *                   type: integer
 *                 saleItems:
 *                   type: array
 *                   items:
 *                     type: object
 */
saleRoutes.post('/', SaleController.record);

/**
 * @openapi
 * /api/sales/{id}:
 *   get:
 *     summary: Récupère une vente par son ID
 *     tags:
 *       - Ventes
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la vente
 *     responses:
 *       200:
 *         description: Détails de la vente
 *       404:
 *         description: Vente non trouvée
 */
saleRoutes.get('/:id', SaleController.get);

/**
 * @openapi
 * /api/sales/reports/by-store:
 *   get:
 *     summary: Récupère les ventes groupées par magasin
 *     tags:
 *       - Rapports
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'utilisateur
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de début
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de fin
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Limite du nombre de résultats
 *     responses:
 *       200:
 *         description: Ventes groupées par magasin
 */
saleRoutes.get('/reports/by-store', SaleController.groupByStore);

/**
 * @openapi
 * /api/sales/reports/top-products:
 *   get:
 *     summary: Récupère les produits les plus vendus
 *     tags:
 *       - Rapports
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'utilisateur
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Nombre maximum de produits à retourner
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de début
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de fin
 *     responses:
 *       200:
 *         description: Produits les plus vendus
 */
saleRoutes.get('/reports/top-products', SaleController.getTopProducts);

export default saleRoutes;
