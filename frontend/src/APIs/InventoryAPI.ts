import type { StoreStockDTO } from '../DTOs/StoreStockDTO';
import { API_BASE } from '../config/api';
import { authFetch } from '../utils/authFetch';

/**
 * Récupère la liste des stocks centraux
 * @returns Une liste des stocks centraux paginée
 */
export async function getCentralStock(page?: number, limit?: number): Promise<{
    products: { productId: number; stock: number; name: string }[];
    total: number;
}> {
    const params = [];
    if (page !== undefined) params.push(`page=${page}`);
    if (limit !== undefined) params.push(`limit=${limit}`);
    const query = params.length ? `?${params.join('&')}` : '';
    return authFetch(`${API_BASE}/stock/central${query}`).then(r => r.json());
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