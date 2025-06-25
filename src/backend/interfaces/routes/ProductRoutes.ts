import { Router } from 'express';
import { ProductController } from '../controllers/ProductController';
const productRoutes = Router();

/**
 * @openapi
 * /api/products/:
 *   get:
 *     summary: Récupère la liste complète des produits
 *     tags:
 *       - Products
 *     responses:
 *       200:
 *         description: Liste des produits
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
productRoutes.get('/', ProductController.list);

/**
 * @openapi
 * /api/products/{id}:
 *   get:
 *     summary: Récupère un produit par son ID
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID du produit
 *     responses:
 *       200:
 *         description: Détails du produit
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Produit non trouvé
 */
productRoutes.get('/:id', ProductController.get);

/**
 * @openapi
 * /api/products/search/name/{name}:
 *   get:
 *     summary: Recherche des produits par nom
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: name
 *         schema:
 *           type: string
 *         required: true
 *         description: Nom à rechercher
 *     responses:
 *       200:
 *         description: Produits correspondant au nom
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
productRoutes.get('/search/name/:name', ProductController.getByName);

/**
 * @openapi
 * /api/products/search/category/{category}:
 *   get:
 *     summary: Recherche des produits par catégorie
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: category
 *         schema:
 *           type: string
 *         required: true
 *         description: Catégorie à rechercher
 *     responses:
 *       200:
 *         description: Produits correspondant à la catégorie
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
productRoutes.get('/search/category/:category', ProductController.getByCategory);

/**
 * @openapi
 * /api/products/store/{id}:
 *   post:
 *     summary: Crée un nouveau produit dans un magasin
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID du magasin
 *     requestBody:
 *       description: Données du produit à créer
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Produit créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Requête invalide
 */
productRoutes.post('/store/:id', ProductController.create);

/**
 * @openapi
 * /api/products/store/{storeId}/{productId}:
 *   put:
 *     summary: Met à jour un produit existant dans un magasin
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: storeId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID du magasin
 *       - in: path
 *         name: productId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID du produit
 *     requestBody:
 *       description: Données à mettre à jour
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Produit mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Requête invalide
 *       404:
 *         description: Produit non trouvé
 */
productRoutes.put('/store/:storeId/:productId', ProductController.update);

/**
 * @openapi
 * /api/products/{id}:
 *   delete:
 *     summary: Supprime un produit par son ID
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID du produit à supprimer
 *     responses:
 *       204:
 *         description: Produit supprimé avec succès (pas de contenu)
 *       404:
 *         description: Produit non trouvé
 */
productRoutes.delete('/:id', ProductController.delete);

/**
 * @openapi
 * /api/products/store/{id}:
 *   get:
 *     summary: Récupère tous les produits d’un magasin
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID du magasin
 *     responses:
 *       200:
 *         description: Liste des produits en stock dans le magasin
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
productRoutes.get('/store/:id', ProductController.getByStore);

export default productRoutes;