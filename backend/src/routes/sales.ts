import { Router } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const router = Router();

// Route to save a sale
router.post("/sales", async (req, res, next) => {
  const { productId, quantity } = req.body;
  try {
    const sale = await prisma.$transaction(async tx => {
      const p = await tx.product.findUnique({ where: { id: productId } });
      if (!p || p.quantity < quantity) {
        return res.status(400).json({ error: "Stock insuffisant" });
      }
      await tx.product.update({
        where: { id: productId },
        data: { quantity: { decrement: quantity } },
      });
      return tx.sale.create({
        data: {
          productId,
          quantity,
          total: p.price * quantity,
        },
      });
    });
    res.status(201).json(sale);
  } catch (err) { next(err); }
});

// Route to return a sale
router.post("/sales/:id/return", async (req, res, next) => {
  const saleId = Number(req.params.id);
  try {
    const ret = await prisma.$transaction(async tx => {
      const s = await tx.sale.findUnique({ where: { id: saleId } });
      if (!s || s.returned) {
        return res.status(400).json({ error: "Vente introuvable ou déjà retournée" });
      }
      await tx.product.update({
        where: { id: s.productId },
        data: { quantity: { increment: s.quantity } },
      });
      return tx.sale.update({
        where: { id: saleId },
        data: { returned: true, returnedAt: new Date() },
      });
    });
    res.json(ret);
  } catch (err) { next(err); }
});

export default router;
