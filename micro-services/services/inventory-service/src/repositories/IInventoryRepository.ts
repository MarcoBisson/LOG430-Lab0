import type { StoreStock } from '../entities/StoreStock';

export interface IInventoryRepository {
    /**
     * Retourne la liste paginée du stock central avec nom du produit.
     */
    findAllCentralStock(page?: number, limit?: number): Promise<{ products: { productId: number; stock: number; name: string }[]; total: number }>;

    /**
     * Décrémente le stock central d'un produit.
     * @param productId - L'ID du produit à mettre à jour.
     * @param qty - La quantité à décrémenter.
     * @returns Le produit mis à jour.
     */
    decrementCentralStock(storeId: number, productId: number, qty: number): Promise<StoreStock>;

    /**
     * Incrémente le stock central d'un produit.
     * @param productId - L'ID du produit à mettre à jour.
     * @param qty - La quantité à incrémenter.
     * @returns Le produit mis à jour.
     */
    incrementCentralStock(storeId: number, productId: number, qty: number): Promise<StoreStock>;

    /**
     * Récupère le stock d'un magasin spécifique.
     * @param storeId L'ID du magasin pour lequel récupérer le stock.
     * @returns Une liste d'objets StoreStock représentant le stock du magasin.
     */
    findStoreStock(storeId: number): Promise<StoreStock[]>;

    /**
     * Récupère le stock d'un produit dans un magasin spécifique.
     * @param storeId L'ID du magasin.
     * @param productId L'ID du produit.
     * @returns Le stock du produit dans le magasin ou null.
     */
    findStoreStockByProduct(storeId: number, productId: number): Promise<StoreStock | null>;

    /**
     * Met à jour le stock d'un produit dans un magasin.
     * @param storeId L'ID du magasin.
     * @param productId L'ID du produit.
     * @param quantity La nouvelle quantité.
     * @returns Le stock mis à jour.
     */
    upsertStoreStock(storeId: number, productId: number, quantity: number): Promise<StoreStock>;

    /**
     * Incrémente le stock d'un produit dans un magasin.
     * @param storeId L'ID du magasin.
     * @param productId L'ID du produit.
     * @param quantity La quantité à ajouter.
     * @returns Le stock mis à jour.
     */
    incrementStoreStock(storeId: number, productId: number, quantity: number): Promise<StoreStock>;

    /**
     * Décrémente le stock d'un produit dans un magasin.
     * @param storeId L'ID du magasin.
     * @param productId L'ID du produit.
     * @param quantity La quantité à retirer.
     * @returns Le stock mis à jour.
     */
    decrementStoreStock(storeId: number, productId: number, quantity: number): Promise<StoreStock>;

    /**
     * Trouve les stocks en dessous d'un seuil.
     * @param threshold Le seuil en dessous duquel un stock est considéré comme faible.
     * @returns La liste des stocks faibles.
     */
    findStoreStocksBelow(threshold: number): Promise<StoreStock[]>;
}
