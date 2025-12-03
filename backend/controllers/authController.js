const bcrypt = require('bcryptjs'); // Pour crypter les mots de passe
const jwt = require('jsonwebtoken'); // Pour créer les jetons de connexion (tokens)
const prisma = require('../config/prisma'); // Connexion à la base de données
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_this'; // La clé secrète pour signer les tokens

// Inscription d'un utilisateur (Register)
exports.register = async (req, res) => {
    try {
        // On récupère les données envoyées par le formulaire
        const { email, password, firstName, lastName } = req.body;

        // Validation : On vérifie que tout est là
        if (!email || !password || !firstName || !lastName) {
            return res.status(400).json({ message: 'Tous les champs sont obligatoires.' });
        }

        // Validation stricte du mot de passe (Sécurité)
        // Doit contenir : Majuscule, minuscule, chiffre, caractère spécial, min 8 caractères
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                message: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.'
            });
        }

        // Validation du nom (Pas de caractères bizarres)
        // Allow letters (including accents), spaces, hyphens, apostrophes. Reject everything else.
        const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;
        if (!nameRegex.test(firstName) || !nameRegex.test(lastName)) {
            return res.status(400).json({
                message: 'Le prénom et le nom ne doivent contenir que des lettres, des espaces ou des tirets.'
            });
        }

        // Length Limits
        if (firstName.length > 50 || lastName.length > 50) {
            return res.status(400).json({ message: 'Le prénom et le nom ne doivent pas dépasser 50 caractères.' });
        }
        if (email.length > 255) {
            return res.status(400).json({ message: 'L\'email ne doit pas dépasser 255 caractères.' });
        }

        // Vérifie si l'utilisateur existe déjà
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
        }

        // Hachage du mot de passe (On ne stocke jamais le mot de passe en clair !)
        const hashedPassword = await bcrypt.hash(password, 10);

        // Création de l'utilisateur dans la base de données
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
            },
        });

        res.status(201).json({ message: 'Inscription réussie ! Vous pouvez maintenant vous connecter.' });
    } catch (error) {
        console.error('Erreur Inscription:', error);
        res.status(500).json({ message: 'Erreur serveur lors de l\'inscription.', error: error.message });
    }
};

// Connexion d'un utilisateur (Login)
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // On cherche l'utilisateur par son email
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: 'Email ou mot de passe incorrect.' });
        }

        // On compare le mot de passe envoyé avec celui crypté en base
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Email ou mot de passe incorrect.' });
        }

        // Génération du Token JWT (C'est le "badge" d'accès de l'utilisateur)
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: req.body.rememberMe ? '30d' : '1d' });

        // Configuration du Cookie qui contiendra le token
        const isProduction = process.env.NODE_ENV === 'production';

        const cookieOptions = {
            httpOnly: true, // Empêche le JavaScript du navigateur de lire le cookie (Sécurité XSS)
            secure: isProduction, // Uniquement en HTTPS en production
            sameSite: 'lax', // Protection CSRF
            path: '/' // Valable sur tout le site
        };

        // Si "Se souvenir de moi" est coché, le cookie dure 30 jours
        // If false, do NOT set maxAge -> Session Cookie (deleted on browser close)
        if (req.body.rememberMe) {
            cookieOptions.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 jours
        }

        console.log('Définition du cookie avec options:', cookieOptions);
        res.cookie('token', token, cookieOptions); // On envoie le cookie au navigateur

        res.json({
            message: 'Connexion réussie !',
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur lors de la connexion.' });
    }
};

// Récupérer l'utilisateur connecté (Me)
exports.me = async (req, res) => {
    try {
        console.log('Headers:', req.headers);
        console.log('Cookies reçus:', req.cookies);

        const token = req.cookies.token; // On lit le cookie
        if (!token) {
            console.log('Aucun token trouvé dans les cookies');
            return res.status(401).json({ message: 'Non authentifié' });
        }

        // On vérifie que le token est valide
        const decoded = jwt.verify(token, JWT_SECRET);
        // On récupère les infos de l'utilisateur (sans le mot de passe)
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, email: true, firstName: true, lastName: true }
        });

        if (!user) {
            return res.status(401).json({ message: 'Utilisateur non trouvé' });
        }

        res.json(user);
    } catch (error) {
        res.status(401).json({ message: 'Token invalide' });
    }
};

// Déconnexion (Logout)
exports.logout = (req, res) => {
    res.clearCookie('token'); // On supprime le cookie
    res.json({ message: 'Déconnexion réussie' });
};

// Supprimer son compte
exports.deleteAccount = async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) return res.status(401).json({ message: 'Non authentifié' });

        const decoded = jwt.verify(token, JWT_SECRET);

        // 1. On trouve tous les produits notés par cet utilisateur
        const userReviews = await prisma.review.findMany({
            where: { userId: decoded.userId },
            select: { productId: true }
        });

        // On garde une liste unique des IDs de produits
        const productIdsToUpdate = [...new Set(userReviews.map(r => r.productId))];

        // 2. On supprime l'utilisateur (La cascade supprimera ses avis, panier, commandes)
        await prisma.user.delete({
            where: { id: decoded.userId }
        });

        // 3. On recalcule la moyenne des notes pour les produits impactés
        for (const productId of productIdsToUpdate) {
            const aggregations = await prisma.review.aggregate({
                where: { productId: productId },
                _avg: { rating: true },
                _count: { rating: true }
            });

            const newRating = aggregations._avg.rating || 0;
            const newCount = aggregations._count.rating || 0;

            await prisma.product.update({
                where: { id: productId },
                data: {
                    rating: newRating,
                    reviewCount: newCount
                }
            });
        }

        res.clearCookie('token');
        res.json({ message: 'Compte supprimé avec succès et avis synchronisés' });
    } catch (error) {
        console.error('Erreur Suppression Compte:', error);
        res.status(500).json({ message: 'Erreur lors de la suppression du compte' });
    }
};

// Mot de passe oublié (Demande)
exports.forgotPassword = async (req, res) => {
    try {
        console.log('Demande mot de passe oublié pour:', req.body);
        const { email } = req.body;

        if (!email) {
            console.log('Email manquant dans le corps de la requête');
            return res.status(400).json({ message: 'Email requis' });
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            // Par sécurité, on ne dit pas si l'email n'existe pas vraiment, mais ici pour le debug on le log
            console.log('Utilisateur non trouvé pour:', email);
            return res.status(404).json({ message: 'Aucun utilisateur trouvé avec cet email.' });
        }

        console.log('Utilisateur trouvé:', user.id);

        // Génération d'un token unique pour la réinitialisation
        const crypto = require('crypto');
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetPasswordExpires = new Date(Date.now() + 3600000); // Expire dans 1 heure

        console.log('Mise à jour de l\'utilisateur avec le token...');
        // On sauvegarde ce token dans la base de données
        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetPasswordToken: resetToken,
                resetPasswordExpires: resetPasswordExpires
            }
        });
        console.log('Utilisateur mis à jour.');

        // Envoi de l'email avec Nodemailer
        const nodemailer = require('nodemailer');

        // Création d'un compte de test (Ethereal) - À remplacer par un vrai SMTP en prod
        // En prod : host: process.env.SMTP_HOST, user: process.env.SMTP_USER...
        const testAccount = await nodemailer.createTestAccount();

        const transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });

        const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

        const info = await transporter.sendMail({
            from: '"Support NovaTech" <support@novatech.com>',
            to: email,
            subject: "Réinitialisation de votre mot de passe",
            text: `Vous avez demandé une réinitialisation. Cliquez ici : ${resetUrl}`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #2563eb;">Réinitialisation de mot de passe</h2>
                    <p>Vous avez demandé à réinitialiser votre mot de passe NovaTech.</p>
                    <p>Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe :</p>
                    <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">Réinitialiser mon mot de passe</a>
                    <p>Ce lien est valide pour 1 heure.</p>
                </div>
            `,
        });

        console.log(`\n==================================================`);
        console.log(`EMAIL ENVOYÉ: ${info.messageId}`);
        console.log(`LIEN DE PRÉVISUALISATION: ${nodemailer.getTestMessageUrl(info)}`);
        console.log(`==================================================\n`);

        res.json({ message: 'Un email a été envoyé ! Vérifiez la console serveur pour le lien.' });
    } catch (error) {
        console.error('Erreur Mot de passe oublié:', error);
        res.status(500).json({ message: 'Erreur serveur: ' + error.message });
    }
};
// Réinitialisation du mot de passe (Validation)
exports.resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;

        // On cherche un utilisateur avec ce token ET qui n'a pas expiré
        const user = await prisma.user.findFirst({
            where: {
                resetPasswordToken: token,
                resetPasswordExpires: { gt: new Date() } // gt = greater than (plus grand que maintenant)
            }
        });

        if (!user) {
            return res.status(400).json({ message: 'Lien invalide ou expiré.' });
        }

        // Validation du nouveau mot de passe
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                message: 'Le mot de passe doit respecter les critères de sécurité.'
            });
        }

        // On crypte le nouveau mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // On met à jour l'utilisateur et on efface le token
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetPasswordToken: null,
                resetPasswordExpires: null
            }
        });

        // Envoi de l'email de confirmation
        const nodemailer = require('nodemailer');

        // Create test account (or reuse existing if better structured, but fine here)
        const testAccount = await nodemailer.createTestAccount();

        const transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });

        const info = await transporter.sendMail({
            from: '"Support NovaTech" <support@novatech.com>',
            to: user.email,
            subject: "Confirmation de modification de mot de passe",
            text: `Votre mot de passe a été modifié avec succès.`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #16a34a;">Mot de passe modifié !</h2>
                    <p>Votre mot de passe NovaTech a été mis à jour avec succès.</p>
                </div>
            `,
        });

        console.log(`\n==================================================`);
        console.log(`CONFIRMATION EMAIL SENT: ${info.messageId}`);
        console.log(`PREVIEW URL: ${nodemailer.getTestMessageUrl(info)}`);
        console.log(`==================================================\n`);

        res.json({ message: 'Mot de passe réinitialisé avec succès ! Un email de confirmation vous a été envoyé.' });
    } catch (error) {
        console.error('Erreur Reset Password:', error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

// Mise à jour du profil
exports.updateProfile = async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) return res.status(401).json({ message: 'Non authentifié' });

        const decoded = jwt.verify(token, JWT_SECRET);
        const { firstName, lastName, email } = req.body;

        // Validation
        if (!firstName || !lastName || !email) {
            return res.status(400).json({ message: 'Tous les champs sont requis.' });
        }

        // Vérifie si le nouvel email est déjà pris par quelqu'un d'autre
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser && existingUser.id !== decoded.userId) {
            return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
        }

        const updatedUser = await prisma.user.update({
            where: { id: decoded.userId },
            data: { firstName, lastName, email },
            select: { id: true, email: true, firstName: true, lastName: true }
        });

        res.json({ message: 'Profil mis à jour avec succès !', user: updatedUser });
    } catch (error) {
        console.error('Erreur Update Profile:', error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour du profil.' });
    }
};
