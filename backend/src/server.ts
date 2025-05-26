import express from "express";
import cors from "cors";
import productsRouter from "./routes/products";
import salesRouter from "./routes/sales";

const app = express();
app.use(cors({ origin: "http://localhost:5432" }));
app.use(express.json());
app.use(productsRouter);
app.use(salesRouter);
