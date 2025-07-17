import type { Request, Response } from 'express';
import { InventoryService } from '../services/InventoryService';

// Note: Le service sera injecté via un container DI ou une factory
let inventoryService: InventoryService;

export class InventoryController {
    static setInventoryService(service: InventoryService) {
        inventoryService = service;
    }

    /**
     * @openapi
     * /api/inventory/stock/central:
     *   get:
     *     summary: Récupère le stock central
     *     tags: [Stock]
     *     parameters:
     *       - in: query
     *         name: page
     *         schema:
     *           type: integer
     *         description: Numéro de page
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *         description: Nombre d'éléments par page
     *     responses:
     *       200:
     *         description: Stock central avec pagination
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 products:
     *                   type: array
     *                   items:
     *                     type: object
     *                     properties:
     *                       productId:
     *                         type: integer
     *                       stock:
     *                         type: integer
     *                       name:
     *                         type: string
     *                 total:
     *                   type: integer
     */
    static async central(req: Request, res: Response) {
        try {
            const page = req.query.page ? parseInt(req.query.page as string) : undefined;
            const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
            
            const { products, total } = await inventoryService.getCentralStock(page, limit);
            res.json({ products, total });
        } catch (error) {
            res.status(500).json({ error: 'Erreur lors de la récupération du stock central' });
        }
    }

    /**
     * @openapi
     * /api/inventory/stock/store/{storeId}:
     *   get:
     *     summary: Récupère le stock d'un magasin
     *     tags: [Stock]
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
     */
    static async store(req: Request, res: Response) {
        try {
            const storeId = +req.params.storeId;
            const storeStock = await inventoryService.getStoreStock(storeId);
            res.json(storeStock);
        } catch (error) {
            res.status(500).json({ error: 'Erreur lors de la récupération du stock du magasin' });
        }
    }

    /**
     * @openapi
     * /api/inventory/stock/store/{storeId}/product/{productId}:
     *   get:
     *     summary: Récupère le stock d'un produit dans un magasin
     *     tags: [Stock]
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
     *         description: Stock du produit dans le magasin
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/StoreStock'
     *       404:
     *         description: Stock non trouvé
     */
    static async getProductStock(req: Request, res: Response) {
        try {
            const storeId = +req.params.storeId;
            const productId = +req.params.productId;
            
            const stock = await inventoryService.getProductStock(storeId, productId);
            if (stock) {
                res.json(stock);
            } else {
                res.status(404).json({ error: 'Stock non trouvé' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Erreur lors de la récupération du stock' });
        }
    }

    /**
     * @openapi
     * /api/inventory/stock/store/{storeId}/product/{productId}:
     *   put:
     *     summary: Met à jour le stock d'un produit
     *     tags: [Stock]
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
    static async updateStock(req: Request, res: Response) {
        try {
            const storeId = +req.params.storeId;
            const productId = +req.params.productId;
            const { quantity } = req.body;

            if (quantity < 0) {
                return res.status(400).json({ error: 'La quantité ne peut pas être négative' });
            }

            const stock = await inventoryService.updateStock(storeId, productId, quantity);
            res.json(stock);
        } catch (error) {
            res.status(400).json({ error: 'Erreur lors de la mise à jour du stock' });
        }
    }

    /**
     * @openapi
     * /api/inventory/stock/store/{storeId}/product/{productId}/increment:
     *   patch:
     *     summary: Incrémente le stock d'un produit
     *     tags: [Stock]
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
    static async incrementStock(req: Request, res: Response) {
        try {
            const storeId = +req.params.storeId;
            const productId = +req.params.productId;
            const { quantity } = req.body;

            if (quantity <= 0) {
                return res.status(400).json({ error: 'La quantité doit être positive' });
            }

            const stock = await inventoryService.incrementStock(storeId, productId, quantity);
            res.json(stock);
        } catch (error) {
            res.status(400).json({ error: 'Erreur lors de l\'incrémentation du stock' });
        }
    }

    /**
     * @openapi
     * /api/inventory/stock/store/{storeId}/product/{productId}/decrement:
     *   patch:
     *     summary: Décrémente le stock d'un produit
     *     tags: [Stock]
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
    static async decrementStock(req: Request, res: Response) {
        try {
            const storeId = +req.params.storeId;
            const productId = +req.params.productId;
            const { quantity } = req.body;

            if (quantity <= 0) {
                return res.status(400).json({ error: 'La quantité doit être positive' });
            }

            const stock = await inventoryService.decrementStock(storeId, productId, quantity);
            res.json(stock);
        } catch (error) {
            res.status(400).json({ error: 'Erreur lors de la décrémentation du stock' });
        }
    }

    /**
     * @openapi
     * /api/inventory/stock/low:
     *   get:
     *     summary: Récupère les stocks faibles
     *     tags: [Stock]
     *     parameters:
     *       - in: query
     *         name: threshold
     *         schema:
     *           type: integer
     *           default: 10
     *         description: Seuil de stock faible
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
    static async getLowStocks(req: Request, res: Response) {
        try {
            const threshold = req.query.threshold ? parseInt(req.query.threshold as string) : 10;
            const lowStocks = await inventoryService.getLowStocks(threshold);
            res.json(lowStocks);
        } catch (error) {
            res.status(500).json({ error: 'Erreur lors de la récupération des stocks faibles' });
        }
    }
}
