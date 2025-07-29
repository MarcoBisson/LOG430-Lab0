import type { Request, Response } from 'express';
import { ReturnService } from '../services/ReturnService';
import { PrismaSaleRepository } from '../infrastructure/PrismaSaleRepository';

export class ReturnController {
    private static returnService: ReturnService;
    private static saleRepository: PrismaSaleRepository;

    static setServices(returnService: ReturnService, saleRepository: PrismaSaleRepository) {
        this.returnService = returnService;
        this.saleRepository = saleRepository;
    }
    /**
     * Enregistre un retour de produit dans le système.
     * @param req La requête HTTP contenant les détails du retour.
     * @param res La réponse HTTP.
     */
    static async process(req: Request, res: Response) {
        try {
            const saleId = req.params.saleId ? +req.params.saleId : (req.body.saleId ? +req.body.saleId : 0);
            
            const sale = await this.saleRepository.getSaleById(saleId);
            if (!sale) {
                console.warn(`Sale ID ${saleId} not found`);
                res.status(404).json({ 
                    error: 'Not Found', 
                    message: 'Vente introuvable' 
                });
                return;
            }

            console.log(`Processing return for sale ${sale.id}`);
            await this.returnService.processReturn(sale.id);
            console.log(`Return processed successfully for sale ${sale.id}`);
            res.status(204).end();
        } catch (err: any) {
            console.error('Error processing return:', err.message);
            res.status(400).json({ 
                error: 'Bad Request', 
                message: `Erreur processus de retour pour saleId ${req.params.saleId || req.body.saleId}`,
                details: err.message 
            });
        }
    }
}
