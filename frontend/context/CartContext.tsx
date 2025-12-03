'use client';

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    ReactNode
} from 'react';
import { useAuth } from './AuthContext';

// Définition d'un article du panier
export interface CartItem {
    id: string; // ID unique de l'article (UUID DB ou timestamp string en local)
    productId: string;
    quantity: number;
    product: { // On garde une copie des infos du produit pour l'affichage
        id: string;
        title: string;
        price: number;
        image: string;
    };
}

// Définition des fonctions disponibles dans le contexte
interface CartContextType {
    items: CartItem[]; // La liste des articles
    addToCart: (product: any) => void; // Ajouter un produit
    removeFromCart: (itemId: string) => void; // Enlever un produit
    updateQuantity: (itemId: string, quantity: number) => void; // Changer la quantité
    clearCart: () => void; // Tout vider
    cartTotal: number; // Prix total
    itemCount: number; // Nombre total d'articles
    isLoading: boolean; // Chargement en cours ?
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth(); // On récupère l'utilisateur connecté

    // Charger le panier au démarrage ou quand l'utilisateur change
    useEffect(() => {
        const loadCart = async () => {
            setIsLoading(true);
            if (user) {
                // Si connecté : On charge depuis la base de données
                try {
                    const res = await fetch('http://localhost:3001/api/cart', {
                        credentials: 'include'
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setItems(data.items || []);
                    }
                } catch (err) {
                    console.error("Erreur chargement panier DB", err);
                }
            } else {
                // Si invité : On charge depuis le stockage local (localStorage)
                const localCart = localStorage.getItem('guest_cart');
                if (localCart) {
                    setItems(JSON.parse(localCart));
                } else {
                    setItems([]);
                }
            }
            setIsLoading(false);
        };

        loadCart();
    }, [user]);

    // Ajouter au panier
    const addToCart = useCallback(async (product: any) => {
        // On crée un objet temporaire pour l'affichage immédiat (Optimistic UI)
        const newItem: CartItem = {
            id: Date.now().toString(), // ID temporaire
            productId: product.id,
            quantity: 1,
            product: {
                id: product.id,
                title: product.title,
                price: product.price,
                image: product.image
            }
        };

        if (user) {
            // MODE CONNECTÉ : On envoie au serveur
            try {
                await fetch('http://localhost:3001/api/cart/add', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ productId: product.id, quantity: 1 }),
                    credentials: 'include'
                });
                // On recharge le panier pour être sûr d'avoir les vrais IDs
                const res = await fetch('http://localhost:3001/api/cart', { credentials: 'include' });
                const data = await res.json();
                setItems(data.items);
            } catch (err) {
                console.error("Erreur ajout panier", err);
            }
        } else {
            // MODE INVITÉ : On sauvegarde en local
            setItems(prev => {
                const existing = prev.find(item => item.productId === product.id);
                let newItems;
                if (existing) {
                    // Si existe déjà, on augmente la quantité
                    newItems = prev.map(item =>
                        item.productId === product.id
                            ? { ...item, quantity: item.quantity + 1 }
                            : item
                    );
                } else {
                    // Sinon on ajoute
                    newItems = [...prev, newItem];
                }
                localStorage.setItem('guest_cart', JSON.stringify(newItems));
                return newItems;
            });
        }
    }, [user]);

    // Supprimer du panier
    const removeFromCart = useCallback(async (itemId: string) => {
        if (user) {
            // MODE CONNECTÉ
            try {
                await fetch(`http://localhost:3001/api/cart/remove/${itemId}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });
                setItems(prev => prev.filter(item => item.id !== itemId));
            } catch (err) {
                console.error("Erreur suppression", err);
            }
        } else {
            // MODE INVITÉ
            setItems(prev => {
                const newItems = prev.filter(item => item.id !== itemId);
                localStorage.setItem('guest_cart', JSON.stringify(newItems));
                return newItems;
            });
        }
    }, [user]);

    // Mettre à jour la quantité
    const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
        if (quantity < 1) return; // On ne descend pas sous 1 (utiliser supprimer pour ça)

        if (user) {
            // MODE CONNECTÉ
            try {
                await fetch('http://localhost:3001/api/cart/update', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ itemId, quantity }),
                    credentials: 'include'
                });
                setItems(prev => prev.map(item =>
                    item.id === itemId ? { ...item, quantity } : item
                ));
            } catch (err) {
                console.error("Erreur update quantité", err);
            }
        } else {
            // MODE INVITÉ
            setItems(prev => {
                const newItems = prev.map(item =>
                    item.id === itemId ? { ...item, quantity } : item
                );
                localStorage.setItem('guest_cart', JSON.stringify(newItems));
                return newItems;
            });
        }
    }, [user]);

    // Vider le panier
    const clearCart = useCallback(async () => {
        if (user) {
            try {
                await fetch('http://localhost:3001/api/cart/clear', {
                    method: 'DELETE',
                    credentials: 'include'
                });
                setItems([]);
            } catch (err) {
                console.error("Erreur vidage panier", err);
            }
        } else {
            setItems([]);
            localStorage.removeItem('guest_cart');
        }
    }, [user]);

    // Calculs automatiques
    const cartTotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, itemCount, isLoading }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart doit être utilisé dans un CartProvider');
    }
    return context;
}
