import type { ISaleRepository } from '../repositories/ISaleRepository';
import { Sale } from '../entities/Sale';
import { SaleItem } from '../entities/SaleItem';
import type { CartItem } from '../entities/CartItem';

export class SaleService {
  constructor(private readonly saleRepo: ISaleRepository) { }

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
    // Note: La validation du stock sera gérée par une communication inter-services
    // avec le service inventory ou store selon l'architecture choisie

    const sale = await this.saleRepo.createSale(storeId, items);

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
   * Récupère les ventes groupées par magasin.
   * @param userId L'ID de l'utilisateur pour vérifier les accès.
   * @param startDate Date de début (optionnelle).
   * @param endDate Date de fin (optionnelle).
   * @param limit Limite du nombre de résultats (optionnelle).
   * @returns Une liste des ventes groupées par magasin avec la quantité totale vendue.
   */
  async groupSalesByStore(userId: number, startDate?: Date, endDate?: Date, limit?: number): Promise<{ storeId: number; totalQuantity: number }[]> {
    return this.saleRepo.groupSalesByStore(userId, startDate, endDate, limit);
  }

  /**
   * Récupère les produits les plus vendus.
   * @param userId L'ID de l'utilisateur pour vérifier les accès.
   * @param limit Le nombre maximum de produits à retourner.
   * @param startDate Date de début (optionnelle).
   * @param endDate Date de fin (optionnelle).
   * @returns Une liste des produits les plus vendus avec leur ID et la quantité totale vendue.
   */
  async getTopProducts(userId: number, limit: number, startDate?: Date, endDate?: Date): Promise<{ productId: number; totalQuantity: number }[]> {
    return this.saleRepo.getTopProducts(userId, limit, startDate, endDate);
  }
}
