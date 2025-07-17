import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Début du seed...');

    // Créer quelques produits d'exemple
    const products = await Promise.all([
        prisma.product.create({
            data: {
                name: 'Laptop Dell XPS 13',
                price: 1299.99,
                description: 'Ordinateur portable ultra-portable avec écran 13.3"',
                category: 'Électronique',
            },
        }),
        prisma.product.create({
            data: {
                name: 'iPhone 15 Pro',
                price: 999.99,
                description: 'Smartphone Apple dernière génération',
                category: 'Téléphones',
            },
        }),
        prisma.product.create({
            data: {
                name: 'Chaise de bureau ergonomique',
                price: 299.99,
                description: 'Chaise de bureau avec support lombaire',
                category: 'Mobilier',
            },
        }),
        prisma.product.create({
            data: {
                name: 'Casque audio Bluetooth',
                price: 159.99,
                description: 'Casque sans fil avec réduction de bruit',
                category: 'Audio',
            },
        }),
    ]);

    console.log(`✅ ${products.length} produits créés`);

    // Créer des stocks pour différents magasins
    const stocks = await Promise.all([
        // Magasin 1
        prisma.storeStock.create({
            data: { storeId: 1, productId: products[0].id, quantity: 15 },
        }),
        prisma.storeStock.create({
            data: { storeId: 1, productId: products[1].id, quantity: 25 },
        }),
        prisma.storeStock.create({
            data: { storeId: 1, productId: products[2].id, quantity: 8 },
        }),
        
        // Magasin 2
        prisma.storeStock.create({
            data: { storeId: 2, productId: products[0].id, quantity: 12 },
        }),
        prisma.storeStock.create({
            data: { storeId: 2, productId: products[3].id, quantity: 30 },
        }),
        
        // Magasin 3
        prisma.storeStock.create({
            data: { storeId: 3, productId: products[1].id, quantity: 5 }, // Stock faible
        }),
        prisma.storeStock.create({
            data: { storeId: 3, productId: products[2].id, quantity: 20 },
        }),
        prisma.storeStock.create({
            data: { storeId: 3, productId: products[3].id, quantity: 3 }, // Stock faible
        }),
    ]);

    console.log(`✅ ${stocks.length} entrées de stock créées`);
    console.log('🎉 Seed terminé avec succès !');
}

main()
    .catch((e) => {
        console.error('❌ Erreur lors du seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
