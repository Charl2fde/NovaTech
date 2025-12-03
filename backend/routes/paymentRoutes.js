const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const { authenticateToken } = require('../middleware/authMiddleware');

// Initialisation de Stripe avec la clé secrète (depuis le fichier .env)
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * @route POST /api/payment/create-payment-intent
 * @desc Initialiser une intention de paiement et créer une commande "EN ATTENTE"
 * @access Privé (Connecté uniquement)
 */
router.post('/create-payment-intent', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { address, city, postalCode, country, shippingMethod } = req.body;

        // 1. Récupérer le panier de l'utilisateur avec tous les détails
        const cart = await prisma.cart.findUnique({
            where: { userId },
            include: { items: { include: { product: true } } }
        });

        if (!cart) {
            console.error(`[Paiement] Panier introuvable pour user ${userId}`);
            return res.status(400).json({ message: "Panier introuvable" });
        }

        if (cart.items.length === 0) {
            console.error(`[Paiement] Panier vide pour user ${userId}`);
            return res.status(400).json({ message: "Panier vide" });
        }

        // 2. Calculer le montant total
        // Stripe attend un montant en centimes (entier), pas en euros (décimal)
        const totalAmount = cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
        const amountInCents = Math.round(totalAmount * 100);

        console.log(`[Paiement] Total: ${totalAmount}€ (${amountInCents} centimes)`);

        // 3. Créer une commande "PENDING" (En attente) dans la base de données
        // Cela permet d'avoir une trace même si le paiement échoue ensuite
        const order = await prisma.order.create({
            data: {
                userId,
                total: totalAmount,
                status: 'PENDING', // Statut initial
                address,
                city,
                postalCode,
                country,
                shippingMethod,
                items: {
                    create: cart.items.map(item => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.product.price
                    }))
                }
            }
        });

        console.log(`[Paiement] Commande créée: ${order.id}`);

        // 4. Créer l'intention de paiement chez Stripe (PaymentIntent)
        // On stocke l'ID de notre commande dans les métadonnées pour faire le lien plus tard
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents,
            currency: 'eur',
            automatic_payment_methods: { enabled: true },
            metadata: {
                userId: userId.toString(),
                orderId: order.id.toString()
            }
        });

        // 5. Mettre à jour notre commande avec l'ID de paiement Stripe
        await prisma.order.update({
            where: { id: order.id },
            data: { stripePaymentId: paymentIntent.id }
        });

        // On renvoie le "secret" au frontend pour qu'il puisse finaliser le paiement
        res.send({
            clientSecret: paymentIntent.client_secret,
            orderId: order.id
        });

    } catch (error) {
        console.error("Erreur Stripe:", error);
        res.status(500).json({ message: "Erreur lors de l'initialisation du paiement", error: error.message });
    }
});

/**
 * @route POST /api/payment/confirm-order
 * @desc Vérifier le statut du paiement chez Stripe et valider la commande (Statut PAYÉ)
 * @access Privé
 */
router.post('/confirm-order', authenticateToken, async (req, res) => {
    try {
        const { paymentIntentId } = req.body;
        const userId = req.user.id;

        // On demande à Stripe le vrai statut du paiement
        // (On ne fait JAMAIS confiance au frontend pour nous dire "c'est payé")
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        console.log(`[Confirmation] Statut Stripe: ${paymentIntent.status}`);

        if (paymentIntent.status === 'succeeded') {
            const orderId = parseInt(paymentIntent.metadata.orderId);

            if (isNaN(orderId)) {
                return res.status(400).json({ message: "ID de commande invalide." });
            }

            // Mise à jour du statut de la commande -> PAID (Payé)
            await prisma.order.update({
                where: { id: orderId },
                data: { status: 'PAID' }
            });

            // On vide le panier de l'utilisateur maintenant que c'est payé
            const cart = await prisma.cart.findUnique({ where: { userId } });
            if (cart) {
                await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
            }

            res.json({ success: true, orderId });
        } else {
            res.status(400).json({ message: "Le paiement n'a pas été validé." });
        }
    } catch (error) {
        console.error("Erreur Confirmation Commande:", error);
        res.status(500).json({ message: "Erreur lors de la confirmation de la commande", error: error.message });
    }
});

module.exports = router;
