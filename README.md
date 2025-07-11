# Labo 3 – Exposition d’une API RESTful pour un système multi-magasins

## Description

Ce projet implémente un **système de point de vente** complet pour un petit magasin de quartier. L'application suit une architecture **3-tiers** :

- **Présentation** : Interface web React avec TypeScript pour l'interaction utilisateur
- **Logique métier** : API REST Express.js avec TypeScript gérant la logique d'affaires
- **Persistance** : Base de données PostgreSQL avec couche d'abstraction Prisma ORM

Le but est de consolider les concepts d'architecture multicouche, d'APIs REST, et d'abstraction de la persistance, tout en appliquant les bonnes pratiques CI/CD (lint, tests unitaires, conteneurisation Docker).

## Choix technologiques

| Composant         | Choix                     | Justification                                                   |
|-------------------|---------------------------|-----------------------------------------------------------------|
| Frontend          | React + TypeScript        | Composants réutilisables, typage fort, écosystème mature        |
| Backend           | Express.js + TypeScript   | API REST simple, middleware flexibles, typage fort              |
| Base de données   | PostgreSQL                | Fiabilité, transactions ACID, support avancé des requêtes       |
| ORM               | Prisma                    | Migrations faciles, client type-safe, intégration TypeScript    |
| Authentification  | JWT + bcrypt              | Stateless, sécurisé, standard industrie                         |
| UI/Build          | Vite                      | Build rapide, HMR, optimisations modernes                       |
| Tests             | Jest                      | Couverture complète, mocks faciles, intégration TypeScript      |
| Linter            | ESLint                    | Qualité de code, règles configurables                           |
| Documentation API | Swagger/OpenAPI           | Documentation interactive, génération automatique               |
| CI/CD             | GitHub Actions            | Intégration native GitHub, pipelines simples                    |
| Conteneurisation  | Docker + Compose          | Reproductibilité, isolation, orchestration multi-services       |

## Architecture du système

L'application suit une architecture 3-tiers claire :

```
┌─────────────────┐    HTTP/REST   ┌─────────────────┐    SQL/ORM    ┌─────────────────┐
│   Frontend      │◄──────────────►│     Backend     │◄─────────────►│   PostgreSQL    │
│   React + TS    │                │  Express + TS   │               │   Database      │
│                 │                │                 │               │                 │
│ • Components    │                │ • Controllers   │               │ • Tables        │
│ • Stores        │                │ • Services      │               │ • Relations     │
│ • API Client    │                │ • Repositories  │               │ • Constraints   │
│ • Routing       │                │ • Middleware    │               │ • Indexes       │
└─────────────────┘                └─────────────────┘               └─────────────────┘
```

## Structure du projet

```
LOG430-Lab0/
├── src/
│   ├── backend/               # API REST Express.js
│   │   ├── application/       # Services de logique métier
│   │   ├── domain/           # Entités et interfaces métier
│   │   ├── infrastructure/   # Repositories Prisma, configs
│   │   ├── interfaces/       # Controllers, routes, middlewares
│   │   ├── doc_swagger/      # Documentation API générée
│   │   ├── server.ts         # Point d'entrée du serveur
│   │   └── Dockerfile        # Build backend
│   │
│   └── frontend/             # Application React
│       ├── src/
│       │   ├── components/   # Composants React réutilisables
│       │   ├── pages/        # Pages de l'application
│       │   ├── stores/       # Gestion d'état (Zustand)
│       │   ├── APIs/         # Client API REST
│       │   ├── DTOs/         # Types TypeScript
│       │   └── utils/        # Utilitaires
│       ├── public/           # Assets statiques
│       ├── index.html        # Point d'entrée HTML
│       └── Dockerfile        # Build frontend
│
├── prisma/                   # Configuration base de données
│   ├── schema.prisma         # Schéma de la DB
│   ├── seed.ts              # Données de test
│   └── migrations/          # Migrations versionnées
│
├── tests/                    # Tests automatisés
│   ├── unit/                # Tests unitaires
│   └── mocks/               # Mocks pour les tests
│
├── docs/                     # Documentation
│   ├── ADR/                 # Architecture Decision Records
│   └── UML/                 # Diagrammes UML
│
├── coverage/                 # Rapports de couverture
├── docker-compose.yml        # Orchestration des services
├── package.json              # Dépendances et scripts
└── README.md                 # Ce fichier
```

## Prérequis

- **Node.js** v20 ou supérieur
- **npm** (inclus avec Node.js)
- **Docker** et **Docker Compose**
- **Git** pour cloner le repository

## Installation et lancement

### 1. Cloner le projet
```bash
git clone https://github.com/MarcoBisson/LOG430-Lab0.git
cd LOG430-Lab0
```

### 2. Installation des dépendances
```bash
npm install
```

### 3. Configuration de l'environnement
Créez un fichier `.env` à la racine du projet :
```bash
DATABASE_URL="postgresql://admin:admin@localhost:5432/posdb?schema=public"
```

## Lancement de l'application

### Option 1 : Avec Docker (Recommandé)

**Lancement complet avec Docker Compose :**
```bash
# Construire et lancer tous les services (base de données, backend, frontend)
docker-compose up --build

# En mode détaché (arrière-plan)
docker-compose up -d --build
```

**Accès aux services :**
- **Frontend** : http://localhost:5173
- **Backend API** : http://localhost:3000
- **Documentation Swagger** : http://localhost:3000/api-docs
- **Base de données** : localhost:5432

**Arrêter les services :**
```bash
docker-compose down
```

### Option 2 : Développement local

**1. Lancer la base de données :**
```bash
docker-compose up db -d
```

**2. Configuration de la base de données :**
```bash
# Appliquer les migrations
npx prisma migrate dev --name <nom_migration>

# Générer le client Prisma
npx prisma generate

# Peupler avec des données de test
npx prisma db seed

# Réinitialiser les données
npm run db-reset
```

**3. Lancer le backend :**
```bash
# Mode développement avec rechargement automatique
npm run dev:backend

# Ou build + start
npm run build:backend
npm run start:backend
```

**4. Lancer le frontend :**
```bash
# Mode développement
npm run start:frontend

# Ou build + preview
npm run build:frontend
npm run preview:frontend
```

## Commandes utiles

### Base de données
```bash
# Visualiser la base de données avec Prisma Studio
npm run studio

# Réinitialiser la base de données
npm run db-reset

# Générer la documentation Swagger
npm run generate:swagger
```

### Tests et qualité
```bash
# Exécuter tous les tests avec couverture
npm test

# Linter (vérification du code)
npm run lint

# Correction automatique du linting
npm run lint:fix
```

### Build
```bash
# Build complet (backend + frontend)
npm run build

# Build backend seulement
npm run build:backend

# Build frontend seulement
npm run build:frontend
```

## Fonctionnement de l'application

### Interface utilisateur
L'application dispose d'une interface web moderne développée avec React qui permet :

- **Tableau de bord** : Vue d'ensemble des ventes, stocks et statistiques
- **Gestion des produits** : Ajouter, modifier, rechercher et gérer l'inventaire
- **Point de vente** : Interface de caisse pour enregistrer les ventes
- **Gestion des retours** : Traitement des retours et remboursements
- **Rapports** : Analyses des ventes et performance du magasin
- **Administration** : Gestion des utilisateurs et configuration

### API REST
Le backend expose une API REST complète avec les endpoints suivants :

- `GET/POST/PUT/DELETE /api/products` - Gestion des produits
- `GET/POST /api/sales` - Enregistrement et consultation des ventes
- `GET/POST /api/returns` - Gestion des retours
- `GET /api/reports` - Génération de rapports
- `GET/POST /api/stock` - Gestion des stocks et inventaire
- `GET/POST /api/logistics` - Transferts et réapprovisionnement
- `POST /api/auth/login` - Authentification utilisateur

### Base de données
Le schéma de base de données inclut :

- **Products** : Catalogue des produits avec catégories et prix
- **Sale** : Transactions de vente avec détails des articles
- **SaleItem** : Produits vendus dans chaque transaction
- **Return** : Retours de marchandise
- **Stock** : Niveaux de stock par magasin
- **StoreStock** : Quantité d'un produit dans un magasin
- **User** : Utilisateurs avec rôles et permissions
- **Store** : Gestion multi-magasins

### Sécurité et authentification
- Authentification JWT avec rôles utilisateur (ADMIN, LOGISTICS, STAFF, CLIENT)
- Validation des données côté serveur
- Middleware d'autorisation pour protéger les endpoints sensibles
- Hashage des mots de passe

## Pipeline CI/CD

La pipeline CI/CD (lint, tests, build et push) s'exécute automatiquement sur GitHub Actions lors de chaque push/pull request ou déclenchement manuel. Voici le diagramme Mermaid détaillé :

<details>
<summary>Afficher le graphique des steps du CI/CD avec Mermaid</summary>

```mermaid
flowchart TD
    A["📥 Checkout code"]
    B["⚙️ Set up Node.js v20"]
    C["📦 Install dependencies: npm ci"]
    D["🔍 Run linters: npm run lint"]
    E["🧪 Run tests: npm test"]
    F["📊 Generate coverage report"]
    G["🐳 Set up Docker Buildx"]
    H["🔐 Log in to Docker Hub"]
    I["🏗️ Build Docker images"]
    J["📤 Push to registry"]

    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
    H --> I
    I --> J
```

</details>

### Technologies utilisées dans la pipeline
- **GitHub Actions** pour l'orchestration
- **ESLint** pour la qualité du code
- **Jest** pour les tests unitaires avec couverture
- **Docker Multi-stage builds** pour l'optimisation des images
- **Docker Hub** pour le registry d'images

#### Exemple de résultat pipeline
![Workflow passed!](screenshots/CIisWorking.png)
