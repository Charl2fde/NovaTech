"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Check, X } from 'lucide-react';

export default function Register() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Password Validation State
    const [validations, setValidations] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false
    });

    useEffect(() => {
        const { password } = formData;
        setValidations({
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        });
    }, [formData.password]);

    const isPasswordValid = Object.values(validations).every(Boolean);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        if (!isPasswordValid) {
            setError('Le mot de passe ne respecte pas tous les critères de sécurité.');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Les mots de passe ne correspondent pas.');
            return;
        }

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    firstName: formData.firstName,
                    lastName: formData.lastName
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Une erreur est survenue');
            }

            setSuccess(true);
            setTimeout(() => {
                router.push('/connexion');
            }, 2000);

        } catch (err: any) {
            setError(err.message);
        }
    };

    const ValidationItem = ({ valid, text }: { valid: boolean, text: string }) => (
        <div className={`flex items-center gap-2 text-xs ${valid ? 'text-green-600' : 'text-gray-400'}`}>
            {valid ? <Check size={14} /> : <div className="w-3.5 h-3.5 rounded-full border border-gray-300" />}
            <span>{text}</span>
        </div>
    );

    if (success) {
        return (
            <div className="container mx-auto px-4 py-16 flex justify-center items-center min-h-[60vh]">
                <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md border border-green-200 text-center">
                    <div className="flex justify-center mb-4 text-green-500">
                        <CheckCircle size={64} />
                    </div>
                    <h1 className="text-2xl font-bold mb-4 text-green-700">Inscription réussie !</h1>
                    <p className="text-gray-600 mb-6">Votre compte a été créé avec succès.</p>
                    <p className="text-sm text-gray-500">Redirection vers la page de connexion...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-16 flex justify-center items-center min-h-[60vh]">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md border border-gray-200">
                <h1 className="text-2xl font-bold mb-6 text-center">Inscription</h1>

                {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                required
                                maxLength={50}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                required
                                maxLength={50}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            placeholder="votre@email.com"
                            required
                            maxLength={255}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            placeholder="••••••••"
                            required
                        />
                        {/* Dynamic Validation Feedback */}
                        <div className="mt-2 grid grid-cols-1 gap-1 bg-gray-50 p-3 rounded border border-gray-100">
                            <ValidationItem valid={validations.length} text="8 caractères minimum" />
                            <ValidationItem valid={validations.uppercase} text="Une majuscule" />
                            <ValidationItem valid={validations.lowercase} text="Une minuscule" />
                            <ValidationItem valid={validations.number} text="Un chiffre" />
                            <ValidationItem valid={validations.special} text="Un caractère spécial (!@#...)" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={!isPasswordValid}
                        className={`w-full font-bold py-3 rounded-md transition-colors ${isPasswordValid ? 'bg-primary text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                    >
                        S'inscrire
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-600">
                    Déjà un compte ?{' '}
                    <Link href="/connexion" className="text-primary font-bold hover:underline">
                        Se connecter
                    </Link>
                </div>
            </div>
        </div>
    );
}
