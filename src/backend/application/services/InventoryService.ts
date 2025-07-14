import type { ILogisticsRepository } from '../../domain/repositories/ILogisticsRepository';
import type { IStoreRepository } from '../../domain/repositories/IStoreRepository';
import { StoreStock } from '../../domain/entities/StoreStock';

export class InventoryService {
  constructor(private readonly logisticRepo: ILogisticsRepository, private readonly storeRepo: IStoreRepository) { }
  /**
   * Récupère une liste paginée de tous les stocks centraux.
   * @returns Un objet { products, total } avec le nom du produit.
   */
  async getCentralStock(page?: number, limit?: number): Promise<{ products: { productId: number; stock: number; name: string }[]; total: number }> {
    return this.logisticRepo.findAllCentralStock(page, limit);
  }

  /**
   * Récupère le stock d'un magasin spécifique.
   * @param storeId L'ID du magasin pour lequel récupérer le stock.
   * @returns Une liste d'objets StoreStock représentant le stock du magasin.
   */
  async getStoreStock(storeId: number): Promise<StoreStock[]> {
    return (await this.storeRepo.findStoreStock(storeId)).map(
      ss => new StoreStock(ss.id, ss.storeId, ss.productId, ss.quantity),
    );
  }
}