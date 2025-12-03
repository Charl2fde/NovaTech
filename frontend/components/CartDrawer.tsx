'use client';

import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
    const { items, removeFromCart, updateQuantity, cartTotal, itemCount } = useCart();
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Fond sombre (Backdrop) */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Tiroir (Drawer) */}
            <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out">
                {/* En-tête du tiroir */}
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <ShoppingBag className="text-primary" size={20} />
                        Mon Panier ({itemCount})
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Liste des articles */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                <ShoppingBag size={32} className="text-gray-400" />
                            </div>
                            <p className="text-gray-500 font-medium">Votre panier est vide</p>
                            <button
                                onClick={onClose}
                                className="text-primary hover:underline"
                            >
                                Continuer mes achats
                            </button>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={item.id} className="flex gap-4 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                                <div className="relative w-20 h-20 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
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
                                    <div className="flex justify-between items-start gap-2">
                                        <h3 className="text-sm font-medium text-gray-900 line-clamp-2">{item.product.title}</h3>
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="p-1 hover:bg-white rounded-md shadow-sm transition-all disabled:opacity-50"
                                                disabled={item.quantity <= 1}
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="p-1 hover:bg-white rounded-md shadow-sm transition-all"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                        <span className="font-bold text-gray-900">{(item.product.price * item.quantity).toFixed(2)}€</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pied de page du tiroir (Total + Bouton) */}
                {items.length > 0 && (
                    <div className="p-4 border-t border-gray-100 bg-gray-50 space-y-4">
                        <div className="flex justify-between items-center text-lg font-bold text-gray-900">
                            <span>Total</span>
                            <span>{cartTotal.toFixed(2)}€</span>
                        </div>
                        <Link
                            href="/panier"
                            onClick={onClose}
                            className="block w-full bg-primary hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-xl text-center transition-all shadow-lg shadow-primary/30 hover:shadow-primary/50 transform hover:-translate-y-0.5"
                        >
                            Voir mon panier
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
