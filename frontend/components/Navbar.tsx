"use client";

import Link from 'next/link';
import { Search, ShoppingCart, User, Menu, Sparkles, Percent, Wrench, LogOut, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import CartDrawer from './CartDrawer';

export function Navbar() {
    const { user, logout } = useAuth();
    const { itemCount } = useCart();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const router = useRouter();

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
        logout();
    };

    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState<any[]>([]);

    // Gestion des suggestions de recherche avec "Debounce"
    // (On attend que l'utilisateur arrête de taper pendant 300ms avant de chercher)
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchQuery.trim().length > 1) {
                fetch(`/api/products?search=${encodeURIComponent(searchQuery)}&limit=5`)
                    .then(res => {
                        if (!res.ok) throw new Error('Erreur récupération produits');
                        return res.json();
                    })
                    .then(data => {
                        if (Array.isArray(data)) {
                            setSuggestions(data);
                        } else {
                            setSuggestions([]);
                        }
                    })
                    .catch(err => console.error("Erreur recherche:", err));
            } else {
                setSuggestions([]);
            }
        }, 300); // Délai de 300ms

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/boutique?search=${encodeURIComponent(searchQuery)}`);
        } else {
            router.push('/boutique');
        }
    };

    return (
        <>
            <header className="w-full flex flex-col">
                {/* En-tête principal - Blanc avec accents bleus */}
                <div className="bg-background border-b border-gray-200 py-4 sticky top-0 z-50">
                    <div className="container mx-auto px-4 flex items-center justify-between gap-4">
                        {/* Logo */}
                        <Link href="/" className="text-2xl md:text-3xl font-black tracking-tighter text-primary shrink-0">
                            NOVA<span className="text-foreground">TECH</span>
                        </Link>

                        {/* Barre de recherche - Cachée sur mobile, visible sur tablette+ */}
                        <div className="hidden md:flex flex-1 max-w-2xl relative mx-4">
                            <form onSubmit={handleSearch} className="flex w-full relative">
                                <input
                                    type="text"
                                    placeholder="Rechercher un produit..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onBlur={() => setTimeout(() => setSuggestions([]), 200)} // Délai pour permettre le clic
                                    className="w-full px-4 py-2.5 border-2 border-r-0 border-gray-300 rounded-l-md focus:outline-none focus:border-primary transition-colors"
                                />
                                <button type="submit" className="bg-primary text-white px-6 py-2.5 rounded-r-md hover:bg-blue-700 transition-colors font-bold">
                                    <Search size={20} />
                                </button>

                                {/* Menu déroulant des suggestions */}
                                {suggestions.length > 0 && (
                                    <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-b-md shadow-lg z-50 mt-1">
                                        {suggestions.map((product: any) => (
                                            <Link
                                                key={product.id}
                                                href={`/boutique/${product.id}`}
                                                className="block px-4 py-2 hover:bg-gray-50 text-sm text-gray-700 border-b border-gray-100 last:border-0 flex items-center gap-3"
                                                onClick={() => setSuggestions([])}
                                            >
                                                {product.image ? (
                                                    <img src={product.image} alt={product.title} className="w-8 h-8 object-contain" />
                                                ) : (
                                                    <div className="w-8 h-8 bg-gray-50 rounded flex items-center justify-center text-[10px] text-gray-400 border border-gray-100">
                                                        Img
                                                    </div>
                                                )}
                                                <div className="flex-1 truncate">
                                                    <span className="font-bold">{product.brand}</span> - {product.title}
                                                </div>
                                                <span className="font-bold text-primary">{product.price}€</span>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </form>
                        </div>

                        {/* Actions Utilisateur */}
                        <div className="flex items-center gap-4 md:gap-6 ml-auto">
                            {/* Icône Recherche Mobile */}
                            <button className="md:hidden text-gray-700">
                                <Search size={24} />
                            </button>

                            {user ? (
                                <div className="hidden md:flex items-center gap-4">
                                    <Link href="/profil" className="flex flex-col items-center group">
                                        <div className="relative p-2 rounded-full group-hover:bg-secondary transition-colors">
                                            <User size={24} className="text-primary" />
                                        </div>
                                        <span className="text-xs font-bold text-primary">Profil</span>
                                    </Link>
                                </div>
                            ) : (
                                <Link href="/connexion" className="hidden md:flex flex-col items-center group">
                                    <div className="relative p-2 rounded-full group-hover:bg-secondary transition-colors">
                                        <User size={24} className="text-gray-700 group-hover:text-primary" />
                                    </div>
                                    <span className="text-xs font-medium text-gray-600 group-hover:text-primary">Compte</span>
                                </Link>
                            )}

                            <button
                                onClick={() => setIsCartOpen(true)}
                                className="flex flex-col items-center group relative"
                            >
                                <div className="relative p-2 rounded-full group-hover:bg-secondary transition-colors">
                                    <ShoppingCart size={24} className="text-gray-700 group-hover:text-primary" />
                                    {itemCount > 0 && (
                                        <span className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                            {itemCount}
                                        </span>
                                    )}
                                </div>
                                <span className="hidden md:block text-xs font-medium text-gray-600 group-hover:text-primary">Panier</span>
                            </button>

                            {/* Bouton Menu Mobile */}
                            <button
                                className="md:hidden p-2 text-gray-700"
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                            >
                                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Barre de Catégories - Bureau */}
                <div className="hidden md:block bg-primary text-white shadow-md">
                    <div className="container mx-auto px-4">
                        <ul className="flex items-center justify-center text-sm font-bold overflow-x-auto no-scrollbar gap-8">
                            <li>
                                <Link href="/boutique" className="flex items-center gap-2 py-3 hover:text-blue-200 transition-colors uppercase">
                                    <Menu size={18} />
                                    La Boutique
                                </Link>
                            </li>
                            <li>
                                <Link href="/nouveautes" className="flex items-center gap-2 py-3 hover:text-blue-200 transition-colors uppercase">
                                    <Sparkles size={18} />
                                    Nouveautés
                                </Link>
                            </li>
                            <li>
                                <Link href="/promotions" className="flex items-center gap-2 py-3 hover:text-yellow-300 transition-colors uppercase text-yellow-400">
                                    <Percent size={18} />
                                    Promotions
                                </Link>
                            </li>
                            <li>
                                <Link href="/configurateur" className="block py-3 hover:text-blue-200 transition-colors whitespace-nowrap uppercase">
                                    Ma Config
                                </Link>
                            </li>
                            <li>
                                <Link href="/services" className="flex items-center gap-2 py-3 hover:text-blue-200 transition-colors uppercase">
                                    <Wrench size={18} />
                                    Services
                                </Link>
                            </li>
                            <li>
                                <Link href="/a-propos" className="block py-3 hover:text-blue-200 transition-colors whitespace-nowrap uppercase">
                                    À Propos
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Menu Mobile Latéral */}
                {isMenuOpen && (
                    <div className="md:hidden bg-white border-b border-gray-200 shadow-lg animate-in slide-in-from-top-2 duration-200">
                        <div className="container mx-auto px-4 py-4 space-y-4">
                            {/* Actions Utilisateur Mobile */}
                            <div className="pb-4 border-b border-gray-100">
                                {user ? (
                                    <Link href="/profil" className="flex items-center gap-3 text-primary font-bold p-2 hover:bg-gray-50 rounded-lg" onClick={() => setIsMenuOpen(false)}>
                                        <User size={20} />
                                        Mon Profil ({user.firstName})
                                    </Link>
                                ) : (
                                    <Link href="/connexion" className="flex items-center gap-3 text-gray-700 font-medium p-2 hover:bg-gray-50 rounded-lg" onClick={() => setIsMenuOpen(false)}>
                                        <User size={20} />
                                        Se connecter / S'inscrire
                                    </Link>
                                )}
                            </div>

                            {/* Liens de Navigation Mobile */}
                            <nav className="flex flex-col gap-1">
                                <Link href="/boutique" className="flex items-center gap-3 text-gray-800 font-medium py-3 px-2 hover:bg-gray-50 rounded-lg" onClick={() => setIsMenuOpen(false)}>
                                    <Menu size={18} className="text-primary" /> La Boutique
                                </Link>
                                <Link href="/nouveautes" className="flex items-center gap-3 text-gray-800 font-medium py-3 px-2 hover:bg-gray-50 rounded-lg" onClick={() => setIsMenuOpen(false)}>
                                    <Sparkles size={18} className="text-primary" /> Nouveautés
                                </Link>
                                <Link href="/promotions" className="flex items-center gap-3 text-yellow-600 font-bold py-3 px-2 hover:bg-yellow-50 rounded-lg" onClick={() => setIsMenuOpen(false)}>
                                    <Percent size={18} /> Promotions
                                </Link>
                                <Link href="/configurateur" className="flex items-center gap-3 text-gray-800 font-medium py-3 px-2 hover:bg-gray-50 rounded-lg" onClick={() => setIsMenuOpen(false)}>
                                    <Wrench size={18} className="text-primary" /> Ma Config
                                </Link>
                                <Link href="/services" className="flex items-center gap-3 text-gray-800 font-medium py-3 px-2 hover:bg-gray-50 rounded-lg" onClick={() => setIsMenuOpen(false)}>
                                    <Wrench size={18} className="text-primary" /> Services
                                </Link>
                            </nav>
                        </div>
                    </div>
                )
                }
            </header >
            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </>
    );
}
