# 🔐 Messagerie Sécurisée

## 📌 Description
Ce projet est une application de **messagerie sécurisée** développée dans le cadre d’un projet académique.  
L’objectif est de permettre aux utilisateurs de communiquer de manière **confidentielle et en temps réel**, grâce à un système de **chiffrement hybride RSA/AES-GCM**.

- **RSA** : utilisé pour chiffrer et échanger les clés AES entre utilisateurs.  
- **AES-GCM** : utilisé pour chiffrer/déchiffrer les messages.  
- **HTTPS + JWT** : assurent la sécurité des échanges et l’authentification.  
- **WebSocket** : permet une communication temps réel pour l’envoi et la réception des messages.  

---

## ⚙️ Fonctionnalités principales
- 🔑 **Inscription / Connexion sécurisée** (JWT + Refresh Token)  
- 📡 **Communication en temps réel** (WebSocket)  
- 🔐 **Chiffrement hybride RSA/AES-GCM** :
  - Génération et gestion des clés RSA/AES
  - Échange de clés sécurisé via RSA
  - Chiffrement et déchiffrement AES des messages  
- 📂 **Téléchargement / Importation des clés** en cas de changement de navigateur, d’appareil ou de suppression des données locales  
- 👥 **Gestion des conversations** (individuelles et de groupe)  
- 🔒 **Utilisation obligatoire du protocole HTTPS** pour toutes les communications  

---

## 🏗️ Architecture technique
### **Backend (API + WebSocket)**
- [NestJS](https://nestjs.com/) : framework Node.js modulaire et maintenable
- [TypeORM](https://typeorm.io/) : ORM pour gérer les entités et migrations
- [PostgreSQL](https://www.postgresql.org/) : base de données relationnelle robuste
- [JWT](https://jwt.io/) : authentification stateless
- [HTTPS](https://developer.mozilla.org/fr/docs/Web/HTTP/Overview) : chiffrement des communications

### **Frontend**
- [ReactJS](https://react.dev/) : bibliothèque JavaScript pour l’interface utilisateur
- Gestion du chiffrement côté client avec **Web Crypto API**
- Connexion WebSocket sécurisée pour la messagerie instantanée

---

## 🚀 Installation & Lancement

### 1️⃣ Prérequis
- Node.js >= 18  
- PostgreSQL >= 14  
- Docker

### 2️⃣ Cloner le projet
```bash
git clone https://github.com/DjouaherRachid/MesSecu.git
cd MesSecu
```

### 3️⃣ Configurer les variables d’environnement

Créer un fichier .env à la racine du projet et remplir les valeurs nécessaires :
POSTGRES_USER=admin
POSTGRES_PASSWORD=supersecurepassword
POSTGRES_DB=postgres
DB_TYPE=postgres
DB_HOST=db
DB_PORT=5432

#### URLs frontend/backend
REACT_APP_BACKEND_URL=https://localhost:8000
FRONTEND_URL=https://localhost:3000

#### API interne
INTERNAL_API_KEY=$2b$10.GFRO0m8ImsiYbVEY4/TG

#### JWT
JWT_ACCESS_SECRET=qPZJ%93fL$w7n!aC@eY*UvR2mX*dKzTb (exemple)
JWT_REFRESH_SECRET=Zr$5bG!qD@v8^LmX*Ajc39&yWkUuE!tQ (exemple)

#### HTTPS
HTTPS=true
SSL_CRT_FILE=certs/localhost.pem
SSL_KEY_FILE=certs/localhost-key.pem


### 4️⃣ Lancer le projet via docker
```
docker-compose up --build
```

### 📚 Scénario d’utilisation

Un utilisateur s’inscrit → ses clés RSA sont générées.

Lors d’une conversation, une clé AES unique est générée pour chiffrer les messages.

Cette clé AES est chiffrée avec la clé publique RSA des autres participants.

Les messages sont envoyés chiffrés via WebSocket et stockés chiffrés en base.

En cas de changement de navigateur ou d’appareil, l’utilisateur peut télécharger / importer sa clé privée RSA pour récupérer l’accès à ses messages.
