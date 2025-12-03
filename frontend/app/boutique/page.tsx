'use client';

import { ProductCard } from "@/components/ProductCard";
import { PriceRangeSlider } from "@/components/PriceRangeSlider";
import { useEffect, useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";

interface Product {
    id: number;
    title: string;
    price: number;
    oldPrice?: number;
    category: string;
    rating: number;
    image: string;
    brand: string;
    reviewCount: number;
}

import { useSearchParams } from 'next/navigation';

export default function Shop() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const searchParams = useSearchParams();
    const searchQuery = searchParams.get('search') || '';

    // États pour les filtres
    const [selectedCategory, setSelectedCategory] = useState<string>("All");
    const [selectedBrand, setSelectedBrand] = useState<string>("All");
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 3000]);
    const [sortOrder, setSortOrder] = useState<string>("none"); // 'asc' | 'desc' | 'none'

    // États pour la pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9;

    useEffect(() => {
        fetch('/api/products')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setProducts(data);
                }
                setLoading(false);
            })
            .catch(err => console.error("Erreur récupération produits", err));
    }, []);

    // Extraction des catégories uniques
    const categories = useMemo(() => {
        const cats = new Set(products.map(p => p.category));
        return ["All", ...Array.from(cats)];
    }, [products]);

    // Extraction des marques basées sur la CATÉGORIE SÉLECTIONNÉE
    const brands = useMemo(() => {
        let filteredByCat = products;
        if (selectedCategory !== "All") {
            filteredByCat = products.filter(p => p.category === selectedCategory);
        }
        const brs = new Set(filteredByCat.map(p => p.title.split(' ')[0])); // Devine la marque via le premier mot
        return ["All", ...Array.from(brs).sort()];
    }, [products, selectedCategory]);

    // Logique de Filtrage et de Tri
    const filteredProducts = useMemo(() => {
        let result = products.filter(product => {
            const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
            const matchesBrand = selectedBrand === "All" || product.title.startsWith(selectedBrand);
            const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];

            const matchesSearch = searchQuery
                ? product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.brand.toLowerCase().includes(searchQuery.toLowerCase())
                : true;

            return matchesCategory && matchesBrand && matchesPrice && matchesSearch;
        });

        if (sortOrder === 'asc') {
            result.sort((a, b) => a.price - b.price);
        } else if (sortOrder === 'desc') {
            result.sort((a, b) => b.price - a.price);
        }

        return result;
    }, [products, selectedCategory, selectedBrand, priceRange, sortOrder, searchQuery]);

    // Logique de Pagination
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCategoryChange = (cat: string) => {
        setSelectedCategory(cat);
        setSelectedBrand("All"); // Réinitialiser la marque quand la catégorie change
        setCurrentPage(1);
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-12 flex justify-center items-center h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">La Boutique</h1>
                    <span className="text-gray-500">{filteredProducts.length} produits trouvés</span>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 font-medium">Trier par :</span>
                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className="p-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
                    >
                        <option value="none">Pertinence</option>
                        <option value="asc">Prix croissant</option>
                        <option value="desc">Prix décroissant</option>
                    </select>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Filtres Latéraux (Sidebar) */}
                <aside className="w-full lg:w-1/4 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
                            <SlidersHorizontal size={20} className="text-primary" />
                            <h2 className="font-bold text-lg text-gray-900">Filtres</h2>
                        </div>

                        {/* Filtre par Catégorie */}
                        <div className="mb-8">
                            <h3 className="font-semibold mb-4 text-gray-900">Catégories</h3>
                            <div className="space-y-2 pr-2">
                                {categories.map(cat => (
                                    <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${selectedCategory === cat ? 'border-primary bg-primary' : 'border-gray-300 group-hover:border-primary'}`}>
                                            {selectedCategory === cat && <div className="w-2 h-2 rounded-full bg-white" />}
                                        </div>
                                        <input
                                            type="radio"
                                            name="category"
                                            checked={selectedCategory === cat}
                                            onChange={() => handleCategoryChange(cat)}
                                            className="hidden"
                                        />
                                        <span className={`text-sm transition-colors ${selectedCategory === cat ? 'text-primary font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}>
                                            {cat === "All" ? "Toutes les catégories" : cat}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Filtre par Marque */}
                        <div className="mb-8">
                            <h3 className="font-semibold mb-4 text-gray-900">Marques</h3>
                            <div className="relative">
                                <select
                                    value={selectedBrand}
                                    onChange={(e) => { setSelectedBrand(e.target.value); setCurrentPage(1); }}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer"
                                >
                                    {brands.map(brand => (
                                        <option key={brand} value={brand}>{brand === "All" ? "Toutes les marques" : brand}</option>
                                    ))}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                    <ChevronRight size={16} className="rotate-90" />
                                </div>
                            </div>
                        </div>

                        {/* Filtre par Prix */}
                        <div className="pb-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold text-gray-900">Prix</h3>
                            </div>
                            <PriceRangeSlider
                                min={0}
                                max={3000}
                                initialMin={0}
                                initialMax={3000}
                                onChange={(min, max) => {
                                    setPriceRange([min, max]);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                    </div>
                </aside>

                {/* Grille de Produits */}
                <main className="w-full lg:w-3/4">
                    {filteredProducts.length === 0 ? (
                        <div className="bg-white rounded-xl p-12 text-center border border-gray-100 shadow-sm">
                            <div className="text-gray-400 mb-4">
                                <SlidersHorizontal size={48} className="mx-auto opacity-20" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun résultat</h3>
                            <p className="text-gray-500">Essayez de modifier vos filtres pour voir plus de produits.</p>
                            <button
                                onClick={() => { setSelectedCategory("All"); setSelectedBrand("All"); setPriceRange([0, 3000]); }}
                                className="mt-6 text-primary hover:underline font-medium"
                            >
                                Réinitialiser les filtres
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                {paginatedProducts.map((product) => (
                                    <ProductCard key={product.id} {...product} />
                                ))}
                            </div>

                            {/* Contrôles de Pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center gap-2 mt-12">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="p-2 border border-gray-200 rounded-lg hover:bg-white hover:border-primary/50 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all bg-white"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>

                                    <div className="flex gap-1">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                                            // Simple logic to show limited page numbers could go here, but for now show all
                                            if (totalPages > 7 && Math.abs(currentPage - page) > 2 && page !== 1 && page !== totalPages) {
                                                if (Math.abs(currentPage - page) === 3) return <span key={page} className="px-1 self-end text-gray-400">...</span>;
                                                return null;
                                            }
                                            return (
                                                <button
                                                    key={page}
                                                    onClick={() => handlePageChange(page)}
                                                    className={`w-10 h-10 rounded-lg font-medium transition-all ${currentPage === page
                                                        ? 'bg-primary text-white shadow-md shadow-primary/30'
                                                        : 'bg-white border border-gray-200 text-gray-600 hover:border-primary/50 hover:text-primary'
                                                        }`}
                                                >
                                                    {page}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="p-2 border border-gray-200 rounded-lg hover:bg-white hover:border-primary/50 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all bg-white"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}
