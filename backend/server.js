require('dotenv').config(); // Charge les variables secrètes depuis le fichier .env (comme les mots de passe)
const express = require('express'); // Importe le framework Express pour créer le serveur
const cors = require('cors'); // Permet au Frontend (React) de parler au Backend
const cookieParser = require('cookie-parser'); // Permet de lire les cookies (pour la connexion)
const prisma = require('./config/prisma'); // Importe la connexion à la base de données
const authRoutes = require('./routes/authRoutes'); // Importe les routes pour l'authentification
const productRoutes = require('./routes/productRoutes'); // Importe les routes pour les produits


const helmet = require('helmet'); // Ajoute des en-têtes de sécurité HTTP
const rateLimit = require('express-rate-limit'); // Limite le nombre de requêtes pour éviter les attaques

const app = express(); // Crée l'application Express
const PORT = process.env.PORT || 5000; // Définit le port du serveur (3001 ou 5000 par défaut)

// Middleware de Sécurité (Casque de protection pour le serveur)
app.use(helmet());

// Limitation de vitesse (Rate Limiting)
// Empêche une seule personne de faire trop de requêtes en même temps
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // Fenêtre de 15 minutes
    max: 300, // Maximum 300 requêtes par IP dans cette fenêtre
    message: { message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.' }
});
app.use('/api/', limiter); // Applique cette limite uniquement aux routes API

// Middleware de Debug (Affiche les requêtes dans la console)
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} ${res.statusCode} - ${duration}ms - Origine: ${req.headers.origin}`);
    });
    next(); // Passe à la suite
});

// Configuration CORS (Qui a le droit de nous parler ?)
app.use(cors({
    origin: function (origin, callback) {
        // Autorise les requêtes sans origine (comme les applications mobiles ou curl)
        if (!origin) return callback(null, true);
        // Autorise uniquement notre Frontend (localhost:3000)
        if (['http://localhost:3000', 'http://127.0.0.1:3000'].indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Non autorisé par CORS'));
        }
    },
    credentials: true, // Autorise l'envoi de cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Méthodes autorisées
    allowedHeaders: ['Content-Type', 'Authorization'] // En-têtes autorisés
}));

app.use(express.json()); // Permet de comprendre les données JSON envoyées par le Frontend
app.use(cookieParser()); // Active la lecture des cookies

// Définition des Routes (Les chemins de notre API)
app.use('/api/auth', authRoutes); // Tout ce qui commence par /api/auth ira dans authRoutes
app.use('/api/products', productRoutes); // Tout ce qui commence par /api/products ira dans productRoutes
app.use('/api/cart', require('./routes/cartRoutes')); // Gestion du panier
app.use('/api/reviews', require('./routes/reviewRoutes')); // Gestion des avis
app.use('/api/orders', require('./routes/orderRoutes')); // Gestion des commandes
app.use('/api/payment', require('./routes/paymentRoutes')); // Gestion des paiements

// Route de base (Juste pour vérifier que le serveur est en vie)
app.get('/', (req, res) => {
    res.send('L\'API NovaTech fonctionne ! 🚀');
});

// Gestionnaire d'erreurs global (Si quelque chose plante, on atterrit ici)
app.use((err, req, res, next) => {
    console.error(err.stack); // Affiche l'erreur dans la console
    const fs = require('fs');
    // Enregistre l'erreur dans un fichier error.log
    fs.appendFileSync('error.log', `${new Date().toISOString()} - ${err.stack}\n`);
    res.status(500).json({ message: 'Une erreur est survenue sur le serveur !', error: err.message });
});

// Gestion des pages non trouvées (404)
app.use((req, res) => {
    console.log(`404 Non Trouvé: ${req.method} ${req.url}`);
    res.status(404).json({ message: 'Route non trouvée' });
});

// Démarrage du serveur
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Le serveur tourne sur le port ${PORT} 🚀`);
});
