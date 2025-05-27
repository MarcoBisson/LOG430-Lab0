import { PrismaRepository } from "../../infrastructure/PrismaRepository";
import { CartItem } from "../entities";

export class SaleService {
  constructor(private repo: PrismaRepository) {}

  async recordSale(items: CartItem[]): Promise<void> {
    // Vérifier stock
    for (const item of items) {
      const p = await this.repo.findProductById(item.productId);
      if (!p || p.stock < item.quantity) {
        throw new Error(`Stock insuffisant pour le produit ${item.productId}`);
      }
    }
    // Créer la vente
    const sale = await this.repo.createSale(items);
    // Mettre à jour le stock
    for (const item of items) {
      await this.repo.decrementStock(item.productId, item.quantity);
    }
    console.log(`Vente ${sale.id} enregistrée le ${sale.date}`);
  }
}
