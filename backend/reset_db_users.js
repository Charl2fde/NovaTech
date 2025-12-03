const prisma = require('./config/prisma');

async function resetDatabase() {
    console.log('🗑️  Suppression des données utilisateurs et commandes...');

    try {
        // 1. Supprimer les données dépendantes
        // Note: Grâce au "onDelete: Cascade" dans le schéma Prisma, 
        // supprimer les utilisateurs devrait supprimer automatiquement :
        // - Paniers (Cart)
        // - Commandes (Order) -> OrderItem
        // - Avis (Review)

        // Mais pour être sûr et propre, on supprime explicitement dans l'ordre inverse des dépendances
        // ou on utilise deleteMany sur User.

        // On supprime d'abord les lignes des tables de liaison pour éviter les erreurs de contrainte si le cascade échoue
        await prisma.orderItem.deleteMany({});
        await prisma.cartItem.deleteMany({});
        await prisma.review.deleteMany({});
        await prisma.order.deleteMany({});
        await prisma.cart.deleteMany({});

        // Enfin, on supprime les utilisateurs
        await prisma.user.deleteMany({});

        // 2. Pas besoin de réinitialiser les séquences pour les UUIDs
        console.log('✅ Données supprimées.');
        console.log('✨ Base de données prête (UUIDs actifs).');

    } catch (error) {
        console.error('❌ Erreur lors du reset :', error);
    } finally {
        await prisma.$disconnect();
    }
}

resetDatabase();
