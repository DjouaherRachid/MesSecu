#!/bin/sh

echo "⏳ Attente de la base de données..."
until nc -z db 5432; do
  sleep 1
done
echo "✅ Base de données prête !"

# Lancer toutes les migrations non encore exécutées (y compris les seeds)
echo "📦 Lancement des migrations (avec seed si non déjà exécutée)..."
npx ts-node -r tsconfig-paths/register src/seed.ts

# Démarrer l'application
echo "🚀 Lancement de l'application..."
npm run start:dev
