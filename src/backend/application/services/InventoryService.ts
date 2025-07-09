import type { ILogisticsRepository } from '../../domain/repositories/ILogisticsRepository';
import type { IStoreRepository } from '../../domain/repositories/IStoreRepository';
import { StoreStock } from '../../domain/entities/StoreStock';

export class InventoryService {
  constructor(private readonly logisticRepo: ILogisticsRepository, private readonly storeRepo: IStoreRepository) { }
  /**
   * Récupère une liste de tous les stocks centraux.
   * @returns Une liste de tous les stocks centraux avec l'ID du produit et la quantité disponible.
   */
  async getCentralStock(): Promise<{ productId: number; stock: number }[]> {
    return this.logisticRepo.findAllCentralStock();
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