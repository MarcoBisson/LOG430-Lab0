import { ProductDTO } from "../DTOs/ProductDTO";
import { API_BASE } from "@/config/api";

/**
 * Fetches tous les produits disponibles dans la base de données.
 * @returns Une promesse qui résout un tableau de ProductDTO.
 */
export async function getProducts(): Promise<ProductDTO[]> {
    return fetch(`${API_BASE}/products`).then(r => r.json());
}

/**
 * Récupère un produit spécifique par son ID.
 * @param id L'identifiant du produit à récupérer.
 * @returns Une promesse qui résout le ProductDTO correspondant.
 */
export async function getProduct(id: number): Promise<ProductDTO> {
    return fetch(`${API_BASE}/products/${id}`).then(r => r.json());
}

/**
 * Recherche des produits par leur nom.
 * @param name Le nom du produit à rechercher.
 * @returns Une promesse qui résout un tableau de ProductDTO correspondant aux produits trouvés.
 */
export async function searchProductsByName(name: string): Promise<ProductDTO[]> {
    return fetch(`${API_BASE}/products/search/name/${encodeURIComponent(name)}`)
        .then(r => r.json());
}

/**
 * Recherche des produits par leur catégorie.
 * @param cat La catégorie des produits à rechercher.
 * @returns Une promesse qui résout un tableau de ProductDTO correspondant aux produits trouvés.
 */
export async function searchProductsByCategory(cat: string): Promise<ProductDTO[]> {
    return fetch(`${API_BASE}/products/search/category/${encodeURIComponent(cat)}`)
        .then(r => r.json());
}

/**
 * Recherche des produits par leur nom et catégorie.
 * @param name Le nom du produit à rechercher.
 * @param cat La catégorie des produits à rechercher.
 * @returns Une promesse qui résout un tableau de ProductDTO correspondant aux produits trouvés.
 */
export async function createProduct(data: Omit<ProductDTO, 'id'>): Promise<ProductDTO> {
    return fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).then(r => r.json());
}

/**
 * Met à jour un produit existant dans la base de données.
 * @param id L'ID du produit à mettre à jour.
 * @param data Les données à mettre à jour, excluant l'ID.
 * @returns Une promesse qui résout le ProductDTO mis à jour.
 */
export async function updateProduct(id: number, data: Partial<Omit<ProductDTO, 'id'>>): Promise<ProductDTO> {
    return fetch(`${API_BASE}/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).then(r => r.json());
}

/**
 * Supprime un produit de la base de données.
 * @param id L'ID du produit à supprimer.
 * @returns Une promesse qui résout lorsque la suppression est terminée.
 */
export async function deleteProduct(id: number): Promise<void> {
    await fetch(`${API_BASE}/products/${id}`, { method: 'DELETE' });
}