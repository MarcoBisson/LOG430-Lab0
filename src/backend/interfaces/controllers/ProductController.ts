import { Request, Response } from 'express';
import { ProductService } from '../../application/services/ProductService';
import { PrismaProductRepository } from '../../infrastructure/prisma/PrismaProductRepository';
import { AuthenticatedRequest } from '../middlewares/authentificateJWT';
import { UserRole } from '@prisma/client';
import { PrismaUserRepository } from '../../infrastructure/prisma/PrismaUserRepository';

const productRepository = new PrismaProductRepository();
const productService = new ProductService(productRepository);
const userRepository = new PrismaUserRepository();

export class ProductController {
    /**
     * Récupère une liste de tous les produits disponibles.
     * @param req La requête HTTP.
     * @param res La réponse HTTP.
     */
    static async list(req: AuthenticatedRequest, res: Response) {
        const products = await productService.listProducts();
        res.json(products);
    }

    /**
     * Recherche des produits par l'ID.
     * @param req La requête HTTP contenant l'ID du produit à rechercher.
     * @param res La réponse HTTP.
     */
    static async get(req: AuthenticatedRequest, res: Response) {
        const p = await productService.getProductById(+req.params.id);
        p ? res.json(p) : res.status(404).json({ error: 'Not found' });
    }

    /**
     * Recherche des produits par leur nom.
     * @param req La requête HTTP contenant le nom du produit à rechercher.
     * @param res La réponse HTTP.
     */
    static async getByName(req: AuthenticatedRequest, res: Response) {
        const p = await productService.getProductsByName(req.params.name);
        p ? res.json(p) : res.status(404).json({ error: 'Not found' });
    }

    /**
     * Recherche des produits par leur catégorie.
     * @param req La requête HTTP contenant la catégorie des produits à rechercher.
     * @param res La réponse HTTP.
     */
    static async getByCategory(req: AuthenticatedRequest, res: Response) {
        const p = await productService.getProductsByCategory(req.params.category);
        p ? res.json(p) : res.status(404).json({ error: 'Not found' });
    }

    /**
     * Créé un nouveau produit.
     * @param req La requête HTTP contenant les données du produit à créer.
     * @param res La réponse HTTP.
     */
    static async create(req: AuthenticatedRequest, res: Response) {
        if (req.user && req.user.role != UserRole.CLIENT){
            const p = await productService.createProduct(+req.params.id, req.body);
            res.status(201).json(p);
        } else {
            res.status(401).json({ error: 'Action Unauthorized' });
        }
    }

    /**
     * Met à jour un produit existant.
     * @param req La requête HTTP contenant l'ID du produit et les données à mettre à jour.
     * @param res La réponse HTTP.
     */
    static async update(req: AuthenticatedRequest, res: Response) {
        if (req.user && req.user.role != UserRole.CLIENT){
            const p = await productService.updateProduct(+req.params.productId,+req.params.storeId, req.body);
            res.json(p);
        } else {
            res.status(401).json({ error: 'Action Unauthorized' });
        }
    }

    /**
     * Supprime un produit existant.
     * @param req La requête HTTP contenant l'ID du produit à supprimer.
     * @param res La réponse HTTP.
     */
    static async delete(req: AuthenticatedRequest, res: Response) {
        if (req.user && req.user.role != UserRole.CLIENT){
            await productService.deleteProduct(+req.params.id);
            res.status(204).end();
        } else {
            res.status(401).json({ error: 'Action Unauthorized' });
        }
    }

     /**
     * Recherche des produits par store ID.
     * @param req La requête HTTP contenant l'ID du store.
     * @param res La réponse HTTP.
     */
     static async getByStore(req: AuthenticatedRequest, res: Response) {
        const storeId = req.params.id

        if (req.user){
            const access = await userRepository.getUserAccess(req.user.id)

            if (access.find( store => store.id == +storeId)){
                const p = await productService.getProductsByStore(+storeId);
                p ? res.json(p) : res.status(404).json({ error: 'Not found' });
            } else {
                res.status(401).json({ error: 'Acces Unauthorized' });
            }
        } else {
            res.status(403).json({ error: 'Invalid token' });
        }
    }
}