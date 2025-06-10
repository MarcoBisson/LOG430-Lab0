import { Product, Sale, SaleItem, Store, StoreStock, ReplenishmentRequest, RequestStatus } from '@prisma/client';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class PrismaRepository {
  // Products
  /**
   * Crée un produit avec les données fournies.
   * @param data - Les données du produit à créer.
   * @returns Le produit créé.
   */
  async createProduct(data: {
    name: string;
    price: number;
    description?: string | null;
    category?: string | null;
    stock: number;
  }): Promise<Product> {
    return prisma.product.create({ data });
  }

  /**
   * Recherche un produit par son ID.
   * @param id - L'ID du produit à rechercher.
   * @returns Le produit trouvé ou null s'il n'existe pas.
   */
  async findProductById(id: number): Promise<Product | null> {
    return prisma.product.findUnique({ where: { id } });
  }

  /**
   * Recherche des produits par leur nom.
   * @param name - Le nom du produit à rechercher.
   * @returns La liste des produits correspondants.
   */
  async findProductsByName(name: string): Promise<Product[]> {
    return prisma.product.findMany({
      where: { name: { contains: name, mode: 'insensitive' } },
    });
  }

  /**
   * Recherche des produits par leur catégorie.
   * @param category - La catégorie des produits à rechercher.
   * @returns La liste des produits correspondants.
   */
  async findProductsByCategory(category: string): Promise<Product[]> {
    return prisma.product.findMany({
      where: { category },
    });
  }

  /**
   * Liste tous les produits.
   * @returns La liste de tous les produits.
   */
  async listProducts(): Promise<Product[]> {
    return prisma.product.findMany();
  }

  /**
   * Supprime un produit par son ID.
   * @param id - L'ID du produit à supprimer.
   * @returns Le produit supprimé.
   */
  async updateProduct(
    id: number,
    data: Partial<Pick<Product, 'name' | 'price' | 'description' | 'category'>>
  ): Promise<Product> {
    return prisma.product.update({ where: { id }, data });
  }

  /**
   * Supprime un produit par son ID.
   * @param id - L'ID du produit à supprimer.
   * @returns Le produit supprimé.
   */
  async deleteProduct(id: number): Promise<Product> {
    return prisma.product.delete({ where: { id } });
  }

  // Central stock
  /**
   * Récupère l'état du stock central.
   * @returns La liste des produits avec leur ID et leur stock.
   */
  async findAllCentralStock(): Promise<{ productId: number; stock: number }[]> {
    const products = await prisma.product.findMany({ select: { id: true, stock: true } });
    return products.map(p => ({ productId: p.id, stock: p.stock }));
  }

  /**
   * Décrémente le stock central d'un produit.
   * @param productId - L'ID du produit à mettre à jour.
   * @param qty - La quantité à décrémenter.
   * @returns Le produit mis à jour.
   */
  async decrementCentralStock(productId: number, qty: number): Promise<Product> {
    return prisma.product.update({ where: { id: productId }, data: { stock: { decrement: qty } } });
  }

  /**
   * Incrémente le stock central d'un produit.
   * @param productId - L'ID du produit à mettre à jour.
   * @param qty - La quantité à incrémenter.
   * @returns Le produit mis à jour.
   */
  async incrementCentralStock(productId: number, qty: number): Promise<Product> {
    return prisma.product.update({ where: { id: productId }, data: { stock: { increment: qty } } });
  }

  // Store
  async findStoreById(id: number): Promise<Store | null> {
    return prisma.store.findUnique({ where: { id: id } });
  }

  // StoreStock
  /**
   * Récupère l'état du stock d'un magasin.
   * @param storeId - L'ID du magasin.
   * @returns La liste des produits avec leur ID et leur stock pour ce magasin.
   */
  async findStoreStock(storeId: number): Promise<StoreStock[]> {
    return prisma.storeStock.findMany({ where: { storeId } });
  }

  /**
   * Crée ou met à jour le stock d'un produit dans un magasin.
   * @param storeId - L'ID du magasin.
   * @param productId - L'ID du produit.
   * @returns Le stock mis à jour ou créé.
   */
  async findStoreStockByProduct(storeId: number, productId: number): Promise<StoreStock | null> {
    return prisma.storeStock.findFirst({ where: { storeId, productId } });
  }

  /**
   * Décrémente le stock d'un produit dans un magasin.
   * @param storeId - L'ID du magasin.
   * @param productId - L'ID du produit.
   * @param quantity - La quantité à décrémenter.
   * @returns Le stock mis à jour.
   */
  async decrementStoreStock(storeId: number, productId: number, qty: number): Promise<StoreStock> {
    return prisma.storeStock.update({
      where: { storeId_productId: { storeId, productId } },
      data: { quantity: { decrement: qty } }
    });
  }

  /**
   * Incrémente le stock d'un produit dans un magasin.
   * @param storeId - L'ID du magasin.
   * @param productId - L'ID du produit.
   * @param quantity - La quantité à incrémenter.
   * @returns Le stock mis à jour.
   */
  async incrementStoreStock(storeId: number, productId: number, qty: number): Promise<StoreStock> {
    return prisma.storeStock.update({
      where: { storeId_productId: { storeId, productId } },
      data: { quantity: { increment: qty } }
    });
  }

  // Sales
  /**
   * Crée une vente avec les items fournis.
   * @param storeId - L'ID du magasin où la vente a eu lieu.
   * @param items - Les items de la vente, avec ID du produit et quantité.
   * @returns La vente créée avec ses items.
   */
  async createSale(storeId: number, items: { productId: number; quantity: number }[]): Promise<Sale & { saleItems: SaleItem[] }> {
    return prisma.sale.create({
      data: {
        storeId,
        saleItems: { create: items.map(i => ({ productId: i.productId, quantity: i.quantity, unitPrice: /* fetch current price */ 0 })) }
      },
      include: { saleItems: true }
    });
  }

  /**
   * Récupère une vente par son ID, incluant ses items.
   * @param id - L'ID de la vente à récupérer.
   * @returns La vente trouvée avec ses items, ou null si elle n'existe pas.
   */
  async getSaleById(id: number): Promise<(Sale & { saleItems: SaleItem[] }) | null> {
    return prisma.sale.findUnique({
      where: { id },
      include: { saleItems: true },
    });
  }

  /**
   * Supprime une vente par son ID.
   * @param id - L'ID de la vente à supprimer.
   */
  async deleteSale(id: number): Promise<void> {
    await prisma.saleItem.deleteMany({ where: { saleId: id } });
    await prisma.sale.delete({ where: { id } });
  }

  /**
   * Récupère toutes les ventes d'un magasin.
   * @returns Une liste des ventes groupées par magasin, avec la quantité totale vendue pour chaque magasin.
   */
  async groupSalesByStore(): Promise<{ storeId: number; totalQuantity: number }[]> {
    const sales = await prisma.sale.findMany({
      select: {
        storeId: true,
        saleItems: { select: { quantity: true } }
      }
    });

    const map: Record<number, number> = {};
    for (const sale of sales) {
      const sum: number = sale.saleItems.reduce((acc: number, si: { quantity: number }) => acc + si.quantity, 0);
      map[sale.storeId] = (map[sale.storeId] || 0) + sum;
    }

    return Object.entries(map).map(([storeId, totalQuantity]) => ({
      storeId: Number(storeId),
      totalQuantity
    }));
  }

  /**
   * Récupère les produits les plus vendus.
   * @param limit Le nombre maximum de produits à retourner.
   * @returns  Une liste des produits les plus vendus, avec leur ID et la quantité totale vendue.
   */
  async getTopProducts(limit: number): Promise<{ productId: number; totalQuantity: number }[]> {
    const items = await prisma.saleItem.findMany({ select: { productId: true, quantity: true } });

    const map: Record<number, number> = {};
    for (const item of items) {
      map[item.productId] = (map[item.productId] || 0) + item.quantity;
    }

    const result = Object.entries(map)
      .map(([pid, totalQuantity]) => ({ productId: Number(pid), totalQuantity }));
    result.sort((a, b) => b.totalQuantity - a.totalQuantity);

    return result.slice(0, limit);
  }

  // ReplenishmentRequest
  /**
   * Crée une demande de réapprovisionnement pour un produit dans un magasin.
   * @param storeId L'ID du magasin où la demande est faite.
   * @param productId L'ID du produit à réapprovisionner.
   * @param quantity La quantité demandée pour le réapprovisionnement.
   * @returns La demande de réapprovisionnement créée.
   */
  async createReplenishmentRequest(storeId: number, productId: number, quantity: number): Promise<ReplenishmentRequest> {
    return prisma.replenishmentRequest.create({ data: { storeId, productId, quantity } });
  }

  /**
   * Récupère toutes les demandes de réapprovisionnement pour un magasin.
   * @param storeId L'ID du magasin dont on veut les demandes.
   * @returns La liste des demandes de réapprovisionnement pour le magasin.
   */
  async getReplenishmentRequestsByStore(storeId: number): Promise<ReplenishmentRequest[]> {
    return prisma.replenishmentRequest.findMany({ where: { storeId } });
  }

  /**
   * Récupère une demande de réapprovisionnement par son ID.
   * @param id L'ID de la demande à récupérer.
   * @returns La demande de réapprovisionnement trouvée, ou null si elle n'existe pas.
   */
  async getReplenishmentRequest(id: number): Promise<ReplenishmentRequest | null> {
    return prisma.replenishmentRequest.findUnique({ where: { id } });
  }

  /**
   * Met à jour le statut d'une demande de réapprovisionnement.
   * @param id L'ID de la demande à mettre à jour.
   * @param status Le nouveau statut de la demande.
   * @returns La demande de réapprovisionnement mise à jour.
   */
  async updateReplenishmentStatus(id: number, status: RequestStatus): Promise<ReplenishmentRequest> {
    return prisma.replenishmentRequest.update({ where: { id }, data: { status } });
  }

  // Alerts
  /**
   * Trouve les stocks de magasins dont la quantité est inférieure à un seuil donné.
   * @param threshold Le seuil de quantité à comparer.
   * @returns La liste des stocks de magasins dont la quantité est inférieure au seuil.
   */
  async findStoreStocksBelow(threshold: number): Promise<StoreStock[]> {
    return prisma.storeStock.findMany({ where: { quantity: { lt: threshold } } });
  }
}
