import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seeding de la base de données auth...');

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

  console.log('✅ Magasins créés');

  // Hasher les mots de passe
  const adminPassword = await bcrypt.hash('admin123', 10);
  const managerPassword = await bcrypt.hash('manager123', 10);
  const employeePassword = await bcrypt.hash('employee123', 10);

  // Créer l'administrateur (accès au siège social)
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@company.com',
      password: adminPassword,
      role: 'ADMIN',
      storeId: headquarters.id,
      access: {
        connect: [
          { id: headquarters.id },
          { id: warehouse.id },
          { id: retail1.id },
          { id: retail2.id }
        ]
      }
    },
  });

  // Créer un staff pour le magasin centre-ville
  const staff1 = await prisma.user.upsert({
    where: { username: 'staff_downtown' },
    update: {},
    create: {
      username: 'staff_downtown',
      email: 'staff.downtown@company.com',
      password: managerPassword,
      role: 'STAFF',
      storeId: retail1.id,
      access: {
        connect: [{ id: retail1.id }]
      }
    },
  });

  // Créer un staff pour le magasin banlieue
  const staff2 = await prisma.user.upsert({
    where: { username: 'staff_suburb' },
    update: {},
    create: {
      username: 'staff_suburb',
      email: 'staff.suburb@company.com',
      password: managerPassword,
      role: 'STAFF',
      storeId: retail2.id,
      access: {
        connect: [{ id: retail2.id }]
      }
    },
  });

  // Créer des employés logistiques
  const logistics1 = await prisma.user.upsert({
    where: { username: 'logistics_warehouse' },
    update: {},
    create: {
      username: 'logistics_warehouse',
      email: 'logistics.warehouse@company.com',
      password: employeePassword,
      role: 'LOGISTICS',
      storeId: warehouse.id,
      access: {
        connect: [{ id: warehouse.id }]
      }
    },
  });

  const logistics2 = await prisma.user.upsert({
    where: { username: 'logistics_downtown' },
    update: {},
    create: {
      username: 'logistics_downtown',
      email: 'logistics.downtown@company.com',
      password: employeePassword,
      role: 'LOGISTICS',
      storeId: retail1.id,
      access: {
        connect: [{ id: retail1.id }]
      }
    },
  });

  // Créer un client de test
  const client = await prisma.user.upsert({
    where: { username: 'client_test' },
    update: {},
    create: {
      username: 'client_test',
      email: 'client.test@example.com',
      password: employeePassword,
      role: 'CLIENT',
      access: {
        connect: [{ id: retail1.id },
          { id: retail2.id }] // Les clients ont accès aux magasins de vente
      }
    },
  });

  console.log('✅ Utilisateurs créés');
  console.log('');
  console.log('👤 Comptes de test créés :');
  console.log('🏢 Siège Social - Admin: admin / admin123 (accès à tous les magasins)');
  console.log('👔 Staff Centre-Ville: staff_downtown / manager123');
  console.log('👔 Staff Banlieue: staff_suburb / manager123');
  console.log('� Logistique Entrepôt: logistics_warehouse / employee123');
  console.log('� Logistique Centre-Ville: logistics_downtown / employee123');
  console.log('� Client Test: client_test / employee123');
  console.log('');
  console.log('🏪 Magasins créés :');
  console.log(`🏢 ${headquarters.name} (${headquarters.type})`);
  console.log(`📦 ${warehouse.name} (${warehouse.type})`);
  console.log(`🛍️ ${retail1.name} (${retail1.type})`);
  console.log(`🛍️ ${retail2.name} (${retail2.type})`);
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
