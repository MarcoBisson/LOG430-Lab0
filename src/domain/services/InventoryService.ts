import type { PrismaRepository } from '../../infrastructure/PrismaRepository';
import type { Product } from '@prisma/client';

export class InventoryService {
  constructor(private readonly repo: PrismaRepository) {}

  // Renvoie la liste des produits avec leur stock
  async listStock(): Promise<Product[]> {
    return this.repo.listProducts();
  }
}
