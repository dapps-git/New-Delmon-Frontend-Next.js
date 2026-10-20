"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import ProductCard, { Product } from "../common/ProductCard";
import { homeApi } from "../../service/homeApi";
import { ProductData, ProductResponse } from "../../types/product.types";
import { ArrowRight } from "lucide-react";
import Loading from "../common/Loading";
import { getProductPrice } from "@/src/utils/productPrice";

const ProductsGrid = ({ initialProducts = [] }: { initialProducts?: any[] }) => {
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        if (!initialProducts || initialProducts.length === 0) return;
        
        const mappedProducts: Product[] = initialProducts.slice(0, 10).map((item: any) => {
            const { price: finalPrice, oldPrice, badge } = getProductPrice(item);

            const colors = item.product_color ? item.product_color.split(',').map((c: string) => c.trim()).filter(Boolean) : [];
            const sizes = item.product_size ? item.product_size.split(',').map((s: string) => s.trim()).filter(Boolean) : [];

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
    }, [initialProducts]);

    if (!initialProducts || initialProducts.length === 0) {
        return (
            <section className="py-6 md:py-12 ">
                <Loading className="h-64" />
            </section>
        );
    }

    return (
        <section className="py-6 md:py-12 ">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
                    <Link href="/products" className="hidden md:flex items-center text-[#0d6838] hover:text-[#0b5c31] font-medium">
                        View All Products
                        <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 lg:gap-5 mb-8">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>

                <div className="flex md:hidden justify-center">
                    <Link href="/products" className="flex items-center justify-center w-full max-w-xs bg-white border border-[#0d6838] text-[#0d6838] py-3 rounded-md font-medium hover:bg-gray-50 transition-colors">
                        View All Products
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default ProductsGrid;
