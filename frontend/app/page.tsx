'use client';

import { Hero } from "@/components/Hero";
import { ProductCard } from "@/components/ProductCard";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Product {
  id: string;
  title: string;
  price: number;
  oldPrice?: number;
  category: string;
  rating: number;
  image: string;
  reviewCount: number;
}

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        // Prendre les 4 premiers produits comme produits phares
        if (Array.isArray(data)) {
          setFeaturedProducts(data.slice(0, 4));
        }
      })
      .catch(err => console.error("Failed to fetch products", err));
  }, []);

  return (
    <div className="container mx-auto px-4 pb-12">
      <Hero />

      {/* Featured Section */}
      <section className="my-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Nos produits phares</h2>
          <Link href="/boutique" className="text-primary font-semibold flex items-center gap-1 hover:underline">
            Voir tout <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </section>
    </div>
  );
}
