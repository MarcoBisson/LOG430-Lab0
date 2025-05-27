import { PrismaClient, Product, Sale, SaleItem } from "@prisma/client";

const prisma = new PrismaClient();

export class PrismaRepository {
  async findProductById(id: number): Promise<Product | null> {
    return prisma.product.findUnique({ where: { id } });
  }

  async listProducts(): Promise<Product[]> {
    return prisma.product.findMany();
  }

  async createSale(items: { productId: number; quantity: number }[]): Promise<Sale> {
    return prisma.sale.create({
      data: {
        items: {
          create: items.map(i => ({
            product: { connect: { id: i.productId } },
            quantity: i.quantity
          }))
        }
      },
      include: { items: true }
    });
  }

  async decrementStock(productId: number, qty: number): Promise<void> {
    await prisma.product.update({
      where: { id: productId },
      data: { stock: { decrement: qty } }
    });
  }

  async findProductsByName(name: string): Promise<Product[]> {
    return prisma.product.findMany({
      where: { name: { contains: name, mode: "insensitive" } }
    });
  }

  // Recherche par catégorie (égalité)
  async findProductsByCategory(category: string): Promise<Product[]> {
    return prisma.product.findMany({
      where: { category }
    });
  }

  // Retourne une vente avec ses items
  async getSaleById(id: number): Promise<(Sale & { items: SaleItem[] }) | null> {
    return prisma.sale.findUnique({
      where: { id },
      include: { items: true }
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
      data: { stock: { increment: qty } }
    });
  }
}
