import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function Hero() {
    return (
        <div className="relative bg-gray-900 text-white overflow-hidden rounded-lg shadow-xl my-6">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-black opacity-80"></div>
            <div className="relative container mx-auto px-6 py-12 md:py-24 flex flex-col items-center text-center">
                <h1 className="text-4xl md:text-7xl font-black mb-6 leading-tight">
                    NOVA<span className="text-primary">TECH</span>
                </h1>
                <p className="text-lg md:text-2xl text-gray-300 mb-8 md:mb-10 max-w-2xl px-4">
                    L'excellence technologique à portée de main. Configurez, commandez, jouez.
                </p>
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto px-4">
                    <Link href="/boutique" className="bg-primary hover:bg-blue-600 text-white font-bold py-3 md:py-4 px-8 md:px-10 rounded-full transition-all flex items-center justify-center gap-2 text-base md:text-lg w-full md:w-auto">
                        Voir la boutique <ArrowRight size={24} />
                    </Link>
                    <Link href="/configurateur" className="bg-white hover:bg-gray-100 text-black font-bold py-3 md:py-4 px-8 md:px-10 rounded-full transition-all text-base md:text-lg w-full md:w-auto text-center">
                        Ma Config
                    </Link>
                </div>
            </div>
        </div>
    );
}
