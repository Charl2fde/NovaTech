const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const jwt = require('jsonwebtoken');

// Middleware pour vérifier si l'utilisateur est connecté
// (C'est comme un vigile à l'entrée de la route)
const authenticateToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'Non authentifié' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Token invalide' });
        req.user = user; // On attache l'utilisateur à la requête
        next(); // On laisse passer
    });
};

// Récupérer le panier (GET /api/cart)
router.get('/', authenticateToken, async (req, res) => {
    try {
        // On cherche le panier de l'utilisateur connecté
        let cart = await prisma.cart.findUnique({
            where: { userId: req.user.userId },
            include: {
                items: { // On inclut les articles
                    include: { product: true }, // Et les détails des produits
                    orderBy: { id: 'asc' }
                }
            }
        });

        // Si pas de panier, on en crée un vide
        if (!cart) {
            cart = await prisma.cart.create({
                data: { userId: req.user.userId },
                include: { items: { include: { product: true } } }
            });
        }

        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Erreur récupération panier' });
    }
});

// Ajouter un article au panier (POST /api/cart/add)
router.post('/add', authenticateToken, async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const userId = req.user.userId;

        // 1. Trouver ou créer le panier
        let cart = await prisma.cart.findUnique({ where: { userId } });
        if (!cart) {
            cart = await prisma.cart.create({ data: { userId } });
        }

        // 2. Vérifier si le produit est déjà dans le panier
        const existingItem = await prisma.cartItem.findFirst({
            where: {
                cartId: cart.id,
                productId: parseInt(productId)
            }
        });

        if (existingItem) {
            // Si oui, on augmente la quantité
            await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + (quantity || 1) }
            });
        } else {
            // Sinon, on ajoute le nouvel article
            await prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    productId: parseInt(productId),
                    quantity: quantity || 1
                }
            });
        }

        res.json({ message: 'Produit ajouté au panier' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur ajout panier' });
    }
});

// Mettre à jour la quantité (PUT /api/cart/update)
router.put('/update', authenticateToken, async (req, res) => {
    try {
        const { itemId, quantity } = req.body;

        if (quantity < 1) {
            // Si quantité < 1, on supprime l'article
            await prisma.cartItem.delete({ where: { id: itemId } });
        } else {
            // Sinon on met à jour
            await prisma.cartItem.update({
                where: { id: itemId },
                data: { quantity }
            });
        }

        res.json({ message: 'Panier mis à jour' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur mise à jour panier' });
    }
});

// Supprimer un article (DELETE /api/cart/remove/:itemId)
router.delete('/remove/:itemId', authenticateToken, async (req, res) => {
    try {
        const { itemId } = req.params;
        await prisma.cartItem.delete({
            where: { id: parseInt(itemId) }
        });
        res.json({ message: 'Article supprimé' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur suppression article' });
    }
});

// Vider le panier (DELETE /api/cart/clear)
router.delete('/clear', authenticateToken, async (req, res) => {
    try {
        const cart = await prisma.cart.findUnique({
            where: { userId: req.user.userId }
        });

        if (cart) {
            // On supprime tous les articles liés à ce panier
            await prisma.cartItem.deleteMany({
                where: { cartId: cart.id }
            });
        }
        res.json({ message: 'Panier vidé' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur vidage panier' });
    }
});

module.exports = router;
