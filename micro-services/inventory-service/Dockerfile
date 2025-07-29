# Image de base Node.js
FROM node:20-slim

# Installer les dépendances système pour Prisma
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
COPY tsconfig.json ./

# Installer toutes les dépendances
RUN npm ci && npm cache clean --force

# Copier le code source
COPY src/ ./src/
COPY prisma/ ./prisma/
COPY healthcheck.js ./

# Générer le client Prisma
RUN npx prisma generate

# Exposer le port
EXPOSE 3033

# Variables d'environnement
ENV NODE_ENV=development
ENV PORT=3033

# Commande de démarrage en mode développement
CMD ["npm", "run", "dev"]
