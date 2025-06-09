import { CartItem, SaleEntity, SaleItemEntity } from '../entities';
import { PrismaRepository } from '../../infrastructure/PrismaRepository';

export class SaleService {
  constructor(private repo = new PrismaRepository()) { }

  /**
   * Récupère une vente par son ID.
   * @param saleId L'ID de la vente à récupérer.
   * @returns Une instance de SaleEntity représentant la vente, ou null si la vente n'existe pas.
   */
  async getSaleById(saleId: number): Promise<SaleEntity | null> {
    const sale = await this.repo.getSaleById(saleId);

    if (!sale) return null;

    return new SaleEntity(
      sale.id,
      sale.date,
      sale.storeId,
      sale.saleItems.map(
        (si: any) => new SaleItemEntity(si.id, si.saleId, si.productId, si.quantity, si.unitPrice)
      )
    );
  }

  /**
   * Enregistre une vente dans le système.
   * @param storeId L'ID du magasin où la vente a eu lieu.
   * @param items La liste des articles vendus, chaque article étant représenté par un CartItem contenant l'ID du produit et la quantité vendue.
   * @returns Une instance de SaleEntity représentant la vente enregistrée.
   * @throws Error si le stock est insuffisant pour l'un des produits.
   */
  async recordSale(storeId: number, items: CartItem[]): Promise<SaleEntity> {
    for (const c of items) {
      const ss = await this.repo.findStoreStockByProduct(storeId, c.productId);
      if (!ss || ss.quantity < c.quantity) throw new Error(`Insufficient stock for product ${c.productId}`);
    }

    const sale = await this.repo.createSale(storeId, items);
    for (const c of items) {
      await this.repo.decrementStoreStock(storeId, c.productId, c.quantity);
    }

    return new SaleEntity(
      sale.id,
      sale.date,
      sale.storeId,
      sale.saleItems.map(
        (si: any) => new SaleItemEntity(si.id, si.saleId, si.productId, si.quantity, si.unitPrice)
      )
    );
  }
}

