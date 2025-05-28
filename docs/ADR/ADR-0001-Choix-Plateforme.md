# ADR 0001 – Choix de la plateforme

## Contexte
Besoin d'un environnement rapide et facile à configurer, avec typage pour faciliter la gestion des objets et réduire les problèmes possibles lorsque le typage n'est pas présent en cours de développement.

## Options considérées
### Option 1 : Node.js + TypeScript
- **Avantages**  
  - Démarrage rapide
  - Typage fort avec TS
  - Écosystème riche avec tous les packages disponibles  
- **Inconvénients**  
  - Moins performant pour du calcul intensif

### Option 2 : Java
- **Avantages**  
  - Très mature, robuste et une bonne gestion de la concurrence
- **Inconvénients**  
  - Configuration plus verbose et cycle de build/rebuild plus long
  - Typage en Java plus verbose que TS

### Option 3 : Python
- **Avantages**  
  - Démarage extrêmement rapide
  - Syntaxe très simplifié
- **Inconvénients**  
  - Typage optionnel ce qui peut causer des erreurs plus facilement
  - Moins adapter à de grosses applications


## Décision
J'ai choisit **Node.js + TypeScript** pour sa combinaison de productivité (typage, hot-reload), d'un écosystème complet et une courbe d'apprentissage réduite dû au fait que j'en ai déjà fait.

## Conséquences
- **Positif** :  
  - Temps de développement réduit grâce à la vérification statique et aux nombreux packages présents  
- **Négatif** :  
  - Dépendance à l'environnement Node.js 
  - Besoin de compiler avant toutes les mises en production
