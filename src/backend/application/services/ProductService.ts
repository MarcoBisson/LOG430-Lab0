
import { Product, ProductStock } from '../../domain/entities/Product';
import type { IProductRepository } from '../../domain/repositories/IProductRepository';

export class ProductService {
    constructor(private readonly productRepo: IProductRepository) { }

    /**
     * Récupère une liste de tous les produits disponibles.
     * @returns Une liste de tous les produits disponibles.
     */
    async listProducts(): Promise<Product[]> {
        return (await this.productRepo.listProducts()).map(
            p => new Product(p.id, p.name, p.price, p.description, p.category),
        );
    }

    /**
     * Créé un nouveau produit.
     * @param input Les informations du produit à créer.
     * @returns Une instance de ProductEntity représentant le produit créé.
     */
    async createProduct(
        storeId: number,
        input: {
        name: string;
        price: number;
        description?: string;
        category?: string;
        stock: number;
    }): Promise<Product> {
        const p = await this.productRepo.createProduct(storeId, {
            name: input.name,
            price: input.price,
            description: input.description ?? null,
            category: input.category ?? null,
            stock: input.stock ?? 0,
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
            p => new Product(p.id, p.name, p.price, p.description, p.category),
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
            p => new Product(p.id, p.name, p.price, p.description, p.category),
        );
    }

    /**
     * Met à jour un produit existant.
     * @param productId - L'ID du produit à mettre à jour.
     * @param storeId - L'ID du store où se trouve le produit.
     * @param data Les données à mettre à jour.
     * @returns Une instance de ProductEntity représentant le produit mis à jour.
     */
    async updateProduct(
        productId: number,
        storeId: number,
        data: { name?: string; price?: number; description?: string; category?: string; stock: number},
    ): Promise<ProductStock> {
        const p = await this.productRepo.updateProduct(productId, storeId, data);
        return new ProductStock(p.id, p.name, p.price, p.description, p.category, p.stock);
    }

    /**
     * Supprime un produit par son ID.
     * @param id L'ID du produit à supprimer.
     * @returns Une instance de ProductEntity représentant le produit supprimé.
     */
    async deleteProduct(id: number): Promise<void> {
        await this.productRepo.deleteProduct(id);
    }

    /**
     * Recherche des produits par store.
     * @param storeId L'ID du store des produits à rechercher.
     * @returns Une liste de produits correspondant au store recherchée.
     */
    async getProductsByStore(storeId: number): Promise<ProductStock[]> {
        const products = await this.productRepo.findProductsByStore(storeId);
        return products.map(
            p => new ProductStock(p.id, p.name, p.price, p.description, p.category, p.stock),
        );
    }
}
