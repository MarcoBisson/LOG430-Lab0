import type { ReportDTO } from '../DTOs/ReportDTO';
import { API_BASE } from '../config/api';
import { authFetch } from '../utils/authFetch';

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
    const params = new URLSearchParams();

    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (options) {
        if (options.limit !== undefined) params.append('limit', String(options.limit));
        if (options.stockOffset !== undefined) params.append('stockOffset', String(options.stockOffset));
    }

    const url = `${API_BASE}/reports/consolidated?${params.toString()}`;

    return authFetch(url).then(r => r.json());
}