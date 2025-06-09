import { SaleDTO } from "@/DTOs/SaleDTO";
import { CartItemDTO } from "@/DTOs/CartItemDTO";
import { API_BASE } from "@/config/api";

/**
 * Enregistre une vente dans le système
 * @param storeId L'identifiant du magasin où la vente a eu lieu
 * @param items La liste des articles vendus
 * @returns Les détails de la vente enregistrée
 */
export async function recordSale(storeId: number, items: CartItemDTO[]): Promise<SaleDTO> {
    return fetch(`${API_BASE}/sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeId, items })
    }).then(r => r.json());
}

/**
 * Récupère la vente par son ID
 * @param id L'ID de la vente à récupérer
 * @returns Les détails de la vente
 */
export async function getSale(id: number): Promise<SaleDTO> {
    return fetch(`${API_BASE}/sales/${id}`)
        .then(res => {
            if (!res.ok) throw new Error(`Sale ${id} not found`);
            return res.json();
        });
}