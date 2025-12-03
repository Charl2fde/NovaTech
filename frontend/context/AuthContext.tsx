'use client'; // Indique que ce fichier s'exécute dans le navigateur (React)

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation'; // Cette ligne n'est plus utilisée dans le code modifié, mais je la garde car l'instruction dit de ne pas faire d'édits non demandés explicitement. Cependant, le code fourni dans l'instruction n'inclut pas useRouter. Je vais suivre l'instruction fournie.

// Définition du type "User" (À quoi ressemble un utilisateur ?)
interface User {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
}

// Définition du Contexte (La "boîte" qui contient les infos partagées)
interface AuthContextType {
    user: User | null; // L'utilisateur connecté (ou null si personne)
    loading: boolean;  // Est-ce qu'on est en train de charger ?
    login: (userData: User) => void; // Fonction pour se connecter
    logout: () => void; // Fonction pour se déconnecter
}

// Création du contexte avec des valeurs par défaut
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Le "Provider" (Le composant qui enveloppe l'application pour donner accès au contexte)
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    // const router = useRouter(); // Cette ligne n'est plus utilisée dans le code modifié, je la retire pour correspondre à l'instruction.

    // Au chargement de la page, on vérifie si l'utilisateur est déjà connecté
    useEffect(() => {
        const checkAuth = async () => {
            try {
                // On demande au backend "Qui suis-je ?" (/api/auth/me)
                const res = await fetch('http://localhost:3001/api/auth/me', {
                    credentials: 'include' // Important : Envoie les cookies avec la requête
                });

                if (res.ok) {
                    const userData = await res.json();
                    setUser(userData); // Si OK, on enregistre l'utilisateur
                } else {
                    setUser(null); // Sinon, personne n'est connecté
                }
            } catch (error) {
                console.error("Erreur vérification auth:", error);
                setUser(null);
            } finally {
                setLoading(false); // On a fini de charger
            }
        };

        checkAuth();
    }, []); // Le tableau vide [] signifie "exécuter une seule fois au démarrage"

    // Fonction appelée quand l'utilisateur se connecte (Login)
    const login = (userData: User) => {
        setUser(userData);
    };

    // Fonction appelée quand l'utilisateur se déconnecte (Logout)
    const logout = async () => {
        try {
            // On prévient le backend de supprimer le cookie
            await fetch('http://localhost:3001/api/auth/logout', { method: 'POST', credentials: 'include' });
            setUser(null); // On vide l'utilisateur localement
            window.location.href = '/'; // On redirige vers l'accueil
        } catch (error) {
            console.error("Erreur logout:", error);
        }
    };

    // On rend disponible les valeurs (user, login, logout) pour tous les enfants
    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

// Hook personnalisé pour utiliser le contexte plus facilement
// Exemple d'utilisation : const { user } = useAuth();
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
    }
    return context;
}
