import inquirer from "inquirer";
import { PrismaRepository } from "./infrastructure/PrismaRepository";
import { SaleService } from "./domain/services/SaleService";
import { ReturnService } from "./domain/services/ReturnService";
import { InventoryService } from "./domain/services/InventoryService";
import { ProductService } from "./domain/services/ProductService";
import { CartItem } from "./domain/entities";
import { parse } from "path";

const repo = new PrismaRepository();
const productService = new ProductService(repo);
const saleService = new SaleService(repo);
const returnService = new ReturnService(repo);
const inventoryService = new InventoryService(repo);

async function main() {
  while (true) {
    const { action } = await inquirer.prompt({
      type: "list",
      name: "action",
      message: "Sélectionnez une action",
      choices: [
        "Ajouter un produit",
        "Rechercher un produit",
        "Enregistrer une vente",
        "Gérer les retours",
        "Consulter l'état du stock",
        "Quitter"
      ]
    });

    switch (action) {
      case "Ajouter un produit":
        await handleAddProduct();
        break;
      case "Rechercher un produit":
        await handleSearch();
        break;
      case "Enregistrer une vente":
        await handleSale();
        break;
      case "Gérer les retours":
        await handleReturn();
        break;
      case "Consulter l'état du stock":
        await handleStock();
        break;
      case "Quitter":
        console.log("Au revoir !");
        process.exit(0);
    }
  }
}

async function handleAddProduct() {
  const answers = await inquirer.prompt([
    { type: "input", name: "name", message: "Nom du produit :" },
    {
      type: "input",
      name: "price",
      message: "Prix (ex. 20.99) :",
      validate: (input: string) => {
        if (!/^[0-9]+(\.[0-9]{1,2})?$/.test(input) && parseFloat(input) > 0) {
          return "Le prix doit être plus grand que 0 et au format valide (ex. 20.99).";
        }
        return true;
      },
      filter: (input: string) => parseFloat(input)
    },
    { type: "number", name: "stock", message: "Quantité en stock :", validate: input => (typeof input === "number" && input > 0) || "Le stock doit être supérieur à 0." },
    { type: "input", name: "category", message: "Catégorie (optionnel) :" }
  ]);

  try {
    const prod = await productService.addProduct(
      answers.name,
      answers.price,
      answers.stock,
      answers.category || undefined
    );
    console.log("Produit créé :", prod);
  } catch (err: any) {
    console.error("Erreur lors de la création :", err.message);
  }
}

async function handleSearch() {
  const { criterion } = await inquirer.prompt({
    type: "list",
    name: "criterion",
    message: "Par quel critère ?",
    choices: ["Identifiant", "Nom", "Catégorie"]
  });

  let results;
  if (criterion === "Identifiant") {
    const { id } = await inquirer.prompt({
      type: "number",
      name: "id",
      message: "ID du produit :"
    });
    const p = await repo.findProductById(id);
    results = p ? [p] : [];
  }
  else if (criterion === "Nom") {
    const { name } = await inquirer.prompt({
      type: "input",
      name: "name",
      message: "Nom (chaîne contenue) :"
    });
    results = await repo.findProductsByName(name);
  }
  else {
    const { category } = await inquirer.prompt({
      type: "input",
      name: "category",
      message: "Catégorie exacte :"
    });
    results = await repo.findProductsByCategory(category);
  }

  if (results.length === 0) {
    console.log("Aucun produit trouvé.");
  } else {
    console.table(results);
  }
}

async function handleSale() {
  const items: CartItem[] = [];
  let addMore = true;
  while (addMore) {
    const { productId, quantity } = await inquirer.prompt([
      { type: "number", name: "productId", message: "ID produit :" },
      { type: "number", name: "quantity", message: "Quantité   :" }
    ]);
    items.push(new CartItem(productId, quantity));
    const { more } = await inquirer.prompt({
      type: "confirm",
      name: "more",
      message: "Ajouter un autre item ?",
      default: false
    });
    addMore = more;
  }
  try {
    await saleService.recordSale(items);
  } catch (err: any) {
    console.error("Erreur :", err.message);
  }
}

async function handleReturn() {
  const { saleId } = await inquirer.prompt({
    type: "number",
    name: "saleId",
    message: "ID de la vente à annuler :"
  });
  try {
    await returnService.processReturn(saleId);
  } catch (err: any) {
    console.error("Erreur :", err.message);
  }
}

async function handleStock() {
  const products = await inventoryService.listStock();
  console.table(products.map(p => ({
    id: p.id,
    name: p.name,
    category: p.category,
    stock: p.stock
  })));
}

main();
