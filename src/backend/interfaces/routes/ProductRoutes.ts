import { Router } from 'express';
import { ProductController } from '../controllers/ProductController';
import { authenticateJWT } from '../middlewares/authentificateJWT';
const productRoutes = Router();

/**
 * @openapi
 * /api/products:
 *   get:
 *     summary: Récupère tous les produits disponibles
 *     tags:
 *       - Produits
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des produits
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       401:
 *         description: Non autorisé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

productRoutes.get('/', authenticateJWT, ProductController.list);

/**
 * @openapi
 * /api/products/{id}:
 *   get:
 *     summary: Récupère un produit par ID
 *     tags:
 *       - Produits
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Produit trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Produit non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

productRoutes.get('/:id', authenticateJWT, ProductController.get);

/**
 * @openapi
 * /api/products/search/name/{name}:
 *   get:
 *     summary: Recherche de produits par nom
 *     tags:
 *       - Produits
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: name
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Produits trouvés
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       404:
 *         description: Aucun produit trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

productRoutes.get('/search/name/:name', authenticateJWT, ProductController.getByName);

/**
 * @openapi
 * /api/products/search/category/{category}:
 *   get:
 *     summary: Recherche de produits par catégorie
 *     tags:
 *       - Produits
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: category
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Produits trouvés
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       404:
 *         description: Aucun produit trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

productRoutes.get('/search/category/:category', authenticateJWT, ProductController.getByCategory);

/**
 * @openapi
 * /api/products/store/{id}:
 *   post:
 *     summary: Créé un nouveau produit pour un magasin
 *     tags:
 *       - Produits
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductInput'
 *     responses:
 *       201:
 *         description: Produit créé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       401:
 *         description: Non autorisé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

productRoutes.post('/store/:id', authenticateJWT, ProductController.create);

/**
 * @openapi
 * /api/products/store/{storeId}/product/{productId}:
 *   put:
 *     summary: Met à jour un produit
 *     tags:
 *       - Produits
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: storeId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *       - name: productId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductInput'
 *     responses:
 *       200:
 *         description: Produit mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       401:
 *         description: Non autorisé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

productRoutes.put('/store/:storeId/:productId', authenticateJWT, ProductController.update);

/**
 * @openapi
 * /api/products/{id}:
 *   delete:
 *     summary: Supprime un produit
 *     tags:
 *       - Produits
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Produit supprimé
 *       401:
 *         description: Non autorisé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

productRoutes.delete('/:id', authenticateJWT, ProductController.delete);

/**
 * @openapi
 * /api/products/store/{id}:
 *   get:
 *     summary: Récupère les produits d’un magasin
 *     tags:
 *       - Produits
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Produits du magasin
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
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

productRoutes.get('/store/:id', authenticateJWT, ProductController.getByStore);

export default productRoutes;