import inquirer from "inquirer";
import { PrismaRepository }    from "./infrastructure/PrismaRepository";
import { SaleService }         from "./domain/services/SaleService";
import { ReturnService }       from "./domain/services/ReturnService";
import { InventoryService }    from "./domain/services/InventoryService";
import { CartItem }            from "./domain/entities";

const repo             = new PrismaRepository();
const saleService      = new SaleService(repo);
const returnService    = new ReturnService(repo);
const inventoryService = new InventoryService(repo);

async function main() {
  while (true) {
    const { action } = await inquirer.prompt({
      type:    "list",
      name:    "action",
      message: "Sélectionnez une action",
      choices: [
        "Rechercher un produit",
        "Enregistrer une vente",
        "Gérer les retours",
        "Consulter l’état du stock",
        "Quitter"
      ]
    });

    switch (action) {
      case "Rechercher un produit":
        await handleSearch();
        break;

      case "Enregistrer une vente":
        await handleSale();
        break;

      case "Gérer les retours":
        await handleReturn();
        break;

      case "Consulter l’état du stock":
        await handleStock();
        break;

      case "Quitter":
        console.log("Au revoir !");
        process.exit(0);
    }
  }
}

async function handleSearch() {
  const { criterion } = await inquirer.prompt({
    type:    "list",
    name:    "criterion",
    message: "Par quel critère ?",
    choices: ["Identifiant", "Nom", "Catégorie"]
  });

  let results;
  if (criterion === "Identifiant") {
    const { id } = await inquirer.prompt({
      type:    "number",
      name:    "id",
      message: "ID du produit :"
    });
    const p = await repo.findProductById(id);
    results = p ? [p] : [];
  }
  else if (criterion === "Nom") {
    const { name } = await inquirer.prompt({
      type:    "input",
      name:    "name",
      message: "Nom (chaîne contenue) :"
    });
    results = await repo.findProductsByName(name);
  }
  else { // Catégorie
    const { category } = await inquirer.prompt({
      type:    "input",
      name:    "category",
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
      { type: "number", name: "quantity",  message: "Quantité   :" }
    ]);
    items.push(new CartItem(productId, quantity));
    const { more } = await inquirer.prompt({
      type:    "confirm",
      name:    "more",
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
    type:    "number",
    name:    "saleId",
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
    id:       p.id,
    name:     p.name,
    category: p.category,
    stock:    p.stock
  })));
}

main();
