import type { ISaleRepository } from '../../domain/repositories/ISaleRepository';
import type { IStoreRepository } from '../../domain/repositories/IStoreRepository';
import { Sale } from '../../domain/entities/Sale';
import { SaleItem } from '../../domain/entities/SaleItem';
import type { CartItem } from '../../domain/entities/CartItem';

export class SaleService {
  constructor(private readonly saleRepo: ISaleRepository, private readonly storeRepo: IStoreRepository) { }

  /**
   * Récupère une vente par son ID.
   * @param saleId L'ID de la vente à récupérer.
   * @returns Une instance de Sale représentant la vente, ou null si la vente n'existe pas.
   */
  async getSaleById(saleId: number): Promise<Sale | null> {
    const sale = await this.saleRepo.getSaleById(saleId);

    if (!sale) return null;

    return new Sale(
      sale.id,
      sale.date,
      sale.storeId,
      sale.saleItems.map(
        (si: any) => new SaleItem(si.id, si.saleId, si.productId, si.quantity, si.unitPrice),
      ),
    );
  }

  /**
   * Enregistre une vente dans le système.
   * @param storeId L'ID du magasin où la vente a eu lieu.
   * @param items La liste des articles vendus, chaque article étant représenté par un CartItem contenant l'ID du produit et la quantité vendue.
   * @returns Une instance de Sale représentant la vente enregistrée.
   * @throws Error si le stock est insuffisant pour l'un des produits.
   */
  async recordSale(storeId: number, items: CartItem[]): Promise<Sale> {
    for (const c of items) {
      const ss = await this.storeRepo.findStoreStockByProduct(storeId, c.productId);
      if (!ss || ss.quantity < c.quantity) throw new Error(`Insufficient stock for product ${c.productId}`);
    }

    const sale = await this.saleRepo.createSale(storeId, items);
    for (const c of items) {
      await this.storeRepo.decrementStoreStock(storeId, c.productId, c.quantity);
    }

    return new Sale(
      sale.id,
      sale.date,
      sale.storeId,
      sale.saleItems.map(
        (si: any) => new SaleItem(si.id, si.saleId, si.productId, si.quantity, si.unitPrice),
      ),
    );
  }
}

