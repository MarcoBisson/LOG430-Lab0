import type { Request, Response } from 'express';
import { SaleService } from '../services/SaleService';

export class SaleController {
    private static saleService: SaleService;

    static setSaleService(service: SaleService) {
        this.saleService = service;
    }
    /**
     * Enregistre une vente dans le système.
     * @param req La requête HTTP contenant les détails de la vente.
     * @param res La réponse HTTP.
     */
    static async record(req: Request, res: Response) {
        try {
            const sale = await this.saleService.recordSale(+req.body.storeId, req.body.items);
            console.log(`Sale ${sale.id} recorded successfully`);
            res.status(201).json(sale);
        } catch (err: any) {
            console.error('Error recording sale:', err.message);
            res.status(400).json({ 
                error: 'Bad Request', 
                message: "Erreur lors de l'enregistrement de la vente",
                details: err.message 
            });
        }
    }

    /**
     * Récupère une vente par son ID.
     * @param req La requête HTTP contenant l'ID de la vente.
     * @param res La réponse HTTP.
     */
    static async get(req: Request, res: Response) {
        try {
            const saleId = req.params.id ? +req.params.id : 0;
            const sale = await this.saleService.getSaleById(saleId);
            if (sale) {
                console.log(`Sale ${req.params.id} retrieved successfully`);
                res.json(sale);
            } else {
                console.warn(`Sale ${req.params.id} not found`);
                res.status(404).json({ 
                    error: 'Not Found', 
                    message: 'Vente non trouvée' 
                });
            }
        } catch (err: any) {
            console.error('Error retrieving sale:', err.message);
            res.status(500).json({ 
                error: 'Internal Server Error', 
                message: 'Erreur lors de la récupération de la vente' 
            });
        }
    }

    /**
     * Récupère les ventes groupées par magasin.
     * @param req La requête HTTP avec les paramètres de filtrage.
     * @param res La réponse HTTP.
     */
    static async groupByStore(req: Request, res: Response) {
        try {
            const userId = req.query.userId ? +req.query.userId : 0;
            const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
            const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
            const limit = req.query.limit ? +req.query.limit : undefined;

            const sales = await this.saleService.groupSalesByStore(userId, startDate, endDate, limit);
            console.log(`Sales grouped by store retrieved successfully for user ${userId}`);
            res.json(sales);
        } catch (err: any) {
            console.error('Error grouping sales by store:', err.message);
            res.status(500).json({ 
                error: 'Internal Server Error', 
                message: 'Erreur lors de la récupération des ventes par magasin' 
            });
        }
    }

    /**
     * Récupère les produits les plus vendus.
     * @param req La requête HTTP avec les paramètres de filtrage.
     * @param res La réponse HTTP.
     */
    static async getTopProducts(req: Request, res: Response) {
        try {
            const userId = req.query.userId ? +req.query.userId : 0;
            const limit = req.query.limit ? +req.query.limit : 10;
            const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
            const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

            const products = await this.saleService.getTopProducts(userId, limit, startDate, endDate);
            console.log(`Top products retrieved successfully for user ${userId}`);
            res.json(products);
        } catch (err: any) {
            console.error('Error retrieving top products:', err.message);
            res.status(500).json({ 
                error: 'Internal Server Error', 
                message: 'Erreur lors de la récupération des produits les plus vendus' 
            });
        }
    }
}
