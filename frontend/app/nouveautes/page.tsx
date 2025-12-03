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

export default function NewArrivals() {
    const [newProducts, setNewProducts] = useState<Product[]>([]);

    useEffect(() => {
        fetch('/api/products')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    // Simuler les "Nouveautés" en prenant les 8 derniers articles
                    setNewProducts(data.slice(-8).reverse());
                }
            })
            .catch(err => console.error("Erreur récupération produits", err));
    }, []);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Nouveautés</h1>
                <p className="text-gray-600">Découvrez les dernières innovations High-Tech tout juste arrivées en stock.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {newProducts.map((product) => (
                    <ProductCard key={product.id} {...product} />
                ))}
            </div>
        </div>
    );
}
