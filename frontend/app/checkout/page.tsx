'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '@/components/CheckoutForm';
import { MapPin, Truck, CreditCard, ChevronRight, Check } from 'lucide-react';

// Initialisation de Stripe en dehors du composant pour éviter de le recréer à chaque rendu
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutPage() {
    // Accès aux articles du panier et au total via le CartContext
    const { items, cartTotal } = useCart();
    // Accès à l'état d'authentification de l'utilisateur
    const { user } = useAuth();
    const router = useRouter();

    // État pour gérer les étapes de la commande (1: Adresse, 2: Livraison, 3: Paiement)
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    // État pour stocker le "Client Secret" de Stripe pour le traitement du paiement
    const [clientSecret, setClientSecret] = useState("");

    // État pour le formulaire d'adresse de livraison
    const [address, setAddress] = useState({
        street: '',
        city: '',
        postalCode: '',
        country: 'France'
    });

    // État pour le mode de livraison sélectionné
    const [shippingMethod, setShippingMethod] = useState('standard');

    // Redirection vers la connexion si non authentifié, ou vers le panier s'il est vide
    useEffect(() => {
        if (!user && !loading) {
            router.push('/connexion?redirect=/checkout');
        }
        if (items.length === 0 && !loading) {
            router.push('/panier');
        }
    }, [user, items, router, loading]);

    // Gestion de la soumission de l'adresse et passage à l'étape suivante
    const handleAddressSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStep(2);
    };

    // Gestion du choix de livraison et initialisation de l'intention de paiement
    const handleShippingSubmit = async () => {
        setLoading(true);
        try {
            // Appel au backend pour créer une PaymentIntent et une commande en attente (PENDING)
            const res = await fetch("/api/payment/create-payment-intent", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    items,
                    address: address.street,
                    city: address.city,
                    postalCode: address.postalCode,
                    country: address.country,
                    shippingMethod
                }),
            });

            if (!res.ok) throw new Error('Erreur initialisation paiement');

            const data = await res.json();
            // Stockage du client secret pour initialiser Stripe Elements
            setClientSecret(data.clientSecret);
            // Passage à l'étape de Paiement
            setStep(3);
        } catch (error) {
            console.error("Erreur:", error);
            alert("Erreur lors de l'initialisation du paiement.");
        } finally {
            setLoading(false);
        }
    };

    const appearance = { theme: 'stripe' as const };
    const options = { clientSecret, appearance };

    if (!user || items.length === 0) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4 max-w-4xl">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Finaliser ma commande</h1>

                {/* Indicateur d'étapes */}
                <div className="flex justify-center mb-8 md:mb-12">
                    <div className="flex items-center">
                        <div className={`flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full font-bold text-sm md:text-base ${step >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
                        <span className={`ml-2 font-medium text-sm md:text-base ${step >= 1 ? 'text-gray-900' : 'text-gray-500'} ${step === 1 ? 'block' : 'hidden sm:block'}`}>Adresse</span>
                    </div>
                    <div className={`w-8 md:w-16 h-1 mx-2 md:mx-4 ${step >= 2 ? 'bg-primary' : 'bg-gray-200'}`}></div>
                    <div className="flex items-center">
                        <div className={`flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full font-bold text-sm md:text-base ${step >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
                        <span className={`ml-2 font-medium text-sm md:text-base ${step >= 2 ? 'text-gray-900' : 'text-gray-500'} ${step === 2 ? 'block' : 'hidden sm:block'}`}>Livraison</span>
                    </div>
                    <div className={`w-8 md:w-16 h-1 mx-2 md:mx-4 ${step >= 3 ? 'bg-primary' : 'bg-gray-200'}`}></div>
                    <div className="flex items-center">
                        <div className={`flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full font-bold text-sm md:text-base ${step >= 3 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>3</div>
                        <span className={`ml-2 font-medium text-sm md:text-base ${step >= 3 ? 'text-gray-900' : 'text-gray-500'} ${step === 3 ? 'block' : 'hidden sm:block'}`}>Paiement</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Contenu Principal */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                            {step === 1 && (
                                <form onSubmit={handleAddressSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <MapPin className="text-primary" /> Adresse de livraison
                                    </h2>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Adresse (Rue, Numéro)</label>
                                        <input
                                            type="text"
                                            required
                                            value={address.street}
                                            onChange={e => setAddress({ ...address, street: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            placeholder="123 Rue de l'Exemple"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Code Postal</label>
                                            <input
                                                type="text"
                                                required
                                                value={address.postalCode}
                                                onChange={e => setAddress({ ...address, postalCode: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                placeholder="75000"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                                            <input
                                                type="text"
                                                required
                                                value={address.city}
                                                onChange={e => setAddress({ ...address, city: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                placeholder="Paris"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
                                        <select
                                            value={address.country}
                                            onChange={e => setAddress({ ...address, country: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        >
                                            <option value="France">France</option>
                                            <option value="Belgique">Belgique</option>
                                            <option value="Suisse">Suisse</option>
                                            <option value="Luxembourg">Luxembourg</option>
                                        </select>
                                    </div>
                                    <button type="submit" className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                                        Continuer <ChevronRight size={20} />
                                    </button>
                                </form>
                            )}

                            {step === 2 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <Truck className="text-primary" /> Mode de livraison
                                    </h2>
                                    <div className="space-y-4">
                                        <label className={`block p-4 border rounded-xl cursor-pointer transition-all ${shippingMethod === 'standard' ? 'border-primary bg-blue-50 ring-1 ring-primary' : 'border-gray-200 hover:border-gray-300'}`}>
                                            <div className="flex items-center gap-4">
                                                <input
                                                    type="radio"
                                                    name="shipping"
                                                    value="standard"
                                                    checked={shippingMethod === 'standard'}
                                                    onChange={e => setShippingMethod(e.target.value)}
                                                    className="w-5 h-5 text-primary focus:ring-primary"
                                                />
                                                <div className="flex-1">
                                                    <div className="font-bold text-gray-900">Livraison Standard</div>
                                                    <div className="text-sm text-gray-500">3-5 jours ouvrés</div>
                                                </div>
                                                <div className="font-bold text-green-600">Gratuit</div>
                                            </div>
                                        </label>
                                        <label className={`block p-4 border rounded-xl cursor-pointer transition-all ${shippingMethod === 'express' ? 'border-primary bg-blue-50 ring-1 ring-primary' : 'border-gray-200 hover:border-gray-300'}`}>
                                            <div className="flex items-center gap-4">
                                                <input
                                                    type="radio"
                                                    name="shipping"
                                                    value="express"
                                                    checked={shippingMethod === 'express'}
                                                    onChange={e => setShippingMethod(e.target.value)}
                                                    className="w-5 h-5 text-primary focus:ring-primary"
                                                />
                                                <div className="flex-1">
                                                    <div className="font-bold text-gray-900">Livraison Express</div>
                                                    <div className="text-sm text-gray-500">24h - 48h</div>
                                                </div>
                                                <div className="font-bold text-gray-900">9.99€</div>
                                            </div>
                                        </label>
                                    </div>
                                    <div className="flex gap-4">
                                        <button onClick={() => setStep(1)} className="w-1/3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-colors">
                                            Retour
                                        </button>
                                        <button onClick={handleShippingSubmit} disabled={loading} className="w-2/3 bg-primary hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                                            {loading ? 'Chargement...' : <>Payer <ChevronRight size={20} /></>}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {step === 3 && clientSecret && (
                                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
                                        <CreditCard className="text-primary" /> Paiement
                                    </h2>
                                    <Elements options={options} stripe={stripePromise}>
                                        <CheckoutForm amount={cartTotal + (shippingMethod === 'express' ? 9.99 : 0)} returnUrl={`${window.location.origin}/confirmation`} />
                                    </Elements>
                                    <button onClick={() => setStep(2)} className="mt-4 text-sm text-gray-500 hover:text-gray-700 underline">
                                        Retour au choix de livraison
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Récapitulatif Latéral */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
                            <h3 className="font-bold text-gray-900 mb-4">Récapitulatif</h3>
                            <div className="space-y-3 mb-6 text-sm">
                                {items.map(item => (
                                    <div key={item.id} className="flex justify-between gap-2">
                                        <span className="text-gray-600 line-clamp-1">{item.quantity}x {item.product.title}</span>
                                        <span className="font-medium">{(item.product.price * item.quantity).toFixed(2)}€</span>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t border-gray-100 pt-3 space-y-2">
                                <div className="flex justify-between text-gray-600">
                                    <span>Sous-total</span>
                                    <span>{cartTotal.toFixed(2)}€</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Livraison</span>
                                    <span className={shippingMethod === 'standard' ? 'text-green-600' : 'text-gray-900'}>
                                        {shippingMethod === 'standard' ? 'Gratuite' : '9.99€'}
                                    </span>
                                </div>
                                <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-100">
                                    <span>Total</span>
                                    <span>{(cartTotal + (shippingMethod === 'express' ? 9.99 : 0)).toFixed(2)}€</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
