import type { Store } from '../entities/Store';
import type { StoreStock } from '../entities/StoreStock';

export interface CreateStoreData {
  name: string;
  address: string;
  type: 'SALES' | 'LOGISTICS' | 'HEADQUARTER';
}

export interface UpdateStoreData {
  name?: string;
  address?: string;
  type?: 'SALES' | 'LOGISTICS' | 'HEADQUARTER';
}

export interface IStoreRepository {
    /**
     * Trouve un magasin par son ID.
     * @param id L'ID du magasin à rechercher.
     * @return Le magasin trouvé ou null s'il n'existe pas.
     */
    findStoreById(id: number): Promise<Store | null>

    /**
     * Récupère tous les magasins.
     * @returns La liste de tous les magasins.
     */
    findAllStores(): Promise<Store[]>

    /**
     * Récupère les magasins par type.
     * @param type Le type de magasin.
     * @returns La liste des magasins du type spécifié.
     */
    findStoresByType(type: 'SALES' | 'LOGISTICS' | 'HEADQUARTER'): Promise<Store[]>

    /**
     * Crée un nouveau magasin.
     * @param storeData Les données du magasin à créer.
     * @returns Le magasin créé.
     */
    createStore(storeData: CreateStoreData): Promise<Store>

    /**
     * Met à jour un magasin.
     * @param id L'ID du magasin à mettre à jour.
     * @param storeData Les données à mettre à jour.
     * @returns Le magasin mis à jour ou null s'il n'existe pas.
     */
    updateStore(id: number, storeData: UpdateStoreData): Promise<Store | null>

    /**
     * Supprime un magasin.
     * @param id L'ID du magasin à supprimer.
     * @returns true si supprimé, false sinon.
     */
    deleteStore(id: number): Promise<boolean>

    /**
     * Récupère l'état du stock d'un magasin.
     * @param storeId - L'ID du magasin.
     * @returns La liste des produits avec leur ID et leur stock pour ce magasin.
     */
    findStoreStock(storeId: number): Promise<StoreStock[]>;

    /**
     * Trouve le stock d'un produit spécifique dans un magasin.
     * @param storeId - L'ID du magasin.
     * @param productId - L'ID du produit.
     * @returns Le stock du produit dans le magasin ou null s'il n'existe pas.
     */
    findStoreStockByProduct(storeId: number, productId: number): Promise<StoreStock | null>;

    /**
     * Décrémente le stock d'un produit dans un magasin.
     * @param storeId - L'ID du magasin.
     * @param productId - L'ID du produit.
     * @param quantity - La quantité à décrémenter.
     * @returns Le stock mis à jour.
     */
    decrementStoreStock(storeId: number, productId: number, qty: number): Promise<StoreStock>;

    /**
     * Incrémente le stock d'un produit dans un magasin.
     * @param storeId - L'ID du magasin.
     * @param productId - L'ID du produit.
     * @param quantity - La quantité à incrémenter.
     * @returns Le stock mis à jour.
     */
    incrementStoreStock(storeId: number, productId: number, qty: number): Promise<StoreStock>;

    /**
     * Crée ou met à jour le stock d'un produit dans un magasin.
     * @param storeId - L'ID du magasin.
     * @param productId - L'ID du produit.
     * @param quantity - La nouvelle quantité.
     * @returns Le stock créé ou mis à jour.
     */
    upsertStoreStock(storeId: number, productId: number, quantity: number): Promise<StoreStock>;

    /**
     * Trouve les stocks de magasins dont la quantité est inférieure à un seuil donné.
     * @param threshold Le seuil de quantité à comparer.
     * @returns La liste des stocks de magasins dont la quantité est inférieure au seuil.
     */
    findStoreStocksBelow(threshold: number): Promise<StoreStock[]>
}
