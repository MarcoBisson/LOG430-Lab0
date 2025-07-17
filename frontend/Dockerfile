FROM node:20-alpine

WORKDIR /app

# Copier package.json
COPY frontend/package*.json ./

# Installer les dépendances
RUN npm ci

# Copier le code source
COPY frontend/ ./

# Build l'application
RUN npm run build

# Servir avec un serveur simple
EXPOSE 5173
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "5173"]
