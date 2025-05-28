# LOG430 - Laboratoire 1 : Architecture 2-tier (Client/Serveur) et Persistance

## Description

Ce projet implémente un **système de point de vente** simple pour un petit magasin de quartier. L'application suit une architecture **2-tiers** :

- **Client** : application console TypeScript/Node.js interactive  
- **Serveur** : base de données PostgreSQL avec couche d'abstraction Prisma ORM  

Le but est de consolider les concepts d'architecture client/serveur et d'abstraction de la persistance, tout en appliquant les bonnes pratiques CI/CD (lint, tests unitaires, build Docker).

## Objectifs d'apprentissage

- Concevoir une architecture 2-tiers (client console et base de données)  
- Implémenter une couche de persistance abstraite
- Documenter et justifier les décisions d'architecture (diagrammes UML, ADRs)  
- Conteneuriser l'application avec Docker et Docker Compose  
- Mettre en place une pipeline CI/CD automatisant lint, tests et build Docker

## Analyse des besoins

**Fonctionnels** :

1. Ajouter un produit
2. Recherche de produit : par identifiant, nom (contient), ou catégorie (exact).
3. Enregistrement d'une vente : sélection de plusieurs produits, calcul du total, création de la transaction, mise à jour automatique du stock. 
4. Gestion des retours : annulation d'une vente existante, restitution du stock.
5. Consultation du stock : affichage de l'état actuel des stocks de tous les produits.

**Non-fonctionnels** :

1. Robustesse : gestion des erreurs (stock insuffisant, ID introuvable, etc.).
2. Simplicité : interface console, sans serveur HTTP.
3. Performance : latence réduite, temps de réponse interactif.
4. Portabilité : conteneurisé via Docker, base de données PostgreSQL locale.
5. Testabilité : tests automatisés de toutes les fonctionnalités 

## Choix technologiques

| Composant         | Choix                     | Justification                                                   |
|-------------------|---------------------------|-----------------------------------------------------------------|
| Langage           | TypeScript / Node.js      | Typage, productivité, écosystème mature                         |
| ORM               | Prisma                    | Migrations faciles, gestion des transactions, TS-first, schema des tables dans le code                                                                                                              |
| Base de données   | PostgreSQL                | Fiabilité, transactions ACID, support local via Docker          |
| Console UI        | Inquirer.js               | Prompts interactifs, facile à intégrer                          |
| Tests             | Jest                      | Couverture, mocks, intégration simple avec TypeScript           |
| Linter            | ESLint                    | Qualité de code, évolue souvent                                 |
| CI/CD             | GitHub Actions            | Intégration GitHub (où se trouve mon repo), pipelines simples   |
| Conteneurisation  | Docker + Compose          | Reproductibilité, portabilité, orchestration locale             |

## Structure du projet

```
LOG430-Lab0/
├── src/                   # Code TypeScript
│   ├── domain/            # Entités & services métier
│   ├── infrastructure/    # PrismaRepository, schéma Prisma
│   └── presentation/      # index.ts (console UI)
├── prisma/                # schéma & migrations
├── tests/                 # Tests unitaires (Jest)
├── docs/                  # Documentation (ADRs, UML)
├── .env                   # Variables d’environnement
├── Dockerfile             # Build de l’application
├── docker-compose.yml     # Orchestration (app + postgres)
├── jest.config.js         # Configuration Jest
├── tsconfig.json          # Configuration TypeScript
├── .eslintrc.cjs          # Configuration ESLint
├── package.json           # Dépendances & scripts
└── README.md              # Ce fichier
```

## Prérequis

- Node.js = v20  
- npm  
- Docker & Docker Compose  
- PostgreSQL (via Docker Compose ou service local)
- .env (`DATABASE_URL="postgresql://admin:admin@localhost:5432/posdb?schema=public"`)

## Installation

```bash
git clone https://github.com/MarcoBisson/LOG430-Lab0.git
cd LOG430-Lab0
npm install
```

## Configuration de la base de données
1. Créez un fichier `.env` à la racine:
```bash
DATABASE_URL="postgresql://admin:admin@localhost:5432/posdb?schema=public"
```
2. Ajouter des tables:
```bash
# Modifiez prisma/schema.prisma
npx prisma migrate dev --name <nom_migration>
npx prisma generate
```
3. Visualiser la base de données:
```bash
npm run studio
```
4. Réinitialiser la base de données:
```bash
npm run db-reset
```

## Exécution locale (hors conteneur)
```bash
npm run build
npm run start
```

## Exécuter les tests
```bash
npm run test
```

## Exécution avec Docker
```bash
# Build de l'image
docker-compose build

# Lancer l'app avec console interactive
docker-compose run --rm app

# Fermer les conteneur
docker-compose down
```

## Pipeline CI/CD
La pipeline CI/CD (lint, tests, build et push) s'exécute automatiquement à chaque push, pull request ou déclenchement manuel. Voici le diagramme Mermaid détaillant chaque étape de la pipeline :

<details>
<summary>Afficher le graphique des steps du CI/CD avec Mermaid</summary>

```mermaid
flowchart TD
    A["Checkout code"]
    B["Set up Node.js"]
    C["Install dependencies: npm ci"]
    D["Run linters: lint"]
    E["Run tests: jest"]
    F["Set up Docker Buildx"]
    G["Log in to Docker Hub"]
    H["Build and push Docker image"]

    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H

```
</details>

#### Exemple de résultat pipeline

![Workflow passed!](screenshots/CIisWorking.png)