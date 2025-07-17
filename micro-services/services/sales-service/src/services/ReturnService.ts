import type { ISaleRepository } from '../repositories/ISaleRepository';

export class ReturnService {
    constructor(private readonly saleRepo: ISaleRepository) { }

    /**
     * Traite le retour d'une vente en supprimant la vente du système.
     * Note: La réintégration du stock sera gérée par une communication inter-services
     * avec le service inventory ou store selon l'architecture choisie.
     * @param saleId L'ID de la vente à retourner.
     * @throws Error si la vente n'existe pas.
     */
    async processReturn(saleId: number): Promise<void> {
        const sale = await this.saleRepo.getSaleById(saleId);
        if (!sale) throw new Error(`Vente ${saleId} introuvable.`);

        // Note: Dans une architecture microservices, il faudrait notifier 
        // le service inventory/store pour réintégrer le stock
        // Exemple: await this.inventoryService.restoreStock(sale.storeId, sale.saleItems);

        await this.saleRepo.deleteSale(saleId);
    }
}
