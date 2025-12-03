# 🚀 NovaTech

Bienvenue sur le dépôt de **NovaTech**, une application e-commerce d'entrainement.

Ce projet est composé d'une architecture complète :
- **Frontend** : Une interface utilisateur réactive et élégante construite avec [Next.js](https://nextjs.org/).
- **Backend** : Une API robuste propulsée par [Express](https://expressjs.com/) et [Prisma](https://www.prisma.io/).
- **Base de données** : PostgreSQL pour la persistance des données.

---

## 🛠️ Prérequis

Avant de commencer, assurez-vous d'avoir installé les outils suivants sur votre machine :

- **[Node.js](https://nodejs.org/)** (version 18 ou supérieure recommandée)
- **[PostgreSQL](https://www.postgresql.org/)** (serveur de base de données local ou distant)
- **[Git](https://git-scm.com/)**

---

## 📦 Installation

Clonez ce dépôt sur votre machine locale :

```bash
git clone https://github.com/Charl2fde/NovaTech.git
cd NovaTech
```

### 1. Configuration du Backend

Rendez-vous dans le dossier `backend` et installez les dépendances :

```bash
cd backend
npm install
```

Créez un fichier `.env` à la racine du dossier `backend` avec les variables suivantes :

```env
PORT=3001
DATABASE_URL="postgresql://user:password@localhost:5432/novatech_db"
JWT_SECRET="votre_secret_jwt_super_securise"
STRIPE_SECRET_KEY="votre_cle_secrete_stripe"
```

Initialisez la base de données :

```bash
# Applique les migrations Prisma
npx prisma migrate dev --name init

# (Optionnel) Remplir la base de données avec des données de test
node seed_products.js
```

Pour lancer le serveur backend :

```bash
npm run dev
```
*Le serveur démarrera sur http://localhost:3001.*

### 2. Configuration du Frontend

Ouvrez un nouveau terminal, rendez-vous dans le dossier `frontend` et installez les dépendances :

```bash
cd frontend
npm install
```

Créez un fichier `.env.local` à la racine du dossier `frontend` :

```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

Pour lancer l'application frontend :

```bash
npm run dev
```
*L'application sera accessible sur http://localhost:3000.*

---

## 🚀 Lancer le projet

Une fois l'installation terminée, vous aurez besoin de deux terminaux ouverts :

1.  **Terminal 1 (Backend)** : `cd backend && npm run dev`
2.  **Terminal 2 (Frontend)** : `cd frontend && npm run dev`

Ouvrez votre navigateur sur **[http://localhost:3000](http://localhost:3000)** pour profiter de NovaTech !

---

## 📚 Technologies utilisées

-   **Frontend** : Next.js 15, React 19, Tailwind CSS, Lucide React.
-   **Backend** : Node.js, Express, Prisma ORM.
-   **Base de données** : PostgreSQL.
-   **Paiement** : Stripe.
-   **Authentification** : JWT (JSON Web Tokens).

---

## 🛡️ Sécurité

Les fichiers sensibles (`.env`) ne sont pas versionnés. Assurez-vous de ne jamais commiter vos clés secrètes (API Keys, mots de passe BDD) sur GitHub.
