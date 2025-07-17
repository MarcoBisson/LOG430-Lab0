# Auth Service - Microservice d'Authentification

Ce microservice gère l'authentification, la gestion des utilisateurs et l'autorisation RBAC pour l'application.

## 🚀 Fonctionnalités

- **Authentification JWT** : Connexion/déconnexion sécurisée
- **Gestion des utilisateurs** : CRUD complet des utilisateurs
- **Autorisation RBAC** : Contrôle d'accès basé sur les rôles
- **Session management** : Gestion des sessions utilisateur
- **Cache Redis** : Cache pour optimiser les performances
- **Base de données PostgreSQL** : Stockage des données utilisateur

## 🏗️ Architecture

```
src/
├── controllers/          # Contrôleurs Express
├── services/            # Logique métier
├── repositories/        # Accès aux données (Prisma)
├── middlewares/         # Middlewares Express
├── routes/              # Routes API
├── entities/            # Modèles de données
├── utils/               # Utilitaires
└── config/              # Configuration
```

## 🔧 Installation

1. **Cloner et installer les dépendances**
```bash
cd services/user-service
npm install
```

2. **Configurer l'environnement**
```bash
cp .env.example .env
# Éditer le fichier .env avec vos configurations
```

3. **Démarrer avec Docker (recommandé)**
```bash
docker-compose up -d
```

4. **Ou démarrer en mode développement**
```bash
# Démarrer PostgreSQL et Redis
npm run prisma:migrate
npm run dev
```

## 📚 API Endpoints

### Authentification
- `POST /api/auth/login` - Connexion utilisateur
- `POST /api/auth/logout` - Déconnexion utilisateur
- `POST /api/auth/refresh` - Renouvellement de token

### Gestion des utilisateurs
- `GET /api/users/profile` - Profil utilisateur connecté
- `GET /api/users/profile/access` - Accès magasin de l'utilisateur connecté
- `GET /api/users` - Liste des utilisateurs (Admin)
- `POST /api/users` - Créer un utilisateur (Admin)
- `PUT /api/users/:id` - Mettre à jour un utilisateur
- `DELETE /api/users/:id` - Supprimer un utilisateur (Admin)

### Gestion des accès staff (Admin/Manager)
- `POST /api/users/:id/stores` - Ajouter un accès magasin à un staff
- `DELETE /api/users/:id/stores/:storeId` - Supprimer un accès magasin d'un staff
- `PUT /api/users/:id/stores` - Définir tous les accès magasins d'un staff

### Health Check
- `GET /health` - Vérification de l'état du service

## 🔐 Authentification

Le service utilise JWT (JSON Web Tokens) pour l'authentification :

```bash
# Exemple de requête avec token
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:3001/api/users/profile
```

## 👥 Rôles et Permissions

Le système implémente une logique d'accès automatique basée sur les rôles :

### 🔐 Logique d'accès automatique

- **ADMIN** : Accès à **tous les magasins** (SALES, LOGISTICS, HEADQUARTER)
- **CLIENT** : Accès aux **magasins SALES** uniquement (pour faire des achats)
- **STAFF** : Accès aux **magasins assignés** (peut être plusieurs, gestion manuelle)
- **LOGISTICS** : Accès aux magasins **SALES et LOGISTICS** (pour la chaîne d'approvisionnement)

### 🔄 Gestion automatique des accès

Les accès sont automatiquement calculés et assignés lors de :
- La création d'un utilisateur
- La modification du rôle d'un utilisateur
- L'exécution du script de correction des accès

```bash
# Corriger les accès de tous les utilisateurs
npm run prisma:fix-access

# Tester la logique d'accès
npm run prisma:test-access
```

## 🗄️ Base de données

Le service utilise PostgreSQL avec Prisma ORM :

```bash
# Migrations
npm run prisma:migrate

# Génération du client
npm run prisma:generate

# Seeding (données de test)
npm run prisma:seed
```

## 📊 Monitoring

- **Logs** : Winston pour la journalisation
- **Health Check** : Endpoint `/health`
- **Métriques** : Prêt pour l'intégration Prometheus

## 🐳 Docker

```bash
# Construction de l'image
docker build -t auth-service .

# Démarrage complet avec docker-compose
docker-compose up -d

# Logs
docker-compose logs -f auth-service
```

## 🧪 Tests

```bash
# Tests unitaires
npm test

# Tests d'intégration
npm run test:integration

# Coverage
npm run test:coverage
```

## 🔧 Configuration

Variables d'environnement importantes :

```env
PORT=3001
AUTH_DATABASE_URL=postgresql://auth_user:auth_password@localhost:5432/auth_db
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=1h
REDIS_HOST=localhost
REDIS_PORT=6379
```

## 🚦 États du service

- **Développement** : `npm run dev`
- **Production** : `npm run build && npm start`
- **Docker** : `docker-compose up`

## 📞 Support

Pour toute question ou problème, consultez la documentation ou créez une issue dans le repository.
