import type { Request, Response } from 'express';
import { ProductService } from '../services/ProductService';

// Note: Le repository sera injecté via un container DI ou une factory
let productService: ProductService;

export class ProductController {
    static setProductService(service: ProductService) {
        productService = service;
    }

    /**
     * @openapi
     * /api/inventory/products:
     *   get:
     *     summary: Récupère tous les produits
     *     tags: [Products]
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
    static async list(req: Request, res: Response) {
        try {
            const products = await productService.listProducts();
            res.json(products);
        } catch (error) {
            res.status(500).json({ error: 'Erreur lors de la récupération des produits' });
        }
    }

    /**
     * @openapi
     * /api/inventory/products/{id}:
     *   get:
     *     summary: Récupère un produit par son ID
     *     tags: [Products]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
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
    static async get(req: Request, res: Response) {
        try {
            const p = await productService.getProductById(+req.params.id);
            if (p) {
                res.json(p);
            } else {
                res.status(404).json({ error: 'Produit non trouvé' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Erreur lors de la récupération du produit' });
        }
    }

    /**
     * @openapi
     * /api/inventory/products/name/{name}:
     *   get:
     *     summary: Recherche des produits par nom
     *     tags: [Products]
     *     parameters:
     *       - in: path
     *         name: name
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Liste des produits trouvés
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Product'
     */
    static async getByName(req: Request, res: Response) {
        try {
            const p = await productService.getProductsByName(req.params.name);
            res.json(p);
        } catch (error) {
            res.status(500).json({ error: 'Erreur lors de la recherche par nom' });
        }
    }

    /**
     * @openapi
     * /api/inventory/products/category/{category}:
     *   get:
     *     summary: Recherche des produits par catégorie
     *     tags: [Products]
     *     parameters:
     *       - in: path
     *         name: category
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Liste des produits de la catégorie
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Product'
     */
    static async getByCategory(req: Request, res: Response) {
        try {
            const p = await productService.getProductsByCategory(req.params.category);
            res.json(p);
        } catch (error) {
            res.status(500).json({ error: 'Erreur lors de la recherche par catégorie' });
        }
    }

    /**
     * @openapi
     * /api/inventory/products/store/{id}:
     *   post:
     *     summary: Crée un nouveau produit dans un magasin
     *     tags: [Products]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: ID du magasin
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
     */
    static async create(req: Request, res: Response) {
        try {
            const p = await productService.createProduct(+req.params.id, req.body);
            res.status(201).json(p);
        } catch (error) {
            res.status(400).json({ error: 'Erreur lors de la création du produit' });
        }
    }

    /**
     * @openapi
     * /api/inventory/products/{productId}/store/{storeId}:
     *   put:
     *     summary: Met à jour un produit
     *     tags: [Products]
     *     parameters:
     *       - in: path
     *         name: productId
     *         required: true
     *         schema:
     *           type: integer
     *       - in: path
     *         name: storeId
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
     *               $ref: '#/components/schemas/ProductStock'
     */
    static async update(req: Request, res: Response) {
        try {
            const p = await productService.updateProduct(+req.params.productId, +req.params.storeId, req.body);
            res.json(p);
        } catch (error) {
            res.status(400).json({ error: 'Erreur lors de la mise à jour du produit' });
        }
    }

    /**
     * @openapi
     * /api/inventory/products/{id}:
     *   delete:
     *     summary: Supprime un produit
     *     tags: [Products]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *     responses:
     *       204:
     *         description: Produit supprimé
     */
    static async delete(req: Request, res: Response) {
        try {
            await productService.deleteProduct(+req.params.id);
            res.status(204).end();
        } catch (error) {
            res.status(500).json({ error: 'Erreur lors de la suppression du produit' });
        }
    }

    /**
     * @openapi
     * /api/inventory/products/store/{id}:
     *   get:
     *     summary: Récupère les produits d'un magasin
     *     tags: [Products]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *       - in: query
     *         name: page
     *         schema:
     *           type: integer
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *     responses:
     *       200:
     *         description: Liste des produits du magasin
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 products:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/schemas/ProductStock'
     *                 total:
     *                   type: integer
     */
    static async getByStore(req: Request, res: Response) {
        try {
            const storeId = +req.params.id;
            const page = req.query.page ? parseInt(req.query.page as string) : undefined;
            const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

            const result = await productService.getProductsByStore(storeId, page, limit);
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: 'Erreur lors de la récupération des produits du magasin' });
        }
    }

    /**
     * @openapi
     * /api/inventory/products/search/{search}:
     *   get:
     *     summary: Recherche des produits par terme
     *     tags: [Products]
     *     parameters:
     *       - in: path
     *         name: search
     *         required: true
     *         schema:
     *           type: string
     *         description: Terme de recherche
     *       - in: query
     *         name: page
     *         schema:
     *           type: integer
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *     responses:
     *       200:
     *         description: Résultats de recherche
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 products:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/schemas/Product'
     *                 total:
     *                   type: integer
     */
    static async search(req: Request, res: Response) {
        try {
            const searchTerm = req.params.search;
            const page = req.query.page ? parseInt(req.query.page as string) : undefined;
            const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
            
            const result = await productService.searchProducts(searchTerm, page, limit);
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: 'Erreur lors de la recherche de produits' });
        }
    }
}
