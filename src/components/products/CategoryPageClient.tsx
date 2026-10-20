"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import ProductCard, { Product } from "../common/ProductCard";
import Pagination from "../common/Pagination";
import Loading from "../common/Loading";
import { homeApi } from "../../service/homeApi";
import { getProductPrice } from "@/src/utils/productPrice";

export interface CategoryProductResponse {
    success: boolean
    message: string
    data: CategoryProductData[]
    meta: Meta
}

export interface CategoryProductData {
    id: number
    product_name: string
    product_slug: string
    product_thambnail: string
    product_qty: string
    selling_price: string
    discount_price: any
    contract_price?: string | number | null
    product_size?: string
    product_color?: string
    brand_id: number
    category_id: number
    brand: Brand
    category: Category
}

export interface Brand {
    id: number
    brand_name: string
    brand_slug: string
}

export interface Category {
    id: number
    category_name: string
    category_slug: string
}

export interface Meta {
    total: number
    current_loaded: number
    loaded: number
    prev_page: any 
    next_page: number
    current_page: number
    last_page: number
}

interface CategoryPageClientProps {
    slug: string;
    categoryType: "main-category" | "category" | "sub-category";
}

const CategoryPageClient = ({ slug, categoryType }: CategoryPageClientProps) => {
    const [products, setProducts] = useState<CategoryProductData[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [categoryName, setCategoryName] = useState("");

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const res: CategoryProductResponse = await homeApi.getProductsByCategorySlug(
                    categoryType,
                    slug,
                    {
                        per_page: 15,
                        simple: true,
                        page: currentPage,
                    }
                );

                if (res.success && res?.data) {
                    setLastPage(res.meta.last_page || 1);
                    setProducts(res?.data);
                }
            } catch (error) {
                console.error("Failed to fetch products", error);
            } finally {
                setLoading(false);
            }
        };
        if (slug) fetchProducts();
    }, [slug, categoryType, currentPage]);

    const transformProduct = (apiProduct: CategoryProductData): Product => {
        const pricing = getProductPrice(apiProduct);

        const colors = apiProduct.product_color ? apiProduct.product_color.split(',').map(c => c.trim()).filter(Boolean) : [];
        const sizes = apiProduct.product_size ? apiProduct.product_size.split(',').map(s => s.trim()).filter(Boolean) : [];

        return {
            id: apiProduct.id,
            slug: apiProduct.product_slug,
            category: apiProduct.category?.category_name || "Product",
            title: apiProduct.product_name,
            price: `AED ${pricing.price}`,
            oldPrice: pricing.oldPrice ? `AED ${pricing.oldPrice}` : undefined,
            image: `${process.env.NEXT_PUBLIC_IMAGE_BASE}/${apiProduct.product_thambnail}`,
            product_qty: apiProduct.product_qty,
            discount: pricing.isContract ? pricing.badge : pricing.discountPercent ? `-${pricing.discountPercent}%` : undefined,
            colors: colors.length > 0 ? colors : undefined,
            sizes: sizes.length > 0 ? sizes : undefined
        };
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const getCategoryTypeLabel = () => {
        switch (categoryType) {
            case "main-category":
                return "Main Category";
            case "category":
                return "Category";
            case "sub-category":
                return "Sub Category";
            default:
                return "Category";
        }
    };

    return (
        <div className="bg-white min-h-screen pb-12">
            {/* Header / Breadcrumb area */}
            <div className="bg-white border-b">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-4 md:py-8">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                        <Link href="/" className="hover:text-green-700">Delmon</Link>
                        <ChevronRight className="w-4 h-4" />
                        <Link href="/all-categories" className="hover:text-green-700">All Categories</Link>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-gray-900">{categoryName || slug}</span>
                    </div>
                    {categoryName && (
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{categoryName}</h1>
                            <p className="text-gray-600">{getCategoryTypeLabel()}</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                    {/* Main Content */}
                    <div>
                        {/* Header for grid */}
                        <div className="mb-6">
                            <h2 className="text-gray-500 text-sm font-normal">
                                {products.length > 0
                                    ? `Showing ${products.length} Products`
                                    : "No Products Found"}
                            </h2>
                        </div>

                        {loading ? (
                            <Loading className="h-64" />
                        ) : products.length > 0 ? (
                            <>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 lg:gap-5">
                                    {products.map(apiProduct => (
                                        <ProductCard
                                            key={apiProduct.id}
                                            product={transformProduct(apiProduct)}
                                            backgroundColor="bg-white"
                                        />
                                    ))}
                                </div>
                                {lastPage > 1 && (
                                    <Pagination
                                        currentPage={currentPage}
                                        lastPage={lastPage}
                                        onPageChange={handlePageChange}
                                    />
                                )}
                            </>
                        ) : (
                            <div className="py-12 text-center">
                                <div className="text-gray-400 text-6xl mb-4">📦</div>
                                <p className="text-gray-500 text-lg">No products found in this category.</p>
                                <Link
                                    href="/all-categories"
                                    className="inline-block mt-4 text-green-700 hover:text-green-800 font-medium"
                                >
                                    Browse All Categories
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoryPageClient;