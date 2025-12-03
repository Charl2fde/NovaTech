const express = require('express');
const router = express.Router(); // Crée un "mini-routeur" pour gérer les produits
const prisma = require('../config/prisma'); // Connexion à la base de données

// Récupérer tous les produits (GET /api/products)
router.get('/', async (req, res) => {
    try {
        // On récupère les filtres depuis l'URL (ex: ?category=GPU&sort=price_asc)
        const { category, sort, search } = req.query;

        // On prépare les conditions de recherche (le "WHERE" en SQL)
        let where = {};

        // Si une catégorie est demandée, on filtre par catégorie
        if (category) {
            where.category = category;
        }

        // Si une recherche est faite, on cherche dans le titre ou la description
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } }, // 'insensitive' = majuscules/minuscules ignorées
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }

        // On prépare le tri (le "ORDER BY" en SQL)
        let orderBy = {};
        if (sort === 'price_asc') orderBy.price = 'asc'; // Prix croissant
        if (sort === 'price_desc') orderBy.price = 'desc'; // Prix décroissant
        if (sort === 'rating') orderBy.rating = 'desc'; // Meilleure note d'abord

        // On demande à la base de données de trouver les produits
        const products = await prisma.product.findMany({
            where,
            orderBy,
        });

        res.json(products); // On renvoie la liste en JSON
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des produits' });
    }
});

// Récupérer un seul produit par son ID (GET /api/products/:id)
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params; // On récupère l'ID dans l'URL

        // On cherche le produit unique
        const product = await prisma.product.findUnique({
            where: { id: id }, // On utilise l'ID (UUID)
            include: {
                reviews: { // On inclut aussi les avis liés à ce produit
                    include: {
                        user: { // Et pour chaque avis, on veut le nom de l'auteur
                            select: { firstName: true, lastName: true }
                        }
                    },
                    orderBy: { createdAt: 'desc' } // Les avis les plus récents d'abord
                }
            }
        });

        if (!product) {
            return res.status(404).json({ message: 'Produit non trouvé' });
        }

        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Récupérer les produits similaires (GET /api/products/:id/similar)
router.get('/:id/similar', async (req, res) => {
    try {
        const { id } = req.params;

        // D'abord on trouve le produit de base pour connaître sa catégorie
        const product = await prisma.product.findUnique({
            where: { id: id }
        });

        if (!product) return res.status(404).json({ message: 'Produit non trouvé' });

        // Ensuite on cherche d'autres produits de la même catégorie
        const similar = await prisma.product.findMany({
            where: {
                category: product.category, // Même catégorie
                id: { not: id }   // Mais PAS le produit lui-même
            },
            take: 4 // On en prend juste 4
        });

        res.json(similar);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

module.exports = router; // On exporte le routeur pour l'utiliser dans server.js
