import { ReportDTO } from '../DTOs/ReportDTO';
import { API_BASE } from '../config/api';

/**
 * Récupère le rapport consolidé
 * @returns Le rapport consolidé
 */
export async function getReport(): Promise<ReportDTO> {
    return fetch(`${API_BASE}/reports/consolidated`).then(r => r.json());
}