import Link from 'next/link';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, CreditCard } from 'lucide-react';

export function Footer() {
    return (
        <footer className="bg-gray-100 border-t border-gray-200 pt-12 pb-6 text-gray-600 text-sm">

            {/* Section Newsletter */}
            <div className="container mx-auto px-4 mb-12">
                <div className="bg-primary rounded-lg p-8 flex flex-col md:flex-row items-center justify-between text-white shadow-lg">
                    <div className="mb-4 md:mb-0">
                        <h3 className="text-2xl font-bold mb-2">Abonnez-vous à notre newsletter</h3>
                        <p className="opacity-90">Recevez nos offres exclusives et nos actualités en avant-première !</p>
                    </div>
                    <div className="flex w-full md:w-auto gap-2">
                        <input
                            type="email"
                            placeholder="Votre adresse email"
                            className="px-4 py-3 rounded-md text-gray-900 w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-white"
                        />
                        <button className="bg-black text-white px-6 py-3 rounded-md font-bold hover:bg-gray-900 transition-colors">
                            S'inscrire
                        </button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                {/* À propos */}
                <div>
                    <h4 className="font-bold text-gray-900 mb-4 uppercase tracking-wider">À propos</h4>
                    <ul className="space-y-2">
                        <li><Link href="#" className="hover:text-primary transition-colors">Qui sommes-nous ?</Link></li>
                        <li><Link href="#" className="hover:text-primary transition-colors">Nos magasins</Link></li>
                        <li><Link href="#" className="hover:text-primary transition-colors">Carrières</Link></li>
                        <li><Link href="#" className="hover:text-primary transition-colors">Engagements RSE</Link></li>
                        <li><Link href="#" className="hover:text-primary transition-colors">Presse</Link></li>
                    </ul>
                </div>

                {/* Services */}
                <div>
                    <h4 className="font-bold text-gray-900 mb-4 uppercase tracking-wider">Services</h4>
                    <ul className="space-y-2">
                        <li><Link href="#" className="hover:text-primary transition-colors">Aide & Contact</Link></li>
                        <li><Link href="#" className="hover:text-primary transition-colors">Garanties & SAV</Link></li>
                        <li><Link href="#" className="hover:text-primary transition-colors">Modes de livraison</Link></li>
                        <li><Link href="#" className="hover:text-primary transition-colors">Moyens de paiement</Link></li>
                        <li><Link href="#" className="hover:text-primary transition-colors">Retours produits</Link></li>
                    </ul>
                </div>

                {/* Pro & Communauté */}
                <div>
                    <h4 className="font-bold text-gray-900 mb-4 uppercase tracking-wider">Communauté</h4>
                    <ul className="space-y-2">
                        <li><Link href="#" className="hover:text-primary transition-colors">NovaTech Pro</Link></li>
                        <li><Link href="#" className="hover:text-primary transition-colors">L'atelier NovaTech</Link></li>
                        <li><Link href="#" className="hover:text-primary transition-colors">Team NovaTech</Link></li>
                        <li><Link href="#" className="hover:text-primary transition-colors">Forum</Link></li>
                    </ul>
                </div>

                {/* Contact & Réseaux Sociaux */}
                <div>
                    <h4 className="font-bold text-gray-900 mb-4 uppercase tracking-wider">Nous suivre</h4>
                    <div className="flex gap-4 mb-6">
                        <Link href="#" className="bg-white p-2 rounded-full shadow-sm hover:text-primary hover:shadow-md transition-all"><Facebook size={20} /></Link>
                        <Link href="#" className="bg-white p-2 rounded-full shadow-sm hover:text-primary hover:shadow-md transition-all"><Twitter size={20} /></Link>
                        <Link href="#" className="bg-white p-2 rounded-full shadow-sm hover:text-primary hover:shadow-md transition-all"><Instagram size={20} /></Link>
                        <Link href="#" className="bg-white p-2 rounded-full shadow-sm hover:text-primary hover:shadow-md transition-all"><Youtube size={20} /></Link>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                        <Phone size={16} className="text-primary" />
                        <span className="font-bold text-gray-900">04 00 00 00 00</span>
                    </div>
                    <p className="text-xs">Du lundi au vendredi de 9h à 18h<br />Le samedi de 10h à 13h et de 14h à 17h</p>
                </div>
            </div>

            {/* Pied de page bas */}
            <div className="container mx-auto px-4 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex gap-4 opacity-70">
                    <CreditCard size={24} />
                    {/* Ajouter plus d'icônes de paiement si nécessaire */}
                </div>
                <div className="text-xs text-center md:text-right">
                    <p className="mb-2">© 2025 NovaTech. Tous droits réservés.</p>
                    <div className="flex gap-4 justify-center md:justify-end">
                        <Link href="#" className="hover:underline">Mentions légales</Link>
                        <Link href="#" className="hover:underline">CGV</Link>
                        <Link href="#" className="hover:underline">Politique de confidentialité</Link>
                        <Link href="#" className="hover:underline">Cookies</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
