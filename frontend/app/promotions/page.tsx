'use client';

import { ProductCard } from "@/components/ProductCard";
import { useEffect, useState } from "react";

interface Product {
    id: number;
    title: string;
    price: number;
    oldPrice?: number;
    category: string;
    rating: number;
    image: string;
}

export default function Promotions() {
    const [promoProducts, setPromoProducts] = useState<Product[]>([]);

    useEffect(() => {
        fetch('/api/products')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    // Simuler les "Promotions" en prenant des articles aléatoires ou avec un ancien prix (si existant)
                    // Comme nos données de test n'ont pas strictement d'ancien prix pour tous, on en choisit une sélection aléatoire pour la démo
                    const shuffled = [...data].sort(() => 0.5 - Math.random());
                    const selected = shuffled.slice(0, 8).map(p => ({
                        ...p,
                        oldPrice: p.price * 1.2 // Simuler une promotion pour l'effet visuel si manquant
                    }));
                    setPromoProducts(selected);
                }
            })
            .catch(err => console.error("Erreur récupération produits", err));
    }, []);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8 bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                <h1 className="text-3xl font-bold mb-2 text-yellow-600">Promotions & Bons Plans</h1>
                <p className="text-yellow-800">Profitez de nos meilleures offres du moment. Stocks limités !</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {promoProducts.map((product) => (
                    <ProductCard key={product.id} {...product} />
                ))}
            </div>
        </div>
    );
}
