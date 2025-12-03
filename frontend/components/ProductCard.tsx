import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Star } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useState } from 'react';

interface ProductCardProps {
    id: string;
    title: string;
    price: number;
    oldPrice?: number;
    image?: string;
    category: string;
    rating?: number;
    reviewCount?: number;
    priority?: boolean;
}

export function ProductCard({ id, title, price, oldPrice, category, rating = 0, reviewCount = 0, image, priority = false }: ProductCardProps) {
    const { addToCart } = useCart();
    const [isAdding, setIsAdding] = useState(false);

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault(); // Empêcher la navigation vers la page produit
        e.stopPropagation();
        setIsAdding(true);
        await addToCart({ id, title, price, image });
        setIsAdding(false);
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow group flex flex-col h-full">
            <Link href={`/boutique/${id}`} className="relative mb-4 aspect-square bg-gray-50 rounded-md flex items-center justify-center overflow-hidden block">
                {image ? (
                    <Image
                        src={image}
                        alt={title}
                        fill
                        className="object-contain p-4 hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        unoptimized={true}
                        priority={priority}
                    />
                ) : (
                    <div className="text-gray-400 font-medium">Image Produit</div>
                )}
                <div className="absolute top-2 right-2 flex flex-col gap-2">
                    {oldPrice && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">-20%</span>
                    )}
                </div>
            </Link>

            <div className="mb-2">
                <span className="text-xs text-gray-500 uppercase font-semibold">{category}</span>
            </div>

            <Link href={`/boutique/${id}`} className="block mb-2">
                <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-2 h-12">
                    {title}
                </h3>
            </Link>

            <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className={i < Math.round(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} />
                ))}
                <span className="text-xs text-gray-400 ml-1">({reviewCount})</span>
            </div>

            <div className="mt-auto flex items-end justify-between">
                <div className="flex flex-col">
                    {oldPrice && (
                        <span className="text-xs text-gray-400 line-through">{oldPrice.toFixed(2)}€</span>
                    )}
                    <span className="text-xl font-bold text-primary">{price.toFixed(2)}€</span>
                </div>
                <button
                    onClick={handleAddToCart}
                    className="bg-gray-100 hover:bg-primary hover:text-white text-gray-900 p-2 rounded-full transition-colors"
                >
                    <ShoppingCart size={20} />
                </button>
            </div>
        </div>
    );
}
