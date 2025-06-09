import { PrismaRepository } from '../../infrastructure/PrismaRepository';
import { StoreStockEntity } from '../entities';

export class InventoryService {
  constructor(private repo = new PrismaRepository()) { }

  /**
   * Récupère une liste de tous les stocks centraux.
   * @returns Une liste de tous les stocks centraux avec l'ID du produit et la quantité disponible.
   */
  async getCentralStock(): Promise<{ productId: number; stock: number }[]> {
    return this.repo.findAllCentralStock();
  }

  /**
   * Récupère le stock d'un magasin spécifique.
   * @param storeId L'ID du magasin pour lequel récupérer le stock.
   * @returns Une liste d'objets StoreStockEntity représentant le stock du magasin.
   */
  async getStoreStock(storeId: number): Promise<StoreStockEntity[]> {
    return (await this.repo.findStoreStock(storeId)).map(
      ss => new StoreStockEntity(ss.id, ss.storeId, ss.productId, ss.quantity)
    );
  }
}