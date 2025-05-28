# Analyses des besoins

## Fonctionnels
- Recherche de produit : par identifiant, nom (contient), ou catégorie (exact).

- Enregistrement d'une vente : sélection de plusieurs produits, calcul du total, création de la transaction, mise à jour automatique du stock.

- Gestion des retours : annulation d'une vente existante, restitution du stock.

- Consultation du stock : affichage de l'état actuel des stocks de tous les produits.

## Non-fonctionnels
- Robustesse : gestion des erreurs (stock insuffisant, ID introuvable, etc.).

- Simplicité : interface console, sans serveur HTTP.

- Performance : latence réduite, temps de réponse interactif.

- Portabilité : conteneurisé via Docker, base de données PostgreSQL locale.