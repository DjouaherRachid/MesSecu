FROM node:18-alpine

WORKDIR /app

# Copie seulement les manifests et installe TOUTES les dépendances
COPY package*.json ./
RUN npm install

# Copie le reste du code
COPY . .

ENV NODE_ENV=development

CMD ["npm", "run", "start:dev"]
