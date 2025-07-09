import type { ISaleRepository } from '../../domain/repositories/ISaleRepository';
import type { IStoreRepository } from '../../domain/repositories/IStoreRepository';

export class ReturnService {
    constructor(private readonly saleRepo: ISaleRepository, private readonly storeRepo: IStoreRepository) { }

    /**
     * Traite le retour d'une vente en réintégrant les produits dans le stock du magasin.
     * @param saleId L'ID de la vente à retourner.
     * @throws Error si la vente n'existe pas ou si le stock ne peut pas être mis à jour.
     */
    async processReturn(saleId: number): Promise<void> {
        const sale = await this.saleRepo.getSaleById(saleId);
        if (!sale) throw new Error(`Vente ${saleId} introuvable.`);

        for (const item of sale.saleItems) {
            await this.storeRepo.incrementStoreStock(sale.storeId, item.productId, item.quantity);
        }

        await this.saleRepo.deleteSale(saleId);
    }
}