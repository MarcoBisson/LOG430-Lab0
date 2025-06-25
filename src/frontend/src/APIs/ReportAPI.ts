import { ReportDTO } from '../DTOs/ReportDTO';
import { API_BASE } from '../config/api';

/**
 * Récupère le rapport consolidé
 * @returns Le rapport consolidé
 */
export async function getReport(startDate?: string, endDate?: string): Promise<ReportDTO> {
    const params = new URLSearchParams();

    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const url = `${API_BASE}/reports/consolidated?${params.toString()}`;

    return fetch(url).then(r => r.json());
}