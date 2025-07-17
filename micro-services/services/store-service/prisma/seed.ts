import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seeding de la base de données store...');

  // Créer les magasins
  const headquarters = await prisma.store.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Siège Social',
      address: '100 Rue du Siège, Montréal, QC',
      type: 'HEADQUARTER',
    },
  });

  const warehouse = await prisma.store.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: 'Entrepôt Central',
      address: '123 Rue de l\'Entrepôt, Montréal, QC',
      type: 'LOGISTICS',
    },
  });

  const retail1 = await prisma.store.upsert({
    where: { id: 3 },
    update: {},
    create: {
      name: 'Magasin Centre-Ville',
      address: '456 Rue Sainte-Catherine, Montréal, QC',
      type: 'SALES',
    },
  });

  const retail2 = await prisma.store.upsert({
    where: { id: 4 },
    update: {},
    create: {
      name: 'Magasin Banlieue',
      address: '789 Boulevard des Sources, Pointe-Claire, QC',
      type: 'SALES',
    },
  });

  const retail3 = await prisma.store.upsert({
    where: { id: 5 },
    update: {},
    create: {
      name: 'Magasin Plateau',
      address: '321 Avenue du Mont-Royal, Montréal, QC',
      type: 'SALES',
    },
  });

  console.log('✅ Magasins créés');

  // Créer quelques stocks d'exemple
  const sampleStocks = [
    // Entrepôt Central - stocks élevés
    { storeId: warehouse.id, productId: 1, quantity: 500 },
    { storeId: warehouse.id, productId: 2, quantity: 300 },
    { storeId: warehouse.id, productId: 3, quantity: 200 },
    { storeId: warehouse.id, productId: 4, quantity: 150 },
    { storeId: warehouse.id, productId: 5, quantity: 400 },

    // Magasin Centre-Ville
    { storeId: retail1.id, productId: 1, quantity: 50 },
    { storeId: retail1.id, productId: 2, quantity: 30 },
    { storeId: retail1.id, productId: 3, quantity: 25 },
    { storeId: retail1.id, productId: 4, quantity: 15 },
    { storeId: retail1.id, productId: 5, quantity: 40 },

    // Magasin Banlieue
    { storeId: retail2.id, productId: 1, quantity: 35 },
    { storeId: retail2.id, productId: 2, quantity: 20 },
    { storeId: retail2.id, productId: 3, quantity: 30 },
    { storeId: retail2.id, productId: 4, quantity: 10 },
    { storeId: retail2.id, productId: 5, quantity: 25 },

    // Magasin Plateau
    { storeId: retail3.id, productId: 1, quantity: 40 },
    { storeId: retail3.id, productId: 2, quantity: 25 },
    { storeId: retail3.id, productId: 3, quantity: 20 },
    { storeId: retail3.id, productId: 4, quantity: 8 }, // Stock faible
    { storeId: retail3.id, productId: 5, quantity: 30 },
  ];

  // Créer les stocks
  for (const stock of sampleStocks) {
    await prisma.storeStock.upsert({
      where: {
        storeId_productId: {
          storeId: stock.storeId,
          productId: stock.productId,
        },
      },
      update: {
        quantity: stock.quantity,
      },
      create: stock,
    });
  }

  console.log('✅ Stocks créés');
  console.log('');
  console.log('🏪 Magasins créés :');
  console.log(`🏢 ${headquarters.name} (${headquarters.type}) - ID: ${headquarters.id}`);
  console.log(`📦 ${warehouse.name} (${warehouse.type}) - ID: ${warehouse.id}`);
  console.log(`🛍️ ${retail1.name} (${retail1.type}) - ID: ${retail1.id}`);
  console.log(`🛍️ ${retail2.name} (${retail2.type}) - ID: ${retail2.id}`);
  console.log(`🛍️ ${retail3.name} (${retail3.type}) - ID: ${retail3.id}`);
  console.log('');
  console.log('📊 Stocks initialisés pour 5 produits dans chaque magasin');
  console.log('');
  console.log('🎉 Seeding terminé avec succès !');
}

main()
  .catch((e) => {
    console.error('❌ Erreur durant le seeding:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
