import type { IStoreRepository, CreateStoreData, UpdateStoreData } from '../repositories/IStoreRepository';
import type { Store } from '../entities/Store';
import type { StoreStock } from '../entities/StoreStock';

export class StoreService {
    constructor(private readonly storeRepository: IStoreRepository) {}

    /**
     * Récupère un magasin par son ID.
     * @param id L'ID du magasin.
     * @returns Le magasin ou null s'il n'existe pas.
     */
    async getStoreById(id: number): Promise<Store | null> {
        return this.storeRepository.findStoreById(id);
    }

    /**
     * Récupère tous les magasins.
     * @returns La liste de tous les magasins.
     */
    async getAllStores(): Promise<Store[]> {
        return this.storeRepository.findAllStores();
    }

    /**
     * Récupère les magasins par type.
     * @param type Le type de magasin.
     * @returns La liste des magasins du type spécifié.
     */
    async getStoresByType(type: 'SALES' | 'LOGISTICS' | 'HEADQUARTER'): Promise<Store[]> {
        return this.storeRepository.findStoresByType(type);
    }

    /**
     * Crée un nouveau magasin.
     * @param storeData Les données du magasin à créer.
     * @returns Le magasin créé.
     */
    async createStore(storeData: CreateStoreData): Promise<Store> {
        return this.storeRepository.createStore(storeData);
    }

    /**
     * Met à jour un magasin.
     * @param id L'ID du magasin à mettre à jour.
     * @param storeData Les données à mettre à jour.
     * @returns Le magasin mis à jour ou null s'il n'existe pas.
     */
    async updateStore(id: number, storeData: UpdateStoreData): Promise<Store | null> {
        return this.storeRepository.updateStore(id, storeData);
    }

    /**
     * Supprime un magasin.
     * @param id L'ID du magasin à supprimer.
     * @returns true si supprimé, false sinon.
     */
    async deleteStore(id: number): Promise<boolean> {
        return this.storeRepository.deleteStore(id);
    }
}

export class StockService {
    constructor(private readonly storeRepository: IStoreRepository) {}

    /**
     * Récupère le stock d'un magasin.
     * @param storeId L'ID du magasin.
     * @returns La liste des stocks du magasin.
     */
    async getStoreStock(storeId: number): Promise<StoreStock[]> {
        return this.storeRepository.findStoreStock(storeId);
    }

    /**
     * Récupère le stock d'un produit dans un magasin.
     * @param storeId L'ID du magasin.
     * @param productId L'ID du produit.
     * @returns Le stock du produit dans le magasin ou null.
     */
    async getProductStock(storeId: number, productId: number): Promise<StoreStock | null> {
        return this.storeRepository.findStoreStockByProduct(storeId, productId);
    }

    /**
     * Met à jour le stock d'un produit dans un magasin.
     * @param storeId L'ID du magasin.
     * @param productId L'ID du produit.
     * @param quantity La nouvelle quantité.
     * @returns Le stock mis à jour.
     */
    async updateStock(storeId: number, productId: number, quantity: number): Promise<StoreStock> {
        return this.storeRepository.upsertStoreStock(storeId, productId, quantity);
    }

    /**
     * Incrémente le stock d'un produit.
     * @param storeId L'ID du magasin.
     * @param productId L'ID du produit.
     * @param quantity La quantité à ajouter.
     * @returns Le stock mis à jour.
     */
    async incrementStock(storeId: number, productId: number, quantity: number): Promise<StoreStock> {
        return this.storeRepository.incrementStoreStock(storeId, productId, quantity);
    }

    /**
     * Décrémente le stock d'un produit.
     * @param storeId L'ID du magasin.
     * @param productId L'ID du produit.
     * @param quantity La quantité à retirer.
     * @returns Le stock mis à jour.
     */
    async decrementStock(storeId: number, productId: number, quantity: number): Promise<StoreStock> {
        return this.storeRepository.decrementStoreStock(storeId, productId, quantity);
    }

    /**
     * Trouve les stocks faibles.
     * @param threshold Le seuil en dessous duquel un stock est considéré comme faible.
     * @returns La liste des stocks faibles.
     */
    async getLowStocks(threshold: number = 10): Promise<StoreStock[]> {
        return this.storeRepository.findStoreStocksBelow(threshold);
    }
}
