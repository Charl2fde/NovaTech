"use client";

import { useState, useEffect, useMemo } from 'react';
import { Check, ShoppingCart, AlertCircle, ChevronRight, RotateCcw } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useRouter } from 'next/navigation';

interface Product {
    id: number;
    title: string;
    price: number;
    category: string;
    brand: string;
    image: string;
    specs: any;
}

const STEPS = [
    { id: 'cpu', label: 'Processeur', category: 'Processeur' },
    { id: 'motherboard', label: 'Carte Mère', category: 'Carte Mère' },
    { id: 'ram', label: 'Mémoire RAM', category: 'Mémoire RAM' },
    { id: 'gpu', label: 'Carte Graphique', category: 'Carte Graphique' },
    { id: 'storage', label: 'Stockage', category: 'Disque Dur' },
    { id: 'case', label: 'Boîtier', category: 'Boîtier' },
    { id: 'cooling', label: 'Refroidissement', category: 'Refroidissement' },
    { id: 'psu', label: 'Alimentation', category: 'Alimentation' },
    { id: 'os', label: 'Système d\'exploitation', category: 'Logiciel' },
    { id: 'service', label: 'Service de Montage', category: 'Service' },
];

export default function Configurator() {
    const [products, setProducts] = useState<Product[]>([]);
    const [config, setConfig] = useState<Record<string, Product | null>>({});
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(true);

    // Filtres & État de Pagination
    const [selectedBrand, setSelectedBrand] = useState<string>('All');
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
    const [sortOption, setSortOption] = useState<string>('price-asc');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9;

    const { addToCart } = useCart();
    const router = useRouter();

    useEffect(() => {
        fetch('/api/products')
            .then(res => res.json())
            .then(data => {
                setProducts(data);
                setLoading(false);
            })
            .catch(err => console.error(err));
    }, []);

    // Réinitialiser les filtres et la pagination quand l'étape change
    useEffect(() => {
        setSelectedBrand('All');
        setPriceRange([0, 5000]);
        setCurrentPage(1);
        setSortOption('price-asc');
    }, [currentStep]);

    const handleSelect = (stepId: string, product: Product) => {
        setConfig(prev => {
            const newConfig = { ...prev, [stepId]: product };

            // Réinitialiser les composants dépendants si la compatibilité change
            if (stepId === 'cpu') {
                delete newConfig.motherboard;
                delete newConfig.ram;
            }
            if (stepId === 'motherboard') {
                delete newConfig.ram;
            }
            return newConfig;
        });

        // Avancer automatiquement à l'étape suivante
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const isCompatible = (product: Product) => {
        const step = STEPS[currentStep];

        // La carte mère doit correspondre au socket du CPU
        if (step.id === 'motherboard' && config.cpu) {
            if (product.specs?.socket !== config.cpu.specs?.socket) return false;
        }

        // La RAM doit correspondre au type de RAM de la carte mère
        if (step.id === 'ram' && config.motherboard) {
            // RAM a 'type': 'DDR4', MobO a 'ramType': 'DDR4'
            if (product.specs?.type !== config.motherboard.specs?.ramType) return false;
        }

        return true;
    };

    const filteredProducts = useMemo(() => {
        const category = STEPS[currentStep].category;
        let filtered = products.filter(p => {
            const matchesCategory = p.category === category;
            const matchesBrand = selectedBrand === 'All' || p.brand === selectedBrand;
            const matchesPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
            return matchesCategory && matchesBrand && matchesPrice;
        });

        // Tri
        filtered.sort((a, b) => {
            if (sortOption === 'price-asc') return a.price - b.price;
            if (sortOption === 'price-desc') return b.price - a.price;
            if (sortOption === 'name-asc') return a.title.localeCompare(b.title);
            return 0;
        });

        return filtered;
    }, [products, currentStep, selectedBrand, priceRange, sortOption]);

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Obtenir les marques uniques pour la catégorie actuelle
    const availableBrands = useMemo(() => {
        return Array.from(new Set(products
            .filter(p => p.category === STEPS[currentStep].category)
            .map(p => p.brand)
        )).sort();
    }, [products, currentStep]);

    const totalPrice = Object.values(config).reduce((sum, p) => sum + (p?.price || 0), 0);

    const handleAddToCart = () => {
        Object.values(config).forEach(product => {
            if (product) addToCart(product);
        });
        router.push('/panier');
    };

    if (loading) return <div className="min-h-screen flex justify-center items-center">Chargement du configurateur...</div>;

    return (
        <div className="container mx-auto px-4 py-8 max-w-[1600px]">
            <div className="flex flex-col lg:flex-row gap-8">

                {/* Left: Selection Area */}
                <div className="flex-1 min-w-0">
                    <h1 className="text-3xl font-black mb-6 uppercase tracking-tight">Configurateur PC</h1>

                    {/* Progress Bar */}
                    <div className="flex overflow-x-auto mb-8 pb-2 no-scrollbar gap-2">
                        {STEPS.map((step, idx) => (
                            <button
                                key={step.id}
                                onClick={() => setCurrentStep(idx)}
                                className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-colors ${currentStep === idx
                                    ? 'bg-primary text-white'
                                    : config[step.id]
                                        ? 'bg-green-100 text-green-700 border border-green-200'
                                        : 'bg-gray-100 text-gray-500'
                                    }`}
                            >
                                {idx + 1}. {step.label}
                                {config[step.id] && <Check size={14} className="inline ml-2" />}
                            </button>
                        ))}
                    </div>

                    {/* Filters & Title */}
                    <div className="mb-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex flex-col gap-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-bold">{STEPS[currentStep].label}</h2>
                                    <p className="text-gray-500 text-sm">
                                        {config.cpu && STEPS[currentStep].id === 'motherboard' && `Compatible avec socket ${config.cpu.specs?.socket}`}
                                        {config.motherboard && STEPS[currentStep].id === 'ram' && `Compatible avec mémoire ${config.motherboard.specs?.ramType}`}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-6 items-end md:items-center flex-wrap">
                                {/* Brand Filter */}
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Marque</label>
                                    <select
                                        value={selectedBrand}
                                        onChange={(e) => setSelectedBrand(e.target.value)}
                                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white min-w-[150px]"
                                    >
                                        <option value="All">Toutes</option>
                                        {availableBrands.map(brand => (
                                            <option key={brand} value={brand}>{brand}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Price Range Filter */}
                                <div className="flex flex-col gap-2 min-w-[200px]">
                                    <div className="flex justify-between text-xs font-bold text-gray-500 uppercase">
                                        <span>{priceRange[0]} €</span>
                                        <span>{priceRange[1]} €</span>
                                    </div>
                                    <div className="relative h-6 w-full">
                                        {/* Track Background */}
                                        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 rounded -translate-y-1/2"></div>
                                        {/* Active Track */}
                                        <div
                                            className="absolute top-1/2 h-1 bg-primary rounded -translate-y-1/2"
                                            style={{
                                                left: `${(priceRange[0] / 5000) * 100}%`,
                                                right: `${100 - (priceRange[1] / 5000) * 100}%`
                                            }}
                                        ></div>

                                        {/* Min Slider */}
                                        <input
                                            type="range"
                                            min="0"
                                            max="5000"
                                            step="50"
                                            value={priceRange[0]}
                                            onChange={(e) => {
                                                const val = Math.min(parseInt(e.target.value), priceRange[1] - 50);
                                                setPriceRange([val, priceRange[1]]);
                                            }}
                                            className="absolute top-1/2 left-0 w-full -translate-y-1/2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:cursor-pointer z-20"
                                        />

                                        {/* Max Slider */}
                                        <input
                                            type="range"
                                            min="0"
                                            max="5000"
                                            step="50"
                                            value={priceRange[1]}
                                            onChange={(e) => {
                                                const val = Math.max(parseInt(e.target.value), priceRange[0] + 50);
                                                setPriceRange([priceRange[0], val]);
                                            }}
                                            className="absolute top-1/2 left-0 w-full -translate-y-1/2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:cursor-pointer z-10"
                                        />
                                    </div>
                                </div>

                                {/* Sort Filter */}
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Trier par</label>
                                    <select
                                        value={sortOption}
                                        onChange={(e) => setSortOption(e.target.value)}
                                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white min-w-[150px]"
                                    >
                                        <option value="price-asc">Prix croissant</option>
                                        <option value="price-desc">Prix décroissant</option>
                                        <option value="name-asc">Nom (A-Z)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                        {paginatedProducts.map(product => {
                            const compatible = isCompatible(product);
                            const isSelected = config[STEPS[currentStep].id]?.id === product.id;

                            return (
                                <div
                                    key={product.id}
                                    className={`relative flex flex-col border rounded-xl overflow-hidden transition-all duration-200 ${isSelected
                                        ? 'border-primary ring-2 ring-primary ring-opacity-50 shadow-lg'
                                        : compatible
                                            ? 'border-gray-200 hover:shadow-md hover:border-gray-300 bg-white'
                                            : 'border-gray-100 bg-gray-50 opacity-70 grayscale-[0.5]'
                                        }`}
                                >
                                    {!compatible && (
                                        <div className="absolute top-3 right-3 bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 z-10">
                                            <AlertCircle size={12} /> Incompatible
                                        </div>
                                    )}

                                    <div className="p-6 flex justify-center bg-white h-48 items-center">
                                        {product.image ? (
                                            <img src={product.image} alt={product.title} className="max-h-full max-w-full object-contain" />
                                        ) : (
                                            <div className="flex items-center justify-center h-full w-full bg-gray-50 text-gray-300">
                                                <AlertCircle size={32} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-5 flex flex-col flex-1">
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{product.title}</h3>
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {product.specs && Object.entries(product.specs).map(([key, val]) => (
                                                    <span key={key} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium">
                                                        {key}: {val as string}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                                            <span className="text-xl font-bold text-primary">{product.price} €</span>
                                            <button
                                                onClick={() => compatible && handleSelect(STEPS[currentStep].id, product)}
                                                disabled={!compatible}
                                                className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${isSelected
                                                    ? 'bg-green-500 text-white hover:bg-green-600'
                                                    : compatible
                                                        ? 'bg-primary text-white hover:bg-blue-700'
                                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                    }`}
                                            >
                                                {isSelected ? 'Sélectionné' : compatible ? 'Choisir' : 'Incompatible'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {paginatedProducts.length === 0 && (
                        <div className="p-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300 mb-8">
                            <p className="text-gray-500 text-lg">Aucun produit ne correspond à vos filtres.</p>
                        </div>
                    )}

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex justify-center gap-2 mb-8">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50"
                            >
                                Précédent
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-10 h-10 rounded-md font-bold ${currentPage === page
                                        ? 'bg-primary text-white'
                                        : 'border border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50"
                            >
                                Suivant
                            </button>
                        </div>
                    )}
                </div>

                {/* Right: Summary Sidebar */}
                <div className="w-full lg:w-96 shrink-0">
                    <div className="sticky top-24 bg-white border border-gray-200 rounded-xl shadow-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">Votre Configuration</h3>
                            <button
                                onClick={() => setConfig({})}
                                className="text-xs text-red-500 hover:underline flex items-center gap-1 font-medium"
                            >
                                <RotateCcw size={12} /> Réinitialiser
                            </button>
                        </div>

                        <div className="space-y-3 mb-8 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                            {STEPS.map(step => (
                                <div key={step.id} className="flex justify-between items-start text-sm border-b border-gray-50 pb-3 last:border-0 group cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors" onClick={() => setCurrentStep(STEPS.findIndex(s => s.id === step.id))}>
                                    <span className={`font-medium ${currentStep === STEPS.findIndex(s => s.id === step.id) ? 'text-primary' : 'text-gray-500'}`}>{step.label}</span>
                                    {config[step.id] ? (
                                        <div className="text-right flex-1 ml-4">
                                            <p className="font-bold text-gray-900 line-clamp-1">{config[step.id]?.title}</p>
                                            <p className="text-primary font-bold">{config[step.id]?.price} €</p>
                                        </div>
                                    ) : (
                                        <span className="text-gray-300 italic">--</span>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="pt-6 border-t border-gray-200">
                            <div className="flex justify-between items-end mb-6">
                                <span className="text-lg font-bold text-gray-700">Total</span>
                                <span className="text-3xl font-black text-primary">{totalPrice.toFixed(2)} €</span>
                            </div>

                            <button
                                onClick={handleAddToCart}
                                disabled={totalPrice === 0}
                                className="w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                            >
                                <ShoppingCart size={20} />
                                Tout ajouter au panier
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
