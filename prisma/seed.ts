import { PrismaClient, StoreType, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { randomInt } from 'crypto';
const prisma = new PrismaClient();

async function main() {

    // Création des magasins
    const stores: any[] = [];
    // 7 SALES stores
    for (let i = 1; i <= 7; i++) {
        stores.push({
            name: `Store SALES ${i}`,
            type: StoreType.SALES,
            address: `10${i}9 rue notre dame ouest`,
        });
    }
    // 2 LOGISTICS stores
    for (let i = 1; i <= 2; i++) {
        stores.push({
            name: `Store LOGISTICS ${i}`,
            type: StoreType.LOGISTICS,
            address: `20${i}9 rue notre dame ouest`,
        });
    }
    // 1 HEADQUARTERS store
    stores.push({
        name: 'Store HEADQUARTERS',
        type: StoreType.HEADQUARTERS,
        address: '309 rue notre dame ouest',
    });

    console.log('Début : création des magasins...');
    await prisma.store.createMany({
        data: stores,
    });
    console.log('Magasins créés.');

    // Création des produits
    const categories = [
        'Électronique', 'Livres', 'Vêtements', 'Maison', 'Jouets', 'Sports', 'Beauté', 'Automobile', 'Jardin', 'Épicerie',
        'Musique', 'Bureau', 'Animaux', 'Chaussures', 'Bijoux', 'Santé', 'Bébé', 'Outils', 'Jeux', 'Plein air',
    ];
    const products: any[] = [];
    // Définir des plages de prix réalistes par catégorie
    const priceRanges: { [cat: string]: [number, number] } = {
        'Électronique': [100, 1000],
        'Livres': [5, 50],
        'Vêtements': [10, 200],
        'Maison': [20, 500],
        'Jouets': [5, 100],
        'Sports': [15, 400],
        'Beauté': [5, 150],
        'Automobile': [50, 800],
        'Jardin': [10, 300],
        'Épicerie': [2, 50],
        'Musique': [10, 300],
        'Bureau': [5, 200],
        'Animaux': [5, 150],
        'Chaussures': [20, 250],
        'Bijoux': [30, 1000],
        'Santé': [5, 200],
        'Bébé': [10, 300],
        'Outils': [10, 400],
        'Jeux': [10, 120],
        'Plein air': [15, 500],
    };
    for (let i = 1; i <= 2000; i++) {
        const category = categories[randomInt(categories.length)];
        const [min, max] = priceRanges[category] || [5, 500];
        const price = Math.round((randomInt(min, max) + Math.random()) * 100) / 100;
        products.push({
            name: `Product ${i}`,
            price,
            category,
            description: `Description for product ${i}`,
        });
    }
    console.log('Début : création des produits...');
    await prisma.product.createMany({
        data: products,
    });
    console.log('Produits créés.');

    // Création des liens entre produits et magasins (stocks)
    const storeStocks: any[] = [];

    const storeIds = await prisma.store.findMany({
        select: {
            id: true,
            type: true,
        },
    });

    const productIds = await prisma.product.findMany({
        select: {
            id: true,
            price: true,
        },
    });

    const saleStores = storeIds.filter(store => store.type === StoreType.SALES);
    const logisticStores = storeIds.filter(store => store.type === StoreType.LOGISTICS);

    productIds.forEach(ob => {
        // Répartition aléatoire dans un magasin SALES uniquement
        storeStocks.push({
            storeId: saleStores[randomInt(saleStores.length)].id,
            productId: ob.id,
            quantity: randomInt(50, 100),
        });

        storeStocks.push({
            storeId: logisticStores[randomInt(logisticStores.length)].id,
            productId: ob.id,
            quantity: randomInt(200, 400),
        });
    });

    console.log('Début : création des stocks magasins-produits...');
    await prisma.storeStock.createMany({
        data: storeStocks,
    });
    console.log('Stocks magasins-produits créés.');


    // Création des ventes (sales) et attribution à un magasin
    const sales: any[] = [];
    const startTime = new Date('2020-01-01');
    const endTime = new Date();

    for (let i = 0; i < 200000; i++) {
        const randomTime = startTime.getTime() + Math.random() * (endTime.getTime() - startTime.getTime());

        sales.push(
            {
                date: new Date(randomTime),
                storeId: saleStores[randomInt(saleStores.length)].id,
            },
        );

    }

    console.log('Début : création des ventes...');
    await prisma.sale.createMany({
        data: sales,
    });
    console.log('Ventes créées.');

    // Création des liens entre ventes et produits vendus (saleItems)
    const saleIds = await prisma.sale.findMany({
        select: {
            id: true,
        },
    });

    const saleItems: any[] = [];

    // On récupère les stocks pour chaque store
    const stocksByStore: { [storeId: number]: number[] } = {};
    storeStocks.forEach(stock => {
        if (!stocksByStore[stock.storeId]) stocksByStore[stock.storeId] = [];
        stocksByStore[stock.storeId].push(stock.productId);
    });

    // Associer plusieurs produits présents dans le store à chaque vente
    saleIds.forEach((sale, idx) => {
        // Trouver le store de la vente
        const saleObj = sales[idx];
        const storeId = saleObj.storeId;
        const availableProducts = stocksByStore[storeId];
        if (availableProducts && availableProducts.length > 0) {
            // On choisit entre 1 et 5 produits différents pour chaque vente
            const nbProducts = randomInt(1, Math.min(6, availableProducts.length + 1));
            // On clone et mélange les produits disponibles
            const shuffled = [...availableProducts].sort(() => 0.5 - Math.random());
            for (let i = 0; i < nbProducts; i++) {
                const productId = shuffled[i];
                const product = productIds.find(p => p.id === productId);
                saleItems.push({
                    saleId: sale.id,
                    productId: productId,
                    quantity: randomInt(1, 10),
                    unitPrice: product ? product.price : 0,
                });
            }
        }
    });

    console.log('Début : création des produits vendus (saleItems)...');
    await prisma.saleItem.createMany({
        data: saleItems,
    });
    console.log('Produits vendus (saleItems) créés.');

    // Création des utilisateurs selon la logique demandée
    const users = [];

    // Admin : accès à tout
    users.push({
        username: 'admin',
        password: await bcrypt.hash('admin', 10),
        role: UserRole.ADMIN,
        access: { connect: storeIds.map(store => ({ id: store.id })) },
    });

    // Client : accès à tous les SALES
    users.push({
        username: 'client',
        password: await bcrypt.hash('client', 10),
        role: UserRole.CLIENT,
        access: { connect: saleStores.map(store => ({ id: store.id })) },
    });

    // Un STAFF par magasin SALES
    for (let i = 0; i < saleStores.length; i++) {
        users.push({
            username: `staff${i+1}`,
            password: await bcrypt.hash(`staff${i+1}`, 10),
            role: UserRole.STAFF,
            access: { connect: [{ id: saleStores[i].id }] },
        });
    }

    // Un LOGISTICS par magasin LOGISTICS
    for (let i = 0; i < logisticStores.length; i++) {
        users.push({
            username: `logistic${i+1}`,
            password: await bcrypt.hash(`logistic${i+1}`, 10),
            role: UserRole.LOGISTICS,
            access: { connect: [{ id: logisticStores[i].id }] },
        });
    }

    console.log('Début : création des utilisateurs...');
    await Promise.all(users.map(user => prisma.user.create({ data: user })));
    console.log('Utilisateurs créés.');
}

main()
    .then(() => prisma.$disconnect())
    .catch(e => {
        console.error(e);
        prisma.$disconnect();
        process.exit(1);
    });
