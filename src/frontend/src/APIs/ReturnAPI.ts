import { API_BASE } from "../config/api";

/**
 * Retourne un produit d'une vente et retire la vente de la liste des ventes.
 * @param saleId L'ID de la vente à retourner.
 */
export async function processReturn(saleId: number): Promise<void> {
    await fetch(`${API_BASE}/returns${saleId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ saleId })
    });
}