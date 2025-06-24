FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY tsconfig.json ./
COPY src/ ./src/

RUN npm install --legacy-peer-deps

RUN npm run build:backend

EXPOSE 3000

CMD ["npm", "run", "start:backend"]
