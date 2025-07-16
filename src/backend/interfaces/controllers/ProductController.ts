import type { Response } from 'express';
import { ProductService } from '../../application/services/ProductService';
import { PrismaProductRepository } from '../../infrastructure/prisma/PrismaProductRepository';
import type { AuthenticatedRequest } from '../middlewares/authentificateJWT';
import { UserRole } from '@prisma/client';
import { PrismaUserRepository } from '../../../../services/user-service/src/repositories/PrismaUserRepository';
import { errorResponse } from '../../utils/errorResponse';
import { createControllerLogger } from '../../utils/logger';

const productRepository = new PrismaProductRepository();
const productService = new ProductService(productRepository);
const userRepository = new PrismaUserRepository();
const log = createControllerLogger('ProductController');

export class ProductController {
    /**
     * Récupère une liste de tous les produits disponibles.
     * @param req La requête HTTP.
     * @param res La réponse HTTP.
     */
    static async list(req: AuthenticatedRequest, res: Response) {
        const products = await productService.listProducts();
        log.info('get list product successfull', {products});
        res.json(products);
    }

    /**
     * Recherche des produits par l'ID.
     * @param req La requête HTTP contenant l'ID du produit à rechercher.
     * @param res La réponse HTTP.
     */
    static async get(req: AuthenticatedRequest, res: Response) {
        const p = await productService.getProductById(+req.params.id);
        if (p) {
            log.info('getProductById successfull', {p});
            res.json(p);
        } else {
            log.warn(`getProductById fail, productId ${req.params.id} not found`);
            errorResponse(res, 404, 'Not Found', 'Produit non trouvé', req.originalUrl);
        }
    }

    /**
     * Recherche des produits par leur nom.
     * @param req La requête HTTP contenant le nom du produit à rechercher.
     * @param res La réponse HTTP.
     */
    static async getByName(req: AuthenticatedRequest, res: Response) {
        const p = await productService.getProductsByName(req.params.name);
        if (p) {
            log.info('getProductsByName successfull', {p});
            res.json(p);
        } else {
            log.warn(`getProductsByName fail, product ${req.params.name} not found`);
            errorResponse(res, 404, 'Not Found', 'Produit non trouvé', req.originalUrl);
        }
    }

    /**
     * Recherche des produits par leur catégorie.
     * @param req La requête HTTP contenant la catégorie des produits à rechercher.
     * @param res La réponse HTTP.
     */
    static async getByCategory(req: AuthenticatedRequest, res: Response) {
        const p = await productService.getProductsByCategory(req.params.category);
        if (p && p.length > 0) {
            log.info('getProductsByCategory successfull', {p});
            res.json(p);
        } else {
            log.warn(`getProductsByCategory fail, products from category ${req.params.category} not found`);
            errorResponse(res, 404, 'Not Found', 'Produit non trouvé', req.originalUrl);
        }
    }

    /**
     * Créé un nouveau produit.
     * @param req La requête HTTP contenant les données du produit à créer.
     * @param res La réponse HTTP.
     */
    static async create(req: AuthenticatedRequest, res: Response) {
        if (req.user && req.user.role !== UserRole.CLIENT){
            const p = await productService.createProduct(+req.params.id, req.body);
            log.info(`Create product ${p.name} successfull`, {p});
            res.status(201).json(p);
        } else {
            log.warn(`Action Unauthorized for ${req.user?.username} (${req.user?.role})`);
            errorResponse(res, 401, 'Unauthorized', 'Action Unauthorized', req.originalUrl);
        }
    }

    /**
     * Met à jour un produit existant.
     * @param req La requête HTTP contenant l'ID du produit et les données à mettre à jour.
     * @param res La réponse HTTP.
     */
    static async update(req: AuthenticatedRequest, res: Response) {
        if (req.user && req.user.role !== UserRole.CLIENT){
            const p = await productService.updateProduct(+req.params.productId,+req.params.storeId, req.body);
            log.info(`Update product ${p.name} successfull`, {p});
            res.json(p);
        } else {
            log.warn(`Action Unauthorized for ${req.user?.username} (${req.user?.role})`);
            errorResponse(res, 401, 'Unauthorized', 'Action Unauthorized', req.originalUrl);
        }
    }

    /**
     * Supprime un produit existant.
     * @param req La requête HTTP contenant l'ID du produit à supprimer.
     * @param res La réponse HTTP.
     */
    static async delete(req: AuthenticatedRequest, res: Response) {
        if (req.user && req.user.role !== UserRole.CLIENT){
            await productService.deleteProduct(+req.params.id);
            log.info(`Delete product id ${req.params.id} successfull`);
            res.status(204).end();
        } else {
            log.warn(`Action Unauthorized for ${req.user?.username} (${req.user?.role})`);
            errorResponse(res, 401, 'Unauthorized', 'Action Unauthorized', req.originalUrl);
        }
    }

     /**
     * Recherche des produits par store ID.
     * @param req La requête HTTP contenant l'ID du store.
     * @param res La réponse HTTP.
     */
     static async getByStore(req: AuthenticatedRequest, res: Response) {
        const storeId = req.params.id;
        const query = req.query || {};
        const page = query.page ? parseInt(query.page as string) : undefined;
        const limit = query.limit ? parseInt(query.limit as string) : undefined;

        if (req.user){
            const access = await userRepository.getUserAccess(req.user.id);

            if (access.find( store => store.id === +storeId)){
                const p = await productService.getProductsByStore(+storeId, page, limit);
                if (p && p.products && p.products.length > 0) {
                    log.info(`getProductsByStore for store ${storeId} successfull`, {p});
                    res.json(p);
                } else {
                    log.warn(`getProductsByStore fail, no products found for store ${storeId}`);
                    errorResponse(res, 404, 'Not Found', 'Produit non trouvé', req.originalUrl);
                }
            } else {
                log.warn(`Access Unauthorized for ${req.user?.username} (${req.user?.role})`);
                errorResponse(res, 401, 'Unauthorized', 'Acces Unauthorized', req.originalUrl);
            }
        } else {
            log.warn('Invalid token');
            errorResponse(res, 403, 'Forbidden', 'Invalid token', req.originalUrl);
        }
    }
}
