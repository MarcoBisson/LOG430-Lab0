import { Router } from 'express';
import { StockController, storeIdValidators, productStockValidators, updateStockValidators, stockOperationValidators } from '../controllers/StockController';

const router = Router();

/**
 * @openapi
 * /api/stocks/store/{storeId}:
 *   get:
 *     summary: Récupère le stock d'un magasin
 *     tags: [Stocks]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     parameters:
 *       - in: path
 *         name: storeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du magasin
 *     responses:
 *       200:
 *         description: Stock du magasin
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/StoreStock'
 *       404:
 *         description: Magasin non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Non autorisé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/store/:storeId', storeIdValidators, StockController.getStoreStock);

/**
 * @openapi
 * /api/stocks/store/{storeId}/product/{productId}:
 *   get:
 *     summary: Récupère le stock d'un produit dans un magasin
 *     tags: [Stocks]
 *     parameters:
 *       - in: path
 *         name: storeId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Stock du produit
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StoreStock'
 *       404:
 *         description: Stock non trouvé
 */
router.get('/store/:storeId/product/:productId', productStockValidators, StockController.getProductStock);

/**
 * @openapi
 * /api/stocks/store/{storeId}/product/{productId}:
 *   put:
 *     summary: Met à jour le stock d'un produit
 *     tags: [Stocks]
 *     parameters:
 *       - in: path
 *         name: storeId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 0
 *     responses:
 *       200:
 *         description: Stock mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StoreStock'
 */
router.put('/store/:storeId/product/:productId', updateStockValidators, StockController.updateStock);

/**
 * @openapi
 * /api/stocks/store/{storeId}/product/{productId}/increment:
 *   post:
 *     summary: Incrémente le stock d'un produit
 *     tags: [Stocks]
 *     parameters:
 *       - in: path
 *         name: storeId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *     responses:
 *       200:
 *         description: Stock incrémenté
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StoreStock'
 */
router.post('/store/:storeId/product/:productId/increment', stockOperationValidators, StockController.incrementStock);

/**
 * @openapi
 * /api/stocks/store/{storeId}/product/{productId}/decrement:
 *   post:
 *     summary: Décrémente le stock d'un produit
 *     tags: [Stocks]
 *     parameters:
 *       - in: path
 *         name: storeId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *     responses:
 *       200:
 *         description: Stock décrémenté
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StoreStock'
 */
router.post('/store/:storeId/product/:productId/decrement', stockOperationValidators, StockController.decrementStock);

/**
 * @openapi
 * /api/stocks/low:
 *   get:
 *     summary: Récupère les stocks faibles
 *     tags: [Stocks]
 *     parameters:
 *       - in: query
 *         name: threshold
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Seuil en dessous duquel un stock est considéré comme faible
 *     responses:
 *       200:
 *         description: Liste des stocks faibles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/StoreStock'
 */
router.get('/low', StockController.getLowStocks);

export default router;
