import { PrismaRepository } from '../../infrastructure/PrismaRepository';
import { ProductEntity } from '../entities';

export class ProductService {
    constructor(private repo = new PrismaRepository()) { }

    /**
     * Récupère une liste de tous les produits disponibles.
     * @returns Une liste de tous les produits disponibles.
     */
    async listProducts(): Promise<ProductEntity[]> {
        return (await this.repo.listProducts()).map(
            p => new ProductEntity(p.id, p.name, p.price, p.description, p.category, p.stock)
        );
    }

    /**
     * Créé un nouveau produit.
     * @param input Les informations du produit à créer.
     * @returns Une instance de ProductEntity représentant le produit créé.
     */
    async createProduct(input: {
        name: string;
        price: number;
        description?: string;
        category?: string;
        stock: number;
    }): Promise<ProductEntity> {
        const p = await this.repo.createProduct({
            name: input.name,
            price: input.price,
            description: input.description ?? null,
            category: input.category ?? null,
            stock: input.stock
        });
        return new ProductEntity(p.id, p.name, p.price, p.description, p.category, p.stock);
    }

    /**
     * Récupère un produit par son ID.
     * @param id L'ID du produit à récupérer.
     * @returns Une instance de ProductEntity représentant le produit, ou null si le produit n'existe pas.
     */
    async getProductById(id: number): Promise<ProductEntity | null> {
        const p = await this.repo.findProductById(id);
        return p ? new ProductEntity(p.id, p.name, p.price, p.description, p.category, p.stock) : null;
    }

    /**
     * Recherche des produits par nom.
     * @param name Le nom du produit à rechercher.
     * @returns Une liste de produits correspondant au nom recherché.
     */
    async getProductsByName(name: string): Promise<ProductEntity[]> {
        const products = await this.repo.findProductsByName(name);
        return products.map(
            p => new ProductEntity(p.id, p.name, p.price, p.description, p.category, p.stock)
        );
    }

    /**
     * Recherche des produits par catégorie.
     * @param category La catégorie des produits à rechercher.
     * @returns Une liste de produits correspondant à la catégorie recherchée.
     */
    async getProductsByCategory(category: string): Promise<ProductEntity[]> {
        const products = await this.repo.findProductsByCategory(category);
        return products.map(
            p => new ProductEntity(p.id, p.name, p.price, p.description, p.category, p.stock)
        );
    }

    /**
     * Met à jour un produit existant.
     * @param id L'ID du produit à mettre à jour.
     * @param data Les données à mettre à jour.
     * @returns Une instance de ProductEntity représentant le produit mis à jour.
     */
    async updateProduct(
        id: number,
        data: { name?: string; price?: number; description?: string; category?: string }
    ): Promise<ProductEntity> {
        const p = await this.repo.updateProduct(id, data);
        return new ProductEntity(p.id, p.name, p.price, p.description, p.category, p.stock);
    }

    /**
     * Supprime un produit par son ID.
     * @param id L'ID du produit à supprimer.
     * @returns Une instance de ProductEntity représentant le produit supprimé.
     */
    async deleteProduct(id: number): Promise<void> {
        const p = await this.repo.deleteProduct(id);
    }
}