"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Calendar, LogOut, Trash2, AlertTriangle } from 'lucide-react';

export default function Profile() {
    const [user, setUser] = useState<any>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [orders, setOrders] = useState<any[]>([]);
    const router = useRouter();

    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ firstName: '', lastName: '', email: '' });
    const [updateMessage, setUpdateMessage] = useState('');
    const [updateError, setUpdateError] = useState('');

    useEffect(() => {
        fetch('/api/auth/me', { credentials: 'include' })
            .then(res => {
                if (!res.ok) throw new Error('Not authenticated');
                return res.json();
            })
            .then(data => {
                setUser(data);
                setEditForm({ firstName: data.firstName, lastName: data.lastName, email: data.email });
                // Fetch orders after user is confirmed
                return fetch('/api/orders', { credentials: 'include' });
            })
            .then(res => res.json())
            .then(data => setOrders(Array.isArray(data) ? data : []))
            .catch(() => router.push('/connexion'));
    }, [router]);

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
        window.location.href = '/'; // Force reload to update Navbar
    };

    const handleDeleteAccount = async () => {
        try {
            const res = await fetch('/api/auth/delete', { method: 'DELETE', credentials: 'include' });
            if (res.ok) {
                window.location.href = '/'; // Force reload to update Navbar
            } else {
                alert('Erreur lors de la suppression du compte');
            }
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdateMessage('');
        setUpdateError('');

        try {
            const res = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm),
                credentials: 'include'
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Erreur lors de la mise à jour');
            }

            setUser(data.user);
            setUpdateMessage(data.message);
            setIsEditing(false);
            setTimeout(() => setUpdateMessage(''), 3000);
        } catch (err: any) {
            setUpdateError(err.message);
        }
    };

    if (!user) return <div className="min-h-[60vh] flex justify-center items-center">Chargement...</div>;

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                {/* Header */}
                <div className="bg-primary p-6 text-white flex items-center gap-4 justify-between">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/20 p-3 rounded-full">
                            <User size={48} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">{user.firstName} {user.lastName}</h1>
                            <p className="text-blue-100">Membre NovaTech</p>
                        </div>
                    </div>
                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-md transition-colors text-sm font-medium"
                        >
                            Modifier
                        </button>
                    )}
                </div>

                <div className="p-8 space-y-6">
                    {updateMessage && (
                        <div className="bg-green-50 text-green-700 p-3 rounded-md border border-green-200 text-sm text-center">
                            {updateMessage}
                        </div>
                    )}
                    {updateError && (
                        <div className="bg-red-50 text-red-700 p-3 rounded-md border border-red-200 text-sm text-center">
                            {updateError}
                        </div>
                    )}

                    {/* User Info / Edit Form */}
                    {isEditing ? (
                        <form onSubmit={handleUpdateProfile} className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-200">
                            <h3 className="font-bold text-gray-800 mb-4">Modifier mes informations</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                                    <input
                                        type="text"
                                        value={editForm.firstName}
                                        onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                                    <input
                                        type="text"
                                        value={editForm.lastName}
                                        onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={editForm.email}
                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                                    required
                                />
                            </div>
                            <div className="flex gap-3 justify-end pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setEditForm({ firstName: user.firstName, lastName: user.lastName, email: user.email });
                                        setUpdateError('');
                                    }}
                                    className="px-4 py-2 bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-50 font-medium text-sm"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-primary text-white rounded hover:bg-blue-700 font-medium text-sm"
                                >
                                    Enregistrer
                                </button>
                            </div>
                        </form>
                    ) : (
                        <>
                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                <Mail className="text-gray-500" />
                                <div>
                                    <p className="text-sm text-gray-500">Email</p>
                                    <p className="font-medium">{user.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                <Calendar className="text-gray-500" />
                                <div>
                                    <p className="text-sm text-gray-500">Date d'inscription</p>
                                    <p className="font-medium">{new Date(user.createdAt || Date.now()).toLocaleDateString('fr-FR')}</p>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Orders Section */}
                    <div className="pt-6 border-t border-gray-100">
                        <h2 className="text-lg font-bold mb-4">Mes Commandes</h2>
                        {orders.length === 0 ? (
                            <p className="text-gray-500 italic">Aucune commande pour le moment.</p>
                        ) : (
                            <div className="space-y-4">
                                {orders.map(order => (
                                    <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-medium">Commande #{order.id}</span>
                                            <span className={`text-sm px-2 py-1 rounded-full ${order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {order.status === 'COMPLETED' ? 'Terminée' : order.status}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-500 mb-2">
                                            {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                                        </div>
                                        <div className="space-y-1">
                                            {order.items.map((item: any) => (
                                                <div key={item.id} className="flex justify-between text-sm">
                                                    <span>{item.quantity}x {item.product.title}</span>
                                                    <span>{(item.price * item.quantity).toFixed(2)} €</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between font-bold">
                                            <span>Total</span>
                                            <span>{order.total.toFixed(2)} €</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Account Management */}
                    <div className="pt-6 border-t border-gray-100 space-y-4">
                        <h2 className="text-lg font-bold">Gestion du compte</h2>

                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 p-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors font-medium text-gray-700"
                        >
                            <LogOut size={20} />
                            Se déconnecter
                        </button>

                        {!showDeleteConfirm ? (
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="w-full flex items-center justify-center gap-2 p-3 border border-red-200 rounded-md hover:bg-red-50 transition-colors font-medium text-red-600"
                            >
                                <Trash2 size={20} />
                                Supprimer mon compte
                            </button>
                        ) : (
                            <div className="bg-red-50 p-4 rounded-md border border-red-200 text-center animate-in fade-in zoom-in duration-200">
                                <div className="flex justify-center mb-2 text-red-500">
                                    <AlertTriangle size={32} />
                                </div>
                                <h3 className="font-bold text-red-800 mb-2">Êtes-vous sûr ?</h3>
                                <p className="text-sm text-red-600 mb-4">Cette action est irréversible. Toutes vos données seront effacées.</p>
                                <div className="flex gap-3 justify-center">
                                    <button
                                        onClick={() => setShowDeleteConfirm(false)}
                                        className="px-4 py-2 bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-50 font-medium"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        onClick={handleDeleteAccount}
                                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-medium"
                                    >
                                        Confirmer la suppression
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
