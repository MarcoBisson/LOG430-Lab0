import type { Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { StoreService } from '../services/StoreService';
import { PrismaStoreRepository } from '../repositories/PrismaStoreRepository';

const storeRepository = new PrismaStoreRepository();
const storeService = new StoreService(storeRepository);

export class StoreController {
    /**
     * Récupère tous les magasins.
     */
    static async getAll(req: Request, res: Response) {
        try {
            const stores = await storeService.getAllStores();
            res.json(stores);
        } catch (error: any) {
            res.status(500).json({ error: 'Erreur lors de la récupération des magasins', details: error.message });
        }
    }

    /**
     * Récupère un magasin par son ID.
     */
    static async getById(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const id = parseInt(req.params.id);
            const store = await storeService.getStoreById(id);
            
            if (!store) {
                return res.status(404).json({ error: 'Magasin non trouvé' });
            }

            res.json(store);
        } catch (error: any) {
            res.status(500).json({ error: 'Erreur lors de la récupération du magasin', details: error.message });
        }
    }

    /**
     * Récupère les magasins par type.
     */
    static async getByType(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const type = req.params.type as 'SALES' | 'LOGISTICS' | 'HEADQUARTER';
            const stores = await storeService.getStoresByType(type);
            res.json(stores);
        } catch (error: any) {
            res.status(500).json({ error: 'Erreur lors de la récupération des magasins par type', details: error.message });
        }
    }

    /**
     * Crée un nouveau magasin.
     */
    static async create(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const store = await storeService.createStore(req.body);
            res.status(201).json(store);
        } catch (error: any) {
            res.status(500).json({ error: 'Erreur lors de la création du magasin', details: error.message });
        }
    }

    /**
     * Met à jour un magasin.
     */
    static async update(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const id = parseInt(req.params.id);
            const store = await storeService.updateStore(id, req.body);
            
            if (!store) {
                return res.status(404).json({ error: 'Magasin non trouvé' });
            }

            res.json(store);
        } catch (error: any) {
            res.status(500).json({ error: 'Erreur lors de la mise à jour du magasin', details: error.message });
        }
    }

    /**
     * Supprime un magasin.
     */
    static async delete(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const id = parseInt(req.params.id);
            const deleted = await storeService.deleteStore(id);
            
            if (!deleted) {
                return res.status(404).json({ error: 'Magasin non trouvé' });
            }

            res.status(204).send();
        } catch (error: any) {
            res.status(500).json({ error: 'Erreur lors de la suppression du magasin', details: error.message });
        }
    }
}

// Validateurs pour les routes
export const createStoreValidators = [
    body('name').notEmpty().withMessage('Le nom est requis'),
    body('address').notEmpty().withMessage('L\'adresse est requise'),
    body('type').isIn(['SALES', 'LOGISTICS', 'HEADQUARTER']).withMessage('Type de magasin invalide')
];

export const updateStoreValidators = [
    param('id').isInt().withMessage('ID invalide'),
    body('name').optional().notEmpty().withMessage('Le nom ne peut pas être vide'),
    body('address').optional().notEmpty().withMessage('L\'adresse ne peut pas être vide'),
    body('type').optional().isIn(['SALES', 'LOGISTICS', 'HEADQUARTER']).withMessage('Type de magasin invalide')
];

export const idValidators = [
    param('id').isInt().withMessage('ID invalide')
];

export const typeValidators = [
    param('type').isIn(['SALES', 'LOGISTICS', 'HEADQUARTER']).withMessage('Type de magasin invalide')
];
