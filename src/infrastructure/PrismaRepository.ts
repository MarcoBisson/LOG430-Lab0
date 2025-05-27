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
}
