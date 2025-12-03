'use client';

import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Trash2, Plus, Minus, ArrowLeft, CreditCard, Mail } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '@/components/CheckoutForm';

// Initialisation de Stripe (Remplacer par votre clé publique)
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CartPage() {
    const { items, removeFromCart, updateQuantity, cartTotal, itemCount } = useCart();
    const { user } = useAuth();
    const router = useRouter();

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="container mx-auto px-4">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center max-w-2xl mx-auto">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CreditCard size={40} className="text-gray-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">Votre panier est vide</h1>
                        <p className="text-gray-500 mb-8">Découvrez nos nouveautés et trouvez le produit de vos rêves.</p>
                        <Link
                            href="/boutique"
                            className="inline-flex items-center gap-2 bg-primary hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-primary/30"
                        >
                            <ArrowLeft size={20} />
                            Retour à la boutique
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Mon Panier</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Articles du Panier */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            {items.map((item) => (
                                <div key={item.id} className="p-6 flex flex-col sm:flex-row gap-6 border-b border-gray-100 last:border-0">
                                    <div className="relative w-full sm:w-24 h-24 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                                        {item.product.image ? (
                                            <Image
                                                src={item.product.image}
                                                alt={item.product.title}
                                                fill
                                                className="object-contain p-2"
                                                unoptimized={true}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Img</div>
                                        )}
                                    </div>

                                    <div className="flex-1 flex flex-col justify-between">
                                        <div className="flex justify-between items-start gap-4">
                                            <h3 className="text-lg font-bold text-gray-900 line-clamp-2">{item.product.title}</h3>
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>

                                        <div className="flex justify-between items-end mt-4">
                                            <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="p-2 hover:bg-white rounded-md shadow-sm transition-all disabled:opacity-50"
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <Minus size={16} />
                                                </button>
                                                <span className="font-bold w-6 text-center">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="p-2 hover:bg-white rounded-md shadow-sm transition-all"
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xl font-bold text-gray-900">{(item.product.price * item.quantity).toFixed(2)}€</div>
                                                <div className="text-sm text-gray-500">{item.product.price.toFixed(2)}€ / unité</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Récapitulatif & Commande */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Récapitulatif</h2>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>Sous-total ({itemCount} articles)</span>
                                    <span>{cartTotal.toFixed(2)}€</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Livraison</span>
                                    <span className="text-gray-500 text-sm">Calculé à l'étape suivante</span>
                                </div>
                                <div className="border-t border-gray-100 pt-3 flex justify-between text-xl font-bold text-gray-900">
                                    <span>Total</span>
                                    <span>{cartTotal.toFixed(2)}€</span>
                                </div>
                            </div>

                            <button
                                onClick={() => router.push('/checkout')}
                                className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-primary/30 hover:shadow-primary/50 transform hover:-translate-y-0.5"
                            >
                                <CreditCard size={24} />
                                Passer la commande
                            </button>

                            {!user && (
                                <p className="text-center mt-4 text-sm text-gray-500">
                                    Déjà client ? <Link href="/connexion" className="text-primary font-bold hover:underline">Connectez-vous</Link>
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
