'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, MapPin, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function ConfirmationPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { clearCart } = useCart();

    // Get payment intent and status from URL query parameters (redirected from Stripe)
    const paymentIntentId = searchParams.get('payment_intent');
    const redirectStatus = searchParams.get('redirect_status');

    const [loading, setLoading] = useState(true);
    const [order, setOrder] = useState<any>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        // If missing parameters or payment failed, show error
        if (!paymentIntentId || redirectStatus !== 'succeeded') {
            setError("Paiement non validé ou manquant.");
            setLoading(false);
            return;
        }

        const confirmOrder = async () => {
            try {
                // 1. Confirm Order on Backend
                // This updates the order status to PAID and clears the cart in the database
                const res = await fetch('/api/payment/confirm-order', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({ paymentIntentId })
                });

                if (!res.ok) throw new Error('Failed to confirm order');
                const data = await res.json();

                // 2. Refresh Cart Context (to clear it in the UI immediately)
                clearCart();

                // 3. Fetch Full Order Details to display on the confirmation page
                const orderRes = await fetch(`/api/orders/${data.orderId}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                const orderData = await orderRes.json();
                setOrder(orderData);

            } catch (err) {
                console.error(err);
                setError("Erreur lors de la confirmation de la commande.");
            } finally {
                setLoading(false);
            }
        };

        confirmOrder();
    }, [paymentIntentId, redirectStatus, clearCart]);

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-xl shadow-sm border border-red-100 text-center max-w-md">
                    <div className="text-red-500 mb-4 flex justify-center">
                        <CheckCircle size={48} className="rotate-45" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Oups !</h1>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <Link href="/panier" className="text-primary hover:underline font-bold">
                        Retour au panier
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4 max-w-3xl">
                <div className="bg-white rounded-xl shadow-sm border border-green-100 overflow-hidden">
                    <div className="bg-green-50 p-8 text-center border-b border-green-100">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                            <CheckCircle size={32} />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Commande Confirmée !</h1>
                        <p className="text-gray-600">Merci pour votre achat. Un email de confirmation vous a été envoyé.</p>
                        <p className="text-sm text-gray-500 mt-2">Commande #{order?.id}</p>
                    </div>

                    <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div>
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <MapPin size={18} className="text-primary" /> Adresse de livraison
                                </h3>
                                <div className="text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    <p>{order?.address}</p>
                                    <p>{order?.postalCode} {order?.city}</p>
                                    <p>{order?.country}</p>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Package size={18} className="text-primary" /> Mode de livraison
                                </h3>
                                <div className="text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    <p className="capitalize">{order?.shippingMethod === 'express' ? 'Express (24h-48h)' : 'Standard (3-5 jours)'}</p>
                                    <p className="text-sm text-gray-500 mt-1">Statut: <span className="font-medium text-green-600">Payé</span></p>
                                </div>
                            </div>
                        </div>

                        <h3 className="font-bold text-gray-900 mb-4">Articles commandés</h3>
                        <div className="space-y-4 mb-8">
                            {order?.items.map((item: any) => (
                                <div key={item.id} className="flex justify-between items-center border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-gray-50 rounded-md border border-gray-100 flex items-center justify-center text-xs text-gray-400">
                                            {item.product?.image ? <img src={item.product.image} className="w-full h-full object-contain p-1" /> : 'Img'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{item.product?.title}</p>
                                            <p className="text-sm text-gray-500">Qté: {item.quantity}</p>
                                        </div>
                                    </div>
                                    <span className="font-medium">{(item.price * item.quantity).toFixed(2)}€</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-between items-center text-xl font-bold text-gray-900 pt-6 border-t border-gray-100">
                            <span>Total payé</span>
                            <span>{order?.total.toFixed(2)}€</span>
                        </div>

                        <div className="mt-8 flex justify-center">
                            <Link href="/boutique" className="inline-flex items-center gap-2 bg-primary hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-xl transition-colors">
                                Continuer mes achats <ArrowRight size={20} />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
