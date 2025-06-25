import { Product } from "../entities/Product";

export interface IProductRepository {
    /**
     * Crée un produit avec les données fournies.
     * @param data - Les données du produit à créer.
     * @returns Le produit créé.
     */
    createProduct(data: {
        name: string;
        price: number;
        description?: string | null;
        category?: string | null;
    }): Promise<Product>;

    /**
     * Recherche un produit par son ID.
     * @param id - L'ID du produit à rechercher.
     * @returns Le produit trouvé ou null s'il n'existe pas.
     */
    findProductById(id: number): Promise<Product | null>;

    /**
     * Recherche des produits par leur nom.
     * @param name - Le nom du produit à rechercher.
     * @returns La liste des produits correspondants.
     */
    findProductsByName(name: string): Promise<Product[]>;

    /** 
     * Recherche des produits par leur catégorie.
    * @param category - La catégorie des produits à rechercher.
    * @returns La liste des produits correspondants.
    */
    findProductsByCategory(category: string): Promise<Product[]>;

    /**
     * Liste tous les produits.
     * @returns La liste de tous les produits.
     */
    listProducts(): Promise<Product[]>;

    /**
     * Met à jour un produit avec les données fournies.
     * @param id - L'ID du produit à mettre à jour.
     * @param data - Les données à mettre à jour.
     * @returns Le produit mis à jour.
     */
    updateProduct(
        id: number,
        data: Partial<Pick<Product, 'name' | 'price' | 'description' | 'category'>>
    ): Promise<Product>;

    /**
     * Supprime un produit par son ID.
     * @param id - L'ID du produit à supprimer.
     * @returns Le produit supprimé.
     */
    deleteProduct(id: number): Promise<Product>;
}