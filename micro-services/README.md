# 🏗️ Architecture Microservices avec API Gateway

## 📖 Vue d'ensemble

Cette application utilise une **architecture microservices** moderne avec **Traefik** comme API Gateway pour gérer un système de gestion d'inventaire multi-magasins. L'architecture privilégie la séparation des responsabilités, la scalabilité et la maintenabilité.

## 🎯 Objectifs Architecturaux

- **Séparation des responsabilités** : Chaque microservice gère un domaine métier spécifique
- **Scalabilité horizontale** : Possibilité de scaler indépendamment chaque service
- **Résilience** : Isolation des pannes et tolérance aux erreurs
- **Déploiement indépendant** : Chaque service peut être déployé séparément
- **Technologie adaptée** : Choix technologique optimal par service

## 🏛️ Architecture des Microservices

### 🔐 User Service (Auth Service)
**Port**: 3031 | **Route**: `/api/auth/*`, `/api/users/*`

Responsabilités :
- Authentification JWT
- Gestion des utilisateurs (CRUD)
- Autorisation RBAC (Role-Based Access Control)
- Session management
- Hashage des mots de passe

**Technologies** :
- Node.js + TypeScript
- Express.js
- Prisma ORM
- PostgreSQL
- bcrypt + JWT

### 🏪 Store Service  
**Port**: 3032 | **Route**: `/api/stores/*`, `/api/stocks/*`

Responsabilités :
- Gestion des magasins
- Gestion des stocks par magasin
- Transferts entre magasins
- Configuration des magasins

**Technologies** :
- Node.js + TypeScript
- Express.js
- Prisma ORM
- PostgreSQL

### 📦 Inventory Service
**Port**: 3033 | **Route**: `/api/inventory/*`

Responsabilités :
- Gestion du catalogue produits
- Gestion des catégories
- Stock global
- Réapprovisionnement

**Technologies** :
- Node.js + TypeScript
- Express.js
- Prisma ORM
- PostgreSQL

### 💰 Sales Service
**Port**: 3034 | **Route**: `/api/sales/*`, `/api/returns/*`

Responsabilités :
- Gestion des ventes
- Traitement des retours
- Historique des transactions
- Calculs de revenus

**Technologies** :
- Node.js + TypeScript
- Express.js
- Prisma ORM
- PostgreSQL

## 🌐 API Gateway - Choix de Traefik

### Pourquoi Traefik ?

#### ✅ Avantages de Traefik

1. **Auto-discovery Docker** 
   - Configuration automatique via labels Docker
   - Pas de redémarrage requis lors de l'ajout de services
   
2. **Reverse Proxy Intelligent**
   - Load balancing automatique
   - Health checks intégrés
   - Circuit breaker

3. **Monitoring Intégré**
   - Dashboard web inclus
   - Métriques Prometheus natives
   - Logs détaillés (JSON)

4. **Sécurité**
   - Support HTTPS/TLS automatique
   - Middleware d'authentification
   - Rate limiting

5. **Configuration Dynamique**
   - Hot reload sans redémarrage
   - Configuration via fichiers ou labels
   - API de configuration REST

#### 🔄 Alternatives Considérées

| Solution | Avantages | Inconvénients | Verdict |
|----------|-----------|---------------|---------|
| **NGINX** | Performance, maturité | Configuration statique manuelle | ❌ Moins flexible |
| **Kong** | Riche en plugins | Plus complexe, plus lourd | ❌ Overhead |
| **Envoy** | Très performant | Configuration complexe | ❌ Courbe d'apprentissage |
| **Traefik** | Simple, auto-discovery | Moins de plugins | ✅ **CHOISI** |

### Configuration Traefik

```yaml
# Exemple de configuration via labels Docker
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.auth.rule=PathPrefix(`/api/auth`)"
  - "traefik.http.routers.auth.entrypoints=web"
  - "traefik.http.services.auth.loadbalancer.server.port=3031"
```

## 🗺️ Routage API

### Table de Routage

| Route | Service | Port | Description |
|-------|---------|------|-------------|
| `/api/auth/*` | user-service | 3031 | Authentification |
| `/api/users/*` | user-service | 3031 | Gestion utilisateurs |
| `/api/stores/*` | store-service | 3032 | Gestion magasins |
| `/api/stocks/*` | store-service | 3032 | Gestion stocks |
| `/api/inventory/*` | inventory-service | 3033 | Catalogue produits |
| `/api/sales/*` | sales-service | 3034 | Ventes |
| `/api/returns/*` | sales-service | 3034 | Retours |

### Exemple de Flux de Requête

```
Frontend → Traefik:80 → Service:30XX → Database:5432
```

1. **Client** fait une requête à `localhost/api/auth/login`
2. **Traefik** reçoit la requête et analyse le path
3. **Routage** vers `user-service:3031` basé sur `/api/auth/*`
4. **Service** traite la requête et interroge sa base
5. **Réponse** retourne via Traefik au client

## 🛡️ Sécurité

### Authentification
- **JWT Tokens** pour l'authentification stateless
- **RBAC** pour l'autorisation fine
- **Hashage bcrypt** pour les mots de passe

### Communication Inter-Services
- **Réseau Docker privé** `microservices`
- **Variables d'environnement** pour les secrets
- **Health checks** pour la disponibilité

### API Gateway Security
- **Rate limiting** via Traefik middlewares
- **CORS** configuré par service
- **HTTPS** en production avec Let's Encrypt

## 🗄️ Stratégie de Persistance

### Base de Données par Service
Chaque microservice a sa **propre base PostgreSQL** :

- `auth-db` → user-service
- `store-db` → store-service  
- `inventory-db` → inventory-service
- `sales-db` → sales-service

### Avantages
- **Isolation** : Pas de coupling entre services
- **Scalabilité** : Chaque DB peut être optimisée indépendamment
- **Résilience** : Panne d'une DB n'affecte pas les autres
- **Technologie** : Possibilité d'utiliser différents types de DB

### Communication Inter-Services
- **API REST** via HTTP pour la communication synchrone
- **Messages/Events** pour la communication asynchrone (future)

## 📊 Monitoring & Observabilité

### Stack de Monitoring

- **Traefik Dashboard** : `http://traefik.localhost:8080`
- **Prometheus** : Collecte des métriques (`localhost:9090`)
- **Grafana** : Visualisation (`localhost:3000`)
- **Logs** : Format JSON pour analyse

### Métriques Surveillées
- Latence des requêtes
- Taux d'erreur par service
- Throughput API
- Santé des bases de données
- Utilisation ressources

## 🚀 Déploiement

### Environnement de Développement
```bash
cd micro-services
docker-compose -f docker-compose.gateway.yml up -d
```

### Services Disponibles
- **Application** : http://localhost
- **Traefik Dashboard** : http://traefik.localhost:8080
- **Prometheus** : http://prometheus.localhost:9090
- **Grafana** : http://grafana.localhost:3000

### Healthchecks
Chaque service expose un endpoint `/health` :
- `GET /api/auth/health`
- `GET /api/stores/health`
- `GET /api/inventory/health`
- `GET /api/sales/health`

## 🔄 Évolution Architecture

### Patterns Implémentés
- ✅ **API Gateway Pattern**
- ✅ **Database per Service**
- ✅ **Service Discovery**
- ✅ **Circuit Breaker** (via Traefik)

### Patterns Futurs
- 🔄 **Event Sourcing** pour les ventes
- 🔄 **CQRS** pour la séparation lecture/écriture  
- 🔄 **Saga Pattern** pour les transactions distribuées
- 🔄 **Service Mesh** (Istio/Linkerd)

## 🏁 Conclusion

Cette architecture microservices avec Traefik comme API Gateway offre :

- **Flexibilité** : Développement et déploiement indépendants
- **Scalabilité** : Chaque service peut scaler selon ses besoins
- **Maintenabilité** : Code organisé par domaine métier
- **Résilience** : Isolation des pannes
- **Observabilité** : Monitoring complet de la stack

L'utilisation de **Traefik** simplifie considérablement la gestion du routage et du load balancing tout en offrant des fonctionnalités avancées de monitoring et de sécurité.

---

📚 **Documentation** : Consultez les README individuels de chaque service pour plus de détails techniques.
