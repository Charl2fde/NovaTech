const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const { authenticateToken } = require('../middleware/authMiddleware');

// Créer une commande (Checkout)
// POST /api/orders
router.post('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { cartId } = req.body; // Optionnel, on peut le retrouver via l'utilisateur

        // 1. On récupère le panier de l'utilisateur
        const cart = await prisma.cart.findUnique({
            where: { userId },
            include: { items: { include: { product: true } } }
        });

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: "Votre panier est vide." });
        }

        // 2. On calcule le total
        const total = cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

        // 3. On crée la commande dans la base de données
        const order = await prisma.order.create({
            data: {
                userId,
                total,
                status: 'COMPLETED', // Simplifié pour l'instant (devrait être PENDING avant paiement)
                items: {
                    create: cart.items.map(item => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.product.price // On fige le prix au moment de l'achat
                    }))
                }
            },
            include: { items: true }
        });

        // 4. On vide le panier car la commande est passée
        await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

        res.status(201).json(order);
    } catch (error) {
        console.error("Erreur Création Commande:", error);
        res.status(500).json({ message: "Erreur lors de la création de la commande." });
    }
});

// Récupérer les commandes de l'utilisateur
// GET /api/orders
router.get('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        // On cherche toutes les commandes de cet utilisateur
        const orders = await prisma.order.findMany({
            where: { userId },
            include: {
                items: {
                    include: { product: true } // On inclut les détails des produits
                }
            },
            orderBy: { createdAt: 'desc' } // Les plus récentes d'abord
        });
        res.json(orders);
    } catch (error) {
        console.error("Erreur Récupération Commandes:", error);
        res.status(500).json({ message: "Erreur lors de la récupération des commandes." });
    }
});

// Récupérer une commande spécifique
// GET /api/orders/:id
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const orderId = req.params.id;

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: {
                    include: { product: true }
                }
            }
        });

        if (!order) {
            return res.status(404).json({ message: "Commande non trouvée" });
        }

        // Sécurité : On vérifie que la commande appartient bien à l'utilisateur connecté
        if (order.userId !== userId) {
            return res.status(403).json({ message: "Accès interdit" });
        }

        res.json(order);
    } catch (error) {
        console.error("Erreur Récupération Commande:", error);
        res.status(500).json({ message: "Erreur lors de la récupération de la commande." });
    }
});

module.exports = router;
