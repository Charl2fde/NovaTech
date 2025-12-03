export default function About() {
    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-3xl mx-auto text-center">
                <h1 className="text-4xl font-black mb-6 text-primary">À Propos de NovaTech</h1>
                <p className="text-xl text-gray-600 mb-12">
                    Votre destination ultime pour le High-Tech, le Gaming et l'Innovation.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
                <div>
                    <h2 className="text-2xl font-bold mb-4">Notre Mission</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        Chez NovaTech, nous croyons que la technologie doit être accessible à tous. Que vous soyez un gamer passionné, un créateur de contenu ou un professionnel exigeant, nous avons le matériel qu'il vous faut.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                        Notre équipe d'experts sélectionne rigoureusement chaque produit pour vous garantir performance et fiabilité.
                    </p>
                </div>
                <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500 font-bold">Image Équipe / Locaux</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div className="p-6 bg-gray-50 rounded-lg">
                    <h3 className="text-xl font-bold mb-2">Expertise</h3>
                    <p className="text-gray-600">Des conseils personnalisés pour créer la configuration de vos rêves.</p>
                </div>
                <div className="p-6 bg-gray-50 rounded-lg">
                    <h3 className="text-xl font-bold mb-2">Qualité</h3>
                    <p className="text-gray-600">Un catalogue de produits issus des meilleures marques du marché.</p>
                </div>
                <div className="p-6 bg-gray-50 rounded-lg">
                    <h3 className="text-xl font-bold mb-2">Service</h3>
                    <p className="text-gray-600">Un service client réactif et à votre écoute pour vous accompagner.</p>
                </div>
            </div>
        </div>
    );
}
