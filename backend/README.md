# Base de données
Il faut tout d'abord ajouter un .env pour la base de données avec `DATABASE_URL="postgres://admin:admin@localhost:5432/posdb"`

## Étape pour ajouter des tables
1. Modifiez le prisma.schema pour ajouter les tables voulues
2. Exécutez la commande `npx prisma migrate dev --name [...]`
3. Exécutez la commande `npx prisma generate`

## Pour voir la base de données en local
Exécutez la commande `npx prisma studio`, cette commande permet d'afficher la base de données sur le web.

## Pour réinitialiser la base de données
Exécutez la commande `npx prisma migrate reset [migration]`
