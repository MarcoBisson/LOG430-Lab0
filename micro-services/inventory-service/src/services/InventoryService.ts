import type { IInventoryRepository } from '../repositories/IInventoryRepository';
import { StoreStock } from '../entities/StoreStock';

export class InventoryService {
  constructor(private readonly inventoryRepo: IInventoryRepository) { }
  
  /**
   * Récupère une liste paginée de tous les stocks centraux.
   * @returns Un objet { products, total } avec le nom du produit.
   */
  async getCentralStock(page?: number, limit?: number): Promise<{ products: { productId: number; stock: number; name: string }[]; total: number }> {
    return this.inventoryRepo.findAllCentralStock(page, limit);
  }

  /**
   * Récupère le stock d'un magasin spécifique.
   * @param storeId L'ID du magasin pour lequel récupérer le stock.
   * @returns Une liste d'objets StoreStock représentant le stock du magasin.
   */
  async getStoreStock(storeId: number): Promise<StoreStock[]> {
    return (await this.inventoryRepo.findStoreStock(storeId)).map(
      ss => new StoreStock(ss.id, ss.storeId, ss.productId, ss.quantity),
    );
  }

  /**
   * Récupère le stock d'un produit dans un magasin.
   * @param storeId L'ID du magasin.
   * @param productId L'ID du produit.
   * @returns Le stock du produit dans le magasin ou null.
   */
  async getProductStock(storeId: number, productId: number): Promise<StoreStock | null> {
    const stock = await this.inventoryRepo.findStoreStockByProduct(storeId, productId);
    return stock ? new StoreStock(stock.id, stock.storeId, stock.productId, stock.quantity) : null;
  }

  /**
   * Met à jour le stock d'un produit dans un magasin.
   * @param storeId L'ID du magasin.
   * @param productId L'ID du produit.
   * @param quantity La nouvelle quantité.
   * @returns Le stock mis à jour.
   */
  async updateStock(storeId: number, productId: number, quantity: number): Promise<StoreStock> {
    const stock = await this.inventoryRepo.upsertStoreStock(storeId, productId, quantity);
    return new StoreStock(stock.id, stock.storeId, stock.productId, stock.quantity);
  }

  /**
   * Incrémente le stock d'un produit.
   * @param storeId L'ID du magasin.
   * @param productId L'ID du produit.
   * @param quantity La quantité à ajouter.
   * @returns Le stock mis à jour.
   */
  async incrementStock(storeId: number, productId: number, quantity: number): Promise<StoreStock> {
    const stock = await this.inventoryRepo.incrementStoreStock(storeId, productId, quantity);
    return new StoreStock(stock.id, stock.storeId, stock.productId, stock.quantity);
  }

  /**
   * Décrémente le stock d'un produit.
   * @param storeId L'ID du magasin.
   * @param productId L'ID du produit.
   * @param quantity La quantité à retirer.
   * @returns Le stock mis à jour.
   */
  async decrementStock(storeId: number, productId: number, quantity: number): Promise<StoreStock> {
    const stock = await this.inventoryRepo.decrementStoreStock(storeId, productId, quantity);
    return new StoreStock(stock.id, stock.storeId, stock.productId, stock.quantity);
  }

  /**
   * Trouve les stocks faibles.
   * @param threshold Le seuil en dessous duquel un stock est considéré comme faible.
   * @returns La liste des stocks faibles.
   */
  async getLowStocks(threshold: number = 10): Promise<StoreStock[]> {
    return (await this.inventoryRepo.findStoreStocksBelow(threshold)).map(
      ss => new StoreStock(ss.id, ss.storeId, ss.productId, ss.quantity),
    );
  }

  /**
   * Décrémente le stock central d'un produit.
   * @param storeId L'ID du magasin central.
   * @param productId L'ID du produit.
   * @param quantity La quantité à décrémenter.
   * @returns Le stock mis à jour.
   */
  async decrementCentralStock(storeId: number, productId: number, quantity: number): Promise<StoreStock> {
    const stock = await this.inventoryRepo.decrementCentralStock(storeId, productId, quantity);
    return new StoreStock(stock.id, stock.storeId, stock.productId, stock.quantity);
  }

  /**
   * Incrémente le stock central d'un produit.
   * @param storeId L'ID du magasin central.
   * @param productId L'ID du produit.
   * @param quantity La quantité à incrémenter.
   * @returns Le stock mis à jour.
   */
  async incrementCentralStock(storeId: number, productId: number, quantity: number): Promise<StoreStock> {
    const stock = await this.inventoryRepo.incrementCentralStock(storeId, productId, quantity);
    return new StoreStock(stock.id, stock.storeId, stock.productId, stock.quantity);
  }
}
