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

        console.log('✅ Données supprimées.');

        // 2. Réinitialiser les séquences d'ID (Auto-increment) à 1
        // Cela dépend de la base de données. Pour PostgreSQL :
        console.log('🔄 Réinitialisation des compteurs d\'ID...');

        // On utilise $executeRawUnsafe car les noms de table sont dynamiques
        // Attention : Les noms de table sont généralement en minuscules et entre guillemets doubles dans Postgres si créés par Prisma
        // Prisma utilise souvent le nom du modèle exact ou mappé. Vérifions les conventions par défaut.
        // Par défaut Prisma utilise le nom du modèle tel quel mais Postgres est sensible à la casse si on met des guillemets.
        // Sans guillemets, Postgres met tout en minuscule.
        // Prisma crée souvent les tables avec des majuscules si le modèle en a.
        // On va tenter avec les guillemets pour respecter la casse du modèle Prisma ("User", "Order", etc.)

        const tables = ['User', 'Order', 'OrderItem', 'Cart', 'CartItem', 'Review'];

        for (const table of tables) {
            try {
                // Pour PostgreSQL
                await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE;`);
            } catch (e) {
                console.log(`⚠️  Impossible de TRUNCATE "${table}", tentative de reset sequence manuelle...`);
                // Fallback si TRUNCATE échoue (ex: permissions) ou si la table s'appelle différemment
                // On essaie de deviner le nom de la séquence. Par défaut : "Table_id_seq"
                try {
                    await prisma.$executeRawUnsafe(`ALTER SEQUENCE "${table}_id_seq" RESTART WITH 1;`);
                } catch (seqErr) {
                    console.log(`❌ Échec reset sequence pour ${table}:`, seqErr.message);
                }
            }
        }

        console.log('✅ Compteurs réinitialisés.');
        console.log('✨ Base de données prête pour la production (Produits conservés).');

    } catch (error) {
        console.error('❌ Erreur lors du reset :', error);
    } finally {
        await prisma.$disconnect();
    }
}

resetDatabase();
