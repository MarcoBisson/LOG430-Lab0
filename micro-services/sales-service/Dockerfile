FROM node:20-alpine

# Installer les dépendances système nécessaires pour Prisma
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Copier les fichiers de configuration
COPY package*.json ./

# Installer toutes les dépendances (dev et prod)
RUN npm ci

# Copier le code source
COPY . .

# Générer le client Prisma
RUN npx prisma generate

# Construire l'application TypeScript
RUN npm run build

# Nettoyer les devDependencies après le build
RUN npm ci --only=production && npm cache clean --force

# Exposer le port
EXPOSE 3034

# Créer un healthcheck
COPY healthcheck.js .
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Démarrer l'application
CMD ["npm", "start"]
