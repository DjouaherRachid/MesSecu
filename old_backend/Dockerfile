# Étape de construction
FROM node:20 AS builder

WORKDIR /app

# Copie des fichiers de configuration
COPY package*.json ./

# Installation des dépendances
RUN npm install

# Copie du code source
COPY . .

# Construction de l'application
RUN npm run build

# Étape de production
FROM node:20-slim

WORKDIR /app

# Copie des fichiers nécessaires depuis l'étape de construction
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/package*.json /app/

# Installation des dépendances de production
RUN npm install --only=production

# Exposition du port
EXPOSE 3000

# Commande de démarrage
CMD ["node", "dist/main"]
