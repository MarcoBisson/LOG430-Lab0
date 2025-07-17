import type { ReplenishmentRequestDTO } from '../DTOs/ReplenishmentRequestDTO';
import type { StoreStockDTO } from '../DTOs/StoreStockDTO';
// import { API_BASE } from '../config/api';
// import { authFetch } from '../utils/authFetch';

/**
 * Envoie une demande de réapprovisionnement pour un produit dans un magasin spécifique.
 * @param storeId L'ID du magasin où le produit doit être réapprovisionné.
 * @param productId L'ID du produit à réapprovisionner.
 * @param quantity La quantité de produit à réapprovisionner.
 * @returns 
 */
export async function requestReplenishment(storeId: number, productId: number, quantity: number): Promise<ReplenishmentRequestDTO> {
    // Microservice logistics non implémenté - retourne des données mock
    console.warn('LogisticsAPI: requestReplenishment - Service non implémenté, retourne des données mock');
    
    // Code original commenté en attendant l'implémentation du microservice logistics
    // return authFetch(`${API_BASE}/logistics/replenishment`, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ storeId, productId, quantity }),
    // }).then(r => r.json());
    
    return Promise.resolve({
        id: Math.floor(Math.random() * 1000),
        storeId,
        productId,
        quantity,
        status: 'PENDING',
        createdAt: new Date().toISOString()
    });
}

/**
 * Approuve une demande de réapprovisionnement spécifique.
 * @param id L'ID de la demande de réapprovisionnement à approuver.
 * @returns La demande de réapprovisionnement approuvée.
 */
export async function approveReplenishment(id: number): Promise<ReplenishmentRequestDTO> {
    // Microservice logistics non implémenté - retourne des données mock
    console.warn('LogisticsAPI: approveReplenishment - Service non implémenté, retourne des données mock');
    
    // Code original commenté en attendant l'implémentation du microservice logistics
    // return authFetch(`${API_BASE}/logistics/replenishment/${id}/approve`, {
    //     method: 'POST',
    // }).then(res => res.json());
    
    return Promise.resolve({
        id,
        storeId: 1,
        productId: 1,
        quantity: 10,
        status: 'APPROVED',
        createdAt: new Date(Date.now() - 86400000).toISOString() // Hier
    });
}

/**
 * Recupere la liste des requetes de réapprovisionnement
 * @returns La liste des requetes de réapprovisionnement.
 */
export async function getReplenishments(): Promise<ReplenishmentRequestDTO[]> {
    // Microservice logistics non implémenté - retourne des données mock
    console.warn('LogisticsAPI: getReplenishments - Service non implémenté, retourne des données mock');
    
    // Code original commenté en attendant l'implémentation du microservice logistics
    // return authFetch(`${API_BASE}/logistics/replenishment`).then(res => res.json());
    
    return Promise.resolve([
        {
            id: 1,
            storeId: 1,
            productId: 1,
            quantity: 50,
            status: 'PENDING',
            createdAt: new Date().toISOString()
        },
        {
            id: 2,
            storeId: 2,
            productId: 2,
            quantity: 25,
            status: 'APPROVED',
            createdAt: new Date(Date.now() - 86400000).toISOString()
        }
    ]);
}


/**
 * Récupère toutes les alertes de stock pour les magasins.
 * @returns Un tableau d'objets StoreStockDTO contenant les alertes de stock.
 */
export async function getAlerts(): Promise<StoreStockDTO[]> {
    // Microservice logistics non implémenté - retourne des données mock
    console.warn('LogisticsAPI: getAlerts - Service non implémenté, retourne des données mock');
    
    // Code original commenté en attendant l'implémentation du microservice logistics
    // return authFetch(`${API_BASE}/logistics/alerts`).then(r => r.json());
    
    return Promise.resolve([
        {
            storeId: 1,
            productId: 1,
            quantity: 5
        },
        {
            storeId: 1,
            productId: 2,
            quantity: 2
        },
        {
            storeId: 2,
            productId: 1,
            quantity: 8
        }
    ]);
}