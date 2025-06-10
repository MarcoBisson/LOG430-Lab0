import { StockDTO } from '../DTOs/StockDTO';
import { StoreStockDTO } from '../DTOs/StoreStockDTO';
import { API_BASE } from '../config/api';

/**
 * Récupère la liste des stocks centraux
 * @returns Une liste des stocks centraux
 */
export async function getCentralStock(): Promise<StockDTO[]> {
    return fetch(`${API_BASE}/stock/central`).then(r => r.json());
}

/**
 * Récupère le stock d'un magasin spécifique
 * @param storeId L'identifiant du magasin
 * @returns Le stock du magasin
 */
export async function getStoreStock(storeId: number): Promise<StoreStockDTO[]> {
    return fetch(`${API_BASE}/stock/store/${storeId}`)
        .then(res => res.json());
}