# Dockerfile pour le microservice d'authentification
FROM node:20-alpine

# Installer les dépendances système nécessaires pour Prisma
RUN apk add --no-cache openssl

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
COPY tsconfig.json ./

# Installer les dépendances
RUN npm install

# Copier le code source
COPY src/ ./src/
COPY prisma/ ./prisma/
COPY healthcheck.js ./

# Générer le client Prisma
RUN npx prisma generate

# Construire l'application
RUN npm run build

# Créer le dossier logs
RUN mkdir -p /app/logs

# Exposer le port
EXPOSE 3036

# Vérification de santé
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Démarrer l'application
CMD ["npm", "start"]
