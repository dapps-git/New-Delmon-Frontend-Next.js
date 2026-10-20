"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import ProductCard, { Product } from "../common/ProductCard";
import Pagination from "../common/Pagination";
import Loading from "../common/Loading";
import { homeApi } from "../../service/homeApi";
import { getProductPrice } from "@/src/utils/productPrice";
import { BrandProduct, BrandProductsResponse, BrandInfo, BrandCategory, BrandCategoriesResponse } from "../../types/brand.types";
import { Brand as HomeBrand } from "../../types/home.types";
import { CategoryProductData, CategoryProductResponse } from "../products/CategoryPageClient";

interface BrandPageClientProps {
    slug: string;
}

const BrandPageClient = ({ slug }: BrandPageClientProps) => {
    const [products, setProducts] = useState<BrandProduct[] | CategoryProductData[]>([]);
    const [brandInfo, setBrandInfo] = useState<BrandInfo | null>(null);
    const [allBrands, setAllBrands] = useState<HomeBrand[]>([]);
    const [categories, setCategories] = useState<BrandCategory[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);

    useEffect(() => {
        const fetchBrandData = async () => {
            setLoading(true);
            try {
                // Fetch categories
                if (!selectedCategory) {
                    const categoriesRes: BrandCategoriesResponse = await homeApi.getBrandCategories(slug);
                    if (categoriesRes.success && categoriesRes.data) {
                        setCategories(categoriesRes.data.categories);
                        if (!brandInfo) setBrandInfo(categoriesRes.data.brand);
                    }
                }

                // Fetch Products based on selected category or all brand products
                if (selectedCategory) {
                    const res: CategoryProductResponse = await homeApi.getProductsByCategorySlug(
                        "category",
                        selectedCategory,
                        {
                            per_page: 15,
                            simple: true,
                            page: currentPage,
                            brand: slug,
                        }
                    );
                    if (res.success && res.data) {
                        setProducts(res.data);
                        setLastPage(res.meta?.last_page || 1);
                    }
                } else {
                    const res: BrandProductsResponse = await homeApi.getBrandProducts(slug, {
                        per_page: 15,
                        simple: true,
                        page: currentPage,
                    });

                    if (res.success && res.data) {
                        setProducts(res.data.products);
                        setBrandInfo(res.data.brand);
                        setLastPage(res.meta?.last_page || 1);
                    }
                }


                const brandsRes = await homeApi.getBrands();
                if (brandsRes.success && brandsRes.data?.brands) {

                    setAllBrands(brandsRes.data.brands);
                }
            } catch (error) {
                console.error("Failed to fetch brand data", error);
            } finally {
                setLoading(false);
            }
        };

        if (slug) fetchBrandData();
    }, [slug, currentPage, selectedCategory]);

    const transformProduct = (apiProduct: any): Product => {
        const pricing = getProductPrice(apiProduct);

        const colors = apiProduct.product_color ? apiProduct.product_color.split(',').map((c: string) => c.trim()).filter(Boolean) : [];
        const sizes = apiProduct.product_size ? apiProduct.product_size.split(',').map((s: string) => s.trim()).filter(Boolean) : [];

        return {
            id: apiProduct.id,
            slug: apiProduct.product_slug,
            category: apiProduct.category?.category_name || "Product",
            title: apiProduct.product_name,
            price: `AED ${pricing.price}`,
            oldPrice: pricing.oldPrice ? `AED ${pricing.oldPrice}` : undefined,
            image: `${process.env.NEXT_PUBLIC_IMAGE_BASE}/${apiProduct.product_thambnail}`,
            product_qty: apiProduct.product_qty,
            discount: pricing.isContract ? pricing.badge : pricing.discountPercent ? `${pricing.discountPercent}% Offer` : undefined,
            colors: colors.length > 0 ? colors : undefined,
            sizes: sizes.length > 0 ? sizes : undefined
        };
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCategoryClick = (categorySlug: string | null) => {
        setSelectedCategory(categorySlug);
        setCurrentPage(1); // Reset to first page
    };

    if (loading && currentPage === 1 && !selectedCategory) {
        return <Loading className="min-h-screen" />;
    }

    return (
        <div className="bg-white min-h-screen pb-12">
            {/* Header / Breadcrumb area */}
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
                    <Link href="/" className="hover:text-green-700">Delmon</Link>
                    <ChevronRight className="w-4 h-4" />
                    <Link href="/" className="hover:text-green-700">Home</Link>
                    <ChevronRight className="" />
                    <span className="text-gray-900">Brands</span>
                </div>

                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">{brandInfo ? brandInfo.brand_name : 'Brands'}</h1>
                    <p className="text-green-700 text-sm">Discover products based on your favorite brand</p>
                </div>

                {/* Brands + Products Layout */}
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Vertical Scrollable Brand List (Optional, hide on mobile/tablet maybe) */}
                    <div className="hidden lg:block w-32 shrink-0">
                        <div className="flex flex-col gap-5 max-h-[500px] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-green-200 scrollbar-track-gray-100">
                            {allBrands.map((brand) => (
                                <Link
                                    href={`/brand/${brand.brand_slug}`}
                                    key={brand.id}
                                    className={`shrink-0 transition-all duration-300 flex items-center justify-center p-2 rounded-xl border-2 ${brand.brand_slug === slug
                                        ? 'border-green-600 bg-green-50 scale-110 shadow-md'
                                        : 'border-transparent opacity-80 hover:opacity-100 hover:border-gray-200 hover:scale-105'
                                        }`}
                                >
                                    <img
                                        src={`${process.env.NEXT_PUBLIC_IMAGE_BASE}/${brand.brand_image}`}
                                        alt={brand.brand_name}
                                        className="h-12 w-auto object-contain"
                                    />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="hidden lg:block w-px bg-gray-200 shrink-0" />

                    {/* Main Content Area */}
                    <div className="flex-1">

                        {/* Categories List (Horizontal Scroll) */}
                        {categories.length > 0 && (
                            <div className="mb-8 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-green-200 scrollbar-track-gray-100">
                                <div className="flex gap-4 items-center">
                                    <button
                                        onClick={() => handleCategoryClick(null)}
                                        className={`shrink-0 px-6 py-2.5 rounded-full border text-sm font-medium transition-all ${selectedCategory === null
                                            ? 'bg-green-700 text-white border-green-700 shadow-md'
                                            : 'bg-white text-gray-600 border-gray-200 hover:border-green-600 hover:text-green-700'
                                            }`}
                                    >
                                        All Products
                                    </button>
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.id}
                                            onClick={() => handleCategoryClick(cat.category_slug)}
                                            className={`shrink-0 px-6 py-2.5 rounded-full border text-sm font-medium transition-all ${selectedCategory === cat.category_slug
                                                ? 'bg-green-700 text-white border-green-700 shadow-md'
                                                : 'bg-white text-gray-600 border-gray-200 hover:border-green-600 hover:text-green-700'
                                                }`}
                                        >
                                            {cat.category_name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <h2 className="text-2xl font-bold text-gray-900 mb-8"> Featured Products</h2>

                        {loading ? (
                            <Loading className="h-64" />
                        ) : products.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                    {products.map((apiProduct: any) => (
                                        <ProductCard
                                            key={apiProduct.id}
                                            product={transformProduct(apiProduct)}
                                            backgroundColor="bg-[#F8F8F8]"
                                        />
                                    ))}
                                </div>
                                {lastPage > 1 && (
                                    <div className="mt-12">
                                        <Pagination
                                            currentPage={currentPage}
                                            lastPage={lastPage}
                                            onPageChange={handlePageChange}
                                        />
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="py-20 text-center bg-gray-50 rounded-3xl">
                                <div className="text-gray-300 text-8xl mb-6">📦</div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                                <p className="text-gray-500 mb-8">We couldn&apos;t find any products for this {selectedCategory ? 'category' : 'brand'} at the moment.</p>
                                <button
                                    onClick={() => handleCategoryClick(null)}
                                    className="inline-flex items-center justify-center px-8 py-3 bg-green-700 hover:bg-green-800 text-white font-medium rounded-full transition-colors"
                                >
                                    View All Brand Products
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BrandPageClient;