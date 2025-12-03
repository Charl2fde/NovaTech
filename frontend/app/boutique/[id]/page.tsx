'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Star, ShoppingCart, Truck, ShieldCheck, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

interface Product {
    id: string;
    title: string;
    price: number;
    oldPrice?: number;
    category: string;
    rating: number;
    image: string;
    brand: string;
    description?: string;
    specs?: Record<string, string>;
    reviewCount?: number;
}

export default function ProductPage() {
    const params = useParams();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const { user } = useAuth();
    const { addToCart } = useCart();
    const [reviews, setReviews] = useState<any[]>([]);
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
    const [submittingReview, setSubmittingReview] = useState(false);
    const [addingToCart, setAddingToCart] = useState(false);

    // Images fictives pour le carrousel (puisqu'on a qu'une seule vraie image par produit)
    // Dans une vraie application, cela viendrait de l'API
    const productImages = product ? [
        product.image,
        product.image, // Duplication pour la démo
        product.image, // Duplication pour la démo
        product.image  // Duplication pour la démo
    ] : [];

    useEffect(() => {
        if (params.id) {
            // Récupération du produit
            fetch(`/api/products/${params.id}`)
                .then(res => {
                    if (!res.ok) throw new Error('Produit non trouvé');
                    return res.json();
                })
                .then(data => {
                    setProduct(data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setLoading(false);
                });

            // Récupération des avis
            fetch(`/api/reviews/${params.id}`)
                .then(res => res.json())
                .then(data => setReviews(data))
                .catch(err => console.error("Erreur récupération avis", err));
        }
    }, [params.id]);

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setSubmittingReview(true);

        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: JSON.stringify({
                    productId: product?.id,
                    rating: newReview.rating,
                    comment: newReview.comment
                })
            });

            if (res.ok) {
                const savedReview = await res.json();
                setReviews([savedReview, ...reviews]);
                setNewReview({ rating: 5, comment: '' });
                // Mise à jour locale de la note du produit
                if (product) {
                    const newCount = product.reviewCount ? product.reviewCount + 1 : 1;
                    // On recharge le produit pour avoir la note exacte
                    fetch(`/api/products/${params.id}`)
                        .then(res => res.json())
                        .then(data => setProduct(data));
                }
            }
        } catch (err) {
            console.error("Erreur envoi avis", err);
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Produit introuvable</h1>
                <Link href="/boutique" className="text-primary hover:underline">
                    Retour à la boutique
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen py-8">
            <div className="container mx-auto px-4">
                {/* Fil d'ariane / Lien Retour */}
                <Link href="/boutique" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary mb-6 transition-colors">
                    <ArrowLeft size={20} />
                    Retour à la boutique
                </Link>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
                        {/* Carrousel d'Images */}
                        <div className="space-y-4">
                            <div className="relative aspect-square bg-gray-50 rounded-lg overflow-hidden border border-gray-100 group">
                                {product.image ? (
                                    <Image
                                        src={productImages[activeImageIndex]}
                                        alt={product.title}
                                        fill
                                        className="object-contain p-8 transition-transform duration-300 group-hover:scale-105"
                                        unoptimized={true}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        Image non disponible
                                    </div>
                                )}

                                {/* Navigation Carrousel */}
                                <button
                                    onClick={() => setActiveImageIndex(prev => (prev === 0 ? productImages.length - 1 : prev - 1))}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md text-gray-700 transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <ChevronLeft size={24} />
                                </button>
                                <button
                                    onClick={() => setActiveImageIndex(prev => (prev === productImages.length - 1 ? 0 : prev + 1))}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md text-gray-700 transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <ChevronRight size={24} />
                                </button>
                            </div>

                            {/* Miniatures */}
                            <div className="flex gap-4 overflow-x-auto pb-2">
                                {productImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImageIndex(idx)}
                                        className={`relative w-20 h-20 flex-shrink-0 rounded-md border-2 overflow-hidden bg-gray-50 ${activeImageIndex === idx ? 'border-primary' : 'border-transparent hover:border-gray-300'}`}
                                    >
                                        {img && (
                                            <Image
                                                src={img}
                                                alt={`Thumbnail ${idx + 1}`}
                                                fill
                                                className="object-contain p-2"
                                                unoptimized={true}
                                            />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Informations Produit */}
                        <div className="flex flex-col">
                            <div className="mb-2">
                                <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-wide">
                                    {product.brand}
                                </span>
                            </div>

                            <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">{product.title}</h1>

                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={18} className={i < Math.round(product.rating || 0) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} />
                                    ))}
                                </div>
                                <span className="text-sm text-gray-500 underline cursor-pointer hover:text-primary">
                                    {reviews.length} avis client
                                </span>
                            </div>

                            <div className="flex items-baseline gap-4 mb-6">
                                <span className="text-4xl font-bold text-gray-900">{product.price.toFixed(2)}€</span>
                                {product.oldPrice && (
                                    <span className="text-xl text-gray-400 line-through">{product.oldPrice.toFixed(2)}€</span>
                                )}
                            </div>

                            {/* Description */}
                            {product.description && (
                                <div className="mb-8 text-gray-600 leading-relaxed">
                                    <p>{product.description}</p>
                                </div>
                            )}

                            <div className="flex flex-col gap-4 mb-8">
                                <button
                                    onClick={async () => {
                                        setAddingToCart(true);
                                        await addToCart(product);
                                        setAddingToCart(false);
                                        // Optionnel : Ouvrir le tiroir panier ou afficher une notification
                                    }}
                                    disabled={addingToCart}
                                    className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-primary/30 hover:shadow-primary/50 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed active:scale-95"
                                >
                                    {addingToCart ? (
                                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
                                    ) : (
                                        <>
                                            <ShoppingCart size={24} />
                                            Ajouter au panier
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-4 text-sm text-gray-600 bg-gray-50 p-6 rounded-xl border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <Truck size={20} className="text-primary" />
                                    <span>Livraison gratuite dès 50€ d'achat</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <ShieldCheck size={20} className="text-primary" />
                                    <span>Garantie 2 ans constructeur</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Spécifications Techniques & Avis */}
                <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Spécifications */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Caractéristiques techniques</h2>
                            <div className="overflow-hidden rounded-lg border border-gray-200">
                                <table className="w-full text-sm text-left">
                                    <tbody className="divide-y divide-gray-200">
                                        <tr className="bg-gray-50">
                                            <th className="py-3 px-4 font-medium text-gray-900 w-1/3">Catégorie</th>
                                            <td className="py-3 px-4 text-gray-700">{product.category}</td>
                                        </tr>
                                        <tr className="bg-white">
                                            <th className="py-3 px-4 font-medium text-gray-900">Marque</th>
                                            <td className="py-3 px-4 text-gray-700">{product.brand}</td>
                                        </tr>
                                        <tr className="bg-gray-50">
                                            <th className="py-3 px-4 font-medium text-gray-900">Référence constructeur</th>
                                            <td className="py-3 px-4 text-gray-700">REF-{product.id}-{product.brand?.toUpperCase().substring(0, 3) || 'GEN'}</td>
                                        </tr>
                                        <tr className="bg-white">
                                            <th className="py-3 px-4 font-medium text-gray-900">Disponibilité</th>
                                            <td className="py-3 px-4 text-green-600 font-medium">En stock</td>
                                        </tr>
                                        {/* Spécifications Dynamiques */}
                                        {product.specs && Object.entries(product.specs).map(([key, value], index) => (
                                            <tr key={key} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                                                <th className="py-3 px-4 font-medium text-gray-900">{key}</th>
                                                <td className="py-3 px-4 text-gray-700">{String(value)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Avis */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 sticky top-24">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Avis clients</h2>

                            <div className="text-center mb-8">
                                <div className="text-5xl font-bold text-gray-900 mb-2">{product.rating ? product.rating.toFixed(1) : '0.0'}/5</div>
                                <div className="flex justify-center gap-1 mb-2">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={24} className={i < Math.round(product.rating || 0) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} />
                                    ))}
                                </div>
                                <p className="text-gray-500">Basé sur {reviews.length} avis</p>
                            </div>

                            {/* Liste des Avis */}
                            <div className="space-y-6 mb-8 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                                {reviews.length === 0 ? (
                                    <p className="text-center text-gray-500 italic">Aucun avis pour le moment.</p>
                                ) : (
                                    reviews.map((review: any) => (
                                        <div key={review.id} className="border-b border-gray-100 last:border-0 pb-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="font-bold text-gray-900">{review.user.firstName} {review.user.lastName?.charAt(0)}.</span>
                                                <div className="flex">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} size={12} className={i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-600">{review.comment}</p>
                                            <span className="text-xs text-gray-400 mt-1 block">{new Date(review.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Formulaire d'ajout d'avis */}
                            {user ? (
                                <div className="bg-gray-50 rounded-lg p-6">
                                    <h3 className="font-bold text-gray-900 mb-4">Donnez votre avis</h3>
                                    <form onSubmit={handleSubmitReview}>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                                            <div className="flex gap-2">
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        onClick={() => setNewReview({ ...newReview, rating: star })}
                                                        className="focus:outline-none"
                                                    >
                                                        <Star size={24} className={star <= newReview.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Commentaire</label>
                                            <textarea
                                                value={newReview.comment}
                                                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                                                rows={3}
                                                placeholder="Partagez votre expérience..."
                                                required
                                            ></textarea>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={submittingReview}
                                            className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            {submittingReview ? 'Envoi...' : 'Publier mon avis'}
                                        </button>
                                    </form>
                                </div>
                            ) : (
                                <div className="bg-gray-50 rounded-lg p-6 text-center">
                                    <p className="text-gray-600 mb-4">Connectez-vous pour donner votre avis.</p>
                                    <Link href="/connexion" className="inline-block border-2 border-primary text-primary hover:bg-primary hover:text-white font-bold py-2 px-4 rounded-lg transition-colors">
                                        Se connecter
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
