import type { Product, Sale, SaleItem } from '@prisma/client';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class PrismaRepository {
  async createProduct(data: {
    name: string;
    price: number;
    stock: number;
    category?: string;
  }): Promise<Product> {
    return prisma.product.create({ data });
  }

  // Trouve un produit par son ID
  async findProductById(id: number): Promise<Product | null> {
    return prisma.product.findUnique({ where: { id } });
  }

  // Liste tous les produits
  async listProducts(): Promise<Product[]> {
    return prisma.product.findMany();
  }

  // Crée une vente avec des items
  async createSale(items: { productId: number; quantity: number }[]): Promise<Sale> {
    return prisma.sale.create({
      data: {
        items: {
          create: items.map(i => ({
            product: { connect: { id: i.productId } },
            quantity: i.quantity,
          })),
        },
      },
      include: { items: true },
    });
  }

  // Retire un produit du stock selon son ID et la quantité
  async decrementStock(productId: number, qty: number): Promise<void> {
    await prisma.product.update({
      where: { id: productId },
      data: { stock: { decrement: qty } },
    });
  }

  // Recherche par nom (insensible à la casse)
  async findProductsByName(name: string): Promise<Product[]> {
    return prisma.product.findMany({
      where: { name: { contains: name, mode: 'insensitive' } },
    });
  }

  // Recherche par catégorie (égalité)
  async findProductsByCategory(category: string): Promise<Product[]> {
    return prisma.product.findMany({
      where: { category },
    });
  }

  // Retourne une vente avec ses items
  async getSaleById(id: number): Promise<(Sale & { items: SaleItem[] }) | null> {
    return prisma.sale.findUnique({
      where: { id },
      include: { items: true },
    });
  }

  // Supprime la vente et ses items
  async deleteSale(id: number): Promise<void> {
    await prisma.saleItem.deleteMany({ where: { saleId: id } });
    await prisma.sale.delete({ where: { id } });
  }

  // Incrémente le stock
  async incrementStock(productId: number, qty: number): Promise<void> {
    await prisma.product.update({
      where: { id: productId },
      data: { stock: { increment: qty } },
    });
  }
}
