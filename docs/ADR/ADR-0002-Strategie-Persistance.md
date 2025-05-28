# ADR 0002 – Stratégie de persistance

## Contexte
Choisir une stratégie pour gérer la persistance des données dans l'application.

## Options considérées
### Option 1 : Client pg + SQL brut
- **Avantages**  
  - Grande flexibilité avec contrôle total sur les requêtes
  - Bonne performances sans de surcoût ORM
- **Inconvénients**  
  - Gestion manuelle des migrations et des transactions
  - Risque d'erreurs SQL

### Option 2 : Prisma ORM
- **Avantages**  
  - TS-first: génération automatique d'un client TypeScript
  - Migrations intégrées et API fluide
- **Inconvénients**  
  - Surcoût runtime lié à l'ORM
  - Nécessité de générer le client avant la compilation et d'inclure le code généré

### Option 3 : MikroORM
- **Avantages**  
  - TS-first, supporte MongoDB et SQL
  - API moderne
- **Inconvénients**  
  - Moins utilisé que Prisma donc communauté plus petite
  - Configuration initiale assez complexe


## Décision
J'ai choisit **Prisma ORM** pour sa simplicité d'intégration dans un projet TypeScript, mais aussi pour le support natif des migrations et la possibilité de typé le tout.

## Conséquences
- **Positif** :  
  - Clarté et sécurité du typage pour les accès à la base de données
  - Moins de code SQL à directement écrire
- **Négatif** :  
  - Coût de runtime élevé
  - Étape de génération supplémentaire
