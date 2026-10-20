"use client";

import React, { useEffect, useState } from "react";
import ProductCard, { Product } from "../common/ProductCard";
import { homeApi } from "../../service/homeApi";
import { SearchProductData, SearchProductResponse } from "../../types/home.types";
import Pagination from "../common/Pagination";
import Loading from "../common/Loading";
import { Search } from "lucide-react";
import { getProductPrice } from "@/src/utils/productPrice";

interface SearchProductListProps {
    query: string;
}

const SearchProductList = ({ query }: SearchProductListProps) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [totalResults, setTotalResults] = useState(0);

    useEffect(() => {
        const fetchSearchResults = async () => {
            if (!query) return;
            setLoading(true);
            try {
                const response: SearchProductResponse = await homeApi.searchProducts(query, currentPage, 12);

                if (response.success && response.data) {
                    setTotalResults(response.meta.total);
                    setLastPage(response.meta.last_page);

                    const mappedProducts: Product[] = response.data.map((item: SearchProductData) => {
                        const { price: finalPrice, oldPrice, badge } = getProductPrice(item);

                        const colors = item.product_color ? item.product_color.split(',').map(c => c.trim()).filter(Boolean) : [];
                        const sizes = item.product_size ? item.product_size.split(',').map(s => s.trim()).filter(Boolean) : [];

                        return {
                            id: item.id,
                            slug: item.product_slug,
                            category: item.category_name || "Uncategorized",
                            title: item.product_name,
                            price: `AED${finalPrice}`,
                            oldPrice: oldPrice ? `AED${oldPrice}` : undefined,
                            image: `${process.env.NEXT_PUBLIC_IMAGE_BASE}/${item.product_thambnail}`,
                            product_qty: item.product_qty,
                            badge: badge,
                            colors: colors.length > 0 ? colors : undefined,
                            sizes: sizes.length > 0 ? sizes : undefined
                        };
                    });
                    setProducts(mappedProducts);
                }
            } catch (error) {
                console.error("Failed to fetch search results", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSearchResults();
    }, [query, currentPage]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (loading) {
        return <Loading className="h-64" />;
    }

    if (products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                    <Search className="w-10 h-10 text-gray-300" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">No results found</h2>
                <p className="text-gray-500 max-w-md">
                    We couldn't find any products matching "{query}". Please try a different search term.
                </p>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <p className="text-gray-600">
                    Showing <span className="font-semibold text-gray-900">{products.length}</span> of{" "}
                    <span className="font-semibold text-gray-900">{totalResults}</span> products for "{query}"
                </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mb-12">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>

            {lastPage > 1 && (
                <Pagination
                    currentPage={currentPage}
                    lastPage={lastPage}
                    onPageChange={handlePageChange}
                />
            )}
        </div>
    );
};

export default SearchProductList;
