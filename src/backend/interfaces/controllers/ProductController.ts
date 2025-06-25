import { Request, Response } from 'express';
import { ProductService } from '../../application/services/ProductService';
import { PrismaProductRepository } from '../../infrastructure/prisma/PrismaProductRepository';

const productRepository = new PrismaProductRepository();
const productService = new ProductService(productRepository);

export class ProductController {
    /**
     * Récupère une liste de tous les produits disponibles.
     * @param req La requête HTTP.
     * @param res La réponse HTTP.
     */
    static async list(req: Request, res: Response) {
        const products = await productService.listProducts();
        res.json(products);
    }

    /**
     * Recherche des produits par l'ID.
     * @param req La requête HTTP contenant l'ID du produit à rechercher.
     * @param res La réponse HTTP.
     */
    static async get(req: Request, res: Response) {
        const p = await productService.getProductById(+req.params.id);
        p ? res.json(p) : res.status(404).json({ error: 'Not found' });
    }

    /**
     * Recherche des produits par leur nom.
     * @param req La requête HTTP contenant le nom du produit à rechercher.
     * @param res La réponse HTTP.
     */
    static async getByName(req: Request, res: Response) {
        const p = await productService.getProductsByName(req.params.name);
        p ? res.json(p) : res.status(404).json({ error: 'Not found' });
    }

    /**
     * Recherche des produits par leur catégorie.
     * @param req La requête HTTP contenant la catégorie des produits à rechercher.
     * @param res La réponse HTTP.
     */
    static async getByCategory(req: Request, res: Response) {
        const p = await productService.getProductsByCategory(req.params.category);
        p ? res.json(p) : res.status(404).json({ error: 'Not found' });
    }

    /**
     * Créé un nouveau produit.
     * @param req La requête HTTP contenant les données du produit à créer.
     * @param res La réponse HTTP.
     */
    static async create(req: Request, res: Response) {
        const p = await productService.createProduct(req.body);
        res.status(201).json(p);
    }

    /**
     * Met à jour un produit existant.
     * @param req La requête HTTP contenant l'ID du produit et les données à mettre à jour.
     * @param res La réponse HTTP.
     */
    static async update(req: Request, res: Response) {
        const p = await productService.updateProduct(+req.params.id, req.body);
        res.json(p);
    }

    /**
     * Supprime un produit existant.
     * @param req La requête HTTP contenant l'ID du produit à supprimer.
     * @param res La réponse HTTP.
     */
    static async delete(req: Request, res: Response) {
        await productService.deleteProduct(+req.params.id);
        res.status(204).end();
    }

     /**
     * Recherche des produits par store ID.
     * @param req La requête HTTP contenant l'ID du store.
     * @param res La réponse HTTP.
     */
     static async getByStore(req: Request, res: Response) {
        const p = await productService.getProductById(+req.params.id);
        p ? res.json(p) : res.status(404).json({ error: 'Not found' });
    }
}