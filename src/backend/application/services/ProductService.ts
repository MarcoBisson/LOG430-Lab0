
import { Product } from '../../domain/entities/Product';
import { IProductRepository } from '../../domain/repositories/IProductRepository';

export class ProductService {
    constructor(private productRepo: IProductRepository) { }

    /**
     * Récupère une liste de tous les produits disponibles.
     * @returns Une liste de tous les produits disponibles.
     */
    async listProducts(): Promise<Product[]> {
        return (await this.productRepo.listProducts()).map(
            p => new Product(p.id, p.name, p.price, p.description, p.category)
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
    }): Promise<Product> {
        const p = await this.productRepo.createProduct({
            name: input.name,
            price: input.price,
            description: input.description ?? null,
            category: input.category ?? null,
        });
        return new Product(p.id, p.name, p.price, p.description, p.category);
    }

    /**
     * Récupère un produit par son ID.
     * @param id L'ID du produit à récupérer.
     * @returns Une instance de ProductEntity représentant le produit, ou null si le produit n'existe pas.
     */
    async getProductById(id: number): Promise<Product | null> {
        const p = await this.productRepo.findProductById(id);
        return p ? new Product(p.id, p.name, p.price, p.description, p.category) : null;
    }

    /**
     * Recherche des produits par nom.
     * @param name Le nom du produit à rechercher.
     * @returns Une liste de produits correspondant au nom recherché.
     */
    async getProductsByName(name: string): Promise<Product[]> {
        const products = await this.productRepo.findProductsByName(name);
        return products.map(
            p => new Product(p.id, p.name, p.price, p.description, p.category)
        );
    }

    /**
     * Recherche des produits par catégorie.
     * @param category La catégorie des produits à rechercher.
     * @returns Une liste de produits correspondant à la catégorie recherchée.
     */
    async getProductsByCategory(category: string): Promise<Product[]> {
        const products = await this.productRepo.findProductsByCategory(category);
        return products.map(
            p => new Product(p.id, p.name, p.price, p.description, p.category)
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
    ): Promise<Product> {
        const p = await this.productRepo.updateProduct(id, data);
        return new Product(p.id, p.name, p.price, p.description, p.category);
    }

    /**
     * Supprime un produit par son ID.
     * @param id L'ID du produit à supprimer.
     * @returns Une instance de ProductEntity représentant le produit supprimé.
     */
    async deleteProduct(id: number): Promise<void> {
        const p = await this.productRepo.deleteProduct(id);
    }

    // /**
    //  * Recherche des produits par catégorie.
    //  * @param storeId La catégorie des produits à rechercher.
    //  * @returns Une liste de produits correspondant à la catégorie recherchée.
    //  */
    // async getProductsByStore(storeId: number): Promise<Product[]> {
    //     const products = await this.productRepo.findProductsByCategory(category);
    //     return products.map(
    //         p => new Product(p.id, p.name, p.price, p.description, p.category)
    //     );
    // }
}