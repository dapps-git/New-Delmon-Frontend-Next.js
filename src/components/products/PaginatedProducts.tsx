"use client";

import React, { useEffect, useState } from "react";
import ProductCard, { Product } from "../common/ProductCard";
import { homeApi } from "../../service/homeApi";
import { ProductData, ProductResponse } from "../../types/product.types";
import Pagination from "../common/Pagination";
import Loading from "../common/Loading";
import { getProductPrice } from "@/src/utils/productPrice";

const PaginatedProducts = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const response: ProductResponse = await homeApi.getPaginatedProducts(currentPage, 12);

                if (response.success && response.data) {
                    const productDataList = response.data;

                    setLastPage(response.meta.last_page)

                    const mappedProducts: Product[] = productDataList.map((item: ProductData) => {
                        const { price: finalPrice, oldPrice, badge } = getProductPrice(item);

                        const colors = item.product_color ? item.product_color.split(',').map(c => c.trim()).filter(Boolean) : [];
                        const sizes = item.product_size ? item.product_size.split(',').map(s => s.trim()).filter(Boolean) : [];

                        return {
                            id: item.id,
                            slug: item.product_slug,
                            category: item.category?.category_name || "Uncategorized",
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
                console.error("Failed to fetch products", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [currentPage]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        const gridElement = document.getElementById('products-grid-top');
        if (gridElement) {
            gridElement.scrollIntoView({ behavior: 'smooth' });
        }
    };

    if (loading) {
        return <Loading className="h-64" />;
    }

    return (
        <div id="products-grid-top">
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>

            <Pagination
                currentPage={currentPage}
                lastPage={lastPage}
                onPageChange={handlePageChange}
            />
        </div>
    );
};

export default PaginatedProducts;
