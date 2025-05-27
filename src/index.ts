#!/usr/bin/env ts-node
import inquirer from "inquirer";
import { PrismaRepository } from "./infrastructure/PrismaRepository";
import { SaleService } from "./domain/services/SaleService";
import { CartItem } from "./domain/entities";

const repo = new PrismaRepository();
const saleService = new SaleService(repo);

async function main() {
  while (true) {
    const { action } = await inquirer.prompt({
      type: "list", name: "action", message: "Sélectionnez une action",
      choices: ["Lister produits", "Enregistrer une vente", "Quitter"]
    });

    if (action === "Lister produits") {
      const products = await repo.listProducts();
      console.table(products);
    }
    else if (action === "Enregistrer une vente") {
      // Saisie des lignes de panier
      const items: CartItem[] = [];
      let addMore = true;
      while (addMore) {
        const { productId, quantity } = await inquirer.prompt([
          { type: "number", name: "productId", message: "ID produit :" },
          { type: "number", name: "quantity",  message: "Quantité   :" }
        ]);
        items.push(new CartItem(productId, quantity));
        const res = await inquirer.prompt({
          type: "confirm", name: "more", message: "Ajouter un autre item ?", default: false
        });
        addMore = res.more;
      }
      try {
        await saleService.recordSale(items);
      } catch (err: any) {
        console.error("Erreur :", err.message);
      }
    }
    else {
      console.log("Au revoir !");
      process.exit(0);
    }
  }
}

main();
