import { PrismaRepository } from "../../infrastructure/PrismaRepository";

export class ReturnService {
  constructor(private repo: PrismaRepository) {}

  /** 
   * Annule la vente : 
   * - restitution du stock 
   * - suppression de la vente 
   */
  async processReturn(saleId: number): Promise<void> {
    const sale = await this.repo.getSaleById(saleId);
    if (!sale) throw new Error(`Vente ${saleId} introuvable.`);
    // Restauration du stock
    for (const item of sale.items) {
      await this.repo.incrementStock(item.productId, item.quantity);
    }
    // Suppression de la vente
    await this.repo.deleteSale(saleId);
    console.log(`Vente ${saleId} annulée avec succès.`);
  }
}
