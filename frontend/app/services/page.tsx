import { Wrench, ShieldCheck, Truck, Cpu } from 'lucide-react';

export default function Services() {
    const services = [
        {
            icon: Cpu,
            title: "Montage PC",
            description: "Nos experts assemblent votre configuration sur mesure avec un câble management impeccable.",
            price: "À partir de 49.95€"
        },
        {
            icon: Wrench,
            title: "Réparation & Diagnostic",
            description: "Votre PC est lent ou ne démarre plus ? Nous identifions et réparons la panne rapidement.",
            price: "Sur devis"
        },
        {
            icon: ShieldCheck,
            title: "Extensions de Garantie",
            description: "Protégez votre matériel plus longtemps avec nos extensions de garantie jusqu'à 5 ans.",
            price: "Voir conditions"
        },
        {
            icon: Truck,
            title: "Livraison Express",
            description: "Recevez vos produits dès le lendemain avec notre service de livraison express.",
            price: "Dès 9.95€"
        }
    ];

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="text-center mb-16">
                <h1 className="text-4xl font-black mb-4 text-primary">Nos Services</h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Au-delà de la vente, NovaTech vous accompagne avec une gamme de services premium pour garantir votre satisfaction.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {services.map((service, index) => (
                    <div key={index} className="bg-white p-8 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow flex gap-6">
                        <div className="bg-blue-50 p-4 rounded-full h-fit text-primary">
                            <service.icon size={32} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                            <p className="text-gray-600 mb-4">{service.description}</p>
                            <span className="inline-block bg-gray-900 text-white text-sm font-bold px-3 py-1 rounded">
                                {service.price}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
