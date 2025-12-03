import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useState } from 'react';
import { CreditCard, Check, AlertCircle } from 'lucide-react';

export default function CheckoutForm({ amount, returnUrl }: { amount: number, returnUrl?: string }) {
    const stripe = useStripe();
    const elements = useElements();

    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsLoading(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Assurez-vous de changer cela pour votre page de confirmation de paiement
                return_url: returnUrl || `${window.location.origin}/profil`,
            },
        });

        // Ce point ne sera atteint que s'il y a une erreur immédiate lors de
        // la confirmation du paiement. Sinon, votre client sera redirigé vers
        // votre `return_url`.
        if (error.type === "card_error" || error.type === "validation_error") {
            setMessage(error.message || "Une erreur est survenue.");
        } else {
            setMessage("Une erreur inattendue est survenue.");
        }

        setIsLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 mb-4">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <CreditCard size={18} className="text-primary" />
                    Paiement Sécurisé par Stripe
                </h3>

                <PaymentElement id="payment-element" options={{ layout: "tabs" }} />

                {message && (
                    <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                        <AlertCircle size={16} />
                        {message}
                    </div>
                )}
            </div>

            <button
                disabled={isLoading || !stripe || !elements}
                id="submit"
                className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                    <>
                        <Check size={20} />
                        Payer {amount.toFixed(2)}€
                    </>
                )}
            </button>
        </form>
    );
}
