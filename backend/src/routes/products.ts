import { Router } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const router = Router();

// Route to get products with optional filters
router.get("/products", async (req, res, next) => {
  const { id, name, category } = req.query;
  const where: any = {};
  if (id)        where.id = Number(id);
  if (name)      where.name = { contains: String(name), mode: "insensitive" };
  if (category)  where.category = String(category);
  try {
    const products = await prisma.product.findMany({ where });
    res.json(products);
  } catch (err) { next(err); }
});

export default router;
