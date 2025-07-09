import type { Store } from '../entities/Store';
import type { StoreStock } from '../entities/StoreStock';

export interface IStoreRepository {
    /**
     * Trouve un magasin par son ID.
     * @param id L'ID du magasin à rechercher.
     * @return Le magasin trouvé ou null s'il n'existe pas.
     */
    findStoreById(id: number): Promise<Store | null>

    /**
     * Récupère l'état du stock d'un magasin.
     * @param storeId - L'ID du magasin.
     * @returns La liste des produits avec leur ID et leur stock pour ce magasin.
     */
    findStoreStock(storeId: number): Promise<StoreStock[]>;

    /**
     * Crée ou met à jour le stock d'un produit dans un magasin.
     * @param storeId - L'ID du magasin.
     * @param productId - L'ID du produit.
     * @returns Le stock mis à jour ou créé.
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
     * Trouve les stocks de magasins dont la quantité est inférieure à un seuil donné.
     * @param threshold Le seuil de quantité à comparer.
     * @returns La liste des stocks de magasins dont la quantité est inférieure au seuil.
     */
    findStoreStocksBelow(threshold: number): Promise<StoreStock[]>
}