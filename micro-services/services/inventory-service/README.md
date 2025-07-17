# Inventory Service

Microservice de gestion des produits et de l'inventaire extrait du backend principal.

## Vue d'ensemble

Ce service gère toute la logique liée à:
- **Produits**: CRUD, recherche, catégorisation
- **Inventaire**: Gestion des stocks par magasin, opérations de stock

## Architecture

### Entités
- `Product`: Produit de base (id, nom, prix, description, catégorie)
- `ProductStock`: Produit avec stock (étend Product)
- `StoreStock`: Stock par magasin (storeId, productId, quantité)

### Services
- `ProductService`: Logique métier des produits
- `InventoryService`: Logique métier de l'inventaire

### Controllers
- `ProductController`: Endpoints REST pour les produits
- `InventoryController`: Endpoints REST pour l'inventaire

### Repositories
- `IProductRepository`: Interface d'accès aux données produits
- `IInventoryRepository`: Interface d'accès aux données inventaire

## API Endpoints

### Produits
- `GET /api/inventory/products` - Liste tous les produits
- `GET /api/inventory/products/:id` - Récupère un produit par ID
- `POST /api/inventory/products/store/:id` - Crée un produit pour un magasin
- `PUT /api/inventory/products/:productId/store/:storeId` - Met à jour un produit
- `DELETE /api/inventory/products/:id` - Supprime un produit
- `GET /api/inventory/products/name/:name` - Recherche par nom
- `GET /api/inventory/products/category/:category` - Recherche par catégorie
- `GET /api/inventory/products/store/:id` - Produits d'un magasin
- `GET /api/inventory/products/search/:search` - Recherche générale

### Inventaire
- `GET /api/inventory/stock/central` - Stock central avec pagination
- `GET /api/inventory/stock/store/:storeId` - Stock d'un magasin
- `GET /api/inventory/stock/store/:storeId/product/:productId` - Stock d'un produit
- `PUT /api/inventory/stock/store/:storeId/product/:productId` - Met à jour le stock
- `PATCH /api/inventory/stock/store/:storeId/product/:productId/increment` - Incrémente le stock
- `PATCH /api/inventory/stock/store/:storeId/product/:productId/decrement` - Décrémente le stock
- `GET /api/inventory/stock/low` - Stocks faibles

## Configuration

### Variables d'environnement
```env
PORT=3003
DATABASE_URL=postgresql://user:password@localhost:5432/inventory_db
NODE_ENV=development
```

### Base de données
Le service utilise Prisma ORM avec PostgreSQL. Les implémentations des repositories Prisma doivent être créées.

## Installation et démarrage

### Prérequis
- Node.js 18+
- PostgreSQL 15+
- npm ou yarn

### Installation

```bash
# Installation des dépendances
npm install

# Configuration de la base de données
cp .env.example .env
# Éditer .env avec vos paramètres de base de données

# Générer le client Prisma
npm run db:generate

# Appliquer les migrations
npm run db:migrate

# Peupler la base avec des données d'exemple
npm run db:seed
```

### Démarrage

```bash
# Démarrage en mode développement
npm run dev

# Construction
npm run build

# Démarrage en production
npm start
```

### Base de données

```bash
# Générer le client Prisma après modification du schéma
npm run db:generate

# Appliquer les changements de schéma en développement
npm run db:push

# Créer et appliquer une nouvelle migration
npm run db:migrate

# Peupler la base avec des données d'exemple
npm run db:seed

# Ouvrir Prisma Studio (interface graphique)
npm run db:studio

# Réinitialiser la base de données
npm run db:reset
```

## Docker

### Avec Docker Compose (recommandé)

```bash
# Démarrage avec PostgreSQL inclus
docker-compose up -d

# Voir les logs
docker-compose logs -f inventory-service

# Arrêt des services
docker-compose down
```

### Docker seul

```bash
# Construction de l'image
docker build -t inventory-service .

# Démarrage du conteneur (nécessite une base PostgreSQL)
docker run -p 3003:3003 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  inventory-service
```

## Documentation API

La documentation Swagger est disponible sur:
- http://localhost:3003/api-docs

## Health Check

- http://localhost:3003/health

## Statut d'implémentation

✅ **Complété:**
- Structure des entités
- Interfaces des repositories  
- Services métier
- Controllers REST
- Routes API
- Serveur Express
- Configuration Swagger
- Configuration Docker
- **Implémentation Prisma complète**
- **Repositories Prisma fonctionnels**
- **Schéma de base de données**
- **Scripts de migration et seed**
- **Configuration Docker Compose avec PostgreSQL**

⚠️ **À implémenter:**
- Tests unitaires
- Tests d'intégration
- Validation des entrées (Joi/Zod)
- Gestion des erreurs améliorée
- Logging structuré (Winston)
- Monitoring et métriques (Prometheus)
- Rate limiting
- Authentication middleware (si nécessaire)
- Cache Redis (si nécessaire)

## Notes techniques

Ce microservice a été extrait du backend principal (`src/backend`) en conservant la logique existante sans ajout de nouvelles fonctionnalités. Il utilise le même port 3003 que prévu dans l'architecture microservices avec auth-service (3001) et store-service (3002).
