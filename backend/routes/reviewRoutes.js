const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const { authenticateToken } = require('../middleware/authMiddleware');

// Récupérer les avis d'un produit
// GET /api/reviews/:productId
router.get('/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        const reviews = await prisma.review.findMany({
            where: { productId: parseInt(productId) },
            include: {
                user: { // On veut savoir qui a écrit l'avis
                    select: { firstName: true, lastName: true }
                }
            },
            orderBy: { createdAt: 'desc' } // Les plus récents d'abord
        });
        res.json(reviews);
    } catch (error) {
        console.error("Erreur Récupération Avis:", error);
        res.status(500).json({ message: "Erreur lors de la récupération des avis" });
    }
});

// Ajouter un avis
// POST /api/reviews
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { productId, rating, comment } = req.body;
        const userId = req.user.id;

        // Validation simple
        if (!rating || !comment) {
            return res.status(400).json({ message: "La note et le commentaire sont obligatoires" });
        }

        // 1. Création de l'avis
        const review = await prisma.review.create({
            data: {
                userId,
                productId: parseInt(productId),
                rating: parseInt(rating),
                comment
            },
            include: {
                user: {
                    select: { firstName: true, lastName: true }
                }
            }
        });

        // 2. Mise à jour de la note moyenne du produit
        // On recalcule la moyenne de tous les avis pour ce produit
        const aggregations = await prisma.review.aggregate({
            where: { productId: parseInt(productId) },
            _avg: { rating: true }, // Moyenne
            _count: { rating: true } // Nombre total
        });

        const newRating = aggregations._avg.rating || 0;
        const newCount = aggregations._count.rating || 0;

        // On sauvegarde la nouvelle moyenne dans la fiche produit
        await prisma.product.update({
            where: { id: parseInt(productId) },
            data: {
                rating: newRating,
                reviewCount: newCount
            }
        });

        res.json(review);
    } catch (error) {
        console.error("Erreur Ajout Avis:", error);
        res.status(500).json({ message: "Erreur lors de l'ajout de l'avis" });
    }
});

module.exports = router;
