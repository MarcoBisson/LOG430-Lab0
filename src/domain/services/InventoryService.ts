import { PrismaRepository } from "../../infrastructure/PrismaRepository";
import { Product } from "@prisma/client";

export class InventoryService {
  constructor(private repo: PrismaRepository) {}

  /** Renvoie la liste des produits avec leur stock */
  async listStock(): Promise<Product[]> {
    return this.repo.listProducts();
  }
}
