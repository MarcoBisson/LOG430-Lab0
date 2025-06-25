import { Sale } from '../entities/Sale';
import { SaleItem } from '../entities/SaleItem';

export interface ISaleRepository {
    /**
     * Crée une vente avec les items fournis.
     * @param storeId - L'ID du magasin où la vente a eu lieu.
     * @param items - Les items de la vente, avec ID du produit et quantité.
     * @returns La vente créée avec ses items.
     */
    createSale(storeId: number, items: { productId: number; quantity: number }[]): Promise<Sale & { saleItems: SaleItem[] }>;

    /**
     * Récupère une vente par son ID, incluant ses items.
     * @param id - L'ID de la vente à récupérer.
     * @returns La vente trouvée avec ses items, ou null si elle n'existe pas.
     */
    getSaleById(id: number): Promise<(Sale & { saleItems: SaleItem[] }) | null>;

    /**
     * Supprime une vente par son ID.
     * @param id - L'ID de la vente à supprimer.
     */
    deleteSale(id: number): Promise<void>;

    /**
     * Récupère toutes les ventes d'un magasin.
     * @returns Une liste des ventes groupées par magasin, avec la quantité totale vendue pour chaque magasin.
     */
    groupSalesByStore(startDate?: Date, endDate?: Date): Promise<{ storeId: number; totalQuantity: number }[]>;

    /**
     * Récupère les produits les plus vendus.
     * @param limit Le nombre maximum de produits à retourner.
     * @returns  Une liste des produits les plus vendus, avec leur ID et la quantité totale vendue.
     */
    getTopProducts(limit: number,startDate?: Date, endDate?: Date): Promise<{ productId: number; totalQuantity: number }[]>;
}