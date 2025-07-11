FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json tsconfig.json vite.config.ts ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY src/backend ./src/backend
RUN npm run build:backend


COPY src/frontend ./src/frontend
RUN npm run build:frontend

FROM node:20-alpine
WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist/backend ./dist/backend
COPY --from=build /app/dist/public  ./dist/public

EXPOSE 3000
CMD ["node", "dist/backend/index.js"]
