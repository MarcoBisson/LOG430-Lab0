import { ReplenishmentRequestDTO } from '../DTOs/ReplenishmentRequestDTO';
import { StoreStockDTO } from '../DTOs/StoreStockDTO';
import { API_BASE } from '../config/api';

/**
 * Envoie une demande de réapprovisionnement pour un produit dans un magasin spécifique.
 * @param storeId L'ID du magasin où le produit doit être réapprovisionné.
 * @param productId L'ID du produit à réapprovisionner.
 * @param quantity La quantité de produit à réapprovisionner.
 * @returns 
 */
export async function requestReplenishment(storeId: number, productId: number, quantity: number): Promise<ReplenishmentRequestDTO> {
    return fetch(`${API_BASE}/logistics/replenishment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeId, productId, quantity })
    }).then(r => r.json());
}

/**
 * Approuve une demande de réapprovisionnement spécifique.
 * @param id L'ID de la demande de réapprovisionnement à approuver.
 * @returns La demande de réapprovisionnement approuvée.
 */
export async function approveReplenishment(id: number): Promise<ReplenishmentRequestDTO> {
    return fetch(`${API_BASE}/logistics/replenishment/${id}/approve`, {
        method: 'POST'
    }).then(res => res.json());
}

/**
 * Récupère toutes les alertes de stock pour les magasins.
 * @returns Un tableau d'objets StoreStockDTO contenant les alertes de stock.
 */
export async function getAlerts(): Promise<StoreStockDTO[]> {
    return fetch(`${API_BASE}/logistics/alerts`).then(r => r.json());
}