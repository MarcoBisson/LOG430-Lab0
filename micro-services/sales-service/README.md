# Sales Service

Microservice de gestion des ventes et des retours.

## Description

Ce microservice gère toutes les opérations liées aux ventes :
- Enregistrement des ventes
- Consultation des ventes
- Traitement des retours
- Rapports de ventes (par magasin, produits populaires)

## Technologies

- Node.js + TypeScript
- Express.js
- Prisma ORM
- PostgreSQL
- Swagger/OpenAPI
- Docker

## Installation

1. Installer les dépendances :
```bash
npm install
```

2. Configurer les variables d'environnement :
```bash
cp .env.example .env
# Éditer le fichier .env avec vos configurations
```

3. Générer le client Prisma :
```bash
npm run db:generate
```

4. Appliquer les migrations :
```bash
npm run db:migrate
```

## Développement

Démarrer en mode développement :
```bash
npm run dev
```

Le service sera disponible sur `http://localhost:3034`

## Construction et déploiement

1. Construire l'application :
```bash
npm run build
```

2. Démarrer en production :
```bash
npm start
```

## Docker

Construire l'image Docker :
```bash
docker build -t sales-service .
```

Démarrer le conteneur :
```bash
docker run -p 3034:3034 sales-service
```

## API Documentation

La documentation Swagger est disponible sur `http://localhost:3034/api-docs`

## Endpoints principaux

### Ventes
- `POST /api/sales` - Enregistrer une vente
- `GET /api/sales/:id` - Récupérer une vente
- `GET /api/sales/reports/by-store` - Rapports par magasin
- `GET /api/sales/reports/top-products` - Produits les plus vendus

### Retours
- `POST /api/returns/:saleId` - Traiter un retour

### Health Check
- `GET /health` - Vérification de l'état du service

## Tests

Exécuter les tests :
```bash
npm test
```

Exécuter les tests en mode watch :
```bash
npm run test:watch
```

## Architecture

Le microservice suit une architecture en couches :
- **Entities** : Modèles de domaine
- **Repositories** : Accès aux données
- **Services** : Logique métier
- **Controllers** : Gestion des requêtes HTTP
- **Routes** : Configuration des endpoints
- **Infrastructure** : Implémentations concrètes (Prisma)

## Base de données

Le service utilise une base de données PostgreSQL avec les tables :
- `Product` : Produits
- `Store` : Magasins
- `Sale` : Ventes
- `SaleItem` : Articles vendus
- `User` : Utilisateurs avec leurs accès

## Configuration

Variables d'environnement disponibles :
- `PORT` : Port d'écoute (défaut: 3034)
- `DATABASE_URL` : URL de connexion PostgreSQL
- `NODE_ENV` : Environnement (development/production)
