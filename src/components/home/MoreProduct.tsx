"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { homeApi } from "../../service/homeApi";
import { getProductPrice } from "@/src/utils/productPrice";

interface ApiProduct {
  id: number;
  product_name: string;
  product_slug: string;
  product_thambnail: string;
  selling_price: string;
  discount_price: string | null;
  contract_price?: string | number | null;
  hot_deals: number | null;
  special_offer: number | null;
  special_deals: number | null;
  new_product: number | null;
}

interface CategoryProduct {
  id: number;
  slug: string;
  title: string;
  price: string;
  oldPrice?: string;
  image: string;
}

interface CategorySection {
  title: string;
  products: CategoryProduct[];
}

export default function MoreProducts({ homeData }: { homeData?: any }) {
  const [categories, setCategories] = useState<CategorySection[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Map API product to CategoryProduct
  const mapProduct = useCallback((item: ApiProduct): CategoryProduct => {
    const { price: finalPrice, oldPrice } = getProductPrice(item);

    return {
      id: item.id,
      slug: item.product_slug,
      title: item.product_name,
      price: `AED${parseFloat(finalPrice).toFixed(2)}`,
      oldPrice: oldPrice ? `AED${parseFloat(oldPrice).toFixed(2)}` : undefined,
      image: `${process.env.NEXT_PUBLIC_IMAGE_BASE}/${item.product_thambnail}`,
    };
  }, []);

  // Timer for rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 3000); // Rotate every 3 seconds
    return () => clearInterval(interval);
  }, []);

  // Process data
  useEffect(() => {
    if (!homeData) return;
    
    const { hotdeals, new: newProducts, special_deals, special_offer } = homeData;

    const newCategories = [
      {
        title: "Hot Deals",
        products: (hotdeals || []).map(mapProduct),
      },
      {
        title: "Special Offer",
        products: (special_offer || []).map(mapProduct),
      },
      {
        title: "Recently Added",
        products: (newProducts || []).map(mapProduct),
      },
      {
        title: "Special Deals",
        products: (special_deals || []).map(mapProduct),
      },
    ].filter((cat) => cat.products.length > 0);

    setCategories(newCategories);
  }, [homeData, mapProduct]);

  // Product card for this section
  const ProductItem = ({ product }: { product: CategoryProduct }) => (
    <Link
      href={`/product/${encodeURIComponent(product.slug)}`}
      className="flex gap-3 py-3 px-2 rounded-lg hover:bg-gray-50 transition-all duration-300 group cursor-pointer border-b border-gray-100 last:border-b-0 animate-fadeIn"
    >
      {/* Image */}
      <div className="w-14 h-14 md:w-[70px] md:h-[70px] bg-white rounded-lg flex-shrink-0 flex items-center justify-center p-1.5 overflow-hidden border border-gray-100">
        <img
          src={product.image}
          alt={product.title}
          loading="lazy"
          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
        />
      </div>

      {/* Details */}
      <div className="flex flex-col justify-center min-w-0 flex-1">
        <h4 className="text-xs md:text-sm font-medium text-gray-800 line-clamp-2 leading-snug mb-1.5 group-hover:text-[#006637] transition-colors">
          {product.title}
        </h4>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm md:text-base font-bold text-[#006637] flex items-center gap-0.5">
            <img src="/price-icon.png" alt="AED" className="w-4 h-4 md:w-5 md:h-5 object-contain mr-1" />
            {product.price.replace('AED', '')}
          </span>
          {product.oldPrice && (
            <span className="text-[10px] md:text-xs text-gray-400 line-through flex items-center gap-0.5">
              <img src="/price-icon.png" alt="AED" className="w-3 h-3 md:w-3.5 md:h-3.5 object-contain opacity-50 mr-1" />
              {product.oldPrice.replace('AED', '')}
            </span>
          )}
        </div>
      </div>
    </Link>
  );

  if (categories.length === 0) return null;

  return (
    <section className="py-6 md:py-10">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        {/* 4 columns on desktop, 2 on mobile */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
          {categories.map((category, index) => {
            // Calculate valid start index
            // We want 2 items per page.
            // If list has 5 items:
            // 0: [0, 1]
            // 1: [2, 3]
            // 2: [4, 0] (wrap first)

            const total = category.products.length;
            const itemsPerPage = 2;

            // Base index for the current page
            const pageIndex = currentIndex % Math.ceil(total / itemsPerPage || 1);
            const startIdx = pageIndex * itemsPerPage;

            // Get items, handling potential wrap manually or just slice safely
            // Using modulo on indices allows cleaner wrapping
            const item1 = category.products[(startIdx) % total];
            const item2 = category.products[(startIdx + 1) % total];

            const visibleProducts = [item1, item2].filter(Boolean); // Filter Boolean just in case total is 0

            return (
              <div key={index} className="min-w-0">
                {/* Category Header */}
                <div className="mb-3 md:mb-4">
                  <h3 className="text-sm md:text-base lg:text-lg font-bold text-gray-900 pb-2 border-b-2 border-[#006637]">
                    {category.title}
                  </h3>
                </div>

                {/* Products List - 2 products per column with Animation Key */}
                <div key={currentIndex}>
                  {visibleProducts.map((product, i) => (
                    <ProductItem key={`${product.id}-${i}`} product={product} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
