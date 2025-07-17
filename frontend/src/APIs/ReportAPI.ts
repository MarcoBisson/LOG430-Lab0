import type { ReportDTO } from '../DTOs/ReportDTO';
// import { authFetch } from '../utils/authFetch';

/**
 * Récupère le rapport consolidé
 * @returns Le rapport consolidé
 */
export async function getReport(
    startDate?: string,
    endDate?: string,
    options?: {
        limit?: number;
        stockOffset?: number;
    },
): Promise<ReportDTO> {
    // Microservice logistics non implémenté - retourne des données mock pour les rapports
    console.warn('ReportAPI: getReport - Service non implémenté, retourne des données mock');
    
    // Code original commenté en attendant l'implémentation du microservice logistics
    // const params = new URLSearchParams();
    // if (startDate) params.append('startDate', startDate);
    // if (endDate) params.append('endDate', endDate);
    // if (options) {
    //     if (options.limit !== undefined) params.append('limit', String(options.limit));
    //     if (options.stockOffset !== undefined) params.append('stockOffset', String(options.stockOffset));
    // }
    // const url = `/api/reports/consolidated?${params.toString()}`;
    // return authFetch(url).then(r => r.json());

    // Données mock pour les rapports
    return Promise.resolve({
        salesByStore: [
            { storeId: 1, totalQuantity: 150 },
            { storeId: 2, totalQuantity: 230 },
            { storeId: 3, totalQuantity: 180 },
            { storeId: 4, totalQuantity: 95 },
        ],
        topProducts: [
            { productId: 101, totalQuantity: 85 },
            { productId: 203, totalQuantity: 72 },
            { productId: 156, totalQuantity: 64 },
            { productId: 89, totalQuantity: 58 },
            { productId: 245, totalQuantity: 45 },
        ],
        centralStock: [
            { productId: 101, stock: 120 },
            { productId: 203, stock: 85 },
            { productId: 156, stock: 45 },
            { productId: 89, stock: 200 },
            { productId: 245, stock: 15 },
            { productId: 167, stock: 75 },
            { productId: 298, stock: 110 },
        ],
        centralStockTotal: 650
    });
}