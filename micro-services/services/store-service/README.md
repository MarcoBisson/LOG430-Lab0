# Store Service

Microservice de gestion des magasins et des stocks.

## Description

Le service Store est responsable de :
- **Gestion des magasins** : Création, lecture, mise à jour et suppression des magasins
- **Types de magasins** : Support des types SALES, LOGISTICS et HEADQUARTER  
- **Gestion des stocks** : Gestion des stocks par magasin et par produit
- **Localisation et métadonnées** : Informations d'adresse et de métadonnées des magasins

## Configuration

### Variables d'environnement

```bash
NODE_ENV=development
PORT=3002
STORE_DATABASE_URL=postgresql://store_user:store_password@store-db:5432/store_db
LOG_LEVEL=info
```

### Base de données

Le service utilise PostgreSQL avec Prisma ORM. Le schéma comprend :

- **Store** : Informations sur les magasins (nom, adresse, type)
- **StoreStock** : Stocks de produits par magasin

## Installation

### Avec Docker (Recommandé)

```bash
# Cloner le repository et naviguer vers le service
cd services/store-service

# Démarrer avec Docker Compose
docker-compose up -d

# Appliquer les migrations et seeder la base
docker-compose exec store-service npm run prisma:migrate
docker-compose exec store-service npm run prisma:seed
```

### Installation locale

```bash
# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env

# Générer le client Prisma
npm run prisma:generate

# Appliquer les migrations
npm run prisma:migrate

# Seeder la base de données
npm run prisma:seed

# Démarrer en mode développement
npm run dev
```

## API Endpoints

### Magasins

- `GET /api/stores` - Lister tous les magasins
- `GET /api/stores/:id` - Récupérer un magasin par ID
- `GET /api/stores/type/:type` - Récupérer les magasins par type
- `POST /api/stores` - Créer un nouveau magasin
- `PUT /api/stores/:id` - Mettre à jour un magasin
- `DELETE /api/stores/:id` - Supprimer un magasin

### Stocks

- `GET /api/stocks/store/:storeId` - Récupérer le stock d'un magasin
- `GET /api/stocks/store/:storeId/product/:productId` - Récupérer le stock d'un produit
- `PUT /api/stocks/store/:storeId/product/:productId` - Mettre à jour le stock
- `POST /api/stocks/store/:storeId/product/:productId/increment` - Incrémenter le stock
- `POST /api/stocks/store/:storeId/product/:productId/decrement` - Décrémenter le stock
- `GET /api/stocks/low?threshold=10` - Récupérer les stocks faibles

### Utilitaires

- `GET /health` - Vérification de santé du service
- `GET /ready` - Vérification de disponibilité du service

## Types de magasins

- **SALES** : Magasins de vente au détail
- **LOGISTICS** : Entrepôts et centres de distribution
- **HEADQUARTER** : Siège social

## Exemples d'utilisation

### Créer un magasin

```bash
curl -X POST http://localhost:3002/api/stores \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nouveau Magasin",
    "address": "123 Rue Example, Ville, QC",
    "type": "SALES"
  }'
```

### Récupérer les magasins de vente

```bash
curl http://localhost:3002/api/stores/type/SALES
```

### Mettre à jour un stock

```bash
curl -X PUT http://localhost:3002/api/stocks/store/1/product/1 \
  -H "Content-Type: application/json" \
  -d '{"quantity": 100}'
```

### Vérifier les stocks faibles

```bash
curl http://localhost:3002/api/stocks/low?threshold=15
```

## Développement

### Scripts disponibles

```bash
npm run dev          # Démarrage en mode développement
npm run build        # Compilation TypeScript
npm run start        # Démarrage en mode production
npm test             # Exécution des tests
npm run prisma:generate  # Génération du client Prisma
npm run prisma:migrate   # Application des migrations
npm run prisma:seed      # Seeding de la base de données
```

### Architecture

```
src/
├── entities/           # Entités du domaine
├── repositories/       # Interfaces et implémentations des repositories
├── services/          # Logique métier
├── controllers/       # Contrôleurs HTTP
├── routes/           # Définition des routes
├── config/           # Configuration (base de données, etc.)
└── server.ts         # Point d'entrée de l'application
```

## Tests

```bash
# Exécuter tous les tests
npm test

# Tests en mode watch
npm run test:watch

# Coverage des tests
npm run test:coverage
```

## Déploiement

### Avec Docker

Le service est containerisé et prêt pour le déploiement avec Docker :

```bash
# Build de l'image
docker build -t store-service .

# Démarrage du container
docker run -p 3002:3002 --env-file .env store-service
```

### Variables d'environnement de production

```bash
NODE_ENV=production
PORT=3002
STORE_DATABASE_URL=postgresql://user:password@host:5432/database
LOG_LEVEL=warn
```

## Monitoring

Le service expose plusieurs endpoints pour le monitoring :

- `/health` : Santé générale du service
- `/ready` : Disponibilité du service (connexion DB, etc.)

## Support

Pour les questions et le support, veuillez consulter la documentation du projet principal ou créer une issue dans le repository.
