import type { Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { StockService } from '../services/StoreService';
import { PrismaStoreRepository } from '../repositories/PrismaStoreRepository';

const storeRepository = new PrismaStoreRepository();
const stockService = new StockService(storeRepository);

export class StockController {
    /**
     * Récupère le stock d'un magasin.
     */
    static async getStoreStock(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const storeId = parseInt(req.params.storeId);
            const stocks = await stockService.getStoreStock(storeId);
            res.json(stocks);
        } catch (error: any) {
            res.status(500).json({ error: 'Erreur lors de la récupération du stock', details: error.message });
        }
    }

    /**
     * Récupère le stock d'un produit dans un magasin.
     */
    static async getProductStock(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const storeId = parseInt(req.params.storeId);
            const productId = parseInt(req.params.productId);
            const stock = await stockService.getProductStock(storeId, productId);
            
            if (!stock) {
                return res.status(404).json({ error: 'Stock non trouvé pour ce produit dans ce magasin' });
            }

            res.json(stock);
        } catch (error: any) {
            res.status(500).json({ error: 'Erreur lors de la récupération du stock du produit', details: error.message });
        }
    }

    /**
     * Met à jour le stock d'un produit dans un magasin.
     */
    static async updateStock(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const storeId = parseInt(req.params.storeId);
            const productId = parseInt(req.params.productId);
            const { quantity } = req.body;

            const stock = await stockService.updateStock(storeId, productId, quantity);
            res.json(stock);
        } catch (error: any) {
            res.status(500).json({ error: 'Erreur lors de la mise à jour du stock', details: error.message });
        }
    }

    /**
     * Incrémente le stock d'un produit.
     */
    static async incrementStock(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const storeId = parseInt(req.params.storeId);
            const productId = parseInt(req.params.productId);
            const { quantity } = req.body;

            const stock = await stockService.incrementStock(storeId, productId, quantity);
            res.json(stock);
        } catch (error: any) {
            res.status(500).json({ error: 'Erreur lors de l\'incrémentation du stock', details: error.message });
        }
    }

    /**
     * Décrémente le stock d'un produit.
     */
    static async decrementStock(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const storeId = parseInt(req.params.storeId);
            const productId = parseInt(req.params.productId);
            const { quantity } = req.body;

            const stock = await stockService.decrementStock(storeId, productId, quantity);
            res.json(stock);
        } catch (error: any) {
            res.status(500).json({ error: 'Erreur lors de la décrémentation du stock', details: error.message });
        }
    }

    /**
     * Récupère les stocks faibles.
     */
    static async getLowStocks(req: Request, res: Response) {
        try {
            const threshold = req.query.threshold ? parseInt(req.query.threshold as string) : 10;
            const stocks = await stockService.getLowStocks(threshold);
            res.json(stocks);
        } catch (error: any) {
            res.status(500).json({ error: 'Erreur lors de la récupération des stocks faibles', details: error.message });
        }
    }
}

// Validateurs pour les routes stock
export const storeIdValidators = [
    param('storeId').isInt().withMessage('ID de magasin invalide')
];

export const productStockValidators = [
    param('storeId').isInt().withMessage('ID de magasin invalide'),
    param('productId').isInt().withMessage('ID de produit invalide')
];

export const updateStockValidators = [
    param('storeId').isInt().withMessage('ID de magasin invalide'),
    param('productId').isInt().withMessage('ID de produit invalide'),
    body('quantity').isInt({ min: 0 }).withMessage('La quantité doit être un entier positif')
];

export const stockOperationValidators = [
    param('storeId').isInt().withMessage('ID de magasin invalide'),
    param('productId').isInt().withMessage('ID de produit invalide'),
    body('quantity').isInt({ min: 1 }).withMessage('La quantité doit être un entier positif')
];
