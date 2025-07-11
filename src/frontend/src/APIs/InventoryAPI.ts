import type { StockDTO } from '../DTOs/StockDTO';
import type { StoreStockDTO } from '../DTOs/StoreStockDTO';
import { API_BASE } from '../config/api';
import { authFetch } from '../utils/authFetch';

/**
 * Récupère la liste des stocks centraux
 * @returns Une liste des stocks centraux
 */
export async function getCentralStock(): Promise<StockDTO[]> {
    return authFetch(`${API_BASE}/stock/central`).then(r => r.json());
}

/**
 * Récupère le stock d'un magasin spécifique
 * @param storeId L'identifiant du magasin
 * @returns Le stock du magasin
 */
export async function getStoreStock(storeId: number): Promise<StoreStockDTO[]> {
    return authFetch(`${API_BASE}/stock/store/${storeId}`)
        .then(res => res.json());
}