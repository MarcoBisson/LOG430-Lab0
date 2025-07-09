import type { ReplenishmentRequestStatus, Store, StoreStock } from '@prisma/client';
import type { ReplenishmentRequest } from '../entities/ReplenishmentRequest';


export interface ILogisticsRepository {
    /**
     * Récupère l'état du stock central.
     * @returns La liste des produits avec leur ID et leur stock.
     */
    findAllCentralStock(): Promise<{ productId: number; stock: number }[]>;

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
     * Crée une demande de réapprovisionnement pour un produit dans un magasin.
     * @param storeId L'ID du magasin où la demande est faite.
     * @param productId L'ID du produit à réapprovisionner.
     * @param quantity La quantité demandée pour le réapprovisionnement.
     * @returns La demande de réapprovisionnement créée.
     */
    createReplenishmentRequest(storeId: number, productId: number, quantity: number): Promise<ReplenishmentRequest>;

    /**
     * Récupère toutes les demandes de réapprovisionnement pour un magasin.
     * @param storeId L'ID du magasin dont on veut les demandes.
     * @returns La liste des demandes de réapprovisionnement pour le magasin.
     */
    getReplenishmentRequestsByStore(storeId: number): Promise<ReplenishmentRequest[]>;

    /**
     * Récupère une demande de réapprovisionnement par son ID.
     * @param id L'ID de la demande à récupérer.
     * @returns La demande de réapprovisionnement trouvée, ou null si elle n'existe pas.
     */
    getReplenishmentRequest(id: number): Promise<ReplenishmentRequest | null>;

    /**
     * Récupère toutes les demandes de réapprovisionnement.
     * @returns La liste des demandes de réapprovisionnement.
     */
    getReplenishmentRequests(): Promise<ReplenishmentRequest[]>;

    /**
     * Récupère tous les magasins de type logistique.
     * @returns La liste des magasins de type logistique.
     */
    getLogisticStores(): Promise<Store[]>;

    /**
     * Met à jour le statut d'une demande de réapprovisionnement.
     * @param id L'ID de la demande à mettre à jour.
     * @param status Le nouveau statut de la demande.
     * @returns La demande de réapprovisionnement mise à jour.
     */
    updateReplenishmentStatus(id: number, status: ReplenishmentRequestStatus): Promise<ReplenishmentRequest>;
}