import { PrismaRepository } from '../../infrastructure/PrismaRepository';

export class ReturnService {
    constructor(private repo = new PrismaRepository()) { }

    /**
     * Traite le retour d'une vente en réintégrant les produits dans le stock du magasin.
     * @param saleId L'ID de la vente à retourner.
     * @throws Error si la vente n'existe pas ou si le stock ne peut pas être mis à jour.
     */
    async processReturn(saleId: number): Promise<void> {
        const sale = await this.repo.getSaleById(saleId);
        if (!sale) throw new Error(`Vente ${saleId} introuvable.`);

        for (const item of sale.saleItems) {
            await this.repo.incrementStoreStock(sale.storeId, item.productId, item.quantity);
        }

        await this.repo.deleteSale(saleId);
    }
}