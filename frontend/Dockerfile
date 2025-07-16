FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./

COPY src/frontend/ ./

RUN npm install --legacy-peer-deps

RUN npm run build:frontend

EXPOSE 5173

CMD ["npm", "run", "start:frontend"]